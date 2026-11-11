"""Serveur de voix local : reçoit du texte (avec mot de passe), renvoie un MP3 dans TA voix clonée.
Ta voix de référence ne quitte jamais ce PC : seul l'audio généré est renvoyé.
  python server.py            -> serveur + tunnel Cloudflare (adresse publique)
  python server.py --local    -> serveur seul, sur ce PC uniquement (test)
  FAKE_TTS=1 python server.py --local   -> test sans modèle (bip)"""
import os, sys, re, json, time, uuid, threading, queue, subprocess, secrets, urllib.request, warnings, platform
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
warnings.filterwarnings("ignore")
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
PORT, MAX_CHARS, FAKE = 8765, 700, bool(os.environ.get("FAKE_TTS"))
LOCAL = "--local" in sys.argv

def token():
    if not os.path.exists("token.txt"): open("token.txt", "w").write(secrets.token_urlsafe(24))
    return open("token.txt").read().strip()
TOKEN = token()

JOBS, ORDER, Q, LOCK = {}, [], queue.Queue(), threading.Lock()
STATE = {"model": "loading", "url": None}

def to_mp3(audio, sr):
    import numpy as np, lameenc
    audio = np.asarray(audio, dtype=np.float32); audio = audio / max(1e-6, float(np.max(np.abs(audio)))) * 0.92
    enc = lameenc.Encoder(); enc.set_bit_rate(192); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    return enc.encode((audio * 32767).astype(np.int16).tobytes()) + enc.flush()

def decouper(texte, n=220):  # phrases courtes = meilleure qualité
    morceaux, cur = [], ""
    for ph in re.split(r"(?<=[.!?…])\s+", texte.strip()):
        if cur and len(cur) + len(ph) > n: morceaux.append(cur); cur = ph
        else: cur = (cur + " " + ph).strip()
    if cur: morceaux.append(cur)
    return morceaux

def charger_modele():
    if FAKE: STATE["model"] = "ready"; return None, 24000, None
    from clone import trouver_reference
    ref = trouver_reference()
    import torch; _l = torch.load; torch.load = lambda *a, **k: _l(*a, **{**k, "map_location": torch.device("cpu")})
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    print("Chargement du modèle (1er lancement : ~3 Go à télécharger)...")
    m = ChatterboxMultilingualTTS.from_pretrained(device="cpu"); STATE["model"] = "ready"; return m, m.sr, ref

def worker(model, sr, ref):
    import numpy as np
    while True:
        jid = Q.get(); j = JOBS[jid]; j["status"] = "running"; t0 = time.time()
        try:
            parts = []
            for i, ph in enumerate(decouper(j["text"])):
                if FAKE:
                    time.sleep(1.0); t = np.linspace(0, .4, int(sr * .4), False); parts += [(.4 * np.sin(2 * np.pi * (440 + 60 * i) * t)).astype(np.float32), np.zeros(int(sr * .2), np.float32)]
                else:
                    w = model.generate(ph, language_id=j.get("language", "fr"), audio_prompt_path=ref, exaggeration=j.get("exaggeration", .5), cfg_weight=j.get("cfg_weight", .5))
                    parts += [w.squeeze().cpu().numpy(), np.zeros(int(sr * .3), np.float32)]
                j["progress"] = i + 1
            j["mp3"] = to_mp3(np.concatenate(parts), sr); j["status"] = "done"
        except Exception as e: j["status"], j["error"] = "error", str(e)[:300]
        j["seconds"] = round(time.time() - t0, 1)

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, body=b"", ctype="application/json"):
        self.send_response(code); self.send_header("Content-Type", ctype); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def _json(self, code, obj): self._send(code, json.dumps(obj, ensure_ascii=False).encode())
    def _auth(self):
        ok = secrets.compare_digest(self.headers.get("Authorization", ""), "Bearer " + TOKEN)
        if not ok: self._json(401, {"error": "mot de passe invalide"})
        return ok
    def do_GET(self):
        if not self._auth(): return
        p = self.path.split("?")[0].strip("/").split("/")
        if p == ["health"]: return self._json(200, {"ok": True, "model": STATE["model"], "queue": Q.qsize(), "fake": FAKE})
        if len(p) >= 2 and p[0] == "jobs" and p[1] in JOBS:
            j = JOBS[p[1]]
            if len(p) == 3 and p[2] == "audio":
                return self._send(200, j["mp3"], "audio/mpeg") if j.get("status") == "done" else self._json(409, {"status": j["status"]})
            return self._json(200, {k: v for k, v in j.items() if k not in ("mp3", "text")})
        self._json(404, {"error": "introuvable"})
    def do_POST(self):
        if not self._auth(): return
        if self.path.strip("/") != "jobs": return self._json(404, {"error": "introuvable"})
        try: d = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        except Exception: return self._json(400, {"error": "JSON invalide"})
        t = str(d.get("text", "")).strip()
        if not t or len(t) > MAX_CHARS: return self._json(400, {"error": f"texte vide ou > {MAX_CHARS} caractères"})
        jid = uuid.uuid4().hex[:10]
        with LOCK:
            JOBS[jid] = {"id": jid, "text": t, "status": "queued", "language": d.get("language", "fr"), "exaggeration": float(d.get("exaggeration", .5)), "cfg_weight": float(d.get("cfg_weight", .5)), "chunks": len(decouper(t)), "progress": 0}
            ORDER.append(jid)
            while len(ORDER) > 40: JOBS.pop(ORDER.pop(0), None)
        Q.put(jid); self._json(202, {"id": jid, "chunks": JOBS[jid]["chunks"]})

def config():
    c = {}
    if os.path.exists("config.txt"):
        for l in open("config.txt", encoding="utf-8"):
            if "=" in l and not l.strip().startswith("#"): k, v = l.split("=", 1); c[k.strip()] = v.strip()
    return c

def ngrok_fixe(c):
    """Adresse FIXE (ngrok, domaine statique gratuit) : je n'ai plus besoin qu'on me la renvoie."""
    from pyngrok import installer
    exe = os.path.abspath("ngrok.exe" if platform.system() == "Windows" else "ngrok")
    if not os.path.exists(exe): print("Téléchargement de ngrok..."); installer.install_ngrok(exe)
    dom = c["NGROK_DOMAIN"].replace("https://", "").strip("/")
    p = subprocess.Popen([exe, "http", f"--url={dom}", str(PORT), "--authtoken", c["NGROK_AUTHTOKEN"], "--log=stdout"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    STATE["url"] = "https://" + dom; open("connexion.txt", "w").write(f"ADRESSE : {STATE['url']}\nMOT DE PASSE : {TOKEN}\n")
    threading.Thread(target=lambda: [None for _ in p.stdout], daemon=True).start()
    print("\n" + "=" * 62 + f"\n  SERVEUR EN LIGNE (adresse fixe)\n  Adresse : {STATE['url']}\n" + "=" * 62); return p

def cloudflared():
    exe = "cloudflared.exe" if platform.system() == "Windows" else "cloudflared"
    if not os.path.exists(exe):
        arch = "amd64" if platform.machine().lower() in ("amd64", "x86_64") else "arm64"
        nom = f"cloudflared-windows-{arch}.exe" if platform.system() == "Windows" else f"cloudflared-linux-{arch}"
        print("Téléchargement de cloudflared (tunnel gratuit)..."); urllib.request.urlretrieve(f"https://github.com/cloudflare/cloudflared/releases/latest/download/{nom}", exe); os.chmod(exe, 0o755)
    p = subprocess.Popen([os.path.abspath(exe), "tunnel", "--no-autoupdate", "--url", f"http://127.0.0.1:{PORT}"], stderr=subprocess.PIPE, stdout=subprocess.DEVNULL, text=True)
    def lire():
        for ligne in p.stderr:
            m = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", ligne)
            if m and not STATE["url"]:
                STATE["url"] = m.group(0); open("connexion.txt", "w").write(f"ADRESSE : {STATE['url']}\nMOT DE PASSE : {TOKEN}\n")
                print("\n" + "=" * 62 + f"\n  SERVEUR EN LIGNE\n  Adresse      : {STATE['url']}\n  Mot de passe : (dans token.txt - ne le donne à personne d'autre)\n" + "=" * 62)
                print("  -> Envoie seulement l'ADRESSE à Claude, dans la conversation.\n  -> Laisse cette fenêtre OUVERTE tant que tu veux que je puisse parler. Ferme-la pour tout couper.\n")
    threading.Thread(target=lire, daemon=True).start(); return p

def main():
    model, sr, ref = charger_modele()
    threading.Thread(target=worker, args=(model, sr, ref), daemon=True).start()
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
    print(f"Serveur prêt en local : http://127.0.0.1:{PORT}  (modèle : {STATE['model']}{' - MODE TEST' if FAKE else ''})")
    c = config(); tun = None if LOCAL else (ngrok_fixe(c) if c.get('NGROK_AUTHTOKEN') and c.get('NGROK_DOMAIN') else cloudflared())
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt: pass
    finally:
        if tun: tun.terminate()
if __name__ == "__main__": main()

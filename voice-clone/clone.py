"""Clonage de voix 100 % local (Chatterbox multilingue, CPU).
1) Enregistre ta voix (ou utilise un fichier ma-voix.wav / ma-voix.mp3 placé dans ce dossier)
2) Génère quelques phrases avec TA voix clonée -> ma-voix-clonee.mp3
Rien n'est envoyé sur Internet (hors téléchargement initial du modèle)."""
import os, sys, time, glob, warnings
warnings.filterwarnings("ignore")
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)

TEXTE_PAR_DEFAUT = "Salut, c'est moi ! Aujourd'hui, je vais te montrer quelque chose d'incroyable. Il y a huit jours, j'ai écrit quarante-deux lignes de code, et ce matin, tout était prêt. Est-ce que c'est aussi simple ? Eh bien, oui ! Merci d'avoir regardé, abonne-toi, et à très vite !"

def charger_texte():  # le texte à lire est dans texte-a-lire.txt : tu peux le modifier
    p = os.path.join(HERE, "texte-a-lire.txt")
    return open(p, encoding="utf-8").read().strip() if os.path.exists(p) else TEXTE_PAR_DEFAUT
PHRASES_TEST = [
    "Salut, c'est FuraxDev ! Aujourd'hui, je vais te montrer comment Claude Code peut tout coder à ma place.",
    "Tu paies deux cents dollars par mois pour une intelligence artificielle ? Eh bien, ce n'est plus nécessaire.",
    "Abonne-toi pour ne rien rater, et à très vite pour la suite !",
]
DUREE_ENREG = 30  # secondes

def enregistrer(chemin):
    import threading, numpy as np, sounddevice as sd, soundfile as sf
    sr = 24000
    print("\n=== ENREGISTREMENT ===")
    print("Pièce calme, micro à ~20 cm de la bouche, sans musique ni ventilateur.")
    print("Lis le texte ci-dessous à voix NATURELLE, avec l'énergie de tes vidéos.")
    print("Intonation variée : calme, question, enthousiasme. Vise 35 à 60 secondes.\n")
    print("-" * 60 + "\n" + charger_texte() + "\n" + "-" * 60 + "\n")
    input("Appuie sur ENTRÉE, puis commence à lire après le compte à rebours... ")
    for i in (3, 2, 1): print(i, end=" ", flush=True); time.sleep(1)
    print("\n>>> PARLE MAINTENANT <<<   (appuie sur ENTRÉE quand tu as FINI de lire)")
    frames, stop = [], threading.Event()
    threading.Thread(target=lambda: (input(), stop.set()), daemon=True).start()
    with sd.InputStream(samplerate=sr, channels=1, dtype="float32", callback=lambda d, n, t, s: frames.append(d.copy())):
        t0 = time.time()
        while not stop.is_set() and time.time() - t0 < 90: time.sleep(0.1)
    if not frames: sys.exit("Aucun son enregistré. Vérifie le micro dans les paramètres Windows.")
    audio = np.concatenate(frames)[:, 0]; pic = float(np.max(np.abs(audio)))
    if pic < 0.02: sys.exit("Micro trop faible ou muet. Vérifie le micro dans les paramètres Windows et recommence.")
    voix = np.where(np.abs(audio) > pic * 0.06)[0]  # enlève les silences du début et de la fin
    audio = audio[max(0, voix[0] - int(0.25 * sr)): voix[-1] + int(0.35 * sr)]
    if len(audio) / sr < 15: sys.exit(f"Enregistrement trop court ({len(audio) / sr:.0f} s). Relis TOUT le texte, il faut au moins 15 secondes.")
    sf.write(chemin, audio / pic * 0.9, sr); print(f"Enregistrement sauvegardé : {chemin}  ({len(audio) / sr:.0f} secondes)")

def trouver_reference():
    for motif in ("ma-voix.wav", "ma-voix.mp3", "ma-voix.m4a", "ma-voix.flac", "ma-voix.ogg"):
        if os.path.exists(motif): return motif
    ref = "reference.wav"
    if not os.path.exists(ref): enregistrer(ref)
    else:
        if input(f"Une voix enregistrée existe ({ref}). La réenregistrer ? (o/N) ").strip().lower() == "o": enregistrer(ref)
    return ref

def main():
    ref = trouver_reference()
    print("\nVoix de référence :", ref)
    import torch, numpy as np, lameenc
    _load = torch.load; torch.load = lambda *a, **k: _load(*a, **{**k, "map_location": torch.device("cpu")})  # modèle chargé sur CPU
    print("Chargement du modèle (le 1er lancement télécharge ~3 Go, patience)...")
    try: from chatterbox.mtl_tts import ChatterboxMultilingualTTS as Modele
    except ImportError: sys.exit("Version de Chatterbox trop ancienne (pas de multilingue). Relance INSTALLER.bat.")
    model = Modele.from_pretrained(device="cpu")
    morceaux, sr = [], model.sr
    for i, phrase in enumerate(PHRASES_TEST, 1):
        t0 = time.time(); print(f"\n[{i}/{len(PHRASES_TEST)}] {phrase}")
        wav = model.generate(phrase, language_id="fr", audio_prompt_path=ref, exaggeration=0.5, cfg_weight=0.5)
        x = wav.squeeze().cpu().numpy(); morceaux += [x, np.zeros(int(sr * 0.35), dtype=np.float32)]
        print(f"    fait en {time.time() - t0:.0f} s")
    audio = np.concatenate(morceaux); audio = audio / max(1e-6, float(np.max(np.abs(audio)))) * 0.92
    pcm = (audio * 32767).astype(np.int16)
    enc = lameenc.Encoder(); enc.set_bit_rate(192); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    open("ma-voix-clonee.mp3", "wb").write(enc.encode(pcm.tobytes()) + enc.flush())
    print("\n==============================================")
    print(" FINI !  Fichier :", os.path.join(HERE, "ma-voix-clonee.mp3"))
    print(" Écoute-le, puis glisse-le dans la conversation pour me l'envoyer.")
    print("==============================================")
    try: os.startfile(HERE)
    except Exception: pass

if __name__ == "__main__": main()

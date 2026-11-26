#!/usr/bin/env python3
"""Génère le site des ressources FuraxDev (statique) dans site/dist/.
Source de vérité : tous les fichiers `ressource.json` du dépôt (un par vidéo). Lancer : python3 site/build.py
Schéma ressource.json : {"slug","mot","titre","resume","points":[...],"sources":[{"titre","url"}],"tags":[...],"date":"AAAA-MM-JJ","video":"fichier.mp4"}"""
import json, glob, os, shutil, subprocess, html, re, unicodedata, datetime
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); DIST = os.path.join(ROOT, 'site', 'dist')
E = lambda s: html.escape(str(s), quote=True)
MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
def fdate(s):
    try: d = datetime.date.fromisoformat(s); return f'{d.day} {MOIS[d.month-1]} {d.year}'
    except Exception: return s
def norm(s): return re.sub(r'[^a-z0-9 ]+', ' ', unicodedata.normalize('NFD', str(s).lower()).encode('ascii', 'ignore').decode()).strip()
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">'
CSS = """
:root{--blue:#2f5bff;--ink:#0b1020;--mut:#5a6385;--bg:#fff;--card:#fff;--line:#e3e8ff;--mist:#eef2ff;--red:#ff3b4e;--green:#12b76a}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--ink:#f3f5ff;--mut:#9aa4c8;--bg:#0a1230;--card:#111a3d;--line:#223063;--mist:#162251}}
*{box-sizing:border-box;margin:0}html{-webkit-text-size-adjust:100%}
body{font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;background:var(--bg);color:var(--ink);line-height:1.55;min-height:100vh}
a{color:inherit;text-decoration:none}.wrap{max-width:680px;margin:0 auto;padding:0 20px 80px}
.top{display:flex;align-items:center;gap:12px;padding:18px 0}
.mark{width:36px;height:36px;border-radius:10px;background:var(--blue);display:grid;place-items:center;color:#fff;font:800 20px Inter}
.top b{font-weight:700;letter-spacing:-.02em}.top span{color:var(--mut)}
.badge{display:inline-block;font:600 14px Inter;color:var(--blue);letter-spacing:.01em}
h1{font:800 clamp(30px,7vw,44px)/1.08 Inter;letter-spacing:-.04em;margin:10px 0 12px}
.sub{color:var(--mut);font-size:17px}
.search{margin:26px 0 8px;position:relative}
.search input{width:100%;padding:16px 18px 16px 48px;font:500 17px Inter;color:var(--ink);background:var(--card);border:2px solid var(--line);border-radius:16px;outline:none;transition:.15s}
.search input:focus{border-color:var(--blue);box-shadow:0 0 0 4px rgba(47,91,255,.15)}
.search svg{position:absolute;left:16px;top:50%;transform:translateY(-50%);width:20px;height:20px;stroke:var(--mut);fill:none;stroke-width:2.2;stroke-linecap:round}
.lab{margin:34px 0 12px;font:700 13px Inter;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.card{display:flex;gap:16px;align-items:center;padding:14px;background:var(--card);border:2px solid var(--line);border-radius:20px;margin-bottom:12px;transition:.15s}
.card:hover{border-color:var(--blue);transform:translateY(-1px)}
.card.hit{border-color:var(--blue);box-shadow:6px 6px 0 var(--blue)}
.card img{width:92px;height:92px;border-radius:14px;object-fit:cover;flex:none;background:var(--mist)}
.card h3{font:700 17px/1.25 Inter;letter-spacing:-.02em;margin-bottom:4px}
.card p{color:var(--mut);font-size:14.5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .mot{display:inline-block;font:700 12px 'JetBrains Mono',monospace;color:var(--blue);background:var(--mist);padding:2px 8px;border-radius:8px;margin-bottom:6px}
.card .go{margin-left:auto;color:var(--mut);font-size:22px;flex:none}
.none{padding:26px;border:2px dashed var(--line);border-radius:20px;color:var(--mut);text-align:center}
.found{color:var(--green);font:700 14px Inter;margin:6px 2px 0;min-height:20px}
footer{margin-top:50px;color:var(--mut);font-size:14px;text-align:center}
.back{display:block;margin:6px 0 16px;color:var(--mut);font-weight:600}
.pill{display:inline-block;font:700 13px 'JetBrains Mono',monospace;color:#fff;background:var(--blue);padding:3px 10px;border-radius:9px}
.meta{color:var(--mut);margin-bottom:22px}
video{width:100%;max-height:70vh;border-radius:20px;border:2px solid var(--ink);box-shadow:8px 8px 0 var(--blue);background:#000;margin:6px 0 26px}
h2{font:800 22px Inter;letter-spacing:-.03em;margin:30px 0 10px}
ol,ul{padding-left:22px}li{margin:8px 0}
.src a{color:var(--blue);font-weight:600;word-break:break-word}.src li{margin:10px 0}
.copy{margin-top:26px;display:inline-block;font:600 15px Inter;color:var(--blue);background:var(--mist);border:0;border-radius:12px;padding:11px 16px;cursor:pointer}
.note{margin-top:26px;padding:14px 16px;background:var(--mist);border-radius:14px;color:var(--mut);font-size:14.5px}
"""
HEAD = lambda title, desc, extra='': f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(title)}</title><meta name="description" content="{E(desc)}"><meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}"><meta name="theme-color" content="#2f5bff">{FONTS}<style>{CSS}</style>{extra}</head><body><div class="wrap">'
TOP = lambda base: f'<div class="top"><a href="{base}" style="display:flex;gap:12px;align-items:center"><div class="mark">F</div><div><b>FuraxDev</b> <span>· Ressources</span></div></a></div>'
FOOT = '<footer>FuraxDev · ressources gratuites, accès instantané.<br>Pas de spam : juste ce que tu as demandé en commentaire.</footer></div></body></html>'
ICON = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'

def thumb(res, folder, outdir):
    """vignette carrée : un fichier thumb.* du dossier, sinon une image extraite de la vidéo (ffmpeg), sinon rien."""
    for ext in ('png', 'jpg', 'jpeg', 'webp'):
        p = os.path.join(folder, f'thumb.{ext}')
        if os.path.exists(p): shutil.copy(p, os.path.join(outdir, f'thumb.{ext}')); return f'thumb.{ext}'
    v = os.path.join(folder, res.get('video', ''))
    if res.get('video') and os.path.exists(v):
        out = os.path.join(outdir, 'thumb.jpg')
        try:
            d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v]))
            at = float(res.get('thumb_at', d * .25)); subprocess.check_call(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(at), '-i', v, '-frames:v', '1', '-vf', 'crop=iw*0.9:iw*0.9:iw*0.05:ih*0.17,scale=360:360', '-q:v', '3', out])
            shutil.copy(out, os.path.join(folder, 'thumb.jpg'))   # gardée dans le dépôt : le build en ligne n'a pas besoin de ffmpeg
            return 'thumb.jpg'
        except Exception as e: print('vignette impossible :', e)
    return ''

def main():
    shutil.rmtree(DIST, ignore_errors=True); os.makedirs(DIST)
    items = []
    for f in sorted(glob.glob(os.path.join(ROOT, '**', 'ressource.json'), recursive=True)):
        if os.sep + 'site' + os.sep in f or 'node_modules' in f: continue
        r = json.load(open(f, encoding='utf-8')); r['_folder'] = os.path.dirname(f); items.append(r)
    items.sort(key=lambda r: r.get('date', ''), reverse=True)
    pub = []
    for r in items:
        slug = re.sub(r'[^a-z0-9-]+', '-', norm(r['slug']).replace(' ', '-')).strip('-'); out = os.path.join(DIST, 'r', slug); os.makedirs(out)
        th = thumb(r, r['_folder'], out); vid = ''
        if r.get('video') and os.path.exists(os.path.join(r['_folder'], r['video'])): shutil.copy(os.path.join(r['_folder'], r['video']), os.path.join(out, 'video.mp4')); vid = 'video.mp4'
        pts = ''.join(f'<li>{E(p)}</li>' for p in r.get('points', [])); srcs = ''.join(f'<li><a href="{E(s["url"])}" target="_blank" rel="noopener">{E(s["titre"])}</a></li>' for s in r.get('sources', []))
        page = HEAD(r['titre'] + ' · FuraxDev', r['resume']) + TOP('../../') + f'<a class="back" href="../../">← Toutes les ressources</a><span class="pill">{E(r["mot"])}</span><h1>{E(r["titre"])}</h1><div class="meta">{E(fdate(r.get("date", "")))}</div>'
        if vid: page += f'<video src="{vid}" controls playsinline preload="metadata"{(" poster=" + chr(34) + th + chr(34)) if th else ""}></video>'
        page += f'<p class="sub">{E(r["resume"])}</p>'
        if pts: page += f'<h2>L\'essentiel</h2><ol>{pts}</ol>'
        if srcs: page += f'<h2>Sources</h2><ul class="src">{srcs}</ul>'
        if r.get('note'): page += f'<div class="note">{E(r["note"])}</div>'
        page += '<button class="copy" onclick="navigator.clipboard.writeText(location.href).then(()=>{this.textContent=\'Lien copié ✓\'})">Copier le lien</button>' + FOOT
        open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(page)
        pub.append({'slug': slug, 'mot': r['mot'], 'titre': r['titre'], 'resume': r['resume'], 'tags': r.get('tags', []), 'date': r.get('date', ''), 'thumb': (f'r/{slug}/{th}' if th else '')})
    cards = ''.join(f'<a class="card" data-i="{i}" href="r/{p["slug"]}/">' + (f'<img src="{p["thumb"]}" alt="" loading="lazy">' if p['thumb'] else '') + f'<div><span class="mot">{E(p["mot"])}</span><h3>{E(p["titre"])}</h3><p>{E(p["resume"])}</p></div><span class="go">→</span></a>' for i, p in enumerate(pub))
    js = """
const DATA=%s;const $=s=>document.querySelector(s);
const n=s=>s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9 ]+/g,' ').trim();
const cards=[...document.querySelectorAll('.card')],inp=$('#q'),found=$('#found'),none=$('#none');
function run(){const q=n(inp.value);let shown=0,exact=-1;
 cards.forEach((c,i)=>{const d=DATA[i];const hay=n([d.mot,d.titre,d.resume,(d.tags||[]).join(' ')].join(' '));
  const isMot=q&&n(d.mot)===q;const ok=!q||isMot||q.split(' ').every(t=>hay.includes(t));
  c.style.display=ok?'':'none';c.classList.toggle('hit',!!isMot);if(ok)shown++;if(isMot)exact=i});
 none.style.display=shown?'none':'';found.textContent=exact>=0?'✓ Mot trouvé — appuie sur Entrée pour ouvrir':''; return exact}
inp.addEventListener('input',run);
$('#f').addEventListener('submit',e=>{e.preventDefault();const x=run();const v=cards.filter(c=>c.style.display!=='none');if(x>=0)location.href=cards[x].href;else if(v.length===1)location.href=v[0].href});
const p=new URLSearchParams(location.search).get('q');if(p){inp.value=p;run()}
""" % json.dumps(pub, ensure_ascii=False)
    home = HEAD('Ressources · FuraxDev', 'Tape le mot de la vidéo et récupère la ressource gratuite.') + TOP('./') + '<span class="badge">Gratuit · Accès instantané</span><h1>Quelle ressource tu cherches ?</h1><p class="sub">Tape le mot de la vidéo (ex. HACK), ou dis avec tes mots ce que tu cherches.</p>'
    home += f'<form id="f" class="search" autocomplete="off">{ICON}<input id="q" type="search" placeholder="Ex : HACK, agents, sécurité…" enterkeyhint="search" autofocus></form><div id="found" class="found"></div><div class="lab">Toutes les ressources</div>{cards}<div id="none" class="none" style="display:none">Rien trouvé. Vérifie le mot sous la vidéo, ou écris-moi en commentaire.</div>'
    home += f'<script>{js}</script>' + FOOT
    open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8').write(home)
    open(os.path.join(DIST, 'resources.json'), 'w', encoding='utf-8').write(json.dumps(pub, ensure_ascii=False, indent=1))
    open(os.path.join(DIST, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\n')
    print(f'{len(pub)} ressource(s) → {DIST}')
main()

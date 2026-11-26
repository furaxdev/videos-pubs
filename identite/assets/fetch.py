#!/usr/bin/env python3
"""Télécharge et enregistre automatiquement logos et images pour les vidéos FuraxDev.
  python3 identite/assets/fetch.py search <mot>                 # cherche un logo (simple-icons) et, à défaut, sur Wikimedia Commons
  python3 identite/assets/fetch.py logo <slug|nom> [...]       # ajoute un/des logos (simple-icons ; repli : Wikimedia Commons, SVG en couleurs)
  python3 identite/assets/fetch.py logo-url <nom> <url-svg>      # enregistre un logo SVG depuis une URL précise
  python3 identite/assets/fetch.py image <url> <nom> [crédit]  # télécharge une image (png/jpg/webp/svg), la redimensionne (≤ 1400 px) et l'enregistre
  python3 identite/assets/fetch.py og <url-page> <nom>         # récupère l'image « og:image » d'un article (visuel de presse, à créditer)
  python3 identite/assets/fetch.py build                       # régénère logos.js et images.js (fait automatiquement après chaque ajout)
Les crédits/licences sont notés dans CREDITS.md. Utilisation dans une scène : kit2.js → logoTile / photo (voir COMPOSANTS.md)."""
import sys, os, re, json, subprocess, html, base64, urllib.parse, io
HERE = os.path.dirname(os.path.abspath(__file__)); LOGOS = os.path.join(HERE, 'logos'); IMGS = os.path.join(HERE, 'images'); os.makedirs(LOGOS, exist_ok=True); os.makedirs(IMGS, exist_ok=True)
UA = 'Mozilla/5.0 (X11; Linux x86_64) FuraxDevBot/1.0'
SI = 'https://cdn.jsdelivr.net/npm/simple-icons@13.0.0'
def curl(url, out=None, timeout=40):
    cmd = ['curl', '-sSL', '-m', str(timeout), '-A', UA, '-w', '%{http_code}']; cmd += (['-o', out] if out else []); cmd.append(url)
    r = subprocess.run(cmd, capture_output=True, text=True); code = r.stdout[-3:] if out else r.stdout[-3:]
    return (int(code) if code.isdigit() else 0), (None if out else r.stdout[:-3])
def credit(line):
    p = os.path.join(HERE, 'CREDITS.md'); s = open(p).read() if os.path.exists(p) else '# Crédits des logos et images\n'
    if line not in s: open(p, 'a' if os.path.exists(p) else 'w').write(('' if os.path.exists(p) else s) + line + '\n')
def meta():
    p = os.path.join(LOGOS, '_meta.json'); return json.load(open(p)) if os.path.exists(p) else {}
def save_meta(m): json.dump(m, open(os.path.join(LOGOS, '_meta.json'), 'w'), ensure_ascii=False, indent=1)
def si_index():
    c = '/tmp/si.json'
    if not os.path.exists(c): curl(SI + '/_data/simple-icons.json', c)
    d = json.load(open(c)); icons = d['icons'] if isinstance(d, dict) else d; out = {}
    for i in icons: out[i.get('slug') or re.sub(r'[^a-z0-9]', '', i['title'].lower())] = i
    return out
def slugify(s): return re.sub(r'[^a-z0-9]', '', s.lower())
def commons(query):
    u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=' + urllib.parse.quote(query + ' logo svg') + '&prop=imageinfo&iiprop=url|extmetadata|mime'
    c, body = curl(u); res = []
    try:
        for p in json.loads(body)['query']['pages'].values():
            ii = p['imageinfo'][0]
            words = [w for w in re.findall(r'[a-z0-9]+', query.lower()) if len(w) > 1]
            if ii['mime'] == 'image/svg+xml' and all(w in p['title'].lower() for w in words): res.append((p['title'], ii['url'], re.sub('<[^>]+>', '', ii.get('extmetadata', {}).get('LicenseShortName', {}).get('value', '?'))))
    except Exception: pass
    return res
ALIAS = {'aws': 'amazonwebservices', 'gpt': 'openai', 'chatgpt': 'openai', 'gemini': 'googlegemini', 'hf': 'huggingface', 'twitter': 'x', 'gcp': 'googlecloud', 'k8s': 'kubernetes', 'gh': 'github', 'copilot': 'githubcopilot', 'chrome': 'googlechrome', 'vscode': None, 'azure': None}
def add_logo(name):
    slug = slugify(name); idx = si_index(); m = meta()
    if slug in ALIAS and ALIAS[slug]: slug = ALIAS[slug]
    if slug not in idx:   # recherche approchée dans simple-icons (titre ou slug contenant le mot)
        c = [k for k, v in idx.items() if slug == slugify(v['title']) or (len(slug) > 3 and (slug in k or (len(k) >= 5 and k in slug)))]
        if len(c) >= 1: slug = sorted(c, key=len)[0]
    if slug in idx:
        out = os.path.join(LOGOS, slug + '.svg'); c, _ = curl(f'{SI}/icons/{slug}.svg', out)
        if c == 200 and os.path.getsize(out) > 50: m[slug] = {'title': idx[slug]['title'], 'hex': idx[slug].get('hex', '')}; save_meta(m); credit(f'- logo {slug} : simple-icons (CC0)'); print('OK simple-icons :', slug); return slug
    for title, url, lic in commons({'vscode': 'Visual Studio Code', 'azure': 'Microsoft Azure', 'aws': 'Amazon Web Services'}.get(name.lower(), name)):
        out = os.path.join(LOGOS, slug + '.svg'); c, _ = curl(url, out)
        if c == 200 and os.path.getsize(out) > 100 and b'<svg' in open(out, 'rb').read(2000):
            m[slug] = {'title': name, 'hex': '', 'colored': True}; save_meta(m); credit(f'- logo {slug} : Wikimedia Commons « {title} » ({lic}) {url}'); print('OK Commons :', title, lic); return slug
    print('INTROUVABLE :', name, '→ `search` pour voir les candidats, `logo-url <nom> <url-svg>` si tu connais le fichier, ou `image` pour un PNG/JPG'); return None
def add_image(url, name, cred='', is_og=False):
    from PIL import Image
    name = slugify(name); tmp = os.path.join(IMGS, name + '.dl'); c, _ = curl(url, tmp, 60)
    if c != 200 or not os.path.exists(tmp) or os.path.getsize(tmp) < 200: print('ÉCHEC téléchargement', c, url); return None
    raw = open(tmp, 'rb').read(); os.remove(tmp)
    if b'<svg' in raw[:3000]: out = os.path.join(IMGS, name + '.svg'); open(out, 'wb').write(raw)
    else:
        im = Image.open(io.BytesIO(raw)); im.load(); im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB'); im.thumbnail((1400, 1400))
        out = os.path.join(IMGS, name + ('.png' if im.mode == 'RGBA' else '.jpg')); im.save(out, **({'optimize': True} if im.mode == 'RGBA' else {'quality': 84}))
    credit(f'- image {name} : {cred or url}' + (' (visuel de presse — à créditer, remplacer pour une publication)' if is_og else '')); print('OK image :', out, os.path.getsize(out) // 1024, 'Ko'); return name
def og(page, name):
    c, body = curl(page); m = re.search(r'<meta[^>]+(?:property|name)=["\']og:image["\'][^>]+content=["\']([^"\']+)', body or '') or re.search(r'content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']og:image', body or '')
    if not m: print('pas de og:image (page bloquée ? code', c, ')'); return None
    return add_image(html.unescape(m.group(1)), name, f'og:image de {page}', True)
def build():
    m = meta(); out = {}
    for f in sorted(os.listdir(LOGOS)):
        if not f.endswith('.svg'): continue
        k = f[:-4]; info = m.get(k, {'title': k, 'hex': ''}); col = ('#' + info['hex']) if info.get('hex') else '#0b1020'
        out[k] = {'svg': open(os.path.join(LOGOS, f), encoding='utf-8').read(), 'hex': col, 'title': info.get('title', k), 'colored': bool(info.get('colored'))}
    open(os.path.join(HERE, 'logos.js'), 'w').write('// Généré par fetch.py (ne pas éditer). window.LOGOS[nom] = {svg, hex, title, colored}\nwindow.LOGOS=' + json.dumps(out, ensure_ascii=False) + ';\n')
    imgs = {}
    for f in sorted(os.listdir(IMGS)):
        n, e = os.path.splitext(f)
        if e in ('.png', '.jpg', '.svg'): imgs[n] = 'data:' + {'.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'}[e] + ';base64,' + base64.b64encode(open(os.path.join(IMGS, f), 'rb').read()).decode()
    open(os.path.join(HERE, 'images.js'), 'w').write('// Généré par fetch.py (ne pas éditer). window.IMAGES[nom] = data URI\nwindow.IMAGES=' + json.dumps(imgs) + ';\n'); print(f'build : {len(out)} logos, {len(imgs)} images')
def main():
    a = sys.argv[1:]
    if not a: print(__doc__); return
    cmd = a[0]
    if cmd == 'search':
        q = slugify(' '.join(a[1:])); idx = si_index(); hits = [(k, v['title']) for k, v in idx.items() if q in k or q in slugify(v['title'])][:12]
        print('simple-icons :', hits or 'aucun'); [print('Commons :', t, l) for t, u, l in commons(' '.join(a[1:]))[:5]]
    elif cmd == 'logo': [add_logo(n) for n in a[1:]]; build()
    elif cmd == 'image': add_image(a[1], a[2], a[3] if len(a) > 3 else ''); build()
    elif cmd == 'og': og(a[1], a[2]); build()
    elif cmd == 'logo-url':
        slug = slugify(a[1]); out = os.path.join(LOGOS, slug + '.svg'); c, _ = curl(a[2], out)
        if c == 200 and b'<svg' in open(out, 'rb').read(3000): m = meta(); m[slug] = {'title': a[1], 'hex': '', 'colored': True}; save_meta(m); credit(f'- logo {slug} : {a[2]}'); print('OK', slug)
        else: print('ÉCHEC (pas un SVG ?)', c)
        build()
    elif cmd == 'build': build()
    else: print(__doc__)
main()

#!/usr/bin/env python3
"""Contrôle de VARIÉTÉ d'une vidéo : python3 identite/qa/variety.py <dossier-projet> [--no-brands]
Lit les .js du projet (scene.js…) et compte les effets du kit réellement utilisés ; compare avec les vidéos précédentes (daily/*, identite/hf-test).
Échoue (code 1) si la vidéo est trop pauvre ou trop ressemblante. Seuils dans le code."""
import sys, os, re, glob
proj = os.path.abspath(sys.argv[1]); nobrand = '--no-brands' in sys.argv
KIT = 'rise words underline strike windowBox typing draw tile counter wipe textFx'.split()
KIT2 = 'logoTile timeline versus bars notification chat diff browser icon2 photo stamp circle arrow pulse spotlight ticker ring mouse checklist'.split()
TEXTFX = 'fade blur blurWords letters slideLeft slideDown tracking wipe focus type'.split()
def read(p):
    s = ''
    for f in glob.glob(os.path.join(p, '*.js')):
        b = os.path.basename(f)
        if b.startswith('kit') or b in ('assets.js', 'logos.js', 'images.js', 'timeline.js', 'render.js'): continue
        s += open(f, encoding='utf-8', errors='ignore').read() + '\n'
    return s
def sig(s):
    fx = {m for m in re.findall(r"style:\s*'(\w+)'", s) if m in TEXTFX}
    fn = {k for k in KIT + KIT2 if re.search(r'\b' + k + r'\(', s)}
    lp = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'logos.js'); known = set(re.findall(r'"([a-z0-9]+)":\s*\{"svg"', open(lp, encoding='utf-8').read())) if os.path.exists(lp) else set()
    logos = set(re.findall(r"(?:name|logo):\s*'([a-z0-9]+)'", s)) & known
    return fx, fn, logos
s = read(proj); fx, fn, logos = sig(s); k2 = fn & set(KIT2); annot = fn & set('stamp circle arrow pulse spotlight ticker ring mouse checklist'.split())
print(f'styles de texte : {len(fx)}/10 {sorted(fx)}'); print(f'fonctions du kit utilisées : {len(fn)} — kit2 : {sorted(k2)}'); print(f'annotations : {sorted(annot)}'); print(f'logos de marques : {sorted(logos)}')
bad = []
if len(fx) < 5: bad.append(f'seulement {len(fx)} styles de texte différents (min 5 sur 10 : {", ".join(TEXTFX)})')
if len(fn) < 9: bad.append(f'seulement {len(fn)} fonctions du kit différentes (min 9)')
if len(k2) < 4: bad.append(f'seulement {len(k2)} composants kit2 (min 4 : {", ".join(KIT2)})')
if len(annot) < 2: bad.append(f'seulement {len(annot)} animation(s) d\'annotation (min 2 : stamp, circle, arrow, pulse, spotlight, ticker, ring, mouse, checklist)')
if not nobrand and len(logos) < 2: bad.append(f'seulement {len(logos)} vrai(s) logo(s) de marque (min 2 ; --no-brands si le sujet n\'a aucune marque)')
root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); prev = sorted(d for d in glob.glob(os.path.join(root, 'daily', '*')) if os.path.isdir(d) and os.path.abspath(d) != proj)[-2:]
if not prev: prev = [os.path.join(root, 'identite', 'hf-test')] if os.path.abspath(os.path.join(root, 'identite', 'hf-test')) != proj else []
for p in prev:
    pf, pn, pl = sig(read(p)); a = fn | fx; b = pn | pf; j = len(a & b) / max(1, len(a | b)); new = sorted((fn - pn) | (fx - pf))
    print(f'vs {os.path.relpath(p, root)} : ressemblance {j:.0%} ; nouveautés : {new}')
    if j > .7 or len(new) < 3: bad.append(f'trop ressemblante à {os.path.relpath(p, root)} (ressemblance {j:.0%}, {len(new)} nouveauté(s) ; il faut ≥ 3 éléments absents de cette vidéo)')
if bad: print('VARIÉTÉ INSUFFISANTE :'); [print(' -', b) for b in bad]; sys.exit(1)
print('VARIÉTÉ OK')

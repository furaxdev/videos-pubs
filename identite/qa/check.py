#!/usr/bin/env python3
"""Boucle de vérification d'une vidéo FuraxDev : python3 qa/check.py video.mp4 [--sub-y 1480]
Contrôles : format (1080x1920, 30 fps), durée, image figée > 1,4 s (zone au-dessus des sous-titres), zone vide > 0,6 s,
éléments qui débordent sur les marges gauche/droite, audio présent (info). Écrit <video>.contact.png (1 image / seconde) à regarder ensuite.
Code retour 1 s'il y a au moins un problème."""
import subprocess, sys, json, tempfile, os, glob
import numpy as np
from PIL import Image
v = sys.argv[1]; sub_y = int(sys.argv[sys.argv.index('--sub-y') + 1]) if '--sub-y' in sys.argv else 1480
FPS, W, H = 10, 270, 480; problems = []; info = []
pr = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', v]))
vs = next(s for s in pr['streams'] if s['codec_type'] == 'video'); dur = float(pr['format']['duration']); has_a = any(s['codec_type'] == 'audio' for s in pr['streams'])
if (vs['width'], vs['height']) != (1080, 1920): problems.append(f"format {vs['width']}x{vs['height']} au lieu de 1080x1920")
num, den = map(int, vs['r_frame_rate'].split('/'))
if round(num / den) != 30: problems.append(f"{num/den:.1f} fps au lieu de 30")
info.append(f"durée {dur:.1f}s · audio {'oui' if has_a else 'non'}")
d = tempfile.mkdtemp(); subprocess.check_call(['ffmpeg', '-loglevel', 'error', '-i', v, '-vf', f'fps={FPS},scale={W}:{H}', f'{d}/f%04d.png'])
fr = [np.asarray(Image.open(f).convert('L'), dtype=np.int16) for f in sorted(glob.glob(d + '/f*.png'))]
top = int(sub_y / 1920 * H); y0 = 6  # on ignore la barre de progression (haut) et les sous-titres (bas)
def spans(flags, min_s, label):
    i = 0
    while i < len(flags):
        if flags[i]:
            j = i
            while j < len(flags) and flags[j]: j += 1
            if (j - i) / FPS >= min_s: problems.append(f"{label} de {i/FPS:.1f}s à {j/FPS:.1f}s ({(j-i)/FPS:.1f}s)")
            i = j
        else: i += 1
static = [False] + [float((np.abs(fr[k][y0:top] - fr[k - 1][y0:top]) > 20).mean()) < 0.0008 for k in range(1, len(fr))]
spans(static, 1.4, 'image figée')
blank = [float(f[y0:top].std()) < 3 for f in fr]; spans(blank, .6, 'zone vide')
edge = [bool((f[y0:top, :8] < 235).any() or (f[y0:top, -8:] < 235).any()) for f in fr]; spans(edge, .3, 'élément qui touche le bord gauche/droit')
# planche contact : 1 image par seconde
n = int(dur); cols = 6; rows = (n + cols - 1) // cols; sheet = Image.new('RGB', (cols * 180, rows * 320), 'white')
for s in range(n):
    k = min(len(fr) - 1, s * FPS); im = Image.open(f'{d}/f{k+1:04d}.png').resize((180, 320)); sheet.paste(im, ((s % cols) * 180, (s // cols) * 320))
out = os.path.splitext(v)[0] + '.contact.png'; sheet.save(out)
print(' · '.join(info)); print('planche contact :', out)
if problems: print('PROBLÈMES :'); [print(' -', p) for p in problems]; sys.exit(1)
print('OK : aucun problème détecté (regarde quand même la planche contact).')

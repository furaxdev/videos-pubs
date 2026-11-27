#!/usr/bin/env python3
"""Contrôle du SON d'une vidéo « au contact » : python3 identite/qa/check_audio.py <video-AVEC-musique.mp4> <impacts.json> [<audio-mix.wav de référence>]
- piste audio présente, durée = durée vidéo ; pas de clipping
- SILENCE total avant le premier impact et entre les tranches (hors zones couvertes par une tranche, marge incluse)
- une tranche AUDIBLE à chaque impact ; début de son à ±1 image de l'impact (impacts isolés : 1er échantillon audible ; tous : corrélation d'enveloppe avec la piste de référence)
Code retour 1 s'il y a un problème."""
import sys, json, subprocess, os, numpy as np, wave
v, jf = sys.argv[1], sys.argv[2]; ref = sys.argv[3] if len(sys.argv) > 3 else None
M = json.load(open(jf)); FPS = M['fps']; IM = M['impacts']; FR = 1 / FPS; SR = 44100; problems = []
pr = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', v]))
au = [s for s in pr['streams'] if s['codec_type'] == 'audio']; vd = float(next(s for s in pr['streams'] if s['codec_type'] == 'video').get('duration', pr['format']['duration']))
if not au: print('PROBLÈME : aucune piste audio'); sys.exit(1)
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', v, '-map', '0:a:0', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'])
x = np.frombuffer(raw, dtype=np.float32).astype(np.float64); ad = len(x) / SR
if abs(ad - vd) > 0.06: problems.append(f"durée audio {ad:.2f}s ≠ vidéo {vd:.2f}s")
peak = float(np.abs(x).max())
if peak >= 0.995 or (np.abs(x) >= 0.98).sum() > 3: problems.append(f"clipping : crête {peak:.3f} ({int((np.abs(x) >= 0.98).sum())} échantillons ≥ 0,98)")
ms = lambda a, b: x[max(0, int(a * SR)):int(b * SR)]
rms = lambda s: float(np.sqrt((s ** 2).mean())) if len(s) else 0.0
t1 = IM[0]['t']
if np.abs(ms(0, t1 - 0.03)).max(initial=0) > 0.003: problems.append(f"bruit/son avant le 1er impact ({t1:.2f}s) : crête {np.abs(ms(0, t1 - 0.03)).max():.4f}")
# silence entre les tranches : on masque les zones couvertes (impact − 30 ms → fin de tranche + 80 ms pour la queue AAC)
cov = np.zeros(len(x), bool)
for im in IM: cov[max(0, int((im['t'] - 0.03) * SR)):int((im['t'] + im['slice_len'] + 0.08) * SR)] = True
gap = np.where(~cov, np.abs(x), 0); bad = np.where(gap > 0.003)[0]
if len(bad): problems.append(f"son hors des tranches (entre les impacts) : {len(bad)} échantillons, 1er à {bad[0]/SR:.2f}s, crête {gap.max():.4f}")
n_sil = sum(1 for a, b in zip(IM, IM[1:]) if b['t'] - a['t'] - a['slice_len'] > .08)
# audible à chaque impact
quiet = [im['i'] for im in IM if rms(ms(im['t'], im['t'] + 0.06)) < 0.004]
if quiet: problems.append(f"impact(s) sans son audible : {quiet[:10]}")
# début de son à ±1 image : impacts isolés (silence avant) -> 1er échantillon audible
off = []
for k, im in enumerate(IM):
    prev_end = (IM[k - 1]['t'] + IM[k - 1]['slice_len'] + 0.1) if k else 0
    if im['t'] - 0.06 > prev_end:
        w = np.abs(ms(im['t'] - 0.06, im['t'] + 0.12)); i = np.argmax(w > 0.004)
        if w[i] > 0.004: off.append((im['t'] - 0.06 + i / SR) - im['t'])
off = np.array(off)
if len(off) and (np.abs(off) > FR).any(): problems.append(f"début de son hors ±1 image sur {(np.abs(off)>FR).sum()}/{len(off)} impacts isolés (écart max {np.abs(off).max()*1000:.1f} ms)")
# corrélation d'enveloppe avec la piste de référence (valide le mux, impacts non isolés compris)
lagtxt = ''
if ref and os.path.exists(ref):
    w = wave.open(ref); y = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').reshape(-1, w.getnchannels()).mean(1) / 32768.0
    env = lambda s: np.sqrt(np.convolve(s ** 2, np.ones(44) / 44, 'same'))[::44]          # 1 ms
    ex, ey = env(x), env(y); lags = []
    for im in IM:
        a = int((im['t'] - 0.02) * 1000); b = int((im['t'] + 0.12) * 1000); ey_w = ey[a:b]
        if ey_w.max() < 1e-3: continue
        sc = {L: float(np.dot(ex[a + L:b + L] - ex[a + L:b + L].mean(), ey_w - ey_w.mean())) for L in range(-40, 41) if a + L >= 0}
        top = max(sc.values()); best = min((L for L, v in sc.items() if v >= .95 * top), key=abs)   # plusieurs pics quasi égaux (signal périodique) : on prend le plus proche de 0
        lags.append(best / 1000)
    lags = np.array(lags); lagtxt = f" · décalage son/référence médian {np.median(lags)*1000:.1f} ms, max {np.abs(lags).max()*1000:.1f} ms"
    if (np.abs(lags) > FR).any(): problems.append(f"son décalé de plus d'1 image ({FR*1000:.1f} ms) sur {(np.abs(lags)>FR).sum()} impacts (max {np.abs(lags).max()*1000:.1f} ms)")
print(f"audio {ad:.2f}s · crête {peak:.3f} · {len(IM)} impacts dont {n_sil} suivis de silence · début de son (isolés) : {('±%.1f ms max' % (np.abs(off).max()*1000)) if len(off) else 'n/a'}{lagtxt}")
if problems: print('PROBLÈMES SON :'); [print(' -', p) for p in problems]; sys.exit(1)
print('SON OK : silence entre les impacts, une tranche audible à chaque impact, début à ±1 image, pas de clipping.')

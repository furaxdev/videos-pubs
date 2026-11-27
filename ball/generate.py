#!/usr/bin/env python3
"""BALL MUSIC — analyse de la musique + physique déterministe + piste audio « uniquement au contact ».
usage : python3 ball/generate.py <dossier-exemple>      (le dossier contient config.json)
sorties dans le dossier : analysis.json, impacts.json, scene-data.js (lu par index.html), audio-mix.wav (non commité)
Tout est précalculé AVANT le rendu : les impacts pilotent à la fois l'image et le son."""
import sys, os, json, glob, math, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); SR = 44100
DEF = dict(title_a='Bouncing Ball:', title_b='MONTAGEM ROYAL', variant='single', seed=7, fps=60, audio='auto', section_start='auto',
           max_impacts=60, circle=dict(cx=540, cy=960, R=380, stroke=6), ball=dict(r=30), gravity=700, v0=520, factor=1.035, vmax=2600,
           min_gap=0.07, tail=1.0, overlap=0.12, pre_roll=0.006, fade_in=0.003, fade_out=0.04,
           rings=dict(count=6, R0=250, gap=26, hits=10), grow=dict(per_hit=5, max=398), balls=1,
           colors=['#2F5BFF', '#12B76A', '#FFB020', '#FF3B4E'], min_s=20, max_s=40)

def cfg_load(d):
    c = json.load(open(os.path.join(d, 'config.json'))); o = json.loads(json.dumps(DEF))
    for k, v in c.items():
        if isinstance(v, dict) and isinstance(o.get(k), dict): o[k].update(v)
        else: o[k] = v
    return o

# ---------- audio ----------
def decode(path):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'])
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()

def synth_track(bpm=130, beats=112, seed=3):
    """Piste de TEST synthétique (kick, hats, basse, arpège) en attendant « MONTAGEM ROYAL »."""
    rng = np.random.default_rng(seed); b = 60 / bpm; n = int((beats * b + 1) * SR); x = np.zeros(n)
    def add(t, s):
        i = int(t * SR); x[i:i + len(s)] += s[:max(0, n - i)] if i < n else 0
    tt = lambda d: np.arange(int(d * SR)) / SR
    for k in range(beats):
        t0 = k * b; bar = k // 16; amp = 0.45 + 0.55 * min(1, bar / 3)           # intro douce -> drop
        t = tt(0.25); add(t0, np.sin(2 * np.pi * (50 + 120 * np.exp(-t * 28)) * t) * np.exp(-t * 11) * 0.9)
        t = tt(0.06); add(t0 + b / 2, rng.standard_normal(len(t)) * np.exp(-t * 90) * 0.18 * amp)
        if k % 2 == 1: t = tt(0.18); add(t0, rng.standard_normal(len(t)) * np.exp(-t * 30) * 0.22 * amp)
        f = [55, 55, 65.4, 49][(k // 4) % 4]; t = tt(b * 0.9); add(t0, np.sin(2 * np.pi * f * t) * np.exp(-t * 3) * 0.5 * amp)
        for j, m in enumerate([0, 7, 12, 7]):
            f = 220 * 2 ** ((m + [0, 3, 5, 7][(k // 4) % 4]) / 12); t = tt(b / 4)
            add(t0 + j * b / 4, (np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * t) * 0.5) * np.exp(-t * 9) * 0.16 * amp)
    x /= max(1e-9, np.abs(x).max()) / 0.9; return np.stack([x, x], 1).astype(np.float32)

def analyse(st):
    """tempo (autocorrélation du flux spectral + affinage par peigne), grille de temps, attaques, énergie par section."""
    m = st.mean(1); hop, nfft = 441, 2048; nfr = (len(m) - nfft) // hop
    idx = np.arange(nfft)[None, :] + hop * np.arange(nfr)[:, None]; win = np.hanning(nfft)
    mag = np.log1p(30 * np.abs(np.fft.rfft(m[idx] * win, axis=1)))
    flux = np.maximum(0, np.diff(mag, axis=0)).sum(1); flux = np.r_[0, flux]; flux = (flux - flux.mean()) / (flux.std() + 1e-9); flux = np.maximum(flux, 0)
    fr = 100.0; ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
    lags = np.arange(30, 101); prior = np.exp(-0.5 * (np.log2((60 * fr / lags) / 128) / 0.6) ** 2)
    L = lags[np.argmax(ac[lags] * prior)]; bpm0 = 60 * fr / L
    best = (-1, bpm0, 0)
    for bpm in np.arange(bpm0 - 3, bpm0 + 3.001, 0.05):
        per = 60 / bpm * fr
        for off in np.arange(0, per, 1.0):
            ts = np.arange(off, len(flux) - 1, per); sc = flux[np.round(ts).astype(int)].sum() / len(ts)
            if sc > best[0]: best = (sc, bpm, off)
    _, bpm, off = best; beat = 60 / bpm; first = off / fr
    # affine la phase (±) sur les attaques proches de chaque temps
    beats = np.arange(first, len(m) / SR - beat, beat)
    pk = [i for i in range(2, len(flux) - 2) if flux[i] > 1.2 and flux[i] >= flux[i - 1] and flux[i] > flux[i + 1]]
    onsets = [round(i / fr, 3) for i in pk]
    bar = 4 * beat; nb = int(len(m) / SR / bar); en = np.array([np.sqrt((m[int(i * bar * SR):int((i + 1) * bar * SR)] ** 2).mean()) for i in range(nb)])
    q = np.quantile(en, [.33, .66]) if len(en) else [0, 0]
    sections = [dict(t=round(first + i * bar, 3), rms=round(float(e), 4), label='intro' if e < q[0] else 'montée' if e < q[1] else 'drop') for i, e in enumerate(en)]
    return dict(bpm=round(float(bpm), 2), beat=round(beat, 5), first_beat=round(float(first), 4), duration=round(len(m) / SR, 2),
                beats=[round(float(b), 4) for b in beats], onsets=onsets, bars=sections)

def choose_start(an, n_slices, m):
    beats = np.array(an['beats']); beat = an['beat']; best = None
    for i in range(0, len(beats) - n_slices - 1, 4):
        a = int((beats[i]) * SR); b = int((beats[i] + n_slices * beat) * SR)
        sc = float(np.sqrt((m[a:b] ** 2).mean()))
        if best is None or sc > best[0] * 1.02: best = (sc, i)
    return int(best[1]) if best else 0

# ---------- physique ----------
def flight(p, v, g, t):  # parabole depuis (p, v), t secondes
    return (p[0] + v[0] * t, p[1] + v[1] * t + 0.5 * g * t * t), (v[0], v[1] + g * t)

def simulate(c, seed, n_max, ball_idx):
    rng = np.random.default_rng(seed); cx, cy = c['circle']['cx'], c['circle']['cy']; r = c['ball']['r']; g = c['gravity']; sw = c['circle']['stroke'] / 2
    var = c['variant']; R = c['circle']['R']
    rings = [c['rings']['R0'] + i * c['rings']['gap'] for i in range(c['rings']['count'])] if var == 'rings' else None
    hits_r = [0] * (len(rings) if rings else 0); alive = list(range(len(rings))) if rings else []
    def Rb(): return (rings[alive[0]] if rings else R) - r - sw
    a0 = rng.uniform(0, 2 * math.pi); sp = c['v0']
    Rin = rings[0] if rings else R; p = (cx + rng.uniform(-.16, .16) * Rin, cy + rng.uniform(-.5, -.15) * Rin); v = (sp * math.cos(a0), sp * math.sin(a0) * 0.6 - 40)
    t = 0.0; segs = []; imps = []; events = [dict(t=0.0, R=R, alive=list(alive))]; cur_speed = sp
    def f(pp): return math.hypot(pp[0] - cx, pp[1] - cy) - Rb()
    h = 1 / 600
    for k in range(n_max):
        segs.append(dict(t=t, x=p[0], y=p[1], vx=v[0], vy=v[1]))
        tau = h
        while True:
            q, _ = flight(p, v, g, tau)
            if f(q) >= 0: break
            tau += h
            if tau > 30: raise SystemExit('la balle ne touche jamais le cercle')
        lo, hi = max(0, tau - h), tau
        for _ in range(60):
            mid = (lo + hi) / 2
            if f(flight(p, v, g, mid)[0]) >= 0: hi = mid
            else: lo = mid
        tau = hi; q, w = flight(p, v, g, tau)
        nx, ny = (cx - q[0]), (cy - q[1]); nl = math.hypot(nx, ny); nx, ny = nx / nl, ny / nl       # normale vers l'intérieur
        vn = w[0] * nx + w[1] * ny
        w = (w[0] - 2 * vn * nx, w[1] - 2 * vn * ny)
        cur_speed = min(c['vmax'], cur_speed * c['factor']); s = math.hypot(*w); w = (w[0] / s * cur_speed, w[1] / s * cur_speed)
        # contact visuel = point de la paroi (bord de la balle) ; on garde le centre pour la trajectoire
        t += tau; ring = alive[0] if rings else 0
        ix, iy = q[0] - nx * r, q[1] - ny * r      # point de contact sur la paroi
        imps.append(dict(t=t, x=ix, y=iy, bx=q[0], by=q[1], nx=nx, ny=ny, ball=ball_idx, ring=ring, speed=cur_speed))
        p, v = q, w
        if var == 'grow':
            R = min(c['grow']['max'], R + c['grow']['per_hit']); events.append(dict(t=t, R=R, alive=[]))
        if rings:
            hits_r[alive[0]] += 1
            if hits_r[alive[0]] >= c['rings']['hits'] and len(alive) > 1:
                alive.pop(0); events.append(dict(t=t, R=R, alive=list(alive), broke=ring))
    segs.append(dict(t=t, x=p[0], y=p[1], vx=v[0], vy=v[1]))   # dernier vol (après le dernier impact)
    return segs, imps, events

def write_wav(path, a):
    a = np.clip(a, -1, 1); pcm = (a * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def main(d):
    c = cfg_load(d); fps = c['fps']
    files = sorted(sum([glob.glob(os.path.join(HERE, 'audio', e)) for e in ('*.mp3', '*.wav', '*.m4a', '*.flac', '*.ogg')], []))
    if c['audio'] != 'auto': files = [os.path.join(HERE, 'audio', c['audio'])]
    if files: st = decode(files[0]); src = os.path.basename(files[0])
    else: st = synth_track(); src = 'PISTE DE TEST SYNTHÉTIQUE (aucun fichier dans ball/audio/)'
    print('musique :', src); an = analyse(st); an['source'] = src
    beat = an['beat']; m = st.mean(1)
    # impacts (précalcul complet)
    nb = c['balls'] if c['variant'] == 'multi' else 1
    seed0 = c['seed']
    for attempt in range(400 if nb > 1 else 1):      # plusieurs balles : on cherche (déterministe) une graine sans impacts quasi simultanés
        all_imps, balls = [], []; events = None
        for b in range(nb):
            segs, imps, ev = simulate(c, seed0 + attempt + 101 * b, c['max_impacts'], b)
            if b == 0: events = ev
            all_imps += imps; balls.append(segs)
        ts = sorted(i['t'] for i in all_imps)[:c['max_impacts']]
        if nb == 1 or min(np.diff(ts)) >= c['min_gap'] + .02: break
    else: print('ATTENTION : pas de graine sans impacts rapprochés')
    c['seed_used'] = seed0 + attempt
    all_imps.sort(key=lambda i: i['t'])
    # garde-fou : impacts trop rapprochés (< min_gap) -> signalé par la QA, mais on les compte
    n_avail = int((an['beats'][-1] - an['beats'][0]) / beat) - 1
    N = min(c['max_impacts'], len(all_imps), n_avail); all_imps = all_imps[:N]
    start_beat = choose_start(an, N, m) if c['section_start'] == 'auto' else int(round((float(c['section_start']) - an['first_beat']) / beat))
    t_start = an['beats'][start_beat]
    for k, im in enumerate(all_imps):
        nxt = all_imps[k + 1]['t'] if k + 1 < N else None
        L = beat + c['fade_out'] * 0.5
        if nxt is not None: L = min(L, nxt - im['t'] + c['overlap'])
        im.update(i=k, slice_start=round(t_start + k * beat - c['pre_roll'], 4), slice_len=round(L, 4), gain=1.0)
    last = all_imps[-1]; dur = last['t'] + c['tail'] + beat * 0.5; dur = math.ceil(dur * fps) / fps
    # piste audio : SILENCE partout sauf à partir de chaque impact
    out = np.zeros((int(dur * SR) + SR // 2, 2), dtype=np.float64)
    for im in all_imps:
        a = int(im['slice_start'] * SR); n = int(im['slice_len'] * SR); seg = st[a:a + n].astype(np.float64).copy()
        n = len(seg); fi = int(c['fade_in'] * SR); fo = int(min(c['fade_out'], im['slice_len'] * .9) * SR) if im['slice_len'] >= beat else int(c['overlap'] * SR)
        fo = min(fo, n)
        seg[:fi] *= np.linspace(0, 1, fi)[:, None] ** 2; seg[n - fo:] *= (np.cos(np.linspace(0, math.pi / 2, fo)) ** 2)[:, None]
        o = int(round(im['t'] * SR)); out[o:o + n] += seg[:len(out) - o]
        im['audio_start'] = o / SR
    out = out[:int(dur * SR)]; pk = np.abs(out).max(); out *= 0.6 / max(pk, 1e-9)
    write_wav(os.path.join(d, 'audio-mix.wav'), out)
    drop = ['bx', 'by']
    meta = dict(title=c['title_a'] + ' ' + c['title_b'], fps=fps, duration=dur, n_impacts=N, bpm=an['bpm'], beat=beat, start_beat=start_beat, music_start=t_start,
                variant=c['variant'], source=src, impacts=[{k: (round(v, 5) if isinstance(v, float) else v) for k, v in i.items()} for i in all_imps])
    json.dump(an, open(os.path.join(d, 'analysis.json'), 'w'), ensure_ascii=False)
    json.dump(meta, open(os.path.join(d, 'impacts.json'), 'w'), ensure_ascii=False, indent=1)
    data = dict(cfg=c, duration=dur, impacts=meta['impacts'], balls=balls, events=events)
    open(os.path.join(d, 'scene-data.js'), 'w').write('window.BALL_DATA=' + json.dumps(data) + ';')
    gaps = np.diff([i['t'] for i in all_imps]) if N > 1 else [0]
    print(f"bpm {an['bpm']} · {N} impacts · durée {dur:.2f}s · 1er impact {all_imps[0]['t']:.2f}s · écart min {min(gaps)*1000:.0f} ms · section dès le temps {t_start:.2f}s")
    if not (c['min_s'] <= dur <= c['max_s']): print(f"ATTENTION : durée {dur:.1f}s hors de {c['min_s']}–{c['max_s']} s"); sys.exit(3)

if __name__ == '__main__': main(sys.argv[1])

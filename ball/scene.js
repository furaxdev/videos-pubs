// BALL MUSIC — scène déterministe : renderFrame(t) ne dépend que de t et de BALL_DATA (précalculé par generate.py)
const D = window.BALL_DATA, CFG = D.cfg, cv = document.getElementById('c'), ctx = cv.getContext('2d');
window.DURATION = D.duration; window.FPS = CFG.fps;
const INK = '#0B1020', BLUE = '#2F5BFF', GREY = '#8A93B8', MIST = '#EEF2FF';
const CX = CFG.circle.cx, CY = CFG.circle.cy, SW = CFG.circle.stroke, BR = CFG.ball.r, G = CFG.gravity, SHADOW = 14;
const IMP = D.impacts, N = IMP.length, STOPS = CFG.colors.map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
const clamp01 = x => Math.min(1, Math.max(0, x)), eo = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const colAt = I => { const x = clamp01(I) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), f = x - i; const c = STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f)); return `rgb(${c})`; };
const intensity = s => clamp01((s - CFG.v0) / (CFG.vmax - CFG.v0));
// ---- trajectoire ----
function ballAt(b, t) { const S = D.balls[b]; let lo = 0, hi = S.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (S[m].t <= t) lo = m; else hi = m - 1; } const s = S[lo], dt = Math.max(0, t - s.t); return { x: s.x + s.vx * dt, y: s.y + s.vy * dt + .5 * G * dt * dt, vx: s.vx, vy: s.vy + G * dt }; }
const byBall = Array.from({ length: D.balls.length }, (_, b) => IMP.filter(i => i.ball === b));
function lastImp(t, b) { const L = b == null ? IMP : byBall[b]; let lo = -1, hi = L.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (L[m].t <= t) lo = m; else hi = m - 1; } return lo; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// ---- état du cercle ----
function circleState(t) {
  const ev = D.events; let k = 0; while (k + 1 < ev.length && ev[k + 1].t <= t) k++;
  const cur = ev[k], prev = ev[Math.max(0, k - 1)], p = k ? eo((t - cur.t) / .22) : 1;
  const R = prev.R + (cur.R - prev.R) * p;
  let rings = null;
  if (CFG.variant === 'rings') { rings = []; const all = CFG.rings.count; for (let i = 0; i < all; i++) { const R_i = CFG.rings.R0 + i * CFG.rings.gap; let a = 1, sc = 1;
      // anneau cassé : sort en s'écartant + fondu (0,3 s)
      for (let j = 1; j <= k; j++) if (ev[j].broke === i) { const q = clamp01((t - ev[j].t) / .3); a = 1 - eo(q); sc = 1 + .05 * eo(q); }
      if (a > 0.01) rings.push({ R: R_i * sc, a, idx: i }); } }
  return { R, rings };
}
function innerR(cs) { return (cs.rings ? Math.min(...cs.rings.filter(r => r.a > .5).map(r => r.R)) : cs.R) - SW / 2; }
function pulseAt(t) { const i = lastImp(t); if (i < 0) return 0; const dt = t - IMP[i].t; return dt > .4 ? 0 : .016 * Math.exp(-dt * 13) * Math.cos(dt * 30); }
// ---- dessin ----
const BBOX = [];  // boîtes d'éléments (utilisées par l'audit qualité)
function drawCircle(R, a, pul, cs) { const r = R * (1 + pul);
  ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = SW; ctx.beginPath(); ctx.arc(CX + SHADOW, CY + SHADOW, r, 0, 7); ctx.strokeStyle = BLUE; ctx.stroke(); // ombre pleine bleue décalée
  ctx.beginPath(); ctx.arc(CX, CY, r, 0, 7); ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  BBOX.push({ k: 'cercle', x0: CX - r - SW / 2, y0: CY - r - SW / 2, x1: CX + r + SHADOW + SW / 2, y1: CY + r + SHADOW + SW / 2 }); }
function title(t) {
  const F = { font: 'Inter Display', weight: 700 }, size = 46, y = 236, a = 'Bouncing Ball:', b = 'MONTAGEM ROYAL';
  const wa = width(ctx, a + ' ', size, F), wb = width(ctx, b, size, F), x0 = CX - (wa + wb) / 2;
  textFx(ctx, t, { style: 'fade', text: a, x: x0, y, size, color: INK, delay: .1, out: false, ...F });
  textFx(ctx, t, { style: 'fade', text: b, x: x0 + wa, y, size, color: BLUE, delay: .1, out: false, ...F });
  BBOX.push({ k: 'titre', x0, y0: y - size, x1: x0 + wa + wb, y1: y + 12 });
}
function renderFrame(t) {
  BBOX.length = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
  const cs = circleState(t), pul = pulseAt(t), n = lastImp(t) + 1;
  // cercle(s)
  if (cs.rings) cs.rings.forEach(r => drawCircle(r.R, r.a, pul, cs)); else drawCircle(cs.R, 1, pul, cs);
  // intérieur : ondes, arcs de choc, particules (clippés à l'intérieur du cercle)
  ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, innerR(cs) * (1 + pul) - 1, 0, 7); ctx.clip();
  for (let i = Math.max(0, n - 12); i < n; i++) { const im = IMP[i], dt = t - im.t, col = colAt(intensity(im.speed));
    if (dt < .5) { const p = eo(dt / .5); ctx.globalAlpha = .75 * (1 - p); ctx.strokeStyle = col; ctx.lineWidth = 6 - 4.5 * p; ctx.beginPath(); ctx.arc(im.x, im.y, 16 + 150 * p, 0, 7); ctx.stroke(); }
    if (dt < .6) { const R = rng(i * 7919 + 13), cnt = i === N - 1 ? 30 : 14, base = Math.atan2(im.ny, im.nx), I = intensity(im.speed);
      for (let k = 0; k < cnt; k++) { const ang = base + (R() - .5) * 2.2, sp = (260 + 520 * R()) * (.7 + .6 * I), life = .35 + .25 * R(); if (dt > life) continue; const q = dt / life, d = eo(dt / .45) * sp * .45;
        const px = im.x + Math.cos(ang) * d, py = im.y + Math.sin(ang) * d + .5 * 500 * dt * dt * .6; ctx.globalAlpha = 1 - q; ctx.fillStyle = k % 3 ? col : INK; ctx.beginPath(); ctx.arc(px, py, (k % 3 ? 8 : 5) * (1 - .7 * q), 0, 7); ctx.fill(); } } }
  ctx.restore();
  // arc de choc sur la paroi (couleur de l'impact)
  for (let i = Math.max(0, n - 3); i < n; i++) { const im = IMP[i], dt = t - im.t; if (dt > .3) continue; const ang = Math.atan2(im.y - CY, im.x - CX), p = eo(dt / .3), r = Math.hypot(im.x - CX, im.y - CY);
    ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = colAt(intensity(im.speed)); ctx.lineWidth = SW + 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(CX, CY, r + SW / 2 * 0, ang - .1 - .35 * p, ang + .1 + .35 * p); ctx.stroke(); ctx.restore(); }
  // balles
  for (let b = 0; b < D.balls.length; b++) {
    const i = lastImp(t, b), cur = i >= 0 ? byBall[b][i] : null, prevI = i > 0 ? intensity(byBall[b][i - 1].speed) : 0, curI = cur ? intensity(cur.speed) : 0;
    const I = cur ? prevI + (curI - prevI) * eo((t - cur.t) / .2) : 0, col = colAt(I), P = ballAt(b, t), sp = Math.hypot(P.vx, P.vy);
    // traînée : positions passées, longueur selon la vitesse
    const TL = .05 + .17 * I, M = 16;
    for (let j = (t > D.impacts[N - 1].t + .14) ? 0 : M; j >= 1; j--) { const q = ballAt(b, Math.max(0, t - TL * j / M)), f = 1 - j / (M + 1); ctx.globalAlpha = .38 * f * f + .04; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q.x, q.y, BR * (.35 + .6 * f), 0, 7); ctx.fill(); }
    const endT = D.impacts[N - 1].t, k = clamp01(1 - (t - endT) / .14), rr = BR * (t >= endT ? k : 1);
    if (rr > .5) { ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(P.x, P.y, rr, 0, 7); ctx.fill(); ctx.stroke();
      BBOX.push({ k: 'balle', x0: P.x - rr - 2, y0: P.y - rr - 2, x1: P.x + rr + 2, y1: P.y + rr + 2 }); }
  }
  title(t);
  // compteur discret + barre de progression fine
  ctx.globalAlpha = 1; const pl = n === 1 ? 'impact' : 'impacts', label = CFG.variant === 'rings' ? `${n} ${pl} · ${cs.rings.filter(r => r.a > .5).length} anneaux` : `${n} ${pl}`;
  ctx.font = '600 32px Inter'; ctx.letterSpacing = '0px'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = n ? INK : GREY; ctx.fillText(label, CX, 1500);
  const wl = ctx.measureText(label).width; BBOX.push({ k: 'compteur', x0: CX - wl / 2, y0: 1470, x1: CX + wl / 2, y1: 1508 });
  ctx.fillStyle = MIST; ctx.fillRect(120, 1552, 840, 6); ctx.fillStyle = BLUE; ctx.fillRect(120, 1552, 840 * clamp01(n / N), 6);
}
window.renderFrame = renderFrame; window.__bboxes = () => BBOX.slice();

// marge balle/paroi (px) à l'instant t : < 0 = la balle dépasse du cercle (utilisé par l'audit)
window.__margin = t => { const cs = circleState(t), R = innerR(cs); return Math.min(...D.balls.map((_, b) => { const P = ballAt(b, t); return R - (Math.hypot(P.x - CX, P.y - CY) + BR); })); };

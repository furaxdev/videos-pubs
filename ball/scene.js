// BALL MUSIC — scène déterministe : renderFrame(t) ne dépend que de t et de BALL_DATA (précalculé par generate.py)
const D = window.BALL_DATA, CFG = D.cfg, cv = document.getElementById('c'), ctx = cv.getContext('2d');
window.DURATION = D.duration; window.FPS = CFG.fps;
const INK = '#0B1020', BLUE = '#2F5BFF', GREY = '#8A93B8', MIST = '#EEF2FF';
const CX = CFG.circle.cx, CY = CFG.circle.cy, SW = CFG.circle.stroke, BR = CFG.ball.r, G = CFG.gravity, SHADOW = 14;
const IMP = D.impacts, N = IMP.length, STOPS = CFG.colors.map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
const RGB = CFG.theme === 'rgb', hsl = (h, l = 60) => `hsl(${((h % 360) + 360) % 360},100%,${l}%)`, impHue = i => 210 + i * 23;
const clamp01 = x => Math.min(1, Math.max(0, x)), eo = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const colAt = I => { const x = clamp01(I) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), f = x - i; const c = STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f)); return `rgb(${c})`; };
const impCol = im => RGB ? hsl(impHue(im.i)) : colAt(intensity(im.speed));
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
function pulseAt(t) { if (REAL && !DEFORM) return 0; const i = lastImp(t); if (i < 0) return 0; const dt = t - IMP[i].t; return dt > .4 ? 0 : .016 * Math.exp(-dt * 13) * Math.cos(dt * 30); }
// ---- dessin ----
const REAL = RGB && CFG.realistic !== false, DEFORM = CFG.deform === true;   // DEFORM : contour qui bosse à l'impact (désactivé par défaut : le rond reste rigide)   // impacts « réalistes » : déformation du contour, étincelles, écrasement de la balle, tremblement
const wrapA = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
// déformation radiale (px, vers l'extérieur) du contour au point d'un impact : bosse qui s'étale en onde et vibre en s'amortissant
function deform(th, t) { let d = 0; const n = lastImp(t) + 1;
  for (let i = Math.max(0, n - 6); i < n; i++) { const im = IMP[i], dt = t - im.t; if (dt > .75) continue; const I = intensity(im.speed), a0 = Math.atan2(im.y - CY, im.x - CX), sg = .17 + 1.1 * dt, A = (17 + 26 * I) * Math.exp(-dt * 6) * (.5 + .5 * Math.cos(dt * 32)) * Math.sqrt(.17 / sg), da = wrapA(th - a0); d += A * Math.exp(-da * da / (2 * sg * sg)); }
  return d; }
const RIBBON = CFG.trail === 'ribbon', withA = (c, a) => c.replace(/^rgb\(/, 'rgba(').replace(/^hsl\(/, 'hsla(').replace(/\)$/, `,${a})`);
// traînée en ruban continu : une seule forme, fine à la queue, plus large vers la balle, qui se plie aux rebonds (un ruban par trajet entre deux impacts)
function ribbon(b, t, col, I) {
  const TL = .09 + .3 * I, M = 44, pts = []; for (let j = 0; j <= M; j++) { const ts = Math.max(0, t - TL * j / M); pts.push({ ...ballAt(b, ts), j, seg: lastImp(ts, b) }); }
  let a = 0; while (a < pts.length - 1) { let e = a; while (e + 1 < pts.length && pts[e + 1].seg === pts[a].seg) e++;
    if (e - a >= 2) { const g = pts.slice(a, e + 1), L = [], Rr = [];
      g.forEach((p, k) => { const q = g[Math.min(k + 1, g.length - 1)], o = g[Math.max(k - 1, 0)]; let dx = o.x - q.x, dy = o.y - q.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const w = BR * .62 * Math.pow(1 - p.j / (M + 1), 1.15); L.push([p.x - dy * w, p.y + dx * w]); Rr.push([p.x + dy * w, p.y - dx * w]); });
      const h = g[0], tl = g[g.length - 1], gr = ctx.createLinearGradient(tl.x, tl.y, h.x, h.y); gr.addColorStop(0, withA(col, 0)); gr.addColorStop(1, withA(col, .75));
      ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); for (let k = 1; k < L.length; k++) ctx.lineTo(L[k][0], L[k][1]); for (let k = Rr.length - 1; k >= 0; k--) ctx.lineTo(Rr[k][0], Rr[k][1]); ctx.closePath(); ctx.fill(); }
    a = e + 1; } }
let TNOW = 0; const BBOX = [];  // boîtes d'éléments (utilisées par l'audit qualité)
function drawCircle(R, a, pul, cs) { const r = R * (1 + pul);
  ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = SW; ctx.beginPath(); ctx.arc(CX + SHADOW, CY + SHADOW, r, 0, 7); if (!RGB) { ctx.strokeStyle = BLUE; ctx.stroke(); } // ombre pleine bleue décalée (thème Furax)
  ctx.beginPath(); if (REAL) { for (let k = 0; k <= 240; k++) { const th = k / 240 * 2 * Math.PI, rr = r + (DEFORM ? deform(th, TNOW) : 0); k ? ctx.lineTo(CX + rr * Math.cos(th), CY + rr * Math.sin(th)) : ctx.moveTo(CX + rr * Math.cos(th), CY + rr * Math.sin(th)); } ctx.closePath(); } else ctx.arc(CX, CY, r, 0, 7); if (RGB) { const g = ctx.createConicGradient(-TNOW * 1.1, CX, CY); for (let k = 0; k <= 12; k++) g.addColorStop(k / 12, hsl(k * 30 + TNOW * 40, 27)); ctx.strokeStyle = g; } else ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  BBOX.push({ k: 'cercle', x0: CX - r - SW / 2, y0: CY - r - SW / 2, x1: CX + r + (RGB ? 0 : SHADOW) + SW / 2, y1: CY + r + (RGB ? 0 : SHADOW) + SW / 2 }); }
function title(t) {
  const F = { font: 'Inter Display', weight: 700 }, size = 46, y = 236, a = 'Bouncing Ball:', b = 'MONTAGEM ROYAL';
  const wa = width(ctx, a + ' ', size, F), wb = width(ctx, b, size, F), x0 = CX - (wa + wb) / 2;
  textFx(ctx, t, { style: 'fade', text: a, x: x0, y, size, color: RGB ? '#fff' : INK, delay: .1, out: false, ...F });
  textFx(ctx, t, { style: 'fade', text: b, x: x0 + wa, y, size, color: RGB ? hsl(t * 90 + 200, 62) : BLUE, delay: .1, out: false, ...F });
  BBOX.push({ k: 'titre', x0, y0: y - size, x1: x0 + wa + wb, y1: y + 12 });
}
// fond RGB : dégradé conique qui tourne (hors du cercle, l'intérieur reste noir) + flash et onde à chaque impact
function rgbBackground(t, cs, n) {
  const li = n - 1, dt = li >= 0 ? t - IMP[li].t : 9, flash = li >= 0 ? Math.exp(-dt * 5) : 0, R = (cs.rings ? Math.max(...cs.rings.map(r => r.R)) : cs.R) * (1 + pulseAt(t));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); ctx.arc(CX, CY, R, 0, 7); ctx.clip('evenodd');
  const g = ctx.createConicGradient(t * .9, CX, CY); for (let k = 0; k <= 12; k++) g.addColorStop(k / 12, hsl(k * 30 + t * 50, 52));
  ctx.globalAlpha = .26 + .42 * flash; ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  for (let i = Math.max(0, n - 6); i < n; i++) { const d = t - IMP[i].t; if (d > .7) continue; const p = eo(d / .7); ctx.globalAlpha = .55 * (1 - p); ctx.strokeStyle = impCol(IMP[i]); ctx.lineWidth = 16 * (1 - p) + 2; ctx.beginPath(); ctx.arc(CX, CY, R + 20 + 520 * p, 0, 7); ctx.stroke(); }
  ctx.restore();
}
function renderFrame(t) {
  TNOW = t;
  BBOX.length = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = RGB ? '#000' : '#fff'; ctx.fillRect(0, 0, 1080, 1920);
  const cs = circleState(t), pul = pulseAt(t), n = lastImp(t) + 1;
  if (REAL && n) { const im = IMP[n - 1], dt = t - im.t; if (dt < .2) { const a = (3 + 6 * intensity(im.speed)) * Math.exp(-dt * 20) * Math.cos(dt * 90); ctx.translate(-im.nx * a, -im.ny * a); } }
  // cercle(s)
  if (cs.rings) cs.rings.forEach(r => drawCircle(r.R, r.a, pul, cs)); else drawCircle(cs.R, 1, pul, cs);
  // intérieur : ondes, arcs de choc, particules (clippés à l'intérieur du cercle)
  ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, innerR(cs) * (1 + pul) - 1, 0, 7); ctx.clip();
  for (let i = Math.max(0, n - 12); i < n; i++) { const im = IMP[i], dt = t - im.t, col = impCol(im);
    if (dt < .5) { const p = eo(dt / .5); ctx.globalAlpha = (REAL ? .3 : .75) * (1 - p); ctx.strokeStyle = col; ctx.lineWidth = 6 - 4.5 * p; ctx.beginPath(); ctx.arc(im.x, im.y, 16 + 150 * p, 0, 7); ctx.stroke(); }
    if (REAL) { if (dt < .75) { const R = rng(i * 104729 + 7), I = intensity(im.speed), cnt = i === N - 1 ? 60 : 30 + Math.round(24 * I), tx = -im.ny, ty = im.nx;
      for (let k = 0; k < cnt; k++) { const sd = (R() < .5 ? -1 : 1), tang = (.15 + R() * .85) * sd, nrm = .25 + R() * .9, sp = (380 + 1100 * R()) * (.55 + .7 * I), life = .3 + .4 * R(); if (dt > life) continue;
        const vx = (tx * tang + im.nx * nrm) * sp, vy = (ty * tang + im.ny * nrm) * sp, drag = Math.exp(-dt * 2.2), px = im.x + vx * (1 - drag) / 2.2, py = im.y + vy * (1 - drag) / 2.2 + .5 * 1300 * dt * dt, q = dt / life;
        const dx = vx * drag, dy = vy * drag + 1300 * dt, L = Math.hypot(dx, dy) || 1, tl = Math.min(46, L * .03);
        ctx.globalAlpha = (1 - q) * (1 - q * .4); ctx.strokeStyle = q < .25 ? '#fff' : col; ctx.lineWidth = 5.5 * (1 - .6 * q); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - dx / L * tl, py - dy / L * tl); ctx.stroke(); }
      if (dt < .07) { const p = dt / .07; ctx.globalAlpha = 1 - p; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(im.x, im.y, 6 + 20 * p, 0, 7); ctx.fill(); } } }
    else if (dt < .6) { const R = rng(i * 7919 + 13), cnt = i === N - 1 ? 30 : 14, base = Math.atan2(im.ny, im.nx), I = intensity(im.speed);
      for (let k = 0; k < cnt; k++) { const ang = base + (R() - .5) * 2.2, sp = (260 + 520 * R()) * (.7 + .6 * I), life = .35 + .25 * R(); if (dt > life) continue; const q = dt / life, d = eo(dt / .45) * sp * .45;
        const px = im.x + Math.cos(ang) * d, py = im.y + Math.sin(ang) * d + .5 * 500 * dt * dt * .6; ctx.globalAlpha = 1 - q; ctx.fillStyle = k % 3 ? col : (RGB ? '#fff' : INK); ctx.beginPath(); ctx.arc(px, py, (k % 3 ? 8 : 5) * (1 - .7 * q), 0, 7); ctx.fill(); } } }
  ctx.restore();
  // arc de choc sur la paroi (couleur de l'impact)
  for (let i = Math.max(0, n - 3); i < n; i++) { const im = IMP[i], dt = t - im.t; if (REAL || dt > .3) continue; const ang = Math.atan2(im.y - CY, im.x - CX), p = eo(dt / .3), r = Math.hypot(im.x - CX, im.y - CY);
    ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = impCol(im); ctx.lineWidth = SW + 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(CX, CY, r + SW / 2 * 0, ang - .1 - .35 * p, ang + .1 + .35 * p); ctx.stroke(); ctx.restore(); }
  // balles
  for (let b = 0; b < D.balls.length; b++) {
    const i = lastImp(t, b), cur = i >= 0 ? byBall[b][i] : null, prevI = i > 0 ? intensity(byBall[b][i - 1].speed) : 0, curI = cur ? intensity(cur.speed) : 0;
    let I = cur ? prevI + (curI - prevI) * eo((t - cur.t) / .2) : 0, col = RGB ? hsl(impHue(Math.max(0, (cur ? cur.i : 0))) + (cur ? (t - cur.t) * 50 : 0), 62) : colAt(I), P = ballAt(b, t), sp = Math.hypot(P.vx, P.vy);
    if (REAL && cur && t - cur.t < .045) { const u = (t - cur.t) / .045, w = 2 * u * u - u * u * u; P = { ...P, x: cur.bx + (P.x - cur.bx) * w, y: cur.by + (P.y - cur.by) * w }; }   // collée à la paroi pendant le contact, puis reprend sa trajectoire sans saut
    // traînée : positions passées, longueur selon la vitesse
    const TL = .05 + .17 * I, M = 16;
    if (RIBBON) { if (t <= D.impacts[N - 1].t + .14) ribbon(b, t, col, I); }
    else for (let j = (t > D.impacts[N - 1].t + .14) ? 0 : M; j >= 1; j--) { const q = ballAt(b, Math.max(0, t - TL * j / M)), f = 1 - j / (M + 1); ctx.globalAlpha = .38 * f * f + .04; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q.x, q.y, BR * (.35 + .6 * f), 0, 7); ctx.fill(); }
    const endT = D.impacts[N - 1].t, k = clamp01(1 - (t - endT) / .14), rr = BR * (t >= endT ? k : 1);
    if (rr > .5) { ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.strokeStyle = RGB ? '#fff' : INK; ctx.lineWidth = RGB ? 5 : 4; ctx.beginPath();
      const dq = cur ? t - cur.t : 9, sq = REAL && cur && dq < .045 ? Math.sin(Math.PI * dq / .045) : 0;   // écrasement contre la paroi (~90 ms), volume conservé
      if (sq > 0) { const c = (.3 + .12 * curI) * sq, ang = Math.atan2(cur.ny, cur.nx), sh = rr * c; ctx.save(); ctx.translate(P.x - cur.nx * sh, P.y - cur.ny * sh); ctx.rotate(ang); ctx.ellipse(0, 0, rr * (1 - c), rr / Math.sqrt(1 - c), 0, 0, 7); ctx.restore(); }
      else ctx.arc(P.x, P.y, rr, 0, 7);
      ctx.fill(); ctx.stroke();
      BBOX.push({ k: 'balle', x0: P.x - rr - 2, y0: P.y - rr - 2, x1: P.x + rr + 2, y1: P.y + rr + 2 }); }
  }
  if (CFG.show_title !== false) title(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // compteur discret + barre de progression fine
  ctx.globalAlpha = 1; const pl = n === 1 ? 'impact' : 'impacts', label = CFG.variant === 'rings' ? `${n} ${pl} · ${cs.rings.filter(r => r.a > .5).length} anneaux` : `${n} ${pl}`;
  ctx.font = '600 32px Inter'; ctx.letterSpacing = '0px'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = RGB ? (n ? '#fff' : '#8A93B8') : (n ? INK : GREY); ctx.fillText(label, CX, 1500);
  const wl = ctx.measureText(label).width; BBOX.push({ k: 'compteur', x0: CX - wl / 2, y0: 1470, x1: CX + wl / 2, y1: 1508 });
  ctx.fillStyle = RGB ? '#1a1a1a' : MIST; ctx.fillRect(120, 1552, 840, 6); ctx.fillStyle = RGB ? hsl(t * 90 + 200, 62) : BLUE; ctx.fillRect(120, 1552, 840 * clamp01(n / N), 6);
}
window.renderFrame = renderFrame; window.__bboxes = () => BBOX.slice();

// marge balle/paroi (px) à l'instant t : < 0 = la balle dépasse du cercle (utilisé par l'audit)
window.__margin = t => { const cs = circleState(t), R = innerR(cs); return Math.min(...D.balls.map((_, b) => { const P = ballAt(b, t); return R - (Math.hypot(P.x - CX, P.y - CY) + BR); })); };

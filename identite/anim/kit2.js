// kit2.js — composants VISUELS supplémentaires (à utiliser avec kit.js + ../assets/logos.js). Objectif : chaque vidéo a SES logos et SES éléments.
// Logos : window.LOGOS (simple-icons). logoImg(nom, couleur) → Image (précharger avec loadLogos([[nom, couleur], ...]) avant le rendu).
const LOGO_CACHE = {};
function logoKey(n, c) { return n + '|' + c; }
function loadLogos(list) { return Promise.all(list.map(([n, c]) => { const L = window.LOGOS[n]; if (!L) { console.error('logo inconnu : ' + n); return Promise.resolve(); } const col = c || L.hex, k = logoKey(n, col); if (LOGO_CACHE[k]) return Promise.resolve();
  const svg = L.colored ? L.svg : L.svg.replace('<svg ', `<svg fill="${col}" `), im = new Image(); LOGO_CACHE[k] = im; return new Promise(r => { im.onload = r; im.onerror = r; im.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg))); }); })); }
const logoImg = (n, c) => LOGO_CACHE[logoKey(n, c || (window.LOGOS[n] || {}).hex)];
const brandCol = n => { const h = (window.LOGOS[n] || {}).colored ? C.ink : ((window.LOGOS[n] || {}).hex || C.ink), v = parseInt(h.slice(1), 16), L = (.299 * (v >> 16) + .587 * ((v >> 8) & 255) + .114 * (v & 255)); return L > 215 ? C.ink : h; };   // marques très claires → encre

// ---- icônes supplémentaires (repère 48×48, tracé) ----
const ICONS2 = { lock: new Path2D('M12 22h24v18H12zM17 22v-6a7 7 0 0 1 14 0v6'), unlock: new Path2D('M12 22h24v18H12zM17 22v-6a7 7 0 0 1 13.5-2.6'), key: new Path2D('M16 28a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM22 22l16 16M32 32l4-4M36 36l4-4'),
  db: new Path2D('M10 12c0-3 6-5 14-5s14 2 14 5-6 5-14 5-14-2-14-5zM10 12v24c0 3 6 5 14 5s14-2 14-5V12M10 24c0 3 6 5 14 5s14-2 14-5'), cloud: new Path2D('M14 36a8 8 0 0 1-1-15.9A11 11 0 0 1 34 17a8.5 8.5 0 0 1 1 17H14z'),
  file: new Path2D('M12 6h16l8 8v28H12zM28 6v8h8M18 24h12M18 31h12'), bug: new Path2D('M24 14a7 7 0 0 1 7 7v7a7 7 0 0 1-14 0v-7a7 7 0 0 1 7-7zM18 14l-3-4M30 14l3-4M17 22H9M31 22h8M17 30l-7 3M31 30l7 3M24 21v14'),
  phone: new Path2D('M15 5h18a3 3 0 0 1 3 3v32a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM21 38h6'), globe: new Path2D('M42 24a18 18 0 1 1-36 0 18 18 0 0 1 36 0zM6 24h36M24 6c6 5 8 11 8 18s-2 13-8 18c-6-5-8-11-8-18s2-13 8-18z'),
  eye: new Path2D('M4 24s8-13 20-13 20 13 20 13-8 13-20 13S4 24 4 24zM30 24a6 6 0 1 1-12 0 6 6 0 0 1 12 0z'), chip: new Path2D('M14 14h20v20H14zM20 20h8v8h-8zM19 8v6M29 8v6M19 34v6M29 34v6M8 19h6M8 29h6M34 19h6M34 29h6') };
function icon2(ctx, name, cx, cy, size, color = C.ink, lw = 3.4) { ctx.save(); ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(size / 48, size / 48); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = ctx.lineJoin = 'round'; ctx.stroke(ICONS2[name]); ctx.restore(); }

// ---- tuile de logo : états normal / alert (rouge, tremble) / ok (vert + coche) / dead (grisé + fissures) — flip = {at, to} change l'état en cours de route ----
function logoTile(ctx, t, { name, cx, cy, size = 200, state = 'normal', flip, delay = 0, label }) {
  const p = ease.out(seg(t, delay, delay + .5)); if (p <= 0) return; const st = flip && t >= flip.at ? flip.to : state, since = flip && t >= flip.at ? t - flip.at : 99;
  const col = st === 'alert' ? C.red : st === 'ok' ? C.green : st === 'dead' ? C.grey : C.ink, shake = st === 'alert' && since < .6 ? Math.sin(t * 70) * 6 * (1 - since / .6) : 0;
  ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(cx + shake, cy + (1 - p) * 40); const x = -size / 2, y = -size / 2;
  ctx.fillStyle = st === 'alert' ? C.red : C.blue; ctx.beginPath(); ctx.roundRect(x + 12, y + 12, size, size, size * .2); ctx.fill();   // ombre pleine
  ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x, y, size, size, size * .2); ctx.fill(); ctx.stroke();
  const im = logoImg(name, st === 'normal' ? brandCol(name) : (st === 'alert' ? C.red : st === 'ok' ? C.green : C.grey)); if (im && im.complete) { ctx.globalAlpha *= st === 'dead' ? .5 : 1; ctx.drawImage(im, -size * .3, -size * .3, size * .6, size * .6); ctx.globalAlpha = clamp(p * 2); }
  if (st === 'dead' || (st === 'alert' && since > .25)) { const k = seg(t, (flip ? flip.at : delay) + .15, (flip ? flip.at : delay) + .55); ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, size, size, size * .2); ctx.clip(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.lineCap = ctx.lineJoin = 'round'; const s = size / 200;
    [[[0, -30], [-12, -10], [10, 6], [-6, 30], [8, 60]], [[10, 6], [40, -4], [62, 12]], [[-12, -10], [-38, -20], [-60, -8]]].forEach((pl, i) => { const L = 220; ctx.setLineDash([L, L]); ctx.lineDashOffset = L * (1 - clamp(k * 1.4 - i * .12)); ctx.beginPath(); pl.forEach(([a, b], j) => j ? ctx.lineTo(a * s, b * s) : ctx.moveTo(a * s, b * s)); ctx.stroke(); }); ctx.restore(); }
  if (st === 'ok') { const k = ease.out(seg(t, (flip ? flip.at : delay) + .1, (flip ? flip.at : delay) + .45)); ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x + size - 6, y + 6, 26 * k, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + size - 16, y + 6); ctx.lineTo(x + size - 8, y + 14); ctx.lineTo(x + size + 4, y - 2); ctx.globalAlpha = k; ctx.stroke(); }
  ctx.restore(); if (label) rise(ctx, t, { text: label, x: cx, y: cy + size / 2 + 52, size: 32, color: C.grey, delay: delay + .2, weight: 600, align: 'center' });
}
// ---- frise chronologique verticale ----
function timeline(ctx, t, { x, y, events, step = 150, delay = 0 }) {
  const n = events.length, p = ease.inout(seg(t, delay, delay + .3 + .5 * n)); ctx.strokeStyle = C.line || '#d9e0ff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + step * (n - 1) * p); ctx.stroke();
  events.forEach((e, i) => { const q = ease.out(seg(t, delay + .25 + i * .5, delay + .25 + i * .5 + .45)); if (q <= 0) return; ctx.save(); ctx.globalAlpha = clamp(q * 2); ctx.translate((1 - q) * 30, 0); const col = e.color || C.blue, yy = y + i * step;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, yy, 16, 0, 7); ctx.fill(); ctx.stroke(); txt(ctx, e.date, x + 44, yy - 6, 28, col, { font: 'JetBrains Mono', weight: 700, ls: 0 }); txt(ctx, e.label, x + 44, yy + 32, 34, C.ink, { weight: 600, ls: -.02 }); ctx.restore(); });
}
// ---- face-à-face A vs B (logos + valeur) ----
function versus(ctx, t, { a, b, cy = 800, delay = 0, win }) {
  [[a, 300], [b, 780]].forEach(([s, cx], i) => { const w = win === i && t > delay + 1.6; logoTile(ctx, t, { name: s.logo, cx, cy, size: 220, delay: delay + i * .15, flip: w ? { at: delay + 1.6, to: 'ok' } : undefined, label: s.label });
    const q = ease.out(seg(t, delay + .9, delay + 1.4)); if (q > 0) { ctx.save(); ctx.globalAlpha = q; txt(ctx, s.value, cx, cy + 250, 56, win === i && t > delay + 1.6 ? C.green : C.ink, { font: 'Inter Display', weight: 800, align: 'center' }); ctx.restore(); } });
  const q = ease.out(seg(t, delay + .3, delay + .7)); ctx.save(); ctx.globalAlpha = q; ctx.fillStyle = C.mist; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(540, cy, 40 * q, 0, 7); ctx.fill(); ctx.stroke(); txt(ctx, 'VS', 540, cy + 10, 28, C.ink, { font: 'JetBrains Mono', weight: 700, align: 'center', ls: 0 }); ctx.restore();
}
// ---- barres horizontales animées ----
function bars(ctx, t, { x, y, w = 760, items, max, delay = 0, gap = 96 }) {
  const mx = max || Math.max(...items.map(i => i.value)); items.forEach((it, i) => { const q = ease.out(seg(t, delay + i * .18, delay + i * .18 + .8)), yy = y + i * gap; ctx.save(); ctx.globalAlpha = clamp(q * 2); txt(ctx, it.label, x, yy, 30, C.ink, { weight: 600, ls: -.02 });
    ctx.fillStyle = C.mist; ctx.beginPath(); ctx.roundRect(x, yy + 14, w, 26, 13); ctx.fill(); ctx.fillStyle = it.color || C.blue; ctx.beginPath(); ctx.roundRect(x, yy + 14, Math.max(26, w * it.value / mx * q), 26, 13); ctx.fill(); txt(ctx, (it.fmt || (v => v))(Math.round(it.value * q * 10) / 10), x + w, yy, 28, it.color || C.blue, { font: 'JetBrains Mono', weight: 700, align: 'right', ls: 0 }); ctx.restore(); });
}
// ---- notification de téléphone ----
function notification(ctx, t, { app, title, body, logo, delay = 0, hold = 1.6, y = 420 }) {
  const p = ease.out(seg(t, delay, delay + .45)), o = 1 - ease.in(seg(t, delay + .45 + hold, delay + .45 + hold + .35)); if (p <= 0 || o <= 0) return; ctx.save(); ctx.globalAlpha = clamp(p * 2) * o; ctx.translate((1 - p) * 260, 0); const x = 120, w = 840, h = 150;
  ctx.fillStyle = C.ink; ctx.globalAlpha *= .12; ctx.beginPath(); ctx.roundRect(x + 6, y + 14, w, h, 34); ctx.fill(); ctx.globalAlpha = clamp(p * 2) * o; ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, w, h, 34); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.mist; ctx.beginPath(); ctx.roundRect(x + 22, y + 26, 98, 98, 24); ctx.fill(); const im = logo && logoImg(logo, brandCol(logo)); if (im && im.complete) ctx.drawImage(im, x + 46, y + 50, 50, 50);
  txt(ctx, app, x + 142, y + 54, 22, C.grey, { font: 'JetBrains Mono', weight: 600, ls: 0 }); txt(ctx, title, x + 142, y + 92, 32, C.ink, { weight: 700 }); txt(ctx, body, x + 142, y + 126, 26, C.grey, { weight: 500, ls: -.01 }); ctx.restore();
}
// ---- bulles de conversation ----
function chat(ctx, t, { x = 120, y = 360, msgs, delay = 0, w = 840 }) {
  let yy = y; msgs.forEach((m, i) => { const a = delay + i * 1.0, q = ease.out(seg(t, a, a + .4)); const h = 84; if (q > 0) { const me = m.me, bw = Math.min(w * .8, 150 + m.text.length * 17), bx = me ? x + w - bw : x; ctx.save(); ctx.globalAlpha = clamp(q * 2); ctx.translate(0, (1 - q) * 24);
    ctx.fillStyle = me ? C.blue : C.mist; ctx.beginPath(); ctx.roundRect(bx, yy, bw, h, 28); ctx.fill(); txt(ctx, m.text, bx + 28, yy + 52, 30, me ? '#fff' : C.ink, { weight: 600, ls: -.01 }); ctx.restore(); }
    else if (i === msgs.findIndex((_, k) => t < delay + k * 1.0) && t > delay + i * 1.0 - .6) { const dots = [0, 1, 2], me = m.me, bx = me ? x + w - 130 : x; ctx.fillStyle = C.mist; ctx.beginPath(); ctx.roundRect(bx, yy, 130, h, 28); ctx.fill(); dots.forEach(d => { ctx.fillStyle = C.grey; ctx.globalAlpha = .4 + .6 * Math.max(0, Math.sin(t * 8 - d)); ctx.beginPath(); ctx.arc(bx + 40 + d * 25, yy + 42, 7, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1; }
    yy += h + 22; });
}
// ---- fenêtre de diff de code (+ vert / − rouge) ----
function diff(ctx, t, { x = 90, y = 520, w = 900, lines, delay = 0 }) {
  const lh = 62, h = 60 + lines.length * lh + 30; windowBox(ctx, t, { x, y, w, h, title: 'diff', delay, draw: (xx, yy) => { lines.forEach((l, i) => { const q = ease.out(seg(t, delay + .5 + i * .35, delay + .5 + i * .35 + .3)); if (q <= 0) return; ctx.save(); ctx.globalAlpha = q; const add = l.k === '+', del = l.k === '-'; if (add || del) { ctx.fillStyle = add ? 'rgba(18,183,106,.15)' : 'rgba(255,59,78,.13)'; ctx.fillRect(xx + 14, yy + 16 + i * lh, w - 28, lh - 8); }
    txt(ctx, (l.k || ' ') + ' ' + l.s, xx + 34, yy + 16 + i * lh + 40, 28, add ? C.green : del ? C.red : C.ink, { font: 'JetBrains Mono', weight: 600, ls: 0 }); ctx.restore(); }); } });
}
// ---- fenêtre de navigateur (URL qui se tape) ----
function browser(ctx, t, { x = 90, y = 520, w = 900, h = 520, url, delay = 0, draw: content }) {
  windowBox(ctx, t, { x, y, w, h, title: '', delay, draw: (xx, yy, ww, hh) => { ctx.fillStyle = C.mist; ctx.beginPath(); ctx.roundRect(xx + 130, yy - 46, ww - 160, 36, 18); ctx.fill(); const n = Math.floor(clamp((t - delay - .5) * 26, 0, url.length)); txt(ctx, url.slice(0, n), xx + 152, yy - 20, 22, C.ink, { font: 'JetBrains Mono', weight: 600, ls: 0 }); if (content) content(xx, yy, ww, hh); } });
}

// ---- images téléchargées (identite/assets/fetch.py → window.IMAGES) ----
const IMG_CACHE = {};
function loadImages(names) { return Promise.all(names.map(n => { const src = (window.IMAGES || {})[n]; if (!src) { console.error('image inconnue : ' + n); return Promise.resolve(); } if (IMG_CACHE[n]) return Promise.resolve(); const im = new Image(); IMG_CACHE[n] = im; return new Promise(r => { im.onload = r; im.onerror = r; im.src = src; }); })); }
// photo : image cadrée (ombre pleine bleue), léger zoom lent, crédit en petit dessous
function photo(ctx, t, { name, x = 120, y = 520, w = 840, h = 520, delay = 0, zoom = .22, credit }) {
  const p = ease.out(seg(t, delay, delay + .6)), im = IMG_CACHE[name]; if (p <= 0 || !im) return; ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(0, (1 - p) * 40);
  ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(x + 14, y + 14, w, h, 26); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 26); ctx.clip();
  const k = 1 + zoom * clamp((t - delay) / 3), sc = Math.max(w / im.width, h / im.height) * k; ctx.translate(x + w / 2, y + h / 2); ctx.scale(sc, sc); ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x, y, w, h, 26); ctx.stroke(); ctx.restore(); if (credit) txt(ctx, credit, x, y + h + 56, 22, C.grey, { font: 'JetBrains Mono', weight: 500, ls: 0 });
}

// ======== animations supplémentaires ========
// tampon (arrive en grand, se pose avec une légère rotation)
function stamp(ctx, t, { text, cx, cy, color = C.red, delay = 0, size = 44, rot = -.2 }) { const q = ease.out(seg(t, delay, delay + .3)); if (q <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); const s = 1.5 - .5 * q; ctx.scale(s, s); ctx.globalAlpha = q; ctx.strokeStyle = color; ctx.lineWidth = 7; const w = txt(ctx, text, 0, 14, size, color, { font: 'JetBrains Mono', weight: 700, align: 'center', ls: 0 }) || 0; ctx.font = `700 ${size}px JetBrains Mono`; const tw = ctx.measureText(text).width; ctx.beginPath(); ctx.roundRect(-tw / 2 - 26, -size * .8, tw + 52, size * 1.7, 16); ctx.stroke(); ctx.restore(); }
// cercle « au marqueur » autour d'un élément (se trace)
function circle(ctx, t, { cx, cy, rx, ry, color = C.red, delay = 0, lw = 8 }) { const p = ease.inout(seg(t, delay, delay + .7)); if (p <= 0) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); const n = 80, end = Math.floor(n * p); for (let i = 0; i <= end; i++) { const a = -2.2 + (i / n) * (Math.PI * 2 + .35), wob = 1 + .03 * Math.sin(a * 3); const px = cx + Math.cos(a) * rx * wob, py = cy + Math.sin(a) * ry * wob; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); }
// flèche courbe qui se dessine, pointe à la fin
function arrow(ctx, t, { x0, y0, x1, y1, bend = 120, color = C.blue, delay = 0, lw = 7 }) { const p = ease.inout(seg(t, delay, delay + .6)); if (p <= 0) return; const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2 - bend; const pt = u => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1];
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const [a, b] = pt(i / 40 * p); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); } ctx.stroke();
  if (p > .95) { const [a, b] = pt(1), [c, d] = pt(.96), ang = Math.atan2(b - d, a - c); ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(a - 26 * Math.cos(ang - .45), b - 26 * Math.sin(ang - .45)); ctx.lineTo(a - 26 * Math.cos(ang + .45), b - 26 * Math.sin(ang + .45)); ctx.closePath(); ctx.fill(); } ctx.restore(); }
// anneaux qui pulsent (attire l'œil)
function pulse(ctx, t, { cx, cy, r = 80, color = C.blue, delay = 0, n = 3, period = 1.2 }) { if (t < delay) return; for (let k = 0; k < n; k++) { const ph = (((t - delay) / period - k / n) % 1 + 1) % 1; ctx.save(); ctx.globalAlpha = .55 * (1 - ph); ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r + ph * r * 1.4, 0, 7); ctx.stroke(); ctx.restore(); } }
// projecteur : assombrit tout sauf une zone (à dessiner APRÈS la scène)
function spotlight(ctx, t, { cx, cy, rx, ry, delay = 0, alpha = .78 }) { const p = ease.out(seg(t, delay, delay + .5)); if (p <= 0) return; ctx.save(); ctx.fillStyle = `rgba(10,18,48,${alpha * p})`; ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); ctx.roundRect(cx - rx, cy - ry, rx * 2, ry * 2, 30); ctx.fill('evenodd'); ctx.restore(); }
// bandeau d'actualité qui défile (ticker)
function ticker(ctx, t, { y = 300, items, speed = 140, color = C.ink, bg = C.mist, gap = 70 }) {   // bandeau d'actus : chaque titre apparaît/disparaît en fondu aux bords de la zone sûre (x 120–960)
  ctx.save(); ctx.fillStyle = bg; ctx.fillRect(0, y - 46, 1080, 70); ctx.font = '700 32px Inter'; ctx.letterSpacing = '-1px'; const ws = items.map(s => ctx.measureText(s).width), total = ws.reduce((a, b) => a + b + gap, 0), off = (t * speed) % total;
  for (let rep = -1; rep < 3; rep++) { let x = 960 - off + rep * total; items.forEach((s, i) => { const w = ws[i], edge = Math.min(x - 120, 960 - (x + w)), a = clamp(edge / 120); if (a > 0) { ctx.globalAlpha = a; txt(ctx, s, x, y, 32, color, { weight: 700, ls: -.03 }); } x += w + gap; }); }
  ctx.restore(); }
// anneau de progression (pourcentage)
function ring(ctx, t, { cx, cy, r = 110, value = 1, color = C.blue, delay = 0, label }) { const p = ease.out(seg(t, delay, delay + 1)) * value; ctx.save(); ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.strokeStyle = C.mist; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); txt(ctx, (label ?? Math.round(p * 100) + ' %'), cx, cy + 16, 48, color, { font: 'Inter Display', weight: 800, align: 'center' }); ctx.restore(); }
// curseur de souris qui se déplace puis clique (ondulation)
function mouse(ctx, t, { from, to, delay = 0, click = true }) { const p = ease.inout(seg(t, delay, delay + .8)), x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p, c = t > delay + .85 && t < delay + 1.2;
  if (click && t > delay + .8) { const k = clamp((t - delay - .8) / .45); ctx.save(); ctx.globalAlpha = .6 * (1 - k); ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(to[0], to[1], 10 + k * 44, 0, 7); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.translate(x, y + (c ? 4 : 0)); ctx.fillStyle = C.ink; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 56); ctx.lineTo(15, 43); ctx.lineTo(27, 66); ctx.lineTo(38, 61); ctx.lineTo(26, 38); ctx.lineTo(45, 36); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); }
// liste cochée : les lignes se cochent une à une
function checklist(ctx, t, { x, y, items, delay = 0, gap = 100 }) { items.forEach((it, i) => { const a = delay + i * .6, q = ease.out(seg(t, a, a + .4)), k = ease.out(seg(t, a + .35, a + .7)); if (q <= 0) return; ctx.save(); ctx.globalAlpha = clamp(q * 2); ctx.translate((1 - q) * -30, 0); const yy = y + i * gap; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.fillStyle = k > 0 ? C.green : '#fff'; ctx.beginPath(); ctx.roundRect(x, yy - 38, 56, 56, 14); ctx.fill(); ctx.stroke(); if (k > 0) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 13, yy - 10); ctx.lineTo(x + 26, yy + 3); ctx.lineTo(x + 45, yy - 24); ctx.globalAlpha = k; ctx.stroke(); } txt(ctx, it, x + 90, yy + 2, 36, C.ink, { weight: 600, ls: -.02 }); ctx.restore(); }); }

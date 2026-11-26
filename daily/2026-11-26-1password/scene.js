// 1Password — incident du 19 nov. 2026. Sans voix, sous-titres de narration en bas.
const cv = document.getElementById('c'), ctx = cv.getContext('2d'), IM = {}, DURATION = 30.6;
const loads = Object.entries(window.IMGS).map(([k, s]) => new Promise(r => { const i = new Image(); i.onload = r; i.src = s; IM[k] = i; }));
const X = 90, CX = 540, CY = 800;
const NARR = [[0, 3, "1Password a subi une intrusion.", C.red], [3, 6, "Le 19 novembre : un compte GitHub d'employé compromis.", C.red], [6, 9.2, "L'attaquant a poussé du code malveillant.", C.red],
  [9.2, 12.2, "Ce code a téléchargé des données de clients.", C.red], [12.2, 15.6, "Noms, e-mails, identifiants : voilà ce qui a fuité.", C.red], [15.6, 18.6, "Mais les coffres-forts n'ont pas été touchés.", C.green],
  [18.6, 21.4, "Ton mot de passe et ta Secret Key ne sont pas stockés.", C.green], [21.4, 24.2, "Méfie-toi des faux e-mails 1Password.", C.amber], [24.2, 26.6, "Sources : 1Password, Hacker News.", C.blue], [26.6, 30.6, "Commente « SAFE » et je t'envoie la ressource en DM.", C.blue]];
function subtitles(t) {
  const n = NARR.find(([a, b]) => t >= a && t < b); if (!n) return; const [a, b, s, hc] = n, ws = s.split(' '), tot = ws.reduce((q, w) => q + w.length + 1, 0), t0 = a + .1, t1 = b - .35; let acc = 0; const times = ws.map(w => { const st = t0 + (t1 - t0) * acc / tot; acc += w.length + 1; return st; });
  const fadeIn = ease.out(seg(t, a, a + .2)), fadeOut = 1 - ease.in(seg(t, b - .15, b)); ctx.save(); ctx.globalAlpha = fadeIn * fadeOut; ctx.translate(0, (1 - fadeIn) * 14);
  ctx.font = '700 46px Inter'; ctx.letterSpacing = '-1px'; const sp = ctx.measureText(' ').width; let lines = [[]], lw = 0;
  ws.forEach((w, i) => { const wd = ctx.measureText(w).width; if (lw + wd > 900 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([w, i, wd]); lw += wd + sp; });
  lines.forEach((ln, li) => { let x = X; ln.forEach(([w, i, wd]) => { const cur = t >= times[i] && (i === ws.length - 1 || t < times[i + 1]); ctx.fillStyle = t < times[i] ? '#c5cde8' : cur ? hc : C.ink; ctx.textAlign = 'left'; ctx.fillText(w, x, 1560 + li * 62); x += wd + sp; }); });
  ctx.letterSpacing = '0px'; ctx.restore();
}
// ---- le bot : tête, yeux, antenne, corps, bras ----
function bot(x, y, s, o = {}) {
  const { fill = '#fff', stroke = C.ink, armL = .9, armR = -.9, t = 0, alpha = 1, look = 0, blink = true } = o, lw = Math.max(2.5, s * .045); ctx.save(); ctx.globalAlpha *= alpha; ctx.lineWidth = lw; ctx.lineJoin = ctx.lineCap = 'round'; ctx.strokeStyle = stroke; ctx.fillStyle = fill;
  const rr = (a, b, w, h, r) => { ctx.beginPath(); ctx.roundRect(a, b, w, h, r); ctx.fill(); ctx.stroke(); };
  // seulement la tête : y = bas de la tête
  rr(x - .5 * s, y - .8 * s, s, .8 * s, .24 * s);
  ctx.beginPath(); ctx.moveTo(x, y - .8 * s); ctx.lineTo(x, y - 1.0 * s); ctx.stroke(); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(x, y - 1.04 * s, .07 * s, 0, 7); ctx.fill();
  const bl = blink && (t % 3.2) < .12 ? .25 : 1; ctx.fillStyle = stroke === C.ink ? C.ink : '#fff'; [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(x + sd * .2 * s + look * .06 * s, y - .42 * s, .075 * s, .075 * s * bl, 0, 0, 7); ctx.fill(); });
  ctx.restore();
}
const fo = (t, a, b) => 1 - ease.in(seg(t, a, b)), fi = (t, a, b = a + .5) => ease.out(seg(t, a, b));
const tf = (t, E, o) => textFx(ctx, t, { ...o, out: true, hold: Math.max(.1, E - o.delay - 1.0) });
const hash = (a, b, c = 0) => ((Math.imul(a + 1, 73856093) ^ Math.imul(b + 1, 19349663) ^ Math.imul(c + 1, 83492791)) >>> 0);
const LOCK = new Path2D('M16 21v-6a8 8 0 0 1 16 0v6M11 21h26v19H11zM24 28v5'), LOCKO = new Path2D('M16 21v-6a8 8 0 0 1 15-4M11 21h26v19H11zM24 28v5');
const card = (x, y, w, h, o = {}) => { const { shadow = C.blue, stroke = C.ink, r = 24, lw = 4, sh = 14 } = o; ctx.fillStyle = shadow; ctx.beginPath(); ctx.roundRect(x + sh, y + sh, w, h, r); ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke(); };
function server(x, y, a, red) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = red ? C.red : '#fff'; ctx.strokeStyle = red ? C.red : C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x, y, 280, 110, 22); ctx.fill(); ctx.stroke(); ctx.fillStyle = red ? '#fff' : C.ink; [0, 1].forEach(k => { ctx.beginPath(); ctx.arc(x + 40 + k * 34, y + 55, 8, 0, 7); ctx.fill(); }); ctx.fillRect(x + 130, y + 49, 110, 12); ctx.restore(); }

function intro(t) {
  const o = fo(t, 2.7, 3), hot = t > 1.2, shake = t > 1.2 ? Math.sin(t * 70) * 5 * (1 - seg(t, 1.2, 1.7)) : 0; ctx.save(); ctx.globalAlpha = o;
  tf(t, 3, { style: 'blur', text: '1Password', x: X, y: 330, size: 54, color: C.ink, delay: .1, font: 'Inter Display' });
  const q = fi(t, .15, .7); ctx.save(); ctx.translate(shake, (1 - q) * 50); ctx.globalAlpha *= clamp(q * 2);
  card(CX - 260, CY - 170, 260, 260, { shadow: hot ? C.red : C.blue, stroke: hot ? C.red : C.ink, r: 48 });
  draw(ctx, t, { path: hot && t > 1.7 ? LOCKO : LOCK, cx: CX - 130, cy: CY - 40, size: 140, delay: .5, color: hot ? C.red : C.ink, len: 200 }); ctx.restore();
  if (t > .9) { const p = fi(t, .9, 1.5); ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 16]); ctx.lineDashOffset = -t * 60; ctx.globalAlpha *= p; ctx.beginPath(); ctx.moveTo(CX + 130, CY - 40); ctx.lineTo(CX + 30, CY - 40); ctx.stroke(); ctx.restore(); bot(CX + 230 - 30 * p, CY + 10, 120, { t, alpha: p, fill: C.red, stroke: C.red, blink: false, look: -1 }); }
  ctx.restore();
}
function mainFrame(t) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
  // 1. compte GitHub d'employé (3–6)
  if (t >= 3 && t < 6.1) { const o = fo(t, 5.7, 6.05); ctx.save(); ctx.globalAlpha = o;
    textFx(ctx, t, { style: 'wipe', text: '19 novembre', x: X, y: 420, size: 72, color: C.amber, delay: 3.05, hold: 2.2, out: false, font: 'Inter Display' });
    const q = fi(t, 3.2, 3.8); ctx.save(); ctx.globalAlpha *= clamp(q * 2); ctx.translate(0, (1 - q) * 40); card(X + 30, 560, 400, 380, { shadow: t > 4.4 ? C.red : C.blue, stroke: t > 4.4 ? C.red : C.ink });
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(X + 230, 700, 50, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(X + 230, 860, 90, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    txt(ctx, 'compte employé', X + 230, 912, 28, C.grey, { font: 'JetBrains Mono', weight: 600, ls: 0, align: 'center' }); ctx.restore();
    if (t > 4.2) { const p = fi(t, 4.2, 4.9), p2 = fi(t, 5, 5.5); ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 16]); ctx.lineDashOffset = -t * 60; ctx.globalAlpha *= p; ctx.beginPath(); ctx.moveTo(740, 740); ctx.lineTo(740 - 250 * p2, 740); ctx.stroke(); ctx.restore(); bot(850 - 40 * (1 - p), 800, 110, { t, alpha: p, fill: C.red, stroke: C.red, blink: false, look: -1 }); }
    ctx.restore(); }
  // 2. code malveillant poussé (6–9.2)
  if (t >= 6 && t < 9.3) { const o = fo(t, 8.9, 9.25); ctx.save(); ctx.globalAlpha = o;
    windowBox(ctx, t, { x: X, y: 480, w: 900, h: 360, delay: 6.05, draw: (x, y) => { typing(ctx, t, { text: 'git push origin main', x: x + 40, y: y + 100, prompt: '$ ', delay: 6.6, last: false, cps: 24 }); typing(ctx, t, { text: 'code malveillant', x: x + 40, y: y + 200, prompt: '> ', delay: 7.5, color: C.red, cps: 18 }); } });
    [0, 1, 2].forEach(i => { const a = 7.9 + i * .3, q = fi(t, a, a + .4), on = t > a + .3; if (q > 0) { ctx.save(); ctx.translate(0, (1 - q) * 30); server(X + i * 310, 960, clamp(q * 2), on); ctx.restore(); } });
    ctx.restore(); }
  // 3. les données partent (9.2–12.2)
  if (t >= 9.2 && t < 12.3) { const o = fo(t, 11.9, 12.25); ctx.save(); ctx.globalAlpha = o;
    tf(t, 12.2, { style: 'focus', text: 'données clients', x: X, y: 420, size: 60, color: C.red, delay: 9.3, font: 'Inter Display' });
    const q = fi(t, 9.3, 9.9); ctx.save(); ctx.translate(0, (1 - q) * 40); server(X, 700, clamp(q * 2), true); ctx.restore();
    for (let k = 0; k < 5; k++) { const ph = (((t - 10 - k * .35) * .6) % 1 + 1) % 1; if (t > 10 + k * .35 && t < 11.9) { const fx = 430 + ph * 300; ctx.save(); ctx.globalAlpha *= Math.min(1, ph * 5) * Math.min(1, (1 - ph) * 5); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(fx, 725, 50, 60, 8); ctx.fill(); ctx.stroke(); ctx.strokeStyle = C.sky; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(fx + 12, 745); ctx.lineTo(fx + 38, 745); ctx.moveTo(fx + 12, 762); ctx.lineTo(fx + 30, 762); ctx.stroke(); ctx.restore(); } }
    const bq = fi(t, 9.9, 10.5); bot(880, 810, 110, { t, alpha: clamp(bq * 2), fill: C.red, stroke: C.red, blink: false, look: -1 });
    ctx.restore(); }
  // 4. ce qui a fuité (12.2–15.6)
  if (t >= 12.2 && t < 15.7) { const o = fo(t, 15.25, 15.65); ctx.save(); ctx.globalAlpha = o; const rows = ['Noms', 'E-mails', 'Identifiants', 'Clés publiques'], sty = ['wipe', 'blurWords', 'tracking', 'slideDown'];
    rows.forEach((s, i) => { const a = 12.3 + i * .3, q = fi(t, a, a + .5); if (q <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(q * 2); ctx.translate(0, (1 - q) * 30); card(X, 440 + i * 150, 900, 110, { shadow: C.red, r: 22, sh: 10 });
      ctx.restore(); tf(t, 15.6, { style: sty[i], text: s, x: X + 40, y: 440 + i * 150 + 72, size: 46, color: C.ink, delay: a + .1, font: 'Inter Display' });
      const fill = seg(t, a + .4, 15.2); ctx.save(); ctx.globalAlpha *= clamp(q * 2); ctx.fillStyle = C.sky; ctx.beginPath(); ctx.roundRect(X + 520, 440 + i * 150 + 49, 320, 12, 6); ctx.fill(); ctx.fillStyle = C.red; ctx.beginPath(); ctx.roundRect(X + 520, 440 + i * 150 + 49, 320 * fill, 12, 6); ctx.fill(); ctx.restore(); });
    if (t > 13.1) { const bx = 250 + 500 * ease.inout(seg(t, 13.1, 15.4)); bot(bx, 1180, 100, { t, alpha: fi(t, 13.1, 13.5), fill: C.red, stroke: C.red, blink: false, look: 1 }); }
    ctx.restore(); }
  // 5. coffres-forts intacts (15.6–18.6)
  if (t >= 15.6 && t < 18.7) { const o = fo(t, 18.25, 18.65); ctx.save(); ctx.globalAlpha = o;
    draw(ctx, t, { path: new Path2D('M8 10h32v26H8zM13 36v4M35 36v4M30 23a6 6 0 1 1-12 0 6 6 0 0 1 12 0zM24 17v-3M24 29v3'), cx: CX, cy: 640, size: 340, delay: 15.7, color: C.green, len: 220 });
    draw(ctx, t, { path: ICONS.check, cx: CX, cy: 640, size: 70, delay: 16.9, color: C.green });
    tf(t, 18.6, { style: 'tracking', text: 'coffres-forts intacts', x: CX, y: 1090, size: 54, color: C.green, delay: 16.1, font: 'Inter Display', align: 'center' });
    for (let k = 0; k < 2; k++) { const ph = ((t - 17.2 - k * .5) % 1 + 1) % 1; if (t > 17.2 + k * .5) { ctx.save(); ctx.globalAlpha *= .5 * (1 - ph); ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(CX, 640, 230 + ph * 130, 0, 7); ctx.stroke(); ctx.restore(); } }
    ctx.restore(); }
  // 6. mot de passe + Secret Key non stockés (18.6–21.4)
  if (t >= 18.6 && t < 21.5) { const o = fo(t, 21.05, 21.45); ctx.save(); ctx.globalAlpha = o;
    [['mot de passe', 'tracking'], ['Secret Key', 'blur']].forEach(([s, st], i) => { const a = 18.7 + i * .5, q = fi(t, a, a + .55), y = 520 + i * 200; if (q > 0) { ctx.save(); ctx.globalAlpha *= clamp(q * 2); ctx.translate(0, (1 - q) * 30); card(X, y, 900, 130, { shadow: C.green, r: 26 }); ctx.restore(); }
      tf(t, 21.4, { style: st, text: s, x: X + 40, y: y + 82, size: 50, color: C.ink, delay: a + .1, font: 'Inter Display' });
      const c = fi(t, a + .9, a + 1.3); if (c > 0) { ctx.save(); ctx.globalAlpha *= c; txt(ctx, 'non stocké', X + 860, y + 76, 32, C.green, { font: 'JetBrains Mono', weight: 700, ls: 0, align: 'right' }); ctx.restore(); } });
    ctx.restore(); }
  // 7. méfie-toi des faux e-mails (21.4–24.2)
  if (t >= 21.4 && t < 24.3) { const o = fo(t, 23.55, 23.95); ctx.save(); ctx.globalAlpha = o;
    draw(ctx, t, { path: new Path2D('M6 12h36v24H6zM6 14l18 14 18-14'), cx: CX - 40, cy: 640, size: 300, delay: 21.5, color: C.ink, len: 230 });
    const bq = fi(t, 22.2, 22.6); if (bq > 0) { ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(CX + 130, 520, 44 * bq, 0, 7); ctx.fill(); txt(ctx, '!', CX + 130, 538, 54 * bq, '#fff', { font: 'Inter Display', align: 'center', ls: 0 }); }
    tf(t, 24.0, { style: 'focus', text: 'support@1password.com', x: CX, y: 960, size: 36, color: C.ink, delay: 22.6, font: 'JetBrains Mono', weight: 600, ls: 0, align: 'center' });
    ctx.restore(); }
  // 8. sources / buzz (24.2–26.6)
  if (t >= 24.2 && t < 26.7) { const p = fi(t, 24.25, 24.8), so = fo(t, 26.2, 26.6); ctx.save(); ctx.globalAlpha = clamp(p * 2) * so; ctx.translate(0, (1 - p) * 30); card(X, 520, 900, 420, { r: 24 });
    txt(ctx, '1Password Security Incident', X + 50, 610, 40, C.ink, { font: 'Inter Display' });
    counter(ctx, t, { to: 1579, x: X + 50, y: 750, size: 84, color: C.blue, delay: 24.5, dur: 1.2 }); txt(ctx, 'points sur Hacker News', X + 330, 748, 36, C.grey, { weight: 500, ls: 0 });
    counter(ctx, t, { to: 681, x: X + 50, y: 870, size: 60, color: C.blue, delay: 24.7, dur: 1.2 }); txt(ctx, 'commentaires', X + 230, 868, 34, C.grey, { weight: 500, ls: 0 }); ctx.restore(); }
  // 9. appel à l'action : SAFE (26.6–30.6)
  const B = 26.6; if (t >= B) { const inq = fi(t, B + .1, B + .6), send = seg(t, B + 1.35, B + 1.5), outq = ease.inout(seg(t, B + 1.6, B + 2.1)), cx0 = 90, cy0 = 640, W0 = 900, H0 = 200;
    if (outq < 1) { ctx.save(); ctx.globalAlpha = clamp(inq * 2) * (1 - outq); ctx.translate(0, (1 - inq) * 40 - outq * 120);
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(cx0 + 14, cy0 + 14, W0, H0, 28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(cx0, cy0, W0, H0, 28); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(cx0 + 70, cy0 + 100, 38, 0, 7); ctx.fill(); txt(ctx, 'F', cx0 + 70, cy0 + 116, 44, '#fff', { font: 'Inter Display', align: 'center', ls: 0 });
      const n = Math.floor(clamp((t - B - .6) * 5, 0, 4)), word = 'SAFE'.slice(0, n); if (n === 0) txt(ctx, 'Ajouter un commentaire…', cx0 + 160, cy0 + 112, 30, C.grey, { weight: 500, ls: 0 });
      const ww = txt(ctx, word, cx0 + 140, cy0 + 118, 56, C.ink, { font: 'JetBrains Mono', weight: 700, ls: 0 }); if (t < B + 1.5 && (n < 4 || Math.floor(t * 2) % 2 === 0)) { ctx.fillStyle = C.blue; ctx.fillRect(cx0 + 140 + ww + 8, cy0 + 70, 4, 58); }
      const press = 1 - .06 * (send > 0 && send < 1 ? 1 : 0); ctx.save(); ctx.translate(cx0 + 790, cy0 + 100); ctx.scale(press, press); ctx.fillStyle = n >= 4 ? C.blue : C.sky; ctx.beginPath(); ctx.roundRect(-80, -34, 160, 68, 34); ctx.fill(); txt(ctx, 'envoyer', 0, 10, 26, '#fff', { weight: 700, align: 'center', ls: 0 }); ctx.restore(); ctx.restore(); }
    if (t >= B + 1.7) { const bob = Math.sin(t * 5) * 8; ctx.save(); ctx.translate(0, bob); draw(ctx, t, { path: new Path2D('M6 12h36v24H6zM6 14l18 14 18-14'), cx: CX, cy: 800, size: 300, delay: B + 1.7, color: C.blue, len: 230 });
      const bq = fi(t, B + 2.4, B + 2.7); if (bq > 0) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(CX + 150, 690, 34 * bq, 0, 7); ctx.fill(); txt(ctx, '1', CX + 150, 702, 36 * bq, '#fff', { font: 'Inter Display', align: 'center', ls: 0 }); } ctx.restore(); } }
  subtitles(t);
}
const SAFE_K = 840 / 900;
function renderFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920); ctx.save(); ctx.translate(540, 960); ctx.scale(SAFE_K, SAFE_K); ctx.translate(-540, -960); if (t < 3) { intro(t); subtitles(t); } else mainFrame(t); ctx.restore(); progress(ctx, t / DURATION); }
window.renderFrame = renderFrame; window.DURATION = DURATION; window.ready = Promise.all([document.fonts.load('700 40px Inter'), document.fonts.load('700 40px "Inter Display"'), document.fonts.load('600 30px "JetBrains Mono"'), ...loads]);

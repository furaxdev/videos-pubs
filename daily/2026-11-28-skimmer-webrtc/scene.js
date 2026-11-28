// Skimmer WebRTC (InfoHawk, 27 nov. 2026) — 31,4 s, sans voix, sous-titres de narration en bas.
const cv = document.getElementById('c'), ctx = cv.getContext('2d'), DURATION = 31.4;
const X = 90, CX = 540, CY = 800, SAFE_K = 840 / 900;   // le contenu occupe x 120–960 après mise à l'échelle
const NARR = [[0, 3.0, "Black Friday : un skimmer vole des cartes.", C.red], [3.0, 5.8, "Il se cache dans un script marketing.", C.red], [5.8, 8.6, "Il semble ne viser que le mobile, à la caisse.", C.red],
  [8.6, 11.8, "Il envoie tout via WebRTC, comme un appel vidéo.", C.red], [11.8, 14.6, "Ce canal est souvent moins surveillé.", C.amber], [14.6, 17.6, "Il vise numéro, date, code et adresse.", C.red],
  [17.6, 20.4, "Selon InfoHawk : 5 sites touchés.", C.red], [20.4, 23.2, "Signalé le 24 novembre : tous ont réagi.", C.green], [23.2, 25.6, "Une règle CSP connect-src bloque ses requêtes.", C.green],
  [25.6, 27.4, "Source : InfoHawk, relayée sur Hacker News.", C.blue], [27.4, 31.4, "Commente « SKIMMER » et je t'envoie la ressource en DM.", C.blue]];
function subtitles(t) {
  const n = NARR.find(([a, b]) => t >= a && t < b); if (!n) return; const [a, b, s, hc] = n, ws = s.split(' '), tot = ws.reduce((q, w) => q + w.length + 1, 0), t0 = a + .1, t1 = b - .35; let acc = 0; const times = ws.map(w => { const st = t0 + (t1 - t0) * acc / tot; acc += w.length + 1; return st; });
  const fadeIn = ease.out(seg(t, a, a + .2)), fadeOut = 1 - ease.in(seg(t, b - .15, b)); ctx.save(); ctx.globalAlpha = fadeIn * fadeOut; ctx.translate(0, (1 - fadeIn) * 14);
  ctx.font = '700 46px Inter'; ctx.letterSpacing = '-1px'; const sp = ctx.measureText(' ').width; let lines = [[]], lw = 0;
  ws.forEach((w, i) => { const wd = ctx.measureText(w).width; if (lw + wd > 900 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([w, i, wd]); lw += wd + sp; });
  lines.forEach((ln, li) => { let x = X; ln.forEach(([w, i, wd]) => { const cur = t >= times[i] && (i === ws.length - 1 || t < times[i + 1]); ctx.fillStyle = t < times[i] ? '#c5cde8' : cur ? hc : C.ink; ctx.textAlign = 'left'; ctx.fillText(w, x, 1560 + li * 62); x += wd + sp; }); });
  ctx.letterSpacing = '0px'; ctx.restore();
}
// bot = tête seule (y = bas de la tête)
function bot(x, y, s, o = {}) {
  const { fill = '#fff', stroke = C.ink, t = 0, alpha = 1, look = 0, blink = true } = o, lw = Math.max(2.5, s * .045); ctx.save(); ctx.globalAlpha *= alpha; ctx.lineWidth = lw; ctx.lineJoin = ctx.lineCap = 'round'; ctx.strokeStyle = stroke; ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(x - .5 * s, y - .8 * s, s, .8 * s, .24 * s); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - .8 * s); ctx.lineTo(x, y - 1.0 * s); ctx.stroke(); ctx.fillStyle = stroke === C.ink ? C.blue : stroke; ctx.beginPath(); ctx.arc(x, y - 1.04 * s, .07 * s, 0, 7); ctx.fill();
  const bl = blink && (t % 3.2) < .12 ? .25 : 1; ctx.fillStyle = stroke === C.ink ? C.ink : '#fff'; [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(x + sd * .2 * s + look * .06 * s, y - .42 * s, .075 * s, .075 * s * bl, 0, 0, 7); ctx.fill(); });
  ctx.restore();
}
// paquets rouges qui descendent d'un point à un autre (données volées)
function packets(t, x, y0, y1, color = C.red, n = 3, period = .9) { for (let k = 0; k < n; k++) { const ph = (((t) / period - k / n) % 1 + 1) % 1, y = y0 + (y1 - y0) * ph; ctx.save(); ctx.globalAlpha = Math.min(1, ph * 6) * Math.min(1, (1 - ph) * 6); ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x - 11, y - 11, 22, 22, 6); ctx.fill(); ctx.restore(); } }
function packetsH(t, x0, x1, y, color = C.red, n = 3, period = .9) { for (let k = 0; k < n; k++) { const ph = (((t) / period - k / n) % 1 + 1) % 1, x = x0 + (x1 - x0) * ph; ctx.save(); ctx.globalAlpha = Math.min(1, ph * 6) * Math.min(1, (1 - ph) * 6); ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x - 11, y - 11, 22, 22, 6); ctx.fill(); ctx.restore(); } }
// une scène [a,b) en temps local lt, fondu de sortie 0,35 s
function scene(t, a, b, fn) { if (t < a || t >= b) return; ctx.save(); ctx.globalAlpha = 1 - ease.in(seg(t, b - .35, b)); fn(t - a, b - a); ctx.restore(); }

function mainFrame(t) {
  // 1. intro (0–3,0) : page de paiement, la carte se tape, un bot rouge la lorgne et aspire les données
  scene(t, 0, 3.0, lt => {
    textFx(ctx, lt, { style: 'blur', text: 'Black Friday · 27 novembre', x: X, y: 360, size: 54, color: C.ink, delay: .05, hold: 2.3, out: false, font: 'Inter Display' });
    browser(ctx, lt, { x: X, y: 520, w: 900, h: 690, url: 'boutique.example/checkout', delay: .1, draw: (xx, yy, ww, hh) => {
      txt(ctx, 'Paiement', xx + 40, yy + 76, 40, C.ink, { font: 'Inter Display' });
      const red = lt > 1.6; ctx.lineWidth = 4; ctx.strokeStyle = red ? C.red : C.ink; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(xx + 40, yy + 110, ww - 80, 100, 18); ctx.fill(); ctx.stroke();
      typing(ctx, lt, { text: '4242 4242 4242 4242', x: xx + 70, y: yy + 175, size: 40, delay: .6, cps: 14, last: false });
      [0, 1].forEach(i => { ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.roundRect(xx + 40 + i * ((ww - 100) / 2 + 20), yy + 240, (ww - 100) / 2, 90, 18); ctx.stroke(); txt(ctx, i ? 'CVV' : 'MM/AA', xx + 70 + i * ((ww - 100) / 2 + 20), yy + 296, 30, C.grey, { font: 'JetBrains Mono', weight: 600, ls: 0 }); });
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(xx + 40, yy + 380, ww - 80, 100, 50); ctx.fill(); txt(ctx, 'Payer', xx + ww / 2, yy + 445, 38, '#fff', { weight: 700, align: 'center' }); } });
    const up = ease.out(seg(lt, 1.2, 1.8)); if (up > 0) { ctx.save(); ctx.globalAlpha = up; bot(780, 1440 + (1 - up) * 80, 130, { t: lt, fill: C.red, stroke: C.red, blink: false }); ctx.restore(); }
    if (lt > 1.7) packets(lt - 1.7, 780, 1230, 1330);
  });
  // 2. où il se cache (3,0–5,8)
  scene(t, 3.0, 5.8, lt => {
    [['eye', 'pixel pub'], ['globe', 'bannière cookies'], ['file', 'fichier du site']].forEach(([ic, lb], i) => { const x = 110 + i * 320;
      tile(ctx, lt, { x, y: 560, s: 240, i, delay: .1, inner: (cx, cy) => icon2(ctx, ic, cx, cy, 110, i === 0 && lt > 1.6 ? C.red : C.ink, 3.6) });
      textFx(ctx, lt, { style: ['slideDown', 'fade', 'tracking'][i], text: lb, x: x + 120, y: 880, size: 30, color: C.grey, delay: .5 + i * .12, hold: 1.7, weight: 600, align: 'center' }); });
    circle(ctx, lt, { cx: 230, cy: 680, rx: 134, ry: 134, delay: 1.2 }); pulse(ctx, lt, { cx: 230, cy: 680, r: 64, color: C.red, delay: 2.0, n: 2, period: 1.0 });
    textFx(ctx, lt, { style: 'letters', text: 'script tiers', x: X, y: 440, size: 54, color: C.ink, delay: .05, hold: 2, font: 'Inter Display' });
  });
  // 3. mobile seulement (5,8–8,6)
  scene(t, 5.8, 8.6, lt => {
    const q = ease.out(seg(lt, .1, .6)); ctx.save(); ctx.globalAlpha = clamp(q * 2); ctx.translate(0, (1 - q) * 30); ctx.strokeStyle = C.grey; ctx.lineWidth = 5; ctx.lineCap = ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.roundRect(120, 580, 380, 250, 22); ctx.stroke(); ctx.beginPath(); ctx.moveTo(250, 830); ctx.lineTo(230, 900); ctx.lineTo(390, 900); ctx.lineTo(370, 830); ctx.stroke(); ctx.restore();
    icon2(ctx, 'phone', 760, 700, 340, lt > .5 ? C.red : C.ink, 3); pulse(ctx, lt, { cx: 760, cy: 700, r: 60, color: C.red, delay: .9, n: 2, period: 1.0 });
    textFx(ctx, lt, { style: 'slideLeft', text: 'ordinateur', x: 310, y: 1000, size: 38, color: C.grey, delay: .3, hold: 1.8, weight: 600, align: 'center' });
    textFx(ctx, lt, { style: 'focus', text: 'mobile', x: 760, y: 1000, size: 38, color: C.red, delay: .5, hold: 1.7, weight: 700, align: 'center' });
    textFx(ctx, lt, { style: 'type', text: '/checkout', x: 190, y: 1100, size: 34, color: C.grey, delay: .9, hold: 1 });
    stamp(ctx, lt, { text: 'ACTIF', cx: 770, cy: 1130, color: C.red, delay: 1.5, size: 38, rot: -.15 });
  });
  // 4. WebRTC (8,6–11,8)
  scene(t, 8.6, 11.8, lt => {
    textFx(ctx, lt, { style: 'tracking', text: 'WebRTC', x: X, y: 480, size: 72, color: C.blue, delay: .05, hold: 2.5, font: 'Inter Display' });
    logoTile(ctx, lt, { name: 'googlechrome', cx: 210, cy: 760, size: 180, delay: .3, label: 'navigateur' });
    logoTile(ctx, lt, { name: 'cloudflare', cx: 540, cy: 760, size: 180, delay: .55, label: 'relais Cloudflare' });
    const q = ease.out(seg(lt, .8, 1.3)); if (q > 0) { ctx.save(); ctx.globalAlpha = q; bot(870, 850, 160, { t: lt, fill: C.red, stroke: C.red, blink: false }); ctx.restore(); rise(ctx, lt, { text: 'pirate', x: 870, y: 902, size: 32, color: C.grey, delay: 1.0, weight: 600, align: 'center' }); }
    if (lt > 1.1) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 16]); ctx.lineDashOffset = -lt * 60; ctx.beginPath(); ctx.moveTo(318, 760); ctx.lineTo(432, 760); ctx.moveTo(648, 760); ctx.lineTo(772, 760); ctx.stroke(); ctx.restore(); packetsH(lt - 1.1, 318, 432, 700, C.red, 2, .8); packetsH(lt - 1.1, 648, 772, 700, C.red, 2, .8); }
    arrow(ctx, lt, { x0: 540, y0: 1150, x1: 540, y1: 985, bend: 0, color: C.blue, delay: 1.5 });
    textFx(ctx, lt, { style: 'wipe', text: 'masque la vraie destination', x: 330, y: 1230, size: 34, color: C.ink, delay: 1.7, hold: .9, weight: 600 });
  });
  // 5. canal moins surveillé (11,8–14,6)
  scene(t, 11.8, 14.6, lt => {
    versus(ctx, lt, { a: { logo: 'googlechrome', label: 'requête web', value: 'vue' }, b: { logo: 'cloudflare', label: 'canal WebRTC', value: 'peu vu' }, cy: 760, delay: .05 });
    circle(ctx, lt, { cx: 780, cy: 760, rx: 150, ry: 150, delay: 1.5 });
  });
  // 6. données visées (14,6–17,6) : la carte, ligne par ligne
  scene(t, 14.6, 17.6, lt => {
    const q = ease.out(seg(lt, .05, .6)); ctx.save(); ctx.globalAlpha = clamp(q * 2); ctx.translate(0, (1 - q) * 40);
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(134, 534, 780, 520, 30); ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(120, 520, 780, 520, 30); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.mist; ctx.beginPath(); ctx.roundRect(160, 560, 110, 76, 14); ctx.fill(); ctx.stroke();
    ['numéro', 'expiration', 'code', 'adresse'].forEach((lb, i) => { const y = 700 + i * 78, hit = ease.out(seg(lt, .6 + i * .5, .9 + i * .5)); txt(ctx, lb, 160, y + 10, 30, C.grey, { font: 'JetBrains Mono', weight: 600, ls: 0 });
      ctx.fillStyle = hit > 0 ? C.red : C.mist; ctx.globalAlpha = clamp(q * 2) * (hit > 0 ? .35 + .65 * hit : 1); ctx.beginPath(); ctx.roundRect(440, y - 26, 420 * (hit > 0 ? 1 : 1), 48, 12); ctx.fill(); ctx.globalAlpha = clamp(q * 2); });
    ctx.restore();
    stamp(ctx, lt, { text: 'COPIÉ', cx: 700, cy: 1250, color: C.red, delay: 2.0, size: 40, rot: -.15 });
  });
  // 7. 5 sites (17,6–20,4)
  scene(t, 17.6, 20.4, lt => {
    counter(ctx, lt, { to: 5, x: X, y: 520, size: 84, color: C.red, delay: .1, dur: .6 }); textFx(ctx, lt, { style: 'blurWords', text: 'sites concernés', x: X + 80, y: 520, size: 44, color: C.grey, delay: .2, hold: 1.8, weight: 600 });
    [['Lascana', 'pixel marketing'], ['Samsonite', 'bannière cookies'], ['American Tourister', 'bannière cookies'], ['Revolve', 'fichier du CDN'], ['FWRD', 'fichier du CDN']].forEach(([n, how], i) => { const d = .5 + i * .22, y = 700 + i * 110;
      rise(ctx, lt, { text: n, x: X, y, size: 44, color: C.ink, delay: d }); textFx(ctx, lt, { style: 'fade', text: how, x: 580, y: y - 4, size: 26, color: C.grey, delay: d + .15, hold: 1.2, font: 'JetBrains Mono', weight: 600 });
});
  });
  // 8. chronologie (20,4–23,2)
  scene(t, 20.4, 23.2, lt => {
    timeline(ctx, lt, { x: 130, y: 520, step: 150, delay: .05, events: [{ date: '24 nov.', label: 'InfoHawk prévient les sites', color: C.amber }, { date: '24 nov.', label: 'Lascana, Samsonite : retiré', color: C.green }, { date: '25 nov.', label: 'Revolve, FWRD : confirmé', color: C.green }, { date: '27 nov.', label: 'Article publié', color: C.amber }] });
    stamp(ctx, lt, { text: 'TOUS ONT RÉAGI', cx: 540, cy: 1230, color: C.green, delay: 1.9, size: 34, rot: -.1 });
  });
  // 9. défense CSP (23,2–25,6)
  scene(t, 23.2, 25.6, lt => {
    windowBox(ctx, lt, { x: X, y: 540, w: 900, h: 300, title: 'exemple — en-têtes HTTP', delay: .05, draw: (x, y) => { typing(ctx, lt, { text: 'Content-Security-Policy:', x: x + 40, y: y + 90, size: 32, delay: .5, cps: 40, last: false }); typing(ctx, lt, { text: "  connect-src 'self' api.boutique.fr;", x: x + 40, y: y + 170, size: 32, delay: 1.0, cps: 34, color: C.green }); } });
    draw(ctx, lt, { path: new Path2D('M24 5l15 6v11c0 10-7 18-15 21C16 40 9 32 9 22V11z'), cx: CX, cy: 1100, size: 300, delay: 1.2, color: C.green, len: 220 }); draw(ctx, lt, { path: ICONS.check, cx: CX, cy: 1100, size: 120, delay: 1.7, color: C.green });
  });
  // 10. source (25,6–27,4)
  scene(t, 25.6, 27.4, lt => {
    textFx(ctx, lt, { style: 'focus', text: 'InfoHawk', x: X, y: 560, size: 72, color: C.ink, delay: .05, hold: 1.2, font: 'Inter Display' });
    rise(ctx, lt, { text: 'news · 27 novembre 2026', x: X, y: 625, size: 30, color: C.grey, delay: .25, font: 'JetBrains Mono', weight: 600 });
    counter(ctx, lt, { to: 486, x: X, y: 860, size: 84, color: C.blue, delay: .3, dur: .9 }); textFx(ctx, lt, { style: 'slideLeft', text: 'points sur Hacker News', x: X, y: 930, size: 38, color: C.grey, delay: .5, hold: .6, weight: 600 });
  });
  // 11. appel à l'action : commenter SKIMMER → ressource en DM (27,4–31,4)
  if (t >= 27.4) { const k = t - 27.4, WORD = 'SKIMMER', inq = ease.out(seg(k, .1, .6)), send = seg(k, 1.75, 1.9), outq = ease.inout(seg(k, 2.0, 2.5)), cx0 = 90, cy0 = 640, W0 = 900, H0 = 200;
    if (outq < 1) { ctx.save(); ctx.globalAlpha = clamp(inq * 2) * (1 - outq); ctx.translate(0, (1 - inq) * 40 - outq * 120);
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(cx0 + 14, cy0 + 14, W0, H0, 28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(cx0, cy0, W0, H0, 28); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(cx0 + 70, cy0 + 100, 38, 0, 7); ctx.fill(); txt(ctx, 'F', cx0 + 70, cy0 + 116, 44, '#fff', { font: 'Inter Display', align: 'center', ls: 0 });
      const n = Math.floor(clamp((k - .7) * 7, 0, WORD.length)), word = WORD.slice(0, n); if (n === 0) txt(ctx, 'Ajouter un commentaire…', cx0 + 160, cy0 + 112, 30, C.grey, { weight: 500, ls: 0 });
      const ww = txt(ctx, word, cx0 + 140, cy0 + 118, 56, C.ink, { font: 'JetBrains Mono', weight: 700, ls: 0 }); if (k < 1.95 && (n < WORD.length || Math.floor(k * 2) % 2 === 0)) { ctx.fillStyle = C.blue; ctx.fillRect(cx0 + 140 + ww + 8, cy0 + 70, 4, 58); }
      const press = 1 - .06 * (send > 0 && send < 1 ? 1 : 0); ctx.save(); ctx.translate(cx0 + 790, cy0 + 100); ctx.scale(press, press); ctx.fillStyle = n >= WORD.length ? C.blue : C.sky; ctx.beginPath(); ctx.roundRect(-80, -34, 160, 68, 34); ctx.fill(); txt(ctx, 'envoyer', 0, 10, 26, '#fff', { weight: 700, align: 'center', ls: 0 }); ctx.restore();
      ctx.restore(); }
    if (k >= 2.1) { const bob = Math.sin(t * 5) * 8; ctx.save(); ctx.translate(0, bob); draw(ctx, t, { path: new Path2D('M6 12h36v24H6zM6 14l18 14 18-14'), cx: CX, cy: 800, size: 300, delay: 27.4 + 2.1, color: C.blue, len: 230 });
      const bq = ease.out(seg(k, 2.8, 3.1)); if (bq > 0) { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(CX + 150, 690, 34 * bq, 0, 7); ctx.fill(); txt(ctx, '1', CX + 150, 702, 36 * bq, '#fff', { font: 'Inter Display', align: 'center', ls: 0 }); }
      ctx.restore(); } }
  subtitles(t);
}
function renderFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920); ctx.save(); ctx.translate(540, 960); ctx.scale(SAFE_K, SAFE_K); ctx.translate(-540, -960); mainFrame(t); ctx.restore(); progress(ctx, t / DURATION); }
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all([document.fonts.load('700 40px Inter'), document.fonts.load('700 40px "Inter Display"'), document.fonts.load('600 30px "JetBrains Mono"'), loadLogos([['googlechrome', null], ['googlechrome', brandCol('googlechrome')], ['cloudflare', brandCol('cloudflare')], ['cloudflare', null], ['googlechrome', '#12b76a'], ['cloudflare', '#ff3b4e']])]);

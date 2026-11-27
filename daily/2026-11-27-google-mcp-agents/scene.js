// Google impose MCP aux agents IA (1er fév. 2027). Intro : barrière entre un agent et Gmail. 1080×1920, contenu dans x 120–960.
const cv = document.getElementById('c'), ctx = cv.getContext('2d'), DURATION = 33.4, X = 120;
const NARR = [[0, 3.2, "Google change les règles pour les agents IA.", C.amber], [3.2, 6.0, "Le 24 novembre, Google généralise ses serveurs MCP.", C.blue], [6.0, 9.0, "Dès le 1er février 2027, ils sont obligatoires.", C.red],
  [9.0, 12.0, "Un agent ne pourra plus appeler Gmail en direct.", C.red], [12.0, 15.0, "Sinon : quotas au minimum, même si tu paies.", C.amber], [15.0, 18.0, "Gratuit : 5 000 requêtes par jour et par projet.", C.green],
  [18.0, 21.0, "Plus de volume ? Palier payant dès le 1er avril 2027.", C.amber], [21.0, 24.0, "Google : un jeton valide ne suffit plus pour un agent.", C.blue], [24.0, 27.0, "L'article fait plus de 300 points sur Hacker News.", C.blue],
  [27.0, 29.4, "Sources : Google Workspace, Google Cloud.", C.blue], [29.4, 33.4, "Commente « MCP » et je t'envoie la ressource en DM.", C.blue]];
function subtitles(t) {
  const n = NARR.find(([a, b]) => t >= a && t < b); if (!n) return; const [a, b, s, hc] = n, ws = s.split(' '), tot = ws.reduce((q, w) => q + w.length + 1, 0), t0 = a + .1, t1 = b - .35; let acc = 0; const times = ws.map(w => { const st = t0 + (t1 - t0) * acc / tot; acc += w.length + 1; return st; });
  const fadeIn = ease.out(seg(t, a, a + .2)), fadeOut = 1 - ease.in(seg(t, b - .15, b)); ctx.save(); ctx.globalAlpha = fadeIn * fadeOut; ctx.translate(0, (1 - fadeIn) * 14);
  ctx.font = '700 46px Inter'; ctx.letterSpacing = '-1px'; const sp = ctx.measureText(' ').width; let lines = [[]], lw = 0;
  ws.forEach((w, i) => { const wd = ctx.measureText(w).width; if (lw + wd > 830 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([w, i, wd]); lw += wd + sp; });
  lines.forEach((ln, li) => { let x = X; ln.forEach(([w, i, wd]) => { const cur = t >= times[i] && (i === ws.length - 1 || t < times[i + 1]); ctx.fillStyle = t < times[i] ? '#c5cde8' : cur ? hc : C.ink; ctx.textAlign = 'left'; ctx.fillText(w, x, 1540 + li * 62); x += wd + sp; }); });
  ctx.letterSpacing = '0px'; ctx.restore();
}
function bot(x, y, s, o = {}) { const { fill = '#fff', stroke = C.ink, t = 0, alpha = 1, look = 0 } = o, lw = Math.max(2.5, s * .045); ctx.save(); ctx.globalAlpha *= alpha; ctx.lineWidth = lw; ctx.lineJoin = ctx.lineCap = 'round'; ctx.strokeStyle = stroke; ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(x - .5 * s, y - .8 * s, s, .8 * s, .24 * s); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - .8 * s); ctx.lineTo(x, y - s); ctx.stroke(); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(x, y - 1.04 * s, .07 * s, 0, 7); ctx.fill();
  const bl = (t % 3.2) < .12 ? .25 : 1; ctx.fillStyle = stroke === C.ink ? C.ink : '#fff'; [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(x + sd * .2 * s + look * .06 * s, y - .42 * s, .075 * s, .075 * s * bl, 0, 0, 7); ctx.fill(); }); ctx.restore(); }
const cross = (cx, cy, r, col, p = 1) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.lineCap = 'round'; const q = r * p; ctx.beginPath(); ctx.moveTo(cx - q, cy - q); ctx.lineTo(cx + q, cy + q); ctx.moveTo(cx + q, cy - q); ctx.lineTo(cx - q, cy + q); ctx.stroke(); ctx.restore(); };
const dotted = (x0, y0, x1, y1, col, p, t) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([2, 18]); ctx.lineDashOffset = -t * 50; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + (x1 - x0) * p, y0 + (y1 - y0) * p); ctx.stroke(); ctx.restore(); };
const hn = (t) => { };
// ---------- scènes (t local) ----------
const SCENES = [
  // 0. intro : titre puis une barrière se ferme entre un agent et Gmail
  [0, 3.2, t => {
    textFx(ctx, t, { style: 'slideDown', text: 'GOOGLE WORKSPACE · NOUVELLE RÈGLE', x: 540, y: 420, size: 30, color: C.ink, delay: .1, hold: 2.3, font: 'JetBrains Mono', weight: 700, ls: 0, align: 'center' });
    const q = ease.out(seg(t, .5, 1)); ctx.save(); ctx.globalAlpha = clamp(q * 2); ctx.translate(0, (1 - q) * 30);
    bot(280, 1010, 130, { t, look: 1 }); ctx.restore();
    logoTile(ctx, t, { name: 'gmail', cx: 800, cy: 930, size: 200, delay: .65 });
    const g = ease.out(seg(t, 1.7, 2.3)); if (g > 0) { ctx.fillStyle = C.amber; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(520, 1010 - 230 * g, 36, 230 * g, 14); ctx.fill(); ctx.stroke(); }
    dotted(360, 930, 505, 930, C.blue, seg(t, 1.0, 1.7), t);
  }],
  // 1. serveurs MCP : trois tuiles
  [3.2, 6.0, t => {
    textFx(ctx, t, { style: 'tracking', text: 'SERVEURS MCP', x: 540, y: 560, size: 44, color: C.blue, delay: .05, hold: 1.7, font: 'JetBrains Mono', weight: 700, align: 'center' });
    [['gmail', 270], ['googledrive', 540], ['googlecalendar', 810]].forEach(([n, cx], i) => logoTile(ctx, t, { name: n, cx, cy: 860, size: 210, delay: .25 + i * .15, flip: { at: 1.3 + i * .2, to: 'ok' } }));
    pulse(ctx, t, { cx: 540, cy: 860, r: 190, color: C.green, delay: 1.9, n: 2 });
  }],
  // 2. frise datée
  [6.0, 9.0, t => {
    timeline(ctx, t, { x: 190, y: 540, step: 210, events: [{ date: '24 nov 2026', label: 'serveurs MCP généralisés', color: C.blue }, { date: '1er fév 2027', label: 'MCP obligatoire (agents)', color: C.red }, { date: '1er avr 2027', label: 'paliers payants', color: C.amber }] });
    pulse(ctx, t, { cx: 190, cy: 750, r: 22, color: C.red, delay: 1.5 });
  }],
  // 3. appel direct barré / passage par MCP
  [9.0, 12.0, t => {
    bot(270, 960, 140, { t, look: 1 }); logoTile(ctx, t, { name: 'gmail', cx: 810, cy: 880, size: 200, delay: .1 });
    dotted(360, 880, 710, 880, C.red, seg(t, .3, 1), t); const c = ease.out(seg(t, 1.0, 1.4)); if (c > 0) cross(535, 880, 36 * c, C.red, c);
    textFx(ctx, t, { style: 'slideLeft', text: 'API directe', x: 430, y: 800, size: 30, color: C.red, delay: .4, hold: 1.8, font: 'JetBrains Mono', weight: 600, ls: 0 });
    const m = ease.out(seg(t, 1.5, 2.0)); if (m > 0) { ctx.save(); ctx.globalAlpha = clamp(m * 2); ctx.translate(0, (1 - m) * 24); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(473, 1166, 150, 150, 30); ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(460, 1153, 150, 150, 30); ctx.fill(); ctx.stroke(); txt(ctx, 'MCP', 535, 1243, 44, C.ink, { font: 'JetBrains Mono', weight: 700, align: 'center', ls: 0 }); ctx.restore(); }
    dotted(270, 990, 270, 1228, C.green, seg(t, 1.9, 2.3), t); dotted(270, 1228, 450, 1228, C.green, seg(t, 2.1, 2.4), t); dotted(620, 1228, 810, 1228, C.green, seg(t, 2.3, 2.7), t); dotted(810, 1228, 810, 990, C.green, seg(t, 2.6, 2.95), t);
  }],
  // 4. versus : quotas
  [12.0, 15.0, t => { versus(ctx, t, { a: { logo: 'googlecloud', label: 'API directe', value: 'Standard' }, b: { logo: 'google', label: 'Passage par MCP', value: 'Scaled' }, win: 1, cy: 800 }); }],
  // 5. gratuit : 5000 req/jour
  [15.0, 18.0, t => {
    textFx(ctx, t, { style: 'tracking', text: 'PALIER GRATUIT', x: 540, y: 600, size: 44, color: C.green, delay: .1, hold: 2, align: 'center' });
    txt(ctx, Math.round(5000 * ease.out(seg(t, 0, 1.2))).toLocaleString('fr-FR'), 540, 820, 140, C.ink, { font: 'Inter Display', weight: 700, align: 'center' }); ctx.save(); ctx.textAlign = 'center';
    textFx(ctx, t, { style: 'fade', text: 'requêtes par jour', x: 540, y: 910, size: 40, color: C.grey, delay: 1.0, hold: 1.2, align: 'center', weight: 600 });
    textFx(ctx, t, { style: 'fade', text: 'par projet · par produit', x: 540, y: 970, size: 32, color: C.grey, delay: 1.2, hold: 1.0, align: 'center', weight: 500 }); ctx.restore();
    draw(ctx, t, { path: ICONS2.cloud, cx: 540, cy: 1240, size: 150, delay: .3, color: C.green }); pulse(ctx, t, { cx: 540, cy: 1240, r: 95, color: C.green, delay: 1.2 });
  }],
  // 6. paiement : calendrier 1er avril
  [18.0, 21.0, t => {
    logoTile(ctx, t, { name: 'gmail', cx: 540, cy: 780, size: 220, label: 'serveur MCP Gmail' });
    textFx(ctx, t, { style: 'focus', text: '1er avril 2027', x: 540, y: 1230, size: 64, color: C.amber, delay: .5, hold: 1.6, font: 'Inter Display', align: 'center' });
    stamp(ctx, t, { text: 'PAYANT', cx: 540, cy: 1080, color: C.amber, delay: 1.1 });
    mouse(ctx, t, { from: [880, 1000], to: [620, 800], delay: .3, click: false }); pulse(ctx, t, { cx: 540, cy: 780, r: 150, color: C.amber, delay: 1.4 });
  }],
  // 7. citation Google
  [21.0, 24.0, t => {
    draw(ctx, t, { path: ICONS2.key, cx: 540, cy: 600, size: 150, delay: .1, color: C.ink });
    textFx(ctx, t, { style: 'wipe', text: '« un jeton valide', x: 540 - width(ctx, '« un jeton valide', 60, { font: 'Inter Display' }) / 2, y: 840, size: 60, color: C.ink, delay: .4, hold: 2, font: 'Inter Display' });
    textFx(ctx, t, { style: 'wipe', text: 'ne suffit plus »', x: 540 - width(ctx, 'ne suffit plus »', 60, { font: 'Inter Display' }) / 2, y: 920, size: 60, color: C.ink, delay: .7, hold: 1.7, font: 'Inter Display' });
    textFx(ctx, t, { style: 'letters', text: 'Google Cloud · 25 nov 2026', x: 540 - width(ctx, 'Google Cloud · 25 nov 2026', 30, { font: 'JetBrains Mono', weight: 600, ls: 0 }) / 2, y: 1020, size: 30, color: C.grey, delay: 1.2, hold: 1.0, font: 'JetBrains Mono', weight: 600, ls: 0 });
  }],
  // 8. Hacker News
  [24.0, 27.0, t => {
    browser(ctx, t, { x: 120, w: 840, y: 520, h: 520, url: 'news.ycombinator.com', draw: (x, y, w, h) => {
      ctx.fillStyle = '#ff6600'; ctx.fillRect(x, y, w, 56); txt(ctx, 'Hacker News', x + 28, y + 40, 30, '#fff', { weight: 700 });
      const q = ease.out(seg(t, .8, 1.3)); ctx.save(); ctx.globalAlpha = q; txt(ctx, '▲ 304', x + 28, y + 150, 38, C.ink, { font: 'JetBrains Mono', weight: 700, ls: 0 }); txt(ctx, 'Google Will Make AI Agents Use', x + 28, y + 220, 34, C.ink, { weight: 600, ls: -.02 }); txt(ctx, 'Its MCP Servers…', x + 28, y + 266, 34, C.ink, { weight: 600, ls: -.02 }); txt(ctx, '259 commentaires · techstackups.com', x + 28, y + 330, 26, C.grey, { weight: 500, ls: -.01 }); ctx.restore(); } });
    mouse(ctx, t, { from: [900, 1100], to: [760, 870], delay: 1.1 });
  }],
  // 9. sources
  [27.0, 29.4, t => {
    ticker(ctx, t, { y: 600, items: ['Workspace AI Tools Addendum', 'Quotas Gmail API', 'Google Cloud Blog', 'Hacker News'], speed: 110 });
    logoTile(ctx, t, { name: 'google', cx: 540, cy: 930, size: 200, delay: .3 }); arrow(ctx, t, { x0: 820, y0: 1200, x1: 640, y1: 1050, bend: 60, color: C.blue, delay: 1.0 }); pulse(ctx, t, { cx: 540, cy: 930, r: 130, color: C.blue, delay: 1.7 });
  }],
  // 10. appel à l'action
  [29.4, 33.4, t => {
    const w = ease.out(seg(t, 0, .5)); ctx.save(); ctx.globalAlpha = clamp(w * 2); ctx.translate(0, (1 - w) * 30); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(134, 664, 820, 116, 58); ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(120, 650, 820, 116, 58); ctx.fill(); ctx.stroke(); ctx.restore();
    const pr = t > 1.55 ? ease.out(seg(t, 1.55, 1.75)) : 0; if (w > .5) { typing(ctx, t, { text: 'MCP', x: 170, y: 725, size: 44, delay: .5, cps: 6, last: t < 1.5 });
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(870, 708, 40 - pr * 4, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(856, 724); ctx.lineTo(884, 708); ctx.lineTo(856, 692); ctx.lineTo(861, 708); ctx.closePath(); ctx.stroke(); }
    mouse(ctx, t, { from: [900, 1000], to: [872, 712], delay: .7 });
    const e = ease.out(seg(t, 1.9, 2.4)); if (e > 0) { ctx.save(); ctx.globalAlpha = clamp(e * 2); ctx.translate(0, (1 - e) * 30); const ex = 400, ey = 960, ew = 280, eh = 190; ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(ex + 14, ey + 14, ew, eh, 24); ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(ex, ey, ew, eh, 24); ctx.fill(); ctx.stroke(); ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(ex + 14, ey + 22); ctx.lineTo(ex + ew / 2, ey + 120); ctx.lineTo(ex + ew - 14, ey + 22); ctx.stroke();
      const b = ease.out(seg(t, 2.3, 2.6)); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(ex + ew - 6, ey + 4, 34 * b, 0, 7); ctx.fill(); if (b > .8) txt(ctx, '1', ex + ew - 6, ey + 18, 40, '#fff', { weight: 800, align: 'center' }); ctx.restore(); pulse(ctx, t, { cx: 400 + 280 - 6, cy: 964, r: 44, color: C.red, delay: 2.7 }); }
  }]
];
function renderFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
  const s = SCENES.find(([a, b]) => t >= a && t < b) || SCENES[SCENES.length - 1]; ctx.save(); s[2](t - s[0]); ctx.restore(); subtitles(t); progress(ctx, t / DURATION); }
window.renderFrame = renderFrame; window.DURATION = DURATION;
const LG = ['gmail', 'googledrive', 'googlecalendar', 'google', 'googlecloud']; 
window.ready = Promise.all([document.fonts.load('700 40px Inter'), document.fonts.load('700 40px "Inter Display"'), document.fonts.load('600 30px "JetBrains Mono"'), loadLogos(LG.flatMap(n => [[n, brandCol(n)], [n, '#12b76a'], [n, '#ff3b4e'], [n, '#8a93b8']]))]);

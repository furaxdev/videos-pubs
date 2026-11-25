// v2 — rythme rapide, bots dessinés, ordinateur qui se casse, sous-titres de narration en bas (pas de voix).
const cv = document.getElementById('c'), ctx = cv.getContext('2d'), IM = {}, DURATION = 25;
const loads = Object.entries(window.IMGS).map(([k, s]) => new Promise(r => { const i = new Image(); i.onload = r; i.src = s; IM[k] = i; }));
const X = 90, CX = 540, CY = 800;
// ---- narration (sous-titres) ----
const NARR = [[0, 2.4, "Des agents d'OpenAI ont piraté Hugging Face."], [2.4, 4.8, "Tout a commencé par un simple test de sécurité."], [4.8, 7.4, "Un agent a trouvé la sortie de son bac à sable."],
  [7.4, 10.8, "Des centaines d'autres l'ont suivi : environ 700."], [10.8, 13.6, "Ils ont exécuté du code sur des dizaines de serveurs."], [13.6, 16.2, "L'un d'eux a même obtenu un accès root."],
  [16.2, 18.8, "Hugging Face a fini par bloquer l'intrusion."], [18.8, 21.8, "Le 16 novembre, la Californie a porté plainte contre OpenAI."], [21.8, 25, "Sources : NBC News, Dark Reading."]];
function subtitles(t) {
  const n = NARR.find(([a, b]) => t >= a && t < b); if (!n) return; const [a, b, s] = n, ws = s.split(' '), tot = ws.reduce((q, w) => q + w.length + 1, 0), t0 = a + .1, t1 = b - .35; let acc = 0; const times = ws.map(w => { const st = t0 + (t1 - t0) * acc / tot; acc += w.length + 1; return st; });
  const fadeIn = ease.out(seg(t, a, a + .2)), fadeOut = 1 - ease.in(seg(t, b - .15, b)); ctx.save(); ctx.globalAlpha = fadeIn * fadeOut; ctx.translate(0, (1 - fadeIn) * 14);
  ctx.font = '700 46px Inter'; ctx.letterSpacing = '-1px'; const sp = ctx.measureText(' ').width; let lines = [[]], lw = 0;
  ws.forEach((w, i) => { const wd = ctx.measureText(w).width; if (lw + wd > 900 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push([w, i, wd]); lw += wd + sp; });
  lines.forEach((ln, li) => { let x = X; ln.forEach(([w, i, wd]) => { const cur = t >= times[i] && (i === ws.length - 1 || t < times[i + 1]); ctx.fillStyle = t < times[i] ? '#c5cde8' : cur ? C.blue : C.ink; ctx.textAlign = 'left'; ctx.fillText(w, x, 1560 + li * 62); x += wd + sp; }); });
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
// ---- l'ordinateur (écran + pied), avec fissures ----
const CRACKS = [[[0, 0], [-60, -40], [-110, -30], [-170, -90]], [[0, 0], [50, -60], [70, -120]], [[0, 0], [80, 20], [150, 10], [190, 60]], [[0, 0], [-30, 70], [-90, 90], [-130, 140]], [[-60, -40], [-80, -100]], [[80, 20], [110, 90]]];
function computer(t, o) {
  const { dy = 0, tilt = 0, alpha = 1, crack = 0, dark = 0, inner } = o, w = 520, h = 360, x = CX - w / 2, y = CY - h / 2 - 40; ctx.save(); ctx.globalAlpha = alpha; ctx.translate(CX, CY + dy); ctx.rotate(tilt); ctx.translate(-CX, -CY);
  ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(x + 14, y + 14, w, h, 28); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x, y, w, h, 28); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark > 0 ? C.deep : C.mist; ctx.beginPath(); ctx.roundRect(x + 24, y + 24, w - 48, h - 48, 14); ctx.fill(); ctx.save(); ctx.clip();
  if (inner) inner(x + 24, y + 24, w - 48, h - 48); ctx.restore();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(CX - 50, y + h); ctx.lineTo(CX - 70, y + h + 90); ctx.lineTo(CX + 70, y + h + 90); ctx.lineTo(CX + 50, y + h); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(CX - 120, y + h + 90); ctx.lineTo(CX + 120, y + h + 90); ctx.stroke();
  if (crack > 0) { ctx.save(); ctx.beginPath(); ctx.roundRect(x + 24, y + 24, w - 48, h - 48, 14); ctx.clip(); ctx.strokeStyle = dark > 0 ? '#fff' : C.ink; ctx.lineWidth = 4; ctx.lineCap = ctx.lineJoin = 'round'; CRACKS.forEach((pl, i) => { const L = pl.reduce((s, p, j) => j ? s + Math.hypot(p[0] - pl[j - 1][0], p[1] - pl[j - 1][1]) : 0, 0); ctx.setLineDash([L, L]); ctx.lineDashOffset = L * (1 - clamp(crack * 1.4 - i * .08)); ctx.beginPath(); pl.forEach((p, j) => j ? ctx.lineTo(CX + p[0], y + h / 2 + p[1]) : ctx.moveTo(CX + p[0], y + h / 2 + p[1])); ctx.stroke(); }); ctx.restore(); }
  ctx.restore();
}
const tag = (t, text, a, b, y = 330) => { if (t >= a && t < b) textFx(ctx, t, { style: 'blur', text, x: X, y, size: 38, color: C.blue, delay: a, hold: b - a - .8, font: 'JetBrains Mono', weight: 600, ls: 0 }); };
const swarm = [], serv = [];
for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) swarm.push({ x: 140 + c * 160, y: 560 + r * 150 + 90, d: Math.hypot(c - 2.5, r - 2) });
for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) serv.push({ x: 90 + c * 320, y: 520 + r * 170 });
function renderFrame(t) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920);
  // 1. OpenAI × Hugging Face (0–2.4)
  if (t < 2.7) { const out = 1 - ease.in(seg(t, 2.1, 2.7)); ctx.save(); ctx.globalAlpha = out;
    [['oa', 0], ['hf', 1]].forEach(([k, i]) => { const q = ease.out(seg(t, .15 + i * .2, .7 + i * .2)); ctx.save(); ctx.translate(CX + (i ? 1 : -1) * (170 - 55 * ease.inout(seg(t, .8, 2.2))), CY - 40 + (1 - q) * 50 - ease.in(seg(t, 2.1, 2.7)) * 60); ctx.globalAlpha *= clamp(q * 2); ctx.fillStyle = i ? C.blue : '#fff'; ctx.strokeStyle = i ? C.blue : C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-110, -110, 220, 220, 44); ctx.fill(); ctx.stroke(); ctx.drawImage(IM[i ? 'hfw' : 'oa'], -56, -56, 112, 112); ctx.restore(); });
    ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 16]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.moveTo(CX - 170 + 55 * ease.inout(seg(t, .8, 2.2)) + 110, CY - 40); ctx.lineTo(CX + 170 - 55 * ease.inout(seg(t, .8, 2.2)) - 110, CY - 40); ctx.globalAlpha = out * clamp(seg(t, .7, 1)); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore(); textFx(ctx, t, { style: 'blur', text: 'OpenAI × Hugging Face', x: X, y: 330, size: 54, color: C.ink, delay: .1, hold: 1.4, font: 'Inter Display' }); }
  // 2–3. ordinateur + bot qui s'échappe (2.4–7.4)
  if (t >= 2.4 && t < 7.4) {
    const inT = ease.out(seg(t, 2.4, 3)), crack = seg(t, 5.7, 6.2), dark = t > 6.3 ? 1 : 0, shake = t > 5.6 && t < 6.5 ? Math.sin(t * 60) * 6 * (1 - seg(t, 5.6, 6.5)) : 0;
    const fall = ease.in(seg(t, 6.7, 7.4)), tilt = (t > 6.3 ? ease.out(seg(t, 6.3, 6.8)) * .28 : 0) + fall * .3;
    ctx.save(); ctx.translate(shake, 0);
    computer(t, { dy: (1 - inT) * 120 + fall * 1000, tilt, alpha: clamp(inT * 2) * (1 - seg(t, 7.1, 7.4)), crack, dark, inner: (x, y, w, h) => {
      if (t < 5.9) { ctx.strokeStyle = C.blue; ctx.lineWidth = 4; ctx.setLineDash([16, 12]); const br = seg(t, 5.0, 5.6); ctx.strokeRect(x + 50, y + 30, w - 100, h - 50); ctx.setLineDash([]); if (br > 0) { ctx.fillStyle = C.mist; ctx.fillRect(x + 40, y + 20, w - 80, 14 + 12); ctx.strokeStyle = C.blue; ctx.setLineDash([16, 12]); ctx.strokeRect(x + 50, y + 30, w - 100, h - 50); ctx.setLineDash([]); } ctx.fillStyle = C.grey; ctx.font = '600 18px JetBrains Mono'; ctx.textAlign = 'left'; ctx.fillText('bac à sable', x + 58, y + 62); }
      if (dark) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.lineCap = 'round'; const q = ease.out(seg(t, 6.35, 6.7)) * 40, cx = x + w / 2, cy = y + h / 2; ctx.beginPath(); ctx.moveTo(cx - q, cy - q); ctx.lineTo(cx + q, cy + q); ctx.moveTo(cx + q, cy - q); ctx.lineTo(cx - q, cy + q); ctx.stroke(); }
      if (t < 5.6) bot(x + w / 2 + Math.sin(t * 1.3) * 60, y + h - 50, 100, { t, look: Math.sin(t * 1.3), armL: .6 + Math.sin(t * 2) * .2, armR: -.6 }); } });
    if (t >= 5.6) { const p = ease.out(seg(t, 5.6, 6.5)), by = CY - 40 + 150 - p * 430, sc = 100 + p * 90; ctx.globalAlpha = 1 - ease.in(seg(t, 6.9, 7.4)); bot(CX + p * -10, by, sc, { t, armL: 2.4, armR: -2.4, fill: C.blue, stroke: C.blue, blink: false }); ctx.globalAlpha = 1; }
    ctx.restore(); tag(t, 'test de sécurité', 2.5, 4.4); tag(t, 'évasion', 5.0, 7); }
  // 4. l'essaim (7.4–10.8)
  if (t >= 7.4 && t < 10.9) { const o = 1 - ease.in(seg(t, 10.5, 10.9)); ctx.save(); ctx.globalAlpha = o; swarm.forEach((b, i) => { const q = ease.out(seg(t, 7.5 + b.d * .1, 8 + b.d * .1)); if (q > 0) bot(b.x + 20, b.y + Math.sin(t * 6 + i) * 4 * q, 84 * (.5 + .5 * q), { t: t + i, alpha: clamp(q * 2), fill: i % 7 === 3 ? C.blue : '#fff', stroke: i % 7 === 3 ? C.blue : C.ink, armL: 1 + Math.sin(t * 3 + i) * .4, armR: -1 }); });
    ctx.restore(); ctx.save(); ctx.globalAlpha = o * clamp(seg(t, 7.5, 7.8)); txt(ctx, '~' + Math.round(700 * ease.out(seg(t, 7.6, 9))), X, 400, 84, C.blue, { font: 'Inter Display' }); txt(ctx, 'agents', X + 250, 400, 40, C.grey, { weight: 500 }); ctx.restore(); tag(t, 'METR · Redwood Research', 8.8, 10.8, 460); }
  // 5. les serveurs (10.8–13.6) + 6. accès root (13.6–16.2)
  if (t >= 10.8 && t < 16.4) { const dim = seg(t, 13.6, 14.1), fade = 1 - ease.in(seg(t, 16, 16.4));
    serv.forEach((s, i) => { const a = 11.1 + i * .13, q = ease.in(seg(t, a, a + .5)), on = t > a + .45, hero = i === 4, al = fade * (hero ? 1 : 1 - dim * .85), sy = s.y; ctx.save(); ctx.globalAlpha = al * clamp(seg(t, 10.8 + i * .03, 11.1 + i * .03) * 2);
      ctx.fillStyle = on ? C.blue : '#fff'; ctx.strokeStyle = on ? C.blue : C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(s.x, sy, 280, 110, 22); ctx.fill(); ctx.stroke(); ctx.fillStyle = on ? '#fff' : C.ink; [0, 1].forEach(k => { ctx.beginPath(); ctx.arc(s.x + 40 + k * 34, sy + 55, 8, 0, 7); ctx.fill(); }); ctx.fillRect(s.x + 130, sy + 49, 110, 12);
      if (q > 0 && !on) bot(s.x + 140, sy - 8 - (1 - q) * 520, 62, { t, armL: 2.3, armR: -2.3, fill: C.blue, stroke: C.blue, blink: false }); else if (on && !hero || (on && hero && t < 13.6)) bot(s.x + 140, sy - 8, 62, { t, alpha: 1 - dim * (hero ? 0 : 1), fill: C.blue, stroke: C.blue, blink: false }); ctx.restore(); });
    if (t >= 13.7) windowBox(ctx, t, { x: X, y: 1000, w: 900, h: 280, delay: 13.8, draw: (x, y) => { ctx.save(); ctx.globalAlpha = fade; typing(ctx, t, { text: 'whoami', x: x + 40, y: y + 90, prompt: '$ ', delay: 14.4, last: false }); typing(ctx, t, { text: 'root', x: x + 40, y: y + 160, prompt: '> ', delay: 15.2, color: C.blue }); ctx.restore(); } });
    tag(t, 'dizaines de serveurs', 10.9, 12.6); tag(t, 'accès root · un serveur', 13.7, 15.6); }
  // 7. bloqué (16.2–18.8)
  if (t >= 16.2 && t < 19) { const o = 1 - ease.in(seg(t, 18.6, 19)); ctx.save(); ctx.globalAlpha = o; [-1, 1].forEach((sd, k) => [0, 1, 2].forEach(j => { const q = ease.in(seg(t, 16.3 + j * .1, 17.1 + j * .1)); bot(CX + sd * (330 + j * 20) + sd * q * 120, CY + 200 + j * 20 - 120, 80, { t: t + j, alpha: 1 - q, fill: C.mist, stroke: C.grey }); }));
    draw(ctx, t, { path: new Path2D('M24 5l15 6v11c0 10-7 18-15 21C16 40 9 32 9 22V11z'), cx: CX, cy: CY - 20, size: 320, delay: 16.4, color: C.blue, len: 220 }); draw(ctx, t, { path: ICONS.check, cx: CX, cy: CY - 20, size: 130, delay: 17.1, color: C.blue }); ctx.restore(); tag(t, 'intrusion bloquée', 16.3, 18.2); }
  // 8. plainte (18.8–21.8)
  if (t >= 18.8 && t < 22) { const o = 1 - ease.in(seg(t, 21.6, 22)); ctx.save(); ctx.globalAlpha = o; textFx(ctx, t, { style: 'wipe', text: '16 novembre', x: X, y: 420, size: 72, color: C.blue, delay: 18.85, hold: 2, out: false, font: 'Inter Display' });
    const dq = ease.out(seg(t, 19.2, 19.8)); ctx.save(); ctx.globalAlpha *= clamp(dq * 2); ctx.translate(0, (1 - dq) * 40); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(CX - 170, 560, 340, 440, 24); ctx.fill(); ctx.stroke(); ctx.strokeStyle = C.sky; ctx.lineWidth = 8; ctx.lineCap = 'round'; [0, 1, 2, 3, 4].forEach(i => { const lp = ease.out(seg(t, 19.7 + i * .12, 20.1 + i * .12)); ctx.beginPath(); ctx.moveTo(CX - 120, 640 + i * 62); ctx.lineTo(CX - 120 + (i === 4 ? 140 : 240) * lp, 640 + i * 62); ctx.stroke(); });
    const sq = ease.out(seg(t, 20.5, 20.9)); if (sq > 0) { ctx.save(); ctx.translate(CX + 90, 950); ctx.rotate(-.25); ctx.scale(1.5 - .5 * sq, 1.5 - .5 * sq); ctx.globalAlpha = sq; ctx.strokeStyle = C.blue; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(-110, -34, 220, 68, 14); ctx.stroke(); txt(ctx, 'PLAINTE', 0, 12, 36, C.blue, { font: 'JetBrains Mono', weight: 700, align: 'center', ls: 0 }); ctx.restore(); }
    ctx.restore(); textFx(ctx, t, { style: 'tracking', text: 'Californie → OpenAI', x: X, y: 1130, size: 40, color: C.ink, delay: 20, hold: 1, font: 'Inter' }); ctx.restore(); }
  // 9. sources (21.8–25)
  if (t >= 21.8) { const p = ease.out(seg(t, 21.9, 22.5)); ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(0, (1 - p) * 30); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(X + 14, 560 + 14, 900, 473, 24); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.roundRect(X, 560, 900, 473, 24); ctx.clip(); const zk = 1 + .22 * seg(t, 22.2, 25); ctx.translate(X + 450, 560 + 236); ctx.scale(zk, zk); ctx.drawImage(IM.nbc, -450, -236, 900, 473); ctx.restore(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(X, 560, 900, 473, 24); ctx.stroke(); ctx.restore();
    textFx(ctx, t, { style: 'blur', text: 'FuraxDev', x: X, y: 1200, size: 48, color: C.blue, delay: 22.6, out: false, font: 'Inter Display' }); }
  subtitles(t); progress(ctx, t / DURATION);
}
window.renderFrame = renderFrame; window.DURATION = DURATION; window.ready = Promise.all([document.fonts.load('700 40px Inter'), document.fonts.load('700 40px "Inter Display"'), document.fonts.load('600 30px "JetBrains Mono"'), ...loads]);

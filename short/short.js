// Short YouTube 9:16 — style "cahier + personnage qui réagit + gros sous-titres".
// Tout est fonction du temps t (s).
const W = 1080, H = 1920, DURATION = 28;
const CHANNEL = '@FuraxDev';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const C = { ink: '#1a1a1a', orange: '#d97757', darkOr: '#7a3b22', red: '#e11d48', yellow: '#facc15', green: '#4ec97a' };
const F = { kalam: 'Kalam', mont: 'Montserrat', code: '"Fira Code"', marker: '"Permanent Marker"' };

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const life = (t, a, b, f = .25) => Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b));
const typed = (s, t, a, cps) => s.slice(0, Math.floor(clamp((t - a) * cps, 0, s.length)));
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function text(s, x, y, size, color, font, align = 'center', weight = 400) {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}

// ---------- Papier cahier (généré une seule fois) ----------
const paper = document.createElement('canvas'); paper.width = W; paper.height = H;
(function () {
  const p = paper.getContext('2d'); let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const g = p.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#efe7d4'); g.addColorStop(1, '#e2d8c0'); p.fillStyle = g; p.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { p.fillStyle = r() > .5 ? 'rgba(255,255,255,.07)' : 'rgba(90,70,40,.05)'; p.fillRect(r() * W, r() * H, 2 + r() * 3, 2 + r() * 3); }
  for (let i = 0; i < 60; i++) { p.strokeStyle = r() > .5 ? 'rgba(255,255,255,.14)' : 'rgba(90,70,40,.08)'; p.lineWidth = 1 + r() * 2;
    p.beginPath(); const x = r() * W, y = r() * H; p.moveTo(x, y); p.lineTo(x + (r() - .5) * 500, y + (r() - .5) * 500); p.stroke(); }
  p.strokeStyle = 'rgba(86,120,190,.5)'; p.lineWidth = 3;
  for (let y = 200; y < H; y += 66) { p.beginPath(); p.moveTo(0, y); p.lineTo(W, y); p.stroke(); }
  p.strokeStyle = 'rgba(224,90,90,.7)'; p.lineWidth = 4; p.beginPath(); p.moveTo(110, 0); p.lineTo(110, H); p.stroke();
})();

// ---------- Gribouillis au stylo ----------
function doodles(t) {
  ctx.save(); ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.save(); ctx.translate(70, 120); ctx.rotate(Math.sin(t * 1.5) * .06); ctx.beginPath(); // étoile
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 36 : 82; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(930 + Math.sin(t * 2) * 8, 130); ctx.rotate(-.2); ctx.beginPath(); // avion en papier
  ctx.moveTo(-70, 10); ctx.lineTo(80, -50); ctx.lineTo(20, 60); ctx.lineTo(0, 15); ctx.closePath(); ctx.moveTo(-70, 10); ctx.lineTo(0, 15); ctx.lineTo(80, -50); ctx.stroke(); ctx.restore();
  ctx.setLineDash([10, 14]); ctx.beginPath(); ctx.moveTo(760, 250); ctx.bezierCurveTo(840, 150, 700, 120, 790, 60); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); for (let i = 0; i < 90; i++) { const a = i * .22, r = 4 + i * .5; ctx[i ? 'lineTo' : 'moveTo'](70 + Math.cos(a) * r, 1790 + Math.sin(a) * r); } ctx.stroke(); // spirale
  ctx.beginPath(); ctx.moveTo(960, 1840); ctx.lineTo(1030, 1840); ctx.lineTo(995, 1780); ctx.closePath(); ctx.stroke(); // triangle
  ctx.restore();
}

// ---------- Autocollants colorés ----------
function sticker(s, cx, cy, w, h, color, rot, t, t0, size = 58, img = null) {
  const k = back(seg(t, t0, t0 + .25)); if (k <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot * Math.PI / 180); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(26,26,26,.9)'; rrect(-w / 2 + 9, -h / 2 + 11, w, h, 24); ctx.fill();
  rrect(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
  const pad = img ? 130 : 50; ctx.font = `700 ${size}px ${F.kalam}`;
  const fit = Math.min(1, (w - pad - 40) / ctx.measureText(s).width);
  if (img && logoImg.complete) ctx.drawImage(logoImg, -w / 2 + 25, -h / 2 + (h - 100) / 2, 100, 100);
  text(s, img ? 50 : 0, 4, size * fit, C.ink, F.kalam, 'center', 700); ctx.restore();
}

// ---------- Logo Claude ----------
const logoImg = new Image(); logoImg.src = window.CLAUDE_LOGO;

// ---------- Personnage : mascotte Claude en pixel art (grille de 20 px, version mignonne) ----------
function mascot(t, pose, t0) {
  const U = 20, k = Math.round(back(seg(t, t0, t0 + .3)) * 8) / 8, bob = Math.round(Math.sin(t * 6) * .6) * U / 2;
  const OUT = '#6b3220', OR = '#d97757', LT = '#ea9a7c', DK = '#bd6342', BK = '#1b1411', WH = '#ffffff', PK = '#f2a58b';
  const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x * U, y * U, w * U, h * U); };
  const limb = (x1, y1, x2, y2) => { const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)), pts = [];
    for (let i = 0; i <= n; i++) pts.push([Math.round(x1 + (x2 - x1) * i / n), Math.round(y1 + (y2 - y1) * i / n)]);
    pts.forEach(([x, y]) => px(x - 1, y - 1, 3, 3, OUT)); pts.forEach(([x, y]) => px(x, y, 1, 1, OR)); };
  ctx.save(); ctx.translate(W / 2, 1800 + bob); ctx.scale(k, k);
  ctx.globalAlpha *= .2; px(-10, 0, 20, 1, '#000'); ctx.globalAlpha /= .2; // ombre
  [-7, -3, 2, 6].forEach(x => { px(x - 1, -4, 4, 4, OUT); px(x, -4, 2, 3, OR); }); // 4 petites pattes
  px(-10, -16, 20, 13, OUT); px(-9, -15, 18, 11, OR); px(-9, -15, 18, 1, LT); px(-9, -5, 18, 1, DK); // corps
  const blink = (t % 3.3) < .12, lx = Math.round(Math.sin(t * 2) * .5), shock = pose === 'head', happy = pose === 'point' || pose === 'wave';
  [-5, 3].forEach(x => { if (blink || happy) { // yeux fermés ou contents : petite arche
      if (blink) px(x, -11, 2, 1, BK); else { px(x, -11, 1, 1, BK); px(x + 1, -12, 1, 1, BK); px(x + 2, -11, 1, 1, BK); }
    } else { const h = shock ? 4 : 3; px(x + lx, -13, 2, h, BK); px(x + lx, -13, 1, 1, WH); } });
  px(-8, -8, 2, 1, PK); px(6, -8, 2, 1, PK); // joues
  if (pose === 'head') px(-1, -8, 2, 2, BK);
  else if (happy) { px(-2, -8, 1, 1, BK); px(-1, -7, 2, 1, BK); px(1, -8, 1, 1, BK); }
  else if (pose !== 'cross') px(-1, -7, 2, 1, BK);
  if (pose === 'cross') { limb(10, -8, -3, -6); limb(-10, -8, 3, -7); }
  else if (shock) { limb(-10, -9, -9, -19); limb(10, -9, 9, -19); }
  else if (pose === 'point') { limb(10, -9, 19, -15); limb(-10, -9, -12, -4); }
  else { const wv = Math.round(Math.sin(t * 12) * 2); limb(10, -9, 14 + wv, -20); limb(-10, -9, -12, -4); }
  ctx.restore();
}

// ---------- Gros sous-titres mot par mot (*mot = en jaune) ----------
const SUBS = [
  [.2, 3.4, 'TU PAIES *200$ PAR MOIS POUR UNE IA ?'],
  [3.8, 7.8, 'CHATGPT, MIDJOURNEY, SORA... *280$ PAR MOIS !'],
  [8.2, 13.3, 'SAUF QUE *CLAUDE *CODE FAIT TOUT : IL CODE, IL DÉBUG, IL DÉPLOIE'],
  [13.6, 19.5, 'LA PREUVE ? CETTE VIDÉO EST CODÉE PAR *CLAUDE *CODE'],
  [19.8, 24.3, 'LES IA À 200$ PAR MOIS ? *INUTILES.'],
  [24.6, 27.8, 'ABONNE-TOI POUR LA *SUITE !'],
];
function subtitles(t) {
  const sub = SUBS.find(([a, b]) => t >= a && t < b); if (!sub) return;
  const [a, b, str] = sub, words = str.split(' '), n = words.length, wd = (b - a - .3) / n;
  const i = Math.min(n - 1, Math.floor((t - a) / wd)), g = Math.floor(i / 3), grp = words.slice(g * 3, g * 3 + 3);
  const size = 92; ctx.font = `800 ${size}px ${F.mont}`;
  const ws = grp.map(w => ctx.measureText(w.replace('*', '')).width), gap = 26, total = ws.reduce((x, y) => x + y, 0) + gap * (grp.length - 1);
  let x = W / 2 - total / 2;
  grp.forEach((w, j) => { const idx = g * 3 + j, k = idx <= i ? back(seg(t, a + idx * wd, a + idx * wd + .15)) : 0, hl = w.startsWith('*'), s = w.replace('*', '');
    if (k > 0) { ctx.save(); ctx.translate(x + ws[j] / 2, 1245); ctx.scale(k, k); ctx.font = `800 ${size}px ${F.mont}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = 20; ctx.strokeStyle = C.ink; ctx.strokeText(s, 0, 0); ctx.fillStyle = hl ? C.yellow : '#fff'; ctx.fillText(s, 0, 0); ctx.restore(); }
    x += ws[j] + gap; });
}

// ---------- Texte manuscrit en haut ----------
function heading(s, t, a, b) {
  const k = easeOut(seg(t, a, a + .3)) * (1 - seg(t, b - .2, b)); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; text(s, W / 2, 310 + (1 - k) * 20, 76, C.ink, F.kalam, 'center', 700); ctx.restore();
}

// ---------- Terminal Claude Code (interface réelle : en-tête, ●/⎿, spinner, champ de saisie) ----------
function terminal(t) {
  const k = back(seg(t, 13.6, 14.1)); if (k <= 0) return;
  const x = 40, y = 390, w = 1000, h = 780, fs = 26, lh = 40;
  const K = { bg: '#1a1816', txt: '#e8e3dc', gray: '#8a847b', dim: '#5c5750', or: '#d77757', grn: '#4ec97a', add: '#12351f', sel: '#34312e' };
  ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-W / 2, -(y + h / 2));
  ctx.fillStyle = 'rgba(26,26,26,.9)'; rrect(x + 9, y + 11, w, h, 26); ctx.fill();
  rrect(x, y, w, h, 26); ctx.fillStyle = K.bg; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
  [C.red, '#f59e0b', C.green].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 44 + i * 36, y + 38, 11, 0, 7); ctx.fill(); });
  text('claude — ~/pub-video', x + w / 2, y + 38, 22, K.gray, F.code, 'center');
  const T = (s, px, py, col = K.txt, wt = 400, size = fs) => text(s, px, py, size, col, F.code, 'left', wt);
  const X = x + 34, cur = Math.floor(t * 3) % 2 ? ' ' : '█';
  // En-tête : mascotte en blocs + version / modèle / dossier
  ctx.fillStyle = K.or; ctx.fillRect(X + 12, y + 86, 96, 28); ctx.fillRect(X, y + 114, 120, 28); ctx.fillRect(X + 24, y + 142, 12, 14); ctx.fillRect(X + 40, y + 142, 12, 14); ctx.fillRect(X + 68, y + 142, 12, 14); ctx.fillRect(X + 84, y + 142, 12, 14);
  ctx.fillStyle = K.bg; ctx.fillRect(X + 34, y + 92, 12, 18); ctx.fillRect(X + 74, y + 92, 12, 18); // yeux (creux)
  T('Claude Code v2.1', X + 160, y + 105, K.txt, 700, 24); T('Opus 5.5 · Claude Max', X + 160, y + 139, K.gray, 400, 24); T('~/pub-video', X + 160, y + 173, K.gray, 400, 24);
  // Message de l'utilisateur
  const msg = 'Fais-moi une pub vidéo pour mon produit', sent = t >= 16.7;
  if (sent) { ctx.fillStyle = K.sel; rrect(X - 14, y + 218, w - 40, 46, 6); ctx.fill(); T('> ' + msg, X, y + 242); }
  // Spinner pendant la réflexion
  if (t >= 17 && t < 17.4) T('✻ Cogitating… (esc to interrupt)', X, y + 312, K.or);
  // Appels d'outils : ● Outil(arg) / ⎿ résultat
  const tools = [
    [17.4, 'Write(video.js)', 'Wrote 312 lines to video.js', 312, ['+ const W = 1080, H = 1920;', '+ function renderFrame(t) {']],
    [18.1, 'Bash(node render.js)', 'video.mp4 rendu ✓', 500, []],
  ];
  tools.forEach(([t0, name, res, py, diff]) => { const q = seg(t, t0, t0 + .15); if (q <= 0) return; ctx.save(); ctx.globalAlpha *= q;
    T('●', X, y + py, K.grn); T(name, X + 40, y + py, K.txt, 700);
    if (t > t0 + .3) { T('⎿', X + 20, y + py + lh, K.gray); T(res, X + 70, y + py + lh, K.gray); }
    if (t > t0 + .5) diff.forEach((d, i) => { ctx.fillStyle = K.add; ctx.fillRect(X + 70, y + py + 82 + i * 38, w - 150, 36); T(d, X + 84, y + py + 100 + i * 38, K.grn, 400, 22); });
    ctx.restore(); });
  if (t >= 18.8) { const q = seg(t, 18.8, 18.95); ctx.save(); ctx.globalAlpha *= q; T('●', X, y + 600, K.or); T('Ta pub est prête ! 🎬', X + 40, y + 600, K.txt); ctx.restore(); }
  // Champ de saisie : deux traits + « > » + aide
  const iy = y + 630; ctx.strokeStyle = K.dim; ctx.lineWidth = 2;
  [iy, iy + 64].forEach(ly => { ctx.beginPath(); ctx.moveTo(x + 20, ly); ctx.lineTo(x + w - 20, ly); ctx.stroke(); });
  T('> ' + (t < 16.7 ? typed(msg, t, 15.1, 24) + cur : cur), X, iy + 34);
  T('? for shortcuts', X, iy + 100, K.gray, 400, 22);
  ctx.restore();
}

function renderFrame(t) {
  ctx.drawImage(paper, 0, 0); doodles(t);
  const scene = t < 3.6 ? 0 : t < 8 ? 1 : t < 13.4 ? 2 : t < 19.6 ? 3 : t < 24.4 ? 4 : 5;
  const A = [[0, 3.6], [3.6, 8], [8, 13.4], [13.4, 19.6], [19.6, 24.4], [24.4, 28]];
  const TOPS = ["attends, t'as vu ça ?", "et c'est pas fini…", 'sauf que… 👀', 'la preuve ?', 'donc franchement…', 'la suite arrive 👇'];
  heading(TOPS[scene], t, A[scene][0] + .05, A[scene][1]);
  const grp = (a, b, fn) => { if (t < a || t >= b) return; ctx.save(); ctx.globalAlpha = a === 0 ? 1 - seg(t, b - .2, b) : life(t, a, b, .2); fn(); ctx.restore(); };
  grp(0, 3.6, () => {
    sticker('💸 200$/mois pour UNE IA', W / 2, 640, 880, 170, '#fca5a5', -3, t, .4, 56);
    if (t > 2) { const k = back(seg(t, 2, 2.4)); ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(Math.sin(t * 8) * .08); ctx.scale(k, k); text('🤨', 0, 0, 230, '#000', F.kalam); ctx.restore(); }
  });
  grp(3.6, 8, () => {
    [['ChatGPT Pro · 200$/mois', 4.2, -3, 520], ['Midjourney · 60$/mois', 4.9, 2, 690], ['Sora · 20$/mois', 5.6, -2, 860]].forEach(([s, t0, r, y]) => sticker(s, W / 2, y, 860, 140, '#fca5a5', r, t, t0, 54));
    sticker('= 280$ par mois 💸', W / 2, 1040, 760, 150, '#fde68a', 2, t, 6.8, 62);
  });
  grp(8, 13.4, () => {
    sticker('Claude Code', W / 2, 520, 860, 170, '#86efac', -2, t, 9.0, 70, true);
    sticker('⌨️ Il code', W / 2, 720, 600, 120, '#93c5fd', 2, t, 11.3, 56); sticker('🐞 Il débug', W / 2, 870, 600, 120, '#fde68a', -2, t, 12.0, 56); sticker('🚀 Il déploie', W / 2, 1020, 600, 120, '#fca5a5', 2, t, 12.7, 56);
  });
  terminal4(t);
  // 5
  if (t >= 19.6 && t < 24.4) { ctx.save(); ctx.globalAlpha = life(t, 19.6, 24.4, .25);
    sticker('280$ / mois 💸', W / 2, 600, 780, 160, '#fca5a5', -2, t, 20.0, 66);
    const s = easeOut(seg(t, 20.8, 21.5)); if (s > 0) { ctx.save(); ctx.translate(W / 2, 600); ctx.rotate(-2 * Math.PI / 180); ctx.strokeStyle = C.red; ctx.lineWidth = 22; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-420, 20); ctx.lineTo(-420 + 840 * s, -20); ctx.stroke(); ctx.restore(); }
    const k = back(seg(t, 21.8, 22.1)); if (k > 0) { ctx.save(); ctx.translate(W / 2, 880); ctx.rotate(-.08); ctx.scale(k, k); ctx.font = `400 190px ${F.marker}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = 22; ctx.strokeStyle = C.ink; ctx.strokeText('INUTILES.', 0, 0); ctx.fillStyle = C.red; ctx.fillText('INUTILES.', 0, 0); ctx.restore(); }
    ctx.restore(); }
  // 6
  if (t >= 24.4) { ctx.save(); ctx.globalAlpha = 1 - seg(t, 27.6, 28);
    sticker('🔔 Abonne-toi', W / 2, 560, 800, 170, '#fde68a', -2, t, 24.7, 74);
    sticker(CHANNEL, W / 2, 780, 640, 140, '#fca5a5', 2, t, 25.0, 72); ctx.restore(); }
  const pose = ['cross', 'head', 'point', 'head', 'cross', 'wave'][scene];
  ctx.save(); ctx.globalAlpha = 1 - seg(t, 27.6, 28); mascot(t, pose, A[scene][0]); ctx.restore();
  subtitles(t);
  ctx.fillStyle = C.orange; ctx.fillRect(0, 0, W * t / DURATION, 8);
}
function terminal4(t) { if (t >= 13.6 && t < 19.6) { ctx.save(); ctx.globalAlpha = life(t, 13.6, 19.6, .25); terminal(t); ctx.restore(); } }
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all(Object.values(F).map(f => document.fonts.load(`40px ${f}`))).then(() => logoImg.decode());

if (!location.search.includes('render')) {
  const hud = document.getElementById('hud'); let t0 = null;
  document.body.onclick = () => { t0 = performance.now(); };
  window.ready.then(() => (function loop(now) {
    if (t0 === null) t0 = now; const t = ((now - t0) / 1000) % DURATION;
    renderFrame(t); hud.textContent = `${t.toFixed(2)}s — clic pour relancer`; requestAnimationFrame(loop);
  })(performance.now()));
}

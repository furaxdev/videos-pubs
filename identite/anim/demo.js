// Démo : 10 animations de 2 s, chacune annoncée en bas (police mono grise). Rendu silencieux 1080×1920.
const cv = document.getElementById('c'), ctx = cv.getContext('2d'), SCENE = 2, N = 10, DURATION = SCENE * N;
const names = ['rise · texte qui monte', 'words · mot par mot', 'underline · surlignage', 'strike · barré + remplacement', 'window · fenêtre + ombre', 'typing · machine à écrire', 'draw · icône tracée', 'tiles · tuiles en cascade', 'counter · compteur', 'wipe · transition'];
const S = [
  t => { rise(ctx, t, { text: 'salut, c\'est', x: 90, y: 900, size: 44, color: C.grey, weight: 500 }); rise(ctx, t, { text: 'FuraxDev', x: 90, y: 990, size: 84, color: C.blue, delay: .12, font: 'Inter Display' }); },
  t => words(ctx, t, { text: 'tu décris ton idée à Claude Code', x: 90, y: 960, size: 58, hl: ['Claude', 'Code'] }),
  t => { rise(ctx, t, { text: 'une vidéo codée', x: 90, y: 960, size: 72 }); underline(ctx, t, { x: 90 + width(ctx, 'une vidéo ', 72), y: 985, w: width(ctx, 'codée', 72), delay: .5 }); },
  t => { const w = width(ctx, '200 $ / mois', 72); rise(ctx, t, { text: '200 $ / mois', x: 90, y: 900, size: 72, color: t > .9 ? C.grey : C.ink }); strike(ctx, t, { x: 90, y: 900, w, size: 72, delay: .8 }); rise(ctx, t, { text: 'gratuit', x: 90, y: 1010, size: 72, color: C.blue, delay: 1.2 }); },
  t => windowBox(ctx, t, { x: 90, y: 780, w: 860, h: 320, draw: (x, y) => txt(ctx, '$ claude', x + 40, y + 90, 34, C.blue, { font: 'JetBrains Mono', weight: 600, ls: 0 }) }),
  t => windowBox(ctx, t, { x: 90, y: 780, w: 860, h: 320, draw: (x, y) => { typing(ctx, t, { text: 'claude', x: x + 40, y: y + 90, prompt: '$ ', delay: .5, last: false }); typing(ctx, t, { text: 'fais-moi une vidéo', x: x + 40, y: y + 160, prompt: '> ', delay: .9 }); } }),
  t => ['code', 'check', 'rocket'].forEach((k, i) => draw(ctx, t, { path: ICONS[k], cx: 240 + i * 300, cy: 960, size: 150, delay: i * .25, color: i === 1 ? C.blue : C.ink })),
  t => ['code', 'check', 'rocket', 'play', 'clock'].forEach((k, i) => tile(ctx, t, { x: 70 + (i % 3) * 330, y: 720 + Math.floor(i / 3) * 330, s: 300, i, fill: i === 1 || i === 3, inner: (cx, cy, f) => { ctx.save(); ctx.translate(cx - 60, cy - 60); ctx.scale(2.5, 2.5); ctx.strokeStyle = f ? '#fff' : C.ink; ctx.lineWidth = 3.4; ctx.lineCap = ctx.lineJoin = 'round'; ctx.stroke(ICONS[k]); ctx.restore(); } })),
  t => { rise(ctx, t, { text: 'quelques', x: 90, y: 900, size: 44, color: C.grey, weight: 500 }); counter(ctx, t, { to: 200, x: 90, y: 1010, size: 110, suffix: ' $', delay: .2 }); },
  t => { rise(ctx, t, { text: 'scène suivante', x: 90, y: 960, size: 64, color: C.ink }); wipe(ctx, t, { delay: .8 }); if (t > 1.2) { ctx.fillStyle = C.deep; ctx.fillRect(0, 0, 1080, 1920); rise(ctx, t, { text: 'et on enchaîne', x: 90, y: 960, size: 64, color: '#fff', delay: 1.3 }); } },
];
function renderFrame(t) { const i = Math.min(N - 1, Math.floor(t / SCENE)), lt = t - i * SCENE; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920); S[i](lt); txt(ctx, String(i + 1).padStart(2, '0') + ' · ' + names[i], 90, 1800, 26, C.grey, { font: 'JetBrains Mono', weight: 500, ls: 0 }); progress(ctx, t / DURATION); }
window.renderFrame = renderFrame; window.DURATION = DURATION; window.ready = Promise.all([document.fonts.load('700 40px Inter'), document.fonts.load('700 40px "Inter Display"'), document.fonts.load('600 30px "JetBrains Mono"')]);

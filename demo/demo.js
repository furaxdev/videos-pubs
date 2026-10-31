// Short 9:16 "Tout est fait en code" — chaque animation est déclenchée par un mot de la voix off
// (timeline.js, généré par voiceover.py). Tout est une fonction pure du temps t (secondes).
const W = 1080, H = 1920, TL = window.TIMELINE, DURATION = TL.duration, CHANNEL = '@FuraxDev';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const C = { ink: '#16131f', orange: '#d97757', red: '#e11d48', yellow: '#facc15', green: '#4ec97a', blue: '#2f6bff' };
const F = { kalam: 'Kalam', mont: 'Montserrat', code: '"Fira Code"', marker: '"Permanent Marker"', anton: 'Anton', bangers: 'Bangers', bebas: '"Bebas Neue"', grotesk: '"Space Grotesk"' };

// ---------- Outils ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3), easeIn = x => x * x * x;
const back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const typed = (s, t, a, cps) => s.slice(0, Math.floor(clamp((t - a) * cps, 0, s.length)));
// Échelle d'un élément qui apparaît en rebondissant à a et disparaît en rétrécissant avant b
function pop(t, a, b, fin = .28, fout = .22) { if (t < a || t >= b) return 0; return Math.max(0, back(seg(t, a, a + fin)) * (1 - easeIn(seg(t, b - fout, b)))); }
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function text(s, x, y, size, color, font, align = 'center', weight = 400) {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}
function outlined(s, x, y, size, fill, font, weight = 400, lw = 18) {
  ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = lw; ctx.strokeStyle = C.ink; ctx.strokeText(s, x, y); ctx.fillStyle = fill; ctx.fillText(s, x, y);
}

// ---------- Repères tirés de la voix off ----------
const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''); // garde les accents : « codé » ≠ « code »
function T(word, n = 0) { let c = 0; for (const w of TL.words) if (norm(w.w) === norm(word)) { if (c === n) return w.s; c++; } throw new Error('mot introuvable : ' + word); }
const K = {
  yo: T('Yo'), furax: T('Furax'), dev: T('développeur'), voyez: T('voyez'), video: T('vidéo', 0), elle: T('Elle'),
  sora: T('Sora'), chatgpt: T('ChatGPT'), gemini: T('Gemini'), ceci: T('ceci'), code: T('code'), voici: T('Voici'),
  claude: T('Claude', 0), au: T('Au'), ia: T('IA', 0), codeLast: T('codé'), la: T('Là', 0),
  term1: T('terminal', 0), image: T('image', 0), chat: T('chat'), suppr: T('supprimes'), limage: T("l'image"), term2: T('terminal', 1),
  multi: T('multicolore'), ronds: T('ronds'), orange: T('orange'), logoC: T('logo', 0), bas: T('bas'), ballon: T('ballon'), logosIA: T('logos'),
  remets: T('remets'), base: T('base'), abon: T('Abonnez-vous'), police: T('police'), autre: T('autre'), glitch: T('glitch'),
  surb: T('surbrillance'), yt: T('YouTube'), efface: T('efface'), tout: T('tout'), masc: T('mascotte'), ang: T('énervée'),
  sho: T('choquée'), sad: T('triste'), cry: T('larmes'), cc: T('Claude', 2), abonner: T('abonner'), ciao: T('Ciao'),
};
const END_INTRO = T('Vous'), VIDEO_ON = K.voyez;

// ---------- Logos ----------
const IMG = {}; const logoLoads = Object.entries(window.LOGOS).map(([k, src]) => new Promise(res => { const i = new Image(); i.onload = res; i.onerror = res; i.src = src; IMG[k] = i; }));
function logo(name, cx, cy, size, rot = 0, alpha = 1) {
  const i = IMG[name]; if (!i || !i.complete) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.drawImage(i, -size / 2, -size / 2, size, size); ctx.restore();
}

// ---------- Fond : grille bleue (puis multicolore sur une partie du script) ----------
function multicolor(t) { return easeOut(seg(t, K.multi, K.multi + .5)) * (1 - easeOut(seg(t, K.remets, K.base + .1))); }
function background(t) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  const mc = multicolor(t), step = 90, off = (t * 40) % step; ctx.lineCap = 'butt';
  for (let x = -step + off; x < W + step; x += step) { ctx.lineWidth = 2.5 + mc * 1.5; ctx.strokeStyle = mc > 0 ? `hsl(${(x * .35 + t * 90) % 360} 95% 55% / ${.35 + mc * .55})` : 'rgba(47,107,255,.5)'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = -step + off; y < H + step; y += step) { ctx.lineWidth = 2.5 + mc * 1.5; ctx.strokeStyle = mc > 0 ? `hsl(${(y * .2 + 180 + t * 90) % 360} 95% 55% / ${.35 + mc * .55})` : 'rgba(47,107,255,.5)'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

// ---------- Autocollants ----------
function sticker(label, cx, cy, w, h, color, rot, k, size = 58, img = null) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot * Math.PI / 180); ctx.scale(k, k);
  ctx.fillStyle = 'rgba(22,19,31,.9)'; rrect(-w / 2 + 9, -h / 2 + 11, w, h, 24); ctx.fill();
  rrect(-w / 2, -h / 2, w, h, 24); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.font = `700 ${size}px ${F.kalam}`; const pad = img ? 170 : 60, fit = Math.min(1, (w - pad) / ctx.measureText(label).width);
  if (img) logo(img, -w / 2 + 80, 0, Math.min(h - 40, 110));
  text(label, img ? 50 : 0, 4, size * fit, C.ink, F.kalam, 'center', 700); ctx.restore();
}
function poof(cx, cy, t0, t) {
  const k = (t - t0) / .6; if (k < 0 || k > 1) return;
  ctx.save(); ctx.globalAlpha = 1 - k;
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + rnd(i) * .5, d = easeOut(k) * (110 + rnd(i + 9) * 90);
    ctx.fillStyle = i % 2 ? '#2f6bff' : '#9bbcff'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 30 * (1 - k) + 6, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- Mascotte Claude en pixel art (bras d'un pixel) ----------
function mascot(cx, base, U, pose, t, k = 1) {
  if (k <= 0) return;
  const A = pose === 'angry', cry = pose === 'cry', sad = pose === 'sad' || cry, shock = pose === 'shock', happy = pose === 'happy', wave = pose === 'wave';
  const OUT = A ? '#7a2414' : '#6b3220', OR = A ? '#e0573b' : '#d97757', LT = A ? '#ee7a5e' : '#ea9a7c', DK = A ? '#b83c25' : '#bd6342', BK = '#1b1411', WH = '#fff', PK = '#f2a58b', BL = '#5ec8ff';
  const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x * U, y * U, w * U, h * U); };
  const limb = (x1, y1, x2, y2) => { const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)); const pts = [];
    for (let i = 0; i <= n; i++) pts.push([Math.round(x1 + (x2 - x1) * i / n), Math.round(y1 + (y2 - y1) * i / n)]);
    pts.forEach(([x, y]) => px(x - 1, y - 1, 3, 3, OUT)); pts.forEach(([x, y]) => px(x, y, 1, 1, OR)); };
  const bob = Math.round(Math.sin(t * 6) * .6) * U / 2, shake = A ? Math.round(Math.sin(t * 45) * 1) * U / 3 : shock ? Math.round(Math.sin(t * 60)) * U / 4 : cry ? Math.round(Math.sin(t * 30)) * U / 4 : 0;
  ctx.save(); ctx.translate(cx + shake, base + (sad ? 0 : bob)); ctx.scale(k, k * (sad ? .94 : 1));
  ctx.globalAlpha *= .2; px(-10, 0, 20, 1, '#000'); ctx.globalAlpha /= .2;
  [-7, -3, 2, 6].forEach(x => { px(x - 1, -4, 4, 4, OUT); px(x, -4, 2, 3, OR); });
  px(-10, -16, 20, 13, OUT); px(-9, -15, 18, 11, OR); px(-9, -15, 18, 1, LT); px(-9, -5, 18, 1, DK);
  const blink = (t % 3.3) < .12, lx = Math.round(Math.sin(t * 2) * .5);
  [-5, 3].forEach(x => {
    if (A) px(x, -12, 2, 2, BK);
    else if (shock) { px(x - 1, -15, 4, 6, BK); px(x, -14, 2, 4, WH); px(x + (x < 0 ? 1 : 0), -12, 1, 2, BK); }
    else if (cry) { px(x - 1, -11, 4, 1, BK); }
    else if (sad) { px(x, -12, 2, 3, BK); px(x, -12, 1, 1, WH); px(x + 1, -10, 1, 1, WH); }
    else if (blink) px(x, -11, 2, 1, BK);
    else if (happy || wave) { px(x, -11, 1, 1, BK); px(x + 1, -12, 1, 1, BK); px(x + 2, -11, 1, 1, BK); }
    else { px(x + lx, -13, 2, 3, BK); px(x + lx, -13, 1, 1, WH); }
  });
  px(-8, -8, 2, 1, PK); px(6, -8, 2, 1, PK);
  if (A) { [[-6, -15], [-5, -14], [-4, -13], [5, -15], [4, -14], [3, -13]].forEach(([x, y]) => px(x, y, 1, 1, BK)); px(-2, -6, 1, 1, BK); px(-1, -7, 2, 1, BK); px(1, -6, 1, 1, BK); }
  else if (shock) { px(-6, -17, 3, 1, BK); px(3, -17, 3, 1, BK); px(-1, -8, 2, 2, BK); px(10, -14 + Math.round((t * 6) % 3), 1, 2, BL); }
  else if (cry) { [[-6, -13], [-5, -14], [-4, -15], [5, -13], [4, -14], [3, -15]].forEach(([x, y]) => px(x, y, 1, 1, BK)); px(-2, -8, 4, 3, BK); px(-1, -6, 2, 1, '#ff7a90'); }
  else if (sad) { [[-6, -13], [-5, -14], [-4, -15], [5, -13], [4, -14], [3, -15]].forEach(([x, y]) => px(x, y, 1, 1, BK)); px(-1, -7, 2, 1, BK); px(-2, -6, 1, 1, BK); px(1, -6, 1, 1, BK); }
  else if (happy || wave) { px(-2, -8, 1, 1, BK); px(-1, -7, 2, 1, BK); px(1, -8, 1, 1, BK); }
  else px(-1, -7, 2, 1, BK);
  if (cry) { [-5, 3].forEach(ex => { px(ex, -10, 1, 4, '#9bdcff');
      for (let j = 0; j < 3; j++) { const ph = (t * 1.8 + j / 3 + (ex > 0 ? .17 : 0)) % 1; ctx.globalAlpha = 1 - ph * .6; px(ex + (ex > 0 ? 1 : 0) + (j % 2), -6 + ph * 7 | 0, 1, 2, BL); ctx.globalAlpha = 1; } });
    const g = Math.min(1, (t % 100) * 0 + .6); px(-9, 0, 18, 1, BL); px(-6, 1, 12, 1, '#9bdcff'); void g; }
  if (A) { limb(10, -9, 13, -3); limb(-10, -9, -13, -3);
    for (let j = 0; j < 2; j++) { const ph = (t * 1.5 + j * .5) % 1; ctx.globalAlpha = 1 - ph; px(j ? 5 : -7, -19 - ph * 6 | 0, 2, 2, WH); ctx.globalAlpha = 1; } }
  else if (shock) { limb(-10, -9, -9, -19); limb(10, -9, 9, -19); }
  else if (sad) { limb(10, -9, 11, -3); limb(-10, -9, -11, -3); }
  else if (wave || happy) { const wv = Math.round(Math.sin(t * 12) * 2); limb(10, -9, 14 + wv, -20); limb(-10, -9, -12, -4); }
  else { limb(10, -9, 12, -4); limb(-10, -9, -12, -4); }
  ctx.restore();
}

// ---------- Terminal Claude Code (interface réelle) ----------
function terminal(t, t0, k, cy, sc, idle) {
  if (k <= 0) return;
  const lt = t - t0, x = 40, y = 340, w = 1000, h = 780, fs = 26, lh = 40;
  const P = { bg: '#1a1816', txt: '#e8e3dc', gray: '#8a847b', dim: '#5c5750', or: '#d77757', grn: '#4ec97a', add: '#12351f', sel: '#34312e' };
  ctx.save(); ctx.translate(W / 2, cy); ctx.scale(k * sc, k * sc); ctx.translate(-W / 2, -(y + h / 2));
  ctx.fillStyle = 'rgba(22,19,31,.9)'; rrect(x + 9, y + 11, w, h, 26); ctx.fill();
  rrect(x, y, w, h, 26); ctx.fillStyle = P.bg; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
  [C.red, '#f59e0b', C.green].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 44 + i * 36, y + 38, 11, 0, 7); ctx.fill(); });
  text('claude — ~/pub-video', x + w / 2, y + 38, 22, P.gray, F.code, 'center');
  const TX = (s, px, py, col = P.txt, wt = 400, size = fs) => text(s, px, py, size, col, F.code, 'left', wt), X = x + 34, cur = Math.floor(t * 3) % 2 ? ' ' : '█';
  ctx.fillStyle = P.or; ctx.fillRect(X + 12, y + 86, 96, 56); ctx.fillRect(X, y + 114, 12, 12); ctx.fillRect(X + 108, y + 114, 12, 12);
  [24, 40, 68, 84].forEach(dx => ctx.fillRect(X + dx, y + 142, 12, 12)); ctx.fillStyle = P.bg; ctx.fillRect(X + 34, y + 92, 12, 18); ctx.fillRect(X + 74, y + 92, 12, 18);
  TX('Claude Code v2.1', X + 160, y + 105, P.txt, 700, 24); TX('Opus 5.5 · Claude Max', X + 160, y + 139, P.gray, 400, 24); TX('~/pub-video', X + 160, y + 173, P.gray, 400, 24);
  const msg = 'Fais-moi une vidéo', sentAt = 1.8;
  if (!idle && lt >= sentAt) { ctx.fillStyle = P.sel; rrect(X - 14, y + 218, w - 40, 46, 6); ctx.fill(); TX('> ' + msg, X, y + 242); }
  if (!idle && lt >= 2.0 && lt < 4.25) TX('✻ Cogitating… (esc to interrupt)', X, y + 312, P.or);
  [[4.25, 'Write(video.js)', 'Wrote 312 lines to video.js', 312, ['+ const W = 1080, H = 1920;', '+ function renderFrame(t) {']],
   [5.0, 'Bash(node render.js)', 'video.mp4 rendu ✓', 500, []]].forEach(([a, name, res, py, diff]) => {
    if (idle) return; const q = seg(lt, a, a + .15); if (q <= 0) return; ctx.save(); ctx.globalAlpha *= q;
    TX('●', X, y + py, P.grn); TX(name, X + 40, y + py, P.txt, 700);
    if (lt > a + .3) { TX('⎿', X + 20, y + py + lh, P.gray); TX(res, X + 70, y + py + lh, P.gray); }
    if (lt > a + .5) diff.forEach((d, i) => { ctx.fillStyle = P.add; ctx.fillRect(X + 70, y + py + 82 + i * 38, w - 150, 36); TX(d, X + 84, y + py + 100 + i * 38, P.grn, 400, 22); });
    ctx.restore(); });
  if (!idle && lt >= 5.7) { ctx.save(); ctx.globalAlpha *= seg(lt, 5.7, 5.85); TX('●', X, y + 600, P.or); TX('Ta vidéo est prête ! 🎬', X + 40, y + 600, P.txt); ctx.restore(); }
  const iy = y + 630; ctx.strokeStyle = P.dim; ctx.lineWidth = 2;
  [iy, iy + 64].forEach(ly => { ctx.beginPath(); ctx.moveTo(x + 20, ly); ctx.lineTo(x + w - 20, ly); ctx.stroke(); });
  TX('> ' + (idle ? '' : lt < sentAt ? typed(msg, lt, .35, 14) : '') + cur, X, iy + 34); TX('? for shortcuts', X, iy + 100, P.gray, 400, 22);
  ctx.restore();
}

// ---------- Fenêtre de code (« ceci est fait en code ») ----------
const CODE = ['const video = new Video();', "video.add(text, cat, logo);", "video.render(); // 🎬"];
function codeWindow(t, t0, k) {
  if (k <= 0) return; const lt = t - t0, x = 60, y = 520, w = 960, h = 460;
  ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-W / 2, -(y + h / 2));
  ctx.fillStyle = 'rgba(22,19,31,.9)'; rrect(x + 9, y + 11, w, h, 26); ctx.fill(); rrect(x, y, w, h, 26); ctx.fillStyle = '#1f1d2b'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
  [C.red, '#f59e0b', C.green].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 44 + i * 36, y + 40, 11, 0, 7); ctx.fill(); });
  text('video.js', x + w / 2, y + 40, 24, '#8a8aa5', F.code, 'center');
  const cols = [[/^(const|new)$/, '#f472b6'], [/^(video)$/, '#7dd3fc'], [/^(render|add|Video)$/, '#fde68a']];
  CODE.forEach((l, i) => { const shown = typed(l, lt, .1 + i * .55, 30); ctx.font = `400 34px ${F.code}`; let cx = x + 50; const ly = y + 130 + i * 90;
    text(String(i + 1), x + 24, ly, 22, '#4b4b66', F.code, 'left'); cx = x + 80;
    (shown.match(/\w+|\s+|[^\w\s]/gu) || []).forEach(tok => { const col = l.startsWith('//', l.indexOf('//')) && shown.indexOf('//') >= 0 && shown.indexOf('//') <= cx ? '#6b7280' : (cols.find(([r]) => r.test(tok)) || [0, '#e8e3dc'])[1];
      ctx.fillStyle = tok.trim() ? col : '#000'; ctx.textAlign = 'left'; ctx.fillText(tok, cx, ly); cx += ctx.measureText(tok).width; }); });
  if (lt > 1.7) text('▍', x + 80, y + 400, 34, '#e8e3dc', F.code, 'left');
  ctx.restore();
}

// ---------- Chat dessiné (polaroid) ----------
function catCard(cx, cy, k, rot, t) {
  if (k <= 0) return; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot * Math.PI / 180); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(22,19,31,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; rrect(-260, -300, 520, 600, 22); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.save(); rrect(-230, -270, 460, 440, 10); ctx.clip(); ctx.fillStyle = '#fde8c8'; ctx.fillRect(-230, -270, 460, 440);
  const O = '#f4a261', S = ctx.lineWidth = 6;
  const tri = (pts, f) => { ctx.beginPath(); pts.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.closePath(); ctx.fillStyle = f; ctx.fill(); ctx.stroke(); };
  ctx.beginPath(); ctx.ellipse(0, 150, 150, 100, 0, 0, 7); ctx.fillStyle = O; ctx.fill(); ctx.stroke();
  tri([[-150, -60], [-135, -215], [-30, -130]], O); tri([[150, -60], [135, -215], [30, -130]], O);
  tri([[-125, -100], [-120, -180], [-70, -125]], '#f9a8b8'); tri([[125, -100], [120, -180], [70, -125]], '#f9a8b8');
  ctx.beginPath(); ctx.ellipse(0, -40, 165, 135, 0, 0, 7); ctx.fillStyle = O; ctx.fill(); ctx.stroke();
  ctx.lineWidth = 7; ctx.beginPath(); [-30, 0, 30].forEach(x => { ctx.moveTo(x, -170); ctx.lineTo(x * .8, -135); }); ctx.stroke(); ctx.lineWidth = 6;
  ctx.fillStyle = '#ffe8d1'; [-34, 34].forEach(x => { ctx.beginPath(); ctx.arc(x, 15, 42, 0, 7); ctx.fill(); });
  const blink = (t % 3) < .12;
  [-65, 65].forEach(x => { ctx.beginPath(); ctx.ellipse(x, -55, 32, blink ? 3 : 40, 0, 0, 7); ctx.fillStyle = '#9bd36b'; ctx.fill(); ctx.stroke();
    if (!blink) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(x, -55, 9, 30, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 8, -70, 7, 0, 7); ctx.fill(); } });
  tri([[-16, -8], [16, -8], [0, 14]], '#f08ca0');
  ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, 30); ctx.moveTo(-34, 34); ctx.quadraticCurveTo(-17, 52, 0, 30); ctx.quadraticCurveTo(17, 52, 34, 34); ctx.stroke();
  ctx.lineWidth = 4; [[-1, -10], [-1, 6], [-1, 22]].forEach(([s, dy]) => { ctx.beginPath(); ctx.moveTo(s * 80, 18 + dy * .6); ctx.lineTo(s * 190, 4 + dy * 1.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-s * 80, 18 + dy * .6); ctx.lineTo(-s * 190, 4 + dy * 1.6); ctx.stroke(); });
  ctx.restore(); text('Miaou 🐱', 0, 235, 62, C.ink, F.kalam, 'center', 700); ctx.restore();
}

// ---------- Ballon de foot ----------
function poly(cx, cy, r, rot, n = 5) { ctx.beginPath(); for (let i = 0; i < n; i++) { const a = rot + i * 2 * Math.PI / n; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); }
function football(x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.save(); ctx.clip();
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 5; poly(0, 0, r * .33, rot); ctx.fill();
  for (let i = 0; i < 5; i++) { const a = rot + i * 2 * Math.PI / 5; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * .33, Math.sin(a) * r * .33); ctx.lineTo(Math.cos(a) * r * .72, Math.sin(a) * r * .72); ctx.stroke();
    poly(Math.cos(a) * r * 1.0, Math.sin(a) * r * 1.0, r * .36, a + Math.PI / 5); ctx.fill(); }
  ctx.restore(); ctx.lineWidth = 8; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.restore();
}

// ---------- Grille d'objets qui défile vers le bas : ronds orange -> logos Claude, ballons, logos IA ----------
const BGLOGOS = ['openai', 'gemini-color', 'midjourney', 'sora', 'grok', 'deepseek-color', 'meta-color', 'mistral-color', 'perplexity-color', 'copilot-color'];
function objectGrid(t) {
  if (t < K.ronds || t > K.base + .1) return;
  const COLS = 4, CELL = 270, s = (t - K.ronds) * 230, base = Math.floor(s / CELL), frac = s % CELL, fade = 1 - seg(t, K.remets, K.base);
  for (let i = 0; i <= Math.ceil(H / CELL) + 1; i++) { const row = base - i; if (row < 0) continue;
    for (let c = 0; c < COLS; c++) { const x = CELL / 2 + c * CELL + (W - COLS * CELL) / 2, y = frac + i * CELL - CELL / 2, kind = (row + c) % 3, id = row * COLS + c;
      const m = easeOut(seg(t, K.logoC + c * .06, K.logoC + .7 + c * .06)), fb = pop(t, K.ballon + c * .05, 999, .35, .01), ai = pop(t, K.logosIA + c * .05, 999, .35, .01);
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y + Math.sin(t * 3 + id) * 6);
      const orb = 1 - m;                                                    // rond orange
      if (orb > 0 && !(kind === 0 && fb > 0) && !(kind === 1 && ai > 0)) { ctx.globalAlpha = fade * orb; ctx.fillStyle = C.orange; ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 80 * Math.min(1, seg(t, K.ronds, K.ronds + .3) + .01), 0, 7); ctx.fill(); ctx.stroke(); ctx.globalAlpha = fade; }
      if (m > 0 && !(kind === 0 && fb > 0) && !(kind === 1 && ai > 0)) logo('claude-color', 0, 0, 190 * (.5 + .5 * back(m)), t * .6 + id);   // logo Claude
      if (kind === 0 && fb > 0) { ctx.rotate(t * 2 + id); ctx.scale(fb, fb); football(0, 0, 80, 0); }                                        // ballon de foot
      if (kind === 1 && ai > 0) { ctx.scale(ai, ai); ctx.fillStyle = '#fff'; ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill(); ctx.stroke(); logo(BGLOGOS[(row * COLS + c) % BGLOGOS.length], 0, 0, 120); } // logos IA
      ctx.restore(); } }
}

// ---------- « Abonnez-vous ! » : polices, glitch, surbrillance, logo YouTube ----------
const tc = document.createElement('canvas'); tc.width = W; tc.height = 320; const tx = tc.getContext('2d');
const tc2 = document.createElement('canvas'); tc2.width = W; tc2.height = 320; const tx2 = tc2.getContext('2d');
function subscribeText(t) {
  const k = pop(t, K.abon, K.tout + .3, .3, .3); if (k <= 0) return;
  const font = t < K.police ? ['Anton', 400] : t < K.autre ? ['"Permanent Marker"', 400] : ['Bangers', 400], name = t < K.police ? 'Anton' : t < K.autre ? 'Permanent Marker' : 'Bangers';
  tx.clearRect(0, 0, W, 320); tx.textAlign = 'center'; tx.textBaseline = 'middle'; tx.lineJoin = 'round';
  let size = 150; tx.font = `${font[1]} ${size}px ${font[0]}`; const wd = tx.measureText('ABONNEZ-VOUS !').width; size = Math.min(150, size * 960 / wd); tx.font = `${font[1]} ${size}px ${font[0]}`;
  const sb = seg(t, K.surb, K.surb + .9), px = W / 2 - 480 + 960 * easeOut(sb), fg = tx.createLinearGradient(px - 1, 0, px + 1, 0);
  fg.addColorStop(0, sb > 0 ? C.yellow : '#fff'); fg.addColorStop(.5, sb > 0 ? C.yellow : '#fff'); fg.addColorStop(.5, '#fff'); fg.addColorStop(1, '#fff');
  tx.lineWidth = 26; tx.strokeStyle = C.ink; tx.strokeText('ABONNEZ-VOUS !', W / 2, 160); tx.fillStyle = fg; tx.fillText('ABONNEZ-VOUS !', W / 2, 160);
  ctx.save(); ctx.translate(W / 2, 700); ctx.scale(k, k); ctx.translate(-W / 2, -160);
  if (sb > 0) ctx.shadowColor = C.yellow, ctx.shadowBlur = 40 * Math.sin(Math.min(1, sb) * Math.PI) + 10;
  const g = t >= K.glitch && t < K.glitch + 1.1; // glitch : décalages de tranches + séparation RVB
  if (g) { const f = Math.floor(t * 20); tx2.clearRect(0, 0, W, 320); tx2.drawImage(tc, 0, 0); tx2.globalCompositeOperation = 'source-in';
    tx2.fillStyle = '#00e5ff'; tx2.fillRect(0, 0, W, 320); ctx.drawImage(tc2, -14 - rnd(f) * 12, rnd(f + 1) * 8 - 4);
    tx2.globalCompositeOperation = 'source-over'; tx2.clearRect(0, 0, W, 320); tx2.drawImage(tc, 0, 0); tx2.globalCompositeOperation = 'source-in'; tx2.fillStyle = '#ff2d6f'; tx2.fillRect(0, 0, W, 320); tx2.globalCompositeOperation = 'source-over';
    ctx.drawImage(tc2, 14 + rnd(f + 2) * 12, rnd(f + 3) * 8 - 4);
    for (let y = 0; y < 320; y += 20) { const sh = rnd(f * 17 + y) > .55 ? (rnd(f + y) - .5) * 90 : 0; ctx.drawImage(tc, 0, y, W, 20, sh, y, W, 20); } }
  else ctx.drawImage(tc, 0, 0);
  ctx.restore();
  const chip = t < K.glitch ? name : t < K.surb ? 'GLITCH' : 'SURBRILLANCE ✨', cs = pop(t, t < K.police ? 99 : t < K.autre ? K.police : t < K.glitch ? K.autre : t < K.surb ? K.glitch : K.surb, K.tout + .2, .25, .2);
  const yk = pop(t, K.yt, K.tout + .3, .35, .3);
  sticker(chip, W / 2, 930, 640, 120, '#fde68a', -2, cs, 56);
  if (yk > 0) { ctx.save(); ctx.translate(W / 2, 1115); ctx.scale(yk, yk); ctx.rotate(Math.sin(t * 5) * .04);
    ctx.shadowColor = 'rgba(22,19,31,.4)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12; rrect(-150, -105, 300, 210, 62); ctx.fillStyle = '#ff0000'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 6; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-36, -62); ctx.lineTo(-36, 62); ctx.lineTo(68, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
}

// ---------- Sous-titres mot par mot ----------
const WORDS = []; TL.words.forEach(w => { const l = WORDS[WORDS.length - 1], s = w.w === 'Véo' ? 'Veo' : w.w;
  if (l && l.w === 'Furax' && s === 'Dev') { l.w = 'FuraxDev'; l.e = w.e; } else WORDS.push({ w: s, s: w.s, e: w.e }); });
const HL = new Set(['furaxdev', 'sora', 'chatgpt', 'gemini', 'veo', 'code', 'codé', 'claude', 'terminal', 'chat', 'multicolore', 'orange', 'foot', 'ia', 'abonnez-vous', 'glitch', 'youtube', 'surbrillance', 'mascotte', 'énervée', 'choquée', 'triste', 'larmes', 'abonner', 'ciao', 'bg', 'logo', 'logos', 'vidéo']);
const SUBF = `800 88px ${F.mont}`; ctx.font = SUBF;
const GROUPS = []; (function () { let cur = [], cw = 0; const gap = 24;
  WORDS.forEach((w, i) => { ctx.font = SUBF; const wd = ctx.measureText(w.w.toUpperCase()).width, pause = i && w.s - WORDS[i - 1].e > .5;
    if (cur.length && (cur.length >= 3 || cw + gap + wd > 940 || pause)) { GROUPS.push(cur); cur = []; cw = 0; } cur.push(i); cw += (cur.length > 1 ? gap : 0) + wd; });
  if (cur.length) GROUPS.push(cur); })();
function subtitles(t) {
  const g = GROUPS.find(gr => t >= WORDS[gr[0]].s - .02 && t < WORDS[gr[gr.length - 1]].e + .35); if (!g) return;
  ctx.font = SUBF; const gap = 24, ws = g.map(i => ctx.measureText(WORDS[i].w.toUpperCase()).width), total = ws.reduce((a, b) => a + b, 0) + gap * (g.length - 1); let x = W / 2 - total / 2;
  g.forEach((i, j) => { const w = WORDS[i], k = t >= w.s ? back(seg(t, w.s, w.s + .14)) : 0;
    if (k > 0) { ctx.save(); ctx.translate(x + ws[j] / 2, 1330); ctx.scale(k, k); ctx.font = SUBF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = 20; ctx.strokeStyle = C.ink; ctx.strokeText(w.w.toUpperCase(), 0, 0); ctx.fillStyle = HL.has(w.w.toLowerCase()) ? C.yellow : '#fff'; ctx.fillText(w.w.toUpperCase(), 0, 0); ctx.restore(); }
    x += ws[j] + gap; });
}

// ---------- Montage ----------
function scenes(t) {
  const K_ = K;
  // 1. Présentation
  sticker('👋 YO !', W / 2, 400, 520, 150, '#fde68a', -3, pop(t, K_.yo, K_.furax - .1), 76);
  sticker('FuraxDev', W / 2, 560, 760, 170, '#86efac', 2, pop(t, K_.furax, END_INTRO - .1), 84, 'claude-color');
  sticker('💻 Développeur Full Stack Pro', W / 2, 770, 940, 150, '#93c5fd', -2, pop(t, K_.dev, END_INTRO - .1), 54);
  // 2. « cette vidéo » : un cadre de lecture
  const vk = pop(t, K_.voyez, K_.elle + .3, .3, .25);
  if (vk > 0) { ctx.save(); ctx.translate(W / 2, 640); ctx.rotate(-.03); ctx.scale(vk, vk); ctx.fillStyle = 'rgba(22,19,31,.9)'; rrect(-300 + 9, -330 + 11, 600, 660, 36); ctx.fill();
    rrect(-300, -330, 600, 660, 36); ctx.fillStyle = '#16131f'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-50, -80); ctx.lineTo(-50, 80); ctx.lineTo(90, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff44'; rrect(-240, 250, 480, 14, 7); ctx.fill(); ctx.fillStyle = C.orange; rrect(-240, 250, 480 * ((t * .25) % 1), 14, 7); ctx.fill();
    text('Cette vidéo', 0, -230, 70, '#fff', F.kalam, 'center', 700); ctx.restore(); }
  // 3. « ni Sora, ni ChatGPT, ni Gemini Veo 3 » : trois cartes barrées
  [['Sora', 'sora', K_.sora, 520, -3], ['ChatGPT', 'openai', K_.chatgpt, 720, 2], ['Gemini Veo 3', 'gemini-color', K_.gemini, 920, -2]].forEach(([n, img, a, y, r]) => {
    const k = pop(t, a, K_.ceci + .3, .28, .3); sticker(n, W / 2, y, 880, 150, '#fff', r, k, 66, img);
    const x = seg(t, a + .45, a + .7); if (k > 0 && x > 0) { ctx.save(); ctx.translate(W / 2, y); ctx.rotate(r * Math.PI / 180); ctx.scale(k, k); ctx.strokeStyle = C.red; ctx.lineWidth = 20; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-410, 30); ctx.lineTo(-410 + 820 * easeOut(x), -20 - 10 * easeOut(x)); ctx.stroke(); ctx.restore(); } });
  // 4. « fait en code »
  codeWindow(t, K_.ceci, pop(t, K_.ceci, K_.voici + .1, .3, .3));
  sticker('</> EN CODE !', W / 2, 360, 760, 160, '#86efac', -2, pop(t, K_.code, K_.voici + .1, .3, .3), 80);
  sticker('Voici le truc 👇', W / 2, 520, 760, 130, '#fde68a', 2, pop(t, K_.voici, K_.claude - .15), 66);
  // 5. Claude dans le terminal
  const t1 = K_.claude, t1e = K_.la + .35;
  terminal(t, t1, pop(t, t1, t1e, .3, .35), 790, 1, false);
  sticker('Pas d\'IA vidéo ❌', W / 2, 300, 780, 130, '#fca5a5', -2, pop(t, K_.ia, K_.codeLast, .25, .15), 62);
  sticker('Ça, c\'est codé ✅', W / 2, 300, 780, 130, '#86efac', 2, pop(t, K_.codeLast, t1e, .25, .3), 62);
  // 6. Terminal + chat, puis suppression
  terminal(t, K_.term1, pop(t, K_.term1, K_.term2 + .45, .28, .1), 830, .86, true);
  catCard(W / 2 + 80, 560, pop(t, K_.image, K_.limage + .3, .3, .1), 5, t);
  poof(W / 2 + 80, 560, K_.limage + .1, t); poof(W / 2, 830, K_.term2 + .2, t);
  // 7. « Abonnez-vous ! »
  subscribeText(t);
}
function renderFrame(t) {
  background(t);
  objectGrid(t);
  scenes(t);
  // mascotte centrale et ses émotions
  const mk = pop(t, K.masc, K.cc - .2, .35, .3);
  if (mk > 0) { const pose = t < K.ang ? 'idle' : t < K.sho ? 'angry' : t < K.sad ? 'shock' : t < K.cry ? 'sad' : 'cry';
    const lab = [[K.ang, K.sho, '😡 ÉNERVÉ', '#fca5a5'], [K.sho, K.sad, '😱 CHOQUÉ', '#fde68a'], [K.sad, K.cry, '😢 TRISTE', '#93c5fd'], [K.cry, K.cc - .2, '😭 EN LARMES', '#a5b4fc']];
    mascot(540, 1215, 30, pose, t, mk); lab.forEach(([a, b, s, c]) => sticker(s, W / 2, 330, 700, 140, c, -2, pop(t, a, b, .25, .1), 70)); }
  // final
  const ck = pop(t, K.cc - .1, DURATION, .3, .01);
  if (ck > 0) { mascot(540, 1260, 22, 'happy', t, ck);
    sticker('Claude Code', W / 2, 280, 760, 160, '#86efac', -2, pop(t, K.cc, DURATION, .3, .01), 78, 'claude-color');
    const bk = pop(t, K.abonner, DURATION, .3, .01) * (1 + Math.sin(t * 7) * .03);
    sticker('🔔 Abonne-toi !', W / 2, 440, 720, 140, '#fde68a', 2, bk, 72);
    sticker('Ciao les BG 👋', W / 2, 590, 700, 130, '#fca5a5', -2, pop(t, K.ciao, DURATION, .3, .01), 66); }
  subtitles(t);
  ctx.fillStyle = C.orange; ctx.fillRect(0, 0, W * t / DURATION, 8);
}
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all([...Object.values(F).map(f => document.fonts.load(`40px ${f}`)), ...logoLoads]);

if (!location.search.includes('render')) {
  const audio = new Audio('voice.wav'), hud = document.getElementById('hud'); let t0 = null;
  document.body.onclick = () => { t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
  window.ready.then(() => (function loop(now) { if (t0 === null) t0 = now; const t = ((now - t0) / 1000) % DURATION;
    renderFrame(t); hud.textContent = `${t.toFixed(2)}s — clic pour relancer avec le son`; requestAnimationFrame(loop); })(performance.now()));
}

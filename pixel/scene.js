// Short 9:16 « Tout est fait en code » — pixel art 2D façon Minecraft, personnages de FACE.
// Grille de pixels 216x384 (1 pixel = 5 px à l'écran). Tout est une fonction du temps t ; chaque animation est déclenchée par un mot de la voix off.
const W = 1080, H = 1920, PX = 5, UW = 216, UH = 384, GY = 292, TL = window.TIMELINE, DURATION = TL.duration;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const OUT = '#1b1230';

// ---------- Outils ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3), easeIn = x => x * x * x, smooth = x => x * x * (3 - 2 * x);
const back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const typed = (s, t, a, cps) => s.slice(0, Math.floor(clamp((t - a) * cps, 0, s.length)));
function pop(t, a, b, fin = .3, fout = .22) { if (t < a || t >= b) return 0; return Math.max(0, back(seg(t, a, a + fin)) * (1 - easeIn(seg(t, b - fout, b)))); }
// Rectangle sur la grille de pixels (coordonnées en « unités »)
function R(x, y, w, h, c) { const x0 = Math.round(x), y0 = Math.round(y), x1 = Math.round(x + w), y1 = Math.round(y + h); ctx.fillStyle = c; ctx.fillRect(x0 * PX, y0 * PX, (x1 - x0) * PX, (y1 - y0) * PX); }

// ---------- Repères tirés de la voix off ----------
const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
function T(word, n = 0) { let c = 0; for (const w of TL.words) if (norm(w.w) === norm(word)) { if (c === n) return w.s; c++; } throw new Error('mot introuvable : ' + word); }
const K = {
  yo: T('Yo'), furax: T('Furax'), dev: T('développeur'), voyez: T('voyez'), elle: T('Elle'), sora: T('Sora'), chatgpt: T('ChatGPT'), gemini: T('Gemini'),
  ceci: T('ceci'), code: T('code'), voici: T('Voici'), claude: T('Claude', 0), ia: T('IA', 0), codeLast: T('codé'), la: T('Là', 0),
  term1: T('terminal', 0), image: T('image', 0), suppr: T('supprimes'), limage: T("l'image"), term2: T('terminal', 1),
  multi: T('multicolore'), ronds: T('ronds'), logoC: T('logo', 0), ballon: T('ballon'), logosIA: T('logos'),
  remets: T('remets'), base: T('base'), abon: T('Abonnez-vous'), police: T('police'), autre: T('autre'), glitch: T('glitch'), surb: T('surbrillance'),
  yt: T('YouTube'), tout: T('tout'), masc: T('mascotte'), ang: T('énervée'), sho: T('choquée'), sad: T('triste'), cry: T('larmes'),
  cc: T('Claude', 2), abonner: T('abonner'), ciao: T('Ciao'),
};
const END_INTRO = T('Vous');

// ---------- Logos (pixellisés) ----------
const IMG = {}, TINY = {}; const logoLoads = Object.entries(window.LOGOS).map(([k, src]) => new Promise(res => { const i = new Image(); i.onload = res; i.onerror = res; i.src = src; IMG[k] = i; }));
function makeTiny() { for (const k in IMG) { const c = document.createElement('canvas'); c.width = c.height = 24; const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(IMG[k], 0, 0, 24, 24); TINY[k] = c; } }
function tiny(name, x, y, size) { const c = TINY[name]; if (!c) return; ctx.imageSmoothingEnabled = false; ctx.drawImage(c, Math.round(x) * PX, Math.round(y) * PX, Math.round(size) * PX, Math.round(size) * PX); }

// ---------- Décor : papier quadrillé bleu, sol en blocs, nuages, soleil ----------
function multicolor(t) { return easeOut(seg(t, K.multi, K.multi + .5)) * (1 - easeOut(seg(t, K.remets, K.base + .1))); }
function drawBackground(t) {
  const mc = multicolor(t); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  if (mc > 0) { ctx.globalAlpha = mc * .55; for (let y = 0; y < UH; y += 8) R(0, y, UW, 8, `hsl(${(y * 1.2 + t * 60) % 360} 90% 82%)`); ctx.globalAlpha = 1; }
  const off = Math.floor(t * 6) % 14;
  for (let x = -14 + off; x < UW + 14; x += 14) R(x, 0, 1, UH, mc > 0 ? `hsl(${(x * 2 + t * 90) % 360} 95% 55%)` : '#8fb0ff');
  for (let y = -14 + off; y < UH + 14; y += 14) R(0, y, UW, 1, mc > 0 ? `hsl(${(y * 2 + 180 + t * 90) % 360} 95% 55%)` : '#8fb0ff');
  R(176, 18, 22, 22, '#ffb703'); R(177, 19, 20, 20, '#ffd23f'); R(177, 19, 20, 3, '#ffe88a');
  [[0, 40, 0], [90, 24, 1], [150, 56, 2]].forEach(([cx, cy, i]) => { const x = ((cx + t * 3 + i * 40) % (UW + 80)) - 40; R(x, cy + 6, 40, 8, '#fff'); R(x + 6, cy, 24, 8, '#fff'); R(x + 4, cy + 12, 34, 2, '#cfe2ff'); });
}
function drawGround() {
  R(0, GY, UW, UH - GY, '#8b5a2b'); for (let tx = 0; tx < UW; tx += 16) for (let ty = GY + 4; ty < UH; ty += 16) {
    for (let i = 0; i < 9; i++) R(tx + 1 + Math.floor(rnd(tx * 7 + ty + i) * 14), ty + Math.floor(rnd(ty * 3 + tx + i * 5) * 14), 2, 2, i % 3 ? '#6e4520' : '#a67340'); R(tx, ty + 15, 16, 1, '#5a3817'); R(tx + 15, ty, 1, 16, '#5a3817'); }
  R(0, GY, UW, 4, '#5ec14a'); R(0, GY, UW, 1, '#98e676'); R(0, GY + 3, UW, 1, '#3c9a36'); for (let x = 0; x < UW; x += 6) R(x + (x % 4), GY + 4, 2, 2 + (x % 3), '#5ec14a');
}

// ---------- Personnage FuraxDev (de face, pixel art) ----------
const HP = { skin: '#eab48a', skinSh: '#c98d63', hair: '#4a2f1d', hairHi: '#6a4630', hood: '#2e3256', hoodHi: '#454c80', hoodSh: '#222644', jeans: '#3c55a8', jeansSh: '#2d4285', shoe: '#1c1c24', gold: '#d9a82c', or: '#ff7a2d' };
function part(x, y, w, h, base, hi, sh, o = 1) { R(x - o, y - o, w + 2 * o, h + 2 * o, OUT); R(x, y, w, h, base); if (hi) R(x, y, w, 1, hi); if (sh) R(x + w - Math.max(1, Math.round(w / 6)), y + 1, Math.max(1, Math.round(w / 6)), h - 1, sh); }
function faceCells(e, t) {
  const c = [], p = (x, y, w, h, col) => c.push([x, y, w, h, col]), S = HP;
  p(0, 0, 16, 16, S.skin); p(0, 0, 16, 4, S.hair); p(0, 4, 2, 3, S.hair); p(14, 4, 2, 3, S.hair); p(2, 4, 3, 1, S.hair); p(11, 4, 3, 1, S.hair); p(1, 1, 5, 1, S.hairHi);
  [[2, 6], [8, 6]].forEach(([x, y]) => { p(x, y, 6, 1, S.gold); p(x, y + 4, 6, 1, S.gold); p(x, y, 1, 5, S.gold); p(x + 5, y, 1, 5, S.gold); p(x + 1, y + 1, 4, 3, '#fff'); });
  p(6, 7, 3, 1, S.gold);
  const blink = (t % 3.4) < .12;
  [[3, 7], [9, 7]].forEach(([x, y]) => {
    if (e === 'shock') { p(x, y, 4, 3, '#fff'); p(x + 1, y, 2, 3, '#111'); } else if (e === 'happy' || blink) { p(x, y + 1, 4, 1, '#111'); }
    else { p(x, y, 4, 3, '#fff'); p(x + 2, y, 2, 3, '#111'); p(x + 3, y, 1, 1, '#fff'); } });
  p(7, 9, 2, 2, '#c18a62');
  if (e === 'grin') { p(4, 11, 8, 3, '#7a1f2b'); p(4, 11, 8, 1, '#fff'); p(6, 13, 4, 1, '#e8758a'); }
  else if (e === 'flat') p(5, 12, 6, 1, '#4a2b22'); else if (e === 'shock') p(6, 11, 4, 3, '#7a1f2b');
  else { p(4, 11, 1, 1, '#4a2b22'); p(11, 11, 1, 1, '#4a2b22'); p(5, 12, 6, 1, '#4a2b22'); }
  p(1, 10, 2, 1, '#f09a8a'); p(13, 10, 2, 1, '#f09a8a'); return c;
}
function limbDraw(sx, sy, ang, len, wd, sleeve, sleeveSh) {
  const dx = Math.sin(ang), dy = Math.cos(ang), pts = []; for (let i = 0; i <= len; i += .5) pts.push([sx + dx * i, sy + dy * i, i]);
  pts.forEach(([x, y]) => R(x - wd / 2 - 1, y - wd / 2 - 1, wd + 2, wd + 2, OUT));
  pts.forEach(([x, y, i]) => R(x - wd / 2, y - wd / 2, wd, wd, i > len * .66 ? HP.skin : sleeve));
}
const ARMS = { idle: [-.08, .08, 'smile'], wave: [-.1, 2.5, 'grin'], cheer: [-2.8, 2.8, 'grin'], point: [-.1, 1.55, 'smile'], shrug: [-.95, .95, 'flat'] };
function drawHero(cx, fy, M, pose, t) {
  if (M <= 0) return; const [aa, ab, face] = ARMS[pose] || ARMS.idle; let A = aa, Bg = ab;
  if (pose === 'wave') Bg = 2.5 + Math.sin(t * 9) * .35; if (pose === 'cheer') { A = -2.8 + Math.sin(t * 8) * .2; Bg = 2.8 - Math.sin(t * 8) * .2; }
  const legH = 12 * M, bodyH = 12 * M, hs = 8 * M, yL = fy - legH, yB = yL - bodyH, yH = yB - hs;
  R(cx - 5 * M, fy - 1, 10 * M, 2, 'rgba(0,0,0,.18)');
  part(cx - 4 * M, yL, 4 * M, legH, HP.jeans, '#5470c4', HP.jeansSh); part(cx, yL, 4 * M, legH, HP.jeans, '#5470c4', HP.jeansSh);
  R(cx - 4 * M, fy - 3 * M, 4 * M, 3 * M, HP.shoe); R(cx, fy - 3 * M, 4 * M, 3 * M, HP.shoe); R(cx - 4 * M, fy - 3 * M, 4 * M, 1, '#44445a'); R(cx, fy - 3 * M, 4 * M, 1, '#44445a');
  limbDraw(cx - 6 * M, yB + 2 * M, A, 10 * M, 4 * M, HP.hood); limbDraw(cx + 6 * M, yB + 2 * M, Bg, 10 * M, 4 * M, HP.hood);
  part(cx - 4 * M, yB, 8 * M, bodyH, HP.hood, HP.hoodHi, HP.hoodSh);
  const ps = M / 2, g = (x, y, w, h, col) => R(cx - 4 * M + x * ps, yB + y * ps, w * ps, h * ps, col);
  g(6, 0, 4, 1, HP.hoodSh); g(7, 1, 2, 4, '#c9ccdd'); g(3, 15, 10, 6, HP.hoodSh); g(3, 15, 10, 1, '#161a30');
  [[5, 8], [4, 9], [3, 10], [4, 11], [5, 12], [10, 8], [11, 9], [12, 10], [11, 11], [10, 12], [8, 8], [7, 12]].forEach(([x, y]) => g(x, y, 1, 1, HP.or));
  part(cx - 4 * M, yH, 8 * M, hs, HP.skin, null, null); faceCells(face, t).forEach(([x, y, w, h, col]) => R(cx - 4 * M + x * ps, yH + y * ps, w * ps, h * ps, col));
  R(cx - 4 * M, yH, 8 * M, 1, '#00000022');
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



// ---------- Chat pixel ----------
function drawCat(cx, fy, C, t) {
  const o = '#f19a3e', d = '#c6761f', w = '#fff4e0', l = '#ffb865', P = (x, y, ww, hh, col) => R(cx + x * C, fy + y * C, ww * C, hh * C, col);
  P(5, -9, 2, 7, OUT); P(5.4, -8, 1.2, 6, d); // queue
  P(-5, -9, 10, 9, OUT); P(-4, -8, 8, 8, o); P(-2, -7, 4, 7, w); P(-4, -8, 8, 1, l);
  P(-5, -1, 3, 1.5, OUT); P(2, -1, 3, 1.5, OUT); P(-4.5, -1, 2, 1, w); P(2.5, -1, 2, 1, w);
  P(-6, -19, 12, 11, OUT); P(-5, -18, 10, 9, o); P(-5, -18, 10, 1, l);
  P(-6, -22, 3, 4, OUT); P(-5.4, -21.4, 2, 3, d); P(3, -22, 3, 4, OUT); P(3.4, -21.4, 2, 3, d);
  [-3.6, 1.6].forEach(x => { P(x, -15, 2, 2, '#7ad86b'); P(x + (x < 0 ? 1 : 0), -15, 1, 2, '#111'); });
  P(-1, -12.5, 2, 1, '#f08ca0'); P(-2, -11.5, 1, 1, '#5a3a2a'); P(0, -11.5, 1, 1, '#5a3a2a'); P(-6.6, -13, 1.6, .5, '#fff'); P(5, -13, 1.6, .5, '#fff');
}

// ---------- Blocs (cubes qui tombent) ----------
function block(x, y, S, kind, icon, k = 1) {
  if (k <= 0.01) return; const sz = Math.round(S * k), ox = x - sz / 2, oy = y - sz / 2; R(ox - 1, oy - 1, sz + 2, sz + 2, OUT);
  const base = kind === 'orange' ? '#ff8a3d' : kind === 'claude' ? '#f6ead6' : kind === 'ball' ? '#ffffff' : '#ffffff';
  R(ox, oy, sz, sz, base); R(ox, oy, sz, 2, 'rgba(255,255,255,.7)'); R(ox, oy, 2, sz, 'rgba(255,255,255,.5)'); R(ox, oy + sz - 2, sz, 2, 'rgba(0,0,0,.22)'); R(ox + sz - 2, oy, 2, sz, 'rgba(0,0,0,.16)');
  if (kind === 'orange') for (let i = 0; i < 18; i++) R(ox + 2 + Math.floor(rnd(i + icon) * (sz - 5)), oy + 2 + Math.floor(rnd(i * 3 + icon) * (sz - 5)), 2, 2, i % 2 ? '#ffb070' : '#d9691a');
  else if (kind === 'ball') { const c = ox + sz / 2, m = oy + sz / 2, rr = sz / 2 - 3; R(ox, oy, sz, sz, '#dff0ff');
    for (let dy = -rr - 1; dy <= rr + 1; dy++) { const h1 = Math.floor(Math.sqrt(Math.max(0, (rr + 1) * (rr + 1) - dy * dy))); R(c - h1, m + dy, 2 * h1 + 1, 1, OUT); }
    for (let dy = -rr; dy <= rr; dy++) { const h = Math.floor(Math.sqrt(Math.max(0, rr * rr - dy * dy))); R(c - h, m + dy, 2 * h + 1, 1, '#fff'); }
    R(c - 3, m - 2, 6, 5, '#111'); R(c - 2, m - 3, 4, 1, '#111'); R(c - 2, m + 3, 4, 1, '#111');
    [[0, -rr + 2], [rr - 2, -2], [rr - 4, rr - 3], [-rr + 4, rr - 3], [-rr + 2, -2]].forEach(([dx, dy]) => R(c + dx - 1, m + dy - 1, 3, 3, '#111')); }
  else tiny(icon, ox + 3, oy + 3, sz - 6);
}
const COLS = 5, ROWS = 11, STEP = 40, AINAMES = ['openai', 'gemini-color', 'midjourney', 'sora', 'grok', 'deepseek-color', 'meta-color', 'mistral-color', 'perplexity-color', 'copilot-color'];
function drawCells(t) {
  if (t < K.ronds || t > K.base + .6) return; const speed = 38, s = (t - K.ronds) * speed, base = Math.floor(s / STEP), fade = 1 - seg(t, K.remets, K.base + .3);
  for (let i = 0; i < ROWS; i++) { const w = base - i; if (w < 0) continue; const y = -20 + (s - w * STEP);
    for (let c = 0; c < COLS; c++) { const x = 28 + c * 40 + Math.sin(t * 2 + w + c) * 2, kind = (w + c) % 3, m = easeOut(seg(t, K.logoC + c * .06, K.logoC + .7 + c * .06)), fb = pop(t, K.ballon + c * .05, 999, .35, .01), ai = pop(t, K.logosIA + c * .05, 999, .35, .01);
      const kk = fade * Math.min(1, seg(t, K.ronds, K.ronds + .3) + .01), yy = Math.round(y + Math.sin(t * 3 + w * 2 + c) * 1);
      if (kind === 0 && fb > 0) block(x, yy, 32, 'ball', 0, kk * Math.min(1, fb)); else if (kind === 1 && ai > 0) block(x, yy, 32, 'logo', AINAMES[(w * COLS + c) % AINAMES.length], kk * Math.min(1, ai));
      else if (m > .5) block(x, yy, 32, 'claude', 'claude-color', kk * (.6 + .4 * Math.min(1, back(m)))); else block(x, yy, 32, 'orange', w * 7 + c, kk); } }
}

// ---------- Écrans / plaques ----------
function wood(x, y, w, h) { R(x - 6, y - 6, w + 12, h + 12, OUT); R(x - 5, y - 5, w + 10, h + 10, '#8a5a2b'); R(x - 5, y - 5, w + 10, 1, '#b8844a'); R(x - 5, y - 5, 1, h + 10, '#b8844a'); R(x - 5, y + h + 4, w + 10, 1, '#5e3b1b'); R(x + w + 4, y - 5, 1, h + 10, '#5e3b1b'); R(x - 1, y - 1, w + 2, h + 2, '#2a1a0c'); }
function screen(cx, cy, w, h, k, draw) {
  if (k <= 0.01) return; ctx.save(); ctx.translate(cx * PX, cy * PX); ctx.scale(k, k); ctx.translate(-cx * PX, -cy * PX); wood(cx - w / 2, cy - h / 2, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect((cx - w / 2) * PX, (cy - h / 2) * PX, w * PX, h * PX); ctx.clip(); draw(cx - w / 2, cy - h / 2, w, h); ctx.restore(); ctx.restore();
}
function woodSignDraw(label, size, color, font = 'Press Start 2P') {
  return (x, y, w, h) => { ctx.fillStyle = '#9a6a3a'; ctx.fillRect(x * PX, y * PX, w * PX, h * PX); ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let yy = 0; yy < h; yy += 5) ctx.fillRect(x * PX, (y + yy) * PX, w * PX, PX * .6);
    ctx.font = `${size}px "${font}"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1a1208'; ctx.fillText(label, (x + w / 2) * PX + 4, (y + h / 2) * PX + 5); ctx.fillStyle = color; ctx.fillText(label, (x + w / 2) * PX, (y + h / 2) * PX); };
}
const termC = document.createElement('canvas'); termC.width = 1000; termC.height = 780; const codeC = document.createElement('canvas'); codeC.width = 960; codeC.height = 520;
const subC = document.createElement('canvas'); subC.width = 1024; subC.height = 256; const tmpC = document.createElement('canvas'); tmpC.width = 1024; tmpC.height = 256;
function drawTerminal(g, lt, idle) {
  const w = 1000, h = 780, fs = 26, lh = 40, P = { bg: '#1a1816', txt: '#e8e3dc', gray: '#8a847b', dim: '#5c5750', or: '#d77757', grn: '#4ec97a', add: '#12351f', sel: '#34312e' };
  g.clearRect(0, 0, w, h); g.fillStyle = P.bg; g.fillRect(0, 0, w, h); g.textBaseline = 'middle';
  const TX = (s, x, y, col = P.txt, wt = 400, size = fs) => { g.font = `${wt} ${size}px "Fira Code", monospace`; g.fillStyle = col; g.textAlign = 'left'; g.fillText(s, x, y); }, X = 34, cur = Math.floor(lt * 3) % 2 ? ' ' : '█';
  g.fillStyle = P.or; g.fillRect(X + 12, 40, 96, 56); g.fillRect(X, 68, 12, 12); g.fillRect(X + 108, 68, 12, 12); [24, 40, 68, 84].forEach(dx => g.fillRect(X + dx, 96, 12, 14)); g.fillStyle = P.bg; g.fillRect(X + 34, 46, 12, 18); g.fillRect(X + 74, 46, 12, 18);
  TX('Claude Code v2.1', X + 160, 60, P.txt, 700, 24); TX('Opus 5.5 · Claude Max', X + 160, 94, P.gray, 400, 24); TX('~/pub-video', X + 160, 128, P.gray, 400, 24);
  const msg = 'Fais-moi une vidéo', sentAt = 1.8; if (!idle && lt >= sentAt) { g.fillStyle = P.sel; g.fillRect(X - 14, 172, w - 40, 46); TX('> ' + msg, X, 196); }
  if (!idle && lt >= 2.0 && lt < 4.25) TX('✻ Cogitating… (esc to interrupt)', X, 266, P.or);
  [[4.25, 'Write(video.js)', 'Wrote 312 lines to video.js', 266, ['+ const W = 1080, H = 1920;', '+ function renderFrame(t) {']], [5.0, 'Bash(node render.js)', 'video.mp4 rendu ✓', 454, []]].forEach(([a, name, res, py, diff]) => {
    if (idle) return; const q = seg(lt, a, a + .15); if (q <= 0) return; g.globalAlpha = q; TX('●', X, py, P.grn); TX(name, X + 40, py, P.txt, 700);
    if (lt > a + .3) { TX('⎿', X + 20, py + lh, P.gray); TX(res, X + 70, py + lh, P.gray); } if (lt > a + .5) diff.forEach((d, i) => { g.fillStyle = P.add; g.fillRect(X + 70, py + 82 + i * 38, w - 150, 36); TX(d, X + 84, py + 100 + i * 38, P.grn, 400, 22); }); g.globalAlpha = 1; });
  if (!idle && lt >= 5.7) { g.globalAlpha = seg(lt, 5.7, 5.85); TX('●', X, 554, P.or); TX('Ta vidéo est prête !', X + 40, 554, P.txt); g.globalAlpha = 1; }
  g.strokeStyle = P.dim; g.lineWidth = 2; [584, 648].forEach(y => { g.beginPath(); g.moveTo(20, y); g.lineTo(w - 20, y); g.stroke(); }); TX('> ' + (idle ? '' : lt < sentAt ? typed(msg, lt, .35, 14) : '') + cur, X, 618); TX('? for shortcuts', X, 684, P.gray, 400, 22);
}
const CODE = ['const video = new Video();', 'video.add(text, cat, logo);', 'video.render(); // 🎬'];
function drawCode(g, lt) {
  g.fillStyle = '#1f1d2b'; g.fillRect(0, 0, 960, 520); g.textBaseline = 'middle'; g.textAlign = 'left'; const cols = [[/^(const|new)$/, '#f472b6'], [/^(video)$/, '#7dd3fc'], [/^(render|add|Video)$/, '#fde68a']];
  CODE.forEach((l, i) => { const shown = typed(l, lt, .1 + i * .55, 30); g.font = '400 40px "Fira Code", monospace'; let cx = 90; const ly = 110 + i * 120; g.fillStyle = '#4b4b66'; g.fillText(String(i + 1), 30, ly);
    (shown.match(/\w+|\s+|[^\w\s]/gu) || []).forEach(tok => { const c = shown.indexOf('//') >= 0 && cx > 90 + g.measureText(shown.slice(0, shown.indexOf('//'))).width - 2 ? '#6b7280' : (cols.find(([r]) => r.test(tok)) || [0, '#e8e3dc'])[1]; g.fillStyle = c; g.fillText(tok, cx, ly); cx += g.measureText(tok).width; }); });
  if (lt > 1.7) { g.fillStyle = '#e8e3dc'; g.fillText('▍', 90, 470); }
}
function drawCard(x, y, w, h, name, img, p) {
  ctx.fillStyle = '#fff'; ctx.fillRect(x * PX, y * PX, w * PX, h * PX); tiny(img, x + 6, y + 5, w - 12);
  ctx.font = '22px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#111'; ctx.fillText(name, (x + w / 2) * PX, (y + h - 7) * PX);
  if (p > 0) { ctx.strokeStyle = '#e5242d'; ctx.lineWidth = 22; ctx.lineCap = 'butt'; const a = Math.min(1, p * 2), b = Math.max(0, (p - .5) * 2);
    ctx.beginPath(); ctx.moveTo((x + 3) * PX, (y + 3) * PX); ctx.lineTo((x + 3 + (w - 6) * a) * PX, (y + 3 + (h - 6) * a) * PX); ctx.stroke();
    if (b > 0) { ctx.beginPath(); ctx.moveTo((x + w - 3) * PX, (y + 3) * PX); ctx.lineTo((x + w - 3 - (w - 6) * b) * PX, (y + 3 + (h - 6) * b) * PX); ctx.stroke(); } }
}
function drawTV(x, y, w, h, t) {
  ctx.fillStyle = '#16131f'; ctx.fillRect(x * PX, y * PX, w * PX, h * PX); ctx.fillStyle = '#fff'; const cx = (x + w / 2) * PX, cy = (y + h / 2 - 4) * PX;
  ctx.beginPath(); ctx.moveTo(cx - 30, cy - 50); ctx.lineTo(cx - 30, cy + 50); ctx.lineTo(cx + 50, cy); ctx.fill(); ctx.fillStyle = '#ffffff44'; ctx.fillRect((x + 5) * PX, (y + h - 12) * PX, (w - 10) * PX, 10); ctx.fillStyle = '#ff7a2d'; ctx.fillRect((x + 5) * PX, (y + h - 12) * PX, (w - 10) * PX * ((t * .25) % 1), 10);
  ctx.font = '22px "Press Start 2P"'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CETTE VIDÉO', cx, (y + 10) * PX);
}
function drawYT(x, y, w, h) {
  ctx.fillStyle = '#eee'; ctx.fillRect(x * PX, y * PX, w * PX, h * PX); ctx.fillStyle = '#f00'; ctx.fillRect((x + 6) * PX, (y + 5) * PX, (w - 12) * PX, (h - 18) * PX); ctx.fillStyle = '#fff'; const cx = (x + w / 2) * PX, cy = (y + (h - 8) / 2) * PX;
  ctx.beginPath(); ctx.moveTo(cx - 24, cy - 40); ctx.lineTo(cx - 24, cy + 40); ctx.lineTo(cx + 40, cy); ctx.fill(); ctx.fillStyle = '#111'; ctx.font = '20px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('YouTube', (x + w / 2) * PX, (y + h - 5) * PX);
}
// Panneau « ABONNEZ-VOUS ! » : polices, glitch, surbrillance
function drawSubSign(t) {
  const g = subC.getContext('2d'), tg = tmpC.getContext('2d'), font = t < K.police ? 'Press Start 2P' : t < K.autre ? 'Silkscreen' : 'Bungee', size = font === 'Press Start 2P' ? 62 : font === 'Silkscreen' ? 100 : 108;
  tg.clearRect(0, 0, 1024, 256); tg.font = `${size}px "${font}"`; tg.textAlign = 'center'; tg.textBaseline = 'middle';
  const sb = seg(t, K.surb, K.surb + .9), px_ = 512 - 440 + 880 * easeOut(sb), grad = tg.createLinearGradient(px_ - 1, 0, px_ + 1, 0);
  grad.addColorStop(0, sb > 0 ? '#ffe14a' : '#fff'); grad.addColorStop(.5, sb > 0 ? '#ffe14a' : '#fff'); grad.addColorStop(.5, '#fff'); grad.addColorStop(1, '#fff');
  tg.fillStyle = '#1a1208'; tg.fillText('ABONNEZ-VOUS !', 517, 134); tg.fillStyle = grad; tg.fillText('ABONNEZ-VOUS !', 512, 128);
  g.fillStyle = '#9a6a3a'; g.fillRect(0, 0, 1024, 256); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < 256; y += 24) g.fillRect(0, y, 1024, 3);
  if (t >= K.glitch && t < K.glitch + 1.1) { const f = Math.floor(t * 20); g.globalAlpha = .9; g.drawImage(tmpC, -14 - rnd(f) * 12, 0); g.globalAlpha = 1;
    for (let y = 0; y < 256; y += 16) { const sh = rnd(f * 17 + y) > .55 ? (rnd(f + y) - .5) * 90 : 0; g.drawImage(tmpC, 0, y, 1024, 16, sh, y, 1024, 16); } g.fillStyle = 'rgba(0,229,255,.35)'; g.fillRect(0, (rnd(f) * 200) | 0, 1024, 10); }
  else g.drawImage(tmpC, 0, 0);
}
function poof(cx, cy, t0, t) {
  const k = (t - t0) / .7; if (k < 0 || k > 1) return;
  for (let i = 0; i < 20; i++) { const a = rnd(i) * Math.PI * 2, d = easeOut(k) * (14 + rnd(i + 9) * 26), s = Math.max(1, Math.round(5 * (1 - k))); R(cx + Math.cos(a) * d - s / 2, cy + Math.sin(a) * d * .8 + k * k * 8 - s / 2, s, s, i % 3 ? '#fff' : '#9bbcff'); }
}

// ---------- Planning du personnage ----------
const HSEG = [[.05, END_INTRO, 108, 1, 'wave'], [END_INTRO, K.sora - .4, 50, .75, 'idle'], [K.sora - .4, K.ceci, 108, .75, 'idle'], [K.ceci, K.voici, 108, .75, 'cheer'], [K.voici, K.claude, 56, .75, 'point'],
  [K.claude, K.term2 + .5, 48, .75, 'idle'], [K.term2 + .5, K.multi, 108, .75, 'idle'], [K.multi, K.remets, 108, .75, 'cheer'], [K.remets, K.abon, 108, .75, 'shrug'], [K.abon, K.tout + .2, 46, .75, 'idle'],
  [K.tout + .2, K.cc - .1, 108, 0, 'idle'], [K.cc - .1, DURATION + 5, 48, .75, 'wave']];
function heroState(t) {
  let i = HSEG.findIndex(s => t >= s[0] && t < s[1]); if (i < 0) i = HSEG.length - 1; const s = HSEG[i], p = HSEG[Math.max(0, i - 1)], k = smooth(seg(t, s[0], s[0] + .45));
  const sc = i === 0 ? s[3] * Math.max(0, back(seg(t, .05, .4))) : lerp(p[3], s[3], k); return { x: Math.round(i === 0 ? s[2] : lerp(p[2], s[2], k)), sc, pose: s[4] };
}
const quant = (sc, base) => { const m = Math.round(sc * base); return m < 1 ? 0 : m; };

// ---------- Montage ----------
function scenes(t) {
  // éléments derrière les personnages
  const sw = (a, b, f) => { const k = pop(t, a, b, .3, .25); if (k > 0) f(k); };
  sw(K.furax, END_INTRO - .1, k => screen(108, 52, 118, 24, k, woodSignDraw('FURAXDEV', 52, '#ffe14a'))); sw(K.dev, END_INTRO - .1, k => screen(108, 88, 150, 22, k, woodSignDraw('DEV FULL STACK PRO', 30, '#fff')));
  sw(K.voyez, K.elle + .3, k => screen(150, 215, 62, 90, k, (x, y, w, h) => drawTV(x, y, w, h, t)));
  [['SORA', 'sora', K.sora, 40], ['CHATGPT', 'openai', K.chatgpt, 108], ['GEMINI', 'gemini-color', K.gemini, 176]].forEach(([n, img, a, cx]) => sw(a, K.ceci + .3, k => screen(cx, 60 + Math.sin(t * 2 + cx) * 1.5, 50, 58, k, (x, y, w, h) => drawCard(x, y, w, h, n, img, seg(t, a + .45, a + .85)))));
  sw(K.ceci, K.voici + .1, k => { drawCode(codeC.getContext('2d'), t - K.ceci); screen(108, 70, 150, 82, k, (x, y, w, h) => ctx.drawImage(codeC, x * PX, y * PX, w * PX, h * PX)); });
  const tm = pop(t, K.claude, K.la + .35, .3, .35), ti = pop(t, K.term1, K.term2 + .3, .3, .1), tk = Math.max(tm, ti);
  if (tk > 0) { drawTerminal(termC.getContext('2d'), tm > 0 ? t - K.claude : t - K.term1, !(tm > 0)); screen(108, 80, 150, 117, tk, (x, y, w, h) => ctx.drawImage(termC, x * PX, y * PX, w * PX, h * PX)); }
  const sb = pop(t, K.abon, K.tout + .3, .3, .3); if (sb > 0) { drawSubSign(t); screen(108, 60, 164, 41, sb, (x, y, w, h) => ctx.drawImage(subC, x * PX, y * PX, w * PX, h * PX)); }
  sw(K.yt, K.tout + .3, k => screen(160, 200 + Math.sin(t * 5) * 1, 70, 50, k, (x, y, w, h) => drawYT(x, y, w, h)));
  sw(K.cc, DURATION + 5, k => screen(108, 24, 150, 26, k, woodSignDraw('CLAUDE CODE', 40, '#ff9a4d'))); sw(K.abonner, DURATION + 5, k => screen(108, 58, 150, 28, k * (1 + Math.sin(t * 7) * .03), woodSignDraw('ABONNE-TOI', 44, '#ff5555'))); sw(K.ciao, DURATION + 5, k => screen(108, 92, 150, 24, k, woodSignDraw('CIAO LES BG', 38, '#ffe14a')));
}
function characters(t) {
  const h = heroState(t), M = quant(h.sc, 4); if (M > 0) drawHero(h.x, GY + Math.round(h.pose === 'cheer' ? Math.abs(Math.sin(t * 8)) * -3 : 0), M, h.pose, t);
  // mascotte Claude
  let mp = 'idle', mx = 164, mM = 0, mk = 0;
  if (t >= K.claude && t < K.term2 + .5) { mk = pop(t, K.claude + .3, K.term2 + .5, .3, .2); mp = t > K.codeLast ? 'happy' : 'idle'; mx = 124; mM = 4; }
  else if (t >= K.masc && t < K.cc - .1) { mk = pop(t, K.masc, K.cc - .1, .35, .3); mx = 108; mM = 8; mp = t < K.ang ? 'idle' : t < K.sho ? 'angry' : t < K.sad ? 'shock' : t < K.cry ? 'sad' : 'cry'; }
  else if (t >= K.cc - .1) { mk = pop(t, K.cc - .1, DURATION + 5, .3, .01); mx = 166; mM = 4; mp = 'happy'; }
  if (mk > .05) { mascot(mx * PX, GY * PX, mM * PX * Math.min(1, mk), mp, t, 1);
    if (mp === 'cry') for (let i = 0; i < 8; i++) { const side = i % 2 ? 1 : -1, ph = (t * 1.7 + Math.floor(i / 2) / 4) % 1; R(mx + side * (4.5 + (i % 4) * .3) * mM, GY - (5 - ph * 5) * mM, 1.2, 1.8, '#5ec8ff'); } }
  // chat
  const ck = pop(t, K.image, K.limage + .1, .3, .08); if (ck > .1) drawCat(186, GY, Math.max(1, Math.round(3 * Math.min(1, ck))), t);
  poof(186, GY - 20, K.limage + .1, t); poof(108, 80, K.term2 + .2, t); poof(46, GY - 40, K.tout + .2, t); poof(108, 70, K.tout + .2, t); poof(160, 200, K.tout + .25, t);
}

// ---------- Sous-titres style chat Minecraft + HUD ----------
const WORDS = []; TL.words.forEach(w => { const l = WORDS[WORDS.length - 1], s = w.w === 'Véo' ? 'Veo' : w.w; if (l && l.w === 'Furax' && s === 'Dev') { l.w = 'FuraxDev'; l.e = w.e; } else WORDS.push({ w: s, s: w.s, e: w.e }); });
const HL = new Set(['furaxdev', 'sora', 'chatgpt', 'gemini', 'veo', 'code', 'codé', 'claude', 'terminal', 'chat', 'multicolore', 'orange', 'foot', 'ia', 'abonnez-vous', 'glitch', 'youtube', 'surbrillance', 'mascotte', 'énervée', 'choquée', 'triste', 'larmes', 'abonner', 'ciao', 'bg', 'logo', 'logos', 'vidéo']);
const SUBF = '34px "Press Start 2P"'; let GROUPS = null;
function subtitleGroups() { const gr = []; let cur = [], cw = 0; ctx.font = SUBF; const gap = 20;
  WORDS.forEach((w, i) => { const wd = ctx.measureText(w.w).width, pause = i && w.s - WORDS[i - 1].e > .5; if (cur.length && (cur.length >= 3 || cw + gap + wd > 960 || pause)) { gr.push(cur); cur = []; cw = 0; } cur.push(i); cw += (cur.length > 1 ? gap : 0) + wd; }); if (cur.length) gr.push(cur); return gr; }
function subtitles(t) {
  GROUPS = GROUPS || subtitleGroups(); const g = GROUPS.find(gr => t >= WORDS[gr[0]].s - .02 && t < WORDS[gr[gr.length - 1]].e + .3); if (!g) return;
  ctx.font = SUBF; const gap = 20, ws = g.map(i => ctx.measureText(WORDS[i].w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (g.length - 1), y = 1752; let x = W / 2 - total / 2;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(W / 2 - total / 2 - 24, y - 40, total + 48, 80);
  g.forEach((i, j) => { const w = WORDS[i]; if (t >= w.s) { ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3f3f3f'; ctx.fillText(w.w, x + 4, y + 4); ctx.fillStyle = HL.has(w.w.toLowerCase()) ? '#ffff55' : '#fff'; ctx.fillText(w.w, x, y); } x += ws[j] + gap; });
}
function toast(t, a, b, label, col) {
  const k = pop(t, a, b, .2, .15); if (k <= 0) return; ctx.save(); ctx.translate(W / 2, 1640); ctx.scale(k, k); ctx.font = '30px "Press Start 2P"'; const w = ctx.measureText(label).width + 60;
  ctx.fillStyle = '#100010'; ctx.fillRect(-w / 2, -42, w, 84); ctx.strokeStyle = '#2d0a63'; ctx.lineWidth = 6; ctx.strokeRect(-w / 2 + 3, -39, w - 6, 78); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(label, 0, 2); ctx.restore();
}
function hud(t) {
  toast(t, K.ia, K.codeLast, '✖ Pas d\'IA vidéo', '#ff5555'); toast(t, K.codeLast, K.la + .35, '✔ Ça, c\'est codé', '#55ff55');
  [[K.ang, K.sho, 'ÉNERVÉ', '#ff5555'], [K.sho, K.sad, 'CHOQUÉ', '#ffff55'], [K.sad, K.cry, 'TRISTE', '#55aaff'], [K.cry, K.cc - .1, 'EN LARMES', '#aaaaff']].forEach(([a, b, s, c]) => toast(t, a, b, s, c));
  toast(t, K.police, K.autre, 'Police : Silkscreen', '#ffff55'); toast(t, K.autre, K.glitch, 'Police : Bungee', '#ffff55'); toast(t, K.glitch, K.surb, 'Effet : glitch', '#ff55ff'); toast(t, K.surb, K.yt, 'Effet : surbrillance', '#ffff55');
  subtitles(t);
  ctx.fillStyle = '#2b2b2b'; ctx.fillRect(180, 1850, 720, 22); ctx.fillStyle = '#80ff20'; ctx.fillRect(184, 1854, 712 * t / DURATION, 14); ctx.fillStyle = '#fff'; ctx.fillRect(184, 1854, 712 * t / DURATION, 3);
}
function renderFrame(t) { drawBackground(t); drawCells(t); drawGround(); scenes(t); characters(t); hud(t); }
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all([...['Press Start 2P', 'Silkscreen', 'Bungee', 'Fira Code'].map(f => document.fonts.load(`40px "${f}"`)), ...logoLoads]).then(makeTiny);
if (!location.search.includes('render')) {
  const audio = new Audio('voice.wav'), hudEl = document.getElementById('hud'); let t0 = null;
  document.body.onclick = () => { t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
  window.ready.then(() => (function loop(now) { if (t0 === null) t0 = now; const t = ((now - t0) / 1000) % DURATION; renderFrame(t); hudEl.textContent = `${t.toFixed(2)}s — clic pour relancer avec le son`; requestAnimationFrame(loop); })(performance.now()));
}

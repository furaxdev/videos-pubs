// Short 9:16 « Pourquoi c'est horrible de naître avec un grand front ? »
// Dessins plats (canvas), personnages originaux. Chaque animation est déclenchée par un mot de la voix off (timeline.js).
const W = 1080, H = 1920, TL = window.TIMELINE, DURATION = TL.duration, CHANNEL = '@FuraxDev';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const INK = '#3b2a2a', SKIN = '#f6c9a0', SKIN2 = '#c98a5e', RED = '#e5484d', YEL = '#ffd23f', BLUE = '#35b6d8';
const FONT = 'Fredoka', HAND = 'Kalam';

// ---------- Outils ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3), easeIn = x => x * x * x, easeIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function pop(t, a, b, fin = .28, fout = .2) { if (t < a || t >= b) return 0; return Math.max(0, back(seg(t, a, a + fin)) * (1 - easeIn(seg(t, b - fout, b)))); }
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function text(s, x, y, size, color, font = FONT, align = 'center', weight = 700) {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}
function outlined(s, x, y, size, fill, lw = 14, font = FONT) {
  ctx.font = `700 ${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.strokeText(s, x, y); ctx.fillStyle = fill; ctx.fillText(s, x, y);
}
function shape(fill, lw = 8) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 8, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, 7); shape(fill, lw); }

// ---------- Repères tirés de la voix off ----------
const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
function T(word, n = 0) { let c = 0; for (const w of TL.words) if (norm(w.w) === norm(word)) { if (c === n) return w.s; c++; } throw new Error('mot introuvable : ' + word); }
const K = {
  plage: T('plage'), soleil: T('soleil'), bien: T('bien'), allonges: T("t'allonges"), mouette: T('mouette', 0), regarde: T('regarde', 0), ralentit: T('ralentit'),
  descend: T('descend'), atterr: T('Atterrissage'), toi: T('toi', 0), aero: T('aéroport'), magn: T('Magnifique'), parce: T('Parce'), cerveau: T('cerveau'),
  ca: T('Ça'), ligne: T('ligne'), haute: T('haute'), et2: T('Et', 0), plate: T('plate'), ciel: T('ciel'), donc: T('donc'), soleil2: T('soleil', 1),
  vingt: T('vingt'), rouge: T('rouge'), feu: T('feu'), pote: T('pote'), inquiete: T("T'inquiète"), creme: T('crème'), super: T('Super'), tube: T('tube'),
  casquette: T('casquette'), tombe: T('tombe'), bonnet: T('bonnet'), glisse: T('glisse'), regardes: T('regardes'), mouette3: T('mouette', 2), la2: T('La', 5),
  poser: T('poser'), abonne: T('Abonne-toi'),
};
const S = { hook: 0, plage: T('Tu', 0) - .15, couch: T('Tu', 1) - .15, aero: T('Ton', 1) - .15, fact: K.parce - .2, red: T('Au', 1) - .2, pote: T('Ton', 2) - .15, hats: T('Tu', 3) - .15,
  stare: T('Tu', 5) - .15, punch: T('Le', 1) - .15, outro: K.abonne - .15 };

// ---------- Personnage original : un enfant avec un très grand front ----------
function head(x, y, s, expr, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.tilt || 0);
  const RX = o.fh === false ? 175 : 190, RY = o.fh === false ? 190 : 235, EY = o.fh === false ? 20 : 60, skin = o.skin || SKIN;
  ell(-RX + 5, EY + 15, 32, 42, skin, 8); ell(RX - 5, EY + 15, 32, 42, skin, 8);                              // oreilles
  ctx.beginPath(); ctx.ellipse(0, 0, RX, RY, 0, 0, 7); shape(skin, 9);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, RX, RY, 0, 0, 7); ctx.clip();
  if (o.red) { const g = ctx.createLinearGradient(0, -RY, 0, EY - 40); g.addColorStop(0, `rgba(229,40,40,${.8 * o.red})`); g.addColorStop(1, `rgba(229,40,40,${.35 * o.red})`); ctx.fillStyle = g; ctx.fillRect(-RX, -RY, RX * 2, RY + EY - 40); }
  const hair = o.hair || '#5b341f';                                                                           // cheveux
  if (o.fh === false) { ctx.fillStyle = hair; ctx.fillRect(-RX, -RY, RX * 2, 110); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-150 + i * 60, -85, 38, 0, 7); ctx.fill(); } ctx.fillRect(-RX, -90, 30, 130); ctx.fillRect(RX - 30, -90, 30, 130); }
  else { ctx.fillStyle = hair; ctx.beginPath(); ctx.moveTo(-RX, -RY + 70); ctx.quadraticCurveTo(-100, -RY + 40, 0, -RY + 52); ctx.quadraticCurveTo(100, -RY + 40, RX, -RY + 70); ctx.lineTo(RX, -RY - 5); ctx.lineTo(-RX, -RY - 5); ctx.fill();
    ctx.fillRect(-RX, EY - 50, 34, 120); ctx.fillRect(RX - 34, EY - 50, 34, 120); }
  ctx.restore(); ctx.beginPath(); ctx.ellipse(0, 0, RX, RY, 0, 0, 7); shape(null, 9);
  if (o.fh !== false) { ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-RX + 12, -RY + 78); ctx.quadraticCurveTo(-100, -RY + 42, 0, -RY + 54); ctx.quadraticCurveTo(100, -RY + 42, RX - 12, -RY + 78); ctx.stroke(); }
  // visage
  const blink = (t % 3.4) < .12, blush = 'rgba(255,120,130,.55)';
  ctx.fillStyle = blush; [-1, 1].forEach(d => { ctx.beginPath(); ctx.ellipse(d * 112, EY + 75, 34, 21, 0, 0, 7); ctx.fill(); });
  const eye = (d) => { const ex = d * 68;
    if (expr === 'shock') { ell(ex, EY, 40, 48, '#fff', 7); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + Math.sin(t * 30) * 2, EY, 9, 0, 7); ctx.fill(); }
    else if (expr === 'flat') { ell(ex, EY, 28, 34, '#fff', 7); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + (o.look || 0) * 10, EY + 8, 11, 0, 7); ctx.fill(); ctx.fillStyle = skin; ctx.fillRect(ex - 34, EY - 40, 68, 38); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(ex - 32, EY - 2); ctx.lineTo(ex + 32, EY - 2); ctx.stroke(); }
    else if (expr === 'happy' || blink) { ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(ex, EY + 8, 26, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else if (expr === 'cry') { ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - d * 30, EY - 18); ctx.lineTo(ex + d * 22, EY + 2); ctx.lineTo(ex - d * 30, EY + 22); ctx.stroke(); }
    else { ell(ex, EY, 25, 34, INK, 0); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex - 7 + (o.look || 0) * 8, EY - 11, 9, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(ex + 8, EY + 11, 4, 0, 7); ctx.fill(); } };
  eye(-1); eye(1);
  ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round';                                              // sourcils
  const brow = (d, a, y) => { ctx.beginPath(); ctx.moveTo(d * 40, EY - y + a); ctx.lineTo(d * 100, EY - y - a); ctx.stroke(); };
  if (expr === 'shock') { brow(-1, -4, 62); brow(1, -4, 62); } else if (expr === 'flat') { brow(-1, 0, 52); brow(1, 0, 52); } else if (expr === 'cry' || expr === 'sad') { brow(-1, 14, 50); brow(1, 14, 50); } else { brow(-1, -6, 56); brow(1, -6, 56); }
  const my = EY + 105;                                                                                          // bouche
  if (expr === 'shock') { ell(0, my + 8, 26, 36, '#7a1f2b', 7); }
  else if (expr === 'cry' || expr === 'grin') { ctx.beginPath(); ctx.moveTo(-62, my - 14); ctx.bezierCurveTo(-50, my + 90, 50, my + 90, 62, my - 14); ctx.closePath(); shape('#7a1f2b', 7); ell(0, my + 42, 30, 17, '#f58aa0', 0); }
  else if (expr === 'happy') { ctx.beginPath(); ctx.arc(0, my - 24, 52, .12 * Math.PI, .88 * Math.PI); shape(null, 8); }
  else if (expr === 'flat') { ctx.beginPath(); ctx.moveTo(-34, my + 6); ctx.lineTo(34, my + 6); shape(null, 8); }
  else if (expr === 'sad') { ctx.beginPath(); ctx.arc(0, my + 40, 38, 1.15 * Math.PI, 1.85 * Math.PI); shape(null, 8); }
  else { ctx.beginPath(); ctx.arc(0, my - 22, 40, .15 * Math.PI, .85 * Math.PI); shape(null, 8); }
  if (o.sweat) { const p = (t * 1.3) % 1; ell(RX - 40, -80 + p * 90, 15, 24, '#8fdcff', 6); }
  if (expr === 'cry') for (const d of [-1, 1]) for (let j = 0; j < 3; j++) { const p = (t * 1.5 + j / 3) % 1; ell(d * (82 + p * 22), EY + 30 + p * 190, 13, 20, '#7fd2ff', 5); }
  if (o.cap) cap(o.cap);
  ctx.restore();
}
function cap(c) { // casquette ou bonnet posé (c = {kind, x, y, rot})
  ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot || 0);
  if (c.kind === 'cap') { ctx.beginPath(); ctx.ellipse(0, 0, 112, 78, 0, Math.PI, 0); ctx.closePath(); shape('#3b82f6', 8); ell(100, 0, 90, 20, '#2563eb', 8); ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(0, -50, 12, 0, 7); ctx.fill(); }
  else { ctx.beginPath(); ctx.ellipse(0, 0, 118, 88, 0, Math.PI, 0); ctx.closePath(); shape('#ef4444', 8); rrect(-122, -6, 244, 40, 18); shape('#fca5a5', 8); ell(0, -92, 26, 26, '#fff', 7); }
  ctx.restore();
}
function kid(x, fy, s, expr, t, o = {}) { // corps complet ; (x, fy) = pieds
  ctx.save(); ctx.translate(x, fy); ctx.scale(s * (o.sx || 1), s * (o.sy || 1));
  const bob = o.walk ? Math.abs(Math.sin(t * 9)) * -18 : Math.sin(t * 5) * 3; ctx.translate(0, bob);
  const leg = d => { ctx.save(); ctx.translate(d * 48, -135); if (o.walk) ctx.rotate(Math.sin(t * 9) * .35 * d); rrect(-30, 0, 60, 135, 26); shape(SKIN, 8); ell(8 * d, 135, 52, 24, '#fff', 8); ctx.restore(); };
  leg(-1); leg(1); rrect(-112, -230, 224, 120, 40); shape(o.shorts || '#ff7a45', 8);
  rrect(-104, -360, 208, 160, 54); shape(o.shirt || YEL, 8); ctx.strokeStyle = 'rgba(59,42,42,.15)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-90, -300); ctx.lineTo(90, -300); ctx.moveTo(-90, -250); ctx.lineTo(90, -250); ctx.stroke();
  const arm = (d, ang, len = 150) => { ctx.save(); ctx.translate(d * 100, -330); ctx.rotate(-ang * d); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, len); ctx.lineWidth = 50; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 36; ctx.strokeStyle = SKIN; ctx.stroke(); ell(0, len + 8, 30, 30, SKIN, 7); ctx.restore(); };
  const wv = Math.sin(t * 10) * .25;
  if (o.arms === 'wave') { arm(-1, .35); arm(1, 2.4 + wv); } else if (o.arms === 'up') { arm(-1, 2.7); arm(1, 2.7); } else if (o.arms === 'sad') { arm(-1, .12); arm(1, .12); } else { arm(-1, .3 + Math.sin(t * 5) * .03); arm(1, .3 + Math.sin(t * 5) * .03); }
  ctx.beginPath(); ctx.rect(-40, -420, 80, 70); shape(SKIN, 8);
  head(0, -560, 1, expr, t, o); ctx.restore();
}

// ---------- Mouette ----------
function gull(x, y, s, rot, flap, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (o.flip ? -1 : 1), s);
  if (o.legs !== false) { ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 10; ctx.lineCap = 'round'; [-22, 18].forEach(lx => { ctx.beginPath(); ctx.moveTo(lx, 58); ctx.lineTo(lx + 4, 105); ctx.lineTo(lx + 24, 108); ctx.stroke(); }); }
  const wing = (back_) => { ctx.save(); ctx.translate(-10, -10); ctx.rotate((back_ ? -1 : 1) * (.6 + Math.sin(flap) * .7)); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -150, -170, -110); ctx.quadraticCurveTo(-120, -50, -60, 20); ctx.closePath(); shape(back_ ? '#b6c2d0' : '#d5deea', 8); ctx.restore(); };
  wing(true); ell(0, 5, 125, 78, '#fff', 8); ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(-190, -22); ctx.lineTo(-175, 30); ctx.closePath(); shape('#d5deea', 8);
  ell(92, -40, 48, 46, '#fff', 8); ctx.beginPath(); ctx.moveTo(128, -48); ctx.lineTo(205, -30); ctx.lineTo(130, -14); ctx.closePath(); shape('#fbbf24', 8);
  const lk = o.look || 0; ell(100, -58, 15, 17, '#fff', 5); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(104 + lk * 5, -56 + Math.abs(lk) * 4, 7, 0, 7); ctx.fill();
  wing(false); ctx.restore();
}

// ---------- Décors ----------
function sunburst(t, c1, c2) {
  ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H); ctx.fillStyle = c2; const n = 18;
  for (let i = 0; i < n; i += 2) { const a = i / n * Math.PI * 2 + t * .25, b = (i + 1) / n * Math.PI * 2 + t * .25; ctx.beginPath(); ctx.moveTo(540, 800); ctx.arc(540, 800, 1700, a, b); ctx.closePath(); ctx.fill(); }
}
function beach(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, '#7cc8ff'); g.addColorStop(1, '#d9f2ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 920);
  const sr = (o.sun || 1) * 110, sx = 880, sy = 250; ctx.fillStyle = '#ffd23f';
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t * .3; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a - .08) * (sr + 8), sy + Math.sin(a - .08) * (sr + 8)); ctx.lineTo(sx + Math.cos(a) * (sr + 55), sy + Math.sin(a) * (sr + 55)); ctx.lineTo(sx + Math.cos(a + .08) * (sr + 8), sy + Math.sin(a + .08) * (sr + 8)); ctx.fill(); }
  ell(sx, sy, sr, sr, '#ffb703', 8);
  if (o.sunFace) { ell(sx - sr * .35, sy - 10, 10, 14, INK, 0); ell(sx + sr * .35, sy - 10, 10, 14, INK, 0); ctx.beginPath(); ctx.arc(sx, sy + 15, sr * .4, .15 * Math.PI, .85 * Math.PI); shape(null, 7); }
  if (o.shades) { rrect(sx - sr * .72, sy - 38, sr * .62, 40, 14); shape(INK, 5); rrect(sx + sr * .1, sy - 38, sr * .62, 40, 14); shape(INK, 5); }
  [[170, 200, 1], [560, 120, .8]].forEach(([cx, cy, k], i) => { const x = cx + Math.sin(t * .3 + i) * 30; ctx.fillStyle = '#fff'; [[0, 0, 70], [60, 12, 55], [-60, 14, 50]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(x + dx * k, cy + dy * k, r * k, 0, 7); ctx.fill(); }); });
  ctx.fillStyle = BLUE; ctx.fillRect(0, 900, W, 200);
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  for (let r = 0; r < 3; r++) { ctx.beginPath(); for (let x = -20; x <= W + 20; x += 20) { const y = 940 + r * 55 + Math.sin(x * .02 + t * 2 + r) * 12; ctx[x < 0 ? 'moveTo' : 'lineTo'](x, y); } ctx.stroke(); }
  ctx.fillStyle = '#f7dc8c'; ctx.beginPath(); ctx.moveTo(0, 1085); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 1070 + Math.sin(x * .01 + 1) * 14); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  ctx.fillStyle = 'rgba(190,150,70,.35)'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(rnd(i) * W, 1130 + rnd(i + 7) * 780, 6 + rnd(i + 3) * 8, 0, 7); ctx.fill(); }
}
function bubble(txt, x, y, w, h, tx, ty, k, size = 56, fill = '#fff') {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 40); ctx.moveTo(tx - 30 - x, h / 2 - 4); ctx.lineTo(tx - x, ty - y); ctx.lineTo(tx + 30 - x, h / 2 - 4); shape(fill, 8);
  ctx.fillStyle = fill; rrect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 34); ctx.fill();
  const lines = txt.split('\n'); lines.forEach((l, i) => text(l, 0, (i - (lines.length - 1) / 2) * size * 1.15, size, INK)); ctx.restore();
}
function burst(x, y, r, k, label, col = YEL) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(-.1); ctx.scale(k, k); ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, rr = i % 2 ? r * .7 : r; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); shape(col, 8);
  outlined(label, 0, 0, r * .42, '#fff', 12); ctx.restore();
}
function emoji(e, x, y, size, k = 1, rot = 0) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.font = `${size}px "Noto Color Emoji"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(e, 0, 0); ctx.restore(); }

// ---------- Sous-titres : minuscules, mot par mot ----------
const WORDS = TL.words.map(w => ({ w: w.w.replace(/\.$/, ''), s: w.s, e: w.e }));
const HL = new Set(['front', 'mouette', 'soleil', 'aéroport', 'cerveau', 'rouge', 'crème', 'tube', 'casquette', 'bonnet', 'abonne-toi', 'gratuit', 'atterrissage', 'magnifique', 'super', 'plage']);
const SUBF = `700 76px ${FONT}`;
const GROUPS = []; (function () { let cur = [], cw = 0; const gap = 22; ctx.font = SUBF;
  WORDS.forEach((w, i) => { const wd = ctx.measureText(w.w).width, pause = i && w.s - WORDS[i - 1].e > .5;
    if (cur.length && (cur.length >= 3 || cw + gap + wd > 900 || pause)) { GROUPS.push(cur); cur = []; cw = 0; } cur.push(i); cw += (cur.length > 1 ? gap : 0) + wd; });
  if (cur.length) GROUPS.push(cur); })();
function subtitles(t) {
  const g = GROUPS.find(gr => t >= WORDS[gr[0]].s - .02 && t < WORDS[gr[gr.length - 1]].e + .3); if (!g) return;
  ctx.font = SUBF; const gap = 22, ws = g.map(i => ctx.measureText(WORDS[i].w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (g.length - 1); let x = W / 2 - total / 2;
  g.forEach((i, j) => { const w = WORDS[i], k = t >= w.s ? back(seg(t, w.s, w.s + .13)) : 0;
    if (k > 0) { ctx.save(); ctx.translate(x + ws[j] / 2, 1590); ctx.scale(k, k); ctx.font = SUBF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = 18; ctx.strokeStyle = INK; ctx.strokeText(w.w, 0, 0); ctx.fillStyle = HL.has(w.w.toLowerCase()) ? YEL : '#fff'; ctx.fillText(w.w, 0, 0); ctx.restore(); }
    x += ws[j] + gap; });
}

// ---------- Scènes ----------
const GX = 540, FY = 1480;                // position du perso au sol
function sceneHook(t) {
  sunburst(t, '#ffe27a', '#ffc94a');
  const k = pop(t, .1, S.plage + .1, .35, .15), fr = seg(t, K.front0 || 1.7, 2.3);
  kid(GX, 1500, .95, 'happy', t, { arms: 'wave' });
  bubble('Pourquoi c\'est horrible de\nnaître avec un grand front ?', GX, 330, 960, 250, GX, 560, k, 62);
  if (fr > 0) { ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(GX, 1500 - 560 * .95 - 120, 205, 150, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * easeOut(fr)); ctx.stroke(); ctx.restore(); }
}
K.front0 = T('front', 0);
function scenePlage(t) {
  const sun = 1 + .35 * pop(t, T('Grand'), S.couch, .4, .2);
  beach(t, { sun, sunFace: t > T('Grand'), shades: t > T('Grand') + .3 });
  const x = lerp(-250, GX, easeOut(seg(t, S.plage + .1, K.plage + .6)));
  const arrived = t > K.plage + .6; kid(x, FY, .85, 'happy', t, { walk: !arrived, arms: t > K.bien ? 'wave' : 'down' });
  emoji('👍', 800, 1000, 130, pop(t, K.bien, S.couch, .25, .2), -.2);
}
function sceneCouch(t) {
  beach(t, { sun: 1.3, sunFace: true, shades: true });
  rrect(130, 1360, 820, 150, 30); shape('#ff6b8b', 8); ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) ctx.fillRect(190 + i * 130, 1366, 60, 138);
  const landed = t > K.atterr + .35, sq = landed ? 1 - .1 * Math.exp(-(t - K.atterr - .35) * 9) * Math.cos((t - K.atterr - .35) * 30) : 1;
  const expr = landed ? 'shock' : 'happy';
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1380); ctx.clip(); kid(GX, 1500, .85, expr, t, { arms: 'sad', sy: sq, sweat: landed }); ctx.restore();
  rrect(130, 1360, 820, 150, 30); ctx.save(); ctx.globalAlpha = 0; ctx.restore();
  rrect(130, 1360, 820, 150, 30); shape('#ff6b8b', 8); ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) ctx.fillRect(190 + i * 130, 1366, 60, 138);
  // mouette : arrive, observe, ralentit, descend, atterrit sur le front
  const topY = 1500 - 795 * .85, landY = topY - 62; let gx, gy, rot = 0, look = 0;
  if (t < K.regarde) { const p = seg(t, K.mouette, K.regarde); gx = lerp(-200, 760, easeOut(p)); gy = lerp(380, 480, p) + Math.sin(t * 5) * 14; }
  else if (t < K.descend) { gx = 560 + Math.sin(t * 1.6) * 30; gy = 480 + Math.sin(t * 2) * 12; look = 1; }
  else if (t < K.atterr + .35) { const p = easeIO(seg(t, K.descend, K.atterr + .35)); gx = lerp(560, GX + 10, p); gy = lerp(480, landY, p); look = 1; rot = p * .12; }
  else { gx = GX + 10; gy = landY + Math.max(0, 8 * Math.exp(-(t - K.atterr - .35) * 8) * Math.sin((t - K.atterr) * 40)); }
  const fly = t < K.atterr + .35; if (t >= K.mouette) gull(gx, gy, .6, rot, fly ? t * (t < K.ralentit ? 18 : 8) : 0, { look, legs: !fly || t > K.descend });
  if (t > K.regarde && t < K.descend) { ctx.save(); ctx.setLineDash([14, 16]); ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(gx + 60, gy + 30); ctx.lineTo(GX, topY + 40); ctx.stroke(); ctx.restore(); }
  burst(GX + 200, 760, 150, pop(t, K.atterr + .35, K.toi + .8, .25, .3), 'POF !', '#ff7a45');
}
function sceneAero(t) {
  beach(t, { sun: 1.3, sunFace: true, shades: true });
  rrect(130, 1360, 820, 150, 30); ctx.restore; const p = pop(t, S.aero, S.fact + .1, .3, .2);
  const flat = t > K.aero - 1 ? 'flat' : 'shock';
  kid(GX, 1500, .85, flat, t, { arms: 'sad', look: Math.sin(t * 2) });
  ctx.save(); ctx.beginPath(); ctx.rect(0, 1360, W, 600); ctx.clip(); rrect(130, 1360, 820, 150, 30); shape('#ff6b8b', 8); ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) ctx.fillRect(190 + i * 130, 1366, 60, 138); ctx.restore();
  const topY = 1500 - 795 * .85;
  // piste d'atterrissage sur le front
  const rk = easeOut(seg(t, K.aero - .6, K.aero + .2)); if (rk > 0) { ctx.save(); ctx.translate(GX, topY + 130); ctx.scale(.85 * rk, .85); rrect(-60, -170, 120, 260, 18); shape('#4b5563', 7); ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) ctx.fillRect(-6, -150 + i * 62, 12, 34); ctx.restore(); }
  gull(GX + 10, topY - 62, .6, 0, 0, { look: 0 });
  for (let i = 0; i < 3; i++) { const a = t * (1 + i * .3) + i * 2.1; emoji('✈️', GX + Math.cos(a) * 380, 780 + Math.sin(a) * 120 - i * 50, 90, pop(t, S.aero + .5 + i * .3, S.fact, .3, .3), a + 1.57); }
  ctx.save(); ctx.translate(GX, 360); ctx.rotate(-.04); const k = pop(t, K.aero, S.fact, .3, .25); ctx.scale(k, k); rrect(-380, -85, 760, 170, 40); shape('#fff', 8); text('✈️ AÉROPORT DU FRONT', 0, 0, 62, RED); ctx.restore();
  emoji('👏', GX + 280, 1000, 140, pop(t, K.magn, S.fact, .25, .2), .2);
}
function chalk(s, x, y, size, color = '#f5f5f0', k = 1, align = 'center') { if (k <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, k); text(s, x, y, size, color, HAND, align, 700); ctx.restore(); }
function sceneFact(t) {
  ctx.fillStyle = '#2f5d50'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#8b5a2b'; ctx.lineWidth = 36; ctx.strokeRect(18, 18, W - 36, 1380);
  ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let i = 0; i < 60; i++) ctx.fillRect(rnd(i) * W, rnd(i + 5) * 1400, 90, 4);
  chalk('Grand front', 540, 200, 96, '#fff', seg(t, K.parce, K.parce + .4)); chalk('= gros cerveau ?', 540, 320, 96, '#fff', seg(t, K.parce + .3, K.parce + .8));
  const xk = easeOut(seg(t, K.cerveau, K.cerveau + .35)); if (xk > 0) { ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(240, 240); ctx.lineTo(240 + 600 * xk, 240 + 130 * xk); ctx.moveTo(840, 240); ctx.lineTo(840 - 600 * xk, 240 + 130 * xk); ctx.stroke(); ctx.restore(); emoji('🧠', 540, 450, 130, pop(t, K.cerveau, K.ca + .2)); }
  // schéma : la ligne des cheveux monte
  const hk = pop(t, K.ca, S.red, .3, .3), hy = lerp(-110, -205, easeIO(seg(t, K.haute - .3, K.haute + .8)));
  if (hk > 0) { ctx.save(); ctx.translate(540, 900); ctx.scale(hk, hk);
    head(0, 0, .95, t > K.haute + .6 ? 'flat' : 'happy', t, { fh: true });
    ctx.save(); ctx.scale(.95, .95); ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 9; ctx.setLineDash([22, 14]); ctx.beginPath(); ctx.moveTo(-250, hy); ctx.lineTo(250, hy); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    ctx.restore(); chalk('ligne des cheveux', 540, 560, 54, '#7dd3fc', seg(t, K.ligne, K.ligne + .3)); chalk(t > K.haute ? '⬆ plus haute' : '', 800, 740, 56, '#fde68a', seg(t, K.haute, K.haute + .3)); }
  // soleil sur la surface plate
  const sk = pop(t, K.et2, S.red + .1, .3, .3); if (sk > 0) { emoji('☀️', 880, 460, 170 * sk); ctx.save(); ctx.strokeStyle = '#fde047'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const p = ((t * 1.2 + i / 4) % 1); ctx.globalAlpha = 1 - p * .5; ctx.beginPath(); ctx.moveTo(lerp(820, 600, p), lerp(520, 700, p)); ctx.lineTo(lerp(800, 580, p), lerp(560, 740, p)); ctx.stroke(); } ctx.restore(); }
  chalk('surface plate', 220, 680, 54, '#fde68a', seg(t, K.plate, K.plate + .3)); chalk('face au ciel', 220, 750, 54, '#fde68a', seg(t, K.ciel - .4, K.ciel));
  const uv = pop(t, K.donc + .4, S.red + .1, .3, .3); burst(850, 1130, 150, uv, 'UV !', '#ff7a45');
  chalk('zone la plus exposée', 540, 1320, 62, '#fff', seg(t, K.donc, K.donc + .4));
}
function trafficLight(x, y, k, lit) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); rrect(-70, -170, 140, 340, 30); shape('#374151', 8);
  ['#ef4444', '#f59e0b', '#22c55e'].forEach((c, i) => { ell(0, -100 + i * 100, 40, 40, i === lit ? c : '#1f2937', 6); if (i === lit) { ctx.save(); ctx.globalAlpha = .45; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, -100 + i * 100, 66, 0, 7); ctx.fill(); ctx.restore(); } }); ctx.restore();
}
function sceneRed(t) {
  beach(t, { sun: 1.4, sunFace: true, shades: true });
  const r = easeIO(seg(t, S.red + .2, K.rouge + .3));
  kid(GX + 100, FY, .85, t > K.rouge ? 'flat' : 'happy', t, { red: r, arms: 'sad', sweat: r > .5, look: Math.sin(t) });
  const sk = pop(t, K.vingt, K.rouge + .2, .3, .2); if (sk > 0) { ctx.save(); ctx.translate(250, 560); ctx.scale(sk, sk); rrect(-170, -95, 340, 190, 34); shape('#fff', 8); text('⏱ 20 min', 0, 0, 68, INK); ctx.restore(); }
  trafficLight(190, 960, pop(t, K.feu - .2, S.pote, .3, .2), 0);
  if (t > K.rouge) for (let i = 0; i < 4; i++) { const p = ((t * 1.1 + i / 4) % 1); ctx.save(); ctx.globalAlpha = (1 - p) * .8; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(GX + 100 - 130 + i * 90, 760 - p * 160, 22 + p * 26, 0, 7); ctx.fill(); ctx.restore(); }
}
function tubeDraw(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-60, -140); ctx.lineTo(60, -140); ctx.lineTo(90, 150); ctx.lineTo(-90, 150); ctx.closePath(); shape('#fef3c7', 8);
  ctx.fillStyle = '#f59e0b'; ctx.fillRect(-84, 70, 168, 50); rrect(-35, -200, 70, 64, 14); shape('#ef4444', 8); text('SPF', 0, 10, 54, '#f59e0b'); text('50', 0, 80, 50, INK); ctx.restore(); }
function scenePote(t) {
  beach(t, { sun: 1.4, sunFace: true, shades: true });
  kid(300, FY, .72, t > K.super ? 'flat' : 'sad', t, { red: 1, arms: 'sad', sweat: true });
  kid(790, FY, .72, 'happy', t, { fh: false, skin: SKIN2, hair: '#2b1b12', shirt: '#6ee7b7', shorts: '#60a5fa', arms: t > K.creme - .3 ? 'wave' : 'down' });
  tubeDraw(700, 1110, .55, -.3);
  bubble('T\'inquiète,\nmets de la crème !', 700, 560, 560, 220, 780, 790, pop(t, K.inquiete, K.super - .1, .3, .2), 54);
  bubble('Super.', 290, 650, 330, 130, 300, 820, pop(t, K.super, K.tube - .3, .25, .2), 60);
  const tk = easeOut(seg(t, K.tube - .2, K.tube + .8)); if (tk > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, tk * 2) * (1 - seg(t, S.hats - .3, S.hats)); tubeDraw(GX, 760 + (1 - tk) * 900, 1.9 * tk, Math.sin(t * 3) * .05 + .2); ctx.restore(); }
}
function sceneHats(t) {
  beach(t, { sun: 1.4, sunFace: true, shades: true });
  const cA = K.casquette, fall = seg(t, K.tombe, K.tombe + .7), bA = K.bonnet, slide = seg(t, K.glisse, K.glisse + .9);
  let c = null;
  if (t >= cA && t < bA - .1) c = { kind: 'cap', x: lerp(0, 150, easeIn(fall)) , y: lerp(-222 - (1 - easeOut(seg(t, cA, cA + .35))) * 700, 520, easeIn(fall)), rot: lerp(0, 1.4, easeIn(fall)) };
  else if (t >= bA) c = { kind: 'beanie', x: lerp(0, -170, easeIn(slide)), y: lerp(-222 - (1 - easeOut(seg(t, bA, bA + .35))) * 700, 260, easeIn(slide)), rot: lerp(0, -.9, easeIn(slide)) };
  kid(GX, FY, .85, t > K.tombe ? 'flat' : 'happy', t, { red: 1, arms: 'sad', cap: c && c.y < 440 ? c : null, sweat: true });
  if (t >= K.tombe + .5 && t < bA) { ctx.save(); ctx.translate(GX + 300, 1560); ctx.rotate(1.6); ctx.scale(.45, .45); cap({ kind: 'cap', x: 0, y: 0 }); ctx.restore(); }
}
function sceneStare(t) {
  ctx.fillStyle = '#ffd1a1'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(229,72,77,.25)'; ctx.lineWidth = 14; const z = (t * 3) % 1;
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(540 + Math.cos(a) * 260, 760 + Math.sin(a) * 260); ctx.lineTo(540 + Math.cos(a) * (900 + z * 40), 760 + Math.sin(a) * (900 + z * 40)); ctx.stroke(); }
  const zoom = 1 + .25 * seg(t, K.la2, K.la2 + 1.6);
  head(330, 800, .85 * zoom, 'flat', t, { red: 1, look: 1, sweat: true });
  gull(790, 800, .85 * zoom, 0, 0, { look: -1, flip: true, legs: false });
  const sk = pop(t, K.mouette3, S.punch, .3, .2); emoji('👁️', 540, 480, 120, sk * (1 + Math.sin(t * 8) * .08));
}
function scenePunch(t) {
  beach(t, { sun: 1.2, sunFace: true });
  const lp = easeIn(seg(t, K.poser - .2, K.poser + .45)), hap = t > K.poser + .35;
  const topY = 1500 - 795 * .85;
  kid(GX, FY, .85, hap ? 'happy' : 'flat', t, { red: .6, arms: 'sad' });
  const gy = t < K.poser - .2 ? 420 + Math.sin(t * 4) * 18 : lerp(420, topY - 62, lp);
  gull(GX + 10, gy, .6, 0, t < K.poser + .4 ? t * 12 : 0, { legs: t > K.poser + .3 });
  for (let i = 0; i < 6; i++) { const p = ((t * .5 + i / 6) % 1); emoji('❤️', 200 + i * 135 + Math.sin(t * 3 + i) * 20, 1200 - p * 800, 70, hap ? Math.sin(p * Math.PI) : 0); }
  burst(GX + 210, 760, 130, pop(t, K.poser + .45, K.abonne, .25, .25), 'POF !', '#ff7a45');
}
function sceneOutro(t) {
  sunburst(t, '#ffe27a', '#ffc94a');
  kid(GX, 1500, .85, 'happy', t, { arms: 'wave', red: .25 }); const topY = 1500 - 795 * .85; gull(GX + 10, topY - 62 + Math.sin(t * 5) * 4, .6, 0, 0);
  const k = pop(t, K.abonne, 999, .3, .01) * (1 + Math.sin(t * 7) * .03);
  if (k > 0) { ctx.save(); ctx.translate(GX, 330); ctx.scale(k, k); ctx.shadowColor = 'rgba(59,42,42,.4)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10; rrect(-360, -100, 720, 200, 100); ctx.fillStyle = '#ff0033'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
    outlined('🔔 S\'ABONNER', 0, 0, 84, '#fff', 14); ctx.restore(); }
  const k2 = pop(t, T('gratuit') - .1, 999, .3, .01); if (k2 > 0) { ctx.save(); ctx.translate(GX, 520); ctx.rotate(-.04); ctx.scale(k2, k2); rrect(-300, -60, 600, 120, 40); shape('#fff', 8); text('c\'est gratuit 🎁', 0, 0, 60, INK); ctx.restore(); }
  text(CHANNEL, GX, 1700, 70, INK);
}

function renderFrame(t) {
  const f = t < S.plage ? sceneHook : t < S.couch ? scenePlage : t < S.aero ? sceneCouch : t < S.fact ? sceneAero : t < S.red ? sceneFact : t < S.pote ? sceneRed
    : t < S.hats ? scenePote : t < S.stare ? sceneHats : t < S.punch ? sceneStare : t < S.outro ? scenePunch : sceneOutro;
  ctx.save(); const starts = [0, S.plage, S.couch, S.aero, S.fact, S.red, S.pote, S.hats, S.stare, S.punch, S.outro], st = starts.filter(s => s <= t).pop();
  const sk = seg(t, st, st + .18); if (st > 0 && sk < 1) { ctx.translate(0, (1 - easeOut(sk)) * 80); ctx.globalAlpha = sk; }
  f(t); ctx.restore(); subtitles(t);
  ctx.fillStyle = '#ff7a45'; ctx.fillRect(0, 0, W * t / DURATION, 8);
}
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all([FONT, HAND].map(f => document.fonts.load(`40px ${f}`)).concat([document.fonts.load('40px "Noto Color Emoji"')]));
if (!location.search.includes('render')) {
  const audio = new Audio('voice.wav'), hud = document.getElementById('hud'); let t0 = null;
  document.body.onclick = () => { t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
  window.ready.then(() => (function loop(now) { if (t0 === null) t0 = now; const t = ((now - t0) / 1000) % DURATION; renderFrame(t); hud.textContent = `${t.toFixed(2)}s — clic pour relancer avec le son`; requestAnimationFrame(loop); })(performance.now()));
}

// Vidéo de test — charte FuraxDev : police Roboto Condensed ExtraBold, palette bleue (3), fenêtre « terminal classique »,
// icônes pixel art, avatar manga. Tout est une fonction du temps t ; chaque animation est déclenchée par un mot de la voix off.
const W = 1080, H = 1920, TL = window.TIMELINE, DURATION = TL.duration, cv = document.getElementById('c'), ctx = cv.getContext('2d');
const BLUE = '#4d7cff', LBLUE = '#9ab4ff', WHITE = '#ffffff', INK = '#0e1122', ORANGE = '#d77757', GREEN = '#3dffa0', RED = '#ff4d5e';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3), easeIn = x => x * x * x, back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const typed = (s, t, a, cps) => s.slice(0, Math.floor(clamp((t - a) * cps, 0, s.length)));
const pop = (t, a, b, fin = .28, fout = .2) => (t < a || t >= b) ? 0 : Math.max(0, back(seg(t, a, a + fin)) * (1 - easeIn(seg(t, b - fout, b))));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
function T(word, n = 0) { let c = 0; for (const w of TL.words) if (norm(w.w) === norm(word)) { if (c === n) return w.s; c++; } throw new Error('mot introuvable : ' + word); }
const K = { salut: T('Salut'), furax: T('FuraxDev'), vid: T('vidéo', 0), montee: T('montée'), codee: T('codée'), decris: T('décris'), claude: T('Claude'), ecrit: T('écrit'), teste: T('teste'),
  deploie: T('déploie'), resultat: T('Résultat'), quelques: T('quelques'), minutes: T('minutes'), pas: T('Pas', 1), ia: T('IA'), deux: T('deux'), mois: T('mois'), abonne: T('Abonne-toi') };
const IMG = {}; const loads = Object.entries(window.ASSETS).map(([k, src]) => new Promise(r => { const i = new Image(); i.onload = r; i.src = src; IMG[k] = i; }));
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function text(s, x, y, size, color, font = 'RC', align = 'left', weight = 800, ls = -.035) { ctx.font = `${weight} ${size}px ${font}`; ctx.letterSpacing = (size * ls).toFixed(1) + 'px'; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); ctx.letterSpacing = '0px'; }

// ---------- Fond : bleu nuit + grille bleue ----------
function bg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2e3552'); g.addColorStop(.55, '#161b33'); g.addColorStop(1, INK); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const st = 90, off = (t * 26) % st; ctx.strokeStyle = 'rgba(77,124,255,.16)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = -st + off; x < W + st; x += st) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = -st + off; y < H + st; y += st) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
  const v = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1300); v.addColorStop(0, 'rgba(14,17,34,0)'); v.addColorStop(1, 'rgba(14,17,34,.7)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
// ---------- Typographie : petite ligne + MOT GÉANT (style de la vidéo de référence, sans glow) ----------
function big(small, word, wordColor, y, t0, t1, strike = 0) {
  const k = Math.min(easeOut(seg(tt, t0, t0 + .35)), 1 - easeIn(seg(tt, t1 - .25, t1))); if (k <= .01) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 60);
  if (small) text(small, 70, y, 66, WHITE); let size = 270; ctx.font = `800 ${size}px RC`; ctx.letterSpacing = (-size * .035) + 'px'; let w = ctx.measureText(word).width; ctx.letterSpacing = '0px'; if (w > 940) size = Math.floor(size * 940 / w);
  text(word, 1010, y + 215, size, wordColor, 'RC', 'right');
  if (strike > 0) { ctx.strokeStyle = RED; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(120, y + 230 - size * .3); ctx.lineTo(120 + 880 * easeOut(strike), y + 230 - size * .3 - 10); ctx.stroke(); }
  ctx.restore();
}
// ---------- Fenêtre : terminal classique ----------
function terminal(t0, t1, lines) {
  const k = pop(tt, t0, t1, .3, .25); if (k <= .01) return; const x = 90, y = 660, w = 900, h = 330;
  ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-W / 2, -(y + h / 2));
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; rr(x, y, w, h, 22); ctx.fillStyle = '#0b0d1a'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#262c4a'; ctx.lineWidth = 3; ctx.stroke(); ctx.save(); rr(x, y, w, h, 22); ctx.clip(); ctx.fillStyle = '#171b30'; ctx.fillRect(x, y, w, 58); ctx.restore();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 38 + i * 36, y + 29, 11, 0, 7); ctx.fill(); }); text('terminal', x + w / 2, y + 37, 24, '#9aa4c8', 'FC', 'center', 700, 0);
  const cur = Math.floor(tt * 3) % 2 ? ' ' : '█';
  lines.forEach(([a, s, col, cps], i) => { const shown = typed(s, tt, a, cps); if (shown.length === 0 && tt < a) return; const done = shown.length >= s.length; text(shown + (i === lines.length - 1 || !done ? cur : ''), x + 40, y + 125 + i * 56, 36, col, 'FC', 'left', 700, 0); });
  ctx.restore();
}
function icon(name, cx, cy, size, k) { const i = IMG['icon:' + name]; if (!i || k <= .01) return; ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.imageSmoothingEnabled = false; ctx.drawImage(i, -size / 2, -size / 2, size, size); ctx.restore(); }
// ---------- Avatar : les poses se succèdent ----------
const POSES = [[0, '01-salut'], [K.vid, '02-bras-croises'], [K.codee, '03-pointe'], [K.decris - .1, '04-ordinateur-mac'], [K.ecrit - .1, '03-pointe'], [K.resultat - .2, '06-victoire'], [K.pas - .2, '07-haussement-epaules'], [K.abonne - .2, '08-pouce']];
function avatar(t) {
  let i = 0; POSES.forEach(([a], j) => { if (t >= a) i = j; }); const [a, nm] = POSES[i], im = IMG['pose:' + nm], k = back(seg(t, a, a + .35));
  // petit rebond doux (sans étirement) : lent, faible amplitude
  const ph = (t * 2) % 1, air = Math.sin(ph * Math.PI), jump = air * 22, sy = 1, sx = 1, tilt = 0;
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,' + (.28 - air * .15) + ')'; ctx.beginPath(); ctx.ellipse(W / 2, 1890, 190 - air * 18, 22 - air * 3, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(W / 2, 1900 + (1 - Math.min(1, k)) * 120 - jump); ctx.rotate(tilt); const s = Math.min(1, .5 + .5 * k); ctx.scale(s * sx, s * sy); ctx.drawImage(im, -im.width / 2, -im.height, im.width, im.height); ctx.restore();
}
let tt = 0;
function renderFrame(t) {
  tt = t; bg(t); avatar(t);
  big('salut, c\'est', 'FURAXDEV', BLUE, 180, 0.0, K.vid - .1);
  big('cette vidéo, je ne l\'ai pas', 'MONTÉE', WHITE, 180, K.vid, K.codee - .1, seg(t, K.montee + .2, K.montee + .6));
  big('je l\'ai', 'CODÉE', BLUE, 180, K.codee - .05, K.decris - .1); const kc = pop(t, K.codee + .2, K.decris - .1); icon('code', 150, 620, 190, kc); icon('terminal', 930, 620, 190, kc);
  big('tu décris ton idée à', 'CLAUDE CODE', WHITE, 180, K.decris - .1, K.ecrit - .15); const km = pop(t, K.claude, K.ecrit - .15); icon('claude-code', 540, 520, 260, km);
  terminal(K.decris + .1, K.ecrit - .15, [[K.decris + .3, '$ claude', BLUE, 12], [K.decris + .9, '> Fais-moi une vidéo', WHITE, 16]]);
  big('il écrit le code,', 'ÉCRIT', BLUE, 180, K.ecrit - .1, K.teste - .05); icon('code', 540, 560, 250, pop(t, K.ecrit, K.teste - .05));
  big('il', 'TESTE', WHITE, 180, K.teste - .05, K.deploie - .1); icon('valide', 540, 560, 250, pop(t, K.teste, K.deploie - .1));
  big('et il', 'DÉPLOIE', BLUE, 180, K.deploie - .1, K.resultat - .25); icon('fusee', 540, 560, 250, pop(t, K.deploie, K.resultat - .25));
  big('résultat : une vidéo complète en', 'MINUTES', BLUE, 180, K.resultat - .1, K.pas - .25); icon('horloge', 540, 640, 230, pop(t, K.minutes - .6, K.pas - .25));
  big('une IA vidéo à', '200 $/MOIS', WHITE, 180, K.pas - .1, K.abonne - .3, seg(t, K.mois - .2, K.mois + .3));
  big('abonne-toi', 'MERCI !', BLUE, 180, K.abonne - .1, DURATION + 1); icon('cloche', 540, 620, 250, pop(t, K.abonne, DURATION + 1, .3, .01));
  ctx.fillStyle = BLUE; ctx.fillRect(0, 0, W * t / DURATION, 10);   // barre de progression
}
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all([document.fonts.load('800 40px RC'), document.fonts.load('700 40px FC'), ...loads]);

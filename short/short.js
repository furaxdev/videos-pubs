// Short YouTube 9:16 — "Claude Code remplace les IA à 200€/mois". Tout est fonction du temps t (s).
const W = 1080, H = 1920, DURATION = 28;
const CHANNEL = '@FuraxDev';
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const C = { bg: '#fff7ee', ink: '#17141f', red: '#e11d48', orange: '#d97757', cream: '#fff7ee', green: '#16a34a', dim: '#6b6578' };
const F = { anton: 'Anton', bangers: 'Bangers', bebas: '"Bebas Neue"', marker: '"Permanent Marker"', grotesk: '"Space Grotesk"', code: '"Fira Code"' };

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const life = (t, a, b, f = .3) => Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b));
const lerp = (a, b, k) => a + (b - a) * k;

function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function text(s, x, y, size, color, font = F.anton, align = 'center', weight = 400) {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
function glow(s, x, y, size, color, shadowC, font = F.anton) {
  ctx.save(); ctx.shadowColor = 'rgba(23,20,31,.22)'; ctx.shadowOffsetY = 8; ctx.shadowBlur = 14; text(s, x, y, size, color, font); ctx.restore();
}
function typed(s, t, a, cps) { return s.slice(0, Math.floor(clamp((t - a) * cps, 0, s.length))); }

// Secousses d'écran déclenchées sur les impacts
const SLAMS = [.2, .9, 1.6, 4.2, 4.9, 5.6, 8.0, 9.0, 11.3, 12.0, 12.7, 21.8];
function shake(t) {
  let a = 0; for (const s of SLAMS) if (t >= s) a += 7 * Math.exp(-(t - s) * 9) * (t - s < .6 ? 1 : 0);
  return [Math.sin(t * 90) * a, Math.cos(t * 77) * a];
}

// ---------- Fond : grille (rouge = danger → orange Claude) ----------
function background(t) {
  const k = easeOut(seg(t, 8, 9));
  ctx.fillStyle = `rgb(${lerp(255, 255, k) | 0},${lerp(236, 247, k) | 0},${lerp(232, 238, k) | 0})`; ctx.fillRect(0, 0, W, H);
  const step = 90, off = (t * 45) % step;
  ctx.lineWidth = 1.8; ctx.strokeStyle = `rgba(${lerp(225, 217, k) | 0},${lerp(29, 119, k) | 0},${lerp(72, 87, k) | 0},.2)`;
  ctx.beginPath();
  for (let x = -step + off; x < W + step; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = -step + off; y < H + step; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
}

// ---------- 1. Accroche ----------
function scene1(t) {
  const a = life(t, 0, 3.9, .01) * (1 - seg(t, 3.5, 3.9));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const lines = [['TU PAIES', 150, C.ink, F.bebas, 560, .2], ['200$/MOIS', 190, C.red, F.anton, 800, .9], ['POUR UNE IA ?', 150, C.ink, F.bebas, 1080, 1.6]];
  for (const [s, size, col, font, y, t0] of lines) {
    const k = back(seg(t, t0, t0 + .25)); if (k <= 0) continue;
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(k, k);
    glow(s, 0, 0, size, col, '', font); ctx.restore();
  }
  if (t > 2.3) { const k = back(seg(t, 2.3, 2.7)); ctx.save(); ctx.translate(W / 2, 1380); ctx.rotate(Math.sin(t * 8) * .08); ctx.scale(k, k);
    text('🤨', 0, 0, 260, '#fff'); ctx.restore(); }
  ctx.restore();
}

// ---------- 2. Cartes de prix qui tombent ----------
const CARDS = [['CHATGPT PRO', 200, 4.2, -3], ['MIDJOURNEY', 60, 4.9, 2.5], ['SORA', 20, 5.6, -2]];
const TOTAL = CARDS.reduce((a, c) => a + c[1], 0);
function scene2(t) {
  const a = life(t, 3.8, 8, .25); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  CARDS.forEach(([name, price, t0, rot], i) => {
    const k = seg(t, t0 - .35, t0), y = lerp(-300, 470 + i * 270, k * k * (3 - 2 * k) * 0 + (k < 1 ? k * k : 1));
    const bounce = t > t0 ? Math.exp(-(t - t0) * 7) * Math.sin((t - t0) * 30) * 14 : 0;
    ctx.save(); ctx.translate(W / 2, y + bounce); ctx.rotate(rot * Math.PI / 180);
    ctx.shadowColor = 'rgba(23,20,31,.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; rrect(-440, -105, 880, 210, 36); ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.stroke();
    text(name, -400, 0, 84, C.ink, F.bebas, 'left');
    text(price + '$', 400, -8, 130, C.red, F.anton, 'right');
    text('/mois', 400, 62, 36, C.dim, F.grotesk, 'right', 700);
    ctx.restore();
  });
  if (t > 6) {
    const n = Math.round(TOTAL * easeOut(seg(t, 6, 7.2))), s = 1 + Math.sin(t * 25) * .015;
    ctx.save(); ctx.translate(W / 2, 1450); ctx.scale(s, s);
    text('TOTAL', 0, -200, 70, C.dim, F.bebas);
    glow(n + '$', 0, 0, 280, C.red, '', F.anton);
    text('PAR MOIS 💸', 0, 170, 90, C.ink, F.bebas); ctx.restore();
  }
  for (let i = 0; i < 7 && t > 6; i++) { // billets qui s'envolent
    const p = ((t - 6) * .5 + i / 7) % 1; text('💸', 120 + i * 140 + Math.sin(i * 3 + t * 2) * 40, 1790 - p * 300, 90, '#fff');
  }
  ctx.restore();
}

// ---------- 3. STOP ----------
function scene3(t) {
  const a = life(t, 8, 9.25, .08) * (1 - seg(t, 9.0, 9.25)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; const k = back(seg(t, 8, 8.25));
  ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.rotate(-.06);
  ctx.lineJoin = 'round'; ctx.font = `400 440px ${F.bangers}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 34; ctx.strokeStyle = C.ink; ctx.strokeText('STOP.', 0, 0);
  ctx.fillStyle = C.red; ctx.fillText('STOP.', 0, 0); ctx.restore();
}

// ---------- Logo Claude ----------
const logoImg = new Image(); logoImg.src = window.CLAUDE_LOGO;
function logo(cx, cy, size, rot = 0, alpha = 1) {
  if (!logoImg.complete) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(217,119,87,.45)'; ctx.shadowBlur = 40; ctx.drawImage(logoImg, -size / 2, -size / 2, size, size); ctx.restore();
}

// ---------- 4. Claude Code ----------
function scene4(t) {
  const a = life(t, 9, 14.6, .3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 3; i++) { const k = seg(t, 9 + i * .15, 10.4 + i * .15);
    if (k > 0 && k < 1) { ctx.strokeStyle = `rgba(217,119,87,${1 - k})`; ctx.lineWidth = 8 * (1 - k); ctx.beginPath(); ctx.arc(W / 2, 520, easeOut(k) * 900, 0, 7); ctx.stroke(); } }
  const s = back(seg(t, 9, 9.7)); logo(W / 2, 520, 380 * s, t * .8, s > 0 ? 1 : 0);
  const name = 'CLAUDE CODE'; ctx.font = `700 124px ${F.grotesk}`; const full = ctx.measureText(name).width; let cx = W / 2 - full / 2;
  [...name].forEach((ch, i) => { const k = easeOut(seg(t, 9.6 + i * .04, 9.9 + i * .04)), w = ctx.measureText(ch).width;
    ctx.save(); ctx.globalAlpha *= k; glow(ch, cx + w / 2, 890 - (1 - k) * 80, 124, C.ink, '', F.grotesk); ctx.restore(); cx += w; });
  [['IL CODE.', 1150, 11.3], ['IL DÉBUG.', 1320, 12.0], ['IL DÉPLOIE.', 1490, 12.7]].forEach(([s, y, t0], i) => {
    const k = back(seg(t, t0, t0 + .22)); if (k <= 0) return;
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(k, k); glow(s, 0, 0, 140, i === 2 ? C.orange : C.ink, '', F.bebas); ctx.restore();
  });
  ctx.restore();
}

// ---------- 5. Terminal ----------
function scene5(t) {
  const a = life(t, 14.4, 20, .3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - easeOut(seg(t, 14.4, 15))) * 300);
  const x = 60, y = 500, w = 960, h = 900, fs = 28, K = { bg: '#1f1d1b', txt: '#e8e3dc', gray: '#8a847b', or: '#d77757', grn: '#4ec97a' };
  ctx.save(); ctx.shadowColor = 'rgba(23,20,31,.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; rrect(x, y, w, h, 30); ctx.fillStyle = K.bg; ctx.fill(); ctx.restore();
  [C.red, '#f59e0b', C.green].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 46 + i * 38, y + 42, 11, 0, 7); ctx.fill(); });
  text('claude — ~/saas', x + w / 2, y + 42, 24, K.gray, F.code, 'center');
  const T = (s, px, py, col = K.txt, wt = 400) => text(s, px, py, fs, col, F.code, 'left', wt);
  // Bandeau d'accueil avec la mascotte
  ctx.strokeStyle = K.or; ctx.lineWidth = 2.5; rrect(x + 40, y + 90, w - 80, 190, 14); ctx.stroke();
  ['  ▐▛███▜▌', ' ▝▜█████▛▘', '   ▘▘ ▝▝'].forEach((l, i) => T(l, x + 70, y + 140 + i * 30, K.or));
  T('Claude Code', x + 330, y + 140, K.txt, 700); T('Opus 5.5', x + 330, y + 176, K.gray); T('~/saas', x + 330, y + 212, K.gray);
  // Ce que l'utilisateur a envoyé
  const sent = t >= 16.7, cur = Math.floor(t * 3) % 2 ? ' ' : '█';
  const msg = 'Crée-moi un SaaS complet avec auth + paiement';
  if (sent) { ctx.fillStyle = '#2d2a27'; rrect(x + 40, y + 310, w - 80, 56, 8); ctx.fill(); T('> ' + msg, x + 58, y + 338, K.txt); }
  const sp = '✻✽✶✳'[Math.floor(t * 8) % 4];
  if (t >= 17 && t < 17.4) T(sp + ' Pondering… (esc to interrupt)', x + 40, y + 420, K.or);
  const tools = [[17.4, 'Write(app/api/checkout/route.ts)', 'Wrote 48 lines'], [18.1, 'Bash(npm test)', '58 tests passed ✓'], [18.8, 'Bash(vercel --prod)', 'Deployed to production 🚀']];
  tools.forEach(([t0, name, res], i) => { const k = seg(t, t0, t0 + .15); if (k <= 0) return; const py = y + 420 + i * 110;
    ctx.save(); ctx.globalAlpha *= k; T('●', x + 40, py, K.grn); T(name, x + 80, py, K.txt, 700);
    if (t > t0 + .3) { T('⎿', x + 60, py + 44, K.gray); T(res, x + 110, py + 44, K.gray); } ctx.restore(); });
  // Zone de saisie
  const iy = y + h - 150; ctx.strokeStyle = '#4a4540'; ctx.lineWidth = 2; rrect(x + 40, iy, w - 80, 70, 12); ctx.stroke();
  const typedMsg = t < 16.7 ? typed(msg, t, 15.1, 30) : '';
  T('> ' + typedMsg + (t < 16.7 ? cur : ''), x + 62, iy + 36, K.txt);
  T('? for shortcuts', x + 50, iy + 105, K.gray);
  ctx.restore();
}

// ---------- 6. Les IA chères = inutiles ----------
function scene6(t) {
  const a = life(t, 19.8, 24, .3); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const k1 = easeOut(seg(t, 19.9, 20.3)); ctx.save(); ctx.globalAlpha *= k1;
  text('LES IA À 200$/MOIS', W / 2, 560 - (1 - k1) * 40, 130, C.ink, F.bebas);
  text('(ET PLUS)', W / 2, 700, 90, C.dim, F.bebas); ctx.restore();
  const s = seg(t, 20.8, 21.5); // trait de feutre
  if (s > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(110, 600); ctx.lineTo(110 + 860 * easeOut(s), 520 + 80 * easeOut(s)); ctx.stroke(); ctx.shadowBlur = 0; }
  const k = back(seg(t, 21.8, 22.1)); if (k > 0) { ctx.save(); ctx.translate(W / 2, 1020); ctx.rotate(-.1); ctx.scale(k, k);
    glow('INUTILES.', 0, 0, 170, C.red, '', F.marker); ctx.restore(); }
  const k3 = easeOut(seg(t, 22.5, 23)); ctx.save(); ctx.globalAlpha *= k3;
  text('Claude Code suffit.', W / 2, 1350 + (1 - k3) * 30, 90, C.ink, F.grotesk, 'center', 700);
  logo(W / 2, 1560, 200 * back(seg(t, 22.5, 23)), t); ctx.restore();
  ctx.restore();
}

// ---------- 7. CTA ----------
function scene7(t) {
  const a = seg(t, 23.8, 24.2) * (1 - seg(t, 27.5, 28)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  logo(W / 2, 460, 260 * back(seg(t, 23.8, 24.4)), Math.sin(t * 2) * .15);
  const k = back(seg(t, 24.2, 24.6)), g = ctx.createLinearGradient(100, 0, 980, 0); g.addColorStop(0, '#f59e0b'); g.addColorStop(1, C.red);
  ctx.save(); ctx.translate(W / 2, 820); ctx.scale(k, k); glow('ABONNE-TOI', 0, 0, 230, g, '', F.anton); ctx.restore();
  text('pour la suite', W / 2, 1000, 80, C.ink, F.marker);
  const b = back(seg(t, 25, 25.4)), pulse = 1 + Math.sin(t * 7) * .035;
  if (b > 0) { ctx.save(); ctx.translate(W / 2, 1230); ctx.scale(b * pulse, b * pulse);
    ctx.shadowColor = 'rgba(225,29,72,.4)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; rrect(-340, -85, 680, 170, 85); ctx.fillStyle = '#ff0033'; ctx.fill(); ctx.shadowColor = 'transparent';
    text('S\'ABONNER', 40, 4, 100, '#fff', F.bebas); text('🔔', -220, 0, 90, '#fff'); ctx.restore(); }
  text(CHANNEL, W / 2, 1450, 90, C.ink, F.grotesk, 'center', 700);
  ctx.restore();
}

function renderFrame(t) {
  background(t);
  const [sx, sy] = shake(t); ctx.save(); ctx.translate(sx, sy);
  scene1(t); scene2(t); scene3(t); scene4(t); scene5(t); scene6(t); scene7(t);
  ctx.restore();
  ctx.fillStyle = C.orange; ctx.fillRect(0, 0, W * t / DURATION, 8); // barre de progression
}
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all(Object.values(F).map(f => document.fonts.load(`40px ${f}`))).then(() => logoImg.decode());

if (!location.search.includes('render')) {
  const audio = new Audio('music.wav'), hud = document.getElementById('hud'); let t0 = null;
  document.body.onclick = () => { t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
  window.ready.then(() => (function loop(now) {
    if (t0 === null) t0 = now; const t = ((now - t0) / 1000) % DURATION;
    renderFrame(t); hud.textContent = `${t.toFixed(2)}s — clic pour relancer avec le son`; requestAnimationFrame(loop);
  })(performance.now()));
}

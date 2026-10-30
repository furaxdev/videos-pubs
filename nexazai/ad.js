// NexazAI — pub "code to video". Tout est une fonction pure du temps t (secondes).
const W = 1920, H = 1080, DURATION = 30;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const C = { bg: '#05060f', violet: '#7c3aed', cyan: '#22d3ee', pink: '#f472b6', text: '#e5e7eb', dim: '#6b7280' };
const SANS = 'Inter, sans-serif', MONO = '"JetBrains Mono", monospace';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
// fenêtre d'apparition/disparition d'une scène
const life = (t, a, b, f = .4) => Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b));

function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function text(s, x, y, size, color, weight = 800, font = SANS, align = 'center') {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
function glowText(s, x, y, size, color, glow, weight = 900) {
  ctx.save(); ctx.shadowColor = glow; ctx.shadowBlur = 40; text(s, x, y, size, color, weight); ctx.restore();
  text(s, x, y, size, color, weight);
}
function gradText(s, x, y, size, weight = 900) {
  ctx.font = `${weight} ${size}px ${SANS}`;
  const w = ctx.measureText(s).width, g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, C.cyan); g.addColorStop(.5, C.violet); g.addColorStop(1, C.pink);
  ctx.save(); ctx.shadowColor = C.violet; ctx.shadowBlur = 50; text(s, x, y, size, g, weight); ctx.restore();
}

// ---------- Fond : grille ----------
function background(t, pulse) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const step = 80, off = (t * 40) % step;
  ctx.lineWidth = 1;
  for (let x = -step + off; x < W + step; x += step) {
    ctx.strokeStyle = `rgba(124,58,237,${.18 + pulse * .3})`;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = -step + off; y < H + step; y += step) {
    ctx.strokeStyle = `rgba(34,211,238,${.12 + pulse * .3})`;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  const v = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1100);
  v.addColorStop(0, 'rgba(5,6,15,0)'); v.addColorStop(1, 'rgba(5,6,15,.95)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ---------- Scène 1 : accroche ----------
function typed(s, t, a, cps) { return s.slice(0, Math.floor(clamp((t - a) * cps, 0, s.length))); }
function scene1(t) {
  const l1 = 'Des heures à débugger ?', l2 = 'Il existe mieux.';
  ctx.globalAlpha = 1 - seg(t, 3.6, 4);
  const cur = Math.floor(t * 3) % 2 ? '' : '▍';
  if (t < 2) text(typed(l1, t, .2, 16) + cur, W / 2, H / 2, 96, C.text, 800, MONO);
  else {
    const g = seg(t, 2, 2.15), j = (1 - g) * 30;
    ctx.globalCompositeOperation = 'lighter';
    text(l2, W / 2 - j, H / 2, 120, C.pink); text(l2, W / 2 + j, H / 2, 120, C.cyan);
    ctx.globalCompositeOperation = 'source-over';
    glowText(l2, W / 2, H / 2, 120, '#fff', C.violet);
  }
  ctx.globalAlpha = 1;
}

// ---------- Scène 2 : éditeur, l'IA écrit le code ----------
const PROMPT = 'Crée une API de paiement sécurisée';
const CODE = [
  "import express from 'express';",
  "import Stripe from 'stripe';",
  "",
  "const app = express();",
  "const stripe = new Stripe(process.env.STRIPE_KEY);",
  "",
  "// Paiement sécurisé, validé par NexazAI",
  "app.post('/pay', async (req, res) => {",
  "  const { amount, currency } = req.body;",
  "  if (!amount || amount <= 0) return res.status(400).end();",
  "  const intent = await stripe.paymentIntents.create({",
  "    amount, currency: currency ?? 'eur',",
  "  });",
  "  res.json({ secret: intent.client_secret });",
  "});",
  "",
  "app.listen(3000);",
];
const KW = /^(import|from|const|new|async|await|return|if|true|false)$/;
function tokens(line) {
  if (line.trim().startsWith('//')) return [[line, C.dim]];
  const out = [], re = /('[^']*'|\d+|[A-Za-z_$][\w$]*|\s+|.)/g; let m;
  while ((m = re.exec(line))) {
    const s = m[0], next = line[re.lastIndex];
    out.push([s, s[0] === "'" ? '#a3e635' : /^\d/.test(s) ? '#fb923c' : KW.test(s) ? C.pink : next === '(' ? C.cyan : /^[A-Z]/.test(s) ? '#facc15' : C.text]);
  }
  return out;
}
function scene2(t) {
  const a = life(t, 4, 10.2, .5);
  if (a <= 0) return;
  const zoom = 0.92 + easeOut(seg(t, 4, 10)) * .1 + Math.pow(seg(t, 9.6, 10.2), 3) * 2;
  ctx.save(); ctx.globalAlpha = a;
  ctx.translate(W / 2, H / 2 + (1 - easeOut(seg(t, 4, 4.8))) * 200); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
  const x = 260, y = 120, w = 1400, h = 840;
  ctx.save(); ctx.shadowColor = C.violet; ctx.shadowBlur = 80;
  rrect(x, y, w, h, 24); ctx.fillStyle = 'rgba(13,14,28,.96)'; ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(124,58,237,.6)'; ctx.lineWidth = 2; rrect(x, y, w, h, 24); ctx.stroke();
  ['#ef4444', '#f59e0b', '#22c55e'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 36 + i * 30, y + 32, 9, 0, 7); ctx.fill(); });
  text('nexaz — server.ts', x + w / 2, y + 32, 22, C.dim, 400, MONO);
  // barre de prompt
  rrect(x + 30, y + 70, w - 60, 70, 14); ctx.fillStyle = 'rgba(124,58,237,.15)'; ctx.fill();
  ctx.strokeStyle = C.violet; ctx.stroke();
  text('✦', x + 70, y + 105, 30, C.cyan, 700, SANS);
  const p = typed(PROMPT, t, 4.6, 26);
  text(p + (t < 6 && Math.floor(t * 3) % 2 ? '▍' : ''), x + 100, y + 105, 30, '#fff', 600, SANS, 'left');
  // code
  const start = 6.1, lps = 6.2, shown = (t - start) * lps;
  ctx.font = `400 26px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  CODE.forEach((line, i) => {
    const k = clamp(shown - i); if (k <= 0) return;
    const ly = y + 185 + i * 38;
    text(String(i + 1).padStart(2), x + 40, ly, 22, '#374151', 400, MONO, 'left');
    let cx = x + 100; const chars = Math.floor(line.length * k); let used = 0;
    ctx.font = `400 26px ${MONO}`;
    for (const [s, col] of tokens(line)) {
      const part = s.slice(0, Math.max(0, chars - used)); used += s.length;
      ctx.fillStyle = col; ctx.fillText(part, cx, ly); cx += ctx.measureText(s).width;
      if (used >= chars) break;
    }
  });
  // badge
  const b = back(seg(t, 9, 9.4));
  if (b > 0) {
    ctx.save(); ctx.translate(x + w - 200, y + h - 60); ctx.scale(b, b);
    rrect(-170, -32, 340, 64, 32); ctx.fillStyle = '#16a34a'; ctx.fill();
    text('✓ Généré en 2,3 s', 0, 0, 28, '#fff', 800); ctx.restore();
  }
  ctx.restore();
}

// ---------- Logo ----------
function logo(cx, cy, r, t, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy);
  ctx.save(); ctx.rotate(t * .6);
  const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, C.cyan); g.addColorStop(1, C.pink);
  ctx.strokeStyle = g; ctx.lineWidth = r * .12; ctx.shadowColor = C.violet; ctx.shadowBlur = 40;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) { const a = i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.stroke(); ctx.restore();
  ctx.lineWidth = r * .14; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff';
  ctx.shadowColor = C.cyan; ctx.shadowBlur = 30; const s = r * .42;
  ctx.beginPath(); ctx.moveTo(-s, s); ctx.lineTo(-s, -s); ctx.lineTo(s, s); ctx.lineTo(s, -s); ctx.stroke();
  ctx.restore();
}

// ---------- Scène 3 : révélation du logo ----------
function scene3(t) {
  const a = life(t, 10, 15, .4);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  // ondes de choc
  for (let i = 0; i < 3; i++) {
    const k = seg(t, 10 + i * .15, 11.4 + i * .15);
    if (k > 0 && k < 1) { ctx.strokeStyle = `rgba(34,211,238,${1 - k})`; ctx.lineWidth = 6 * (1 - k);
      ctx.beginPath(); ctx.arc(W / 2, 400, easeOut(k) * 900, 0, 7); ctx.stroke(); }
  }
  const s = back(seg(t, 10, 10.7));
  logo(W / 2, 400, 150 * s, t, s > 0 ? 1 : 0);
  const name = 'NexazAI'; ctx.font = `900 170px ${SANS}`;
  const full = ctx.measureText(name).width; let cx = W / 2 - full / 2;
  const g = ctx.createLinearGradient(W / 2 - full / 2, 0, W / 2 + full / 2, 0);
  g.addColorStop(0, C.cyan); g.addColorStop(.5, '#fff'); g.addColorStop(1, C.pink);
  [...name].forEach((ch, i) => {
    const k = easeOut(seg(t, 10.5 + i * .07, 11 + i * .07)), w = ctx.measureText(ch).width;
    ctx.save(); ctx.globalAlpha *= k; ctx.shadowColor = C.violet; ctx.shadowBlur = 40;
    text(ch, cx + w / 2, 700 - (1 - k) * 120, 170, g, 900); ctx.restore(); cx += w;
  });
  const tg = easeOut(seg(t, 11.8, 12.5));
  ctx.globalAlpha = a * tg;
  text('Ton copilote de code nouvelle génération', W / 2, 830 + (1 - tg) * 30, 46, C.text, 600);
  ctx.restore();
}

// ---------- Scène 4 : features ----------
const FEATURES = [
  ['⚡', '10x plus rapide', 'Du prompt au code\nprêt pour la prod', C.cyan],
  ['◎', 'Comprend ton projet', 'Il lit tout ton repo,\npas juste un fichier', C.violet],
  ['⛨', 'Sécurisé par défaut', 'Validation et bonnes\npratiques intégrées', C.pink],
];
function scene4(t) {
  const a = life(t, 15, 19.2, .4);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  text('Pourquoi NexazAI ?', W / 2, 200, 64, '#fff', 800);
  FEATURES.forEach(([ic, title, sub, col], i) => {
    const k = back(seg(t, 15.3 + i * .35, 16 + i * .35));
    const cx = W / 2 + (i - 1) * 540, cy = 590 + (1 - k) * 600 + Math.sin(t * 2 + i) * 8;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((1 - k) * .3);
    ctx.shadowColor = col; ctx.shadowBlur = 50; rrect(-230, -260, 460, 520, 32);
    ctx.fillStyle = 'rgba(15,16,32,.95)'; ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -120, 70, 0, 7); ctx.fillStyle = col + '33'; ctx.fill();
    text(ic, 0, -118, 72, col, 400);
    text(title, 0, 20, 44, '#fff', 800);
    sub.split('\n').forEach((s, j) => text(s, 0, 110 + j * 46, 32, '#9ca3af', 400));
    ctx.restore();
  });
  ctx.restore();
}

// ---------- Scène 5 : déploiement ----------
function scene5(t) {
  const a = life(t, 19.2, 23.2, .4);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const x = 360, y = 260, w = 1200, h = 520;
  ctx.save(); ctx.shadowColor = C.cyan; ctx.shadowBlur = 60; rrect(x, y, w, h, 24);
  ctx.fillStyle = 'rgba(8,9,20,.97)'; ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(34,211,238,.6)'; ctx.lineWidth = 2; rrect(x, y, w, h, 24); ctx.stroke();
  text('$ ' + typed('nexaz deploy --prod', t, 19.6, 20), x + 60, y + 80, 40, C.cyan, 700, MONO, 'left');
  const steps = ['Analyse du code', 'Tests (42/42)', 'Build optimisé', 'Mise en ligne'];
  steps.forEach((s, i) => {
    const k = seg(t, 20.8 + i * .4, 21.1 + i * .4); if (k <= 0) return;
    ctx.globalAlpha = a * k;
    text('✓', x + 60, y + 170 + i * 56, 34, '#22c55e', 800, MONO, 'left');
    text(s, x + 110, y + 170 + i * 56, 34, C.text, 400, MONO, 'left');
  });
  ctx.globalAlpha = a;
  const p = easeInOut(seg(t, 20.8, 22.4));
  rrect(x + 60, y + 420, w - 120, 22, 11); ctx.fillStyle = '#1f2937'; ctx.fill();
  if (p > 0) { const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, C.cyan); g.addColorStop(1, C.pink);
    rrect(x + 60, y + 420, (w - 120) * p, 22, 11); ctx.fillStyle = g; ctx.fill(); }
  const d = back(seg(t, 22.4, 22.8));
  if (d > 0) { ctx.save(); ctx.translate(W / 2, 880); ctx.scale(d, d); glowText('En prod. Point.', 0, 0, 72, '#fff', '#22c55e'); ctx.restore(); }
  ctx.restore();
}

// ---------- Scène 6 : appel à l'action ----------
function scene6(t) {
  const a = seg(t, 23.2, 23.7) * (1 - seg(t, 29.2, 30));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  logo(W / 2, 250, 90 * back(seg(t, 23.2, 23.8)), t);
  const k1 = easeOut(seg(t, 23.6, 24.2)), k2 = easeOut(seg(t, 24.1, 24.7));
  ctx.globalAlpha = a * k1; gradText('Code plus vite.', W / 2, 470 - (1 - k1) * 40, 120);
  ctx.globalAlpha = a * k2; gradText('Livre plus fort.', W / 2, 610 - (1 - k2) * 40, 120);
  const b = back(seg(t, 25, 25.5)), pulse = 1 + Math.sin(t * 6) * .03;
  if (b > 0) {
    ctx.globalAlpha = a; ctx.save(); ctx.translate(W / 2, 810); ctx.scale(b * pulse, b * pulse);
    const g = ctx.createLinearGradient(-330, 0, 330, 0); g.addColorStop(0, C.violet); g.addColorStop(1, C.pink);
    ctx.shadowColor = C.pink; ctx.shadowBlur = 60 + Math.sin(t * 6) * 20;
    rrect(-330, -55, 660, 110, 55); ctx.fillStyle = g; ctx.fill();
    text('Essaie NexazAI gratuitement →', 0, 2, 40, '#fff', 800); ctx.restore();
  }
  ctx.restore();
}

function renderFrame(t) {
  const pulse = Math.max(0, 1 - Math.abs(t - 10) * 2) + Math.max(0, 1 - Math.abs(t - 22.4) * 3) * .5;
  background(t, pulse);
  if (t < 4) scene1(t);
  scene2(t); scene3(t); scene4(t); scene5(t); scene6(t);
  // flash blanc de transition
  const f = Math.max(0, 1 - Math.abs(t - 10.05) * 5);
  if (f > 0) { ctx.fillStyle = `rgba(255,255,255,${f})`; ctx.fillRect(0, 0, W, H); }
}
window.renderFrame = renderFrame;
window.DURATION = DURATION;

// Aperçu live (désactivé en mode rendu)
if (!location.search.includes('render')) {
  const audio = new Audio('music.wav'), hud = document.getElementById('hud');
  let t0 = null;
  document.body.onclick = () => { t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
  (function loop(now) {
    if (t0 === null) t0 = now;
    const t = ((now - t0) / 1000) % DURATION;
    renderFrame(t); hud.textContent = `${t.toFixed(2)}s — clic pour relancer avec le son`;
    requestAnimationFrame(loop);
  })(performance.now());
}

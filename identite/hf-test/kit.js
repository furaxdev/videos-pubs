// FuraxDev — kit d'animations (minimal / clean). Tout est une fonction du temps : fn(ctx, t, opts), t en secondes depuis le début de l'effet.
// Règles : mouvements courts (0,4–0,6 s), easing « expo out », jamais de rebond ni d'étirement, pas de glow. Un seul élément bleu à la fois.
const C = { blue: '#2f5bff', deep: '#0a1230', ink: '#0b1020', mist: '#eef2ff', sky: '#a9bcff', grey: '#8a93b8', white: '#fff', red: '#ff3b4e', green: '#12b76a', amber: '#ffb020' };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = { out: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x), inout: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, in: x => x * x * x };
const DUR = .5, STAGGER = .06;   // durée standard et décalage entre éléments
function txt(ctx, s, x, y, size, color, o = {}) { ctx.font = `${o.weight || 700} ${size}px ${o.font || 'Inter'}`; ctx.letterSpacing = (size * (o.ls ?? -.035)).toFixed(1) + 'px'; ctx.fillStyle = color; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); ctx.letterSpacing = '0px'; return ctx.measureText(s).width; }
function width(ctx, s, size, o = {}) { ctx.font = `${o.weight || 700} ${size}px ${o.font || 'Inter'}`; ctx.letterSpacing = (size * (o.ls ?? -.035)).toFixed(1) + 'px'; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }

// 1. Texte qui monte derrière un masque (entrée standard d'une ligne)
function rise(ctx, t, { text, x, y, size, color = C.ink, delay = 0, font, weight, align }) { const p = ease.out(seg(t, delay, delay + DUR)); ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * 1.05, 1080, size * 1.4); ctx.clip(); ctx.globalAlpha = clamp(p * 2.2); txt(ctx, text, x, y + (1 - p) * size * .9, size, color, { font, weight, align }); ctx.restore(); }
// 2. Phrase mot par mot (chaque mot monte avec STAGGER)
function words(ctx, t, { text, x, y, size, color = C.ink, hl = [], delay = 0 }) { let cx = x; text.split(' ').forEach((w, i) => { rise(ctx, t, { text: w, x: cx, y, size, color: hl.includes(w) ? C.blue : color, delay: delay + i * STAGGER }); cx += width(ctx, w + ' ', size); }); }
// 3. Surlignage : trait bleu qui se trace sous un mot
function underline(ctx, t, { x, y, w, delay = 0, th = 10 }) { const p = ease.out(seg(t, delay, delay + .45)); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(x, y, w * p, th, th / 2); ctx.fill(); }
// 4. Barré : trait rouge-bleu nuit traversant un mot, le mot grisé
function strike(ctx, t, { x, y, w, size, delay = 0 }) { const p = ease.inout(seg(t, delay, delay + .35)); ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(6, size * .08); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y - size * .32); ctx.lineTo(x + w * p, y - size * .32); ctx.stroke(); }
// 5. Fenêtre : monte de 40 px, l'ombre pleine bleue se déploie
function windowBox(ctx, t, { x, y, w, h, title = 'terminal', delay = 0, draw }) { const p = ease.out(seg(t, delay, delay + .55)); if (p <= 0) return; const sh = 18 * ease.out(seg(t, delay + .15, delay + .7)); ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(0, (1 - p) * 40);
  ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(x + sh, y + sh, w, h, 22); ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.clip(); ctx.beginPath(); ctx.moveTo(x, y + 58); ctx.lineTo(x + w, y + 58); ctx.stroke(); ctx.restore();
  [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(x + 36 + i * 30, y + 29, 8, 0, 7); ctx.stroke(); }); txt(ctx, title, x + 150, y + 36, 22, C.grey, { font: 'JetBrains Mono', weight: 600, ls: 0 }); if (draw) draw(x, y + 58, w, h - 58); ctx.restore(); }
// 6. Machine à écrire (+ curseur bleu qui clignote)
function typing(ctx, t, { text, x, y, size = 34, color = C.ink, delay = 0, cps = 22, prompt = '', last = true }) { const n = Math.floor(clamp((t - delay) * cps, 0, text.length)), done = n >= text.length; let cx = x; if (prompt) cx += txt(ctx, prompt, x, y, size, C.blue, { font: 'JetBrains Mono', ls: 0 }); const w = txt(ctx, text.slice(0, n), cx, y, size, color, { font: 'JetBrains Mono', weight: 600, ls: 0 });
  // un seul curseur : fin mince (4 px), à côté du texte, jamais dessus ; seule la ligne active (ou la dernière) le garde
  if (t >= delay && ((!done) || (last && Math.floor(t * 2) % 2 === 0))) { ctx.fillStyle = C.blue; ctx.fillRect(cx + w + 8, y - size * .82, 4, size * .98); } }
// 7. Icône qui se dessine (trait animé) — path = Path2D en repère 48×48
function draw(ctx, t, { path, cx, cy, size = 140, delay = 0, color = C.ink, len = 160 }) { const p = ease.inout(seg(t, delay, delay + .7)); ctx.save(); ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(size / 48, size / 48); ctx.strokeStyle = color; ctx.lineWidth = 3.4; ctx.lineCap = ctx.lineJoin = 'round'; ctx.setLineDash([len, len]); ctx.lineDashOffset = len * (1 - p); ctx.stroke(path); ctx.restore(); }
// 8. Tuiles qui apparaissent l'une après l'autre (fondu + montée de 24 px, pas d'échelle)
function tile(ctx, t, { x, y, s = 200, i = 0, fill = false, delay = 0, inner }) { const p = ease.out(seg(t, delay + i * STAGGER * 1.5, delay + i * STAGGER * 1.5 + DUR)); if (p <= 0) return; ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.translate(0, (1 - p) * 24); ctx.fillStyle = fill ? C.blue : '#fff'; ctx.strokeStyle = fill ? C.blue : C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, s, s, 36); ctx.fill(); ctx.stroke(); if (inner) inner(x + s / 2, y + s / 2, fill); ctx.restore(); }
// 9. Compteur
function counter(ctx, t, { to, x, y, size, color = C.blue, suffix = '', delay = 0, dur = 1 }) { const v = Math.round(to * ease.out(seg(t, delay, delay + dur))); txt(ctx, v + suffix, x, y, size, color, { font: 'Inter Display', weight: 700 }); }
// 10. Transition : panneau bleu qui balaie l'écran de gauche à droite (dir=1) puis sort
function wipe(ctx, t, { delay = 0, color = C.blue }) { const a = ease.inout(seg(t, delay, delay + .4)), b = ease.inout(seg(t, delay + .4, delay + .8)); if (a <= 0 || b >= 1) return; ctx.fillStyle = color; ctx.fillRect(1080 * b, 0, 1080 * a - 1080 * b, 1920); }
// 11. Barre de progression fine en haut
function progress(ctx, p) { ctx.fillStyle = C.blue; ctx.fillRect(0, 0, 1080 * p, 8); }
const ICONS = { code: new Path2D('M18 14 6 24l12 10M30 14l12 10-12 10'), check: new Path2D('M10 25l10 10 18-22'), rocket: new Path2D('M24 6c8 6 10 16 6 26H18C14 22 16 12 24 6zM18 32l-6 8 10-3M30 32l6 8-10-3'), play: new Path2D('M17 11l22 13-22 13z'), clock: new Path2D('M41 24a17 17 0 1 1-34 0 17 17 0 0 1 34 0zM24 14v10l7 5') };

// ---------- Animations de texte (entrée + sortie) ----------
// textFx(ctx, t, { style, text, x, y, size, color, delay, hold, font, weight, align })
// t = secondes ; l'entrée dure DUR, puis le texte reste `hold` secondes, puis sort avec la même famille (out=true par défaut).
const TEXT_STYLES = ['fade', 'blur', 'blurWords', 'letters', 'slideLeft', 'slideDown', 'tracking', 'wipe', 'focus', 'type'];
function textFx(ctx, t, o) {
  const { style, text, x, y, size, color = C.ink, delay = 0, hold = 1.1, out = true } = o, F = { font: o.font, weight: o.weight, align: o.align }, d = DUR + .1;
  const pin = seg(t, delay, delay + d), pout = out ? seg(t, delay + d + hold, delay + d + hold + .35) : 0, e = ease.out(pin), a = clamp(pin * 2) * (1 - ease.in(pout));
  if (pin <= 0 || pout >= 1) return; ctx.save(); const blurOut = pout * 14;
  const withBlur = px => { ctx.filter = px > .2 ? `blur(${px.toFixed(1)}px)` : 'none'; };
  if (style === 'fade') { ctx.globalAlpha = a; txt(ctx, text, x, y, size, color, F); }
  else if (style === 'blur') { ctx.globalAlpha = a; withBlur((1 - e) * 18 + blurOut); txt(ctx, text, x, y, size, color, F); }
  else if (style === 'focus') { ctx.globalAlpha = a; withBlur((1 - e) * 22 + blurOut); const s = 1.06 - .06 * e, w = width(ctx, text, size, F); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); txt(ctx, text, x, y, size, color, F); }
  else if (style === 'blurWords') { let cx = x; text.split(' ').forEach((w, i) => { const q = ease.out(seg(t, delay + i * .12, delay + i * .12 + DUR)), qa = clamp(q * 2) * (1 - ease.in(pout)); ctx.save(); ctx.globalAlpha = qa; withBlur((1 - q) * 16 + blurOut); txt(ctx, w, cx, y + (1 - q) * 14, size, color, F); ctx.restore(); cx += width(ctx, w + ' ', size, F); }); }
  else if (style === 'letters') { let cx = x; [...text].forEach((ch, i) => { const q = ease.out(seg(t, delay + i * .035, delay + i * .035 + DUR)); ctx.save(); ctx.globalAlpha = clamp(q * 2) * (1 - ease.in(pout)); txt(ctx, ch, cx, y + (1 - q) * size * .5, size, color, F); ctx.restore(); cx += width(ctx, ch, size, { ...F, ls: -.035 }) + 0; }); }
  else if (style === 'slideLeft') { ctx.globalAlpha = a; txt(ctx, text, x + (1 - e) * 120 - ease.in(pout) * 80, y, size, color, F); }
  else if (style === 'slideDown') { ctx.globalAlpha = a; txt(ctx, text, x, y - (1 - e) * 60 + ease.in(pout) * 40, size, color, F); }
  else if (style === 'tracking') { ctx.globalAlpha = a; txt(ctx, text, x, y, size, color, { ...F, ls: -.035 + (1 - e) * .22 }); }
  else if (style === 'wipe') { const w = width(ctx, text, size, F) + 20, r = ease.inout(pin), r2 = ease.inout(pout); ctx.beginPath(); ctx.rect(x - 10 + w * r2, y - size * 1.1, w * r - w * r2, size * 1.5); ctx.clip(); txt(ctx, text, x, y, size, color, F); }
  else if (style === 'type') { const n = Math.floor(text.length * clamp(t - delay, 0, 1.2) / 1.2); ctx.globalAlpha = 1 - ease.in(pout); txt(ctx, text.slice(0, n), x, y, size, color, { ...F, font: 'JetBrains Mono', ls: 0 }); if (n < text.length || Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = C.blue; ctx.fillRect(x + width(ctx, text.slice(0, n), size, { font: 'JetBrains Mono', ls: 0 }) + 4, y - size * .85, size * .5, size); } }
  ctx.restore();
}

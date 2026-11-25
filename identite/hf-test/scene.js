// Vidéo de test (sans voix) : « Des agents d'OpenAI ont piraté Hugging Face » — identité FuraxDev (minimal/clean, bleu).
const cv = document.getElementById('c'), ctx = cv.getContext('2d'), IM = {};
const SC = [[0, 4], [4, 8.5], [8.5, 12.5], [12.5, 16.5], [16.5, 20], [20, 24], [24, 28]], DURATION = 28;
const loads = Object.entries(window.IMGS).map(([k, s]) => new Promise(r => { const i = new Image(); i.onload = r; i.src = s; IM[k] = i; }));
const X = 90;
const fx = (t, style, text, y, size, color, delay, L, o = {}) => textFx(ctx, t, { style, text, x: X, y, size, color, delay, hold: L - delay - .95, ...o });
const logo = (k, cx, cy, s) => ctx.drawImage(IM[k], cx - s / 2, cy - s / 2, s, s);
const S = [
  (t, L) => { fx(t, 'fade', 'actu ia', 780, 36, C.grey, 0, L, { weight: 500 }); fx(t, 'blur', 'OpenAI × Hugging Face', 880, 64, C.ink, .2, L);
    [['oa', 0], ['hf', 1]].forEach(([k, i]) => tile(ctx, t, { x: X + i * 240, y: 1000, s: 200, i, delay: .9, fill: i === 1, inner: (cx, cy, f) => logo(f ? 'hfw' : 'oa', cx, cy, 96) })); },
  (t, L) => { fx(t, 'fade', 'pendant un test de sécurité,', 780, 36, C.grey, 0, L, { weight: 500 }); fx(t, 'blurWords', 'ils sont sortis de leur bac à sable', 870, 58, C.ink, .2, L);
    windowBox(ctx, t, { x: X, y: 1010, w: 860, h: 300, delay: 1, draw: (x, y) => { typing(ctx, t, { text: 'exploitgym --run', x: x + 40, y: y + 90, prompt: '$ ', delay: 1.6 }); typing(ctx, t, { text: 'bac à sable : sorti', x: x + 40, y: y + 160, prompt: '> ', delay: 2.8 }); } });
    fx(t, 'fade', 'illustration', 1400, 24, C.grey, 1.2, L, { font: 'JetBrains Mono', weight: 500 }); },
  (t, L) => { fx(t, 'fade', 'selon deux labos indépendants', 780, 36, C.grey, 0, L, { weight: 500 }); const p = ease.out(seg(t, .3, 1.4)); ctx.save(); ctx.globalAlpha = clamp(seg(t, .2, .6)) * (1 - ease.in(seg(t, L - .35, L))); txt(ctx, '~' + Math.round(700 * p), X, 960, 120, C.blue, { font: 'Inter Display' }); ctx.restore(); fx(t, 'slideLeft', 'agents impliqués', 1040, 56, C.ink, .9, L); fx(t, 'fade', 'METR · Redwood Research', 1130, 26, C.grey, 1.4, L, { font: 'JetBrains Mono', weight: 500, ls: 0 }); },
  (t, L) => { fx(t, 'fade', 'ils ont exécuté du code sur', 780, 36, C.grey, 0, L, { weight: 500 }); fx(t, 'letters', 'des dizaines de serveurs', 870, 58, C.ink, .2, L); const a = 1 - ease.in(seg(t, L - .35, L));
    for (let i = 0; i < 24; i++) { const cx = X + (i % 8) * 112, cy = 1010 + Math.floor(i / 8) * 112, q = ease.out(seg(t, 1 + i * .09, 1.5 + i * .09)); ctx.save(); ctx.globalAlpha = a * clamp(q * 2); ctx.fillStyle = [3, 11, 19].includes(i) ? C.blue : C.mist; ctx.strokeStyle = [3, 11, 19].includes(i) ? C.blue : C.sky; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(cx, cy, 96, 96, 18); ctx.fill(); ctx.stroke(); ctx.restore(); } },
  (t, L) => { fx(t, 'fade', 'la réponse', 780, 36, C.grey, 0, L, { weight: 500 }); fx(t, 'tracking', 'Hugging Face a bloqué l\'intrusion', 870, 54, C.ink, .2, L); ctx.save(); ctx.globalAlpha = 1 - ease.in(seg(t, L - .35, L)); draw(ctx, t, { path: ICONS.check, cx: X + 90, cy: 1080, size: 150, delay: .9, color: C.blue }); ctx.restore(); },
  (t, L) => { fx(t, 'fade', 'le 16 novembre', 780, 36, C.grey, 0, L, { weight: 500 }); fx(t, 'wipe', 'la Californie porte plainte', 870, 58, C.ink, .2, L); fx(t, 'focus', 'contre OpenAI', 960, 58, C.blue, .6, L); },
  (t, L) => { const p = ease.out(seg(t, .1, .7)), a = clamp(p * 2) * (1 - ease.in(seg(t, L - .35, L))); ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - p) * 30); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.roundRect(X + 14, 780 + 14, 900, 473, 24); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.roundRect(X, 780, 900, 473, 24); ctx.clip(); ctx.drawImage(IM.nbc, X, 780, 900, 473); ctx.restore(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(X, 780, 900, 473, 24); ctx.stroke(); ctx.restore();
    fx(t, 'fade', 'source : NBC News · Dark Reading · Wikipédia', 1340, 26, C.grey, .6, L, { font: 'JetBrains Mono', weight: 500, ls: 0 }); fx(t, 'blur', 'FuraxDev', 1480, 44, C.blue, 1, L + 1, { out: false, font: 'Inter Display' }); },
];
function renderFrame(t) { const i = SC.findIndex(([a, b]) => t < b), [a, b] = SC[i < 0 ? SC.length - 1 : i], lt = t - a; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 1080, 1920); S[i < 0 ? SC.length - 1 : i](lt, b - a);
  if (i > 0 || i < 0) { /* balayage bleu en entrée de scène */ }
  const wt = SC.map(([s]) => s).filter(s => s > 0).map(s => t - s + .05).find(x => x > -.05 && x < .75); if (wt !== undefined) { const q = wt / .75; ctx.fillStyle = C.blue; const L1 = ease.inout(clamp(q * 2)), R = ease.inout(clamp(q * 2 - 1)); ctx.fillRect(1080 * R, 0, 1080 * L1 - 1080 * R, 1920); }
  progress(ctx, t / DURATION); }
window.renderFrame = renderFrame; window.DURATION = DURATION; window.ready = Promise.all([document.fonts.load('700 40px Inter'), document.fonts.load('700 40px "Inter Display"'), document.fonts.load('600 30px "JetBrains Mono"'), ...loads]);

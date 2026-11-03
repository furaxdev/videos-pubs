// Hiday — montage : enchaîne les scènes (beats) avec fondus, ajoute titres, verset arabe, sous-titres.
const V = window.VIDEO, CFG = V.config, TL = V.timeline, SEGS = TL.segments, DURATION = TL.duration;
const THEMES = {
  night: { text: '#f7f0e0', accent: '#f1ca6b', ink: '#0a0b22' }, dawn: { text: '#fff6e6', accent: '#ffd27a', ink: '#10122e' }, paper: { text: '#0f3a2e', accent: '#b0801f', ink: '#fdf6e4' },
}; const THEME = () => THEMES[CFG.theme], TH = THEMES[CFG.theme], LIGHT = CFG.theme === 'paper';
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
// --- beats : une scène par moment du récit, déclenchée sur un mot de la voix off ---
const BEATS = []; CFG.segments.forEach((s, si) => { const sg = SEGS[si], bs = s.beats || [{ at: 0, scene: s.icon }];
  bs.forEach((b, bi) => { let start; if (bi === 0) start = sg.start; else if (typeof b.at === 'string') { const w = sg.words.find(w => norm(w.w).startsWith(norm(b.at))); start = w ? w.s - .12 : sg.start + (sg.end - sg.start) * .5; } else start = sg.start + (sg.end - sg.start) * b.at; BEATS.push({ si, seg: s, sg, b, start }); }); });
BEATS.forEach((x, i) => x.end = i < BEATS.length - 1 ? BEATS[i + 1].start : DURATION);
function drawBeat(i, t) { const x = BEATS[i], c = { t, lt: Math.max(0, t - x.start), p: clamp((t - x.start) / (x.end - x.start)), beat: x.b, seg: x.seg }; ctx.save(); SC[x.b.scene](c); ctx.restore(); }

function arabicCard(s, lt, k) {
  const lines = s.arabic, h = 220 + lines.length * 130, y0 = 700; ctx.save(); ctx.globalAlpha = clamp(lt * 2.5); ctx.translate(W / 2, y0 + h / 2); ctx.scale(.92 + .08 * k, .92 + .08 * k);
  rr(-440, -h / 2, 880, h, 36); ctx.fillStyle = LIGHT ? 'rgba(255,252,243,.94)' : 'rgba(8,8,36,.78)'; ctx.fill(); ctx.strokeStyle = TH.accent; ctx.lineWidth = 6; ctx.stroke(); rr(-420, -h / 2 + 20, 840, h - 40, 24); ctx.lineWidth = 2.5; ctx.stroke();
  star8(0, -h / 2, 30, Math.PI / 8, TH.accent, null); star8(0, h / 2, 30, Math.PI / 8, TH.accent, null);
  lines.forEach((l, i) => { ctx.font = `700 78px ${ARAB}`; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = TH.text; ctx.shadowColor = LIGHT ? 'transparent' : 'rgba(241,202,107,.55)'; ctx.shadowBlur = 22; let sc = 1; const w = ctx.measureText(l).width; if (w > 800) sc = 800 / w; ctx.save(); ctx.scale(sc, sc); ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * 125 / sc); ctx.restore(); ctx.shadowBlur = 0; ctx.direction = 'ltr'; });
  ctx.restore(); if (s.source) { ctx.save(); ctx.globalAlpha = clamp((lt - .6) * 2); text(s.source.toUpperCase(), W / 2, y0 + h + 62, 34, TH.accent, SANS, 'center', 800); ctx.restore(); }
}
function bigWord(b, lt) { const k = back(clamp((lt - .2) / .5)); if (k <= 0) return; ctx.save(); ctx.translate(W / 2, 400); ctx.scale(k, k); glowAdd(0, 0, 420, LIGHT ? '176,128,31' : '241,202,107', .3); ctx.font = `700 ${b.big.length > 8 ? 112 : 150}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = LIGHT ? 'rgba(253,246,228,.9)' : 'rgba(6,6,24,.7)'; ctx.strokeText(b.big, 0, 0); const g = ctx.createLinearGradient(0, -80, 0, 80); g.addColorStop(0, TH.accent); g.addColorStop(1, LIGHT ? '#7a5510' : '#fff0bd'); ctx.fillStyle = g; ctx.fillText(b.big, 0, 0); ctx.restore(); }

// --- sous-titres mot par mot ---
const ALLW = []; SEGS.forEach((sg, si) => sg.words.forEach(w => ALLW.push({ w: w.w.replace(/[.,;:!?]+$/, ''), s: w.s, e: w.e, si })));
const SUBF = `700 72px ${SERIF}`; let GROUPS = null;
function groups() { const gr = []; let cur = [], cw = 0; ctx.font = SUBF; const gap = 18; ALLW.forEach((w, i) => { const wd = ctx.measureText(w.w).width, br = i && (w.si !== ALLW[i - 1].si || w.s - ALLW[i - 1].e > .45); if (cur.length && (cur.length >= 4 || cw + gap + wd > 900 || br)) { gr.push(cur); cur = []; cw = 0; } cur.push(i); cw += (cur.length > 1 ? gap : 0) + wd; }); if (cur.length) gr.push(cur); return gr; }
function subtitles(t) {
  GROUPS = GROUPS || groups(); const g = GROUPS.find(gr => t >= ALLW[gr[0]].s - .02 && t < ALLW[gr[gr.length - 1]].e + .3); if (!g) return; const hl = new Set((CFG.segments[ALLW[g[0]].si].hl || []).map(x => x.toLowerCase()));
  ctx.font = SUBF; const gap = 18, ws = g.map(i => ctx.measureText(ALLW[i].w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (g.length - 1), y = 1600; let x = W / 2 - total / 2;
  g.forEach((i, j) => { const w = ALLW[i], k = t >= w.s ? back(clamp((t - w.s) / .14)) : 0; if (k > 0) { ctx.save(); ctx.translate(x + ws[j] / 2, y); ctx.scale(k, k); ctx.font = SUBF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = LIGHT ? '#fdf6e4' : TH.ink; ctx.strokeText(w.w, 0, 0); const h = hl.has(w.w.toLowerCase()); ctx.fillStyle = h ? TH.accent : TH.text; ctx.fillText(w.w, 0, 0); ctx.restore(); } x += ws[j] + gap; });
}
function brand(t) { ctx.save(); ctx.globalAlpha = .9; star8(480, 120, 28, t * .3, TH.accent, null); text('HIDAY', 540, 122, 46, TH.accent, SANS, 'left', 800); ctx.restore(); }

function renderFrame(t) {
  let i = BEATS.findIndex(x => t < x.end); if (i < 0) i = BEATS.length - 1; const x = BEATS[i], lt = t - x.start;
  if (lt < .5 && i > 0) { drawBeat(i - 1, t); ctx.save(); ctx.globalAlpha = easeOut(lt / .5); drawBeat(i, t); ctx.restore(); } else drawBeat(i, t);
  const sg = SEGS[x.si], k = back(clamp((t - sg.start) / .6)); if (x.b.big) bigWord(x.b, lt); if (x.seg.arabic) arabicCard(x.seg, t - sg.start, k);
  const g = ctx.createLinearGradient(0, 1380, 0, 1760); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, LIGHT ? 'rgba(253,246,228,.72)' : 'rgba(0,0,10,.5)'); ctx.fillStyle = g; ctx.fillRect(0, 1380, W, 380);
  subtitles(t); brand(t); vignette(.18); grain(t); ctx.fillStyle = TH.accent; ctx.fillRect(0, H - 14, W * t / DURATION, 14);
}
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.renderScene = (name, t, extra) => { ctx.clearRect(0, 0, W, H); SC[name](Object.assign({ t, lt: t, p: clamp(t / 6), beat: { counter: { to: 309, label: 'ANS' } }, seg: {} }, extra || {})); };
window.ready = Promise.all(['Playfair Display', 'Amiri', 'Montserrat'].map(f => document.fonts.load(`40px "${f}"`)).concat([document.fonts.load('italic 40px "Playfair Display"'), document.fonts.load('40px Amiri', 'وَلَبِثُوا')]));
if (!location.search.includes('render')) {
  const audio = new Audio('out/' + CFG.id + '/voice.wav'), hud = document.getElementById('hud'); let t0 = null;
  document.body.onclick = () => { t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
  window.ready.then(() => (function loop(now) { if (t0 === null) t0 = now; const t = ((now - t0) / 1000) % DURATION; renderFrame(t); hud.textContent = t.toFixed(1) + ' s — clic pour le son'; requestAnimationFrame(loop); })(performance.now()));
}

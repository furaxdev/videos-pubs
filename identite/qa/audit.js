// Audit « au pixel près » : rejoue CHAQUE image (30 fps) en espionnant le canvas et signale
//  - texte hors zone de sécurité (x 120–960, y 60–1700)         - texte qui en recouvre un autre
//  - curseur (trait fin) posé sur du texte                      - texte recouvert par une tête de bot
//  - formes (cartes, tuiles, images) qui sortent de la zone de sécurité
// usage : node qa/audit.js <dossier-projet>   (le dossier contient index.html qui expose renderFrame + DURATION)
const { chromium } = require('playwright'), path = require('path');
const SAFE = { l: 120, r: 960, t: 60, b: 1700 }, FPS = 30;
(async () => {
  const dir = path.resolve(process.argv[2]), b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => { console.error('ERR', e.message); process.exit(2); });
  await p.addInitScript(() => {
    window.__L = { txt: [], car: [], shp: [] }; const P = CanvasRenderingContext2D.prototype, bb = (ctx, x0, y0, x1, y1) => { const m = ctx.getTransform(), pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]); return [Math.min(...pts.map(q => q[0])), Math.min(...pts.map(q => q[1])), Math.max(...pts.map(q => q[0])), Math.max(...pts.map(q => q[1]))]; };
    const ft = P.fillText; P.fillText = function (s, x, y) { try { const m = this.measureText(s), al = this.textAlign, w = m.width, x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x; window.__L.txt.push({ s: String(s), a: this.globalAlpha, bx: bb(this, x0, y - m.actualBoundingBoxAscent, x0 + w, y + m.actualBoundingBoxDescent), f: this.filter }); } catch (e) {} return ft.apply(this, arguments); };
    const fr = P.fillRect; P.fillRect = function (x, y, w, h) { if (w > 0 && w <= 6 && h >= 20 && h <= 80) window.__L.car.push({ a: this.globalAlpha, bx: bb(this, x, y, x + w, y + h) }); else if (w > 60 && h > 60 && this.globalAlpha > .3) window.__L.shp.push({ k: 'rect', a: this.globalAlpha, bx: bb(this, x, y, x + w, y + h) }); return fr.apply(this, arguments); };
    const rr = P.roundRect; P.roundRect = function (x, y, w, h) { if (w > 60 && h > 40) window.__L.shp.push({ k: 'forme', a: this.globalAlpha, bx: bb(this, x, y, x + w, y + h) }); return rr.apply(this, arguments); };
    const di = P.drawImage; P.drawImage = function (im, x, y, w, h) { if (w > 60) window.__L.shp.push({ k: 'image', a: this.globalAlpha, bx: bb(this, x, y, x + w, y + h) }); return di.apply(this, arguments); };
  });
  await p.goto('file://' + path.join(dir, 'index.html')); await p.evaluate(() => window.ready);
  const bots = []; await p.evaluate(() => { const ob = window.bot; if (ob) { window.__bots = []; window.bot = function (x, y, s, o = {}) { const ctx = document.getElementById('c').getContext('2d'), m = ctx.getTransform(); window.__bots.push({ a: ctx.globalAlpha * (o.alpha ?? 1), bx: [m.a * (x - s * .5) + m.e, m.d * (y - 1.1 * s) + m.f, m.a * (x + s * .5) + m.e, m.d * y + m.f] }); return ob.apply(this, arguments); }; } });
  const total = Math.ceil(await p.evaluate(() => window.DURATION) * FPS), found = new Map(); const I = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const add = (key, f) => { const e = found.get(key); if (e && f - e.last <= 1) e.last = f; else if (!e || f - e.last > 1) { if (e) found.set(key + '@' + e.first, e); found.set(key, { first: f, last: f }); } };
  for (let f = 0; f < total; f++) {
    const L = await p.evaluate(t => { window.__L = { txt: [], car: [], shp: [] }; window.__bots = []; renderFrame(t); return { ...window.__L, bots: window.__bots || [] }; }, f / FPS);
    const T = L.txt.filter(q => q.a > .3 && q.f === 'none' || (q.a > .3 && !q.f)), Tl = T.filter(q => q.s.trim().length > 1 && !/^[01]$/.test(q.s));
    Tl.forEach(q => { const [x0, y0, x1, y1] = q.bx; if (x0 < SAFE.l - 1 || x1 > SAFE.r + 1 || y0 < SAFE.t || y1 > SAFE.b) add(`texte hors zone de sécurité : « ${q.s} » (x ${Math.round(x0)}–${Math.round(x1)})`, f); });
    for (let i = 0; i < Tl.length; i++) for (let j = i + 1; j < Tl.length; j++) { const A = Tl[i], B = Tl[j]; if (A.s === B.s) continue; const ia = I(A.bx, B.bx); if (ia > 40) add(`texte sur texte : « ${A.s} » / « ${B.s} »`, f); }
    T.filter(q => /^[01]$/.test(q.s)).forEach(bn => Tl.forEach(q => { if (I(bn.bx, q.bx) > 2) add(`binaire sur du texte : « ${q.s} »`, f); }));
    { const Bn = T.filter(q => /^[01]$/.test(q.s)); for (let i = 0; i < Bn.length; i++) for (let j = i + 1; j < Bn.length; j++) if (I(Bn[i].bx, Bn[j].bx) > 6) add('binaire superposé (deux chiffres l\'un sur l\'autre)', f); }
    L.car.filter(c => c.a > .3).forEach(c => Tl.forEach(q => { if (I(c.bx, [q.bx[0] + 1, q.bx[1] + 1, q.bx[2] - 1, q.bx[3] - 1]) > 4) add(`curseur sur du texte : « ${q.s} »`, f); }));
    L.bots.filter(q => q.a > .3).forEach(bt => Tl.forEach(q => { if (I(bt.bx, q.bx) > 40) add(`tête de bot sur du texte : « ${q.s} »`, f); }));
    L.shp.filter(q => q.a > .3).forEach(q => { const [x0, y0, x1, y1] = q.bx; if (q.k !== 'image' && (x0 < 60 || x1 > 1020) && x1 - x0 < 1000 && y0 > 0) add(`${q.k} hors zone de sécurité (x ${Math.round(x0 / 10) * 10}–${Math.round(x1 / 10) * 10})`, f); });

    // ---- chevauchements entre formes (les « détails que personne ne signale ») ----
    const SH = L.shp.filter(q => q.a > .3 && q.k !== 'image' && (q.bx[2] - q.bx[0]) < 1000 && (q.bx[3] - q.bx[1]) < 1500), area = q => (q[2] - q[0]) * (q[3] - q[1]), inside = (a, b) => a[0] >= b[0] - 2 && a[1] >= b[1] - 2 && a[2] <= b[2] + 2 && a[3] <= b[3] + 2;
    L.bots.filter(q => q.a > .3).forEach(bt => SH.forEach(sh => { const ia = I(bt.bx, sh.bx); if (ia > 30 && !inside(bt.bx, sh.bx) && !inside(sh.bx, bt.bx) && area(sh.bx) > 8000 && area(sh.bx) < 400000) add(`tête de bot chevauche une forme (${Math.round(sh.bx[0] / 10) * 10},${Math.round(sh.bx[1] / 10) * 10})`, f); }));
    Tl.forEach(q => SH.forEach(sh => { const ia = I(q.bx, sh.bx); if (ia > 20 && !inside(q.bx, sh.bx) && area(sh.bx) > 8000 && area(sh.bx) < 400000 && ia < area(q.bx) * .98) add(`texte à cheval sur une forme : « ${q.s} »`, f); }));
    for (let i = 0; i < SH.length; i++) for (let j = i + 1; j < SH.length; j++) { const A = SH[i].bx, B = SH[j].bx, ia = I(A, B); const shadow = Math.abs((A[2] - A[0]) - (B[2] - B[0])) < 4 && Math.abs((A[3] - A[1]) - (B[3] - B[1])) < 4 && Math.abs(A[0] - B[0]) <= 24 && Math.abs(A[1] - B[1]) <= 24; if (!shadow && ia > 300 && !inside(A, B) && !inside(B, A) && area(A) > 8000 && area(B) > 8000) add(`deux formes se chevauchent (${Math.round(A[0] / 10) * 10},${Math.round(A[1] / 10) * 10}) / (${Math.round(B[0] / 10) * 10},${Math.round(B[1] / 10) * 10})`, f); }
  }
  await b.close(); const rows = [...found.entries()].filter(([k]) => !k.includes('@')).concat([...found.entries()].filter(([k]) => k.includes('@')).map(([k, v]) => [k.split('@')[0], v]));
  const out = rows.map(([k, v]) => `${(v.first / FPS).toFixed(2)}–${(v.last / FPS + 1 / FPS).toFixed(2)} s  ${k}`).sort();
  if (out.length) { console.log(`AUDIT : ${out.length} problème(s)`); out.forEach(l => console.log(' -', l)); process.exit(1); } console.log('AUDIT : aucun problème');
})();

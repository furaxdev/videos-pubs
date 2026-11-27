// Audit « au pixel près » BALL MUSIC : rejoue CHAQUE image à 60 fps (même renderFrame que le rendu) et signale
//  - élément hors zone sûre (x 120–960) · texte hors zone (y ≥ 160) · titre recouvert (balle, cercle, compteur) · compteur sur le cercle
//  - balle hors du cercle (ou de l'anneau intérieur) · saut de la balle d'une image à l'autre (téléportation) · texte sur texte
// usage : node ball/audit.js <dossier-exemple>
const { chromium } = require('playwright'), path = require('path');
const SAFE = { l: 120, r: 960, t: 160, b: 1700 };
(async () => {
  const dir = path.resolve(process.argv[2] || 'ball/exemples/montagem-royal'), rel = path.relative(__dirname, dir), b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => { console.error('ERR', e.message); process.exit(2); });
  await p.addInitScript(() => { window.__T = []; const ft = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (s, x, y) { const w = this.measureText(s).width, al = this.textAlign, m = parseFloat(this.font.match(/(\d+(\.\d+)?)px/)[1]), x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x; window.__T.push({ s, a: this.globalAlpha, bx: [x0, y - m, x0 + w, y + m * .25] }); return ft.apply(this, arguments); }; });
  await p.goto('file://' + path.join(__dirname, 'index.html') + '?dir=' + rel); await p.evaluate(() => window.ready);
  const FPS = await p.evaluate(() => window.FPS), total = Math.round(await p.evaluate(() => window.DURATION) * FPS), found = new Map();
  const add = (key, f) => { const e = found.get(key); if (e && f - e.last <= 1) e.last = f; else found.set(e ? key + '@' + f : key, { first: f, last: f }); };
  const I = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1])), arr = q => [q.x0, q.y0, q.x1, q.y1];
  let prev = null, maxStep = 0; const LASTT = await p.evaluate(() => BALL_DATA.impacts[BALL_DATA.impacts.length - 1].t);
  for (let f = 0; f < total; f++) {
    const L = await p.evaluate(t => { window.__T = []; renderFrame(t); return { bb: window.__bboxes(), tx: window.__T, mg: window.__margin(t) }; }, f / FPS);
    if (L.mg < -1.5 && f / FPS < LASTT) add(`balle hors du cercle (${L.mg.toFixed(1)} px)`, f); const bb = L.bb, tx = L.tx.filter(q => q.a > .3 && q.s.trim().length > 1);
    bb.forEach(e => { if (e.x0 < SAFE.l - 1 || e.x1 > SAFE.r + 1 || e.y1 > SAFE.b) add(`${e.k} hors zone sûre x 120–960 (x ${Math.round(e.x0)}–${Math.round(e.x1)})`, f); });
    tx.forEach(q => { if (q.bx[0] < SAFE.l - 1 || q.bx[2] > SAFE.r + 1 || q.bx[1] < SAFE.t || q.bx[3] > SAFE.b) add(`texte hors zone sûre : « ${q.s} » (x ${Math.round(q.bx[0])}–${Math.round(q.bx[2])}, y ${Math.round(q.bx[1])})`, f); });
    for (let i = 0; i < tx.length; i++) for (let j = i + 1; j < tx.length; j++) if (tx[i].s !== tx[j].s && I(tx[i].bx, tx[j].bx) > 40) add(`texte sur texte : « ${tx[i].s} » / « ${tx[j].s} »`, f);
    const ti = bb.find(e => e.k === 'titre'), co = bb.find(e => e.k === 'compteur');
    if (ti) bb.filter(e => e.k !== 'titre').forEach(e => { if (I(arr(ti), arr(e)) > 0) add(`titre recouvert par : ${e.k}`, f); });
    if (co) bb.filter(e => e.k === 'cercle' || e.k === 'balle').forEach(e => { if (I(arr(co), arr(e)) > 0) add(`compteur touche : ${e.k}`, f); });
    const balls = bb.filter(e => e.k === 'balle'); if (balls.length === 1) { const c = balls[0], cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2; if (prev) { const d = Math.hypot(cx - prev[0], cy - prev[1]); maxStep = Math.max(maxStep, d); } prev = [cx, cy]; }
  }
  await b.close(); const out = [...found.entries()].map(([k, v]) => `${(v.first / FPS).toFixed(2)}–${((v.last + 1) / FPS).toFixed(2)} s  ${k.split('@')[0]}`).sort();
  console.log(`AUDIT BALL : ${total} images rejouées à ${FPS} fps · déplacement max de la balle ${maxStep.toFixed(1)} px/image`);
  if (out.length) { console.log(`AUDIT : ${out.length} problème(s)`); out.forEach(l => console.log(' -', l)); process.exit(1); } console.log('AUDIT : aucun problème');
})();

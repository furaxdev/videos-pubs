// Hiday — moteur de vidéos 9:16 (rappels, histoires). Trois styles : night, dawn, paper.
// Visuels sans visages ni personnages : calligraphie, géométrie, silhouettes de lieux. Tout est une fonction du temps t.
const W = 1080, H = 1920, V = window.VIDEO, CFG = V.config, TL = V.timeline, SEGS = TL.segments, DURATION = TL.duration;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3), easeIn = x => x * x * x, easeIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const SERIF = '"Playfair Display"', ARAB = 'Amiri', SANS = 'Montserrat';

const THEMES = {
  night: { bg: ['#050818', '#150f45', '#35205f'], text: '#f7f0e0', accent: '#f1ca6b', dim: '#a49fd0', ink: '#0a0b22', card: 'rgba(10,8,40,.55)', stars: true, pattern: 'rgba(241,202,107,.07)', ground: '#07061c' },
  dawn: { bg: ['#081735', '#3c3a78', '#ff9a5c'], text: '#fff6e6', accent: '#ffd27a', dim: '#d9c6b0', ink: '#10122e', card: 'rgba(12,16,50,.5)', stars: true, pattern: 'rgba(255,226,170,.08)', ground: '#0b0f26' },
  paper: { bg: ['#f9f2e1', '#f1e5c8'], text: '#0f3a2e', accent: '#b0801f', dim: '#7b6c4c', ink: '#0f3a2e', card: 'rgba(255,252,243,.75)', stars: false, pattern: 'rgba(15,58,46,.09)', ground: '#0f3a2e' },
};
const TH = THEMES[CFG.theme], LIGHT = CFG.theme === 'paper';
function segAt(t) { for (let i = 0; i < SEGS.length; i++) if (t < SEGS[i].end || i === SEGS.length - 1) return i; return 0; }

// ---------- Fond ----------
function bg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); TH.bg.forEach((c, i) => g.addColorStop(i / (TH.bg.length - 1), c)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (CFG.theme === 'dawn') { const p = easeIO(clamp(t / DURATION * 1.1)), sy = lerp(1500, 1000, p), r = ctx.createRadialGradient(540, sy, 20, 540, sy, 900); r.addColorStop(0, 'rgba(255,214,140,.85)'); r.addColorStop(.35, 'rgba(255,150,90,.35)'); r.addColorStop(1, 'rgba(255,120,80,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffe3a0'; ctx.beginPath(); ctx.arc(540, sy, 130, 0, 7); ctx.fill(); }
  if (TH.stars) { const fade = CFG.theme === 'dawn' ? 1 - easeIO(clamp(t / DURATION * 1.3)) : 1; for (let i = 0; i < 110; i++) { const x = rnd(i) * W, y = rnd(i + 50) * H * .72, a = (.35 + .65 * Math.abs(Math.sin(t * (.6 + rnd(i + 9)) + i))) * fade; ctx.fillStyle = `rgba(255,248,225,${a})`; const s = 2 + rnd(i + 3) * 3.5; ctx.fillRect(x, y, s, s); } }
  // motif géométrique (étoiles à 8 branches)
  ctx.strokeStyle = TH.pattern; ctx.lineWidth = 2.5; const cs = 150, off = (t * 4) % cs;
  for (let x = -cs; x < W + cs; x += cs) for (let y = -cs; y < H + cs; y += cs) { const cx = x + off, cy = y + off * .6; ctx.save(); ctx.translate(cx, cy); for (let k = 0; k < 2; k++) { ctx.rotate(Math.PI / 4 * k); ctx.strokeRect(-46, -46, 92, 92); } ctx.restore(); }
}

// ---------- Formes de base ----------
function star8(cx, cy, r, rot, fill, stroke) { ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = rot + i * Math.PI / 8, rr = i % 2 ? r * .68 : r; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 5; ctx.stroke(); } }
const cres = document.createElement('canvas'); cres.width = cres.height = 600;
function crescent(cx, cy, r, col) { const g = cres.getContext('2d'); g.clearRect(0, 0, 600, 600); g.fillStyle = col; g.beginPath(); g.arc(300, 300, r, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(300 + r * .42, 300 - r * .08, r * .84, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; ctx.drawImage(cres, cx - 300, cy - 300); }
function glow(cx, cy, r, col, a = 1) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); }
function text(s, x, y, size, color, font = SERIF, align = 'center', weight = 700, style = '') { ctx.font = `${style} ${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function hills(base, col, amp, seed, par = 0) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, base - amp * (Math.sin((x + par) * .006 + seed) * .6 + Math.sin((x + par) * .013 + seed * 2) * .4)); ctx.lineTo(W, H); ctx.fill(); }

// ---------- Silhouettes et icônes ----------
function skyline(cx, base, s, col) { // mosquée : grand dôme, minarets, petits dômes
  ctx.save(); ctx.translate(cx, base); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.fillRect(-330, -150, 660, 150); ctx.beginPath(); ctx.ellipse(0, -150, 150, 140, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-4, -310, 8, 40); crescentSmall(0, -330, 22);
  [-1, 1].forEach(d => { ctx.beginPath(); ctx.ellipse(d * 235, -150, 70, 70, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(d * 390 - 24, -430, 48, 430); ctx.beginPath(); ctx.moveTo(d * 390 - 34, -430); ctx.lineTo(d * 390, -520); ctx.lineTo(d * 390 + 34, -430); ctx.fill(); ctx.fillRect(d * 390 - 40, -330, 80, 14); crescentSmall(d * 390, -540, 14); });
  ctx.restore();
}
function crescentSmall(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(x + r * .4, y - r * .05, r * .85, 0, 7); ctx.fill(); ctx.restore(); }
function cityScape(cx, base, s, col, lit) {
  ctx.save(); ctx.translate(cx, base); ctx.scale(s, s); ctx.fillStyle = col;
  [[-380, 140, 220], [-250, 110, 310], [-130, 150, 200], [10, 120, 360], [140, 140, 250], [280, 110, 300], [390, 90, 190]].forEach(([x, w, h], i) => { ctx.fillRect(x, -h, w, h); if (i % 2) { ctx.beginPath(); ctx.moveTo(x - 8, -h); ctx.lineTo(x + w / 2, -h - 60); ctx.lineTo(x + w + 8, -h); ctx.fill(); }
    for (let wy = -h + 30; wy < -30; wy += 46) for (let wx = x + 16; wx < x + w - 24; wx += 36) { ctx.fillStyle = (rnd(wx * 3 + wy) > .55 && lit) ? '#ffcf6a' : 'rgba(255,255,255,.07)'; ctx.fillRect(wx, wy, 14, 20); } ctx.fillStyle = col; });
  ctx.restore();
}
function rock(cx, base, s) { // montagne / rocher
  ctx.save(); ctx.translate(cx, base); ctx.scale(s, s); const g = ctx.createLinearGradient(0, -520, 0, 0); g.addColorStop(0, '#6b6385'); g.addColorStop(1, '#2d2848'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-460, 0); ctx.quadraticCurveTo(-420, -300, -230, -400); ctx.quadraticCurveTo(-60, -540, 80, -470); ctx.quadraticCurveTo(300, -400, 380, -220); ctx.quadraticCurveTo(450, -90, 470, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-230, -400); ctx.quadraticCurveTo(-60, -540, 80, -470); ctx.stroke(); ctx.restore();
}
function cave(cx, base, s, t, o = {}) {
  rock(cx, base, s); ctx.save(); ctx.translate(cx, base); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-170, 0); ctx.bezierCurveTo(-170, -230, 170, -230, 170, 0); ctx.closePath(); const g = ctx.createRadialGradient(0, -40, 10, 0, -60, 220); g.addColorStop(0, o.light || '#ffcf86'); g.addColorStop(.45, '#7a4a2e'); g.addColorStop(1, '#07060f'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 12; ctx.stroke(); ctx.restore();
  if (o.light !== false) glow(cx, base - 70 * s, 300 * s, 'rgba(255,200,120,A)', .45 + .1 * Math.sin(t * 3));
}
function dog(cx, base, s, t) { ctx.save(); ctx.translate(cx, base); ctx.scale(s, s); ctx.fillStyle = '#0c0a14'; ctx.beginPath(); ctx.ellipse(0, -34, 90, 34, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(104, -44, 30, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(132, -36, 22, 15, .2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(96, -66); ctx.lineTo(112, -90); ctx.lineTo(120, -62); ctx.fill(); ctx.fillRect(40, -12, 70, 12); ctx.save(); ctx.translate(-88, -40); ctx.rotate(-.5 + Math.sin(t * 2.4) * .12); ctx.fillRect(-52, -7, 56, 14); ctx.restore(); ctx.restore(); }
function zzz(cx, cy, t, col) { for (let i = 0; i < 3; i++) { const p = ((t * .35 + i / 3) % 1); ctx.globalAlpha = Math.sin(p * Math.PI); text('z', cx + p * 70 + i * 16, cy - p * 190, 50 + i * 20, col, SERIF, 'center', 700, 'italic'); } ctx.globalAlpha = 1; }
function sunDisc(cx, cy, r, t, col = '#ffcf5a') { glow(cx, cy, r * 3.2, 'rgba(255,205,100,A)', .55); ctx.fillStyle = col; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + t * .3; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a - .07) * r * 1.15, cy + Math.sin(a - .07) * r * 1.15); ctx.lineTo(cx + Math.cos(a) * r * 1.6, cy + Math.sin(a) * r * 1.6); ctx.lineTo(cx + Math.cos(a + .07) * r * 1.15, cy + Math.sin(a + .07) * r * 1.15); ctx.fill(); }
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); }
function clock(cx, cy, r, t, spin) { ctx.fillStyle = LIGHT ? '#fffaf0' : '#f7f0e0'; ctx.strokeStyle = TH.accent; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#2a2740'; ctx.lineWidth = 6; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * .82, cy + Math.sin(a) * r * .82); ctx.lineTo(cx + Math.cos(a) * r * .93, cy + Math.sin(a) * r * .93); ctx.stroke(); }
  const hand = (a, l, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(a) * l, cy - Math.cos(a) * l); ctx.stroke(); }; hand(t * spin, r * .75, 7); hand(t * spin / 12, r * .5, 11); ctx.fillStyle = '#2a2740'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill(); }
function lantern(cx, cy, s, t) {
  const f = .85 + .15 * Math.sin(t * 6); glow(cx, cy, 420 * s, 'rgba(255,190,90,A)', .5 * f); ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.strokeStyle = TH.accent; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -330); ctx.lineTo(0, -240); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -340, 18, 0, 7); ctx.stroke();
  ctx.fillStyle = TH.accent; ctx.beginPath(); ctx.moveTo(-70, -230); ctx.lineTo(70, -230); ctx.lineTo(120, -170); ctx.lineTo(-120, -170); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, -245, 36, Math.PI, 0); ctx.fill();
  const g = ctx.createLinearGradient(0, -170, 0, 130); g.addColorStop(0, '#ffe5a0'); g.addColorStop(1, `rgba(255,${150 + 40 * f | 0},60,1)`); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-120, -170); ctx.quadraticCurveTo(-190, -20, -110, 120); ctx.lineTo(110, 120); ctx.quadraticCurveTo(190, -20, 120, -170); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = TH.accent; ctx.lineWidth = 8; ctx.stroke(); [-60, 0, 60].forEach(x => { ctx.beginPath(); ctx.moveTo(x, -170); ctx.quadraticCurveTo(x * 1.5, -20, x * .9, 120); ctx.stroke(); }); star8(0, -20, 38, t * .4, 'rgba(255,255,255,.55)', null);
  ctx.fillStyle = TH.accent; ctx.fillRect(-120, 120, 240, 26); ctx.beginPath(); ctx.moveTo(-60, 146); ctx.lineTo(60, 146); ctx.lineTo(30, 190); ctx.lineTo(-30, 190); ctx.closePath(); ctx.fill(); ctx.restore();
}
function rehal(cx, cy, s, t) { // pupitre en X + livre ouvert
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.strokeStyle = '#8a5a2c'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-170, 200); ctx.lineTo(170, -40); ctx.moveTo(170, 200); ctx.lineTo(-170, -40); ctx.stroke();
  ctx.fillStyle = '#fdf8e8'; ctx.strokeStyle = TH.accent; ctx.lineWidth = 8; [-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(0, -250); ctx.lineTo(d * 250, -230); ctx.lineTo(d * 250, 50); ctx.lineTo(0, 70); ctx.closePath(); ctx.fill(); ctx.stroke(); });
  ctx.strokeStyle = 'rgba(60,50,30,.35)'; ctx.lineWidth = 5; for (let i = 0; i < 6; i++) [-1, 1].forEach(d => { ctx.beginPath(); ctx.moveTo(d * 40, -200 + i * 42); ctx.lineTo(d * 210, -190 + i * 42); ctx.stroke(); }); star8(0, -90, 34 + Math.sin(t * 2) * 3, t * .2, TH.accent, null); ctx.restore();
}
function rug(cx, cy, s, t) { // tapis de prière (vue de face) avec mihrab
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); rr(-210, -330, 420, 660, 26); ctx.fillStyle = '#0e6b4f'; ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = TH.accent; ctx.stroke(); rr(-176, -296, 352, 592, 16); ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-110, 150); ctx.lineTo(-110, -90); ctx.quadraticCurveTo(-110, -230, 0, -250); ctx.quadraticCurveTo(110, -230, 110, -90); ctx.lineTo(110, 150); ctx.closePath(); ctx.fillStyle = '#0a5640'; ctx.fill(); ctx.stroke();
  star8(0, -60, 70, t * .15, TH.accent, null); star8(0, -60, 38, -t * .15, '#0a5640', null); for (let i = 0; i < 4; i++) { ctx.fillStyle = TH.accent; ctx.beginPath(); ctx.arc(-84 + i * 56, 230, 10, 0, 7); ctx.fill(); } ctx.restore();
}
function phone(cx, cy, s) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); rr(-60, -110, 120, 220, 20); ctx.fillStyle = '#1c1c28'; ctx.fill(); ctx.strokeStyle = '#8f8fa8'; ctx.lineWidth = 6; ctx.stroke(); rr(-48, -92, 96, 170, 8); ctx.fillStyle = '#4aa3ff'; ctx.fill(); ctx.restore(); }
function car(cx, cy, s) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.fillStyle = '#e04b4b'; ctx.beginPath(); ctx.moveTo(-150, 30); ctx.lineTo(-130, -20); ctx.lineTo(-70, -22); ctx.lineTo(-30, -70); ctx.lineTo(70, -70); ctx.lineTo(120, -22); ctx.lineTo(160, -10); ctx.lineTo(160, 40); ctx.lineTo(-150, 40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffffff55'; ctx.beginPath(); ctx.moveTo(-20, -58); ctx.lineTo(60, -58); ctx.lineTo(96, -24); ctx.lineTo(-52, -24); ctx.fill(); [-90, 90].forEach(x => { ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.arc(x, 42, 34, 0, 7); ctx.fill(); ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(x, 42, 14, 0, 7); ctx.fill(); }); ctx.restore(); }
function coins(cx, cy, s) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); for (let i = 0; i < 4; i++) for (let j = 0; j <= i; j++) { const x = (j - i / 2) * 84, y = 40 - i * 30; ctx.fillStyle = '#f5c542'; ctx.strokeStyle = '#a97c12'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, y, 42, 20, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e8a81a'; ctx.fillRect(x - 42, y, 84, 14); ctx.beginPath(); ctx.ellipse(x, y + 14, 42, 20, 0, 0, Math.PI); ctx.fill(); ctx.stroke(); } ctx.restore(); }
function alarm(cx, cy, s, t) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); const sh = Math.sin(t * 40) * 5 * (Math.floor(t * 2) % 2 ? 1 : 0); ctx.rotate(sh * .01); ctx.fillStyle = '#d8b14a'; [-1, 1].forEach(d => { ctx.beginPath(); ctx.arc(d * 130, -140, 56, Math.PI * 1.1, Math.PI * 1.9); ctx.fill(); ctx.save(); ctx.translate(d * 130, -170); ctx.restore(); }); ctx.restore(); clock(cx, cy, 190 * s, t, 1.4); }
function counterShow(cx, cy, val, label, k) { const g = ctx.createLinearGradient(0, cy - 140, 0, cy + 140); g.addColorStop(0, TH.accent); g.addColorStop(1, LIGHT ? '#8a5f12' : '#fff1c0'); ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); glow(0, 0, 520, LIGHT ? 'rgba(176,128,31,A)' : 'rgba(241,202,107,A)', .35); ctx.font = `700 280px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = LIGHT ? 'rgba(0,0,0,.12)' : 'rgba(0,0,0,.35)'; ctx.fillText(String(val), 8, 12); ctx.fillStyle = g; ctx.fillText(String(val), 0, 0); text(label, 0, 190, 70, TH.text, SANS, 'center', 800); ctx.restore(); }
function sunTrack(cx, cy, w, t) { ctx.save(); ctx.strokeStyle = LIGHT ? 'rgba(15,58,46,.35)' : 'rgba(255,255,255,.3)'; ctx.setLineDash([16, 18]); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - w, cy + 120); ctx.quadraticCurveTo(cx, cy - 330, cx + w, cy + 120); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  const p = (t * .22) % 1, x = lerp(cx - w, cx + w, p), y = (1 - p) * (1 - p) * (cy + 120) + 2 * p * (1 - p) * (cy - 330) + p * p * (cy + 120); sunDisc(x, y, 56, t);
  ctx.fillStyle = LIGHT ? '#0f3a2e' : '#0b0f26'; ctx.fillRect(cx - w - 40, cy + 124, w * 2 + 80, 8); text('lever', cx - w, cy + 175, 38, TH.dim, SANS, 'center', 700); text('milieu de la journée', cx + w * .1, cy + 175, 38, TH.dim, SANS, 'center', 700); }

// ---------- Scènes (une par segment) ----------
function iconScene(name, s, lt, t, k, p) {
  const cx = W / 2; ctx.save(); ctx.globalAlpha = clamp(lt * 3);
  if (name === 'cave') { crescent(910, 240, 62, TH.accent); hills(1290, '#0a0830', 130, 1, t * 4); cave(cx, 1320, 1.15 * k, t); dog(cx - 60, 1316, 1, t); }
  else if (name === 'city') { crescent(910, 240, 62, TH.accent); hills(1330, '#0a0830', 70, 3); cityScape(cx, 1340, 1.25 * k, '#171340', true); }
  else if (name === 'mountain') { crescent(170, 240, 62, TH.accent); hills(1360, '#0a0830', 120, 2, t * 6); rock(cx + 120, 1340, .9); const pth = (t * .12) % 1; ctx.strokeStyle = 'rgba(241,202,107,.55)'; ctx.setLineDash([18, 16]); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(120, 1500); ctx.quadraticCurveTo(450, 1400, cx + 120, 1250); ctx.stroke(); ctx.setLineDash([]); glow(lerp(120, cx + 120, easeIn(pth)), lerp(1500, 1250, easeIn(pth)), 60, 'rgba(255,220,140,A)', .9); }
  else if (name === 'sleep') { crescent(910, 240, 62, TH.accent); hills(1290, '#0a0830', 130, 1); cave(cx, 1320, 1.15 * k, t, { light: '#9a8aff' }); dog(cx - 60, 1316, 1, t); zzz(cx + 120, 1100, t, '#cfc8ff'); }
  else if (name === 'time') { hills(1290, '#0a0830', 130, 1); cave(cx, 1320, 1.15 * k, t, { light: '#ffcf86' }); const sp = t * .5, a = (sp % 1) * Math.PI, sx = cx - Math.cos(a) * 420, sy = 1000 - Math.sin(a) * 520; const day = (Math.floor(sp) % 2 === 0); if (day) sunDisc(sx, sy, 64, t); else crescent(sx, sy, 70, '#fff4cf'); ctx.fillStyle = `rgba(255,${day ? 220 : 140},120,${.07})`; ctx.fillRect(0, 0, W, H); clock(cx, 520, 170, t, 14); }
  else if (name === 'wake') { const sp = easeOut(clamp(lt / 3)); hills(1290, '#0a0830', 130, 1); sunDisc(cx, lerp(1300, 760, sp), 86, t); cave(cx, 1320, 1.15 * k, t, { light: '#ffe3a8' }); }
  else if (name === 'counter') { const c = s.counter, v = Math.round(c.to * easeOut(clamp(lt / 3.2))); counterShow(cx, 780, v, c.label, k); clock(cx, 1250, 160, t, 40); }
  else if (name === 'book') { glow(cx, 1180, 520, LIGHT ? 'rgba(176,128,31,A)' : 'rgba(241,202,107,A)', .3); rehal(cx, 1200, 1.1 * k, t); }
  else if (name === 'lantern') { lantern(cx, 800, 1.5 * k, t); if (CFG.theme !== 'paper') skyline(cx, 1480, .9, TH.ground); else skyline(cx, 1480, .9, 'rgba(15,58,46,.9)'); }
  else if (name === 'mosque') { skyline(cx, 1450, Math.min(1.1, 1.1 * k), TH.ground); }
  else if (name === 'rug') { rug(cx, 930, Math.min(1.0, k), t); }
  else if (name === 'worth') { const a = easeOut(clamp(lt / 1.6)), x = easeOut(clamp((lt - 2.4) / 1.2)); ctx.globalAlpha *= 1 - .7 * x; phone(cx - 340, 640 + (1 - a) * 80, 1.4); car(cx, 680 + (1 - a) * 80, 1.0); coins(cx + 330, 700 + (1 - a) * 80, .9); ctx.globalAlpha = 1;
    const kk = back(clamp((lt - 2.4) / .6)); glow(cx, 1060, 500, 'rgba(255,214,120,A)', .55 * x); ctx.save(); ctx.translate(cx, 1060); ctx.scale(kk, kk); text('2 RAK\'AT', 0, 0, 150, TH.accent, SERIF); text('valent plus', 0, 120, 54, TH.text, SANS, 'center', 800); ctx.restore(); }
  else if (name === 'alarm') { alarm(cx, 760, 1.1 * k, t); if (CFG.theme === 'dawn') skyline(cx, 1520, .9, TH.ground); }
  else if (name === 'sun') { sunDisc(cx, 760, 150 * k, t); if (LIGHT) { hills(1760, 'rgba(15,58,46,.9)', 60, 1); } }
  else if (name === 'suntrack') { sunTrack(cx, 700, 380, t); hills(1760, 'rgba(15,58,46,.9)', 50, 4); }
  ctx.restore();
}
function arabicCard(s, lt, k) {
  const lines = s.arabic, h = 220 + lines.length * 130, y0 = 760; ctx.save(); ctx.globalAlpha = clamp(lt * 2.5); ctx.translate(W / 2, y0 + h / 2); ctx.scale(.92 + .08 * k, .92 + .08 * k);
  rr(-440, -h / 2, 880, h, 36); ctx.fillStyle = LIGHT ? 'rgba(255,252,243,.92)' : 'rgba(8,8,36,.72)'; ctx.fill(); ctx.strokeStyle = TH.accent; ctx.lineWidth = 6; ctx.stroke(); rr(-420, -h / 2 + 20, 840, h - 40, 24); ctx.lineWidth = 2.5; ctx.stroke();
  star8(0, -h / 2, 30, Math.PI / 8, TH.accent, null); star8(0, h / 2, 30, Math.PI / 8, TH.accent, null);
  lines.forEach((l, i) => { ctx.font = `700 78px ${ARAB}`; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = TH.text; ctx.shadowColor = LIGHT ? 'transparent' : 'rgba(241,202,107,.55)'; ctx.shadowBlur = 22; let sc = 1, w = ctx.measureText(l).width; if (w > 800) sc = 800 / w; ctx.save(); ctx.scale(sc, sc); ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * 125 / sc); ctx.restore(); ctx.shadowBlur = 0; ctx.direction = 'ltr'; });
  ctx.restore(); if (s.source) { ctx.save(); ctx.globalAlpha = clamp((lt - .6) * 2); text(s.source.toUpperCase(), W / 2, y0 + h + 60, 34, TH.accent, SANS, 'center', 800); ctx.restore(); }
}
function bigWord(s, lt) { const k = back(clamp((lt - .25) / .5)); if (k <= 0) return; ctx.save(); ctx.translate(W / 2, 430); ctx.scale(k, k); glow(0, 0, 420, LIGHT ? 'rgba(176,128,31,A)' : 'rgba(241,202,107,A)', .3); ctx.font = `700 ${s.big.length > 8 ? 110 : 150}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = LIGHT ? 'rgba(0,0,0,.12)' : 'rgba(0,0,0,.4)'; ctx.fillText(s.big, 6, 10); const g = ctx.createLinearGradient(0, -80, 0, 80); g.addColorStop(0, TH.accent); g.addColorStop(1, LIGHT ? '#7a5510' : '#fff0bd'); ctx.fillStyle = g; ctx.fillText(s.big, 0, 0); ctx.restore(); }

// ---------- Sous-titres : mots un par un ----------
const ALLW = []; SEGS.forEach((sg, si) => sg.words.forEach(w => ALLW.push({ w: w.w.replace(/[.,;:!?]+$/, ''), s: w.s, e: w.e, si })));
const SUBF = `700 72px ${SERIF}`; let GROUPS = null;
function groups() { const gr = []; let cur = [], cw = 0; ctx.font = SUBF; const gap = 18; ALLW.forEach((w, i) => { const wd = ctx.measureText(w.w).width, br = i && (w.si !== ALLW[i - 1].si || w.s - ALLW[i - 1].e > .45); if (cur.length && (cur.length >= 4 || cw + gap + wd > 900 || br)) { gr.push(cur); cur = []; cw = 0; } cur.push(i); cw += (cur.length > 1 ? gap : 0) + wd; }); if (cur.length) gr.push(cur); return gr; }
function subtitles(t) {
  GROUPS = GROUPS || groups(); const g = GROUPS.find(gr => t >= ALLW[gr[0]].s - .02 && t < ALLW[gr[gr.length - 1]].e + .3); if (!g) return; const hl = new Set((SEGS[ALLW[g[0]].si] && CFG.segments[ALLW[g[0]].si].hl || []).map(x => x.toLowerCase()));
  ctx.font = SUBF; const gap = 18, ws = g.map(i => ctx.measureText(ALLW[i].w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (g.length - 1), y = 1560; let x = W / 2 - total / 2;
  g.forEach((i, j) => { const w = ALLW[i], k = t >= w.s ? back(clamp((t - w.s) / .14)) : 0; if (k > 0) { ctx.save(); ctx.translate(x + ws[j] / 2, y); ctx.scale(k, k); ctx.font = SUBF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = LIGHT ? '#fdf6e4' : TH.ink; ctx.strokeText(w.w, 0, 0); ctx.fillStyle = hl.has(w.w.toLowerCase()) ? TH.accent : TH.text; if (LIGHT && !hl.has(w.w.toLowerCase())) ctx.fillStyle = '#0f3a2e'; ctx.fillText(w.w, 0, 0); ctx.restore(); } x += ws[j] + gap; });
}
function brand(t) { ctx.save(); ctx.globalAlpha = .9; star8(480, 120, 28, t * .3, TH.accent, null); text('HIDAY', 540, 122, 46, TH.accent, SANS, 'left', 800); ctx.restore(); }

function renderFrame(t) {
  bg(t); const i = segAt(t), s = CFG.segments[i], sg = SEGS[i], lt = t - sg.start, k = back(clamp(lt / .6));
  if (!(s.arabic && s.icon === 'book')) iconScene(s.icon, s, lt, t, Math.max(.01, k), 0); if (s.big) bigWord(s, lt); if (s.arabic) arabicCard(s, lt, k);
  subtitles(t); brand(t); ctx.fillStyle = TH.accent; ctx.fillRect(0, H - 14, W * t / DURATION, 14);
}
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all(['Playfair Display', 'Amiri', 'Montserrat'].map(f => document.fonts.load(`40px "${f}"`)).concat([document.fonts.load('italic 40px "Playfair Display"'), document.fonts.load('40px Amiri', 'وَلَبِثُوا')]));
if (!location.search.includes('render')) {
  const audio = new Audio('out/' + CFG.id + '/voice.wav'), hud = document.getElementById('hud'); let t0 = null;
  document.body.onclick = () => { t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
  window.ready.then(() => (function loop(now) { if (t0 === null) t0 = now; const t = ((now - t0) / 1000) % DURATION; renderFrame(t); hud.textContent = t.toFixed(1) + ' s — clic pour le son'; requestAnimationFrame(loop); })(performance.now()));
}

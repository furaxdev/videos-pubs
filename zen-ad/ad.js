// Pub « Zen » (sans voix) — 9:16, 25 s. 23 h 47 : le chaos des notifications, un tap, le silence.
const DURATION = 25.4;
const T = { tap: 6.2, panel: 6.75, tog: [7.7, 8.6, 9.5], close: 10.6, zen: 11.0, zoom: 12.2, typo: 14.0, rows: 16.6, out: 20.7 };
const ACC = { moon: '#6b6bff', leaf: '#2fd27a', plane: '#35b6ff' };
const ease = x => 1 - Math.pow(1 - x, 3);

// ---------- Icônes vectorielles ----------
function iconMoon(x, y, r, col) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.arc(x + r * .5, y - r * .18, r * .86, 0, 7); ctx.fill('evenodd'); ctx.restore(); }
function iconLeaf(x, y, r, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(-.6); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -r); ctx.bezierCurveTo(r * .95, -r * .5, r * .9, r * .55, 0, r); ctx.bezierCurveTo(-r * .9, r * .55, -r * .95, -r * .5, 0, -r); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = r * .09; ctx.beginPath(); ctx.moveTo(0, -r * .7); ctx.lineTo(0, r * 1.15); ctx.stroke(); ctx.restore(); }
function iconPlane(x, y, r, col, rot = Math.PI / 4) { const P = [[0, -1], [.14, -.35], [.95, .1], [.95, .32], [.14, .12], [.12, .62], [.38, .82], [.38, .96], [0, .86], [-.38, .96], [-.38, .82], [-.12, .62], [-.14, .12], [-.95, .32], [-.95, .1], [-.14, -.35]]; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath(); P.forEach(([a, b], i) => ctx[i ? 'lineTo' : 'moveTo'](a * r, b * r)); ctx.fill(); ctx.restore(); }
function iconBell(x, y, r, col) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-r, r * .55); ctx.quadraticCurveTo(-r * .9, r * .5, -r * .8, -r * .1); ctx.bezierCurveTo(-r * .8, -r * .9, r * .8, -r * .9, r * .8, -r * .1); ctx.quadraticCurveTo(r * .9, r * .5, r, r * .55); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, r * .8, r * .22, 0, 7); ctx.fill(); ctx.restore(); }
function enso(x, y, r, prog, col, w) { ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; const n = 90, a0 = -Math.PI * .62, tot = Math.PI * 2 * .94 * prog; for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n; if (u0 * Math.PI * 2 * .94 > tot) break; ctx.lineWidth = w * (.45 + .55 * Math.sin(Math.min(1, u1 * 1.05) * Math.PI * .92 + .25)); ctx.beginPath(); ctx.arc(x, y, r, a0 + u0 * Math.PI * 2 * .94, a0 + u1 * Math.PI * 2 * .94 + .01); ctx.stroke(); } ctx.restore(); }
function appIcon(x, y, s, kind) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const G = { msg: ['#34d17a', '#1fa85e'], mail: ['#4a9bff', '#2b6ee0'], news: ['#ff5a5a', '#d63a3a'], game: ['#9a6bff', '#6a3de0'], soc: ['#ff6aa8', '#ff9a5a'] }[kind]; const g = ctx.createLinearGradient(-28, -28, 28, 28); g.addColorStop(0, G[0]); g.addColorStop(1, G[1]); rr(-28, -28, 56, 56, 16); ctx.fillStyle = g; ctx.fill(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  if (kind === 'msg') { rr(-15, -13, 30, 22, 8); ctx.fill(); ctx.beginPath(); ctx.moveTo(-6, 8); ctx.lineTo(-10, 16); ctx.lineTo(2, 8); ctx.fill(); } else if (kind === 'mail') { rr(-16, -11, 32, 22, 4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-15, -9); ctx.lineTo(0, 3); ctx.lineTo(15, -9); ctx.stroke(); }
  else if (kind === 'news') { [-8, 0, 8].forEach((o, i) => { ctx.beginPath(); ctx.moveTo(-14, o); ctx.lineTo(i === 0 ? 14 : 6, o); ctx.stroke(); }); } else if (kind === 'game') { ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-4, 0); ctx.moveTo(-9, -5); ctx.lineTo(-9, 5); ctx.stroke(); ctx.beginPath(); ctx.arc(8, -3, 3, 0, 7); ctx.arc(14, 3, 3, 0, 7); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-22, -2, -10, -18, 0, -6); ctx.bezierCurveTo(10, -18, 22, -2, 0, 12); ctx.fill(); } ctx.restore(); }
function zenIcon(x, y, s, press = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - .1 * press), s * (1 - .1 * press)); const g = ctx.createLinearGradient(-30, -30, 30, 30); g.addColorStop(0, '#2aa79b'); g.addColorStop(1, '#0c4f5c'); rr(-30, -30, 60, 60, 17); ctx.fillStyle = g; ctx.fill(); enso(0, 0, 14, 1, '#f2fffb', 5); ctx.restore(); }

// ---------- Notifications ----------
const NOTIFS = [['msg', 'Messages', '12 nouveaux messages'], ['mail', 'Mail', 'Offre spéciale : -50 % ce soir'], ['soc', 'Réseau', '3 personnes ont aimé ta photo'], ['news', 'Actus', 'Urgent : ça vient de tomber'], ['game', 'Jeu', 'Tes vies sont revenues !'], ['msg', 'Messages', 'T\'es réveillé ?'], ['mail', 'Mail', 'Ton colis arrive demain'], ['soc', 'Réseau', 'Nouvelle story à voir'], ['news', 'Actus', 'Les résultats en direct'], ['game', 'Jeu', 'Reviens jouer !'], ['msg', 'Messages', 'Appel manqué'], ['soc', 'Réseau', 'Quelqu\'un te suit'], ['mail', 'Mail', 'Rappel : réunion demain 8 h'], ['news', 'Actus', 'À ne pas manquer']];
const NT = NOTIFS.map((_, i) => 0.55 + Math.pow(i / (NOTIFS.length - 1), 1.35) * 4.5);   // arrivées de plus en plus rapides
const CH = 112, GAP = 14;
function notifCard(n, x, y, w, a, k) { if (a <= 0.01) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x + w / 2, y + CH / 2); ctx.scale(k, k); ctx.translate(-(x + w / 2), -(y + CH / 2)); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; rr(x, y, w, CH, 26); ctx.fillStyle = 'rgba(250,250,255,.94)'; ctx.fill(); ctx.shadowColor = 'transparent'; appIcon(x + 52, y + CH / 2, 1, n[0]); text(n[1], x + 98, y + 38, 24, '#1c1c2a', SANS, 'left', 800); text('maintenant', x + w - 24, y + 38, 20, '#8a8aa0', SANS, 'right', 700); text(n[2], x + 98, y + 76, 22, '#4a4a60', SANS, 'left', 700); ctx.restore(); }

// ---------- Téléphone ----------
const PH = { cx: 540, cy: 1090, w: 560, h: 1140 }, SCR = { x: PH.cx - 262, y: PH.cy - PH.h / 2 + 18, w: 524, h: PH.h - 36 };
function drawPhone(t, shake, content) {
  ctx.save(); ctx.translate(shake[0], shake[1]); const x = PH.cx - PH.w / 2, y = PH.cy - PH.h / 2; ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 40; rr(x, y, PH.w, PH.h, 96); const g = ctx.createLinearGradient(x, y, x + PH.w, y + PH.h); g.addColorStop(0, '#3a3d4a'); g.addColorStop(.5, '#15161d'); g.addColorStop(1, '#2c2f3b'); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 3; ctx.stroke();
  rr(x + PH.w - 3, y + 230, 7, 110, 3); ctx.fillStyle = '#272a35'; ctx.fill(); rr(x - 4, y + 190, 7, 70, 3); ctx.fill();
  ctx.save(); rr(SCR.x, SCR.y, SCR.w, SCR.h, 78); ctx.clip(); content(); ctx.restore(); circle(PH.cx, SCR.y + 38, 12, '#05050a'); ctx.restore();
}
function statusBar(t, st) { const y = SCR.y + 40, tc = st.dark ? '#fff' : '#fff'; text(st.time, SCR.x + 56, y, 24, tc, SANS, 'left', 800);
  let rx = SCR.x + SCR.w - 44; const bc = st.batt ? '#2fd27a' : '#fff'; rr(rx - 44, y - 13, 44, 26, 7); ctx.strokeStyle = tc; ctx.lineWidth = 3; ctx.stroke(); rr(rx - 40, y - 9, 36 * (st.batt ? .86 : .66), 18, 4); ctx.fillStyle = bc; ctx.fill(); ctx.fillStyle = tc; ctx.fillRect(rx + 2, y - 5, 4, 10); if (st.batt) iconLeaf(rx - 22, y, 9, '#06351f'); rx -= 70;
  if (st.plane) { iconPlane(rx, y, 15, tc, 0); rx -= 40; } else { for (let i = 0; i < 4; i++) { ctx.fillStyle = tc; ctx.fillRect(rx - 30 + i * 9, y + 10 - (i + 1) * 5, 6, (i + 1) * 5); } rx -= 58; }
  if (st.dnd) { iconMoon(rx, y, 12, tc); rx -= 38; } }

// ---------- Scène A : le chaos sur le téléphone ----------
function phoneScreen(t) {
  const calm = ease(seg(t, T.tog[2], T.zoom)), g = ctx.createLinearGradient(0, SCR.y, SCR.x + SCR.w, SCR.y + SCR.h); g.addColorStop(0, mix('#3b2a8a', '#07323c', calm)); g.addColorStop(.6, mix('#1d3a96', '#0b5a60', calm)); g.addColorStop(1, mix('#6a2a8f', '#1a8a80', calm)); ctx.fillStyle = g; ctx.fillRect(SCR.x, SCR.y, SCR.w, SCR.h);
  glowAdd(SCR.x + SCR.w * .3, SCR.y + 300, 400, calm > .5 ? '90,230,210' : '255,110,170', .22); const clockY = SCR.y + 150; text(t < T.zen ? '23:47' : '23:48', SCR.x + SCR.w / 2, clockY, 118, '#fff', SANS, 'center', 800); text(t < T.zen ? 'samedi 14 novembre' : 'Zen activé', SCR.x + SCR.w / 2, clockY + 78, 26, 'rgba(255,255,255,.78)', SANS, 'center', 700);
  const st = { time: '', dnd: t >= T.tog[0] + .4, batt: t >= T.tog[1] + .4, plane: t >= T.tog[2] + .4 }; statusBar(t, st);
  // dock : le dernier icône est Zen
  const dockY = SCR.y + SCR.h - 110; rr(SCR.x + 28, dockY - 62, SCR.w - 56, 124, 40); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill(); ['msg', 'mail', 'soc'].forEach((k, i) => appIcon(SCR.x + 100 + i * 112, dockY, 1.1, k)); const press = clamp(1 - Math.abs(t - T.tap - .06) / .16), pulse = t > 5.4 && t < T.tap ? .5 + .5 * Math.sin(t * 8) : 0;
  if (pulse) glowAdd(SCR.x + 436, dockY, 130, '90,255,225', .55 * pulse); zenIcon(SCR.x + 436, dockY, 1.1, press);
  // notifications (récentes en haut) ; elles s'évanouissent quand Zen s'active
  const baseY = SCR.y + 250; for (let i = 0; i < NOTIFS.length; i++) { const ta = NT[i]; if (t < ta) continue; let off = 0; for (let j = i + 1; j < NOTIFS.length; j++) if (t >= NT[j]) off += (CH + GAP) * ease(seg(t, NT[j], NT[j] + .3)); const y = baseY + off, td = T.tog[0] + i * .05, out = ease(seg(t, td, td + .5)), a = ease(seg(t, ta, ta + .25)) * (1 - out) * (y < SCR.y + SCR.h - 260 ? 1 : clamp((SCR.y + SCR.h - 190 - y) / 70)), sl = (1 - ease(seg(t, ta, ta + .4))) * 360 - out * 520, k = .92 + .08 * clamp(back(seg(t, ta, ta + .4)));
    notifCard(NOTIFS[i], SCR.x + 28 + sl, y, SCR.w - 56, Math.max(0, a), k); }
  // panneau des réglages rapides
  const pp = ease(seg(t, T.panel, T.panel + .55)) * (1 - ease(seg(t, T.close, T.close + .5))); if (pp > .005) { const py = SCR.y - 490 + 490 * pp; rr(SCR.x + 14, py, SCR.w - 28, 470, 44); ctx.fillStyle = 'rgba(14,16,34,.88)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
    const tiles = [['Ne pas\ndéranger', ACC.moon, iconMoon], ['Économie\nd\'énergie', ACC.leaf, iconLeaf], ['Mode\navion', ACC.plane, iconPlane]]; tiles.forEach(([lab, col, ic], i) => { const cx = SCR.x + 14 + (SCR.w - 28) * (i + .5) / 3, cy = py + 170, on = t >= T.tog[i], k = on ? 1 + .22 * clamp(1 - (t - T.tog[i]) / .35) * Math.sin((t - T.tog[i]) * 20) + 0 : 1;
      if (on) glowAdd(cx, cy, 170, col === ACC.moon ? '110,110,255' : col === ACC.leaf ? '47,210,122' : '53,182,255', .45 * (.6 + .4 * Math.sin(t * 3 + i))); ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); circle(0, 0, 70, on ? col : 'rgba(255,255,255,.12)'); ic === iconPlane ? ic(0, 0, 30, '#fff') : ic(0, 0, 30, '#fff'); ctx.restore();
      lab.split('\n').forEach((l, li) => text(l, cx, cy + 108 + li * 26, 21, '#fff', SANS, 'center', 800)); text(on ? 'Activé' : 'Désactivé', cx, cy + 170, 18, on ? col : 'rgba(255,255,255,.5)', SANS, 'center', 700); }); rr(PH.cx - 50, py + 450, 100, 8, 4); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fill(); }
  // geste : le doigt et l'onde du tap
  const tp = seg(t, T.tap - .35, T.tap + .05), fingerA = tp > 0 && t < T.tap + .5 ? Math.min(1, tp * 3) * (1 - ease(seg(t, T.tap + .2, T.tap + .5))) : 0; if (fingerA > 0) { const fx = SCR.x + 436, fy = SCR.y + SCR.h - 110 + (1 - ease(tp)) * 90; ctx.save(); ctx.globalAlpha = fingerA; circle(fx, fy, 44, 'rgba(255,255,255,.35)'); circle(fx, fy, 26, 'rgba(255,255,255,.7)'); ctx.restore(); }
  for (let r = 0; r < 3; r++) { const q = seg(t, T.tap + r * .12, T.tap + .8 + r * .12); if (q > 0 && q < 1) { ctx.strokeStyle = `rgba(110,255,230,${.8 * (1 - q)})`; ctx.lineWidth = 7 * (1 - q) + 2; circle(SCR.x + 436, SCR.y + SCR.h - 110, 30 + q * 190); ctx.stroke(); } }
}
function chaosBG(t) {
  const calm = ease(seg(t, T.tog[0], T.zoom)), stress = seg(t, .5, 5.2) * (1 - calm); sky([[0, mix('#070b1c', '#06222b', calm)], [1, mix('#1a0f2e', '#0d4a52', calm)]]); glowAdd(540, 1000, 900, calm > .5 ? '60,200,190' : '255,70,90', .18 + .3 * stress * (.6 + .4 * Math.sin(t * 9)) + .2 * calm);
  for (let i = 0; i < 26; i++) { const x = rnd(i) * W, y = ((rnd(i + 3) * H + t * (14 + rnd(i + 8) * 30) * (1 - calm * .8)) % H), a = .1 + .2 * rnd(i + 5); ctx.fillStyle = calm > .5 ? `rgba(160,255,240,${a * .6})` : `rgba(255,120,150,${a * stress})`; circle(x, y, 3 + rnd(i + 1) * 6); }
}
function vibration(t) { let a = 0; for (let i = 0; i < NT.length; i++) { const d = t - NT[i]; if (d > 0 && d < .45 && t < T.tog[0]) a = Math.max(a, (1 - d / .45) * (1.5 + seg(t, 0, 5) * 7)); } return [Math.sin(t * 70) * a, Math.cos(t * 83) * a * .6]; }
function soundArcs(t) { if (t < .5 || t > T.tog[0]) return; for (let i = 0; i < NT.length; i++) { const d = t - NT[i]; if (d > 0 && d < .5) { const q = d / .5; ctx.strokeStyle = `rgba(255,255,255,${.35 * (1 - q)})`; ctx.lineWidth = 4; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(PH.cx + s * 330, PH.cy - 120, 40 + q * 110, s > 0 ? -.9 : Math.PI - .9 + .0, s > 0 ? .9 : Math.PI + .9); ctx.stroke(); }); } } }
function counter(t) { if (t < 1.3 || t > T.tog[0] + .6) return; const n = Math.min(99, Math.floor(seg(t, 1.3, 5.2) * 99)), k = .9 + .1 * Math.sin(t * 14), a = 1 - ease(seg(t, T.tog[0], T.tog[0] + .6)); ctx.save(); ctx.globalAlpha = a; ctx.translate(PH.cx + 230, PH.cy - PH.h / 2 + 6); ctx.scale(k, k); circle(0, 0, 54, '#ff3b4e'); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke(); text(n >= 99 ? '99+' : String(n), 0, 3, n >= 99 ? 38 : 48, '#fff', SANS, 'center', 800); ctx.restore(); }

// ---------- Légendes ----------
function caption(s, t, a, b, y, size, col = '#fff', italic = false) { const k = Math.min(ease(seg(t, a, a + .5)), 1 - ease(seg(t, b - .4, b))); if (k <= 0.01) return; ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 24); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 24; s.split('\n').forEach((l, i) => text(l, W / 2, y + i * size * 1.18, size, col, SERIF, 'center', italic ? 500 : 700, italic ? 'italic' : '')); ctx.restore(); }

// ---------- Scène B : le calme (typographie) ----------
function calmBG(t) {
  sky([[0, '#05242c'], [.55, '#0b4a52'], [1, '#17806f']]); for (let i = 0; i < 5; i++) { const x = 540 + Math.sin(t * .22 + i * 1.7) * 380, y = 480 + i * 280 + Math.cos(t * .18 + i) * 60; glowAdd(x, y, 520, i % 2 ? '90,220,200' : '70,170,230', .22); }
  for (let i = 0; i < 36; i++) { const x = rnd(i) * W + Math.sin(t * .4 + i) * 20, y = H - ((rnd(i + 4) * H + t * (10 + rnd(i + 7) * 24)) % H), a = .12 + .25 * rnd(i + 2); ctx.fillStyle = `rgba(190,255,245,${a})`; circle(x, y, 2 + rnd(i + 9) * 5); }
}
function breathe(t, cx, cy, r) { const b = .5 + .5 * Math.sin(t * 1.4 - 1.57); for (let i = 3; i >= 0; i--) { ctx.strokeStyle = `rgba(190,255,245,${.14 - i * .03})`; ctx.lineWidth = 3; circle(cx, cy, r * (1 + i * .22) + b * 40 * (1 + i * .3)); ctx.stroke(); } glowAdd(cx, cy, r * 2.4, '150,255,235', .28 + .18 * b); }
function typo(t) {
  const fa = ease(seg(t, T.typo - .4, T.typo + .3)); ctx.save(); ctx.globalAlpha = fa; calmBG(t); breathe(t, 540, 960, 260);
  const one = Math.min(ease(seg(t, 14.5, 15.1)), 1 - ease(seg(t, 16.2, 16.6))); if (one > .01) { ctx.save(); ctx.globalAlpha = one; ctx.translate(540, 940); ctx.scale(.92 + .08 * one, .92 + .08 * one); text('Un seul tap.', 0, 0, 170, '#f4fffd', SERIF); ctx.restore(); }
  const rows = [['Ne pas déranger', ACC.moon, iconMoon], ['Économie d\'énergie', ACC.leaf, iconLeaf], ['Mode avion', ACC.plane, iconPlane]]; rows.forEach(([lab, col, ic], i) => { const ta = T.rows + i * .85, k = Math.min(ease(seg(t, ta, ta + .5)), 1 - ease(seg(t, 20.0, 20.5))); if (k <= .01) return; ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * -80, 0); const y = 650 + i * 230; rr(110, y - 90, 860, 180, 90); ctx.fillStyle = 'rgba(255,255,255,.09)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.stroke(); glowAdd(200, y, 130, col === ACC.moon ? '110,110,255' : col === ACC.leaf ? '47,210,122' : '53,182,255', .5); circle(200, y, 62, col); ic(200, y, 28, '#fff'); text(lab, 300, y, 48, '#fff', SANS, 'left', 800); ctx.strokeStyle = '#7dffd4'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(900, y); ctx.lineTo(920, y + 22); ctx.lineTo(950, y - 20); ctx.stroke(); ctx.restore(); });
  const sil = Math.min(ease(seg(t, 20.0, 20.8)), 1 - ease(seg(t, T.out + .3, T.out + .9))); if (sil > .01) { ctx.save(); ctx.globalAlpha = sil; text('Silence.', 540, 940, 190, '#f4fffd', SERIF, 'center', 500, 'italic'); ctx.restore(); }
  ctx.restore(); }
function outro(t) { const k = ease(seg(t, T.out, T.out + .8)); if (k <= .01) return; ctx.save(); ctx.globalAlpha = k; sky([[0, '#05242c'], [1, '#0e6a64']]); breathe(t, 540, 820, 230);
  const prog = ease(seg(t, T.out + .2, T.out + 1.8)); ctx.shadowColor = 'rgba(120,255,230,.5)'; ctx.shadowBlur = 40; enso(540, 820, 220, prog, '#f2fffb', 30); ctx.shadowBlur = 0; circle(540 + 200 * Math.cos(-Math.PI * .62 + Math.PI * 2 * .94 * prog), 820 + 200 * Math.sin(-Math.PI * .62 + Math.PI * 2 * .94 * prog), 0);
  text('Zen', 540, 1160, 190, '#f4fffd', SERIF); const k2 = ease(seg(t, T.out + 1.4, T.out + 2)); ctx.globalAlpha = k * k2; text('Un tap. Le silence.', 540, 1310, 56, '#bff5e8', SERIF, 'center', 500, 'italic'); const k3 = ease(seg(t, T.out + 2.1, T.out + 2.7)); ctx.globalAlpha = k * k3; text('ANDROID 8+   ·   PAR FURAXDEV', 540, 1560, 30, 'rgba(255,255,255,.7)', SANS, 'center', 800); ctx.restore(); }

function renderFrame(t) {
  chaosBG(t);
  const zoomK = ease(seg(t, T.zoom, T.typo)), zs = 1 + .9 * zoomK; ctx.save(); ctx.translate(540, 1010); ctx.scale(zs, zs); ctx.translate(-540, -1010); ctx.globalAlpha = 1 - ease(seg(t, T.zoom + .8, T.typo + .2));
  soundArcs(t); drawPhone(t, vibration(t), () => phoneScreen(t)); counter(t); ctx.restore();
  caption('23 h 47.\nTu veux dormir.', t, .2, 2.7, 210, 78); caption('Mais ton téléphone\nn\'arrête pas.', t, 2.8, 5.4, 210, 78, '#ffd7dc'); caption('Et si tout s\'arrêtait…\nen un seul tap ?', t, 5.5, 7.0, 210, 78, '#e6fff9', true); caption('Le silence.', t, 11.1, 12.4, 1790, 84, '#e6fff9', true);
  typo(t); outro(t); vignette(.3); grain(t);
}
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all(['Playfair Display', 'Montserrat'].map(f => document.fonts.load(`40px "${f}"`)).concat([document.fonts.load('italic 40px "Playfair Display"')]));

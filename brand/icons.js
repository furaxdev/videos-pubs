// Icônes pixel art 16x16 — dessinées en code, contour sombre automatique. Palette 3 (bleu) + orange Claude.
const K = { b: '#4d7cff', l: '#9ab4ff', d: '#2a3f9e', w: '#ffffff', r: '#ff7a2d', y: '#ffd400', g: '#3dffa0', p: '#ff4d5e', s: '#8d97bd', k: '#10142a', n: '#2e3552', t: '#f4a27a', c: '#d77757' };
function make(fn) {
  const g = Array.from({ length: 16 }, () => Array(16).fill(null)), p = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < 16 && y >= 0 && y < 16) g[y][x] = c; };
  const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p(x + i, y + j, c); };
  const L = (x0, y0, x1, y1, c, th = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / (n || 1), y = y0 + (y1 - y0) * i / (n || 1); for (let a = 0; a < th; a++) p(x + a, y, c); } };
  const C = (cx, cy, r, c) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * .4) p(x, y, c); };
  const rows = (list, c) => list.forEach(([y, a, b]) => R(a, y, b - a + 1, 1, c));
  fn({ p, R, L, C, rows }); return g;
}
const ICONS = [
 ['Code', ({ L, p }) => { L(5, 3, 1, 7, 'l', 2); L(1, 7, 5, 11, 'l', 2); L(10, 3, 14, 7, 'l'); L(11, 3, 15, 7, 'l'); L(14, 7, 10, 11, 'l'); L(15, 7, 11, 11, 'l'); L(9, 12, 7, 2, 'w', 2); }],
 ['Terminal', ({ R, p, L }) => { R(1, 2, 14, 12, 'd'); R(1, 2, 14, 3, 'l'); p(2, 3, 'p'); p(4, 3, 'y'); p(6, 3, 'g'); L(3, 7, 5, 9, 'g'); L(5, 9, 3, 11, 'g'); R(7, 11, 5, 1, 'w'); }],
 ['Claude Code', null, null, 'assets/clawd-claude-code.png'],
 ['Lecture', ({ R, rows }) => { R(1, 3, 14, 10, 'p'); R(1, 3, 14, 1, 'w'); rows([[5, 6, 6], [6, 6, 8], [7, 6, 9], [8, 6, 9], [9, 6, 8], [10, 6, 6]], 'w'); }],
 ['Cœur', ({ rows, p }) => { rows([[3, 3, 5], [3, 9, 11], [4, 2, 6], [4, 8, 12], [5, 2, 13], [6, 2, 13], [7, 3, 12], [8, 4, 11], [9, 5, 10], [10, 6, 9], [11, 7, 8]], 'p'); p(3, 4, 'w'); p(4, 4, 'w'); }],
 ['Étoile', ({ rows, p }) => { rows([[1, 7, 8], [2, 7, 8], [3, 6, 9], [4, 1, 14], [5, 3, 12], [6, 4, 11], [7, 5, 10], [8, 4, 11], [9, 3, 6], [9, 9, 12], [10, 2, 4], [10, 11, 13]], 'y'); p(7, 3, 'w'); p(6, 4, 'w'); }],
 ['Valide', ({ C, L }) => { C(8, 8, 6, 'g'); L(4, 8, 7, 11, 'w', 2); L(7, 11, 12, 5, 'w', 2); }],
 ['Erreur', ({ C, L }) => { C(8, 8, 6, 'p'); L(5, 5, 10, 10, 'w', 2); L(10, 5, 5, 10, 'w', 2); }],
 ['Éclair', ({ rows }) => { rows([[1, 8, 11], [2, 7, 10], [3, 6, 9], [4, 4, 11], [5, 7, 12], [6, 7, 10], [7, 6, 9], [8, 5, 8], [9, 5, 7], [10, 5, 6]], 'y'); }],
 ['Dossier', ({ R }) => { R(1, 4, 6, 2, 'l'); R(1, 6, 14, 8, 'b'); R(1, 6, 14, 1, 'l'); }],
 ['Fichier', ({ R }) => { R(3, 1, 10, 14, 'w'); R(10, 1, 3, 3, 'l'); R(5, 6, 6, 1, 'b'); R(5, 8, 6, 1, 'b'); R(5, 10, 4, 1, 'b'); }],
 ['Réglages', ({ C, R }) => { C(8, 8, 5, 's'); R(7, 1, 2, 3, 's'); R(7, 12, 2, 3, 's'); R(1, 7, 3, 2, 's'); R(12, 7, 3, 2, 's'); R(2, 2, 2, 2, 's'); R(12, 2, 2, 2, 's'); R(2, 12, 2, 2, 's'); R(12, 12, 2, 2, 's'); C(8, 8, 2, 'n'); }],
 ['Bug', null, '🐞'],
 ['Fusée', ({ R }) => { R(6, 3, 4, 8, 'w'); R(7, 1, 2, 2, 'p'); R(4, 9, 2, 3, 'p'); R(10, 9, 2, 3, 'p'); R(7, 5, 2, 2, 'b'); R(7, 11, 2, 2, 'y'); R(7, 13, 2, 2, 'r'); }],
 ['Idée', ({ C, R, p }) => { C(8, 6, 5, 'y'); R(6, 11, 4, 2, 's'); R(7, 13, 2, 2, 's'); p(5, 4, 'w'); p(5, 5, 'w'); p(6, 3, 'w'); }],
 ['Horloge', ({ C, R }) => { C(8, 8, 7, 'b'); C(8, 8, 5, 'w'); R(8, 4, 1, 5, 'k'); R(8, 8, 3, 1, 'k'); }],
 ['Téléphone', ({ R, p }) => { R(4, 1, 8, 14, 'd'); R(5, 3, 6, 9, 'b'); R(5, 3, 6, 1, 'l'); p(8, 13, 'l'); }],
 ['Mail', ({ R, L }) => { R(1, 3, 14, 10, 'w'); L(1, 3, 8, 9, 'b'); L(14, 3, 8, 9, 'b'); R(1, 12, 14, 1, 'l'); }],
 ['Cadenas', ({ R }) => { R(5, 2, 6, 2, 's'); R(5, 4, 2, 3, 's'); R(9, 4, 2, 3, 's'); R(3, 7, 10, 8, 'y'); R(7, 10, 2, 3, 'k'); }],
 ['Cloud', ({ C, R }) => { C(5, 10, 3, 'w'); C(8, 7, 4, 'w'); C(11, 10, 3, 'w'); R(5, 10, 7, 4, 'w'); R(5, 13, 7, 1, 'l'); }],
 ['Monde', ({ C, R }) => { C(8, 8, 7, 'b'); R(4, 4, 4, 3, 'g'); R(9, 8, 4, 4, 'g'); R(3, 9, 3, 2, 'g'); R(10, 3, 2, 2, 'g'); }],
 ['Cloche', ({ R, rows }) => { R(7, 1, 2, 2, 'y'); rows([[3, 6, 9], [4, 5, 10], [5, 5, 10], [6, 4, 11], [7, 4, 11], [8, 4, 11], [9, 3, 12], [10, 3, 12], [11, 2, 13]], 'y'); R(7, 13, 2, 2, 'y'); }],
 ['Caméra', ({ R }) => { R(1, 4, 10, 8, 'd'); R(11, 6, 2, 4, 'd'); R(13, 5, 2, 6, 'd'); R(3, 6, 2, 2, 'p'); R(7, 5, 3, 1, 'l'); }],
 ['Micro', ({ R }) => { R(6, 1, 4, 8, 's'); R(5, 2, 6, 6, 's'); R(4, 8, 1, 3, 'l'); R(11, 8, 1, 3, 'l'); R(5, 11, 6, 1, 'l'); R(7, 12, 2, 2, 'l'); R(5, 14, 6, 1, 'l'); }],
 ['Feu', ({ rows }) => { rows([[2, 8, 8], [3, 8, 9], [4, 7, 9], [5, 6, 10], [6, 5, 11], [7, 4, 11], [8, 4, 12], [9, 4, 12], [10, 4, 12], [11, 5, 11], [12, 6, 10]], 'r'); rows([[8, 7, 9], [9, 6, 10], [10, 6, 10], [11, 7, 9]], 'y'); }],
 ['Trophée', ({ R }) => { R(4, 2, 8, 6, 'y'); R(5, 8, 6, 2, 'y'); R(2, 3, 2, 3, 'y'); R(12, 3, 2, 3, 'y'); R(7, 10, 2, 2, 'y'); R(4, 12, 8, 2, 'd'); R(5, 3, 1, 4, 'w'); }],
 ['Attention', ({ R }) => { for (let j = 0; j < 12; j++) { const h = Math.floor(j * .6); R(7 - h, 2 + j, 2 + 2 * h, 1, 'y'); } R(7, 6, 2, 4, 'k'); R(7, 11, 2, 2, 'k'); }],
 ['Recherche', ({ C, L }) => { C(6, 6, 5, 'w'); C(6, 6, 3, 'b'); L(10, 10, 14, 14, 'y', 2); L(10, 11, 13, 14, 'y', 2); }],
 ['Télécharger', ({ R, rows }) => { R(7, 2, 2, 7, 'g'); rows([[7, 4, 11], [8, 5, 10], [9, 6, 9], [10, 7, 8]], 'g'); R(2, 12, 12, 2, 'l'); R(2, 10, 2, 2, 'l'); R(12, 10, 2, 2, 'l'); }],
 ['Curseur', ({ rows }) => { rows([[1, 4, 4], [2, 4, 5], [3, 4, 6], [4, 4, 7], [5, 4, 8], [6, 4, 9], [7, 4, 10], [8, 4, 11], [9, 4, 7], [9, 9, 9], [10, 4, 6], [10, 9, 10], [11, 4, 5], [11, 10, 11], [12, 10, 11]], 'w'); }],
];
const S = 9, cell = { w: 196, h: 214 };
const CL = new Image(); CL.src = window.CLAWD;
function special(c, fn, emo, img, x, y, size) { // fn = pixel art dessiné ; emo = vrai emoji (non pixellisé) ; img = mascotte officielle (pixels nets)
  if (img) { const sw = 378, sh = 253, w = size * .98, h = w * sh / sw; c.imageSmoothingEnabled = false; c.drawImage(CL, 12, 91, sw, sh, x + (size - w) / 2, y + (size - h) / 2, w, h); }
  else if (emo) { c.save(); c.font = (size * .82) + 'px "Noto Color Emoji"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(emo, x + size / 2, y + size / 2 + size * .04); c.restore(); }
  else drawIcon(make(fn), c, x, y, size / 16); }
function drawIcon(g, c, x, y, s) { const px = (i, j, col) => { c.fillStyle = col; c.fillRect(x + i * s, y + j * s, s, s); };
  for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) if (!g[j][i]) { let near = false; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const a = i + di, b = j + dj; if (a >= 0 && a < 16 && b >= 0 && b < 16 && g[b][a]) near = true; } if (near) px(i, j, K.k); }
  for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) if (g[j][i]) px(i, j, g[j][i][0] === '#' ? g[j][i] : K[g[j][i]]); }
if (typeof document !== 'undefined') CL.onload = () => {
  const cv = document.getElementById('c'), c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = '#0a0b14'; c.fillRect(0, 0, 1080, cv.height); c.fillStyle = '#fff'; c.font = '800 42px Montserrat'; c.fillText('Nos icônes · pixel art', 50, 70); c.fillStyle = '#9aa4d0'; c.font = '800 23px Montserrat'; c.fillText('30 icônes 16×16 · contour sombre · palette bleue + orange Claude', 50, 106);
  ICONS.forEach(([name, fn, emo, img], i) => { const col = i % 5, row = Math.floor(i / 5), x0 = 40 + col * (cell.w + 8), y0 = 130 + row * (cell.h + 8); c.fillStyle = '#242b48'; c.beginPath(); c.roundRect(x0, y0, cell.w, cell.h, 22); c.fill(); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; c.stroke();
    special(c, fn, emo, img, x0 + (cell.w - 16 * S) / 2, y0 + 20, 16 * S); c.fillStyle = '#cfd6f5'; c.font = '800 20px Montserrat'; c.textAlign = 'center'; c.fillText(String(i + 1) + ' · ' + name, x0 + cell.w / 2, y0 + cell.h - 16); c.textAlign = 'left'; });
  window.exportAll = () => ICONS.map(([name, fn, emo, img]) => { const o = document.createElement('canvas'); o.width = o.height = 256; const x = o.getContext('2d'); x.imageSmoothingEnabled = false; special(x, fn, emo, img, 0, 0, 256); return [name, o.toDataURL('image/png')]; });
  window.ICONS = ICONS; window.make = make; window.K = K;
}

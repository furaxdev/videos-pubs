// Short 9:16 « Tout est fait en code » — monde voxel (three.js), personnages de FACE.
// Tout est une fonction du temps t ; chaque animation est déclenchée par un mot de la voix off (timeline.js).
const W = 1080, H = 1920, TL = window.TIMELINE, DURATION = TL.duration;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');

// ---------- Outils ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = x => 1 - Math.pow(1 - x, 3), easeIn = x => x * x * x, smooth = x => x * x * (3 - 2 * x);
const back = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const typed = (s, t, a, cps) => s.slice(0, Math.floor(clamp((t - a) * cps, 0, s.length)));
function pop(t, a, b, fin = .3, fout = .22) { if (t < a || t >= b) return 0; return Math.max(0, back(seg(t, a, a + fin)) * (1 - easeIn(seg(t, b - fout, b)))); }

// ---------- Repères tirés de la voix off ----------
const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
function T(word, n = 0) { let c = 0; for (const w of TL.words) if (norm(w.w) === norm(word)) { if (c === n) return w.s; c++; } throw new Error('mot introuvable : ' + word); }
const K = {
  yo: T('Yo'), furax: T('Furax'), dev: T('développeur'), voyez: T('voyez'), elle: T('Elle'), sora: T('Sora'), chatgpt: T('ChatGPT'), gemini: T('Gemini'),
  ceci: T('ceci'), code: T('code'), voici: T('Voici'), claude: T('Claude', 0), ia: T('IA', 0), codeLast: T('codé'), la: T('Là', 0),
  term1: T('terminal', 0), image: T('image', 0), suppr: T('supprimes'), limage: T("l'image"), term2: T('terminal', 1),
  multi: T('multicolore'), ronds: T('ronds'), logoC: T('logo', 0), ballon: T('ballon'), logosIA: T('logos'),
  remets: T('remets'), base: T('base'), abon: T('Abonnez-vous'), police: T('police'), autre: T('autre'), glitch: T('glitch'), surb: T('surbrillance'),
  yt: T('YouTube'), tout: T('tout'), masc: T('mascotte'), ang: T('énervée'), sho: T('choquée'), sad: T('triste'), cry: T('larmes'),
  cc: T('Claude', 2), abonner: T('abonner'), ciao: T('Ciao'),
};
const END_INTRO = T('Vous');

// ---------- Textures « pixel » ----------
function ptex(w, h, fn, smooth_ = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = smooth_; fn(g, w, h);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace; t.userData.canvas = c; return t;
}
function ctex(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData.canvas = c; t.userData.g = c.getContext('2d'); return t; }
const L = c => new THREE.MeshLambertMaterial(typeof c === 'string' ? { color: c } : { map: c });
const B = (w, h, d, mats, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.position.set(x, y, z); return m; };
const px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// ---------- Scène, caméra, lumières ----------
const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); gl.setSize(W, H, false); gl.setPixelRatio(1); gl.setClearColor(0x000000, 0);
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, W / H, .1, 120);
scene.fog = new THREE.Fog('#e9f3ff', 24, 60);
scene.add(new THREE.AmbientLight(0xffffff, 1.35)); const sun = new THREE.DirectionalLight(0xffffff, 1.25); sun.position.set(3, 7, 6); scene.add(sun);

// ---------- Sol : grille bleue (arc-en-ciel pendant « multicolore ») ----------
const floorTex = ctex(1024, 1024); floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(6, 6); floorTex.magFilter = THREE.LinearFilter;
const floor = new THREE.Mesh(new THREE.PlaneGeometry(48, 48), new THREE.MeshBasicMaterial({ map: floorTex })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -6); scene.add(floor);
function multicolor(t) { return easeOut(seg(t, K.multi, K.multi + .5)) * (1 - easeOut(seg(t, K.remets, K.base + .1))); }
function drawFloor(t) {
  const g = floorTex.userData.g, mc = multicolor(t), n = 8, s = 1024 / n; g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2) { g.fillStyle = mc > 0 ? `hsl(${(i * 40 + j * 25 + t * 60) % 360} 90% 90%)` : '#f1f6ff'; g.fillRect(i * s, j * s, s, s); }
  g.lineWidth = 14;
  for (let i = 0; i <= n; i++) { g.strokeStyle = mc > 0 ? `hsl(${(i * 45 + t * 90) % 360} 95% 55%)` : '#2f6bff'; g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 1024); g.stroke();
    g.strokeStyle = mc > 0 ? `hsl(${(i * 45 + 180 + t * 90) % 360} 95% 55%)` : '#2f6bff'; g.beginPath(); g.moveTo(0, i * s); g.lineTo(1024, i * s); g.stroke(); }
  floorTex.needsUpdate = true;
}

// ---------- Personnage « FuraxDev » (voxel, de face) ----------
const P = .13;
function human() {
  const SK = '#e0ac84', HAIR = '#3a2a1e', HOOD = '#2b2d42', JEANS = '#3a4f9a', SHOE = '#1d1d1d', GOLD = '#d4a72c';
  const face = ptex(16, 16, () => { }); const fg = face.userData.canvas.getContext('2d'); let curExpr = null;
  const setFace = e => { if (e === curExpr) return; curExpr = e; const g = fg; g.clearRect(0, 0, 16, 16);
    px(g, 0, 0, 16, 16, SK); px(g, 0, 0, 16, 4, HAIR); px(g, 0, 4, 2, 3, HAIR); px(g, 14, 4, 2, 3, HAIR); px(g, 2, 4, 3, 1, HAIR); px(g, 11, 4, 3, 1, HAIR);
    [[2, 6], [8, 6]].forEach(([x, y]) => { px(g, x, y, 6, 1, GOLD); px(g, x, y + 4, 6, 1, GOLD); px(g, x, y, 1, 5, GOLD); px(g, x + 5, y, 1, 5, GOLD); px(g, x + 1, y + 1, 4, 3, '#fff'); });
    px(g, 6, 7, 3, 1, GOLD);
    if (e === 'shock') { [[3, 7], [9, 7]].forEach(([x, y]) => { px(g, x, y, 4, 3, '#fff'); px(g, x + 1, y, 2, 3, '#111'); }); }
    else if (e === 'happy') { [[3, 8], [9, 8]].forEach(([x, y]) => { px(g, x, y - 1, 4, 3, '#fff'); px(g, x + 1, y, 3, 2, '#111'); }); }
    else [[3, 7], [9, 7]].forEach(([x, y]) => { px(g, x, y, 4, 3, '#fff'); px(g, x + 2, y, 2, 3, '#111'); });
    px(g, 7, 9, 2, 2, '#c18a62');
    if (e === 'grin') { px(g, 4, 11, 8, 3, '#7a1f2b'); px(g, 4, 11, 8, 1, '#fff'); }
    else if (e === 'flat') px(g, 5, 12, 6, 1, '#4a2b22');
    else if (e === 'shock') px(g, 6, 11, 4, 3, '#7a1f2b');
    else { px(g, 4, 11, 1, 1, '#4a2b22'); px(g, 11, 11, 1, 1, '#4a2b22'); px(g, 5, 12, 6, 1, '#4a2b22'); }
    face.needsUpdate = true; };
  setFace('smile');
  const hairTex = ptex(16, 16, g => { px(g, 0, 0, 16, 16, HAIR); }), skinTex = ptex(8, 8, g => px(g, 0, 0, 8, 8, SK));
  const side = ptex(16, 16, g => { px(g, 0, 0, 16, 16, SK); px(g, 0, 0, 16, 5, HAIR); });
  const head = B(8 * P, 8 * P, 8 * P, [L(side), L(side), L(hairTex), L(skinTex), L(face), L(ptex(16, 16, g => { px(g, 0, 0, 16, 16, HAIR); }))], 0, 4 * P, 0);
  const frontTex = ptex(8, 12, g => { px(g, 0, 0, 8, 12, HOOD); px(g, 3, 0, 2, 1, '#444'); px(g, 3, 2, 1, 3, '#ddd'); px(g, 4, 2, 1, 3, '#ddd');
    const o = '#ff7a2d'; [[2, 6], [1, 7], [2, 8], [5, 6], [6, 7], [5, 8], [4, 6], [3, 8]].forEach(([x, y]) => px(g, x, y, 1, 1, o)); });
  const body = B(8 * P, 12 * P, 4 * P, [L(HOOD), L(HOOD), L(HOOD), L(HOOD), L(frontTex), L(HOOD)], 0, 18 * P, 0);
  const sleeve = ptex(4, 12, g => { px(g, 0, 0, 4, 12, HOOD); px(g, 0, 8, 4, 4, SK); });
  const armGeo = () => B(4 * P, 12 * P, 4 * P, [L(sleeve), L(sleeve), L(HOOD), L(SK), L(sleeve), L(sleeve)], 0, -6 * P, 0);
  const jeansTex = ptex(4, 12, g => { px(g, 0, 0, 4, 12, JEANS); px(g, 0, 9, 4, 3, SHOE); px(g, 0, 0, 4, 1, '#2d3f80'); });
  const legGeo = () => B(4 * P, 12 * P, 4 * P, [L(jeansTex), L(jeansTex), L(JEANS), L(SHOE), L(jeansTex), L(jeansTex)], 0, -6 * P, 0);
  const g = new THREE.Group(), headP = new THREE.Group(), armA = new THREE.Group(), armB = new THREE.Group(), legA = new THREE.Group(), legB = new THREE.Group();
  headP.position.y = 24 * P; headP.add(head); armA.position.set(-6 * P, 24 * P, 0); armB.position.set(6 * P, 24 * P, 0); armA.add(armGeo()); armB.add(armGeo());
  legA.position.set(-2 * P, 12 * P, 0); legB.position.set(2 * P, 12 * P, 0); legA.add(legGeo()); legB.add(legGeo()); g.add(headP, body, armA, armB, legA, legB);
  return { g, headP, armA, armB, legA, legB, setFace };
}
const POSES = { idle: [.06, -.06, 'smile'], wave: [.1, 2.5, 'grin'], cheer: [-2.8, 2.8, 'grin'], point: [.1, 1.55, 'smile'], shrug: [-.95, .95, 'flat'] };
function posePerson(h, pose, t) {
  const [a, b, face] = POSES[pose] || POSES.idle; let za = a, zb = b;
  if (pose === 'wave') zb = 2.5 + Math.sin(t * 9) * .35; if (pose === 'cheer') { za = -2.8 + Math.sin(t * 8) * .2; zb = 2.8 - Math.sin(t * 8) * .2; }
  h.armA.rotation.z = pose === 'cheer' || pose === 'shrug' ? za : -Math.abs(a); h.armB.rotation.z = zb; if (pose === 'idle') { h.armA.rotation.z = -.08; h.armB.rotation.z = .08; }
  if (pose === 'wave') h.armA.rotation.z = -.1; if (pose === 'point') h.armA.rotation.z = -.1;
  h.headP.rotation.z = Math.sin(t * 1.5) * .03; h.setFace(face);
}

// ---------- Mascotte Claude en voxel (de face) ----------
function mascot() {
  const U = .1, OR = '#d97757', LT = '#ea9a7c', DK = '#bd6342';
  const faceTex = ptex(20, 13, () => { }), fg = faceTex.userData.canvas.getContext('2d'); let cur = '';
  const p = (x, y, w, h, c) => px(fg, x + 10, y + 16, w, h, c);
  const setFace = (e, t) => { const key = e + (e === 'idle' ? Math.floor((t % 3.3) / .12 < 1 ? 1 : 0) : ''); const bl = e === 'idle' && (t % 3.3) < .12; const k2 = e + bl; if (e !== 'cry' && e !== 'angry' && k2 === cur) return; cur = k2; void key;
    const BK = '#1b1411', WH = '#fff', PK = '#f2a58b', A = e === 'angry', col = A ? '#e0573b' : OR; fg.clearRect(0, 0, 20, 13);
    px(fg, 0, 0, 20, 13, col); px(fg, 0, 0, 20, 1, A ? '#ee7a5e' : LT); px(fg, 0, 11, 20, 2, A ? '#b83c25' : DK);
    [-5, 3].forEach(x => {
      if (A) p(x, -12, 2, 2, BK); else if (e === 'shock') { p(x - 1, -15, 4, 6, BK); p(x, -14, 2, 4, WH); p(x + (x < 0 ? 1 : 0), -12, 1, 2, BK); }
      else if (e === 'cry') p(x - 1, -11, 4, 1, BK); else if (e === 'sad') { p(x, -12, 2, 3, BK); p(x, -12, 1, 1, WH); p(x + 1, -10, 1, 1, WH); }
      else if (e === 'happy') { p(x, -11, 1, 1, BK); p(x + 1, -12, 1, 1, BK); p(x + 2, -11, 1, 1, BK); } else if (bl) p(x, -11, 2, 1, BK); else { p(x, -13, 2, 3, BK); p(x, -13, 1, 1, WH); } });
    p(-8, -8, 2, 1, PK); p(6, -8, 2, 1, PK);
    if (A) { [[-6, -15], [-5, -14], [-4, -13], [5, -15], [4, -14], [3, -13]].forEach(([x, y]) => p(x, y, 1, 1, BK)); p(-2, -6, 1, 1, BK); p(-1, -7, 2, 1, BK); p(1, -6, 1, 1, BK); }
    else if (e === 'shock') p(-1, -8, 2, 2, BK);
    else if (e === 'cry') { [[-6, -13], [-5, -14], [-4, -15], [5, -13], [4, -14], [3, -15]].forEach(([x, y]) => p(x, y, 1, 1, BK)); p(-2, -8, 4, 3, BK); p(-1, -6, 2, 1, '#ff7a90'); }
    else if (e === 'sad') { [[-6, -13], [-5, -14], [-4, -15], [5, -13], [4, -14], [3, -15]].forEach(([x, y]) => p(x, y, 1, 1, BK)); p(-1, -7, 2, 1, BK); p(-2, -6, 1, 1, BK); p(1, -6, 1, 1, BK); }
    else if (e === 'happy') { p(-2, -8, 1, 1, BK); p(-1, -7, 2, 1, BK); p(1, -8, 1, 1, BK); } else p(-1, -7, 2, 1, BK);
    faceTex.needsUpdate = true; };
  const plain = ptex(4, 4, g => { px(g, 0, 0, 4, 4, OR); px(g, 0, 0, 4, 1, LT); }), dark = ptex(4, 4, g => px(g, 0, 0, 4, 4, DK));
  const body = B(20 * U, 13 * U, 12 * U, [L(plain), L(plain), L(plain), L(dark), L(faceTex), L(plain)], 0, 9.5 * U, 0);
  const g = new THREE.Group(); g.add(body);
  const legs = [-7, -3, 2, 6].map(x => { const l = B(3 * U, 4 * U, 4 * U, L(DK), x * U, 2 * U, 2 * U); g.add(l); return l; });
  const mkArm = d => { const a = new THREE.Group(), m = B(1.6 * U, 6 * U, 1.6 * U, L(DK), 0, -3 * U, 0); a.add(m); a.position.set(d * 10.8 * U, 12 * U, 2 * U); g.add(a); return a; };
  const armA = mkArm(-1), armB = mkArm(1);
  return { g, body, armA, armB, legs, setFace };
}
function poseMascot(m, pose, t) {
  m.setFace(pose, t); const sad = pose === 'sad' || pose === 'cry';
  m.armA.rotation.z = -.15; m.armB.rotation.z = .15;
  if (pose === 'shock') { m.armA.rotation.z = -2.9; m.armB.rotation.z = 2.9; } else if (pose === 'happy') m.armB.rotation.z = 2.5 + Math.sin(t * 10) * .4;
  m.g.scale.y = (m.g.userData.s || 1) * (sad ? .94 : 1);
  m.g.rotation.z = pose === 'angry' ? Math.sin(t * 45) * .04 : pose === 'cry' ? Math.sin(t * 30) * .03 : pose === 'shock' ? Math.sin(t * 60) * .02 : 0;
}

// ---------- Larmes et vapeur de la mascotte ----------
const fxMat = [new THREE.MeshBasicMaterial({ color: 0x5ec8ff }), new THREE.MeshBasicMaterial({ color: 0xffffff })], fx = [];
for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.1, .14, .1), fxMat[i < 8 ? 0 : 1]); m.visible = false; scene.add(m); fx.push(m); }
function updateFx(t, pose, mx, ms) {
  fx.forEach(m => m.visible = false); const sc = ms || 1;
  if (pose === 'cry') for (let i = 0; i < 8; i++) { const side = i % 2 ? 1 : -1, ph = (t * 1.7 + Math.floor(i / 2) / 4) % 1; const m = fx[i]; m.visible = true; m.position.set(mx + side * (.45 + (i % 4) * .02) * sc, (1.05 - ph * 1.05) * sc, .66 * sc); m.scale.setScalar(sc); }
  if (pose === 'angry') for (let i = 0; i < 6; i++) { const ph = (t * 1.2 + i / 6) % 1, m = fx[8 + i]; m.visible = true; m.position.set(mx + (i % 2 ? .5 : -.6) * sc + Math.sin(i + t * 3) * .05, (1.7 + ph * 1.1) * sc, .2 * sc); m.scale.setScalar(sc * (1 - ph * .6) * 1.6); }
}

// ---------- Chat voxel ----------
function cat() {
  const U = .14, OR = '#f19a3e', DK = '#c6761f', WH = '#fff4e0';
  const faceTex = ptex(8, 8, g => { px(g, 0, 0, 8, 8, OR); px(g, 2, 0, 1, 2, DK); px(g, 5, 0, 1, 2, DK); px(g, 1, 3, 2, 2, '#7ad86b'); px(g, 5, 3, 2, 2, '#7ad86b'); px(g, 2, 3, 1, 2, '#111'); px(g, 6, 3, 1, 2, '#111'); px(g, 3, 5, 2, 1, '#f08ca0'); px(g, 3, 6, 1, 1, '#5a3a2a'); px(g, 4, 6, 1, 1, '#5a3a2a'); px(g, 0, 5, 1, 1, '#fff'); px(g, 7, 5, 1, 1, '#fff'); });
  const o = ptex(4, 4, g => px(g, 0, 0, 4, 4, OR)), d = ptex(4, 4, g => px(g, 0, 0, 4, 4, DK)), w = ptex(4, 4, g => px(g, 0, 0, 4, 4, WH));
  const g = new THREE.Group();
  g.add(B(8 * U, 9 * U, 6 * U, [L(o), L(o), L(o), L(o), L(w), L(o)], 0, 5 * U, 0));
  g.add(B(8 * U, 7 * U, 7 * U, [L(o), L(o), L(o), L(o), L(faceTex), L(o)], 0, 12.5 * U, 1 * U));
  g.add(B(2 * U, 2 * U, 1.5 * U, L(d), -3 * U, 17.5 * U, 1 * U)); g.add(B(2 * U, 2 * U, 1.5 * U, L(d), 3 * U, 17.5 * U, 1 * U));
  g.add(B(2.5 * U, 3 * U, 3 * U, L(w), -2.5 * U, 1.5 * U, 3.5 * U)); g.add(B(2.5 * U, 3 * U, 3 * U, L(w), 2.5 * U, 1.5 * U, 3.5 * U));
  const tail = new THREE.Group(); tail.position.set(5 * U, 3 * U, -2 * U); tail.add(B(1.8 * U, 9 * U, 1.8 * U, L(d), 0, 4.5 * U, 0)); g.add(tail); g.userData.tail = tail;
  return g;
}

// ---------- Plaques et écrans (cadre bois + texture) ----------
function frameOf(w, h, tex, wood = '#7a4f2a', basic = true) {
  const g = new THREE.Group(); g.add(B(w + .35, h + .35, .3, L(wood), 0, 0, 0));
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); f.position.z = .16; g.add(f); return g;
}
function wordsTex(w, h) { return ctex(w, h); }

// ---------- Particules (cubes qui explosent) ----------
const puffMat = new THREE.MeshBasicMaterial({ color: 0xffffff }), puffGeo = new THREE.BoxGeometry(.28, .28, .28);
const puffs = []; for (let i = 0; i < 90; i++) { const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ color: i % 3 ? 0xffffff : 0x9bbcff })); m.visible = false; scene.add(m); puffs.push(m); }
const PUFFS = [[K.limage + .1, 1.6, 1.4, 0], [K.term2 + .2, 0, 5.6, -.5], [K.tout + .2, -1.6, 2, 0], [K.tout + .2, 0, 6, 0], [K.tout + .25, 1.4, 2.4, 0]];
function updatePuffs(t) {
  puffs.forEach(m => m.visible = false);
  PUFFS.forEach(([t0, x, y, z], pi) => { const k = (t - t0) / .7; if (k < 0 || k > 1) return;
    for (let i = 0; i < 18; i++) { const m = puffs[(pi * 18 + i) % puffs.length]; if (pi * 18 + i >= puffs.length) continue; const a = rnd(i + pi * 7) * Math.PI * 2, e = rnd(i + 3) * Math.PI, d = easeOut(k) * (1.2 + rnd(i + 9) * 2.2);
      m.position.set(x + Math.cos(a) * Math.sin(e) * d, y + Math.cos(e) * d - k * k * 1.5, z + Math.sin(a) * Math.sin(e) * d); m.scale.setScalar(1 - k); m.visible = true; } });
}

// ---------- Cubes qui tombent : ronds orange -> logos Claude, ballons, logos IA ----------
const COLS = 5, ROWS = 11, STEP = 1.25, XS = (c) => (c - 2) * STEP, cellGeo = new THREE.BoxGeometry(1, 1, 1);
let cells = [], aiTex = [], claudeTex = null, orangeTex = null, ballTex = null;
function logoCubeTex(name, bg) {
  return ptex(16, 16, g => { px(g, 0, 0, 16, 16, bg); g.strokeStyle = '#222'; g.lineWidth = 1; g.strokeRect(.5, .5, 15, 15); const i = IMG[name]; if (i && i.complete) { g.imageSmoothingEnabled = true; g.drawImage(i, 2, 2, 12, 12); } });
}
function buildCells() {
  orangeTex = ptex(8, 8, g => { px(g, 0, 0, 8, 8, '#ff8a3d'); for (let i = 0; i < 14; i++) px(g, Math.floor(rnd(i) * 8), Math.floor(rnd(i + 5) * 8), 1, 1, i % 2 ? '#ffa566' : '#e06f20'); });
  claudeTex = logoCubeTex('claude-color', '#f6ead6');
  ballTex = ptex(16, 16, g => { px(g, 0, 0, 16, 16, '#fff'); const bk = '#111'; px(g, 6, 6, 4, 4, bk); px(g, 5, 7, 1, 2, bk); px(g, 10, 7, 1, 2, bk); px(g, 7, 5, 2, 1, bk); px(g, 7, 10, 2, 1, bk);
    [[0, 0], [13, 0], [0, 13], [13, 13]].forEach(([x, y]) => px(g, x, y, 3, 3, bk)); px(g, 7, 0, 2, 2, bk); px(g, 7, 14, 2, 2, bk); px(g, 0, 7, 2, 2, bk); px(g, 14, 7, 2, 2, bk); });
  const names = ['openai', 'gemini-color', 'midjourney', 'sora', 'grok', 'deepseek-color', 'meta-color', 'mistral-color', 'perplexity-color', 'copilot-color']; aiTex = names.map(n => logoCubeTex(n, '#ffffff'));
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const g = new THREE.Group(); const o = new THREE.Mesh(cellGeo, L(orangeTex)), cl = new THREE.Mesh(cellGeo, L(claudeTex)), bl = new THREE.Mesh(cellGeo, L(ballTex)), ai = new THREE.Mesh(cellGeo, L(aiTex[(r * COLS + c) % aiTex.length]));
    [o, cl, bl, ai].forEach(m => { m.visible = false; g.add(m); }); g.visible = false; scene.add(g); cells.push({ g, o, cl, bl, ai, r, c }); }
}
function updateCells(t) {
  cells.forEach(c => c.g.visible = false);
  if (t < K.ronds || t > K.base + .6) return;
  const speed = 1.5, s = (t - K.ronds) * speed, base = Math.floor(s / STEP), TOP = 9.5, fade = 1 - seg(t, K.remets, K.base + .3);
  for (let i = 0; i < ROWS; i++) { const w = base - i; if (w < 0) continue; const y = TOP - (s - w * STEP);
    for (let c = 0; c < COLS; c++) { const cell = cells[i * COLS + c], kind = (w + c) % 3, m = easeOut(seg(t, K.logoC + c * .06, K.logoC + .7 + c * .06)), fb = pop(t, K.ballon + c * .05, 999, .35, .01), ai = pop(t, K.logosIA + c * .05, 999, .35, .01);
      const gp = cell.g; gp.visible = fade > .01; gp.position.set(XS(c), y, -3.2 + Math.sin(t * 2 + w + c) * .1); gp.rotation.y = Math.sin(t * 1.5 + w) * .25; gp.scale.setScalar(fade * Math.min(1, seg(t, K.ronds, K.ronds + .3) + .01));
      const ball = kind === 0 && fb > 0, ail = kind === 1 && ai > 0;
      cell.o.visible = m < 1 && !ball && !ail; cell.cl.visible = m > 0 && !ball && !ail; cell.cl.scale.setScalar(m > 0 ? .5 + .5 * back(m) : 0);
      cell.bl.visible = ball; cell.bl.scale.setScalar(fb || 0); cell.bl.rotation.set(t * 2, t * 1.3, 0); cell.ai.visible = ail; cell.ai.scale.setScalar(ai || 0); cell.ai.rotation.y = t * 1.1; } }
}

// ---------- Nuages blocs ----------
const clouds = []; for (let i = 0; i < 7; i++) { const g = new THREE.Group(); const n = 3 + (i % 3); for (let j = 0; j < n; j++) { const m = B(1.6, .8, 1.2, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .95 }), j * 1.3 - n * .65, (j % 2) * .45, 0); g.add(m); } g.position.set(-9 + i * 3.4, 8 + (i % 3) * 1.1, -14); scene.add(g); clouds.push(g); }
const sunCube = B(2.2, 2.2, .5, new THREE.MeshBasicMaterial({ color: 0xffe14a }), 5.5, 10.5, -16); scene.add(sunCube);

// ---------- Objets de la scène ----------
const IMG = {}; const logoLoads = Object.entries(window.LOGOS).map(([k, src]) => new Promise(res => { const i = new Image(); i.onload = res; i.onerror = res; i.src = src; IMG[k] = i; }));
const FONTS = ['Press Start 2P', 'Silkscreen', 'Bungee', 'VT323', 'Pixelify Sans', 'Jersey 10'];
let hum, mas, catM, termMon, codeMon, tvMon, cards = [], signName, signDev, signSub, signSubTex, ytPlq, signAb, signCiao, signCC, termTex, codeTex, tvTex, cardTex = [];
function textTex(w, h, draw) { const t = ctex(w, h); t.userData.draw = draw; draw(t.userData.g, w, h, 0); t.needsUpdate = true; return t; }
function woodSign(w, h, txt, size, color = '#fff', font = 'Press Start 2P') {
  const tex = textTex(Math.round(w * 200), Math.round(h * 200), (g, cw, ch) => { g.fillStyle = '#9a6a3a'; g.fillRect(0, 0, cw, ch); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < ch; y += 24) g.fillRect(0, y, cw, 3);
    g.font = `${size}px "${font}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1a1208'; g.fillText(txt, cw / 2 + 5, ch / 2 + 6); g.fillStyle = color; g.fillText(txt, cw / 2, ch / 2); });
  return { tex, g: frameOf(w, h, tex) };
}
function drawTerminal(g, lt, idle) {
  const w = 1000, h = 780, fs = 26, lh = 40, P = { bg: '#1a1816', txt: '#e8e3dc', gray: '#8a847b', dim: '#5c5750', or: '#d77757', grn: '#4ec97a', add: '#12351f', sel: '#34312e' };
  g.clearRect(0, 0, w, h); g.fillStyle = P.bg; g.fillRect(0, 0, w, h); g.textBaseline = 'middle';
  const TX = (s, x, y, col = P.txt, wt = 400, size = fs) => { g.font = `${wt} ${size}px "Fira Code", monospace`; g.fillStyle = col; g.textAlign = 'left'; g.fillText(s, x, y); }, X = 34, cur = Math.floor(lt * 3) % 2 ? ' ' : '█';
  g.fillStyle = P.or; g.fillRect(X + 12, 40, 96, 56); g.fillRect(X, 68, 12, 12); g.fillRect(X + 108, 68, 12, 12); [24, 40, 68, 84].forEach(dx => g.fillRect(X + dx, 96, 12, 14)); g.fillStyle = P.bg; g.fillRect(X + 34, 46, 12, 18); g.fillRect(X + 74, 46, 12, 18);
  TX('Claude Code v2.1', X + 160, 60, P.txt, 700, 24); TX('Opus 5.5 · Claude Max', X + 160, 94, P.gray, 400, 24); TX('~/pub-video', X + 160, 128, P.gray, 400, 24);
  const msg = 'Fais-moi une vidéo', sentAt = 1.8; if (!idle && lt >= sentAt) { g.fillStyle = P.sel; g.fillRect(X - 14, 172, w - 40, 46); TX('> ' + msg, X, 196); }
  if (!idle && lt >= 2.0 && lt < 4.25) TX('✻ Cogitating… (esc to interrupt)', X, 266, P.or);
  [[4.25, 'Write(video.js)', 'Wrote 312 lines to video.js', 266, ['+ const W = 1080, H = 1920;', '+ function renderFrame(t) {']], [5.0, 'Bash(node render.js)', 'video.mp4 rendu ✓', 454, []]].forEach(([a, name, res, py, diff]) => {
    if (idle) return; const q = seg(lt, a, a + .15); if (q <= 0) return; g.globalAlpha = q; TX('●', X, py, P.grn); TX(name, X + 40, py, P.txt, 700);
    if (lt > a + .3) { TX('⎿', X + 20, py + lh, P.gray); TX(res, X + 70, py + lh, P.gray); } if (lt > a + .5) diff.forEach((d, i) => { g.fillStyle = P.add; g.fillRect(X + 70, py + 82 + i * 38, w - 150, 36); TX(d, X + 84, py + 100 + i * 38, P.grn, 400, 22); }); g.globalAlpha = 1; });
  if (!idle && lt >= 5.7) { g.globalAlpha = seg(lt, 5.7, 5.85); TX('●', X, 554, P.or); TX('Ta vidéo est prête ! 🎬', X + 40, 554, P.txt); g.globalAlpha = 1; }
  g.strokeStyle = P.dim; g.lineWidth = 2; [584, 648].forEach(y => { g.beginPath(); g.moveTo(20, y); g.lineTo(w - 20, y); g.stroke(); }); TX('> ' + (idle ? '' : lt < sentAt ? typed(msg, lt, .35, 14) : '') + cur, X, 618); TX('? for shortcuts', X, 684, P.gray, 400, 22);
}
const CODE = ['const video = new Video();', 'video.add(text, cat, logo);', 'video.render(); // 🎬'];
function drawCode(g, lt) {
  g.fillStyle = '#1f1d2b'; g.fillRect(0, 0, 960, 520); g.textBaseline = 'middle'; g.textAlign = 'left'; const cols = [[/^(const|new)$/, '#f472b6'], [/^(video)$/, '#7dd3fc'], [/^(render|add|Video)$/, '#fde68a']];
  CODE.forEach((l, i) => { const shown = typed(l, lt, .1 + i * .55, 30); g.font = '400 40px "Fira Code", monospace'; let cx = 90; const ly = 110 + i * 120; g.fillStyle = '#4b4b66'; g.fillText(String(i + 1), 30, ly);
    (shown.match(/\w+|\s+|[^\w\s]/gu) || []).forEach(tok => { const c = shown.indexOf('//') >= 0 && cx > 90 + g.measureText(shown.slice(0, shown.indexOf('//'))).width - 2 ? '#6b7280' : (cols.find(([r]) => r.test(tok)) || [0, '#e8e3dc'])[1]; g.fillStyle = c; g.fillText(tok, cx, ly); cx += g.measureText(tok).width; }); });
  if (lt > 1.7) { g.fillStyle = '#e8e3dc'; g.fillText('▍', 90, 470); }
}
function build() {
  hum = human(); scene.add(hum.g); mas = mascot(); scene.add(mas.g); catM = cat(); scene.add(catM);
  termTex = ctex(1000, 780); termMon = frameOf(4.6, 3.59, termTex); termMon.position.set(0, 5.9, -.5); scene.add(termMon);
  codeTex = ctex(960, 520); codeMon = frameOf(4.4, 2.38, codeTex); codeMon.position.set(0, 5.6, -.5); scene.add(codeMon);
  tvTex = textTex(400, 640, (g, w, h, t) => { g.fillStyle = '#16131f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(140, 220); g.lineTo(140, 420); g.lineTo(290, 320); g.fill(); g.fillStyle = '#ffffff44'; g.fillRect(40, 560, 320, 14); g.fillStyle = '#ff7a2d'; g.fillRect(40, 560, 320 * ((t * .25) % 1), 14);
    g.font = '28px "Press Start 2P"'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('CETTE VIDÉO', 200, 90); });
  tvMon = frameOf(2.0, 3.2, tvTex); tvMon.position.set(1.4, 2.7, -.3); scene.add(tvMon);
  [['SORA', 'sora', -1.75], ['CHATGPT', 'openai', 0], ['GEMINI', 'gemini-color', 1.75]].forEach(([n, img, x]) => {
    const tex = textTex(300, 340, (g, w, h, p) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); const i = IMG[img]; if (i && i.complete) { g.imageSmoothingEnabled = false; const tmp = document.createElement('canvas'); tmp.width = 24; tmp.height = 24; const tg = tmp.getContext('2d'); tg.drawImage(i, 0, 0, 24, 24); g.drawImage(tmp, 40, 30, 220, 220); }
      g.font = '26px "Press Start 2P"'; g.fillStyle = '#111'; g.textAlign = 'center'; g.fillText(n, 150, 295);
      if (p > 0) { g.strokeStyle = '#e5242d'; g.lineWidth = 34; g.lineCap = 'butt'; g.beginPath(); g.moveTo(20, 20); g.lineTo(20 + 260 * Math.min(1, p * 2), 20 + 300 * Math.min(1, p * 2)); g.stroke(); if (p > .5) { g.beginPath(); g.moveTo(280, 20); g.lineTo(280 - 260 * (p - .5) * 2, 20 + 300 * (p - .5) * 2); g.stroke(); } } });
    const f = frameOf(1.5, 1.7, tex); f.position.set(x, 6.4, -.3); f.userData.tex = tex; scene.add(f); cards.push(f); });
  const a = woodSign(4.4, .9, 'FURAXDEV', 56, '#ffe14a'); signName = a.g; signName.position.set(0, 6.4, -.2); scene.add(signName);
  const b = woodSign(4.8, .8, 'DEV FULL STACK PRO', 34, '#fff'); signDev = b.g; signDev.position.set(0, 5.3, -.2); scene.add(signDev);
  signSubTex = textTex(1024, 256, () => { }); signSub = frameOf(4.8, 1.2, signSubTex); signSub.position.set(0, 6.3, -.2); scene.add(signSub);
  const yt = textTex(320, 220, (g, w, h) => { g.fillStyle = '#eee'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff0000'; g.fillRect(20, 30, 280, 160); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(125, 70); g.lineTo(125, 150); g.lineTo(200, 110); g.fill(); g.fillStyle = '#111'; g.font = '22px "Press Start 2P"'; g.textAlign = 'center'; g.fillText('YouTube', w / 2, 212); });
  ytPlq = frameOf(2.0, 1.4, yt); ytPlq.position.set(1.4, 2.8, -.2); scene.add(ytPlq);
  signAb = woodSign(4.6, 1, 'ABONNE-TOI', 52, '#ff5555').g; signAb.position.set(0, 6.0, -.2); scene.add(signAb);
  signCiao = woodSign(4.6, .9, 'CIAO LES BG', 44, '#ffe14a').g; signCiao.position.set(0, 5.0, -.2); scene.add(signCiao);
  signCC = woodSign(4.6, .9, 'CLAUDE CODE', 44, '#ff9a4d').g; signCC.position.set(0, 7.05, -.2); scene.add(signCC);
  buildCells();
}

// ---------- Panneau « ABONNEZ-VOUS ! » : polices, glitch, surbrillance (dessinés dans la texture) ----------
const tmpC = document.createElement('canvas'); tmpC.width = 1024; tmpC.height = 256; const tmp = tmpC.getContext('2d');
function drawSubSign(t) {
  const g = signSubTex.userData.g, font = t < K.police ? 'Press Start 2P' : t < K.autre ? 'Silkscreen' : 'Bungee', size = font === 'Press Start 2P' ? 62 : font === 'Silkscreen' ? 100 : 108;
  tmp.clearRect(0, 0, 1024, 256); tmp.font = `${size}px "${font}"`; tmp.textAlign = 'center'; tmp.textBaseline = 'middle';
  const sb = seg(t, K.surb, K.surb + .9), px_ = 512 - 440 + 880 * easeOut(sb), grad = tmp.createLinearGradient(px_ - 1, 0, px_ + 1, 0);
  grad.addColorStop(0, sb > 0 ? '#ffe14a' : '#fff'); grad.addColorStop(.5, sb > 0 ? '#ffe14a' : '#fff'); grad.addColorStop(.5, '#fff'); grad.addColorStop(1, '#fff');
  tmp.fillStyle = '#1a1208'; tmp.fillText('ABONNEZ-VOUS !', 517, 134); tmp.fillStyle = grad; tmp.fillText('ABONNEZ-VOUS !', 512, 128);
  g.fillStyle = '#9a6a3a'; g.fillRect(0, 0, 1024, 256); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < 256; y += 24) g.fillRect(0, y, 1024, 3);
  if (t >= K.glitch && t < K.glitch + 1.1) { const f = Math.floor(t * 20); g.globalAlpha = .9; g.drawImage(tmpC, -14 - rnd(f) * 12, 0); g.globalAlpha = 1;
    for (let y = 0; y < 256; y += 16) { const sh = rnd(f * 17 + y) > .55 ? (rnd(f + y) - .5) * 90 : 0; g.drawImage(tmpC, 0, y, 1024, 16, sh, y, 1024, 16); } g.fillStyle = 'rgba(0,229,255,.35)'; g.fillRect(0, (rnd(f) * 200) | 0, 1024, 10); }
  else g.drawImage(tmpC, 0, 0);
  signSubTex.needsUpdate = true;
}

// ---------- Montage ----------
const HSEG = (() => { const E = DURATION;
  return [[.05, END_INTRO, 0, 1, 'wave'], [END_INTRO, K.sora - .4, -1.45, .8, 'idle'], [K.sora - .4, K.ceci, 0, .85, 'idle'], [K.ceci, K.voici, 0, .85, 'cheer'], [K.voici, K.claude, -1.2, .85, 'point'],
    [K.claude, K.term2 + .5, -1.5, .8, 'idle'], [K.term2 + .5, K.multi, 0, .85, 'idle'], [K.multi, K.remets, 0, .85, 'cheer'], [K.remets, K.abon, 0, .85, 'shrug'], [K.abon, K.tout + .2, -1.55, .7, 'idle'],
    [K.tout + .2, K.cc - .1, 0, 0, 'idle'], [K.cc - .1, E + 5, -1.55, .85, 'wave']]; })();
function updatePerson(t) {
  let i = HSEG.findIndex(s => t >= s[0] && t < s[1]); if (i < 0) i = HSEG.length - 1; const s = HSEG[i], p = HSEG[Math.max(0, i - 1)], k = smooth(seg(t, s[0], s[0] + .45));
  const x = i === 0 ? s[2] : lerp(p[2], s[2], k), sc = i === 0 ? s[3] * Math.max(0, back(seg(t, .05, .4))) : lerp(p[3], s[3], k);
  hum.g.position.set(x, Math.abs(s[4] === 'cheer' ? Math.sin(t * 8) * .18 : 0), 0); hum.g.scale.setScalar(Math.max(.001, sc)); hum.g.visible = sc > .01; posePerson(hum, s[4], t);
}
function placeSign(o, a, b, y0 = 0) { const k = pop(frameT, a, b, .3, .25); o.visible = k > .01; o.scale.setScalar(Math.max(.001, k)); }
let frameT = 0;
function update(t) {
  frameT = t; drawFloor(t); updatePerson(t); updateCells(t); updatePuffs(t);
  // Mascotte Claude
  let mp = 'idle', mx = 1.5, ms = .9, mk = 0;
  if (t >= K.claude && t < K.term2 + .5) { mk = pop(t, K.claude + .3, K.term2 + .5, .3, .2); mp = t > K.codeLast ? 'happy' : 'idle'; mx = 1.55; ms = .85; }
  else if (t >= K.masc && t < K.cc - .1) { mk = pop(t, K.masc, K.cc - .1, .35, .3); mx = 0; ms = 1.35; mp = t < K.ang ? 'idle' : t < K.sho ? 'angry' : t < K.sad ? 'shock' : t < K.cry ? 'sad' : 'cry'; }
  else if (t >= K.cc - .1) { mk = pop(t, K.cc - .1, DURATION + 5, .3, .01); mx = 1.55; ms = .85; mp = 'happy'; }
  mas.g.visible = mk > .01; mas.g.userData.s = Math.max(.001, ms * mk); mas.g.scale.set(ms * mk, ms * mk, ms * mk); mas.g.position.set(mx, mp === 'shock' ? Math.abs(Math.sin(t * 20)) * .05 : 0, 0); poseMascot(mas, mp, t); updateFx(t, mk > .3 ? mp : '', mx, ms * mk);
  // Écrans, plaques
  const sw = (o, k) => { o.visible = k > .01; o.scale.setScalar(Math.max(.001, k)); };
  const tm = pop(t, K.claude, K.la + .35, .3, .35), ti = pop(t, K.term1, K.term2 + .3, .3, .1); sw(termMon, Math.max(tm, ti)); if (tm > 0 || ti > 0) { drawTerminal(termTex.userData.g, tm > 0 ? t - K.claude : t - K.term1, !(tm > 0)); termTex.needsUpdate = true; }
  const cm = pop(t, K.ceci, K.voici + .1, .3, .3); sw(codeMon, cm); if (cm > 0) { drawCode(codeTex.userData.g, t - K.ceci); codeTex.needsUpdate = true; }
  const tv = pop(t, K.voyez, K.elle + .3, .3, .25); sw(tvMon, tv); if (tv > 0) { tvTex.userData.draw(tvTex.userData.g, 400, 640, t); tvTex.needsUpdate = true; }
  [K.sora, K.chatgpt, K.gemini].forEach((a, i) => { const c = cards[i], k = pop(t, a, K.ceci + .3, .28, .3); sw(c, k); if (k > 0) { const p = seg(t, a + .45, a + .85); c.userData.tex.userData.draw(c.userData.tex.userData.g, 300, 340, p); c.userData.tex.needsUpdate = true; c.position.y = 6.4 + Math.sin(t * 2 + i) * .08; } });
  sw(signName, pop(t, K.furax, END_INTRO - .1, .3, .25)); sw(signDev, pop(t, K.dev, END_INTRO - .1, .3, .25));
  const sb = pop(t, K.abon, K.tout + .3, .3, .3); sw(signSub, sb); if (sb > 0) drawSubSign(t); sw(ytPlq, pop(t, K.yt, K.tout + .3, .35, .3)); ytPlq.rotation.z = Math.sin(t * 5) * .04;
  sw(signAb, pop(t, K.abonner, DURATION + 5, .3, .01) * (1 + Math.sin(t * 7) * .03)); sw(signCiao, pop(t, K.ciao, DURATION + 5, .3, .01)); sw(signCC, pop(t, K.cc, DURATION + 5, .3, .01));
  // Chat
  const ck = pop(t, K.image, K.limage + .1, .3, .08); catM.visible = ck > .01; catM.scale.setScalar(Math.max(.001, ck * 1.05)); catM.position.set(1.5, 0, 0); catM.userData.tail.rotation.z = Math.sin(t * 4) * .3;
  // Nuages + caméra
  clouds.forEach((c, i) => { c.position.x = ((c.position.x + 10 + .004) % 24) - 10; }); const dz = 15.8 - .5 * Math.sin(t * .35);
  cam.position.set(Math.sin(t * .4) * .25, 4.2, dz); cam.lookAt(0, 3.1, 0);
}

// ---------- Sous-titres style chat Minecraft + HUD ----------
const WORDS = []; TL.words.forEach(w => { const l = WORDS[WORDS.length - 1], s = w.w === 'Véo' ? 'Veo' : w.w; if (l && l.w === 'Furax' && s === 'Dev') { l.w = 'FuraxDev'; l.e = w.e; } else WORDS.push({ w: s, s: w.s, e: w.e }); });
const HL = new Set(['furaxdev', 'sora', 'chatgpt', 'gemini', 'veo', 'code', 'codé', 'claude', 'terminal', 'chat', 'multicolore', 'orange', 'foot', 'ia', 'abonnez-vous', 'glitch', 'youtube', 'surbrillance', 'mascotte', 'énervée', 'choquée', 'triste', 'larmes', 'abonner', 'ciao', 'bg', 'logo', 'logos', 'vidéo']);
const SUBF = '34px "Press Start 2P"';
function subtitleGroups() { const gr = []; let cur = [], cw = 0; ctx.font = SUBF; const gap = 20;
  WORDS.forEach((w, i) => { const wd = ctx.measureText(w.w).width, pause = i && w.s - WORDS[i - 1].e > .5; if (cur.length && (cur.length >= 3 || cw + gap + wd > 960 || pause)) { gr.push(cur); cur = []; cw = 0; } cur.push(i); cw += (cur.length > 1 ? gap : 0) + wd; }); if (cur.length) gr.push(cur); return gr; }
let GROUPS = null;
function subtitles(t) {
  GROUPS = GROUPS || subtitleGroups(); const g = GROUPS.find(gr => t >= WORDS[gr[0]].s - .02 && t < WORDS[gr[gr.length - 1]].e + .3); if (!g) return;
  ctx.font = SUBF; const gap = 20, ws = g.map(i => ctx.measureText(WORDS[i].w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (g.length - 1), y = 1752; let x = W / 2 - total / 2;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(W / 2 - total / 2 - 24, y - 40, total + 48, 80);
  g.forEach((i, j) => { const w = WORDS[i]; if (t >= w.s) { ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3f3f3f'; ctx.fillText(w.w, x + 4, y + 4); ctx.fillStyle = HL.has(w.w.toLowerCase()) ? '#ffff55' : '#fff'; ctx.fillText(w.w, x, y); } x += ws[j] + gap; });
}
function toast(t, a, b, label, col) {
  const k = pop(t, a, b, .2, .15); if (k <= 0) return; ctx.save(); ctx.translate(W / 2, 1660); ctx.scale(k, k); ctx.font = '30px "Press Start 2P"'; const w = ctx.measureText(label).width + 60;
  ctx.fillStyle = '#100010'; ctx.fillRect(-w / 2, -42, w, 84); ctx.strokeStyle = '#2d0a63'; ctx.lineWidth = 6; ctx.strokeRect(-w / 2 + 3, -39, w - 6, 78); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(label, 0, 2); ctx.restore();
}
function hud(t) {
  toast(t, K.ia, K.codeLast, '✖ Pas d\'IA vidéo', '#ff5555'); toast(t, K.codeLast, K.la + .35, '✔ Ça, c\'est codé', '#55ff55');
  [[K.ang, K.sho, 'ÉNERVÉ', '#ff5555'], [K.sho, K.sad, 'CHOQUÉ', '#ffff55'], [K.sad, K.cry, 'TRISTE', '#55aaff'], [K.cry, K.cc - .1, 'EN LARMES', '#aaaaff']].forEach(([a, b, s, c]) => toast(t, a, b, s, c));
  toast(t, K.police, K.autre, 'Police : Silkscreen', '#ffff55'); toast(t, K.autre, K.glitch, 'Police : Bungee', '#ffff55'); toast(t, K.glitch, K.surb, 'Effet : glitch', '#ff55ff'); toast(t, K.surb, K.yt, 'Effet : surbrillance', '#ffff55');
  subtitles(t);
  ctx.fillStyle = '#2b2b2b'; ctx.fillRect(180, 1850, 720, 22); ctx.fillStyle = '#80ff20'; ctx.fillRect(184, 1854, 712 * t / DURATION, 14); ctx.fillStyle = '#fff'; ctx.fillRect(184, 1854, 712 * t / DURATION, 3);
}
function drawSky(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H * .6); g.addColorStop(0, '#9fd3ff'); g.addColorStop(1, '#eaf5ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const mc = multicolor(t); if (mc > 0) { const m = ctx.createLinearGradient(0, 0, W, H * .6); for (let i = 0; i <= 5; i++) m.addColorStop(i / 5, `hsl(${(t * 70 + i * 62) % 360} 90% 72%)`); ctx.globalAlpha = mc * .6; ctx.fillStyle = m; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
function renderFrame(t) { drawSky(t); update(t); gl.render(scene, cam); ctx.drawImage(gl.domElement, 0, 0, W, H); hud(t); }
window.renderFrame = renderFrame; window.DURATION = DURATION;
window.ready = Promise.all([...FONTS.map(f => document.fonts.load(`40px "${f}"`)), document.fonts.load('40px "Fira Code"'), ...logoLoads]).then(() => { build(); });
if (!location.search.includes('render')) {
  const audio = new Audio('voice.wav'), hudEl = document.getElementById('hud'); let t0 = null;
  document.body.onclick = () => { t0 = performance.now(); audio.currentTime = 0; audio.play().catch(() => {}); };
  window.ready.then(() => (function loop(now) { if (t0 === null) t0 = now; const t = ((now - t0) / 1000) % DURATION; renderFrame(t); hudEl.textContent = `${t.toFixed(2)}s — clic pour relancer avec le son`; requestAnimationFrame(loop); })(performance.now()));
}

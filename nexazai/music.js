// Génère music.wav (synthwave 120 BPM, 30 s) calée sur l'animation.
const fs = require('fs');
const SR = 44100, DUR = 30, N = SR * DUR, BEAT = 0.5;
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan); R[i] += v * (1 + pan); } };
const freq = n => 440 * Math.pow(2, (n - 69) / 12);
const saw = p => 2 * (p - Math.floor(p + .5));

// Am F C G
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const chordAt = t => CHORDS[Math.floor(t / 2) % 4];

function kick(t0, g = 1) { for (let i = 0; i < SR * .4; i++) { const t = i / SR;
  add(Math.floor((t0 + t) * SR), Math.sin(2 * Math.PI * (45 * t + 90 * (1 - Math.exp(-t * 30)) / 30)) * Math.exp(-t * 8) * .9 * g); } }
function hat(t0, g = .12) { let lp = 0; for (let i = 0; i < SR * .05; i++) { const n = rnd(); const hp = n - lp; lp = n;
  add(Math.floor(t0 * SR) + i, hp * Math.exp(-i / SR * 70) * g, .3); } }
function tick(t0) { for (let i = 0; i < SR * .015; i++) add(Math.floor(t0 * SR) + i, rnd() * Math.exp(-i / SR * 300) * .08, -.2); }
function note(t0, len, n, g, shape = 'saw', pan = 0) { const f = freq(n); let lp = 0;
  for (let i = 0; i < SR * len; i++) { const t = i / SR, env = Math.min(1, t * 200) * Math.exp(-t * 3);
    const v = shape === 'saw' ? saw(f * t) : Math.sin(2 * Math.PI * f * t); lp += (v - lp) * .15;
    add(Math.floor((t0 + t) * SR), lp * env * g, pan); } }

// Pad continu
for (let i = 0; i < N; i++) { const t = i / SR, ch = chordAt(t);
  const vol = (t < 2 ? t / 2 : 1) * (t > 28 ? Math.max(0, (30 - t) / 2) : 1) * .045;
  let v = 0; for (const n of ch) for (const d of [-.08, .08]) v += saw(freq(n - 12 + d) * t);
  add(i, v * vol, Math.sin(t) * .3); }

// Arpège, basse, batterie
for (let b = 0; b < 60; b++) { const t = b * BEAT, ch = chordAt(t);
  for (let s = 0; s < 4; s++) { const ts = t + s * BEAT / 4; if (ts > 29) break;
    note(ts, .2, ch[(b * 4 + s) % 3] + 12, t < 4 ? .04 : .07, 'saw', s % 2 ? .4 : -.4); }
  if (t >= 4 && t < 29) { note(t, .45, ch[0] - 24, .25, 'saw'); hat(t + BEAT / 2); }
  if (t >= 10 && t < 28.5) kick(t);
  if (t >= 10 && t < 28.5) hat(t + BEAT / 4, .06), hat(t + 3 * BEAT / 4, .06); }

// Montée avant le logo (8 → 10 s)
for (let i = 0; i < SR * 2; i++) { const k = i / (SR * 2); add(Math.floor(8 * SR) + i, rnd() * k * k * .25); }
// Impact à 10 s + accent au déploiement
kick(10, 1.4); for (let i = 0; i < SR * 1.5; i++) add(Math.floor(10 * SR) + i, rnd() * Math.exp(-i / SR * 3) * .2);
note(22.4, 1.5, 81, .1, 'sin'); note(22.4, 1.5, 76, .1, 'sin');
// Clics clavier (prompt + commande)
for (let i = 0; i < 34; i++) tick(4.6 + i / 26);
for (let i = 0; i < 19; i++) tick(19.6 + i / 20);
// Accord final
for (const n of [57, 64, 69, 72]) note(28, 2, n, .08, 'sin');

// Normalisation + écriture WAV 16 bits stéréo
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const buf = Buffer.alloc(44 + N * 4), g = .89 / peak;
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.tanh(L[i] * g) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i] * g) * 32767), 46 + i * 4); }
fs.writeFileSync(__dirname + '/music.wav', buf);
console.log('music.wav OK');

// Génère music.wav (28 s) calée sur les impacts du short.
const fs = require('fs');
const SR = 44100, DUR = 28, N = SR * DUR, BEAT = 60 / 128;
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan); R[i] += v * (1 + pan); } };
const freq = n => 440 * Math.pow(2, (n - 69) / 12), saw = p => 2 * (p - Math.floor(p + .5));

function kick(t0, g = 1) { for (let i = 0; i < SR * .4; i++) { const t = i / SR;
  add(Math.floor((t0 + t) * SR), Math.sin(2 * Math.PI * (45 * t + 3 * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 8) * .9 * g); } }
function boom(t0, g = 1, len = 1.2) { for (let i = 0; i < SR * len; i++) { const t = i / SR;
  add(Math.floor((t0 + t) * SR), (Math.sin(2 * Math.PI * (38 + 60 * Math.exp(-t * 14)) * t) * .9 + rnd() * .25) * Math.exp(-t * 4) * g); } }
function hat(t0, g = .1) { let lp = 0; for (let i = 0; i < SR * .05; i++) { const n = rnd(); add(Math.floor(t0 * SR) + i, (n - lp) * Math.exp(-i / SR * 70) * g, .3); lp = n; } }
function tick(t0, g = .08) { for (let i = 0; i < SR * .015; i++) add(Math.floor(t0 * SR) + i, rnd() * Math.exp(-i / SR * 300) * g, -.2); }
function note(t0, len, n, g, shape = 'saw', pan = 0) { const f = freq(n); let lp = 0;
  for (let i = 0; i < SR * len; i++) { const t = i / SR, env = Math.min(1, t * 200) * Math.exp(-t * 3);
    lp += ((shape === 'saw' ? saw(f * t) : Math.sin(2 * Math.PI * f * t)) - lp) * .15; add(Math.floor((t0 + t) * SR), lp * env * g, pan); } }
function sweep(t0, len, g) { for (let i = 0; i < SR * len; i++) { const k = i / (SR * len); add(Math.floor(t0 * SR) + i, rnd() * k * k * g); } }

// 0–8 s : tension (drone grave + coups sur chaque slam)
for (let i = 0; i < SR * 8; i++) { const t = i / SR; add(i, (saw(55 * t) + saw(55.7 * t)) * .05 * Math.min(1, t)); }
for (const t of [.2, .9, 1.6, 4.2, 4.9, 5.6]) boom(t, .8, .8);
for (let i = 0; i < 16; i++) tick(6 + i * .075, .1);          // compteur 360€
sweep(6.8, 1.2, .25);
// STOP (8.0) puis logo (9.0)
boom(8.0, 1.6, 1.0); boom(9.0, 1.4, 1.5); sweep(8.3, .7, .25);
for (const n of [69, 76, 81]) note(9.0, 2, n, .1, 'sin');
// 9–28 s : beat entraînant Am F C G
const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
for (let b = 0; b * BEAT < DUR; b++) { const t = 9 + b * BEAT; if (t >= 27.6) break;
  const ch = CH[Math.floor(b / 4) % 4];
  kick(t); hat(t + BEAT / 2, .1); note(t, .4, ch[0] - 24, .22);
  for (let s = 0; s < 4; s++) note(t + s * BEAT / 4, .2, ch[(b * 4 + s) % 3] + 12, .06, 'saw', s % 2 ? .4 : -.4); }
// Accents synchronisés
for (const t of [11.3, 12.0, 12.7, 21.8]) boom(t, 1.1, .6);
for (let i = 0; i < 52; i++) tick(15.3 + i / 22);             // frappe du prompt
[17.2, 17.7, 18.2, 18.7].forEach((t, i) => { note(t, .5, 76 + i * 2, .09, 'sin'); note(t, .5, 83 + i * 2, .05, 'sin'); });
sweep(20.8, .7, .2);                                           // trait de feutre
note(25, .8, 84, .1, 'sin'); note(25.2, .8, 88, .1, 'sin');   // ding bouton
for (const n of [57, 64, 69, 72]) note(26.5, 1.5, n, .08, 'sin');

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const buf = Buffer.alloc(44 + N * 4), g = .89 / peak;
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.tanh(L[i] * g) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i] * g) * 32767), 46 + i * 4); }
fs.writeFileSync(__dirname + '/music.wav', buf); console.log('music.wav OK');

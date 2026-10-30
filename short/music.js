// Génère music.wav (28 s) : pop électro lumineuse, calée sur les impacts du short.
const fs = require('fs');
const SR = 44100, DUR = 28, N = SR * DUR, BEAT = 0.5;
const mk = () => [new Float32Array(N), new Float32Array(N)];
const [L, R] = mk(), [FL, FR] = mk(); // bus principal + bus d'écho
let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const put = (bus, i, v, pan) => { if (i >= 0 && i < N) { bus[0][i] += v * (1 - pan); bus[1][i] += v * (1 + pan); } };
const freq = n => 440 * Math.pow(2, (n - 69) / 12), TAU = 2 * Math.PI;
const MAIN = [L, R], FX = [FL, FR];

function pluck(t0, n, g, pan = 0, bus = FX, len = .5) { const f = freq(n);
  for (let i = 0; i < SR * len; i++) { const t = i / SR, e = Math.min(1, t * 400) * Math.exp(-t * 7);
    put(bus, Math.floor(t0 * SR) + i, (Math.sin(TAU * f * t) + .4 * Math.sin(TAU * 2 * f * t) * Math.exp(-t * 10) + .2 * Math.sin(TAU * 3 * f * t) * Math.exp(-t * 16)) * e * g, pan); } }
function bell(t0, n, g, len = 1.2) { const f = freq(n);
  for (let i = 0; i < SR * len; i++) { const t = i / SR, e = Math.min(1, t * 500) * Math.exp(-t * 4);
    put(FX, Math.floor(t0 * SR) + i, (Math.sin(TAU * f * t + 2 * Math.sin(TAU * f * 3.5 * t) * Math.exp(-t * 6)) * e) * g, 0); } }
function kick(t0, g = 1) { for (let i = 0; i < SR * .35; i++) { const t = i / SR;
  put(MAIN, Math.floor(t0 * SR) + i, Math.sin(TAU * (50 * t + 28 * (1 - Math.exp(-t * 35)) / 35 * 35 / 35)) * Math.exp(-t * 9) * .75 * g, 0); } }
function clap(t0, g = .3) { let lp = 0; for (let i = 0; i < SR * .18; i++) { const t = i / SR, n = rnd(); lp += (n - lp) * .5;
  put(MAIN, Math.floor(t0 * SR) + i, (n - lp) * (Math.exp(-t * 28) + .6 * Math.exp(-Math.max(0, t - .012) * 40)) * g, .1); } }
function shaker(t0, g = .06) { let lp = 0; for (let i = 0; i < SR * .06; i++) { const n = rnd(); put(MAIN, Math.floor(t0 * SR) + i, (n - lp) * Math.exp(-i / SR * 60) * g, .3); lp = n; } }
function pop(t0, g = 1, f0 = 260) { for (let i = 0; i < SR * .25; i++) { const t = i / SR;
  put(MAIN, Math.floor(t0 * SR) + i, Math.sin(TAU * (f0 * t - 900 * (1 - Math.exp(-t * 18)) / 18 * 0 + 0) + 40 * (1 - Math.exp(-t * 20))) * Math.exp(-t * 16) * .6 * g, 0); } }
function whoosh(t0, len, g, rising = true) { let lp = 0; for (let i = 0; i < SR * len; i++) { const k = i / (SR * len), c = rising ? .02 + .5 * k * k : .02 + .5 * (1 - k) * (1 - k);
  lp += (rnd() - lp) * c; put(MAIN, Math.floor(t0 * SR) + i, lp * Math.sin(Math.PI * k) * g * 2, Math.sin(k * 6) * .4); } }
function crash(t0, g = .25) { let lp = 0; for (let i = 0; i < SR * 1.6; i++) { const n = rnd(); put(MAIN, Math.floor(t0 * SR) + i, (n - lp) * Math.exp(-i / SR * 2.6) * g, 0); lp = n * .7; } }
function click(t0, g = .06) { for (let i = 0; i < SR * .012; i++) put(MAIN, Math.floor(t0 * SR) + i, rnd() * Math.exp(-i / SR * 400) * g, -.2); }

// Accords lumineux C – G – Am – F (changent toutes les 2 s, calés sur le beat à partir de 9 s)
const CH = [[60, 64, 67, 72], [59, 62, 67, 71], [57, 60, 64, 69], [57, 60, 65, 69]], ROOT = [36, 31, 33, 29];
const chordAt = t => (t < 9 ? Math.floor(t / 2) : Math.floor((t - 9) / 2) + 4) % 4;

// Nappe douce (tout au long), plus ample à partir de 9 s
for (let i = 0; i < N; i++) { const t = i / SR, ci = chordAt(t), vol = (t < 8 ? .05 : t < 9 ? .02 : .075) * Math.min(1, t / 1.5) * Math.min(1, (DUR - t) / 1.5);
  let v = 0; for (const n of CH[ci]) for (const d of [-.1, .1]) v += Math.sin(TAU * freq(n - 12 + d) * t) + .3 * Math.sin(TAU * freq(n + d) * t);
  put(MAIN, i, v * vol / 8, Math.sin(t * .8) * .3); }

// Intro 0–8 s : petit pizzicato taquin
for (let b = 0; b < 16; b++) { const t = b * BEAT, ch = CH[chordAt(t)]; pluck(t, ch[b % 3] + 12, .09, b % 2 ? .3 : -.3); }
// Beat à partir de 9 s
for (let b = 0; 9 + b * BEAT < 27.6; b++) { const t = 9 + b * BEAT, ci = chordAt(t), ch = CH[ci];
  kick(t); if (b % 2) clap(t); shaker(t + BEAT / 2); shaker(t + BEAT / 4, .03); shaker(t + 3 * BEAT / 4, .03);
  for (let i = 0; i < SR * .4; i++) { const tt = i / SR; put(MAIN, Math.floor(t * SR) + i, Math.sin(TAU * freq(ROOT[ci] + 12) * tt) * Math.exp(-tt * 4) * .22 * (1 - .6 * Math.exp(-tt * 40) * 0), 0); }
  for (let s = 0; s < 2; s++) pluck(t + s * BEAT / 2, ch[(b * 2 + s * 2 + (b % 3)) % 4] + 12, .11, s ? .35 : -.35); }

// Effets synchronisés
for (const t of [.2, .9, 1.6, 4.2, 4.9, 5.6]) pop(t, 1);
for (let i = 0; i < 16; i++) pluck(6 + i * .075, 84 + Math.floor(i / 2), .08, 0, MAIN, .12); // compteur
whoosh(7.3, .7, .22); pop(8.0, 1.5, 150); whoosh(8.2, .8, .2);
crash(9.0); for (const n of CH[0]) bell(9.0, n + 12, .08);
for (const [t, n] of [[11.3, 84], [12.0, 88], [12.7, 91]]) { pop(t, .9); bell(t, n, .1, .8); }
for (let i = 0; i < 46; i++) click(15.1 + i / 30);
pop(16.7, .6, 400);
[17.4, 18.1, 18.8].forEach((t, i) => bell(t, 84 + i * 3, .1, .9));
whoosh(20.8, .6, .2); pop(21.8, 1.3, 180); bell(21.8, 79, .09);
bell(25.0, 88, .12); bell(25.2, 91, .12); for (const n of [60, 64, 67, 72]) bell(26.4, n + 12, .06, 1.5);

// Écho stéréo sur le bus FX puis mixage
const D = Math.floor(SR * BEAT * .75);
for (let i = D; i < N; i++) { FL[i] += FR[i - D] * .38; FR[i] += FL[i - D] * .38; }
for (let i = 0; i < N; i++) { L[i] += FL[i]; R[i] += FR[i]; }

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const buf = Buffer.alloc(44 + N * 4), g = .85 / peak;
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { const f = Math.min(1, (DUR - i / SR) / 1.2);
  buf.writeInt16LE(Math.round(Math.tanh(L[i] * g * 1.2) * f * 32767 * .9), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i] * g * 1.2) * f * 32767 * .9), 46 + i * 4); }
fs.writeFileSync(__dirname + '/music.wav', buf); console.log('music.wav OK, peak', peak.toFixed(2));

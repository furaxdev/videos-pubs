// Rend la pub Zen (muette) en 1080x1920, 30 i/s -> zen-ad.mp4
const { chromium } = require('playwright'), { spawn } = require('child_process'), path = require('path'), FPS = 30;
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, 'index.html')); await p.evaluate(() => window.ready);
  const total = Math.ceil(await p.evaluate(() => window.DURATION) * FPS), out = path.join(__dirname, 'zen-ad.mp4');
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = 0; f < total; f++) { const d = await p.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .93); }, f / FPS); if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await b.close(); ff.on('close', c => console.log(c === 0 ? 'OK -> ' + out : 'ffmpeg erreur ' + c));
})();

// Usage : node render.js kahf  -> out/kahf/<id>.mp4 (image par image + voix off)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), FPS = 30, id = process.argv[2] || 'kahf';
(async () => {
  const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exit(1); });
  await page.goto('file://' + path.join(__dirname, 'index.html') + '?render&v=' + id); await page.evaluate(() => window.ready);
  const total = Math.ceil(await page.evaluate(() => window.DURATION) * FPS), out = path.join(__dirname, 'out', id, `hiday-${id}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', path.join(__dirname, 'out', id, 'voice.wav'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = 0; f < total; f++) { const d = await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .95); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await browser.close(); ff.on('close', c => console.log(c === 0 ? 'OK -> ' + out : 'ffmpeg erreur ' + c));
})();

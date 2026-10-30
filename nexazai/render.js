// Rend l'animation image par image puis assemble la vidéo avec ffmpeg.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const FPS = 30;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(__dirname, 'index.html') + '?render');
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => window.DURATION) * FPS;
  const out = path.join(__dirname, 'nexazai-pub.mp4');
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', path.join(__dirname, 'music.wav'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18',
    '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = 0; f < total; f++) {
    const data = await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .95); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(data.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 90 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end(); await browser.close();
  ff.on('close', c => console.log(c === 0 ? 'OK -> ' + out : 'ffmpeg erreur ' + c));
})();

// Rend le short image par image (1080x1920) puis assemble avec ffmpeg + voix off (voice.wav).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('PAGEERROR', e.message); process.exit(1); });
  await page.goto('file://' + path.join(__dirname, 'index.html') + '?render');
  await page.evaluate(() => window.ready);
  const total = Math.ceil(await page.evaluate(() => window.DURATION) * FPS);
  const out = path.join(__dirname, 'short-code-video.mp4'), voice = path.join(__dirname, 'voice.wav'), hasVoice = fs.existsSync(voice);
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    ...(hasVoice ? ['-i', voice, '-c:a', 'aac', '-b:a', '192k'] : ['-an']),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = 0; f < total; f++) {
    const data = await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .95); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(data.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log(`frame ${f}/${total}`);
  }
  ff.stdin.end(); await browser.close();
  ff.on('close', c => console.log(c === 0 ? 'OK -> ' + out : 'ffmpeg erreur ' + c));
})();

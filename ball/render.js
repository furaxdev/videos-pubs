// node ball/render.js <dossier-exemple> [stills t1 t2 …]  -> <dossier>/ball-SANS-musique.mp4 (60 fps, silencieux) ; "stills" = PNG 1:1 dans <dossier>/stills
const { chromium } = require('playwright'), { spawn } = require('child_process'), path = require('path'), fs = require('fs');
(async () => {
  const dir = path.resolve(process.argv[2] || 'ball/exemples/montagem-royal'), rel = path.relative(__dirname, dir), out = path.join(dir, 'ball-SANS-musique.mp4');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => { console.error('ERR', e.message); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, 'index.html') + '?dir=' + rel); await p.evaluate(() => window.ready);
  const FPS = await p.evaluate(() => window.FPS), total = Math.round(await p.evaluate(() => window.DURATION) * FPS);
  if (process.argv[3] === 'stills') { fs.mkdirSync(path.join(dir, 'stills'), { recursive: true }); for (const t of process.argv.slice(4)) { await p.evaluate(t => renderFrame(t), +t); await p.locator('#c').screenshot({ path: path.join(dir, 'stills', `t${t}.png`) }); } await b.close(); return; }
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-an', '-c:v', 'libx264', '-r', String(FPS), '-pix_fmt', 'yuv420p', '-crf', '17', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'ignore'] });
  for (let f = 0; f < total; f++) { const d = await p.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .95); }, f / FPS); if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await b.close(); ff.on('close', c => { console.log(c === 0 ? 'OK ' + out + ` (${total} images)` : 'ffmpeg erreur'); process.exit(c); });
})();

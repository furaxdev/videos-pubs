const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const base = 'file://' + path.join(__dirname, 'dist');
  const p = await b.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2 }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(base + '/index.html'); await p.waitForTimeout(800); await p.screenshot({ path: '/tmp/s1.png' });
  await p.fill('#q', 'hack'); await p.waitForTimeout(300); await p.screenshot({ path: '/tmp/s2.png' });
  await p.fill('#q', 'zzzz'); await p.waitForTimeout(300); await p.screenshot({ path: '/tmp/s3.png' });
  await p.fill('#q', 'agents securite'); await p.waitForTimeout(300); console.log('visible cards for "agents securite":', await p.$$eval('.card', c => c.filter(x => x.style.display !== 'none').length));
  await p.goto(base + '/r/agents-openai-hugging-face/index.html'); await p.waitForTimeout(800); await p.screenshot({ path: '/tmp/s4.png', fullPage: true });
  await b.close(); })();

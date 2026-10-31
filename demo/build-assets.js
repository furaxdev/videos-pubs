// Embarque les logos (SVG) en data URI pour ne pas "tainter" le canvas au rendu.
const fs = require('fs'), dir = __dirname + '/assets/logos/', out = {};
for (const f of fs.readdirSync(dir)) {
  const svg = fs.readFileSync(dir + f, 'utf8').replace(/currentColor/g, '#16131f').replace('width="1em"', 'width="512"').replace('height="1em"', 'height="512"');
  out[f.replace('.svg', '')] = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}
fs.writeFileSync(__dirname + '/logos.js', 'window.LOGOS = ' + JSON.stringify(out) + ';\n');
console.log(Object.keys(out).join(', '));

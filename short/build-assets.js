// Embarque le logo Claude en data URI (évite de "tainter" le canvas au rendu).
const fs = require('fs');
const svg = fs.readFileSync(__dirname + '/assets/claude-color.svg', 'utf8').replace('width="1em"', 'width="512"').replace('height="1em"', 'height="512"');
fs.writeFileSync(__dirname + '/logo.js', 'window.CLAUDE_LOGO = "data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64') + '";\n');

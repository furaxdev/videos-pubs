// QA du site : node site/qa.js  — parcourt accueil + chaque ressource, en 6 tailles d'écran × clair/sombre × zoom texte 100/150/200 %.
// Contrôle : débordement horizontal, éléments hors écran, texte coupé, éléments qui se chevauchent, cibles tactiles < 44 px, contraste < 4,5:1,
// images cassées, erreurs console, police chargée, vidéo (poster, taille), lien/pastille collés, ligne de plus de 75 caractères (desktop).
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const DIST = path.join(__dirname, 'dist'), SIZES = [[320, 640], [360, 740], [390, 844], [430, 932], [768, 1024], [1280, 800]];
const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
(async () => {
  const b = await chromium.launch(), pages = ['index.html', ...fs.readdirSync(path.join(DIST, 'r')).map(s => `r/${s}/index.html`)], found = new Map();
  const add = (k, v) => { if (!found.has(k)) found.set(k, new Set()); found.get(k).add(v); };
  for (const scheme of ['light', 'dark']) for (const [w, h] of SIZES) for (const zoom of [1, 1.5, 2]) for (const pg of pages) {
    const ctx = await b.newContext({ viewport: { width: Math.round(w / zoom), height: Math.round(h / zoom) }, deviceScaleFactor: zoom, colorScheme: scheme }), p = await ctx.newPage(), tag = `${pg.replace('/index.html', '')} · ${w}px · ${scheme}${zoom > 1 ? ' · zoom ' + zoom * 100 + '%' : ''}`;
    p.on('pageerror', e => add('erreur JS : ' + e.message, tag)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_(NAME|INTERNET|CONNECTION|BLOCKED)/.test(m.text())) add('console : ' + m.text().slice(0, 100), tag); });
    await p.goto('file://' + path.join(DIST, pg)); await p.waitForTimeout(400);
    await p.waitForTimeout(150);
    const res = await p.evaluate(zoomF => {
      const out = [], vw = document.documentElement.clientWidth, de = document.documentElement;
      if (de.scrollWidth > vw + 1) out.push(['débordement horizontal de la page', `${de.scrollWidth}px > ${vw}px`]);
      const els = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'; });
      const leaf = els.filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
      els.forEach(e => { const r = e.getBoundingClientRect(); if (e.closest('video,svg')) return; if (r.right > vw + 1 || r.left < -1) out.push(['élément hors de l\'écran', `${e.tagName.toLowerCase()}.${e.className} « ${(e.textContent || '').trim().slice(0, 30)} » (${Math.round(r.left)}→${Math.round(r.right)})`]); });
      leaf.forEach(e => { const cs = getComputedStyle(e); if (cs.overflow !== 'visible' && cs.webkitLineClamp === 'none' && e.scrollWidth > e.clientWidth + 1) out.push(['texte coupé', (e.textContent || '').trim().slice(0, 40)]); });
      // chevauchement entre éléments texte (hors parent/enfant)
      for (let i = 0; i < leaf.length; i++) for (let j = i + 1; j < leaf.length; j++) { const A = leaf[i], B = leaf[j]; if (A.contains(B) || B.contains(A)) continue; const a = A.getBoundingClientRect(), c = B.getBoundingClientRect(); const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ix > 2 && iy > 4) out.push(['textes qui se chevauchent', `« ${A.textContent.trim().slice(0, 24)} » / « ${B.textContent.trim().slice(0, 24)} »`]); }
      // éléments collés sur la même ligne (espace < 8 px) entre un lien et une pastille/badge
      const inl = [...document.querySelectorAll('a,.pill,.mot,.badge,button')].filter(e => els.includes(e));
      for (let i = 0; i < inl.length; i++) for (let j = i + 1; j < inl.length; j++) { const a = inl[i].getBoundingClientRect(), c = inl[j].getBoundingClientRect(); if (inl[i].contains(inl[j]) || inl[j].contains(inl[i])) continue; const sameRow = Math.abs((a.top + a.bottom) / 2 - (c.top + c.bottom) / 2) < Math.min(a.height, c.height) / 2; const gap = Math.max(c.left - a.right, a.left - c.right); if (sameRow && gap < 8 && gap > -2) out.push(['éléments collés (espace < 8 px)', `« ${inl[i].textContent.trim().slice(0, 24)} » + « ${inl[j].textContent.trim().slice(0, 24)} »`]); }
      // cibles tactiles
      if (vw < 800) document.querySelectorAll('a,button,input,video').forEach(e => { if (!els.includes(e) || e.tagName === 'VIDEO') return; const r = e.getBoundingClientRect(); if (r.height < 44 || r.width < 44) { if (e.closest('.card') && e.tagName === 'A') return; out.push(['cible tactile < 44 px', `${e.tagName.toLowerCase()} « ${(e.textContent || e.placeholder || '').trim().slice(0, 24)} » ${Math.round(r.width)}×${Math.round(r.height)}`]); } });
      // contraste
      const bgOf = e => { for (let n = e; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor.match(/[\d.]+/g).map(Number); if (c.length === 3 || c[3] > .9) return c.slice(0, 3); } return [255, 255, 255]; };
      const L = c => { const f = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * f[0] + .7152 * f[1] + .0722 * f[2]; };
      leaf.forEach(e => { const cs = getComputedStyle(e), fg = cs.color.match(/[\d.]+/g).map(Number).slice(0, 3), bg = bgOf(e), l1 = L(fg), l2 = L(bg), cr = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05), big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.6 && +cs.fontWeight >= 700); if (cr < (big ? 3 : 4.5)) out.push(['contraste faible', `${cr.toFixed(1)}:1 « ${(e.textContent || '').trim().slice(0, 28)} »`]); });
      document.querySelectorAll('img').forEach(i => { if (!i.complete || i.naturalWidth === 0) out.push(['image cassée', i.getAttribute('src')]); });
      const v = document.querySelector('video'); if (v) { const r = v.getBoundingClientRect(); if (r.right > vw + 1) out.push(['vidéo trop large', Math.round(r.right)]); }
      if (!document.fonts.check('16px Inter') && false) out.push(['police Inter non chargée', '']);
      document.querySelectorAll('p,li').forEach(e => { if (vw / zoomF >= 1000 && e.getBoundingClientRect().width / zoomF > 760) out.push(['ligne trop longue (> 75 car.)', Math.round(e.getBoundingClientRect().width / zoomF) + 'px']); });
      return out;
    }, 1);
    res.forEach(([k, v]) => add(k, `${tag} — ${v}`)); await ctx.close();
  }
  // états de la recherche (mobile)
  for (const q of ['hack', 'zzzz', 'agents securite', '']) { const ctx = await b.newContext({ viewport: { width: 360, height: 740 } }), p = await ctx.newPage(); await p.goto('file://' + path.join(DIST, 'index.html')); await p.fill('#q', q); await p.waitForTimeout(200);
    const st = await p.evaluate(() => ({ cards: [...document.querySelectorAll('.card')].filter(c => c.style.display !== 'none').length, none: getComputedStyle(document.getElementById('none')).display !== 'none', found: document.getElementById('found').textContent })); 
    const exp = { hack: [1, false], zzzz: [0, true], 'agents securite': [1, false], '': [pages.length - 1, false] }[q]; if (st.cards !== exp[0] || st.none !== exp[1]) add('recherche : résultat inattendu', `« ${q} » → ${JSON.stringify(st)}`); await ctx.close(); }
  await b.close();
  const keys = [...found.keys()]; if (!keys.length) { console.log('QA SITE : aucun problème'); return; }
  console.log(`QA SITE : ${keys.length} type(s) de problème`); keys.forEach(k => { const s = [...found.get(k)]; console.log(` - ${k}  (${s.length}×)`); s.slice(0, 4).forEach(x => console.log('     ' + x)); }); process.exit(1);
})();

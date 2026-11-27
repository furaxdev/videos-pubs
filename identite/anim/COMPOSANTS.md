# Composants visuels (kit2.js) et logos
Charger dans index.html : `<script src="../../assets/logos.js"></script><script src="../kit.js"></script><script src="../kit2.js"></script>` (chemins relatifs au dossier du projet ; voir `identite/anim/catalogue/`). Précharger les logos : `loadLogos([['github', null], ['github', '#ff3b4e'], ...])` (couleur `null` = couleur de la marque) dans `window.ready`.
**Démo de tous les composants : `identite/anim/catalogue/` (catalogue.mp4).**

| Composant | Appel | Sert à |
|---|---|---|
| `logoTile` | `{name, cx, cy, size, state, flip:{at,to}, delay, label}` | logo d'une marque ; états normal / alert (rouge, tremble, fissures) / ok (vert + coche) / dead |
| `timeline` | `{x, y, events:[{date,label,color}], step, delay}` | dates d'un incident / d'une sortie |
| `versus` | `{a:{logo,label,value}, b:{...}, win:0|1}` | A contre B (prix, perfs) |
| `bars` | `{x, y, w, items:[{label,value,color,fmt}]}` | comparaison chiffrée |
| `notification` | `{app, title, body, logo, delay}` | toast de téléphone (glisse depuis la droite) |
| `chat` | `{msgs:[{text, me}]}` | échange de messages |
| `diff` | `{lines:[{k:'+'/'-'/' ', s}]}` | code modifié |
| `browser` | `{url, draw}` | page web / site |
| `icon2` | `(ctx, nom, cx, cy, size, couleur)` | lock, unlock, key, db, cloud, file, bug, phone, globe, eye, chip |
| `photo` | `{name, x, y, w, h, credit}` | image téléchargée (`loadImages([...])`), cadre bleu, zoom lent, crédit |
| `stamp` | `{text, cx, cy, color}` | tampon (COMPROMIS, FAUX, VALIDÉ…) |
| `circle` | `{cx, cy, rx, ry}` | cercle au marqueur qui se trace autour d'un élément |
| `arrow` | `{x0,y0,x1,y1,bend,color}` | flèche courbe qui se dessine |
| `pulse` | `{cx, cy, r, color}` | anneaux qui pulsent (attire l'œil) |
| `spotlight` | `{cx, cy, rx, ry}` | assombrit tout sauf une zone (à dessiner après la scène) |
| `ticker` | `{y, items}` | bandeau d'actus qui défile (plein écran, volontaire) |
| `ring` | `{cx, cy, value, color}` | anneau de pourcentage animé |
| `mouse` | `{from, to, name, color, style:'fill'\|'outline'}` | curseur de souris EXACT style Figma (pointe fine + étiquette rectangulaire au nom, en bas à droite : garder ≥ 150 px de marge à droite) |
| `checklist` | `{x, y, items}` | liste dont les cases se cochent une à une |
(+ tout `kit.js` : `textFx` (10 styles : fade, blur, blurWords, letters, slideLeft, slideDown, tracking, wipe, focus, type), `rise`, `words`, `underline`, `strike`, `windowBox`, `typing`, `draw`, `tile`, `counter`, `wipe`, `progress`)

## Télécharger automatiquement logos et images — `identite/assets/fetch.py`
À lancer par l'agent AVANT d'écrire la scène, pour chaque marque/visuel du sujet :
- `python3 identite/assets/fetch.py logo github 1password aws claude` : ajoute les logos (simple-icons ; repli Wikimedia Commons ; alias aws/gpt/gemini/hf/twitter…). Lit `search <mot>` pour voir les candidats, `logo-url <nom> <url-svg>` pour un fichier précis.
- `python3 identite/assets/fetch.py og <url-article> <nom>` : récupère l'image de couverture d'un article (visuel de presse, crédité dans `CREDITS.md`).
- `python3 identite/assets/fetch.py image <url> <nom> "crédit"` : télécharge n'importe quelle image (png/jpg/webp/svg), la redimensionne et l'enregistre.
- `python3 identite/assets/fetch.py build` régénère `logos.js` / `images.js` (automatique après chaque ajout). Crédits/licences : `identite/assets/CREDITS.md`.
- Dans le projet : charger `../../assets/logos.js` et `../../assets/images.js`, puis `loadLogos([...])` et `loadImages([...])` dans `window.ready`.
Si un logo est introuvable : tuile avec l'initiale ou une icône (`icon2`), jamais un faux logo.


## Logos disponibles (`identite/assets/logos.js`, simple-icons, 67)
1password, amd, android, anthropic, apple, arm, bitwarden, brave, bytedance, cisco, cloudflare, debian, discord, docker, facebook, firebase, firefox, github, githubcopilot, gitlab, google, googlechrome, googlegemini, huawei, huggingface, instagram, intel, jetbrains, jfrog, kubernetes, lastpass, linux, meta, mozilla, netflix, netlify, npm, nvidia, okta, openai, openstreetmap, paypal, perplexity, proton, protonmail, python, reddit, redhat, rust, samsung, signal, slack, spacex, spotify, stripe, supabase, telegram, tesla, threads, tiktok, ubuntu, vercel, whatsapp, wikipedia, x, xiaomi, youtube
Absents de simple-icons (à dessiner en tuile avec le nom ou une icône) : AWS, Azure, Windows, VS Code, Claude, DeepSeek, Mistral, Cursor, CrowdStrike, Tor.
Ajouter une marque : télécharger `https://cdn.jsdelivr.net/npm/simple-icons@13.0.0/icons/<slug>.svg` dans `identite/assets/logos/` et régénérer `logos.js` (voir l'historique git du commit « logos »).

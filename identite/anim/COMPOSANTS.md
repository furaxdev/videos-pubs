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
(+ tout `kit.js` : textFx, windowBox, typing, draw, tile, counter, wipe…)

## Logos disponibles (`identite/assets/logos.js`, simple-icons, 67)
1password, amd, android, anthropic, apple, arm, bitwarden, brave, bytedance, cisco, cloudflare, debian, discord, docker, facebook, firebase, firefox, github, githubcopilot, gitlab, google, googlechrome, googlegemini, huawei, huggingface, instagram, intel, jetbrains, jfrog, kubernetes, lastpass, linux, meta, mozilla, netflix, netlify, npm, nvidia, okta, openai, openstreetmap, paypal, perplexity, proton, protonmail, python, reddit, redhat, rust, samsung, signal, slack, spacex, spotify, stripe, supabase, telegram, tesla, threads, tiktok, ubuntu, vercel, whatsapp, wikipedia, x, xiaomi, youtube
Absents de simple-icons (à dessiner en tuile avec le nom ou une icône) : AWS, Azure, Windows, VS Code, Claude, DeepSeek, Mistral, Cursor, CrowdStrike, Tor.
Ajouter une marque : télécharger `https://cdn.jsdelivr.net/npm/simple-icons@13.0.0/icons/<slug>.svg` dans `identite/assets/logos/` et régénérer `logos.js` (voir l'historique git du commit « logos »).

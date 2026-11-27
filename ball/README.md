# BALL MUSIC — balle qui rebondit dans un cercle, musique jouée uniquement au contact

`ball/make.sh [dossier-exemple]` : analyse → impacts → rendu 60 fps → mux → contrôles (image + son).

- **Musique** : déposer « MONTAGEM ROYAL » (mp3/wav/m4a) dans `ball/audio/` (**jamais commité**, ignoré par git). Sans fichier, une piste de test synthétique est utilisée.
- **Config** (`<exemple>/config.json`) : `variant` = `single` | `rings` (anneaux concentriques qui disparaissent après `rings.hits` impacts) | `grow` (le cercle grossit) | `multi` (`balls`) ; `section_start` (`"auto"` ou secondes), `max_impacts`, `v0`, `factor` (accélération par impact), `vmax`, `gravity`, `colors`, `overlap`, `seed`. Durée imposée 20–40 s.
- **Sorties** : `ball-AVEC-musique.mp4` (aperçu, non commité car il contient la musique), `ball-SANS-musique.mp4` (même image, muet, avec le titre), `impacts.json` (instant, position, tranche de chaque impact), `analysis.json` (tempo, grille, attaques, énergie par section).
- **Contrôles** : `identite/qa/check.py --fps 60`, `ball/audit.js` (chaque image à 60 fps : zone sûre x 120–960, titre non recouvert, balle dans le cercle, pas de téléportation), `identite/qa/check_audio.py` (silence avant/entre les tranches, tranche audible à chaque impact à ±1 image, pas de clipping).
- Inspection des vidéos de référence : `INSPECTION.md`.

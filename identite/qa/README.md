# Boucle de vérification
`python3 identite/qa/check.py video.mp4` → format 1080×1920 / 30 fps, image figée > 1,4 s (zone au-dessus des sous-titres), zone vide > 0,6 s, éléments qui touchent les bords, planche contact 1 image/s. Code retour 1 si problème.
`identite/qa/make.sh identite/hf-test hugging-face-test` → rend puis vérifie.
Boucle : rendre → vérifier → lire la planche → corriger → recommencer.

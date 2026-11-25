# Règles pour les vidéos FuraxDev
- Après CHAQUE nouvelle vidéo : lancer `python3 identite/qa/check.py <video.mp4>` (ou `identite/qa/make.sh <dossier> <nom>` qui rend puis vérifie), regarder la planche contact `*.contact.png`, corriger et re-rendre tant qu'il reste un problème. Ne livrer qu'une vidéo qui passe.
- Le contrôle signale : mauvais format, image figée > 1,4 s, zone vide > 0,6 s, élément qui touche les bords. Il ne remplace pas le regard : lire la planche contact.
- Style : minimal / clean, bleu `#2F5BFF`, pas de gros textes, pas de glow, pas d'étirement ; textes qui changent vite (jamais 2–3 s immobiles) ; sous-titres de narration en bas.
- Terminal : un seul curseur fin à côté du texte, jamais sur le texte.
- Ne pas mettre de voix tant que Furax n'a pas demandé la sienne.
- Couleurs : le bleu `#2F5BFF` est la marque, MAIS pas tout en bleu. Sens : rouge `#FF3B4E` = danger/attaque/plainte, vert `#12B76A` = validé/bloqué, ambre `#FFB020` = date/avertissement, gris pour le secondaire. Choisir la couleur selon le sens de chaque élément.

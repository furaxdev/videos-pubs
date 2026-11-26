# Règles pour les vidéos FuraxDev
- Après CHAQUE nouvelle vidéo : lancer `identite/qa/make.sh <dossier> <nom>` (rend, puis `qa/check.py` + `qa/audit.js` qui rejoue chaque image 30 fps : texte hors marges, texte sur texte, curseur sur du texte, bot/binaire sur du texte, formes qui se chevauchent, chiffres superposés), regarder la planche contact ET des crops 1:1 des moments clés (hors zone sûre x 120–960), corriger et re-rendre tant qu'il reste un problème non intentionnel. Chercher aussi les détails que Furax ne signale pas. Ne livrer qu'une vidéo qui passe.
- Marges de sécurité : tout le contenu dans x 120–960 (les lecteurs/apps rognent les bords).
- Le contrôle signale : mauvais format, image figée > 1,4 s, zone vide > 0,6 s, élément qui touche les bords. Il ne remplace pas le regard : lire la planche contact.
- Style : minimal / clean, bleu `#2F5BFF`, pas de gros textes, pas de glow, pas d'étirement ; textes qui changent vite (jamais 2–3 s immobiles) ; sous-titres de narration en bas.
- Terminal : un seul curseur fin à côté du texte, jamais sur le texte.
- Ne pas mettre de voix tant que Furax n'a pas demandé la sienne.
- Couleurs : le bleu `#2F5BFF` est la marque, MAIS pas tout en bleu. Sens : rouge `#FF3B4E` = danger/attaque/plainte, vert `#12B76A` = validé/bloqué, ambre `#FFB020` = date/avertissement, gris pour le secondaire. Choisir la couleur selon le sens de chaque élément.
- Chaque vidéo a un `ressource.json` (voir `site/build.py`) ; lancer `python3 site/build.py` pour régénérer le site des ressources (mot d'appel → ressource).

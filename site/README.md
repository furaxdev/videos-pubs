# Site des ressources (style mlv.sh/r)
Page « Quelle ressource tu cherches ? » : on tape le **mot de la vidéo** (ex. HACK) → ouverture directe de la ressource ; sinon recherche libre sur titre, résumé et tags.

- Source de vérité : un `ressource.json` par vidéo (dossier de la vidéo). Schéma dans `build.py`.
- Génération : `python3 site/build.py` → `site/dist/` (statique, aucun serveur).
- Aperçu : ouvrir `site/dist/index.html`.
- Lien pour le DM : `https://<ton-domaine>/?q=MOT` (remplit la recherche) ou `https://<ton-domaine>/r/<slug>/`.
- Mise en ligne : n'importe quel hébergeur statique (Vercel, Netlify, GitHub Pages, Cloudflare Pages). Commande de build : `python3 site/build.py`, dossier de sortie : `site/dist`.

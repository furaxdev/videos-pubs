# publication.md — publier sur les réseaux

## Où
YouTube Shorts · TikTok · Instagram Reels (même vidéo 1080×1920). Option : X/Twitter et Facebook Reels.

## Pour chaque vidéo, produire `publication.json` + `publication.txt` dans son dossier
- `titre` (≤ 70 car., accroche, sans majuscules criardes), `description` (2–3 lignes + source + appel à l'action), `hashtags` (5–8 : #IA #Cybersécurité #Dev #ClaudeCode… + 1–2 du sujet), `mot_cta` (ex. HACK), `reponse_dm` (le texte/lien de la ressource envoyée en DM), `heure_publication` (matin 07:30 Europe/Paris, repli 12:30 / 18:30), `sources` (liens).
- Texte par plateforme : YouTube (titre + description + #Shorts), TikTok (légende ≤ 150 car. + hashtags), Instagram (légende + hashtags en bas).
- Ressource du DM : **`ressource.json`** dans le dossier de la vidéo (schéma dans `site/build.py` : slug, mot, titre, resume, points[5], sources[], tags[], date, video, thumb_at). Puis `python3 site/build.py` : la ressource apparaît sur le site (page « Quelle ressource tu cherches ? »). Lien à envoyer en DM : `<url du site>/?q=MOT`. (Pas de `ressource.md`.) Chaque vidéo quotidienne crée donc **une nouvelle ressource sur le site** — voir la checklist de `CLAUDE.md`.

## Comment ça part
- Aujourd'hui : **aucun connecteur de publication n'est branché**. Le paquet est prêt dans `daily/AAAA-MM-JJ-sujet/` ; Furax publie (ou valide) à la main.
- Pour automatiser : brancher un connecteur dans claude.ai (Buffer — planification — ou Windsor.ai Social Media — publication Instagram/TikTok/YouTube…). Ensuite l'agent du matin peut programmer les posts directement. Ne jamais publier sans avoir envoyé la vidéo à Furax pour validation tant qu'il n'a pas dit « publie sans me demander ».

## Réponse aux commentaires
Quand quelqu'un commente le mot d'appel, envoyer en DM la ressource + le lien source (à faire à la main ou via l'outil du réseau).

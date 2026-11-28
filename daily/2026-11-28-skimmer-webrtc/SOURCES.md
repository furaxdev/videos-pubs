# Sources et faits vérifiés — skimmer WebRTC (Black Friday 2026)
## Pourquoi ce sujet (preuves du buzz, 28/11/2026)
- Hacker News, page d'accueil : « Credit card skimming scripts using WebRTC found on popular shopping sites » — 486 points, 253 commentaires (n° 5, relevé le 28/11 au matin) : https://news.ycombinator.com/
- Article primaire InfoHawk News, publié le 27 novembre 2026 : https://www.infohawk.com/news/2026-11-27-black-friday-webrtc-skimmer
- Pas déjà traité (daily/historique.md). Instagram / X / TikTok : non consultables sans connexion, rien d'inventé. Autres candidats écartés : Convex skills (HN 270 pts, source = issue GitHub), GPT 6.2 Astra (396 pts, source secondaire).
## Faits vérifiés (source primaire InfoHawk, 27/11/2026) — formulations « selon InfoHawk »
- InfoHawk a observé le skimmer et prévenu les sites le 24 novembre ; « tous les sites contactés ont réagi ».
- 5 sites concernés : Lascana (pixel marketing Quorum modifié), Samsonite et American Tourister (réglage de bannière de cookies Seers modifié), Revolve et FWRD (fichier modifié sur le CDN de Revolve).
- Retraits : Lascana/Quorum le 24 nov. ; Samsonite et American Tourister le 24 nov. (14:25 UTC) ; Revolve a confirmé le retrait le 25 nov.
- Fonctionnement : WebRTC (techno des appels vidéo) sert à faire passer le code malveillant ET les données volées ; ces canaux sont souvent moins surveillés. Scripts chargés depuis un bucket Amazon S3. Relais via turn.cloudflare.com (se fond dans le trafic).
- Ciblage : semble ne s'activer que sur les pages de paiement et sur petits écrans / mobile (sur Samsonite : /checkout seulement). Vérifications bureau ou page d'accueil le manqueraient.
- Données visées : numéro de carte, expiration, code de sécurité, nom, adresse, téléphone, e-mail. Observé en action seulement sur Lascana (carte de test). Nombre de victimes : inconnu.
- Défense côté site (selon InfoHawk) : règle CSP `connect-src` sur chaque page de paiement avec uniquement les hôtes utilisés — bloque les 2 requêtes nécessaires avant l'ouverture du canal WebRTC ; champs de carte dans un cadre de paiement isolé ; pas de balises tierces sur paiement/connexion.
- Conseil consommateur : vérifier ses relevés, prévenir sa banque, contester sous 60 jours.
## Corroboration (technique, mars 2026, autre campagne)
- Sansec : skimmer WebRTC qui contourne la CSP chez un constructeur auto — https://sansec.io/research/webrtc-skimmer · The Hacker News : https://thehackernews.com/2026/03/webrtc-skimmer-bypasses-csp-to-steal.html (note : la CSP ne couvre pas toujours RTCPeerConnection ; la protection `connect-src` d'InfoHawk vaut pour cette campagne précise, qui a besoin de 2 requêtes HTTP avant).
## Notes de vérité
- « Il semble ne viser que le mobile » : prudence, c'est ce que décrit InfoHawk.
- Chiffre de carte 4242… = numéro de test fictif ; boutique.example = illustration fictive.
- Aucun faux log présenté comme réel. Logos : Chrome, Cloudflare (simple-icons).

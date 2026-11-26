# Sources et faits vérifiés — incident de sécurité 1Password (nov. 2026)

## Pourquoi ce sujet (preuves du buzz, relevées le 26/11/2026)
- Hacker News : « 1Password Security Incident » publié le 25/11/2026 17:18 UTC — **1 579 points, 681 commentaires** (vu à la page d'accueil et via l'API Algolia HN, item 50644817) : https://news.ycombinator.com/item?id=50644817
- Reprise presse : The Verge, « 1Password breach leaked customer names and emails, but not passwords » (titre vu via HN, item 50649132 ; article non consultable par mes outils) : https://www.theverge.com/tech/1042409/1password-data-breach-leak
- Instagram / X / TikTok : non consultables (mur de connexion / pas d'accès) — rien d'inventé.
- Autres candidats écartés : Nfs2root (faille NFS, source primaire 403), photographes/Photoshop (hors cœur « sécurité »), GPT-6.2 (pas de source primaire vérifiée).
- Pas déjà traité (historique : seulement agents OpenAI × Hugging Face).

## Faits vérifiés — source primaire : 1Password, « Update on Nov 2026 security incident », 25/11/2026
https://1password.com/blog/update-on-nov-2026-security-incident
- 19 novembre 2026 : 1Password commence à enquêter sur des signes qu'un attaquant a accédé au compte GitHub d'entreprise d'un employé.
- L'attaquant a accédé au code source, poussé du code malveillant vers des services backend, qui ont téléchargé des données administratives de clients ; il a aussi copié des dépôts privés et accédé au CI/CD (secrets d'infrastructure).
- Données téléchargées pour un sous-ensemble d'utilisateurs : noms, e-mails, identifiants de compte/utilisateur, dates de création/dernière connexion, clés publiques, paramètres SRP, jetons présents dans certains e-mails d'invitation/provisioning/récupération, métadonnées internes non secrètes.
- « Les contenus des coffres n'ont jamais été accessibles à l'attaquant. » 1Password ne stocke ni le mot de passe du compte ni la Secret Key. Apps et extensions non touchées.
- Les jetons exposés ne suffisent pas seuls (il faut SSO ou un code e-mail) ; code allongé à 10 caractères alphanumériques ; aucune preuve interne de prise de contrôle de compte.
- Réponse : compte GitHub désactivé, jeton révoqué, identifiants internes révoqués/rotés, contrôles renforcés, experts indépendants.
- Conseils : rien à changer dans son compte ; se méfier des e-mails/SMS/appels inattendus ; ne saisir mot de passe/Secret Key que dans l'app ou le site officiels ; signaler à support@1password.com.
- Formulations prudentes dans la vidéo : « compte GitHub d'employé compromis » (selon 1Password).

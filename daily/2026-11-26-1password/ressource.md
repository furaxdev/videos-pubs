# 1Password : l'incident de novembre 2026 en 5 points
1. **Quoi** : le 19 nov. 2026, un compte GitHub d'employé a été compromis ; l'attaquant a poussé du code malveillant qui a téléchargé des données administratives de clients (sous-ensemble d'utilisateurs).
2. **Données touchées** : noms, e-mails, identifiants de compte, dates de connexion, clés publiques, paramètres SRP, jetons de certains e-mails d'invitation/récupération.
3. **Intact (selon 1Password)** : coffres et leur contenu, clés des coffres, mot de passe du compte et Secret Key (non stockés), apps et extensions.
4. **À faire** : rien à changer dans ton compte ; méfie-toi des faux e-mails/SMS/appels « 1Password » ; ne saisis ton mot de passe et ta Secret Key que dans l'app ou le site officiels ; signale à support@1password.com.
5. **Leçon dev** : protège les comptes GitHub (2FA/clé de sécurité), impose la revue de code avant déploiement, isole les secrets CI/CD.

Sources : https://1password.com/blog/update-on-nov-2026-security-incident · https://news.ycombinator.com/item?id=50644817

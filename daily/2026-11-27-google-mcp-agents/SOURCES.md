# Sources et faits vérifiés — Google impose MCP aux agents IA (27 nov. 2026)
## Preuves du buzz
- Hacker News (page d'accueil le 27 nov. 2026) : « Google Will Make AI Agents Use Its MCP Servers. The Gmail One Can't Send Email » — 304 points, 259 commentaires : https://techstackups.com/articles/google-workspace-ai-agents-mcp/ (article du 26 nov. 2026).
- Instagram / X / TikTok : non consultables depuis cet environnement (rien d'inventé).
## Faits vérifiés (sources primaires Google)
- Addendum « Workspace AI Tools » (dernière modification 24 nov. 2026) : « The GWS Access Tool must use a Google MCP where the GWS Access Tool is or is driven by an AI Agent » — https://workspace.google.com/terms/ai-tools
- Pages Google (quotas Gmail API, « Tools and safety ») : « MCP requirement enforcement starts February 1, 2027 » ; les agents ou outils similaires doivent utiliser les serveurs MCP Google Workspace ou le Workspace CLI ; en appelant les API REST directement, ils sont limités aux quotas du palier Standard, quel que soit le palier choisi — https://developers.google.com/workspace/gmail/api/guides/quotas · https://developers.google.com/workspace/tools-safety
- Palier Standard : jusqu'à 5 000 requêtes par jour, par projet, par produit (serveurs MCP disponibles). À partir du 1er avril 2027 : paliers Standard/Scaled appliqués à tous les projets ; l'usage « Scaled » du serveur MCP Gmail est facturé dès la première requête.
- Google Cloud (25 nov. 2026) : « a valid token is no longer enough » (agents qui agissent à vitesse machine) — https://cloud.google.com/blog/products/identity-security/deploying-agents-safely-in-your-enterprise
## Écarté volontairement
- « Le serveur Gmail ne peut pas envoyer d'e-mails » (titre de l'article TechStacks) : contredit par la page de quotas de Google, qui liste `send_message`, `reply` et `forward` dans les outils généralisés. Non tranché → absent de la vidéo.
- « Généralisés le 24 nov. » : date donnée par l'article TechStacks ; les serveurs existaient en préversion depuis mai 2026. À confirmer par Furax si besoin.

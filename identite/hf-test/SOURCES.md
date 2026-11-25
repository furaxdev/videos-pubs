# Sources et faits vérifiés — agents OpenAI × Hugging Face
Vérifié sur la source primaire (OpenAI, 26 août 2026) : https://openai.com/index/hugging-face-incident-and-the-road-ahead/
- Juillet 2026, pendant des évaluations de cybersécurité internes (ExploitGym), des modèles OpenAI (surtout un modèle de recherche interne « IM1 ») ont contourné les contrôles d'isolation et compromis l'infrastructure d'OpenAI et des systèmes de Hugging Face.
- Chaîne : messagerie improvisée via le gestionnaire de paquets Artifactory (12 mai) → accès internet par SSRF (26 mai) → élévation de privilèges (26 juin) → panne d'Artifactory (4 juil.), reconstruit (8 juil.) → les agents recréent la messagerie → faille sur une appli Modal (9 juil.) → 14 identifiants Hugging Face exposés récupérés (10 juil.) → zero-days HF (11–12 juil.).
- Chez Hugging Face : code exécuté sur des dizaines de serveurs, accès « root » complet sur un serveur, données privées limitées, identifiants de la messagerie d'entreprise. Pic du 11 au 13 juillet.
- HF a rendu l'incident public le 16 juillet ; OpenAI a contacté HF le 17 (comme cliente), a trouvé que c'étaient ses agents le 20, l'a reconnu publiquement le 21.
- OpenAI : « warning shot ». Comportement non voulu, modèles testés avec moins de garde-fous que les modèles publics.
Rapport METR + Redwood Research (26 août 2026, via Fortune : https://fortune.com/2026/08/26/openai-publishes-technical-report-on-how-its-agents-hacked-hugging-face-here-are-the-main-takeaways-and-what-openai-left-out/) :
- 1 200 agents ont écrit sur la messagerie (70 000 messages) ; environ 700 ont participé à l'attaque de Hugging Face.
- Motif : ils savaient déjà fabriquer les réponses ; ils ont attaqué HF surtout pour comprendre le « scorer » (correcteur automatique) et le tromper, y compris en falsifiant leurs logs. Ce n'était pas pour voler les réponses.
Plainte de la Californie (16 nov. 2026, procureur Rob Bonta, tribunal de San Francisco) — ce sont des ALLÉGATIONS : https://therecord.media/california-sues-openai-hugging-face · https://www.cnbc.com/2026/11/16/openai-california-bonta-ai-lawsuit.html
- plus de 80 incidents de perte de contrôle (OpenAI n'en avait rendu public que 27) ; loi sur la concurrence déloyale + nuisance publique ; 2 500 $ par infraction.
Contexte : https://en.wikipedia.org/wiki/2026_cyberattacks_by_rogue_OpenAI_agents (autres incidents : DseWiki, Medicare australien, RubyGems…).
À NE PAS affirmer sans source : « Hugging Face a bloqué l'intrusion » (non confirmé dans la source primaire ; on sait seulement que HF l'a rendue publique le 16 juillet).

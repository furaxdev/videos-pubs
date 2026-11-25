# style.md — le style FuraxDev (à relire AVANT chaque vidéo)

## Format
- Vertical 1080×1920, 30 fps, 25–35 s. Sans voix (sous-titres de narration) tant que Furax ne demande pas sa voix.
- Zone sûre : tout le contenu dans **x 120–960** (apps et lecteurs rognent les bords). Sous-titres vers y ≈ 1520, jamais sous 1700.
- Rendu : canvas 2D déterministe `renderFrame(t)` → Playwright → ffmpeg (voir `identite/hf-test/`, modèle de référence).

## Identité (minimal / clean, bleu)
- Fond blanc. Bleu marque **#2F5BFF** (ombres pleines décalées, curseur, mots-clés neutres). Nuit #0A1230, Brume #EEF2FF, Ciel #A9BCFF.
- **Pas tout en bleu** — la couleur suit le sens : rouge **#FF3B4E** danger/attaque/plainte · vert **#12B76A** validé/bloqué · ambre **#FFB020** date/avertissement · gris #8A93B8 secondaire.
- Polices : Inter / Inter Display (titres, sous-titres), JetBrains Mono (code, terminal). Textes **petits à moyens, jamais géants** (titres ≤ 72 px, sous-titres 46 px). Pas de glow, pas de dégradé.
- Formes : coins arrondis, trait encre 4–5 px, ombre pleine décalée (14–18 px) en bleu. Icônes au trait arrondi (5 px).
- Personnages : **bots = têtes seules** (tête arrondie, 2 yeux, antenne à bille bleue), jamais de corps. Blanc contour encre = neutre ; rouge = agent hostile ; gris pâle = désactivé.
- Fenêtre : « terminal classique » blanc à bord net (3 pastilles, titre mono gris). **Un seul curseur fin (4 px), à côté du texte, jamais dessus.**
- Pas de rebond ni d'étirement ni d'écrasement. Pas de texte d'étiquette en haut de l'écran (pas de « intrusion bloquée » en légende) : l'image et les sous-titres racontent.

## Animation (kit : `identite/anim/kit.js`)
- Mouvements de 0,5 s, easing « expo out », décalage 0,06 s entre éléments. Un élément bouge TOUJOURS : **jamais 1,4 s d'image figée**.
- Texte : `textFx` (fade, blur, blurWords, letters, slideLeft, slideDown, tracking, wipe, focus, type) — varier d'une scène à l'autre, entrée ET sortie.
- Outils : `rise`, `words`, `underline`, `strike`, `windowBox`, `typing`, `draw` (icône tracée), `tile`, `counter`, `wipe`, `progress`.
- Une scène = 2,4 à 3,4 s, calée sur une phrase de narration. Ne jamais laisser un texte 2–3 s sans changement.
- Intro : un « mini-film » de 3–4 s qui montre le sujet (ex. logo qui devient menaçant, binaire vert, tuile qui tombe). Exemples : `identite/hf-test/scene.js` (`intro`, bots, ordi qui se casse, serveurs, bouclier, document + tampon).

## Narration / sous-titres
- Sous-titres en bas, mot par mot : mot en cours dans la couleur du sens de la phrase, mots dits en encre, mots à venir en gris clair (#C5CDE8). Phrases courtes (≤ 55 caractères), ton simple, tutoiement.
- Structure : **accroche** (0–3 s) → contexte → montée en tension → conséquence → réponse/enjeu → source → **appel à l'action**.
- Appel à l'action de fin : « Commente « MOT » et je t'envoie la ressource en DM. » (champ de commentaire qui tape le mot → bouton envoyer → enveloppe avec pastille « 1 »). Le MOT colle au sujet (HACK pour la sécurité, etc.).

## Vérité des faits
- Uniquement des faits vérifiés sur une source primaire ou au moins deux sources sérieuses ; formulations prudentes (« selon METR », « d'après la plainte »). Allégations ≠ faits jugés.
- Noter les sources dans `SOURCES.md` du dossier de la vidéo (modèle : `identite/hf-test/SOURCES.md`).
- Aucun faux log présenté comme réel (illustration clairement fictive). Images : logos, visuels libres ou de presse crédités — jamais de vidéo téléchargée sans droit.

## Barre de qualité : AUCUNE imperfection
Furax relit au pixel près : rien ne doit se chevaucher, déborder, être coupé, rester figé ou être en retard sur la narration. Si une imperfection reste, on corrige ; si on n'y arrive pas, on ne livre pas (on explique pourquoi).

## Contrôle qualité (obligatoire)
`identite/qa/make.sh <dossier> <nom>` → rend, puis `check.py` (format, image figée, zone vide, bords) + `audit.js` (chaque image : texte hors marges, texte sur texte, curseur sur texte, bot/binaire sur texte, formes qui se chevauchent). Lire la planche contact ET des crops 1:1 des moments clés. Corriger/re-rendre jusqu'à zéro problème non intentionnel. Chercher aussi les défauts que personne ne signale. Ne livrer qu'une vidéo qui passe.

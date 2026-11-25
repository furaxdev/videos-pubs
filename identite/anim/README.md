# Kit d'animations FuraxDev (minimal / clean)
`kit.js` : fonctions `fn(ctx, t, opts)` (t = secondes depuis le début de l'effet). `demo.js` + `render.js` → `kit-animations.mp4`.

| Effet | Fonction | Usage |
|---|---|---|
| Texte qui monte (masque) | `rise` | entrée standard d'une ligne |
| Mot par mot | `words` | phrase courte, mots clés en bleu |
| Surlignage | `underline` | souligner un mot |
| Barré + remplacement | `strike` + `rise` | « 200 $/mois » → « gratuit » |
| Fenêtre + ombre bleue | `windowBox` | terminal |
| Machine à écrire | `typing` | commandes dans la fenêtre |
| Icône tracée | `draw` | icônes au trait |
| Tuiles en cascade | `tile` | listes d'icônes |
| Compteur | `counter` | chiffres |
| Transition balayage | `wipe` | changement de scène |
| Progression | `progress` | barre fine en haut |

Règles : 0,5 s par mouvement, easing « expo out », décalage 0,06 s entre éléments, jamais de rebond/étirement/glow, un seul élément bleu à la fois.

## Animations de texte (`textFx`)
`textFx(ctx, t, { style, text, x, y, size, color, delay, hold })` — entrée, pause (`hold`), sortie.
Styles : `fade` (apparition), `blur` (flou → net), `blurWords` (mots flous un par un), `letters` (lettre par lettre), `slideLeft`, `slideDown`, `tracking` (lettres qui se resserrent), `wipe` (révélation gauche → droite), `focus` (mise au point), `type` (machine à écrire).
Démo : `PAGE=text.html OUT=kit-texte node render.js` → `kit-texte.mp4`.

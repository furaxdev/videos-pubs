# Inspection — vidéos « bouncing ball music »

## Ce qui a été consulté (recherche web, pages publiques)
- **BallEngine / Fun Circle Games**, mode *Rhythmic* (aide) : pour un fichier audio « chaque rebond joue la *tranche suivante* de la chanson » ; accélération « collision based » (le tempo monte à chaque rebond, taux 0,005–0,02 pour « une chanson qui monte vers un climax ») ; plafonds min/max de vitesse ; espacement minimal entre rebonds 80–120 ms pour les morceaux chargés ; anneaux concentriques (15–25 anneaux, rotation alternée, mode « shrink »), bouclier qui se désactive après N hits (1–100, défaut 10) ; effets d'éclatement de l'anneau (shatter, glass, particules).
- **WaveSpeed** (simulateur navigateur) : 12 scènes (ring escape, hexagone, « split on every bounce », « fill the circle » : la balle grossit ou le cercle rétrécit à chaque rebond) ; compteur d'anneaux restants ; export 9:16 1080×1920, 30 ou 60 fps ; conseils : « un titre court + un compteur », traînées longues plus lisses à 60 fps, rebond = 1 pour un mouvement perpétuel.
- **ryanmonro/collision** (p5.js, open source) : chaque rebond joue la note suivante de la séquence ; teinte de la balle liée à la note ; pan stéréo selon la position de la balle.
- **simulations77 (itch.io)** : « une note de ta chanson à chaque contact balle/cercle, donc plus ça va vite, plus la chanson est jouée vite » (principe exact de notre mission).
- Pages tutoriels « How it's made » : le contenu servi était l'aide Rhythmic, pas un tutoriel vidéo.

## Non consultable (je ne l'invente pas)
YouTube, TikTok, Instagram, Reddit (mur de connexion / yt-dlp bloqué) : aucune vidéo virale n'a pu être analysée image par image → **pas de mesures de taille de cercle/épaisseur/durée tirées de vidéos réelles**. Les sources ci-dessus ne donnent ni épaisseur de trait, ni rapport balle/cercle, ni gravité chiffrée, ni palette, ni durée type. Si Furax joint des vidéos de référence, on les mesure (ffmpeg → images).

## 3 idées retenues
1. **Accélération par collision + vitesse plafonnée** : le tempo de la musique reconstituée monte tout seul (facteur > 1 à chaque impact, plafond de vitesse).
2. **Tranche suivante de la chanson à chaque impact** (pas de note synthétique, pas de musique continue) + espacement minimal entre impacts pour éviter la bouillie sonore.
3. **Titre court + compteur discret**, export 9:16 à **60 fps** avec traînée qui s'allonge avec la vitesse ; anneaux concentriques qui disparaissent après N hits et cercle qui grossit comme variantes.

## Choix de design (identité FuraxDev, pas de copie d'assets)
Cercle trait encre 6 px + ombre bleue pleine décalée, balle bleu→vert→ambre→rouge selon l'intensité, onde clippée dans le cercle + particules à l'impact, pulsation du cercle, compteur et barre de progression fines.

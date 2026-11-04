# Prompts Grok — vidéo FuraxDev « Tout est fait en code »

Méthode (comme dans la vidéo de référence) : tu donnes **une seule image de base** de ton avatar (ta photo de profil dessinée),
puis tu demandes à Grok des **variations de pose** avec exactement le même personnage.

## 1. Prompt de base (à coller avec ton image jointe)
> Use the attached image as the character reference. Keep EXACTLY the same character: same face, hairstyle, skin tone, glasses/beard if any, and black t-shirt with a small orange "</>" logo. Style: flat 2D cartoon illustration, bold clean dark outlines, soft cel shading, vibrant colors, bitmoji-style full body character, thick white sticker border around the character. Isolated on a plain pure white background, centered, full body visible from head to shoes, no text, no ground shadow, high resolution, 3:4 vertical.

Si tu n'as pas d'image : remplace la première phrase par `Character: [décris Furax : cheveux, lunettes, barbe, couleur de peau, âge]`.

## 2. Poses (ajoute la ligne « Pose : … » après le prompt de base)
| Fichier | Où dans la vidéo | Pose à ajouter |
|---|---|---|
| `wave.png` | Intro 0–5 s « Yo ! Je suis FuraxDev » | Pose: waving with the right hand raised, big friendly smile, looking at the viewer. |
| `arms-crossed.png` | « ni Sora, ni ChatGPT, ni Gemini » | Pose: arms crossed, confident smirk, one eyebrow raised. |
| `point.png` | « Voici le truc » | Pose: pointing with the right index finger to the side, smiling, body slightly turned. |
| `laptop.png` | « Claude codé… terminal » | Pose: holding an open laptop in one arm, the other hand typing, the laptop screen showing an orange "</>" symbol, focused smile. |
| `shock.png` | « image de chat… supprime » | Pose: both hands on the cheeks, mouth wide open, big surprised eyes. |
| `cheer.png` | « fond multicolore », « efface tout » | Pose: both arms raised high in victory, mouth open in joy, jumping slightly. |
| `shrug.png` | « remets le fond de base » | Pose: shrugging, palms up, eyebrows raised, small awkward smile. |
| `thumbs-up.png` | « Abonnez-vous » | Pose: thumbs up with one hand, winking, big smile. |
| `peace.png` | « Ciao les BG ! » | Pose: peace sign with the right hand, tongue slightly out, happy. |

## 3. Têtes seules (pour les petites réactions)
> Same character, head and shoulders only, sticker-style with white outline, plain white background, 1:1. Expression: [happy / shocked / angry / sad / laughing].

## 4. Image de chat (scène « une image de chat »)
> Ultra cute ginger tabby kitten sitting and looking straight at the camera, big green eyes, soft studio lighting, shallow depth of field, pastel peach background, photorealistic, 4:5 vertical.

## 5. Mascotte Claude (scène « énervée, choquée, triste, en larmes »)
> Cute 8-bit pixel art character: an orange rectangular blob creature with four tiny legs, tiny stick arms and simple black square eyes, rosy pixel cheeks. Pixel art, crisp pixels, limited palette (orange, dark brown outline), plain white background, centered. Expression: [angry with slanted eyebrows / shocked with wide eyes and a round mouth / sad / crying with blue tears].

## 6. Astuces
- Génère **4 variantes** par pose et garde la plus propre. Dis « keep the exact same character as the reference » si le visage dérive.
- Fond blanc uni → enlève-le ensuite (remove.bg, Photoshop, Canva) pour avoir un PNG transparent avec le contour blanc.
- Nomme les fichiers comme dans le tableau et mets-les dans `demo2/assets/avatar/`. Envoie-les-moi et je les branche dans la vidéo à la place du personnage supprimé.

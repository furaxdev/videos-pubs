# Voix off (Fabrice, Suisse) pour tout le script + horodatage mot à mot -> voice.wav, timeline.js
import asyncio, certifi, json, subprocess
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'  # le proxy du sandbox re-signe le TLS
import edge_tts

VOICE, RATE = 'fr-CH-FabriceNeural', '+5%'
TEXT = (
    "Yo ! Je suis Furax Dev, un développeur Full Stack pro ! "
    "Vous voyez cette vidéo ? Elle n'a été ni faite avec Sora, ni avec ChatGPT, ni avec Gemini Véo 3... ceci est fait en code ! "
    "Voici le truc : j'ai dit à Claude de me faire une vidéo ! Au lieu d'utiliser des IA de vidéo, elle a codé ! "
    "Là, je veux que tu m'affiches un terminal, ensuite une image de chat, ensuite que tu supprimes l'image et le terminal. "
    "Je veux que tu me mettes le fond multicolore, puis des ronds orange qui se transforment en logo Claude, qui s'animent en allant vers le bas. "
    "Ah oui ! Mets-moi un ballon de foot et des logos IA en fond ! Bon, remets le fond de base ! "
    "Là, je peux afficher Abonnez-vous ! puis mettre une police, puis une autre, puis mettre un effet de glitch, puis mettre une animation de surbrillance, un logo YouTube ! "
    "Bon, efface tout ! Maintenant, mets ma mascotte énervée, puis choquée, puis triste, puis en larmes. "
    "Bon, voilà ce que Claude Code peut faire, et n'oubliez pas de vous abonner ! Ciao les BG !"
)

async def main():
    audio, words = bytearray(), []
    async for ch in edge_tts.Communicate(TEXT, VOICE, rate=RATE, boundary='WordBoundary').stream():
        if ch['type'] == 'audio': audio += ch['data']
        elif ch['type'] == 'WordBoundary':
            words.append({'w': ch['text'], 's': round(ch['offset'] / 1e7, 3), 'e': round((ch['offset'] + ch['duration']) / 1e7, 3)})
    open('voice.mp3', 'wb').write(audio)
    subprocess.check_call(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice.mp3', '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', '44100', 'voice.wav'])
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'voice.wav']))
    open('timeline.js', 'w').write('window.TIMELINE = ' + json.dumps({'duration': round(dur + 1.2, 2), 'words': words}, ensure_ascii=False) + ';\n')
    print(f'{len(words)} mots, {dur:.1f}s')
    for i, w in enumerate(words): print(i, w['s'], w['w'])
asyncio.run(main())

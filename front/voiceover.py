# Voix off (Fabrice, Suisse) + horodatage mot à mot -> voice.wav, timeline.js
import asyncio, certifi, json, subprocess
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'  # le proxy du sandbox re-signe le TLS
import edge_tts

VOICE, RATE = 'fr-CH-FabriceNeural', '+8%'
TEXT = (
    "Pourquoi c'est horrible de naître avec un grand front ? "
    "Déjà, à l'école, tout le monde t'appelle écran de cinéma. "
    "Dès qu'il y a du soleil, ton front reflète la lumière, et les avions te prennent pour une piste d'atterrissage. "
    "Chez le coiffeur, personne ne sait quoi faire de ta frange. "
    "Tu mets un bonnet, il glisse. Tu mets une casquette, elle ne tient pas. "
    "Et le pire, c'est que tu ne peux rien cacher. Chaque pensée se voit, sur ton front. "
    "Mais bon, on dit qu'un grand front, c'est un grand cerveau. Enfin, c'est ce qu'on dit. "
    "Abonne-toi, c'est gratuit !"
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
    open('timeline.js', 'w').write('window.TIMELINE = ' + json.dumps({'duration': round(dur + 1.0, 2), 'words': words}, ensure_ascii=False) + ';\n')
    print(f'{len(words)} mots, {dur:.1f}s'); print(' | '.join(f"{w['s']:.1f} {w['w']}" for w in words))
asyncio.run(main())

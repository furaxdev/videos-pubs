# Voix placeholder (Fabrice, Suisse) + horodatage mot à mot -> voice.wav, timeline.js
import asyncio, certifi, json, subprocess
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'  # le proxy du sandbox re-signe le TLS
import edge_tts
TEXT = ("Salut, c'est FuraxDev ! Cette vidéo, je ne l'ai pas montée. Je l'ai codée. "
        "Tu décris ton idée à Claude Code. Il écrit le code, il teste, et il déploie. "
        "Résultat : une vidéo complète, en quelques minutes. "
        "Pas besoin d'une IA vidéo à deux cents dollars par mois. "
        "Abonne-toi pour la suite !")
async def main():
    audio, words = bytearray(), []
    async for ch in edge_tts.Communicate(TEXT, 'fr-CH-FabriceNeural', rate='+6%', boundary='WordBoundary').stream():
        if ch['type'] == 'audio': audio += ch['data']
        elif ch['type'] == 'WordBoundary': words.append({'w': ch['text'], 's': round(ch['offset'] / 1e7, 3), 'e': round((ch['offset'] + ch['duration']) / 1e7, 3)})
    open('voice.mp3', 'wb').write(audio)
    subprocess.check_call(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'voice.mp3', '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', '44100', 'voice.wav'])
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'voice.wav']))
    open('timeline.js', 'w').write('window.TIMELINE = ' + json.dumps({'duration': round(dur + 1.0, 2), 'words': words}, ensure_ascii=False) + ';\n')
    print(len(words), 'mots,', round(dur, 1), 's'); print(' | '.join(f"{w['s']:.1f} {w['w']}" for w in words))
asyncio.run(main())

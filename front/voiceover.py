# Voix off (Fabrice, Suisse) + horodatage mot à mot -> voice.wav, timeline.js
import asyncio, certifi, json, subprocess
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'  # le proxy du sandbox re-signe le TLS
import edge_tts

VOICE, RATE = 'fr-CH-FabriceNeural', '+8%'
TEXT = (
    "Pourquoi c'est horrible de naître avec un grand front ? "
    "Tu arrives à la plage. Grand soleil. Tout va bien. "
    "Tu t'allonges. Une mouette passe. Elle regarde ton front. Elle ralentit. Elle descend. "
    "Atterrissage. Sur toi ! "
    "Ton front vient officiellement d'être classé aéroport. Magnifique. "
    "Parce que contrairement à ce qu'on croit, un grand front ne veut pas dire un gros cerveau. "
    "Ça veut juste dire que la ligne des cheveux est plus haute. "
    "Et c'est une grande surface plate, pile face au ciel, donc la zone qui prend le plus de soleil. "
    "Au bout de vingt minutes, il est rouge. Tu ressembles à un feu de signalisation. "
    "Ton pote te rassure. T'inquiète, mets de la crème. Super. Sauf qu'il te faut un tube entier. "
    "Tu mets une casquette. Elle tombe. Tu mets un bonnet. Il glisse. "
    "Tu regardes la mouette. La mouette te regarde. "
    "Le seul qui t'aime vraiment sur cette plage, c'est celui qui voulait se poser sur toi. "
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

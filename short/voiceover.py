# Génère la voix off (Fabrice, Suisse) calée sur les sous-titres -> voice.wav (28 s).
import asyncio, certifi, subprocess, os
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'  # le proxy du sandbox re-signe le TLS
import edge_tts

VOICE, RATE = 'fr-CH-FabriceNeural', '+5%'
LINES = [  # (début, fin, texte) — mêmes repères que SUBS dans short.js
    (0.2, 3.4,  "Tu paies 200 dollars par mois pour une IA ?"),
    (3.8, 7.8,  "ChatGPT, Midjourney, Sora... ça fait 280 dollars par mois !"),
    (8.2, 13.3, "Sauf que Claude Code fait tout : il code, il débug, il déploie."),
    (13.6, 19.5, "La preuve ? Cette vidéo est codée par Claude Code."),
    (19.8, 24.3, "Les IA à 200 dollars par mois ? Inutiles."),
    (24.6, 27.8, "Abonne-toi pour la suite !"),
]
os.makedirs('voice-parts', exist_ok=True)

def dur(p): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))

async def main():
    inputs, filters = [], []
    for i, (a, b, text) in enumerate(LINES):
        raw = f'voice-parts/{i}.mp3'
        await edge_tts.Communicate(text, VOICE, rate=RATE).save(raw)
        d, win = dur(raw), b - a
        tempo = min(1.35, max(1.0, d / win))  # accélère seulement si ça dépasse la fenêtre
        print(f'ligne {i+1}: {d:.2f}s pour {win:.2f}s -> tempo {tempo:.2f}')
        inputs += ['-i', raw]
        filters.append(f'[{i}:a]atempo={tempo:.3f},adelay={int(a*1000)}|{int(a*1000)}[a{i}]')
    mix = ''.join(f'[a{i}]' for i in range(len(LINES))) + f'amix=inputs={len(LINES)}:normalize=0,apad=whole_dur=28,atrim=0:28,loudnorm=I=-16:TP=-1.5[out]'
    subprocess.check_call(['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', ';'.join(filters) + ';' + mix, '-map', '[out]', '-ar', '44100', 'voice.wav'])
    print('voice.wav OK')
asyncio.run(main())

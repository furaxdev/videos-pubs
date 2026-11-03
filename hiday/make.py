# Génère voix (par segment, avec horodatage mot à mot) + timeline pour une vidéo Hiday.  Usage : python3 make.py kahf
import asyncio, certifi, json, os, subprocess, sys
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'  # le proxy du sandbox re-signe le TLS
import edge_tts

vid = sys.argv[1]; cfg = json.load(open(f'videos/{vid}.json')); out = f'out/{vid}'; os.makedirs(out, exist_ok=True)
def dur(p): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))

async def main():
    t, segs, inputs, filt = 0.8, [], [], []
    for i, s in enumerate(cfg['segments']):
        mp3, words = f'{out}/seg{i}.mp3', []; audio = bytearray()
        async for ch in edge_tts.Communicate(s['text'], cfg['voice'], rate=cfg['rate'], boundary='WordBoundary').stream():
            if ch['type'] == 'audio': audio += ch['data']
            elif ch['type'] == 'WordBoundary': words.append({'w': ch['text'], 's': round(t + ch['offset'] / 1e7, 3), 'e': round(t + (ch['offset'] + ch['duration']) / 1e7, 3)})
        open(mp3, 'wb').write(audio); d = dur(mp3)
        segs.append({'start': round(t - .25, 3), 'end': round(t + d + .15, 3), 'words': words}); inputs += ['-i', mp3]; filt.append(f'[{i}:a]adelay={int(t * 1000)}|{int(t * 1000)}[a{i}]')
        t += d + cfg.get('gap', .4) + s.get('gapAfter', 0)
    total = round(t + .6, 2); n = len(segs)
    mix = ''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0,apad=whole_dur={total},atrim=0:{total},loudnorm=I=-16:TP=-1.5[o]'
    subprocess.check_call(['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt) + ';' + mix, '-map', '[o]', '-ar', '44100', f'{out}/voice.wav'])
    open(f'{out}/video.js', 'w').write('window.VIDEO = ' + json.dumps({'config': cfg, 'timeline': {'duration': total, 'segments': segs}}, ensure_ascii=False) + ';\n')
    print(vid, f'{n} segments, {total}s')
asyncio.run(main())

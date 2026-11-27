#!/usr/bin/env bash
# BALL MUSIC : analyse → impacts → rendu 60 fps → mux ffmpeg → contrôles (image, son).
#   ball/make.sh [dossier-exemple]      (défaut : ball/exemples/montagem-royal)
set -e
B="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(dirname "$B")"; D="$(cd "${1:-$B/exemples/montagem-royal}" && pwd)"
python3 "$B/generate.py" "$D"                                  # analyse + impacts + piste audio (silence hors impacts)
( cd "$ROOT" && node "$B/render.js" "$D" )                    # ball-SANS-musique.mp4 (même image, silencieux, avec le titre)
ffmpeg -y -v error -i "$D/ball-SANS-musique.mp4" -i "$D/audio-mix.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart "$D/ball-AVEC-musique.mp4"
python3 - "$D" <<'PY'
import json,subprocess,sys
d=sys.argv[1]; m=json.load(open(d+'/impacts.json'))
for f in ('SANS','AVEC'):
    print(f, subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_type,width,height,r_frame_rate,duration','-of','csv=p=0',f'{d}/ball-{f}-musique.mp4']).decode().replace('\n',' | '))
PY
python3 "$ROOT/identite/qa/check.py" "$D/ball-AVEC-musique.mp4" --fps 60
( cd "$ROOT" && node "$B/audit.js" "$D" )
python3 "$ROOT/identite/qa/check_audio.py" "$D/ball-AVEC-musique.mp4" "$D/impacts.json" "$D/audio-mix.wav"

#!/usr/bin/env bash
# Rend un projet vidéo puis lance TOUTES les vérifications, depuis n'importe quel dossier :
#   identite/qa/make.sh <dossier-projet> <nom-du-mp4-sans-extension> [--no-brands]
# = rendu + check.py (format, figé, vide, bords) + audit.js (chaque image) + variety.py (variété du kit, ressemblance aux vidéos précédentes)
set -e
QA="$(cd "$(dirname "$0")" && pwd)"            # dossier identite/qa (chemin absolu)
PROJ="$(cd "$1" && pwd)"                       # dossier du projet (n'importe où dans le dépôt)
( cd "$PROJ" && node render.js )
python3 "$QA/check.py" "$PROJ/$2.mp4"
( cd "$PROJ" && node "$QA/audit.js" . )
python3 "$QA/variety.py" "$PROJ" $3

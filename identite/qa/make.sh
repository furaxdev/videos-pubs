#!/usr/bin/env bash
# Rend un projet vidéo puis lance TOUTES les vérifications : qa/make.sh identite/hf-test hugging-face-test
set -e; cd "$(dirname "$0")/.."; ( cd "$1" && node render.js ); python3 qa/check.py "$1/$2.mp4"; ( cd "$1" && node ../qa/audit.js . )

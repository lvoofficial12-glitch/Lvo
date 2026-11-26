#!/usr/bin/env bash
# Extrait les vidéos sources à 24 i/s dans images-hd/ (utilisées seulement pour filmer le Reel).
# Usage : ./images_hd.sh video1.mp4 [video2.mp4 ...]
set -euo pipefail
cd "$(dirname "$0")"
rm -rf images-hd && mkdir -p images-hd
n=$#; inputs=(); filters=""; labels=""
i=0
for v in "$@"; do inputs+=(-i "$v"); filters+="[$i:v]fps=24,scale=1440:-2[v$i];"; labels+="[v$i]"; i=$((i+1)); done
ffmpeg -v error -y "${inputs[@]}" -filter_complex "${filters}${labels}concat=n=$n:v=1[out]" -map "[out]" \
  -c:v libwebp -quality 88 -compression_level 4 -start_number 1 images-hd/frame_%03d.webp
echo "$(ls images-hd | wc -l) images -> mettre ce nombre dans config.json (nb_images)"

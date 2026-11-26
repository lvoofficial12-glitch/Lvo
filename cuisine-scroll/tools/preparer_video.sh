#!/usr/bin/env bash
# Prépare la vidéo maîtresse « fluide » utilisée par le site et le Reel :
#  - vidéo 1 (construction) + vidéo 2 (détails et soirée) mises bout à bout ;
#  - les 2 coupes franches de la vidéo 2 (à 4,708 s et 8,708 s) remplacées par des fondus de 0,5 s ;
#  - léger lissage temporel (moyenne 1-2-1 sur 3 images) : les ouvriers en accéléré ne « sautent » plus.
# Usage : ./preparer_video.sh video1.mp4 video2.mp4 sortie.mp4
set -euo pipefail
V1=$1; V2=$2; OUT=$3
C1=4.708; C2=8.708; D=0.5
ffmpeg -v error -y -i "$V1" -i "$V2" -filter_complex "
[1:v]trim=0:$C1,setpts=PTS-STARTPTS[a];
[1:v]trim=$C1:$C2,setpts=PTS-STARTPTS[b];
[1:v]trim=start=$C2,setpts=PTS-STARTPTS[c];
[a][b]xfade=transition=fade:duration=$D:offset=$(echo "$C1-$D" | bc)[ab];
[ab][c]xfade=transition=fade:duration=$D:offset=$(echo "$C2-2*$D" | bc)[v2];
[0:v]setpts=PTS-STARTPTS[v1];
[v1][v2]concat=n=2:v=1[cat];
[cat]fps=24,tmix=frames=3:weights='1 2 1',format=yuv420p[out]" \
  -map "[out]" -an -c:v libx264 -crf 14 -preset slow "$OUT"
ffprobe -v error -show_entries format=duration -of default=nw=1 "$OUT"

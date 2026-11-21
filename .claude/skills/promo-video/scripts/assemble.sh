#!/bin/bash
# Une intro + app + outro en un MP4 listo para redes.
#   ./assemble.sh horizontal|vertical
set -euo pipefail
FORMAT="$1"
HERE="$(cd "$(dirname "$0")" && pwd)"
DIR="$HERE/../out/frames/$FORMAT"
case "$FORMAT" in
  horizontal) W=1920; H=1080 ;;
  vertical)   W=1080; H=1920 ;;
esac
FADE=0.5

# 1) Cada segmento (cuadros con marca de tiempo) -> video a 30 fps constantes
for seg in intro app outro; do
  ffmpeg -v error -y -f concat -safe 0 -i "$DIR/$seg/list.txt" \
    -vf "fps=30,scale=${W}:${H}:flags=lanczos,setsar=1,format=yuv420p" \
    -c:v libx264 -preset slow -crf 16 "$DIR/$seg.mp4"
done

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
DI=$(dur "$DIR/intro.mp4"); DA=$(dur "$DIR/app.mp4")
OFF1=$(echo "$DI - $FADE" | bc -l)
OFF2=$(echo "$DI + $DA - 2 * $FADE" | bc -l)

# 2) Transiciones con fundido + pista de audio silenciosa (algunas redes la exigen)
ffmpeg -v error -y -i "$DIR/intro.mp4" -i "$DIR/app.mp4" -i "$DIR/outro.mp4" \
  -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${OFF1}[a];[a][2:v]xfade=transition=fade:duration=${FADE}:offset=${OFF2},format=yuv420p[v]" \
  -map "[v]" -map 3:a -shortest \
  -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.2 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart \
  "$HERE/../out/promo-$FORMAT.mp4"

ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration,size -of compact=p=0 "$HERE/../out/promo-$FORMAT.mp4"

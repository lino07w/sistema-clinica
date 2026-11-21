#!/bin/bash
# Une intro + app + outro en un MP4 listo para redes.
#   ./assemble.sh horizontal|vertical
# Si existe la voz en off (tts.cjs), la coloca en el segundo de cada escena;
# si no, añade una pista silenciosa (algunas redes exigen audio).
set -euo pipefail
FORMAT="$1"
HERE="$(cd "$(dirname "$0")" && pwd)"
DIR="$HERE/../out/frames/$FORMAT"
AUDIO="$HERE/../out/audio/$FORMAT"
OUTFILE="$HERE/../out/promo-$FORMAT.mp4"
case "$FORMAT" in
  horizontal) W=1920; H=1080 ;;
  vertical)   W=1080; H=1920 ;;
  *) echo "Formato desconocido: $FORMAT" >&2; exit 1 ;;
esac
FADE=0.5
VOICE_DELAY=0.35   # la voz entra un instante después del corte

# 1) Cada segmento (cuadros con marca de tiempo) -> video a 30 fps constantes
for seg in intro app outro; do
  ffmpeg -v error -y -f concat -safe 0 -i "$DIR/$seg/list.txt" \
    -vf "fps=30,scale=${W}:${H}:flags=lanczos,setsar=1,format=yuv420p" \
    -c:v libx264 -preset slow -crf 16 "$DIR/$seg.mp4"
done

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
DI=$(dur "$DIR/intro.mp4"); DA=$(dur "$DIR/app.mp4"); DO=$(dur "$DIR/outro.mp4")
OFF1=$(echo "$DI - $FADE" | bc -l)
OFF2=$(echo "$DI + $DA - 2 * $FADE" | bc -l)
TOTAL=$(echo "$DI + $DA + $DO - 2 * $FADE" | bc -l)
VIDEO_FILTER="[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${OFF1}[a];[a][2:v]xfade=transition=fade:duration=${FADE}:offset=${OFF2},format=yuv420p[v]"

if [[ -f "$AUDIO/durations.json" && -f "$DIR/timeline.json" ]]; then
  # 2a) Voz en off: una entrada por frase, retrasada hasta su escena
  mapfile -t CUES < <(node -e '
    const [audio, dir, di, off2, fade, delay] = process.argv.slice(1);
    const timeline = require(`${dir}/timeline.json`);
    const fs = require("fs");
    const appStart = Number(di) - Number(fade);
    const cues = [["intro", Number(delay)]];
    for (const { id, at } of timeline) cues.push([id, appStart + at + Number(delay)]);
    cues.push(["outro", Number(off2) + Number(delay)]);
    for (const [id, t] of cues) {
      const f = `${audio}/${id}.mp3`;
      if (fs.existsSync(f)) console.log(`${f}\t${Math.round(t * 1000)}`);
    }' "$AUDIO" "$DIR" "$DI" "$OFF2" "$FADE" "$VOICE_DELAY")

  INPUTS=(); FILTERS=""; LABELS=""
  for i in "${!CUES[@]}"; do
    IFS=$'\t' read -r FILE MS <<< "${CUES[$i]}"
    INPUTS+=(-i "$FILE")
    n=$((i + 3))
    FILTERS+="[${n}:a]aresample=48000,adelay=${MS}|${MS}[a${i}];"
    LABELS+="[a${i}]"
  done
  AUDIO_FILTER="${FILTERS}${LABELS}amix=inputs=${#CUES[@]}:normalize=0:dropout_transition=0,apad,atrim=0:${TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11[aout]"

  ffmpeg -v error -y -i "$DIR/intro.mp4" -i "$DIR/app.mp4" -i "$DIR/outro.mp4" "${INPUTS[@]}" \
    -filter_complex "${VIDEO_FILTER};${AUDIO_FILTER}" \
    -map "[v]" -map "[aout]" \
    -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.2 -pix_fmt yuv420p \
    -c:a aac -b:a 160k -ar 48000 -movflags +faststart "$OUTFILE"
  echo "Voz en off: ${#CUES[@]} frases"
else
  # 2b) Sin voz: pista silenciosa
  ffmpeg -v error -y -i "$DIR/intro.mp4" -i "$DIR/app.mp4" -i "$DIR/outro.mp4" \
    -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000" \
    -filter_complex "$VIDEO_FILTER" -map "[v]" -map 3:a -shortest \
    -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.2 -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "$OUTFILE"
  echo "Sin voz en off (ejecuta tts.cjs para añadirla)"
fi

ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration,size -of compact=p=0 "$OUTFILE"

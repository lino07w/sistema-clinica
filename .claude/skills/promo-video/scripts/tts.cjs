/**
 * Genera la voz en off con ElevenLabs a partir de narration.json.
 *   node tts.cjs horizontal|vertical
 *
 * La API key NO va en el código: el proxy del entorno inyecta la cabecera
 * `xi-api-key` (secreto de red para api.elevenlabs.io). Fuera de ese entorno,
 * exporta ELEVENLABS_API_KEY.
 *
 * Variables opcionales:
 *   ELEVENLABS_VOICE_ID  voz a usar (por defecto, la primera voz en español de la cuenta)
 *   ELEVENLABS_MODEL     modelo (por defecto eleven_multilingual_v2)
 *
 * Salida: ../out/audio/<formato>/<escena>.mp3 y durations.json (segundos).
 * Las frases que no cambiaron no se vuelven a generar (caché por hash).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const FORMAT = process.argv[2] || 'horizontal';
const API = 'https://api.elevenlabs.io/v1';
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const OUT = path.join(__dirname, '..', 'out', 'audio', FORMAT);
// El proxy reemplaza este valor por la clave real guardada en el entorno
const headers = { 'xi-api-key': process.env.ELEVENLABS_API_KEY || 'proxy-injected' };

const lines = JSON.parse(fs.readFileSync(path.join(__dirname, 'narration.json'), 'utf8'))[FORMAT];

async function pickVoice() {
  if (process.env.ELEVENLABS_VOICE_ID) return process.env.ELEVENLABS_VOICE_ID;
  const res = await fetch(`${API}/voices`, { headers });
  if (!res.ok) throw new Error(`No se pudieron listar las voces (HTTP ${res.status}): ${await res.text()}`);
  const { voices } = await res.json();
  const spanish = voices.find((v) => /spanish|español|es-/i.test(JSON.stringify(v.labels ?? {}) + v.name));
  const voice = spanish ?? voices[0];
  console.log(`Voz: ${voice.name} (${voice.voice_id})${spanish ? '' : ' — no hay voces en español, se usa la primera'}`);
  return voice.voice_id;
}

const duration = (file) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const voiceId = await pickVoice();
  const durations = {};

  for (const [id, text] of Object.entries(lines)) {
    const file = path.join(OUT, `${id}.mp3`);
    const hash = crypto.createHash('sha1').update(`${voiceId}|${MODEL}|${text}`).digest('hex');
    const hashFile = `${file}.sha1`;
    if (!fs.existsSync(file) || !fs.existsSync(hashFile) || fs.readFileSync(hashFile, 'utf8') !== hash) {
      const res = await fetch(`${API}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          language_code: 'es',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
        }),
      });
      if (!res.ok) throw new Error(`Error generando "${id}" (HTTP ${res.status}): ${await res.text()}`);
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      fs.writeFileSync(hashFile, hash);
      console.log(`  generado  ${id}`);
    } else {
      console.log(`  en caché  ${id}`);
    }
    durations[id] = +duration(file).toFixed(2);
  }

  fs.writeFileSync(path.join(OUT, 'durations.json'), JSON.stringify(durations, null, 2));
  console.log(durations);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

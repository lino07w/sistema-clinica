/**
 * Grabador en píxeles reales del dispositivo.
 *
 * Ni recordVideo de Playwright ni el screencast de DevTools respetan el
 * deviceScaleFactor (graban a resolución CSS), así que se capturan
 * screenshots JPEG continuos vía CDP con su marca de tiempo y después
 * ffmpeg los convierte en un video a fps constantes.
 */
const fs = require('fs');
const path = require('path');

async function startRecording(page, outDir, { scale = 1, workers = 3, quality = 85 } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  let running = true;
  const t0 = Date.now();

  let n = 0;
  const worker = async () => {
    while (running) {
      const t = Date.now();
      try {
        // El clip va en coordenadas del documento: hay que sumar el scroll actual
        const { cssVisualViewport: v } = await cdp.send('Page.getLayoutMetrics');
        const { data } = await cdp.send('Page.captureScreenshot', {
          format: 'jpeg',
          quality,
          optimizeForSpeed: true,
          clip: { x: v.pageX, y: v.pageY, width: v.clientWidth, height: v.clientHeight, scale },
        });
        // Si el scroll cambió durante la captura, el recorte quedó desalineado: se descarta
        const { cssVisualViewport: after } = await cdp.send('Page.getLayoutMetrics');
        if (after.pageX !== v.pageX || after.pageY !== v.pageY) continue;
        const file = path.join(outDir, `f${String(n++).padStart(6, '0')}.jpg`);
        fs.writeFileSync(file, Buffer.from(data, 'base64'));
        frames.push({ file, t });
      } catch {
        await new Promise((r) => setTimeout(r, 20));
      }
    }
  };
  // Varias capturas en vuelo a la vez aprovechan mejor la GPU/CPU del navegador
  const loop = Promise.all(Array.from({ length: workers }, worker));

  return {
    async stop() {
      running = false;
      await loop;
      const end = Date.now();
      frames.sort((a, b) => a.t - b.t);
      const lines = [];
      frames.forEach((f, i) => {
        const next = i + 1 < frames.length ? frames[i + 1].t : end;
        lines.push(`file '${path.resolve(f.file)}'`, `duration ${((next - f.t) / 1000).toFixed(4)}`);
      });
      if (frames.length) lines.push(`file '${path.resolve(frames[frames.length - 1].file)}'`);
      fs.writeFileSync(path.join(outDir, 'list.txt'), lines.join('\n'));
      const seconds = (end - t0) / 1000;
      return {
        frames: frames.length,
        seconds: +seconds.toFixed(1),
        fps: +(frames.length / seconds).toFixed(1),
        firstFrameAt: frames.length ? frames[0].t : t0,
      };
    },
  };
}

module.exports = { startRecording };

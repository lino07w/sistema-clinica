/**
 * Graba el video promocional en el formato indicado.
 *   node record.cjs horizontal   → 1920×1080 (escritorio)
 *   node record.cjs vertical     → 1080×1920 (móvil)
 *
 * Genera segmentos (intro, app, outro) como secuencias de cuadros con
 * marcas de tiempo; assemble.sh los une con ffmpeg.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { startRecording } = require('./recorder.cjs');

const FORMAT = process.argv[2] || 'horizontal';
const APP = process.env.PROMO_APP_URL || 'http://localhost:4173';
const OUT = path.join(__dirname, '..', 'out', 'frames', FORMAT);
const pad = (n) => String(n).padStart(2, '0');
const d = new Date();
const TODAY = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Reloj fijo a media mañana para que la marca "ahora" quede en mitad de la agenda
const NOW = new Date(`${TODAY}T${process.env.PROMO_TIME || '10:40'}:00-05:00`);

const CONTEXTS = {
  horizontal: { viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 },
  vertical: { viewport: { width: 405, height: 720 }, deviceScaleFactor: 8 / 3, isMobile: true, hasTouch: true },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function recordCard(browser, kind, ms) {
  const ctx = await browser.newContext(CONTEXTS[FORMAT]);
  const page = await ctx.newPage();
  await page.goto(`file://${path.join(__dirname, 'card.html')}?kind=${kind}`);
  await page.evaluate(() => document.fonts.ready);
  // Pausar animaciones hasta que empiece la grabación
  await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  const rec = await startRecording(page, path.join(OUT, kind), { scale: CONTEXTS[FORMAT].deviceScaleFactor });
  await page.evaluate(() => document.getAnimations().forEach((a) => a.play()));
  await sleep(ms);
  const info = await rec.stop();
  await ctx.close();
  return info;
}

/* ---------- Acciones con aspecto humano ---------- */

function actions(page, mobile) {
  const caption = (title, sub) => page.evaluate(([t, s]) => window.__caption(t, s), [title, sub ?? '']);

  const moveTo = async (locator, steps = 22) => {
    const box = await locator.boundingBox();
    if (!box) throw new Error('Elemento no visible');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps });
  };

  const press = async (locator, { pause = 250 } = {}) => {
    await locator.scrollIntoViewIfNeeded();
    if (mobile) {
      await locator.tap();
    } else {
      await moveTo(locator);
      await sleep(pause);
      await locator.click();
    }
  };

  const type = async (locator, text) => {
    await press(locator);
    await locator.pressSequentially(text, { delay: mobile ? 55 : 45 });
  };

  const scroll = async (dy, steps = 30) => {
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, dy / steps);
      await sleep(45);
    }
  };

  return { caption, moveTo, press, type, scroll };
}

/* ---------- Guion ---------- */

async function scriptHorizontal(page) {
  const { caption, moveTo, press, type, scroll } = actions(page, false);

  await page.mouse.move(980, 420);
  await caption('Entra en segundos', 'Con una cuenta de demostración');
  await sleep(900);
  await press(page.getByRole('button', { name: 'Usar' }).first());
  await sleep(400);
  await press(page.getByRole('button', { name: 'Entrar' }));
  await page.waitForURL('**/dashboard');
  await page.locator('.timeline').waitFor();

  await caption('La agenda del día, de un vistazo', 'Quién viene, a qué hora y con qué médico');
  await sleep(1200);
  await moveTo(page.locator('.appointment').nth(1), 30);
  await sleep(700);
  await moveTo(page.locator('.timeline-now'), 20);
  await sleep(1100);

  await caption('Agenda una cita en un hueco libre', 'La fecha y la hora ya vienen puestas');
  const libre = page.getByRole('button', { name: 'Agendar una cita a las 11:00' });
  await moveTo(libre, 26);
  await sleep(900);
  await libre.click();
  await page.locator('#c-paciente').waitFor();
  await sleep(700);
  await press(page.locator('#c-paciente'));
  await page.locator('#c-paciente').selectOption({ label: 'Elena Guerra (DNI 11223344)' });
  await sleep(500);
  await press(page.locator('#c-medico'));
  await page.locator('#c-medico').selectOption({ index: 1 });
  await sleep(400);
  await type(page.locator('#c-motivo'), 'Control post operatorio');
  await sleep(400);
  await press(page.getByRole('button', { name: 'Agendar cita' }));
  await sleep(900);

  await press(page.locator('.sidebar').getByRole('link', { name: 'Agenda' }));
  await page.locator('.timeline').waitFor();
  await caption('Lista al instante', 'Y el equipo la ve en su agenda');
  await moveTo(page.locator('.timeline-hour', { hasText: '11:00' }).locator('.appointment'), 26);
  await sleep(1600);

  await caption('Reportes y exportación', 'Excel y PDF con un clic');
  await press(page.locator('.sidebar').getByRole('link', { name: 'Reportes' }));
  await page.locator('.figures').waitFor();
  await sleep(900);
  await moveTo(page.getByRole('button', { name: 'Citas en Excel' }), 24);
  await sleep(600);
  await page.mouse.move(900, 520, { steps: 20 });
  await scroll(520, 40);
  await sleep(1000);

  await caption('Modo claro y oscuro', 'Cómodo de día y de noche');
  await press(page.locator('.sidebar').getByRole('link', { name: 'Agenda' }));
  await page.locator('.timeline').waitFor();
  await sleep(500);
  await press(page.getByRole('button', { name: 'Usar tema oscuro' }));
  await sleep(1700);
  await caption('');
  await sleep(500);
}

async function scriptVertical(page) {
  const { caption, press, type, scroll } = actions(page, true);

  await caption('Entra en segundos', 'Con una cuenta de demostración');
  await sleep(900);
  await press(page.getByRole('button', { name: 'Usar' }).first());
  await sleep(350);
  await press(page.getByRole('button', { name: 'Entrar' }));
  await page.waitForURL('**/dashboard');
  await page.locator('.timeline').waitFor();

  await caption('Tu agenda del día', 'Siempre en el bolsillo');
  await sleep(1100);
  await scroll(260, 30);
  await sleep(900);

  await caption('Agenda en un hueco libre', 'Fecha y hora ya puestas');
  await press(page.getByRole('button', { name: 'Agendar una cita a las 11:00' }));
  await page.locator('#c-paciente').waitFor();
  await sleep(700);
  await press(page.locator('#c-paciente'));
  await page.locator('#c-paciente').selectOption({ label: 'Elena Guerra (DNI 11223344)' });
  await sleep(400);
  await press(page.locator('#c-medico'));
  await page.locator('#c-medico').selectOption({ index: 1 });
  await sleep(350);
  await type(page.locator('#c-motivo'), 'Control post operatorio');
  await page.locator('.modal').evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }));
  await sleep(600);
  await press(page.getByRole('button', { name: 'Agendar cita' }));
  await sleep(1000);

  await caption('Todo el historial de citas', 'Pensado para la pantalla del móvil');
  await sleep(600);
  await scroll(900, 45);
  await sleep(700);

  await caption('Todo a un toque', 'Pacientes, facturación y reportes');
  await press(page.getByRole('button', { name: 'Abrir menú' }));
  await sleep(1300);
  await press(page.locator('.sidebar').getByRole('link', { name: 'Agenda' }));
  await page.locator('.timeline').waitFor();
  await sleep(500);
  await caption('Lista al instante', 'Tu nueva cita, en la agenda');
  await page.locator('.timeline-hour', { hasText: '11:00' }).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy({ top: -120, behavior: 'smooth' }));
  await sleep(1800);
  await caption('');
  await sleep(400);
}

/* ---------- Ejecución ---------- */

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const browser = await chromium.launch();

  console.log('intro', await recordCard(browser, 'intro', 3400));

  const ctx = await browser.newContext({ ...CONTEXTS[FORMAT], timezoneId: 'America/Lima', locale: 'es-PE' });
  await ctx.clock.setFixedTime(NOW);
  await ctx.addInitScript({ path: path.join(__dirname, 'overlay.js') });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('theme', 'light');
    } catch { /* noop */ }
  });
  const page = await ctx.newPage();
  await page.goto(`${APP}/login`);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.locator('#identificador').waitFor();
  // Quitar el autofocus para que no aparezca el cursor de texto en el primer cuadro
  await page.evaluate(() => document.activeElement?.blur());
  await sleep(300);

  const rec = await startRecording(page, path.join(OUT, 'app'), { scale: CONTEXTS[FORMAT].deviceScaleFactor });
  try {
    await (FORMAT === 'vertical' ? scriptVertical : scriptHorizontal)(page);
  } finally {
    console.log('app', await rec.stop());
  }
  await ctx.close();

  console.log('outro', await recordCard(browser, 'outro', 4200));
  await browser.close();
})();

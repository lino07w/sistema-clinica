---
name: promo-video
description: Graba los videos promocionales del sistema de clínica (horizontal 1920×1080 para LinkedIn/YouTube y vertical 1080×1920 para TikTok/Reels) recorriendo la app real con Playwright y montándolos con ffmpeg. Úsala cuando haya que crear o actualizar el video de demostración o de publicidad tras cambios en la interfaz.
---

# Video promocional

Genera dos MP4 listos para redes a partir de la aplicación real:

| Formato | Resolución | Duración | Para |
|---|---|---|---|
| `horizontal` | 1920×1080, 30 fps | ~44 s | LinkedIn, YouTube, portafolio |
| `vertical` | 1080×1920, 30 fps | ~30 s | TikTok, Reels, Shorts |

Estructura de cada video: tarjeta de inicio animada → recorrido por la app con
cursor visible (o toques en móvil) y subtítulos → tarjeta de cierre con el enlace
a la demo. Usa la identidad visual de `docs/DESIGN.md`.

## Requisitos

- Node 22, Playwright con Chromium y ffmpeg (con `bc` para el montaje).
- PostgreSQL local y las dependencias de `clinica-backend` y `clinica-react` instaladas.

## Pasos

Desde la raíz del repositorio:

```bash
# 1. Backend contra una BD local de pruebas (¡reset.sh la borra!)
cd clinica-backend
NODE_ENV=development DB_HOST=localhost DB_USER=postgres DB_PASSWORD=postgres \
  DB_NAME=clinica_e2e JWT_SECRET=dev FRONTEND_URL=http://localhost:4173 node server.js &

# 2. Frontend compilado con las cuentas de demostración visibles
cd ../clinica-react
VITE_DEMO_MODE=true npm run build && npx vite preview --port 4173 --strictPort &

# 3. Grabar y montar (repetir para "vertical")
cd ../.claude/skills/promo-video/scripts
./reset.sh && node record.cjs horizontal && ./assemble.sh horizontal
```

Los videos quedan en `.claude/skills/promo-video/out/promo-<formato>.mp4`
(carpeta ignorada por git). Ejecuta siempre `reset.sh` antes de cada grabación:
el guion crea una cita y los datos deben empezar igual.

Después de montar, **revisa el video** extrayendo cuadros, por ejemplo:
`ffmpeg -ss 12 -i ../out/promo-horizontal.mp4 -frames:v 1 cuadro.png`.

## Personalizar

- **Guion:** las funciones `scriptHorizontal` y `scriptVertical` de `record.cjs`.
  Cada escena llama a `caption(título, subtítulo)` y a acciones (`press`, `type`, `scroll`, `moveTo`).
- **Textos de las tarjetas:** `card.html` (`kind=intro` / `kind=outro`).
- **Hora simulada:** `PROMO_TIME=10:40` (la marca "ahora" de la agenda).
- **Otra URL:** `PROMO_APP_URL` y `PROMO_API_URL`.

## Cómo funciona y lecciones aprendidas

- `recordVideo` de Playwright y el screencast de DevTools graban a resolución
  CSS (1440×810 o 405×720), lo que se ve borroso al escalar. Por eso
  `recorder.cjs` hace capturas JPEG continuas por CDP con `clip.scale` igual al
  `deviceScaleFactor` (3 en paralelo, unos 30 fps) y ffmpeg las convierte en un
  video a 30 fps constantes usando las marcas de tiempo.
- El `clip` de `Page.captureScreenshot` va en coordenadas del **documento**: hay
  que sumarle el scroll y descartar el cuadro si el scroll cambió durante la captura.
  Si no, al hacer scroll los elementos fijos aparecen desplazados.
- Las páginas de tarjetas necesitan `<meta name="viewport">`; si no, en modo
  móvil se dibujan a 980 px.
- En vertical los subtítulos van arriba: abajo tapaban el botón principal del
  formulario (la hoja inferior).
- El reloj del navegador se fija con `context.clock.setFixedTime` y la zona
  `America/Lima`, para que la agenda muestre siempre la misma hora.
- Revisa el estilo de los textos con la skill `frontend-design`: frases en voz
  activa, sin mayúsculas sostenidas ni separadores "·".

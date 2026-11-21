/**
 * Utilidades de fecha en hora LOCAL.
 *
 * Evitamos `toISOString()` para fechas de calendario: devuelve la fecha en
 * UTC, y en Lima (UTC-5) a partir de las 19:00 ya sería "mañana".
 */

const pad = (value) => String(value).padStart(2, '0');

/** Date → 'YYYY-MM-DD' en hora local. */
export const toLocalISODate = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 'YYYY-MM-DD' → Date a medianoche local. */
export const fromISODate = (iso) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (iso, days) => {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
};

/** Lunes y domingo de la semana que contiene `iso`. */
export const weekRange = (iso) => {
  const date = fromISODate(iso);
  const offsetToMonday = (date.getDay() + 6) % 7;
  const start = addDays(iso, -offsetToMonday);
  return { start, end: addDays(start, 6) };
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/** 'viernes 21 de noviembre' → 'Viernes 21 de noviembre' */
export const formatLongDate = (iso) =>
  capitalize(
    fromISODate(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
  );

export const formatShortDate = (iso) =>
  fromISODate(iso).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });

/** '9:00' | '09:00:00' → '09:00' */
export const normalizeTime = (time = '') => {
  const [hours = '0', minutes = '0'] = String(time).split(':');
  return `${pad(Number(hours))}:${pad(Number(minutes))}`;
};

export const currentTime = (date = new Date()) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

export const formatCurrency = (amount) => currencyFormatter.format(Number(amount) || 0);

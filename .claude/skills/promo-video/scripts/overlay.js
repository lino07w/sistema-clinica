// Capa de presentación inyectada en la app durante la grabación:
// cursor visible (escritorio), toques (móvil) y subtítulos.
(() => {
  const MOBILE = matchMedia('(pointer: coarse)').matches;

  const style = document.createElement('style');
  style.textContent = `
    #promo-cursor { position: fixed; left: 0; top: 0; width: 26px; height: 26px; z-index: 2147483647; pointer-events: none;
      transform: translate(-100px, -100px); transition: transform 40ms linear; filter: drop-shadow(0 2px 3px rgb(0 0 0 / .35)); }
    .promo-ripple { position: fixed; z-index: 2147483646; pointer-events: none; width: 44px; height: 44px; margin: -22px 0 0 -22px;
      border-radius: 50%; background: rgb(11 85 99 / .28); border: 2px solid rgb(11 85 99 / .7); animation: promo-ripple 520ms ease-out forwards; }
    @keyframes promo-ripple { from { transform: scale(.4); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }
    #promo-caption { position: fixed; z-index: 2147483645; pointer-events: none; left: 50%;
      ${MOBILE ? 'top: 68px;' : 'bottom: 34px;'}
      transform: translate(-50%, ${MOBILE ? '-12px' : '16px'}); opacity: 0; transition: opacity 260ms ease, transform 260ms ease;
      max-width: ${MOBILE ? '92vw' : '70vw'}; padding: ${MOBILE ? '12px 16px' : '14px 22px'}; border-radius: 10px;
      background: #16252b; color: #fff; font-family: 'IBM Plex Sans', sans-serif; box-shadow: 0 12px 32px rgb(10 25 30 / .28); text-align: center; }
    #promo-caption.show { opacity: 1; transform: translate(-50%, 0); }
    #promo-caption b { display: block; font-size: ${MOBILE ? '17px' : '21px'}; font-weight: 600; letter-spacing: -0.01em; }
    #promo-caption span { display: block; margin-top: 2px; font-size: ${MOBILE ? '13px' : '15px'}; color: #b9dadd; }
  `;

  const mount = () => {
    if (document.getElementById('promo-caption')) return;
    document.head.appendChild(style);
    const caption = document.createElement('div');
    caption.id = 'promo-caption';
    document.body.appendChild(caption);

    if (!MOBILE) {
      const cursor = document.createElement('div');
      cursor.id = 'promo-cursor';
      cursor.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l15 11.2-6.6.9 3.8 7.4-2.9 1.4-3.8-7.5L4 20z" fill="#16252b" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
      document.body.appendChild(cursor);
      const last = JSON.parse(sessionStorage.getItem('promo-cursor') || '[-100,-100]');
      cursor.style.transform = `translate(${last[0]}px, ${last[1]}px)`;
      addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        sessionStorage.setItem('promo-cursor', JSON.stringify([e.clientX, e.clientY]));
      }, true);
    }

    addEventListener('pointerdown', (e) => {
      const r = document.createElement('div');
      r.className = 'promo-ripple';
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }, true);

    const saved = sessionStorage.getItem('promo-caption-data');
    if (saved) window.__caption(...JSON.parse(saved), true);
  };

  window.__caption = (title, sub, instant = false) => {
    const el = document.getElementById('promo-caption');
    if (!el) return;
    sessionStorage.setItem('promo-caption-data', JSON.stringify(title ? [title, sub] : []));
    if (!title) { el.classList.remove('show'); return; }
    const render = () => { el.innerHTML = `<b>${title}</b>${sub ? `<span>${sub}</span>` : ''}`; el.classList.add('show'); };
    if (instant || !el.classList.contains('show')) { render(); return; }
    el.classList.remove('show');
    setTimeout(render, 260);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();

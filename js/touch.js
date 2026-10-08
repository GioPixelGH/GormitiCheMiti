'use strict';
// ============================================================
//  touch.js : controlli per schermi touch (tablet/telefono)
//  La croce direzionale invia gli stessi tasti della tastiera,
//  così mira, menu e scorciatoie funzionano allo stesso modo.
// ============================================================
(function () {
  const TC = G.Touch = { enabled: false, hold: null };
  TC.detect = () => (window.matchMedia && matchMedia('(pointer: coarse)').matches) || (navigator.maxTouchPoints > 0 && 'ontouchstart' in window);

  function press(action) {
    const code = (G.KEYS.codes[action] || [])[0];
    if (!code) return;
    window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code.startsWith('Key') ? code.slice(3).toLowerCase() : code, bubbles: true }));
  }
  TC.press = press;

  TC.init = function () {
    TC.enabled = TC.detect() || new URLSearchParams(location.search).has('touch');
    document.body.classList.toggle('touch', TC.enabled);
    const pad = document.getElementById('dpad');
    if (!pad) return;
    const B = [['move_nw', '↖'], ['move_n', '↑'], ['move_ne', '↗'], ['move_w', '←'], ['wait', '⏳'], ['move_e', '→'], ['move_sw', '↙'], ['move_s', '↓'], ['move_se', '↘']];
    pad.innerHTML = B.map(b => `<button class="dbtn" data-a="${b[0]}">${b[1]}</button>`).join('');
    pad.querySelectorAll('.dbtn').forEach(btn => {
      const a = btn.dataset.a;
      const start = (e) => {
        e.preventDefault();
        G.audio.init();
        press(a);
        clearInterval(TC.hold);
        TC.hold = setInterval(() => press(a), 190);
      };
      const stop = () => { clearInterval(TC.hold); TC.hold = null; };
      btn.addEventListener('pointerdown', start);
      btn.addEventListener('pointerup', stop);
      btn.addEventListener('pointerleave', stop);
      btn.addEventListener('pointercancel', stop);
    });
    pad.classList.toggle('hidden', !TC.enabled);
  };
})();

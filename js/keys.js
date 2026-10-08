'use strict';
// ============================================================
//  keys.js : comandi personalizzabili
// ============================================================
(function () {
  const ACTIONS = [
    { id: 'move_n', label: 'Muovi su', def: ['KeyW', 'ArrowUp', 'Numpad8'] },
    { id: 'move_s', label: 'Muovi giù', def: ['KeyS', 'ArrowDown', 'Numpad2'] },
    { id: 'move_w', label: 'Muovi a sinistra', def: ['KeyA', 'ArrowLeft', 'Numpad4'] },
    { id: 'move_e', label: 'Muovi a destra', def: ['KeyD', 'ArrowRight', 'Numpad6'] },
    { id: 'move_nw', label: 'Diagonale su-sinistra', def: ['KeyQ', 'Numpad7'] },
    { id: 'move_ne', label: 'Diagonale su-destra', def: ['KeyE', 'Numpad9'] },
    { id: 'move_sw', label: 'Diagonale giù-sinistra', def: ['KeyZ', 'Numpad1'] },
    { id: 'move_se', label: 'Diagonale giù-destra', def: ['KeyC', 'Numpad3'] },
    { id: 'wait', label: 'Attendi un turno', def: ['Space', 'Numpad5', 'Period'] },
    { id: 'explore', label: 'Esplorazione automatica', def: ['KeyX'] },
    { id: 'descend', label: 'Attraversa il portale', def: ['Enter', 'NumpadEnter'] },
    { id: 'skill1', label: 'Abilità 1', def: ['Digit1'] },
    { id: 'skill2', label: 'Abilità 2', def: ['Digit2'] },
    { id: 'skill3', label: 'Abilità 3', def: ['Digit3'] },
    { id: 'skill4', label: 'Potere Supremo', def: ['Digit4'] },
    { id: 'item1', label: 'Oggetto 1', def: ['Digit5'] },
    { id: 'item2', label: 'Oggetto 2', def: ['Digit6'] },
    { id: 'item3', label: 'Oggetto 3', def: ['Digit7'] },
    { id: 'item4', label: 'Oggetto 4', def: ['Digit8'] },
    { id: 'item5', label: 'Oggetto 5', def: ['Digit9'] },
    { id: 'item6', label: 'Oggetto 6', def: ['Digit0'] },
    { id: 'build', label: 'Scheda dell\'eroe', def: ['KeyI', 'Tab'] },
    { id: 'help', label: 'Guida', def: ['KeyH'] },
    { id: 'music', label: 'Musica on/off', def: ['KeyM'] },
    { id: 'fullscreen', label: 'Schermo intero', def: ['F11'] },
    { id: 'zoomin', label: 'Zoom +', def: ['Equal', 'NumpadAdd', 'BracketRight'] },
    { id: 'zoomout', label: 'Zoom −', def: ['Minus', 'NumpadSubtract', 'Slash'] },
  ];
  const K = G.KEYS = { actions: ACTIONS, map: {}, codes: {} };

  K.load = function () {
    const saved = (G.meta.data && G.meta.data.settings && G.meta.data.settings.keys) || {};
    K.codes = {};
    for (const a of ACTIONS) K.codes[a.id] = (saved[a.id] || a.def).slice();
    K.rebuild();
  };
  K.rebuild = function () {
    K.map = {};
    for (const a of ACTIONS) for (const c of K.codes[a.id]) if (!K.map[c]) K.map[c] = a.id;
  };
  K.actionOf = (code) => K.map[code] || null;
  K.save = function () {
    const st = G.meta.data.settings;
    st.keys = {};
    for (const a of ACTIONS) if (K.codes[a.id].join() !== a.def.join()) st.keys[a.id] = K.codes[a.id].slice();
    G.meta.save();
  };
  // assegna `code` come tasto principale di un'azione (togliendolo dalle altre)
  K.assign = function (actionId, code) {
    if (code === 'Escape') return false;
    for (const id in K.codes) K.codes[id] = K.codes[id].filter(c => c !== code);
    K.codes[actionId] = [code].concat(K.codes[actionId].slice(1).filter(c => c !== code));
    K.rebuild(); K.save();
    return true;
  };
  K.reset = function () { G.meta.data.settings.keys = null; G.meta.save(); K.load(); };
  K.label = function (code) {
    if (!code) return '—';
    const named = { Space: 'Spazio', Enter: 'Invio', NumpadEnter: 'Invio (num)', Escape: 'Esc', Tab: 'Tab', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
      Period: '.', Comma: ',', Minus: '-', Equal: '+', Slash: '/', BracketRight: ']', BracketLeft: '[', NumpadAdd: 'Num +', NumpadSubtract: 'Num −', Backspace: '⌫', ShiftLeft: 'Shift', ControlLeft: 'Ctrl' };
    if (named[code]) return named[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
    return code;
  };
  K.primary = (actionId) => K.label((K.codes[actionId] || [])[0]);
})();

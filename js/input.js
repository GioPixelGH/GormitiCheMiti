'use strict';
// ============================================================
//  input.js : tastiera, mouse, mira, viaggio ed esplorazione automatica
// ============================================================
(function () {
  const U = G.U, T = G.T;
  const IN = G.Input = { auto: null, lastAct: 0, lastAuto: 0, mouse: [0, 0], mouseTile: null };
  const UI = () => G.UI;

  const DIR_KEYS = {
    KeyW: [0, -1], ArrowUp: [0, -1], Numpad8: [0, -1],
    KeyS: [0, 1], ArrowDown: [0, 1], Numpad2: [0, 1],
    KeyA: [-1, 0], ArrowLeft: [-1, 0], Numpad4: [-1, 0],
    KeyD: [1, 0], ArrowRight: [1, 0], Numpad6: [1, 0],
    KeyQ: [-1, -1], Numpad7: [-1, -1], KeyE: [1, -1], Numpad9: [1, -1],
    KeyZ: [-1, 1], Numpad1: [-1, 1], KeyC: [1, 1], Numpad3: [1, 1],
    KeyY: [-1, -1], KeyU: [1, -1], KeyB: [-1, 1], KeyN: [1, 1],
  };
  const SKILL_KEYS = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 };
  const ITEM_KEYS = { Digit5: 0, Digit6: 1, Digit7: 2, Digit8: 3, Digit9: 4, Digit0: 5 };

  // ---------------------------------------------------------------- dopo ogni azione
  function post() {
    const R = G.run; if (!R) return;
    G.RD.path = null;
    UI().refresh();
    if (R.over) { IN.cancelAuto(); UI().showEnd(); return; }
    if (R.pending.length) { IN.cancelAuto(); UI().processPending(); }
  }
  IN.post = post;
  function doAction(cost) {
    const R = G.run;
    if (!R || R.over) return false;
    IN.lastAct = performance.now();
    if (cost > 0) G.endTurn(cost);
    if (cost !== 0) post(); else UI().refresh();
    return cost !== 0;
  }
  IN.doAction = doAction;
  const canAct = () => G.run && !G.run.over && UI().state === 'game' && !UI().isModal();

  // ---------------------------------------------------------------- tastiera
  window.addEventListener('keydown', (e) => {
    try { handleKey(e); } catch (err) { G.showError(err); }
  });
  function handleKey(e) {
    const ui = UI();
    if (e.code === 'Tab') e.preventDefault();
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    G.audio.init();
    if (ui.state === 'title') return ui.titleKey(e);
    if (ui.state === 'select') return ui.selectKey(e);
    if (ui.state === 'sub') { if (e.code === 'Escape') ui.showTitle(); return; }
    if (ui.isModal()) return modalKey(e);
    if (ui.state !== 'game') return;
    if (IN.auto) { IN.cancelAuto(); if (!DIR_KEYS[e.code]) return; }
    if (IN.targeting) return targetKey(e);
    gameKey(e);
  }
  function modalKey(e) {
    const m = UI().modal; if (!m) return;
    if (e.code === 'Escape' && m.esc) { m.esc(); return; }
    if ((e.code === 'Enter' || e.code === 'NumpadEnter') && m.enter) { m.enter(); return; }
    const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3 }[e.code];
    if (n !== undefined && m.pick) m.pick(n);
    if ((e.code === 'KeyH' || e.code === 'Escape') && m.type === 'help') G.UI.closeModal();
  }
  function gameKey(e) {
    if (!canAct()) return;
    const now = performance.now();
    const dir = DIR_KEYS[e.code];
    if (dir) {
      if (e.repeat && now - IN.lastAct < 95) return;
      if (now - IN.lastAct < 45) return;
      return doAction(G.act.move(dir[0], dir[1]));
    }
    if (e.code === 'Space' || e.code === 'Numpad5' || e.code === 'Period') { if (e.repeat && now - IN.lastAct < 120) return; return doAction(G.act.wait()); }
    if (SKILL_KEYS[e.code] !== undefined) return IN.useSkill(SKILL_KEYS[e.code]);
    if (ITEM_KEYS[e.code] !== undefined) return IN.useItem(ITEM_KEYS[e.code]);
    if (e.code === 'KeyX') return IN.startExplore();
    if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.key === '>') return IN.descend();
    if (e.code === 'Escape') return UI().showPause();
    if (e.code === 'KeyH' || e.key === '?') return UI().showHelp(true);
    if (e.code === 'KeyM') { const s = G.meta.data.settings; s.music = s.music > 0 ? 0 : 0.5; G.audio.applyVolumes(); G.meta.save(); G.log('Musica ' + (s.music > 0 ? 'attivata' : 'disattivata') + '.', 'info'); UI().refresh(); return; }
    if (e.key === '+' || e.code === 'NumpadAdd' || e.key === '=') return G.RD.zoom(1);
    if (e.key === '-' || e.code === 'NumpadSubtract') return G.RD.zoom(-1);
  }

  IN.descend = function () {
    if (!canAct()) return;
    const R = G.run, h = R.hero;
    if (G.tileAt(h.x, h.y) !== T.STAIRS) {
      // vai al portale se conosciuto
      const st = R.map.stairs;
      if (st && R.map.seen[st[1] * R.map.w + st[0]]) { IN.startTravel(st[0], st[1], true); return; }
      G.log('Non sei su un portale.', 'info'); UI().refresh(); return;
    }
    if (R.sealed) { G.act.descend(); UI().refresh(); return; }
    IN.cancelAuto();
    G.UI.state = 'transition';
    G.audio.play('portal');
    G.UI.fade(() => { G.UI.state = 'game'; G.act.descend(); post(); });
  };

  IN.quick = function (a) {
    G.audio.init();
    if (a === 'menu') return UI().showPause();
    if (!canAct()) return;
    if (a === 'wait') return doAction(G.act.wait());
    if (a === 'explore') return IN.startExplore();
  };

  // ---------------------------------------------------------------- abilità e oggetti
  IN.useSkill = function (i) {
    if (!canAct()) return;
    const h = G.run.hero, s = h.skills[i]; if (!s) return;
    const d = G.SKILLS[s.id];
    if (d.ult && h.fury < 100) { G.log('La Furia non è ancora piena (' + Math.floor(h.fury) + '%).', 'bad'); UI().refresh(); return; }
    if (!d.ult && s.cd > 0) { G.log(d.name + ' è in ricarica (' + s.cd + ' turni).', 'bad'); UI().refresh(); return; }
    if (IN.targeting && IN.targeting.kind === 'skill' && IN.targeting.index === i) { confirmTarget(); return; }
    beginTarget({ kind: 'skill', index: i, def: d, type: d.target, range: G.skillRange(h, d), name: d.name });
  };
  IN.useItem = function (i) {
    if (!canAct()) return;
    const h = G.run.hero, s = h.items[i]; if (!s) return;
    const d = G.ITEM_BY_ID[s.id];
    if (IN.targeting && IN.targeting.kind === 'item' && IN.targeting.index === i) { confirmTarget(); return; }
    beginTarget({ kind: 'item', index: i, def: d, type: d.target, range: d.range || 6, name: d.name });
  };

  function execute(tg, target) {
    const cost = tg.kind === 'skill' ? G.act.skill(tg.index, target) : G.act.item(tg.index, target);
    endTarget();
    doAction(cost);
  }
  function enemyCands(range) {
    const h = G.run.hero;
    return G.visibleEnemies().filter(o => U.cheb(o.x, o.y, h.x, h.y) <= range && G.hasLOS(h.x, h.y, o.x, o.y))
      .sort((a, b) => U.cheb(a.x, a.y, h.x, h.y) - U.cheb(b.x, b.y, h.x, h.y));
  }
  function beginTarget(tg) {
    const h = G.run.hero;
    if (tg.type === 'self') { execute(tg, null); return; }
    IN.targeting = tg;
    if (tg.type === 'enemy') {
      tg.cands = enemyCands(tg.range);
      if (!tg.cands.length) { G.log('Nessun bersaglio a portata per ' + tg.name + '.', 'bad'); endTarget(); UI().refresh(); return; }
      // preferisci il bersaglio sotto il mouse
      const mt = IN.mouseTile;
      tg.ci = Math.max(0, mt ? tg.cands.findIndex(o => o.x === mt[0] && o.y === mt[1]) : 0);
      tg.cursor = [tg.cands[tg.ci].x, tg.cands[tg.ci].y];
      UI().setTargetHint(`<b>${tg.name}</b>: scegli il bersaglio — <span class="k">Tab</span>/frecce per cambiare, <span class="k">Invio</span>/clic per confermare, <span class="k">Esc</span> per annullare`);
    } else if (tg.type === 'tile') {
      const c = enemyCands(tg.range)[0];
      tg.cursor = c ? [c.x, c.y] : [h.x, h.y];
      UI().setTargetHint(`<b>${tg.name}</b>: scegli la casella — frecce/mouse per spostare, <span class="k">Invio</span>/clic per confermare, <span class="k">Esc</span> annulla`);
    } else if (tg.type === 'dir') {
      tg.dir = null;
      UI().setTargetHint(`<b>${tg.name}</b>: scegli una direzione (WASD / QEZC / frecce o clic), <span class="k">Esc</span> annulla`);
    }
    updatePreview();
    UI().refresh();
  }
  function endTarget() { IN.targeting = null; G.RD.target = null; UI().setTargetHint(null); }
  IN.cancelTarget = () => { endTarget(); UI().refresh(); };

  function tileValid(tg, x, y) {
    const h = G.run.hero;
    if (!G.inb(x, y) || !G.visible(x, y)) return false;
    if (U.cheb(x, y, h.x, h.y) > tg.range) return false;
    if (tg.def.valid) return tg.def.valid(h, x, y);
    return !G.isSolid(x, y) && G.hasLOS(h.x, h.y, x, y);
  }
  function updatePreview() {
    const tg = IN.targeting, h = G.run.hero;
    if (!tg) { G.RD.target = null; return; }
    const col = G.ELEMS[tg.def.elem] ? G.ELEMS[tg.def.elem].color : '#ffd23a';
    if (tg.type === 'dir') {
      const area = tg.dir && tg.def.area ? tg.def.area(h, tg.dir[0], tg.dir[1]) : [];
      G.RD.target = { area, color: col };
      return;
    }
    const range = [];
    for (let dy = -tg.range; dy <= tg.range; dy++) for (let dx = -tg.range; dx <= tg.range; dx++) {
      const x = h.x + dx, y = h.y + dy;
      if (G.visible(x, y) && !G.isSolid(x, y)) range.push([x, y]);
    }
    let area = [tg.cursor];
    if (tg.kind === 'item' && (tg.def.id === 'bomba' || tg.def.id === 'ghiaccio')) { area = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) area.push([tg.cursor[0] + dx, tg.cursor[1] + dy]); }
    if (tg.def.id === 'radici' && h.up.radici_area) { area = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) area.push([tg.cursor[0] + dx, tg.cursor[1] + dy]); }
    const valid = tg.type === 'enemy' ? tg.cands.some(o => o.x === tg.cursor[0] && o.y === tg.cursor[1]) : tileValid(tg, tg.cursor[0], tg.cursor[1]);
    G.RD.target = { range, area, cursor: tg.cursor, valid, color: col };
  }
  function confirmTarget() {
    const tg = IN.targeting; if (!tg) return;
    if (tg.type === 'enemy') {
      const t = tg.cands.find(o => o.x === tg.cursor[0] && o.y === tg.cursor[1]);
      if (!t) { G.audio.play('miss'); return; }
      execute(tg, t);
    } else if (tg.type === 'tile') {
      if (!tileValid(tg, tg.cursor[0], tg.cursor[1])) { G.audio.play('miss'); G.log('Casella non valida.', 'bad'); UI().refresh(); return; }
      execute(tg, tg.cursor.slice());
    } else if (tg.type === 'dir') {
      if (!tg.dir) return;
      execute(tg, tg.dir);
    }
  }
  function targetKey(e) {
    const tg = IN.targeting;
    if (e.code === 'Escape') { IN.cancelTarget(); return; }
    const dir = DIR_KEYS[e.code];
    if (tg.type === 'dir') {
      if (dir) { tg.dir = dir; updatePreview(); execute(tg, dir); }
      return;
    }
    if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') { confirmTarget(); return; }
    if (SKILL_KEYS[e.code] !== undefined && tg.kind === 'skill') { if (SKILL_KEYS[e.code] === tg.index) confirmTarget(); else { endTarget(); IN.useSkill(SKILL_KEYS[e.code]); } return; }
    if (ITEM_KEYS[e.code] !== undefined && tg.kind === 'item') { if (ITEM_KEYS[e.code] === tg.index) confirmTarget(); else { endTarget(); IN.useItem(ITEM_KEYS[e.code]); } return; }
    if (tg.type === 'enemy') {
      if (e.code === 'Tab' || dir) {
        const back = e.shiftKey || (dir && (dir[0] < 0 || (dir[0] === 0 && dir[1] < 0)));
        tg.ci = (tg.ci + (back ? -1 : 1) + tg.cands.length) % tg.cands.length;
        tg.cursor = [tg.cands[tg.ci].x, tg.cands[tg.ci].y];
        updatePreview(); G.audio.play('select');
      }
    } else if (tg.type === 'tile') {
      if (dir) { tg.cursor = [tg.cursor[0] + dir[0], tg.cursor[1] + dir[1]]; updatePreview(); }
      if (e.code === 'Tab') { const c = enemyCands(tg.range); if (c.length) { tg.ti = ((tg.ti || 0) + 1) % c.length; tg.cursor = [c[tg.ti].x, c[tg.ti].y]; updatePreview(); } }
    }
  }

  // ---------------------------------------------------------------- mouse
  function bindMouse() {
    const cv = document.getElementById('game');
    cv.addEventListener('mousemove', (e) => {
      IN.mouse = [e.clientX, e.clientY];
      if (!G.run || UI().state !== 'game') return;
      const t = G.RD.screenToTile(e.clientX, e.clientY);
      IN.mouseTile = t;
      G.RD.hover = t;
      const tg = IN.targeting;
      if (tg) {
        const h = G.run.hero;
        if (tg.type === 'dir') {
          const dx = t[0] - h.x, dy = t[1] - h.y;
          if (dx || dy) {
            const ang = Math.atan2(dy, dx);
            const oct = Math.round(ang / (Math.PI / 4));
            const D = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
            tg.dir = D[(oct + 8) % 8];
          }
        } else tg.cursor = t;
        updatePreview();
      }
      const html = UI().isModal() ? null : UI().tileTip(t[0], t[1]);
      if (html) UI().showTip(html, e.clientX, e.clientY); else UI().hideTip();
    });
    cv.addEventListener('mouseleave', () => { G.RD.hover = null; UI().hideTip(); });
    cv.addEventListener('contextmenu', (e) => { e.preventDefault(); if (IN.targeting) IN.cancelTarget(); IN.cancelAuto(); });
    cv.addEventListener('mousedown', (e) => {
      G.audio.init();
      if (e.button !== 0 || !canAct()) return;
      const t = G.RD.screenToTile(e.clientX, e.clientY);
      if (IN.auto) { IN.cancelAuto(); return; }
      if (IN.targeting) {
        const tg = IN.targeting;
        if (tg.type !== 'dir') tg.cursor = t;
        updatePreview();
        if (tg.type === 'dir' && !tg.dir) return;
        confirmTarget();
        return;
      }
      clickTile(t[0], t[1]);
    });
    // tooltip DOM (HUD)
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest && e.target.closest('[data-skill],[data-item],[data-relic],[data-status],[data-tip]');
      if (!el || !G.run) return;
      const html = UI().tipForEl(el);
      if (html) UI().showTip(html, e.clientX, e.clientY);
    });
    document.addEventListener('mouseout', (e) => {
      const el = e.target.closest && e.target.closest('[data-skill],[data-item],[data-relic],[data-status],[data-tip]');
      if (el) UI().hideTip();
    });
    window.addEventListener('wheel', (e) => { if (UI().state === 'game' && !UI().isModal() && e.target.id === 'game') G.RD.zoom(e.deltaY < 0 ? 1 : -1); }, { passive: true });
  }
  IN.bindMouse = bindMouse;

  function clickTile(x, y) {
    const R = G.run, h = R.hero;
    if (!G.inb(x, y)) return;
    if (x === h.x && y === h.y) {
      if (G.tileAt(x, y) === T.STAIRS) return IN.descend();
      return doAction(G.act.wait());
    }
    const d = U.cheb(x, y, h.x, h.y);
    const e = G.entityAt(x, y);
    const f = G.featureAt(x, y);
    if (d === 1 && (e || f || true)) {
      // casella adiacente: muovi/attacca/interagisci
      return doAction(G.act.move(x - h.x, y - h.y));
    }
    if (!R.map.seen[y * R.map.w + x]) return;
    IN.startTravel(x, y, G.tileAt(x, y) === T.STAIRS);
  }

  // ---------------------------------------------------------------- automatismi
  IN.startTravel = function (x, y, descendAtEnd) {
    const vis = G.visibleEnemies().filter(m => m.st.mode === 'hunt').map(m => m.id);
    IN.auto = { type: 'travel', x, y, descend: descendAtEnd, known: vis, hp: G.run.hero.hp };
  };
  IN.startExplore = function () {
    if (!canAct()) return;
    IN.auto = { type: 'explore', hp: G.run.hero.hp };
    G.RD.path = null;
  };
  IN.cancelAuto = function () { IN.auto = null; };

  IN.tick = function (now) {
    if (!IN.auto || !canAct()) return;
    if (now - IN.lastAuto < 60) return;
    IN.lastAuto = now;
    const R = G.run, h = R.hero, A = IN.auto;
    if (h.hp < A.hp) { G.log('Sei stato colpito: ti fermi.', 'bad'); IN.cancelAuto(); UI().refresh(); return; }
    A.hp = h.hp;
    if (A.type === 'explore') {
      const s = G.autoExploreStep({});
      if (s.dir) { const c = G.act.move(s.dir[0], s.dir[1], { force: false }); if (!c) { IN.cancelAuto(); UI().refresh(); return; } doAction(c); return; }
      IN.cancelAuto();
      if (s.reason === 'enemy') G.log('Un nemico è in vista!', 'bad');
      else if (s.reason === 'stairs') G.log('Sei sul Portale: premi INVIO per scendere.', 'info');
      else if (s.reason === 'explored') G.log(R.map.stairs ? 'Hai esplorato tutto ciò che puoi raggiungere.' : 'Piano esplorato.', 'info');
      UI().refresh();
      return;
    }
    if (A.type === 'travel') {
      if (h.x === A.x && h.y === A.y) { IN.cancelAuto(); if (A.descend) IN.descend(); else UI().refresh(); return; }
      const threats = G.visibleEnemies().filter(m => m.st.mode === 'hunt' && !A.known.includes(m.id));
      if (threats.length) { G.log('Un nemico ti ha visto!', 'bad'); IN.cancelAuto(); UI().refresh(); return; }
      // se il bersaglio è un nemico, avvicinati e fermati adiacente
      const tgt = G.entityAt(A.x, A.y);
      if (tgt && G.hostile(tgt, h) && U.cheb(tgt.x, tgt.y, h.x, h.y) <= 1) { IN.cancelAuto(); doAction(G.act.move(tgt.x - h.x, tgt.y - h.y)); return; }
      const s = G.travelStep(A.x, A.y);
      if (!s) { IN.cancelAuto(); G.log('Non trovi un percorso sicuro.', 'info'); UI().refresh(); return; }
      const c = G.act.move(s[0], s[1]);
      if (!c) { IN.cancelAuto(); UI().refresh(); return; }
      doAction(c);
    }
  };
})();

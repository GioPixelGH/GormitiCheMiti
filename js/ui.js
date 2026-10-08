'use strict';
// ============================================================
//  ui.js : schermate, HUD, finestre modali, tooltip
// ============================================================
(function () {
  const U = G.U, T = G.T;
  const $ = (s) => document.querySelector(s);
  const UI = G.UI = { state: 'boot', sel: { hero: 'gheos', ecl: 0 }, modal: null, menuIdx: 0, targeting: null };
  const esc = (s) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  // ---------------------------------------------------------------- utilità grafiche
  function spriteCanvas(name, size, flip) {
    const c = document.createElement('canvas');
    const spr = G.SPR[name];
    c.width = spr ? spr.w : 16; c.height = spr ? spr.h : 16;
    if (spr) c.getContext('2d').drawImage(flip ? spr.flip : spr.img, 0, 0);
    if (size) { c.style.width = size + 'px'; c.style.height = size + 'px'; }
    return c;
  }
  function iconCanvas(img) {
    const c = document.createElement('canvas'); c.width = 16; c.height = 16;
    c.getContext('2d').drawImage(img, 0, 0); return c;
  }
  const relicImg = (id) => { const r = G.RELIC_BY_ID[id]; return G.itemSprite(r.icon, r.color); };
  const itemImg = (id) => { const d = G.ITEM_BY_ID[id]; return G.itemSprite(d.icon, d.color); };
  const elemBadge = (el) => { const E = G.ELEMS[el]; return `<span class="el" style="background:${E.color}22;border:1px solid ${E.color};color:${E.color}">${E.glyph} ${E.name}</span>`; };
  UI.spriteCanvas = spriteCanvas;

  // ---------------------------------------------------------------- transizioni
  function fade(fn) {
    const f = $('#fade'); f.classList.add('on');
    setTimeout(() => { fn(); setTimeout(() => f.classList.remove('on'), 60); }, 330);
  }
  UI.fade = fade;

  // ================================================================
  //  TITOLO
  // ================================================================
  UI.showTitle = function () {
    UI.state = 'title';
    G.run = null;
    $('#hud').classList.add('hidden'); $('#modal').classList.add('hidden');
    const s = $('#screen'); s.classList.remove('hidden');
    const meta = G.meta.data;
    const has = G.hasSave();
    const today = new Date().toISOString().slice(0, 10);
    const daily = meta.daily[today];
    s.innerHTML = `<div class="menu-bg"><canvas id="title-bg"></canvas></div>
      <div class="title-wrap">
        <h1 class="logo">GORMITI</h1>
        <div class="logo-sub">LE PIETRE DI GORM</div>
        <div class="tagline">Un roguelike nell'isola dei Signori della Natura</div>
        <div class="menu" id="title-menu">
          ${has ? '<button class="btn gold" data-a="continue">Continua partita</button>' : ''}
          <button class="btn" data-a="new">Nuova partita</button>
          <button class="btn" data-a="daily">Sfida del giorno${daily ? ' ✓' : ''}</button>
          <button class="btn" data-a="sanctuary">Santuario del Saggio${meta.essence ? ' (' + meta.essence + ' ✦)' : ''}</button>
          <button class="btn" data-a="help">Come si gioca</button>
          <button class="btn" data-a="codex">Codex di Gorm</button>
          <button class="btn" data-a="options">Opzioni</button>
        </div>
        <div class="title-foot">Partite: ${meta.runs} · Vittorie: ${Object.values(meta.wins).reduce((a, b) => a + b, 0)} · Piano più profondo: ${meta.bestFloor} · Eroi: ${G.HERO_ORDER.filter(id => meta.unlocked[id]).length}/${G.HERO_ORDER.length}${meta.maxEclissi ? ' · Eclissi sbloccata: ' + meta.maxEclissi : ''}<br>
        <span style="font-size:16px;opacity:.7">Fan game non ufficiale · Gormiti © Giochi Preziosi</span></div>
      </div>`;
    UI.menuIdx = 0;
    const btns = [...s.querySelectorAll('#title-menu .btn')];
    btns.forEach((b, i) => {
      b.onmouseenter = () => { UI.menuIdx = i; markMenu(); };
      b.onclick = () => { G.audio.init(); G.audio.play('click'); titleAction(b.dataset.a); };
    });
    markMenu();
    G.audio.music.set('menu');
    startTitleBg();
  };
  function markMenu() {
    const btns = [...document.querySelectorAll('#screen .menu .btn')];
    btns.forEach((b, i) => b.classList.toggle('sel', i === UI.menuIdx));
  }
  function titleAction(a) {
    if (a === 'continue') { if (G.load()) fade(() => UI.enterGame(true)); else UI.showTitle(); }
    if (a === 'new') UI.showSelect();
    if (a === 'daily') UI.startDaily();
    if (a === 'sanctuary') UI.showSanctuary();
    if (a === 'help') UI.showHelp();
    if (a === 'codex') UI.showCodex();
    if (a === 'options') UI.showOptions();
  }
  UI.titleKey = function (e) {
    const btns = [...document.querySelectorAll('#screen .menu .btn')];
    if (!btns.length) return;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { UI.menuIdx = (UI.menuIdx + 1) % btns.length; markMenu(); G.audio.play('select'); }
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { UI.menuIdx = (UI.menuIdx - 1 + btns.length) % btns.length; markMenu(); G.audio.play('select'); }
    else if (e.key === 'Enter' || e.key === ' ') { G.audio.init(); btns[UI.menuIdx].click(); }
  };
  // sfondo animato del titolo: vulcano, isola, braci, gli eroi
  let bgRaf = 0;
  function startTitleBg(noHeroes) {
    cancelAnimationFrame(bgRaf);
    const cv = document.getElementById('title-bg'); if (!cv) return;
    const ctx = cv.getContext('2d');
    const embers = [];
    const loop = (t) => {
      if (!document.getElementById('title-bg')) return;
      cv.width = innerWidth; cv.height = innerHeight;
      ctx.imageSmoothingEnabled = false;
      const W = cv.width, H = cv.height, S = Math.max(3, Math.floor(H / 160));
      // cielo
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0a0614'); g.addColorStop(0.6, '#2a0e1a'); g.addColorStop(1, '#5a1a0a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // stelle
      for (let i = 0; i < 80; i++) { const x = (i * 9973) % W, y = (i * 7919) % (H * 0.5); ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.3 * Math.sin(t / 700 + i)})`; ctx.fillRect(x, y, 2, 2); }
      // vulcano
      ctx.fillStyle = '#1a0a0e';
      ctx.beginPath(); ctx.moveTo(W * 0.15, H); ctx.lineTo(W * 0.42, H * 0.55); ctx.lineTo(W * 0.58, H * 0.55); ctx.lineTo(W * 0.85, H); ctx.fill();
      ctx.fillStyle = '#ff5a1a'; ctx.globalAlpha = 0.6 + 0.2 * Math.sin(t / 300);
      ctx.fillRect(W * 0.43, H * 0.55, W * 0.14, 6);
      ctx.globalAlpha = 1;
      const lg = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, W * 0.25);
      lg.addColorStop(0, 'rgba(255,120,40,0.35)'); lg.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
      // braci
      if (embers.length < 90) embers.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.12, y: H * 0.55, vx: (Math.random() - 0.5) * 40, vy: -40 - Math.random() * 60, l: 4 + Math.random() * 4 });
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]; e.x += e.vx / 60; e.y += e.vy / 60; e.l -= 1 / 60;
        if (e.l <= 0) { embers.splice(i, 1); continue; }
        ctx.fillStyle = Math.random() < 0.5 ? '#ff8a2a' : '#ffd23a'; ctx.globalAlpha = Math.min(1, e.l / 2);
        ctx.fillRect(e.x, e.y, S, S);
      }
      ctx.globalAlpha = 1;
      // eroi in basso: tutti quelli sbloccati (fino a 8)
      const unl = G.HERO_ORDER.filter(id => G.meta.data.unlocked[id]).slice(0, 8);
      const heroes = noHeroes ? [] : (unl.length >= 4 ? unl : ['gheos', 'tasarau', 'poivrons', 'noctis']);
      // dimensione adattata allo spazio libero sotto il testo del titolo
      const foot = document.querySelector('.title-foot');
      const free = H - (foot ? foot.getBoundingClientRect().bottom : H * 0.8) - 24;
      let hs = Math.max(2, Math.floor(H / 150));
      while (hs > 2 && 16 * hs > free) hs--;
      if (16 * hs > free + 8) heroes.length = 0;
      heroes.forEach((h, i) => {
        const spr = G.SPR[h]; if (!spr) return;
        const x = W / 2 + (i - (heroes.length - 1) / 2) * 16 * hs * 1.25 - 8 * hs, y = H - 16 * hs - 18 + Math.sin(t / 400 + i) * hs;
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(x + 8 * hs, H - 20, 6 * hs, 2 * hs, 0, 0, 7); ctx.fill();
        ctx.drawImage(spr.img, x, y, 16 * hs, 16 * hs);
      });
      // Magor sullo sfondo
      const mg = G.SPR.magor;
      if (mg) { ctx.globalAlpha = 0.18 + 0.05 * Math.sin(t / 900); ctx.drawImage(mg.img, W / 2 - 12 * S * 4, H * 0.08, 24 * S * 4, 24 * S * 4); ctx.globalAlpha = 1; }
      bgRaf = requestAnimationFrame(loop);
    };
    bgRaf = requestAnimationFrame(loop);
  }

  // ================================================================
  //  SELEZIONE EROE
  // ================================================================
  UI.showSelect = function () {
    UI.state = 'select';
    const meta = G.meta.data;
    if (!meta.unlocked[UI.sel.hero]) UI.sel.hero = 'gheos';
    UI.sel.ecl = Math.min(UI.sel.ecl, meta.maxEclissi);
    const s = $('#screen'); s.classList.remove('hidden');
    let cards = '';
    for (const id of G.HERO_ORDER) {
      const d = G.HEROES[id], un = meta.unlocked[id];
      const wins = meta.wins[id] || 0;
      cards += `<div class="hcard panel ${un ? '' : 'locked'} ${UI.sel.hero === id ? 'sel' : ''}" data-h="${id}">
        <div class="cv" data-spr="${id}"></div>
        <div><div class="nm">${un ? d.name : '???'}</div><div class="tt">${un ? d.title : 'Bloccato'}</div>
        ${un ? elemBadge(d.elem) : ''}
        <div class="st">${un ? `PV ${d.hp} · Arm ${d.def}` : esc(d.unlock || '')}</div></div>
        <div class="diff">${'★'.repeat(d.difficulty)}${wins ? ' 👑' + wins : ''}</div>
      </div>`;
    }
    s.innerHTML = `<div class="menu-bg"><canvas id="title-bg"></canvas></div><div class="select-wrap">
      <h2>Scegli il tuo Signore della Natura</h2>
      <div class="heroes">${cards}</div>
      <div class="hero-detail panel" id="hero-detail"></div>
      <div class="select-foot">
        <button class="btn small" data-a="back">◀ Indietro</button>
        <div class="ecl">${meta.maxEclissi > 0 ? `<button class="btn small" data-a="ecl-">◀</button><div><div class="ecl-name" id="ecl-name"></div></div><button class="btn small" data-a="ecl+">▶</button><div class="ecl-desc" id="ecl-desc"></div>` : '<div class="ecl-desc">Vinci una partita per sbloccare i livelli di Eclissi (difficoltà).</div>'}</div>
        <button class="btn gold" data-a="start">Inizia l'avventura ▶</button>
      </div></div>`;
    s.querySelectorAll('.cv').forEach(el => { const c = spriteCanvas(el.dataset.spr); if (!meta.unlocked[el.dataset.spr]) c.style.filter = 'brightness(0)'; el.replaceWith(c); });
    s.querySelectorAll('.hcard').forEach(el => el.onclick = () => {
      if (!meta.unlocked[el.dataset.h]) { G.audio.play('miss'); return; }
      UI.sel.hero = el.dataset.h; G.audio.play('select'); UI.showSelect();
    });
    s.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      G.audio.play('click');
      const a = b.dataset.a;
      if (a === 'back') UI.showTitle();
      if (a === 'ecl-') { UI.sel.ecl = Math.max(0, UI.sel.ecl - 1); updEcl(); }
      if (a === 'ecl+') { UI.sel.ecl = Math.min(meta.maxEclissi, UI.sel.ecl + 1); updEcl(); }
      if (a === 'start') UI.startRun(UI.sel.hero, { eclissi: UI.sel.ecl });
    });
    const updEcl = () => { const n = $('#ecl-name'); if (n) { n.textContent = G.ECLISSI[UI.sel.ecl].name; $('#ecl-desc').textContent = G.ECLISSI[UI.sel.ecl].desc; } };
    updEcl();
    // dettagli eroe
    const d = G.HEROES[UI.sel.hero];
    const fake = { level: 1, up: {}, mods: G.defaultMods(), x: 0, y: 0 };
    let sk = '';
    d.skills.forEach((id, i) => {
      const S = G.SKILLS[id];
      sk += `<div class="skill-row"><div class="g" data-sicon="${id}"></div><div><b>[${i + 1}] ${S.name}</b>${S.ult ? ' <small>(Furia)</small>' : ` <small>(ricarica ${S.cd})</small>`}<br><small>${esc(S.desc(fake))}</small></div></div>`;
    });
    $('#hero-detail').innerHTML = `<div><h3>${d.name} — ${d.title}</h3><p>${esc(d.desc)}</p>
      <p style="margin-top:10px"><b style="color:#ffe9a0">Passiva: ${d.passive}</b><br>${esc(d.passiveDesc)}</p>
      <p style="margin-top:10px;color:#a89cb8">Elemento ${elemBadge(d.elem)} — forte contro ${G.ELEMS[G.ELEMS[d.elem].beats] ? G.ELEMS[G.ELEMS[d.elem].beats].name : 'nessuno'}, debole contro ${Object.keys(G.ELEMS).filter(k => G.ELEMS[k].beats === d.elem).map(k => G.ELEMS[k].name).join(', ') || 'nessuno'}.</p>
      <p style="color:#a89cb8">Danno ${d.atk[0]}-${d.atk[1]} · Schivata ${d.eva} · Critico ${d.crit}% (×${d.critMul})</p></div><div>${sk}</div>`;
    s.querySelectorAll('[data-sicon]').forEach(el => el.appendChild(iconCanvas(G.skillIcon(el.dataset.sicon))));
    startTitleBg(true);
  };
  UI.selectKey = function (e) {
    const list = G.HERO_ORDER.filter(id => G.meta.data.unlocked[id]);
    let i = list.indexOf(UI.sel.hero);
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { UI.sel.hero = list[(i + 1) % list.length]; UI.showSelect(); G.audio.play('select'); }
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { UI.sel.hero = list[(i - 1 + list.length) % list.length]; UI.showSelect(); G.audio.play('select'); }
    else if (e.key === 'Enter') UI.startRun(UI.sel.hero, { eclissi: UI.sel.ecl });
    else if (e.key === 'Escape') UI.showTitle();
  };

  UI.startDaily = function () {
    const today = new Date().toISOString().slice(0, 10);
    const day = Math.floor(Date.parse(today) / 86400000);
    const hero = ['gheos', 'tasarau', 'poivrons', 'noctis'][day % 4];
    UI.startRun(hero, { seed: G.hashString('gormiti-sfida-' + today), eclissi: 1, daily: today });
  };

  UI.startRun = function (heroId, opts) {
    G.audio.init();
    cancelAnimationFrame(bgRaf);
    fade(() => {
      G.newRun(heroId, opts);
      if (!G.meta.data.tutorialSeen) { G.run.pending.unshift({ type: 'intro' }); }
      UI.enterGame(false);
    });
  };

  // ================================================================
  //  GIOCO
  // ================================================================
  UI.enterGame = function (resumed) {
    cancelAnimationFrame(bgRaf);
    UI.state = 'game';
    $('#screen').classList.add('hidden'); $('#screen').innerHTML = '';
    $('#hud').classList.remove('hidden');
    G.RD.mapLayer = null; G.RD.resetAnims(); G.RD.ambient = [];
    UI.buildActionBar();
    UI.onFloor(resumed);
    UI.refresh();
    UI.processPending();
  };
  UI.onFloor = function (resumed) {
    const R = G.run; if (!R || UI.state !== 'game' && UI.state !== 'modal') return;
    const b = G.biomeOf(R.floor);
    if (G.isBossFloor(R.floor)) G.audio.music.set(R.floor === G.TOTAL_FLOORS ? 'final' : 'boss');
    else G.audio.music.set(b.id);
    UI.banner(b.name, (G.isBossFloor(R.floor) ? 'Arena del Guardiano' : 'Piano ' + R.floor + ' di ' + G.TOTAL_FLOORS) + (resumed ? ' — partita ripresa' : ''));
    UI.lastLogLen = 0;
  };
  UI.onBossIntro = function (b) {
    G.audio.music.set(G.run.floor === G.TOTAL_FLOORS ? 'final' : 'boss');
  };

  let bannerTimer = 0;
  UI.banner = function (title, sub) {
    const el = $('#banner');
    el.classList.add('hidden'); void el.offsetWidth;
    el.querySelector('.bt').textContent = title; el.querySelector('.bs').textContent = sub || '';
    el.classList.remove('hidden');
    clearTimeout(bannerTimer); bannerTimer = setTimeout(() => el.classList.add('hidden'), 2600);
  };

  // ---------------------------------------------------------------- barra azioni
  UI.buildActionBar = function () {
    const R = G.run, h = R.hero;
    const sk = $('#skills'); sk.innerHTML = '';
    h.skills.forEach((s, i) => {
      const d = G.SKILLS[s.id];
      const el = document.createElement('div');
      el.className = 'slot skill' + (d.ult ? ' ult' : '');
      el.dataset.skill = i;
      el.innerHTML = `${d.ult ? '<div class="furyfill"></div>' : ''}<span class="key">${G.KEYS.primary('skill' + (i + 1))}</span><div class="cd hidden"></div>`;
      el.insertBefore(iconCanvas(G.skillIcon(s.id)), el.querySelector('.key'));
      el.onclick = () => G.Input.useSkill(i);
      sk.appendChild(el);
    });
    const it = $('#items'); it.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.className = 'slot item'; el.dataset.item = i;
      el.onclick = () => G.Input.useItem(i);
      el.oncontextmenu = (e) => { e.preventDefault(); UI.dropItem(i); };
      it.appendChild(el);
    }
    document.querySelectorAll('#quick .qbtn').forEach(b => b.onclick = () => G.Input.quick(b.dataset.act));
  };
  UI.dropItem = function (i) {
    const h = G.run.hero, s = h.items[i];
    if (!s) return;
    const d = G.ITEM_BY_ID[s.id];
    UI.confirm('Gettare ' + d.name + (s.n > 1 ? ' (×' + s.n + ')' : '') + '?', () => { h.items[i] = null; G.log('Hai gettato ' + d.name + '.', 'info'); UI.refresh(); });
  };

  // ---------------------------------------------------------------- refresh HUD
  UI.refresh = function () {
    const R = G.run; if (!R) return;
    const h = R.hero;
    // ritratto
    const pc = $('#portrait'), pctx = pc.getContext('2d');
    pctx.clearRect(0, 0, 16, 16); pctx.drawImage(G.SPR[h.heroId].img, 0, 0);
    $('#hero-lvl').textContent = 'Lv' + h.level;
    $('#hero-name').innerHTML = `${h.name}<small>${G.HEROES[h.heroId].title}</small>`;
    const sh = h.status.shield ? h.status.shield.p : 0;
    const hpEl = $('.bar.hp');
    hpEl.querySelector('.fill').style.width = (100 * Math.max(0, h.hp) / h.maxHp) + '%';
    const sf = hpEl.querySelector('.shieldfill');
    sf.style.left = (100 * Math.max(0, h.hp) / h.maxHp) + '%'; sf.style.width = Math.min(100 - 100 * h.hp / h.maxHp, 100 * sh / h.maxHp) + '%';
    hpEl.querySelector('span').textContent = `${Math.max(0, h.hp)} / ${h.maxHp}` + (sh ? `  (+${sh})` : '');
    const fu = $('.bar.fury');
    const uc = G.ultCost(h);
    fu.querySelector('.fill').style.width = Math.min(100, 100 * h.fury / uc) + '%';
    fu.querySelector('span').textContent = h.fury >= uc ? 'FURIA PRONTA!' : 'Furia ' + Math.floor(h.fury) + '/' + uc;
    fu.classList.toggle('full', h.fury >= uc);
    const xp = $('.bar.xp');
    xp.querySelector('.fill').style.width = (100 * h.xp / h.xpNext) + '%';
    xp.querySelector('span').textContent = `XP ${Math.floor(h.xp)}/${h.xpNext}`;
    $('#hero-stats').innerHTML = `<span>Danno <b>${h.atk[0] + h.mods.dmg}-${h.atk[1] + h.mods.dmg}</b></span><span>Arm <b>${G.effDef(h)}</b></span><span>Schiv <b>${h.eva}</b></span><span>Crit <b>${h.crit}%</b></span><span>Vel <b>${h.speed}</b></span>`;
    // stati
    let st = '';
    for (const k in h.status) {
      const info = G.STATUS_INFO[k]; if (!info) continue;
      const v = h.status[k];
      st += `<span class="chip" data-status="${k}" style="color:${info.color};border-color:${info.color}">${info.name}${k === 'shield' || k === 'poison' ? ' ' + v.p : ''} ${k === 'shield' || k === 'poison' ? '' : '(' + v.t + ')'}</span>`;
    }
    $('#statuses').innerHTML = st;
    // abilità
    document.querySelectorAll('#skills .slot').forEach((el, i) => {
      const s = h.skills[i], d = G.SKILLS[s.id];
      const cd = el.querySelector('.cd');
      if (d.ult) {
        el.querySelector('.furyfill').style.height = Math.min(100, 100 * h.fury / G.ultCost(h)) + '%';
        el.classList.toggle('ready', h.fury >= G.ultCost(h));
      } else {
        cd.classList.toggle('hidden', s.cd <= 0);
        cd.textContent = s.cd;
      }
      el.classList.toggle('active', !!(UI.targeting && UI.targeting.kind === 'skill' && UI.targeting.index === i));
    });
    // oggetti
    document.querySelectorAll('#items .slot').forEach((el, i) => {
      const s = h.items[i];
      const key = G.KEYS.primary('item' + (i + 1));
      if (!s) { el.className = 'slot item empty'; el.innerHTML = `<span class="key">${key}</span>`; return; }
      el.className = 'slot item' + (UI.targeting && UI.targeting.kind === 'item' && UI.targeting.index === i ? ' active' : '');
      if (el.dataset.cur !== s.id + s.n) {
        el.innerHTML = `<span class="key">${key}</span>${s.n > 1 ? `<span class="cnt">${s.n}</span>` : ''}`;
        el.insertBefore(iconCanvas(itemImg(s.id)), el.firstChild);
        el.dataset.cur = s.id + s.n;
      }
    });
    // piano
    const b = G.biomeOf(R.floor);
    $('#floor-name').textContent = b.name;
    const FM = R.floorMods || {};
    $('#floor-sub').textContent = `Piano ${R.floor}/${G.TOTAL_FLOORS}${R.eclissi ? ' · ' + G.ECLISSI[R.eclissi].name : ''}${R.daily ? ' · Sfida' : ''}${FM.danger ? ' · Pericoloso' : ''}${FM.cursed ? ' · Maledetto' : ''}`;
    // risonanze
    const sy = $('#synergies');
    if (sy) {
      const c = G.synCounts(h);
      sy.innerHTML = G.SYN_ORDER.filter(t => c[t]).map(t => { const S = G.SYNERGIES[t], lv = G.synLevel(h, t); return `<span class="syn lv${lv}" data-syn="${t}" style="color:${S.color};border-color:${S.color}${lv ? '' : '55'}">${S.glyph} ${c[t]}</span>`; }).join('');
      sy.classList.toggle('hidden', !sy.innerHTML);
    }
    $('#gold-line').innerHTML = `<span class="g">◆ ${h.gold} Frammenti</span><span>Turno ${R.turn}</span>`;
    // reliquie
    const rel = $('#relics');
    if (rel.dataset.n !== String(h.relics.length)) {
      rel.innerHTML = '';
      for (const id of h.relics) {
        const d = document.createElement('div'); d.className = 'relic'; d.dataset.relic = id;
        const c = iconCanvas(relicImg(id)); d.appendChild(c);
        d.style.borderColor = G.RARITY[G.RELIC_BY_ID[id].rarity].color + '88';
        rel.appendChild(d);
      }
      rel.dataset.n = h.relics.length;
    }
    // boss
    const boss = R.bossId && R.bossIntro ? R.ents.find(e => e.id === R.bossId && !e.dead) : null;
    const bb = $('#bossbar');
    if (boss) {
      bb.classList.remove('hidden');
      const d = G.MON[boss.type];
      $('#boss-name').innerHTML = `${d.name}<small>${d.title || ''} ${elemBadge(boss.elem)}</small>`;
      bb.querySelector('.bar .fill').style.width = (100 * boss.hp / boss.maxHp) + '%';
      bb.querySelector('.bar span').textContent = `${boss.hp} / ${boss.maxHp}`;
    } else bb.classList.add('hidden');
    UI.drawMinimap();
    UI.drawLog();
  };

  // ---------------------------------------------------------------- minimappa
  UI.drawMinimap = function () {
    const R = G.run, m = R.map, cv = $('#minimap');
    const sc = 4;
    if (cv.width !== m.w * sc) { cv.width = m.w * sc; cv.height = m.h * sc; }
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
    const showStairs = R.hero.mods.revealStairs && m.stairs;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const i = y * m.w + x;
      if (!m.seen[i]) continue;
      const t = m.t[i], v = R.vis[i];
      let c;
      if (G.TILE[t].solid) c = v ? '#6a5a80' : '#3a3048';
      else if (t === T.SHALLOW) c = v ? '#3a7ab0' : '#24486a';
      else if (t === T.DEEP) c = v ? '#1e4a8a' : '#142c50';
      else if (t === T.LAVA) c = '#d04010';
      else if (t === T.CHASM) c = '#0a0a18';
      else if (t === T.STAIRS) { const p = G.portalAt(x, y); c = p && p.kind === 'danger' ? '#ff4a4a' : '#c08aff'; }
      else if (t === T.ICE) c = v ? '#a8d8f0' : '#6a8aa0';
      else if (t === T.DOOR) c = '#8a5a2a';
      else c = v ? '#4a4258' : '#2a2434';
      ctx.fillStyle = c; ctx.fillRect(x * sc, y * sc, sc, sc);
    }
    for (const it of R.items) if (m.seen[it.y * m.w + it.x]) { ctx.fillStyle = it.kind === 'relic' || it.kind === 'pietra' ? '#ffd23a' : it.kind === 'gold' ? '#7fe8ff' : '#7fffb0'; ctx.fillRect(it.x * sc + 1, it.y * sc + 1, 2, 2); }
    for (const f of R.features) if (!f.gone && m.seen[f.y * m.w + f.x]) { ctx.fillStyle = f.type === 'chest' ? '#ffb83a' : f.type === 'merchant' ? '#6ee05a' : f.type === 'event' ? (f.used ? '#5a6a7a' : '#a0f0ff') : '#ff9ad0'; ctx.fillRect(f.x * sc, f.y * sc, sc, sc); }
    if (showStairs) { ctx.fillStyle = '#e0b0ff'; ctx.fillRect(m.stairs[0] * sc - 1, m.stairs[1] * sc - 1, sc + 2, sc + 2); }
    for (const e of R.ents) {
      if (e.dead || e.kind === 'hero') continue;
      if (!G.visible(e.x, e.y) || G.isHiddenMonster(e)) continue;
      ctx.fillStyle = e.faction === 'player' ? '#6ee05a' : e.flags.boss ? '#ff40ff' : '#ff4040';
      ctx.fillRect(e.x * sc, e.y * sc, sc, sc);
    }
    const h = R.hero;
    ctx.fillStyle = (Date.now() / 300 | 0) % 2 ? '#ffffff' : '#ffe27a';
    ctx.fillRect(h.x * sc - 1, h.y * sc - 1, sc + 2, sc + 2);
  };

  // ---------------------------------------------------------------- registro
  UI.drawLog = function () {
    const R = G.run, el = $('#log');
    const last = R.log.slice(-7);
    el.innerHTML = last.map((l, i) => `<div class="${l.cls}${R.turn - l.turn > 6 && i < last.length - 2 ? ' old' : ''}">${esc(l.text)}${l.count > 1 ? ' <span style="opacity:.7">×' + l.count + '</span>' : ''}</div>`).join('');
  };

  // ================================================================
  //  TOOLTIP
  // ================================================================
  const tip = () => $('#tooltip');
  UI.showTip = function (html, x, y) {
    const t = tip(); t.innerHTML = html; t.classList.remove('hidden');
    const r = t.getBoundingClientRect();
    let tx = x + 18, ty = y + 18;
    if (tx + r.width > innerWidth - 8) tx = x - r.width - 12;
    if (ty + r.height > innerHeight - 8) ty = y - r.height - 12;
    t.style.left = Math.max(4, tx) + 'px'; t.style.top = Math.max(4, ty) + 'px';
  };
  UI.hideTip = () => tip().classList.add('hidden');

  UI.tipForEl = function (el) {
    const R = G.run; if (!R) return null;
    const h = R.hero;
    if (el.dataset.skill !== undefined) {
      const s = h.skills[+el.dataset.skill], d = G.SKILLS[s.id];
      const rng = d.range ? ` · gittata ${G.skillRange(h, d)}` : '';
      return `<h4>[${+el.dataset.skill + 1}] ${d.name}</h4><div class="sub">${G.ELEMS[d.elem].name}${d.ult ? ' · richiede Furia piena' : ' · ricarica ' + G.skillCd(h, s.id) + ' turni'}${rng}</div>${esc(d.desc(h))}`;
    }
    if (el.dataset.item !== undefined) {
      const s = h.items[+el.dataset.item]; if (!s) return '<h4>Slot vuoto</h4>Raccogli consumabili esplorando.';
      const d = G.ITEM_BY_ID[s.id];
      return `<h4>${d.name}${s.n > 1 ? ' ×' + s.n : ''}</h4>${esc(d.desc)}<div class="sub">Tasto ${+el.dataset.item === 5 ? 0 : +el.dataset.item + 5} o clic per usare · clic destro per gettare</div>`;
    }
    if (el.dataset.relic) {
      const r = G.RELIC_BY_ID[el.dataset.relic];
      const tg = r.tag ? G.SYNERGIES[r.tag] : null;
      return `<h4 style="color:${G.RARITY[r.rarity].color}">${r.name}</h4><div class="sub">Reliquia ${G.RARITY[r.rarity].name}${tg ? ` · <span style="color:${tg.color}">${tg.glyph} ${tg.name}</span>` : ''}</div>${esc(r.desc)}`;
    }
    if (el.dataset.syn) {
      const t = el.dataset.syn, S = G.SYNERGIES[t], n = G.synCounts(h)[t] || 0, lv = G.synLevel(h, t);
      return `<h4 style="color:${S.color}">${S.glyph} Risonanza ${S.name} (${n})</h4><div class="${lv >= 1 ? '' : 'sub'}">2 elementi: ${esc(S.t1)}${lv >= 1 ? ' ✔' : ''}</div><div class="${lv >= 2 ? '' : 'sub'}">4 elementi: ${esc(S.t2)}${lv >= 2 ? ' ✔' : ''}</div><div class="sub">Reliquie e Doni con questa affinità attivano la risonanza.</div>`;
    }
    if (el.dataset.status) {
      const k = el.dataset.status, info = G.STATUS_INFO[k], v = h.status[k];
      return `<h4 style="color:${info.color}">${info.name}</h4>${esc(info.desc)}${v ? `<div class="sub">${k === 'shield' ? 'Assorbe ancora ' + v.p + ' danni. ' : ''}Turni rimanenti: ${v.t}</div>` : ''}`;
    }
    const t = el.dataset.tip;
    if (t === 'hp') return `<h4>Punti Vita</h4>Se arrivano a zero la partita finisce. Non si rigenerano da soli: usa pozioni, santuari e abilità.`;
    if (t === 'fury') return `<h4>Furia</h4>Si carica infliggendo e subendo danni. Quando è piena puoi scatenare il Potere Supremo (tasto 4).`;
    if (t === 'xp') return `<h4>Esperienza</h4>Sconfiggi nemici per salire di livello e ricevere i Doni del Saggio.`;
    if (t === 'wait') return `<h4>Attendi un turno</h4>Tasto ${G.KEYS.primary('wait')}.`;
    if (t === 'explore') return `<h4>Esplorazione automatica</h4>Tasto ${G.KEYS.primary('explore')}. Esplora il piano, raccoglie oggetti e raggiunge il portale. Si ferma se compaiono nemici.`;
    if (t === 'build') return `<h4>Scheda dell'eroe</h4>Tasto ${G.KEYS.primary('build')}. Statistiche, abilità, Doni, reliquie e Risonanze.`;
    if (t === 'menu') return `<h4>Menu</h4>Pausa, guida, opzioni, salvataggio.`;
    return null;
  };

  // tooltip per una casella della mappa
  UI.tileTip = function (x, y) {
    const R = G.run; if (!R || !G.inb(x, y)) return null;
    const m = R.map, i = y * m.w + x;
    if (!m.seen[i]) return null;
    const vis = R.vis[i];
    const e = G.entityAt(x, y);
    if (e && (e.kind === 'hero' || (vis && !G.isHiddenMonster(e)))) {
      if (e.kind === 'hero') return `<h4>${e.name} (tu)</h4>${elemBadge(e.elem)} PV ${e.hp}/${e.maxHp}`;
      const d = Object.assign({}, G.MON[e.type], { name: e.name });
      const em = G.elemMult(R.hero.elem, e.elem), ed = G.elemMult(e.elem, R.hero.elem);
      let rel = em > 1 ? '<span style="color:#ffd23a">Sei forte contro di lui (×1,5)</span>' : em < 1 ? '<span style="color:#9aa0aa">Lui resiste ai tuoi colpi (×0,75)</span>' : '';
      if (ed > 1) rel += (rel ? '<br>' : '') + '<span style="color:#ff7a6a">Ti infligge danni extra</span>';
      const sts = Object.keys(e.status).filter(k => G.STATUS_INFO[k]).map(k => `<span style="color:${G.STATUS_INFO[k].color}">${G.STATUS_INFO[k].name}</span>`).join(', ');
      const mode = e.kind === 'ally' ? 'Alleato' : e.st.mode === 'sleep' ? 'Addormentato (colpo a sorpresa: critico!)' : e.st.mode === 'wander' ? 'Vaga senza averti notato' : 'Ti dà la caccia';
      const afx = (e.affixes || []).map(a => `<span style="color:${G.AFFIXES[a].color}">${G.AFFIXES[a].name}: ${esc(G.AFFIXES[a].desc)}</span>`).join('<br>');
      return `<h4>${esc(d.name)}${e.flags.champion ? ' ♛' : e.flags.elite ? ' ★' : ''}</h4>${elemBadge(e.elem)} <span class="sub">${mode}</span><br>PV <span class="k">${e.hp}/${e.maxHp}</span> · Danno ${e.atk[0]}-${e.atk[1]} · Arm ${G.effDef(e)}${e.eva ? ' · Schiv ' + e.eva : ''}${sts ? '<br>' + sts : ''}${afx ? '<br>' + afx : ''}<br><span class="sub">${esc(d.desc)}</span>${rel ? '<br>' + rel : ''}`;
    }
    if (m.t[i] === T.STAIRS) { const pi = G.portalInfo(G.portalAt(x, y)); return `<h4>${pi.name}</h4>${esc(pi.desc)}${R.sealed ? '<div class="sub">Sigillato: sconfiggi il guardiano.</div>' : ''}`; }
    const f = G.featureAt(x, y);
    if (f) {
      if (f.type === 'event') { const ev = G.EVENT_BY_ID[f.ev]; return `<h4>${ev.title}</h4>${f.used ? 'Hai già fatto la tua scelta.' : 'Qualcosa ti attende qui. Urtalo per scoprirlo.'}`; }
      if (f.type === 'chest') return `<h4>${f.rare ? 'Scrigno Antico' : 'Forziere'}</h4>${f.rare ? 'Contiene una reliquia.' : 'Frammenti e forse un oggetto.'} Urtalo per aprirlo.`;
      if (f.type === 'merchant') return `<h4>Razzle il Mercante</h4>Il dinosauro viaggiatore vende pozioni e reliquie. Urtalo per commerciare.`;
      if (f.type === 'shrine') { const s = G.SHRINES[f.kind]; return `<h4>${s.name}</h4>${esc(s.desc)}${f.used ? '<div class="sub">Già usato.</div>' : '<div class="sub">Urtalo per interagire.</div>'}`; }
    }
    const it = R.items.find(o => o.x === x && o.y === y);
    if (it) {
      if (it.kind === 'gold') return `<h4>Frammenti di Gorm</h4>${it.n} frammenti: la valuta dei mercanti.`;
      if (it.kind === 'relic') { const r = G.RELIC_BY_ID[it.id]; return `<h4 style="color:${G.RARITY[r.rarity].color}">${r.name}</h4>${esc(r.desc)}`; }
      if (it.kind === 'pietra') return `<h4>${it.name}</h4>Una delle Pietre di Gorm! Raccoglila.`;
      const d = G.ITEM_BY_ID[it.id]; return `<h4>${d.name}</h4>${esc(d.desc)}`;
    }
    const tr = R.traps.find(o => o.x === x && o.y === y && !o.gone);
    if (tr) { const info = G.TRAPS[tr.type]; return `<h4 style="color:${info.color}">${info.name}</h4>${esc(info.desc)}`; }
    const ti = G.TILE[m.t[i]];
    const fire = m.fire[i] ? ' (in fiamme!)' : '';
    if (ti.desc || fire) return `<h4>${ti.name}${fire}</h4>${esc(ti.desc || '')}`;
    return null;
  };

  // ================================================================
  //  MODALI
  // ================================================================
  function openModal(html, opts) {
    opts = opts || {};
    UI.modal = opts;
    const m = $('#modal');
    m.innerHTML = `<div class="mbox panel">${html}</div>`;
    m.classList.remove('hidden');
    UI.hideTip();
    return m;
  }
  function closeModal() {
    $('#modal').classList.add('hidden'); $('#modal').innerHTML = '';
    UI.modal = null;
  }
  UI.closeModal = closeModal;
  UI.isModal = () => !!UI.modal;

  // processa le scelte in sospeso (level-up, reliquie, negozio...)
  UI.processPending = function () {
    const R = G.run;
    if (!R || UI.modal) return;
    if (R.over) { UI.showEnd(); return; }
    const p = R.pending.shift();
    if (!p) return;
    if (p.type === 'levelup') UI.showLevelUp(p);
    else if (p.type === 'relic') UI.showRelicChoice(p);
    else if (p.type === 'shop') UI.showShop(R.features.find(f => f.id === p.fid));
    else if (p.type === 'shrine') UI.showShrine(R.features.find(f => f.id === p.fid));
    else if (p.type === 'intro') UI.showIntro();
    else if (p.type === 'event') UI.showEvent(R.features.find(f => f.id === p.fid));
  };
  UI.afterModal = () => afterModal();

  UI.showEvent = function (f) {
    if (!f) { afterModal(); return; }
    const R = G.run, h = R.hero, ev = G.EVENT_BY_ID[f.ev];
    const opts = G.eventOptions(f);
    let btns = '';
    opts.forEach((o, i) => { btns += `<button class="btn ${i === 0 ? 'gold' : ''}" data-o="${i}" ${o.ok ? '' : 'disabled'}>${i + 1}. ${esc(o.label)}${o.ok ? '' : ' — ' + esc(o.reason)}</button>`; });
    const m = openModal(`<h2>${ev.title}</h2><div class="evtext">${ev.text(R, h, f)}</div><div class="menu ev">${btns}</div>`,
      { type: 'choice', pick: (i) => choose(i) });
    const choose = (i) => {
      if (!opts[i] || !opts[i].ok) { G.audio.play('miss'); return; }
      G.audio.play('click');
      const res = G.eventChoose(f, i);
      if (!res) return;
      const mm = openModal(`<h2>${ev.title}</h2><div class="evtext">${res.text}</div><div class="mfoot"><button class="btn gold" id="evok">Continua ▶</button></div>`,
        { type: 'result', enter: () => $('#evok').click(), esc: () => $('#evok').click() });
      $('#evok').onclick = () => {
        if (res.descend) { closeModal(); fade(() => { G.descend(); G.Input.post(); }); return; }
        afterModal();
        G.Input.post();
      };
    };
    m.querySelectorAll('[data-o]').forEach(b => b.onclick = () => choose(+b.dataset.o));
  };
  function afterModal() { closeModal(); UI.refresh(); G.save(); setTimeout(UI.processPending, 60); }

  UI.showIntro = function () {
    const h = G.run.hero;
    const m = openModal(`<h2>L'isola di Gorm è in pericolo</h2>
      <div style="max-width:720px;text-align:left;font-size:22px;line-height:1.2">
      <p>Magor, il Signore del Male, si è risvegliato nelle viscere del <b style="color:#ff9a2a">Monte Vulcano</b>. Il suo potere ha corrotto le cinque <b style="color:#ffd23a">Pietre di Gorm</b>, e i guardiani di ogni regione sono caduti sotto il suo controllo.</p>
      <p>Il <b style="color:#b0e0ff">Vecchio Saggio</b> ha scelto te, <b style="color:#ffe9a0">${h.name}</b>, per attraversare l'isola: la Foresta Silente, la Fossa degli Antichi Spiriti, la Caverna di Roscamar, i Picchi della Valle del Destino... fino al cuore del vulcano.</p>
      <p style="color:#a89cb8">Muoviti con <span class="k">WASD</span>/frecce (diagonali con <span class="k">Q E Z C</span>), attacca urtando i nemici, usa le abilità con <span class="k">1-4</span>. Premi <span class="k">H</span> per la guida completa in qualsiasi momento. Se muori, ricominci da capo: ogni partita è diversa.</p></div>
      <div class="mfoot"><button class="btn gold" id="go">Che la Natura sia con te ▶</button></div>`, { type: 'intro', enter: () => $('#go').click() });
    $('#go').onclick = () => { G.meta.data.tutorialSeen = true; G.meta.save(); G.audio.play('click'); afterModal(); };
  };

  UI.showLevelUp = function (p) {
    const h = G.run.hero;
    let cards = '';
    const R = G.run;
    const iconFor = (pk) => {
      const s = pk.hero ? h.skills.find(sk => pk.id.startsWith(sk.id.slice(0, 4))) : null;
      return s ? G.skillIcon(s.id) : null;
    };
    p.opts.forEach((id, i) => {
      const pk = G.PERK_BY_ID[id];
      const n = h.perks[id] || 0;
      const tg = pk.tag ? G.SYNERGIES[pk.tag] : null;
      cards += `<div class="card" data-i="${i}"><span class="key">${i + 1}</span><div class="ic" data-pi="${i}" style="color:${pk.hero ? G.ELEMS[h.elem].color : '#ffe9a0'}">${iconFor(pk) ? '' : '✦'}</div>
        <div class="nm">${pk.name}</div><div class="ds">${esc(pk.desc)}</div>
        <div class="tag" style="color:${pk.hero ? '#ffd23a' : '#a89cb8'}">${pk.hero ? 'Potenziamento di ' + h.name : 'Dono comune'}${(pk.max || 1) > 1 ? ` · ${n}/${pk.max}` : ''}</div>
        ${tg ? `<div class="tag" style="color:${tg.color}">${tg.glyph} ${tg.name} (${(G.synCounts(h)[pk.tag] || 0)}→${(G.synCounts(h)[pk.tag] || 0) + (n ? 0 : 1)})</div>` : ''}</div>`;
    });
    const canReroll = R.rerolls > 0 && !p.rerolled;
    const m = openModal(`<h2>${p.title || 'Livello ' + h.level + '!'}</h2><div class="sub">Il Vecchio Saggio ti offre un dono. Scegline uno (tasti 1-${p.opts.length}).</div><div class="cards">${cards}</div>${canReroll ? '<div class="mfoot"><button class="btn small" id="reroll">Rimescola i doni (1 volta per partita)</button></div>' : ''}`,
      { type: 'choice', pick: (i) => pick(i) });
    m.querySelectorAll('[data-pi]').forEach(el => { const img = iconFor(G.PERK_BY_ID[p.opts[+el.dataset.pi]]); if (img) el.appendChild(iconCanvas(img)); });
    const pick = (i) => { if (!p.opts[i]) return; G.applyPerk(h, p.opts[i]); afterModal(); };
    m.querySelectorAll('.card').forEach(c => c.onclick = () => pick(+c.dataset.i));
    if (canReroll) $('#reroll').onclick = () => { R.rerolls--; p.opts = G.rollPerks(h, p.opts.length); p.rerolled = true; G.audio.play('select'); UI.showLevelUp(p); };
  };

  UI.showRelicChoice = function (p) {
    const h = G.run.hero;
    if (!p.opts.length) { afterModal(); return; }
    let cards = '';
    p.opts.forEach((id, i) => {
      const r = G.RELIC_BY_ID[id];
      cards += `<div class="card" data-i="${i}"><span class="key">${i + 1}</span><div class="ic" data-ic="${id}"></div><div class="nm" style="color:${G.RARITY[r.rarity].color}">${r.name}</div><div class="ds">${esc(r.desc)}</div><div class="tag" style="color:${G.RARITY[r.rarity].color}">${G.RARITY[r.rarity].name}</div></div>`;
    });
    const m = openModal(`<h2>${p.title || 'Scegli una reliquia'}</h2><div class="sub">Puoi prenderne solo una.</div><div class="cards">${cards}</div>`, { type: 'choice', pick: (i) => pick(i) });
    m.querySelectorAll('[data-ic]').forEach(el => el.appendChild(iconCanvas(relicImg(el.dataset.ic))));
    const pick = (i) => { if (!p.opts[i]) return; G.gainRelic(h, p.opts[i]); afterModal(); };
    m.querySelectorAll('.card').forEach(c => c.onclick = () => pick(+c.dataset.i));
  };

  UI.showShop = function (f) {
    if (!f) { afterModal(); return; }
    const h = G.run.hero;
    const render = () => {
      let items = '';
      f.stock.forEach((s, i) => {
        const price = G.shopPrice(s);
        let nm, ds, img;
        if (s.kind === 'item') { const d = G.ITEM_BY_ID[s.id]; nm = d.name; ds = d.desc; img = itemImg(s.id); }
        else if (s.kind === 'relic') { const r = G.RELIC_BY_ID[s.id]; nm = `<span style="color:${G.RARITY[r.rarity].color}">${r.name}</span>`; ds = r.desc; img = relicImg(s.id); }
        else { nm = 'Cure di Razzle'; ds = 'Recuperi il 50% dei PV e rimuovi gli stati negativi.'; img = itemImg('grande_pozione'); }
        items += `<div class="sitem ${s.sold ? 'sold' : ''} ${h.gold < price ? 'poor' : ''}" data-i="${i}"><div data-ic="${i}"></div><div><div class="nm">${nm}</div><div class="ds">${esc(ds)}</div></div><div class="price">${s.sold ? 'VENDUTO' : price + ' ◆'}</div></div>`;
      });
      const m = openModal(`<h2>Razzle il Mercante</h2><div class="sub">"Ehi, Signore della Natura! Merce rara da tutta Gorm!" — Hai <b style="color:#7fe8ff">${h.gold} ◆</b></div>
        <div class="shop">${items}</div><div class="mfoot"><button class="btn" id="leave">Arrivederci (Esc)</button></div>`, { type: 'shop', esc: () => afterModal() });
      m.querySelectorAll('[data-ic]').forEach(el => {
        const s = f.stock[+el.dataset.ic];
        const img = s.kind === 'item' ? itemImg(s.id) : s.kind === 'relic' ? relicImg(s.id) : itemImg('grande_pozione');
        el.replaceWith(iconCanvas(img));
      });
      m.querySelectorAll('.sitem').forEach(el => el.onclick = () => { if (G.buy(f, +el.dataset.i)) { UI.refresh(); render(); } else G.audio.play('miss'); });
      $('#leave').onclick = () => { G.audio.play('click'); afterModal(); };
    };
    render();
  };

  UI.showShrine = function (f) {
    if (!f) { afterModal(); return; }
    const S = G.SHRINES[f.kind], h = G.run.hero;
    let opts = '';
    S.options.forEach((o, i) => {
      const dis = o.cost && h.gold < o.cost;
      opts += `<button class="btn ${i === 0 ? 'gold' : ''}" data-o="${o.id}" ${dis ? 'disabled' : ''}>${i + 1}. ${o.label}</button>`;
    });
    const m = openModal(`<h2>${S.name}</h2><div class="sub" style="max-width:600px;margin:0 auto 16px">${esc(S.desc)}</div><div class="menu" style="margin-top:6px">${opts}<button class="btn small" id="leave">Lascia stare (Esc)</button></div>`,
      { type: 'choice', pick: (i) => { const b = m.querySelectorAll('[data-o]')[i]; if (b && !b.disabled) b.click(); }, esc: () => afterModal() });
    m.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
      const ok = G.shrineChoose(f, b.dataset.o);
      if (ok !== false) afterModal();
    });
    $('#leave').onclick = () => afterModal();
  };

  UI.confirm = function (text, yes) {
    const prev = UI.modal;
    const m = openModal(`<h2>${esc(text)}</h2><div class="mfoot"><button class="btn gold" id="yes">Sì</button><button class="btn" id="no">No</button></div>`, { type: 'confirm', esc: () => { closeModal(); }, enter: () => $('#yes').click() });
    $('#yes').onclick = () => { closeModal(); yes(); };
    $('#no').onclick = () => closeModal();
  };

  // ---------------------------------------------------------------- pausa
  UI.showPause = function () {
    const m = openModal(`<h2>Pausa</h2><div class="menu">
      <button class="btn gold" data-a="resume">Riprendi</button>
      <button class="btn" data-a="help">Come si gioca</button>
      <button class="btn" data-a="options">Opzioni</button>
      <button class="btn" data-a="save">Salva ed esci al menu</button>
      <button class="btn" data-a="abandon">Abbandona la partita</button></div>`, { type: 'pause', esc: () => closeModal() });
    m.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      G.audio.play('click');
      const a = b.dataset.a;
      if (a === 'resume') closeModal();
      if (a === 'help') UI.showHelp(true);
      if (a === 'options') UI.showOptions(true);
      if (a === 'save') { G.save(); closeModal(); fade(() => UI.showTitle()); }
      if (a === 'abandon') UI.confirm('Abbandonare la partita? Verrà conteggiata come sconfitta.', () => { G.run.over = { win: false, cause: 'la resa' }; UI.showEnd(); });
    });
  };

  // ---------------------------------------------------------------- guida
  UI.showHelp = function (inGame) {
    const wheel = ['mare', 'fuoco', 'foresta', 'terra', 'aria'].map(k => `<span style="background:${G.ELEMS[k].color}22;border:1px solid ${G.ELEMS[k].color};color:${G.ELEMS[k].color}">${G.ELEMS[k].name}</span>`).join(' ▶ ') + ' ▶ <span style="color:#4aa0ff">Mare</span>';
    const html = `<h2>Come si gioca</h2><div class="help">
      <h3>Movimento e azioni</h3>
      <p><span class="k">W A S D</span> o <span class="k">frecce</span>: muoviti · <span class="k">Q E Z C</span>: diagonali (anche tastierino numerico)</p>
      <p>Urta un nemico per attaccarlo. Urta forzieri, mercanti e santuari per interagire.</p>
      <p><span class="k">Spazio</span> attendi un turno · <span class="k">X</span> esplorazione automatica · <span class="k">Invio</span> attraversa il portale</p>
      <p><span class="k">Clic sinistro</span> su una casella: viaggia lì (o attacca se è un nemico adiacente)</p>
      <p><span class="k">1 2 3</span> abilità · <span class="k">4</span> Potere Supremo (serve la Furia piena)</p>
      <p><span class="k">5 6 7 8 9 0</span> usa gli oggetti · clic destro su un oggetto per gettarlo</p>
      <p>Mirare: per le abilità a bersaglio usa <span class="k">Tab</span>/mouse per scegliere e <span class="k">Invio</span>/clic per confermare; per quelle direzionali premi una direzione. <span class="k">Esc</span> annulla.</p>
      <p><span class="k">I</span> scheda dell'eroe · <span class="k">+ / -</span> zoom · <span class="k">M</span> musica on/off · <span class="k">H</span> guida · <span class="k">Esc</span> menu · tutti i tasti si cambiano in Opzioni → Comandi</p>
      <h3>Il sistema a turni</h3>
      <p>Il tempo scorre solo quando agisci. Ogni creatura ha una velocità: le più rapide agiscono più spesso di te. Pensa prima di muoverti!</p>
      <h3>Attacchi annunciati</h3>
      <p>Élite e boss preparano attacchi potenti segnalando in <b style="color:#ff5050">rosso</b> le caselle colpite: hai un turno per spostarti.</p>
      <h3>Elementi</h3>
      <div class="wheel">${wheel}</div>
      <p>Ogni elemento infligge ×1,5 danni a quello che lo segue e ×0,75 a quello che lo precede. Luce e Tenebre si colpiscono a vicenda (×1,5). Passa il mouse su un nemico per vedere il suo elemento.</p>
      <h3>Furia e crescita</h3>
      <p>Infliggere e subire danni carica la Furia. Salendo di livello scegli un Dono del Saggio: potenzia le tue abilità o le tue statistiche. Le reliquie danno poteri passivi permanenti.</p>
      <h3>Esplorazione</h3>
      <p>I PV non si rigenerano da soli: gestisci pozioni e risorse. I nemici addormentati subiscono un colpo critico a sorpresa. Erba alta e porte bloccano la vista. Lava, baratri e fuoco sono pericolosi... anche per i nemici: spingili dentro!</p>
      <p>Ogni regione ha 3 piani: al terzo ti attende il suo Guardiano. Il mercante Razzle si trova al secondo piano di ogni regione.</p>
      <h3>Risonanze</h3>
      <p>Ogni reliquia e Dono ha un'affinità (Veleno, Fuoco, Critico, Vita, Difesa, Furia, Tempesta, Saggezza, Fortuna). Con 2 elementi della stessa affinità si attiva un bonus; con 4 un potere che cambia il tuo stile di gioco. Premi <span class="k">I</span> per la Scheda dell'eroe.</p>
      <h3>Bivi e regioni</h3>
      <p>Al primo piano di ogni regione trovi anche un <b style="color:#ff5050">Portale Cremisi</b>: il Sentiero Pericoloso ha più nemici ma tesori migliori. Dopo alcuni guardiani si aprono due portali: scegli tra regioni diverse (Fossa o Ghiacciai Eterni, Picchi o Tempio della Luce).</p>
      <h3>Segreti, varianti, eventi</h3>
      <p>I muri incrinati si abbattono e nascondono tesori. Alcuni nemici hanno varianti (Corazzato, Esplosivo, Dorato…) e i Campioni ♛ sono nemici con un nome e un premio. I cippi luminosi sono eventi con scelte da ponderare.</p>
      <h3>Morte e progressi</h3>
      <p>La morte è definitiva, ma ogni partita lascia Essenza da spendere nel Santuario del Saggio. Sconfiggere boss e compiere imprese sblocca nuovi eroi (vedi Codex → Imprese) e i livelli di Eclissi. La partita si salva da sola a ogni piano.</p>
    </div><div class="mfoot"><button class="btn gold" id="ok">Ho capito</button></div>`;
    if (inGame || UI.state === 'game') {
      openModal(html, { type: 'help', esc: () => closeModal(), enter: () => closeModal() });
      $('#ok').onclick = () => closeModal();
    } else {
      const s = $('#screen');
      s.innerHTML = `<div class="menu-bg"></div><div class="mbox panel" style="position:relative;z-index:2">${html}</div>`;
      $('#ok').onclick = () => UI.showTitle();
      UI.state = 'sub';
    }
  };

  // ---------------------------------------------------------------- opzioni
  UI.showOptions = function (inGame) {
    const st = G.meta.data.settings;
    const html = `<h2>Opzioni</h2>
      <div class="opt-row"><span>Musica</span><input type="range" min="0" max="1" step="0.05" id="o-mus" value="${st.music}"><span id="o-mus-v">${Math.round(st.music * 100)}</span></div>
      <div class="opt-row"><span>Effetti sonori</span><input type="range" min="0" max="1" step="0.05" id="o-sfx" value="${st.sfx}"><span id="o-sfx-v">${Math.round(st.sfx * 100)}</span></div>
      <div class="opt-row"><span>Scuotimento schermo</span><input type="checkbox" id="o-shake" ${st.shake !== false ? 'checked' : ''}><span></span></div>
      <div class="opt-row"><span>Zoom</span><div><button class="btn small" id="zminus">−</button> <button class="btn small" id="zplus">+</button></div><span></span></div>
      <div class="opt-row"><span>Schermo intero</span><div><button class="btn small" id="ofs">Attiva / disattiva (${G.KEYS.primary('fullscreen')})</button></div><span></span></div>
      <div class="opt-row"><span>Comandi</span><div><button class="btn small" id="okeys">Personalizza i tasti</button></div><span></span></div>
      <div class="opt-row"><span>Progressi</span><div><button class="btn small" id="oexp">Esporta</button> <button class="btn small" id="oimp">Importa</button></div><span></span></div>
      <div class="mfoot"><button class="btn gold" id="ok">Fatto</button></div>`;
    const done = () => { G.meta.save(); if (inGame || UI.state === 'game') closeModal(); else UI.showTitle(); };
    if (inGame || UI.state === 'game') openModal(html, { type: 'opts', esc: done });
    else { $('#screen').innerHTML = `<div class="menu-bg"></div><div class="mbox panel" style="position:relative;z-index:2;min-width:520px">${html}</div>`; UI.state = 'sub'; }
    $('#o-mus').oninput = (e) => { st.music = +e.target.value; $('#o-mus-v').textContent = Math.round(st.music * 100); G.audio.init(); G.audio.applyVolumes(); };
    $('#o-sfx').oninput = (e) => { st.sfx = +e.target.value; $('#o-sfx-v').textContent = Math.round(st.sfx * 100); G.audio.init(); G.audio.applyVolumes(); G.audio.play('coin'); };
    $('#o-shake').onchange = (e) => { st.shake = e.target.checked; };
    $('#zminus').onclick = () => G.RD.zoom(-1);
    $('#zplus').onclick = () => G.RD.zoom(1);
    $('#ofs').onclick = () => G.Input.toggleFullscreen();
    $('#okeys').onclick = () => { G.meta.save(); UI.showKeys(inGame); };
    $('#oexp').onclick = () => UI.exportSave();
    $('#oimp').onclick = () => UI.confirm('Importare un file di progressi? Quelli attuali verranno sostituiti.', () => UI.importSave());
    $('#ok').onclick = done;
  };

  // ---------------------------------------------------------------- codex
  UI.showCodex = function (tab) {
    tab = tab || 'mostri';
    const meta = G.meta.data;
    let body = '';
    if (tab === 'mostri') {
      const order = [];
      for (const b of G.BIOMES) { for (const [k] of b.monsters) order.push(k); order.push(...b.elites, b.boss); if (b.id === 'vulcano') order.splice(order.length - 1, 0, 'magmion'); }
      body = '<div class="codex">' + order.map(k => {
        const d = G.MON[k], known = meta.monsters[k] || meta.bosses[k];
        return `<div class="cx ${known ? '' : 'unknown'}"><div data-spr="${k}"></div><div><div class="nm">${known ? d.name : '???'}</div><div class="ds">${known ? G.ELEMS[d.elem].name + ' · ' + esc(d.desc) : 'Non ancora incontrato.'}</div></div></div>`;
      }).join('') + '</div>';
    } else if (tab === 'imprese') {
      const rows = G.HERO_ORDER.map(id => {
        const d = G.HEROES[id], un = meta.unlocked[id];
        return `<div class="cx ${un ? '' : 'unknown2'}"><div data-spr="${id}"></div><div><div class="nm">${un ? '✔ ' : ''}${d.name} — ${d.title}</div><div class="ds">${un ? 'Sbloccato.' : esc(d.unlock || '')}</div></div></div>`;
      }).join('');
      const regs = G.BIOMES.map(b => `<span class="regchip ${meta.regions[b.id] ? 'on' : ''}" style="border-color:${b.colors.accent}">${meta.regions[b.id] ? b.name : '???'}</span>`).join('');
      body = `<div class="codex">${rows}</div><h3 style="font-family:'Press Start 2P';font-size:11px;color:#e0b44a;margin:14px 0 6px">Regioni esplorate</h3><div class="regs">${regs}</div>
        <p class="sub">Eclissi sbloccata: ${meta.maxEclissi} / 5 · Essenza totale guadagnata: ${meta.essenceTotal || 0} ✦</p>`;
    } else if (tab === 'reliquie') {
      body = '<div class="codex">' + G.RELICS.map(r => {
        const known = meta.relics[r.id];
        const tg = r.tag ? G.SYNERGIES[r.tag] : null;
        return `<div class="cx ${known ? '' : 'unknown'}"><div data-rel="${r.id}"></div><div><div class="nm" style="color:${G.RARITY[r.rarity].color}">${known ? r.name : '???'}${tg ? ` <span style="color:${tg.color}">${tg.glyph}</span>` : ''}</div><div class="ds">${known ? esc(r.desc) : G.RARITY[r.rarity].name + (G.relicAvailable(r) ? '' : ' · da sbloccare nel Santuario')}</div></div></div>`;
      }).join('') + '</div>';
    } else {
      body = '<div style="text-align:left">' + (meta.history.length ? meta.history.map(h => `<div style="margin:4px 0">${h.win ? '👑' : '☠'} <b style="color:#ffe9a0">${G.HEROES[h.hero].name}</b> — ${h.win ? 'VITTORIA' : 'piano ' + h.floor} · livello ${h.level} · ${h.kills} nemici${h.ecl ? ' · ' + G.ECLISSI[h.ecl].name : ''}${h.daily ? ' · Sfida ' + h.daily : ''} <span style="color:#a89cb8">(${h.date})</span></div>`).join('') : '<p>Nessuna partita ancora.</p>') +
        `<p style="color:#a89cb8;margin-top:14px">Nemici sconfitti in totale: ${meta.totalKills} · Boss sconfitti: ${Object.keys(meta.bosses).map(k => G.MON[k].name + ' ×' + meta.bosses[k]).join(', ') || 'nessuno'}</p></div>`;
    }
    const html = `<h2>Codex di Gorm</h2><div class="tabs"><button class="btn small ${tab === 'mostri' ? 'gold' : ''}" data-t="mostri">Bestiario</button><button class="btn small ${tab === 'reliquie' ? 'gold' : ''}" data-t="reliquie">Reliquie</button><button class="btn small ${tab === 'imprese' ? 'gold' : ''}" data-t="imprese">Imprese</button><button class="btn small ${tab === 'storia' ? 'gold' : ''}" data-t="storia">Cronache</button></div>${body}<div class="mfoot"><button class="btn" id="ok">Indietro</button></div>`;
    const s = $('#screen');
    s.innerHTML = `<div class="menu-bg"></div><div class="mbox panel" style="position:relative;z-index:2;width:min(1100px,94vw)">${html}</div>`;
    UI.state = 'sub';
    s.querySelectorAll('[data-spr]').forEach(el => el.replaceWith(spriteCanvas(el.dataset.spr)));
    s.querySelectorAll('[data-rel]').forEach(el => el.replaceWith(iconCanvas(relicImg(el.dataset.rel))));
    s.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { G.audio.play('click'); UI.showCodex(b.dataset.t); });
    $('#ok').onclick = () => UI.showTitle();
  };

  // ---------------------------------------------------------------- fine partita
  UI.showEnd = function () {
    const R = G.run; if (!R || UI.state === 'end') return;
    UI.state = 'end';
    G.Input && G.Input.cancelAuto && G.Input.cancelAuto();
    R.stats.playMs = Date.now() - R.stats.startTime;
    G.meta.endRun(R);
    const win = R.over && R.over.win;
    G.audio.music.set(win ? 'victory' : 'defeat');
    const h = R.hero;
    const mins = Math.floor(R.stats.playMs / 60000), secs = Math.floor(R.stats.playMs / 1000) % 60;
    let unl = '';
    for (const u of [...new Set(R.newUnlocks || [])]) {
      if (G.HEROES[u]) unl += `<div class="unlock">★ NUOVO EROE: ${G.HEROES[u].name}, ${G.HEROES[u].title}!</div>`;
      else if (u.startsWith('eclissi')) unl += `<div class="unlock">★ SBLOCCATA: ${G.ECLISSI[+u.slice(7)].name}!</div>`;
    }
    if (R.essenceGained) unl += `<div class="unlock" style="color:#d8b0ff">✦ +${R.essenceGained} Essenza per il Santuario del Saggio (totale ${G.meta.data.essence})</div>`;
    setTimeout(() => {
      const m = openModal(`<div class="endbox">
        <div class="big" style="color:${win ? '#ffe27a' : '#ff6a5a'}">${win ? 'GORM È SALVA!' : 'SEI CADUTO'}</div>
        <div style="font-size:22px;color:#d8d0e0">${win ? `${h.name} ha sconfitto Magor e restituito le Pietre di Gorm ai Popoli della Natura.` : `${h.name} è stato sconfitto da ${esc(R.over.cause || '???')} — ${G.biomeOf(R.floor).name}, piano ${R.floor}.`}</div>
        ${unl}
        <div class="stats">
          <div>Livello raggiunto <b>${h.level}</b></div><div>Piano raggiunto <b>${R.floor}/${G.TOTAL_FLOORS}</b></div>
          <div>Nemici sconfitti <b>${R.stats.kills}</b></div><div>Guardiani sconfitti <b>${R.stats.bosses}</b></div>
          <div>Danni inflitti <b>${R.stats.dmgDealt}</b></div><div>Danni subiti <b>${R.stats.dmgTaken}</b></div>
          <div>Reliquie <b>${h.relics.length}</b></div><div>Frammenti raccolti <b>${R.stats.gold}</b></div>
          <div>Turni <b>${R.turn}</b></div><div>Tempo <b>${mins}:${String(secs).padStart(2, '0')}</b></div>
          <div>Campioni battuti <b>${R.stats.champions || 0}</b></div><div>Segreti trovati <b>${R.stats.secrets || 0}</b></div>
        </div>
        <div style="color:#a89cb8;font-size:19px">Percorso: ${(R.route || []).filter(Boolean).slice(0, G.regionOf(R.floor) + 1).map(id => G.BIOME_BY_ID[id].name).join(' → ')}</div>
        <div class="mfoot"><button class="btn gold" id="again">Nuova partita</button><button class="btn" id="menu">Menu principale</button></div></div>`, { type: 'end', enter: () => $('#again').click() });
      $('#again').onclick = () => { closeModal(); G.run = null; UI.showSelect(); };
      $('#menu').onclick = () => { closeModal(); G.run = null; UI.showTitle(); };
    }, win ? 1800 : 1200);
  };

  // ================================================================
  //  SCHEDA DELL'EROE
  // ================================================================
  UI.showBuild = function () {
    const R = G.run; if (!R) return;
    const h = R.hero, m = h.mods;
    const pct = (v) => Math.round(v * 100) + '%';
    const stats = [
      ['Punti Vita', h.hp + ' / ' + h.maxHp], ['Danno', (h.atk[0] + m.dmg) + '-' + (h.atk[1] + m.dmg) + (m.dmgMul !== 1 ? ' (×' + m.dmgMul.toFixed(2) + ')' : '')],
      ['Armatura', G.effDef(h)], ['Schivata', h.eva], ['Critico', h.crit + '% ×' + h.critMul.toFixed(2)], ['Velocità', h.speed],
      ['Furto vita', pct(m.lifesteal)], ['Rigenerazione', (m.regen ? (m.regen).toFixed(2) + ' PV/turno' : '—')], ['Esperienza', '×' + m.xpMul.toFixed(2)],
      ['Frammenti', '×' + m.goldMul.toFixed(2)], ['Gittata extra', '+' + m.rangeBonus], ['Ricariche', m.cdr ? '−' + m.cdr : '—'], ['Furia per Potere', G.ultCost(h)],
    ];
    const skills = h.skills.map((s, i) => { const d = G.SKILLS[s.id]; return `<div class="skill-row"><div class="g" data-sicon="${s.id}"></div><div><b>[${G.KEYS.primary('skill' + (i + 1))}] ${d.name}</b> <small>${d.ult ? '(Furia ' + G.ultCost(h) + ')' : '(ricarica ' + G.skillCd(h, s.id) + ')'}</small><br><small>${esc(d.desc(h))}</small></div></div>`; }).join('');
    const perks = Object.keys(h.perks).map(id => { const p = G.PERK_BY_ID[id], tg = p.tag ? G.SYNERGIES[p.tag] : null; return `<div class="bl">${tg ? `<span style="color:${tg.color}">${tg.glyph}</span> ` : ''}<b>${p.name}</b>${h.perks[id] > 1 ? ' ×' + h.perks[id] : ''}<br><small>${esc(p.desc)}</small></div>`; }).join('') || '<div class="sub">Nessun dono ancora.</div>';
    const relics = h.relics.map(id => { const r = G.RELIC_BY_ID[id], tg = r.tag ? G.SYNERGIES[r.tag] : null; return `<div class="bl" data-relic="${id}"><span style="color:${G.RARITY[r.rarity].color}">${r.name}</span>${tg ? ` <span style="color:${tg.color}">${tg.glyph}</span>` : ''}<br><small>${esc(r.desc)}</small></div>`; }).join('') || '<div class="sub">Nessuna reliquia ancora.</div>';
    const cnt = G.synCounts(h);
    const syns = G.SYN_ORDER.map(t => { const S = G.SYNERGIES[t], n = cnt[t] || 0, lv = G.synLevel(h, t); return `<div class="bl synrow lv${lv}"><b style="color:${S.color}">${S.glyph} ${S.name}</b> <span class="sub">${n}/4</span><br><small class="${lv >= 1 ? 'on' : ''}">(2) ${esc(S.t1)}</small><br><small class="${lv >= 2 ? 'on' : ''}">(4) ${esc(S.t2)}</small></div>`; }).join('');
    const md = openModal(`<h2>${h.name} — livello ${h.level}</h2><div class="sub">${G.HEROES[h.heroId].title} · ${G.biomeOf(R.floor).name}, piano ${R.floor}</div>
      <div class="build">
        <div><h3>Statistiche</h3><div class="bstats">${stats.map(s => `<div>${s[0]}<b>${s[1]}</b></div>`).join('')}</div><h3>Abilità</h3>${skills}</div>
        <div><h3>Doni del Saggio</h3>${perks}<h3>Reliquie (${h.relics.length})</h3>${relics}</div>
        <div><h3>Risonanze</h3>${syns}</div>
      </div><div class="mfoot"><button class="btn gold" id="ok">Chiudi (${G.KEYS.primary('build')})</button></div>`, { type: 'build', esc: () => closeModal(), enter: () => closeModal() });
    md.querySelectorAll('[data-sicon]').forEach(el => el.appendChild(iconCanvas(G.skillIcon(el.dataset.sicon))));
    $('#ok').onclick = () => closeModal();
  };

  // ================================================================
  //  SANTUARIO DEL SAGGIO (meta-progressione: varietà, non potenza)
  // ================================================================
  G.SANCTUARY = [
    { id: 'pack_tempesta', name: 'Arsenale della Tempesta', cost: 60, desc: 'Aggiunge 3 reliquie al bottino: Lama del Vento, Sigillo del Predatore, Ampolla del Fulmine.' },
    { id: 'pack_roscamar', name: 'Segreti di Roscamar', cost: 60, desc: 'Aggiunge 3 reliquie al bottino: Brace Eterna, Lanterna di Lavion, Guscio di Crabs.' },
    { id: 'pack_razzle', name: 'Tesori di Razzle', cost: 80, desc: 'Aggiunge 3 reliquie al bottino: Corno di Guerra, Moneta di Razzle, Clessidra Spezzata.' },
    { id: 'racconti', name: 'Racconti di Gorm', cost: 70, desc: 'Aggiunge 5 nuovi eventi: l\'Altare degli Elementi, il Ponte di corde, il Nido, il Viandante, il Germoglio dorato.' },
    { id: 'bisaccia', name: 'Bisaccia del Viandante', cost: 40, desc: 'Inizi ogni partita con una Pozione di Linfa in più.' },
    { id: 'scorta', name: 'Scorta di Frammenti', cost: 40, desc: 'Inizi ogni partita con 25 Frammenti.' },
    { id: 'reroll', name: 'Pergamena del Destino', cost: 90, desc: 'Una volta per partita puoi rimescolare i Doni offerti al level-up.' },
    { id: 'primo_dono', name: 'Il Primo Dono', cost: 120, desc: 'All\'inizio di ogni partita scegli subito un Dono del Saggio.' },
  ];
  UI.showSanctuary = function () {
    const meta = G.meta.data;
    const items = G.SANCTUARY.map(s => {
      const own = meta.purchases[s.id];
      return `<div class="sitem ${own ? 'sold' : ''} ${!own && meta.essence < s.cost ? 'poor' : ''}" data-id="${s.id}"><div class="sanc-ic">${own ? '✔' : '✦'}</div><div><div class="nm">${s.name}</div><div class="ds">${esc(s.desc)}</div></div><div class="price">${own ? 'OTTENUTO' : s.cost + ' ✦'}</div></div>`;
    }).join('');
    const s = $('#screen');
    s.innerHTML = `<div class="menu-bg"></div><div class="mbox panel" style="position:relative;z-index:2;width:min(1000px,94vw)"><h2>Santuario del Saggio</h2>
      <div class="sub">"Ogni viaggio, anche quello finito male, lascia un'Essenza. Usala per rendere i prossimi viaggi più vari." — Hai <b style="color:#d8b0ff">${meta.essence} ✦</b> (guadagnata in totale: ${meta.essenceTotal || 0})</div>
      <div class="shop">${items}</div>
      <p class="sub" style="margin-top:12px">L'Essenza si ottiene alla fine di ogni partita: piani raggiunti, guardiani sconfitti, nemici abbattuti e vittorie.</p>
      <div class="mfoot"><button class="btn" id="ok">Indietro</button></div></div>`;
    UI.state = 'sub';
    s.querySelectorAll('.sitem').forEach(el => el.onclick = () => {
      const it = G.SANCTUARY.find(x => x.id === el.dataset.id);
      if (meta.purchases[it.id]) return;
      if (meta.essence < it.cost) { G.audio.play('miss'); return; }
      meta.essence -= it.cost; meta.purchases[it.id] = true; G.meta.save();
      G.audio.play('relic'); UI.showSanctuary();
    });
    $('#ok').onclick = () => UI.showTitle();
  };

  // ================================================================
  //  COMANDI PERSONALIZZABILI
  // ================================================================
  UI.showKeys = function (inGame) {
    const K = G.KEYS;
    const rows = K.actions.map(a => `<div class="keyrow"><span>${a.label}</span><button class="btn small" data-k="${a.id}">${esc(K.label(K.codes[a.id][0]))}</button><span class="sub">${K.codes[a.id].slice(1).map(K.label).join(', ')}</span></div>`).join('');
    const html = `<h2>Comandi</h2><div class="sub">Clicca un comando e premi il nuovo tasto (Esc annulla). Esc apre sempre il menu.</div><div class="keys">${rows}</div>
      <div class="mfoot"><button class="btn" id="kreset">Ripristina predefiniti</button><button class="btn gold" id="kok">Fatto</button></div>`;
    const back = () => { UI.keyCapture = null; if (inGame || UI.state === 'game') { closeModal(); if (G.run) UI.buildActionBar(), UI.refresh(); } else UI.showOptions(); };
    if (inGame || UI.state === 'game') openModal(html, { type: 'keys', esc: back });
    else { $('#screen').innerHTML = `<div class="menu-bg"></div><div class="mbox panel" style="position:relative;z-index:2;width:min(900px,94vw)">${html}</div>`; UI.state = 'sub'; }
    const root = (inGame || UI.state === 'game') ? $('#modal') : $('#screen');
    root.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      b.textContent = 'Premi un tasto…'; b.classList.add('gold');
      UI.keyCapture = (e) => {
        UI.keyCapture = null;
        if (e.code !== 'Escape') { K.assign(b.dataset.k, e.code); G.audio.play('select'); }
        UI.showKeys(inGame);
      };
    });
    $('#kreset').onclick = () => { K.reset(); UI.showKeys(inGame); };
    $('#kok').onclick = back;
  };

  // ================================================================
  //  ESPORTA / IMPORTA PROGRESSI
  // ================================================================
  UI.exportSave = function () {
    try {
      if (G.run && !G.run.over && UI.state === 'game') G.save();
      const data = { format: 'gormiti-progressi', v: 1, date: new Date().toISOString(), meta: localStorage.getItem(G.STORE_KEYS.meta), run: localStorage.getItem(G.STORE_KEYS.run) };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'gormiti-progressi-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) { G.showError(e); }
  };
  UI.importSave = function () {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const d = JSON.parse(rd.result);
          if (d.format !== 'gormiti-progressi' || !d.meta) throw new Error('File non valido');
          localStorage.setItem(G.STORE_KEYS.meta, d.meta);
          if (d.run) localStorage.setItem(G.STORE_KEYS.run, d.run); else localStorage.removeItem(G.STORE_KEYS.run);
          G.meta.load(); G.KEYS.load(); G.audio.applyVolumes();
          G.run = null; closeModal(); UI.showTitle();
          UI.banner('Progressi importati', 'Bentornato, Signore della Natura!');
        } catch (e) { alert('Impossibile importare: ' + e.message); }
      };
      rd.readAsText(f);
    };
    inp.click();
  };

  // ---------------------------------------------------------------- suggerimento mira
  UI.setTargetHint = function (text) {
    const el = $('#target-hint');
    if (!text) { el.classList.add('hidden'); return; }
    el.innerHTML = text; el.classList.remove('hidden');
  };

  // callback dal motore
  G.ui = new Proxy({
    onLog() { }, onFloor(r) { UI.onFloor(r); }, banner(t, s) { UI.banner(t, s); }, onBossIntro(b) { UI.onBossIntro(b); },
  }, { get: (t, k) => t[k] || (() => {}) });
})();

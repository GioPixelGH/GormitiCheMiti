'use strict';
// ============================================================
//  game.js : stato partita, entità, combattimento, turni
// ============================================================
(function () {
  const U = G.U, T = G.T;
  G.run = null;

  // ---------------- Mappa ----------------
  G.inb = (x, y) => { const m = G.run.map; return x >= 0 && y >= 0 && x < m.w && y < m.h; };
  G.tileAt = (x, y) => (G.inb(x, y) ? G.run.map.t[y * G.run.map.w + x] : T.WALL);
  G.setTile = (x, y, t) => { if (G.inb(x, y)) { G.run.map.t[y * G.run.map.w + x] = t; G.run.mapDirty = true; } };
  G.tileInfo = (x, y) => G.TILE[G.tileAt(x, y)];
  G.isOpaque = (x, y) => !G.inb(x, y) || G.TILE[G.tileAt(x, y)].opaque;
  G.isSolid = (x, y) => !G.inb(x, y) || G.TILE[G.tileAt(x, y)].solid;
  G.visible = (x, y) => G.inb(x, y) && G.run.vis[y * G.run.map.w + x] === 1;
  G.fireAt = (x, y) => G.inb(x, y) ? G.run.map.fire[y * G.run.map.w + x] : 0;

  // ---------------- Messaggi ----------------
  G.log = function (text, cls) {
    const R = G.run; if (!R) return;
    const last = R.log[R.log.length - 1];
    if (last && last.text === text) { last.count = (last.count || 1) + 1; last.turn = R.turn; G.ui.onLog && G.ui.onLog(); return; }
    R.log.push({ text, cls: cls || 'info', turn: R.turn });
    if (R.log.length > 120) R.log.shift();
    G.ui.onLog && G.ui.onLog();
  };

  // suggerimenti mostrati una sola volta
  G.hint = function (key, text) {
    const md = G.meta && G.meta.data;
    if (!md) return;
    md.hints = md.hints || {};
    if (md.hints[key]) return;
    md.hints[key] = true;
    G.log('💡 ' + text, 'level');
    G.meta.save();
  };

  // ---------------- Entità ----------------
  G.entityAt = function (x, y) {
    for (const e of G.run.ents) if (!e.dead && e.x === x && e.y === y) return e;
    return null;
  };
  G.featureAt = function (x, y) {
    for (const f of G.run.features) if (f.x === x && f.y === y && !f.gone) return f;
    return null;
  };
  G.hostile = (a, b) => a.faction !== b.faction;
  G.livingEnemiesOf = function (e) { return G.run.ents.filter(o => !o.dead && G.hostile(o, e)); };
  G.enemiesInRadius = function (x, y, r, ofEnt) {
    return G.run.ents.filter(o => !o.dead && G.hostile(o, ofEnt) && U.inRadius(x, y, o.x, o.y, r));
  };
  G.visibleEnemies = function () {
    const h = G.run.hero;
    return G.run.ents.filter(o => !o.dead && o.faction === 'enemy' && G.visible(o.x, o.y) && !G.isHiddenMonster(o));
  };
  G.isHiddenMonster = (m) => !!(m.status.invis || (m.flags.lurker && m.st.mode !== 'hunt' && U.cheb(m.x, m.y, G.run.hero.x, G.run.hero.y) > 2));

  G.newEntityBase = function () {
    return {
      id: G.run.nextId++, x: 0, y: 0, hp: 1, maxHp: 1, atk: [1, 2], def: 0, eva: 0, acc: 90, crit: 5, critMul: 1.6,
      speed: 100, energy: 0, elem: 'neutro', sight: 8, status: {}, flags: {}, cds: {}, st: {}, dead: false,
    };
  };

  // Creazione mostri, con scalatura per piano/Eclissi
  G.makeMonster = function (type, x, y, opts) {
    opts = opts || {};
    const R = G.run, d = G.MON[type];
    if (!d) throw new Error('Mostro sconosciuto: ' + type);
    const fl = G.floorInRegion(R.floor), ecl = R.eclissi;
    const isBoss = d.flags && d.flags.boss;
    let hpMul = (isBoss ? 1 : 1 + 0.12 * (fl - 1)) * 1.2, dmgMul = (isBoss ? 1 : 1 + 0.06 * (fl - 1)) * 1.18;
    if (ecl >= 1) hpMul *= 1.2;
    if (ecl >= 2) dmgMul *= 1.1;
    if (ecl >= 3) dmgMul *= 1.15;
    if (d.flags && d.flags.boss && ecl >= 5) { hpMul *= 1.3; dmgMul *= 1.1; }
    const reg = G.regionOf(R.floor);
    if (!isBoss && reg >= 2) { hpMul *= 1 + 0.1 * (reg - 1); dmgMul *= 1 + 0.07 * (reg - 1); }
    if (opts.summon) { hpMul = 1; dmgMul = ecl >= 3 ? 1.15 : 1; }
    const e = G.newEntityBase();
    Object.assign(e, {
      kind: 'monster', type, name: d.name, faction: opts.faction || 'enemy', x, y,
      maxHp: Math.round(d.hp * hpMul), atk: [Math.max(1, Math.round(d.atk[0] * dmgMul)), Math.max(1, Math.round(d.atk[1] * dmgMul))],
      def: d.def || 0, eva: d.eva || 0, acc: d.acc || 88, crit: d.crit || 5, critMul: 1.5,
      speed: d.speed || 100, elem: d.elem || 'neutro', sight: d.sight || 8, ai: d.ai || 'melee',
      flags: Object.assign({}, d.flags || {}), xp: d.xp || 1, dmgMul,
    });
    e.hp = e.maxHp;
    e.energy = R.rng.int(0, 90);
    e.st = { mode: opts.awake ? 'hunt' : (R.rng.chance(d.flags && d.flags.alwaysAwake ? 0 : 0.55) ? 'sleep' : 'wander') };
    if (opts.awake || (d.flags && d.flags.alwaysAwake)) { e.st.mode = 'hunt'; e.st.lx = R.hero ? R.hero.x : x; e.st.ly = R.hero ? R.hero.y : y; }
    if (opts.life) e.status.summon = { t: opts.life, p: 0 };
    if (d.init) d.init(e);
    R.ents.push(e);
    return e;
  };

  // ---------------- Movimento e terreno ----------------
  G.canWalk = function (e, x, y) {
    if (!G.inb(x, y)) return false;
    const t = G.tileAt(x, y), info = G.TILE[t];
    if (info.solid) return !!(e.flags.phase && x > 0 && y > 0 && x < G.run.map.w - 1 && y < G.run.map.h - 1);
    if (e.flags.fly) return true;
    if (t === T.DEEP) return !!e.flags.swim;
    return info.walk;
  };
  G.canEnter = function (e, x, y) {
    return G.canWalk(e, x, y) && !G.entityAt(x, y) && !G.featureAt(x, y);
  };
  G.trapAt = function (x, y) { for (const t of G.run.traps) if (t.x === x && t.y === y && !t.gone) return t; return null; };
  // pericoloso per l'IA (da evitare se possibile)
  G.isHazardFor = function (e, x, y) {
    const t = G.tileAt(x, y);
    if (e.flags.fly) return false;
    if (t === T.LAVA && !e.flags.fireImmune) return true;
    if (t === T.CHASM) return true;
    if (G.fireAt(x, y) > 0 && !e.flags.fireImmune) return true;
    if (e.kind === 'monster' && G.trapAt(x, y)) return true;
    return false;
  };

  G.moveTo = function (e, x, y, opts) {
    const ox = e.x, oy = e.y;
    e.x = x; e.y = y;
    G.fx.move(e, ox, oy, opts || {});
    if (e.kind === 'hero') G.run.distMapsDirty = true;
    G.onEnter(e, opts || {});
  };

  G.onEnter = function (e, opts) {
    const R = G.run, t = G.tileAt(e.x, e.y);
    if (t === T.DOOR) { G.setTile(e.x, e.y, T.DOOR_OPEN); G.fx.sound('door'); }
    if (!e.flags.fly) {
      if (t === T.SHALLOW) { G.addStatus(e, 'wet', 3); delete e.status.burn; }
      else if (t === T.DEEP) { G.addStatus(e, 'wet', 5); delete e.status.burn; }
      else if (t === T.LAVA && !e.flags.fireImmune) {
        G.dealDamage(null, e, 5 + 4 * G.regionOf(R.floor), { elem: 'fuoco', pierce: true, src: 'lava' });
        if (!e.dead) G.addStatus(e, 'burn', 3, 2 + G.regionOf(R.floor));
        if (e.kind === 'hero') G.log('La lava ti ustiona!', 'bad');
      } else if (t === T.CHASM) { G.fall(e); return; }
      const trap = G.trapAt(e.x, e.y);
      if (trap) G.triggerTrap(trap, e);
    }
    if (e.dead) return;
    if (G.fireAt(e.x, e.y) > 0 && !e.flags.fireImmune && !e.status.wet) G.addStatus(e, 'burn', 3, 2 + G.regionOf(R.floor));
    if (e.kind === 'hero') G.heroEnter(e);
  };

  G.fall = function (e) {
    const R = G.run;
    G.fx.sound('fall');
    if (e.kind === 'hero') {
      if (G.isBossFloor(R.floor) || R.floor >= G.TOTAL_FLOORS) {
        // nelle arene il vento ti riporta su
        const dmg = Math.round(e.maxHp * 0.12);
        G.log('Precipiti nel vuoto... una raffica ti riporta sulla roccia!', 'bad');
        G.dealDamage(null, e, dmg, { pierce: true, src: 'caduta' });
        const spot = G.randomFreeTile(e, 6);
        if (spot && !e.dead) { e.x = spot[0]; e.y = spot[1]; G.fx.teleport(e); R.distMapsDirty = true; }
        return;
      }
      G.log('Precipiti nel baratro fino al piano inferiore!', 'bad');
      const dmg = Math.round(e.maxHp * 0.12);
      e.hp = Math.max(1, e.hp - dmg);
      R.stats.falls = (R.stats.falls || 0) + 1;
      R.pendingDescend = { fell: true };
    } else {
      if (e.flags.boss) { // i boss non cadono
        const spot = G.randomFreeTile(e, 4); if (spot) { e.x = spot[0]; e.y = spot[1]; }
        return;
      }
      G.log(e.name + ' precipita nel baratro!', 'good');
      G.kill(e, R.hero, { noDrop: true, fell: true });
    }
  };

  G.randomFreeTile = function (e, nearR) {
    const R = G.run;
    const cands = [];
    for (let y = 1; y < R.map.h - 1; y++) for (let x = 1; x < R.map.w - 1; x++) {
      if (nearR && U.cheb(x, y, e.x, e.y) > nearR) continue;
      if (G.canEnter(e, x, y) && !G.isHazardFor(e, x, y) && G.tileAt(x, y) !== T.CHASM && G.tileAt(x, y) !== T.LAVA) cands.push([x, y]);
    }
    if (!cands.length) return nearR ? G.randomFreeTile(e, 0) : null;
    return R.rng.pick(cands);
  };

  // ---------------- Stati alterati ----------------
  G.NEG_STATUS = ['burn', 'poison', 'stun', 'root', 'slow', 'confuse', 'blind', 'weak', 'vuln', 'freeze'];
  G.STATUS_INFO = {
    burn: { name: 'Ustione', color: '#ff7a2a', desc: 'Subisce danni da fuoco ogni turno.' },
    poison: { name: 'Veleno', color: '#9be35a', desc: 'Subisce ogni turno danni pari al valore del veleno, che poi cala di 1. Si accumula.' },
    wet: { name: 'Bagnato', color: '#5ab0ff', desc: 'Immune alle ustioni; i fulmini infliggono danni doppi.' },
    stun: { name: 'Stordito', color: '#ffe066', desc: 'Salta il turno.' },
    freeze: { name: 'Congelato', color: '#bff4ff', desc: 'Intrappolato nel ghiaccio: salta il turno.' },
    root: { name: 'Radicato', color: '#5fbf3a', desc: 'Non può muoversi.' },
    slow: { name: 'Rallentato', color: '#8899bb', desc: 'Agisce a metà velocità.' },
    haste: { name: 'Rapido', color: '#ffffff', desc: 'Agisce più velocemente.' },
    confuse: { name: 'Confuso', color: '#ff9ef0', desc: 'Si muove a caso.' },
    blind: { name: 'Accecato', color: '#dddddd', desc: 'Precisione e vista ridotte.' },
    weak: { name: 'Indebolito', color: '#bb8866', desc: 'Infligge il 30% di danni in meno.' },
    vuln: { name: 'Vulnerabile', color: '#ff4466', desc: 'Subisce il 40% di danni in più.' },
    shield: { name: 'Scudo', color: '#9fd0ff', desc: 'Assorbe danni.' },
    thorns: { name: 'Spine', color: '#7be04a', desc: 'Chi lo colpisce in mischia subisce danni e veleno.' },
    regen: { name: 'Rigenerazione', color: '#6effa0', desc: 'Recupera PV ogni turno.' },
    invis: { name: 'Invisibile', color: '#b0b0ff', desc: 'I nemici non possono vederlo.' },
    rage: { name: 'Ira', color: '#ff3030', desc: 'Infligge il 50% di danni in più.' },
    stoneskin: { name: 'Pelle di Pietra', color: '#c8a070', desc: 'Armatura aumentata.' },
    darkness: { name: 'Oscurità', color: '#6a4aa0', desc: 'La vista è ridotta.' },
    summon: { name: 'Evocato', color: '#a0ffa0', desc: 'Svanirà dopo alcuni turni.' },
    primed: { name: 'Innescato', color: '#ff2020', desc: 'Sta per esplodere!' },
    tenacity: { name: 'Tenacia', color: '#ffd080', desc: 'Immune a stordimento e congelamento.' },
  };

  G.addStatus = function (e, name, t, p) {
    if (e.dead) return;
    const h = G.run.hero;
    if (name === 'burn' && (e.status.wet || e.flags.fireImmune || e.heroId === 'tasarau')) return;
    if ((name === 'stun' || name === 'freeze') && (e.status.tenacity || e.flags.noStun)) return;
    if (name === 'poison' && e.flags.poisonImmune) return;
    if (e.kind === 'hero' && G.NEG_STATUS.includes(name)) {
      if ((name === 'stun' || name === 'freeze') && e.mods.stunImmune) return;
      if (e.mods.statusResist) t = Math.max(1, Math.ceil(t * (1 - e.mods.statusResist)));
    }
    if (e.flags.boss && ['stun', 'freeze', 'root', 'confuse'].includes(name)) t = Math.max(1, Math.floor(t / 2));
    const cur = e.status[name];
    if (name === 'poison') {
      // il veleno si accumula
      // veleno decrescente: infligge p danni e cala di 1 a turno
      if (cur) cur.p = Math.min(cur.p + (p || 1), 15);
      else e.status[name] = { t: 99, p: p || 1 };
    } else if (name === 'shield') {
      if (cur) { cur.p += p; cur.t = Math.max(cur.t, t); } else e.status[name] = { t, p };
    } else {
      if (cur) { cur.t = Math.max(cur.t, t); cur.p = Math.max(cur.p || 0, p || 0); }
      else e.status[name] = { t, p: p || 0 };
    }
    if (name === 'wet') delete e.status.burn;
    if (e.kind === 'monster' && (name === 'stun' || name === 'freeze') && e.flags.boss) e.st.tenacityNext = true;
    G.fx.status(e, name);
  };
  G.cleanse = function (e) { for (const n of G.NEG_STATUS) delete e.status[n]; };

  // Inizio del turno di un'entità: DOT, durate. Ritorna false se non può agire.
  G.startTurn = function (e) {
    const R = G.run, s = e.status;
    let canAct = true;
    if (s.stun || s.freeze) canAct = false;
    // danni nel tempo
    if (s.burn) {
      if (G.tileAt(e.x, e.y) === T.SHALLOW || G.tileAt(e.x, e.y) === T.DEEP) delete s.burn;
      else G.dealDamage(s.burn.src || null, e, s.burn.p || 2, { elem: 'fuoco', pierce: true, dot: true, src: 'burn' });
    }
    if (e.dead) return false;
    if (s.poison) {
      G.dealDamage(null, e, s.poison.p, { pierce: true, dot: true, src: 'poison', color: '#9be35a' });
      if (s.poison) { s.poison.p -= 1; s.poison.t = 99; if (s.poison.p <= 0) delete s.poison; }
    }
    if (e.dead) return false;
    if (s.regen) G.heal(e, s.regen.p, true);
    // durate
    for (const k in s) {
      if (k === 'shield' && s[k].p <= 0) { delete s[k]; continue; }
      s[k].t -= 1;
      if (s[k].t <= 0) {
        delete s[k];
        if (k === 'summon') { G.log(e.name + ' svanisce.', 'info'); G.kill(e, null, { noXp: true, noDrop: true, vanish: true }); return false; }
        if ((k === 'stun' || k === 'freeze') && e.flags.boss) s.tenacity = { t: 3, p: 0 };
      }
    }
    return canAct;
  };

  G.effSpeed = function (e) {
    let sp = e.speed;
    if (e.status.slow) sp *= 0.5;
    if (e.status.haste) sp *= 1.5;
    if (e.flags.waterFast) { const t = G.tileAt(e.x, e.y); if (t === T.SHALLOW || t === T.DEEP) sp *= 1.6; }
    return sp;
  };
  G.effDef = function (e) {
    let d = e.def;
    if (e.status.stoneskin) d += e.status.stoneskin.p || 4;
    if (e.kind === 'hero' && e.mods.lastStand && e.hp < e.maxHp * 0.3) d += 3;
    if (e.flags.stoneForm && e.st.stone) d += 8;
    return d;
  };

  // ---------------- Combattimento ----------------
  G.rollDmg = function (e) {
    const R = G.run;
    let v = R.rng.int(e.atk[0], e.atk[1]);
    if (e.kind === 'hero') v += e.mods.dmg;
    return v;
  };

  // Attacco base in mischia
  G.attack = function (a, d, opts) {
    opts = opts || {};
    const R = G.run;
    if (d.dead || a.dead) return false;
    G.fx.lunge(a, d.x - a.x, d.y - a.y);
    const sneak = d.kind === 'monster' && d.st.mode === 'sleep';
    let acc = a.acc - d.eva;
    if (a.status.blind) acc -= 40;
    if (d.status.stun || d.status.freeze || d.status.root) acc += 20;
    if (!sneak && !opts.sure && R.rng.int(1, 100) > U.clamp(acc, 10, 98)) {
      G.fx.float(d.x, d.y, 'mancato', '#cccccc');
      G.fx.sound('miss');
      if (d.kind === 'monster') G.alert(d, a);
      return false;
    }
    let crit = sneak || R.rng.int(1, 100) <= a.crit;
    const base = G.rollDmg(a) * (opts.mult || 1);
    if (sneak && a.kind === 'hero') G.log('Colpo a sorpresa!', 'good');
    const dealt = G.dealDamage(a, d, base, { crit, melee: true, elem: a.elem });
    // effetti al colpo
    if (!d.dead && dealt > 0) G.onHitEffects(a, d, dealt);
    return true;
  };

  G.onHitEffects = function (a, d, dealt) {
    const R = G.run;
    if (a.kind === 'monster') {
      const md = G.MON[a.type];
      if (md && md.onHit) md.onHit(a, d, dealt);
    } else if (a.kind === 'hero') {
      const m = a.mods;
      if (m.poisonOnHit) G.addStatus(d, 'poison', 4, m.poisonOnHit);
      if (a.status.thorns) G.addStatus(d, 'poison', 4, 1);
      if (m.burnOnHit && R.rng.chance(m.burnOnHit)) G.addStatus(d, 'burn', 3, 2 + G.regionOf(R.floor));
      if (m.chainEvery) {
        a.st.hitCount = (a.st.hitCount || 0) + 1;
        if (a.st.hitCount % m.chainEvery === 0) G.SK_HELP.chainLightning(a, d, G.rollDmg(a) * 0.8, 2, 'Anello Tempesta');
      }
    }
  };

  // Danno generico: src può essere null (ambiente)
  G.dealDamage = function (src, tgt, base, opts) {
    opts = opts || {};
    const R = G.run;
    if (!tgt || tgt.dead) return 0;
    let dmg = base;
    const hero = R.hero;
    const elem = opts.elem || (src ? src.elem : null);
    if (opts.crit) dmg *= (src ? src.critMul : 1.6);
    let em = 1;
    if (elem && !opts.dot) {
      em = G.elemMult(elem, tgt.elem, src && src.kind === 'hero' ? src.mods.elemStrong : 1.5);
      if (src && src.kind === 'hero' && em < 1 && src.mods.noElemWeak) em = 1;
      if (tgt.kind === 'hero' && em > 1) em = tgt.mods.noElemWeak ? 1.2 : 1.35;
      dmg *= em;
    }
    if (elem === 'fuoco' && tgt.status.wet && !opts.dot) dmg *= 0.6;
    if (src && src.kind === 'hero' && !opts.dot) {
      const m = src.mods;
      dmg *= m.dmgMul;
      if (m.execute && tgt.hp < tgt.maxHp * 0.3) dmg *= 1 + m.execute;
      if (m.firstStrike && tgt.hp >= tgt.maxHp) dmg *= 1 + m.firstStrike;
      if (m.eliteDmg && (tgt.flags.elite || tgt.flags.boss)) dmg *= 1 + m.eliteDmg;
      if (src.heroId === 'poivrons' && tgt.status.wet) dmg *= 1.25 + (m.wetBonus || 0);
      if (m.lightBonus && tgt.elem === 'tenebre') dmg *= 1.2;
    }
    if (src && src.kind === 'ally' && hero) dmg *= hero.mods.dmgMul;
    if (src && src.status.rage) dmg *= 1.5;
    if (src && src.status.weak) dmg *= 0.7;
    if (tgt.status.vuln) dmg *= 1.4;
    if (tgt.kind === 'hero' && tgt.mods.dmgTakenMul) dmg *= tgt.mods.dmgTakenMul;
    if (!opts.pierce) {
      const df = G.effDef(tgt);
      dmg = Math.max(dmg * 0.25, dmg - df);
    }
    if (tgt.kind === 'hero' && tgt.mods.flatReduce && !opts.dot) dmg = Math.max(1, dmg - tgt.mods.flatReduce);
    dmg = Math.max(1, Math.round(dmg));
    // scudo
    let absorbed = 0;
    const sh = tgt.status.shield;
    if (sh && sh.p > 0) {
      absorbed = Math.min(sh.p, dmg);
      sh.p -= absorbed; dmg -= absorbed;
      if (sh.p <= 0) delete tgt.status.shield;
    }
    tgt.hp -= dmg;
    const total = dmg + absorbed;
    // furia
    if (src && src.kind === 'hero' && !opts.noFury) G.addFury(src, total * 1.1);
    if (tgt.kind === 'hero' && total > 0) G.addFury(tgt, total * 1.6);
    // statistiche
    if (src && (src.kind === 'hero' || src.kind === 'ally')) R.stats.dmgDealt += total;
    if (tgt.kind === 'hero') { R.stats.dmgTaken += total; R.tookDamageThisTurn = true; }
    // furto vita
    if (src && src.kind === 'hero' && src.mods.lifesteal && !opts.dot && dmg > 0) G.heal(src, Math.max(0, dmg * src.mods.lifesteal), true, true);
    if (src && src.kind === 'monster' && src.flags.drain && opts.melee && dmg > 0) G.heal(src, Math.ceil(dmg * 0.5), true);
    // effetti visivi
    let col = opts.color || (tgt.kind === 'hero' ? '#ff5050' : '#ffffff');
    if (em > 1 && !opts.dot) { col = '#ffd23a'; if (src && src.kind === 'hero') G.hint('elem', 'Colpo efficace! Il tuo elemento è forte contro questo nemico (numeri gialli = danni ×1,5).'); }
    if (em < 1 && !opts.dot) col = '#9aa0aa';
    let label = (absorbed && !dmg) ? ('(' + absorbed + ')') : String(total);
    if (opts.crit) label += '!';
    G.fx.float(tgt.x, tgt.y, label, col, { crit: opts.crit, big: opts.crit || em > 1, delay: opts.delay || 0 });
    if (!opts.dot) { G.fx.hit(tgt, opts.delay || 0); G.fx.sound(opts.crit ? 'crit' : (tgt.kind === 'hero' ? 'hurt' : 'hit')); }
    if (tgt.kind === 'hero' && total >= tgt.maxHp * 0.15) G.fx.shake(4);
    if (opts.crit) G.fx.shake(3);
    // risveglio
    if (tgt.kind === 'monster' && src) G.alert(tgt, src);
    // spine / riflesso
    if (opts.melee && src && !src.dead && !opts.thorns) {
      if (tgt.status.thorns) {
        G.dealDamage(tgt, src, tgt.status.thorns.p, { pierce: true, thorns: true, color: '#7be04a', noFury: true });
        if (!src.dead) G.addStatus(src, 'poison', 3, 1);
      }
      if (tgt.kind === 'hero' && tgt.mods.thorns) G.dealDamage(tgt, src, tgt.mods.thorns, { pierce: true, thorns: true, color: '#7be04a', noFury: true });
      if (tgt.kind === 'hero' && tgt.mods.reflectShield && (tgt.status.shield || absorbed)) G.dealDamage(tgt, src, Math.max(1, Math.round(total * 0.4)), { pierce: true, thorns: true, color: '#c8a070', noFury: true });
      if (tgt.kind === 'monster' && G.MON[tgt.type].thorns) G.dealDamage(tgt, src, G.MON[tgt.type].thorns, { pierce: true, thorns: true, color: '#7be04a' });
    }
    if (tgt.hp <= 0) {
      // ultima speranza (reliquie)
      if (tgt.kind === 'hero') {
        if (tgt.mods.lastHope && !R.lastHopeUsed) {
          R.lastHopeUsed = true; tgt.hp = Math.round(tgt.maxHp * 0.3);
          G.log('La Linfa Eterna ti rianima!', 'good'); G.fx.ring(tgt.x, tgt.y, 3, '#6effa0'); G.fx.sound('heal');
          return total;
        }
        const ri = tgt.relics.indexOf('cuore_gorm');
        if (ri >= 0) {
          tgt.relics.splice(ri, 1); tgt.hp = Math.round(tgt.maxHp * 0.5); G.cleanse(tgt);
          G.log('Il Frammento del Cuore di Gorm si spezza e ti riporta in vita!', 'good');
          G.fx.ring(tgt.x, tgt.y, 4, '#ffe66a'); G.fx.sound('levelup'); G.fx.shake(6);
          return total;
        }
      }
      G.kill(tgt, src, opts);
    } else if (tgt.kind === 'hero' && tgt.mods.lastHope && !R.lastHopeUsed && tgt.hp < tgt.maxHp * 0.25) {
      R.lastHopeUsed = true; G.heal(tgt, tgt.maxHp * 0.3);
      G.log('La Linfa Eterna si risveglia e ti cura!', 'good');
    }
    return total;
  };

  G.heal = function (e, amt, quiet, isLifesteal) {
    if (e.dead) return 0;
    if (isLifesteal) {
      // frazioni accumulate
      e.st.lsAcc = (e.st.lsAcc || 0) + amt;
      amt = Math.floor(e.st.lsAcc); e.st.lsAcc -= amt;
    } else amt = Math.round(amt);
    const before = e.hp;
    e.hp = Math.min(e.maxHp, e.hp + amt);
    const got = e.hp - before;
    if (got > 0 && (!quiet || got >= 3)) G.fx.float(e.x, e.y, '+' + got, '#6eff8a');
    return got;
  };

  G.addFury = function (h, v) {
    if (h.kind !== 'hero') return;
    const before = h.fury;
    h.fury = Math.min(100, h.fury + v * h.mods.furyMul);
    if (before < 100 && h.fury >= 100) { G.log('La tua Furia è al massimo! Premi 4 per scatenare il Potere Supremo.', 'level'); G.fx.sound('ready'); }
  };

  G.kill = function (e, src, opts) {
    opts = opts || {};
    const R = G.run;
    if (e.dead) return;
    e.dead = true; e.hp = 0;
    G.fx.death(e, opts);
    if (e.kind === 'hero') {
      const CAUSE = { burn: 'le ustioni', poison: 'il veleno', lava: 'la lava', trappola: 'una trappola', caduta: 'una caduta nel vuoto', impatto: 'un impatto violento' };
      R.over = { win: false, cause: src ? src.name : (CAUSE[opts.src] || opts.src || 'le ferite') };
      G.log('Sei caduto...', 'bad');
      G.fx.sound('death');
      return;
    }
    if (e.kind === 'monster' && e.faction === 'enemy') {
      const h = R.hero;
      const md = G.MON[e.type];
      if (!opts.vanish) {
        R.stats.kills++;
        R.seenMonsters[e.type] = true;
        if (!opts.vanish && md.onDeath) md.onDeath(e, src);
        if (!opts.noXp && !e.flags.noXp) G.gainXp(h, e.xp);
        if (!opts.vanish && !e.flags.summoned) {
          if (h.mods.killHeal) G.heal(h, h.mods.killHeal, true);
          if (h.mods.killShield) G.addStatus(h, 'shield', 6, h.mods.killShield);
        }
        if (!opts.noDrop && !e.flags.summoned) G.monsterDrop(e);
        if (!opts.fell && !opts.vanish) G.fx.sound(e.flags.boss ? 'bossdie' : 'die');
      }
      if (e.flags.boss && !opts.vanish) G.onBossDeath(e);
      if (e.flags.guardian && !opts.vanish) {
        R.sealed = false;
        G.log('Il sigillo del portale si spezza!', 'good');
      }
    }
    // rimuovi telegrafi del defunto
    R.tele = R.tele.filter(t => !(t.owner === e.id && t.cancelOnDeath !== false));
  };

  G.monsterDrop = function (e) {
    const R = G.run, rng = R.rng, reg = G.regionOf(R.floor);
    if (e.flags.elite) {
      G.dropItem(e.x, e.y, { kind: 'gold', n: rng.int(15, 25) * (1 + reg) });
      if (rng.chance(0.6)) G.dropItem(e.x, e.y, { kind: 'item', id: G.randomItemId(rng) });
      else G.dropItem(e.x, e.y, { kind: 'relic', id: G.randomRelicId(rng, 'comune') });
      return;
    }
    if (rng.chance(0.3)) G.dropItem(e.x, e.y, { kind: 'gold', n: rng.int(2, 5) + reg * 2 });
    else if (rng.chance(0.06)) G.dropItem(e.x, e.y, { kind: 'item', id: G.randomItemId(rng) });
  };

  G.dropItem = function (x, y, it) {
    const R = G.run;
    // cerca una casella libera vicina
    const spots = [[x, y]].concat(U.DIRS8.map(d => [x + d[0], y + d[1]]));
    for (const [sx, sy] of spots) {
      const t = G.tileAt(sx, sy);
      if (!G.TILE[t].walk || t === T.CHASM || t === T.LAVA || t === T.DEEP || t === T.STAIRS) continue;
      if (R.items.some(i => i.x === sx && i.y === sy)) continue;
      if (G.featureAt(sx, sy)) continue;
      R.items.push(Object.assign({ x: sx, y: sy }, it));
      return true;
    }
    R.items.push(Object.assign({ x, y }, it));
    return false;
  };

  // svegliare un mostro
  G.alert = function (m, by) {
    if (m.kind !== 'monster' || m.dead) return;
    const R = G.run;
    if (m.st.mode !== 'hunt') {
      m.st.mode = 'hunt';
      G.fx.float(m.x, m.y, '!', '#ffdd33', { small: true });
    }
    const h = R.hero;
    m.st.lx = h.x; m.st.ly = h.y; m.st.lost = 0;
  };
  G.wakeAround = function (x, y, r) {
    for (const o of G.run.ents) if (!o.dead && o.kind === 'monster' && o.faction === 'enemy' && U.inRadius(x, y, o.x, o.y, r)) G.alert(o, G.run.hero);
  };

  // ---------------- Esperienza e livelli ----------------
  G.xpForLevel = (lvl) => 10 + lvl * 8;
  G.gainXp = function (h, xp) {
    const R = G.run;
    h.xp += xp * h.mods.xpMul * (R.eclissi >= 4 ? 0.85 : 1);
    while (h.xp >= h.xpNext) {
      h.xp -= h.xpNext;
      h.level++;
      h.xpNext = G.xpForLevel(h.level);
      h.maxHp += 3; h.hp += 3;
      G.heal(h, h.maxHp * 0.25);
      G.log('Sei salito al livello ' + h.level + '! Scegli un Dono del Saggio.', 'level');
      G.fx.levelup(h);
      G.fx.sound('levelup');
      R.pending.push({ type: 'levelup', opts: G.rollPerks(h, h.mods.extraChoice ? 4 : 3) });
    }
  };

  G.rollPerks = function (h, n) {
    const R = G.run, rng = R.rng;
    const pool = G.PERKS.filter(p => (!p.hero || p.hero === h.heroId) && (h.perks[p.id] || 0) < (p.max || 1) && (!p.req || p.req(h)));
    const heroPool = pool.filter(p => p.hero);
    const out = [];
    // garantisce spesso un potenziamento di abilità
    if (heroPool.length && rng.chance(0.65)) out.push(rng.pick(heroPool));
    let guard = 0;
    while (out.length < n && guard++ < 200) {
      const p = rng.weighted(pool, x => (x.w || 10));
      if (!out.includes(p)) out.push(p);
      if (out.length >= pool.length) break;
    }
    return out.map(p => p.id);
  };

  G.applyPerk = function (h, id) {
    const p = G.PERK_BY_ID[id];
    h.perks[id] = (h.perks[id] || 0) + 1;
    p.apply(h);
    G.log('Dono ottenuto: ' + p.name, 'good');
    G.fx.sound('pickup');
  };

  // ---------------- Reliquie e oggetti ----------------
  G.gainRelic = function (h, id) {
    const r = G.RELIC_BY_ID[id];
    if (!r) return;
    h.relics.push(id);
    if (r.apply) r.apply(h);
    G.meta && G.meta.discoverRelic && G.meta.discoverRelic(id);
    G.log('Reliquia ottenuta: ' + r.name + ' — ' + r.desc, 'loot');
    G.fx.sound('relic');
    G.fx.float(h.x, h.y, r.name, '#ffcf4a', { big: true });
  };

  G.addItem = function (h, id, n) {
    n = n || 1;
    for (const s of h.items) if (s && s.id === id && s.n < 9) { s.n += n; return true; }
    for (let i = 0; i < 6; i++) if (!h.items[i]) { h.items[i] = { id, n }; return true; }
    return false;
  };

  G.canPickup = function (h, it) {
    if (it.kind !== 'item') return true;
    for (const s of h.items) if (!s || (s.id === it.id && s.n < 9)) return true;
    return false;
  };

  G.randomItemId = function (rng) {
    return rng.weighted(G.ITEMS, it => it.w).id;
  };
  G.randomRelicId = function (rng, rarity) {
    const h = G.run.hero;
    let pool = G.RELICS.filter(r => !h.relics.includes(r.id) && !G.run.relicsSeen.includes(r.id) && (!rarity || r.rarity === rarity) && r.rarity !== 'boss');
    if (!pool.length) pool = G.RELICS.filter(r => !h.relics.includes(r.id) && r.rarity !== 'boss');
    if (!pool.length) return 'radice_antica';
    const r = rng.pick(pool);
    G.run.relicsSeen.push(r.id);
    return r.id;
  };
  G.relicChoices = function (rng, n, rarities) {
    const h = G.run.hero, out = [];
    let pool = G.RELICS.filter(r => !h.relics.includes(r.id) && rarities.includes(r.rarity));
    rng.shuffle(pool);
    for (const r of pool) { if (out.length >= n) break; out.push(r.id); }
    return out;
  };

  // ---------------- Eroe: ingresso in casella ----------------
  G.heroEnter = function (h) {
    const R = G.run;
    // raccolta oggetti
    for (let i = R.items.length - 1; i >= 0; i--) {
      const it = R.items[i];
      if (it.x !== h.x || it.y !== h.y) continue;
      if (it.kind === 'gold') {
        const n = Math.round(it.n * h.mods.goldMul);
        h.gold += n; R.stats.gold += n;
        G.fx.float(h.x, h.y, '+' + n + ' ◆', '#7fe8ff', { small: true });
        G.fx.sound('coin');
        R.items.splice(i, 1);
      } else if (it.kind === 'item') {
        const d = G.ITEM_BY_ID[it.id];
        if (G.addItem(h, it.id, it.n || 1)) {
          G.log('Raccolto: ' + d.name + '.', 'loot');
          G.hint('items', 'Usa gli oggetti con i tasti 5-0 (o cliccandoli). Passa il mouse sopra per leggerne gli effetti.');
          G.fx.sound('pickup');
          R.items.splice(i, 1);
        } else if (R.lastFullMsg !== it.x + ',' + it.y) { R.lastFullMsg = it.x + ',' + it.y; G.log('Zaino pieno! Non puoi raccogliere ' + d.name + '. (Clic destro su un oggetto per gettarlo)', 'bad'); }
      } else if (it.kind === 'relic') {
        R.items.splice(i, 1);
        G.gainRelic(h, it.id);
      } else if (it.kind === 'pietra') {
        R.items.splice(i, 1);
        G.collectGormStone(h, it);
      }
    }
    if (G.tileAt(h.x, h.y) === T.STAIRS) {
      if (R.sealed) G.log('Il portale è sigillato da un potere oscuro. Sconfiggi il guardiano!', 'bad');
      else G.log('Sei sul Portale. Premi INVIO (o clicca il portale) per scendere.', 'info');
    }
  };

  G.collectGormStone = function (h, it) {
    const R = G.run;
    h.hp = h.maxHp; G.cleanse(h);
    h.maxHp += 5; h.hp += 5;
    R.stones = (R.stones || 0) + 1;
    G.log('Hai recuperato la ' + it.name + '! Sei completamente guarito (+5 PV max).', 'level');
    G.fx.ring(h.x, h.y, 5, '#ffe66a');
    G.fx.sound('levelup');
    R.pending.push({ type: 'relic', title: 'Ricompensa del Guardiano', opts: G.relicChoices(R.rng, 3, ['rara', 'leggendaria', 'boss']) });
  };

  // ---------------- Trappole ----------------
  G.TRAPS = {
    spine:  { name: 'Trappola a spine', color: '#c0c0c0', desc: 'Infligge danni a chi la calpesta.' },
    fuoco:  { name: 'Sfiatatoio di fuoco', color: '#ff6a2a', desc: 'Erutta fiamme tutto intorno.' },
    veleno: { name: 'Spore velenose', color: '#9be35a', desc: 'Avvelena chi si trova vicino.' },
    tele:   { name: 'Runa del vento', color: '#b08aff', desc: 'Teletrasporta in un punto a caso.' },
    allarme:{ name: 'Corno d\'allarme', color: '#ffd23a', desc: 'Sveglia tutti i nemici del piano.' },
    gelo:   { name: 'Runa di gelo', color: '#bff4ff', desc: 'Congela chi si trova vicino.' },
  };
  G.triggerTrap = function (trap, e) {
    const R = G.run, reg = G.regionOf(R.floor), info = G.TRAPS[trap.type];
    trap.seen = true;
    if (e.kind === 'hero') { R.stats.traps = (R.stats.traps || 0) + 1; G.log('Hai attivato: ' + info.name + '!', 'bad'); }
    else if (G.visible(e.x, e.y)) G.log(e.name + ' attiva ' + info.name + '!', 'info');
    G.fx.sound('trap');
    switch (trap.type) {
      case 'spine': G.dealDamage(null, e, 5 + reg * 4, { pierce: true, src: 'trappola' }); break;
      case 'fuoco':
        for (const [dx, dy] of [[0, 0]].concat(U.DIRS8)) G.igniteTile(e.x + dx, e.y + dy, 4);
        G.dealDamage(null, e, 4 + reg * 3, { elem: 'fuoco', src: 'trappola' });
        if (!e.dead) G.addStatus(e, 'burn', 3, 2 + reg);
        G.fx.burst(e.x, e.y, '#ff7a2a', 24);
        break;
      case 'veleno':
        for (const o of R.ents) if (!o.dead && U.cheb(o.x, o.y, e.x, e.y) <= 1) G.addStatus(o, 'poison', 6, 2 + reg);
        G.fx.burst(e.x, e.y, '#9be35a', 24);
        break;
      case 'tele': {
        const s = G.randomFreeTile(e, 0);
        if (s) { e.x = s[0]; e.y = s[1]; G.fx.teleport(e); if (e.kind === 'hero') R.distMapsDirty = true; }
        trap.gone = true;
        break;
      }
      case 'allarme':
        G.fx.ring(e.x, e.y, 10, '#ffd23a');
        for (const o of R.ents) if (o.kind === 'monster' && !o.dead && o.faction === 'enemy') { G.alert(o, R.hero); }
        trap.gone = true;
        break;
      case 'gelo':
        for (const o of R.ents) if (!o.dead && U.cheb(o.x, o.y, e.x, e.y) <= 1) G.addStatus(o, 'freeze', 2);
        G.fx.burst(e.x, e.y, '#bff4ff', 24);
        break;
    }
  };

  // ---------------- Fuoco ----------------
  G.igniteTile = function (x, y, turns) {
    if (!G.inb(x, y)) return;
    const t = G.tileAt(x, y);
    if (G.TILE[t].solid || t === T.SHALLOW || t === T.DEEP || t === T.CHASM) return;
    const i = G.idx(x, y);
    G.run.map.fire[i] = Math.max(G.run.map.fire[i], turns || 4);
    const e = G.entityAt(x, y);
    if (e && !e.flags.fireImmune && !e.flags.fly) G.addStatus(e, 'burn', 3, 2 + G.regionOf(G.run.floor));
  };
  G.idx = (x, y) => y * G.run.map.w + x;

  G.updateFire = function () {
    const R = G.run, m = R.map, fire = m.fire, rng = R.rng;
    const spread = [];
    for (let i = 0; i < fire.length; i++) {
      if (!fire[i]) continue;
      const x = i % m.w, y = (i / m.w) | 0;
      const t = m.t[i];
      if (G.TILE[t].flammable) {
        // l'erba brucia e diventa cenere, propagandosi
        for (const [dx, dy] of U.DIRS4) {
          const nx = x + dx, ny = y + dy;
          if (G.inb(nx, ny) && G.TILE[G.tileAt(nx, ny)].flammable && !fire[ny * m.w + nx] && rng.chance(0.22)) spread.push([nx, ny]);
        }
      }
      fire[i]--;
      if (fire[i] <= 0) { fire[i] = 0; if (G.TILE[t].flammable) { m.t[i] = T.ASH; R.mapDirty = true; } }
      const e = G.entityAt(x, y);
      if (e && fire[i] > 0 && !e.flags.fireImmune && !e.flags.fly) G.addStatus(e, 'burn', 2, 2 + G.regionOf(R.floor));
    }
    for (const [x, y] of spread) G.igniteTile(x, y, 2 + rng.int(0, 2));
  };

  // ---------------- Telegrafi (attacchi annunciati) ----------------
  // tiles: [[x,y]], dopo che l'eroe ha compiuto `delay` azioni, si risolve chiamando fn(tiles)
  G.telegraph = function (owner, tiles, fn, opts) {
    opts = opts || {};
    const R = G.run;
    const t = { id: R.nextId++, owner: owner ? owner.id : 0, tiles: tiles.filter(p => G.inb(p[0], p[1])), at: R.hero.actions + (opts.delay || 1), fn, color: opts.color || '#ff3030', cancelOnDeath: opts.cancelOnDeath !== false, label: opts.label || '' };
    R.tele.push(t);
    G.fx.sound('warn');
    G.hint('tele', 'Le caselle rosse lampeggianti annunciano un attacco potente: spostati fuori prima del prossimo turno!');
    return t;
  };
  G.resolveTelegraphs = function () {
    const R = G.run;
    const ready = R.tele.filter(t => R.hero.actions >= t.at);
    if (!ready.length) return;
    R.tele = R.tele.filter(t => R.hero.actions < t.at);
    for (const t of ready) {
      const owner = R.ents.find(e => e.id === t.owner);
      if (t.cancelOnDeath && owner && owner.dead) continue;
      try { G.TELE_FN[t.fn.k](owner, t.tiles, t.fn); } catch (err) { console.error(err); }
    }
  };
  // funzioni di risoluzione serializzabili: fn = {k:'nome', ...parametri}
  G.TELE_FN = {
    // danno a chiunque (tranne fazione del proprietario) sulle caselle
    blast(owner, tiles, p) {
      const R = G.run;
      for (const [x, y] of tiles) {
        G.fx.burst(x, y, p.color || '#ff5030', 6);
        if (p.fire) G.igniteTile(x, y, p.fire);
        if (p.water && G.tileAt(x, y) === T.FLOOR) G.setTile(x, y, T.SHALLOW);
        const e = G.entityAt(x, y);
        if (!e || e.dead) continue;
        if (owner && !G.hostile(owner, e) && !p.friendly) continue;
        const dmg = R.rng.int(p.dmg[0], p.dmg[1]) * (p.wetBonus && e.status.wet ? 2 : 1);
        G.dealDamage(owner && !owner.dead ? owner : null, e, dmg, { elem: p.elem, src: p.src || (owner ? owner.name : '') });
        if (!e.dead && p.status) G.addStatus(e, p.status, p.st || 2, p.sp || 2);
        if (!e.dead && p.push && owner) G.knockback(owner, e, p.push);
      }
      G.fx.shake(p.shake || 4);
      G.fx.sound(p.sound || 'boom');
    },
    explode(owner, tiles, p) {
      if (!owner || owner.dead) return;
      G.TELE_FN.blast(owner, tiles, Object.assign({}, p, { friendly: true }));
      if (!owner.dead) G.kill(owner, null, { noXp: false, noDrop: true });
    },
  };

  // ---------------- Spinta / attrazione ----------------
  G.knockback = function (src, tgt, n, dirOverride) {
    if (tgt.dead || n <= 0) return;
    if (tgt.flags.noKnock || (tgt.kind === 'hero' && tgt.mods.noKnock)) return;
    const [dx, dy] = dirOverride || U.dirTo(src.x, src.y, tgt.x, tgt.y);
    if (!dx && !dy) return;
    for (let i = 0; i < n; i++) {
      const nx = tgt.x + dx, ny = tgt.y + dy;
      const t = G.tileAt(nx, ny);
      const other = G.entityAt(nx, ny);
      const blocked = G.TILE[t].solid || (t === T.DEEP && !tgt.flags.swim && !tgt.flags.fly) || other || G.featureAt(nx, ny);
      if (blocked) {
        // impatto
        const reg = G.regionOf(G.run.floor);
        G.dealDamage(src, tgt, 3 + reg * 2, { pierce: true, src: 'impatto', noFury: false });
        if (!tgt.dead) G.addStatus(tgt, 'stun', 1);
        if (other && !other.dead && G.hostile(src, other)) G.dealDamage(src, other, 2 + reg, { pierce: true });
        G.fx.shake(3);
        return;
      }
      G.moveTo(tgt, nx, ny, { slide: true });
      if (tgt.dead || G.run.pendingDescend) return;
      if (t === T.CHASM || t === T.LAVA) return;
    }
  };
  G.pull = function (src, tgt, n) {
    if (tgt.dead) return;
    if (tgt.flags.noKnock || (tgt.kind === 'hero' && tgt.mods.noKnock)) return;
    for (let i = 0; i < n; i++) {
      if (U.cheb(src.x, src.y, tgt.x, tgt.y) <= 1) return;
      const [dx, dy] = U.dirTo(tgt.x, tgt.y, src.x, src.y);
      const nx = tgt.x + dx, ny = tgt.y + dy;
      if (!G.canEnter(tgt, nx, ny) && !(G.tileAt(nx, ny) === T.CHASM || G.tileAt(nx, ny) === T.LAVA)) return;
      if (G.entityAt(nx, ny)) return;
      G.moveTo(tgt, nx, ny, { slide: true });
      if (tgt.dead || G.run.pendingDescend) return;
    }
  };

  // ---------------- Linea di tiro ----------------
  // percorso di un proiettile da (x0,y0) verso (x1,y1): si ferma al primo ostacolo/entità
  G.projectilePath = function (x0, y0, x1, y1, range, pierce) {
    const pts = U.ray(x0, y0, x1, y1, range || 12);
    const out = [];
    for (const p of pts) {
      if (G.isSolid(p[0], p[1]) || G.isOpaque(p[0], p[1]) && G.tileAt(p[0], p[1]) !== T.TALL) break;
      out.push(p);
      if (!pierce && G.entityAt(p[0], p[1])) break;
      if (!pierce && p[0] === x1 && p[1] === y1) break;
    }
    return out;
  };
  G.hasLOS = function (x0, y0, x1, y1) {
    const pts = U.line(x0, y0, x1, y1);
    for (let i = 0; i < pts.length - 1; i++) if (G.isOpaque(pts[i][0], pts[i][1])) return false;
    return true;
  };
  // può colpire il bersaglio con un proiettile senza altre entità in mezzo?
  G.clearShot = function (a, b, range) {
    if (U.cheb(a.x, a.y, b.x, b.y) > range) return false;
    const pts = U.line(a.x, a.y, b.x, b.y);
    for (let i = 0; i < pts.length - 1; i++) {
      const [x, y] = pts[i];
      if (G.isOpaque(x, y)) return false;
      const o = G.entityAt(x, y);
      if (o && o !== b) return false;
    }
    return true;
  };

  // ---------------- Campo visivo ----------------
  G.heroSight = function (h) {
    const R = G.run;
    let r = G.BIOMES[G.regionOf(R.floor)].sight + h.mods.sight;
    if (h.status.darkness) r = Math.min(r, 2);
    if (h.status.blind) r = Math.min(r, 1);
    return Math.max(1, r);
  };
  G.computeFOV = function () {
    const R = G.run, m = R.map, h = R.hero;
    if (!R.vis || R.vis.length !== m.w * m.h) R.vis = new Uint8Array(m.w * m.h);
    R.vis.fill(0);
    const r = G.heroSight(h);
    G.shadowcast(h.x, h.y, r, (x, y) => G.isOpaque(x, y), (x, y) => {
      if (x < 0 || y < 0 || x >= m.w || y >= m.h) return;
      const i = y * m.w + x;
      R.vis[i] = 1; m.seen[i] = 1;
    });
    // le fonti luminose rivelano caselle già in linea di vista entro raggio maggiore (lava, cristalli)
  };

  // ---------------- Mappe di distanza per l'IA ----------------
  G.distMap = function (cls) {
    const R = G.run;
    if (R.distMapsDirty || !R._dm) { R._dm = {}; R.distMapsDirty = false; }
    if (R._dm[cls]) return R._dm[cls];
    const m = R.map, h = R.hero;
    const probe = { flags: {}, kind: 'monster' };
    if (cls === 'fly') probe.flags.fly = true;
    if (cls === 'swim') probe.flags.swim = true;
    if (cls === 'phase') probe.flags.phase = true;
    if (cls === 'fire') probe.flags.fireImmune = true;
    const cost = (x, y) => {
      if (cls === 'phase') return (x > 0 && y > 0 && x < m.w - 1 && y < m.h - 1) ? 1 : Infinity;
      if (cls === 'burrow') { if (G.isSolid(x, y)) return (x > 0 && y > 0 && x < m.w - 1 && y < m.h - 1) ? 3 : Infinity; }
      else if (!G.canWalk(probe, x, y)) return Infinity;
      if (G.isHazardFor(probe, x, y)) return 12;
      if (G.featureAt(x, y)) return Infinity;
      return 1;
    };
    const d = G.dijkstra(m.w, m.h, [[h.x, h.y, 0]], cost, 60);
    R._dm[cls] = d;
    return d;
  };
  G.moveClass = function (e) {
    if (e.flags.phase) return 'phase';
    if (e.flags.burrow) return 'burrow';
    if (e.flags.fly) return 'fly';
    if (e.flags.swim) return 'swim';
    if (e.flags.fireImmune) return 'fire';
    return 'walk';
  };

  // ---------------- Ciclo dei turni ----------------
  G.endTurn = function (cost) {
    const R = G.run, h = R.hero;
    if (cost > 0) { h.energy -= cost; h.actions++; R.stats.actions++; }
    R.tookDamageThisTurn = false;
    let guard = 0;
    while (!h.dead && !R.over && !R.pendingDescend && guard++ < 5000) {
      if (h.energy >= 100) {
        // inizio turno eroe
        G.computeFOV();
        const can = G.heroStartTurn(h);
        if (h.dead || R.over) break;
        if (!can) { h.energy -= 100; h.actions++; G.log('Sei ' + (h.status.freeze ? 'congelato' : 'stordito') + '!', 'bad'); continue; }
        break;
      }
      R.tick++;
      for (const e of R.ents) if (!e.dead) e.energy += G.effSpeed(e) / 10;
      if (R.tick % 10 === 0) G.worldTurn();
      if (h.dead || R.over) break;
      for (const e of R.ents.slice()) {
        if (e.dead || e === h || e.energy < 100) continue;
        e.energy -= 100;
        if (!G.startTurn(e)) continue;
        if (e.dead) continue;
        G.AI.act(e);
        if (h.dead || R.over || R.pendingDescend) break;
      }
      R.ents = R.ents.filter(e => !e.dead || e === h);
    }
    G.computeFOV();
    G.updateAwareness();
    G.checkBossIntro();
    if (R.pendingDescend && !R.over) {
      const pd = R.pendingDescend; R.pendingDescend = null;
      G.descend(pd);
    }
  };

  G.heroStartTurn = function (h) {
    const R = G.run;
    // ricariche abilità
    for (const s of h.skills) if (s.cd > 0) s.cd--;
    // rigenerazione passiva
    let regen = h.mods.regen;
    if (h.heroId === 'tasarau') {
      const t = G.tileAt(h.x, h.y);
      regen += (t === T.GRASS || t === T.TALL) ? 0.5 : 0.25;
    }
    if (h.heroId === 'poivrons') {
      const t = G.tileAt(h.x, h.y);
      if (t === T.SHALLOW || t === T.DEEP) regen += 1;
    }
    if (regen > 0 && h.hp < h.maxHp) {
      h.st.regenAcc = (h.st.regenAcc || 0) + regen;
      if (h.st.regenAcc >= 1) { const n = Math.floor(h.st.regenAcc); h.st.regenAcc -= n; h.hp = Math.min(h.maxHp, h.hp + n); }
    }
    // aura di luce
    if (h.heroId === 'luminescente') {
      const dmg = 1 + Math.floor(h.level / 6) + (h.mods.auraBonus || 0);
      for (const o of R.ents) if (!o.dead && o.faction === 'enemy' && U.cheb(o.x, o.y, h.x, h.y) <= 1) G.dealDamage(h, o, dmg, { pierce: true, dot: true, color: '#fff3a0', noFury: false });
    }
    if (h.dead) return false;
    return G.startTurn(h);
  };

  G.worldTurn = function () {
    const R = G.run;
    R.turn++;
    G.updateFire();
    G.resolveTelegraphs();
    // acqua profonda: chi non sa nuotare e ci finisce dentro (es. spinto) soffre
    for (const e of R.ents) {
      if (e.dead) continue;
      if (G.tileAt(e.x, e.y) === T.LAVA && !e.flags.fly && !e.flags.fireImmune) {
        G.dealDamage(null, e, 4 + 3 * G.regionOf(R.floor), { elem: 'fuoco', pierce: true, src: 'lava' });
      }
    }
  };

  // aggiorna la consapevolezza dei mostri (sonno/ricerca)
  G.updateAwareness = function () {
    const R = G.run, h = R.hero, rng = R.rng;
    const hidden = h.status.invis || (h.heroId === 'tasarau' && G.tileAt(h.x, h.y) === T.TALL);
    for (const m of R.ents) {
      if (m.dead || m.kind !== 'monster' || m.faction !== 'enemy') continue;
      const d = U.cheb(m.x, m.y, h.x, h.y);
      const sees = G.visible(m.x, m.y) && d <= m.sight && (!hidden || d <= 1) && !m.status.blind;
      m.st.seesHero = sees;
      if (m.st.mode === 'sleep' && G.visible(m.x, m.y) && !G.isHiddenMonster(m)) G.hint('sleep', 'Alcuni nemici dormono (zZ): attaccarli di sorpresa garantisce un colpo critico.');
      if (sees) {
        if (m.st.mode === 'sleep') {
          let p = d <= 2 ? 0.5 : 0.18;
          if (h.mods.stealth) p *= 0.5;
          if (rng.chance(p)) { G.alert(m, h); G.wakeAround(m.x, m.y, 4); }
        } else {
          if (m.st.mode !== 'hunt') { G.alert(m, h); G.wakeAround(m.x, m.y, 5); }
          m.st.lx = h.x; m.st.ly = h.y; m.st.lost = 0;
        }
      } else if (m.st.mode === 'hunt') {
        m.st.lost = (m.st.lost || 0) + 1;
        if (m.st.lost > 14 && !m.flags.boss && !m.flags.alwaysAwake) m.st.mode = 'wander';
      }
    }
    const md = G.meta && G.meta.data;
    if (md && !(md.hints && md.hints.trap)) for (const t of R.traps) if (!t.gone && G.visible(t.x, t.y)) { G.hint('trap', 'I rombi colorati sul terreno sono trappole: evitale... o spingici dentro i nemici!'); break; }
  };

  // ---------------- Discesa ----------------
  G.descend = function (opts) {
    const R = G.run, h = R.hero;
    opts = opts || {};
    if (R.floor >= G.TOTAL_FLOORS) return;
    R.stats.floors = Math.max(R.stats.floors, R.floor);
    G.enterFloor(R.floor + 1, opts);
  };
})();

'use strict';
// ============================================================
//  ai.js : comportamenti di mostri, alleati e boss
// ============================================================
(function () {
  const U = G.U, T = G.T;
  const AI = G.AI = {};
  const rng = () => G.run.rng;

  // ---------------- utilità ----------------
  const ready = (m, k) => !(m.cds[k] > 0);
  const setCd = (m, k, v) => { m.cds[k] = v; };
  const dist = (a, b) => U.cheb(a.x, a.y, b.x, b.y);

  function canMoveInto(m, x, y, allowHazard) {
    if (!G.inb(x, y)) return false;
    if (G.entityAt(x, y) || G.featureAt(x, y)) return false;
    if (m.flags.burrow && G.isSolid(x, y)) return x > 0 && y > 0 && x < G.run.map.w - 1 && y < G.run.map.h - 1 && G.tileAt(x, y) !== T.CRYSTAL;
    if (!G.canWalk(m, x, y)) return false;
    if (!allowHazard && G.isHazardFor(m, x, y)) return false;
    return true;
  }
  function doMove(m, x, y) {
    const ox = m.x, oy = m.y;
    if (m.flags.burrow && G.isSolid(x, y)) {
      G.setTile(x, y, T.RUBBLE);
      G.fx.dust(x, y, 0);
      if (G.visible(x, y)) G.fx.sound('dig');
      G.run.distMapsDirty = true;
    }
    G.moveTo(m, x, y);
    if (m.flags.fireTrail && !m.dead) G.igniteTile(ox, oy, 3);
  }
  AI.canMoveInto = canMoveInto;

  function pickTarget(m) {
    const R = G.run;
    let best = null, bd = 999;
    for (const o of R.ents) {
      if (o.dead || !G.hostile(o, m)) continue;
      let d = dist(o, m);
      if (o.kind === 'hero') { d -= 0.5; if (m.faction === 'enemy' && m.st.mode !== 'hunt') continue; }
      if (o.kind === 'hero' && (o.status.invis) && d > 1) continue;
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }

  function stepToward(m, tgt) {
    if (m.flags.stationary || m.status.root) return false;
    const R = G.run;
    const useMap = tgt === R.hero;
    const dm = useMap ? G.distMap(G.moveClass(m)) : null;
    let cur = useMap ? dm[G.idx(m.x, m.y)] : U.cheb(m.x, m.y, tgt.x, tgt.y);
    const greedy = !useMap || cur === Infinity;
    if (greedy) cur = U.cheb(m.x, m.y, tgt.x, tgt.y) + 0.01 * U.manh(m.x, m.y, tgt.x, tgt.y);
    const cands = [];
    for (const [dx, dy] of U.DIRS8) {
      const nx = m.x + dx, ny = m.y + dy;
      if (!canMoveInto(m, nx, ny)) continue;
      let s = greedy ? U.cheb(nx, ny, tgt.x, tgt.y) + 0.01 * U.manh(nx, ny, tgt.x, tgt.y) : dm[G.idx(nx, ny)];
      if (s === Infinity) continue;
      cands.push([s, nx, ny]);
    }
    if (!cands.length) return false;
    cands.sort((a, b) => a[0] - b[0]);
    const bs = cands[0][0];
    if (bs >= cur) {
      // nessun progresso: aggira gli ostacoli ogni tanto
      if (bs > cur + 1.01 || !rng().chance(0.5)) return false;
    }
    const top = cands.filter(c => c[0] <= bs + 0.01);
    const c = rng().pick(top);
    doMove(m, c[1], c[2]);
    return true;
  }
  function stepAway(m, from) {
    if (m.flags.stationary || m.status.root) return false;
    let best = null, bs = -1;
    const d0 = dist(m, from);
    for (const [dx, dy] of U.DIRS8) {
      const nx = m.x + dx, ny = m.y + dy;
      if (!canMoveInto(m, nx, ny)) continue;
      // non infilarsi negli angoli: preferisci caselle con più uscite
      let open = 0; for (const [ex, ey] of U.DIRS8) if (G.canWalk(m, nx + ex, ny + ey)) open++;
      const s = U.cheb(nx, ny, from.x, from.y) * 10 + open;
      if (U.cheb(nx, ny, from.x, from.y) < d0) continue;
      if (s > bs) { bs = s; best = [nx, ny]; }
    }
    if (!best) return false;
    doMove(m, best[0], best[1]);
    return true;
  }
  function randomStep(m, allowHazard) {
    if (m.flags.stationary || m.status.root) return false;
    const opts = U.DIRS8.map(d => [m.x + d[0], m.y + d[1]]).filter(p => canMoveInto(m, p[0], p[1], allowHazard));
    if (!opts.length) return false;
    const p = rng().pick(opts);
    doMove(m, p[0], p[1]);
    return true;
  }
  function wander(m) {
    const R = G.run;
    if (m.flags.stationary) return;
    if (!m.st.wx || (m.x === m.st.wx && m.y === m.st.wy) || rng().chance(0.04)) {
      for (let k = 0; k < 20; k++) {
        const x = m.x + rng().int(-10, 10), y = m.y + rng().int(-10, 10);
        if (G.inb(x, y) && G.canWalk(m, x, y) && !G.isHazardFor(m, x, y)) { m.st.wx = x; m.st.wy = y; break; }
      }
    }
    if (rng().chance(0.35)) return; // gironzola con calma
    if (!m.st.wx || !stepToward(m, { x: m.st.wx, y: m.st.wy })) randomStep(m);
  }
  AI.stepToward = stepToward; AI.stepAway = stepAway; AI.randomStep = randomStep;

  function adjacentHostile(m) {
    const R = G.run;
    let best = null;
    for (const o of R.ents) {
      if (o.dead || !G.hostile(o, m) || dist(o, m) > 1) continue;
      if (o.kind === 'hero') return o;
      best = best || o;
    }
    return best;
  }

  // ---------------- telegrafi: forme ----------------
  const SH = AI.shapes = {
    square(x, y, r, self) { const o = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (self || dx || dy) o.push([x + dx, y + dy]); return o.filter(p => !G.isSolid(p[0], p[1])); },
    circle(x, y, r) { const o = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (U.inRadius(x, y, x + dx, y + dy, r)) o.push([x + dx, y + dy]); return o.filter(p => !G.isSolid(p[0], p[1])); },
    plus(x, y) { return [[x, y], [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(p => !G.isSolid(p[0], p[1])); },
    line(x, y, dx, dy, len) { const o = []; for (let i = 1; i <= len; i++) { const px = x + dx * i, py = y + dy * i; if (G.isSolid(px, py)) break; o.push([px, py]); } return o; },
    cross(x, y, len) { let o = []; for (const [dx, dy] of U.DIRS4) o = o.concat(SH.line(x, y, dx, dy, len)); return o; },
    star(x, y, len) { let o = []; for (const [dx, dy] of U.DIRS8) o = o.concat(SH.line(x, y, dx, dy, len)); return o; },
    cone(x, y, dx, dy, len) {
      const o = [], px = -dy, py = dx;
      for (let i = 1; i <= len; i++) {
        const sp = Math.min(2, Math.floor(i / 2));
        for (let k = -sp; k <= sp; k++) { const tx = x + dx * i + px * k, ty = y + dy * i + py * k; if (!G.isSolid(tx, ty) && !o.some(p => p[0] === tx && p[1] === ty)) o.push([tx, ty]); }
      }
      return o;
    },
    ring(x, y, r0, r1) { const o = []; for (let dy = -r1; dy <= r1; dy++) for (let dx = -r1; dx <= r1; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)); if (d >= r0 && d <= r1) o.push([x + dx, y + dy]); } return o.filter(p => !G.isSolid(p[0], p[1])); },
  };
  function tele(m, tiles, p, opts) {
    const dm = m.dmgMul || 1;
    const params = Object.assign({ k: 'blast', elem: m.elem }, p);
    if (params.dmg) params.dmg = [Math.round(params.dmg[0] * dm), Math.round(params.dmg[1] * dm)];
    return G.telegraph(m, tiles, params, Object.assign({ color: p.color }, opts || {}));
  }
  AI.tele = tele;

  function summon(m, type, n, cx, cy, r) {
    const out = [];
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < 30; k++) {
        const x = cx + rng().int(-r, r), y = cy + rng().int(-r, r);
        const probe = { flags: Object.assign({}, G.MON[type].flags || {}), kind: 'monster' };
        if (!G.inb(x, y) || !G.canEnter(probe, x, y) || G.isHazardFor(probe, x, y)) continue;
        if (x === G.run.hero.x && y === G.run.hero.y) continue;
        const s = G.makeMonster(type, x, y, { awake: true, summon: true });
        s.flags.summoned = true; s.xp = Math.ceil(s.xp / 2);
        G.fx.spawn(s);
        out.push(s);
        break;
      }
    }
    return out;
  }
  const countType = (type) => G.run.ents.filter(e => !e.dead && e.type === type).length;

  function shoot(m, t, r) {
    const R = G.run;
    G.fx.projectile(m.x, m.y, t.x, t.y, r.proj || 'rock');
    G.fx.sound('shoot');
    let acc = m.acc - t.eva; if (m.status.blind) acc -= 40;
    if (R.rng.int(1, 100) > U.clamp(acc, 10, 98)) { G.fx.float(t.x, t.y, 'mancato', '#cccccc', { delay: 120 }); return; }
    const dmg = R.rng.int(r.dmg[0], r.dmg[1]) * (m.dmgMul || 1);
    G.dealDamage(m, t, dmg, { elem: r.elem || m.elem, delay: 120 });
    if (t.dead) return;
    if (r.status) G.addStatus(t, r.status[0], r.status[1], r.status[2]);
    if (r.push) G.knockback(m, t, r.push);
    if (r.pull) G.pull(m, t, r.pull);
  }

  // ---------------- dispatcher ----------------
  AI.act = function (m) {
    if (m.dead) return;
    for (const k in m.cds) if (m.cds[k] > 0) m.cds[k]--;
    if (m.kind === 'ally') return m.ai === 'flower' ? AI.flower(m) : AI.ally(m);
    if (m.st.mode === 'sleep' && m.ai !== 'stone' && m.ai !== 'egg') return;
    if (m.status.confuse && rng().chance(0.5)) { randomStep(m, true); return; }
    const fn = AI[m.ai] || AI.melee;
    fn(m);
  };

  // ---------------- comportamenti base ----------------
  function slamCheck(m) {
    const s = G.MON[m.type].slam;
    if (!s || !ready(m, 'slam')) return false;
    const h = G.run.hero;
    if (!m.st.seesHero) return false;
    let tiles = null;
    const d = dist(m, h);
    if (s.shape === 'around' && d <= s.r) tiles = SH.square(m.x, m.y, s.r);
    else if (s.shape === 'cross' && (d <= 1 || ((m.x === h.x || m.y === h.y) && d <= s.r))) tiles = SH.cross(m.x, m.y, s.r);
    else if (s.shape === 'target' && d <= 6) tiles = SH.circle(h.x, h.y, s.r);
    else if (s.shape === 'line' && d <= s.r && d >= 2) {
      const ddx = h.x - m.x, ddy = h.y - m.y;
      if (ddx === 0 || ddy === 0 || Math.abs(ddx) === Math.abs(ddy)) tiles = SH.line(m.x, m.y, U.sign(ddx), U.sign(ddy), s.r + 1);
    }
    if (!tiles) return false;
    tele(m, tiles, { dmg: s.dmg, status: s.status, st: s.st, fire: s.fire, push: s.push, color: s.color, src: s.label }, { label: s.label });
    setCd(m, 'slam', s.cd);
    G.fx.float(m.x, m.y, s.label + '!', s.color || '#ff5050', { small: true });
    if (G.visible(m.x, m.y)) G.log(m.name + ' prepara ' + s.label + '!', 'bad');
    return true;
  }

  AI.melee = function (m) {
    if (m.st.mode === 'wander') return wander(m);
    if (slamCheck(m)) return;
    const adj = adjacentHostile(m);
    if (adj) { G.attack(m, adj); return; }
    const t = pickTarget(m);
    if (!t) return wander(m);
    stepToward(m, t);
  };

  AI.erratic = function (m) {
    if (m.st.mode === 'wander') return wander(m);
    if (rng().chance(0.4)) { if (randomStep(m)) return; }
    AI.melee(m);
  };

  AI.hitrun = function (m) {
    if (m.st.mode === 'wander') return wander(m);
    const h = G.run.hero;
    if (m.st.retreat > 0) { m.st.retreat--; if (stepAway(m, h)) return; }
    const adj = adjacentHostile(m);
    if (adj) { G.attack(m, adj); m.st.retreat = 2; return; }
    const t = pickTarget(m); if (t) stepToward(m, t);
  };

  AI.jelly = function (m) {
    if (m.st.mode === 'wander') return wander(m);
    const adj = adjacentHostile(m);
    if (adj) { G.attack(m, adj, { mult: adj.status.wet ? 2 : 1 }); G.fx.bolt(m.x, m.y, adj.x, adj.y, '#bfe8ff'); return; }
    const t = pickTarget(m); if (t) stepToward(m, t);
  };

  AI.turret = function (m) {
    const r = G.MON[m.type].ranged;
    const t = pickTarget(m);
    if (!t) return;
    if (ready(m, 'shot') && G.clearShot(m, t, r.range) && (t.kind !== 'hero' || m.st.seesHero)) { shoot(m, t, r); setCd(m, 'shot', r.cd); return; }
    const adj = adjacentHostile(m);
    if (adj) G.attack(m, adj);
  };

  AI.ranged = function (m) {
    if (m.st.mode === 'wander') return wander(m);
    const r = G.MON[m.type].ranged;
    const t = pickTarget(m);
    if (!t) return wander(m);
    const d = dist(m, t);
    if (m.flags.kiter && d <= 1 && !m.status.root && rng().chance(0.7)) { if (stepAway(m, t)) return; }
    const sees = t.kind !== 'hero' || m.st.seesHero;
    if (ready(m, 'shot') && sees && G.clearShot(m, t, r.range)) { shoot(m, t, r); setCd(m, 'shot', r.cd); return; }
    if (d <= 1) { G.attack(m, t); return; }
    if (m.flags.kiter && d < 3) { if (stepAway(m, t)) return; }
    if (d > r.range || !G.clearShot(m, t, r.range)) { stepToward(m, t); return; }
  };

  AI.kamikaze = function (m) {
    if (m.st.mode === 'wander') return wander(m);
    if (m.st.primed) return;
    const t = pickTarget(m);
    if (!t) return wander(m);
    if (dist(m, t) <= 1) {
      const ex = G.MON[m.type].explode;
      m.st.primed = true;
      G.addStatus(m, 'primed', 99);
      tele(m, SH.square(m.x, m.y, 1, true), { k: 'explode', dmg: ex.dmg, fire: ex.fire, elem: 'fuoco', color: '#ff7a2a', sound: 'boom' }, { label: 'Esplosione' });
      G.fx.float(m.x, m.y, 'si gonfia!', '#ff7a2a', { small: true });
      return;
    }
    stepToward(m, t);
  };

  AI.caster = function (m) {
    if (m.st.mode === 'wander') return wander(m);
    const c = G.MON[m.type].cast, h = G.run.hero;
    const d = dist(m, h);
    if (ready(m, 'cast') && m.st.seesHero && d <= c.range) {
      const tiles = c.shape === 'plus' ? SH.plus(h.x, h.y) : SH.circle(h.x, h.y, c.r || 1);
      tele(m, tiles, { dmg: c.dmg, elem: c.elem, color: c.color, src: c.label, sound: 'thunder', wetBonus: true }, { label: c.label });
      setCd(m, 'cast', c.cd);
      return;
    }
    const adj = adjacentHostile(m);
    if (adj && !rng().chance(0.6)) { G.attack(m, adj); return; }
    if (d < 3) { if (stepAway(m, h)) return; }
    if (d > c.range - 1 || !m.st.seesHero) stepToward(m, h);
  };

  AI.support = function (m) {
    if (m.st.mode === 'wander') return wander(m);
    const kind = G.MON[m.type].support || 'heal';
    if (kind !== 'heal' && ready(m, 'heal')) {
      const allies = G.run.ents.filter(o => !o.dead && o !== m && o.faction === m.faction && o.kind === 'monster' && dist(o, m) <= 5 && G.hasLOS(m.x, m.y, o.x, o.y) && (kind === 'ward' ? !o.status.shield : !o.status.haste))
        .sort((a, b) => dist(a, G.run.hero) - dist(b, G.run.hero));
      if (allies.length) {
        const a = allies[0];
        if (kind === 'ward') { G.addStatus(a, 'shield', 8, 8 + G.regionOf(G.run.floor) * 4); G.fx.ring(a.x, a.y, 0.8, '#9fd0ff'); }
        else { G.addStatus(a, 'haste', 3); G.addStatus(a, 'empower', 3); G.fx.ring(a.x, a.y, 0.8, '#ffe27a'); }
        G.fx.bolt(m.x, m.y, a.x, a.y, kind === 'ward' ? '#bff4ff' : '#ffe27a'); G.fx.sound('shield');
        if (G.visible(m.x, m.y)) G.log(m.name + (kind === 'ward' ? ' protegge ' : ' incita ') + a.name + '.', 'info');
        setCd(m, 'heal', 4);
        return;
      }
    }
    if (kind === 'heal' && ready(m, 'heal')) {
      const ally = G.run.ents.filter(o => !o.dead && o !== m && o.faction === m.faction && o.hp < o.maxHp * 0.7 && dist(o, m) <= 5 && G.hasLOS(m.x, m.y, o.x, o.y))
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (ally) {
        const amt = 10 + G.regionOf(G.run.floor) * 3;
        G.heal(ally, amt);
        G.fx.bolt(m.x, m.y, ally.x, ally.y, '#ffb050'); G.fx.sound('heal');
        if (G.visible(m.x, m.y)) G.log(m.name + ' cura ' + ally.name + '.', 'info');
        setCd(m, 'heal', 4);
        return;
      }
    }
    AI.ranged(m);
  };

  AI.stone = function (m) {
    const h = G.run.hero, d = dist(m, h);
    if (m.st.stone === undefined) m.st.stone = true;
    if (m.st.stone) {
      if (d <= 2) {
        m.st.stone = false; m.st.mode = 'hunt'; m.st.lx = h.x; m.st.ly = h.y;
        G.fx.float(m.x, m.y, 'si risveglia!', '#ffd23a', { small: true }); G.fx.sound('stone');
        if (G.visible(m.x, m.y)) G.log('La Gargolla si risveglia!', 'bad');
      }
      return;
    }
    if (d > 6) { m.st.stone = true; G.heal(m, m.maxHp * 0.15); return; }
    AI.melee(m);
  };

  AI.egg = function (m) {
    const R = G.run;
    if (R.hero.actions >= m.st.hatchAt) {
      const x = m.x, y = m.y;
      G.kill(m, null, { vanish: true, noXp: true, noDrop: true });
      const f = G.makeMonster('devilfenix', x, y, { awake: true });
      f.hp = Math.round(f.maxHp * 0.5);
      f.st.reborn = true; f.speed = 130; f.flags.fireTrail = true;
      R.bossId = f.id;
      G.fx.spawn(f); G.fx.flash('#ff8a2a'); G.fx.shake(10); G.fx.sound('roar');
      G.log('Devilfenix RINASCE dalle sue ceneri, più furioso che mai!', 'boss');
      G.fx.banner('Devilfenix rinasce!', 'Fase finale');
    } else if (G.visible(m.x, m.y)) {
      const left = m.st.hatchAt - R.hero.actions;
      G.fx.float(m.x, m.y, String(left), '#ffb050', { small: true });
    }
  };

  // ---------------- alleati ----------------
  AI.ally = function (m) {
    const R = G.run, h = R.hero;
    const adj = adjacentHostile(m);
    if (adj && !G.isHiddenMonster(adj)) { G.attack(m, adj); return; }
    let t = null, bd = 99;
    for (const o of R.ents) {
      if (o.dead || o.faction !== 'enemy' || G.isHiddenMonster(o) || !G.visible(o.x, o.y)) continue;
      const d = dist(o, m);
      if (d < bd && d <= 8) { bd = d; t = o; }
    }
    if (t) { if (!stepToward(m, t)) randomStep(m); return; }
    if (dist(m, h) > 2) stepToward(m, h);
  };

  // ================================================================
  //  BOSS
  // ================================================================
  function bossInit(m, cds) {
    if (m.st.init) return;
    m.st.init = true;
    Object.assign(m.cds, cds);
  }
  function chase(m) {
    const h = G.run.hero;
    const adj = adjacentHostile(m);
    if (adj) { G.attack(m, adj); return true; }
    return stepToward(m, h) || (pickTarget(m) && stepToward(m, pickTarget(m)));
  }
  function phaseAnnounce(m, text, sub) {
    G.log(text, 'boss'); G.fx.banner(sub || m.name, text); G.fx.shake(8); G.fx.sound('roar');
  }

  // ---- Cerbante ----
  AI.boss_cerbante = function (m) {
    const R = G.run, h = R.hero, d = dist(m, h);
    bossInit(m, { breath: 3, howl: 6 });
    const p2 = m.hp < m.maxHp * 0.5;
    if (p2 && !m.st.p2) {
      m.st.p2 = true; m.speed = 125;
      phaseAnnounce(m, 'Cerbante è furioso! Le tre teste ruggiscono insieme.');
      summon(m, 'lupo', 2, m.x, m.y, 2);
      return;
    }
    if (ready(m, 'breath') && d <= 5 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      const [dx, dy] = U.dirTo(m.x, m.y, h.x, h.y);
      tele(m, SH.cone(m.x, m.y, dx, dy, 5), { dmg: [6, 9], elem: 'fuoco', fire: 3, status: 'burn', st: 3, sp: 2, color: '#ff6a2a', src: 'Soffio Infernale' }, { label: 'Soffio Infernale' });
      G.log('Cerbante inspira profondamente... sta per sputare fuoco!', 'bad');
      setCd(m, 'breath', p2 ? 4 : 5);
      return;
    }
    if (ready(m, 'howl') && countType('lupo') < 3) {
      G.log('Cerbante ulula: il branco risponde!', 'bad'); G.fx.sound('roar'); G.fx.ring(m.x, m.y, 3, '#ff6a2a');
      summon(m, 'lupo', 2, m.x, m.y, 3);
      setCd(m, 'howl', 11);
      return;
    }
    const adj = adjacentHostile(m);
    if (adj) {
      G.attack(m, adj);
      if (!adj.dead && rng().chance(p2 ? 0.4 : 0.2)) { G.attack(m, adj); }
      return;
    }
    stepToward(m, h);
  };

  // ---- Orrore Profondo ----
  AI.boss_orrore = function (m) {
    const R = G.run, h = R.hero, d = dist(m, h);
    bossInit(m, { slam: 2, tent: 4, ink: 7 });
    const p2 = m.hp < m.maxHp * 0.5;
    if (p2 && !m.st.p2) {
      m.st.p2 = true; m.speed = 100;
      phaseAnnounce(m, 'L\'Orrore Profondo scatena un gorgo che ti trascina verso di lui!');
      return;
    }
    if (p2 && d <= 7 && d > 1 && !h.mods.noKnock && rng().chance(0.6)) {
      G.fx.ring(m.x, m.y, 2, '#4aa0ff');
      G.pull(m, h, 1);
    }
    if (ready(m, 'slam') && d <= 8 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      tele(m, SH.circle(h.x, h.y, 1), { dmg: [9, 12], elem: 'mare', status: 'wet', st: 4, push: 1, water: true, color: '#4aa0ff', src: 'Schianto Abissale' }, { label: 'Schianto Abissale' });
      setCd(m, 'slam', p2 ? 3 : 4);
      return;
    }
    if (ready(m, 'tent') && countType('tentacolo') < 4) {
      G.log('Tentacoli emergono dal terreno!', 'bad');
      summon(m, 'tentacolo', 2, h.x, h.y, 2);
      setCd(m, 'tent', 7);
      return;
    }
    if (ready(m, 'ink') && d <= 5) {
      G.addStatus(h, 'darkness', 3);
      G.fx.burst(h.x, h.y, '#202040', 30); G.fx.sound('splash');
      G.log('L\'Orrore spruzza inchiostro nero: non vedi quasi nulla!', 'bad');
      setCd(m, 'ink', 10);
      return;
    }
    chase(m);
  };

  // ---- Obscurio ----
  AI.boss_obscurio = function (m) {
    const R = G.run, h = R.hero, d = dist(m, h);
    bossInit(m, { lance: 2, summon: 5, dark: 4, blink: 6 });
    const p2 = m.hp < m.maxHp * 0.5;
    if (p2 && !m.st.p2) {
      m.st.p2 = true;
      phaseAnnounce(m, 'Obscurio si divide in molteplici riflessi oscuri!');
      summon(m, 'clone', 3, h.x, h.y, 3);
      return;
    }
    if (ready(m, 'dark')) {
      G.addStatus(h, 'darkness', 5);
      G.fx.flash('#100020'); G.fx.sound('dark');
      G.log('Obscurio spegne la luce: le tenebre ti avvolgono!', 'bad');
      setCd(m, 'dark', p2 ? 9 : 12);
      return;
    }
    if (ready(m, 'lance') && d <= 9 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      const [dx, dy] = U.dirTo(m.x, m.y, h.x, h.y);
      let tiles = SH.line(m.x, m.y, dx, dy, 10);
      if (p2) { const px = -dy, py = dx; tiles = tiles.concat(SH.line(m.x + px, m.y + py, dx, dy, 10), SH.line(m.x - px, m.y - py, dx, dy, 10)); }
      tele(m, tiles, { dmg: [12, 16], elem: 'tenebre', status: 'weak', st: 3, color: '#b77cff', src: 'Lancia d\'Ombra' }, { label: 'Lancia d\'Ombra' });
      setCd(m, 'lance', 4);
      return;
    }
    if (ready(m, 'summon') && countType('ombra') < 3) {
      G.log('Obscurio evoca le Ombre Striscianti!', 'bad');
      summon(m, 'ombra', 2, m.x, m.y, 3);
      setCd(m, 'summon', 10);
      return;
    }
    if (ready(m, 'blink') && d >= 3) {
      const spots = U.DIRS8.map(dd => [h.x + dd[0], h.y + dd[1]]).filter(p => G.canEnter(m, p[0], p[1]) && !G.isHazardFor(m, p[0], p[1]));
      if (spots.length) {
        const p = rng().pick(spots), ox = m.x, oy = m.y;
        m.x = p[0]; m.y = p[1];
        G.fx.teleport(m, ox, oy); G.fx.sound('teleport');
        G.log('Obscurio appare alle tue spalle!', 'bad');
        setCd(m, 'blink', 6);
        return;
      }
    }
    chase(m);
  };

  // funzioni condivise con i moduli dei nuovi mostri
  Object.assign(AI, { ready, setCd, dist, summon, countType, shoot, wander, chase, pickTarget, adjacentHostile, slamCheck, bossInit, phaseAnnounce, doMove });

  // ---- Devilfenix ----
  G.TELE_FN.dive = function (owner, tiles, p) {
    if (!owner || owner.dead) return;
    const [cx, cy] = p.center;
    const spot = [[cx, cy]].concat(U.DIRS8.map(d => [cx + d[0], cy + d[1]])).find(q => G.canEnter(owner, q[0], q[1]) || (owner.x === q[0] && owner.y === q[1]));
    if (spot) { const ox = owner.x, oy = owner.y; owner.x = spot[0]; owner.y = spot[1]; G.fx.move(owner, ox, oy, { dash: true }); }
    G.TELE_FN.blast(owner, tiles, p);
  };
  AI.boss_devilfenix = function (m) {
    const R = G.run, h = R.hero, d = dist(m, h);
    bossInit(m, { volley: 3, dive: 5 });
    const re = !!m.st.reborn;
    if (ready(m, 'volley') && d <= 6) {
      tele(m, SH.star(m.x, m.y, 7), { dmg: [10, 14], elem: 'fuoco', fire: re ? 3 : 0, color: '#ff8a2a', src: 'Pioggia di Piume' }, { label: 'Pioggia di Piume' });
      G.log('Devilfenix spiega le ali: piume infuocate in tutte le direzioni!', 'bad');
      setCd(m, 'volley', re ? 4 : 5);
      return;
    }
    if (ready(m, 'dive') && d >= 2 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      tele(m, SH.circle(h.x, h.y, 1), { k: 'dive', center: [h.x, h.y], dmg: [14, 18], elem: 'aria', fire: 3, color: '#ffb050', src: 'Picchiata' }, { label: 'Picchiata' });
      G.log('Devilfenix si alza in volo e punta su di te!', 'bad');
      setCd(m, 'dive', re ? 4 : 6);
      return;
    }
    chase(m);
  };

  // ---- Magmion ----
  AI.boss_magmion = function (m) {
    const R = G.run, h = R.hero, d = dist(m, h);
    bossInit(m, { pillars: 2, bombs: 5 });
    const p2 = m.hp < m.maxHp * 0.5;
    if (p2 && !m.st.p2) {
      m.st.p2 = true; m.speed = 120;
      phaseAnnounce(m, 'Magmion erutta! La lava inonda il terreno.', 'Magmion — Eruzione');
      return;
    }
    if (ready(m, 'pillars') && d <= 8) {
      let tiles = SH.square(h.x, h.y, 1, true);
      for (let k = 0; k < (p2 ? 3 : 2); k++) tiles = tiles.concat(SH.square(h.x + rng().int(-3, 3), h.y + rng().int(-3, 3), 1, true));
      tele(m, tiles, { dmg: [10, 14], elem: 'fuoco', fire: 4, lava: p2, color: '#ff6a2a', src: 'Colonne di Magma' }, { label: 'Colonne di Magma' });
      setCd(m, 'pillars', p2 ? 3 : 4);
      return;
    }
    if (ready(m, 'bombs') && countType('bombo') < 3) {
      G.log('Magmion evoca i Bombi Ignei!', 'bad');
      summon(m, 'bombo', 2, m.x, m.y, 2);
      setCd(m, 'bombs', 9);
      return;
    }
    const adj = adjacentHostile(m);
    if (adj) { G.attack(m, adj); if (!adj.dead && rng().chance(0.4)) G.addStatus(adj, 'burn', 3, 5); return; }
    stepToward(m, h);
  };

  // ---- Magor ----
  AI.boss_magor = function (m) {
    const R = G.run, h = R.hero, d = dist(m, h);
    bossInit(m, { meteor: 2, drain: 6, ring: 8, summon: 10 });
    const ph = m.hp > m.maxHp * 0.66 ? 1 : m.hp > m.maxHp * 0.33 ? 2 : 3;
    if (ph === 2 && !m.st.p2) {
      m.st.p2 = true;
      phaseAnnounce(m, 'Magor richiama i suoi servitori da ogni angolo di Gorm!', 'Magor — Seconda Fase');
      summon(m, 'guerriero', 1, m.x, m.y, 3); summon(m, 'ombra', 1, m.x, m.y, 3); summon(m, 'grifone', 1, m.x, m.y, 3);
      m.cds.ring = 2;
      return;
    }
    if (ph === 3 && !m.st.p3) {
      m.st.p3 = true; m.speed = 125;
      phaseAnnounce(m, 'Magor scatena tutto il suo potere! Il vulcano trema!', 'Magor — Fase Finale');
      G.addStatus(h, 'darkness', 4);
      return;
    }
    if (ready(m, 'meteor') && d <= 9) {
      let tiles = SH.circle(h.x, h.y, 1);
      const extra = ph + 1;
      for (let k = 0; k < extra; k++) tiles = tiles.concat(SH.circle(h.x + rng().int(-4, 4), h.y + rng().int(-4, 4), 1));
      tele(m, tiles, { dmg: [14, 20], elem: 'tenebre', fire: 3, color: '#b77cff', src: 'Meteore Oscure', shake: 8 }, { label: 'Meteore' });
      G.log('Meteore oscure piovono dal cielo!', 'bad');
      setCd(m, 'meteor', ph === 1 ? 5 : ph === 2 ? 4 : 3);
      return;
    }
    if (ph >= 2 && ready(m, 'ring') && d <= 3) {
      tele(m, SH.ring(m.x, m.y, 1, 3), { dmg: [16, 22], elem: 'tenebre', push: 2, color: '#b77cff', src: 'Onda del Male' }, { label: 'Onda del Male' });
      G.log('Magor raccoglie energia oscura intorno a sé!', 'bad');
      setCd(m, 'ring', 6);
      return;
    }
    if (ready(m, 'drain') && d <= 5 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      const dmg = rng().int(8, 12) * (m.dmgMul || 1);
      G.fx.bolt(h.x, h.y, m.x, m.y, '#b77cff');
      const got = G.dealDamage(m, h, dmg, { pierce: true, elem: 'tenebre', src: 'Respiro Vitale' });
      G.heal(m, got * 3);
      G.log('Magor ti strappa il Respiro Vitale!', 'bad'); G.fx.sound('dark');
      setCd(m, 'drain', 8);
      return;
    }
    if (ph >= 2 && ready(m, 'summon')) {
      summon(m, rng().pick(['bombo', 'lavico', 'ombra']), 2, m.x, m.y, 3);
      setCd(m, 'summon', 12);
      return;
    }
    chase(m);
  };
})();

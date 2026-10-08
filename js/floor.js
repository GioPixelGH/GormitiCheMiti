'use strict';
// ============================================================
//  floor.js : creazione partita, piani, popolamento, azioni eroe,
//             mercanti, santuari, boss, salvataggi, meta-progressione
// ============================================================
(function () {
  const U = G.U, T = G.T;

  G.defaultMods = () => ({
    dmg: 0, dmgMul: 1, furyMul: 1, xpMul: 1, goldMul: 1, lifesteal: 0, regen: 0, cdr: 0, elemStrong: 1.5, noElemWeak: false,
    execute: 0, firstStrike: 0, statusResist: 0, floorShield: 0, potionMul: 1, lastStand: false, eliteDmg: 0, thorns: 0,
    burnOnHit: 0, poisonOnHit: 0, sight: 0, reflectShield: false, killHeal: 0, killShield: 0, noKnock: false, flatReduce: 0,
    dmgTakenMul: 1, stunImmune: false, extraChoice: false, revealMap: false, revealStairs: false, floorHeal: 0, floorInvis: 0,
    chainEvery: 0, stealth: false, rangeBonus: 0, shopDiscount: 0, lastHope: false, wetBonus: 0, auraBonus: 0, lightBonus: false,
  });

  G.makeHero = function (id) {
    const d = G.HEROES[id];
    const h = G.newEntityBase();
    Object.assign(h, {
      kind: 'hero', heroId: id, type: id, name: d.name, faction: 'player',
      maxHp: d.hp, hp: d.hp, atk: d.atk.slice(), def: d.def, eva: d.eva, acc: 95, crit: d.crit, critMul: d.critMul,
      speed: 100, elem: d.elem, level: 1, xp: 0, xpNext: G.xpForLevel(1), fury: 0, actions: 0, energy: 100,
      skills: d.skills.map(s => ({ id: s, cd: 0 })), relics: [], perks: {}, items: [null, null, null, null, null, null],
      gold: 0, up: {}, mods: G.defaultMods(),
    });
    d.setup(h);
    return h;
  };

  // ---------------- Nuova partita ----------------
  G.newRun = function (heroId, opts) {
    opts = opts || {};
    const seed = opts.seed != null ? opts.seed >>> 0 : ((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    G.run = {
      version: 3, seed, rng: new G.RNG(seed), heroId, eclissi: opts.eclissi || 0, daily: opts.daily || null,
      floor: 0, map: null, ents: [], items: [], features: [], traps: [], tele: [], log: [], pending: [],
      turn: 0, tick: 0, nextId: 1, over: null, sealed: false, bossId: 0, bossIntro: false,
      stats: { kills: 0, dmgDealt: 0, dmgTaken: 0, gold: 0, actions: 0, floors: 0, startTime: Date.now(), playMs: 0, bosses: 0, elites: 0, itemsUsed: 0 },
      seenMonsters: {}, relicsSeen: [], stones: 0,
    };
    const h = G.makeHero(heroId);
    G.run.hero = h;
    G.run.ents.push(h);
    G.addItem(h, 'pozione', 2);
    G.enterFloor(1);
    G.log('Il Vecchio Saggio ti ha scelto, ' + h.name + '. Riporta le Pietre di Gorm e sconfiggi Magor!', 'level');
    return G.run;
  };

  // ---------------- Ingresso in un piano ----------------
  G.enterFloor = function (n, opts) {
    opts = opts || {};
    const R = G.run, h = R.hero, rng = R.rng;
    R.floor = n;
    R.tele = []; R.items = []; R.features = []; R.traps = []; R.sealed = false; R.bossId = 0; R.bossIntro = false;
    R.ents = [h];
    R.lastHopeUsed = false;
    R._dm = null; R.distMapsDirty = true;
    const boss = G.isBossFloor(n);
    const map = boss ? G.generateArena(n, rng) : G.generateFloor(n, rng);
    R.map = map;
    R.vis = new Uint8Array(map.w * map.h);
    h.x = map.start[0]; h.y = map.start[1];
    if (opts.fell && !boss) {
      const s = G.randomFreeTile(h, 0);
      if (s) { h.x = s[0]; h.y = s[1]; }
    }
    if (boss) G.populateBoss(); else G.populateFloor();
    delete map.distFromStart;
    // effetti d'inizio piano
    h.energy = 100;
    for (const k of ['darkness', 'invis', 'summon']) delete h.status[k];
    if (h.mods.floorShield) G.addStatus(h, 'shield', 30, h.mods.floorShield);
    if (h.mods.floorHeal) G.heal(h, h.maxHp * h.mods.floorHeal, true);
    if (h.mods.floorInvis) G.addStatus(h, 'invis', h.mods.floorInvis);
    if (h.mods.revealMap) G.revealMap();
    G.computeFOV();
    const biome = G.BIOMES[G.regionOf(n)];
    if (G.floorInRegion(n) === 1) G.log(biome.intro, 'boss');
    G.log('Piano ' + n + ' — ' + biome.name + (boss ? ' (Arena del Guardiano)' : ''), 'info');
    if (n === G.TOTAL_FLOORS - 1) G.log('Senti un potere immenso oltre il portale. Un guardiano lo sigilla.', 'bad');
    G.fx.floorChange && G.fx.floorChange();
    G.ui.onFloor && G.ui.onFloor();
    G.save();
  };

  function floorCells(cond) {
    const R = G.run, m = R.map, out = [];
    for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
      const t = m.t[y * m.w + x];
      if (!G.TILE[t].walk || t === T.LAVA || t === T.CHASM || t === T.STAIRS || t === T.DOOR || t === T.DEEP) continue;
      if (cond && !cond(x, y, t)) continue;
      out.push([x, y]);
    }
    return out;
  }
  const occupied = (x, y) => G.entityAt(x, y) || G.featureAt(x, y) || G.run.items.some(i => i.x === x && i.y === y) || G.trapAt(x, y);

  G.populateFloor = function () {
    const R = G.run, m = R.map, rng = R.rng, h = R.hero;
    const reg = G.regionOf(R.floor), fl = G.floorInRegion(R.floor), biome = G.BIOMES[reg];
    const dS = m.distFromStart;
    const far = (x, y, d) => dS[y * m.w + x] !== Infinity && dS[y * m.w + x] >= d && U.cheb(x, y, h.x, h.y) >= d;
    const reach = (x, y) => dS[y * m.w + x] !== Infinity;
    const cells = floorCells(reach);
    rng.shuffle(cells);
    const free = (x, y) => !occupied(x, y) && !(x === h.x && y === h.y);
    const pick = (cond) => { for (const c of cells) if (free(c[0], c[1]) && (!cond || cond(c[0], c[1]))) return c; return null; };

    // --- mostri ---
    const count = 8 + fl * 2 + reg + (R.eclissi >= 2 ? 2 : 0);
    let placed = 0, guard = 0;
    while (placed < count && guard++ < 200) {
      const type = rng.weighted(biome.monsters, e => e[1])[0];
      const d = G.MON[type];
      const probe = { flags: d.flags || {}, kind: 'monster' };
      const anchor = pick((x, y) => far(x, y, 9) && G.canWalk(probe, x, y));
      if (!anchor) break;
      const n = d.pack ? rng.int(d.pack[0], d.pack[1]) : (rng.chance(0.25) ? 2 : 1);
      for (let i = 0; i < n && placed < count + 2; i++) {
        let spot = i === 0 ? anchor : null;
        if (!spot) for (let k = 0; k < 12; k++) { const x = anchor[0] + rng.int(-2, 2), y = anchor[1] + rng.int(-2, 2); if (G.inb(x, y) && G.canEnter(probe, x, y) && !G.isHazardFor(probe, x, y) && free(x, y)) { spot = [x, y]; break; } }
        if (!spot) continue;
        const mon = G.makeMonster(type, spot[0], spot[1]);
        if (mon.ai === 'stone') mon.st.mode = 'hunt';
        placed++;
      }
    }
    // --- élite ---
    const eliteP = 0.35 + reg * 0.08 + (R.eclissi >= 2 ? 0.3 : 0);
    if (rng.chance(eliteP)) {
      const type = rng.pick(biome.elites);
      const s = pick((x, y) => far(x, y, 14) && G.canWalk({ flags: G.MON[type].flags, kind: 'monster' }, x, y));
      if (s) { const e = G.makeMonster(type, s[0], s[1]); e.st.mode = 'sleep'; }
    }
    // --- guardiano del piano 14: Magmion ---
    if (R.floor === G.TOTAL_FLOORS - 1) {
      const [sx, sy] = m.stairs;
      let spot = null;
      for (const [dx, dy] of U.DIRS8) if (G.canEnter({ flags: {}, kind: 'monster' }, sx + dx, sy + dy) && !G.isHazardFor({ flags: { fireImmune: true } }, sx + dx, sy + dy)) { spot = [sx + dx, sy + dy]; break; }
      if (!spot) spot = [sx, sy + 1];
      const mg = G.makeMonster('magmion', spot[0], spot[1]);
      mg.st.mode = 'sleep';
      R.sealed = true; R.bossId = mg.id;
    }
    // --- oggetti ---
    const nItems = rng.int(1, 3);
    for (let i = 0; i < nItems; i++) { const s = pick((x, y) => far(x, y, 4)); if (s) R.items.push({ x: s[0], y: s[1], kind: 'item', id: G.randomItemId(rng) }); }
    const nGold = rng.int(4, 6);
    for (let i = 0; i < nGold; i++) { const s = pick((x, y) => far(x, y, 3)); if (s) R.items.push({ x: s[0], y: s[1], kind: 'gold', n: rng.int(4, 9) + reg * 4 }); }
    // --- forzieri ---
    const nChest = rng.int(1, 2);
    for (let i = 0; i < nChest; i++) {
      const s = pick((x, y) => far(x, y, 6) && wallsAround(x, y) >= 3 && !isChokepoint(x, y));
      if (s) R.features.push({ id: R.nextId++, type: 'chest', x: s[0], y: s[1], rare: rng.chance(0.4) });
    }
    // --- trappole ---
    const nTraps = 3 + reg + (R.eclissi >= 3 ? 2 : 0);
    const trapTypes = [['spine', 4], ['veleno', reg <= 1 ? 3 : 1], ['fuoco', reg >= 3 ? 4 : 1], ['tele', 2], ['allarme', 2], ['gelo', reg >= 2 ? 2 : 0]];
    for (let i = 0; i < nTraps; i++) {
      const s = pick((x, y) => far(x, y, 5));
      if (s) R.traps.push({ x: s[0], y: s[1], type: rng.weighted(trapTypes, e => e[1])[0] });
    }
    // --- mercante (2° piano di ogni regione) ---
    if (fl === 2) {
      const s = pick((x, y) => far(x, y, 6) && wallsAround(x, y) === 0 && !isChokepoint(x, y));
      if (s) R.features.push({ id: R.nextId++, type: 'merchant', x: s[0], y: s[1], stock: G.makeStock(rng, reg) });
    }
    // --- santuario (1° piano di ogni regione) ---
    if (fl === 1 && (reg > 0 || rng.chance(0.7))) {
      const s = pick((x, y) => far(x, y, 8) && wallsAround(x, y) <= 1 && !isChokepoint(x, y));
      if (s) R.features.push({ id: R.nextId++, type: 'shrine', x: s[0], y: s[1], kind: rng.pick(['fonte', 'sangue', 'saggio', 'totem']) });
    }
  };
  // vero se occupare (x,y) dividerebbe localmente il passaggio
  function isChokepoint(x, y) {
    const pass = U.DIRS8.map(([dx, dy]) => { const t = G.tileAt(x + dx, y + dy); return G.TILE[t].walk && t !== T.CHASM && t !== T.LAVA && t !== T.DEEP; });
    let groups = 0;
    for (let i = 0; i < 8; i++) if (pass[i] && !pass[(i + 7) % 8]) groups++;
    if (groups === 0 && pass.every(Boolean)) groups = 1;
    return groups > 1;
  }
  G.isChokepoint = isChokepoint;
  function wallsAround(x, y) { let n = 0; for (const [dx, dy] of U.DIRS8) if (G.isSolid(x + dx, y + dy)) n++; return n; }

  G.populateBoss = function () {
    const R = G.run, m = R.map, reg = G.regionOf(R.floor);
    const type = G.BIOMES[reg].boss;
    const b = G.makeMonster(type, m.bossSpot[0], m.bossSpot[1]);
    b.st.mode = 'sleep';
    R.bossId = b.id;
    // qualche oggetto utile all'ingresso
    R.items.push({ x: m.start[0] - 1, y: m.start[1] - 1, kind: 'item', id: 'pozione' });
  };

  // ---------------- Rivelazione mappa ----------------
  G.revealMap = function () {
    const m = G.run.map;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const t = m.t[y * m.w + x];
      if (!G.TILE[t].solid) { m.seen[y * m.w + x] = 1; continue; }
      for (const [dx, dy] of U.DIRS8) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < m.w && ny < m.h && !G.TILE[m.t[ny * m.w + nx]].solid) { m.seen[y * m.w + x] = 1; break; } }
    }
    G.run.mapDirty = true;
  };

  // ---------------- Boss ----------------
  G.STONE_NAMES = ['Pietra della Foresta', 'Pietra del Mare', 'Pietra della Terra', 'Pietra dell\'Aria', 'Pietra del Fuoco'];
  G.onBossDeath = function (e) {
    const R = G.run, h = R.hero, reg = G.regionOf(R.floor);
    if (e.type === 'devilfenix' && !e.st.reborn) {
      const egg = G.makeMonster('uovo', e.x, e.y, { awake: true });
      egg.flags.boss = true; egg.st.hatchAt = h.actions + 7;
      R.bossId = egg.id;
      G.fx.spawn(egg);
      G.log('Devilfenix si dissolve in un uovo incandescente! Distruggilo prima che si schiuda (7 turni)!', 'boss');
      G.fx.banner('L\'Uovo di Fenice', 'Distruggilo entro 7 turni!');
      return;
    }
    G.meta.bossDefeated(e.type);
    if (e.type === 'magmion') {
      R.stats.bosses++;
      G.dropItem(e.x, e.y, { kind: 'relic', id: G.randomRelicId(R.rng, 'rara') });
      G.dropItem(e.x, e.y, { kind: 'gold', n: 80 });
      G.fx.banner('Magmion è caduto!', 'Il portale verso il cuore del vulcano è aperto');
      return;
    }
    R.stats.bosses++;
    if (e.flags.final || e.type === 'magor') {
      G.fx.banner('VITTORIA!', 'Magor è stato sconfitto. Gorm è salva!');
      G.fx.sound('victory');
      R.over = { win: true };
      return;
    }
    const sp = R.map.stairsSpot;
    G.setTile(sp[0], sp[1], T.STAIRS);
    R.map.stairs = sp;
    // non lasciare il portale occupato da oggetti
    R.items = R.items.filter(i => !(i.x === sp[0] && i.y === sp[1]));
    G.dropItem(e.x, e.y, { kind: 'pietra', name: G.STONE_NAMES[reg] });
    G.dropItem(e.x, e.y, { kind: 'gold', n: 40 + reg * 25 });
    G.fx.banner(e.name + ' è sconfitto!', 'Raccogli la ' + G.STONE_NAMES[reg]);
    G.log('Hai sconfitto ' + e.name + '! Il portale si è aperto.', 'level');
    G.fx.sound('victory');
  };

  G.checkBossIntro = function () {
    const R = G.run;
    if (!R.bossId || R.bossIntro) return;
    const b = R.ents.find(e => e.id === R.bossId);
    if (!b || b.dead) return;
    if (G.visible(b.x, b.y)) {
      R.bossIntro = true;
      const d = G.MON[b.type];
      G.alert(b, R.hero);
      G.fx.banner(d.name, d.title || 'Guardiano');
      G.fx.sound('roar'); G.fx.shake(6);
      G.log(d.name + ', ' + (d.title || 'il guardiano') + ', ti sbarra la strada!', 'boss');
      G.ui.onBossIntro && G.ui.onBossIntro(b);
    }
  };

  // ---------------- Mercante (Razzle) ----------------
  G.makeStock = function (rng, reg) {
    const mul = 1 + reg * 0.25;
    const stock = [];
    const ids = rng.shuffle(G.ITEMS.slice()).slice(0, 3);
    for (const it of ids) stock.push({ kind: 'item', id: it.id, price: Math.round((it.w >= 20 ? 18 : it.w >= 8 ? 26 : 38) * mul) });
    stock.push({ kind: 'item', id: 'pozione', price: Math.round(20 * mul) });
    const rar = rng.chance(0.3) ? 'rara' : 'comune';
    stock.push({ kind: 'relic', id: null, rarity: 'comune', price: Math.round(75 * mul) });
    stock.push({ kind: 'relic', id: null, rarity: rar === 'rara' ? 'rara' : 'comune', price: Math.round((rar === 'rara' ? 120 : 80) * mul) });
    stock.push({ kind: 'heal', price: Math.round(30 + reg * 15) });
    return stock;
  };
  G.shopPrice = (s) => Math.max(1, Math.round(s.price * (1 - (G.run.hero.mods.shopDiscount || 0))));
  G.ensureStockRelics = function (f) {
    for (const s of f.stock) if (s.kind === 'relic' && !s.id) s.id = G.randomRelicId(G.run.rng, s.rarity);
  };
  G.buy = function (f, idx) {
    const R = G.run, h = R.hero, s = f.stock[idx];
    if (!s || s.sold) return false;
    const price = G.shopPrice(s);
    if (h.gold < price) { G.log('Non hai abbastanza Frammenti.', 'bad'); return false; }
    if (s.kind === 'item') {
      if (!G.addItem(h, s.id, 1)) { G.log('Zaino pieno!', 'bad'); return false; }
      G.log('Hai comprato: ' + G.ITEM_BY_ID[s.id].name + '.', 'loot');
    } else if (s.kind === 'relic') {
      G.gainRelic(h, s.id);
    } else if (s.kind === 'heal') {
      G.heal(h, h.maxHp * 0.5); G.cleanse(h);
      G.log('Razzle ti medica le ferite.', 'good');
    }
    h.gold -= price; s.sold = true;
    G.fx.sound('coin');
    return true;
  };

  // ---------------- Santuari ----------------
  G.SHRINES = {
    fonte: { name: 'Fonte Sacra', desc: 'Acqua limpida sgorga da una roccia antica. Puoi berne una sola volta.',
      options: [{ label: 'Bevi a lungo (cura completa)', id: 'heal' }, { label: 'Bevi un sorso (+6 PV massimi)', id: 'maxhp' }] },
    sangue: { name: 'Altare di Sangue', desc: 'Un altare oscuro reclama un tributo di vita in cambio di potere.',
      options: [{ label: 'Offri il 15% dei PV massimi (ottieni una reliquia rara)', id: 'blood' }, { label: 'Allontanati', id: 'leave' }] },
    saggio: { name: 'Statua del Vecchio Saggio', desc: 'Il Saggio di pietra sembra osservarti. Ai suoi piedi, una ciotola per le offerte.',
      options: [{ label: 'Offri 40 Frammenti (ottieni un Dono)', id: 'offer', cost: 40 }, { label: 'Prega (rimuove stati, +20% PV)', id: 'pray' }] },
    totem: { name: 'Totem Elementale', desc: 'Un totem pulsa di energia instabile. Toccarlo è un azzardo.',
      options: [{ label: 'Tocca il totem (reliquia... o maledizione)', id: 'gamble' }, { label: 'Allontanati', id: 'leave' }] },
  };
  G.shrineChoose = function (f, opt) {
    const R = G.run, h = R.hero, rng = R.rng;
    if (f.used) return;
    switch (opt) {
      case 'heal': G.heal(h, h.maxHp); G.cleanse(h); G.log('L\'acqua sacra ti ristora completamente.', 'good'); break;
      case 'maxhp': h.maxHp += 6; h.hp += 6; G.log('Ti senti più forte. (+6 PV max)', 'good'); break;
      case 'blood': {
        const loss = Math.round(h.maxHp * 0.15);
        h.maxHp -= loss; h.hp = Math.min(h.hp, h.maxHp); if (h.hp < 1) h.hp = 1;
        G.fx.burst(h.x, h.y, '#c81a3a', 20);
        G.gainRelic(h, G.randomRelicId(rng, rng.chance(0.15) ? 'leggendaria' : 'rara'));
        break;
      }
      case 'offer':
        if (h.gold < 40) { G.log('Non hai abbastanza Frammenti.', 'bad'); return false; }
        h.gold -= 40;
        R.pending.push({ type: 'levelup', opts: G.rollPerks(h, h.mods.extraChoice ? 4 : 3), title: 'Dono della Statua' });
        break;
      case 'pray': G.cleanse(h); G.heal(h, h.maxHp * 0.2); G.log('Una calma antica ti avvolge.', 'good'); break;
      case 'gamble':
        if (rng.chance(0.6)) G.gainRelic(h, G.randomRelicId(rng, rng.chance(0.3) ? 'rara' : 'comune'));
        else {
          const roll = rng.int(0, 2);
          if (roll === 0) { h.maxHp = Math.max(10, h.maxHp - 8); h.hp = Math.min(h.hp, h.maxHp); G.log('Maledizione! Perdi 8 PV massimi.', 'bad'); }
          else if (roll === 1) { G.addStatus(h, 'vuln', 30); G.addStatus(h, 'weak', 30); G.log('Maledizione! Sei Vulnerabile e Indebolito per 30 turni.', 'bad'); }
          else { G.log('Maledizione! Il totem risveglia tutti i nemici del piano!', 'bad'); for (const o of R.ents) if (o.kind === 'monster' && !o.dead) G.alert(o, h); }
          G.fx.burst(h.x, h.y, '#b77cff', 24); G.fx.sound('dark');
        }
        break;
      case 'leave': return true;
    }
    f.used = true;
    G.fx.sound('relic');
    return true;
  };

  // ---------------- Interazione con elementi ----------------
  G.interact = function (f) {
    const R = G.run, h = R.hero, rng = R.rng, reg = G.regionOf(R.floor);
    if (f.type === 'chest') {
      f.gone = true;
      G.fx.sound('chest'); G.fx.burst(f.x, f.y, f.rare ? '#ffcf4a' : '#c8a050', 18);
      if (f.rare) {
        const r = rng.next();
        G.dropItem(f.x, f.y, { kind: 'relic', id: G.randomRelicId(rng, r < 0.1 ? 'leggendaria' : r < 0.55 ? 'rara' : 'comune') });
        G.log('Hai aperto uno Scrigno Antico!', 'loot');
      } else {
        G.dropItem(f.x, f.y, { kind: 'gold', n: rng.int(10, 20) + reg * 8 });
        if (rng.chance(0.5)) G.dropItem(f.x, f.y, { kind: 'item', id: G.randomItemId(rng) });
        G.log('Hai aperto un forziere.', 'loot');
      }
      return 100;
    }
    if (f.type === 'merchant') { G.ensureStockRelics(f); R.pending.push({ type: 'shop', fid: f.id }); return 0; }
    if (f.type === 'shrine') {
      if (f.used) { G.log('Il santuario ha esaurito il suo potere.', 'info'); return 0; }
      R.pending.push({ type: 'shrine', fid: f.id }); return 0;
    }
    return 0;
  };

  // ---------------- Azioni dell'eroe ----------------
  G.skillCd = function (h, id) {
    const d = G.SKILLS[id];
    if (id === 'getto' && h.up.getto_cd) return 1;
    return Math.max(1, d.cd - h.mods.cdr);
  };
  G.skillRange = (h, d) => (d.range || 0) + (d.target === 'enemy' || d.target === 'tile' ? h.mods.rangeBonus : 0);

  G.act = {
    move(dx, dy, opts) {
      opts = opts || {};
      const R = G.run, h = R.hero;
      if (h.status.confuse && R.rng.chance(0.4)) { const d = R.rng.pick(U.DIRS8); dx = d[0]; dy = d[1]; G.log('Sei confuso e barcolli!', 'bad'); }
      const nx = h.x + dx, ny = h.y + dy;
      const o = G.entityAt(nx, ny);
      if (o) {
        if (G.hostile(o, h)) { R.hazardConfirm = null; G.attack(h, o); return 100; }
        if (o.kind === 'ally' && !h.status.root) {
          const ox = h.x, oy = h.y;
          o.x = ox; o.y = oy; G.fx.move(o, nx, ny, {});
          G.moveTo(h, nx, ny); return 100;
        }
        return 0;
      }
      const f = G.featureAt(nx, ny);
      if (f) return G.interact(f);
      if (h.status.root) { G.log('Sei immobilizzato! (Puoi attaccare o attendere)', 'bad'); return 0; }
      if (!G.canWalk(h, nx, ny)) return 0;
      if (G.isHazardFor(h, nx, ny) && !opts.force) {
        const key = nx + ',' + ny;
        if (R.hazardConfirm !== key) {
          R.hazardConfirm = key;
          G.log('Attenzione: ' + G.TILE[G.tileAt(nx, ny)].name + (G.fireAt(nx, ny) ? ' in fiamme' : '') + '! Ripeti il movimento per confermare.', 'bad');
          return 0;
        }
      }
      R.hazardConfirm = null;
      G.moveTo(h, nx, ny);
      return 100;
    },
    wait() {
      const h = G.run.hero;
      G.run.hazardConfirm = null;
      return 100;
    },
    skill(i, target) {
      const R = G.run, h = R.hero, s = h.skills[i];
      if (!s) return 0;
      const d = G.SKILLS[s.id];
      if (d.ult) { if (h.fury < 100) { G.log('La Furia non è ancora piena (' + Math.floor(h.fury) + '/100).', 'bad'); return 0; } }
      else if (s.cd > 0) { G.log(d.name + ' è in ricarica (' + s.cd + ').', 'bad'); return 0; }
      const ok = d.use(h, target);
      if (!ok) return 0;
      R.stats.skillsUsed = (R.stats.skillsUsed || 0) + 1;
      if (d.ult) h.fury = 0; else s.cd = G.skillCd(h, s.id);
      R.hazardConfirm = null;
      return 100;
    },
    item(slot, target) {
      const R = G.run, h = R.hero, s = h.items[slot];
      if (!s) return 0;
      const d = G.ITEM_BY_ID[s.id];
      const ok = d.use(h, target);
      if (!ok) return 0;
      s.n--; if (s.n <= 0) h.items[slot] = null;
      R.stats.itemsUsed++;
      G.log('Usi: ' + d.name + '.', 'info');
      return 100;
    },
    descend() {
      const R = G.run, h = R.hero;
      if (G.tileAt(h.x, h.y) !== T.STAIRS) return 0;
      if (R.sealed) { G.log('Il portale è sigillato! Sconfiggi il guardiano.', 'bad'); return 0; }
      G.fx.sound('portal');
      G.descend();
      return -1;
    },
  };

  // ================================================================
  //  SALVATAGGI
  // ================================================================
  const RUN_KEY = 'gormiti_run_v3', META_KEY = 'gormiti_meta_v1';
  const store = (typeof localStorage !== 'undefined') ? localStorage : null;

  G.save = function () {
    const R = G.run;
    if (!R || R.over || !store) return;
    R.stats.playMs = Date.now() - R.stats.startTime;
    try {
      const data = JSON.stringify(R, (k, v) => {
        if (k === 'hero' || k === 'vis' || k === '_dm' || k === 'rng' || k === 'distMapsDirty') return undefined;
        return v;
      });
      const obj = JSON.parse(data);
      obj.rngState = R.rng.s;
      store.setItem(RUN_KEY, JSON.stringify(obj));
    } catch (e) { console.warn('Salvataggio fallito', e); }
  };
  G.hasSave = () => !!(store && store.getItem(RUN_KEY));
  G.load = function () {
    if (!store) return false;
    const s = store.getItem(RUN_KEY);
    if (!s) return false;
    try {
      const R = JSON.parse(s);
      if (R.version !== 3) { store.removeItem(RUN_KEY); return false; }
      R.rng = new G.RNG(1); R.rng.s = R.rngState >>> 0;
      R.hero = R.ents.find(e => e.kind === 'hero');
      R.vis = new Uint8Array(R.map.w * R.map.h);
      R.distMapsDirty = true; R._dm = null;
      R.stats.startTime = Date.now() - (R.stats.playMs || 0);
      G.run = R;
      G.computeFOV();
      return true;
    } catch (e) { console.warn('Caricamento fallito', e); store.removeItem(RUN_KEY); return false; }
  };
  G.clearSave = () => { if (store) store.removeItem(RUN_KEY); };

  // ================================================================
  //  META-PROGRESSIONE
  // ================================================================
  G.meta = {
    data: null,
    def() {
      return { unlocked: { gheos: true, tasarau: true, poivrons: true, noctis: true, saggio: false, luminescente: false },
        maxEclissi: 0, runs: 0, wins: {}, bestFloor: 0, bosses: {}, monsters: {}, relics: {}, history: [], daily: {},
        settings: { music: 0.5, sfx: 0.7, shake: true }, tutorialSeen: false, totalKills: 0, hints: {} };
    },
    load() {
      let d = null;
      try { d = store && JSON.parse(store.getItem(META_KEY)); } catch (e) { d = null; }
      const base = this.def();
      this.data = d ? Object.assign(base, d, { unlocked: Object.assign(base.unlocked, d.unlocked || {}), settings: Object.assign(base.settings, d.settings || {}) }) : base;
      return this.data;
    },
    save() { try { store && store.setItem(META_KEY, JSON.stringify(this.data)); } catch (e) { } },
    discoverRelic(id) { if (!this.data) return; this.data.relics[id] = true; },
    bossDefeated(type) {
      if (!this.data) return;
      this.data.bosses[type] = (this.data.bosses[type] || 0) + 1;
      if (type === 'obscurio' && !this.data.unlocked.saggio) {
        this.data.unlocked.saggio = true;
        G.run && (G.run.newUnlocks = (G.run.newUnlocks || []).concat(['saggio']));
        G.log('SBLOCCATO: il Vecchio Saggio è ora un eroe giocabile!', 'level');
      }
      this.save();
    },
    // fine partita
    endRun(R) {
      const d = this.data;
      if (!d || R.metaDone) return;
      R.metaDone = true;
      d.runs++;
      d.bestFloor = Math.max(d.bestFloor, R.floor);
      d.totalKills += R.stats.kills;
      for (const k in R.seenMonsters) d.monsters[k] = true;
      const win = R.over && R.over.win;
      R.newUnlocks = R.newUnlocks || [];
      if (win) {
        d.wins[R.heroId] = (d.wins[R.heroId] || 0) + 1;
        if (!d.unlocked.luminescente) { d.unlocked.luminescente = true; R.newUnlocks.push('luminescente'); }
        if (R.eclissi >= d.maxEclissi && d.maxEclissi < 5) { d.maxEclissi = R.eclissi + 1; R.newUnlocks.push('eclissi' + d.maxEclissi); }
      }
      d.history.unshift({ hero: R.heroId, floor: R.floor, win: !!win, ecl: R.eclissi, kills: R.stats.kills, level: R.hero.level, date: new Date().toISOString().slice(0, 10), daily: R.daily });
      d.history = d.history.slice(0, 12);
      if (R.daily) {
        const prev = d.daily[R.daily];
        const score = win ? 100 : R.floor;
        if (!prev || score > prev.score) d.daily[R.daily] = { score, hero: R.heroId };
      }
      this.save();
      G.clearSave();
    },
  };
})();

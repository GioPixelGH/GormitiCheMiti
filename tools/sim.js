// Simulatore di partite per i test di bilanciamento (processo singolo).
// Uso: node tools/sim.js '<configurazione JSON>'   — di solito lo lancia tools/batteria.js
// Configurazione:
//   hero        id dell'eroe (obbligatorio)
//   policy      'always' = usa ogni abilità appena possibile | 'tactic' = solo quando conviene
//   perks       'best' = sceglie i Doni con criterio | 'random' = a caso
//   mode        'normal' | 'base' (niente reliquie né Doni) | 'full' (tutte le reliquie e i Doni dall'inizio)
//   r0, runs    prima partita e numero di partite (i semi dipendono dal numero della partita)
//   route       'cycle' = ruota tutti i percorsi possibili | array completo di regioni per tappa
//   disable     indice di un'abilità da non usare mai (0-3) | null
//   inject      id di reliquie date all'inizio
//   ecl         livello di Eclissi
//   bossReplays quante volte rigiocare ogni boss da checkpoint (duelli)
// Stampa su stdout un array JSON con un risultato per partita. Con DEBUG=1 descrive i blocchi.
const { carica, percorsi } = require('./lib/gioco');
carica();
const U = G.U;
const CFG = Object.assign({ policy: 'always', perks: 'best', mode: 'normal', r0: 0, runs: 10, route: 'cycle', disable: null, inject: [], ecl: 0, bossReplays: 0 }, JSON.parse(process.argv[2] || '{}'));
if (!CFG.hero || !G.HEROES[CFG.hero]) { console.error('Eroe mancante o sconosciuto: ' + CFG.hero); process.exit(2); }
const ROUTES = percorsi();

// ---------------------------------------------------------------- scelte del bot
let pickRng = null;
function pickPerk(h, opts) {
  if (!opts.length) return null;
  if (CFG.perks === 'random') return opts[Math.floor(pickRng() * opts.length)];
  const pref = ['vigore', 'forza', 'furia_ancestrale', 'tempra', 'vampiro'];
  for (const o of opts) if (G.PERK_BY_ID[o].hero) return o;
  for (const p of pref) if (opts.includes(p)) return p;
  return opts[0];
}
function handlePending() {
  const R = G.run, h = R.hero;
  while (R.pending.length) {
    const p = R.pending.shift();
    if (p.type === 'levelup') { const k = pickPerk(h, p.opts); if (k) G.applyPerk(h, k); }
    else if (p.type === 'relic') { if (p.opts.length) G.gainRelic(h, CFG.perks === 'random' ? p.opts[Math.floor(pickRng() * p.opts.length)] : p.opts[0]); }
    else if (p.type === 'shop') {
      const f = R.features.find(x => x.id === p.fid);
      f.stock.forEach((s, i) => { if ((s.kind === 'relic' && CFG.mode !== 'base') || (s.kind === 'heal' && h.hp < h.maxHp * 0.6) || s.id === 'pozione') G.buy(f, i); });
      f.botDone = true;
    } else if (p.type === 'event') {
      const f = R.features.find(x => x.id === p.fid);
      const opts = G.eventOptions(f);
      const i = opts.findIndex(o => o.ok);
      if (i >= 0) { const res = G.eventChoose(f, i); if (res && res.descend) { G.descend(); return; } }
    } else if (p.type === 'shrine') {
      const f = R.features.find(x => x.id === p.fid);
      const opt = G.SHRINES[f.kind].options[0].id;
      if (!(opt === 'blood' && h.hp < h.maxHp * 0.6)) G.shrineChoose(f, opt); else f.used = true;
    }
  }
}
function nearestEnemy(h) {
  const R = G.run, ign = R.botIgnore || (R.botIgnore = {});
  let best = null, bd = 99;
  for (const o of G.visibleEnemies()) { if (ign[o.id] > R.turn && U.cheb(o.x, o.y, h.x, h.y) > 1) continue; const d = U.cheb(o.x, o.y, h.x, h.y); if (d < bd) { bd = d; best = o; } }
  if (best) {
    const cc = R.botChaseCnt || (R.botChaseCnt = {});
    if (bd <= 1) cc[best.id] = 0;
    else if ((cc[best.id] = (cc[best.id] || 0) + 1) > 40) { cc[best.id] = 0; ign[best.id] = R.turn + 150; return nearestEnemy(h); }
  }
  return best;
}
function useSkill(i, target) { const c = G.act.skill(i, target); if (c) G.run.skillUse[i]++; return c; }

// stile 1: usa sempre ogni abilita' (Potere Supremo, poi ricariche lunghe)
function skillsAlways(h, enemies, n) {
  const d = U.cheb(n.x, n.y, h.x, h.y);
  const order = [3].concat([0, 1, 2].filter(i => h.skills[i]).sort((a, b) => G.skillCd(h, h.skills[b].id) - G.skillCd(h, h.skills[a].id)));
  for (const i of order) {
    if (i === CFG.disable) continue;
    const s = h.skills[i]; if (!s) continue;
    const sd = G.SKILLS[s.id];
    if (sd.ult ? h.fury < G.ultCost(h) : s.cd > 0) continue;
    let target = null, ok = false;
    if (sd.target === 'enemy') {
      const r = G.skillRange(h, sd);
      const t = [n].concat(enemies).find(o => U.cheb(o.x, o.y, h.x, h.y) <= r && G.hasLOS(h.x, h.y, o.x, o.y));
      if (t) { target = t; ok = true; }
    } else if (sd.target === 'dir') {
      if (d <= (sd.ult ? 6 : 5)) { target = [U.sign(n.x - h.x), U.sign(n.y - h.y)]; ok = true; }
    } else if (sd.target === 'self') {
      ok = d <= (sd.ult ? 7 : 5);
    } else if (sd.target === 'tile') {
      const r = G.skillRange(h, sd); let best = null, bd = 99;
      for (let y = h.y - r; y <= h.y + r; y++) for (let x = h.x - r; x <= h.x + r; x++) {
        if ((x === h.x && y === h.y) || (x === n.x && y === n.y) || !G.inb(x, y)) continue;
        if (sd.valid && !sd.valid(h, x, y)) continue;
        const dd = U.cheb(x, y, n.x, n.y); if (dd < bd) { bd = dd; best = [x, y]; }
      }
      if (best && d <= 8) { target = best; ok = true; }
    }
    if (ok) { const c = useSkill(i, target); if (c) return c; }
  }
  return 0;
}
// stile 2: tattico (abilita' solo quando convengono)
function skillsTactic(h, enemies, n) {
  const d = U.cheb(n.x, n.y, h.x, h.y);
  if (h.fury >= G.ultCost(h) && CFG.disable !== 3) {
    const near = enemies.filter(o => U.cheb(o.x, o.y, h.x, h.y) <= 4).length;
    if (near >= 2 || (n.flags.boss || n.flags.elite) || h.hp < h.maxHp * 0.4) {
      const ud = G.SKILLS[h.skills[3].id];
      const tg = ud.target === 'dir' ? [U.sign(n.x - h.x), U.sign(n.y - h.y)] : ud.target === 'enemy' ? n : null;
      const c = useSkill(3, tg); if (c) return c;
    }
  }
  for (let i = 0; i < 3; i++) {
    if (i === CFG.disable) continue;
    const s = h.skills[i]; if (s.cd > 0) continue;
    const sd = G.SKILLS[s.id];
    let target = null, ok = false;
    if (sd.target === 'enemy') {
      const r = G.skillRange(h, sd);
      if (d <= r && G.hasLOS(h.x, h.y, n.x, n.y)) { target = n; ok = true; }
    } else if (sd.target === 'dir') {
      const dx = n.x - h.x, dy = n.y - h.y;
      if (s.id === 'muraglia' && !(d <= 3 && h.hp < h.maxHp * 0.6)) continue;
      if ((dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) && d <= 4) { target = [U.sign(dx), U.sign(dy)]; ok = true; }
    } else if (sd.target === 'tile') {
      if (h.hp < h.maxHp * 0.4 && d <= 1) {
        for (let k = 0; k < 30; k++) { const x = h.x + G.run.rng.int(-6, 6), y = h.y + G.run.rng.int(-6, 6); if (sd.valid(h, x, y) && U.cheb(x, y, n.x, n.y) >= 4) { target = [x, y]; ok = true; break; } }
      } else if (d >= 3 && d <= 6) {
        let best = null, bd = 99; const r = G.skillRange(h, sd);
        for (let y = h.y - r; y <= h.y + r; y++) for (let x = h.x - r; x <= h.x + r; x++) { if (!G.inb(x, y) || (x === n.x && y === n.y) || !sd.valid(h, x, y)) continue; const dd = U.cheb(x, y, n.x, n.y); if (dd < bd) { bd = dd; best = [x, y]; } }
        if (best && bd <= 1) { target = best; ok = true; }
      }
    } else if (sd.target === 'self') {
      const adj = enemies.filter(o => U.cheb(o.x, o.y, h.x, h.y) <= 1).length;
      if (['pugno', 'vortice', 'bagliore', 'marea'].includes(s.id)) ok = adj >= 1;
      else if (['scudoroccia', 'bolla', 'prisma', 'spine', 'guscio'].includes(s.id)) ok = d <= 2;
      else if (s.id === 'linfa') ok = h.hp < h.maxHp * 0.55;
      else if (s.id === 'sfida') ok = enemies.filter(o => U.cheb(o.x, o.y, h.x, h.y) <= 4).length >= 2;
      else ok = d <= 5;
    }
    if (ok) { const c = useSkill(i, target); if (c) return c; }
  }
  return 0;
}
const trySkills = CFG.policy === 'tactic' ? skillsTactic : skillsAlways;

function botAct() {
  const R = G.run, h = R.hero;
  handlePending();
  if (R.over) return;
  if (h.hp < h.maxHp * 0.35) {
    for (let i = 0; i < 6; i++) { const s = h.items[i]; if (s && (s.id === 'pozione' || s.id === 'grande_pozione')) return G.endTurn(G.act.item(i)); }
  }
  if (R.botFloor !== R.floor) { R.botFloor = R.floor; R.botSteps = 0; }
  const exits = [R.map.stairs].concat((R.portals || []).map(p => [p.x, p.y])).filter(p => p && R.map.seen[p[1] * R.map.w + p[0]]);
  if (++R.botSteps > 1000 && exits.length && !R.sealed) {
    const adj = G.visibleEnemies().find(o => U.cheb(o.x, o.y, h.x, h.y) <= 1);
    if (adj) return G.endTurn(G.act.move(adj.x - h.x, adj.y - h.y));
    if (G.tileAt(h.x, h.y) === G.T.STAIRS) { G.act.descend(); if (R.floor !== R.botFloor || R.over) return; }
    for (const e of exits.sort((a, b) => U.cheb(a[0], a[1], h.x, h.y) - U.cheb(b[0], b[1], h.x, h.y))) {
      const t = G.travelStep(e[0], e[1]);
      if (t) { const c = G.act.move(t[0], t[1], { force: true }); if (c) return G.endTurn(c); }
    }
  }
  if (G.teleAt(h.x, h.y)) {
    const pref = G.autoExploreStep({ descend: true, ignoreEnemies: true }).dir;
    const off = (d) => pref ? Math.abs(d[0] - pref[0]) + Math.abs(d[1] - pref[1]) : 0;
    const dirs = U.DIRS8.slice().sort((a, b) => off(a) - off(b));
    for (const [dx, dy] of dirs) { const x = h.x + dx, y = h.y + dy; if (G.canEnter(h, x, y) && !G.teleAt(x, y) && !G.isHazardFor(h, x, y)) { return G.endTurn(G.act.move(dx, dy)); } }
  }
  const enemies = G.visibleEnemies();
  const n = nearestEnemy(h);
  if (n) {
    if (n.flags.boss) for (let i = 0; i < 6; i++) { const s = h.items[i]; if (s && s.id === 'bomba' && U.cheb(n.x, n.y, h.x, h.y) <= 6 && U.cheb(n.x, n.y, h.x, h.y) >= 2) return G.endTurn(G.act.item(i, [n.x, n.y])); }
    const c = trySkills(h, enemies, n);
    if (c) return G.endTurn(c);
    if (U.cheb(n.x, n.y, h.x, h.y) <= 1) return G.endTurn(G.act.move(n.x - h.x, n.y - h.y));
    const st = G.travelStep(n.x, n.y);
    if (st) { R.botChase = { x: n.x, y: n.y, ttl: 25 }; const c2 = G.act.move(st[0], st[1], { force: false }); if (c2) return G.endTurn(c2); }
    const s2 = G.autoExploreStep({ descend: true, ignoreEnemies: true });
    if (s2.dir) { const c3 = G.act.move(s2.dir[0], s2.dir[1]); if (c3) return G.endTurn(c3); }
    if (s2.descend || s2.reason === 'stairs') { G.act.descend(); return; }
    return G.endTurn(G.act.wait());
  }
  if (R.botChase && R.botChase.ttl-- > 0 && !(h.x === R.botChase.x && h.y === R.botChase.y)) {
    const st = G.travelStep(R.botChase.x, R.botChase.y);
    if (st) { const c = G.act.move(st[0], st[1]); if (c) return G.endTurn(c); }
  }
  R.botChase = null;
  const s = G.autoExploreStep({ descend: true });
  if (s.dir) { const c = G.act.move(s.dir[0], s.dir[1]); return G.endTurn(c || G.act.wait()); }
  if (s.descend || s.reason === 'stairs') { G.act.descend(); return; }
  const st = R.map.stairs;
  if (st) { const t = G.travelStep(st[0], st[1]); if (t) { const c = G.act.move(t[0], t[1], { force: true }); if (c) return G.endTurn(c); } }
  G.endTurn(G.act.wait());
}

// ---------------------------------------------------------------- percorso fisso
let FIXED = null;
const _descend = G.descend;
G.descend = function () { if (FIXED) for (let i = 0; i < FIXED.length; i++) if (FIXED[i]) G.run.route[i] = FIXED[i]; return _descend.apply(this, arguments); };

// ---------------------------------------------------------------- checkpoint (come il salvataggio del gioco)
function snapshot() {
  const R = G.run;
  const s = JSON.stringify(R, (k, v) => (k === 'hero' || k === 'vis' || k === '_dm' || k === 'rng' || k === 'distMapsDirty') ? undefined : v);
  return { s, rng: R.rng.s };
}
function restore(snap, rngSeed) {
  const R = JSON.parse(snap.s);
  R.rng = new G.RNG(1); R.rng.s = rngSeed === undefined ? snap.rng : (rngSeed >>> 0);
  R.hero = R.ents.find(e => e.kind === 'hero');
  R.vis = new Uint8Array(R.map.w * R.map.h);
  R.distMapsDirty = true; R._dm = null;
  G.run = R; G.computeFOV();
  return R;
}
const BOSS_OF = (R) => { const b = R.ents.find(e => e.flags.boss); return b ? b.type : '?'; };
function bossTrials(K, seedBase) {
  const out = [];
  const snap = snapshot();
  const boss = BOSS_OF(G.run), floor = G.run.floor;
  for (let k = 0; k < K; k++) {
    const R = restore(snap, seedBase + k * 104729);
    const h = R.hero, hp0 = h.hp, t0 = R.turn, it0 = R.stats.itemsUsed;
    let steps = 0, minHp = h.hp, bossDeadAt = null;
    try {
      while (!R.over && G.run.floor === floor && steps++ < 3000) {
        botAct();
        if (G.run.hero.hp < minHp) minHp = G.run.hero.hp;
        if (bossDeadAt === null && !G.run.ents.some(e => e.flags.boss && !e.dead)) bossDeadAt = G.run.turn - t0;
      }
    } catch (e) { }
    const won = (R.over && R.over.win) || G.run.floor > floor;
    out.push({ boss, floor, won, dead: !!(R.over && !R.over.win), turns: bossDeadAt === null ? G.run.turn - t0 : bossDeadAt, minHp: Math.round(100 * Math.max(0, minHp) / h.maxHp), hpStart: Math.round(100 * hp0 / h.maxHp), potions: R.stats.itemsUsed - it0, lvl: h.level, relics: h.relics.length });
  }
  restore(snap);
  return out;
}

function diag() {
  const R = G.run, h = R.hero, m = R.map, sn = (p) => !!(p && m.seen[p[1] * m.w + p[0]]);
  console.error('pos', h.x, h.y, G.TILE[G.tileAt(h.x, h.y)].name, 'explore', JSON.stringify(G.autoExploreStep({ descend: true })).slice(0, 120), 'ign', JSON.stringify(G.autoExploreStep({ descend: true, ignoreEnemies: true })).slice(0, 80));
  console.error('stairs', m.stairs, 'seen', sn(m.stairs), 'travel', JSON.stringify(m.stairs && G.travelStep(m.stairs[0], m.stairs[1])), 'sealed', R.sealed, 'portals', JSON.stringify((R.portals || []).map(p => [p.kind, p.x, p.y, sn([p.x, p.y])])));
  console.error('nemici', G.visibleEnemies().map(e => e.name + '@' + e.x + ',' + e.y + ' ' + e.st.mode).join('; '));
  console.error('log', R.log.slice(-6).map(l => l.text).join(' | '));
  const C = { 0: '#', 1: '.', 2: ',', 3: '"', 4: 'T', 5: '~', 6: '=', 7: '^', 8: ' ', 9: '_', 10: 'b', 11: 'X', 12: '+', 13: 'o', 14: '>', 15: ':', 16: ';', 17: '|', 18: 'i', 19: 'k' };
  let out = '';
  for (let y = Math.max(0, h.y - 10); y < Math.min(m.h, h.y + 11); y++) { let row = ''; for (let x = Math.max(0, h.x - 30); x < Math.min(m.w, h.x + 30); x++) { const e = G.entityAt(x, y); let c = C[G.tileAt(x, y)]; if (e) c = e === h ? '@' : 'M'; if (!m.seen[y * m.w + x] && c !== '@') c = '?'; row += c; } out += row + String.fromCharCode(10); }
  console.error(out);
}

// ---------------------------------------------------------------- partite
const _gain = G.gainRelic, _perk = G.applyPerk;
if (CFG.mode === 'base') { G.gainRelic = () => { }; G.applyPerk = () => { }; }
const results = [];
for (let r = CFG.r0; r < CFG.r0 + CFG.runs; r++) {
  const seed = 50000 + r * 7919;
  let x = seed; pickRng = () => ((x = (x * 1103515245 + 12345) >>> 0) / 4294967296);
  const rt = CFG.route === 'cycle' ? ROUTES[r % ROUTES.length] : CFG.route;
  FIXED = rt.slice();
  G.newRun(CFG.hero, { seed, eclissi: CFG.ecl, route: FIXED });
  let R = G.run;
  R.skillUse = [0, 0, 0, 0];
  const h0 = R.hero;
  if (CFG.mode === 'full') {
    for (const rel of G.RELICS) _gain(h0, rel.id);
    for (const p of G.PERKS) if (!p.hero || p.hero === CFG.hero) _perk(h0, p.id);
    h0.hp = h0.maxHp; R.pending = [];
  }
  for (const id of CFG.inject || []) _gain(h0, id);
  if ((CFG.inject || []).length) { h0.hp = h0.maxHp; R.pending = R.pending.filter(p => p.type !== 'relic'); }
  const floors = [], bosses = [];
  let steps = 0, err = null, lastFloor = 1, floorSteps = 0;
  const mark = () => { const h = G.run.hero; floors.push({ f: G.run.floor, t: G.run.turn, dt: G.run.stats.dmgTaken, dd: G.run.stats.dmgDealt, hp: h.hp, mhp: h.maxHp, lvl: h.level, it: G.run.stats.itemsUsed }); };
  mark();
  try {
    while (!G.run.over && steps < 70000) {
      botAct(); steps++;
      if (G.run.floor !== lastFloor) {
        lastFloor = G.run.floor; floorSteps = 0; mark();
        if (CFG.bossReplays && G.run.ents.some(e => e.flags.boss && !e.dead)) bosses.push(...bossTrials(CFG.bossReplays, seed + G.run.floor));
      }
      if (++floorSteps > 4000) { err = 'bloccato al piano ' + G.run.floor; if (process.env.DEBUG) diag(); break; }
    }
  } catch (e) { err = String(e.stack || e).split(String.fromCharCode(10)).slice(0, 3).join(' | '); }
  R = G.run;
  const h = R.hero;
  mark();
  results.push({
    hero: CFG.hero, policy: CFG.policy, perks: CFG.perks, mode: CFG.mode, disable: CFG.disable, inject: CFG.inject, ecl: CFG.ecl, run: r, route: rt,
    win: !!(R.over && R.over.win), floor: R.floor, lvl: h.level, killer: R.over && !R.over.win ? R.over.cause : '', turns: R.turn,
    dmgTaken: R.stats.dmgTaken, dmgDealt: R.stats.dmgDealt, items: R.stats.itemsUsed, skills: R.skillUse, relics: h.relics.slice(), perkList: Object.keys(h.perks), floors, bosses, err,
  });
}
process.stdout.write(JSON.stringify(results));

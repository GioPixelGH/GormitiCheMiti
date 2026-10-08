'use strict';
// ============================================================
//  data_heroes2.js : i Campioni dei Popoli (eroi sbloccabili)
//  Kolossus, Carrapax, Elios, Barbataus
// ============================================================
(function () {
  const U = G.U, T = G.T, H = G.SK_HELP;

  Object.assign(G.HEROES, {
    kolossus: {
      name: 'Kolossus', title: 'Campione della Terra', elem: 'terra',
      hp: 44, atk: [4, 7], def: 2, eva: 0, crit: 5, critMul: 1.75,
      passive: 'Inarrestabile', passiveDesc: 'Lento (velocità 90), ma immune a stordimento, congelamento e spinte. Ogni nemico abbattuto gli dà 2 di Scudo.',
      desc: 'Il guerriero più massiccio del Popolo della Terra. Plasma il campo di battaglia con muraglie di roccia.',
      skills: ['martello', 'muraglia', 'sfida', 'valanga'], difficulty: 2,
      unlock: 'Raggiungi il Monte Vulcano con Gheos.',
      setup(h) { h.speed = 90; h.mods.stunImmune = true; h.mods.noKnock = true; h.mods.killShield += 2; },
    },
    carrapax: {
      name: 'Carrapax', title: 'Campione del Mare', elem: 'mare',
      hp: 40, atk: [3, 6], def: 2, eva: 4, crit: 6, critMul: 1.75,
      passive: 'Corazza Riflettente', passiveDesc: 'Nuota nell\'acqua profonda. Quando viene colpito in mischia ha il 20% di probabilità di contrattaccare.',
      desc: 'Il cavaliere-granchio del Popolo del Mare. Incassa, risponde colpo su colpo e trascina le maree.',
      skills: ['chela', 'guscio', 'marea', 'tsunami'], difficulty: 2,
      unlock: 'Sconfiggi Glaciator, il Re dei Ghiacci.',
      setup(h) { h.flags.swim = true; },
    },
    elios: {
      name: 'Elios', title: 'Campione dell\'Aria', elem: 'aria',
      hp: 48, atk: [4, 7], def: 2, eva: 14, crit: 12, critMul: 1.9,
      passive: 'Vento in Poppa', passiveDesc: 'Vede 2 caselle più lontano. Dopo ogni abilità diventa Rapido per un breve momento.',
      desc: 'L\'arciere dei venti, figlio del sole. Colpisce da lontano e non si fa mai raggiungere.',
      skills: ['freccia', 'ventaglio', 'corrente', 'sole'], difficulty: 3,
      unlock: 'Sconfiggi Luxalion Corrotto.',
      setup(h) { h.mods.sight += 2; },
    },
    barbataus: {
      name: 'Barbataus', title: 'Campione della Foresta', elem: 'foresta',
      hp: 44, atk: [3, 6], def: 1, eva: 6, crit: 5, critMul: 1.75,
      passive: 'Custode del Bosco', passiveDesc: 'Le sue evocazioni hanno il 50% di PV in più e i suoi attacchi avvelenano (1).',
      desc: 'Il druido barbuto della Foresta. Combatte circondato dagli spiriti del bosco.',
      skills: ['lupo_sp', 'fiore', 'sciame', 'guardiano'], difficulty: 2,
      unlock: 'Sconfiggi 250 nemici in totale (in tutte le partite).',
      setup(h) { h.mods.poisonOnHit += 1; h.mods.summonHp = 1.5; },
    },
  });
  G.HERO_ORDER = ['gheos', 'tasarau', 'poivrons', 'noctis', 'saggio', 'luminescente', 'kolossus', 'carrapax', 'elios', 'barbataus'];

  const summon = (h, type, x, y, life) => {
    const a = H.summonAlly(h, type, x, y, life);
    if (h.mods.summonHp) { a.maxHp = Math.round(a.maxHp * h.mods.summonHp); a.hp = a.maxHp; }
    return a;
  };
  const adjEnemies = (h, x, y, r) => G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.cheb(o.x, o.y, x, y) <= r);

  Object.assign(G.SKILLS, {
    // ===================== KOLOSSUS =====================
    martello: {
      name: 'Martello Tellurico', glyph: '⚒', icon: 'hammer', elem: 'terra', cd: 4, target: 'enemy', range: 1,
      desc: (h) => `Un colpo devastante a un nemico adiacente: ${h.up.martello_up ? 260 : 210}% danni, lo rallenta${h.up.martello_up ? ' e lo stordisce' : ''}. Abbatte anche i muri incrinati vicini.`,
      use(h, t) {
        G.fx.shake(6); G.fx.sound('quake'); G.fx.dust(t.x, t.y, 0);
        G.dealDamage(h, t, H.dmg(h, h.up.martello_up ? 2.6 : 2.1), { elem: 'terra' });
        if (!t.dead) { G.addStatus(t, 'slow', 3); if (h.up.martello_up) G.addStatus(t, 'stun', 1); }
        G.breakWallsAround(t.x, t.y, 1);
        return true;
      },
    },
    muraglia: {
      name: 'Muraglia di Pietra', glyph: '▤', icon: 'wall', elem: 'terra', cd: 9, target: 'dir',
      desc: (h) => `Solleva una muraglia larga ${h.up.muraglia_up ? 5 : 3} caselle a 2 passi da te, per ${h.up.muraglia_up ? 12 : 8} turni: blocca nemici, proiettili e vista.`,
      area: (h, dx, dy) => {
        const w = h.up.muraglia_up ? 2 : 1, px = -dy, py = dx, out = [];
        for (let k = -w; k <= w; k++) out.push([h.x + dx * 2 + px * k, h.y + dy * 2 + py * k]);
        return out;
      },
      use(h, dir) {
        const R = G.run, tiles = G.SKILLS.muraglia.area(h, dir[0], dir[1]);
        let n = 0;
        for (const [x, y] of tiles) {
          const t = G.tileAt(x, y);
          if (!G.inb(x, y) || G.TILE[t].solid || t === T.STAIRS || t === T.CHASM || t === T.DEEP || t === T.LAVA) continue;
          if (G.entityAt(x, y) || G.featureAt(x, y) || R.items.some(i => i.x === x && i.y === y)) continue;
          R.tempTiles.push({ x, y, orig: t, tile: T.PILLAR, t: h.up.muraglia_up ? 12 : 8 });
          G.setTile(x, y, T.PILLAR); G.fx.dust(x, y, 0); n++;
        }
        if (!n) { G.log('Non c\'è spazio per la muraglia.', 'bad'); return false; }
        R.distMapsDirty = true;
        G.fx.shake(5); G.fx.sound('stone');
        return true;
      },
    },
    sfida: {
      name: 'Grido di Sfida', glyph: '❗', icon: 'shout', elem: 'terra', cd: 8, target: 'self',
      desc: (h) => `Attira di 2 caselle i nemici entro 5, li Indebolisce per 3 turni e ti dà uno Scudo di ${6 + h.level}.${h.up.sfida_up ? ' Ottieni anche +3 armatura per 4 turni.' : ''}`,
      use(h) {
        const vs = G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.inRadius(h.x, h.y, o.x, o.y, 5) && G.visible(o.x, o.y))
          .sort((a, b) => U.cheb(a.x, a.y, h.x, h.y) - U.cheb(b.x, b.y, h.x, h.y));
        for (const o of vs) { G.pull(h, o, 2); if (!o.dead) { G.addStatus(o, 'weak', 3); G.alert(o, h); } }
        G.addStatus(h, 'shield', 8, 6 + h.level);
        if (h.up.sfida_up) G.addStatus(h, 'stoneskin', 4, 3);
        G.fx.ring(h.x, h.y, 5, '#e0a050'); G.fx.sound('roar'); G.fx.shake(4);
        return true;
      },
    },
    valanga: {
      name: 'Valanga di Massi', glyph: '☄', icon: 'boulders', elem: 'terra', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. ${h.up.valanga_up ? 8 : 5} massi precipitano su nemici visibili entro 7: 180% danni ciascuno e li spingono via.`,
      use(h) {
        const vs = H.visibleEnemiesIn(h, 7);
        G.fx.shake(10); G.fx.sound('quake');
        for (let i = 0; i < (h.up.valanga_up ? 8 : 5); i++) {
          const alive = vs.filter(o => !o.dead); if (!alive.length) break;
          const o = G.run.rng.pick(alive);
          G.fx.projectile(o.x, o.y - 6, o.x, o.y, 'rock', i * 80);
          G.dealDamage(h, o, H.dmg(h, 1.8), { elem: 'terra', delay: 120 + i * 80 });
          if (!o.dead) G.knockback(h, o, 1);
        }
        return true;
      },
    },

    // ===================== CARRAPAX =====================
    chela: {
      name: 'Chela Stritolante', glyph: '✂', icon: 'pincer', elem: 'mare', cd: 4, target: 'enemy', range: 1,
      desc: (h) => `Afferra un nemico adiacente: ${h.up.chela_up ? 200 : 150}% danni, lo immobilizza per 2 turni e lo rende Vulnerabile per ${h.up.chela_up ? 5 : 3}.`,
      use(h, t) {
        G.fx.sound('hit'); G.fx.burst(t.x, t.y, '#7ac0e0', 10);
        G.dealDamage(h, t, H.dmg(h, h.up.chela_up ? 2.0 : 1.5), { elem: 'mare' });
        if (!t.dead) { G.addStatus(t, 'root', 2); G.addStatus(t, 'vuln', h.up.chela_up ? 5 : 3); }
        return true;
      },
    },
    guscio: {
      name: 'Guscio d\'Acciaio', glyph: '⬢', icon: 'shell', elem: 'mare', cd: 10, target: 'self',
      desc: (h) => `Si chiude nel guscio: Scudo di ${10 + Math.round(h.level * 1.5)} e per ${h.up.guscio_up ? 5 : 3} turni rimanda il 50% dei danni in mischia.${h.up.guscio_up ? '' : ' Resta immobile per 2 turni.'}`,
      use(h) {
        G.addStatus(h, 'shield', 10, 10 + Math.round(h.level * 1.5));
        G.addStatus(h, 'shell', h.up.guscio_up ? 5 : 3);
        if (!h.up.guscio_up) h.status.root = { t: 2, p: 0 };
        G.fx.ring(h.x, h.y, 1, '#7ac0e0'); G.fx.sound('shield');
        return true;
      },
    },
    marea: {
      name: 'Marea Montante', glyph: '≈', icon: 'tide', elem: 'mare', cd: 8, target: 'self',
      desc: (h) => `Allaga il terreno entro ${h.up.marea_up ? 3 : 2}: i nemici diventano Bagnati e Rallentati; tu curi il ${h.up.marea_up ? 20 : 10}% dei PV.`,
      area: (h) => H.circleTiles(h.x, h.y, h.up.marea_up ? 3 : 2),
      use(h) {
        const r = h.up.marea_up ? 3 : 2;
        for (const [x, y] of H.circleTiles(h.x, h.y, r)) {
          const t = G.tileAt(x, y);
          if (t === T.FLOOR || t === T.SAND || t === T.ASH || t === T.GRASS || t === T.RUBBLE) G.setTile(x, y, T.SHALLOW);
          if (G.inb(x, y)) G.run.map.fire[G.idx(x, y)] = 0;
        }
        for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.inRadius(h.x, h.y, o.x, o.y, r))) { G.addStatus(o, 'wet', 5); G.addStatus(o, 'slow', 3); }
        G.heal(h, h.maxHp * (h.up.marea_up ? 0.2 : 0.1));
        G.addStatus(h, 'wet', 4);
        G.fx.ring(h.x, h.y, r, '#4aa0ff'); G.fx.sound('wave');
        return true;
      },
    },
    tsunami: {
      name: 'Tsunami del Vendicatore', glyph: '🌊', icon: 'tsunami', elem: 'mare', ult: true, target: 'dir',
      desc: (h) => `POTERE SUPREMO. Carica fino a ${h.up.tsunami_up ? 8 : 6} caselle travolgendo i nemici sulla strada: ${h.up.tsunami_up ? 260 : 200}% danni, li scaraventa di lato e lascia una scia d'acqua.`,
      area: (h, dx, dy) => H.lineTiles(h, dx, dy, h.up.tsunami_up ? 8 : 6, true),
      use(h, dir) {
        if (!dir) return false;
        const [dx, dy] = dir, range = h.up.tsunami_up ? 8 : 6, mult = h.up.tsunami_up ? 2.6 : 2.0;
        let moved = 0;
        G.fx.sound('wave'); G.fx.shake(8);
        for (let i = 0; i < range; i++) {
          const nx = h.x + dx, ny = h.y + dy;
          if (G.isSolid(nx, ny)) break;
          const o = G.entityAt(nx, ny);
          if (o && G.hostile(o, h)) {
            G.dealDamage(h, o, H.dmg(h, mult), { elem: 'mare' });
            if (!o.dead) { G.addStatus(o, 'wet', 5); G.knockback(h, o, 2, [-dy, dx]); }
            if (!o.dead && G.entityAt(nx, ny) === o) break;
          } else if (o) break;
          if (!G.canEnter(h, nx, ny)) break;
          const t = G.tileAt(h.x, h.y);
          if (t === T.FLOOR || t === T.SAND || t === T.ASH || t === T.GRASS) G.setTile(h.x, h.y, T.SHALLOW);
          G.moveTo(h, nx, ny, { dash: true, slide: true }); moved++;
          if (h.dead || G.run.pendingDescend) return true;
        }
        if (!moved) G.fx.ring(h.x, h.y, 1, '#4aa0ff');
        return true;
      },
    },

    // ===================== ELIOS =====================
    freccia: {
      name: 'Freccia del Vento', glyph: '➹', icon: 'arrow', elem: 'aria', cd: 2, target: 'enemy', range: 8,
      desc: (h) => `Una freccia che trapassa tutti i nemici in linea: 170% danni e li spinge indietro di 1.${h.up.freccia_up ? ' Si ricarica in 1 turno.' : ''}`,
      use(h, t) {
        const path = G.projectilePath(h.x, h.y, t.x, t.y, 8 + h.mods.rangeBonus, true);
        if (!path.length) return false;
        const end = path[path.length - 1];
        G.fx.projectile(h.x, h.y, end[0], end[1], 'wind'); G.fx.sound('shoot');
        for (const p of path) { const o = G.entityAt(p[0], p[1]); if (o && G.hostile(o, h)) { G.dealDamage(h, o, H.dmg(h, 1.7), { elem: 'aria', delay: 100 }); if (!o.dead) G.knockback(h, o, 1); } }
        return true;
      },
    },
    ventaglio: {
      name: 'Ventaglio di Piume', glyph: '❦', icon: 'fan', elem: 'aria', cd: 6, target: 'dir',
      desc: (h) => `Un ventaglio di piume taglienti a cono: ${h.up.ventaglio_up ? 160 : 120}% danni a tutti i nemici colpiti, che restano Indeboliti per 2 turni.`,
      area: (h, dx, dy) => G.AI.shapes.cone(h.x, h.y, dx, dy, 5),
      use(h, dir) {
        const tiles = G.AI.shapes.cone(h.x, h.y, dir[0], dir[1], 5);
        G.fx.sound('wind');
        for (const [x, y] of tiles) {
          if (G.run.rng.chance(0.5)) G.fx.burst(x, y, '#e8f8ff', 2);
          const o = G.entityAt(x, y);
          if (o && G.hostile(o, h) && G.hasLOS(h.x, h.y, x, y)) { G.dealDamage(h, o, H.dmg(h, h.up.ventaglio_up ? 1.6 : 1.2), { elem: 'aria' }); if (!o.dead) G.addStatus(o, 'weak', 2); }
        }
        return true;
      },
    },
    corrente: {
      name: 'Corrente Ascensionale', glyph: '⇑', icon: 'updraft', elem: 'aria', cd: 8, target: 'tile', range: 5,
      desc: (h) => `Si lascia portare dal vento in una casella visibile entro 5 e diventa Invisibile per 2 turni.${h.up.corrente_up ? ' All\'atterraggio colpisce i nemici adiacenti (100%).' : ''}`,
      valid(h, x, y) { return G.visible(x, y) && G.canEnter(h, x, y) && !G.isHazardFor(h, x, y) && G.tileAt(x, y) !== T.CHASM; },
      use(h, p) {
        if (!G.SKILLS.corrente.valid(h, p[0], p[1])) return false;
        const ox = h.x, oy = h.y;
        h.x = p[0]; h.y = p[1]; G.run.distMapsDirty = true;
        G.fx.trail(ox, oy, p[0], p[1], '#e8f8ff'); G.fx.teleport(h, ox, oy); G.fx.sound('dash');
        G.addStatus(h, 'invis', 2);
        for (const m of G.run.ents) if (m.kind === 'monster' && m.st.mode === 'hunt') m.st.lost = 6;
        if (h.up.corrente_up) for (const o of adjEnemies(h, h.x, h.y, 1)) G.dealDamage(h, o, H.dmg(h, 1.0), { elem: 'aria' });
        G.onEnter(h, {});
        return true;
      },
    },
    sole: {
      name: 'Sole di Mezzogiorno', glyph: '☀', icon: 'sun', elem: 'luce', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Il sole esplode nel cielo: ${h.up.sole_up ? 240 : 190}% danni a tutti i nemici visibili entro 8, che restano Accecati per 3 turni.`,
      use(h) {
        G.fx.flash('#fff6c0'); G.fx.sound('holy'); G.fx.shake(8);
        for (const o of H.visibleEnemiesIn(h, 8)) {
          G.fx.bolt(h.x, h.y, o.x, o.y, '#ffe27a');
          G.dealDamage(h, o, H.dmg(h, h.up.sole_up ? 2.4 : 1.9), { elem: 'luce', delay: 80 });
          if (!o.dead) G.addStatus(o, 'blind', 3);
        }
        return true;
      },
    },

    // ===================== BARBATAUS =====================
    lupo_sp: {
      name: 'Lupo Spirituale', glyph: '🐺', icon: 'wolf', elem: 'foresta', cd: 10, target: 'self',
      desc: (h) => `Evoca ${h.up.lupo_up ? 2 : 1} Lupo/i Spirituale/i che combatte al tuo fianco per 18 turni.`,
      use(h) {
        const spots = H.freeAdjacent(h.x, h.y, h); G.run.rng.shuffle(spots);
        const n = Math.min(spots.length, h.up.lupo_up ? 2 : 1);
        if (!n) { G.log('Non c\'è spazio per evocare.', 'bad'); return false; }
        for (let i = 0; i < n; i++) { const a = summon(h, 'lupospirito', spots[i][0], spots[i][1], 18); a.speed = 130; }
        G.fx.ring(h.x, h.y, 1.5, '#9be35a'); G.fx.sound('summon');
        return true;
      },
    },
    fiore: {
      name: 'Fiore della Vita', glyph: '✿', icon: 'flower', elem: 'foresta', cd: 9, target: 'self',
      desc: (h) => `Fa sbocciare accanto a te un Fiore della Vita per 12 turni: finché gli resti entro 2 caselle, ti cura di ${2 + Math.floor(h.level / 4) + (h.up.fiore_up ? 2 : 0)} PV a turno.`,
      use(h) {
        const spots = H.freeAdjacent(h.x, h.y, h);
        if (!spots.length) { G.log('Non c\'è spazio per il fiore.', 'bad'); return false; }
        const p = G.run.rng.pick(spots);
        const a = summon(h, 'fiore', p[0], p[1], 12);
        a.atk = [0, 0]; a.flags.bonusHeal = h.up.fiore_up ? 2 : 0;
        if (h.up.fiore_up) G.cleanse(h);
        G.fx.sound('heal');
        return true;
      },
    },
    sciame: {
      name: 'Sciame di Api', glyph: '✺', icon: 'bees', elem: 'foresta', cd: 6, target: 'enemy', range: 6,
      desc: (h) => `Uno sciame avvolge il bersaglio e chi gli sta accanto: 60% danni, veleno (${h.up.sciame_up ? 5 : 3}) e Confusione per 2 turni.`,
      use(h, t) {
        G.fx.sound('roots');
        for (const o of [t].concat(adjEnemies(h, t.x, t.y, 1).filter(o => o !== t))) {
          G.fx.burst(o.x, o.y, '#ffd23a', 10);
          G.dealDamage(h, o, H.dmg(h, 0.6), { elem: 'foresta' });
          if (!o.dead) { G.addStatus(o, 'poison', 5, h.up.sciame_up ? 5 : 3); G.addStatus(o, 'confuse', 2); }
        }
        return true;
      },
    },
    guardiano: {
      name: 'Guardiano Antico', glyph: '♣', icon: 'tree', elem: 'foresta', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Risveglia un Guardiano Antico che combatte per te per ${h.up.guardiano_up ? 40 : 25} turni e cura completamente le tue evocazioni.`,
      use(h) {
        const spots = H.freeAdjacent(h.x, h.y, h);
        if (!spots.length) { G.log('Non c\'è spazio per il Guardiano.', 'bad'); return false; }
        const p = G.run.rng.pick(spots);
        const a = summon(h, 'antico', p[0], p[1], h.up.guardiano_up ? 40 : 25);
        a.maxHp = a.hp = Math.round((40 + h.level * 6) * (h.mods.summonHp || 1));
        a.atk = [4 + Math.floor(h.level / 2), 7 + h.level]; a.def = 3 + Math.floor(h.level / 5);
        for (const o of G.run.ents) if (!o.dead && o.kind === 'ally') o.hp = o.maxHp;
        G.fx.ring(h.x, h.y, 3, '#6ee05a'); G.fx.sound('summon'); G.fx.shake(6);
        return true;
      },
    },
  });

  // ------------------------------------------------------------ Doni dei nuovi eroi
  const P = (id, name, desc, apply, o) => Object.assign({ id, name, desc, apply, w: 10, max: 1 }, o || {});
  const NEW_PERKS = [
    P('martello_up', 'Martello: Frana', 'Il Martello Tellurico infligge 260% danni e stordisce.', h => { h.up.martello_up = true; }, { hero: 'kolossus' }),
    P('muraglia_up', 'Muraglia: Bastione', 'La Muraglia è larga 5 e dura 12 turni.', h => { h.up.muraglia_up = true; }, { hero: 'kolossus', tag: 'difesa' }),
    P('sfida_up', 'Sfida: Ruggito di Pietra', 'Il Grido di Sfida dà anche +3 armatura per 4 turni.', h => { h.up.sfida_up = true; }, { hero: 'kolossus', tag: 'difesa' }),
    P('valanga_up', 'Valanga: Montagna che Crolla', 'La Valanga scaglia 8 massi.', h => { h.up.valanga_up = true; }, { hero: 'kolossus' }),
    P('kolossus_roccia', 'Roccia Viva', '+15 PV massimi e +1 armatura.', h => { h.maxHp += 15; h.hp += 15; h.def += 1; }, { hero: 'kolossus', tag: 'vita' }),
    P('chela_up', 'Chela: Morsa d\'Acciaio', 'La Chela infligge 200% danni e la Vulnerabilità dura 5 turni.', h => { h.up.chela_up = true; }, { hero: 'carrapax', tag: 'critico' }),
    P('guscio_up', 'Guscio: Fortezza Mobile', 'Il Guscio dura 5 turni e non ti immobilizza.', h => { h.up.guscio_up = true; }, { hero: 'carrapax', tag: 'difesa' }),
    P('marea_up', 'Marea: Alta Marea', 'La Marea ha raggio 3 e cura il 20%.', h => { h.up.marea_up = true; }, { hero: 'carrapax', tag: 'vita' }),
    P('tsunami_up', 'Tsunami: Furia degli Abissi', 'Lo Tsunami arriva a 8 caselle e infligge 260% danni.', h => { h.up.tsunami_up = true; }, { hero: 'carrapax' }),
    P('carrapax_corallo', 'Corazza di Corallo', '+2 armatura.', h => { h.def += 2; }, { hero: 'carrapax', tag: 'difesa' }),
    P('freccia_up', 'Freccia: Tiro Rapido', 'La Freccia del Vento si ricarica in 1 turno.', h => { h.up.freccia_up = true; }, { hero: 'elios', tag: 'tempesta' }),
    P('ventaglio_up', 'Ventaglio: Lame di Vento', 'Il Ventaglio infligge 160% danni.', h => { h.up.ventaglio_up = true; }, { hero: 'elios' }),
    P('corrente_up', 'Corrente: Picchiata', 'All\'atterraggio la Corrente colpisce i nemici adiacenti.', h => { h.up.corrente_up = true; }, { hero: 'elios', tag: 'tempesta' }),
    P('sole_up', 'Sole: Zenit', 'Il Sole di Mezzogiorno infligge 240% danni.', h => { h.up.sole_up = true; }, { hero: 'elios' }),
    P('elios_occhio', 'Occhio del Falco', '+8% critico e +2 gittata alle abilità.', h => { h.crit += 8; h.mods.rangeBonus += 2; }, { hero: 'elios', tag: 'critico' }),
    P('lupo_up', 'Lupo: Branco Spirituale', 'Evochi 2 Lupi Spirituali.', h => { h.up.lupo_up = true; }, { hero: 'barbataus' }),
    P('fiore_up', 'Fiore: Bocciolo Puro', 'Il Fiore cura 2 PV in più e ti purifica quando sboccia.', h => { h.up.fiore_up = true; }, { hero: 'barbataus', tag: 'vita' }),
    P('sciame_up', 'Sciame: Alveare Furioso', 'Lo Sciame avvelena per 5.', h => { h.up.sciame_up = true; }, { hero: 'barbataus', tag: 'veleno' }),
    P('guardiano_up', 'Guardiano: Radici Profonde', 'Il Guardiano Antico resta per 40 turni.', h => { h.up.guardiano_up = true; }, { hero: 'barbataus' }),
    P('barbataus_branco', 'Spirito del Branco', 'Le tue evocazioni infliggono il 30% di danni in più.', h => { h.mods.allyDmg = (h.mods.allyDmg || 0) + 0.3; }, { hero: 'barbataus', tag: 'furia' }),
  ];
  for (const p of NEW_PERKS) { G.PERKS.push(p); G.PERK_BY_ID[p.id] = p; }
})();

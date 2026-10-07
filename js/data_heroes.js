'use strict';
// ============================================================
//  data_heroes.js : eroi giocabili e abilità
// ============================================================
(function () {
  const U = G.U, T = G.T;

  G.HEROES = {
    gheos: {
      name: 'Gheos', title: 'Signore della Terra', elem: 'terra',
      hp: 40, atk: [3, 6], def: 2, eva: 3, crit: 5, critMul: 1.75,
      passive: 'Pelle di Roccia', passiveDesc: 'Riduce di 1 ogni danno subito e non può essere spinto.',
      desc: 'Un colosso di pietra antica. Lento a cadere, devastante quando colpisce. Ideale per iniziare.',
      skills: ['pugno', 'carica', 'scudoroccia', 'terremoto'], difficulty: 1,
      setup(h) { h.mods.noKnock = true; h.mods.flatReduce = 1; },
    },
    tasarau: {
      name: 'Tasarau', title: 'Signore della Foresta', elem: 'foresta',
      hp: 42, atk: [4, 6], def: 1, eva: 6, crit: 6, critMul: 1.75,
      passive: 'Linfa Eterna', passiveDesc: 'Rigenera PV col tempo (più velocemente sull\'erba) e non subisce Ustioni. Nell\'erba alta è invisibile ai nemici non adiacenti.',
      desc: 'Lo spirito della foresta. Controlla il campo con radici e veleno, e cura sé stesso.',
      skills: ['radici', 'spine', 'linfa', 'risveglio'], difficulty: 2,
      setup(h) { },
    },
    poivrons: {
      name: 'Poivrons', title: 'Signore del Mare', elem: 'mare',
      hp: 40, atk: [3, 7], def: 1, eva: 6, crit: 6, critMul: 1.75,
      passive: 'Figlio delle Onde', passiveDesc: 'Nuota nell\'acqua profonda e rigenera 1 PV a turno stando in acqua. Infligge +25% danni ai nemici Bagnati.',
      desc: 'Il guardiano degli abissi. Colpisce dalla distanza e respinge i nemici con le maree.',
      skills: ['getto', 'onda', 'bolla', 'maremoto'], difficulty: 2,
      setup(h) { h.flags.swim = true; },
    },
    noctis: {
      name: 'Noctis', title: 'Signore dell\'Aria', elem: 'aria',
      hp: 38, atk: [4, 7], def: 1, eva: 15, crit: 15, critMul: 2.0,
      passive: 'Ali della Tempesta', passiveDesc: 'Vola: ignora baratri, lava, acqua profonda e trappole. Alta probabilità di critico.',
      desc: 'Il signore dei venti. Fragile ma rapidissimo: colpisce, sfreccia via e scatena fulmini.',
      skills: ['raffica', 'fulmine', 'vortice', 'tempesta'], difficulty: 3,
      setup(h) { h.flags.fly = true; },
    },
    saggio: {
      name: 'Vecchio Saggio', title: 'Custode dell\'Occhio della Vita', elem: 'neutro',
      hp: 33, atk: [3, 6], def: 0, eva: 8, crit: 8, critMul: 1.75,
      passive: 'Sapienza Antica', passiveDesc: 'Ottiene il 20% di esperienza in più. I suoi dardi non mancano mai.',
      desc: 'Il creatore dei Popoli della Natura. Non ha debolezze elementali e piega lo spazio stesso.',
      skills: ['dardo', 'passo', 'sigillo', 'occhio'], difficulty: 3,
      unlock: 'Sconfiggi Obscurio, Signore delle Tenebre.',
      setup(h) { h.mods.xpMul = 1.2; },
    },
    luminescente: {
      name: 'Sommo Luminescente', title: 'Signore della Luce', elem: 'luce',
      hp: 35, atk: [3, 6], def: 1, eva: 6, crit: 8, critMul: 1.75,
      passive: 'Aura Radiosa', passiveDesc: 'Vede 2 caselle più lontano. All\'inizio di ogni turno brucia i nemici adiacenti.',
      desc: 'Il nemico giurato dell\'oscurità. La sua luce acceca e purifica.',
      skills: ['raggio', 'bagliore', 'prisma', 'supernova'], difficulty: 2,
      unlock: 'Vinci una partita con qualsiasi eroe.',
      setup(h) { h.mods.sight = 2; },
    },
  };
  G.HERO_ORDER = ['gheos', 'tasarau', 'poivrons', 'noctis', 'saggio', 'luminescente'];

  // ------------------------------------------------------------
  //  Helper comuni
  // ------------------------------------------------------------
  const H = G.SK_HELP = {
    dmg(h, mult) { return G.rollDmg(h) * mult; },
    // fulmine a catena
    chainLightning(h, first, dmg, jumps, label, stun) {
      const hit = [first];
      let cur = first;
      const zap = (from, to, amount) => {
        G.fx.bolt(from.x, from.y, to.x, to.y, '#bfe8ff');
        const m = to.status.wet ? 2 : 1;
        G.dealDamage(h, to, amount * m, { elem: 'aria', delay: 60 });
        if (!to.dead && stun) G.addStatus(to, 'stun', 1);
      };
      zap(h, first, dmg);
      for (let j = 0; j < jumps; j++) {
        const next = G.run.ents.filter(o => !o.dead && G.hostile(o, h) && !hit.includes(o) && U.cheb(o.x, o.y, cur.x, cur.y) <= 3 && G.hasLOS(cur.x, cur.y, o.x, o.y))
          .sort((a, b) => U.cheb(a.x, a.y, cur.x, cur.y) - U.cheb(b.x, b.y, cur.x, cur.y))[0];
        if (!next) break;
        zap(cur, next, dmg * 0.7);
        hit.push(next); cur = next;
      }
      G.fx.sound('zap');
    },
    squareTiles(x, y, r) { const out = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx || dy) out.push([x + dx, y + dy]); return out; },
    circleTiles(x, y, r) { const out = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (U.inRadius(x, y, x + dx, y + dy, r)) out.push([x + dx, y + dy]); return out; },
    lineTiles(h, dx, dy, len, stopSolid) {
      const out = [];
      for (let i = 1; i <= len; i++) {
        const x = h.x + dx * i, y = h.y + dy * i;
        if (stopSolid && G.isSolid(x, y)) break;
        out.push([x, y]);
      }
      return out;
    },
    // cono/onda larga 3
    waveTiles(h, dx, dy, len) {
      const out = [], px = -dy, py = dx;
      for (let i = 1; i <= len; i++) {
        for (let k = -1; k <= 1; k++) {
          const x = h.x + dx * i + px * k, y = h.y + dy * i + py * k;
          if (G.isSolid(x, y)) continue;
          if (!out.some(p => p[0] === x && p[1] === y)) out.push([x, y]);
        }
      }
      return out;
    },
    visibleEnemiesIn(h, r) {
      return G.run.ents.filter(o => !o.dead && G.hostile(o, h) && o.kind !== 'hero' && G.visible(o.x, o.y) && U.inRadius(h.x, h.y, o.x, o.y, r));
    },
    summonAlly(h, type, x, y, life) {
      const a = G.makeMonster(type, x, y, { faction: 'player', summon: true, life, awake: true });
      a.kind = 'ally';
      a.flags.summoned = true;
      // scala con l'eroe
      a.maxHp = a.hp = 14 + h.level * 4;
      a.atk = [2 + Math.floor(h.level / 2), 4 + Math.floor(h.level * 0.8)];
      a.def = 1 + Math.floor(h.level / 4);
      G.fx.spawn(a);
      return a;
    },
    freeAdjacent(x, y, e) {
      const out = [];
      for (const [dx, dy] of U.DIRS8) if (G.canEnter(e || { flags: {} }, x + dx, y + dy) && !G.isHazardFor(e || { flags: {}, kind: 'hero' }, x + dx, y + dy)) out.push([x + dx, y + dy]);
      return out;
    },
  };

  // ------------------------------------------------------------
  //  Abilità
  //  target: 'self' | 'dir' | 'enemy' | 'tile'
  // ------------------------------------------------------------
  G.SKILLS = {
    // ===================== GHEOS =====================
    pugno: {
      name: 'Pugno Sismico', glyph: '✊', elem: 'terra', cd: 5, target: 'self',
      desc: (h) => `Colpisce il suolo: tutti i nemici entro ${h.up.pugno_r ? 2 : 1} caselle subiscono ${h.up.pugno_dmg ? 180 : 120}% danni e restano storditi per ${h.up.pugno_dmg ? 2 : 1} turno/i.`,
      area: (h) => H.squareTiles(h.x, h.y, h.up.pugno_r ? 2 : 1),
      use(h) {
        const r = h.up.pugno_r ? 2 : 1, mult = h.up.pugno_dmg ? 1.8 : 1.2, stun = h.up.pugno_dmg ? 2 : 1;
        G.fx.ring(h.x, h.y, r + 0.5, '#e0a050'); G.fx.shake(6); G.fx.sound('quake');
        G.fx.dust(h.x, h.y, r);
        for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.cheb(o.x, o.y, h.x, h.y) <= r)) {
          G.dealDamage(h, o, H.dmg(h, mult), { elem: 'terra' });
          if (!o.dead) G.addStatus(o, 'stun', stun);
        }
        return true;
      },
    },
    carica: {
      name: 'Carica del Masso', glyph: '➤', elem: 'terra', cd: 7, target: 'dir',
      desc: (h) => `Carica in linea retta fino a ${h.up.carica_r ? 6 : 4} caselle. Il primo nemico colpito subisce 150% danni e viene scagliato indietro di ${h.up.carica_r ? 3 : 2} caselle${h.up.carica_r ? ' e stordito' : ''}.`,
      area: (h, dx, dy) => H.lineTiles(h, dx, dy, h.up.carica_r ? 6 : 4, true),
      use(h, dir) {
        const [dx, dy] = dir, range = h.up.carica_r ? 6 : 4;
        let hit = null, steps = 0;
        for (let i = 0; i < range; i++) {
          const nx = h.x + dx, ny = h.y + dy;
          const o = G.entityAt(nx, ny);
          if (o && G.hostile(o, h)) { hit = o; break; }
          if (!G.canEnter(h, nx, ny) || G.isHazardFor(h, nx, ny)) break;
          G.moveTo(h, nx, ny, { dash: true }); steps++;
          if (h.dead || G.run.pendingDescend) return true;
        }
        if (!hit && steps === 0) return false;
        G.fx.sound('charge');
        if (hit) {
          G.dealDamage(h, hit, H.dmg(h, 1.5 + steps * 0.1), { elem: 'terra' });
          if (!hit.dead) { G.knockback(h, hit, h.up.carica_r ? 3 : 2, [dx, dy]); if (!hit.dead && h.up.carica_r) G.addStatus(hit, 'stun', 1); }
          G.fx.shake(5);
        }
        return true;
      },
    },
    scudoroccia: {
      name: 'Scudo di Roccia', glyph: '⛨', elem: 'terra', cd: 10, target: 'self',
      desc: (h) => `Si ricopre di roccia: ottiene uno Scudo di ${Math.round((10 + h.level * 2) * (h.up.scudo_big ? 1.5 : 1))} PV per 8 turni.${h.mods.reflectShield ? ' Mentre è attivo, rimanda il 40% dei danni in mischia.' : ''}`,
      use(h) {
        const amt = Math.round((10 + h.level * 2) * (h.up.scudo_big ? 1.5 : 1));
        G.addStatus(h, 'shield', 8, amt);
        G.fx.ring(h.x, h.y, 1, '#c8a070'); G.fx.sound('shield');
        return true;
      },
    },
    terremoto: {
      name: 'Terremoto', glyph: '☄', elem: 'terra', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Scuote la terra: tutti i nemici visibili entro ${h.up.terremoto_r ? 7 : 5} caselle subiscono 220% danni e restano storditi per 2 turni.`,
      area: (h) => H.circleTiles(h.x, h.y, h.up.terremoto_r ? 7 : 5),
      use(h) {
        const r = h.up.terremoto_r ? 7 : 5;
        G.fx.shake(14); G.fx.sound('quake'); G.fx.ring(h.x, h.y, r, '#e0a050'); G.fx.dust(h.x, h.y, r);
        for (const o of H.visibleEnemiesIn(h, r)) {
          G.dealDamage(h, o, H.dmg(h, 2.2), { elem: 'terra', delay: 80 });
          if (!o.dead) G.addStatus(o, 'stun', 2);
        }
        return true;
      },
    },

    // ===================== TASARAU =====================
    radici: {
      name: 'Radici Avvolgenti', glyph: '♣', elem: 'foresta', cd: 5, target: 'enemy', range: 6,
      desc: (h) => `Radici emergono sotto un nemico entro ${6 + h.mods.rangeBonus} caselle: 90% danni, lo immobilizzano per ${h.up.radici_dur ? 5 : 3} turni e lo avvelenano (${h.up.radici_dur ? 4 : 2}).${h.up.radici_area ? ' Colpisce anche i nemici adiacenti al bersaglio.' : ''}`,
      use(h, t) {
        let targets = [t];
        if (h.up.radici_area) targets = targets.concat(G.run.ents.filter(o => !o.dead && o !== t && G.hostile(o, h) && U.cheb(o.x, o.y, t.x, t.y) <= 1));
        G.fx.sound('roots');
        for (const o of targets) {
          G.fx.roots(o.x, o.y);
          G.dealDamage(h, o, H.dmg(h, 0.9), { elem: 'foresta' });
          if (!o.dead) { G.addStatus(o, 'root', h.up.radici_dur ? 5 : 3); G.addStatus(o, 'poison', 5, h.up.radici_dur ? 4 : 2); }
        }
        return true;
      },
    },
    spine: {
      name: 'Corazza di Spine', glyph: '✵', elem: 'foresta', cd: 8, target: 'self',
      desc: (h) => `Per ${h.up.spine_up ? 10 : 6} turni, chi ti colpisce in mischia subisce ${3 + Math.floor(h.level / 2) + (h.up.spine_up ? 3 : 0)} danni e veleno; i tuoi attacchi avvelenano.`,
      use(h) {
        G.addStatus(h, 'thorns', h.up.spine_up ? 10 : 6, 3 + Math.floor(h.level / 2) + (h.up.spine_up ? 3 : 0));
        G.fx.ring(h.x, h.y, 1, '#7be04a'); G.fx.sound('roots');
        return true;
      },
    },
    linfa: {
      name: 'Linfa Vitale', glyph: '✚', elem: 'foresta', cd: 10, target: 'self',
      desc: (h) => `Cura il ${h.up.linfa_up ? 50 : 35}% dei PV massimi, rimuove gli stati negativi e fa crescere l'erba intorno.${h.up.linfa_up ? ' Concede anche Rigenerazione.' : ''}`,
      use(h) {
        G.heal(h, h.maxHp * (h.up.linfa_up ? 0.5 : 0.35));
        G.cleanse(h);
        if (h.up.linfa_up) G.addStatus(h, 'regen', 5, 2);
        for (const [x, y] of H.circleTiles(h.x, h.y, 2)) { const t = G.tileAt(x, y); if (t === T.FLOOR || t === T.ASH || t === T.SAND) G.setTile(x, y, T.GRASS); }
        G.fx.ring(h.x, h.y, 2, '#6effa0'); G.fx.sound('heal');
        return true;
      },
    },
    risveglio: {
      name: 'Risveglio della Foresta', glyph: '❦', elem: 'foresta', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Evoca ${h.up.risveglio_up ? 3 : 2} Germogli di Grandalbero che combattono per te per 25 turni e immobilizza i nemici entro 3 caselle.`,
      use(h) {
        const spots = H.freeAdjacent(h.x, h.y, h);
        G.run.rng.shuffle(spots);
        const n = Math.min(spots.length, h.up.risveglio_up ? 3 : 2);
        for (let i = 0; i < n; i++) H.summonAlly(h, 'germoglio', spots[i][0], spots[i][1], 25);
        for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.inRadius(h.x, h.y, o.x, o.y, 3))) { G.addStatus(o, 'root', 2); G.fx.roots(o.x, o.y); }
        G.fx.ring(h.x, h.y, 3, '#6ee05a'); G.fx.sound('summon'); G.fx.shake(5);
        return true;
      },
    },

    // ===================== POIVRONS =====================
    getto: {
      name: 'Getto d\'Acqua', glyph: '≋', elem: 'mare', cd: 2, target: 'enemy', range: 7,
      desc: (h) => `Spara un getto d'acqua ad alta pressione che ignora l'armatura: 110% danni, Bagna il bersaglio e lo spinge indietro di 1.${h.up.getto_pierce ? ' Perfora: colpisce tutti i nemici in linea.' : ''}`,
      use(h, t) {
        const range = 7 + h.mods.rangeBonus;
        const path = G.projectilePath(h.x, h.y, t.x, t.y, range, !!h.up.getto_pierce);
        if (!path.length) return false;
        const end = path[path.length - 1];
        G.fx.projectile(h.x, h.y, end[0], end[1], 'water');
        G.fx.sound('water');
        const victims = [];
        for (const p of path) { const o = G.entityAt(p[0], p[1]); if (o && G.hostile(o, h)) victims.push(o); }
        for (const o of victims) {
          G.dealDamage(h, o, H.dmg(h, 1.1), { elem: 'mare', delay: 120, pierce: true });
          if (!o.dead) { G.addStatus(o, 'wet', 4); G.knockback(h, o, 1); }
        }
        return true;
      },
    },
    onda: {
      name: 'Onda Anomala', glyph: '∿', elem: 'mare', cd: 7, target: 'dir',
      desc: (h) => `Un'onda larga 3 caselle e lunga ${h.up.onda_up ? 6 : 4}: 100% danni, Bagna e spinge via i nemici di ${h.up.onda_up ? 3 : 2} caselle.`,
      area: (h, dx, dy) => H.waveTiles(h, dx, dy, h.up.onda_up ? 6 : 4),
      use(h, dir) {
        const [dx, dy] = dir, len = h.up.onda_up ? 6 : 4;
        const tiles = H.waveTiles(h, dx, dy, len);
        G.fx.wave(h.x, h.y, dx, dy, len); G.fx.sound('wave');
        const victims = [];
        for (const [x, y] of tiles) { G.run.map.fire[G.idx(x, y)] = 0; const o = G.entityAt(x, y); if (o && G.hostile(o, h)) victims.push(o); }
        victims.sort((a, b) => U.cheb(b.x, b.y, h.x, h.y) - U.cheb(a.x, a.y, h.x, h.y));
        for (const o of victims) {
          G.dealDamage(h, o, H.dmg(h, 1.0), { elem: 'mare' });
          if (!o.dead) { G.addStatus(o, 'wet', 4); G.knockback(h, o, h.up.onda_up ? 3 : 2, [dx, dy]); }
        }
        return true;
      },
    },
    bolla: {
      name: 'Bolla Protettiva', glyph: '◎', elem: 'mare', cd: 10, target: 'self',
      desc: (h) => `Ti avvolge in una bolla: Scudo di ${8 + h.level * 2} PV per 8 turni, rimuove ustioni e veleno.${h.up.bolla_up ? ' Rigenera 2 PV a turno mentre dura.' : ''}`,
      use(h) {
        G.addStatus(h, 'shield', 8, 8 + h.level * 2);
        delete h.status.burn; delete h.status.poison;
        G.addStatus(h, 'wet', 6);
        if (h.up.bolla_up) G.addStatus(h, 'regen', 8, 2);
        G.fx.ring(h.x, h.y, 1, '#5ab0ff'); G.fx.sound('shield');
        return true;
      },
    },
    maremoto: {
      name: 'Maremoto', glyph: '🌊', elem: 'mare', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Una marea travolge tutto entro ${h.up.maremoto_r ? 6 : 4} caselle: 180% danni, Bagna e rallenta i nemici. Allaga il terreno vicino.`,
      area: (h) => H.circleTiles(h.x, h.y, h.up.maremoto_r ? 6 : 4),
      use(h) {
        const r = h.up.maremoto_r ? 6 : 4;
        G.fx.ring(h.x, h.y, r, '#4aa0ff'); G.fx.shake(10); G.fx.sound('wave');
        for (const [x, y] of H.circleTiles(h.x, h.y, 2)) {
          const t = G.tileAt(x, y);
          if (t === T.FLOOR || t === T.SAND || t === T.ASH || t === T.GRASS || t === T.RUBBLE) G.setTile(x, y, T.SHALLOW);
          if (G.inb(x, y)) G.run.map.fire[G.idx(x, y)] = 0;
        }
        for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.inRadius(h.x, h.y, o.x, o.y, r) && G.visible(o.x, o.y))) {
          G.dealDamage(h, o, H.dmg(h, 1.8), { elem: 'mare', delay: 80 });
          if (!o.dead) { G.addStatus(o, 'wet', 6); G.addStatus(o, 'slow', 4); }
        }
        return true;
      },
    },

    // ===================== NOCTIS =====================
    raffica: {
      name: 'Raffica', glyph: '➶', elem: 'aria', cd: 5, target: 'dir',
      desc: (h) => `Sfreccia fino a ${h.up.raffica_r ? 6 : 4} caselle attraversando i nemici: ognuno subisce 100% danni${h.up.raffica_r ? ' e resta stordito' : ''}.`,
      area: (h, dx, dy) => H.lineTiles(h, dx, dy, h.up.raffica_r ? 6 : 4, true),
      use(h, dir) {
        const [dx, dy] = dir, range = h.up.raffica_r ? 6 : 4;
        const path = H.lineTiles(h, dx, dy, range, true);
        let last = -1;
        for (let i = 0; i < path.length; i++) {
          const [x, y] = path[i];
          if (!G.canWalk(h, x, y)) break;
          if (!G.entityAt(x, y) && !G.featureAt(x, y)) last = i;
          else if (G.featureAt(x, y)) break;
        }
        if (last < 0) return false;
        const passed = [];
        for (let i = 0; i < last; i++) { const o = G.entityAt(path[i][0], path[i][1]); if (o && G.hostile(o, h)) passed.push(o); }
        const [fx, fy] = path[last];
        G.fx.trail(h.x, h.y, fx, fy, '#dff6ff'); G.fx.sound('dash');
        G.moveTo(h, fx, fy, { dash: true });
        for (const o of passed) {
          G.dealDamage(h, o, H.dmg(h, 1.0), { elem: 'aria' });
          if (!o.dead && h.up.raffica_r) G.addStatus(o, 'stun', 1);
        }
        return true;
      },
    },
    fulmine: {
      name: 'Fulmine', glyph: 'ϟ', elem: 'aria', cd: 3, target: 'enemy', range: 7,
      desc: (h) => `Un fulmine colpisce un nemico (130% danni) e rimbalza su altri ${h.up.fulmine_chain ? 4 : 2} nemici vicini (70%). Danni doppi ai nemici Bagnati.${h.up.fulmine_stun ? ' Stordisce.' : ''}`,
      use(h, t) {
        H.chainLightning(h, t, H.dmg(h, 1.3), h.up.fulmine_chain ? 4 : 2, 'Fulmine', !!h.up.fulmine_stun);
        return true;
      },
    },
    vortice: {
      name: 'Occhio del Ciclone', glyph: '@', elem: 'aria', cd: 9, target: 'self',
      desc: (h) => `Un turbine respinge di 3 caselle tutti i nemici entro ${h.up.vortice_up ? 3 : 2}, infliggendo ${h.up.vortice_up ? 120 : 60}% danni e confondendoli per 3 turni.`,
      area: (h) => H.squareTiles(h.x, h.y, h.up.vortice_up ? 3 : 2),
      use(h) {
        const r = h.up.vortice_up ? 3 : 2;
        G.fx.ring(h.x, h.y, r + 0.5, '#a8ecff'); G.fx.sound('wind');
        const vs = G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.cheb(o.x, o.y, h.x, h.y) <= r)
          .sort((a, b) => U.cheb(b.x, b.y, h.x, h.y) - U.cheb(a.x, a.y, h.x, h.y));
        for (const o of vs) {
          G.dealDamage(h, o, H.dmg(h, h.up.vortice_up ? 1.2 : 0.6), { elem: 'aria' });
          if (!o.dead) { G.knockback(h, o, 3); if (!o.dead) G.addStatus(o, 'confuse', 3); }
        }
        return true;
      },
    },
    tempesta: {
      name: 'Tempesta', glyph: '⚡', elem: 'aria', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. ${h.up.tempesta_up ? 12 : 8} fulmini si abbattono su nemici visibili casuali: 140% danni ciascuno (doppi sui Bagnati).`,
      use(h) {
        const n = h.up.tempesta_up ? 12 : 8;
        const vs = H.visibleEnemiesIn(h, 8);
        G.fx.flash('#dff6ff'); G.fx.sound('thunder'); G.fx.shake(8);
        if (!vs.length) return true;
        for (let i = 0; i < n; i++) {
          const alive = vs.filter(o => !o.dead);
          if (!alive.length) break;
          const o = G.run.rng.pick(alive);
          G.fx.bolt(o.x, o.y - 8, o.x, o.y, '#ffffff', i * 70);
          G.dealDamage(h, o, H.dmg(h, 1.4) * (o.status.wet ? 2 : 1), { elem: 'aria', delay: i * 70 });
        }
        return true;
      },
    },

    // ===================== VECCHIO SAGGIO =====================
    dardo: {
      name: 'Dardo Arcano', glyph: '✧', elem: 'neutro', cd: 2, target: 'enemy', range: 8,
      desc: (h) => `Un dardo che non manca mai e ignora l'armatura: 120% danni a un nemico entro ${8 + h.mods.rangeBonus} caselle.${h.up.dardo_up ? ' Ne lancia un secondo verso un altro nemico visibile.' : ''}`,
      use(h, t) {
        const shoot = (o, delay) => {
          G.fx.projectile(h.x, h.y, o.x, o.y, 'arcane', delay);
          G.dealDamage(h, o, H.dmg(h, 1.2), { elem: 'neutro', delay: 100 + delay, pierce: true });
        };
        shoot(t, 0);
        if (h.up.dardo_up) {
          const others = H.visibleEnemiesIn(h, 8).filter(o => !o.dead && o !== t);
          const o2 = others.length ? G.run.rng.pick(others) : (!t.dead ? t : null);
          if (o2) shoot(o2, 90);
        }
        G.fx.sound('arcane');
        return true;
      },
    },
    passo: {
      name: 'Passo Mistico', glyph: '⟁', elem: 'neutro', cd: 6, target: 'tile', range: 6,
      desc: (h) => `Si teletrasporta in una casella visibile entro 6.${h.up.passo_up ? ' Al punto di partenza esplode un\'onda arcana (100% danni, stordisce).' : ''}`,
      valid(h, x, y) { return G.visible(x, y) && G.canEnter(h, x, y) && !G.isHazardFor(h, x, y) && G.tileAt(x, y) !== T.CHASM; },
      use(h, p) {
        if (!G.SKILLS.passo.valid(h, p[0], p[1])) return false;
        const ox = h.x, oy = h.y;
        if (h.up.passo_up) {
          for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.cheb(o.x, o.y, ox, oy) <= 1)) {
            G.dealDamage(h, o, H.dmg(h, 1.0), { elem: 'neutro' }); if (!o.dead) G.addStatus(o, 'stun', 1);
          }
          G.fx.ring(ox, oy, 1.5, '#d8b0ff');
        }
        h.x = p[0]; h.y = p[1]; G.run.distMapsDirty = true;
        G.fx.teleport(h, ox, oy); G.fx.sound('teleport');
        G.onEnter(h, {});
        return true;
      },
    },
    sigillo: {
      name: 'Sigillo del Saggio', glyph: '✡', elem: 'neutro', cd: 8, target: 'enemy', range: 6,
      desc: (h) => `Marchia un nemico: per 5 turni è Vulnerabile (+40% danni subiti) e Rallentato.${h.up.sigillo_up ? ' Anche Indebolito, e il sigillo colpisce i nemici adiacenti.' : ''}`,
      use(h, t) {
        const ts = [t].concat(h.up.sigillo_up ? G.run.ents.filter(o => !o.dead && o !== t && G.hostile(o, h) && U.cheb(o.x, o.y, t.x, t.y) <= 1) : []);
        for (const o of ts) {
          G.addStatus(o, 'vuln', 5); G.addStatus(o, 'slow', 5);
          if (h.up.sigillo_up) G.addStatus(o, 'weak', 5);
          G.fx.ring(o.x, o.y, 0.8, '#d8b0ff');
        }
        G.fx.sound('arcane');
        return true;
      },
    },
    occhio: {
      name: 'Occhio della Vita', glyph: '◉', elem: 'neutro', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. L'Occhio della Vita si apre: curi il 40% dei PV e tutti i nemici visibili subiscono 200% danni e restano Indeboliti.`,
      use(h) {
        G.heal(h, h.maxHp * 0.4);
        G.fx.flash('#fff6d0'); G.fx.sound('holy'); G.fx.shake(8);
        for (const o of H.visibleEnemiesIn(h, 9)) {
          G.fx.bolt(h.x, h.y, o.x, o.y, '#ffe9a0');
          G.dealDamage(h, o, H.dmg(h, 2.0), { elem: 'neutro', delay: 80 });
          if (!o.dead) G.addStatus(o, 'weak', 4);
        }
        return true;
      },
    },

    // ===================== SOMMO LUMINESCENTE =====================
    raggio: {
      name: 'Raggio di Luce', glyph: '☀', elem: 'luce', cd: 4, target: 'dir',
      desc: (h) => `Un raggio perforante lungo 8 caselle: 120% danni a tutti i nemici sulla linea.${h.up.raggio_up ? ' Li acceca.' : ''}`,
      area: (h, dx, dy) => H.lineTiles(h, dx, dy, 8, true),
      use(h, dir) {
        const tiles = H.lineTiles(h, dir[0], dir[1], 8, true);
        if (!tiles.length) return false;
        G.fx.beam(h.x, h.y, tiles[tiles.length - 1][0], tiles[tiles.length - 1][1], '#fff3a0'); G.fx.sound('holy');
        for (const [x, y] of tiles) {
          const o = G.entityAt(x, y);
          if (o && G.hostile(o, h)) { G.dealDamage(h, o, H.dmg(h, 1.2), { elem: 'luce' }); if (!o.dead && h.up.raggio_up) G.addStatus(o, 'blind', 3); }
        }
        return true;
      },
    },
    bagliore: {
      name: 'Bagliore Accecante', glyph: '✺', elem: 'luce', cd: 8, target: 'self',
      desc: (h) => `Un lampo di luce: i nemici entro ${h.up.bagliore_up ? 4 : 3} caselle subiscono 60% danni e restano Accecati per 4 turni.`,
      area: (h) => H.circleTiles(h.x, h.y, h.up.bagliore_up ? 4 : 3),
      use(h) {
        const r = h.up.bagliore_up ? 4 : 3;
        G.fx.flash('#fffbe0'); G.fx.ring(h.x, h.y, r, '#fff3a0'); G.fx.sound('holy');
        for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.inRadius(h.x, h.y, o.x, o.y, r))) {
          G.dealDamage(h, o, H.dmg(h, 0.6), { elem: 'luce' });
          if (!o.dead) G.addStatus(o, 'blind', 4);
        }
        return true;
      },
    },
    prisma: {
      name: 'Scudo Prismatico', glyph: '◇', elem: 'luce', cd: 11, target: 'self',
      desc: (h) => `Scudo di ${10 + h.level * 2} PV per 8 turni e cura il ${h.up.prisma_up ? 25 : 15}% dei PV massimi.`,
      use(h) {
        G.addStatus(h, 'shield', 8, 10 + h.level * 2);
        G.heal(h, h.maxHp * (h.up.prisma_up ? 0.25 : 0.15));
        G.fx.ring(h.x, h.y, 1, '#fff3a0'); G.fx.sound('shield');
        return true;
      },
    },
    supernova: {
      name: 'Supernova', glyph: '✹', elem: 'luce', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Esplodi di luce: 250% danni a tutti i nemici visibili entro 6 caselle e curi il 20% dei PV.`,
      area: (h) => H.circleTiles(h.x, h.y, 6),
      use(h) {
        G.fx.flash('#ffffff'); G.fx.ring(h.x, h.y, 6, '#fff3a0'); G.fx.shake(12); G.fx.sound('holy');
        G.heal(h, h.maxHp * 0.2);
        for (const o of H.visibleEnemiesIn(h, 6)) G.dealDamage(h, o, H.dmg(h, 2.5), { elem: 'luce', delay: 80 });
        return true;
      },
    },
  };
})();

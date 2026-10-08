'use strict';
// ============================================================
//  affixes.js : varianti dei nemici e Campioni
// ============================================================
(function () {
  G.AFFIXES = {
    corazzato: { name: 'Corazzato', color: '#c0c8d8', desc: '+3 armatura.', apply(e) { e.def += 3; } },
    rapido:    { name: 'Rapido', color: '#ffffff', desc: 'Agisce il 30% più spesso.', apply(e) { e.speed = Math.round(e.speed * 1.3); } },
    furioso:   { name: 'Furioso', color: '#ff4a3a', desc: 'Infligge il 30% di danni in più.', apply(e) { e.atk = [Math.round(e.atk[0] * 1.3), Math.round(e.atk[1] * 1.3)]; } },
    vampirico: { name: 'Vampirico', color: '#c81a3a', desc: 'Si cura colpendo in mischia.', apply(e) { e.flags.drain = true; } },
    esplosivo: { name: 'Esplosivo', color: '#ff8a2a', desc: 'Quando muore, esplode dopo un turno.', apply(e) { } },
    gelido:    { name: 'Gelido', color: '#bff4ff', desc: 'I suoi colpi rallentano.', apply(e) { } },
    dorato:    { name: 'Dorato', color: '#ffd23a', desc: 'Lascia molti Frammenti.', apply(e) { e.flags.golden = true; } },
    spinoso:   { name: 'Spinoso', color: '#7be04a', desc: 'Chi lo colpisce in mischia si ferisce.', apply(e) { } },
  };
  const IDS = Object.keys(G.AFFIXES);
  const TITLES = ['Zannaferro', 'Occhiorosso', 'il Divoratore', 'Sfregiato', 'Unghiadura', 'l\'Implacabile', 'Fauci d\'Ombra', 'il Tiranno', 'Cuorpietra', 'il Senzanome', 'Ossarotte', 'la Furia Grigia'];

  G.applyAffix = function (e, id) {
    const a = G.AFFIXES[id];
    if (!a || (e.affixes && e.affixes.includes(id))) return;
    e.affixes = e.affixes || [];
    e.affixes.push(id);
    a.apply(e);
    e.name = e.name + ' ' + a.name;
    e.xp = Math.round(e.xp * 1.3);
  };

  // probabilità che un nemico normale abbia una variante
  G.affixChance = function (floor, ecl) {
    return Math.min(0.32, 0.04 + 0.022 * floor) + (ecl || 0) * 0.03;
  };
  G.rollAffixes = function (e, rng, n) {
    const pool = IDS.slice();
    rng.shuffle(pool);
    for (let i = 0; i < n && i < pool.length; i++) {
      if (pool[i] === 'esplosivo' && e.flags.boss) continue;
      G.applyAffix(e, pool[i]);
    }
  };

  // Campione: un nemico comune con due varianti, più PV e un nome proprio
  G.makeChampion = function (e, rng) {
    const base = G.MON[e.type].name;
    G.rollAffixes(e, rng, 2);
    e.maxHp = e.hp = Math.round(e.maxHp * 2.6);
    e.atk = [Math.round(e.atk[0] * 1.2), Math.round(e.atk[1] * 1.2)];
    e.flags.champion = true; e.flags.elite = true; e.flags.noKnock = true;
    e.xp = Math.round(e.xp * 3);
    e.name = rng.pick(TITLES) + ', ' + base + ' (' + e.affixes.map(a => G.AFFIXES[a].name).join(', ') + ')';
    e.st.mode = 'sleep';
    return e;
  };
})();

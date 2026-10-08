'use strict';
// ============================================================
//  data_monsters.js : bestiario
//  ai: melee | erratic | ranged | turret | kamikaze | hitrun | jelly | caster | support | stone | ally | boss_*
// ============================================================
(function () {
  const U = G.U;
  const st = (name, t, p, chance) => (a, d) => { if (!chance || G.run.rng.chance(chance)) G.addStatus(d, name, t, p); };

  G.MON = {
    // ================= FORESTA SILENTE =================
    rovo: {
      name: 'Rovo Strisciante', elem: 'foresta', hp: 11, atk: [2, 3], def: 0, speed: 60, xp: 3, ai: 'melee',
      desc: 'Un groviglio di spine animato dalla corruzione. Lento, ma le sue spine possono trattenerti.',
      onHit: st('root', 1, 0, 0.3),
    },
    lupo: {
      name: 'Lupo Selvaggio', elem: 'terra', hp: 9, atk: [2, 3], eva: 8, speed: 120, xp: 3, ai: 'melee', pack: [2, 3],
      desc: 'Caccia in branco. Veloce: non provare a fuggire.',
    },
    fungo: {
      name: 'Fungo Sputaspore', elem: 'foresta', hp: 8, atk: [1, 2], speed: 100, xp: 3, ai: 'turret',
      flags: { stationary: true, noKnock: true },
      ranged: { range: 5, cd: 2, dmg: [1, 3], elem: 'foresta', proj: 'spore', status: ['poison', 4, 2] },
      desc: 'Immobile. Sputa spore velenose da lontano.',
    },
    calabrone: {
      name: 'Calabrone Gigante', elem: 'aria', hp: 6, atk: [1, 3], eva: 25, speed: 140, xp: 2, ai: 'erratic',
      flags: { fly: true }, desc: 'Ronza in modo imprevedibile. Difficile da colpire.',
    },
    fuocofatuo: {
      name: 'Fuoco Fatuo', elem: 'fuoco', hp: 5, atk: [1, 1], speed: 110, xp: 3, ai: 'kamikaze',
      flags: { fly: true, fireImmune: true }, explode: { dmg: [6, 9], fire: 3 },
      desc: 'Una fiammella vagante. Quando ti è accanto si gonfia ed esplode: allontanati!',
    },
    treant: {
      name: 'Treant Corrotto', elem: 'foresta', hp: 40, atk: [4, 7], def: 2, speed: 80, xp: 15, ai: 'melee',
      flags: { elite: true, noKnock: true }, slam: { cd: 5, shape: 'around', r: 1, dmg: [6, 9], status: 'root', st: 2, color: '#6ee05a', label: 'Schianto di Radici' },
      desc: 'ÉLITE. Un antico albero piegato dal male. I suoi rami schiantano tutto intorno.',
    },
    cerbante: {
      name: 'Cerbante', title: 'La Belva dalle Tre Teste', elem: 'tenebre', hp: 125, atk: [4, 7], def: 2, speed: 100, xp: 40, ai: 'boss_cerbante',
      flags: { boss: true, noKnock: true, fireImmune: true, alwaysAwake: true }, big: true,
      desc: 'BOSS. Il guardiano della Foresta Silente. Sputa fuoco dalle sue tre fauci ed evoca il branco.',
    },

    // ================= FOSSA DEGLI ANTICHI SPIRITI =================
    granchio: {
      name: 'Granchio Corazzato', elem: 'mare', hp: 16, atk: [3, 5], def: 4, speed: 90, xp: 5, ai: 'melee', flags: { swim: true },
      desc: 'Corazza durissima. Gli attacchi deboli rimbalzano.',
    },
    polypus: {
      name: 'Polypus', elem: 'mare', hp: 15, atk: [3, 5], def: 1, speed: 100, xp: 6, ai: 'ranged', flags: { swim: true },
      ranged: { range: 4, cd: 4, dmg: [2, 4], elem: 'mare', proj: 'ink', pull: 2 },
      desc: 'Afferra le prede coi tentacoli e le trascina a sé.',
    },
    medusa: {
      name: 'Medusa Elettrica', elem: 'aria', hp: 10, atk: [3, 5], eva: 5, speed: 60, xp: 4, ai: 'jelly', flags: { fly: true },
      desc: 'Fluttua lentamente. La sua scarica è doppia contro chi è Bagnato.',
    },
    squalo: {
      name: 'Squalo Predatore', elem: 'mare', hp: 18, atk: [4, 6], def: 1, speed: 100, xp: 6, ai: 'melee', flags: { swim: true, waterFast: true },
      desc: 'Nell\'acqua è velocissimo. Tienilo all\'asciutto.',
    },
    annegato: {
      name: 'Spirito Annegato', elem: 'tenebre', hp: 12, atk: [3, 5], eva: 10, speed: 90, xp: 6, ai: 'melee', flags: { phase: true, drain: true, fly: true },
      desc: 'Un fantasma che attraversa la roccia e si nutre della tua vita.',
    },
    crabs: {
      name: 'Crabs il Vendicatore', elem: 'mare', hp: 70, atk: [5, 8], def: 6, speed: 90, xp: 25, ai: 'melee',
      flags: { elite: true, noKnock: true, swim: true }, slam: { cd: 5, shape: 'cross', r: 3, dmg: [8, 12], status: 'stun', st: 1, color: '#4aa0ff', label: 'Chele Tonanti' },
      desc: 'ÉLITE. Un granchio gigante dalle chele devastanti. Colpisce in croce.',
    },
    orrore: {
      name: 'Orrore Profondo', title: 'Il Terrore degli Abissi', elem: 'mare', hp: 230, atk: [6, 9], def: 3, speed: 80, xp: 60, ai: 'boss_orrore',
      flags: { boss: true, noKnock: true, swim: true, alwaysAwake: true }, big: true,
      desc: 'BOSS. Una creatura antica emersa dalla Fossa. I suoi tentacoli sono ovunque.',
    },
    tentacolo: {
      name: 'Tentacolo Abissale', elem: 'mare', hp: 18, atk: [5, 8], def: 1, speed: 100, xp: 2, ai: 'melee',
      flags: { stationary: true, noKnock: true, swim: true, alwaysAwake: true },
      desc: 'Emerge dal suolo e frusta chi gli passa accanto.',
    },

    // ================= CAVERNA DI ROSCAMAR =================
    golem: {
      name: 'Golem di Pietra', elem: 'terra', hp: 34, atk: [5, 8], def: 4, speed: 70, xp: 8, ai: 'melee', flags: { noKnock: false },
      desc: 'Lento e massiccio. Colpisce come una frana.',
    },
    pipistrello: {
      name: 'Pipistrello d\'Ombra', elem: 'tenebre', hp: 12, atk: [3, 5], eva: 25, speed: 150, xp: 5, ai: 'erratic', flags: { fly: true, drain: true },
      desc: 'Svolazza nel buio e succhia la vita.',
    },
    talpa: {
      name: 'Talpa Scavatrice', elem: 'terra', hp: 22, atk: [4, 7], def: 2, speed: 90, xp: 7, ai: 'melee', flags: { burrow: true },
      desc: 'Scava attraverso la roccia per raggiungerti.',
    },
    minatore: {
      name: 'Minatore Maledetto', elem: 'tenebre', hp: 20, atk: [3, 5], def: 1, speed: 100, xp: 7, ai: 'ranged', flags: { kiter: true },
      ranged: { range: 5, cd: 2, dmg: [4, 7], elem: 'terra', proj: 'rock' },
      desc: 'Lancia pietre e si tiene a distanza.',
    },
    ombra: {
      name: 'Ombra Strisciante', elem: 'tenebre', hp: 18, atk: [6, 9], crit: 20, speed: 100, xp: 8, ai: 'melee', flags: { lurker: true },
      desc: 'Invisibile finché non è a due passi da te.',
    },
    colosso: {
      name: 'Colosso di Cristallo', elem: 'terra', hp: 110, atk: [7, 11], def: 6, speed: 80, xp: 35, ai: 'melee',
      flags: { elite: true, noKnock: true }, slam: { cd: 5, shape: 'cross', r: 5, dmg: [10, 15], status: 'vuln', st: 3, color: '#7fd8ff', label: 'Lance di Cristallo' },
      desc: 'ÉLITE. Un gigante di cristallo vivente. Proietta lance in quattro direzioni.',
    },
    obscurio: {
      name: 'Obscurio', title: 'Signore delle Tenebre', elem: 'tenebre', hp: 380, atk: [8, 12], def: 3, speed: 100, xp: 90, ai: 'boss_obscurio',
      flags: { boss: true, noKnock: true, alwaysAwake: true }, big: true,
      desc: 'BOSS. L\'antico nemico della luce. Si teletrasporta, evoca ombre e spegne la tua vista.',
    },
    clone: {
      name: 'Riflesso di Obscurio', elem: 'tenebre', hp: 20, atk: [4, 7], speed: 100, xp: 1, ai: 'melee',
      flags: { alwaysAwake: true, noXp: true }, desc: 'Un\'illusione oscura. Fragile, ma colpisce davvero.',
    },

    // ================= PICCHI DELLA VALLE DEL DESTINO =================
    arpia: {
      name: 'Arpia', elem: 'aria', hp: 26, atk: [5, 8], eva: 12, speed: 120, xp: 9, ai: 'hitrun', flags: { fly: true },
      desc: 'Colpisce in picchiata e si ritira subito dopo.',
    },
    spiritovento: {
      name: 'Spirito del Vento', elem: 'aria', hp: 22, atk: [3, 5], eva: 15, speed: 100, xp: 9, ai: 'ranged', flags: { fly: true, kiter: true },
      ranged: { range: 4, cd: 3, dmg: [3, 6], elem: 'aria', proj: 'wind', push: 2 },
      desc: 'Le sue raffiche ti spingono via... magari dritto in un baratro.',
    },
    gargolla: {
      name: 'Gargolla', elem: 'terra', hp: 36, atk: [6, 10], def: 3, speed: 100, xp: 10, ai: 'stone', flags: { stoneForm: true, noKnock: true },
      desc: 'Sembra una statua. Quando sei vicino si risveglia. In forma di pietra è quasi invulnerabile.',
    },
    folgoratore: {
      name: 'Folgoratore', elem: 'aria', hp: 24, atk: [3, 5], speed: 100, xp: 10, ai: 'caster', flags: { fly: true, kiter: true },
      cast: { cd: 4, range: 7, shape: 'plus', dmg: [8, 12], color: '#bfe8ff', elem: 'aria', label: 'Fulmine' },
      desc: 'Evoca fulmini dove ti trovi. Quando vedi il segnale, spostati!',
    },
    grifone: {
      name: 'Grifone', elem: 'aria', hp: 32, atk: [6, 9], def: 1, speed: 130, xp: 11, ai: 'melee', flags: { fly: true },
      desc: 'Metà aquila e metà leone. Veloce e feroce.',
    },
    mystral: {
      name: 'Mystral Corrotto', elem: 'aria', hp: 140, atk: [8, 12], def: 3, speed: 110, xp: 45, ai: 'melee',
      flags: { elite: true, fly: true, noKnock: true }, slam: { cd: 4, shape: 'target', r: 1, dmg: [10, 14], push: 2, color: '#a8ecff', label: 'Tornado' },
      desc: 'ÉLITE. Un signore del vento caduto. Scatena tornado sotto i tuoi piedi.',
    },
    devilfenix: {
      name: 'Devilfenix', title: 'La Fenice Infernale', elem: 'aria', hp: 480, atk: [9, 13], def: 3, speed: 110, xp: 60, ai: 'boss_devilfenix',
      flags: { boss: true, fly: true, noKnock: true, fireImmune: true, alwaysAwake: true }, big: true,
      desc: 'BOSS. Signore dei cieli corrotti. Se lo abbatti, può rinascere dalle sue ceneri!',
    },
    uovo: {
      name: 'Uovo di Fenice', elem: 'fuoco', hp: 80, atk: [0, 0], def: 2, speed: 100, xp: 0, ai: 'egg',
      flags: { stationary: true, noKnock: true, alwaysAwake: true, fireImmune: true, noXp: true },
      desc: 'Distruggilo prima che si schiuda, o Devilfenix rinascerà!',
    },

    // ================= MONTE VULCANO =================
    salamandra: {
      name: 'Salamandra Lavica', elem: 'fuoco', hp: 34, atk: [6, 9], def: 2, speed: 100, xp: 11, ai: 'melee', flags: { fireImmune: true, fireTrail: true },
      desc: 'Lascia una scia di fiamme dietro di sé.',
    },
    guerriero: {
      name: 'Guerriero di Magma', elem: 'fuoco', hp: 50, atk: [8, 12], def: 5, speed: 85, xp: 13, ai: 'melee', flags: { fireImmune: true },
      onHit: st('burn', 3, 4, 0.4), desc: 'Un soldato di Magmion, corazzato di roccia fusa.',
    },
    bombo: {
      name: 'Bombo Igneo', elem: 'fuoco', hp: 14, atk: [1, 1], speed: 120, xp: 6, ai: 'kamikaze', flags: { fireImmune: true },
      explode: { dmg: [14, 20], fire: 4 }, desc: 'Una bomba vivente. Esplode quando ti è vicino.',
    },
    sacerdote: {
      name: 'Sacerdote del Vulcano', elem: 'fuoco', hp: 30, atk: [4, 6], def: 1, speed: 100, xp: 13, ai: 'support', flags: { fireImmune: true, kiter: true },
      ranged: { range: 5, cd: 2, dmg: [6, 9], elem: 'fuoco', proj: 'fire', status: ['burn', 3, 4] },
      desc: 'Cura i suoi alleati e lancia sfere di fuoco. Eliminalo per primo.',
    },
    lavico: {
      name: 'Segugio Lavico', elem: 'fuoco', hp: 28, atk: [6, 9], eva: 8, speed: 130, xp: 10, ai: 'melee', flags: { fireImmune: true }, pack: [2, 3],
      desc: 'Cani di magma che cacciano in branco.',
    },
    lavion: {
      name: 'Lavion', elem: 'fuoco', hp: 180, atk: [10, 14], def: 5, speed: 100, xp: 60, ai: 'melee',
      flags: { elite: true, noKnock: true, fireImmune: true }, slam: { cd: 5, shape: 'target', r: 2, dmg: [12, 18], fire: 4, color: '#ff6a2a', label: 'Eruzione' },
      desc: 'ÉLITE. Il Signore della Lava. Fa eruttare il terreno sotto i tuoi piedi.',
    },
    magmion: {
      name: 'Magmion', title: 'Signore del Magma', elem: 'fuoco', hp: 320, atk: [10, 14], def: 5, speed: 100, xp: 120, ai: 'boss_magmion',
      flags: { boss: true, guardian: true, noKnock: true, fireImmune: true }, big: true,
      desc: 'GUARDIANO. Il generale di Magor sigilla il portale verso il cuore del vulcano.',
    },
    magor: {
      name: 'Magor', title: 'Il Signore del Male', elem: 'tenebre', hp: 1000, atk: [12, 17], def: 5, speed: 100, xp: 0, ai: 'boss_magor',
      flags: { boss: true, noKnock: true, fireImmune: true, alwaysAwake: true, final: true }, big: true,
      desc: 'BOSS FINALE. Risvegliato nel Monte Vulcano, vuole ridurre Gorm in cenere.',
    },

    // ================= ALLEATI =================
    germoglio: {
      name: 'Germoglio di Grandalbero', elem: 'foresta', hp: 20, atk: [3, 5], def: 1, speed: 100, xp: 0, ai: 'ally',
      desc: 'Un giovane albero risvegliato da Tasarau. Combatte al tuo fianco.',
    },
  };

  // ------------------------------------------------------------
  //  Effetti alla morte
  // ------------------------------------------------------------
  G.MON.fungo.onDeath = (e) => {
    for (const o of G.run.ents) if (!o.dead && U.cheb(o.x, o.y, e.x, e.y) <= 1 && o !== e) G.addStatus(o, 'poison', 4, 1);
    G.fx.burst(e.x, e.y, '#9be35a', 16);
  };
})();

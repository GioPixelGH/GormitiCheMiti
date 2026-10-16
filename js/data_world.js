'use strict';
// ============================================================
//  data_world.js : tile, biomi, regioni e percorso sull'isola
// ============================================================
G.T = {
  WALL: 0, FLOOR: 1, GRASS: 2, TALL: 3, TREE: 4, SHALLOW: 5, DEEP: 6, LAVA: 7,
  CHASM: 8, BRIDGE: 9, RUBBLE: 10, CRYSTAL: 11, DOOR: 12, DOOR_OPEN: 13, STAIRS: 14,
  SAND: 15, ASH: 16, PILLAR: 17, ICE: 18, CRACKED: 19, WEB: 20,
};
// walk: calpestabile da creature di terra; opaque: blocca la vista; solid: muro (anche per i volatili)
G.TILE = [];
(function () {
  const T = G.T, D = (id, o) => { G.TILE[id] = Object.assign({ walk: true, opaque: false, solid: false }, o); };
  D(T.WALL,      { name: 'Roccia', walk: false, opaque: true, solid: true });
  D(T.FLOOR,     { name: 'Terreno' });
  D(T.GRASS,     { name: 'Erba', flammable: true });
  D(T.TALL,      { name: 'Erba alta', opaque: true, flammable: true, desc: 'Blocca la vista. Ottima per nascondersi.' });
  D(T.TREE,      { name: 'Albero', walk: false, opaque: true, solid: true });
  D(T.SHALLOW,   { name: 'Acqua bassa', liquid: 'water', desc: 'Bagna chi la attraversa e spegne le fiamme.' });
  D(T.DEEP,      { name: 'Acqua profonda', walk: false, liquid: 'deep', desc: 'Solo chi nuota o vola può attraversarla.' });
  D(T.LAVA,      { name: 'Lava', liquid: 'lava', hazard: true, glow: '#ff5a1a', desc: 'Brucia gravemente chiunque la tocchi.' });
  D(T.CHASM,     { name: 'Baratro', hazard: true, desc: 'Chi cade precipita al piano inferiore.' });
  D(T.BRIDGE,    { name: 'Ponte' });
  D(T.RUBBLE,    { name: 'Macerie' });
  D(T.CRYSTAL,   { name: 'Cristallo', walk: false, opaque: true, solid: true, glow: '#7fd8ff' });
  D(T.DOOR,      { name: 'Porta', opaque: true });
  D(T.DOOR_OPEN, { name: 'Porta aperta' });
  D(T.STAIRS,    { name: 'Portale', glow: '#c08aff', desc: 'Conduce più in profondità. Premi INVIO per attraversarlo.' });
  D(T.SAND,      { name: 'Sabbia' });
  D(T.ASH,       { name: 'Cenere' });
  D(T.PILLAR,    { name: 'Colonna', walk: false, opaque: true, solid: true });
  D(T.ICE,       { name: 'Ghiaccio', desc: 'Rallenta chi ci cammina sopra (velocità −30%), tranne le creature del Mare e quelle volanti.' });
  D(T.CRACKED,   { name: 'Muro incrinato', walk: false, opaque: true, solid: true, cracked: true, desc: 'Si può abbattere: colpiscilo, fallo esplodere o scaraventaci contro un nemico. Spesso nasconde qualcosa.' });
  D(T.WEB,       { name: 'Ragnatela', flammable: true, desc: 'Chi la attraversa resta invischiato per un turno e la strappa. Il fuoco la brucia; i ragni di Aracno ci camminano sopra.' });
})();

// ------------------------------------------------------------
//  Biomi / regioni (3 piani ciascuna, il 3° è l'arena del boss)
//  slot: posizione nel percorso dell'isola (0..4)
// ------------------------------------------------------------
G.BIOMES = [
  {
    id: 'foresta', slot: 0, name: 'Foresta Silente', elem: 'foresta', gen: 'caves', sight: 8,
    intro: 'Gli alberi millenari tacciono. Aracno, il crudele amico di Magmion, ha teso le sue tele nella Foresta Silente.',
    monsters: [['rovo', 3], ['lupo', 4], ['fungo', 2], ['calabrone', 3], ['fuocofatuo', 2], ['lupoalfa', 1], ['ragnetto', 1]],
    elites: ['treant'], boss: 'aracno', ambient: 'leaves', music: 'foresta',
    colors: { floor: '#4a3d2a', floor2: '#5a4a34', wall: '#23301c', wallTop: '#2c5226', wallFace: '#3a2a1a', accent: '#7bd65a' },
  },
  {
    id: 'mare', slot: 1, name: 'Fossa degli Antichi Spiriti', elem: 'mare', gen: 'caves', sight: 7,
    intro: 'Le maree sono impazzite e dal fondo della Fossa ribolle la lava: Orrore Profondo comanda le creature degli abissi.',
    monsters: [['granchio', 4], ['polypus', 2], ['medusa', 3], ['squalo', 3], ['annegato', 2]],
    elites: ['geyser'], boss: 'orrore', ambient: 'bubbles', music: 'mare',
    pitch: 'Grotte allagate, abissi vulcanici e Orrore Profondo, il Signore di Vulcano.',
    colors: { floor: '#28405a', floor2: '#32506c', wall: '#152536', wallTop: '#46698a', wallFace: '#1c3048', accent: '#5ac8ff' },
  },
  {
    id: 'nebbie', slot: 1, name: 'Pianura delle Nebbie', elem: 'fuoco', gen: 'plains', sight: 5, fog: true,
    intro: 'La Pianura delle Nebbie: qui la vista inganna e la lava scorre sotto la bruma. Lavion, il Signore del Terrore, ti aspetta.',
    monsters: [['lupocenere', 4], ['spettronebbia', 3], ['golemlava', 2], ['fuocofatuo', 2], ['sciamanolava', 2]],
    elites: ['lavor'], boss: 'lavion', ambient: 'mist', music: 'nebbie',
    pitch: 'Una pianura avvolta dalla nebbia, colate di lava e Lavion, il Signore del Terrore.',
    colors: { floor: '#4a4844', floor2: '#56534c', wall: '#262422', wallTop: '#6e6a62', wallFace: '#3a3632', accent: '#ff8a4a' },
  },
  {
    id: 'roscamar', slot: 2, name: 'Caverna di Roscamar', elem: 'terra', gen: 'rooms', sight: 6,
    intro: 'Nelle viscere della terra rimbombano i martelli delle forge di Magor. Armageddon, il Signore del Vulcano, fa tremare la Caverna.',
    monsters: [['golem', 3], ['pipistrello', 3], ['talpa', 2], ['minatore', 3], ['ombra', 2]],
    elites: ['colosso'], boss: 'armageddon', ambient: 'dust', music: 'roscamar',
    pitch: 'Forge, martelli e crolli nelle viscere della terra, e Armageddon, il Signore del Vulcano.',
    colors: { floor: '#3e342c', floor2: '#4c4036', wall: '#2a221c', wallTop: '#73604c', wallFace: '#3a2e24', accent: '#c9a26a' },
  },
  {
    id: 'cieli', slot: 3, name: 'Picchi della Valle del Destino', elem: 'aria', gen: 'islands', sight: 9,
    intro: 'Sopra le nuvole, i venti urlano. Una fenice infernale domina i picchi.',
    monsters: [['arpia', 3], ['spiritovento', 3], ['gargolla', 2], ['folgoratore', 2], ['grifone', 2]],
    elites: ['crudelion'], boss: 'devilfenix', ambient: 'wind', music: 'cieli',
    pitch: 'Isole sospese sopra il vuoto, venti che spingono nei baratri e Devilfenix.',
    colors: { floor: '#5a6274', floor2: '#6a7386', wall: '#3a4150', wallTop: '#949eb2', wallFace: '#4a5266', accent: '#e8f4ff' },
  },
  {
    id: 'orizzonte', slot: 3, name: 'Regione di Oscuro Orizzonte', elem: 'tenebre', gen: 'rifts', sight: 3, dark: true,
    intro: 'Hai varcato la Porta Ultradimensionale: questa è la Regione di Oscuro Orizzonte, patria del Popolo delle Tenebre. Resta vicino alle luci.',
    monsters: [['ombra', 3], ['pipistrello', 2], ['cristallonero', 2], ['falenanotte', 3], ['cavaliereombra', 3], ['accolitonotte', 2]],
    elites: ['pantanera'], boss: 'obscurio', ambient: 'shadow', music: 'orizzonte',
    pitch: 'Oltre la Porta Ultradimensionale: buio, cristalli di luce e Obscurio, il Signore delle Tenebre.',
    colors: { floor: '#24203a', floor2: '#2c2746', wall: '#0e0c18', wallTop: '#3e3468', wallFace: '#1c1834', accent: '#b77cff' },
  },
  {
    id: 'vulcano', slot: 4, name: 'Monte Vulcano', elem: 'fuoco', gen: 'volcano', sight: 7,
    intro: 'Il cuore di Gorm brucia. Magor, il Signore del Male, si è risvegliato.',
    monsters: [['salamandra', 3], ['guerriero', 3], ['bombo', 2], ['sacerdote', 2], ['lavico', 2]],
    elites: ['mastodontico'], boss: 'magor', ambient: 'embers', music: 'vulcano',
    colors: { floor: '#3e2a24', floor2: '#4c322a', wall: '#2a1614', wallTop: '#6a3428', wallFace: '#2e1612', accent: '#ff7a2a' },
  },
];
G.BIOME_BY_ID = {}; for (const b of G.BIOMES) G.BIOME_BY_ID[b.id] = b;
// regioni possibili per ogni tappa del viaggio
G.SLOTS = [['foresta'], ['mare', 'nebbie'], ['roscamar'], ['cieli', 'orizzonte'], ['vulcano']];
// regioni sostituite dalla v1.5.0 (per convertire i salvataggi)
G.RENAMED_REGIONS = { ghiaccio: 'nebbie', luce: 'orizzonte' };
G.FLOORS_PER_REGION = 3;
G.TOTAL_FLOORS = G.SLOTS.length * G.FLOORS_PER_REGION;
G.regionOf = (floor) => Math.floor((floor - 1) / G.FLOORS_PER_REGION);
G.floorInRegion = (floor) => ((floor - 1) % G.FLOORS_PER_REGION) + 1;
G.isBossFloor = (floor) => G.floorInRegion(floor) === G.FLOORS_PER_REGION;
// bioma di un piano secondo il percorso scelto nella partita corrente
G.biomeOf = function (floor) {
  const slot = G.regionOf(floor);
  const R = G.run;
  const id = (R && R.route && R.route[slot]) || G.SLOTS[Math.min(slot, G.SLOTS.length - 1)][0];
  return G.BIOME_BY_ID[id];
};

// Livelli di Eclissi (difficoltà crescenti, sbloccati vincendo)
G.ECLISSI = [
  { name: 'Normale',     desc: "L'avventura come il Vecchio Saggio l'ha immaginata." },
  { name: 'Eclissi I',   desc: 'I nemici hanno +20% PV.' },
  { name: 'Eclissi II',  desc: 'Precedenti + nemici più numerosi, élite più frequenti e +10% danni nemici.' },
  { name: 'Eclissi III', desc: 'Precedenti + altri +15% danni nemici e più trappole.' },
  { name: 'Eclissi IV',  desc: 'Precedenti + le pozioni curano il 25% in meno e ottieni il 15% di esperienza in meno.' },
  { name: 'Eclissi V',   desc: 'Precedenti + i boss hanno +30% PV e +10% danni. La vera prova.' },
];

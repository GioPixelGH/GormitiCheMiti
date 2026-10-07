'use strict';
// ============================================================
//  data_world.js : tile, biomi, regioni
// ============================================================
G.T = {
  WALL: 0, FLOOR: 1, GRASS: 2, TALL: 3, TREE: 4, SHALLOW: 5, DEEP: 6, LAVA: 7,
  CHASM: 8, BRIDGE: 9, RUBBLE: 10, CRYSTAL: 11, DOOR: 12, DOOR_OPEN: 13, STAIRS: 14,
  SAND: 15, ASH: 16, PILLAR: 17,
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
})();

// ------------------------------------------------------------
//  Biomi / regioni (3 piani ciascuna, il 3° è l'arena del boss)
// ------------------------------------------------------------
G.BIOMES = [
  {
    id: 'foresta', name: 'Foresta Silente', elem: 'foresta', gen: 'caves', sight: 8,
    intro: 'Gli alberi millenari tacciono. Qualcosa ha corrotto la Foresta Silente.',
    monsters: [['rovo', 3], ['lupo', 4], ['fungo', 2], ['calabrone', 3], ['fuocofatuo', 2]],
    elites: ['treant'], boss: 'cerbante', ambient: 'leaves', music: 0,
    colors: { floor: '#4a3d2a', floor2: '#5a4a34', wall: '#23301c', wallTop: '#2c5226', wallFace: '#3a2a1a', accent: '#7bd65a' },
  },
  {
    id: 'mare', name: 'Fossa degli Antichi Spiriti', elem: 'mare', gen: 'caves', sight: 7,
    intro: 'Le maree sono impazzite. Dalle profondità sale un canto antico e minaccioso.',
    monsters: [['granchio', 4], ['polypus', 2], ['medusa', 3], ['squalo', 3], ['annegato', 2]],
    elites: ['crabs'], boss: 'orrore', ambient: 'bubbles', music: 1,
    colors: { floor: '#28405a', floor2: '#32506c', wall: '#152536', wallTop: '#46698a', wallFace: '#1c3048', accent: '#5ac8ff' },
  },
  {
    id: 'roscamar', name: 'Caverna di Roscamar', elem: 'terra', gen: 'rooms', sight: 6,
    intro: 'Nelle viscere della terra il buio respira. Obscurio attende tra i cristalli.',
    monsters: [['golem', 3], ['pipistrello', 3], ['talpa', 2], ['minatore', 3], ['ombra', 2]],
    elites: ['colosso'], boss: 'obscurio', ambient: 'dust', music: 2,
    colors: { floor: '#3e342c', floor2: '#4c4036', wall: '#2a221c', wallTop: '#73604c', wallFace: '#3a2e24', accent: '#c9a26a' },
  },
  {
    id: 'cieli', name: 'Picchi della Valle del Destino', elem: 'aria', gen: 'islands', sight: 9,
    intro: 'Sopra le nuvole, i venti urlano. Una fenice infernale domina i picchi.',
    monsters: [['arpia', 3], ['spiritovento', 3], ['gargolla', 2], ['folgoratore', 2], ['grifone', 2]],
    elites: ['mystral'], boss: 'devilfenix', ambient: 'wind', music: 3,
    colors: { floor: '#5a6274', floor2: '#6a7386', wall: '#3a4150', wallTop: '#949eb2', wallFace: '#4a5266', accent: '#e8f4ff' },
  },
  {
    id: 'vulcano', name: 'Monte Vulcano', elem: 'fuoco', gen: 'volcano', sight: 7,
    intro: 'Il cuore di Gorm brucia. Magor, il Signore del Male, si è risvegliato.',
    monsters: [['salamandra', 3], ['guerriero', 3], ['bombo', 2], ['sacerdote', 2], ['lavico', 2]],
    elites: ['lavion'], boss: 'magor', ambient: 'embers', music: 4,
    colors: { floor: '#3e2a24', floor2: '#4c322a', wall: '#2a1614', wallTop: '#6a3428', wallFace: '#2e1612', accent: '#ff7a2a' },
  },
];
G.FLOORS_PER_REGION = 3;
G.TOTAL_FLOORS = G.BIOMES.length * G.FLOORS_PER_REGION;
G.regionOf = (floor) => Math.floor((floor - 1) / G.FLOORS_PER_REGION);
G.floorInRegion = (floor) => ((floor - 1) % G.FLOORS_PER_REGION) + 1;
G.isBossFloor = (floor) => G.floorInRegion(floor) === G.FLOORS_PER_REGION;

// Livelli di Eclissi (difficoltà crescenti, sbloccati vincendo)
G.ECLISSI = [
  { name: 'Normale',     desc: "L'avventura come il Vecchio Saggio l'ha immaginata." },
  { name: 'Eclissi I',   desc: 'I nemici hanno +20% PV.' },
  { name: 'Eclissi II',  desc: 'Precedenti + nemici più numerosi, élite più frequenti e +10% danni nemici.' },
  { name: 'Eclissi III', desc: 'Precedenti + altri +15% danni nemici e più trappole.' },
  { name: 'Eclissi IV',  desc: 'Precedenti + le pozioni curano il 25% in meno e ottieni il 15% di esperienza in meno.' },
  { name: 'Eclissi V',   desc: 'Precedenti + i boss hanno +30% PV e +10% danni. La vera prova.' },
];

// I volti dell'era: sprite (16x16, boss 24x24) e ritratti (48x48) dei personaggi, disegnati a mano
// con forme geometriche guardando le carte originali (archivio locale riferimenti/).
// Genera js/volti.js con: node tools/pixel/genera.js
const { Tela } = require('./pittore');

const SPRITE = {};
const RITRATTI = {};

// =====================================================================================
//  EROI — Prima Serie
// =====================================================================================
// Gheos, il Signore della Potenza: roccia arancio a macchie, aculei grigi, maglio chiodato
SPRITE.gheos = () => {
  const t = new Tela(16);
  t.rect(4, 12, 3, 2, 'o').rect(3, 14, 4, 1, 'o');
  t.ellisse(7.5, 9, 4.4, 3.4, 'o');
  t.ellisse(3.6, 7.4, 1.8, 1.4, 'o');
  t.rect(1, 8, 2, 3, 'o').ellisse(1.8, 11.2, 1.3, 1.1, 'o');
  t.ellisse(7.5, 4.4, 2.4, 2.1, 'o').poligono([[6, 4], [7.5, 0.6], [9, 4]], 'o');
  t.luce({ o: ['O', 'R'] });
  t.punti([[5, 3], [3, 5], [1, 7], [4, 11]], 's');
  t.rect(4, 9, 4, 1, 'b').punti([[5, 9], [7, 9]], 'G');
  t.punti([[5, 8], [3, 10], [6, 12], [5, 6]], 'D');
  t.px(6, 4, 'e');
  t.specchia();
  t.linea(13, 11, 13, 7, 'h');
  t.ellisse(12.6, 4, 2.2, 2.8, 'g').luce({ g: ['m', 'G'] });
  t.punti([[11, 3], [13, 2], [14, 4], [11, 5], [13, 6]], 'l');
  return { pal: { o: '#e07438', O: '#f49a5c', R: '#a8482a', D: '#6a2a1a', s: '#b4b4bc', b: '#9a9aa4', G: '#2e2e36', g: '#4a4a54', m: '#6a6a76', h: '#5a4030', l: '#d8d8e0', e: '#ffe25a' }, t };
};

// Tasarau, il Signore della Foresta: gigante di legno rosso-bruno, un grande occhio, quattro braccia, liane
SPRITE.tasarau = () => {
  const t = new Tela(16);
  t.rect(4, 12, 3, 2, 'b').rect(3, 14, 4, 1, 'b');
  t.ellisse(7.5, 8.5, 3.8, 3.6, 'b');
  t.ellisse(7.5, 4.6, 2.6, 2.4, 'b');
  t.rect(2, 6, 2, 2, 'b').rect(2, 9, 2, 2, 'b');
  t.luce({ b: ['B', 'n'] });
  t.rect(1, 5, 2, 2, 'h').rect(1, 10, 2, 2, 'h');
  t.linea(5.5, 3, 4, 1, 'n').px(6, 2, 'n');
  t.punti([[3, 6], [3, 10]], 'v').linea(4, 11, 7, 8, 'v').px(6, 13, 'v');
  t.px(7, 6, 'n');
  t.specchia();
  t.rect(7, 4, 2, 1, 'e').px(7, 4, 'E');
  return { pal: { b: '#a8502a', B: '#c87444', n: '#5e2814', h: '#3a2418', v: '#3a9a3a', V: '#2a6a2a', e: '#ffd84a', E: '#2a1408' }, t };
};

// Poivrons, il Signore del Mare: corpo blu, testa di polpo viola con i tentacoli, pinne azzurre
SPRITE.poivrons = () => {
  const t = new Tela(16);
  t.rect(4, 11, 3, 3, 'b').rect(3, 14, 4, 1, 'b');
  t.ellisse(7.5, 8.5, 3.6, 3, 'b');
  t.rect(2, 7, 2, 4, 'b').ellisse(2.5, 11, 1.2, 1, 'b');
  t.luce({ b: ['B', 'd'] });
  t.rect(5, 11, 3, 2, 'c');
  t.rect(1, 6, 1, 3, 'f').px(3, 12, 'f').punti([[3, 5], [2, 6]], 'f').punti([[1, 12], [3, 12]], 'f');
  t.ellisse(7.5, 3.6, 2.8, 2.6, 'p').luce({ p: ['P', 'q'] });
  t.rect(5, 5, 1, 3, 'q').rect(6, 5, 1, 4, 'p').px(7, 6, 'q');
  t.px(6, 3, 'e');
  t.specchia();
  return { pal: { b: '#2a6ac8', B: '#4a92e2', d: '#1a3a8a', p: '#5a3ab8', P: '#7c5cda', q: '#38207e', f: '#8adcf2', c: '#5ae0d0', e: '#fff27a' }, t };
};

// Noctis, il Signore dei Cieli: corpo verde acqua, testa bianca con il becco, ali membranose bordate di giallo
SPRITE.noctis = () => {
  const t = new Tela(16);
  t.poligono([[6, 6], [0.6, 2], [0.6, 9.5], [4, 11.5]], 'a').linea(1, 2, 5.5, 5.5, 'y');
  t.rect(5, 11, 2, 3, 't').rect(4, 14, 3, 1, 'y');
  t.ellisse(7.5, 8.2, 2.8, 2.8, 't');
  t.rect(3, 7, 2, 2, 't').px(3, 9, 'y');
  t.luce({ t: ['T', 'u'], a: ['', 'A'] });
  t.rect(5, 10, 3, 2, 'k');
  t.ellisse(7.5, 6.6, 2, 1.3, 'w');
  t.ellisse(7.5, 3.6, 2.3, 2.2, 'w').luce({ w: ['', 'W'] });
  t.px(6, 3, 'k').punti([[7, 4], [7, 5]], 'o').punti([[5, 1], [5, 2]], 'y');
  t.specchia();
  return { pal: { t: '#3ab8a8', T: '#6ad8c8', u: '#1a7a70', w: '#f4f8ff', W: '#c4d4e4', a: '#e4ecf4', A: '#a8b8c8', y: '#ffd23a', o: '#ff8a2a', k: '#1a1a24' }, t };
};

// =====================================================================================
//  EROI — Seconda Serie
// =====================================================================================
// Kolossus, il Signore della Terra: gigante di pietra grigia a placche, quattro braccia gialle maculate
SPRITE.kolossus = () => {
  const t = new Tela(16);
  t.rect(4, 11, 3, 1, 's').rect(4, 12, 3, 2, 'y').rect(3, 14, 4, 1, 'd');
  t.ellisse(7.5, 8, 4.4, 3.6, 's');
  t.luce({ s: ['S', 't'] });
  t.ellisse(4, 5.6, 2, 1.4, 'd').ellisse(6.5, 9, 1.2, 0.9, 'd');
  t.rect(1, 5, 3, 2, 'y').rect(1, 8, 3, 2, 'y').luce({ y: ['Y', 'o'] });
  t.punti([[2, 5], [1, 9], [5, 13]], 'k');
  t.ellisse(7.5, 4.5, 1.8, 1.6, 'h').rect(6, 5, 2, 1, 'd');
  t.specchia();
  return { pal: { s: '#8a8a88', S: '#b0b0ac', t: '#5a5a58', d: '#5a4a3a', y: '#e0b030', Y: '#f2d060', o: '#a07818', k: '#2a2018', h: '#d8d0c0' }, t };
};

// Barbataus, il Signore della Foresta: legno bruno, lunga barba verde lime, corona, braccio-liana
SPRITE.barbataus = () => {
  const t = new Tela(16);
  t.rect(4, 11, 3, 2, 'b').rect(3, 13, 4, 2, 'l');
  t.ellisse(7.5, 8.5, 3.6, 3, 'b');
  t.rect(2, 7, 2, 3, 'b');
  t.ellisse(7.5, 4.2, 2.2, 2, 'b');
  t.luce({ b: ['B', 'n'] });
  t.ellisse(3.5, 6, 2, 1.4, 'v').luce({ v: ['', 'V'] });
  t.rect(5, 2, 3, 1, 'n').punti([[5, 1], [7, 1]], 'n');
  t.px(6, 4, 'e');
  t.poligono([[5.5, 5], [10, 5], [9, 10], [7.5, 11], [6, 10]], 'l').luce({ l: ['L', ''] });
  t.punti([[1, 10], [2, 11], [3, 10]], 'w');
  t.specchia();
  t.rect(12, 7, 3, 4, '.').rect(12, 10, 2, 2, '.').punti([[12, 11], [13, 11], [14, 10]], '.');
  t.rect(12, 7, 2, 2, 'b').linea(13, 9, 14, 12, 'v').linea(14, 12, 12, 14, 'v').px(12, 14, 'V');
  return { pal: { b: '#6a3a20', B: '#8a5632', n: '#3a2010', l: '#8ae03a', L: '#bcf274', v: '#4a8a2a', V: '#2a5a1a', w: '#e0e0d8', e: '#c8ff6a' }, t };
};

// Carrapax, il Signore dei Mari: cavaliere-granchio blu, petto azzurro, spallacci spinosi, chele giganti
SPRITE.carrapax = () => {
  const t = new Tela(16);
  t.rect(4, 11, 3, 3, 'b').rect(4, 12, 3, 1, 'c').rect(3, 14, 4, 1, 'd');
  t.ellisse(7.5, 8.5, 3.4, 3, 'c').rect(5, 10, 3, 2, 'b');
  t.rect(2, 7, 2, 2, 'b');
  t.luce({ b: ['B', 'd'], c: ['C', ''] });
  t.ellisse(3.6, 5.8, 2.2, 1.6, 't');
  t.ellisse(2, 11, 1.8, 2, 't').luce({ t: ['T', 'k'] }).punti([[2, 12], [2, 13]], '.');
  t.punti([[3, 5], [2, 6]], 'k');
  t.ellisse(7.5, 4.5, 1.6, 1.4, 't').px(7, 4, 'e');
  t.specchia();
  return { pal: { b: '#2a6ab8', B: '#4a8ad4', d: '#1a3a7a', c: '#8ad8e0', C: '#bcf2f2', t: '#1a5a6a', T: '#2a7a8a', k: '#0a2a3a', e: '#fff27a' }, t };
};

// Elios, il Signore dei Cieli: corpo grigio-blu, collare di piume, testa bianca col becco nero, grandi ali bianche
SPRITE.elios = () => {
  const t = new Tela(16);
  t.poligono([[6, 6], [0.6, 3], [0.6, 7], [1.6, 8], [0.6, 9.5], [2.2, 10.5], [5, 9.5]], 'w').luce({ w: ['', 'W'] });
  t.rect(4, 11, 3, 3, 'n').rect(3, 14, 4, 1, 'w');
  t.ellisse(7.5, 8.5, 2.6, 2.8, 'g');
  t.rect(3, 7, 2, 2, 'g').rect(2, 9, 2, 2, 'n').px(2, 11, 'w');
  t.luce({ g: ['G', 'h'], n: ['N', ''] });
  t.ellisse(7.5, 8.6, 1.4, 1.7, 'c');
  t.ellisse(7.5, 6, 2.2, 1, 'w');
  t.ellisse(7.5, 3.5, 1.8, 2, 'w').px(6, 3, 'h').rect(7, 4, 1, 2, 'k');
  t.specchia();
  return { pal: { g: '#7a8aa8', G: '#9aaac8', h: '#4a5a78', c: '#8ae0f0', w: '#f8f8ff', W: '#c4ccdc', n: '#2a2a6a', N: '#3e3e8e', k: '#101018' }, t };
};

// =====================================================================================
//  EROI — Terza Serie ed extra
// =====================================================================================
// Il Sommo Luminescente: corpo giallo, armatura e spada d'argento, grandi ali dorate a raggiera
SPRITE.luminescente = () => {
  const t = new Tela(16);
  t.poligono([[6, 7], [0.6, 1], [0.6, 4], [2, 5], [0.6, 7], [0.6, 9.5], [2, 10.5], [5, 10]], 'g').luce({ g: ['', 'G'] });
  t.rect(5, 11, 2, 3, 's').rect(4, 14, 3, 1, 's');
  t.ellisse(7.5, 8.5, 2.6, 2.8, 'y');
  t.rect(3, 7, 2, 3, 'y');
  t.luce({ y: ['Y', 'o'], s: ['S', 't'] });
  t.rect(5, 12, 2, 1, 't');
  t.ellisse(4.6, 6.5, 1.5, 1.2, 's').rect(7, 8, 1, 2, 's');
  t.ellisse(7.5, 4, 1.9, 2, 's').luce({ s: ['S', 't'] });
  t.punti([[5, 2], [6, 1], [7, 1], [7, 2]], 'S').rect(6, 4, 2, 1, 'k').px(6, 4, 'e');
  t.specchia();
  t.linea(12, 9, 14, 3, 'S').linea(13, 9, 15, 4, 's').px(12, 10, 'y');
  return { pal: { y: '#ffd84a', Y: '#fff2a4', o: '#c89818', s: '#c8ccd8', S: '#ffffff', t: '#74788a', g: '#d49444', G: '#9a5a1c', k: '#3a3a4a', e: '#3ae8ff' }, t };
};

// Il Vecchio Saggio: cappuccio viola, lunga barba bianca, bastone con l'Occhio della Vita
SPRITE.saggio = () => {
  const t = new Tela(16);
  t.poligono([[4, 7], [12, 7], [13.5, 15], [2.5, 15]], 'p');
  t.ellisse(7.5, 4.6, 3.2, 3, 'p');
  t.ellisse(3.5, 9.5, 1.4, 2.2, 'p');
  t.luce({ p: ['P', 'q'] });
  t.ellisse(7.5, 5, 1.8, 1.8, 's').px(6, 4, 'k');
  t.poligono([[5.6, 5.6], [10, 5.6], [9, 11], [7.5, 12.4], [6, 11]], 'w').luce({ w: ['', 'W'] });
  t.specchia();
  t.linea(13, 3, 13, 14, 'n').ellisse(13, 2, 1.3, 1.3, 'm').px(12, 1, 'M').px(12, 9, 's');
  return { pal: { p: '#5a3a8a', P: '#8a64c0', q: '#3a2460', s: '#f0d0b0', k: '#1a1028', w: '#f0ece4', W: '#c8c0b8', n: '#8a6a3a', m: '#8affc8', M: '#ffffff' }, t };
};

// =====================================================================================
//  SIGNORI DEL MALE (24x24)
// =====================================================================================
// Orrore Profondo, il Signore di Vulcano: rosso scuro, teschio con corna gialle, ali d'ossa, braccio di lava
SPRITE.orrore = () => {
  const t = new Tela(24);
  t.linea(9, 6, 5, 1.5, 'h').linea(5, 1.5, 1.5, 5, 'h').linea(10, 7, 6.5, 3.5, 'h').linea(6.5, 3.5, 3.5, 7, 'h');
  t.rect(7, 17, 4, 3, 'r');
  t.poligono([[6, 19], [11, 19], [11, 22.6], [10, 21.4], [9, 22.6], [8, 21.4], [7, 22.6], [6, 21.4]], 'o');
  t.ellisse(11.5, 12, 5, 4.6, 'r');
  t.rect(5, 10, 2, 3, 'r');
  t.luce({ r: ['R', 'd'], o: ['O', ''] });
  t.poligono([[10, 14], [13, 14], [11.5, 17.5]], 'y');
  t.ellisse(6, 8.6, 2.5, 2, 'o').luce({ o: ['O', ''] });
  t.ellisse(11.5, 7, 2.6, 2.6, 'g').luce({ g: ['G', 'h'] });
  t.punti([[8, 7], [7, 6], [7, 5], [8, 4]], 'y').px(10, 7, 'e').rect(10, 9, 2, 1, 'h').px(10, 9, 'G');
  t.punti([[6, 18], [3, 11]], 'y');
  t.specchia();
  t.ellisse(4, 13.5, 2.6, 3.6, 'g').luce({ g: ['G', 'h'] }).punti([[3, 16], [4, 17]], 'o').px(5, 17, 'O').punti([[2, 11], [1, 13]], 'y');
  t.rect(17, 10, 2, 4, 'r').ellisse(19.5, 14.6, 1.6, 1.6, 'r').luce({ r: ['R', 'd'] }).punti([[20, 16], [18, 16], [21, 15]], 'y');
  return { pal: { r: '#8a1a14', R: '#b8342a', d: '#4a0a0a', g: '#6a5a4a', G: '#8a7a6a', h: '#3a3028', o: '#ff7a1a', O: '#ffb44a', y: '#ffd23a', e: '#ffe27a' }, t };
};

// Obscurio, il Signore delle Tenebre: blu notte e nero, ali da pipistrello, corna verde chiaro, mazza ferrata rossa
SPRITE.obscurio = () => {
  const t = new Tela(24);
  t.poligono([[9, 8], [1.6, 2], [0.6, 15], [3, 12.5], [4, 16.6], [6, 14], [8, 16.6], [9, 12]], 'n').luce({ n: ['N', 'b'] });
  t.punti([[2, 2], [1, 3], [1, 15], [4, 16]], 'l');
  t.rect(8, 17, 3, 4, 'k').rect(7, 21, 4, 1, 'l');
  t.ellisse(11.5, 12.5, 4.5, 4.5, 'k').luce({ k: ['b', ''] });
  t.ellisse(7, 9, 2.5, 2, 'n').rect(6, 11, 2, 4, 'n').luce({ n: ['N', 'b'] });
  t.ellisse(11.5, 12, 3, 2.6, 'n').luce({ n: ['N', 'b'] });
  t.ellisse(11.5, 7, 2.8, 2.6, 'N').luce({ N: ['M', 'n'] });
  t.poligono([[10, 6], [6.4, 5.4], [5, 2.2], [6.6, 3.6], [10.4, 4.6]], 'l');
  t.px(10, 7, 'e').punti([[10, 9]], 'l');
  t.punti([[9, 13], [7, 10], [10, 16], [9, 19]], 'r');
  t.specchia();
  t.linea(17, 14, 18.6, 16, 'k').ellisse(19.5, 17.5, 2.2, 2.2, 'r').luce({ r: ['R', ''] }).punti([[18, 16], [21, 17], [19, 19], [20, 16]], 'k');
  return { pal: { n: '#1e2a6a', N: '#2e3e8e', M: '#4a5ab0', b: '#121838', k: '#0a0e24', l: '#9ae07a', r: '#e83a3a', R: '#ff7a5a', e: '#ff3a3a' }, t };
};

// Devilfenix, Signore dell'Aria: uomo-fenice blu e viola, becco arancio, grandi ali rosse, sfere d'urto magiche
SPRITE.devilfenix = () => {
  const t = new Tela(24);
  t.linea(9, 8, 1.4, 2.4, 'r', 2).linea(9, 9, 1, 7.6, 'r', 2).linea(9, 10, 1.4, 12.6, 'r', 2).linea(9, 11, 3.6, 16.4, 'r', 2).luce({ r: ['R', 'q'] });
  t.rect(8, 16, 3, 4, 'm').rect(7, 20, 4, 1, 'o');
  t.ellisse(11.5, 12, 3.8, 4, 'b');
  t.rect(6, 10, 2, 4, 'b');
  t.luce({ b: ['B', 'u'], m: ['M', 'q'] });
  t.rect(8, 14, 4, 2, 'm').px(11, 11, 'm');
  t.ellisse(11.5, 6.6, 2.2, 2.4, 'm').luce({ m: ['M', 'q'] }).rect(10, 3, 2, 1, 'M');
  t.px(10, 6, 'y').rect(11, 7, 1, 2, 'o');
  t.ellisse(5.5, 15, 1.6, 1.6, 's').px(5, 14, 'w').luce({ s: ['', 'S'] });
  t.specchia();
  return { pal: { b: '#5a8ae8', B: '#8ab2ff', u: '#3a5ab0', m: '#a82a7a', M: '#d24c9c', q: '#5e1442', r: '#e83a1a', R: '#ff7e3e', o: '#ff8a2a', y: '#ffd23a', s: '#9aeaff', S: '#3ab8ff', w: '#ffffff' }, t };
};

// Magmion, il Signore del Male: rosso a macchie scure, grande bocca verticale zannuta, lama del braccio e coda di roccia
SPRITE.magmion = () => {
  const t = new Tela(24);
  t.rect(7, 16, 4, 4, 'r').rect(6, 20, 5, 1, 'r');
  t.ellisse(11.5, 12, 5.2, 4.6, 'r');
  t.ellisse(5, 13, 2, 5, 'r');
  t.ellisse(11.5, 6.2, 2.8, 3, 'r');
  t.luce({ r: ['R', 'd'] });
  t.poligono([[8, 15], [15, 15], [13, 18.4], [11.5, 17.4], [10, 18.4]], 'h');
  t.rect(10, 6, 2, 4, 'k').punti([[10, 6], [10, 8]], 'y').px(9, 4, 'e');
  t.punti([[4, 18], [6, 18], [7, 21], [9, 11], [6, 10], [8, 14], [4, 13], [10, 3]], 'k');
  t.specchia();
  t.linea(16, 17, 21, 21, 'g', 2).luce({ g: ['G', ''] });
  t.linea(3, 8, 1.4, 13, 'g').linea(1.4, 13, 2.6, 18, 'g').px(2, 13, 'G');
  return { pal: { r: '#d82a2a', R: '#ff5e4e', d: '#8a1010', k: '#3a0a0a', g: '#5a5a60', G: '#8a8a90', h: '#c8c8c8', y: '#ffd23a', e: '#ffe27a' }, t };
};

// Magor, il Signore del Male: colosso di roccia lavica nera, crepe incandescenti, grandi corna, mantello
SPRITE.magor = () => {
  const t = new Tela(24);
  t.poligono([[7, 9], [16, 9], [19.4, 22.6], [4.6, 22.6]], 'd');
  t.ellisse(11.5, 13, 5, 5, 'p');
  t.ellisse(6.5, 9, 2.8, 2.2, 'p');
  t.rect(5, 11, 2, 5, 'p');
  t.rect(8, 18, 3, 4, 'k');
  t.luce({ p: ['P', 'k'], d: ['', 'k'] });
  t.ellisse(11.5, 6.5, 2.5, 2.6, 'k');
  t.punti([[9, 4], [8, 3], [7, 2], [6, 2], [5, 1]], 'h').punti([[5, 7], [4, 8]], 'h').px(6, 6, 'H');
  t.px(10, 6, 'e').px(11, 8, 'o');
  t.linea(9, 11, 8, 15, 'o').px(9, 16, 'o').rect(11, 12, 1, 2, 'O').punti([[5, 16], [6, 16]], 'h');
  t.specchia();
  return { pal: { k: '#1a0a0a', d: '#3a1010', p: '#5a1a14', P: '#7a2a1a', o: '#ff6a1a', O: '#ffc04a', h: '#d8c8a8', H: '#a89878', e: '#ffe24a' }, t };
};

// =====================================================================================
//  LE REGIONI DELL'ERA (Fase 3)
// =====================================================================================
// Aracno il Crudele: insetto-ragno rosso ed esile, testa gialla con calotta rossa e fauci a
// tentacoli, quattro braccia grigie con uncini neri, zampe sottili e piedi scuri; sputa acido verde
SPRITE.aracno = () => {
  const t = new Tela(24);
  t.linea(10.6, 15, 9.4, 19.4, 'r', 2);
  t.poligono([[7.2, 19.4], [10.4, 19.4], [11, 23], [6.4, 23]], 'b').luce({ b: ['B', ''] });
  t.poligono([[9.6, 9], [11.5, 9], [11.5, 15.6], [10.4, 15.6]], 'r');
  t.linea(9.6, 10, 5.6, 7.4, 'g').linea(9.6, 10.6, 5.8, 8.2, 'h');
  t.linea(5.4, 7.2, 4.4, 3.6, 'k').punti([[4, 3], [5, 2], [6, 2], [3, 4]], 'k');
  t.linea(9.4, 12.6, 4.8, 13.2, 'g').linea(9.4, 13.2, 4.8, 13.8, 'h');
  t.linea(4.6, 13.4, 2.4, 15, 'k').punti([[2, 16], [2, 17], [3, 17], [1, 14]], 'k');
  t.ellisse(11.5, 6.6, 3, 2.6, 'y').luce({ y: ['Y', 'o'] });
  t.ellisse(11.5, 4.6, 2.6, 1.7, 'r');
  t.rect(9, 6, 2, 1, 'k');
  t.linea(10.4, 8.6, 9.8, 11.8, 'y').linea(11.2, 8.6, 11.2, 12.4, 'Y');
  t.luce({ r: ['R', 'd'] });
  t.specchia();
  t.punti([[13, 13], [14, 14], [13, 15]], 'v').px(12, 13, 'V');
  return { pal: { r: '#d82a2a', R: '#ff5a4a', d: '#8a1414', y: '#ffd23a', Y: '#ffe88a', o: '#c89a18', g: '#c8c8d0', h: '#8a8a94', k: '#4a4a58', b: '#3a3a44', B: '#5a5a66', v: '#7aff4a', V: '#c8ffa0' }, t };
};
// i ragnetti di Aracno: piccoli, rossi e gialli, zampe nere
SPRITE.ragnetto = () => {
  const t = new Tela(16);
  for (const [x0, y0, x1, y1] of [[6, 10, 2, 7], [6, 11, 1.6, 11], [6, 12, 2.4, 14.6], [7, 9, 4, 5.6]]) t.linea(x0, y0, x1, y1, 'k');
  t.ellisse(7.5, 11, 3, 2.2, 'r').luce({ r: ['R', 'd'] });
  t.ellisse(7.5, 8, 1.8, 1.4, 'y').px(7, 8, 'k');
  t.specchia();
  return { pal: { r: '#d82a2a', R: '#ff6a4a', d: '#8a1414', y: '#ffd23a', k: '#4a4a58' }, t };
};
// Lavion il Signore del Terrore: umanoide rosso muscoloso, elmo-cresta grigio a strisce gialle,
// maschera e corazza gialle; il braccio sinistro è una creatura grigia viva (testa con occhio e tentacoli)
SPRITE.lavion = () => {
  const t = new Tela(24);
  t.rect(8, 16, 3, 5, 'r').poligono([[6.6, 20.6], [11, 20.6], [11.4, 23], [6.2, 23]], 'r');
  t.ellisse(11.5, 11, 5.4, 4.4, 'r');
  t.ellisse(11.5, 5.8, 2.6, 3, 'r');
  t.luce({ r: ['R', 'd'] });
  t.poligono([[9, 9.4], [11.5, 9.4], [11.5, 13.6], [9.6, 13]], 'y').rect(9, 14, 3, 2, 'y').luce({ y: ['Y', 'o'] });
  t.poligono([[8.6, 4.6], [9.4, 2.4], [11.5, 1.6], [11.5, 4.6]], 'g').rect(11, 1, 1, 4, 'y').px(10, 3, 'h');
  t.px(10, 6, 'k').rect(10, 7, 2, 2, 'y').px(10, 8, 'o');
  t.punti([[7, 22], [9, 23]], 'k');
  t.specchia();
  // braccio destro (a destra di chi guarda): pugno rosso
  t.ellisse(17.6, 12.6, 1.6, 3.4, 'r').ellisse(18.2, 16.4, 1.9, 1.7, 'r').luce({ r: ['R', 'd'] });
  // braccio sinistro: la creatura viva
  t.linea(5.6, 10, 3.6, 15.4, 'g', 2).linea(3.6, 15.4, 3, 19, 'g', 2);
  t.ellisse(5.4, 8.2, 2.6, 2.2, 'g');
  t.luce({ g: ['G', 'h'] });
  t.linea(7, 9, 10, 10.4, 'g').linea(7.4, 8, 10.4, 8.6, 'g');
  t.px(4.6, 7.6, 'k').px(5, 7, 'G');
  t.punti([[4, 13], [3, 16], [4, 17]], 'b');
  t.punti([[1.6, 19], [2.4, 20.6], [3.6, 20.6], [4.6, 19.6]], 'G').punti([[1, 20], [2, 21.6], [4, 21.6]], 'h');
  return { pal: { r: '#d8281e', R: '#ff5a40', d: '#8a1410', y: '#ffd23a', Y: '#fff09a', o: '#c89a18', g: '#b8bcb8', G: '#e0e4e0', h: '#7a807a', k: '#1a1a1a', b: '#3a3a3a' }, t };
};
// il braccio vivo di Lavion, staccato dal corpo: testa con occhio, tentacoli e lunghe dita artigliate
SPRITE.braccio = () => {
  const t = new Tela(16);
  t.linea(8, 8, 5, 13.4, 'g', 2);
  t.ellisse(9, 5.4, 3.4, 2.8, 'g');
  t.luce({ g: ['G', 'h'] });
  t.linea(11.4, 6, 14, 8, 'g').linea(11.6, 4.6, 14.6, 5, 'g').linea(10.4, 7.6, 12, 10.4, 'g');
  t.px(8, 4.6, 'k').px(9, 4, 'G');
  t.punti([[6, 11], [7, 9]], 'b');
  t.punti([[3, 14], [4, 15], [6, 15], [7, 14]], 'G').punti([[2, 15], [5, 15]], 'h');
  return { pal: { g: '#b8bcb8', G: '#e0e4e0', h: '#7a807a', k: '#1a1a1a', b: '#3a3a3a' }, t };
};
// Armageddon il Signore del Vulcano: grande testa-cupola rossa a creste, anello di spine nere,
// corpo nero, braccio destro enorme, gambe di lava gialla a macchie rosse
SPRITE.armageddon = () => {
  const t = new Tela(24);
  t.poligono([[6.4, 15], [10.6, 15], [11.4, 23], [4.4, 23]], 'y').luce({ y: ['Y', 'o'] });
  t.punti([[7, 18], [9, 20], [6, 21], [8, 22], [10, 17]], 's');
  t.ellisse(11.5, 13, 4.6, 3.6, 'n').luce({ n: ['N', ''] });
  t.rect(10, 13, 3, 3, 'r');
  t.linea(7, 11, 3.4, 16.6, 'r', 2).punti([[2, 17], [3, 18.6], [4.6, 18]], 'k');
  t.ellisse(11.5, 6.4, 5.6, 4.6, 'r').luce({ r: ['R', 'd'] });
  t.linea(9, 3, 8.6, 9, 'd').linea(11, 2, 11, 9, 'd');
  t.rect(7, 10, 5, 1, 'n');
  t.punti([[6, 9], [5, 10], [7, 11], [9, 11.4], [4, 11], [5, 12], [6, 4], [7, 2.6], [5.6, 6.4], [4, 9]], 'k');
  t.specchia();
  // braccio destro enorme, a solchi
  t.ellisse(18.6, 14.2, 3.2, 4.4, 'r').luce({ r: ['R', 'd'] });
  t.punti([[18, 12], [19, 14], [17, 15], [19, 16.6], [18, 18]], 'd');
  t.punti([[16, 19], [18, 19.4], [20, 19]], 'k');
  return { pal: { r: '#c8281e', R: '#ee4a3a', d: '#7a1410', n: '#1a1418', N: '#3a3238', y: '#ffc83a', Y: '#ffe27a', o: '#e88a1a', s: '#b8281e', k: '#0e0a0c' }, t };
};

// i guerrieri del male dell'era (Fase 4)
Object.assign(SPRITE, require('./guerrieri'));

Object.assign(RITRATTI, require('./ritratti'));

module.exports = { SPRITE, RITRATTI };

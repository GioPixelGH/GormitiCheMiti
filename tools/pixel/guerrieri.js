// Sprite 16x16 dei guerrieri del male dell'era (Fase 4), disegnati guardando carte e statuine
// dell'archivio locale. Ogni funzione restituisce { pal, t }; li raccoglie disegni.js.
const { Tela } = require('./pittore');
const S = {};
const ROSSO = { r: '#d82a1e', R: '#ff5a40', d: '#8a1410' };

// =====================================================================================
//  FORESTA SILENTE — l'avanguardia di Magmion (Prima Serie, Magma e Lava)
// =====================================================================================
// Insecticus: insetto rosso a segmenti, spalle di roccia grigie, braccia gialle con artigli neri
S.insecticus = () => {
  const t = new Tela(16);
  t.linea(6.4, 10, 5.4, 13.6, 'r').punti([[4, 14], [5, 14]], 'k');
  t.rect(5, 9, 3, 1, 'y');
  t.rect(6, 6, 2, 3, 'r').px(6, 7, 'd');
  t.ellisse(4.8, 5.6, 1.9, 1.5, 'g').luce({ g: ['G', 'h'] });
  t.linea(3.6, 7, 3, 9.6, 'y').punti([[2, 10], [3, 11], [4, 10]], 'k');
  t.ellisse(7.5, 2.8, 1.8, 1.9, 'r');
  t.rect(6, 3, 2, 1, 'y').px(6, 3, 'k');
  t.luce({ r: ['R', 'd'] });
  t.specchia();
  return { pal: Object.assign({ y: '#ffc83a', g: '#b4b4b0', G: '#dcdcd8', h: '#80807c', k: '#2a2a30' }, ROSSO), t };
};
// Lo Strappapensieri: elmo grigio chiodato, corpo rosso con spine nere, braccia gialle alzate, gambe corazzate grigie
S.strappapensieri = () => {
  const t = new Tela(16);
  t.rect(5, 11, 2, 3, 'g').rect(5, 10, 2, 1, 'r').punti([[4, 14], [6, 14]], 'k');
  t.ellisse(7.5, 7.6, 2.6, 2.6, 'r');
  t.punti([[4, 7], [4, 9]], 'k');
  t.linea(5, 6, 3, 3.4, 'y').linea(3, 3.4, 2.6, 1.6, 'y').punti([[2, 0], [3, 0], [1, 1]], 'k');
  t.ellisse(7.5, 3.4, 2.3, 1.7, 'g').punti([[6, 1], [5, 2]], 'k');
  t.rect(6, 4, 2, 1, 'r').px(6, 3, 'v');
  t.luce({ r: ['R', 'd'], g: ['G', ''] });
  t.specchia();
  return { pal: Object.assign({ y: '#ffc83a', g: '#b4b4b0', G: '#dcdcd8', k: '#2a2a30', v: '#7aff4a' }, ROSSO), t };
};
// L'Anonimo Multiforme: mutaforma tutto rosso, piccole corna, braccia a tromba con il fondo giallo
S.anonimo = () => {
  const t = new Tela(16);
  t.rect(5, 11, 2, 3, 'r').punti([[4, 14], [6, 14]], 'r');
  t.ellisse(7.5, 8.2, 2.8, 3.2, 'r');
  t.linea(5, 6.6, 3, 10, 'r');
  t.ellisse(2.6, 11, 1.5, 1.1, 'r').px(2, 11, 'y').px(3, 11, 'Y');
  t.ellisse(7.5, 3.4, 2.2, 1.8, 'r').punti([[6, 1], [5, 2]], 'r').px(6, 3, 'k');
  t.punti([[4, 7], [5, 5]], 'R');
  t.luce({ r: ['R', 'd'] });
  t.specchia();
  return { pal: Object.assign({ y: '#ffc83a', Y: '#fff09a', k: '#2a0a08' }, ROSSO), t };
};
// Il Guardiano Urlante: testa grigia con zanne gialle e terzo occhio su un'antenna, corazza grigia
// a spine gialle, lame e uncini di ferro
S.guardiano = () => {
  const t = new Tela(16);
  t.rect(5, 10, 2, 1, 'r').rect(5, 11, 2, 2, 'b').rect(4, 13, 3, 1, 'r');
  t.rect(6, 7, 2, 3, 'r').px(7, 9, 'y');
  t.ellisse(4.8, 6, 2.2, 1.3, 'g').px(3, 5, 'y').px(5, 4, 'y');
  t.linea(3.4, 7.4, 2.6, 9.6, 'g').punti([[1, 10], [2, 11], [1, 12], [3, 11]], 'k');
  t.ellisse(7.5, 3.4, 2, 1.6, 'g').rect(6, 4, 2, 1, 'y').px(6, 3, 'k');
  t.px(7, 1, 'r').px(7, 0, 'e');
  t.luce({ r: ['R', 'd'], g: ['G', 'h'] });
  t.specchia();
  return { pal: Object.assign({ y: '#ffc83a', g: '#a8aaa8', G: '#d0d2d0', h: '#707270', k: '#2a2a30', b: '#3a3a40', e: '#1a1a20' }, ROSSO), t };
};

// =====================================================================================
//  FOSSA DEGLI ANTICHI SPIRITI — l'esercito di Orrore Profondo (Seconda Serie)
// =====================================================================================
const SECONDA = { m: '#9a1c1c', M: '#c43a2a', n: '#5a0e0e', o: '#ff7a1a', O: '#ffa848', y: '#ffd23a', g: '#7a746c', G: '#a8a098', h: '#4a4640', k: '#1e1210', w: '#f4f0e8' };
// Geyser l'Iroso: corpo bordeaux, petto giallo, testa arancio con cresta grigia, placche di pietra con
// sfiati gialli, grandi stivali arancio; getti di vapore
S.geyser = () => {
  const t = new Tela(16);
  t.ellisse(5.2, 13.6, 1.9, 1.3, 'o').px(5, 13, 'g');
  t.rect(5, 10, 2, 3, 'm');
  t.ellisse(7.5, 7.4, 2.6, 2.4, 'm').rect(6, 6, 2, 2, 'y');
  t.ellisse(4.2, 5.6, 1.8, 1.4, 'm').linea(3.2, 6.6, 2.6, 9, 'm');
  t.ellisse(2.4, 10, 1.3, 1.3, 'g').px(2, 10, 'y');
  t.ellisse(7.5, 3.4, 1.7, 1.7, 'o').rect(7, 2, 1, 3, 'g').px(6, 4, 'k');
  t.luce({ m: ['M', 'n'], o: ['O', ''] });
  t.specchia();
  t.punti([[1, 4], [0, 3], [14, 5], [15, 4]], 'w');
  return { pal: SECONDA, t };
};
// L'Incandescente Fantasma: spirito di lava che cola, testa gialla fusa con la bocca nera, spalle e piedi grigi
S.incandescente = () => {
  const t = new Tela(16);
  t.poligono([[3.6, 12], [7, 12], [7, 15], [3, 15]], 'g');
  t.rect(5, 9, 2, 3, 'm').px(5, 11, 'y');
  t.ellisse(7.5, 7.2, 2.4, 2.2, 'm').rect(6, 6, 2, 1, 'y');
  t.ellisse(5, 4.8, 2, 1, 'g');
  t.linea(4, 6, 1, 6.6, 'm').punti([[1, 7], [1, 8], [3, 7]], 'm');
  t.ellisse(7.5, 3, 1.9, 1.8, 'y').punti([[6, 5], [6, 6]], 'y').px(7, 4, 'k').px(6, 2, 'k');
  t.luce({ m: ['M', 'n'], g: ['G', 'h'], y: ['', 'o'] });
  t.specchia();
  return { pal: SECONDA, t };
};
// Lamacciaio il Tagliagole: demone bordeaux con le corna, petto arancio, lunghe lame d'acciaio al posto delle braccia
S.lamacciaio = () => {
  const t = new Tela(16);
  t.ellisse(5.2, 13.6, 1.8, 1.4, 'o').px(6, 13, 'y');
  t.rect(5, 10, 2, 3, 'm');
  t.ellisse(7.5, 7.6, 2.6, 2.6, 'm').rect(6, 6, 2, 3, 'o').px(7, 8, 'y');
  t.poligono([[3, 4], [5, 3.4], [5.4, 5], [3.4, 5.4]], 'g').px(4, 4, 'y');
  t.linea(4, 6.6, 1.6, 11.6, 'g').linea(3.4, 6.6, 1, 11, 'G').px(1, 12, 'g');
  t.ellisse(7.5, 3.4, 1.6, 1.8, 'M').punti([[6, 1], [7, 2]], 'M').px(6, 5, 'g').px(6, 3, 'y');
  t.luce({ m: ['M', 'n'], o: ['O', ''] });
  t.specchia();
  return { pal: SECONDA, t };
};
// Il Misterioso Cavaliere: elmo grigio chiuso senza volto, petto giallo, spalle di fiamma, sfere di fuoco nelle mani
S.cavaliere = () => {
  const t = new Tela(16);
  t.rect(5, 11, 2, 3, 'g').px(4, 12, 'y').rect(5, 14, 2, 1, 'm');
  t.ellisse(7.5, 7.6, 2.6, 2.5, 'm').punti([[6, 6], [7, 7], [6, 8]], 'y');
  t.poligono([[3.4, 5.4], [4, 2.6], [5.6, 4.4], [5.4, 5.8]], 'o');
  t.linea(4, 6.6, 2.6, 8.4, 'm');
  t.ellisse(2.2, 9.6, 1.5, 1.5, 'o').punti([[2, 7], [1, 8]], 'y').px(2, 10, 'O');
  t.rect(6, 2, 2, 3, 'g').rect(7, 3, 1, 2, 'k');
  t.luce({ m: ['M', 'n'], g: ['G', 'h'] });
  t.specchia();
  return { pal: SECONDA, t };
};
// Incubo di Fuoco: spirito di fiamma senza corpo solido, braccia a spirale, cresta gialla, gambe che sfumano
S.incubo = () => {
  const t = new Tela(16);
  t.linea(6.4, 9, 4.6, 13, 'm', 2).poligono([[2.6, 15], [5.4, 12.4], [6.4, 15]], 'm').px(5, 12, 'y');
  t.ellisse(7.5, 6.8, 2.4, 2.6, 'm').punti([[6, 5], [7, 6], [6, 7], [7, 8]], 'o').px(6, 4, 'y');
  t.linea(5, 5.6, 2, 4, 'o').punti([[4, 5], [2, 4]], 'm').punti([[1, 3], [2, 2]], 'y');
  t.poligono([[6, 4.4], [7.5, 0.6], [7.5, 4.4]], 'y').px(7, 3, 'o');
  t.luce({ m: ['M', 'n'] });
  t.specchia();
  return { pal: SECONDA, t };
};
// Bombos Potenza di Fuoco: golem di roccia scura con tante bocche-cannone arancio incandescenti
S.bombos = () => {
  const t = new Tela(16);
  t.rect(4, 11, 3, 3, 'g').px(5, 12, 'o').rect(4, 14, 3, 1, 'm');
  t.ellisse(7.5, 7, 3.4, 3, 'g');
  t.rect(3, 6, 1, 2, 'm').ellisse(2.4, 9, 1.4, 1.5, 'g');
  t.ellisse(7.5, 3.4, 1.7, 1.3, 'g');
  t.luce({ g: ['G', 'h'] });
  t.punti([[5, 6], [6, 8], [4, 8], [2, 9], [7, 3], [6, 10]], 'o').px(7, 8, 'y');
  t.specchia();
  return { pal: SECONDA, t };
};

// =====================================================================================
//  PIANURA DELLE NEBBIE — il Popolo della Lava (Prima Serie)
// =====================================================================================
const LAVA = Object.assign({ y: '#ffc83a', Y: '#ffe88a', o: '#c88a10', g: '#a8aaa8', G: '#d0d2d0', k: '#2a2a30', b: '#3a3a40' }, ROSSO);
// Sparafuoco: corpo di lava rosso, testa a goccia con un unico grande occhio giallo, aculei gialli
S.sparafuoco = () => {
  const t = new Tela(16);
  t.rect(5, 11, 2, 3, 'r').px(4, 14, 'r');
  t.ellisse(7.5, 9, 2.8, 2.4, 'r');
  t.linea(5, 8, 2.6, 11, 'r').punti([[2, 11], [3, 12], [1, 12]], 'r');
  t.luce({ r: ['R', 'd'] });
  t.poligono([[5, 6.4], [7.5, 0.2], [7.5, 6.4]], 'r').ellisse(7.5, 5, 2.2, 1.6, 'r');
  t.luce({ r: ['R', ''] });
  t.rect(6, 6, 2, 1, 'd');
  t.ellisse(7.5, 3.8, 1, 1.1, 'y').px(7, 3, 'Y');
  t.punti([[4, 8], [3, 10], [5, 5], [4, 11]], 'y');
  t.specchia();
  return { pal: LAVA, t };
};
// Malvagius il Terribile: demone rosso curvo, cresta gialla, fauci argentate, coda grigia
S.malvagius = () => {
  const t = new Tela(16);
  t.rect(5, 11, 2, 2, 'r').punti([[4, 13], [6, 13]], 'k');
  t.ellisse(7.5, 8, 3, 2.6, 'r');
  t.linea(5, 7, 3, 10.4, 'r').ellisse(3, 11, 1.3, 1.2, 'r').punti([[2, 12], [3, 12]], 'k');
  t.ellisse(7.5, 4.4, 1.8, 1.6, 'r');
  t.luce({ r: ['R', 'd'] });
  t.poligono([[5.4, 3], [6, 1], [7, 2.4], [7.5, 0.8], [7.5, 3]], 'y');
  t.rect(6, 5, 2, 1, 'G').px(6, 4, 'k');
  t.specchia();
  t.linea(10, 12, 13.4, 14, 'g').px(14, 13, 'g');
  return { pal: LAVA, t };
};
// L'Angelo Infuocato: corpo di lava rosso con cappuccio a punta, banda gialla sugli occhi, ali di fuoco
// gialle, pugni scuri alzati
S.angelo = () => {
  const t = new Tela(16);
  t.poligono([[3, 4], [5.6, 6], [5, 11], [1.6, 9.4]], 'y').luce({ y: ['Y', 'o'] });
  t.rect(5, 10, 2, 3, 'r').punti([[4, 13], [5, 13]], 'k');
  t.rect(5, 9, 3, 1, 'b');
  t.ellisse(7.5, 7, 2.2, 2.2, 'r');
  t.linea(5, 6, 3, 3.6, 'r').ellisse(2.6, 2.6, 1.1, 1.1, 'b');
  t.poligono([[6, 5.4], [7.5, 0.8], [7.5, 5.4]], 'r');
  t.luce({ r: ['R', 'd'] });
  t.rect(6, 4, 2, 1, 'y');
  t.specchia();
  return { pal: LAVA, t };
};
// Lavor il Potente: corazzata rossa a macchie gialle, testa gialla a cono con i fori dei dardi, cannoni sulle spalle
S.lavor = () => {
  const t = new Tela(16);
  t.rect(5, 11, 2, 3, 'r').rect(4, 14, 3, 1, 'd');
  t.ellisse(7.5, 8.6, 3, 2.6, 'r');
  t.rect(3, 5, 2, 2, 'r').px(3, 5, 'd');
  t.linea(4, 8, 2.6, 10.6, 'r').px(2, 11, 'y');
  t.luce({ r: ['R', 'd'] });
  t.punti([[5, 9], [6, 10]], 'y');
  t.poligono([[4.4, 6.6], [7.5, 0.4], [7.5, 6.6]], 'y');
  t.punti([[6, 3], [6, 2]], 'Y').punti([[6, 5], [7, 4]], 'k').rect(5, 6, 3, 1, 'o');
  t.specchia();
  return { pal: LAVA, t };
};

// =====================================================================================
//  CAVERNA DI ROSCAMAR — i guerrieri di Armageddon (Terza Serie)
// =====================================================================================
const TERZA = { r: '#e02a1a', R: '#ff6040', d: '#8a1410', D: '#a01818', k: '#141010', K: '#3a3030', y: '#ffc83a', Y: '#ffe88a' };
// Navus il Cinico: piccolo e robusto, collare di spine nere, testa-cervello rossa, grandi mani gialle artigliate
S.navus = () => {
  const t = new Tela(16);
  t.rect(4, 12, 3, 2, 'k').px(4, 12, 'y');
  t.rect(5, 10, 2, 2, 'r');
  t.ellisse(7.5, 8, 2.8, 2.2, 'r').px(7, 10, 'y');
  t.linea(4, 7, 3, 9.4, 'r');
  t.luce({ r: ['R', 'd'] });
  t.ellisse(2.6, 10.4, 1.6, 1.4, 'y').punti([[1, 11], [2, 12], [3, 12]], 'd');
  t.ellisse(5, 5.6, 2.4, 1.3, 'k').punti([[3, 4], [4, 4], [2, 5]], 'k');
  t.ellisse(7.5, 4, 1.6, 1.4, 'k').punti([[6, 2], [7, 1], [7, 2]], 'r').px(6, 4, 'R');
  t.specchia();
  return { pal: TERZA, t };
};
// Skorpios il Malvagio Pungitore: scorpione umanoide rosso e giallo, maschera nera, tenaglie, coda col pungiglione
S.skorpios = () => {
  const t = new Tela(16);
  t.ellisse(5, 14, 1.6, 1, 'r').px(4, 14, 'k');
  t.rect(5, 11, 2, 2, 'y');
  t.ellisse(7.5, 8, 2.4, 2.6, 'r').px(7, 9, 'R');
  t.linea(5, 6, 3.4, 6.6, 'y');
  t.ellisse(2.4, 8.6, 1.4, 1.8, 'r').punti([[1, 10], [3, 10]], 'k');
  t.ellisse(7.5, 3.6, 1.8, 1.6, 'r').rect(6, 4, 2, 1, 'k').px(6, 3, 'y').punti([[6, 1], [5, 2]], 'r');
  t.luce({ r: ['R', 'd'] });
  t.specchia();
  t.linea(10, 12, 12.6, 14, 'r').px(13, 13, 'r').px(14, 12, 'k');
  return { pal: TERZA, t };
};
// Forgius Martello di Fuoco: fabbro rosso con corona di corna, spalle a spine gialle, martello nero di roccia
// lavica in una mano e il braccio-cannone nell'altra
S.forgius = () => {
  const t = new Tela(16);
  t.rect(5, 11, 2, 3, 'r').px(5, 11, 'k').px(6, 13, 'y');
  t.rect(5, 10, 3, 1, 'k');
  t.ellisse(7.5, 8, 2.8, 2.4, 'r');
  t.luce({ r: ['R', 'd'] });
  t.ellisse(4.6, 5.6, 1.4, 1, 'y');
  t.ellisse(7.5, 3.6, 1.5, 1.6, 'D').punti([[6, 1], [7, 0], [6, 2]], 'D').px(7, 3, 'k');
  t.specchia();
  t.linea(4, 7, 2.6, 8.6, 'r').rect(0, 8, 3, 3, 'k').punti([[0, 8], [2, 10]], 'y');
  t.linea(11, 7, 13, 7.4, 'r').ellisse(13.8, 7.4, 1.8, 1.5, 'D').px(14, 7, 'k');
  return { pal: TERZA, t };
};
// Sentinel il Guardiano Lavico: massa di lava rossa coperta di occhi gialli, spallacci neri con altri occhi, denti gialli
S.sentinel = () => {
  const t = new Tela(16);
  t.rect(5, 11, 2, 3, 'r').px(5, 12, 'd');
  t.ellisse(7.5, 8.4, 2.8, 2.4, 'r').px(7, 10, 'k');
  t.linea(3.4, 7, 2.4, 11, 'r').punti([[1, 12], [2, 12]], 'r');
  t.ellisse(7.5, 4, 1.9, 2, 'r');
  t.luce({ r: ['R', 'd'] });
  t.ellisse(4, 5.6, 1.6, 1.3, 'k').punti([[4, 5], [3, 6]], 'y');
  t.punti([[6, 3], [7, 2], [6, 4]], 'y').punti([[6, 6], [7, 6]], 'Y');
  t.specchia();
  return { pal: TERZA, t };
};
// Brags il Tristo Mietitore: testa-teschio rosso scuro, spallacci di spine nere, petto giallo, braccio a falce
S.brags = () => {
  const t = new Tela(16);
  t.rect(4, 12, 3, 2, 'k').px(4, 14, 'r');
  t.rect(5, 10, 2, 2, 'r');
  t.ellisse(7.5, 8, 2.4, 2.4, 'r').rect(7, 6, 1, 4, 'y');
  t.ellisse(5, 5.4, 1.8, 1.2, 'k').punti([[3, 4], [4, 4]], 'k');
  t.linea(4, 7, 2.6, 10, 'r').px(2, 11, 'r');
  t.luce({ r: ['R', 'd'] });
  t.ellisse(7.5, 3.6, 1.8, 1.8, 'D').px(6, 3, 'k').punti([[6, 5], [7, 6]], 'D');
  t.specchia();
  t.poligono([[11, 7], [15, 8.6], [14.6, 13], [13, 10.6]], 'D').px(14, 9, 'R');
  return { pal: TERZA, t };
};

// =====================================================================================
//  PICCHI DELLA VALLE DEL DESTINO — Devilfenix e i traditori dell'Aria
// =====================================================================================
const ARIA = { b: '#4a6ad8', B: '#7a9aee', n: '#26338a', m: '#a01a62', M: '#d03a8a', w: '#e03a2a', W: '#ff6a4a', e: '#ff4a6a', o: '#ff8a2a', g: '#8a9aa8', G: '#b8c4cc', h: '#5a6874', c: '#6ae0e8', k: '#14141e', s: '#f0f2f4' };
// La Mistica Falena: corpo blu, petto e stivali viola, grandi ali rosse, braccia alzate artigliate
S.falena = () => {
  const t = new Tela(16);
  t.poligono([[1, 2.6], [5.4, 6], [5.4, 10.4], [0, 9]], 'w').luce({ w: ['W', ''] });
  t.rect(4, 12, 3, 2, 'm').rect(5, 10, 2, 2, 'b');
  t.ellisse(7.5, 8, 2.2, 2.4, 'b').rect(6, 7, 2, 1, 'm');
  t.linea(5, 6, 3.6, 3, 'b').punti([[3, 2], [4, 2]], 'n');
  t.ellisse(7.5, 4.2, 1.4, 1.6, 'b').punti([[6, 2], [6, 1]], 'n').px(6, 4, 'e');
  t.luce({ b: ['B', 'n'] });
  t.specchia();
  return { pal: ARIA, t };
};
// Beccoduro il Picchiatore: lunghe ali rosse spiegate, corpo di piume blu, collo lungo e testa viola col becco d'acciaio
S.beccoduro = () => {
  const t = new Tela(16);
  t.poligono([[0, 8], [6, 5], [6, 7.4], [1, 12]], 'w').punti([[1, 11], [3, 10]], 'W');
  t.rect(5, 11, 2, 3, 'n');
  t.ellisse(7.5, 8.4, 1.8, 2.2, 'b').luce({ b: ['B', 'n'] });
  t.rect(7, 4, 1, 3, 'b');
  t.ellisse(7.5, 2.4, 1.2, 1.4, 'm').px(7, 4, 'G').px(6, 2, 'e');
  t.specchia();
  return { pal: ARIA, t };
};
// Dragon l'Inceneritore: drago blu con cresta viola spinosa, ali rosse da pipistrello, artigli e coda
S.dragon = () => {
  const t = new Tela(16);
  t.poligono([[0, 3], [5, 5], [5, 9], [1, 8]], 'w').luce({ w: ['W', ''] });
  t.ellisse(5, 13, 1.6, 1.4, 'm').px(4, 12, 'M');
  t.ellisse(7.5, 8.2, 2.6, 2.4, 'b').rect(7, 8, 1, 2, 'n');
  t.linea(5, 7, 3.6, 10, 'b').punti([[3, 11], [4, 11]], 'm');
  t.ellisse(7.5, 4, 2, 1.6, 'm').punti([[6, 2], [5, 3], [7, 2]], 'M');
  t.rect(6, 5, 2, 1, 'b').px(6, 4, 'e');
  t.luce({ b: ['B', 'n'] });
  t.specchia();
  t.linea(9, 12, 12.4, 14, 'b').px(13, 14, 'n');
  return { pal: ARIA, t };
};
// Crudelion il Maledetto: demone blu dagli addominali scolpiti, uncini viola alle braccia alzate, piccole ali rosse
S.crudelion = () => {
  const t = new Tela(16);
  t.poligono([[0, 6], [6, 6], [6, 8.6], [1, 9.4]], 'w').luce({ w: ['W', ''] });
  t.rect(4, 12, 3, 2, 'm').rect(5, 10, 2, 2, 'n');
  t.ellisse(7.5, 8, 2, 2.6, 'b').punti([[7, 7], [7, 9]], 'n');
  t.linea(5, 6, 3.6, 3.4, 'b').linea(3.6, 3.4, 2.6, 1, 'm').px(2, 2, 'm');
  t.ellisse(7.5, 3.6, 1.3, 1.6, 'b').rect(6, 3, 2, 1, 'm').px(6, 4, 'e');
  t.luce({ b: ['B', 'n'] });
  t.specchia();
  return { pal: ARIA, t };
};
// Magufo lo Stregone: gufo blu con sopracciglia viola, occhi rosa, becco arancio, ali di fiamma rosse, braccia aperte
S.magufo = () => {
  const t = new Tela(16);
  t.poligono([[0, 4], [5, 6], [5, 12], [1, 11]], 'w').luce({ w: ['W', ''] });
  t.rect(4, 11, 3, 4, 'n').px(5, 12, 'b');
  t.ellisse(7.5, 8.4, 2, 2.2, 'm');
  t.linea(5, 6, 1, 6.6, 'b').punti([[0, 6], [0, 7]], 'm');
  t.ellisse(7.5, 3.8, 2.2, 2, 'b').punti([[6, 2], [5, 2]], 'm').px(6, 3, 'e').px(7, 5, 'o');
  t.luce({ b: ['B', 'n'] });
  t.specchia();
  return { pal: ARIA, t };
};
// Magicorvo: stregone corvo grigio-azzurro, cappuccio di piume blu notte, becco scuro, collare e fasce azzurre
S.magicorvo = () => {
  const t = new Tela(16);
  t.rect(4, 11, 3, 3, 'g').px(4, 11, 'c').punti([[4, 14], [6, 14]], 'n').px(3, 12, 'n');
  t.ellisse(7.5, 8.6, 2.2, 2.2, 'g');
  t.linea(5, 6, 1.6, 3, 'g').punti([[0, 2], [1, 1]], 'g');
  t.luce({ g: ['G', 'h'] });
  t.ellisse(7.5, 4.2, 2.4, 2.2, 'n').px(7, 4, 'g').punti([[7, 5], [7, 6]], 'k');
  t.rect(6, 6, 2, 1, 'c');
  t.specchia();
  return { pal: ARIA, t };
};
// Vorticus il Tormentatore: spirito di nuvola grigio con il volto a teschio bianco, braccia e gambe a tromba d'aria blu
S.vorticus = () => {
  const t = new Tela(16);
  t.rect(4, 11, 2, 3, 'b').punti([[4, 12], [5, 14]], 'B');
  t.ellisse(7.5, 8, 2.8, 2.6, 'g').punti([[6, 9], [5, 7]], 'h');
  t.linea(5, 7, 3, 8, 'b').ellisse(2.2, 8, 1.8, 1.6, 'b').px(2, 8, 'n');
  t.luce({ g: ['G', 'h'], b: ['B', ''] });
  t.ellisse(7.5, 4, 1.6, 1.8, 's').px(6, 4, 'k').px(7, 6, 'k');
  t.specchia();
  return { pal: ARIA, t };
};

// =====================================================================================
//  REGIONE DI OSCURO ORIZZONTE — il Popolo delle Tenebre (Terza Serie)
// =====================================================================================
const TENEBRE = { n: '#1e2a6a', N: '#33449a', k: '#141420', K: '#2e2e40', v: '#9ae07a', V: '#5aa04a', r: '#d82a2a', R: '#ff5a4a', e: '#ff3a3a', g: '#6a6a78', s: '#e8e8f0' };
// Lunaris l'Oscuro Stregone: testa-cervello verde chiaro, petto rosso con l'ovale verde, mantello alato blu notte e nero
S.lunaris = () => {
  const t = new Tela(16);
  t.poligono([[0, 4], [5.4, 5], [5.4, 12], [1, 10.4]], 'k').linea(0, 4, 1, 10.4, 'n');
  t.rect(4, 12, 3, 2, 'r').rect(5, 10, 2, 2, 'n');
  t.ellisse(7.5, 7.6, 2, 2, 'r').px(7, 8, 'v');
  t.ellisse(7.5, 4, 1.6, 1.7, 'v').punti([[6, 3], [7, 2]], 'V');
  t.specchia();
  return { pal: TENEBRE, t };
};
// Ombrassassina: predatore blu notte e nero a zampe larghe, artigli verdi, petto rosso a strisce nere, occhi di fuoco
S.ombrassassina = () => {
  const t = new Tela(16);
  t.linea(5, 10, 2.6, 12.6, 'n').ellisse(2.4, 13.4, 1.4, 1.2, 'k').px(4, 11, 'r');
  t.ellisse(7.5, 8, 1.8, 2, 'r').px(7, 8, 'k').px(7, 6, 'k');
  t.linea(5, 6, 1.4, 2.6, 'k').punti([[0, 2], [1, 1], [0, 3]], 'v');
  t.ellisse(7.5, 5, 1.4, 1.2, 'n').px(6, 6, 'v').px(6, 5, 'e');
  t.specchia();
  return { pal: TENEBRE, t };
};
// Pantanera il Sergente del Terrore: pantera-demone nera, testa blu notte con cresta verde e occhi rossi, artigli
S.pantanera = () => {
  const t = new Tela(16);
  t.rect(5, 11, 2, 3, 'n').px(5, 13, 'r');
  t.ellisse(7.5, 8.6, 2.8, 2.6, 'k').px(5, 10, 'r');
  t.linea(4.6, 7, 2, 11, 'k').punti([[1, 12], [2, 12]], 'g');
  t.luce({ k: ['K', ''] });
  t.ellisse(7.5, 4.6, 2, 1.7, 'n').punti([[6, 2], [5, 3]], 'v').px(6, 4, 'e').px(7, 6, 's');
  t.specchia();
  return { pal: TENEBRE, t };
};
// Spiritonero il Fantasma dell'Ombra: cappuccio nero con il volto verde, grande mantello blu notte foderato di rosso
S.spiritonero = () => {
  const t = new Tela(16);
  t.poligono([[0, 10], [3.6, 5.4], [8.2, 5.4], [8.2, 13.4], [1, 13]], 'r').punti([[0, 12], [2, 13]], 'R');
  t.linea(0.6, 9.4, 3.6, 5.4, 'n').linea(3.6, 5.4, 7, 5.4, 'n').punti([[2, 7], [4, 5], [6, 5]], 'v');
  t.ellisse(7.5, 14.4, 3, 0.8, 'g');
  t.ellisse(7.5, 3.6, 1.8, 2, 'k').px(7, 4, 'v').px(7, 5, 'V');
  t.specchia();
  return { pal: TENEBRE, t };
};
// Buconero l'Inghiottitore: guerriero blu notte, elmo nero a corna con occhi verdi, spallacci rossi, artigli verdi
S.buconero = () => {
  const t = new Tela(16);
  t.rect(4, 11, 3, 3, 'k');
  t.ellisse(7.5, 8, 2.6, 2.4, 'n').rect(6, 9, 2, 1, 'r');
  t.linea(4, 7, 2.6, 10, 'n').punti([[2, 11], [3, 11]], 'v');
  t.luce({ n: ['N', ''] });
  t.ellisse(4.4, 5.6, 1.6, 1.2, 'r');
  t.ellisse(7.5, 4, 1.7, 1.6, 'k').punti([[6, 1], [5, 2]], 'k').px(6, 4, 'v');
  t.specchia();
  return { pal: TENEBRE, t };
};

// =====================================================================================
//  MONTE VULCANO — i guerrieri di Magmion (Prima Serie, Magma e Lava)
// =====================================================================================
const VULCANO = Object.assign({ y: '#ffc83a', Y: '#ffe88a', o: '#ff8a2a', K: '#4a4448', k: '#1a1418' }, ROSSO);
// Electricon: rosso a macchie scure, testa allungata cornuta, grandi mani gialle che scagliano fulmini, coda
S.electricon = () => {
  const t = new Tela(16);
  t.rect(5, 10, 2, 4, 'r').px(5, 12, 'K');
  t.ellisse(7.5, 8, 2.4, 2.6, 'r');
  t.linea(5, 7, 3, 9.6, 'r');
  t.poligono([[6, 5.6], [5.6, 1], [7.5, 0.4], [7.5, 5.6]], 'r');
  t.luce({ r: ['R', 'd'] });
  t.punti([[6, 7], [7, 9], [5, 8], [6, 2], [7, 1]], 'K').px(6, 4, 'y');
  t.ellisse(2.6, 10.4, 1.3, 1.2, 'y');
  t.specchia();
  t.linea(10, 12, 13, 13.4, 'r').px(14, 13, 'r');
  return { pal: VULCANO, t };
};
// Maglio Infuocato: corpo di scaglie rosse raffreddate, testa gialla con gli occhi rossi, un pugno che è una palla di fuoco
S.maglio = () => {
  const t = new Tela(16);
  t.rect(5, 10, 2, 3, 'r').punti([[4, 13], [6, 13]], 'K');
  t.ellisse(7.5, 7.6, 2.8, 2.8, 'r');
  t.linea(4.6, 6.6, 3, 9, 'r');
  t.luce({ r: ['R', 'd'] });
  t.punti([[6, 7], [5, 9], [7, 9], [6, 11]], 'd');
  t.ellisse(7.5, 3.6, 1.8, 1.8, 'y').px(6, 4, 'r').px(5, 3, 'y');
  t.ellisse(2.6, 10, 1.2, 1.2, 'y');
  t.specchia();
  t.ellisse(2.4, 10, 1.6, 1.4, 'K').punti([[1, 8], [0, 9], [1, 9], [2, 8]], 'o').px(1, 7, 'y');
  return { pal: VULCANO, t };
};
// Il Mastodontico: colosso rosso dalla pelle a pieghe, muso giallo zannuto, spine nere, enormi pugni gialli
S.mastodontico = () => {
  const t = new Tela(16);
  t.rect(5, 10, 2, 4, 'r').px(5, 14, 'K');
  t.ellisse(7.5, 7.6, 3, 2.8, 'r');
  t.linea(4.6, 6.6, 2.6, 10, 'r');
  t.luce({ r: ['R', 'd'] });
  t.punti([[6, 7], [5, 9], [6, 11]], 'd').punti([[4, 4], [3, 5], [5, 4]], 'k');
  t.ellisse(2.4, 11, 1.6, 1.5, 'y').luce({ y: ['Y', 'o'] });
  t.ellisse(7.5, 4, 1.8, 1.6, 'y').px(6, 3, 'k').rect(6, 5, 2, 1, 'r').px(6, 5, 'Y');
  t.specchia();
  return { pal: VULCANO, t };
};

module.exports = S;

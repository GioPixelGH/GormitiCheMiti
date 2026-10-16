// Ritratti 48x48 (busto) dei personaggi, disegnati guardando le carte originali.
// Usati in selezione eroe, HUD, scheda dell'eroe, Codex, barra del boss e narratore.
const { Tela } = require('./pittore');
const R = {};
const C = 23.5;

// =====================================================================================
//  EROI
// =====================================================================================
R.gheos = () => {
  const t = new Tela(48);
  t.ellisse(C, 47, 21, 13, 'o').rect(18, 28, 12, 8, 'o');
  t.ellisse(C, 20, 10, 11, 'o').poligono([[19, 14], [C, 1.5], [28, 14]], 'o');
  t.luce({ o: ['O', 'R'] });
  t.poligono([[6, 37], [3.5, 29], [10, 34]], 's').poligono([[12, 34], [10.5, 26], [15, 31]], 's').poligono([[2.5, 43], [0.6, 37], [6, 41]], 's');
  t.poligono([[16, 11], [12, 6], [18.5, 9]], 'S').poligono([[14.5, 17], [10, 14], [15, 20]], 's');
  t.poligono([[17, 36], [16, 31], [20, 34]], 's');
  for (const [x, y, r] of [[15, 39, 1.3], [8, 44, 1.2], [20, 30, 1], [17, 24, 1], [13, 21, 1.1], [21, 9, 0.9], [11, 41, 1]]) t.ellisse(x, y, r, r * 0.8, 'D');
  t.rect(17, 18, 5, 3, 'R').rect(18, 19, 3, 1, 'e').px(19, 19, 'k').linea(16, 17, 22, 18, 'D');
  t.linea(20, 27, C, 27, 'D').px(19, 26, 'R');
  t.rect(10, 40, 14, 3, 'b').punti([[12, 41], [15, 41], [18, 41], [21, 41]], 'G').rect(10, 43, 14, 1, 'G');
  t.specchia();
  t.linea(39, 47, 40.5, 32, 'h', 2);
  t.ellisse(41, 25, 5.6, 6.4, 'g').luce({ g: ['m', 'G'] });
  t.punti([[38, 21], [41, 19], [44, 22], [38, 27], [41, 25], [44, 28], [41, 31]], 'l');
  t.punti([[36, 24], [46, 25]], 'G');
  return { pal: { o: '#e07438', O: '#f49a5c', R: '#a8482a', D: '#6a2a1a', s: '#b4b4bc', S: '#7a7a84', b: '#9a9aa4', G: '#2e2e36', g: '#4a4a54', m: '#6a6a76', h: '#5a4030', l: '#d8d8e0', e: '#ffe25a', k: '#1a0a06' }, t };
};

R.tasarau = () => {
  const t = new Tela(48);
  t.ellisse(C, 47, 21, 14, 'b');
  t.ellisse(5, 41, 4, 7, 'b').ellisse(5, 27, 3.6, 5, 'b');
  t.ellisse(C, 21, 11, 12, 'b');
  t.linea(16, 11, 10, 2, 'b', 2).linea(12, 6, 7, 4, 'b', 2).linea(19.5, 9, 18, 1.5, 'b', 2);
  t.luce({ b: ['B', 'n'] });
  t.ellisse(4.5, 22, 3.4, 3.4, 'h').ellisse(4, 34, 3.2, 3, 'h').luce({ h: ['H', ''] });
  t.linea(16, 13, 15, 31, 'n').linea(19, 30, 18, 35, 'n').linea(10, 38, 12, 46, 'n').linea(15, 40, 16, 46, 'n');
  t.ellisse(C, 19, 5.4, 4.8, 'n').ellisse(C, 19, 4.2, 3.6, 'e').ellisse(C, 19.4, 1.6, 1.8, 'E').px(22, 17, 'w');
  t.ellisse(C, 28, 4.2, 2.2, 'E').rect(21, 27, 2, 1, 'w');
  t.linea(2, 38, 17, 33, 'v', 2).linea(17, 33, 23, 38, 'v', 2).linea(6, 46, 13, 42, 'v', 2).linea(2, 30, 7, 31, 'v', 2);
  t.luce({ v: ['', 'V'] });
  t.specchia();
  return { pal: { b: '#a8502a', B: '#c87444', n: '#5e2814', h: '#3a2418', H: '#5a3a28', v: '#3a9a3a', V: '#2a6a2a', e: '#ffd84a', E: '#2a1408', w: '#fff8d8' }, t };
};

R.poivrons = () => {
  const t = new Tela(48);
  t.ellisse(C, 47, 21, 13, 'b').rect(18, 29, 12, 8, 'b');
  t.luce({ b: ['B', 'd'] });
  t.linea(23, 36, 23, 46, 'd').linea(15, 40, 21, 41, 'd');
  t.poligono([[5, 37], [1, 26], [11, 33]], 'f').poligono([[10, 34], [7, 25], [14, 31]], 'f');
  t.ellisse(C, 15, 11, 11, 'p');
  t.poligono([[13, 12], [6.5, 3], [14.5, 17]], 'f');
  for (const [x, l] of [[14, 33], [17.5, 37], [21, 40]]) t.linea(x, 18, x - 1, l, 'p', 3).px(x - 2, l + 1, 'p');
  t.luce({ p: ['P', 'q'], f: ['F', ''] });
  t.punti([[13, 26], [16, 30], [16.5, 34], [20, 32], [20, 37], [13, 22]], 'P');
  t.ellisse(19, 18, 2.4, 1.8, 'e').px(19, 18, 'k');
  t.specchia();
  return { pal: { b: '#2a6ac8', B: '#4a92e2', d: '#1a3a8a', p: '#5a3ab8', P: '#7c5cda', q: '#38207e', f: '#8adcf2', F: '#c8f4ff', e: '#fff27a', k: '#1a1030' }, t };
};

R.noctis = () => {
  const t = new Tela(48);
  t.poligono([[18, 31], [2, 7], [0.6, 41], [15, 44]], 'a');
  t.linea(4, 18, 16, 33, 'A').linea(2, 30, 15, 38, 'A');
  t.linea(2, 7, 18, 31, 'y', 2);
  t.ellisse(C, 47, 17, 12, 't').rect(19, 30, 10, 6, 't');
  t.luce({ t: ['T', 'u'] });
  t.ellisse(C, 37, 10, 6, 'w');
  t.punti([[15, 42], [18, 43], [21, 43]], 'W');
  t.ellisse(C, 19, 9, 10, 'w').luce({ w: ['', 'W'] });
  t.poligono([[18, 12], [13, 1.6], [20.5, 10]], 'y');
  t.ellisse(19, 17.6, 2.8, 3, 'k').px(18, 16, 'w');
  t.poligono([[19.2, 21], [C, 19.6], [C, 31]], 'o').luce({ o: ['O', ''] });
  t.punti([[16, 24], [17, 27], [27, 10]], 'W');
  t.specchia();
  return { pal: { t: '#3ab8a8', T: '#6ad8c8', u: '#1a7a70', w: '#f4f8ff', W: '#c4d4e4', a: '#e4ecf4', A: '#a8b8c8', y: '#ffd23a', o: '#ff8a2a', O: '#ffc070', k: '#1a1a24' }, t };
};

R.kolossus = () => {
  const t = new Tela(48);
  t.ellisse(C, 47, 22, 15, 's').luce({ s: ['S', 't'] });
  for (const [x, y, rx, ry] of [[9, 33, 5.6, 3.6], [17.5, 30, 4.6, 3.2], [12, 40.5, 4.8, 3], [3.6, 39, 2.6, 2.8]]) t.ellisse(x, y, rx, ry, 'd');
  t.luce({ d: ['D', 'K'] });
  t.ellisse(6, 24, 4.4, 7.4, 'y').ellisse(7.6, 13.6, 4.4, 3.8, 'y').ellisse(4.6, 44.4, 4, 3.6, 'y').luce({ y: ['Y', 'o'] });
  t.punti([[5, 20], [7, 24], [4, 27], [6, 30], [8, 12], [6, 15], [10, 14], [3, 43], [6, 46]], 'k');
  t.ellisse(C, 24, 6.6, 6.4, 'h').luce({ h: ['H', 'S'] });
  t.linea(19, 19, 21, 22, 'S');
  t.rect(17, 24, 13, 3, 'd');
  t.ellisse(C, 31, 5, 2.8, 'y').luce({ y: ['Y', 'o'] }).linea(20, 31, 27, 31, 'o');
  t.specchia();
  return { pal: { s: '#8a8a88', S: '#b0b0ac', t: '#5a5a58', d: '#5a4a3a', D: '#7a6a58', K: '#3a2e24', y: '#e0b030', Y: '#f2d060', o: '#a07818', k: '#2a2018', h: '#d8d0c0', H: '#f0ece0' }, t };
};

R.barbataus = () => {
  const t = new Tela(48);
  t.ellisse(C, 47, 19, 13, 'b').luce({ b: ['B', 'n'] });
  t.ellisse(10, 33, 9, 6, 'v').luce({ v: ['W', 'V'] });
  t.punti([[6, 31], [9, 29], [12, 33], [8, 35], [14, 30]], 'V');
  t.ellisse(C, 19, 9, 10, 'b').luce({ b: ['B', 'n'] });
  t.rect(15, 6, 18, 3, 'n');
  t.poligono([[15, 7], [15.5, 1.6], [18.5, 7]], 'n').poligono([[19, 7], [20.5, 2.4], [22.5, 7]], 'n');
  t.linea(16, 15, 22, 16, 'l', 2).ellisse(19.5, 18, 1.8, 1, 'e');
  t.poligono([[14.5, 22], [32.5, 22], [30, 38], [C, 46.6], [17, 38]], 'l').luce({ l: ['L', 'G'] });
  t.linea(19, 25, 20, 40, 'G').linea(22, 27, 22.5, 44, 'L');
  t.ellisse(C, 23, 5, 1.6, 'V');
  t.specchia();
  return { pal: { b: '#6a3a20', B: '#8a5632', n: '#3a2010', l: '#8ae03a', L: '#bcf274', G: '#5aa82a', v: '#4a8a2a', V: '#2a5a1a', W: '#6aaa3a', e: '#c8ff6a' }, t };
};

R.carrapax = () => {
  const t = new Tela(48);
  t.ellisse(C, 46, 11, 13, 'c').luce({ c: ['C', 'b'] });
  t.linea(23, 36, 23, 46, 'b').linea(17, 39, 22, 40, 'b').linea(18, 43, 22, 44, 'b');
  t.ellisse(10, 35, 9.5, 7.5, 't').luce({ t: ['T', 'k'] });
  t.punti([[6, 30], [10, 29], [14, 31], [4, 35], [8, 34], [12, 36]], 'k');
  t.ellisse(5, 21, 4.6, 8.6, 't').luce({ t: ['T', 'k'] }).poligono([[3.6, 12], [7, 12], [5.4, 21]], '.');
  t.punti([[3, 25], [6, 28], [2, 18]], 'k');
  t.ellisse(C, 24, 7, 7.5, 't').luce({ t: ['T', 'k'] });
  t.punti([[19, 18], [22, 17], [17, 21], [20, 21]], 'k');
  t.rect(19, 24, 3, 1, 'e').linea(20, 29, C, 29, 'k');
  t.specchia();
  return { pal: { b: '#2a6ab8', c: '#8ad8e0', C: '#bcf2f2', t: '#1a5a6a', T: '#2a7a8a', k: '#0a2a3a', e: '#fff27a' }, t };
};

R.elios = () => {
  const t = new Tela(48);
  t.poligono([[18, 30], [1, 9], [0.6, 37], [14, 42]], 'w');
  for (const y of [16, 23, 30, 36]) t.linea(2, y, 14, y + 6, 'W');
  t.ellisse(C, 47, 16, 12, 'g').luce({ g: ['G', 'h'] });
  t.ellisse(C, 46, 8, 9, 'c').luce({ c: ['', 'C'] });
  t.ellisse(C, 33, 11, 5, 'w').punti([[14, 36], [17, 38], [20, 38]], 'W');
  t.ellisse(C, 20, 8, 10, 'w').luce({ w: ['', 'W'] });
  t.poligono([[19, 12], [16, 5.6], [21, 10]], 'W');
  t.ellisse(18.6, 17.4, 1.8, 1.4, 'y').px(19, 17, 'h');
  t.poligono([[18.6, 20], [C, 19], [C, 30.6], [21.4, 27.6]], 'k').linea(19.4, 21, 21, 26, 'K');
  t.specchia();
  return { pal: { g: '#7a8aa8', G: '#9aaac8', h: '#4a5a78', c: '#8ae0f0', C: '#5ab0c8', w: '#f8f8ff', W: '#c4ccdc', k: '#101018', K: '#3a3a48' }, t };
};

R.luminescente = () => {
  const t = new Tela(48);
  for (const [x, y] of [[2, 6], [0.6, 17], [1, 28], [4, 38]]) t.linea(17, 30, x, y, 'g', 3);
  t.luce({ g: ['O', 'G'] });
  t.ellisse(C, 47, 15, 12, 'y').luce({ y: ['Y', 'o'] });
  t.ellisse(12, 35, 7, 5, 's').luce({ s: ['S', 't'] });
  t.poligono([[C, 35], [27.5, 40.5], [C, 46], [19.5, 40.5]], 's').luce({ s: ['S', 't'] });
  t.ellisse(C, 21, 8, 9, 's').luce({ s: ['S', 't'] });
  t.poligono([[17, 15], [14.5, 4], [20, 12]], 'S').poligono([[20, 12], [19.6, 1.6], [C, 11]], 'S').poligono([[22.5, 11], [C, 0.6], [24.5, 11]], 'S');
  t.poligono([[17, 20], [30, 20], [28, 25], [C, 28.6], [19, 25]], 'k');
  t.rect(19, 21, 3, 1, 'e').linea(C, 12, C, 19, 't');
  t.specchia();
  return { pal: { y: '#ffd84a', Y: '#fff2a4', o: '#c89818', s: '#c8ccd8', S: '#ffffff', t: '#74788a', g: '#d49444', O: '#eeb466', G: '#9a5a1c', k: '#2a2a3a', e: '#3ae8ff' }, t };
};

R.saggio = () => {
  const t = new Tela(48);
  t.ellisse(C, 47, 20, 12, 'p');
  t.ellisse(C, 21, 13, 15, 'p');
  t.luce({ p: ['P', 'q'] });
  t.ellisse(C, 24, 9, 11, 'q');
  t.ellisse(C, 22, 7, 8, 's').luce({ s: ['', 'S'] });
  t.rect(17, 17, 5, 2, 'w').linea(19, 20, 21, 20, 'k');
  t.poligono([[16, 24], [31, 24], [29, 40], [C, 46.6], [18, 40]], 'w').luce({ w: ['', 'W'] });
  t.linea(19, 28, 20, 40, 'W').linea(22, 29, 22.5, 44, 'W');
  t.ellisse(C, 26.6, 5, 2, 'w').px(23, 23, 'S');
  t.specchia();
  t.linea(41, 47, 41, 11, 'n', 2).ellisse(41.5, 30, 2.6, 2.2, 's');
  t.ellisse(41.5, 7, 4.2, 4.2, 'n').ellisse(41.5, 7, 3.2, 3.2, 'm').ellisse(41.5, 7, 1.4, 1.4, 'M').px(40, 5, 'w');
  return { pal: { p: '#5a3a8a', P: '#8a64c0', q: '#3a2460', s: '#f0d0b0', S: '#c8a080', k: '#1a1028', w: '#f0ece4', W: '#c8c0b8', n: '#8a6a3a', m: '#8affc8', M: '#2aa07a' }, t };
};

// =====================================================================================
//  SIGNORI DEL MALE
// =====================================================================================
R.orrore = () => {
  const t = new Tela(48);
  t.linea(17, 24, 9, 5, 'h', 2).linea(9, 5, 2, 14, 'h', 2).linea(19, 22, 14, 10, 'h', 2).linea(14, 10, 8, 16, 'h', 2);
  t.ellisse(C, 47, 16, 12, 'r').luce({ r: ['R', 'd'] });
  t.poligono([[2, 42], [4, 31], [7, 35], [9, 27], [12, 33], [16, 28], [18, 41]], 'o').luce({ o: ['O', ''] });
  t.poligono([[20, 37], [27, 37], [C, 46]], 'y');
  t.ellisse(C, 22, 8, 9, 'g').luce({ g: ['G', 'h'] });
  t.ellisse(19.5, 21, 2.6, 2.2, 'h').px(19, 21, 'e');
  t.linea(16, 18, 12, 12, 'y', 3).linea(12, 12, 15, 7, 'y', 2).linea(15, 7, 19, 9, 'y', 2);
  t.rect(18, 28, 6, 3, 'G').punti([[19, 29], [21, 29]], 'h').rect(18, 31, 6, 1, 'h');
  t.px(23, 24, 'h');
  t.poligono([[20, 14], [21.5, 7], [23, 13]], 'y');
  t.specchia();
  return { pal: { r: '#8a1a14', R: '#b8342a', d: '#4a0a0a', g: '#6a5a4a', G: '#8a7a6a', h: '#3a3028', o: '#ff7a1a', O: '#ffb44a', y: '#ffd23a', e: '#ffe27a' }, t };
};

R.obscurio = () => {
  const t = new Tela(48);
  t.poligono([[17, 28], [2, 4], [0.6, 30], [6, 26], [8, 34], [12, 30], [15, 40]], 'n');
  t.linea(4, 8, 16, 29, 'b').linea(2, 20, 12, 30, 'b');
  t.punti([[2, 4], [3, 5], [1, 29], [7, 33]], 'l');
  t.ellisse(C, 47, 15, 12, 'k').ellisse(C, 42, 8, 5, 'n').luce({ n: ['N', 'b'], k: ['b', ''] });
  t.ellisse(C, 22, 9, 9, 'n').luce({ n: ['N', 'b'] });
  t.poligono([[17, 17], [6, 13], [3, 6], [8.6, 10.6], [18, 13.6]], 'l').luce({ l: ['L', 'G'] });
  t.poligono([[16.5, 20], [22, 21.5], [21, 23], [16.5, 21.6]], 'e');
  t.rect(18, 26, 6, 2, 'k').poligono([[19, 27], [21.4, 27], [20.2, 31.4]], 'l');
  t.punti([[14, 25], [18, 34], [12, 44], [16, 41], [20, 14]], 'r');
  t.specchia();
  return { pal: { n: '#1e2a6a', N: '#3a4aa0', b: '#121838', k: '#0a0e24', l: '#9ae07a', L: '#c8f8a8', G: '#5aa04a', r: '#e83a3a', e: '#ff3a3a' }, t };
};

R.devilfenix = () => {
  const t = new Tela(48);
  for (const [x, y] of [[2, 5], [0.6, 15], [1, 26], [4, 37]]) t.linea(16, 30, x, y, 'r', 4);
  t.luce({ r: ['R', 'q'] });
  t.ellisse(C, 47, 14, 12, 'b').luce({ b: ['B', 'u'] });
  t.ellisse(12, 36, 7, 5, 'm').poligono([[19, 38], [28, 38], [C, 46]], 'm').luce({ m: ['M', 'q'] });
  t.ellisse(C, 19, 8, 9, 'm').luce({ m: ['M', 'q'] });
  t.poligono([[19, 11], [21, 2], [23, 10]], 'M');
  t.ellisse(C, 22, 5, 5, 'b').luce({ b: ['B', 'u'] });
  t.poligono([[20.6, 22], [C, 22], [C, 31.6]], 'o').linea(21, 23, 22.6, 28, 'O');
  t.poligono([[17.6, 18], [21, 19.6], [20.4, 20.6], [17.6, 19.4]], 'y');
  t.specchia();
  return { pal: { b: '#5a8ae8', B: '#8ab2ff', u: '#3a5ab0', m: '#a82a7a', M: '#d24c9c', q: '#5e1442', r: '#e83a1a', R: '#ff7e3e', o: '#ff8a2a', O: '#ffc070', y: '#ffd23a' }, t };
};

R.magmion = () => {
  const t = new Tela(48);
  t.ellisse(C, 47, 22, 14, 'r').luce({ r: ['R', 'd'] });
  t.ellisse(C, 19, 10, 12, 'r').luce({ r: ['R', 'd'] });
  t.ellisse(C, 23, 5.4, 9, 'k').ellisse(C, 23, 3.6, 7.2, 'd');
  t.poligono([[18.4, 15], [21, 15], [19.8, 24]], 'y').poligono([[20.6, 15.6], [22.8, 15.6], [21.8, 21]], 'y').poligono([[19, 31], [21.4, 31], [20.2, 25]], 'y');
  t.ellisse(16.6, 9.6, 1.8, 1.8, 'e').px(17, 10, 'k');
  for (const [x, y] of [[14, 15], [15, 23], [12, 36], [8, 41], [17, 38], [5, 45], [19, 6], [13, 30], [20, 43]]) t.ellisse(x, y, 1, 0.9, 'k');
  t.specchia();
  t.linea(4, 47, 2, 31, 'g', 3).linea(2, 31, 7, 18, 'g', 2).luce({ g: ['G', ''] });
  return { pal: { r: '#d82a2a', R: '#ff5e4e', d: '#8a1010', k: '#3a0a0a', g: '#5a5a60', G: '#8a8a90', y: '#ffd23a', e: '#ffe27a' }, t };
};

R.magor = () => {
  const t = new Tela(48);
  t.ellisse(C, 41, 23, 12, 'd').poligono([[1, 36], [4, 26], [7, 33]], 'h').poligono([[7, 31], [11, 24], [12, 31]], 'h');
  t.ellisse(C, 47, 17, 11, 'p').luce({ p: ['P', 'k'] });
  t.linea(13, 40, 15, 42, 'o').linea(15, 42, 14, 45, 'o').linea(19, 38, 20, 41, 'o').linea(20, 41, 18, 44, 'o').px(C, 41, 'O');
  t.ellisse(C, 20, 9, 10, 'k').luce({ k: ['p', ''] });
  t.poligono([[16, 14], [6, 8], [4, 1.6], [9, 6], [17, 11]], 'h').luce({ h: ['', 'H'] });
  t.linea(17, 12, 20, 17, 'o').linea(16, 24, 18, 27, 'o');
  t.poligono([[16.6, 19], [21.6, 20.6], [21, 21.6], [16.6, 20.4]], 'e');
  t.rect(18, 26, 6, 3, 'o').punti([[19, 26], [21, 26], [20, 28]], 'h');
  t.poligono([[20, 12], [21, 7], [22.4, 12]], 'h');
  t.specchia();
  return { pal: { k: '#1a0a0a', d: '#3a1010', p: '#5a1a14', P: '#7a2a1a', o: '#ff6a1a', O: '#ffc04a', h: '#d8c8a8', H: '#a89878', e: '#ffe24a' }, t };
};

// =====================================================================================
//  LE REGIONI DELL'ERA (Fase 3)
// =====================================================================================
// Aracno il Crudele: testa gialla con calotta rossa, fauci a tentacoli, braccia grigie a uncino
R.aracno = () => {
  const t = new Tela(48);
  t.poligono([[19, 30], [C, 29], [C, 48], [20, 48]], 'r');
  t.linea(18, 33, 7, 21, 'g', 2).linea(18, 34.4, 7.6, 23, 'h');
  t.linea(7, 21, 5, 12, 'k', 2).linea(5, 12, 9, 7, 'k', 2).linea(9, 7, 10.6, 10, 'k');
  t.linea(19, 40, 6, 41, 'g', 2).linea(19, 41.6, 6, 42.6, 'h');
  t.linea(6, 41, 2.4, 45, 'k', 2).linea(2.4, 45, 4.6, 47, 'k');
  t.luce({ g: ['G', ''] });
  t.ellisse(C, 19, 8, 7, 'y').luce({ y: ['Y', 'o'] });
  t.ellisse(C, 12.4, 8.6, 5, 'r');
  t.rect(17, 17, 4, 2, 'k').px(18, 17, 'e');
  for (const [x0, x1] of [[19, 17], [21, 20], [23, 23]]) t.linea(x0, 24, x1, 33, x0 === 23 ? 'Y' : 'y', 2);
  t.luce({ r: ['R', 'd'] });
  t.specchia();
  t.punti([[29, 31], [30, 33], [29, 35], [30, 36], [28, 37]], 'v').px(29, 32, 'V');
  return { pal: { r: '#d82a2a', R: '#ff5a4a', d: '#8a1414', y: '#ffd23a', Y: '#ffe88a', o: '#c89a18', g: '#c8c8d0', G: '#e8e8f0', h: '#8a8a94', k: '#2a2a34', e: '#ff3a3a', v: '#7aff4a', V: '#c8ffa0' }, t };
};
// Lavion il Signore del Terrore: elmo-cresta grigio a strisce gialle, maschera gialla, corazza gialla;
// sulla spalla sinistra la creatura viva del suo braccio
R.lavion = () => {
  const t = new Tela(48);
  t.ellisse(C, 47, 22, 13, 'r');
  t.ellisse(C, 21, 8, 10, 'r');
  t.luce({ r: ['R', 'd'] });
  t.poligono([[17, 38], [C, 36], [C, 48], [18, 48]], 'y').luce({ y: ['Y', 'o'] });
  t.poligono([[16, 15], [17, 8], [21, 5], [C, 4.4], [C, 13], [19, 14]], 'g').luce({ g: ['G', 'h'] });
  t.rect(22, 3, 2, 12, 'y');
  t.rect(18, 19, 3, 2, 'k').px(19, 19, 'e');
  t.poligono([[17.4, 24], [C, 23.4], [C, 31], [19.4, 30]], 'y');
  t.linea(19.4, 27, C, 27, 'o');
  t.specchia();
  // la creatura viva sulla spalla sinistra
  t.linea(5, 48, 7, 38, 'g', 3);
  t.ellisse(9.6, 33, 6.2, 5, 'g');
  t.luce({ g: ['G', 'h'] });
  t.linea(14, 34, 20, 38.6, 'g').linea(14.6, 36, 19, 42, 'g').linea(13, 37.4, 15, 44, 'g').linea(14, 31.6, 20, 34.6, 'g');
  t.ellisse(8.4, 32, 1.8, 1.8, 'k').px(8, 31, 'G');
  t.punti([[6, 41], [7, 44], [5, 46]], 'b');
  return { pal: { r: '#d8281e', R: '#ff5a40', d: '#8a1410', y: '#ffd23a', Y: '#fff09a', o: '#c89a18', g: '#b8bcb8', G: '#e0e4e0', h: '#7a807a', k: '#1a1a1a', b: '#3a3a3a', e: '#ffe27a' }, t };
};
// Armageddon il Signore del Vulcano: enorme testa-cupola a creste, fauci oscure e spine nere,
// corpo nero, il braccio destro gigantesco
R.armageddon = () => {
  const t = new Tela(48);
  t.ellisse(C, 46, 15, 9, 'n').luce({ n: ['N', ''] });
  t.ellisse(5, 41, 5, 8, 'r').luce({ r: ['R', 'd'] });
  t.poligono([[20, 38], [C, 37], [C, 48], [21, 48]], 'r');
  t.ellisse(C, 17, 16, 13, 'r').luce({ r: ['R', 'd'] });
  for (const x0 of [12, 17]) t.linea(x0, 6, x0 - 2, 24, 'd');
  t.linea(22, 4, 22, 25, 'd');
  t.ellisse(C, 28, 11, 4.4, 'k');
  for (const [x, y] of [[15, 27], [18, 29], [21, 29.6]]) t.poligono([[x - 1, y], [x + 1, y], [x, y + 3]], 'n');
  for (const [x, y] of [[8, 25], [6, 30], [10, 32], [4, 35], [13, 33]]) t.poligono([[x - 1.6, y], [x + 1.6, y], [x - 2.6, y + 4]], 'n');
  t.specchia();
  t.ellisse(42, 41, 7, 9, 'r').luce({ r: ['R', 'd'] });
  for (const [x, y] of [[40, 36], [43, 39], [40, 42], [44, 44], [41, 46]]) t.linea(x, y, x + 2, y + 1, 'd');
  return { pal: { r: '#c8281e', R: '#ee4a3a', d: '#7a1410', n: '#1a1418', N: '#3a3238', k: '#0e0a0c' }, t };
};

module.exports = R;

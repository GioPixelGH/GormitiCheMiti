// Le forme evolute dei Signori della Natura (Fase 5): sprite 16x16 e ritratti 48x48 disegnati
// guardando le statuine e le carte delle linee Mystica, Energheia, Atomic, Mythos e Final Evolution
// (archivio locale riferimenti/). Le forme Mystica sono la stessa statuina della Prima Serie,
// ridipinta con rilievi d'oro e d'argento: per questo partono dal disegno base e lo ricolorano.
const { Tela } = require('./pittore');
const C = 23.5;

module.exports = function (BASE, BASE_R) {
  const S = {}, R = {};
  // copia un disegno base cambiando colori della tavolozza
  const ricolora = (fn, pal) => { const d = fn(); return { pal: Object.assign({}, d.pal, pal), t: d.t }; };
  // disegno a mano su griglia: righe di 8 caratteri (metà sinistra, poi specchiata) o di larghezza piena
  const griglia = (righe) => {
    const w = righe[0].length === 8 ? 16 : righe[0].length, t = new Tela(w, righe.length);
    righe.forEach((r, y) => r.split('').forEach((c, x) => { if (c !== '.') t.px(x, y, c); }));
    if (righe[0].length === 8) t.specchia();
    return t;
  };

  // ===================================================================================
  //  PRIMA SERIE — MYSTICA (stessa statuina, ridipinta)
  // ===================================================================================
  // Gheos Mystica: corpo ocra, borchie e denti della cintura d'argento, maglio di bronzo, spuntoni bruni
  S.gheos_mystica = () => {
    const d = ricolora(BASE.gheos, { o: '#d89a24', O: '#f2c44e', R: '#946010', D: '#d8d8e4', s: '#7a5424', b: '#cfd2dc', G: '#3a3440', g: '#8a6428', m: '#b88e48', h: '#4a3418', l: '#4a3414' });
    d.t.punti([[6, 7], [9, 7], [4, 13], [11, 13], [7, 11]], 'D');
    return d;
  };
  // Tasarau Mystica: legno rosso mattone, liane d'argento, quattro mani e corna di bronzo dorato
  S.tasarau_mystica = () => {
    const d = ricolora(BASE.tasarau, { b: '#a8442a', B: '#c8643c', n: '#5a2010', h: '#a07a34', v: '#c8ccd6', V: '#8a8e9a' });
    d.t.linea(5.5, 3, 4, 1, 'a').px(6, 2, 'a').linea(9.5, 3, 11, 1, 'a').px(9, 2, 'a');
    d.t.punti([[1, 5], [1, 10], [14, 5], [14, 10]], 'A');
    d.pal.a = '#c8a048'; d.pal.A = '#e8c870';
    return d;
  };
  // Poivrons Mystica: corpo blu, testa di polpo di bronzo, pinne e artigli d'argento, perizoma turchese
  S.poivrons_mystica = () => {
    const d = ricolora(BASE.poivrons, { p: '#9a6e2c', P: '#c8984e', q: '#5a3a12', f: '#d4d8e2', e: '#9ad8ff', c: '#5ad8c8' });
    d.t.punti([[1, 11], [3, 11], [12, 11], [14, 11]], 's');
    d.pal.s = '#e8ecf4';
    return d;
  };
  // Noctis Mystica: tutto verde acqua, becco e orecchie gialli, occhi e ali d'argento bordate di giallo, perizoma di bronzo
  S.noctis_mystica = () => {
    const d = ricolora(BASE.noctis, { w: '#5ac8b8', W: '#3aa898', a: '#c8ccd6', A: '#8a909c', k: '#8a6428', o: '#ffd23a' });
    d.t.px(6, 3, 'S').px(9, 3, 'S');
    d.pal.S = '#e8ecf4';
    return d;
  };

  // ===================================================================================
  //  PRIMA SERIE — ENERGHEIA (statuine nuove, più massicce)
  // ===================================================================================
  // Gheos il Potente: gigante d'oro con spalle enormi, testa piccola a corna, rombi grigi, denti grigi
  // sul ventre, piedi enormi chiodati e un grosso maglio cilindrico grigio scuro
  S.gheos_energheia = () => {
    const t = griglia([
      '........',
      '.....o..',
      '.....ooo',
      '...aa.oo',
      '.aaaa.ko',
      'aaaaaooo',
      'aasaaooo',
      'aaaa.oso',
      'aaa.oooo',
      'aaa.oooo',
      'aaa.osGs',
      '.s..oooo',
      '...pppp.',
      '..ppspp.',
      '.pppppp.',
      '.s.s.s..',
    ]);
    t.luce({ o: ['O', 'R'], a: ['O', 'R'], p: ['O', 'R'] });
    t.ellisse(13.8, 10.4, 2.1, 2.8, 'm').luce({ m: ['M', 'N'] });
    t.punti([[13, 9], [15, 10], [13, 12], [14, 8]], 'l').px(12, 7, 'h');
    return { pal: { o: '#e8b020', a: '#e8b020', p: '#e8b020', O: '#ffd860', R: '#a87410', s: '#b8bcc4', G: '#2e2e36', k: '#2a1a06', m: '#4a4c54', M: '#6e707a', N: '#2a2a30', l: '#a8aab2', h: '#3a3a40' }, t };
  };
  // Tasarau il Saggio: tronco rosso-bruno a venature, due anelli del legno sul petto, un solo occhio
  // giallo, corona di punte scure, avambracci verdi con grandi mani scure, liane verdi sulle gambe
  S.tasarau_energheia = () => {
    const t = griglia([
      '......k.',
      '....k.kk',
      '....kkbb',
      '....nbbb',
      '....nbbe',
      'hh..nbbb',
      'hhggbbbb',
      '.h.nnnnb',
      '...nnBnb',
      'hggbnnnb',
      'hh.nbbbb',
      '...nbbbb',
      '...nbgb.',
      '...nbbg.',
      '..nbbbb.',
      '..nnnnn.',
    ]);
    t.luce({ b: ['B', ''], g: ['G', ''] });
    t.px(8, 4, 'E');
    return { pal: { b: '#a84a26', B: '#c86a3a', n: '#5e2410', h: '#3a1a10', g: '#3aa04a', G: '#6ad070', k: '#2a120a', e: '#ffd84a', E: '#2a1408' }, t };
  };
  // Poivrons il Guardiano dei Mari: muscoli blu acciaio, testa di polpo viola con la proboscide,
  // pinne azzurre su testa, spalle e gambe, artigli azzurri, perizoma verde
  S.poivrons_energheia = () => {
    const t = griglia([
      '.....f..',
      '....fppp',
      '....pPPP',
      '....ppep',
      '.f.bbqpp',
      'ffaabbbp',
      '.aaabbbp',
      '.aaabbbp',
      'aaa.bbbq',
      'aa..bccc',
      'aa..bccc',
      'ff..ll..',
      '...lll..',
      '..flll..',
      '.fllll..',
      '..llll..',
    ]);
    t.luce({ a: ['B', 'd'], b: ['B', 'd'], l: ['B', 'd'], p: ['', 'q'] });
    return { pal: { b: '#2a6e9e', a: '#2a6e9e', l: '#2a6e9e', B: '#4a92c0', d: '#183e66', p: '#4a2a9e', P: '#6a4ac4', q: '#2a1660', f: '#9ae0f4', c: '#3ab88a', e: '#bff4ff' }, t };
  };
  // Noctis il Terribile: verde acqua massiccio, ciuffi gialli piegati all'indietro, occhi bianchi,
  // grande becco giallo, ali bianco perla bordate di giallo arancio, perizoma nero, dita gialle
  S.noctis_energheia = () => {
    const t = griglia([
      '..y.....',
      '...yy.tt',
      '....yttt',
      '.....eky',
      'YYYY.tty',
      'wwwwattY',
      'wwwaattt',
      'Wwwaattt',
      '.WWaattt',
      '..Waa.tt',
      '...aakkk',
      '....ttt.',
      '....ttt.',
      '...tttt.',
      '...tttt.',
      '...y.yy.',
    ]);
    t.luce({ t: ['T', 'u'], a: ['T', 'u'] });
    return { pal: { t: '#3ab8a8', a: '#3ab8a8', T: '#6ad8c8', u: '#1a7a70', w: '#f2f4fa', W: '#b8c0cc', y: '#ffc42a', Y: '#f08a1a', k: '#1a1a24', e: '#ffffff' }, t };
  };

  // ===================================================================================
  //  SECONDA SERIE — ATOMIC
  // ===================================================================================
  // Kolossus Atomic: placche di roccia bruno scuro e nero, maschera, pugni e borchie verde fluorescente,
  // cosce grigio sabbia e stivali neri
  S.kolossus_atomic = () => {
    const t = griglia([
      '........',
      '..dddd..',
      '.dDgDddg',
      'dDddkdgk',
      'dgdkddkg',
      'ggddddgg',
      'Gg.dDddd',
      '..ddkDdd',
      '.dDdddkd',
      '.ggddddd',
      '.Gg.dkdd',
      '....hhh.',
      '....hhh.',
      '...bbbb.',
      '...bbbb.',
      '...h....',
    ]);
    t.luce({ h: ['H', 'S'] });
    return { pal: { d: '#6a5238', D: '#8e7452', k: '#1c1612', g: '#b8e89a', G: '#e8ffd0', h: '#b8ac98', H: '#d8ccb8', S: '#8a8070', b: '#22201e' }, t };
  };
  // Barbataus l'Invisibile: corpo verde trasparente, spallacci di foglie gialle, venature gialle sul
  // petto, corona trasparente, un pugno giallo e il braccio-radice verde e bruno fino a terra
  S.barbataus_atomic = () => {
    const t = griglia([
      '.....c.c',
      '.....ccc',
      '......gg',
      '......kg',
      '..yyy.gg',
      '.yYyyggg',
      '.yyyoyGg',
      '.gg.ggyg',
      '.gm.gGgy',
      'yYy.gggg',
      'oyo.gmgg',
      '....ggg.',
      '....gmg.',
      '...vvnv.',
      '...vvvv.',
      '........',
    ]);
    t.rect(12, 7, 4, 5, '.');
    t.punti([[12, 7], [13, 7], [13, 8], [12, 8]], 'g').punti([[13, 9], [14, 10], [14, 11]], 'v').punti([[14, 9], [13, 12], [13, 13], [14, 14]], 'n').punti([[12, 14], [13, 15], [15, 15]], 'v');
    return { pal: { g: '#5ccc3a', G: '#b0f47a', m: '#2e8a24', y: '#f2d23a', Y: '#fff090', o: '#b8901a', c: '#c8f8a0', v: '#1e6a2a', n: '#8a4a24', k: '#14300c' }, t };
  };
  // Carrapax Atomic: spallacci, testa, cintura e ginocchia di guscio rosso arancio a puntini blu,
  // braccia e gambe blu, petto e chele giganti grigio trasparente
  S.carrapax_atomic = () => {
    const t = new Tela(16);
    t.rect(4, 11, 3, 3, 'b').rect(4, 12, 2, 1, 'r').rect(3, 14, 4, 1, 'p');
    t.ellisse(7.5, 8.4, 3.2, 3, 'p').luce({ p: ['P', 'q'] });
    t.rect(5, 10, 3, 1, 'r');
    t.rect(2, 7, 2, 2, 'b').luce({ b: ['B', 'd'] });
    t.ellisse(3.6, 5.8, 2.2, 1.6, 'r').luce({ r: ['R', 'o'] });
    t.punti([[3, 5], [2, 6], [5, 5]], 'd');
    t.ellisse(2, 11, 1.8, 2, 'p').luce({ p: ['P', 'q'] }).punti([[2, 12], [2, 13]], '.');
    t.ellisse(7.5, 4.4, 1.6, 1.4, 'r').luce({ r: ['R', 'o'] }).px(6, 4, 'd').px(7, 3, 'R');
    t.specchia();
    return { pal: { b: '#2a58c8', B: '#4a7ae8', d: '#16306e', r: '#f05a2a', R: '#ff8a5a', o: '#b03a14', p: '#9aaab8', P: '#c8d4e0', q: '#6a7888' }, t };
  };
  // Elios Atomic, il Grande Traditore: ali enormi giallo trasparente, corpo blu, collare di piume
  // cremisi, artigli cremisi, zampe di piume blu, testa blu con la cresta trasparente
  S.elios_atomic = () => {
    const t = new Tela(16);
    t.poligono([[6, 6], [0.6, 2.6], [0.6, 7], [1.6, 8], [0.6, 9.6], [2.2, 10.6], [5, 9.6]], 'w').luce({ w: ['', 'W'] });
    t.linea(1, 4, 5, 7, 'W').linea(1, 8, 4.6, 8.6, 'W');
    t.rect(4, 11, 3, 3, 'l').rect(3, 14, 4, 1, 'r').luce({ l: ['L', ''] });
    t.ellisse(7.5, 8.6, 2.6, 2.8, 'b');
    t.rect(3, 7, 2, 2, 'b').luce({ b: ['B', 'n'] });
    t.punti([[2, 9], [3, 10]], 'r');
    t.ellisse(7.5, 6.2, 2.2, 1.1, 'r').luce({ r: ['R', ''] });
    t.ellisse(7.5, 3.6, 1.6, 1.9, 'b').luce({ b: ['B', 'n'] });
    t.punti([[7, 1], [7, 0]], 'w').px(6, 3, 'e');
    t.specchia();
    return { pal: { w: '#f0e8b8', W: '#c8b880', b: '#3a5ac8', B: '#5a7ae8', n: '#22388a', l: '#5a7ad8', L: '#8aa4f0', r: '#c8285a', R: '#f05a84', e: '#ffd23a' }, t };
  };

  // ===================================================================================
  //  TERZA SERIE — MYTHOS E FINAL EVOLUTION
  // ===================================================================================
  // Sommo Luminescente Mythos: armatura d'argento, ali di fiamma trasparenti color oro chiaro,
  // cresta di fiamme arancio, spada d'argento
  S.luminescente_mythos = () => {
    const d = ricolora(BASE.luminescente, { y: '#b8bcc8', Y: '#e8ecf4', o: '#7a8094', s: '#959bb0', S: '#ffffff', t: '#585e72', g: '#f2e6b4', G: '#c8b078', e: '#ff8a3a' });
    const t = d.t;
    t.punti([[5, 2], [6, 1], [7, 1], [8, 1], [9, 1], [10, 2], [6, 0], [7, 0], [9, 0], [5, 1], [10, 1]], 'r');
    t.punti([[7, 5], [8, 5]], 'r').punti([[5, 12], [10, 12]], 'r');
    d.pal.r = '#ff7a2a';
    return d;
  };
  // Sommo Luminescente, Signore del Sole: pelle arancio, corazza rosso arancio metallizzato,
  // ali di rame a raggi di sole, viola su spalle e gambe, oro su ginocchia e corona, scudo e spada
  S.luminescente_final = () => {
    const d = ricolora(BASE.luminescente, { y: '#f2a02a', Y: '#ffc860', o: '#b8661a', s: '#d8401a', S: '#ff7a3a', t: '#8a1e0a', g: '#c07a40', G: '#7a4018', k: '#2a1a1a', e: '#ffe27a' });
    const t = d.t;
    for (const y of [3, 6, 9]) { t.px(0, y, '.').px(15, y, '.'); }
    t.punti([[5, 2], [6, 1], [7, 1], [7, 2], [8, 1], [8, 2], [9, 1], [10, 2]], 'a');
    t.ellisse(4.6, 6.5, 1.5, 1.2, 'v').ellisse(10.4, 6.5, 1.5, 1.2, 'v');
    t.punti([[5, 12], [10, 12], [5, 13], [10, 13]], 'v').punti([[5, 11], [10, 11]], 'a');
    t.ellisse(2.4, 10.2, 1.8, 2, 's').luce({ s: ['S', 't'] }).px(2, 10, 'a');
    d.pal.a = '#f0c850'; d.pal.v = '#5a2a8a';
    return d;
  };

  // ===================================================================================
  //  VECCHIO SAGGIO — RISVEGLIO DELL'OCCHIO (non ha statuina: stessi colori, la magia si accende)
  // ===================================================================================
  S.saggio_risveglio = () => {
    const d = ricolora(BASE.saggio, { p: '#6a44a8', P: '#9a74d8', q: '#3e2670' });
    const t = d.t;
    t.linea(3, 15, 12, 15, 'a').punti([[2, 14], [13, 14], [4, 8], [11, 8]], 'a');
    t.px(6, 4, 'm').px(9, 4, 'm');
    t.ellisse(13, 2, 1.6, 1.6, 'm').px(13, 2, 'M').punti([[11, 0], [15, 0], [15, 4], [11, 4]], 'm');
    t.ellisse(7.5, 9.6, 0.8, 0.8, 'm');
    d.pal.a = '#f0c850'; d.pal.m = '#8affc8'; d.pal.M = '#ffffff';
    return d;
  };

  // ===================================================================================
  //  RITRATTI 48x48
  // ===================================================================================
  const rcol = (fn, pal) => { const d = fn(); return { pal: Object.assign({}, d.pal, pal), t: d.t }; };
  const mx = (x) => 47 - x;
  const mp = (pts) => pts.map(([x, y]) => [mx(x), y]);
  // un poligono e il suo specchio
  const poli2 = (t, pts, c) => t.poligono(pts, c).poligono(mp(pts), c);
  const rombo = (t, x, y, r, c) => t.poligono([[x, y - r * 1.3], [x + r, y], [x, y + r * 1.3], [x - r, y]], c);

  // ---------------- Mystica: i ritratti base ridipinti ----------------
  R.gheos_mystica = () => {
    const d = rcol(BASE_R.gheos, { o: '#d89a24', O: '#f2c44e', R: '#946010', D: '#7a4a10', s: '#7a5424', S: '#5a3a14', b: '#cfd2dc', g: '#8a6428', m: '#b88e48', h: '#4a3418', l: '#4a3414' });
    for (const [x, y] of [[15, 39], [8, 44], [20, 31], [11, 41], [13, 30], [19, 36], [5, 37]]) d.t.ellisse(x, y, 1.1, 0.9, 'A').ellisse(mx(x), y, 1.1, 0.9, 'A');
    d.pal.A = '#e0e2ea';
    return d;
  };
  R.tasarau_mystica = () => {
    const d = rcol(BASE_R.tasarau, { b: '#a8442a', B: '#c8643c', n: '#5a2010', h: '#a07a34', H: '#d0a858', v: '#c8ccd6', V: '#8a8e9a' });
    const t = d.t;
    for (const [x0, y0, x1, y1] of [[16, 11, 10, 2], [12, 6, 7, 4], [19.5, 9, 18, 1.5]]) t.linea(x0, y0, x1, y1, 'a', 2).linea(mx(x0), y0, mx(x1), y1, 'a', 2);
    d.pal.a = '#c8a048';
    return d;
  };
  R.poivrons_mystica = () => rcol(BASE_R.poivrons, { p: '#9a6e2c', P: '#c8984e', q: '#5a3a12', f: '#d4d8e2', F: '#ffffff', e: '#9ad8ff', k: '#1a2a4a' });
  R.noctis_mystica = () => {
    const d = rcol(BASE_R.noctis, { w: '#5ac8b8', W: '#3aa898', a: '#c8ccd6', A: '#8a909c', o: '#ffd23a', O: '#fff08a' });
    const t = d.t;
    for (const x of [19, 28]) t.ellisse(x, 17.6, 2.8, 3, 'S').ellisse(x + (x < C ? 0.6 : -0.6), 18, 1.1, 1.3, 'k');
    t.ellisse(C, 44, 6, 3, 'z').luce({ z: ['Z', ''] });
    d.pal.S = '#e8ecf4'; d.pal.z = '#8a6428'; d.pal.Z = '#b08a48';
    return d;
  };

  // ---------------- Energheia ----------------
  // Gheos il Potente: spalle enormi d'oro, testa piccola con corna e fronte pesante, rombi grigi,
  // denti grigi sul ventre, il grande maglio cilindrico
  R.gheos_energheia = () => {
    const t = new Tela(48);
    t.ellisse(C, 50, 23, 15, 'o');
    t.ellisse(9, 36, 9.4, 8.4, 'a');
    t.poligono([[17, 22], [10, 10], [19, 16]], 's').poligono([[19, 16], [15.6, 5], [21.6, 13]], 's').luce({ s: ['', 'S'] });
    const testa = [[C, 11], [18.4, 13], [15.6, 19], [16.4, 30], [C, 32.6]];
    t.poligono(testa.concat(mp(testa).reverse()), 'o');
    t.poligono([[21, 13.4], [C, 2.6], [26, 13.4]], 'o');
    t.luce({ o: ['O', 'R'], a: ['O', 'R'] });
    t.linea(16.4, 19.6, 22, 21, 'R', 2);
    t.ellisse(19.6, 23, 2, 1.3, 'k').px(19, 23, 'e');
    t.linea(17.4, 26, 20, 30, 'R').rect(20, 28, 4, 1, 'R');
    for (const [x, y, r] of [[6, 32, 1.6], [12, 39, 1.4], [3, 41, 1.3], [15, 33, 1.1], [21, 8, 0.9]]) rombo(t, x, y, r, 's');
    t.rect(13, 43, 11, 3, 's');
    for (const x of [15, 18, 21]) t.poligono([[x, 43], [x + 2, 43], [x + 1, 46]], 'G');
    t.specchia();
    t.linea(40, 47, 40, 38, 'h', 2);
    t.ellisse(41, 28, 5.6, 9, 'g').luce({ g: ['m', 'G'] });
    for (const [x, y] of [[39, 22], [43, 25], [39, 30], [43, 33], [41, 36]]) rombo(t, x, y, 1.2, 'l');
    return { pal: { o: '#e8b020', a: '#e8b020', O: '#ffd860', R: '#a87410', s: '#b8bcc4', S: '#7a7e88', G: '#2e2e36', k: '#2a1a06', e: '#ffe9a0', g: '#4a4c54', m: '#6e707a', h: '#3a3a40', l: '#a8aab2' }, t };
  };
  // Tasarau il Saggio: testa e tronco di legno a venature, corona di punte scure, un solo grande
  // occhio giallo e triste, anelli del legno sul petto, avambracci verdi e mani scure alzate
  R.tasarau_energheia = () => {
    const t = new Tela(48);
    t.ellisse(C, 48, 21, 14, 'b');
    t.ellisse(C, 23, 11, 12, 'b');
    t.luce({ b: ['B', 'n'] });
    for (const [x, y] of [[13, 13], [16, 9], [19, 12]]) t.poligono([[x - 2, y + 4], [x, y - 7], [x + 2.4, y + 4]], 'k');
    t.ellisse(5, 30, 3.4, 7, 'g').ellisse(4.6, 20, 4, 4, 'h').luce({ g: ['G', 'V'], h: ['H', ''] });
    t.ellisse(5, 45, 3.4, 4, 'g').luce({ g: ['G', 'V'] });
    for (const [x0, y0, x1, y1] of [[15, 14, 14, 33], [19, 31, 18, 36], [8, 40, 10, 47]]) t.linea(x0, y0, x1, y1, 'n');
    t.ellisse(14, 40, 5.4, 5, 'n').ellisse(14, 40, 4, 3.6, 'B').ellisse(14, 40, 2.6, 2.2, 'n').ellisse(14, 40, 1, 1, 'B');
    t.specchia();
    t.ellisse(C, 21, 4.4, 4, 'n').ellisse(C, 21, 3.2, 2.8, 'e').ellisse(C, 21.6, 1.4, 1.6, 'E').px(22, 20, 'w');
    t.linea(19, 16.6, 28, 16.6, 'n');
    t.rect(20, 28, 8, 2, 'E');
    return { pal: { b: '#a84a26', B: '#c86a3a', n: '#5e2410', k: '#2a120a', g: '#3aa04a', G: '#6ad070', V: '#1e6a2a', h: '#3a1a10', H: '#5a3020', e: '#ffd84a', E: '#2a1408', w: '#fff8d8' }, t };
  };
  // Poivrons il Guardiano dei Mari: testa di polpo viola con la lunga proboscide, pinne azzurre
  // a ventaglio su testa e spalle, muscoli blu acciaio
  R.poivrons_energheia = () => {
    const t = new Tela(48);
    t.ellisse(C, 49, 22, 14, 'b').ellisse(8, 36, 8, 7, 'b');
    t.luce({ b: ['B', 'd'] });
    t.linea(15, 40, 21, 42, 'd').linea(10, 44, 16, 46, 'd');
    t.poligono([[4, 35], [0.6, 24], [5, 27], [6, 21], [9, 27], [11, 22.6], [12.6, 32]], 'f');
    t.ellisse(C, 16, 11, 10.6, 'p');
    t.poligono([[13.4, 15], [4, 5.6], [7.6, 5.6], [6.4, 1.6], [11, 6.4], [12.6, 2.6], [15.6, 10]], 'f');
    t.poligono([[21.4, 6], [C, -1], [C, 6]], 'f');
    t.luce({ p: ['P', 'q'], f: ['F', 'D'] });
    t.linea(15.6, 14.4, 21, 16, 'q', 2);
    t.ellisse(18.6, 17.6, 2.4, 1.6, 'e').px(19, 17, 'k');
    t.poligono([[19.6, 21], [C, 21], [C, 44], [21.4, 37]], 'p').luce({ p: ['P', 'q'] });
    for (const y of [26, 31, 36, 40]) t.linea(21, y, C, y, 'q');
    t.specchia();
    return { pal: { b: '#2a6e9e', B: '#4a92c0', d: '#183e66', p: '#4a2a9e', P: '#6a4ac4', q: '#2a1660', f: '#9ae0f4', F: '#d8f8ff', D: '#5ab0d0', e: '#bff4ff', k: '#14102a' }, t };
  };
  // Noctis il Terribile: testa piumata verde acqua, ciuffi gialli piegati all'indietro, occhi bianchi
  // dallo sguardo terribile, becco giallo ricurvo, ali bianco perla bordate di giallo arancio
  R.noctis_energheia = () => {
    const t = new Tela(48);
    t.poligono([[16, 32], [0.6, 22], [0.6, 40], [12, 46]], 'w');
    t.linea(0.6, 22, 16, 32, 'Y', 2).linea(2, 30, 12, 40, 'W').linea(2, 36, 10, 44, 'W');
    t.ellisse(C, 48, 18, 13, 't').ellisse(10, 38, 6, 6, 't');
    t.ellisse(C, 20, 9.4, 9.6, 't');
    t.luce({ t: ['T', 'u'] });
    for (const [x, y] of [[17, 33], [20, 38], [14, 41], [18, 13], [16, 25]]) t.linea(x, y, x + 2, y + 1, 'u');
    t.poligono([[16, 14], [3, 6], [6, 5], [1.6, 1.6], [10, 3.6], [18, 11]], 'y').luce({ y: ['', 'Y'] });
    t.ellisse(18.4, 18.6, 3, 2.8, 'e').ellisse(19.2, 19, 1.3, 1.5, 'k');
    t.linea(15, 15.6, 21, 17, 'u', 2);
    t.poligono([[20, 21], [C, 20], [C, 34], [21.6, 30]], 'y').luce({ y: ['', 'Y'] });
    t.rect(19, 46, 9, 2, 'k');
    t.specchia();
    return { pal: { t: '#3ab8a8', T: '#6ad8c8', u: '#1a7a70', w: '#f2f4fa', W: '#b8c0cc', y: '#ffc42a', Y: '#e8841a', e: '#ffffff', k: '#1a1a24' }, t };
  };

  // ---------------- Atomic ----------------
  // Kolossus: stesso gigante a quattro braccia, ma con placche bruno scuro e la luce fluorescente
  // delle gemme di Muscor su maschera, pugni e borchie
  R.kolossus_atomic = () => {
    const d = rcol(BASE_R.kolossus, { s: '#5a4630', S: '#7a6448', t: '#2a2018', d: '#33281e', D: '#4a3a2a', K: '#140e0a', y: '#b8e89a', Y: '#e8ffd0', o: '#7aa860', k: '#e0ffc8', h: '#b8e89a', H: '#e8ffd0' });
    const t = d.t;
    for (const [x, y] of [[10, 31], [14, 29], [8, 35], [37, 31], [33, 29], [39, 35], [19, 39], [28, 39]]) t.ellisse(x, y, 0.9, 0.9, 'k');
    t.rect(20, 21, 2, 2, 'K').rect(26, 21, 2, 2, 'K').linea(C, 18, C, 27, 'K');
    return d;
  };
  // Barbataus l'Invisibile: corpo verde trasparente, barba di vetro con le venature gialle, corona
  // trasparente, spallacci di foglie gialle
  R.barbataus_atomic = () => {
    const d = rcol(BASE_R.barbataus, { b: '#4ab02a', B: '#7ad84a', n: '#24701a', l: '#8ae86a', L: '#d0ffa8', G: '#f2d23a', v: '#f2d23a', V: '#b8901a', W: '#fff090', e: '#14300c' });
    const t = d.t;
    t.rect(15, 6, 18, 3, 'c');
    poli2(t, [[15, 7], [15.5, 1.6], [18.5, 7]], 'c'); poli2(t, [[19, 7], [20.5, 2.4], [22.5, 7]], 'c');
    t.luce({ c: ['C', ''] });
    t.ellisse(19.5, 18, 1.8, 1, 'e').ellisse(27.5, 18, 1.8, 1, 'e');
    d.pal.c = '#b8f0a0'; d.pal.C = '#e8ffd8';
    return d;
  };
  // Carrapax: guscio rosso arancio a puntini blu su spalle e testa, petto e chele grigio trasparente
  R.carrapax_atomic = () => {
    const d = rcol(BASE_R.carrapax, { c: '#a8b4c0', C: '#d4dee8', b: '#2a58c8', t: '#e8502a', T: '#ff8a5a', k: '#1a3a9a', e: '#9ad8ff' });
    const t = d.t;
    for (const x of [5, 42]) { t.ellisse(x, 21, 4.6, 8.6, 'p'); }
    t.luce({ p: ['P', 'q'] });
    t.poligono([[3.6, 12], [7, 12], [5.4, 21]], '.').poligono(mp([[3.6, 12], [7, 12], [5.4, 21]]), '.');
    d.pal.p = '#a8b4c4'; d.pal.P = '#dce4ee'; d.pal.q = '#6a7888';
    return d;
  };
  // Elios: ali enormi giallo trasparente, testa blu con la cresta trasparente, collare di piume cremisi
  R.elios_atomic = () => {
    const d = rcol(BASE_R.elios, { w: '#f0e8b8', W: '#c8b880', g: '#3a5ac8', G: '#5a7ae8', h: '#22388a', c: '#5a7ae8', C: '#3a5ac8' });
    const t = d.t;
    t.ellisse(C, 33, 11, 5, 'r').luce({ r: ['R', 'q'] });
    for (const [x, y] of [[15, 35], [19, 37], [28, 37], [32, 35]]) t.px(x, y, 'q');
    t.ellisse(C, 20, 8, 10, 'b').luce({ b: ['B', 'n'] });
    t.poligono([[21, 12], [C, 1], [26, 12]], 'w').luce({ w: ['', 'W'] });
    t.ellisse(18.6, 17.4, 1.8, 1.4, 'y').px(19, 17, 'n').ellisse(28.4, 17.4, 1.8, 1.4, 'y').px(28, 17, 'n');
    t.poligono([[20, 21], [27, 21], [C, 29]], 'k').linea(21.4, 22, C, 27, 'K');
    Object.assign(d.pal, { r: '#c8285a', R: '#f05a84', q: '#7a1438', b: '#3a5ac8', B: '#5a7ae8', n: '#22388a', y: '#ffd23a' });
    return d;
  };

  // ---------------- Mythos e Final Evolution ----------------
  // Sommo Luminescente Mythos: armatura d'argento, ali di fiamma trasparenti, corona di fiamme arancio
  R.luminescente_mythos = () => {
    const d = rcol(BASE_R.luminescente, { y: '#b8bcc8', Y: '#e8ecf4', o: '#7a8094', s: '#959bb0', S: '#ffffff', t: '#585e72', g: '#f2e6b4', O: '#fff8dc', G: '#c8b078', e: '#ff8a3a' });
    const t = d.t;
    for (const pts of [[[17, 15], [14.5, 4], [20, 12]], [[20, 12], [19.6, 1.6], [C, 11]], [[22.5, 11], [C, 0.6], [24.5, 11]]]) poli2(t, pts, 'r');
    t.luce({ r: ['R', ''] });
    t.poligono([[22, 24], [25, 24], [C, 28]], 'r');
    Object.assign(d.pal, { r: '#ff7a2a', R: '#ffb06a' });
    return d;
  };
  // Sommo Luminescente, Signore del Sole: pelle arancio, corazza rosso arancio metallizzato,
  // corona d'oro, spallacci viola, ali di rame a raggi di sole
  R.luminescente_final = () => {
    const d = rcol(BASE_R.luminescente, { y: '#f2a02a', Y: '#ffc860', o: '#b8661a', s: '#d8401a', S: '#ff8a4a', t: '#8a1e0a', g: '#c07a40', O: '#e8a464', G: '#6a3a14', k: '#2a1a1a', e: '#ffe27a' });
    const t = d.t;
    for (const pts of [[[17, 15], [14.5, 4], [20, 12]], [[20, 12], [19.6, 1.6], [C, 11]], [[22.5, 11], [C, 0.6], [24.5, 11]]]) poli2(t, pts, 'a');
    t.ellisse(12, 35, 7, 5, 'v').ellisse(35, 35, 7, 5, 'v').luce({ v: ['V', 'q'] });
    t.poligono([[C, 33], [28, 40.5], [C, 47], [19, 40.5]], 'a').luce({ a: ['A', ''] });
    Object.assign(d.pal, { a: '#f0c850', A: '#fff0a0', v: '#5a2a8a', V: '#7a4aaa', q: '#3a1a5a' });
    return d;
  };

  // ---------------- Vecchio Saggio, Risveglio dell'Occhio ----------------
  R.saggio_risveglio = () => {
    const d = rcol(BASE_R.saggio, { p: '#6a44a8', P: '#9a74d8', q: '#3e2670', n: '#a8884a' });
    const t = d.t;
    t.linea(11, 40, 15, 47, 'a', 2).linea(36, 40, 32, 47, 'a', 2);
    t.ellisse(19.5, 19.6, 1.6, 0.9, 'm').ellisse(27.5, 19.6, 1.6, 0.9, 'm');
    t.ellisse(41.5, 7, 5.4, 5.4, 'g').ellisse(41.5, 7, 4.2, 4.2, 'n').ellisse(41.5, 7, 3.2, 3.2, 'm').ellisse(41.5, 7, 1.6, 1.6, 'M').px(40, 5, 'w');
    for (const [x, y] of [[34, 2], [47, 1], [35, 12], [46, 13], [41, 0]]) t.px(x, y, 'm');
    Object.assign(d.pal, { a: '#f0c850', m: '#8affc8', M: '#ffffff', g: '#2aa07a' });
    return d;
  };

  return { SPRITE: S, RITRATTI: R };
};

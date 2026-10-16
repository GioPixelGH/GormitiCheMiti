'use strict';
// ============================================================
//  sprites2.js : pixel art dei contenuti aggiunti
//  (Pianura delle Nebbie, Oscuro Orizzonte, eventi, decorazioni)
//  Molti nemici di contorno sono varianti di colore: i guerrieri dell'era
//  con il loro aspetto definitivo arrivano con la Fase 4 del piano.
// ============================================================
(function () {
  const S = G.SPRITE_DEFS;

  // ---------------------------------------------------------------- VARIANTI DI COLORE
  S.lupoalfa = { base: 'lupo', pal: { d: '#141018', b: '#3e3640', l: '#6e6470', w: '#d8d0d8', e: '#ff3a3a', k: '#120d18' } };
  S.lupospirito = { base: 'lupo', pal: { d: '#2a6a3a', b: '#5ab06a', l: '#9ae0a0', w: '#e0ffe0', e: '#ffffff', k: '#123018' } };
  S.antico = { base: 'treant', pal: { b: '#3a2a1e', n: '#6a5030', l: '#8a6a40', g: '#4ab03a', v: '#ffd23a', e: '#7aff7a' } };
  S.riflesso = { base: 'obscurio', size: 24, pal: { n: '#1a1030', N: '#2a1a4a', M: '#4a3a7a', b: '#0a0612', k: '#000000', l: '#505060', r: '#401020', R: '#602040', e: '#ff4aff' } };

  // ---------------------------------------------------------------- PIANURA DELLE NEBBIE
  S.lupocenere = { base: 'lupo', pal: { d: '#2a2622', b: '#6a645c', l: '#9a948a', w: '#d8d2c8', e: '#ff8a2a', k: '#120d18' } };
  S.spettronebbia = { base: 'spiritovento', pal: { w: '#f0f2ee', c: '#c8ccc6', b: '#8a8e88', e: '#3a3e44' } };
  S.golemlava = { base: 'golem', pal: { d: '#2a1410', s: '#4a2a20', l: '#7a3a24', h: '#ff8a2a', g: '#ffc83a', e: '#ffe27a' } };
  S.sciamanolava = { base: 'sacerdote', pal: { r: '#5a1a12', o: '#a8381a', y: '#ff8a2a', f: '#ffd23a', s: '#1a0806', e: '#ffe27a', g: '#c8a040' } };
  // provvisori, in attesa dei guerrieri dell'era (Fase 4)
  S.lavor = { base: 'guerriero', pal: { d: '#4a1410', s: '#c8321e', l: '#e8562a', o: '#ffd23a', y: '#ffe27a' } };
  S.mastodontico = { base: 'golem', pal: { d: '#5a1410', s: '#b8281e', l: '#e04a2a', h: '#ff8a5a', g: '#ffd23a', e: '#ffe27a' } };

  // ---------------------------------------------------------------- REGIONE DI OSCURO ORIZZONTE
  S.cristallonero = { sym: true, pal: { y: '#6a3aa0', o: '#3a2a5a', w: '#d8b0ff', c: '#2a1a4a', e: '#9ae07a', d: '#1a1030' }, rows: [
    '........', '........', '......yy', '.....ycc', '....yccc', '....ccce', '....yccc', '.....ycc',
    '......yy', '......oo', '.....ooo', '....dooo', '...ddddd', '........', '........', '........'] };
  S.falenanotte = { sym: true, pal: { y: '#3a2a6a', o: '#6a3aa0', w: '#9ae07a', b: '#1a1030', e: '#ff3a3a' }, rows: [
    '........', '........', '........', 'yy......', 'yyyy..b.', 'yeyyy.b.', 'yyyyyob.', '.yyyyobb',
    '..yywobb', '.yyyyobb', 'yeyyy.bb', 'yyyy...b', '.yy.....', '........', '........', '........'] };
  S.cavaliereombra = { sym: true, pal: { s: '#2a2a4a', l: '#4a4a7a', g: '#9ae07a', d: '#14142a', e: '#ff3a3a', v: '#b77cff' }, rows: [
    '.....ggg', '....g...', '.....sss', '....slll', '....sdde', '....ssss', '.gg.vsll', 'gllgvsss',
    'gllgvsls', 'glvgdsss', 'gllg.sss', '.gg..sds', '.....ss.', '.....ss.', '....dd..', '........'] };
  S.accolitonotte = { base: 'sacerdote', pal: { r: '#1a1838', o: '#2e2a5a', y: '#9ae07a', f: '#c8f8a8', s: '#08060e', e: '#ff3a3a', g: '#b77cff' } };
  // provvisoria, in attesa dei guerrieri dell'era (Fase 4)
  S.pantanera = { base: 'lupo', pal: { d: '#0a0812', b: '#1e1a3a', l: '#34306a', w: '#9ae07a', e: '#ff3a3a', k: '#06040a' } };

  // ---------------------------------------------------------------- OGGETTI E SCENA
  // il Frammento dell'Occhio della Vita
  S.frammento = { sym: true, pal: { c: '#7ad8ff', w: '#ffffff', l: '#bff4ff', d: '#2a6a9a' }, rows: [
    '........', '........', '........', '........', '.......w', '......cw', '.....ccl', '...c.ccl',
    '..cw.cll', '..ccccll', '..cclcll', '...ccll.', '..dddddd', '........', '........', '........'] };
  S.fiore = { sym: true, pal: { p: '#ff7ab0', w: '#ffffff', y: '#ffe27a', g: '#3fa03a', l: '#7ad05a' }, rows: [
    '........', '........', '........', '........', '......pp', '....pppw', '....ppyy', '....ppyy',
    '.....ppp', '.......g', '.....l.g', '.....llg', '.......g', '......gg', '........', '........'] };
  S.event = { sym: true, pal: { s: '#6a6a7a', l: '#9a9aaa', d: '#3a3a4a', c: '#b0f0ff' }, rows: [
    '........', '........', '.....sss', '....slll', '....slll', '....slcc', '....slcl', '....slcc',
    '....slll', '....slll', '....sldl', '...sslll', '..dddddd', '........', '........', '........'] };

  // ---------------------------------------------------------------- DECORAZIONI
  const blank = () => Array(16).fill('................');
  const deco = (rowsAt) => { const r = blank(); for (const k in rowsAt) r[k] = rowsAt[k]; return r; };
  Object.assign(G.DECO_DEFS, {
    12: { pal: { o: '#c09a3a', y: '#ffe27a' }, rows: deco({ 4: '.......o........', 5: '......oyo.......', 6: '.....oy.yo......', 7: '......oyo.......', 8: '.......o........' }) },
    13: { pal: { w: '#ffffff', s: '#d8e8f4' }, rows: deco({ 11: '...ww......w....', 12: '..wwss....wws...' }) },
    14: { pal: { y: '#fff3a0', w: '#ffffff' }, rows: deco({ 5: '....y...........', 9: '..........w.....', 12: '.....y......y...' }) },
    // incudine delle forge di Roscamar
    15: { pal: { l: '#9a9aa4', s: '#5a5a64', d: '#2a2a32' }, rows: deco({ 8: '...llllllll.....', 9: '....ssssssss....', 10: '......ssss......', 11: '.....ssssss.....', 12: '....dddddddd....' }) },
    // funghi d'ombra di Oscuro Orizzonte
    16: { pal: { p: '#7a4ab0', g: '#9ae07a', l: '#3a2a5a' }, rows: deco({ 10: '...p.......g....', 11: '..ppp.....ggg...', 12: '...l.......l....', 13: '...l..p....l....', 14: '.....ppp........' }) },
    // la Porta Ultradimensionale dipinta sul suolo dell'arena di Obscurio
    17: { pal: { v: '#b77cff', g: '#9ae07a', n: '#140a28' }, rows: deco({ 3: '......vvvv......', 4: '....vvnnnnvv....', 5: '...vnnnnnnnnv...', 6: '...vnngggnnnv...', 7: '..vnnggnnggnnv..', 8: '..vnngnnnngnnv..', 9: '..vnnggnnggnnv..', 10: '...vnngggnnnv...', 11: '...vnnnnnnnnv...', 12: '....vvnnnnvv....', 13: '......vvvv......' }) },
  });
})();

'use strict';
// ============================================================
//  sprites2.js : pixel art dei contenuti aggiunti
//  (nuovi eroi, Ghiacciai, Tempio della Luce, eventi, decorazioni)
// ============================================================
(function () {
  const S = G.SPRITE_DEFS;

  // ---------------------------------------------------------------- NUOVI EROI
  S.kolossus = { sym: true, pal: { d: '#3a3430', s: '#6a5e52', l: '#9a8a74', h: '#c8b89a', g: '#5a8a3a', e: '#ffb030' }, rows: [
    '........', '.....sss', '....slhh', '....sdee', '....ssll', 'gg.dssss', 'ssgsslll', 'shsssllh',
    'sshdssll', 'sssdssss', 'll.dsdss', 'lh.dssss', '....sss.', '....sss.', '...ddd..', '........'] };
  S.carrapax = { sym: true, pal: { d: '#7a2a1a', r: '#c84a2a', o: '#ff8a4a', w: '#ffe0a0', e: '#101010' }, rows: [
    '........', '.....e..', '.....d..', 'rr..rrrr', 'ror.rooo', 'rrr.rwoo', '.rr.rrrr', '..rdrooo',
    '...drooo', '...drrrr', '...ddrrr', '....drrd', '....dr..', '...ddr..', '........', '........'] };
  S.elios = { sym: true, pal: { w: '#fff8e8', y: '#ffd84a', o: '#ffa52a', b: '#7aa0d0', s: '#c0d8f0', e: '#2a7ab0' }, rows: [
    '........', '....y.y.', '.....yyy', 's...wwww', 'ss..wewo', 'sss.wwww', 'bss..yww', 'bbss.oyw',
    '.bbsyyow', '..bsooyw', '...syoww', '....yowy', '.....ww.', '.....w..', '....yy..', '........'] };
  S.barbataus = { sym: true, pal: { g: '#3f8a2a', l: '#7ac04a', b: '#6a4a2a', n: '#9a6a3a', w: '#d8e8b0', e: '#3a2a10', f: '#e0b890' }, rows: [
    '..n.....', '..nn..n.', '...nnnn.', '....gggg', '...glllg', '....ffff', '....feff', '...wwwww',
    '..gwwlww', '..gwwwww', '..ggwwwg', '..gggwgg', '..ggggbg', '...gg.gg', '...bb.bb', '........'] };

  // ---------------------------------------------------------------- VARIANTI DI COLORE
  S.lupoalfa = { base: 'lupo', pal: { d: '#141018', b: '#3e3640', l: '#6e6470', w: '#d8d0d8', e: '#ff3a3a', k: '#120d18' } };
  S.lupoghiaccio = { base: 'lupo', pal: { d: '#5a7a96', b: '#b8cce0', l: '#e4eef8', w: '#ffffff', e: '#2a8aff', k: '#120d18' } };
  S.lupospirito = { base: 'lupo', pal: { d: '#2a6a3a', b: '#5ab06a', l: '#9ae0a0', w: '#e0ffe0', e: '#ffffff', k: '#123018' } };
  S.spiritogelido = { base: 'spiritovento', pal: { w: '#ffffff', c: '#bff4ff', b: '#5aaad0', e: '#1a4a8a' } };
  S.golemghiaccio = { base: 'golem', pal: { d: '#4a7a9a', s: '#8ac0e0', l: '#bfe4f8', h: '#ffffff', g: '#e0f6ff', e: '#2a6aff' } };
  S.sciamano = { base: 'sacerdote', pal: { r: '#2a4a7a', o: '#4a7ab0', y: '#bff4ff', f: '#ffffff', s: '#0a1a2a', e: '#7af0ff', g: '#c0e8ff' } };
  S.accolito = { base: 'sacerdote', pal: { r: '#b09040', o: '#f0e0a0', y: '#ffffff', f: '#fff6c8', s: '#3a2a1a', e: '#ff4aff', g: '#ffe27a' } };
  S.arconte = { base: 'folgoratore', pal: { b: '#a08030', l: '#f0d070', c: '#fff6c8', y: '#ffffff', w: '#ffffff', e: '#ff4aff' } };
  S.antico = { base: 'treant', pal: { b: '#3a2a1e', n: '#6a5030', l: '#8a6a40', g: '#4ab03a', v: '#ffd23a', e: '#7aff7a' } };
  S.riflesso = { base: 'obscurio', size: 24, pal: { k: '#000000', d: '#0a0612', p: '#1a1030', v: '#2a1a4a', l: '#4a3a7a', e: '#ff4aff', g: '#505060', r: '#401020' } };

  // ---------------------------------------------------------------- GHIACCIAI
  S.tricheco = { pal: { b: '#6a4a3a', l: '#9a7a6a', w: '#f0f0e0', e: '#101010', p: '#c09a8a' }, rows: [
    '................', '................', '................', '................', '................', '.......bbbbb....',
    '.....bbllllbb...', '...bbllllleblb..', '..bllllllllllb..', '.bllllllllpppb..', '.bbllllllbpwpw..', '..bbbblllbb.w.w.',
    '...bb.bb.b..w.w.', '................', '................', '................'] };
  S.yeti = { sym: true, pal: { w: '#f0f4f8', s: '#c0ccd8', d: '#8a9ab0', b: '#5a7aa0', e: '#ff3a3a' }, rows: [
    '........', '.....www', '....wwww', '...wwbbb', '...wbebb', 'w..wbbdd', 'ww.wwwbb', 'wwwwwwww',
    '.wwswwww', '..wsswww', '..wssssw', '...wssss', '...wwww.', '..ddd...', '........', '........'] };
  S.frammento = { sym: true, pal: { c: '#7ad8ff', w: '#ffffff', l: '#bff4ff', d: '#2a6a9a' }, rows: [
    '........', '........', '........', '........', '.......w', '......cw', '.....ccl', '...c.ccl',
    '..cw.cll', '..ccccll', '..cclcll', '...ccll.', '..dddddd', '........', '........', '........'] };
  S.glaciator = { sym: true, size: 24, pal: { w: '#ffffff', c: '#bff4ff', l: '#7ad8ff', b: '#3a8ab0', d: '#1a4a6a', k: '#0a1a2a', e: '#7affff' }, rows: [
    '............', '........c...', '......c.cc.c', '.......ccccc', '........llll', '.......lllll', '.......lkkkk', '.......lkeek',
    '.......lkkkk', '.....ccddlll', '...cclbdllcl', '..cllbdlccll', '.cllbbdlclwl', '.clbbdlccwwl', 'clbbddlcclll', 'clbd.dlcllcl',
    'cbd..dlllcll', 'cb...dllllll', '.....dlll.ll', '.....dll..ll', '.....dll..ll', '....ddd..ddd', '............', '............'] };

  // ---------------------------------------------------------------- TEMPIO DELLA LUCE
  S.sentinella = { sym: true, pal: { y: '#ffe27a', o: '#d0a040', w: '#ffffff', c: '#fff6c8', e: '#ff4a4a', d: '#8a6a3a' }, rows: [
    '........', '........', '......yy', '.....ycc', '....yccc', '....ccce', '....yccc', '.....ycc',
    '......yy', '......oo', '.....ooo', '....dooo', '...ddddd', '........', '........', '........'] };
  S.falena = { sym: true, pal: { y: '#fff3a0', o: '#e0b040', w: '#ffffff', b: '#8a6a3a', e: '#4a3aa0' }, rows: [
    '........', '........', '........', 'yy......', 'yyyy..b.', 'yeyyy.b.', 'yyyyyob.', '.yyyyobb',
    '..yywobb', '.yyyyobb', 'yeyyy.bb', 'yyyy...b', '.yy.....', '........', '........', '........'] };
  S.paladino = { sym: true, pal: { s: '#b0b0bc', l: '#e8e8f0', g: '#ffd23a', d: '#5a5a6a', e: '#ff3a3a', v: '#7a3a9a' }, rows: [
    '.....ggg', '....g...', '.....sss', '....slll', '....sdde', '....ssss', '.gg.vsll', 'gllgvsss',
    'gllgvsls', 'glvgdsss', 'gllg.sss', '.gg..sds', '.....ss.', '.....ss.', '....dd..', '........'] };
  S.prisma = { sym: true, pal: { c: '#ffe8a0', w: '#ffffff', p: '#ff9aff', b: '#7ad8ff', d: '#c09a3a', e: '#2a1a4a' }, rows: [
    '........', '........', '.......w', '......cw', '.....ccp', '....cccb', '...ccebb', '..cccbbp',
    '..ccbbpp', '...cbbpp', '....bbpd', '.....bdd', '......dd', '.......d', '........', '........'] };
  S.scheggia = { sym: true, pal: { c: '#ffe8a0', w: '#ffffff', b: '#7ad8ff', d: '#c09a3a', e: '#2a1a4a' }, rows: [
    '........', '........', '........', '........', '........', '........', '.......w', '......cw',
    '.....ceb', '......bb', '.......d', '........', '........', '........', '........', '........'] };
  S.pilone = { sym: true, pal: { c: '#fff6c8', y: '#ffe27a', w: '#ffffff', d: '#8a6a3a', o: '#d0a040' }, rows: [
    '........', '.......w', '......wc', '......cc', '......cy', '.....ccy', '.....cyy', '.....cyy',
    '.....cyo', '.....yyo', '.....yoo', '....dddd', '...doood', '...ddddd', '........', '........'] };
  S.luxalion = { sym: true, size: 24, pal: { y: '#ffe27a', o: '#e0a030', w: '#ffffff', c: '#fff6c8', d: '#8a5a1a', e: '#ff3aff', v: '#9a3aa0' }, rows: [
    '............', '.......y....', '....y..y..y.', '.....y.yy.yy', '......yyoooo', '....yyoooooo', '...yoooccccc', '...yoocceccc',
    '...yoocccccd', '....yoocccvc', '.....oyycccc', '......yywyyy', '....ccyyyyvy', '...cwcyyyyyy', '...cccoyyyoy', '...cc.oyyyyy',
    '......oyyyoy', '......oyy.yy', '......oyy.yy', '.....ooy..yy', '.....dd...dd', '............', '............', '............'] };

  // ---------------------------------------------------------------- ALLEATI / SCENA
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
  });
})();

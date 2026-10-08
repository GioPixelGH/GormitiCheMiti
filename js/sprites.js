'use strict';
// ============================================================
//  sprites.js : pixel art (16x16, boss 24x24) definita come testo.
//  sym:true => ogni riga è la metà sinistra, specchiata a destra.
//  Il contorno scuro viene aggiunto automaticamente.
// ============================================================
(function () {
  const DEF_PAL = { k: '#120d18', w: '#ffffff', y: '#ffe25a', r: '#e83a3a' };
  const S = G.SPRITE_DEFS = {};

  // ---------------------------------------------------------------- EROI
  S.gheos = { sym: true, pal: { b: '#5c3d24', m: '#8a6038', l: '#b88a52', h: '#e0b878', o: '#ff9a2e', s: '#6e6a70', t: '#a8a4ac', e: '#ffe25a' }, rows: [
    '........', '........', '......tt', '.....stt', '....mmll', '....mlle', '....mmll', '.ts.bmoo',
    'ttsbbmoo', 'tsmbbmmh', 'smmbbmmm', 'mmh.bbmm', '.mm.bbmm', '.....bm.', '.....mm.', '........'] };
  S.tasarau = { sym: true, pal: { g: '#2f7a2a', f: '#4fb33a', l: '#8be06a', b: '#5a3a1e', n: '#8a5a30', e: '#d8ff6a' }, rows: [
    '........', '....gfff', '..ggflll', '.gffgflf', '.ggfgfff', '..ggbnnn', '...bneen', '...bnnnn',
    '..fgbnnb', '.gf.bnbn', '.n..bnnb', '.n..bbnb', '.n..bnb.', '....bnb.', '...bb.bb', '..b.....'] };
  S.poivrons = { sym: true, pal: { d: '#1b3f7a', b: '#2f6fc0', l: '#5ab0ff', c: '#a8e8ff', f: '#3fd0c0', e: '#fff27a' }, rows: [
    '........', '.......f', '......ff', '.....bfl', '....bbll', '....bebl', '.ff.bbbc', 'fff.dbbl',
    'ff.ddbcc', '.bbbdbcc', 'bbb.dbbl', 'll..ddbb', '.....dbb', '.....bb.', '....bbb.', '........'] };
  S.noctis = { sym: true, pal: { w: '#f4f8ff', a: '#bcd4f0', s: '#7f9cc8', b: '#4a6aa8', y: '#ffd84a', e: '#3ae8ff' }, rows: [
    '........', '......wa', 's....wwa', 'as...www', 'aas.wewa', 'waas.wwy', 'wwaas.ww', '.wwasbww',
    '..wwsbwa', '...wsbaw', '....sbaa', '.....bab', '.....aa.', '.....y..', '....y...', '........'] };
  S.saggio = { pal: { p: '#5a3a8a', l: '#9a70d0', k: '#1a1028', e: '#4ad0ff', s: '#ece4d4', f: '#f0c8a0', n: '#8a6a3a', o: '#ffe27a' }, rows: [
    '...........oo...', '..........oeeo..', '......pp...oo...', '.....pllp...n...', '....plppp...n...', '....pkkkpp..n...',
    '....kekekp..n...', '....kssskp..n...', '...pssssspffn...', '..ppssssspp.n...', '..plpsssplp.n...', '..plppspplp.n...',
    '..pllppppllpn...', '..ppllpplllpn...', '...pppppppp.n...', '................'] };
  S.luminescente = { sym: true, pal: { y: '#ffe27a', o: '#e0a030', w: '#ffffff', c: '#fff6c8', e: '#3ae8ff' }, rows: [
    '........', '...y..y.', '....yyoy', '....wccc', '....cecc', '....cccw', '.y..oycc', 'yo.ooyyc',
    'yoooyycw', '.yo.oyyc', '.o..oyyy', '.w..ooyy', '.....oyo', '.....oy.', '....oo..', '........'] };

  // ---------------------------------------------------------------- FORESTA
  S.rovo = { sym: true, pal: { d: '#2a4a1a', g: '#3f7a2a', l: '#6ab040', t: '#d8c080', r: '#ff3a3a' }, rows: [
    '........', '........', '........', '....t..t', '...tg.gg', '..tggggd', '.tgldggg', '..gglrgg',
    '.tdgggdg', 'tggdgggd', '.gdlgdgg', '..gddggd', '.t.dg.dg', '...t..t.', '........', '........'] };
  S.lupo = { pal: { d: '#3a2c24', b: '#7a6250', l: '#b09478', w: '#efe4d8', e: '#ffd23a', k: '#120d18' }, rows: [
    '................', '................', '................', '...........b.b..', '..........bbbb..', '..........blebk.',
    'b........bbllww.', '.b.bbbbbbbbbww..', '..bblllbbbbbb...', '..bllllbbbbb....', '..bbllbbbbbb....', '..bb.b...b.bb...',
    '..b..b...b..b...', '..d..d...d..d...', '................', '................'] };
  S.fungo = { sym: true, pal: { r: '#c83a5a', p: '#ff7a9a', w: '#f8e8d0', s: '#d0c0a0', e: '#2a1a10', g: '#9be35a' }, rows: [
    '........', '........', '........', '.....rrr', '...rrprw', '..rpwrrr', '.rrrrrrr', '.rwrrrwr',
    'rrrrrrrr', '....swww', '....swew', '....swww', '....ssww', '...gsssw', '..g.....', '........'] };
  S.calabrone = { sym: true, pal: { y: '#ffd23a', k: '#1a1410', w: '#d0f0ff', e: '#ff3a3a' }, rows: [
    '........', '........', '........', '.ww.....', 'wwww..yy', 'wwwww.ey', '.wwww.yy', '..ww.kkk',
    '.....yyy', '.....kkk', '.....yyy', '......kk', '......yk', '.......k', '........', '........'] };
  S.fuocofatuo = { sym: true, pal: { r: '#ff4a1a', o: '#ff9a2a', y: '#ffe27a', w: '#ffffff', e: '#5a1a0a' }, rows: [
    '........', '.......o', '......oo', '......oy', '.....ooy', '....rooy', '...rooyy', '...royyy',
    '..rooyyw', '..royeyw', '..rooyyy', '...rooyy', '....rroo', '.....rr.', '........', '........'] };
  S.treant = { sym: true, pal: { b: '#3a2a1e', n: '#5a4030', l: '#7a5a40', g: '#3a6a2a', v: '#8a3a9a', e: '#ff3a3a' }, rows: [
    '..n...n.', '..nn.nn.', '...nnnn.', '.n..nnnn', '.nn.bnnn', '..nnbnnl', '...bnnnl', '...bnenl',
    '...bnnvn', '.nnbbnvv', 'n..bnnnl', '...bnnll', '..gbnnnl', '..bb.bnn', '.bb..b.n', '........'] };
  S.cerbante = { sym: true, size: 24, pal: { d: '#2a0808', b: '#6a1818', r: '#b0302a', o: '#ff8a2a', e: '#ffe27a', y: '#ffe27a', w: '#f0e8e0' }, rows: [
    '............', '............', '.........r..', '.........rr.', '..r.....rrrr', '..rr....reyr', '.rrrr...rrrr', '.reyr...wrww',
    '.rrrr.b..www', '.wrww.bb....', '..www.bbbbbb', '...bbbbbbrrb', '..bbbrrbbrrr', '.bbrrrrbrrrr', '.brrorrrrror', '.brrrrrrrrrr',
    '.bbrrrrrrrrr', '..brrrrrrrbb', '..bbrb..bbb.', '..bbbb..bbb.', '..bb.b...bb.', '.dd.dd...dd.', '............', '............'] };

  // ---------------------------------------------------------------- MARE
  S.granchio = { sym: true, pal: { d: '#8a2a1a', r: '#d0502a', o: '#ff8a4a', w: '#ffe0c0', e: '#101010' }, rows: [
    '........', '........', '.rr.....', 'roor....', 'r..r..w.', 'rr.r..e.', '.rr.r.r.', '...rrrrr',
    '..rroooo', '.rrrrooo', 'r.rrrrrr', '.rdrrrrr', 'r.r.dddd', '.r.r.r..', '........', '........'] };
  S.crabs = { base: 'granchio', pal: { d: '#123050', r: '#2a6a9a', o: '#6ac0f0', w: '#ffe27a', e: '#ff3a3a' } };
  S.polypus = { sym: true, pal: { p: '#8a3a9a', l: '#c06ad0', w: '#f0d0f0', e: '#1a0a1a' }, rows: [
    '........', '........', '......pp', '....pppl', '...pplll', '...plllw', '...plwel', '...pllll',
    '....pppl', '..p.pp.p', '.p.p.p.p', '.p.p.p.p', 'p..p.p.p', 'p.p..p.p', '..p..p..', '........'] };
  S.medusa = { sym: true, pal: { c: '#5ae0ff', l: '#b0f4ff', w: '#ffffff', b: '#2a9ac8', y: '#ffe27a' }, rows: [
    '........', '........', '.....ccc', '...cclll', '..cllwll', '..clllll', '.cclllll', '.bcccccc',
    '.b.b.bc.', '..b.b.c.', '.b..y.b.', '..b.b..b', '.y..b.b.', '...b....', '........', '........'] };
  S.squalo = { pal: { d: '#2a4a6a', b: '#4a7aa0', l: '#7aaad0', w: '#f0f4f8', e: '#101010', t: '#ffffff' }, rows: [
    '................', '................', '................', '......d.........', '.....dd.........', '....ddb.........',
    'd..dbbbbbbbb....', 'dddbbbbbbbbbbb..', '.dbbbbbbbbbbeb..', 'dd.wwwbbbbbbbbb.', 'd...wwwwwwwtwtw.', '.....wwwwwww....',
    '......b...b.....', '................', '................', '................'] };
  S.annegato = { sym: true, pal: { g: '#6ac0b0', l: '#c0fff0', d: '#2a7a7a', e: '#0a2a2a', k: '#0a2a2a' }, rows: [
    '........', '........', '.....ggg', '....glll', '...gllll', '...gleel', '...gleel', '...gllll',
    '..gllllk', '..gllllg', '.ggllgll', '.gdglgll', '..g.gdlg', '....g.dg', '.......g', '........'] };
  S.tentacolo = { pal: { p: '#6a2a7a', l: '#b05ac0', w: '#f0c0f0' }, rows: [
    '................', '................', '..........pp....', '.........plp....', '........pll.....', '.......plw......',
    '.......pll......', '......pllw......', '......plll......', '......pllw......', '.......plll.....', '.......pllw.....',
    '......pplllp....', '....pppppppppp..', '...pp..pp...pp..', '................'] };
  S.orrore = { sym: true, size: 24, pal: { d: '#1a2a3a', p: '#3a2a5a', v: '#4a3a7a', l: '#7a62b0', e: '#ffe27a', r: '#c01a4a', w: '#e8e8f0' }, rows: [
    '............', '............', '........vvvv', '......vvllll', '.....vllllll', '....vllvllll', '....vlveelll', '...vlllellll',
    '...vllllllll', '...vlleevlle', '...vvlllllll', '....vvvrrrrr', '....vvrwrwrw', '...vvvrrrrrr', '..vv.vvvvvvv', '.vv.vv.vv.vv',
    'vv.vv.vv..vv', 'v..v..v..vv.', 'v.vv.vv..v..', '.vv..v..vv..', '..v..vv.v...', '......v.....', '............', '............'] };

  // ---------------------------------------------------------------- ROSCAMAR
  S.golem = { sym: true, pal: { d: '#4a4a52', s: '#6e6e78', l: '#9a9aa4', h: '#c8c8d0', g: '#5a8a3a', e: '#5ae0ff' }, rows: [
    '........', '........', '....ssss', '...slllh', '...sleel', '...sllll', '.ss.dsss', 'sslsdsll',
    'slhsdlll', 'sllsdlel', 'slls.dll', 'lll..dsl', '.l...dss', '....dss.', '...ddss.', '........'] };
  S.pipistrello = { sym: true, pal: { d: '#2a1a3a', p: '#4a2a6a', l: '#7a4a9a', e: '#ff3a3a', w: '#f0f0f0' }, rows: [
    '........', '........', '........', '........', '......p.', 'p.....pp', 'pp...ppp', 'lpp.pepp',
    'llppppwp', 'lllpppp.', '.llp.pp.', '..l..p..', '........', '........', '........', '........'] };
  S.talpa = { sym: true, pal: { b: '#4a2e20', n: '#7a5a40', l: '#a08060', p: '#ff9ab0', c: '#e8e8d8', e: '#101010' }, rows: [
    '........', '........', '........', '.....nnn', '...nnnnn', '..nnnenl', '..nnnnlp', '.nnnnnll',
    'cnbnnnll', 'ccbnnnnl', 'c.bbnnnn', '...bbnnn', '...bb.bn', '..cc..cc', '........', '........'] };
  S.minatore = { pal: { h: '#8a7a3a', y: '#ffe27a', s: '#2a1a2a', e: '#ff5a3a', c: '#4a3a5a', l: '#7a6a90', b: '#3a2a20', n: '#9a7a50', g: '#b0b0c0' }, rows: [
    '................', '................', '......hhhh......', '.....hhyyhh.....', '.....hhhhhh.....', '......sees......',
    '......ssss...gg.', '.....cccccc.gn..', '....cclllccng...', '....c.lccl.n....', '....s.cccc.n....', '......cccc.n....',
    '......c..c......', '......b..b......', '.....bb..bb.....', '................'] };
  S.ombra = { sym: true, pal: { d: '#1a0a2a', p: '#3a1a5a', v: '#6a3a9a', e: '#ff5aff' }, rows: [
    '........', '........', '........', '......dd', '.....dpp', '....dppp', '...dpepp', '...dpppp',
    '..dppvpp', '.dppvppp', 'd.dpppvp', '..dp.ppd', '.d.dp.pd', 'd...d..d', '......d.', '........'] };
  S.colosso = { sym: true, pal: { c: '#3a8ab0', l: '#7ad8ff', w: '#e0f8ff', d: '#1a4a6a', e: '#ffffff', p: '#b07aff' }, rows: [
    '........', '.w......', '.lw...l.', '..lw.cll', '..llccwl', '...ccelc', '.l.cclll', 'lll.dccc',
    'lwlcdccl', 'lllcdcpl', 'cc.cdccc', 'cc..dccl', '.....dcc', '....dcc.', '...ddcc.', '........'] };
  S.obscurio = { sym: true, size: 24, pal: { k: '#0a0610', d: '#1a1028', p: '#3a2058', v: '#6a3aa0', l: '#a070e0', e: '#ff4aff', g: '#c0c0d0', r: '#a01a3a' }, rows: [
    '............', '......d.....', '......dd....', '.......d.ddd', '.......ddppp', '........dppp', '........pkkk', '........pkek',
    '........pkkk', '......dddpgp', '....ddpvvpgp', '...dppvvlvpv', '..dpvvlvvvpv', '..dpvl.vvvpp', '.dpvvl.vvrvp', '.dpvv..vvrrv',
    '.dpv...vvvvv', 'dppv...pvvvv', 'dpvv...pvvpv', 'dpv....pv.pv', 'dp.....pv.pv', 'd......dd.dd', '............', '............'] };
  S.clone = { base: 'obscurio', size: 24, pal: { k: '#000000', d: '#0a0612', p: '#1a1030', v: '#2a1a4a', l: '#4a3a7a', e: '#ff4aff', g: '#505060', r: '#401020' } };

  // ---------------------------------------------------------------- CIELI
  S.arpia = { sym: true, pal: { b: '#6a4a3a', n: '#9a7a5a', l: '#c8a888', f: '#f0d0b0', e: '#ff3a3a', h: '#3a2030', y: '#ffd23a' }, rows: [
    '........', '........', '......hh', '.....hhf', 'b...hfef', 'nb..hfff', 'nnb..ffl', 'lnnb.lnn',
    '.lnnbnnn', '..lnnbnn', '...lnnbn', '....l.bn', '......nn', '......y.', '.....y..', '........'] };
  S.spiritovento = { sym: true, pal: { w: '#ffffff', c: '#c0f0ff', b: '#7ac0e0', e: '#2a6aa0' }, rows: [
    '........', '........', '....cccc', '...cwwww', '..cwwwcc', '..cwwecw', '.bcwwwww', '.bccwwcc',
    '..bbccww', '...bbcww', 'c...bccw', '.c..bbcc', '..c..bbc', '...c..bb', '....cc..', '........'] };
  S.gargolla = { sym: true, pal: { d: '#3a3a42', s: '#5a5a66', l: '#8a8a96', e: '#ff5a2a' }, rows: [
    '........', '...d....', '...dd.d.', '....dsss', 's...sels', 'ss..ssss', 'lss.dsls', 'llss.dss',
    '.llssdls', '..lsdsss', '...sdsls', '...ssdss', '..ss.dss', '..dd..dd', '........', '........'] };
  S.folgoratore = { sym: true, pal: { b: '#2a3a8a', l: '#4a6ad0', c: '#a0d0ff', y: '#ffe27a', w: '#ffffff', e: '#ffff8a' }, rows: [
    '........', '....y..y', '.....y.y', '.....bbb', '....blll', '....bell', '....bllc', 'y..bbbll',
    '.yybllcc', '..ybllcl', '...bllcl', '....bllc', '....blll', '.....bll', '......c.', '........'] };
  S.grifone = { pal: { y: '#d0a040', o: '#a07020', w: '#f4f0e8', b: '#7a5030', e: '#101010', a: '#ffb030' }, rows: [
    '................', '................', '............ww..', '..bb.......wwea.', '.bbbb......www..', '..bbbbb...ywww..',
    '...bbbbb.yyw....', '....bbbbyyyy....', '..yyyyybyyyy....', '.yyyyyyyyyyy....', 'y.yyyooyyyoy....', '..yy.o...y.y....',
    '..o..o...o..o...', '................', '................', '................'] };
  S.mystral = { base: 'noctis', pal: { w: '#9ab0c0', a: '#5a7a8a', s: '#3a4a6a', b: '#2a2a4a', y: '#b07aff', e: '#ff4aff' } };
  S.devilfenix = { sym: true, size: 24, pal: { d: '#5a1010', r: '#c02a1a', o: '#ff6a1a', y: '#ffc83a', w: '#fff2b0', e: '#ffffff' }, rows: [
    '............', '...........y', '..........yo', '..........oo', '.........ooo', 'r........oer', 'or.......oow', 'yor.....rroo',
    'yyorr..rrooo', '.yyoorrrrooy', '..yyoorrooyy', '...yyoorooyw', '....yyooooyw', '.....yyyooyy', '......yyroyy', '.......rroyy',
    '......rr.oyy', '.....rr..ooy', '....r....o.y', '.........o..', '..........o.', '............', '............', '............'] };
  S.uovo = { sym: true, pal: { o: '#ff8a2a', y: '#ffd06a', w: '#fff2c0', r: '#c02a1a' }, rows: [
    '........', '........', '........', '......yy', '.....yww', '....yyww', '....yyyw', '...oyyyy',
    '...oyryy', '...ooyry', '...ooyyr', '...ooyyy', '....ooyy', '.....ooo', '........', '........'] };

  // ---------------------------------------------------------------- VULCANO
  S.salamandra = { pal: { r: '#8a2010', o: '#e0501a', y: '#ffb03a', e: '#ffe27a' }, rows: [
    '................', '................', '................', '................', '................', '................',
    '................', '..........ooo...', '.........oooeo..', 'rr.....ooooooo..', '.rrooooyoyoo....', '..rroooooooo....',
    '....o.o..o.o....', '...o..o...o.o...', '................', '................'] };
  S.guerriero = { sym: true, pal: { d: '#2a1a1a', s: '#4a3030', l: '#6a4a40', o: '#ff6a1a', y: '#ffc83a' }, rows: [
    '........', '...d....', '...dd.ss', '....ssss', '....sdoo', '....ssss', '.ss.dsls', 'sllsdslo',
    'slosdsoy', 'sls.dslo', 'ss..dsss', 'oo..dsls', '.o...dss', '.....ds.', '....dds.', '........'] };
  S.bombo = { sym: true, pal: { d: '#2a1a1a', b: '#4a3030', l: '#6a4a4a', o: '#ff6a1a', y: '#ffe27a', e: '#ff3a1a' }, rows: [
    '........', '........', '.......y', '.......o', '......dd', '....bbbb', '...bblll', '..bbllll',
    '..bbleel', '..bbbbll', '..bbbobb', '...bbbbb', '....bbbb', '........', '........', '........'] };
  S.sacerdote = { sym: true, pal: { r: '#7a1a1a', o: '#c03a1a', y: '#ffb03a', f: '#ffe27a', s: '#2a0a0a', e: '#ffe27a', g: '#d0a040' }, rows: [
    '.......f', '......fy', '......yo', '.....rrr', '....rooo', '....rsss', '....rses', '....rsss',
    '...rrogo', '..rroogo', '.y.rooog', '.f.roooo', '...roooo', '..rrrooo', '..rrrrrr', '........'] };
  S.lavico = { base: 'lupo', pal: { d: '#3a1010', b: '#a02a1a', l: '#ff6a1a', w: '#ffc83a', e: '#ffe27a', k: '#120d18' } };
  S.lavion = { base: 'golem', pal: { d: '#3a1010', s: '#6a2018', l: '#c04a1a', h: '#ff9a2a', g: '#ffc83a', e: '#ffffff' } };
  S.magmion = { sym: true, size: 24, pal: { d: '#2a1010', s: '#4a2020', l: '#7a3a2a', o: '#ff6a1a', y: '#ffc83a', w: '#fff0a0' }, rows: [
    '............', '.......d....', '......ds....', '......dss.ss', '.......sssss', '........slll', '........slyl', '........ssss',
    '....ss.dsooo', '...slls.dsss', '..sllllsdsll', '..slolls.sll', '..sllllsdslo', '...slls.dsoy', '...sooodsloy', '...syyo.dsoo',
    '....oo..dsll', '........dsss', '.......dss.s', '.......dss.s', '......dss..s', '......ddd..d', '............', '............'] };
  S.magor = { sym: true, size: 24, pal: { k: '#0a0608', d: '#2a0a14', p: '#4a1a2a', r: '#8a1a2a', o: '#ff4a1a', y: '#ffc83a', e: '#ff2a2a', g: '#b09a7a' }, rows: [
    '............', '..g.......y.', '..gg.....yo.', '...gg...ooyo', '....gg.dpppp', 'd....gdppppp', 'dd....dpkkkk', 'pdd...dpkeek',
    'ppdd..dpkkkk', 'pppdd.dpkoko', 'rpppddddpppp', 'rrppprdpprrp', '.rrppprdprrr', '..rrpprddpro', '...rrprdpprr', '....rrrdppro',
    '.....r.dpprr', '.......dpprp', '.......dppdp', '......dpp.dp', '......dpp.dp', '.....ddd..dd', '............', '............'] };
  S.germoglio = { sym: true, pal: { g: '#3fa03a', l: '#8be06a', b: '#6a4a2a', n: '#9a6a3a', e: '#ffffff' }, rows: [
    '........', '........', '.....l..', '...lllg.', '..llglll', '..lglgll', '...gglgg', '.....bnn',
    '....bnen', '..l.bnnn', '..lbbnnb', '....bnnb', '....bnb.', '...bb.b.', '........', '........'] };

  // ---------------------------------------------------------------- ELEMENTI DI SCENA
  S.chest = { sym: true, pal: { b: '#5a3a1a', n: '#8a5a2a', l: '#b0803a', y: '#ffd23a', d: '#3a2410' }, rows: [
    '........', '........', '........', '........', '........', '..bbbbbb', '.bnnlnnn', '.bnnnnnn',
    '.ddddddy', '.bnnnnyy', '.bnnnnnn', '.bnnnnnn', '.ddddddd', '........', '........', '........'] };
  S.chest_rare = { base: 'chest', pal: { b: '#3a1a5a', n: '#6a3aa0', l: '#a070e0', y: '#ffe27a', d: '#ffb83a' } };
  S.merchant = { pal: { g: '#3fa03a', l: '#7ad05a', d: '#2a6a2a', w: '#ffffff', e: '#101010', b: '#a0703a', y: '#ffd23a' }, rows: [
    '................', '................', '.........lll....', '........lllll...', '........llwel...', '........llllll..',
    '...bb...lllwww..', '..bbyb.gll......', '..bbbbgglll.....', '..bbbbgllll.....', 'g..bbgglll.l....', '.g.ggglll.......',
    '..gggglll.......', '.....g..g.......', '....gg..gg......', '................'] };
  S.shrine_fonte = { sym: true, pal: { s: '#7a7a8a', l: '#a0a0b0', b: '#3a8ad0', c: '#8ad8ff', w: '#ffffff' }, rows: [
    '........', '........', '.......c', '......cw', '.....c.c', '....c..s', '...c..ls', '.....lls',
    '.sssssss', 'slbbbccc', 'slbcbbcw', '.slllsll', '...slls.', '..ssssss', '........', '........'] };
  S.shrine_sangue = { pal: { s: '#4a3a3a', l: '#6a5a5a', r: '#c01a2a', y: '#ffe27a', o: '#ff8a2a', w: '#e0d0b0' }, rows: [
    '................', '................', '................', '..y.........y...', '..o.........o...', '..w.........w...',
    '..w.........w...', '.llllllllllllll.', '.lsrrrrrrrrrrsl.', '.lssrrrrrrrrssl.', '..lssssssssssl..', '...ls.ssss.sl...',
    '...ls.ssss.sl...', '..llllllllllll..', '................', '................'] };
  S.shrine_saggio = { sym: true, pal: { s: '#8a8a90', l: '#b0b0b8', d: '#5a5a62', e: '#5ae0ff' }, rows: [
    '........', '.....sss', '....slll', '....sdes', '....sddd', '...ssdll', '...sslll', '..sslsll',
    '..slssll', '..slllsl', '..ssllll', '...sllll', '.ddddddd', '.dssssss', '.ddddddd', '........'] };
  S.shrine_totem = { sym: true, pal: { b: '#5a3a1a', n: '#8a5a2a', r: '#ff4a1a', g: '#5ae05a', c: '#4ab0ff', y: '#ffe27a', e: '#ffffff' }, rows: [
    '........', '......yy', '.....nnn', '....nene', '....nnnn', '.r..bbbb', '.rr.nnnn', '..rrncnc',
    '....nnnn', '....bbbb', '....ngng', '....nnnn', '....nnnn', '..bbbbbb', '........', '........'] };

  // ---------------------------------------------------------------- OGGETTI
  S.potion = { sym: true, pal: { b: '#8a5a2a', g: '#c0d8e8', w: '#ffffff' }, rows: [
    '........', '........', '........', '......bb', '......bb', '......gg', '.....gwc', '....gwcc',
    '...gcccc', '...gcccc', '...gcccc', '....gccc', '.....ggg', '........', '........', '........'] };
  S.bigpotion = { sym: true, pal: { b: '#8a5a2a', g: '#c0d8e8', w: '#ffffff' }, rows: [
    '........', '........', '......bb', '......bb', '......gg', '....ggwc', '...gwccc', '..gwcccc',
    '..gccccc', '..gccccc', '..gccccc', '...gcccc', '....gggg', '........', '........', '........'] };
  S.fruit = { pal: { n: '#7a5a2a', g: '#4ab03a', w: '#ffffff' }, rows: [
    '................', '................', '........n.......', '.......ngg......', '....cccncccc....', '...cwcccccccc...',
    '...cwcccccccc...', '...cccccccccc...', '...cccccccccd...', '....cccccccd....', '.....ccddcd.....', '................',
    '................', '................', '................', '................'] };
  S.bomb = { sym: true, pal: { d: '#3a3a4a', w: '#8a8aa0', y: '#ffe27a', n: '#c08a3a' }, rows: [
    '........', '........', '.......y', '.......n', '......dd', '.....ddd', '....dddd', '...ddwdd',
    '...dwddd', '...ddddd', '...ddddd', '....dddd', '.....ddd', '........', '........', '........'] };
  S.flask = { sym: true, pal: { g: '#c0d8e8', w: '#ffffff' }, rows: [
    '........', '........', '........', '......gg', '......gg', '......gc', '.....gcc', '.....gcc',
    '....gccc', '...gcccc', '...gcwcc', '...ccccc', '...ggggg', '........', '........', '........'] };
  S.scroll = { pal: { w: '#f0e0b0', d: '#a08050' }, rows: [
    '................', '................', '................', '................', '..dddddddddd....', '..dcwwwwwwwwd...',
    '...dwccwccwwd...', '...dwwwwwwwwd...', '...dwcccwwcwd...', '...dwwwwwwwwd...', '....dddddddddd..', '................',
    '................', '................', '................', '................'] };
  S.gold = { pal: { c: '#5ad8ff', w: '#ffffff', d: '#2a7ab0' }, rows: [
    '................', '................', '................', '................', '................', '................',
    '................', '......c.........', '.....cw...c.....', '.....cc..cw.....', '....dcc.dcc.....', '....dcdcdccc....',
    '...ddddddddd....', '................', '................', '................'] };
  S.pietra = { sym: true, pal: { c: '#ffd23a', w: '#ffffff', d: '#c08a1a' }, rows: [
    '........', '........', '......ww', '.....wcc', '....wccc', '...wcccc', '..wccccc', '..cccccc',
    '..cccccc', '..dccccc', '...dcccc', '....dccc', '.....dcc', '......dd', '........', '........'] };

  // ---------------------------------------------------------------- ICONE RELIQUIE (c=colore, d=scuro, w=chiaro)
  const RI = G.RELIC_ICON_DEFS = {};
  RI.gem = { sym: true, rows: ['........', '........', '........', '........', '.....ccc', '....cwcc', '...cwccc', '...ccccc', '....cccd', '.....ccd', '......cd', '.......d', '........', '........', '........', '........'] };
  RI.ring = { sym: true, pal: { g: '#ffd23a' }, rows: ['........', '........', '........', '......cc', '.....cwc', '....gggg', '...g....', '..g.....', '..g.....', '..g.....', '...g....', '....gggg', '........', '........', '........', '........'] };
  RI.amulet = { sym: true, pal: { g: '#ffd23a' }, rows: ['........', '........', '..g.....', '...g....', '....g...', '.....g..', '......gg', '.....ccc', '....cwcc', '....cccc', '.....ccd', '......dd', '........', '........', '........', '........'] };
  RI.feather = { rows: ['................', '................', '...........cc...', '..........cwc...', '.........cwcc...', '........cwcc....', '.......cwcc.....', '......cwcc......', '.....cwcc.......', '....cwcc........', '...cwcc.........', '...ccc..........', '..d.............', '.d..............', '................', '................'] };
  RI.claw = { rows: ['................', '................', '................', '......ww........', '.......wc.......', '........cc......', '........ccc.....', '........cccc....', '.......ccccc....', '......cccccd....', '.....ccccdd.....', '....dddddd......', '................', '................', '................', '................'] };
  RI.shield = { sym: true, rows: ['........', '........', '........', '...ddddd', '...dcccc', '...dcwcc', '...dcccc', '...dcccc', '....dccc', '....dccc', '.....dcc', '......dd', '........', '........', '........', '........'] };
  RI.glove = { sym: true, rows: ['........', '........', '........', '........', '....cc.c', '....cccc', '...ccccc', '...cwccc', '...ccccc', '....cccc', '....dddd', '....dwdd', '....dddd', '........', '........', '........'] };
  RI.bag = { sym: true, rows: ['........', '........', '........', '.....d.d', '......dd', '.....ccc', '....cccc', '...ccwcc', '...ccccc', '...ccccc', '...ccccc', '....cccc', '........', '........', '........', '........'] };
  RI.shell = { sym: true, rows: ['........', '........', '........', '........', '.....ccc', '...ccwcd', '..cdcwcd', '..cdcwcd', '..cdccdc', '...cdcdc', '....ccdc', '......dd', '........', '........', '........', '........'] };
  RI.flask = { sym: true, rows: ['........', '........', '........', '......dd', '......ww', '......wc', '.....wcc', '.....wcc', '....wccc', '...wcccc', '...ccccc', '...ddddd', '........', '........', '........', '........'] };
  RI.eye = { sym: true, rows: ['........', '........', '........', '........', '........', '....dddd', '...dwwww', '..dwwccc', '..dwwcdd', '...dwwww', '....dddd', '........', '........', '........', '........', '........'] };
  RI.compass = { sym: true, pal: { d: '#8a6a3a', w: '#f0e8d0', c: '#e03a3a', k: '#3a3a4a' }, rows: ['........', '........', '........', '.....ddd', '....dwww', '...dwwwc', '...dwwwc', '...dwwwk', '...dwwwk', '....dwww', '.....ddd', '........', '........', '........', '........', '........'] };
  RI.book = { rows: ['................', '................', '................', '...dddddddddd...', '...dccccccccw...', '...dcwwwwwccw...', '...dccccccccw...', '...dcwwwwcccw...', '...dccccccccw...', '...dccccccccw...', '...dddddddddd...', '................', '................', '................', '................', '................'] };
  RI.cloak = { sym: true, rows: ['........', '........', '........', '......cc', '.....cdd', '....ccdd', '....cccc', '...ccccc', '...cwccc', '..ccwccc', '..cccccc', '..dccdcc', '........', '........', '........', '........'] };
  RI.crown = { sym: true, pal: { r: '#e03a3a' }, rows: ['........', '........', '........', '........', '...w...w', '...c..cc', '...cc.cc', '...ccccc', '...cwcrc', '...ccccc', '...ddddd', '........', '........', '........', '........', '........'] };
  RI.heart = { sym: true, rows: ['........', '........', '........', '........', '...cc...', '..cwcc..', '..cwcccc', '..cccccc', '...ccccc', '....cccc', '.....ccc', '......cc', '.......c', '........', '........', '........'] };
  RI.root = { sym: false, pal: { g: '#5ae05a' }, rows: ['................', '................', '.......gg.......', '......gggg......', '.......c........', '.......cc.......', '......ccc.......', '....c.cccc......', '.....ccccc.c....', '...c.cccdcc.....', '....ccdcd.cc....', '...c..d..d..c...', '..c...d...d.....', '................', '................', '................'] };
  G.RELIC_ICON_MAP = {
    root: 'root', claw: 'claw', scale: 'shield', feather: 'feather', glove: 'glove', fang: 'claw', totem: 'root', bag: 'bag', seed: 'root',
    shell: 'shell', flask: 'flask', eye: 'eye', shieldr: 'shield', compass: 'compass', necklace: 'amulet', spore: 'root', hourglass: 'flask',
    map: 'book', gem: 'gem', amulet: 'amulet', flint: 'gem', ring: 'ring', cloak: 'cloak', helm: 'crown', lens: 'eye', book: 'book',
    chalice: 'flask', heart: 'heart', drop: 'heart', crown: 'crown', horn: 'claw', pearl: 'gem', drum: 'bag',
  };

  // ---------------------------------------------------------------- DECORAZIONI (senza contorno)
  const blank = () => Array(16).fill('................');
  function deco(rowsAt) { const r = blank(); for (const k in rowsAt) r[k] = rowsAt[k]; return r; }
  G.DECO_DEFS = {
    1: { pal: { s: '#6a6a70', l: '#9a9aa0' }, rows: deco({ 9: '..........ss....', 10: '...ss....sls....', 11: '..slss....s.....', 12: '...ss...........' }) },
    2: { pal: { y: '#ffe25a', w: '#ffffff', r: '#ff6a9a', g: '#3f8a2a' }, rows: deco({ 8: '....y......r....', 9: '...ywy....rwr...', 10: '....y......r....', 11: '....g......g....', 12: '...gg.....gg....' }) },
    3: { pal: { r: '#d03a3a', w: '#ffffff', p: '#b07ad0', s: '#e0d0b0' }, rows: deco({ 9: '.........rr.....', 10: '........rwrr....', 11: '...pp.....s.....', 12: '..pwpp....s.....', 13: '...s............' }) },
    4: { pal: { w: '#e8e0d0' }, rows: deco({ 10: '...w.......w....', 11: '....wwwwwww.....', 12: '...w.......w....' }) },
    5: { pal: { p: '#ffb0c0', w: '#ffffff', o: '#ffd0a0' }, rows: deco({ 10: '....pp..........', 11: '...pwpp.....oo..', 12: '....pp.....owo..' }) },
    6: { pal: { g: '#2a8a5a' }, rows: deco({ 6: '......g.........', 7: '.....g..........', 8: '......g...g.....', 9: '.....gg..g......', 10: '......g...g.....', 11: '.....g...gg.....', 12: '.....gg...g.....', 13: '......g..g......' }) },
    7: { pal: { c: '#7ad8ff', w: '#e0f8ff' }, rows: deco({ 8: '...........c....', 9: '....c......cw...', 10: '...cw.....ccw...', 11: '...cc.....cc....' }) },
    8: { pal: { w: '#e8f0ff' }, rows: deco({ 9: '.......w........', 10: '......w.w.......', 11: '.....w...w......' }) },
    9: { pal: { o: '#ff7a2a', y: '#ffd23a' }, rows: deco({ 9: '....o...........', 10: '.........y......', 11: '..o.....o.......', 12: '.......o....o...' }) },
    10: { pal: { n: '#5a3a1e' }, rows: deco({ 10: '..nn.......n....', 11: '...nnn...nn.....', 12: '.....nnnnn......' }) },
    11: { pal: { w: '#e8e0d0', k: '#2a2020' }, rows: deco({ 8: '......www.......', 9: '.....wwwww......', 10: '.....kwkww......', 11: '......www.......' }) },
  };

  // ============================================================
  //  Costruzione delle immagini
  // ============================================================
  const OUTLINE = '#0c0812';
  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function shade(hex, f) {
    const [r, g, b] = hexToRgb(hex);
    const t = (v) => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f))));
    return '#' + [t(r), t(g), t(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  G.shade = shade;

  function expand(def) {
    let rows = def.rows;
    if (def.base) { let b = S[def.base]; while (b.base) b = S[b.base]; rows = b.rows; def.sym = b.sym; }
    if (def.sym) rows = rows.map(r => r + r.split('').reverse().join(''));
    return rows;
  }
  G.validateSprites = function () {
    const errs = [];
    const check = (name, def) => {
      const rows = expand(Object.assign({}, def));
      const w = rows[0].length;
      rows.forEach((r, i) => { if (r.length !== w) errs.push(name + ' riga ' + i + ' lunghezza ' + r.length + ' != ' + w); });
      let bd = def; while (bd.base && !bd.size) bd = S[bd.base];
      const size = def.size || bd.size || 16;
      if (rows.length !== size || w !== size) errs.push(name + ' dimensioni ' + w + 'x' + rows.length + ' attese ' + size);
    };
    for (const k in S) check(k, S[k]);
    for (const k in RI) check('relic:' + k, RI[k]);
    for (const k in G.DECO_DEFS) check('deco:' + k, G.DECO_DEFS[k]);
    return errs;
  };

  function makeCanvas(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }
  function render(rows, pal, outline) {
    const h = rows.length, w = rows[0].length;
    const c = makeCanvas(w, h), ctx = c.getContext('2d');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ') continue;
      ctx.fillStyle = pal[ch] || DEF_PAL[ch] || '#ff00ff';
      ctx.fillRect(x, y, 1, 1);
    }
    if (outline) {
      const id = ctx.getImageData(0, 0, w, h), d = id.data;
      const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0 && !d[(y * w + x) * 4 + 3] !== 0;
      const filled = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) filled[i] = d[i * 4 + 3] > 0 ? 1 : 0;
      const [orr, og, ob] = hexToRgb(OUTLINE);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (filled[y * w + x]) continue;
        let n = false;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && filled[ny * w + nx]) n = true; }
        if (n) { const i = (y * w + x) * 4; d[i] = orr; d[i + 1] = og; d[i + 2] = ob; d[i + 3] = 255; }
      }
      ctx.putImageData(id, 0, 0);
    }
    return c;
  }
  function silhouette(src, color) {
    const c = makeCanvas(src.width, src.height), ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color; ctx.fillRect(0, 0, c.width, c.height);
    return c;
  }
  function flipped(src) {
    const c = makeCanvas(src.width, src.height), ctx = c.getContext('2d');
    ctx.translate(src.width, 0); ctx.scale(-1, 1); ctx.drawImage(src, 0, 0);
    return c;
  }

  G.renderPixelRows = render;
  G.SPR = {};
  G.buildSprites = function () {
    for (const name in S) {
      const def = S[name];
      const rows = expand(Object.assign({}, def));
      const img = render(rows, def.pal || {}, true);
      G.SPR[name] = { img, flip: flipped(img), flash: silhouette(img, '#ffffff'), w: img.width, h: img.height };
    }
    G.SPR_DECO = {};
    for (const k in G.DECO_DEFS) G.SPR_DECO[k] = render(G.DECO_DEFS[k].rows, G.DECO_DEFS[k].pal, false);
  };

  // oggetti/reliquie colorati (cache)
  const tintCache = {};
  G.itemSprite = function (iconName, color) {
    const key = iconName + color;
    if (tintCache[key]) return tintCache[key];
    let def = S[iconName] || RI[iconName] || RI[G.RELIC_ICON_MAP[iconName]] || RI.gem;
    const rows = expand(Object.assign({}, def));
    const pal = Object.assign({ c: color, d: shade(color, -0.45), w: shade(color, 0.6) }, def.pal || {});
    if (def.pal && def.pal.c === undefined) pal.c = color;
    const img = render(rows, pal, true);
    tintCache[key] = img;
    return img;
  };
})();

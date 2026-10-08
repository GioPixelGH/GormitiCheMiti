'use strict';
// ============================================================
//  icons.js : icone pixel delle abilità (16x16).
//  c = colore dell'elemento, w = luce, d = ombra.
// ============================================================
(function () {
  const pad = (rows, sym) => { const w = sym ? 8 : 16; const out = rows.slice(); while (out.length < 16) out.push('.'.repeat(w)); return out; };
  const S = (rows) => ({ sym: true, rows: pad(rows, true) });
  const A = (rows) => ({ sym: false, rows: pad(rows, false) });
  const I = G.SKILL_ICON_DEFS = {
    fist: S(['........', '........', '........', '...c.c.c', '..cwcwcw', '..cccccc', '..cccccc', '..cccccc', '...ccccc', '....cccc', '....dddd', '....dddd']),
    arrow: A(['................', '..........wwww..', '...........www..', '..........cwcw..', '.........ccc.w..', '........ccc.....', '.......ccc......', '......ccc.......', '.....ccc........', '....ccc.........', '...ddd..........', '..dd............', '.d..............']),
    shield: S(['........', '...ddddd', '..dccccc', '..dcwccc', '..dcwccc', '..dccccc', '..dccccc', '...dcccc', '...dcccc', '....dccc', '.....dcc', '......dd']),
    quake: S(['........', '........', '..c..c..', '.......c', '........', 'dddddddd', 'ccccccc.', 'cccccc.c', 'ccccc.cc', 'cccccc.c', 'dddddd.d']),
    roots: A(['................', '................', '.......c........', '......cc....c...', '..c...c....cc...', '..cc..cc...c....', '...c..cc..cc....', '...cc.ccc.c.....', '....ccccccc.....', '.....ccccc......', '....dd.d.dd.....', '...d..d...d.....', '..d...d....d....']),
    thorns: S(['........', '.......c', '..c....c', '...c..cc', '....cccc', '..ccccdd', '...ccd..', '.cccd...', '...ccd..', '..ccccdd', '....cccc', '...c..cc', '..c....c', '.......c']),
    cross: S(['........', '........', '......cc', '......cw', '......cw', '......cw', '..cccccw', '..cwwwww', '..cwwwww', '..cccccw', '......cw', '......cw', '......cw', '......cw', '......cc']),
    tree: S(['........', '......cc', '....cccc', '...ccwcc', '..cccccc', '..ccwccc', '..cccccc', '...ccccc', '....cccc', '......dd', '......dd', '......dd', '....dddd']),
    drop: S(['........', '........', '.......c', '.......c', '......cc', '......cc', '.....ccc', '....cwcc', '....cwcc', '....cccc', '....cccc', '.....ccc', '......dd']),
    wave: A(['................', '................', '........cccc....', '......ccwwwcc...', '.....cw....cc...', '....cw.....c....', '...cw...........', '..cc......cc....', '.cc.....ccwwc...', 'cc....ccw...cc..', '....ccw......c..', 'dddddddddddddddd']),
    bubble: S(['........', '........', '........', '.....ccc', '....c...', '...cw...', '..cw....', '..c.....', '..c.....', '..c.....', '...c....', '....c...', '.....ccc']),
    tsunami: A(['................', '.......cccc.....', '.....ccwwwwcc...', '....cwccccccwc..', '...cwc.....ccc..', '..cwc.......c...', '..cc............', '.cc.......c.....', '.cc.....ccc.....', 'cc....cccc......', 'ccccccccc.......', 'dddddddddddddddd']),
    dash: A(['................', '................', '..........c.....', '..........cc....', '.wwww.cccccwc...', '..........ccwc..', '.www.cccccccccc.', '..........ccwc..', '.wwww.cccccwc...', '..........cc....', '..........c.....']),
    bolt: A(['................', '.........cccc...', '........cwcc....', '.......cwcc.....', '......cwcc......', '.....cwcccccc...', '....cccccwcc....', '.......cwcc.....', '......cwcc......', '.....cwc........', '....cwc.........', '....cc..........', '...c............']),
    cyclone: A(['................', '.....cccccc.....', '...cc......cc...', '..c...cccc...c..', '..c..c....c..c..', '..c..c..w.c..c..', '..c..c...cc..c..', '..c...c......c..', '...c...cccccc...', '....cc..........', '......ccccc.....']),
    storm: S(['........', '........', '.....ccc', '...ccccc', '..cwwccc', '.ccccccc', '.ccccccc', '..dddddd', '...y....', '..yy....', '...y....', '..y.....']),
    star: S(['........', '.......c', '.......c', '......cc', '......cw', '.....ccw', '..ccccww', 'cccwwwww', '..ccccww', '.....ccw', '......cw', '......cc', '.......c', '.......c']),
    portal: S(['........', '........', '.....ccc', '...ccddd', '..cdd...', '.cd..w..', '.cd.w...', 'cd..w...', 'cd...w..', '.cd..ww.', '.cd.....', '..cdd...', '...ccddd', '.....ccc']),
    seal: S(['........', '........', '.....ccc', '...cc...', '..c...c.', '..c..ccc', '.c..cccw', '.c.ccwww', '.c..cccw', '..c..ccc', '..c...c.', '...cc...', '.....ccc']),
    eye: S(['........', '........', '........', '........', '........', '....dddd', '...dwwww', '..dwwccc', '..dwwcdd', '...dwwww', '....dddd']),
    sun: S(['........', '.......c', '..c....c', '...c...c', '.....ccc', '....cwww', '...cwwww', 'cccwwwww', '...cwwww', '....cwww', '.....ccc', '...c...c', '..c....c', '.......c']),
    flash: S(['........', '.......w', '.c.....w', '..c...cw', '...c..cw', '....c.cw', '.....ccw', 'wwwwwwww', '.....ccw', '....c.cw', '...c..cw', '..c...cw', '.c.....w', '.......w']),
    prism: S(['........', '........', '.......c', '......cw', '.....cww', '....cwwc', '...cwwcc', '..cwwccc', '..dccccc', '...dcccc', '....dccc', '.....dcc', '......dc', '.......d']),
    nova: S(['........', 'c......c', '.c.....c', '..c..c.c', '...c.ccc', '....cwww', '..ccwwww', 'cccwwwww', '..ccwwww', '....cwww', '...c.ccc', '..c..c.c', '.c.....c', 'c......c']),
    hammer: A(['................', '..cccccccccc....', '..cwwwwwwwwc....', '..cccccccccc....', '..dddddddddd....', '......dd........', '......dd........', '......dd........', '......dd........', '......dd........', '......dd........', '.....dddd.......']),
    wall: S(['........', '........', '........', 'dddddddd', 'cccdcccc', 'cwcdcwcc', 'dddddddd', 'cdcccdcc', 'cdcwcdcw', 'dddddddd', 'cccdcccc', 'cwcdcwcc', 'dddddddd']),
    shout: S(['........', '........', '........', '.c......', 'c..c....', 'c.c..c..', 'c.c.c.cc', 'c.c.c.cw', 'c.c.c.cw', 'c.c.c.cc', 'c.c..c..', 'c..c....', '.c......']),
    boulders: S(['........', '........', '........', '.....ccc', '....cwcc', '....cccc', '.....dd.', '........', '.ccc....', 'cwccc...', 'ccccc...', '.ddd....']),
    pincer: A(['................', '...cccc.........', '..cwwccc........', '.cw...ccc.......', '.c.....cc.......', '.cc....ccc......', '..cc..ccccc.....', '...cccccccdd....', '....cccccdddd...', '.....ddddddddd..', '..........dddd..']),
    shell: S(['........', '........', '........', '........', '.....ccc', '...ccwcd', '..cdcwcd', '..cdcwcd', '..cdccdc', '...cdcdc', '....ccdc', '......dd']),
    tide: A(['................', '................', '.....cc.....cc..', '...cc..cc.cc..cc', '.cc.....c.......', '................', '.....cc.....cc..', '...cc..cc.cc..cc', '.cc.....c.......', '................', '.....cc.....cc..', '...cc..cc.cc..cc', '.cc.....c.......']),
    arrow2: A(['................', '................', '................', '.c.c............', '..c.c.......c...', '.cccccccccccwc..', '..c.c.......c...', '.c.c............']),
    fan: S(['........', '........', '.c.....c', '.cc....c', '..cc...c', '..ccc..c', '...ccc.c', '....ccwc', '.....cwc', '......ww', '......dd', '......dd']),
    updraft: S(['........', '........', '.......c', '......cw', '.....cww', '....cccw', '.c....cw', 'cc....cw', '.c....cw', '......cw', '.c....cw', 'cc....cw', '.c....cc']),
    wolf: A(['................', '...c.c..........', '...cccc.........', '..ccwccc........', '..cccccccc......', '..ccccccccww....', '...ccccccw......', '...cccc.........', '..ccccc.........', '.cccccc.........']),
    flower: S(['........', '........', '........', '.....cc.', '...c.cc.', '...ccwyy', '....cyyy', '...ccwyy', '...c.cc.', '.....cc.', '.......g', '.....g.g', '......gg', '.......g']),
    bees: A(['................', '...ww.....ww....', '..wcdc...wcdc...', '...cdc....cdc...', '................', '.......ww.......', '......wcdc......', '.......cdc......']),
  };
  // palette fisse per alcune icone
  I.storm.pal = { y: '#ffe27a' };
  I.flower.pal = { y: '#ffe27a', g: '#4ab03a' };
  I.bees.pal = { c: '#ffd23a', d: '#1a1410', w: '#e8f8ff' };

  G.SKILL_ICON = {
    pugno: 'fist', carica: 'arrow', scudoroccia: 'shield', terremoto: 'quake', radici: 'roots', spine: 'thorns', linfa: 'cross', risveglio: 'tree',
    getto: 'drop', onda: 'wave', bolla: 'bubble', maremoto: 'tsunami', raffica: 'dash', fulmine: 'bolt', vortice: 'cyclone', tempesta: 'storm',
    dardo: 'star', passo: 'portal', sigillo: 'seal', occhio: 'eye', raggio: 'sun', bagliore: 'flash', prisma: 'prism', supernova: 'nova',
    martello: 'hammer', muraglia: 'wall', sfida: 'shout', valanga: 'boulders', chela: 'pincer', guscio: 'shell', marea: 'tide', tsunami: 'tsunami',
    freccia: 'arrow2', ventaglio: 'fan', corrente: 'updraft', sole: 'sun', lupo_sp: 'wolf', fiore: 'flower', sciame: 'bees', guardiano: 'tree',
  };

  // immagine dell'icona di un'abilità (con cache)
  const cache = {};
  G.skillIcon = function (skillId) {
    if (cache[skillId]) return cache[skillId];
    const d = G.SKILLS[skillId];
    const def = I[G.SKILL_ICON[skillId]] || I.star;
    const color = (G.ELEMS[d.elem] || G.ELEMS.neutro).color;
    const pal = Object.assign({ c: color, d: G.shade(color, -0.45), w: G.shade(color, 0.65) }, def.pal || {});
    const rows = def.sym ? def.rows.map(r => r + r.split('').reverse().join('')) : def.rows;
    const img = G.renderPixelRows(rows, pal, true);
    cache[skillId] = img;
    return img;
  };
  G.validateIcons = function () {
    const errs = [];
    for (const k in I) {
      const rows = I[k].sym ? I[k].rows.map(r => r + r.split('').reverse().join('')) : I[k].rows;
      rows.forEach((r, i) => { if (r.length !== 16) errs.push('icona ' + k + ' riga ' + i + ': ' + r.length); });
      if (rows.length !== 16) errs.push('icona ' + k + ' righe ' + rows.length);
    }
    return errs;
  };
})();

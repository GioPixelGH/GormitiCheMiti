// Genera js/volti.js (sprite e ritratti dei personaggi) a partire da tools/pixel/disegni.js
// Uso: node tools/pixel/genera.js
const fs = require('fs'), path = require('path');
const { SPRITE, RITRATTI } = require('./disegni');

const riga = (s) => "'" + s + "'";
function blocco(nome, d) {
  const r = d.t.righe();
  const pal = Object.entries(d.pal).map(([k, v]) => `${k}: '${v}'`).join(', ');
  const size = r.length !== 16 ? `size: ${r.length}, ` : '';
  const righe = [];
  for (let i = 0; i < r.length; i += r.length > 24 ? 2 : 4) righe.push('    ' + r.slice(i, i + (r.length > 24 ? 2 : 4)).map(riga).join(', '));
  return `  ${JSON.stringify(nome).replace(/"/g, "'")}: { ${size}pal: { ${pal} }, rows: [\n${righe.join(',\n')}] },`;
}

let out = `'use strict';
// ============================================================
//  volti.js : i volti dell'era (GENERATO da tools/pixel/genera.js, non modificare a mano)
//  Sprite dei personaggi (16x16, boss 24x24) e ritratti 48x48, disegnati guardando
//  le carte originali. Per cambiarli: tools/pixel/disegni.js, poi node tools/pixel/genera.js
// ============================================================
(function () {
  Object.assign(G.SPRITE_DEFS, {
${Object.keys(SPRITE).map(n => blocco(n, SPRITE[n]())).join('\n')}
  });
  G.PORTRAIT_DEFS = {
${Object.keys(RITRATTI).map(n => blocco(n, RITRATTI[n]())).join('\n')}
  };
})();
`;
fs.writeFileSync(path.join(__dirname, '..', '..', 'js', 'volti.js'), out);
console.log('js/volti.js:', Object.keys(SPRITE).length, 'sprite,', Object.keys(RITRATTI).length, 'ritratti');

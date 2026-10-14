// Carica la logica del gioco (senza grafica né interfaccia) dentro Node, nello spazio globale G.
// I file sono letti da index.html nello stesso ordine del browser, saltando quelli che servono
// solo a disegnare o a gestire l'input: così i nuovi file di logica vengono inclusi da soli.
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');
const SOLO_BROWSER = new Set(['sprites.js', 'sprites2.js', 'icons.js', 'tiles.js', 'render.js', 'audio.js', 'keys.js', 'ui.js', 'input.js', 'touch.js', 'main.js']);

function fileLogica() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="js\/([^"]+)"/g)].map(m => m[1]).filter(f => !SOLO_BROWSER.has(f));
}

function carica() {
  if (global.G && global.G.__caricato) return global.G;
  for (const f of fileLogica()) vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), { filename: f });
  G.meta.data = G.meta.def();
  G.__caricato = true;
  return G;
}

// tutte le combinazioni di percorso (una regione per tappa)
function percorsi() {
  return G.SLOTS.reduce((acc, opz) => acc.flatMap(p => opz.map(o => p.concat([o]))), [[]]);
}

module.exports = { carica, percorsi, fileLogica, ROOT };

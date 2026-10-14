// Mini-verifica di fine fase (~10 minuti): 30 partite per eroe, poi controlli automatici.
// Uso: node tools/verifica.js [--partite N] [--processi P] [--eroi a,b]
// Esito: 0 se va tutto bene; 1 se ci sono errori di gioco o troppe partite bloccate.
// Gli scostamenti di bilanciamento sono solo segnalati (vanno valutati a mano).
const fs = require('fs');
const { esegui, argomenti } = require('./batteria');
const { carica } = require('./lib/gioco');

const opt = argomenti(['verifica'].concat(process.argv.slice(2)));
esegui(opt).then(({ file, errori: falliti }) => {
  carica();
  const rows = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  const vinte = rows.filter(r => r.win).length;
  const media = vinte / rows.length;
  const errori = rows.filter(r => r.err && !/bloccato/.test(r.err));
  const bloccate = rows.filter(r => r.err && /bloccato/.test(r.err));
  const pct = (x) => Math.round(100 * x) + '%';
  console.log(`\nMINI-VERIFICA — ${rows.length} partite, vittorie ${vinte} (${pct(media)})`);
  const avvisi = [];
  for (const h of G.HERO_ORDER) {
    const rs = rows.filter(r => r.hero === h);
    if (!rs.length) continue;
    const p = rs.filter(r => r.win).length / rs.length;
    const piano = rs.reduce((s, r) => s + r.floor, 0) / rs.length;
    const nota = Math.abs(p - media) > 0.2 ? (p > media ? '  ← molto sopra la media' : '  ← molto sotto la media') : '';
    if (nota) avvisi.push(h + nota.replace('  ←', ':'));
    console.log(`  ${h.padEnd(13)} ${pct(p).padStart(4)}  piano medio ${piano.toFixed(1)}${nota}`);
  }
  console.log(`errori di gioco: ${errori.length} | partite bloccate: ${bloccate.length} | processi falliti: ${falliti}`);
  errori.slice(0, 5).forEach(r => console.log('  ERRORE', r.hero, 'partita', r.run, r.err));
  bloccate.slice(0, 5).forEach(r => console.log('  BLOCCO', r.hero, 'partita', r.run, r.err, (r.route || []).join('/')));
  if (avvisi.length) console.log('Da valutare (±20 punti dalla media): ' + avvisi.join('; '));
  console.log('Dettagli: node tools/analisi.js ' + file);
  const ok = !errori.length && !falliti && bloccate.length <= Math.ceil(rows.length * 0.02);
  console.log(ok ? 'ESITO: OK' : 'ESITO: DA CONTROLLARE');
  process.exit(ok ? 0 : 1);
});

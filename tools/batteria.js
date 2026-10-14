// Batteria di test di bilanciamento: lancia tools/sim.js in parallelo e salva i risultati.
// Uso: node tools/batteria.js <esperimento,...> [--partite N] [--processi P] [--eroi a,b,...] [--out file.jsonl]
// Esperimenti:
//   verifica   30 partite per eroe, stile "usa sempre tutto" (mini-verifica di fine fase)
//   sempre     stile "usa sempre tutto" con duelli dei boss da checkpoint (2 per boss)
//   tattico    abilità solo quando convengono
//   abilita    un'abilità tolta alla volta (quanto conta ciascuna)
//   doni       Doni scelti a caso
//   eclissi    Eclissi III
//   risonanze  4 reliquie della stessa affinità dall'inizio
//   reliquie   ogni reliquia data all'inizio (poche partite per eroe)
//   base       senza reliquie né Doni
//   completo   con tutte le reliquie e tutti i Doni dall'inizio
// Risultati: tools/out/<esperimenti>-<data>.jsonl (una partita per riga). Analisi: node tools/analisi.js <file>
const { execFile } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const { carica } = require('./lib/gioco');

function argomenti(argv) {
  const a = { esperimenti: [], partite: null, processi: Math.max(1, os.cpus().length - 1), eroi: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--partite') a.partite = +argv[++i];
    else if (v === '--processi') a.processi = +argv[++i];
    else if (v === '--eroi') a.eroi = argv[++i].split(',');
    else if (v === '--out') a.out = argv[++i];
    else a.esperimenti.push(...v.split(','));
  }
  return a;
}

// elenco dei lavori (blocchi di partite) per gli esperimenti richiesti
function lavori(opt) {
  carica();
  const EROI = opt.eroi || G.HERO_ORDER;
  const out = [];
  const blocchi = (exp, base, totale, dim) => { for (const hero of EROI) for (let r0 = 0; r0 < totale; r0 += dim) out.push({ exp, cfg: Object.assign({ hero, r0, runs: Math.min(dim, totale - r0) }, base) }); };
  const N = (def) => opt.partite || def;
  for (const e of opt.esperimenti) {
    if (e === 'verifica') blocchi(e, { policy: 'always' }, N(30), 5);
    else if (e === 'sempre') blocchi(e, { policy: 'always', bossReplays: 2 }, N(100), 10);
    else if (e === 'tattico') blocchi(e, { policy: 'tactic' }, N(100), 10);
    else if (e === 'abilita') for (let d = 0; d < 4; d++) blocchi(e, { policy: 'always', disable: d }, N(40), 10);
    else if (e === 'doni') blocchi(e, { policy: 'always', perks: 'random' }, N(50), 10);
    else if (e === 'eclissi') blocchi(e, { policy: 'always', ecl: 3 }, N(40), 10);
    else if (e === 'base') blocchi(e, { policy: 'always', mode: 'base' }, N(20), 10);
    else if (e === 'completo') blocchi(e, { policy: 'always', mode: 'full' }, N(20), 10);
    else if (e === 'risonanze') {
      const tag = {}; for (const r of G.RELICS) if (r.tag) (tag[r.tag] = tag[r.tag] || []).push(r.id);
      for (const t in tag) blocchi(e, { policy: 'always', inject: tag[t].slice(0, 4), tag: t }, N(5), 5);
    } else if (e === 'reliquie') for (const r of G.RELICS) blocchi(e, { policy: 'always', inject: [r.id] }, N(5), 5);
    else throw new Error('Esperimento sconosciuto: ' + e);
  }
  return out;
}

// esegue i lavori in parallelo; risolve con il percorso del file dei risultati
function esegui(opt) {
  const todo = lavori(opt);
  const dir = path.join(__dirname, 'out');
  fs.mkdirSync(dir, { recursive: true });
  const file = opt.out || path.join(dir, opt.esperimenti.join('+') + '-' + new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16) + '.jsonl');
  fs.writeFileSync(file, '');
  const partite = todo.reduce((s, j) => s + j.cfg.runs, 0);
  process.stderr.write(`${todo.length} blocchi, ${partite} partite, ${opt.processi} processi → ${path.relative(process.cwd(), file)}\n`);
  return new Promise((ok) => {
    let next = 0, fatti = 0, errori = 0;
    const t0 = Date.now();
    const avvia = () => {
      if (next >= todo.length) return;
      const j = todo[next++];
      execFile(process.execPath, [path.join(__dirname, 'sim.js'), JSON.stringify(j.cfg)], { maxBuffer: 1 << 28 }, (e, so) => {
        if (e) { errori++; process.stderr.write(`ERRORE ${j.exp} ${JSON.stringify(j.cfg)}: ${e.message.slice(0, 200)}\n`); }
        else for (const r of JSON.parse(so)) { r.exp = j.exp; if (j.cfg.tag) r.tag = j.cfg.tag; fs.appendFileSync(file, JSON.stringify(r) + '\n'); }
        fatti++;
        if (fatti % 10 === 0 || fatti === todo.length) process.stderr.write(`  ${fatti}/${todo.length} (${((Date.now() - t0) / 60000).toFixed(1)} min)\n`);
        if (fatti === todo.length) ok({ file, errori });
        else avvia();
      });
    };
    for (let i = 0; i < opt.processi; i++) avvia();
  });
}

module.exports = { esegui, lavori, argomenti };

if (require.main === module) {
  const opt = argomenti(process.argv.slice(2));
  if (!opt.esperimenti.length) { console.error('Uso: node tools/batteria.js <esperimento,...> [--partite N] [--processi P] [--eroi a,b] [--out file]'); process.exit(2); }
  esegui(opt).then(({ file, errori }) => { console.log(file); process.exit(errori ? 1 : 0); });
}

// Analisi dei risultati di tools/batteria.js
// Uso: node tools/analisi.js <file.jsonl> [altri file...]
// Stampa solo le sezioni per cui ci sono dati. Le percentuali hanno l'intervallo di confidenza al 95% (Wilson).
const fs = require('fs');
const { carica } = require('./lib/gioco');
carica();

const files = process.argv.slice(2);
if (!files.length) { console.error('Uso: node tools/analisi.js <file.jsonl> [...]'); process.exit(2); }
const rows = files.flatMap(f => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)));
const HEROES = G.HERO_ORDER.filter(h => rows.some(r => r.hero === h));
const by = (exp) => rows.filter(r => r.exp === exp);
const avg = (a, f) => a.length ? a.reduce((s, x) => s + f(x), 0) / a.length : NaN;
const pct = (x) => isNaN(x) ? '  - ' : (100 * x).toFixed(0).padStart(3) + '%';
function wilson(k, n) { if (!n) return [NaN, NaN]; const z = 1.96, p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [(c - m) / d, (c + m) / d]; }
const wr = (rs) => { const k = rs.filter(r => r.win).length, n = rs.length, ci = wilson(k, n); return { k, n, p: n ? k / n : NaN, lo: ci[0], hi: ci[1] }; };
const fmt = (w) => w.n ? `${pct(w.p)} [${pct(w.lo).trim()}-${pct(w.hi).trim()}] (${w.k}/${w.n})` : '-';
const REG = G.SLOTS.map((opz, i) => opz.length > 1 ? `Tappa ${i + 1}` : (G.BIOME_BY_ID[opz[0]] || {}).name || `Tappa ${i + 1}`);
const sezione = (t) => console.log('\n' + '='.repeat(100) + '\n' + t + '\n' + '='.repeat(100));
const nomeCausa = (k) => k.replace(/^.*, /, '').replace(/ \(.*\)$/, '');

// ---------------------------------------------------------------- vittorie
const principali = ['verifica', 'sempre', 'tattico'].filter(e => by(e).length);
if (principali.length) {
  const tutte = principali.flatMap(by);
  const media = wr(tutte).p;
  sezione('1. PERCENTUALE DI VITTORIA (intervallo di confidenza 95%)');
  console.log(`media generale: ${pct(media)}  — ` + principali.map(e => `${e} ${pct(wr(by(e)).p)}`).join(', '));
  console.log('eroe          | ' + principali.map(e => e.padEnd(25)).join(' | ') + ' | combinato                 | piano | verdetto');
  for (const h of HEROES) {
    const c = wr(tutte.filter(r => r.hero === h));
    const v = c.lo > media + 0.05 ? 'FORTE' : c.hi < media - 0.05 ? 'DEBOLE' : c.p > media + 0.08 ? 'forte?' : c.p < media - 0.08 ? 'debole?' : 'ok';
    console.log(`${h.padEnd(13)} | ` + principali.map(e => fmt(wr(by(e).filter(r => r.hero === h))).padEnd(25)).join(' | ') + ` | ${fmt(c).padEnd(25)} | ${avg(tutte.filter(r => r.hero === h), r => r.floor).toFixed(1).padStart(5)} | ${v}`);
  }

  sezione('2. MORTALITÀ PER TAPPA (su chi ci arriva) e cause principali');
  console.log('eroe          | ' + REG.map(r => r.slice(0, 10).padEnd(10)).join(' | ') + ' | cause principali');
  for (const h of HEROES) {
    const rs = tutte.filter(r => r.hero === h);
    const cel = REG.map((_, reg) => {
      const arrivati = rs.filter(r => G.regionOf(r.floor) >= reg).length;
      const morti = rs.filter(r => !r.win && !r.err && G.regionOf(r.floor) === reg).length;
      return arrivati ? (pct(morti / arrivati) + ` (${morti})`).padEnd(10) : '   -      ';
    });
    const k = {}; rs.forEach(r => { if (r.killer) { const n = nomeCausa(r.killer); k[n] = (k[n] || 0) + 1; } });
    console.log(`${h.padEnd(13)} | ${cel.join(' | ')} | ${Object.entries(k).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0] + ' ' + e[1]).join(', ')}`);
  }

  const bivi = G.SLOTS.map((o, i) => [i, o]).filter(x => x[1].length > 1);
  if (bivi.length) {
    sezione('3. EFFETTO DEL PERCORSO (vittorie per regione scelta al bivio)');
    console.log('eroe          elem.    | ' + bivi.map(([, o]) => o.map(id => (G.BIOME_BY_ID[id] || {}).name.split(' ').slice(0, 2).join(' ').padEnd(16)).join(' ')).join(' | '));
    for (const h of HEROES) {
      const rs = tutte.filter(r => r.hero === h);
      console.log(`${h.padEnd(13)} ${G.HEROES[h].elem.padEnd(8)} | ` + bivi.map(([i, o]) => o.map(id => { const s = rs.filter(r => r.route && r.route[i] === id); return (pct(wr(s).p) + ` n${s.length}`).padEnd(16); }).join(' ')).join(' | '));
    }
  }

  const duelli = tutte.flatMap(r => (r.bosses || []).map(b => Object.assign({ hero: r.hero }, b)));
  if (duelli.length) {
    sezione('4. DUELLI COI BOSS da checkpoint (vittorie %, PV minimi medi, turni per abbatterlo)');
    const bossi = [...new Set(duelli.map(d => d.boss))];
    console.log('eroe          | ' + bossi.map(b => b.slice(0, 12).padEnd(15)).join('| '));
    for (const h of HEROES) console.log(`${h.padEnd(13)} | ` + bossi.map(b => { const t = duelli.filter(d => d.hero === h && d.boss === b); return t.length ? `${pct(t.filter(x => x.won).length / t.length)} ${String(Math.round(avg(t, x => x.minHp))).padStart(2)}% ${String(Math.round(avg(t, x => x.turns))).padStart(3)}t`.padEnd(15) : '-'.padEnd(15); }).join('| '));
    console.log('TUTTI         | ' + bossi.map(b => { const t = duelli.filter(d => d.boss === b); return `${pct(t.filter(x => x.won).length / t.length)} ${String(Math.round(avg(t, x => x.minHp))).padStart(2)}% n${t.length}`.padEnd(15); }).join('| '));
  }

  sezione('5. USO DELLE ABILITÀ (media per partita)');
  for (const h of HEROES) { const rs = tutte.filter(r => r.hero === h); console.log(h.padEnd(13), G.HEROES[h].skills.map((s, i) => G.SKILLS[s].name + ' ' + avg(rs, r => (r.skills || [])[i] || 0).toFixed(0)).join(' | ')); }
}

// ---------------------------------------------------------------- abilità tolte
if (by('abilita').length) {
  const rif = by('sempre').length ? by('sempre') : by('verifica');
  sezione('6. QUANTO CONTA OGNI ABILITÀ (vittorie senza quell\'abilità meno vittorie con tutte, stessi semi)');
  for (const h of HEROES) {
    const rs = by('abilita').filter(r => r.hero === h);
    if (!rs.length) continue;
    const maxRun = Math.max(...rs.map(r => r.run)) + 1;
    const base = wr(rif.filter(r => r.hero === h && r.run < maxRun));
    console.log(`${h.padEnd(13)} base ${pct(base.p)} | ` + G.HEROES[h].skills.map((s, i) => { const w = wr(rs.filter(r => r.disable === i)); const d = Math.round(100 * (w.p - base.p)); return `${G.SKILLS[s].name} ${d > 0 ? '+' : ''}${d}`; }).join(' | '));
  }
}

if (by('doni').length) {
  const rif = by('sempre').length ? by('sempre') : by('verifica');
  sezione('7. DIPENDENZA DALLA SCELTA DEI DONI (scelti bene vs a caso)');
  for (const h of HEROES) { const a = wr(rif.filter(r => r.hero === h)), b = wr(by('doni').filter(r => r.hero === h)); console.log(`${h.padEnd(13)} bene ${pct(a.p)} | a caso ${pct(b.p)} | differenza ${Math.round(100 * (a.p - b.p))} punti`); }
}

for (const [exp, titolo] of [['eclissi', '8. ECLISSI III'], ['base', '9. SENZA RELIQUIE NÉ DONI'], ['completo', '10. CON TUTTE LE RELIQUIE E TUTTI I DONI']]) {
  if (!by(exp).length) continue;
  sezione(titolo);
  for (const h of HEROES) { const rs = by(exp).filter(r => r.hero === h); if (rs.length) console.log(`${h.padEnd(13)} ${fmt(wr(rs))}  piano medio ${avg(rs, r => r.floor).toFixed(1)}`); }
}

const rifRel = (by('sempre').length ? by('sempre') : by('verifica')).filter(r => r.run < 5);
if (by('reliquie').length && rifRel.length) {
  const bw = wr(rifRel).p, bf = avg(rifRel, r => r.floor);
  sezione(`11. VALORE DELLE RELIQUIE (data al piano 1; riferimento senza: ${pct(bw)} vittorie, piano ${bf.toFixed(1)})`);
  const rel = G.RELICS.map(R => { const rs = by('reliquie').filter(r => r.inject && r.inject[0] === R.id); return { nome: R.name, tag: R.tag || '', rar: R.rarity, n: rs.length, dw: wr(rs).p - bw, df: avg(rs, r => r.floor) - bf }; }).filter(x => x.n);
  rel.sort((a, b) => (b.dw + b.df / 15) - (a.dw + a.df / 15));
  const riga = (x) => `${x.nome.padEnd(30)} ${String(x.rar).padEnd(11)} ${x.tag.padEnd(9)} vittorie ${(x.dw >= 0 ? '+' : '') + Math.round(100 * x.dw)} punti, piano ${(x.df >= 0 ? '+' : '') + x.df.toFixed(1)}`;
  console.log('PIÙ FORTI:'); rel.slice(0, 8).forEach(x => console.log('  ' + riga(x)));
  console.log('PIÙ DEBOLI:'); rel.slice(-8).forEach(x => console.log('  ' + riga(x)));
}
if (by('risonanze').length && rifRel.length) {
  const bw = wr(rifRel).p;
  sezione('12. RISONANZE COMPLETE (4 reliquie della stessa affinità al piano 1)');
  for (const t of [...new Set(by('risonanze').map(r => r.tag))]) { const rs = by('risonanze').filter(r => r.tag === t); console.log(`${t.padEnd(10)} vittorie ${pct(wr(rs).p)} (${(wr(rs).p - bw >= 0 ? '+' : '') + Math.round(100 * (wr(rs).p - bw))} punti), piano ${avg(rs, r => r.floor).toFixed(1)}`); }
}

const bloccate = rows.filter(r => r.err && /bloccato/.test(r.err)), errori = rows.filter(r => r.err && !/bloccato/.test(r.err));
console.log(`\npartite analizzate: ${rows.length} | bloccate: ${bloccate.length} | errori di gioco: ${errori.length}`);
errori.slice(0, 5).forEach(r => console.log('  ERRORE', r.hero, 'partita', r.run, r.err));
bloccate.slice(0, 5).forEach(r => console.log('  BLOCCO', r.exp, r.hero, 'partita', r.run, r.err, (r.route || []).join('/')));

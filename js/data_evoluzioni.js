'use strict';
// ============================================================
//  data_evoluzioni.js : le evoluzioni dei Signori della Natura
//  Prima Serie -> Mystica -> Energheia; Seconda Serie -> Atomic (Elios: il Grande Inganno);
//  Sommo Luminescente -> Mythos -> Final Evolution; Vecchio Saggio -> Risveglio dell'Occhio.
//  Si evolve raccogliendo il 2° e il 4° Frammento dell'Occhio della Vita. L'aspetto delle
//  forme evolute viene dalle statuine di quelle linee (tools/pixel/evoluzioni.js).
// ============================================================
(function () {
  const U = G.U, T = G.T, H = G.SK_HELP;

  // le linee delle statuine
  G.EVO_LINES = {
    mystica: { name: 'Mystica', color: '#e8d27a', desc: 'rilievi d\'oro e d\'argento' },
    energheia: { name: 'Energheia', color: '#ffd23a', desc: 'la forma più massiccia dei primi nati' },
    atomic: { name: 'Atomic', color: '#b8ff7a', desc: 'le mutazioni dei poteri Atomic' },
    mythos: { name: 'Mythos', color: '#ffb05a', desc: 'l\'energia Mythos' },
    final: { name: 'Final Evolution', color: '#ff8a3a', desc: 'l\'energia Neozon' },
    risveglio: { name: 'Risveglio dell\'Occhio', color: '#8affc8', desc: 'la magia dell\'Occhio della Vita' },
  };
  // aumenti di statistiche per tipo di evoluzione: le forme Atomic arrivano una volta sola e sono più forti
  const LIEVE = { hp: 6, atk: [1, 1], crit: 3 };
  const MASSICCIA = { hp: 10, atk: [1, 2], def: 1 };
  const ATOMIC = { hp: 12, atk: [2, 2], def: 1, crit: 3 };

  const P = (id, name, desc, apply, o) => Object.assign({ id, name, desc, apply }, o || {});
  const add = (h, k, v) => { h.mods[k] = (h.mods[k] || 0) + v; };

  // stage: { form, line, title, stats, ult, saggio (parole del Saggio), carta (testo della carta), options: [2 varianti] }
  // una variante può cambiare forma, titolo, Potere Supremo e scena (Elios e il Grande Inganno)
  G.EVOLUTIONS = {
    gheos: [
      { form: 'mystica', line: 'mystica', title: 'Signore della Potenza · Mystica', stats: LIEVE, ult: 'terremoto_mystico',
        saggio: 'Due Frammenti, Gheos. La loro luce scorre nella tua roccia: guarda, il tuo corpo si copre d\'oro e d\'argento.',
        carta: 'Il Primogenito... Lui "era" quando ancora niente esisteva! Silenzioso, saggio e riservato. La sua potenza è la più grande, il suo maglio devastante!',
        options: [
          P('gheos_argento', 'Pelle d\'Argento', 'Pelle di Roccia riduce ogni danno subito di 2 invece che di 1.', h => { add(h, 'flatReduce', 1); }),
          P('gheos_maglio', 'Maglio d\'Oro', 'I tuoi colpi in mischia stordiscono il nemico per 1 turno con il 20% di probabilità.', h => { add(h, 'stunOnHit', 0.2); }),
        ] },
      { form: 'energheia', line: 'energheia', title: 'il Potente · Energheia', stats: MASSICCIA, ult: 'maglio_devastante',
        saggio: 'La terra trema... Quattro Frammenti, e la mia magia ha dato nuova vita ai primi nati dell\'isola di Gorm. Dalla terra squarciata appari tu: Gheos, il Potente!',
        carta: 'Tutto il suo corpo esprime la nuova potenza... le gambe sono più grandi e pericolose, lo sguardo più acuto ma soprattutto la forza del suo maglio è diventata devastante!',
        options: [
          P('gheos_gambe', 'Gambe Possenti', 'Immune a stordimento, congelamento, radici e rallentamento.', h => { h.mods.stunImmune = true; h.mods.rootImmune = true; }),
          P('gheos_sguardo', 'Sguardo Acuto', '+10% critico e colpi critici più devastanti (danni ×2,2).', h => { h.crit += 10; h.critMul = Math.max(h.critMul, 2.2); }),
        ] },
    ],
    tasarau: [
      { form: 'mystica', line: 'mystica', title: 'Signore della Foresta · Mystica', stats: LIEVE, ult: 'urlo_lamentoso',
        saggio: 'Due Frammenti, Tasarau. Senti la linfa d\'argento salire lungo le tue liane? Le tue quattro mani ora sono di bronzo.',
        carta: 'Secondo a Gheos per età, ma non per saggezza! Con le sue possenti braccia, afferra... Con i suoi artigli, distrugge... Un gigante che non conosce ostacoli.',
        options: [
          P('tasarau_liane', 'Liane d\'Argento', 'I tuoi colpi in mischia immobilizzano il nemico per 1 turno con il 25% di probabilità.', h => { add(h, 'rootOnHit', 0.25); }),
          P('tasarau_artigli', 'Artigli di Bronzo', '+30% danni ai nemici avvelenati.', h => { add(h, 'poisonedBonus', 0.3); }),
        ] },
      { form: 'energheia', line: 'energheia', title: 'il Saggio · Energheia', stats: MASSICCIA, ult: 'risveglio_secolare',
        saggio: 'Quattro Frammenti. Il Signore più saggio dell\'isola torna a regnare su Gorm: da te i Popoli della Foresta hanno imparato a essere giusti e misurati.',
        carta: 'Il suo corpo, come un albero secolare, è cresciuto di grandezza... Le sue braccia come lunghi rami riescono a rimuovere tutti gli ostacoli... Nel suo unico occhio si legge tutta la tristezza per le sorti di Gorm.',
        options: [
          P('tasarau_secolare', 'Corpo Secolare', '+12 PV massimi e +2 armatura.', h => { h.maxHp += 12; h.hp += 12; h.def += 2; }),
          P('tasarau_rami', 'Braccia come Rami', '+2 gittata alle abilità e tutte le ricariche -1 turno.', h => { add(h, 'rangeBonus', 2); add(h, 'cdr', 1); }),
        ] },
    ],
    poivrons: [
      { form: 'mystica', line: 'mystica', title: 'Signore del Mare · Mystica', stats: LIEVE, ult: 'maremoto_mystico',
        saggio: 'Due Frammenti, Poivrons. Il mare ti riveste di bronzo e d\'argento: i tuoi tentacoli arriveranno ancora più lontano.',
        carta: 'Molto suscettibile e permaloso... I tentacoli della sua testa possono arrivare dovunque e soprattutto stritolare di tutto! Se lo vedi inizia a correre... e soprattutto, corri veloce!',
        options: [
          P('poivrons_tentacoli', 'Tentacoli di Bronzo', 'I tuoi colpi in mischia Bagnano il nemico per 3 turni (e Figlio delle Onde fa +25% danni ai Bagnati).', h => { h.mods.wetOnHit = 3; }),
          P('poivrons_permaloso', 'Permaloso', 'Ogni colpo subito ti dà il 60% di Furia in più.', h => { add(h, 'furyTaken', 0.6); }),
        ] },
      { form: 'energheia', line: 'energheia', title: 'il Guardiano dei Mari · Energheia', stats: MASSICCIA, ult: 'mari_profondi',
        saggio: 'Quattro Frammenti. Nessuno sa cosa si nasconda nei mari più profondi: l\'unico che li conosce davvero è il Guardiano dei Mari. Sei tu, Poivrons.',
        carta: 'Ogni suo muscolo esprime un\'immensa potenza... purtroppo il suo carattere non è migliorato, è rimasto suscettibile e molto permaloso... Le pinne sulla schiena e sulle braccia sono delle lame affilatissime!',
        options: [
          P('poivrons_pinne', 'Pinne Affilate', 'Chi ti colpisce in mischia subisce 6 danni.', h => { add(h, 'thorns', 6); }),
          P('poivrons_cattura', 'Tentacoli Cacciatori', 'Il Getto d\'Acqua attira il bersaglio di 2 caselle verso di te e lo immobilizza per 1 turno, invece di respingerlo.', h => { h.up.getto_pull = true; }),
        ] },
    ],
    noctis: [
      { form: 'mystica', line: 'mystica', title: 'Signore dei Cieli · Mystica', stats: LIEVE, ult: 'tempesta_notturna',
        saggio: 'Due Frammenti, Noctis. Le tue ali diventano d\'argento: dall\'alto, nell\'oscurità, nulla sfuggirà ai tuoi occhi.',
        carta: 'Dall\'alto, nell\'oscurità... spia, sorveglia e... attacca! La leggenda narra che nemmeno la luna può sfuggire alla potenza della sua magia!',
        options: [
          P('noctis_occhi', 'Occhi d\'Argento', '+2 vista e +50% danni ai nemici che non ti hanno ancora notato.', h => { add(h, 'sight', 2); add(h, 'unawareBonus', 0.5); }),
          P('noctis_luna', 'Magia della Luna', '+20% danni con le abilità.', h => { add(h, 'skillDmg', 0.2); }),
        ] },
      { form: 'energheia', line: 'energheia', title: 'il Terribile · Energheia', stats: MASSICCIA, ult: 'picchiata_terribile',
        saggio: 'Quattro Frammenti. A presidiare i cieli di Gorm è tornato Noctis, il Terribile! Tutti adesso alzano lo sguardo timorosi verso il cielo.',
        carta: 'La sua magia si è enormemente accresciuta... Sfreccia velocissimo grazie alle sue grandi ali. Il becco e la punta delle ali sono delle armi potentissime... Il suo terribile sguardo è diventato leggenda...',
        options: [
          P('noctis_ali', 'Grandi Ali', 'Velocità +15: agisci più spesso dei nemici.', h => { h.speed += 15; }),
          P('noctis_sguardo', 'Sguardo Terribile', '+5% critico; i tuoi colpi critici lasciano il nemico Confuso per 2 turni.', h => { h.crit += 5; h.mods.critConfuse = 2; }),
        ] },
    ],
    kolossus: [
      { form: 'atomic', line: 'atomic', title: 'Signore della Terra · Atomic', stats: ATOMIC, ult: 'valanga_atomica',
        saggio: 'Kolossus, il potere delle gemme di Muscor si risveglia nei Frammenti che porti. Lascia che entri in te: la tua pelle cambierà, e la tua forza con lei.',
        carta: 'Sento l\'antica potenza della terra scorrere nelle mie possenti vene... AAAARRRGGG... Il Vecchio Saggio aveva ragione! Mi sento come se rinascessi... la mia pelle sta cambiando così come la mia forza!!! Una nuova Vita mi aspetta!!!',
        options: [
          P('kolossus_muscor', 'Gemme di Muscor', '+2 armatura; ogni nemico abbattuto ti dà 4 di Scudo in più.', h => { h.def += 2; add(h, 'killShield', 4); }),
          P('kolossus_rinato', 'Una Nuova Vita', 'Non sei più lento (velocità 100) e infliggi il 15% di danni in più.', h => { h.speed = Math.max(h.speed, 100); add(h, 'dmgMul', 0.15); }),
        ] },
    ],
    barbataus: [
      { form: 'atomic', line: 'atomic', title: 'l\'Invisibile · Atomic', stats: ATOMIC, ult: 'custode_invisibile',
        saggio: 'Barbataus, a te l\'arduo compito di sorvegliare la mistica foresta. Il tuo corpo si trasformerà: nessuno potrà più vederti arrivare.',
        carta: 'Nascosto ed invisibile grazie alla trasformazione del suo corpo, vigila, studia e colpisce con le sue armi senza pietà... "Ogni sussurro, ogni movimento nella foresta risponde agli ordini di Barbataus, l\'invisibile!"',
        options: [
          P('barbataus_invisibile', 'L\'Invisibile', 'Inizi ogni piano Invisibile per 10 turni e i nemici faticano a notarti.', h => { add(h, 'floorInvis', 10); h.mods.stealth = true; }),
          P('barbataus_sussurro', 'Ogni Sussurro', 'Le tue evocazioni hanno il doppio dei PV e infliggono il 30% di danni in più.', h => { h.mods.summonHp = (h.mods.summonHp || 1) + 0.5; add(h, 'allyDmg', 0.3); }),
        ] },
    ],
    carrapax: [
      { form: 'atomic', line: 'atomic', title: 'la Speranza di Gorm · Atomic', stats: ATOMIC, ult: 'tsunami_spiriti',
        saggio: 'Carrapax, sei sceso nella Fossa degli Spiriti e ne sei uscito trasformato. La tua potenza è aumentata: ora il tuo scopo è chiaro.',
        carta: 'La speranza di Gorm. Tanto saggio quanto potente. Dopo la discesa nella "Fossa degli Spiriti", dopo che il suo corpo si era trasformato e la sua potenza aumentata... chiaro era ora il suo scopo! Annientare Orrore ed il suo nuovo alleato Elios!!!',
        options: [
          P('carrapax_chele', 'Chele degli Spiriti', 'Contrattacchi in mischia con il 40% di probabilità (invece del 20%).', h => { add(h, 'counter', 0.2); }),
          P('carrapax_corazza', 'Corazza degli Spiriti', '+2 armatura e inizi ogni piano con uno Scudo di 12 PV.', h => { h.def += 2; add(h, 'floorShield', 12); }),
        ] },
    ],
    // Il grande inganno: Magor offre a Elios la Leggerezza Magica; il Saggio la mutazione Atomic
    elios: [
      { form: 'atomic', line: 'atomic', title: 'Signore dei Cieli · Atomic', stats: ATOMIC, ult: 'sole_atomico', choice: 'inganno',
        saggio: 'Elios, non ascoltarlo. Lascia che i Frammenti ti mutino come gli altri Signori, e resta fedele a Gorm.',
        magor: 'Elios, Signore dei Cieli... perché servire un vecchio? Unisciti a me e ti donerò la Leggerezza Magica: nessuno volerà più in alto di te.',
        carta: 'Potente ed elegante! Quando vola, con le sue ali può oscurare il cielo... Tanto regale nei movimenti e saggio nell\'animo, quanto implacabile nei combattimenti!',
        options: [
          P('elios_mutazione', 'La mutazione del Saggio', 'Resti fedele a Gorm: +3 armatura e dopo ogni abilità resti Rapido un turno in più. Il tuo Potere Supremo diventa il Sole Atomico.', h => { h.def += 3; add(h, 'hasteBonus', 1); }),
          P('elios_traditore', 'La Leggerezza Magica di Magor', 'Diventi il Grande Traditore: +30% danni e +6 schivata, ma l\'arroganza ti indebolisce e subisci il 15% di danni in più. Il tuo Potere Supremo oscura il sole.', h => { add(h, 'dmgMul', 0.3); h.eva += 6; add(h, 'dmgTakenMul', 0.15); },
            { form: 'traditore', sprite: 'elios_atomic', title: 'il Grande Traditore · Atomic', ult: 'ali_oscure',
              carta: 'Dal giorno del tradimento tutti hanno paura di guardare il cielo e vedere il sole coperto dalle sue grandi ali. L\'alleanza con Magor ha risvegliato in lui il suo lato malvagio... "Elios, tanto più alto è il suo volo... tanto più cresce la sua malvagità..."' }),
        ] },
    ],
    luminescente: [
      { form: 'mythos', line: 'mythos', title: 'Signore della Luce · Mythos', stats: LIEVE, ult: 'supernova_mythos',
        saggio: 'Due Frammenti, Sommo Luminescente. La luce del cielo si raccoglie nella tua spada di fiamme: è l\'energia Mythos.',
        carta: 'Della Luce è il Signore e dalla Luce trae nuova forza che, assorbita nel proprio corpo, ne cambia il colore. "Ammira come il mio corpo si ricarica di Energia quando è esposto ai tuoi miracolosi raggi..."',
        options: [
          P('lumi_ali', 'Ali che Assorbono la Luce', 'L\'Aura Radiosa ti cura di 1 PV per ogni nemico che brucia.', h => { h.mods.auraHeal = 1; }),
          P('lumi_spada', 'Spada di Fiamme', 'L\'Aura Radiosa raggiunge i nemici a 2 caselle e brucia per 2 danni in più.', h => { h.mods.auraRange = 1; add(h, 'auraBonus', 2); }),
        ] },
      { form: 'final', line: 'final', title: 'Signore del Sole · Final Evolution', stats: MASSICCIA, ult: 'energia_neozon',
        saggio: 'Quattro Frammenti. Il vigore della luce lascia spazio a una forza ancor più potente: il Sole! L\'evoluzione finale è in atto.',
        carta: '"Fedeli alleati, il mio scudo di sole vi proteggerà dall\'attacco del popolo della Luna! E la mia spada di luce solare irradierà ognuno di voi con la nuova energia Neozon! Nuova vita allo stato puro!"',
        options: [
          P('lumi_scudo', 'Scudo di Sole', 'Inizi ogni piano con uno Scudo di 15 PV e lo Scudo Prismatico protegge il doppio.', h => { add(h, 'floorShield', 15); h.up.prisma_sole = true; }),
          P('lumi_spada_sole', 'Spada di Luce Solare', 'Il Raggio di Luce infligge 180% danni e lascia i nemici in fiamme.', h => { h.up.raggio_sole = true; }),
        ] },
    ],
    saggio: [
      { form: 'risveglio', line: 'risveglio', title: 'Custode dell\'Occhio · Risvegliato', stats: LIEVE, ult: 'occhio_risvegliato',
        saggio: 'Due Frammenti... l\'Occhio della Vita mi riconosce. Sento tornare nelle mie mani la magia con cui feci nascere i Popoli della Natura.',
        options: [
          P('saggio_vigile', 'Occhio Vigile', 'Tutte le ricariche delle abilità -1 turno.', h => { add(h, 'cdr', 1); }),
          P('saggio_sapienza', 'Sapienza Risvegliata', '+20% esperienza e +10 PV massimi.', h => { add(h, 'xpMul', 0.2); h.maxHp += 10; h.hp += 10; }),
        ] },
    ],
  };

  // ---------------- aspetto e nome della forma attuale ----------------
  G.heroTitle = (h) => h.evoTitle || G.HEROES[h.heroId].title;
  G.heroVolto = (h) => h.sprite || h.heroId;
  G.formKey = (heroId, st, o) => heroId + '_' + ((o && o.form) || st.form);
  G.formSprite = (heroId, st, o) => (o && o.sprite) || heroId + '_' + st.form;
  // tutte le forme di un eroe, per la scelta dell'eroe e la scheda
  G.heroForms = function (heroId) {
    const out = [];
    (G.EVOLUTIONS[heroId] || []).forEach((st, i) => {
      if (st.choice) st.options.forEach(o => out.push({ key: G.formKey(heroId, st, o), sprite: G.formSprite(heroId, st, o), line: st.line, stage: i, title: o.title || st.title }));
      else out.push({ key: G.formKey(heroId, st), sprite: G.formSprite(heroId, st), line: st.line, stage: i, title: st.title });
    });
    return out;
  };

  // evoluzione dovuta raccogliendo il Frammento numero n (2° e 4°)
  G.evolutionsDue = function (h, n) {
    const evo = G.EVOLUTIONS[h.heroId] || [];
    const want = Math.min(evo.length, n >= 4 ? 2 : n >= 2 ? 1 : 0);
    const out = [];
    for (let s = h.evo || 0; s < want; s++) out.push(s);
    return out;
  };

  G.evolve = function (h, stage, i) {
    const st = (G.EVOLUTIONS[h.heroId] || [])[stage];
    if (!st || (h.evo || 0) !== stage) return false;
    const o = st.options[i] || st.options[0];
    const s = st.stats, d = G.HEROES[h.heroId];
    h.evo = stage + 1;
    h.form = (o.form || st.form);
    h.sprite = G.formSprite(h.heroId, st, o);
    h.evoTitle = o.title || st.title;
    h.evoPicks = (h.evoPicks || []).concat([o.id]);
    h.maxHp += s.hp; h.atk[0] += s.atk[0]; h.atk[1] += s.atk[1];
    h.def += s.def || 0; h.crit += s.crit || 0;
    o.apply(h);
    h.hp = h.maxHp; G.cleanse(h);
    // il Potere Supremo si trasforma
    const ult = h.skills.find(sk => G.SKILLS[sk.id] && G.SKILLS[sk.id].ult);
    if (ult) ult.id = o.ult || st.ult;
    if (h.evoPicks.includes('elios_traditore')) h.traitor = true;
    const md = G.meta && G.meta.data;
    if (md) { md.forms = md.forms || {}; md.forms[G.formKey(h.heroId, st, o)] = true; G.meta.save(); }
    const line = G.EVO_LINES[st.line];
    G.log(d.name + ' si evolve: ' + line.name + '! ' + h.evoTitle.split(' · ')[0] + '. Nuova passiva: ' + o.name + '.', 'level');
    if (G.fx && G.fx.banner) G.fx.banner(d.name + ' ' + line.name, h.evoTitle.split(' · ')[0]);
    if (G.fx && G.fx.ring) { G.fx.ring(h.x, h.y, 4, line.color); G.fx.sound('levelup'); G.fx.shake(6); }
    return true;
  };

  // descrizione delle passive ottenute evolvendo (scheda dell'eroe)
  G.evoPassives = function (h) {
    const out = [];
    (h.evoPicks || []).forEach((id, s) => {
      const st = (G.EVOLUTIONS[h.heroId] || [])[s]; if (!st) return;
      const o = st.options.find(x => x.id === id); if (o) out.push({ line: G.EVO_LINES[st.line].name, name: o.name, desc: o.desc });
    });
    return out;
  };

  // ------------------------------------------------------------
  //  I Poteri Supremi trasformati
  // ------------------------------------------------------------
  const vis = (h, r) => H.visibleEnemiesIn(h, r);
  const flood = (h, r) => {
    for (const [x, y] of H.circleTiles(h.x, h.y, r)) {
      const t = G.tileAt(x, y);
      if (t === T.FLOOR || t === T.SAND || t === T.ASH || t === T.GRASS || t === T.RUBBLE) G.setTile(x, y, T.SHALLOW);
      if (G.inb(x, y)) G.run.map.fire[G.idx(x, y)] = 0;
    }
  };
  const summon = (h, type, x, y, life, hpMul) => {
    const a = H.summonAlly(h, type, x, y, life);
    const m = (h.mods.summonHp || 1) * (hpMul || 1);
    if (m !== 1) { a.maxHp = Math.round(a.maxHp * m); a.hp = a.maxHp; }
    return a;
  };
  Object.assign(G.SKILLS, {
    // ---------------- Gheos ----------------
    terremoto_mystico: {
      name: 'Terremoto Mystico', glyph: '☄', elem: 'terra', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. La terra trema d'oro e d'argento: tutti i nemici visibili entro ${h.up.terremoto_r ? 8 : 6} caselle subiscono 260% danni, restano storditi per 2 turni e Indeboliti per 3.`,
      area: (h) => H.circleTiles(h.x, h.y, h.up.terremoto_r ? 8 : 6),
      use(h) {
        const r = h.up.terremoto_r ? 8 : 6;
        G.fx.shake(14); G.fx.sound('quake'); G.fx.ring(h.x, h.y, r, '#e8d27a'); G.fx.dust(h.x, h.y, r);
        for (const o of vis(h, r)) {
          G.dealDamage(h, o, H.dmg(h, 2.6), { elem: 'terra', delay: 80 });
          if (!o.dead) { G.addStatus(o, 'stun', 2); G.addStatus(o, 'weak', 3); }
        }
        return true;
      },
    },
    maglio_devastante: {
      name: 'Maglio Devastante', glyph: '⚒', elem: 'terra', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Il maglio squarcia la terra: tutti i nemici visibili entro ${h.up.terremoto_r ? 8 : 6} caselle subiscono 320% danni e restano storditi per 3 turni. Abbatte i muri incrinati intorno a te.`,
      area: (h) => H.circleTiles(h.x, h.y, h.up.terremoto_r ? 8 : 6),
      use(h) {
        const r = h.up.terremoto_r ? 8 : 6;
        G.fx.shake(18); G.fx.sound('quake'); G.fx.flash('#ffe9a0'); G.fx.ring(h.x, h.y, r, '#ffd23a'); G.fx.dust(h.x, h.y, r);
        G.breakWallsAround(h.x, h.y, 2);
        for (const o of vis(h, r)) {
          G.dealDamage(h, o, H.dmg(h, 3.2), { elem: 'terra', delay: 80 });
          if (!o.dead) G.addStatus(o, 'stun', 3);
        }
        return true;
      },
    },
    // ---------------- Tasarau ----------------
    urlo_lamentoso: {
      name: 'Urlo Lamentoso', glyph: '❦', elem: 'foresta', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Il tuo urlo fa tremare i boschi: evochi ${h.up.risveglio_up ? 4 : 3} Germogli di Grandalbero per 25 turni; i nemici entro 4 caselle restano immobilizzati per 3 turni e Indeboliti.`,
      use(h) {
        const spots = H.freeAdjacent(h.x, h.y, h); G.run.rng.shuffle(spots);
        const n = Math.min(spots.length, h.up.risveglio_up ? 4 : 3);
        for (let i = 0; i < n; i++) H.summonAlly(h, 'germoglio', spots[i][0], spots[i][1], 25);
        for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.inRadius(h.x, h.y, o.x, o.y, 4))) { G.addStatus(o, 'root', 3); G.addStatus(o, 'weak', 3); G.fx.roots(o.x, o.y); }
        G.fx.ring(h.x, h.y, 4, '#c8d0d8'); G.fx.sound('roar'); G.fx.shake(7);
        return true;
      },
    },
    risveglio_secolare: {
      name: 'Risveglio Secolare', glyph: '♣', elem: 'foresta', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. La foresta secolare risponde: evochi ${h.up.risveglio_up ? 4 : 3} Germogli con il 50% di PV in più per 30 turni, immobilizzi per 3 turni i nemici entro 5 caselle e curi il 25% dei PV.`,
      use(h) {
        const spots = H.freeAdjacent(h.x, h.y, h); G.run.rng.shuffle(spots);
        const n = Math.min(spots.length, h.up.risveglio_up ? 4 : 3);
        for (let i = 0; i < n; i++) summon(h, 'germoglio', spots[i][0], spots[i][1], 30, 1.5);
        for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.inRadius(h.x, h.y, o.x, o.y, 5))) { G.addStatus(o, 'root', 3); G.fx.roots(o.x, o.y); }
        G.heal(h, h.maxHp * 0.25);
        G.fx.ring(h.x, h.y, 5, '#6ee05a'); G.fx.sound('summon'); G.fx.shake(8);
        return true;
      },
    },
    // ---------------- Poivrons ----------------
    maremoto_mystico: {
      name: 'Maremoto Mystico', glyph: '🌊', elem: 'mare', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Una marea d'argento travolge tutto entro ${h.up.maremoto_r ? 7 : 5} caselle: 220% danni, Bagna e rallenta i nemici. Allaga il terreno intorno a te.`,
      area: (h) => H.circleTiles(h.x, h.y, h.up.maremoto_r ? 7 : 5),
      use(h) {
        const r = h.up.maremoto_r ? 7 : 5;
        G.fx.ring(h.x, h.y, r, '#c8e8ff'); G.fx.shake(10); G.fx.sound('wave');
        flood(h, 3);
        for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.inRadius(h.x, h.y, o.x, o.y, r) && G.visible(o.x, o.y))) {
          G.dealDamage(h, o, H.dmg(h, 2.2), { elem: 'mare', delay: 80 });
          if (!o.dead) { G.addStatus(o, 'wet', 6); G.addStatus(o, 'slow', 4); }
        }
        return true;
      },
    },
    mari_profondi: {
      name: 'Mari Profondi', glyph: '≋', elem: 'mare', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Gli abissi salgono a prenderli: 260% danni a tutti i nemici entro ${h.up.maremoto_r ? 8 : 6} caselle, che restano Bagnati, rallentati e immobilizzati per 1 turno. Allaga il terreno e curi il 15% dei PV.`,
      area: (h) => H.circleTiles(h.x, h.y, h.up.maremoto_r ? 8 : 6),
      use(h) {
        const r = h.up.maremoto_r ? 8 : 6;
        G.fx.ring(h.x, h.y, r, '#4aa0ff'); G.fx.shake(12); G.fx.sound('wave');
        flood(h, 3);
        for (const o of G.run.ents.filter(o => !o.dead && G.hostile(o, h) && U.inRadius(h.x, h.y, o.x, o.y, r) && G.visible(o.x, o.y))) {
          G.dealDamage(h, o, H.dmg(h, 2.6), { elem: 'mare', delay: 80 });
          if (!o.dead) { G.addStatus(o, 'wet', 6); G.addStatus(o, 'slow', 4); G.addStatus(o, 'root', 1); }
        }
        G.heal(h, h.maxHp * 0.15);
        return true;
      },
    },
    // ---------------- Noctis ----------------
    tempesta_notturna: {
      name: 'Tempesta Notturna', glyph: '⚡', elem: 'aria', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. ${h.up.tempesta_up ? 15 : 11} fulmini cadono dal cielo notturno su nemici visibili casuali: 150% danni ciascuno (doppi sui Bagnati); i colpiti restano Accecati per 2 turni.`,
      use(h) {
        const n = h.up.tempesta_up ? 15 : 11, vs = vis(h, 8);
        G.fx.flash('#c8d8ff'); G.fx.sound('thunder'); G.fx.shake(9);
        for (let i = 0; i < n; i++) {
          const alive = vs.filter(o => !o.dead); if (!alive.length) break;
          const o = G.run.rng.pick(alive);
          G.fx.bolt(o.x, o.y - 8, o.x, o.y, '#e8f0ff', i * 70);
          G.dealDamage(h, o, H.dmg(h, 1.5) * (o.status.wet ? 2 : 1), { elem: 'aria', delay: i * 70 });
          if (!o.dead) G.addStatus(o, 'blind', 2);
        }
        return true;
      },
    },
    picchiata_terribile: {
      name: 'Picchiata del Terribile', glyph: '➶', elem: 'aria', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Ti getti dal cielo su ogni nemico visibile entro ${h.up.tempesta_up ? 9 : 7} caselle: 230% danni (doppi sui Bagnati) e lo scaraventi via di 2 caselle.`,
      use(h) {
        const vs = vis(h, h.up.tempesta_up ? 9 : 7).sort((a, b) => U.cheb(a.x, a.y, h.x, h.y) - U.cheb(b.x, b.y, h.x, h.y));
        G.fx.flash('#e8fff8'); G.fx.sound('dash'); G.fx.shake(10);
        vs.forEach((o, i) => {
          G.fx.trail(h.x, h.y, o.x, o.y, '#ffe27a');
          G.dealDamage(h, o, H.dmg(h, 2.3) * (o.status.wet ? 2 : 1), { elem: 'aria', delay: i * 60 });
          if (!o.dead) G.knockback(h, o, 2);
        });
        return true;
      },
    },
    // ---------------- Kolossus ----------------
    valanga_atomica: {
      name: 'Valanga Atomica', glyph: '☄', elem: 'terra', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. ${h.up.valanga_up ? 11 : 8} massi luminosi precipitano su nemici visibili entro 7: 200% danni ciascuno; li spingono via e li stordiscono per 1 turno.`,
      use(h) {
        const vs = vis(h, 7);
        G.fx.shake(12); G.fx.sound('quake'); G.fx.flash('#d8ffc0');
        for (let i = 0; i < (h.up.valanga_up ? 11 : 8); i++) {
          const alive = vs.filter(o => !o.dead); if (!alive.length) break;
          const o = G.run.rng.pick(alive);
          G.fx.projectile(o.x, o.y - 6, o.x, o.y, 'rock', i * 80);
          G.dealDamage(h, o, H.dmg(h, 2.0), { elem: 'terra', delay: 120 + i * 80 });
          if (!o.dead) { G.knockback(h, o, 1); if (!o.dead) G.addStatus(o, 'stun', 1); }
        }
        return true;
      },
    },
    // ---------------- Barbataus ----------------
    custode_invisibile: {
      name: 'Custode Invisibile', glyph: '♣', elem: 'foresta', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Risvegli un Guardiano Antico per ${h.up.guardiano_up ? 45 : 30} turni e 2 Lupi Spirituali, curi completamente le tue evocazioni e diventi Invisibile per 3 turni.`,
      use(h) {
        const spots = H.freeAdjacent(h.x, h.y, h);
        if (!spots.length) { G.log('Non c\'è spazio per il Guardiano.', 'bad'); return false; }
        G.run.rng.shuffle(spots);
        const a = summon(h, 'antico', spots[0][0], spots[0][1], h.up.guardiano_up ? 45 : 30);
        a.maxHp = a.hp = Math.round((40 + h.level * 6) * (h.mods.summonHp || 1));
        a.atk = [4 + Math.floor(h.level / 2), 7 + h.level]; a.def = 3 + Math.floor(h.level / 5);
        for (let i = 1; i < Math.min(3, spots.length); i++) { const w = summon(h, 'lupospirito', spots[i][0], spots[i][1], 18); w.speed = 130; }
        for (const o of G.run.ents) if (!o.dead && o.kind === 'ally') o.hp = o.maxHp;
        G.addStatus(h, 'invis', 3);
        for (const m of G.run.ents) if (m.kind === 'monster' && m.st.mode === 'hunt') m.st.lost = 6;
        G.fx.ring(h.x, h.y, 3, '#b8ff7a'); G.fx.sound('summon'); G.fx.shake(6);
        return true;
      },
    },
    // ---------------- Carrapax ----------------
    tsunami_spiriti: {
      name: 'Tsunami degli Spiriti', glyph: '🌊', elem: 'mare', ult: true, target: 'dir',
      desc: (h) => `POTERE SUPREMO. Carichi fino a ${h.up.tsunami_up ? 10 : 8} caselle travolgendo i nemici sulla strada: ${h.up.tsunami_up ? 320 : 260}% danni; li scaraventi di lato, storditi per 1 turno, e lasci una scia d'acqua.`,
      area: (h, dx, dy) => H.lineTiles(h, dx, dy, h.up.tsunami_up ? 10 : 8, true),
      use(h, dir) {
        if (!dir) return false;
        const [dx, dy] = dir, range = h.up.tsunami_up ? 10 : 8, mult = h.up.tsunami_up ? 3.2 : 2.6;
        let moved = 0;
        G.fx.sound('wave'); G.fx.shake(9);
        for (let i = 0; i < range; i++) {
          const nx = h.x + dx, ny = h.y + dy;
          if (G.isSolid(nx, ny)) break;
          const o = G.entityAt(nx, ny);
          if (o && G.hostile(o, h)) {
            G.dealDamage(h, o, H.dmg(h, mult), { elem: 'mare' });
            if (!o.dead) { G.addStatus(o, 'wet', 5); G.knockback(h, o, 2, [-dy, dx]); if (!o.dead) G.addStatus(o, 'stun', 1); }
            if (!o.dead && G.entityAt(nx, ny) === o) break;
          } else if (o) break;
          if (!G.canEnter(h, nx, ny) || G.isHazardFor(h, nx, ny)) break;
          const t = G.tileAt(h.x, h.y);
          if (t === T.FLOOR || t === T.SAND || t === T.ASH || t === T.GRASS) G.setTile(h.x, h.y, T.SHALLOW);
          G.moveTo(h, nx, ny, { dash: true, slide: true }); moved++;
          if (h.dead || G.run.pendingDescend || h.x !== nx || h.y !== ny) return true;
        }
        if (!moved) G.fx.ring(h.x, h.y, 1, '#c8e8f0');
        return true;
      },
    },
    // ---------------- Elios ----------------
    sole_atomico: {
      name: 'Sole Atomico', glyph: '☀', elem: 'luce', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Il sole Atomic esplode nel cielo: ${h.up.sole_up ? 280 : 230}% danni a tutti i nemici visibili entro 8, che restano Accecati per 3 turni; curi il 20% dei PV.`,
      use(h) {
        G.fx.flash('#fff6c0'); G.fx.sound('holy'); G.fx.shake(9);
        G.heal(h, h.maxHp * 0.2);
        for (const o of vis(h, 8)) {
          G.fx.bolt(h.x, h.y, o.x, o.y, '#ffe27a');
          G.dealDamage(h, o, H.dmg(h, h.up.sole_up ? 2.8 : 2.3), { elem: 'luce', delay: 80 });
          if (!o.dead) G.addStatus(o, 'blind', 3);
        }
        return true;
      },
    },
    ali_oscure: {
      name: 'Ali che Oscurano il Sole', glyph: '❦', elem: 'tenebre', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Le tue grandi ali coprono il sole: ${h.up.sole_up ? 290 : 240}% danni a tutti i nemici visibili entro 8, che restano Accecati per 4 turni; diventi Invisibile per 2 turni.`,
      use(h) {
        G.fx.flash('#2a1840'); G.fx.sound('wind'); G.fx.shake(9);
        for (const o of vis(h, 8)) {
          G.fx.bolt(h.x, h.y, o.x, o.y, '#b77cff');
          G.dealDamage(h, o, H.dmg(h, h.up.sole_up ? 2.9 : 2.4), { elem: 'tenebre', delay: 80 });
          if (!o.dead) G.addStatus(o, 'blind', 4);
        }
        G.addStatus(h, 'invis', 2);
        for (const m of G.run.ents) if (m.kind === 'monster' && m.st.mode === 'hunt') m.st.lost = 6;
        return true;
      },
    },
    // ---------------- Sommo Luminescente ----------------
    supernova_mythos: {
      name: 'Supernova Mythos', glyph: '✹', elem: 'luce', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. La luce raccolta nelle ali esplode: 300% danni a tutti i nemici visibili entro 7 caselle, che restano Accecati per 3 turni; curi il 30% dei PV.`,
      area: (h) => H.circleTiles(h.x, h.y, 7),
      use(h) {
        G.fx.flash('#ffffff'); G.fx.ring(h.x, h.y, 7, '#ffb05a'); G.fx.shake(12); G.fx.sound('holy');
        G.heal(h, h.maxHp * 0.3);
        for (const o of vis(h, 7)) { G.dealDamage(h, o, H.dmg(h, 3.0), { elem: 'luce', delay: 80 }); if (!o.dead) G.addStatus(o, 'blind', 3); }
        return true;
      },
    },
    energia_neozon: {
      name: 'Energia Neozon', glyph: '☀', elem: 'luce', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. Nuova vita allo stato puro: 350% danni a tutti i nemici visibili entro 8 caselle; curi il 40% dei PV, rimuovi gli stati negativi e ottieni uno Scudo di ${15 + h.level}.`,
      use(h) {
        G.fx.flash('#ffd08a'); G.fx.ring(h.x, h.y, 8, '#ff8a3a'); G.fx.shake(14); G.fx.sound('holy');
        G.heal(h, h.maxHp * 0.4); G.cleanse(h); G.addStatus(h, 'shield', 8, 15 + h.level);
        for (const o of vis(h, 8)) { G.fx.bolt(h.x, h.y, o.x, o.y, '#ffb05a'); G.dealDamage(h, o, H.dmg(h, 3.5), { elem: 'luce', delay: 80 }); }
        return true;
      },
    },
    // ---------------- Vecchio Saggio ----------------
    occhio_risvegliato: {
      name: 'Occhio della Vita Risvegliato', glyph: '◉', elem: 'neutro', ult: true, target: 'self',
      desc: (h) => `POTERE SUPREMO. L'Occhio della Vita si risveglia del tutto: curi il 60% dei PV e tutti i nemici visibili subiscono 260% danni, restando Indeboliti e Rallentati per 4 turni.`,
      use(h) {
        G.heal(h, h.maxHp * 0.6); G.cleanse(h);
        G.fx.flash('#d8fff0'); G.fx.sound('holy'); G.fx.shake(10);
        for (const o of vis(h, 9)) {
          G.fx.bolt(h.x, h.y, o.x, o.y, '#8affc8');
          G.dealDamage(h, o, H.dmg(h, 2.6), { elem: 'neutro', delay: 80 });
          if (!o.dead) { G.addStatus(o, 'weak', 4); G.addStatus(o, 'slow', 4); }
        }
        return true;
      },
    },
  });
})();

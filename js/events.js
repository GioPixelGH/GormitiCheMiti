'use strict';
// ============================================================
//  events.js : incontri narrativi con scelte
// ============================================================
(function () {
  const U = G.U;
  const PEOPLE = { foresta: 'della Foresta', mare: 'del Mare', ghiaccio: 'dei Ghiacci', roscamar: 'della Terra', cieli: 'dell\'Aria', luce: 'della Luce', vulcano: 'del Fuoco' };
  const people = () => PEOPLE[G.biomeOf(G.run.floor).id] || 'di Gorm';
  const reg = () => G.regionOf(G.run.floor);
  const hasItem = (h, id) => h.items.findIndex(s => s && s.id === id);
  const takeItem = (h, id) => { const i = hasItem(h, id); if (i < 0) return false; h.items[i].n--; if (h.items[i].n <= 0) h.items[i] = null; return true; };
  const freeSlot = (h, id) => h.items.some(s => !s || (s.id === id && s.n < 9));

  // crea mostri vicino a una posizione
  G.spawnNear = function (type, x, y, n, opts) {
    const R = G.run, out = [];
    const probe = { flags: Object.assign({}, (G.MON[type].flags || {})), kind: 'monster' };
    for (let r = 1; r <= 4 && out.length < n; r++) {
      for (let dy = -r; dy <= r && out.length < n; dy++) for (let dx = -r; dx <= r && out.length < n; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const px = x + dx, py = y + dy;
        if (!G.inb(px, py) || !G.canEnter(probe, px, py) || G.isHazardFor(probe, px, py)) continue;
        if (px === R.hero.x && py === R.hero.y) continue;
        const m = G.makeMonster(type, px, py, Object.assign({ awake: true }, opts || {}));
        G.fx.spawn(m);
        out.push(m);
      }
    }
    return out;
  };
  const packType = () => {
    const b = G.biomeOf(G.run.floor);
    const withPack = b.monsters.map(m => m[0]).filter(t => G.MON[t].pack);
    return withPack.length ? withPack[0] : b.monsters[0][0];
  };

  const RIDDLES = [
    { q: 'Quale elemento spegne il Fuoco?', a: ['Mare', 'Aria', 'Terra'] },
    { q: 'Le radici spezzano la roccia: quale elemento domina la Terra?', a: ['Foresta', 'Mare', 'Fuoco'] },
    { q: 'Quale elemento abbatte il Vento con le sue montagne?', a: ['Terra', 'Foresta', 'Mare'] },
    { q: 'Le tempeste sconvolgono gli oceani: quale elemento vince sul Mare?', a: ['Aria', 'Fuoco', 'Terra'] },
    { q: 'Il fuoco divora i boschi: quale elemento batte la Foresta?', a: ['Fuoco', 'Aria', 'Mare'] },
    { q: 'Chi si è risvegliato nel cuore del Monte Vulcano?', a: ['Magor', 'Obscurio', 'Razzle'] },
    { q: 'Con quale potere il Vecchio Saggio creò i Popoli della Natura?', a: ['L\'Occhio della Vita', 'La Pietra Focaia', 'Il Corno di Cerbante'] },
    { q: 'Quale Signore della Natura guida il Popolo della Foresta?', a: ['Tasarau', 'Noctis', 'Gheos'] },
    { q: 'Quale Signore della Natura guida il Popolo dell\'Aria?', a: ['Noctis', 'Poivrons', 'Gheos'] },
    { q: 'Chi è l\'antico nemico della Luce?', a: ['Obscurio', 'Glaciator', 'Crabs'] },
  ];

  G.EVENTS = [
    { id: 'ferito', title: 'Un Gormita ferito',
      text: () => `Un guerriero del Popolo ${people()} giace tra le rocce, ferito dai servitori di Magor. Ti guarda implorando aiuto.`,
      options: [
        { label: 'Dagli una Pozione di Linfa', cond: (h) => hasItem(h, 'pozione') >= 0 || 'Non hai pozioni',
          run(R, h) { takeItem(h, 'pozione'); const id = G.randomRelicId(R.rng, R.rng.chance(0.5) ? 'rara' : 'comune'); G.gainRelic(h, id); return `Il Gormita si rialza e, grato, ti dona: ${G.RELIC_BY_ID[id].name}.`; } },
        { label: 'Curalo con la tua energia (−20% dei PV attuali)',
          run(R, h) { h.hp = Math.max(1, h.hp - Math.round(h.hp * 0.2)); R.pending.push({ type: 'levelup', opts: G.rollPerks(h, h.mods.extraChoice ? 4 : 3), title: 'Il segreto del guerriero' }); return 'Il guerriero ti insegna una tecnica segreta del suo popolo.'; } },
        { label: 'Prosegui', run: () => 'Ti allontani in silenzio.' },
      ] },
    { id: 'indovinello', title: 'L\'indovinello del Vecchio Saggio',
      init(f, rng) { const r = rng.int(0, RIDDLES.length - 1); const order = rng.shuffle([0, 1, 2]); f.data = { r, order }; },
      text: (R, h, f) => `Un'immagine luminosa del Vecchio Saggio appare davanti a te. "Rispondi, Signore della Natura: <b>${RIDDLES[f.data.r].q}</b>"`,
      options: (R, h, f) => f.data.order.map(i => ({
        label: RIDDLES[f.data.r].a[i],
        run(R2, h2) {
          if (i === 0) { R2.pending.push({ type: 'levelup', opts: G.rollPerks(h2, h2.mods.extraChoice ? 4 : 3), title: 'Il dono del Saggio' }); return '"Risposta esatta." Il Saggio sorride e ti offre un dono.'; }
          return `"No..." Il Saggio scuote la testa. La risposta era: ${RIDDLES[f.data.r].a[0]}.`;
        } })) },
    { id: 'ombra_mercante', title: 'Il Mercante d\'Ombra',
      text: () => 'Una figura incappucciata emerge dal buio. "Potere proibito, Signore della Natura... a un prezzo."',
      options: [
        { label: 'Accetta: −12 PV massimi per una reliquia leggendaria', cond: (h) => h.maxHp > 34 || 'Sei troppo debole',
          run(R, h) { h.maxHp -= 12; h.hp = Math.min(h.hp, h.maxHp); const id = G.randomRelicId(R.rng, 'leggendaria'); G.gainRelic(h, id); return `Senti la vita scivolare via... ma ora possiedi ${G.RELIC_BY_ID[id].name}.`; } },
        { label: 'Accetta: tutti i tuoi Frammenti (almeno 60) per una reliquia rara', cond: (h) => h.gold >= 60 || 'Servono almeno 60 Frammenti',
          run(R, h) { h.gold = 0; const id = G.randomRelicId(R.rng, 'rara'); G.gainRelic(h, id); return `Il mercante sorride e ti consegna ${G.RELIC_BY_ID[id].name}.`; } },
        { label: 'Rifiuta', run: () => 'La figura svanisce con una risata.' },
      ] },
    { id: 'tesoro', title: 'Il tesoro maledetto',
      text: () => 'Un forziere avvolto da catene di tenebra. Il metallo è freddo come il ghiaccio, ma da una fessura brillano molti Frammenti.',
      options: [
        { label: 'Spezza le catene (molti Frammenti, ma il prossimo piano sarà maledetto)',
          run(R, h) { const n = 70 + reg() * 35; h.gold += n; R.stats.gold += n; R.nextMods = Object.assign(R.nextMods || {}, { cursed: true }); G.fx.sound('dark'); return `Ottieni ${n} Frammenti. Una voce sussurra: "Il prossimo passo sarà più oscuro..."`; } },
        { label: 'Lascialo', run: () => 'Meglio non sfidare la sorte.' },
      ] },
    { id: 'razzle', title: 'Razzle nei guai',
      text: () => 'Razzle il mercante è disperato: il suo zaino è scivolato in un crepaccio! "Aiutami, ti prego!"',
      options: [
        { label: 'Calati a recuperarlo (−10% dei PV attuali)', run(R, h) { h.hp = Math.max(1, h.hp - Math.round(h.hp * 0.1)); h.mods.shopDiscount += 0.2; return 'Razzle ti abbraccia: "Per te sconto del 20% per tutto il viaggio!"'; } },
        { label: 'Frugagli nello zaino (2 oggetti, ma Razzle si ricorderà di te)',
          run(R, h) { const a = G.randomItemId(R.rng), b = G.randomItemId(R.rng); const ok1 = G.addItem(h, a), ok2 = G.addItem(h, b); h.mods.shopDiscount -= 0.25; return `Prendi ${G.ITEM_BY_ID[a].name}${ok1 ? '' : ' (zaino pieno!)'} e ${G.ITEM_BY_ID[b].name}${ok2 ? '' : ' (zaino pieno!)'}. Razzle ti guarda male: i suoi prezzi saliranno.`; } },
        { label: 'Salutalo e prosegui', run: () => '"Ehi! Non lasciarmi qui!"' },
      ] },
    { id: 'specchio', title: 'Lo Specchio di Obscurio',
      text: () => 'Uno specchio d\'ossidiana. Il tuo riflesso ti sorride... con occhi rossi come la brace.',
      options: [
        { label: 'Affronta il riflesso (premio raro se lo sconfiggi)',
          run(R, h, f) {
            const m = G.spawnNear('riflesso', f.x, f.y, 1)[0];
            if (m) {
              m.sprite = h.heroId; m.name = 'Riflesso di ' + h.name; m.elem = h.elem;
              m.maxHp = m.hp = Math.round(h.maxHp * 0.6); m.atk = [Math.round((h.atk[0] + h.mods.dmg) * 0.8), Math.round((h.atk[1] + h.mods.dmg) * 0.8)];
              m.def = Math.max(0, h.def - 1); m.eva = h.eva; m.crit = h.crit; m.xp = 10 + h.level * 3;
              m.flags.champion = true; m.flags.elite = true;
            }
            return 'Il riflesso esce dallo specchio. Sconfiggilo!'; } },
        { label: 'Infrangi lo specchio (+40 Furia, −8 PV)', run(R, h) { h.hp = Math.max(1, h.hp - 8); G.addFury(h, 40 / h.mods.furyMul); G.fx.sound('dark'); return 'Mille schegge nere. Una rabbia antica ti scorre nelle vene.'; } },
        { label: 'Distogli lo sguardo', run: () => 'Il riflesso ti segue con lo sguardo mentre ti allontani.' },
      ] },
    { id: 'forgia', title: 'La Forgia Antica',
      text: () => 'Un\'incudine ancora calda, coperta di rune dei fabbri di Roscamar. Puoi temprare il tuo equipaggiamento... a pagamento.',
      options: [
        { label: () => `Affila le armi: +2 danni (${50 + reg() * 20} ◆)`, cond: (h) => h.gold >= 50 + reg() * 20 || 'Frammenti insufficienti', run(R, h) { h.gold -= 50 + reg() * 20; h.mods.dmg += 2; G.fx.sound('stone'); return 'Le scintille volano: i tuoi colpi sono più letali (+2 danni).'; } },
        { label: () => `Rinforza la corazza: +1 armatura (${50 + reg() * 20} ◆)`, cond: (h) => h.gold >= 50 + reg() * 20 || 'Frammenti insufficienti', run(R, h) { h.gold -= 50 + reg() * 20; h.def += 1; G.fx.sound('stone'); return 'La tua pelle è dura come la roccia (+1 armatura).'; } },
        { label: 'Vattene', run: () => 'Il fuoco della forgia si spegne lentamente.' },
      ] },
    { id: 'fonte_furia', title: 'La Fonte della Furia',
      text: () => 'Un geyser di energia scarlatta erompe dal terreno. Il suo calore ti fa ribollire il sangue.',
      options: [
        { label: 'Immergiti: +20% guadagno di Furia per sempre, −6 PV massimi', run(R, h) { h.mods.furyMul += 0.2; h.maxHp -= 6; h.hp = Math.min(h.hp, h.maxHp); return 'La Furia ora ti scorre più in fretta nelle vene.'; } },
        { label: 'Bevi un sorso: Furia piena', run(R, h) { h.fury = 100; G.fx.sound('ready'); return 'Sei pronto a scatenare il tuo Potere Supremo!'; } },
      ] },
    { id: 'biblioteca', title: 'La Biblioteca in Rovina',
      text: () => 'Scaffali crollati custodiscono i diari dei Signori della Natura del passato.',
      options: [
        { label: 'Studia le tecniche antiche (un potenziamento di abilità)', run(R, h) {
          const hp = G.PERKS.filter(p => p.hero === h.heroId && (h.perks[p.id] || 0) < (p.max || 1) && (!p.req || p.req(h)));
          const opts = R.rng.shuffle(hp.slice()).slice(0, 3).map(p => p.id);
          R.pending.push({ type: 'levelup', opts: opts.length ? opts : G.rollPerks(h, 3), title: 'Tecniche antiche' });
          return 'Tra le pagine scopri come potenziare i tuoi poteri.'; } },
        { label: 'Prendi una pergamena', cond: (h) => freeSlot(h, 'mappatura') || 'Zaino pieno', run(R, h) { const id = R.rng.chance(0.5) ? 'mappatura' : 'vento'; G.addItem(h, id); return `Trovi una ${G.ITEM_BY_ID[id].name}.`; } },
      ] },
    { id: 'branco', title: 'Il branco affamato',
      text: () => 'Occhi che brillano nell\'ombra: un branco affamato ti circonda lentamente...',
      options: [
        { label: 'Lancia una Pozione come diversivo', cond: (h) => hasItem(h, 'pozione') >= 0 || 'Non hai pozioni', run(R, h) { takeItem(h, 'pozione'); return 'Le bestie si azzuffano per la pozione e tu sgusci via.'; } },
        { label: 'Combatti! (esperienza e Frammenti)', run(R, h, f) {
          const ms = G.spawnNear(packType(), f.x, f.y, 3);
          for (const m of ms) m.flags.golden = true;
          return 'Il branco attacca!'; } },
      ] },
    // --- eventi del pacchetto "Racconti di Gorm" ---
    { id: 'altare', title: 'L\'Altare degli Elementi', pack: 'racconti',
      text: () => 'Cinque incavi intagliati nella pietra, uno per ogni Pietra di Gorm. L\'altare chiede un sacrificio.',
      options: [
        { label: 'Sacrifica una pozione e 8 PV massimi: reliquia rara', cond: (h) => (hasItem(h, 'pozione') >= 0 && h.maxHp > 30) || 'Serve una Pozione di Linfa', run(R, h) { takeItem(h, 'pozione'); h.maxHp -= 8; h.hp = Math.min(h.hp, h.maxHp); const id = G.randomRelicId(R.rng, 'rara'); G.gainRelic(h, id); return `L'altare si illumina e ti dona ${G.RELIC_BY_ID[id].name}.`; } },
        { label: 'Prega: +4 armatura per 40 turni', run(R, h) { G.addStatus(h, 'stoneskin', 40, 4); G.fx.sound('shield'); return 'La pietra dell\'altare ti protegge.'; } },
      ] },
    { id: 'ponte', title: 'Il ponte di corde', pack: 'racconti',
      text: () => 'Un vecchio ponte di corde, sospeso sul vuoto, porta dritto verso il prossimo portale.',
      options: [
        { label: 'Attraversalo: scendi subito (30% di rischio: −15% PV)', run(R, h) {
          if (R.rng.chance(0.3)) { h.hp = Math.max(1, h.hp - Math.round(h.maxHp * 0.15)); G.log('Una corda si spezza: ti salvi per un pelo!', 'bad'); }
          return { text: 'Raggiungi l\'altro lato e attraversi il portale.', descend: true }; } },
        { label: 'Fai il giro lungo', run: () => 'Meglio non rischiare.' },
      ] },
    { id: 'nido', title: 'Il nido abbandonato', pack: 'racconti',
      text: () => 'In un nido enorme brilla un uovo dorato. Nessuna traccia della madre... per ora.',
      options: [
        { label: 'Prendi l\'uovo (Frutto di Gorm, ma la madre potrebbe tornare)', cond: (h) => freeSlot(h, 'frutto') || 'Zaino pieno', run(R, h, f) {
          G.addItem(h, 'frutto');
          if (R.rng.chance(0.5)) { const m = G.spawnNear(packType(), f.x, f.y, 1)[0]; if (m) G.makeChampion(m, R.rng), m.st.mode = 'hunt'; return 'Prendi l\'uovo... e un ruggito furioso rimbomba alle tue spalle!'; }
          return 'Prendi l\'uovo: si trasforma in un Frutto di Gorm.'; } },
        { label: 'Lascialo', run: () => 'Il nido resta in pace.' },
      ] },
    { id: 'viandante', title: 'Il viandante', pack: 'racconti',
      text: () => `Un viandante del Popolo ${people()} propone uno scambio.`,
      options: [
        { label: '30 ◆ per 2 Pozioni di Linfa', cond: (h) => (h.gold >= 30 && freeSlot(h, 'pozione')) || 'Servono 30 Frammenti e spazio', run(R, h) { h.gold -= 30; G.addItem(h, 'pozione', 2); return 'Affare fatto!'; } },
        { label: 'Una Pozione di Linfa per 45 ◆', cond: (h) => hasItem(h, 'pozione') >= 0 || 'Non hai pozioni', run(R, h) { takeItem(h, 'pozione'); h.gold += 45; return 'Il viandante beve avidamente e ti paga.'; } },
        { label: 'Nessuno scambio', run: () => 'Vi salutate con un cenno.' },
      ] },
    { id: 'seme', title: 'Il germoglio dorato', pack: 'racconti',
      text: () => 'Un germoglio dorato del Grandalbero spunta dalla roccia, pulsando di vita.',
      options: [
        { label: 'Prenditene cura: rigeneri 1 PV ogni 8 turni', run(R, h) { h.mods.regen += 0.125; return 'La linfa del Grandalbero ora scorre in te.'; } },
        { label: 'Mangialo: +8 PV massimi', run(R, h) { h.maxHp += 8; h.hp += 8; return 'Ti senti più forte.'; } },
      ] },
  ];
  G.EVENT_BY_ID = {}; for (const e of G.EVENTS) G.EVENT_BY_ID[e.id] = e;

  G.eventAvailable = function (ev) {
    if (!ev.pack) return true;
    const md = G.meta && G.meta.data;
    return !!(md && md.purchases && md.purchases[ev.pack]);
  };
  G.pickEvent = function (rng) {
    const R = G.run;
    R.eventsSeen = R.eventsSeen || [];
    let pool = G.EVENTS.filter(e => G.eventAvailable(e) && !R.eventsSeen.includes(e.id));
    if (!pool.length) pool = G.EVENTS.filter(e => G.eventAvailable(e));
    const ev = rng.pick(pool);
    R.eventsSeen.push(ev.id);
    return ev;
  };
  G.eventOptions = function (f) {
    const ev = G.EVENT_BY_ID[f.ev], R = G.run, h = R.hero;
    const opts = typeof ev.options === 'function' ? ev.options(R, h, f) : ev.options;
    return opts.map(o => {
      const c = o.cond ? o.cond(h) : true;
      return { label: typeof o.label === 'function' ? o.label() : o.label, ok: c === true, reason: c === true ? '' : c, run: o.run };
    });
  };
  // esegue la scelta: ritorna {text, descend}
  G.eventChoose = function (f, i) {
    const R = G.run, h = R.hero;
    const opts = G.eventOptions(f);
    const o = opts[i];
    if (!o || !o.ok || f.used) return null;
    f.used = true;
    let res = o.run(R, h, f);
    if (typeof res === 'string') res = { text: res };
    G.log(G.EVENT_BY_ID[f.ev].title + ': ' + res.text.replace(/<[^>]+>/g, ''), 'info');
    R.stats.events = (R.stats.events || 0) + 1;
    return res;
  };
})();

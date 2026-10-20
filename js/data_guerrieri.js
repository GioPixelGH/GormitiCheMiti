'use strict';
// ============================================================
//  data_guerrieri.js : gli eserciti dell'era (Fase 4 del piano).
//  I guerrieri del male delle carte originali come nemici, élite e Campioni,
//  con un comportamento preso dal nome e dal testo della loro carta.
// ============================================================
(function () {
  const U = G.U, T = G.T, AI = G.AI;
  const st = (name, t, p, chance) => (a, d) => { if (!chance || G.run.rng.chance(chance)) G.addStatus(d, name, t, p); };
  const rng = () => G.run.rng;
  const dist = (a, b) => U.cheb(a.x, a.y, b.x, b.y);

  Object.assign(G.MON, {
    // ================= FORESTA SILENTE: l'avanguardia di Magmion (Prima Serie) =================
    insecticus: {
      name: 'Insecticus', elem: 'foresta', hp: 10, atk: [2, 3], def: 2, speed: 100, xp: 4, ai: 'ranged',
      ranged: { range: 4, cd: 3, dmg: [2, 3], elem: 'terra', proj: 'rock' },
      desc: '"Non provare a schiacciarlo... sarebbe l\'ultima cosa che fai." Corazza di roccia, artigli ruotanti e lapilli lanciati da lontano.',
    },
    strappapensieri: {
      name: 'Lo Strappapensieri', elem: 'tenebre', hp: 9, atk: [2, 4], speed: 100, xp: 4, ai: 'ranged',
      ranged: { range: 4, cd: 4, dmg: [1, 3], elem: 'tenebre', proj: 'mind', status: ['confuse', 2, 0] },
      desc: 'La sua Magia Telepatica sembra schiacciarti il cervello: chi ne è colpito resta Confuso. Da vicino, i suoi artigli affondano nella carne.',
    },
    anonimo: {
      name: 'L\'Anonimo Multiforme', elem: 'aria', hp: 10, atk: [2, 3], speed: 100, xp: 4, ai: 'blink',
      ranged: { range: 5, cd: 3, dmg: [2, 4], elem: 'aria', proj: 'spark' },
      desc: 'Nessuno conosce le sue vere sembianze: sparisce nel nulla e riappare altrove, e le sue sfere elettromagnetiche distruggono ogni forma di vita.',
    },
    guardiano: {
      name: 'Il Guardiano Urlante', elem: 'terra', hp: 12, atk: [2, 4], def: 1, speed: 90, xp: 4, ai: 'guardiano', sight: 12,
      slam: { cd: 6, shape: 'around', r: 1, dmg: [3, 5], push: 1, color: '#c8a070', label: 'Grido di Battaglia' },
      desc: 'Il suo terzo occhio vede a distanze impossibili: quando ti scorge, il suo urlo sveglia tutti i dintorni. Il grido di battaglia fa tremare la terra.',
    },
    // ================= FOSSA DEGLI ANTICHI SPIRITI: l'esercito di Orrore Profondo (Seconda Serie) =================
    geyser: {
      name: 'Geyser l\'Iroso', elem: 'fuoco', hp: 70, atk: [5, 8], def: 5, speed: 90, xp: 25, ai: 'melee',
      flags: { elite: true, noKnock: true, fireImmune: true }, slam: { cd: 5, shape: 'around', r: 2, dmg: [8, 12], fire: 2, color: '#ffb070', label: 'Getti di Vapore' },
      desc: 'ÉLITE. Una bomba ad orologeria: anche i suoi alleati hanno paura di lui. Quando si arrabbia, getti di vapore incandescente escono da tutto il suo corpo.',
    },
    incandescente: {
      name: 'L\'Incandescente Fantasma', elem: 'fuoco', hp: 12, atk: [3, 5], eva: 12, speed: 90, xp: 6, ai: 'melee', flags: { phase: true, drain: true, fly: true, fireImmune: true },
      desc: 'Uno spirito che prende forma immergendosi nella lava: il suo corpo assume qualsiasi forma, attraversa la roccia e si nutre della tua vita.',
    },
    lamacciaio: {
      name: 'Lamacciaio il Tagliagole', elem: 'terra', hp: 16, atk: [4, 6], crit: 25, speed: 100, xp: 6, ai: 'melee', flags: { executioner: true },
      desc: 'Il sicario del Popolo del Vulcano, crudele e senza pietà: le sue braccia sono lame d\'acciaio e infierisce su chi è già ferito (+40% danni sotto metà vita).',
    },
    cavaliere: {
      name: 'Il Misterioso Cavaliere', elem: 'fuoco', hp: 15, atk: [3, 5], def: 2, speed: 100, xp: 6, ai: 'castmelee', flags: { fireImmune: true },
      cast: { cd: 4, range: 6, shape: 'circle', r: 1, dmg: [5, 8], fire: 2, color: '#ff7a1a', elem: 'fuoco', label: 'Sfere di Fuoco', sound: 'boom' },
      desc: 'Una maledizione lo portò nel Regno di Magor. Nessuno conosce il suo volto, ma tutti temono le Sfere di Fuoco che crea con le mani.',
    },
    incubo: {
      name: 'Incubo di Fuoco', elem: 'fuoco', hp: 11, atk: [4, 6], crit: 20, speed: 110, xp: 6, ai: 'melee', flags: { fly: true, lurker: true, fireImmune: true },
      desc: 'Non ha corpo fisico: si spegne e si muove invisibile, poi si riaccende all\'improvviso quando decide di attaccare.',
    },
    bombos: {
      name: 'Bombos Potenza di Fuoco', elem: 'fuoco', hp: 20, atk: [3, 5], def: 3, speed: 70, xp: 7, ai: 'castmelee', flags: { fireImmune: true },
      cast: { cd: 5, range: 7, shape: 'barrage', n: 3, dmg: [5, 8], fire: 2, color: '#ff8a2a', elem: 'fuoco', label: 'Bocche di Fuoco', sound: 'boom' },
      desc: '29 bocche di fuoco che sparano pietre incandescenti. "Gormita avvisato... mezzo salvato!"',
    },
    // ================= PIANURA DELLE NEBBIE: il Popolo della Lava (Prima Serie) =================
    sparafuoco: {
      name: 'Sparafuoco', elem: 'fuoco', hp: 16, atk: [3, 5], speed: 75, xp: 6, ai: 'ranged', flags: { fireImmune: true },
      ranged: { range: 5, cd: 3, dmg: [3, 6], elem: 'fuoco', proj: 'fire', status: ['slow', 2, 0] },
      desc: 'Fisico liquido e lento. Le lingue di fuoco delle sue dita fondono ogni cosa e il suo unico grande occhio ipnotizza: chi è colpito resta Rallentato.',
    },
    malvagius: {
      name: 'Malvagius il Terribile', elem: 'tenebre', hp: 22, atk: [4, 7], speed: 100, xp: 8, ai: 'aura', flags: { fireImmune: true },
      desc: '"Il fratello del Diavolo": non ha padroni né comandanti. La sua aura di crudeltà e magia nera ferisce chiunque gli stia accanto.',
    },
    angelo: {
      name: 'L\'Angelo Infuocato', elem: 'fuoco', hp: 13, atk: [3, 5], eva: 10, speed: 110, xp: 6, ai: 'ranged', flags: { fly: true, kiter: true, fireImmune: true },
      ranged: { range: 5, cd: 2, dmg: [3, 5], elem: 'fuoco', proj: 'fire' },
      desc: 'Un corpo di lava con due ali di fuoco: le sue mani diventano proiettili che, una volta sparati, si rigenerano subito.',
    },
    lavor: {
      name: 'Lavor il Potente', elem: 'fuoco', hp: 75, atk: [6, 9], def: 5, speed: 90, xp: 25, ai: 'melee', flags: { elite: true, noKnock: true, fireImmune: true },
      slam: { cd: 5, shape: 'cross', r: 5, dmg: [8, 12], fire: 2, color: '#ff8a2a', label: 'Dardi Infuocati' },
      desc: 'ÉLITE. Una vera corazzata: spara dardi infuocati dal braccio, dal collo e dalla testa, in ogni direzione. "Avanti, fatti sotto che ti polverizzo!"',
    },
    // ================= CAVERNA DI ROSCAMAR: i guerrieri di Armageddon (Terza Serie) =================
    navus: {
      name: 'Navus il Cinico', elem: 'aria', hp: 22, atk: [4, 6], def: 5, speed: 90, xp: 8, ai: 'ranged',
      ranged: { range: 4, cd: 3, dmg: [5, 8], elem: 'aria', proj: 'spark' },
      desc: 'Piccolo, potente e quasi indistruttibile: con il suo Psicopotere spara scariche elettriche dagli uncini degli avambracci.',
    },
    skorpios: {
      name: 'Skorpios il Malvagio Pungitore', elem: 'fuoco', hp: 24, atk: [5, 8], speed: 120, xp: 9, ai: 'ranged', flags: { lurker: true, fireImmune: true },
      ranged: { range: 4, cd: 4, dmg: [5, 8], elem: 'fuoco', proj: 'fire', status: ['burn', 3, 3] },
      onHit: st('root', 2, 0, 0.3),
      desc: 'Velocissimo, si nasconde invisibile scavando nel terreno. Le sue tenaglie ti stritolano e il pungiglione diventa un cannone di lava.',
    },
    sentinel: {
      name: 'Sentinel il Guardiano Lavico', elem: 'fuoco', hp: 20, atk: [2, 4], speed: 90, xp: 7, ai: 'sentinel', flags: { fireImmune: true },
      desc: 'Poco pericoloso da solo, ma niente sfugge alla miriade dei suoi occhi: quando ti vede chiama i rinforzi dei Signori di Magor.',
    },
    brags: {
      name: 'Brags il Tristo Mietitore', elem: 'tenebre', hp: 26, atk: [5, 8], speed: 100, xp: 9, ai: 'reaper', flags: { executioner: true },
      desc: 'Arriva dopo le battaglie a finire i feriti con la sua falce: se sei sotto metà vita diventa più rapido e ti colpisce più forte. "Alzati e fuggi!"',
    },
    forgius: {
      name: 'Forgius Martello di Fuoco', elem: 'fuoco', hp: 110, atk: [7, 11], def: 5, speed: 85, xp: 35, ai: 'forgius', flags: { elite: true, noKnock: true, fireImmune: true, trueSight: true },
      slam: { cd: 5, shape: 'around', r: 1, dmg: [11, 15], status: 'stun', st: 1, color: '#ff9a2a', label: 'Martello di Roccia Lavica' },
      desc: 'ÉLITE. L\'artiglieria pesante del Vulcano: un martello di roccia lavica e un\'ondata di lava dall\'altro braccio. È cieco, ma con lo Psicopotere ti vede ovunque, anche invisibile.',
    },
    // ================= PICCHI DELLA VALLE DEL DESTINO: Devilfenix e i traditori dell'Aria =================
    falena: {
      name: 'La Mistica Falena', elem: 'aria', hp: 22, atk: [4, 6], eva: 18, speed: 110, xp: 9, ai: 'ranged', flags: { fly: true, kiter: true },
      ranged: { range: 5, cd: 2, dmg: [3, 5], elem: 'aria', proj: 'arcane' },
      desc: 'La vera strega del Popolo dell\'Aria: muovendo le ali lancia piccole sfere di energia che distruggono tutto ciò che incontrano.',
    },
    beccoduro: {
      name: 'Beccoduro il Picchiatore', elem: 'aria', hp: 28, atk: [6, 9], acc: 75, speed: 110, xp: 10, ai: 'diver', flags: { fly: true },
      desc: 'Non è un mostro d\'intelligenza (e sbaglia spesso), ma vola altissimo e piomba in picchiata col becco duro come l\'acciaio.',
    },
    dragon: {
      name: 'Dragon l\'Inceneritore', elem: 'fuoco', hp: 30, atk: [5, 8], eva: 15, speed: 100, xp: 11, ai: 'breath', flags: { fly: true, fireImmune: true },
      desc: 'Nato dall\'alleanza tra Aria e Fuoco: vola alto, difficile da colpire, e soffia fiumi di fuoco dalla bocca.',
    },
    crudelion: {
      name: 'Crudelion il Maledetto', elem: 'aria', hp: 140, atk: [8, 12], def: 3, speed: 115, xp: 45, ai: 'melee',
      flags: { elite: true, fly: true, noKnock: true }, slam: { cd: 4, shape: 'target', r: 1, dmg: [10, 14], status: 'vuln', st: 2, color: '#c04ae0', label: 'Balzo Uncinato' },
      desc: 'ÉLITE. L\'anima nera del Popolo dell\'Aria: con salti lunghissimi piomba sui nemici e li dilania con gli uncini delle braccia.',
    },
    magufo: {
      name: 'Magufo lo Stregone', elem: 'aria', hp: 22, atk: [3, 5], speed: 100, xp: 10, ai: 'telecinesi', flags: { fly: true, kiter: true },
      ranged: { range: 5, cd: 3, dmg: [3, 5], elem: 'aria', proj: 'mind' },
      desc: 'Il suo Psicopotere solleva i nemici e li scaraventa contro le rocce... o nel vuoto. "Non guardarlo mai negli occhi!"',
    },
    magicorvo: {
      name: 'Magicorvo', elem: 'tenebre', hp: 24, atk: [3, 5], speed: 100, xp: 11, ai: 'negromante', flags: { fly: true, kiter: true },
      ranged: { range: 5, cd: 3, dmg: [4, 6], elem: 'tenebre', proj: 'shadow', status: ['weak', 2, 0] },
      desc: 'Antico stregone e consigliere di Elios, passato a Magor con il Popolo dell\'Aria: negromante, richiama le ombre dei caduti. "Abbassa la testa, passa Magicorvo!"',
    },
    vorticus: {
      name: 'Vorticus il Tormentatore', elem: 'aria', hp: 24, atk: [4, 6], speed: 100, xp: 10, ai: 'caster', flags: { fly: true, kiter: true },
      cast: { cd: 5, range: 6, shape: 'plus', dmg: [6, 9], push: 2, color: '#bfe8ff', elem: 'aria', label: 'Tormenta', wetBonus: true },
      desc: 'Nato dallo Spirito del cielo, comanda il tempo: le sue tormente fulminano e scaraventano via. "Si alza il vento... Vorticus c\'è!"',
    },
    // ================= REGIONE DI OSCURO ORIZZONTE: il Popolo delle Tenebre (Terza Serie) =================
    lunaris: {
      name: 'Lunaris l\'Oscuro Stregone', elem: 'tenebre', hp: 26, atk: [3, 5], speed: 100, xp: 11, ai: 'caster', flags: { kiter: true },
      cast: { cd: 4, range: 7, shape: 'circle', r: 1, dmg: [8, 12], elem: 'random', label: 'Magia Nera' },
      desc: 'Maestro antico di magia nera, piega alla sua volontà qualunque elemento: ogni sua magia ha un elemento diverso. Prima di lanciarla si concentra, e lo si capisce dalle luci intorno alla sua testa.',
    },
    ombrassassina: {
      name: 'Ombrassassina', elem: 'tenebre', hp: 26, atk: [7, 10], crit: 20, speed: 120, xp: 11, ai: 'agguato', flags: { lurker: true },
      desc: 'Il predatore per eccellenza: immobile e invisibile nell\'ombra, poi un balzo rapido e fulminante. Nessuno le è mai sfuggito.',
    },
    pantanera: {
      name: 'Pantanera il Sergente del Terrore', elem: 'tenebre', hp: 130, atk: [8, 12], def: 3, speed: 110, xp: 45, ai: 'melee', flags: { elite: true, noKnock: true },
      slam: { cd: 4, shape: 'target', r: 1, dmg: [10, 14], status: 'weak', st: 3, color: '#9ae07a', label: 'Assalto del Terrore' },
      desc: 'ÉLITE. L\'unica ad aver già combattuto la Luce al fianco di Obscurio. Pura potenza fuori controllo, seconda per pericolosità solo al suo Signore.',
    },
    spiritonero: {
      name: 'Spiritonero il Fantasma dell\'Ombra', elem: 'tenebre', hp: 24, atk: [5, 8], eva: 12, speed: 100, xp: 11, ai: 'melee', flags: { phase: true, drain: true, fly: true },
      onHit: st('darkness', 3, 0, 0.5),
      desc: 'Quando apre il mantello ne esce l\'Aurea Nera: toglie la vita e oscura la vista. Attraversa la roccia come uno spirito.',
    },
    buconero: {
      name: 'Buconero l\'Inghiottitore', elem: 'tenebre', hp: 30, atk: [6, 9], speed: 90, xp: 12, ai: 'ranged',
      ranged: { range: 4, cd: 4, dmg: [4, 6], elem: 'tenebre', proj: 'shadow', pull: 3 },
      desc: 'Una porta ultradimensionale vivente: il suo vortice ti risucchia verso di lui e, a volte, ti scaglia lontano in un altro punto della regione.',
    },
    // ================= MONTE VULCANO: i guerrieri di Magmion (Prima Serie) =================
    electricon: {
      name: 'Electricon', elem: 'aria', hp: 32, atk: [5, 8], speed: 100, xp: 13, ai: 'castmelee', sight: 12, flags: { noSneak: true, fireImmune: true },
      cast: { cd: 4, range: 7, shape: 'plus', dmg: [10, 14], color: '#ffe27a', elem: 'aria', label: 'Fulmini dalle Mani', wetBonus: true },
      desc: 'Nato dalle tempeste elettromagnetiche del Vulcano: dalle mani partono fulmini. Vede a 360°: non puoi coglierlo di sorpresa.',
    },
    maglio: {
      name: 'Maglio Infuocato', elem: 'terra', hp: 46, atk: [8, 12], def: 5, speed: 85, xp: 13, ai: 'melee',
      onHit: st('burn', 3, 4, 0.5),
      desc: 'Esiliato dal Vulcano dopo una lite con Magmion, il suo corpo si è raffreddato in roccia... ma il suo pugno è ancora una palla di fuoco.',
    },
    mastodontico: {
      name: 'Il Mastodontico', elem: 'fuoco', hp: 180, atk: [10, 14], def: 5, speed: 85, xp: 60, ai: 'melee',
      flags: { elite: true, noKnock: true, fireImmune: true }, slam: { cd: 4, shape: 'around', r: 1, dmg: [13, 18], status: 'stun', st: 1, color: '#ff9a2a', label: 'Pugni Demolitori' },
      desc: 'ÉLITE. Lento ma potentissimo. "A che servono armi speciali o magia, quando i tuoi pugni possono demolire il mondo?"',
    },
  });

  // ------------------------------------------------------------ popolo e serie (Codex)
  const VM = 'Popolo del Vulcano (Magma)', VL = 'Popolo del Vulcano (Lava)', V = 'Popolo del Vulcano', A = 'Popolo dell\'Aria', TN = 'Popolo delle Tenebre';
  const P1 = 'Prima Serie', P2 = 'Seconda Serie', P3 = 'Terza Serie';
  const ORIGINI = {
    insecticus: [VM, P1], strappapensieri: [VM, P1], guardiano: [VM, P1], electricon: [VM, P1], maglio: [VM, P1], aracno: [VM, P1], magmion: [VM, P1],
    anonimo: [VL, P1], mastodontico: [VL, P1], sparafuoco: [VL, P1], malvagius: [VL, P1], lavor: [VL, P1], angelo: [VL, P1], lavion: [VL, P1],
    geyser: [V, P2], incandescente: [V, P2], lamacciaio: [V, P2], cavaliere: [V, P2], incubo: [V, P2], bombos: [V, P2], orrore: [V, P2],
    navus: [V, P3], skorpios: [V, P3], forgius: [V, P3], sentinel: [V, P3], brags: [V, P3], armageddon: [V, P3],
    falena: [A, P3], beccoduro: [A, P3], dragon: [A, P3], crudelion: [A, P3], magufo: [A, P3], devilfenix: [A, P3],
    magicorvo: [A + ', traditore', P2], vorticus: [A + ', traditore', P2],
    lunaris: [TN, P3], ombrassassina: [TN, P3], pantanera: [TN, P3], spiritonero: [TN, P3], buconero: [TN, P3], obscurio: [TN, P3],
  };
  for (const k in ORIGINI) if (G.MON[k]) { G.MON[k].people = ORIGINI[k][0]; G.MON[k].serie = ORIGINI[k][1]; }
  G.MON.magor.origin = 'Il Signore del Male';
  G.MON.braccio.origin = 'Il braccio vivo di Lavion';
  // da dove viene un nemico (Codex e descrizioni)
  G.monsterOrigin = function (d) {
    if (d.origin) return d.origin;
    if (d.people) return d.people + ' · ' + d.serie;
    return 'Creatura maledetta';
  };
  G.isWarrior = (type) => !!(G.MON[type] && G.MON[type].people);

  // ------------------------------------------------------------ IA dei guerrieri
  // guerrieri che lanciano magie ma non scappano: la magia quando è pronta, altrimenti all'assalto
  AI.castmelee = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    const c = G.MON[m.type].cast, h = G.run.hero;
    if (AI.ready(m, 'cast') && m.st.seesHero && dist(m, h) <= c.range && dist(m, h) >= 2) return AI.caster(m);
    AI.melee(m);
  };
  // L'Anonimo Multiforme: sparisce e riappare a qualche casella dall'eroe, poi colpisce da lontano
  AI.blink = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    const h = G.run.hero, d = dist(m, h);
    if (AI.ready(m, 'blink') && m.st.seesHero && (d <= 1 || d >= 5)) {
      const spots = [];
      for (let y = h.y - 4; y <= h.y + 4; y++) for (let x = h.x - 4; x <= h.x + 4; x++) {
        const dd = U.cheb(x, y, h.x, h.y);
        if (dd >= 2 && dd <= 4 && G.canEnter(m, x, y) && !G.isHazardFor(m, x, y) && G.hasLOS(x, y, h.x, h.y)) spots.push([x, y]);
      }
      if (spots.length) {
        const p = rng().pick(spots), ox = m.x, oy = m.y;
        m.x = p[0]; m.y = p[1];
        G.fx.teleport(m, ox, oy); G.fx.sound('teleport');
        if (G.visible(m.x, m.y) || G.visible(ox, oy)) G.log('L\'Anonimo Multiforme svanisce nel nulla... e riappare altrove!', 'bad');
        AI.setCd(m, 'blink', 6);
        return;
      }
    }
    AI.ranged(m);
  };
  // Il Guardiano Urlante: quando il terzo occhio ti scorge, il suo urlo sveglia i dintorni
  AI.guardiano = function (m) {
    if (m.st.seesHero && !m.st.urlo) {
      m.st.urlo = true;
      G.wakeAround(m.x, m.y, 9);
      G.fx.ring(m.x, m.y, 4, '#c8a070'); G.fx.sound('roar');
      G.fx.float(m.x, m.y, 'Urlo!', '#ffd23a', { small: true });
      G.log('Il terzo occhio del Guardiano Urlante ti ha visto: il suo urlo sveglia tutti i dintorni!', 'bad');
      return;
    }
    AI.melee(m);
  };
  // Malvagius il Terribile: l'aura di crudeltà ferisce chi gli sta accanto
  AI.aura = function (m) {
    if (m.st.mode === 'hunt') {
      for (const o of G.run.ents) if (!o.dead && G.hostile(o, m) && dist(o, m) <= 1) G.dealDamage(m, o, 2 + G.regionOf(G.run.floor), { pierce: true, dot: true, src: 'Aura di Crudeltà', color: '#b77cff' });
    }
    AI.melee(m);
  };
  // Sentinel il Guardiano Lavico: chiama i rinforzi dei Signori di Magor
  AI.sentinel = function (m) {
    if (m.st.seesHero && !m.st.chiamata) {
      m.st.chiamata = true;
      G.wakeAround(m.x, m.y, 12);
      AI.summon(m, 'minatore', 1, m.x, m.y, 2);
      G.fx.ring(m.x, m.y, 5, '#ffd23a'); G.fx.sound('roar');
      G.log('I mille occhi di Sentinel ti hanno visto: chiama i rinforzi dei Signori di Magor!', 'bad');
      return;
    }
    AI.melee(m);
  };
  // Brags il Tristo Mietitore: fiuta i feriti e diventa più rapido
  AI.reaper = function (m) {
    const h = G.run.hero;
    if (!m.st.fiuto && h.hp < h.maxHp * 0.5 && m.st.mode === 'hunt') {
      m.st.fiuto = true; m.speed = Math.round(m.speed * 1.3);
      if (G.visible(m.x, m.y)) G.log('Brags fiuta le tue ferite e accelera il passo...', 'bad');
    }
    AI.melee(m);
  };
  // Forgius: il martello (slam) e l'ondata di lava dall'altro braccio
  AI.forgius = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    const h = G.run.hero, d = dist(m, h);
    if (AI.ready(m, 'onda') && m.st.seesHero && d >= 2 && d <= 5 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      const [dx, dy] = U.dirTo(m.x, m.y, h.x, h.y);
      AI.tele(m, AI.shapes.cone(m.x, m.y, dx, dy, 4), { k: 'colata', dmg: [9, 13], elem: 'fuoco', turns: 8, color: '#ff6a1a', src: 'Ondata di Lava' }, { label: 'Ondata di Lava' });
      G.fx.float(m.x, m.y, 'Ondata di Lava!', '#ff6a1a', { small: true });
      G.log('Forgius punta il braccio-cannone: un\'ondata di lava sta per travolgerti!', 'bad');
      AI.setCd(m, 'onda', 6);
      return;
    }
    AI.melee(m);
  };
  // Beccoduro: vola altissimo e piomba in picchiata
  AI.diver = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    const h = G.run.hero, d = dist(m, h);
    if (AI.ready(m, 'picchiata') && m.st.seesHero && d >= 2 && d <= 6 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      AI.tele(m, [[h.x, h.y]], { k: 'dive', center: [h.x, h.y], dmg: [9, 13], elem: 'aria', color: '#ff6a4a', src: 'Picchiata' }, { label: 'Picchiata' });
      G.fx.float(m.x, m.y, 'Picchiata!', '#ff6a4a', { small: true });
      if (G.visible(m.x, m.y)) G.log('Beccoduro sale in alto... e si prepara a piombarti addosso!', 'bad');
      AI.setCd(m, 'picchiata', 5);
      return;
    }
    AI.melee(m);
  };
  // Dragon l'Inceneritore: fiumi di fuoco dalla bocca
  AI.breath = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    const h = G.run.hero, d = dist(m, h);
    if (AI.ready(m, 'soffio') && m.st.seesHero && d <= 4 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      const [dx, dy] = U.dirTo(m.x, m.y, h.x, h.y);
      AI.tele(m, AI.shapes.cone(m.x, m.y, dx, dy, 4), { dmg: [8, 11], elem: 'fuoco', fire: 2, color: '#ff6a2a', src: 'Fiume di Fuoco' }, { label: 'Fiume di Fuoco' });
      G.fx.float(m.x, m.y, 'Fiume di Fuoco!', '#ff6a2a', { small: true });
      if (G.visible(m.x, m.y)) G.log('Dragon l\'Inceneritore inspira... sta per soffiare un fiume di fuoco!', 'bad');
      AI.setCd(m, 'soffio', 5);
      return;
    }
    AI.melee(m);
  };
  // Magufo: lo Psicopotere solleva l'eroe e lo scaraventa lontano
  AI.telecinesi = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    const h = G.run.hero, d = dist(m, h);
    if (AI.ready(m, 'psico') && m.st.seesHero && d <= 6 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      AI.tele(m, [[h.x, h.y]], { k: 'fling', dmg: [4, 6], elem: 'aria', push: 3, color: '#ff7ab0', src: 'Psicopotere' }, { label: 'Psicopotere' });
      G.fx.float(m.x, m.y, 'Psicopotere!', '#ff7ab0', { small: true });
      if (G.visible(m.x, m.y)) G.log('Gli occhi di Magufo si accendono: il suo Psicopotere sta per sollevarti!', 'bad');
      AI.setCd(m, 'psico', 6);
      return;
    }
    AI.ranged(m);
  };
  G.TELE_FN.fling = function (owner, tiles, p) {
    if (!owner || owner.dead) return;
    for (const [x, y] of tiles) {
      const e = G.entityAt(x, y);
      if (!e || e.dead || !G.hostile(owner, e)) continue;
      G.fx.burst(x, y, p.color || '#ff7ab0', 10);
      G.dealDamage(owner, e, rng().int(p.dmg[0], p.dmg[1]), { elem: p.elem, src: p.src });
      if (!e.dead) G.knockback(owner, e, p.push || 3);
    }
    G.fx.sound('wind');
  };
  // Magicorvo: il negromante richiama le ombre dei caduti
  AI.negromante = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    if (AI.ready(m, 'ombre') && m.st.seesHero && AI.countType('ombra') < 2) {
      AI.summon(m, 'ombra', 1, m.x, m.y, 2);
      G.fx.ring(m.x, m.y, 2, '#b77cff'); G.fx.sound('dark');
      if (G.visible(m.x, m.y)) G.log('Magicorvo pronuncia una formula: un\'ombra risale dal regno dei morti!', 'bad');
      AI.setCd(m, 'ombre', 10);
      return;
    }
    AI.ranged(m);
  };
  // Ombrassassina: immobile nell'ombra, poi un balzo fulminante
  AI.agguato = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    const h = G.run.hero, d = dist(m, h);
    if (AI.ready(m, 'balzo') && d >= 2 && d <= 4 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      const spots = U.DIRS8.map(q => [h.x + q[0], h.y + q[1]]).filter(p => G.canEnter(m, p[0], p[1]) && !G.isHazardFor(m, p[0], p[1]))
        .sort((a, b) => U.cheb(a[0], a[1], m.x, m.y) - U.cheb(b[0], b[1], m.x, m.y));
      if (spots.length) {
        G.moveTo(m, spots[0][0], spots[0][1], { dash: true });
        if (m.dead) return;
        if (G.visible(m.x, m.y)) G.log('Ombrassassina balza fuori dall\'ombra!', 'bad');
        G.attack(m, h, { mult: 1.3 });
        AI.setCd(m, 'balzo', 6);
        return;
      }
    }
    AI.melee(m);
  };

  // ------------------------------------------------------------ effetti al colpo
  // Buconero: il vortice a volte scaglia la preda in un altro punto della regione
  G.MON.buconero.onHit = (a, d) => {
    if (d.kind !== 'hero' || !rng().chance(0.2)) return;
    const s = G.randomFreeTile(d, 0);
    if (!s || U.cheb(s[0], s[1], d.x, d.y) < 6) return;
    const ox = d.x, oy = d.y;
    d.x = s[0]; d.y = s[1];
    G.fx.teleport(d, ox, oy); G.fx.sound('teleport');
    G.run.distMapsDirty = true;
    G.log('Il vortice di Buconero ti inghiotte e ti scaglia in un altro punto della regione!', 'bad');
  };
})();

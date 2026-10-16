'use strict';
// ============================================================
//  data_monsters2.js : Pianura delle Nebbie, Regione di Oscuro Orizzonte,
//  Lupo Alfa, Riflesso e alleati dei nuovi eroi (+ le loro IA)
// ============================================================
(function () {
  const U = G.U, T = G.T, AI = G.AI;
  const st = (name, t, p, chance) => (a, d) => { if (!chance || G.run.rng.chance(chance)) G.addStatus(d, name, t, p); };
  const rng = () => G.run.rng;

  Object.assign(G.MON, {
    // ================= FORESTA (sinergia di branco) =================
    lupoalfa: {
      name: 'Lupo Alfa', elem: 'terra', hp: 18, atk: [3, 5], eva: 8, speed: 120, xp: 7, ai: 'alpha', escort: ['lupo', 2],
      desc: 'Il capobranco. Il suo ululato rende più feroci i lupi vicini: abbattilo per primo.',
    },
    // ================= PIANURA DELLE NEBBIE =================
    lupocenere: {
      name: 'Lupo delle Nebbie', elem: 'aria', hp: 14, atk: [3, 5], eva: 10, speed: 120, xp: 5, ai: 'melee', pack: [2, 3],
      desc: 'Grigio come la bruma, caccia in branco nella nebbia: lo vedi solo quando ti è addosso.',
    },
    spettronebbia: {
      name: 'Spettro della Nebbia', elem: 'aria', hp: 12, atk: [2, 4], eva: 15, speed: 100, xp: 6, ai: 'ranged', flags: { fly: true, kiter: true },
      ranged: { range: 5, cd: 3, dmg: [3, 5], elem: 'aria', proj: 'mist', status: ['blind', 2, 0] },
      desc: 'Prende forma dalla bruma e ti acceca con soffi gelidi.',
    },
    golemlava: {
      name: 'Golem di Lava', elem: 'fuoco', hp: 28, atk: [4, 7], def: 4, speed: 70, xp: 8, ai: 'melee', flags: { fireImmune: true },
      desc: 'Roccia fusa che cammina. Quando va in pezzi, i suoi frammenti incandescenti esplodono tutto intorno.',
    },
    sciamanolava: {
      name: 'Sciamano della Lava', elem: 'fuoco', hp: 16, atk: [2, 4], speed: 100, xp: 7, ai: 'support', support: 'ward', flags: { kiter: true, fireImmune: true },
      ranged: { range: 5, cd: 2, dmg: [3, 5], elem: 'fuoco', proj: 'fire', status: ['burn', 2, 2] },
      desc: 'Avvolge i compagni in corazze di roccia fusa. Eliminalo per primo.',
    },
    lavor: {
      name: 'Lavor il Potente', elem: 'fuoco', hp: 75, atk: [6, 9], def: 5, speed: 90, xp: 25, ai: 'melee', flags: { elite: true, noKnock: true, fireImmune: true },
      slam: { cd: 5, shape: 'cross', r: 5, dmg: [8, 12], fire: 2, color: '#ff8a2a', label: 'Dardi Infuocati' },
      desc: 'ÉLITE. Una corazzata del Popolo della Lava (Prima Serie): spara dardi infuocati dal braccio, dal collo e dalla testa, in ogni direzione.',
    },
    lavion: {
      name: 'Lavion', title: 'Il Signore del Terrore', elem: 'fuoco', hp: 240, atk: [6, 9], def: 3, speed: 90, xp: 60, ai: 'boss_lavion',
      flags: { boss: true, noKnock: true, fireImmune: true, alwaysAwake: true }, big: true,
      desc: 'BOSS. Signore del Popolo della Lava (Prima Serie). Il suo braccio vive di vita propria e "anche le rocce s\'inchinano a lui e tremano al suo passaggio". Nella nebbia, il terrore è la sua arma.',
    },
    braccio: {
      name: 'Braccio di Lavion', elem: 'neutro', hp: 45, atk: [5, 8], def: 1, speed: 110, xp: 10, ai: 'ranged', flags: { alwaysAwake: true, noKnock: true },
      ranged: { range: 4, cd: 3, dmg: [4, 7], elem: 'neutro', proj: 'ink', pull: 2 },
      desc: 'Il braccio di Lavion vive di vita propria: staccato dal corpo, afferra e trascina le sue prede.',
    },
    // ================= REGIONE DI OSCURO ORIZZONTE =================
    cristallonero: {
      name: 'Cristallo Oscuro', elem: 'tenebre', hp: 30, atk: [3, 5], def: 3, speed: 100, xp: 9, ai: 'turret', flags: { stationary: true, noKnock: true },
      ranged: { range: 6, cd: 2, dmg: [6, 9], elem: 'tenebre', proj: 'shadow' },
      desc: 'Un cristallo d\'ombra cresciuto oltre la Porta Ultradimensionale. Spara dardi di tenebra e non si muove.',
    },
    falenanotte: {
      name: 'Falena della Notte', elem: 'tenebre', hp: 18, atk: [4, 6], eva: 22, speed: 130, xp: 8, ai: 'erratic', flags: { fly: true },
      onHit: st('confuse', 1, 0, 0.25), desc: 'Le sue ali nere spargono una polvere che confonde.',
    },
    cavaliereombra: {
      name: 'Cavaliere d\'Ombra', elem: 'tenebre', hp: 40, atk: [6, 9], def: 5, speed: 90, xp: 11, ai: 'paladin',
      desc: 'Un guerriero del Popolo delle Tenebre. Si protegge con uno scudo d\'ombra che si rigenera.',
    },
    accolitonotte: {
      name: 'Accolito della Notte', elem: 'tenebre', hp: 24, atk: [3, 5], speed: 100, xp: 10, ai: 'support', support: 'haste', flags: { kiter: true },
      ranged: { range: 5, cd: 2, dmg: [5, 8], elem: 'tenebre', proj: 'shadow' },
      desc: 'Rende più rapidi e feroci i suoi alleati. Eliminalo per primo.',
    },
    pantanera: {
      name: 'Pantanera il Sergente del Terrore', elem: 'tenebre', hp: 130, atk: [8, 12], def: 3, speed: 110, xp: 45, ai: 'melee', flags: { elite: true, noKnock: true },
      slam: { cd: 4, shape: 'target', r: 1, dmg: [10, 14], status: 'weak', st: 3, color: '#9ae07a', label: 'Assalto del Terrore' },
      desc: 'ÉLITE. Pantera-demone del Popolo delle Tenebre (Terza Serie): l\'unica ad aver già combattuto la Luce al fianco di Obscurio. Seconda per pericolosità solo al suo Signore.',
    },
    // ================= SPECIALI =================
    riflesso: {
      name: 'Riflesso', elem: 'neutro', hp: 20, atk: [3, 5], speed: 100, xp: 10, ai: 'melee', flags: { alwaysAwake: true },
      desc: 'Il tuo riflesso oscuro, uscito dallo Specchio di Obscurio.',
    },
    // ================= ALLEATI DEI NUOVI EROI =================
    lupospirito: { name: 'Lupo Spirituale', elem: 'foresta', hp: 20, atk: [3, 6], speed: 130, xp: 0, ai: 'ally', desc: 'Uno spirito del bosco evocato da Barbataus.' },
    fiore: { name: 'Fiore della Vita', elem: 'foresta', hp: 15, atk: [0, 0], speed: 100, xp: 0, ai: 'flower', flags: { stationary: true, noKnock: true }, desc: 'Cura il suo evocatore se gli resta vicino.' },
    antico: { name: 'Guardiano Antico', elem: 'foresta', hp: 60, atk: [5, 9], def: 3, speed: 90, xp: 0, ai: 'ally', flags: { noKnock: true }, desc: 'Un treant millenario risvegliato da Barbataus.' },
  });

  // ------------------------------------------------------------ effetti alla morte
  G.MON.golemlava.onDeath = (e) => {
    const tiles = AI.shapes.square(e.x, e.y, 1, true);
    G.telegraph(null, tiles, { k: 'blast', dmg: [5, 8], elem: 'fuoco', fire: 2, friendly: true, color: '#ff8a2a', src: 'frammenti di lava', sound: 'boom' }, { color: '#ff8a2a', label: 'Frammenti di lava', cancelOnDeath: false });
    if (G.visible(e.x, e.y)) G.log('Il Golem di Lava va in pezzi: i frammenti incandescenti stanno per esplodere!', 'bad');
  };

  // ------------------------------------------------------------ IA
  const dist = (a, b) => U.cheb(a.x, a.y, b.x, b.y);
  AI.alpha = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    if (AI.ready(m, 'howl')) {
      const pack = G.run.ents.filter(o => !o.dead && o !== m && o.faction === 'enemy' && /lupo|lavico/.test(o.type) && dist(o, m) <= 5);
      if (pack.length) {
        for (const o of pack) { G.addStatus(o, 'empower', 4); G.alert(o, G.run.hero); }
        G.fx.ring(m.x, m.y, 4, '#ffb04a'); G.fx.sound('roar');
        G.fx.float(m.x, m.y, 'Ululato!', '#ffb04a', { small: true });
        if (G.visible(m.x, m.y)) G.log('Il Lupo Alfa ulula: il branco diventa più feroce!', 'bad');
        AI.setCd(m, 'howl', 6);
        return;
      }
    }
    AI.melee(m);
  };
  AI.paladin = function (m) {
    if (m.st.mode === 'wander') return AI.wander(m);
    if (!m.status.shield && AI.ready(m, 'ward') && m.st.seesHero) {
      G.addStatus(m, 'shield', 30, 12 + G.regionOf(G.run.floor) * 3);
      G.fx.ring(m.x, m.y, 0.8, '#b77cff'); G.fx.sound('shield');
      AI.setCd(m, 'ward', 6);
      return;
    }
    AI.melee(m);
  };
  AI.flower = function (m) {
    const h = G.run.hero;
    if (dist(m, h) <= 2 && h.hp < h.maxHp) {
      const amt = 2 + Math.floor(h.level / 4) + (m.flags.bonusHeal || 0);
      G.heal(h, amt, true);
      G.fx.bolt(m.x, m.y, h.x, h.y, '#6effa0');
    }
  };

  // caselle di una colata di lava: dal punto di partenza verso il bersaglio, con qualche deviazione
  G.lavaFlowPath = function (x0, y0, tx, ty, len) {
    const out = [];
    let x = x0, y = y0;
    for (let i = 0; i < len; i++) {
      const opts = U.DIRS8.map(([dx, dy]) => [x + dx, y + dy]).filter(([nx, ny]) => G.inb(nx, ny) && !G.isSolid(nx, ny) && G.tileAt(nx, ny) !== T.DEEP && G.tileAt(nx, ny) !== T.STAIRS && !out.some(p => p[0] === nx && p[1] === ny));
      if (!opts.length) break;
      opts.sort((a, b) => U.cheb(a[0], a[1], tx, ty) - U.cheb(b[0], b[1], tx, ty));
      const p = rng().chance(0.7) ? opts[0] : rng().pick(opts.slice(0, 3));
      x = p[0]; y = p[1];
      out.push(p);
    }
    return out;
  };

  // ---- Lavion il Signore del Terrore ----
  AI.boss_lavion = function (m) {
    const R = G.run, h = R.hero, d = dist(m, h), SH = AI.shapes;
    AI.bossInit(m, { arm: 2, quake: 3, flow: 5, terror: 6 });
    const p2 = m.hp < m.maxHp * 0.5;
    if (p2 && !m.st.p2) {
      m.st.p2 = true; m.speed = 100;
      AI.summon(m, 'braccio', 1, m.x, m.y, 2);
      AI.phaseAnnounce(m, 'Il braccio di Lavion si stacca e striscia verso di te: vive di vita propria!', 'Lavion — Il Braccio Vivo');
      return;
    }
    // il terrore: chi incrocia il suo sguardo si sente mancare le forze
    if (AI.ready(m, 'terror') && d <= 6 && m.st.seesHero) {
      G.addStatus(h, 'weak', 3); G.addStatus(h, 'slow', 2);
      G.fx.ring(m.x, m.y, 4, '#ff5a2a'); G.fx.sound('roar');
      G.log('Lavion ti fissa e il terrore ti gela il sangue: sei Indebolito e Rallentato!', 'bad');
      AI.setCd(m, 'terror', 11);
      return;
    }
    // le rocce tremano al suo passaggio
    if (AI.ready(m, 'quake') && d <= 2) {
      AI.tele(m, SH.square(m.x, m.y, 2), { dmg: [8, 11], elem: 'terra', push: 1, color: '#c8a070', src: 'Le Rocce Tremano', shake: 7 }, { label: 'Le Rocce Tremano' });
      G.log('Lavion pesta il suolo: le rocce tremano tutto intorno a lui!', 'bad');
      AI.setCd(m, 'quake', p2 ? 4 : 5);
      return;
    }
    // il braccio vivo si allunga, afferra e trascina
    if (!p2 && AI.ready(m, 'arm') && d >= 2 && d <= 4 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      const tiles = [];
      for (const p of U.ray(m.x, m.y, h.x, h.y, 4)) { if (G.isSolid(p[0], p[1])) break; tiles.push(p); }
      AI.tele(m, tiles, { k: 'grab', dmg: [7, 10], elem: 'neutro', status: 'root', st: 2, color: '#c0c0c8', src: 'Braccio Vivo' }, { label: 'Braccio Vivo' });
      G.log('Il braccio di Lavion si allunga verso di te!', 'bad');
      AI.setCd(m, 'arm', 4);
      return;
    }
    // colata di lava
    if (AI.ready(m, 'flow') && d <= 8 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      const tiles = G.lavaFlowPath(m.x, m.y, h.x, h.y, Math.max(4, d + 2));
      if (tiles.length) {
        AI.tele(m, tiles, { k: 'colata', dmg: [7, 10], elem: 'fuoco', turns: 10, color: '#ff6a1a', src: 'Colata di Lava' }, { label: 'Colata di Lava' });
        G.log('Lavion scaglia una colata di lava!', 'bad');
        AI.setCd(m, 'flow', p2 ? 4 : 6);
        return;
      }
    }
    const adj = AI.adjacentHostile(m);
    if (adj) {
      G.attack(m, adj);
      if (!adj.dead && !p2 && rng().chance(0.35)) { G.fx.float(m.x, m.y, 'Il braccio colpisce!', '#c0c0c8', { small: true }); G.attack(m, adj); }
      return;
    }
    AI.chase(m);
  };

  // ---- Pianura delle Nebbie: colate di lava che scendono nella bruma ----
  G.REGION_TICK = G.REGION_TICK || {};
  G.REGION_TICK.nebbie = function (R) {
    if (G.isBossFloor(R.floor) || R.turn % 30 !== 15 || !rng().chance(0.6)) return;
    const h = R.hero, m = R.map, src = [];
    for (let y = Math.max(1, h.y - 20); y <= Math.min(m.h - 2, h.y + 20); y++) for (let x = Math.max(1, h.x - 20); x <= Math.min(m.w - 2, h.x + 20); x++) {
      const d = U.cheb(x, y, h.x, h.y);
      if (d >= 4 && G.tileAt(x, y) === T.LAVA && !(R.tempTiles || []).some(t => t.x === x && t.y === y)) src.push([x, y]);
    }
    if (!src.length) return;
    const [sx, sy] = rng().pick(src);
    const tiles = G.lavaFlowPath(sx, sy, h.x, h.y, rng().int(6, 9));
    if (!tiles.length) return;
    G.telegraph(null, tiles, { k: 'colata', dmg: [5, 8], elem: 'fuoco', turns: 10, color: '#ff6a1a', src: 'una colata di lava' }, { color: '#ff6a1a', label: 'Colata di Lava', delay: 2 });
    if (tiles.some(p => G.visible(p[0], p[1]))) {
      G.log('La terra trema: una colata di lava scende nella nebbia!', 'bad');
      G.hint('colata', 'Nella Pianura delle Nebbie la lava scende a colate: quando vedi le caselle rosse, spostati. La lava si raffredda dopo qualche turno.');
    }
  };
})();

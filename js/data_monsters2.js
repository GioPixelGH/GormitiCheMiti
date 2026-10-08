'use strict';
// ============================================================
//  data_monsters2.js : Ghiacciai Eterni, Tempio della Luce,
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
    // ================= GHIACCIAI ETERNI =================
    lupoghiaccio: {
      name: 'Lupo dei Ghiacci', elem: 'mare', hp: 14, atk: [3, 5], eva: 8, speed: 120, xp: 5, ai: 'melee', pack: [2, 3], flags: { iceWalk: true },
      onHit: st('slow', 2, 0, 0.25), desc: 'Corre sul ghiaccio senza scivolare. Il suo morso gela le membra.',
    },
    spiritogelido: {
      name: 'Spirito Gelido', elem: 'aria', hp: 12, atk: [2, 4], eva: 15, speed: 100, xp: 6, ai: 'ranged', flags: { fly: true, kiter: true },
      ranged: { range: 5, cd: 3, dmg: [3, 5], elem: 'mare', proj: 'ice', status: ['slow', 2, 0] },
      desc: 'Lancia schegge di ghiaccio che rallentano.',
    },
    golemghiaccio: {
      name: 'Golem di Ghiaccio', elem: 'mare', hp: 28, atk: [4, 7], def: 4, speed: 70, xp: 8, ai: 'melee', flags: { iceWalk: true },
      desc: 'Quando va in pezzi, le sue schegge esplodono tutto intorno.',
    },
    tricheco: {
      name: 'Tricheco Zannuto', elem: 'mare', hp: 24, atk: [4, 6], def: 2, speed: 90, xp: 7, ai: 'melee', flags: { iceWalk: true, swim: true },
      slam: { cd: 5, shape: 'line', r: 4, dmg: [7, 10], push: 2, color: '#bff4ff', label: 'Carica Zannuta' },
      desc: 'Si lancia in linea retta con le zanne in avanti.',
    },
    sciamano: {
      name: 'Sciamano dei Ghiacci', elem: 'mare', hp: 16, atk: [2, 4], speed: 100, xp: 7, ai: 'support', support: 'ward', flags: { kiter: true, iceWalk: true },
      ranged: { range: 5, cd: 2, dmg: [3, 5], elem: 'mare', proj: 'ice', status: ['slow', 2, 0] },
      desc: 'Avvolge i compagni in armature di ghiaccio. Eliminalo per primo.',
    },
    yeti: {
      name: 'Yeti Ancestrale', elem: 'mare', hp: 75, atk: [6, 9], def: 4, speed: 90, xp: 25, ai: 'melee', flags: { elite: true, noKnock: true, iceWalk: true },
      slam: { cd: 5, shape: 'around', r: 1, dmg: [9, 13], status: 'freeze', st: 1, color: '#e0f6ff', label: 'Pugno Glaciale' },
      desc: 'ÉLITE. Il guardiano delle vette. Il suo pugno congela tutto intorno.',
    },
    glaciator: {
      name: 'Glaciator', title: 'Il Re dei Ghiacci', elem: 'mare', hp: 240, atk: [6, 9], def: 4, speed: 90, xp: 60, ai: 'boss_glaciator',
      flags: { boss: true, noKnock: true, iceWalk: true, alwaysAwake: true }, big: true,
      desc: 'BOSS. Signore dei Ghiacciai Eterni. Lance di ghiaccio, bufere e un\'arena che diventa una lastra scivolosa.',
    },
    frammento: {
      name: 'Frammento di Ghiaccio', elem: 'mare', hp: 14, atk: [1, 2], def: 2, speed: 100, xp: 2, ai: 'turret',
      flags: { stationary: true, noKnock: true, alwaysAwake: true },
      ranged: { range: 6, cd: 3, dmg: [4, 6], elem: 'mare', proj: 'ice', status: ['freeze', 1, 0] },
      desc: 'Una torretta di ghiaccio evocata da Glaciator.',
    },
    // ================= TEMPIO DELLA LUCE INFRANTA =================
    sentinella: {
      name: 'Sentinella di Cristallo', elem: 'luce', hp: 30, atk: [3, 5], def: 3, speed: 100, xp: 9, ai: 'turret', flags: { stationary: true, noKnock: true },
      ranged: { range: 6, cd: 2, dmg: [6, 9], elem: 'luce', proj: 'light' },
      desc: 'Un cristallo vivente che spara raggi di luce. Non si muove.',
    },
    falena: {
      name: 'Falena Abbagliante', elem: 'luce', hp: 18, atk: [4, 6], eva: 22, speed: 130, xp: 8, ai: 'erratic', flags: { fly: true },
      onHit: st('confuse', 1, 0, 0.25), desc: 'Le sue ali abbaglianti confondono chi la colpisce... e chi è colpito.',
    },
    paladino: {
      name: 'Paladino Corrotto', elem: 'luce', hp: 40, atk: [6, 9], def: 5, speed: 90, xp: 11, ai: 'paladin',
      desc: 'Un guerriero della Luce asservito a Magor. Si protegge con uno scudo che si rigenera.',
    },
    prisma: {
      name: 'Prisma Vivente', elem: 'luce', hp: 26, atk: [5, 8], def: 1, speed: 100, xp: 9, ai: 'melee',
      desc: 'Quando si spezza si divide in due schegge.',
    },
    scheggia: {
      name: 'Scheggia di Prisma', elem: 'luce', hp: 9, atk: [3, 5], speed: 120, xp: 2, ai: 'melee', flags: { alwaysAwake: true },
      desc: 'Un frammento di prisma ancora animato.',
    },
    accolito: {
      name: 'Accolito dell\'Alba', elem: 'luce', hp: 24, atk: [3, 5], speed: 100, xp: 10, ai: 'support', support: 'haste', flags: { kiter: true },
      ranged: { range: 5, cd: 2, dmg: [5, 8], elem: 'luce', proj: 'light' },
      desc: 'Rende più rapidi e feroci i suoi alleati. Eliminalo per primo.',
    },
    arconte: {
      name: 'Arconte di Luce', elem: 'luce', hp: 130, atk: [8, 12], def: 3, speed: 100, xp: 45, ai: 'melee', flags: { elite: true, noKnock: true },
      slam: { cd: 4, shape: 'target', r: 1, dmg: [10, 14], status: 'weak', st: 3, color: '#fff3a0', label: 'Giudizio' },
      desc: 'ÉLITE. Un giudice di luce corrotta. Il suo Giudizio indebolisce chi colpisce.',
    },
    luxalion: {
      name: 'Luxalion Corrotto', title: 'Il Prisma Infranto', elem: 'luce', hp: 460, atk: [9, 13], def: 3, speed: 110, xp: 60, ai: 'boss_luxalion',
      flags: { boss: true, noKnock: true, alwaysAwake: true }, big: true,
      desc: 'BOSS. Il campione del Popolo della Luce, corrotto da Magor. I Piloni Prismatici lo curano: distruggili!',
    },
    pilone: {
      name: 'Pilone Prismatico', elem: 'luce', hp: 40, atk: [0, 0], def: 2, speed: 100, xp: 3, ai: 'pylon',
      flags: { stationary: true, noKnock: true, alwaysAwake: true },
      desc: 'Cura Luxalion a ogni turno finché resta in piedi.',
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
  G.MON.golemghiaccio.onDeath = (e) => {
    const tiles = AI.shapes.square(e.x, e.y, 1, true);
    G.telegraph(null, tiles, { k: 'blast', dmg: [5, 8], elem: 'mare', status: 'slow', st: 2, friendly: true, color: '#bff4ff', src: 'schegge di ghiaccio', sound: 'ice' }, { color: '#bff4ff', label: 'Schegge', cancelOnDeath: false });
    if (G.visible(e.x, e.y)) G.log('Il Golem di Ghiaccio va in frantumi: le schegge stanno per esplodere!', 'bad');
  };
  G.MON.prisma.onDeath = (e) => {
    if (e.flags.summoned) return;
    G.spawnNear('scheggia', e.x, e.y, 2, { summon: true });
    if (G.visible(e.x, e.y)) G.log('Il Prisma Vivente si spezza in due schegge!', 'info');
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
      G.fx.ring(m.x, m.y, 0.8, '#fff3a0'); G.fx.sound('shield');
      AI.setCd(m, 'ward', 6);
      return;
    }
    AI.melee(m);
  };
  AI.pylon = function (m) {
    const R = G.run;
    const b = R.ents.find(e => !e.dead && (e.type === 'luxalion'));
    if (!b || b.hp >= b.maxHp) return;
    const amt = 9 + (R.eclissi || 0) * 2;
    G.heal(b, amt, true);
    if (G.visible(m.x, m.y) || G.visible(b.x, b.y)) { G.fx.bolt(m.x, m.y, b.x, b.y, '#fff3a0'); G.fx.float(b.x, b.y, '+' + amt, '#fff3a0', { small: true }); }
  };
  AI.flower = function (m) {
    const h = G.run.hero;
    if (dist(m, h) <= 2 && h.hp < h.maxHp) {
      const amt = 2 + Math.floor(h.level / 4) + (m.flags.bonusHeal || 0);
      G.heal(h, amt, true);
      G.fx.bolt(m.x, m.y, h.x, h.y, '#6effa0');
    }
  };

  // ---- Glaciator ----
  AI.boss_glaciator = function (m) {
    const R = G.run, h = R.hero, d = dist(m, h), SH = AI.shapes;
    AI.bossInit(m, { spikes: 2, shards: 4, blizzard: 7 });
    const p2 = m.hp < m.maxHp * 0.5;
    if (p2 && !m.st.p2) {
      m.st.p2 = true; m.speed = 110;
      for (const [x, y] of SH.circle(m.x, m.y, 5)) { const t = G.tileAt(x, y); if (t === T.FLOOR || t === T.SAND || t === T.RUBBLE) G.setTile(x, y, T.ICE); }
      AI.phaseAnnounce(m, 'Glaciator congela l\'arena: il suolo diventa una lastra di ghiaccio!', 'Glaciator — Gelo Eterno');
      return;
    }
    if (AI.ready(m, 'spikes') && d <= 8) {
      const tiles = p2 ? SH.star(m.x, m.y, 7) : SH.cross(m.x, m.y, 8);
      AI.tele(m, tiles, { dmg: [9, 13], elem: 'mare', status: 'freeze', st: 1, color: '#bff4ff', src: 'Lance di Ghiaccio', sound: 'ice' }, { label: 'Lance di Ghiaccio' });
      G.log('Lance di ghiaccio stanno per spuntare dal terreno!', 'bad');
      AI.setCd(m, 'spikes', p2 ? 3 : 4);
      return;
    }
    if (AI.ready(m, 'shards') && AI.countType('frammento') < 3) {
      G.log('Glaciator evoca Frammenti di Ghiaccio!', 'bad');
      AI.summon(m, 'frammento', 2, h.x, h.y, 3);
      AI.setCd(m, 'shards', 8);
      return;
    }
    if (AI.ready(m, 'blizzard') && d <= 7) {
      G.addStatus(h, 'darkness', 3); G.addStatus(h, 'slow', 2);
      G.fx.flash('#e0f6ff'); G.fx.sound('wind');
      G.log('Una bufera ti avvolge: vedi poco e ti muovi a fatica!', 'bad');
      AI.setCd(m, 'blizzard', 10);
      return;
    }
    AI.chase(m);
  };

  // ---- Luxalion Corrotto ----
  const D8 = U.DIRS8;
  AI.boss_luxalion = function (m) {
    const R = G.run, h = R.hero, d = dist(m, h), SH = AI.shapes;
    if (!m.st.init) {
      AI.bossInit(m, { beam: 2, flash: 6 });
      AI.summon(m, 'pilone', 2, m.x, m.y, 4);
      G.log('Due Piloni Prismatici si accendono: finché esistono, curano Luxalion!', 'bad');
      return;
    }
    const p2 = m.hp < m.maxHp * 0.5;
    if (p2 && !m.st.p2) {
      m.st.p2 = true;
      const s = G.randomFreeTile(m, 0);
      if (s && U.cheb(s[0], s[1], h.x, h.y) >= 5) { const ox = m.x, oy = m.y; m.x = s[0]; m.y = s[1]; G.fx.teleport(m, ox, oy); }
      AI.summon(m, 'pilone', 2, m.x, m.y, 4);
      AI.summon(m, 'prisma', 1, m.x, m.y, 3);
      AI.phaseAnnounce(m, 'Luxalion si rifrange e accende nuovi piloni!', 'Luxalion — Rifrazione');
      return;
    }
    if (AI.ready(m, 'beam') && d <= 10 && G.hasLOS(m.x, m.y, h.x, h.y)) {
      const [dx, dy] = U.dirTo(m.x, m.y, h.x, h.y);
      const k = D8.findIndex(q => q[0] === dx && q[1] === dy);
      let tiles = [];
      for (const off of [-1, 0, 1]) { const q = D8[(k + off + 8) % 8]; tiles = tiles.concat(SH.line(m.x, m.y, q[0], q[1], 10)); }
      AI.tele(m, tiles, { dmg: [11, 15], elem: 'luce', color: '#fff3a0', src: 'Raggio Prismatico', sound: 'thunder' }, { label: 'Raggio Prismatico' });
      G.log('Luxalion concentra la luce in tre raggi!', 'bad');
      AI.setCd(m, 'beam', p2 ? 3 : 4);
      return;
    }
    if (AI.ready(m, 'flash') && d <= 6) {
      G.addStatus(h, 'darkness', 3); G.addStatus(h, 'weak', 2);
      G.fx.flash('#ffffff'); G.fx.sound('holy');
      G.log('Un lampo accecante: vedi poco e i tuoi colpi si indeboliscono!', 'bad');
      AI.setCd(m, 'flash', 10);
      return;
    }
    AI.chase(m);
  };
})();

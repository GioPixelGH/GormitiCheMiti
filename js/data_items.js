'use strict';
// ============================================================
//  data_items.js : consumabili, reliquie, doni (perk)
// ============================================================
(function () {
  const U = G.U, T = G.T;

  const potionHeal = (h, frac) => {
    let f = frac * h.mods.potionMul;
    if (G.run.eclissi >= 4) f *= 0.75;
    return G.heal(h, h.maxHp * f);
  };

  // ------------------------------------------------------------
  //  CONSUMABILI
  // ------------------------------------------------------------
  G.ITEMS = [
    { id: 'pozione', name: 'Pozione di Linfa', w: 20, icon: 'potion', color: '#ff4a5a', target: 'self',
      desc: 'Cura il 40% dei PV massimi.', use(h) { potionHeal(h, 0.4); G.fx.sound('drink'); return true; } },
    { id: 'grande_pozione', name: 'Grande Pozione di Linfa', w: 5, icon: 'bigpotion', color: '#ff2a6a', target: 'self',
      desc: 'Cura completamente e rimuove gli stati negativi.', use(h) { potionHeal(h, 1); G.cleanse(h); G.fx.sound('drink'); return true; } },
    { id: 'acqua', name: 'Acqua Sorgiva', w: 10, icon: 'potion', color: '#5ad0ff', target: 'self',
      desc: 'Rimuove gli stati negativi e cura il 20% dei PV.', use(h) { G.cleanse(h); potionHeal(h, 0.2); G.fx.sound('drink'); return true; } },
    { id: 'elisir_furia', name: 'Elisir della Furia', w: 7, icon: 'potion', color: '#ff9a1a', target: 'self',
      desc: 'Riempie completamente la Furia.', use(h) { h.fury = 100; G.fx.sound('ready'); G.log('La Furia ti invade!', 'level'); return true; } },
    { id: 'ira', name: 'Pozione d\'Ira', w: 8, icon: 'potion', color: '#c81a1a', target: 'self',
      desc: 'Infliggi il 50% di danni in più per 10 turni.', use(h) { G.addStatus(h, 'rage', 10); G.fx.sound('drink'); return true; } },
    { id: 'tonico', name: 'Tonico di Pietra', w: 8, icon: 'potion', color: '#c8a070', target: 'self',
      desc: '+4 armatura per 15 turni.', use(h) { G.addStatus(h, 'stoneskin', 15, 4); G.fx.sound('shield'); return true; } },
    { id: 'fiala_ombra', name: 'Fiala d\'Ombra', w: 6, icon: 'potion', color: '#7a5aaa', target: 'self',
      desc: 'Diventi invisibile per 12 turni (i nemici ti perdono di vista).', use(h) {
        G.addStatus(h, 'invis', 12); for (const m of G.run.ents) if (m.kind === 'monster' && m.st.mode === 'hunt') m.st.lost = 10;
        G.fx.sound('teleport'); return true; } },
    { id: 'infuso', name: 'Infuso del Saggio', w: 6, icon: 'potion', color: '#d0ff8a', target: 'self',
      desc: 'Azzera la ricarica di tutte le abilità.', use(h) { for (const s of h.skills) s.cd = 0; G.fx.sound('ready'); return true; } },
    { id: 'frutto', name: 'Frutto di Gorm', w: 3, icon: 'fruit', color: '#ffcf3a', target: 'self',
      desc: '+6 PV massimi permanenti.', use(h) { h.maxHp += 6; h.hp += 6; G.fx.sound('levelup'); G.log('Ti senti più robusto. (+6 PV max)', 'good'); return true; } },
    { id: 'bomba', name: 'Bomba di Pietra Focaia', w: 14, icon: 'bomb', color: '#ff6a2a', target: 'tile', range: 6,
      desc: 'Lanciala: esplode in raggio 1 infliggendo pesanti danni da fuoco.', use(h, p) {
        const reg = G.regionOf(G.run.floor);
        G.fx.projectile(h.x, h.y, p[0], p[1], 'bomb');
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const x = p[0] + dx, y = p[1] + dy;
          G.fx.burst(x, y, '#ff7a2a', 6, 140);
          G.igniteTile(x, y, 3);
          const o = G.entityAt(x, y);
          if (o && o !== h) G.dealDamage(h, o, 12 + reg * 6, { elem: 'fuoco', delay: 150, noFury: true });
        }
        G.fx.shake(6); G.fx.sound('boom');
        return true; } },
    { id: 'ghiaccio', name: 'Ampolla di Ghiaccio', w: 9, icon: 'flask', color: '#bff4ff', target: 'tile', range: 6,
      desc: 'Lanciala: congela per 3 turni chiunque in raggio 1.', use(h, p) {
        G.fx.projectile(h.x, h.y, p[0], p[1], 'ice');
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const x = p[0] + dx, y = p[1] + dy;
          G.fx.burst(x, y, '#bff4ff', 5, 140);
          const o = G.entityAt(x, y);
          if (o && o !== h) G.addStatus(o, 'freeze', 3);
          if (G.inb(x, y)) G.run.map.fire[G.idx(x, y)] = 0;
        }
        G.fx.sound('ice');
        return true; } },
    { id: 'vento', name: 'Pergamena del Vento', w: 8, icon: 'scroll', color: '#a8ecff', target: 'self',
      desc: 'Ti teletrasporta in un punto casuale del piano.', use(h) {
        const s = G.randomFreeTile(h, 0); if (!s) return false;
        const ox = h.x, oy = h.y; h.x = s[0]; h.y = s[1]; G.run.distMapsDirty = true;
        G.fx.teleport(h, ox, oy); G.fx.sound('teleport'); G.onEnter(h, {}); return true; } },
    { id: 'mappatura', name: 'Pergamena di Mappatura', w: 7, icon: 'scroll', color: '#ffe9a0', target: 'self',
      desc: 'Rivela la mappa del piano, il portale e i tesori.', use(h) { G.revealMap(); G.fx.sound('arcane'); G.log('La mappa del piano si rivela!', 'good'); return true; } },
  ];
  G.ITEM_BY_ID = {}; for (const it of G.ITEMS) G.ITEM_BY_ID[it.id] = it;

  // ------------------------------------------------------------
  //  RELIQUIE (passive permanenti)
  // ------------------------------------------------------------
  const R = (id, name, rarity, icon, color, desc, apply) => ({ id, name, rarity, icon, color, desc, apply });
  G.RELICS = [
    // --- comuni ---
    R('radice_antica', 'Radice Antica', 'comune', 'root', '#8a6a3a', '+10 PV massimi.', h => { h.maxHp += 10; h.hp += 10; }),
    R('artiglio_grifone', 'Artiglio di Grifone', 'comune', 'claw', '#e0c080', '+8% probabilità di critico.', h => { h.crit += 8; }),
    R('scaglia', 'Scaglia di Drago', 'comune', 'scale', '#5aa070', '+1 armatura.', h => { h.def += 1; }),
    R('piuma', 'Piuma di Noctis', 'comune', 'feather', '#e8f4ff', '+7 schivata.', h => { h.eva += 7; }),
    R('guanto', 'Guanto del Titano', 'comune', 'glove', '#b08050', '+2 danni a ogni attacco.', h => { h.mods.dmg += 2; }),
    R('zanna', 'Zanna di Lupo', 'comune', 'fang', '#f0f0e0', 'Uccidere un nemico ti cura di 3 PV.', h => { h.mods.killHeal += 3; }),
    R('totem', 'Totem della Furia', 'comune', 'totem', '#ff7a2a', '+30% guadagno di Furia.', h => { h.mods.furyMul += 0.3; }),
    R('borsa', 'Borsa del Mercante', 'comune', 'bag', '#c8a050', '+50% Frammenti raccolti e sconto del 15% dai mercanti.', h => { h.mods.goldMul += 0.5; h.mods.shopDiscount += 0.15; }),
    R('seme', 'Seme di Grandalbero', 'comune', 'seed', '#6ee05a', 'All\'arrivo su ogni piano curi il 20% dei PV.', h => { h.mods.floorHeal += 0.2; }),
    R('conchiglia', 'Conchiglia Sussurrante', 'comune', 'shell', '#ffc0d0', 'Rigeneri 1 PV ogni 5 turni.', h => { h.mods.regen += 0.2; }),
    R('ampolla', 'Ampolla Infinita', 'comune', 'flask', '#ff4a5a', 'Le pozioni curano il 50% in più.', h => { h.mods.potionMul += 0.5; }),
    R('occhio_falco', 'Occhio di Falco', 'comune', 'eye', '#ffd23a', '+2 raggio visivo e +4% critico.', h => { h.mods.sight += 2; h.crit += 4; }),
    R('scudo_corallo', 'Scudo di Corallo', 'comune', 'shieldr', '#ff8a7a', 'Inizi ogni piano con uno Scudo di 12 PV.', h => { h.mods.floorShield += 12; }),
    R('bussola', 'Bussola del Saggio', 'comune', 'compass', '#c0c0ff', 'Il portale di ogni piano è sempre visibile sulla mappa.', h => { h.mods.revealStairs = true; }),
    R('collana_spine', 'Collana di Spine', 'comune', 'necklace', '#7be04a', 'Chi ti colpisce in mischia subisce 3 danni.', h => { h.mods.thorns += 3; }),
    R('spora', 'Spora Madre', 'comune', 'spore', '#9be35a', 'I tuoi attacchi avvelenano (1).', h => { h.mods.poisonOnHit += 1; }),
    // --- rare ---
    R('clessidra', 'Clessidra del Saggio', 'rara', 'hourglass', '#ffe9a0', 'Tutte le ricariche delle abilità -1 turno.', h => { h.mods.cdr += 1; }),
    R('mappa_gorm', 'Mappa di Gorm', 'rara', 'map', '#e8d0a0', 'All\'arrivo su ogni piano la mappa è rivelata.', h => { h.mods.revealMap = true; }),
    R('dente_squalo', 'Dente di Squalo', 'rara', 'fang', '#d0e8ff', '+40% danni ai nemici sotto il 30% dei PV.', h => { h.mods.execute += 0.4; }),
    R('tamburo', 'Tamburo di Guerra', 'rara', 'drum', '#c86a3a', '+50% danni ai nemici con i PV al massimo.', h => { h.mods.firstStrike += 0.5; }),
    R('gemma', 'Gemma Elementale', 'rara', 'gem', '#ff6aff', 'Il vantaggio elementale diventa ×2 invece di ×1,5.', h => { h.mods.elemStrong = 2; }),
    R('amuleto_neutro', 'Amuleto dell\'Equilibrio', 'rara', 'amulet', '#d8d8d8', 'Non subisci più penalità elementali, né in attacco né in difesa.', h => { h.mods.noElemWeak = true; }),
    R('pietra_focaia', 'Pietra Focaia', 'rara', 'flint', '#ff6a2a', 'I tuoi attacchi hanno il 30% di probabilità di ustionare.', h => { h.mods.burnOnHit += 0.3; }),
    R('anello_tempesta', 'Anello della Tempesta', 'rara', 'ring', '#bfe8ff', 'Ogni 4 attacchi in mischia scatena un fulmine a catena.', h => { h.mods.chainEvery = 4; }),
    R('cristallo_vamp', 'Cristallo Vampirico', 'rara', 'gem', '#c81a3a', 'Ti curi del 10% dei danni inflitti.', h => { h.mods.lifesteal += 0.1; }),
    R('mantello', 'Mantello d\'Ombra', 'rara', 'cloak', '#5a4a8a', 'Inizi ogni piano invisibile per 8 turni. I nemici faticano a notarti.', h => { h.mods.floorInvis += 8; h.mods.stealth = true; }),
    R('elmo_kolossus', 'Elmo di Kolossus', 'rara', 'helm', '#b0a090', 'Immune a stordimento e congelamento. +5 PV massimi.', h => { h.mods.stunImmune = true; h.maxHp += 5; h.hp += 5; }),
    R('lente', 'Lente di Cristallo', 'rara', 'lens', '#7fd8ff', 'Le abilità a distanza hanno +2 gittata.', h => { h.mods.rangeBonus += 2; }),
    R('libro_saggio', 'Libro del Vecchio Saggio', 'rara', 'book', '#a07040', '+30% esperienza.', h => { h.mods.xpMul += 0.3; }),
    R('calice', 'Calice dell\'Eclissi', 'rara', 'chalice', '#b77cff', 'Ai level-up puoi scegliere tra 4 Doni invece di 3.', h => { h.mods.extraChoice = true; }),
    // --- leggendarie ---
    R('cuore_gorm', 'Frammento del Cuore di Gorm', 'leggendaria', 'heart', '#ffe66a', 'Quando muori, rinasci con il 50% dei PV (una volta sola).', h => { }),
    R('linfa_eterna', 'Linfa Eterna', 'leggendaria', 'drop', '#6effa0', 'Una volta per piano, quando scendi sotto il 25% dei PV, curi il 30%.', h => { h.mods.lastHope = true; }),
    R('occhio_vita', 'Scheggia dell\'Occhio della Vita', 'leggendaria', 'eye', '#fff3a0', '+15% a tutti i danni e +8 PV massimi.', h => { h.mods.dmgMul += 0.15; h.maxHp += 8; h.hp += 8; }),
    R('corona', 'Corona Spezzata', 'leggendaria', 'crown', '#ffcf4a', '+35% danni inflitti, ma subisci il 15% di danni in più.', h => { h.mods.dmgMul += 0.35; h.mods.dmgTakenMul += 0.15; }),
    // --- boss ---
    R('corno_cerbante', 'Corno di Cerbante', 'boss', 'horn', '#ff6a2a', '+3 danni e i tuoi attacchi ustionano il 25% delle volte.', h => { h.mods.dmg += 3; h.mods.burnOnHit += 0.25; }),
    R('perla_abissi', 'Perla degli Abissi', 'boss', 'pearl', '#bff4ff', '+15 PV massimi e rigeneri 1 PV ogni 4 turni.', h => { h.maxHp += 15; h.hp += 15; h.mods.regen += 0.25; }),
    R('mantello_obscurio', 'Velo di Obscurio', 'boss', 'cloak', '#b77cff', '+15% critico e +0,5 moltiplicatore critico.', h => { h.crit += 15; h.critMul += 0.5; }),
    R('piuma_fenice', 'Piuma di Fenice', 'boss', 'feather', '#ff8a2a', '+10 velocità e +10 schivata.', h => { h.speed += 10; h.eva += 10; }),
    R('cuore_magma', 'Cuore di Magma', 'boss', 'heart', '#ff4a1a', '+2 armatura, immunità a fuoco e lava.', h => { h.def += 2; h.flags.fireImmune = true; }),
  ];
  G.RELIC_BY_ID = {}; for (const r of G.RELICS) G.RELIC_BY_ID[r.id] = r;
  G.RARITY = {
    comune: { name: 'Comune', color: '#c8c8c8' },
    rara: { name: 'Rara', color: '#5ab0ff' },
    leggendaria: { name: 'Leggendaria', color: '#ffb83a' },
    boss: { name: 'Trofeo', color: '#ff5a5a' },
  };

  // ------------------------------------------------------------
  //  DONI DEL SAGGIO (scelte al level-up)
  // ------------------------------------------------------------
  const P = (id, name, desc, apply, o) => Object.assign({ id, name, desc, apply, w: 10, max: 1 }, o || {});
  G.PERKS = [
    P('vigore', 'Vigore', '+10 PV massimi.', h => { h.maxHp += 10; h.hp += 10; }, { max: 6, w: 14 }),
    P('forza', 'Forza', '+1 danno a ogni attacco e abilità.', h => { h.mods.dmg += 1; }, { max: 6, w: 14 }),
    P('precisione', 'Precisione', '+6% probabilità di critico.', h => { h.crit += 6; }, { max: 4 }),
    P('agilita', 'Agilità', '+5 schivata.', h => { h.eva += 5; }, { max: 4 }),
    P('tempra', 'Tempra', '+1 armatura.', h => { h.def += 1; }, { max: 3, w: 9 }),
    P('letale', 'Colpo Letale', '+0,4 al moltiplicatore dei critici.', h => { h.critMul += 0.4; }, { max: 2, w: 7 }),
    P('rigenerazione', 'Rigenerazione', 'Rigeneri 1 PV ogni 6 turni.', h => { h.mods.regen += 1 / 6; }, { max: 3, w: 8 }),
    P('vampiro', 'Sete di Vita', 'Ti curi del 5% dei danni inflitti.', h => { h.mods.lifesteal += 0.05; }, { max: 3, w: 8 }),
    P('furia', 'Animo Furioso', '+25% guadagno di Furia.', h => { h.mods.furyMul += 0.25; }, { max: 2, w: 8 }),
    P('rapidita', 'Rapidità', '+8 velocità: agisci più spesso dei nemici.', h => { h.speed += 8; }, { max: 2, w: 6 }),
    P('cacciatore', 'Cacciatore di Titani', '+25% danni a élite e boss.', h => { h.mods.eliteDmg += 0.25; }, { max: 2, w: 7 }),
    P('fortuna', 'Fortuna', '+40% Frammenti raccolti.', h => { h.mods.goldMul += 0.4; }, { max: 2, w: 6 }),
    P('resilienza', 'Resilienza', 'Gli stati negativi su di te durano la metà.', h => { h.mods.statusResist = 0.5; }, { w: 6 }),
    P('concentrazione', 'Concentrazione', 'Tutte le ricariche -1 turno.', h => { h.mods.cdr += 1; }, { w: 5 }),
    P('sapere', 'Sapere', '+25% esperienza.', h => { h.mods.xpMul += 0.25; }, { max: 2, w: 6 }),
    P('seconda_pelle', 'Seconda Pelle', 'Inizi ogni piano con uno Scudo di 10 PV.', h => { h.mods.floorShield += 10; }, { max: 2, w: 6 }),
    P('elementalista', 'Elementalista', 'Il vantaggio elementale diventa ×1,8.', h => { h.mods.elemStrong = Math.max(h.mods.elemStrong, 1.8); }, { w: 6 }),
    P('carnefice', 'Carnefice', '+35% danni ai nemici sotto il 30% dei PV.', h => { h.mods.execute += 0.35; }, { w: 6 }),
    P('primo_colpo', 'Primo Colpo', '+40% danni ai nemici illesi.', h => { h.mods.firstStrike += 0.4; }, { w: 6 }),
    P('ultima_difesa', 'Ultima Difesa', 'Sotto il 30% dei PV ottieni +3 armatura.', h => { h.mods.lastStand = true; }, { w: 6 }),
    P('predatore', 'Predatore', 'Uccidere un nemico ti dà uno Scudo di 4 PV.', h => { h.mods.killShield += 4; }, { max: 2, w: 6 }),
    P('furia_ancestrale', 'Furia Ancestrale', '+15% a tutti i danni.', h => { h.mods.dmgMul += 0.15; }, { max: 2, w: 6, req: h => h.level >= 6 }),

    // --- GHEOS ---
    P('pugno_r', 'Pugno Sismico: Onda d\'Urto', 'Il Pugno Sismico colpisce entro 2 caselle.', h => { h.up.pugno_r = true; }, { hero: 'gheos' }),
    P('pugno_dmg', 'Pugno Sismico: Frattura', 'Il Pugno Sismico infligge 180% danni e stordisce 2 turni.', h => { h.up.pugno_dmg = true; }, { hero: 'gheos' }),
    P('carica_r', 'Carica: Valanga', 'La Carica arriva a 6 caselle, scaglia a 3 e stordisce.', h => { h.up.carica_r = true; }, { hero: 'gheos' }),
    P('scudo_big', 'Scudo di Roccia: Granito', 'Lo Scudo di Roccia è più potente del 50%.', h => { h.up.scudo_big = true; }, { hero: 'gheos' }),
    P('scudo_refl', 'Scudo di Roccia: Spigoli', 'Mentre hai uno Scudo, rimandi il 40% dei danni in mischia.', h => { h.mods.reflectShield = true; }, { hero: 'gheos' }),
    P('terremoto_r', 'Terremoto: Cataclisma', 'Il Terremoto colpisce entro 7 caselle.', h => { h.up.terremoto_r = true; }, { hero: 'gheos' }),
    P('gheos_roccia', 'Cuore di Montagna', '+2 armatura e +10 PV massimi.', h => { h.def += 2; h.maxHp += 10; h.hp += 10; }, { hero: 'gheos', req: h => h.level >= 5 }),
    // --- TASARAU ---
    P('radici_area', 'Radici: Groviglio', 'Le Radici colpiscono anche i nemici adiacenti al bersaglio.', h => { h.up.radici_area = true; }, { hero: 'tasarau' }),
    P('radici_dur', 'Radici: Morsa Velenosa', 'Le Radici durano 5 turni e il veleno è doppio.', h => { h.up.radici_dur = true; }, { hero: 'tasarau' }),
    P('spine_up', 'Spine: Rovo Antico', 'La Corazza di Spine dura 10 turni e infligge +3 danni.', h => { h.up.spine_up = true; }, { hero: 'tasarau' }),
    P('linfa_up', 'Linfa: Fonte della Vita', 'La Linfa Vitale cura il 50% e dà Rigenerazione.', h => { h.up.linfa_up = true; }, { hero: 'tasarau' }),
    P('risveglio_up', 'Risveglio: Bosco Sacro', 'Il Risveglio evoca 3 Germogli.', h => { h.up.risveglio_up = true; }, { hero: 'tasarau' }),
    P('tasarau_veleno', 'Linfa Tossica', 'I tuoi attacchi avvelenano (2).', h => { h.mods.poisonOnHit += 2; }, { hero: 'tasarau' }),
    // --- POIVRONS ---
    P('getto_pierce', 'Getto: Idrolama', 'Il Getto d\'Acqua perfora tutti i nemici in linea.', h => { h.up.getto_pierce = true; }, { hero: 'poivrons' }),
    P('getto_cd', 'Getto: Fonte Inesauribile', 'Il Getto d\'Acqua si ricarica in 1 turno.', h => { h.up.getto_cd = true; }, { hero: 'poivrons' }),
    P('onda_up', 'Onda: Tsunami', 'L\'Onda Anomala è lunga 6 e spinge di 3.', h => { h.up.onda_up = true; }, { hero: 'poivrons' }),
    P('bolla_up', 'Bolla: Sorgente', 'La Bolla Protettiva rigenera 2 PV a turno.', h => { h.up.bolla_up = true; }, { hero: 'poivrons' }),
    P('maremoto_r', 'Maremoto: Diluvio', 'Il Maremoto colpisce entro 6 caselle.', h => { h.up.maremoto_r = true; }, { hero: 'poivrons' }),
    P('poivrons_marea', 'Signore delle Maree', '+25% danni contro i nemici Bagnati (cumulativo).', h => { h.mods.wetBonus = (h.mods.wetBonus || 0) + 0.25; }, { hero: 'poivrons' }),
    // --- NOCTIS ---
    P('raffica_r', 'Raffica: Uragano', 'La Raffica arriva a 6 caselle e stordisce i nemici attraversati.', h => { h.up.raffica_r = true; }, { hero: 'noctis' }),
    P('fulmine_chain', 'Fulmine: Catena', 'Il Fulmine rimbalza su 4 nemici.', h => { h.up.fulmine_chain = true; }, { hero: 'noctis' }),
    P('fulmine_stun', 'Fulmine: Paralisi', 'Il Fulmine stordisce i nemici colpiti.', h => { h.up.fulmine_stun = true; }, { hero: 'noctis' }),
    P('vortice_up', 'Ciclone: Occhio del Tifone', 'Il Ciclone ha raggio 3 e infligge 120% danni.', h => { h.up.vortice_up = true; }, { hero: 'noctis' }),
    P('tempesta_up', 'Tempesta: Apocalisse', 'La Tempesta scaglia 12 fulmini.', h => { h.up.tempesta_up = true; }, { hero: 'noctis' }),
    P('noctis_ali', 'Ali del Vento', '+10 schivata e +5 velocità.', h => { h.eva += 10; h.speed += 5; }, { hero: 'noctis' }),
    // --- VECCHIO SAGGIO ---
    P('dardo_up', 'Dardo: Doppio Incanto', 'Il Dardo Arcano lancia un secondo dardo.', h => { h.up.dardo_up = true; }, { hero: 'saggio' }),
    P('passo_up', 'Passo: Onda Arcana', 'Il Passo Mistico esplode al punto di partenza.', h => { h.up.passo_up = true; }, { hero: 'saggio' }),
    P('sigillo_up', 'Sigillo: Marchio Supremo', 'Il Sigillo indebolisce e colpisce anche gli adiacenti.', h => { h.up.sigillo_up = true; }, { hero: 'saggio' }),
    P('saggio_mente', 'Mente Millenaria', 'Tutte le ricariche -1 e +20% Furia.', h => { h.mods.cdr += 1; h.mods.furyMul += 0.2; }, { hero: 'saggio' }),
    P('saggio_barriera', 'Barriera Arcana', 'Inizi ogni piano con uno Scudo di 15 PV e +1 armatura.', h => { h.mods.floorShield += 15; h.def += 1; }, { hero: 'saggio' }),
    // --- LUMINESCENTE ---
    P('raggio_up', 'Raggio: Luce Accecante', 'Il Raggio di Luce acceca i nemici colpiti.', h => { h.up.raggio_up = true; }, { hero: 'luminescente' }),
    P('bagliore_up', 'Bagliore: Alba', 'Il Bagliore ha raggio 4.', h => { h.up.bagliore_up = true; }, { hero: 'luminescente' }),
    P('prisma_up', 'Prisma: Cristallo Puro', 'Lo Scudo Prismatico cura il 25%.', h => { h.up.prisma_up = true; }, { hero: 'luminescente' }),
    P('lumi_aura', 'Aura Solare', '+1 armatura e l\'aura brucia anche per +2 danni.', h => { h.def += 1; h.mods.auraBonus = (h.mods.auraBonus || 0) + 2; }, { hero: 'luminescente' }),
    P('lumi_luce', 'Figlio del Sole', '+20% danni contro i nemici delle Tenebre... e +10% contro tutti gli altri.', h => { h.mods.dmgMul += 0.1; h.mods.lightBonus = true; }, { hero: 'luminescente' }),
  ];
  G.PERK_BY_ID = {}; for (const p of G.PERKS) G.PERK_BY_ID[p.id] = p;
})();

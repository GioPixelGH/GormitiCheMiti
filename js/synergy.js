'use strict';
// ============================================================
//  synergy.js : Risonanze (sinergie tra reliquie e Doni)
//  Ogni reliquia/dono ha un'affinità. Con 2 elementi della stessa
//  affinità si attiva il bonus minore, con 4 quello maggiore.
// ============================================================
(function () {
  G.SYNERGIES = {
    veleno:   { name: 'Veleno',   color: '#9be35a', glyph: '☠',
      t1: 'Il veleno che infliggi è più forte (+1) e i nemici avvelenati subiscono +10% danni da te.',
      t2: 'Pestilenza: un nemico avvelenato che muore contagia chi gli sta intorno.' },
    fuoco:    { name: 'Fuoco',    color: '#ff7a2a', glyph: '♨',
      t1: 'Le ustioni che infliggi durano 2 turni in più.',
      t2: 'Combustione: +25% danni ai nemici in fiamme, che esplodono quando muoiono.' },
    critico:  { name: 'Critico',  color: '#ffd23a', glyph: '✶',
      t1: '+6% probabilità di critico.',
      t2: 'Colpo Mortale: i critici stordiscono (non i boss) e riducono di 1 una ricarica.' },
    vita:     { name: 'Vita',     color: '#6effa0', glyph: '♥',
      t1: 'Le cure che ricevi sono più efficaci del 20%.',
      t2: 'Linfa Inesauribile: la cura in eccesso diventa Scudo (fino al 20% dei PV).' },
    difesa:   { name: 'Difesa',   color: '#9fd0ff', glyph: '⛨',
      t1: '+1 armatura.',
      t2: 'Fortezza: ogni turno ottieni 2 di Scudo (fino a 12).' },
    furia:    { name: 'Furia',    color: '#ff5a3a', glyph: '✊',
      t1: '+20% guadagno di Furia.',
      t2: 'Furia Ancestrale: dopo il Potere Supremo recuperi 35 di Furia e diventi Rapido.' },
    tempesta: { name: 'Tempesta', color: '#a8ecff', glyph: 'ϟ',
      t1: '+5 schivata.',
      t2: 'Occhio del Ciclone: chi ti manca viene colpito da un fulmine.' },
    saggezza: { name: 'Saggezza', color: '#d8b0ff', glyph: '✧',
      t1: '+15% esperienza.',
      t2: 'Illuminazione: ogni 4 turni tutte le ricariche scendono di 1 in più.' },
    fortuna:  { name: 'Fortuna',  color: '#7fe8ff', glyph: '◆',
      t1: '+25% Frammenti raccolti.',
      t2: 'Tocco d\'Oro: mercanti scontati del 20% e i forzieri contengono un oggetto in più.' },
  };
  G.SYN_ORDER = ['veleno', 'fuoco', 'critico', 'vita', 'difesa', 'furia', 'tempesta', 'saggezza', 'fortuna'];

  // affinità di reliquie e doni esistenti
  const RT = {
    radice_antica: 'vita', artiglio_grifone: 'critico', scaglia: 'difesa', piuma: 'tempesta', guanto: 'furia', zanna: 'vita',
    totem: 'furia', borsa: 'fortuna', seme: 'vita', conchiglia: 'vita', ampolla: 'vita', occhio_falco: 'critico',
    scudo_corallo: 'difesa', bussola: 'saggezza', collana_spine: 'veleno', spora: 'veleno', clessidra: 'saggezza',
    mappa_gorm: 'saggezza', dente_squalo: 'critico', tamburo: 'furia', gemma: 'tempesta', amuleto_neutro: 'difesa',
    pietra_focaia: 'fuoco', anello_tempesta: 'tempesta', cristallo_vamp: 'vita', mantello: 'tempesta', elmo_kolossus: 'difesa',
    lente: 'saggezza', libro_saggio: 'saggezza', calice: 'fortuna', cuore_gorm: 'vita', linfa_eterna: 'vita',
    occhio_vita: 'saggezza', corona: 'furia', corno_cerbante: 'fuoco', perla_abissi: 'vita', mantello_obscurio: 'critico',
    piuma_fenice: 'tempesta', cuore_magma: 'fuoco',
  };
  const PT = {
    vigore: 'vita', forza: 'furia', precisione: 'critico', agilita: 'tempesta', tempra: 'difesa', letale: 'critico',
    rigenerazione: 'vita', vampiro: 'vita', furia: 'furia', rapidita: 'tempesta', cacciatore: 'furia', fortuna: 'fortuna',
    resilienza: 'difesa', concentrazione: 'saggezza', sapere: 'saggezza', seconda_pelle: 'difesa', elementalista: 'tempesta',
    carnefice: 'critico', primo_colpo: 'critico', ultima_difesa: 'difesa', predatore: 'difesa', furia_ancestrale: 'furia',
    tasarau_veleno: 'veleno', spine_up: 'veleno', radici_dur: 'veleno', gheos_roccia: 'difesa', scudo_big: 'difesa', scudo_refl: 'difesa',
    fulmine_chain: 'tempesta', fulmine_stun: 'tempesta', noctis_ali: 'tempesta', poivrons_marea: 'tempesta', saggio_mente: 'saggezza',
    saggio_barriera: 'difesa', lumi_aura: 'fuoco', lumi_luce: 'critico', linfa_up: 'vita', bolla_up: 'vita', prisma_up: 'vita',
  };

  // ------------------------------------------------------------
  //  Nuove reliquie (alcune si sbloccano nel Santuario del Saggio)
  // ------------------------------------------------------------
  const R = (id, name, rarity, icon, color, tag, desc, apply, pack) => ({ id, name, rarity, icon, color, tag, desc, apply, pack });
  const NEW = [
    R('fiala_rovo', 'Fiala del Rovo', 'comune', 'flask', '#7ac04a', 'veleno', 'I nemici avvelenati subiscono +15% danni da te.', h => { h.mods.poisonedBonus = (h.mods.poisonedBonus || 0) + 0.15; }),
    R('calice_veleno', 'Calice Avvelenato', 'rara', 'flask', '#9be35a', 'veleno', 'Le tue abilità avvelenano (2).', h => { h.mods.skillPoison = (h.mods.skillPoison || 0) + 2; }),
    R('linfa_grand', 'Linfa di Grandalbero', 'rara', 'heart', '#4ac04a', 'vita', 'Sotto il 50% dei PV rigeneri 1 PV a turno.', h => { h.mods.lowHpRegen = (h.mods.lowHpRegen || 0) + 1; }),
    R('brace', 'Brace Eterna', 'comune', 'gem', '#ff8a3a', 'fuoco', 'Le ustioni che infliggi durano 2 turni in più e fanno +1 danno.', h => { h.mods.burnExtra = true; h.mods.burnOnHit += 0.1; }, 'pack_roscamar'),
    R('lanterna_lavion', 'Lanterna di Lavion', 'rara', 'flask', '#ff5a1a', 'fuoco', 'Le tue abilità hanno il 40% di probabilità di ustionare.', h => { h.mods.skillBurn = (h.mods.skillBurn || 0) + 0.4; }, 'pack_roscamar'),
    R('guscio_crabs', 'Guscio di Crabs', 'comune', 'shell', '#4a8ac0', 'difesa', '+2 armatura, ma −5 schivata.', h => { h.def += 2; h.eva -= 5; }, 'pack_roscamar'),
    R('lama_vento', 'Lama del Vento', 'comune', 'claw', '#e8f8ff', 'critico', 'I critici ti curano di 3 PV.', h => { h.mods.critHeal = (h.mods.critHeal || 0) + 3; }, 'pack_tempesta'),
    R('sigillo_predatore', 'Sigillo del Predatore', 'rara', 'amulet', '#ffb83a', 'critico', '+5% critico e +0,3 al moltiplicatore dei critici.', h => { h.crit += 5; h.critMul += 0.3; }, 'pack_tempesta'),
    R('ampolla_fulmine', 'Ampolla del Fulmine', 'rara', 'flask', '#bfe8ff', 'tempesta', '+30% danni ai nemici Bagnati.', h => { h.mods.wetAll = (h.mods.wetAll || 0) + 0.3; }, 'pack_tempesta'),
    R('corno_guerra', 'Corno di Guerra', 'comune', 'claw', '#d08a4a', 'furia', 'Inizi ogni piano con 30 di Furia.', h => { h.mods.floorFury = (h.mods.floorFury || 0) + 30; }, 'pack_razzle'),
    R('moneta', 'Moneta di Razzle', 'comune', 'ring', '#ffd23a', 'fortuna', '15% di probabilità di non consumare un oggetto usato.', h => { h.mods.consumeSave = (h.mods.consumeSave || 0) + 0.15; }, 'pack_razzle'),
    R('clessidra_rotta', 'Clessidra Spezzata', 'leggendaria', 'flask', '#d8b0ff', 'saggezza', 'Il Potere Supremo richiede solo 70 di Furia.', h => { h.mods.ultCost = 70; }, 'pack_razzle'),
  ];
  for (const r of NEW) { G.RELICS.push(r); G.RELIC_BY_ID[r.id] = r; }
  for (const r of G.RELICS) if (!r.tag && RT[r.id]) r.tag = RT[r.id];
  for (const p of G.PERKS) if (!p.tag && PT[p.id]) p.tag = PT[p.id];

  G.relicAvailable = function (r) {
    if (!r.pack) return true;
    const md = G.meta && G.meta.data;
    return !!(md && md.purchases && md.purchases[r.pack]);
  };
  G.ultCost = (h) => (h && h.mods && h.mods.ultCost) || 100;

  // conteggio delle affinità possedute
  G.synCounts = function (h) {
    const c = {};
    for (const id of h.relics || []) { const r = G.RELIC_BY_ID[id]; if (r && r.tag) c[r.tag] = (c[r.tag] || 0) + 1; }
    for (const id in h.perks || {}) { const p = G.PERK_BY_ID[id]; if (p && p.tag) c[p.tag] = (c[p.tag] || 0) + 1; }
    return c;
  };
  // livello di risonanza: 0, 1 (2+ elementi), 2 (4+ elementi). Memorizzato per velocità.
  G.synLevel = function (h, tag) {
    if (!h || h.kind !== 'hero') return 0;
    const key = (h.relics ? h.relics.length : 0) + ':' + Object.keys(h.perks || {}).length;
    if (!h._syn || h._synKey !== key) {
      const c = G.synCounts(h), lv = {};
      for (const t in c) lv[t] = c[t] >= 4 ? 2 : c[t] >= 2 ? 1 : 0;
      Object.defineProperty(h, '_syn', { value: lv, writable: true, enumerable: false, configurable: true });
      Object.defineProperty(h, '_synKey', { value: key, writable: true, enumerable: false, configurable: true });
    }
    return h._syn[tag] || 0;
  };
  G.synSnapshot = function (h) {
    const o = {};
    for (const t of G.SYN_ORDER) o[t] = G.synLevel(h, t);
    return o;
  };
  G.synAnnounce = function (h, before) {
    for (const t of G.SYN_ORDER) {
      const lv = G.synLevel(h, t);
      if (lv > (before[t] || 0)) {
        const S = G.SYNERGIES[t];
        G.log('Risonanza ' + S.name + (lv === 2 ? ' MAGGIORE' : '') + ' attivata! ' + (lv === 2 ? S.t2 : S.t1), 'level');
        G.fx.banner && G.fx.banner('Risonanza ' + S.name + (lv === 2 ? ' II' : ' I'), lv === 2 ? S.t2 : S.t1);
        G.fx.sound('relic');
      }
    }
  };
})();

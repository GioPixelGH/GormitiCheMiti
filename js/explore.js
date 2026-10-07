'use strict';
// ============================================================
//  explore.js : esplorazione automatica e viaggio dell'eroe
// ============================================================
(function () {
  const U = G.U, T = G.T;

  // costo di attraversamento per l'eroe (solo caselle già viste)
  function heroCost(h, allowUnseen) {
    const R = G.run, m = R.map;
    return (x, y) => {
      const i = y * m.w + x;
      if (!allowUnseen && !m.seen[i]) return Infinity;
      if (!G.canWalk(h, x, y)) return Infinity;
      if (G.featureAt(x, y)) return Infinity;
      if (G.isHazardFor(h, x, y)) return Infinity;
      const tr = G.trapAt(x, y);
      if (tr && !h.flags.fly) return 30;
      if (R.tele.some(t => t.tiles.some(p => p[0] === x && p[1] === y))) return 20;
      return 1;
    };
  }

  function stepFromDist(h, dist) {
    const m = G.run.map;
    let best = null, bd = dist[h.y * m.w + h.x];
    for (const [dx, dy] of U.DIRS8) {
      const nx = h.x + dx, ny = h.y + dy;
      if (!G.inb(nx, ny)) continue;
      const d = dist[ny * m.w + nx];
      if (d < bd) {
        const o = G.entityAt(nx, ny);
        if (o && !(o.kind === 'ally')) continue;
        if (G.featureAt(nx, ny)) continue;
        if (G.isHazardFor(h, nx, ny)) continue;
        bd = d; best = [dx, dy];
      }
    }
    return best;
  }

  // percorso verso una casella
  G.travelStep = function (tx, ty) {
    const R = G.run, h = R.hero, m = R.map;
    if (h.x === tx && h.y === ty) return null;
    const cost = heroCost(h);
    const dist = G.dijkstra(m.w, m.h, [[tx, ty, 0]], (x, y) => (x === h.x && y === h.y) ? 1 : cost(x, y));
    if (dist[h.y * m.w + h.x] === Infinity) return null;
    return stepFromDist(h, dist);
  };

  // obiettivi di esplorazione
  G.exploreTargets = function () {
    const R = G.run, h = R.hero, m = R.map;
    const out = [];
    for (const it of R.items) if (m.seen[it.y * m.w + it.x] && !(it.x === h.x && it.y === h.y) && G.canPickup(h, it) && !G.isHazardFor(h, it.x, it.y) && G.canWalk(h, it.x, it.y)) out.push([it.x, it.y, 0]);
    for (const f of R.features) if (f.type === 'chest' && !f.gone && m.seen[f.y * m.w + f.x]) {
      for (const [dx, dy] of U.DIRS8) { const x = f.x + dx, y = f.y + dy; if (G.inb(x, y) && m.seen[y * m.w + x] && G.canWalk(h, x, y) && !G.featureAt(x, y) && !G.isHazardFor(h, x, y)) out.push([x, y, 0.5]); }
    }
    const fr = out;
    for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
      const i = y * m.w + x;
      if (!m.seen[i] || !G.canWalk(h, x, y) || G.isHazardFor(h, x, y) || G.featureAt(x, y)) continue;
      let frontier = false;
      for (const [dx, dy] of U.DIRS8) if (!m.seen[(y + dy) * m.w + (x + dx)]) { frontier = true; break; }
      if (frontier) fr.push([x, y, 0]);
    }
    return { targets: fr, kind: 'mixed' };
  };

  // ritorna {dir:[dx,dy]} | {descend:true} | {done:true, reason}
  G.autoExploreStep = function (opts) {
    opts = opts || {};
    const R = G.run, h = R.hero, m = R.map;
    if (!opts.ignoreEnemies) {
      const vis = G.visibleEnemies();
      const h0 = G.run.hero;
      const alarming = vis.filter(e => !e.st.noticed || (e.st.mode === 'hunt' && !(e.flags.stationary && U.cheb(e.x, e.y, h0.x, h0.y) > 5)));
      for (const e of vis) e.st.noticed = true;
      if (alarming.length) return { done: true, reason: 'enemy', enemies: alarming };
    }
    // chest adiacente: aprila
    for (const f of R.features) if (f.type === 'chest' && !f.gone && U.cheb(f.x, f.y, h.x, h.y) === 1) return { dir: [f.x - h.x, f.y - h.y] };
    const cost = heroCost(h);
    const tg = G.exploreTargets();
    if (tg.targets.length) {
      const dist = G.dijkstra(m.w, m.h, tg.targets, (x, y) => (x === h.x && y === h.y) ? 1 : cost(x, y));
      if (dist[h.y * m.w + h.x] !== Infinity) {
        const s = stepFromDist(h, dist);
        if (s) return { dir: s };
      }
    }
    // arena: avvicinati al guardiano
    if (R.bossId && !R.bossIntro) {
      const b = R.ents.find(e => e.id === R.bossId);
      if (b && !b.dead) { const s = G.travelStep(b.x, b.y); if (s) return { dir: s }; }
    }
    // tutto esplorato: vai al portale
    const st = m.stairs;
    if (st && m.seen[st[1] * m.w + st[0]] && !R.sealed) {
      if (h.x === st[0] && h.y === st[1]) return opts.descend ? { descend: true } : { done: true, reason: 'stairs' };
      const s = G.travelStep(st[0], st[1]);
      if (s) return { dir: s };
    }
    return { done: true, reason: 'explored' };
  };

  // caselle su cui cade un telegrafo
  G.teleAt = function (x, y) { return G.run.tele.some(t => t.tiles.some(p => p[0] === x && p[1] === y)); };
})();

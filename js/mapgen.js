'use strict';
// ============================================================
//  mapgen.js : generazione procedurale dei piani
// ============================================================
(function () {
  const T = G.T, U = G.U;

  function makeMap(w, h, fill) {
    return { w, h, t: new Array(w * h).fill(fill), seen: new Array(w * h).fill(0), fire: new Array(w * h).fill(0), deco: new Array(w * h).fill(0) };
  }
  const I = (m, x, y) => y * m.w + x;
  const get = (m, x, y) => (x < 0 || y < 0 || x >= m.w || y >= m.h) ? T.WALL : m.t[y * m.w + x];
  const set = (m, x, y, v) => { if (x > 0 && y > 0 && x < m.w - 1 && y < m.h - 1) m.t[y * m.w + x] = v; };
  const isWalkT = (t) => G.TILE[t].walk && t !== T.CHASM && t !== T.LAVA;
  const groundPass = (m) => (x, y) => isWalkT(get(m, x, y)) || get(m, x, y) === T.DOOR;

  // rumore a valori (value noise) semplice
  function valueNoise(w, h, rng, scale) {
    const gw = Math.ceil(w / scale) + 2, gh = Math.ceil(h / scale) + 2;
    const grid = []; for (let i = 0; i < gw * gh; i++) grid.push(rng.next());
    const out = new Float32Array(w * h);
    const sm = (t) => t * t * (3 - 2 * t);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const gx = x / scale, gy = y / scale, x0 = Math.floor(gx), y0 = Math.floor(gy);
      const fx = sm(gx - x0), fy = sm(gy - y0);
      const a = grid[y0 * gw + x0], b = grid[y0 * gw + x0 + 1], c = grid[(y0 + 1) * gw + x0], d = grid[(y0 + 1) * gw + x0 + 1];
      out[y * w + x] = U.lerp(U.lerp(a, b, fx), U.lerp(c, d, fx), fy);
    }
    return out;
  }

  // ---------- Caverne con automi cellulari ----------
  function genCaves(w, h, rng, fillP) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const m = makeMap(w, h, T.WALL);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) m.t[I(m, x, y)] = rng.chance(fillP || 0.44) ? T.WALL : T.FLOOR;
      for (let it = 0; it < 5; it++) {
        const nt = m.t.slice();
        for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
          let walls = 0, walls2 = 0;
          for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
            const tt = get(m, x + dx, y + dy) === T.WALL;
            if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) { if (tt) walls++; }
            else if (tt) walls2++;
          }
          if (it < 3) nt[I(m, x, y)] = (walls >= 5 || walls + walls2 <= 2) ? T.WALL : T.FLOOR;
          else nt[I(m, x, y)] = walls >= 5 ? T.WALL : T.FLOOR;
        }
        m.t = nt;
      }
      // tieni la regione più grande
      const { regions } = G.floodRegions(w, h, (x, y) => get(m, x, y) === T.FLOOR);
      regions.sort((a, b) => b.length - a.length);
      if (!regions.length || regions[0].length < (w - 2) * (h - 2) * 0.38) continue;
      for (let r = 1; r < regions.length; r++) for (const c of regions[r]) m.t[c] = T.WALL;
      return m;
    }
    return genRooms(w, h, rng);
  }

  // ---------- Stanze e corridoi ----------
  function genRooms(w, h, rng, opts) {
    opts = opts || {};
    const m = makeMap(w, h, T.WALL);
    const rooms = [];
    for (let tries = 0; tries < 400 && rooms.length < (opts.maxRooms || 14); tries++) {
      const rw = rng.int(5, 11), rh = rng.int(4, 8);
      const rx = rng.int(2, w - rw - 3), ry = rng.int(2, h - rh - 3);
      if (rooms.some(r => rx < r.x + r.w + 2 && rx + rw + 2 > r.x && ry < r.y + r.h + 2 && ry + rh + 2 > r.y)) continue;
      const room = { x: rx, y: ry, w: rw, h: rh, cx: rx + (rw >> 1), cy: ry + (rh >> 1), shape: rng.chance(0.25) ? 'round' : 'rect' };
      rooms.push(room);
      for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) {
        if (room.shape === 'round') {
          const nx = (x - rx + 0.5) / rw - 0.5, ny = (y - ry + 0.5) / rh - 0.5;
          if (nx * nx + ny * ny > 0.27) continue;
        }
        set(m, x, y, T.FLOOR);
      }
      // colonne nelle stanze grandi
      if (rw >= 9 && rh >= 7 && rng.chance(0.4)) {
        for (const [px, py] of [[rx + 2, ry + 2], [rx + rw - 3, ry + 2], [rx + 2, ry + rh - 3], [rx + rw - 3, ry + rh - 3]]) set(m, px, py, T.PILLAR);
      }
    }
    // MST semplice (Prim) + qualche lato extra
    const conn = [0], edges = [];
    while (conn.length < rooms.length) {
      let best = null;
      for (const a of conn) for (let b = 0; b < rooms.length; b++) {
        if (conn.includes(b)) continue;
        const d = U.manh(rooms[a].cx, rooms[a].cy, rooms[b].cx, rooms[b].cy);
        if (!best || d < best.d) best = { a, b, d };
      }
      conn.push(best.b); edges.push([best.a, best.b]);
    }
    for (let k = 0; k < Math.floor(rooms.length / 3); k++) edges.push([rng.int(0, rooms.length - 1), rng.int(0, rooms.length - 1)]);
    for (const [a, b] of edges) {
      if (a === b) continue;
      const A = rooms[a], B = rooms[b];
      carveCorridor(m, A.cx, A.cy, B.cx, B.cy, rng, opts.wide ? 2 : 1);
    }
    m.rooms = rooms;
    return m;
  }
  function carveCorridor(m, x0, y0, x1, y1, rng, width) {
    let x = x0, y = y0;
    const horizFirst = rng.chance(0.5);
    const step = (tx, ty) => {
      while (x !== tx || y !== ty) {
        if (x !== tx) x += Math.sign(tx - x); else y += Math.sign(ty - y);
        if (get(m, x, y) === T.WALL || get(m, x, y) === T.PILLAR) set(m, x, y, T.FLOOR);
        if (width > 1) { if (get(m, x + 1, y) === T.WALL) set(m, x + 1, y, T.FLOOR); if (get(m, x, y + 1) === T.WALL) set(m, x, y + 1, T.FLOOR); }
      }
    };
    if (horizFirst) { step(x1, y0); step(x1, y1); } else { step(x0, y1); step(x1, y1); }
  }

  // ---------- Isole sospese (regione dell'Aria) ----------
  function genIslands(w, h, rng) {
    const m = makeMap(w, h, T.CHASM);
    for (let x = 0; x < w; x++) { m.t[I(m, x, 0)] = T.WALL; m.t[I(m, x, h - 1)] = T.WALL; }
    for (let y = 0; y < h; y++) { m.t[I(m, 0, y)] = T.WALL; m.t[I(m, w - 1, y)] = T.WALL; }
    const isl = [];
    for (let tries = 0; tries < 300 && isl.length < 11; tries++) {
      const rx = rng.int(3, 6), ry = rng.int(3, 5);
      const cx = rng.int(rx + 2, w - rx - 3), cy = rng.int(ry + 2, h - ry - 3);
      if (isl.some(o => Math.abs(o.cx - cx) < o.rx + rx + 3 && Math.abs(o.cy - cy) < o.ry + ry + 3)) continue;
      isl.push({ cx, cy, rx, ry });
    }
    const nz = valueNoise(w, h, rng, 3);
    for (const o of isl) {
      for (let y = o.cy - o.ry - 1; y <= o.cy + o.ry + 1; y++) for (let x = o.cx - o.rx - 1; x <= o.cx + o.rx + 1; x++) {
        const nx = (x - o.cx) / (o.rx + 0.5), ny = (y - o.cy) / (o.ry + 0.5);
        const d = nx * nx + ny * ny + (nz[I(m, x, y)] - 0.5) * 0.6;
        if (d < 1) set(m, x, y, T.FLOOR);
      }
      // rocce interne
      if (o.rx >= 5 && rng.chance(0.6)) set(m, o.cx + rng.int(-2, 2), o.cy + rng.int(-1, 1), T.PILLAR);
    }
    // ponti (MST)
    const conn = [0];
    const bridges = [];
    while (conn.length < isl.length) {
      let best = null;
      for (const a of conn) for (let b = 0; b < isl.length; b++) {
        if (conn.includes(b)) continue;
        const d = U.manh(isl[a].cx, isl[a].cy, isl[b].cx, isl[b].cy);
        if (!best || d < best.d) best = { a, b, d };
      }
      conn.push(best.b); bridges.push([best.a, best.b]);
    }
    for (let k = 0; k < 2; k++) { const a = rng.int(0, isl.length - 1), b = rng.int(0, isl.length - 1); if (a !== b) bridges.push([a, b]); }
    for (const [a, b] of bridges) {
      const A = isl[a], B = isl[b];
      // ponte a L ortogonale (più leggibile)
      let x = A.cx, y = A.cy;
      const go = (tx, ty) => {
        while (x !== tx || y !== ty) {
          if (x !== tx) x += Math.sign(tx - x); else y += Math.sign(ty - y);
          if (get(m, x, y) === T.CHASM) set(m, x, y, T.BRIDGE);
        }
      };
      if (rng.chance(0.5)) { go(B.cx, A.cy); go(B.cx, B.cy); } else { go(A.cx, B.cy); go(B.cx, B.cy); }
    }
    m.rooms = isl.map(o => ({ cx: o.cx, cy: o.cy, x: o.cx - o.rx, y: o.cy - o.ry, w: o.rx * 2, h: o.ry * 2 }));
    return m;
  }

  // ---------- Connettività garantita ----------
  function ensureConnected(m, rng) {
    const pass = groundPass(m);
    for (let iter = 0; iter < 30; iter++) {
      const { regions, lab } = G.floodRegions(m.w, m.h, pass);
      if (regions.length <= 1) return;
      regions.sort((a, b) => b.length - a.length);
      const main = regions[0];
      // collega la seconda regione alla principale
      const other = regions[1];
      if (other.length < 5) {
        for (let r = 1; r < regions.length; r++) if (regions[r].length < 5) for (const c of regions[r]) { if (m.t[c] !== T.STAIRS) m.t[c] = (G.BIOME_GEN === 'islands' ? T.CHASM : T.WALL); }
        continue;
      }
      const mainId = lab[main[0]];
      const srcs = other.map(c => [c % m.w, (c / m.w) | 0, 0]);
      const cost = (x, y) => {
        if (x <= 0 || y <= 0 || x >= m.w - 1 || y >= m.h - 1) return Infinity;
        return pass(x, y) ? 1 : 4;
      };
      const dist = G.dijkstra(m.w, m.h, srcs, cost);
      let best = -1, bd = Infinity;
      for (const c of main) if (dist[c] < bd) { bd = dist[c]; best = c; }
      if (best < 0) return;
      // risali il gradiente fino alla regione "other"
      let cx = best % m.w, cy = (best / m.w) | 0;
      let guard = 0;
      while (dist[I(m, cx, cy)] > 0 && guard++ < 500) {
        let nb = null, nd = dist[I(m, cx, cy)];
        for (const [dx, dy] of U.DIRS4) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue;
          const d = dist[I(m, nx, ny)];
          if (d < nd) { nd = d; nb = [nx, ny]; }
        }
        if (!nb) break;
        cx = nb[0]; cy = nb[1];
        const t = get(m, cx, cy);
        if (!pass(cx, cy)) set(m, cx, cy, carveFor(t));
      }
    }
  }
  function carveFor(t) {
    switch (t) {
      case T.DEEP: return T.SHALLOW;
      case T.LAVA: return T.ASH;
      case T.CHASM: return T.BRIDGE;
      case T.TREE: return T.GRASS;
      default: return T.FLOOR;
    }
  }

  // ---------- Decorazioni biomi ----------
  function decorate(m, biome, rng) {
    const nz = valueNoise(m.w, m.h, rng, 6), nz2 = valueNoise(m.w, m.h, rng, 4);
    const W = m.w, H = m.h;
    const floorCells = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (get(m, x, y) === T.FLOOR) floorCells.push([x, y]);
    const openAround = (x, y) => { for (const [dx, dy] of U.DIRS8) if (get(m, x + dx, y + dy) !== T.FLOOR && get(m, x + dx, y + dy) !== T.GRASS && get(m, x + dx, y + dy) !== T.SAND && get(m, x + dx, y + dy) !== T.ASH) return false; return true; };
    switch (biome.id) {
      case 'foresta':
        for (const [x, y] of floorCells) {
          const n = nz[I(m, x, y)], n2 = nz2[I(m, x, y)];
          if (n > 0.62 && n2 > 0.45) set(m, x, y, T.TALL);
          else if (n > 0.3) set(m, x, y, T.GRASS);
        }
        for (const [x, y] of floorCells) if (rng.chance(0.06) && openAround(x, y) && get(m, x, y) !== T.TALL) set(m, x, y, T.TREE);
        pools(m, rng, 2, T.SHALLOW, T.SHALLOW);
        sprinkle(m, rng, [T.FLOOR, T.GRASS], [[2, 6], [3, 3], [10, 3], [4, 1], [1, 4]], 0.09);
        break;
      case 'mare':
        for (const [x, y] of floorCells) set(m, x, y, nz2[I(m, x, y)] > 0.5 ? T.SAND : T.FLOOR);
        // laghi profondi negli spazi aperti
        for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
          if (nz[I(m, x, y)] > 0.6 && openAround(x, y)) m.t[I(m, x, y)] = T.DEEP;
        }
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          const t = get(m, x, y);
          if (t !== T.FLOOR && t !== T.SAND) continue;
          for (const [dx, dy] of U.DIRS8) if (get(m, x + dx, y + dy) === T.DEEP) { set(m, x, y, T.SHALLOW); break; }
        }
        sprinkle(m, rng, [T.FLOOR, T.SAND], [[5, 5], [6, 4], [1, 3], [4, 1]], 0.08);
        break;
      case 'roscamar':
        for (const [x, y] of floorCells) if (nz[I(m, x, y)] > 0.68) set(m, x, y, T.RUBBLE);
        // cristalli nelle pareti
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          if (get(m, x, y) !== T.WALL) continue;
          let adj = false; for (const [dx, dy] of U.DIRS4) if (G.TILE[get(m, x + dx, y + dy)].walk) adj = true;
          if (adj && nz2[I(m, x, y)] > 0.72 && rng.chance(0.5)) m.t[I(m, x, y)] = T.CRYSTAL;
        }
        // porte agli ingressi delle stanze
        if (m.rooms) for (const r of m.rooms) {
          for (let x = r.x - 1; x <= r.x + r.w; x++) for (const y of [r.y - 1, r.y + r.h]) tryDoor(m, x, y, rng);
          for (let y = r.y - 1; y <= r.y + r.h; y++) for (const x of [r.x - 1, r.x + r.w]) tryDoor(m, x, y, rng);
        }
        sprinkle(m, rng, [T.FLOOR, T.RUBBLE], [[4, 4], [11, 2], [7, 3], [1, 5], [3, 2]], 0.07);
        break;
      case 'cieli':
        for (const [x, y] of floorCells) if (nz[I(m, x, y)] > 0.55) set(m, x, y, T.GRASS);
        sprinkle(m, rng, [T.FLOOR, T.GRASS], [[8, 4], [1, 4], [2, 2], [4, 1]], 0.06);
        break;
      case 'vulcano':
        for (const [x, y] of floorCells) set(m, x, y, nz2[I(m, x, y)] > 0.55 ? T.ASH : T.FLOOR);
        // fiumi di lava
        const rivers = rng.int(1, 3);
        for (let r = 0; r < rivers; r++) lavaRiver(m, rng);
        pools(m, rng, 3, T.LAVA, T.ASH);
        sprinkle(m, rng, [T.FLOOR, T.ASH], [[9, 5], [4, 3], [11, 1], [1, 3]], 0.08);
        break;
    }
  }
  function tryDoor(m, x, y, rng) {
    if (get(m, x, y) !== T.FLOOR) return;
    const h = get(m, x - 1, y) === T.WALL && get(m, x + 1, y) === T.WALL && G.TILE[get(m, x, y - 1)].walk && G.TILE[get(m, x, y + 1)].walk;
    const v = get(m, x, y - 1) === T.WALL && get(m, x, y + 1) === T.WALL && G.TILE[get(m, x - 1, y)].walk && G.TILE[get(m, x + 1, y)].walk;
    if ((h || v) && rng.chance(0.55)) set(m, x, y, T.DOOR);
  }
  function pools(m, rng, n, inner, rim) {
    for (let k = 0; k < n; k++) {
      const cx = rng.int(4, m.w - 5), cy = rng.int(4, m.h - 5);
      if (!G.TILE[get(m, cx, cy)].walk) continue;
      const r = rng.int(1, 3);
      for (let y = cy - r - 1; y <= cy + r + 1; y++) for (let x = cx - r - 1; x <= cx + r + 1; x++) {
        const t = get(m, x, y);
        if (!G.TILE[t].walk || t === T.STAIRS) continue;
        const d = Math.hypot(x - cx, y - cy);
        if (d <= r) set(m, x, y, inner); else if (d <= r + 1.2 && rim !== inner) set(m, x, y, rim);
      }
    }
  }
  function lavaRiver(m, rng) {
    const horiz = rng.chance(0.5);
    let x = horiz ? 1 : rng.int(8, m.w - 9), y = horiz ? rng.int(6, m.h - 7) : 1;
    let guard = 0;
    while (guard++ < 400) {
      if (x <= 0 || y <= 0 || x >= m.w - 1 || y >= m.h - 1) break;
      const t = get(m, x, y);
      if (t !== T.WALL || rng.chance(0.2)) set(m, x, y, T.LAVA);
      if (rng.chance(0.4)) { const ox = horiz ? 0 : 1, oy = horiz ? 1 : 0; if (get(m, x + ox, y + oy) !== T.WALL) set(m, x + ox, y + oy, T.LAVA); }
      if (horiz) { x++; if (rng.chance(0.35)) y += rng.pick([-1, 1]); }
      else { y++; if (rng.chance(0.35)) x += rng.pick([-1, 1]); }
    }
  }
  // decorazioni: list = [[decoId, peso]]
  function sprinkle(m, rng, onTiles, list, p) {
    for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
      if (!onTiles.includes(get(m, x, y)) || !rng.chance(p)) continue;
      m.deco[I(m, x, y)] = rng.weighted(list, e => e[1])[0];
    }
  }

  // ---------- Posizionamento partenza / portale ----------
  function placeStartStairs(m, rng) {
    const pass = groundPass(m);
    const cells = [];
    for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
      const t = get(m, x, y);
      if (pass(x, y) && t !== T.SHALLOW && t !== T.DOOR && t !== T.TALL) cells.push([x, y]);
    }
    const start = rng.pick(cells);
    const dist = G.dijkstra(m.w, m.h, [[start[0], start[1], 0]], (x, y) => pass(x, y) ? 1 : Infinity);
    // portale: tra il 15% di caselle più lontane
    const far = cells.filter(c => dist[I(m, c[0], c[1])] < Infinity).sort((a, b) => dist[I(m, b[0], b[1])] - dist[I(m, a[0], a[1])]);
    const stairs = far[rng.int(0, Math.max(0, Math.floor(far.length * 0.12)))];
    m.t[I(m, stairs[0], stairs[1])] = T.STAIRS;
    // ripulisci intorno al portale
    for (const [dx, dy] of U.DIRS8) { const t = get(m, stairs[0] + dx, stairs[1] + dy); if (t === T.TALL || t === T.DEEP || t === T.LAVA) set(m, stairs[0] + dx, stairs[1] + dy, T.FLOOR); }
    m.deco[I(m, start[0], start[1])] = 0;
    m.start = start; m.stairs = stairs;
    m.distFromStart = dist;
  }

  // ---------- API principale ----------
  G.generateFloor = function (floor, rng) {
    const biome = G.BIOMES[G.regionOf(floor)];
    G.BIOME_GEN = biome.gen;
    const W = 54, H = 38;
    let m;
    switch (biome.gen) {
      case 'caves': m = genCaves(W, H, rng, biome.id === 'mare' ? 0.42 : 0.45); break;
      case 'rooms': m = genRooms(W, H, rng, { maxRooms: 15 }); break;
      case 'islands': m = genIslands(W, H, rng); break;
      case 'volcano': m = rng.chance(0.5) ? genCaves(W, H, rng, 0.46) : genRooms(W, H, rng, { maxRooms: 12, wide: true }); break;
    }
    decorate(m, biome, rng);
    ensureConnected(m, rng);
    placeStartStairs(m, rng);
    m.biome = biome.id;
    return m;
  };

  // Arena del boss
  G.generateArena = function (floor, rng) {
    const biome = G.BIOMES[G.regionOf(floor)];
    G.BIOME_GEN = biome.gen;
    const W = 33, H = 27, cx = 16, cy = 12;
    const m = makeMap(W, H, T.WALL);
    const rx = 13.5, ry = 10.5;
    const nz = valueNoise(W, H, rng, 3);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const nx = (x - cx) / rx, ny = (y - cy) / ry;
      if (nx * nx + ny * ny + (nz[I(m, x, y)] - 0.5) * 0.25 < 1) set(m, x, y, T.FLOOR);
    }
    // corridoio d'ingresso
    for (let y = cy + 8; y < H - 2; y++) { set(m, cx, y, T.FLOOR); set(m, cx - 1, y, T.FLOOR); set(m, cx + 1, y, T.FLOOR); }
    const pillars = [[cx - 6, cy - 4], [cx + 6, cy - 4], [cx - 6, cy + 4], [cx + 6, cy + 4]];
    switch (biome.id) {
      case 'foresta':
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (get(m, x, y) === T.FLOOR) set(m, x, y, nz[I(m, x, y)] > 0.62 ? T.TALL : T.GRASS);
        for (const [x, y] of pillars) set(m, x, y, T.TREE);
        break;
      case 'mare':
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (get(m, x, y) === T.FLOOR) set(m, x, y, T.SAND);
        for (const [px, py] of [[cx - 8, cy], [cx + 8, cy], [cx, cy - 7]]) {
          for (let y = py - 2; y <= py + 2; y++) for (let x = px - 2; x <= px + 2; x++) {
            const d = Math.hypot(x - px, y - py);
            if (get(m, x, y) === T.WALL) continue;
            set(m, x, y, d <= 1.5 ? T.DEEP : T.SHALLOW);
          }
        }
        break;
      case 'roscamar':
        for (const [x, y] of pillars) set(m, x, y, T.CRYSTAL);
        for (const [x, y] of [[cx - 3, cy - 7], [cx + 3, cy - 7], [cx - 10, cy], [cx + 10, cy]]) set(m, x, y, T.CRYSTAL);
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (get(m, x, y) === T.FLOOR && nz[I(m, x, y)] > 0.7) set(m, x, y, T.RUBBLE);
        break;
      case 'cieli':
        // anello di baratri verso i bordi
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          if (get(m, x, y) !== T.FLOOR) continue;
          const nx = (x - cx) / rx, ny = (y - cy) / ry, d = nx * nx + ny * ny;
          if (d > 0.62 && d < 0.85 && !(Math.abs(x - cx) <= 1 && y > cy)) set(m, x, y, T.CHASM);
          else if (nz[I(m, x, y)] > 0.6) set(m, x, y, T.GRASS);
        }
        for (const [x, y] of pillars) set(m, x, y, T.PILLAR);
        break;
      case 'vulcano':
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (get(m, x, y) === T.FLOOR) set(m, x, y, nz[I(m, x, y)] > 0.55 ? T.ASH : T.FLOOR);
        for (const [px, py] of [[cx - 7, cy - 5], [cx + 7, cy - 5], [cx - 9, cy + 3], [cx + 9, cy + 3]]) {
          for (let y = py - 1; y <= py + 1; y++) for (let x = px - 1; x <= px + 1; x++) if (get(m, x, y) !== T.WALL && Math.hypot(x - px, y - py) < 1.6) set(m, x, y, T.LAVA);
        }
        break;
    }
    ensureConnected(m, rng);
    m.start = [cx, H - 3];
    m.bossSpot = [cx, cy - 3];
    m.stairsSpot = [cx, cy];
    m.stairs = null;
    m.biome = biome.id;
    m.arena = true;
    for (let i = 0; i < m.t.length; i++) m.deco[i] = 0;
    return m;
  };
})();

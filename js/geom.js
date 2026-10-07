'use strict';
// ============================================================
//  geom.js : campo visivo (shadowcasting) e mappe di Dijkstra
// ============================================================

// Recursive shadowcasting (8 ottanti). isOpaque(x,y), mark(x,y)
G.shadowcast = function (ox, oy, radius, isOpaque, mark) {
  mark(ox, oy);
  const MULT = [
    [1, 0, 0, -1, -1, 0, 0, 1],
    [0, 1, -1, 0, 0, -1, 1, 0],
    [0, 1, 1, 0, 0, -1, -1, 0],
    [1, 0, 0, 1, -1, 0, 0, -1],
  ];
  const r2 = radius * radius + radius;
  function cast(row, start, end, xx, xy, yx, yy) {
    if (start < end) return;
    let newStart = 0;
    for (let j = row; j <= radius; j++) {
      let dx = -j - 1, dy = -j, blocked = false;
      while (dx <= 0) {
        dx += 1;
        const X = ox + dx * xx + dy * xy, Y = oy + dx * yx + dy * yy;
        const lSlope = (dx - 0.5) / (dy + 0.5), rSlope = (dx + 0.5) / (dy - 0.5);
        if (start < rSlope) continue;
        else if (end > lSlope) break;
        if (dx * dx + dy * dy <= r2) mark(X, Y);
        if (blocked) {
          if (isOpaque(X, Y)) { newStart = rSlope; continue; }
          else { blocked = false; start = newStart; }
        } else if (isOpaque(X, Y) && j < radius) {
          blocked = true;
          cast(j + 1, start, lSlope, xx, xy, yx, yy);
          newStart = rSlope;
        }
      }
      if (blocked) break;
    }
  }
  for (let oct = 0; oct < 8; oct++) cast(1, 1.0, 0.0, MULT[0][oct], MULT[1][oct], MULT[2][oct], MULT[3][oct]);
};

// ---------- Heap binario minimo ----------
G.Heap = class {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(item, pri) {
    const a = this.a; a.push([pri, item]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]]; i = p;
    }
  }
  pop() {
    const a = this.a; const top = a[0]; const last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1; let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]]; i = m;
      }
    }
    return top;
  }
};

// Dijkstra su griglia: sources = [[x,y]], cost(x,y) -> numero (Infinity = bloccato)
G.dijkstra = function (w, h, sources, cost, maxD) {
  const dist = new Float64Array(w * h).fill(Infinity);
  const heap = new G.Heap();
  for (const s of sources) { const i = s[1] * w + s[0]; dist[i] = s[2] || 0; heap.push(i, dist[i]); }
  const D8 = G.U.DIRS8;
  maxD = maxD || Infinity;
  while (heap.size) {
    const [d, i] = heap.pop();
    if (d > dist[i] || d > maxD) continue;
    const x = i % w, y = (i / w) | 0;
    for (let k = 0; k < 8; k++) {
      const nx = x + D8[k][0], ny = y + D8[k][1];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const c = cost(nx, ny);
      if (c === Infinity) continue;
      const nd = d + c + (k & 1 ? 0.001 : 0); // lieve preferenza per mosse ortogonali
      const ni = ny * w + nx;
      if (nd < dist[ni]) { dist[ni] = nd; heap.push(ni, nd); }
    }
  }
  return dist;
};

// Insiemi connessi (flood fill 8-dir) dato pass(x,y)
G.floodRegions = function (w, h, pass) {
  const lab = new Int32Array(w * h).fill(-1);
  const regions = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (lab[i] !== -1 || !pass(x, y)) continue;
    const id = regions.length, cells = [];
    const st = [i]; lab[i] = id;
    while (st.length) {
      const c = st.pop(); cells.push(c);
      const cx = c % w, cy = (c / w) | 0;
      for (const [dx, dy] of G.U.DIRS8) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const ni = ny * w + nx;
        if (lab[ni] !== -1 || !pass(nx, ny)) continue;
        lab[ni] = id; st.push(ni);
      }
    }
    regions.push(cells);
  }
  return { lab, regions };
};

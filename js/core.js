'use strict';
// ============================================================
//  GORMITI — Le Pietre di Gorm
//  core.js : namespace, RNG, utilità, elementi
// ============================================================
var G = (typeof window !== 'undefined' ? window : globalThis).G = {};

// ---------- RNG deterministico (mulberry32) ----------
G.RNG = class {
  constructor(seed) { this.s = (seed >>> 0) || 0x9E3779B9; }
  next() {
    let t = (this.s = (this.s + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }
  float(a, b) { return a + this.next() * (b - a); }
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  // items: array, w: funzione peso
  weighted(items, w) {
    let tot = 0;
    for (const it of items) tot += Math.max(0, w(it));
    if (tot <= 0) return items[0];
    let r = this.next() * tot;
    for (const it of items) { r -= Math.max(0, w(it)); if (r < 0) return it; }
    return items[items.length - 1];
  }
};

G.hashString = function (str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

// ---------- Utilità ----------
G.U = {
  clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
  lerp: (a, b, t) => a + (b - a) * t,
  sign: (v) => (v > 0 ? 1 : v < 0 ? -1 : 0),
  cheb: (x0, y0, x1, y1) => Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)),
  manh: (x0, y0, x1, y1) => Math.abs(x1 - x0) + Math.abs(y1 - y0),
  // distanza "rotonda" per raggi circolari
  inRadius: (x0, y0, x1, y1, r) => { const dx = x1 - x0, dy = y1 - y0; return dx * dx + dy * dy <= r * r + r; },
  DIRS8: [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]],
  DIRS4: [[0, -1], [1, 0], [0, 1], [-1, 0]],
  // linea di Bresenham (esclude il punto di partenza)
  line(x0, y0, x1, y1) {
    const pts = [];
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, x = x0, y = y0;
    while (!(x === x1 && y === y1)) {
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
      pts.push([x, y]);
      if (pts.length > 200) break;
    }
    return pts;
  },
  // raggio che prosegue oltre il bersaglio fino a len passi
  ray(x0, y0, x1, y1, len) {
    if (x0 === x1 && y0 === y1) return [];
    const dx = x1 - x0, dy = y1 - y0;
    const fx = x0 + dx * 50, fy = y0 + dy * 50;
    return G.U.line(x0, y0, fx, fy).slice(0, len);
  },
  dirTo(x0, y0, x1, y1) { return [G.U.sign(x1 - x0), G.U.sign(y1 - y0)]; },
  pct: (v) => Math.round(v * 100) + '%',
  fmt(n) { return Math.round(n).toString(); },
  deepClone: (o) => JSON.parse(JSON.stringify(o)),
};

// ---------- Elementi ----------
G.ELEMS = {
  terra:   { name: 'Terra',   color: '#e0a050', beats: 'aria',    glyph: '▲' },
  aria:    { name: 'Aria',    color: '#a8ecff', beats: 'mare',    glyph: '≈' },
  mare:    { name: 'Mare',    color: '#4aa0ff', beats: 'fuoco',   glyph: '~' },
  fuoco:   { name: 'Fuoco',   color: '#ff6a2a', beats: 'foresta', glyph: '♨' },
  foresta: { name: 'Foresta', color: '#6ee05a', beats: 'terra',   glyph: '♣' },
  luce:    { name: 'Luce',    color: '#fff3a0', beats: 'tenebre', glyph: '✦' },
  tenebre: { name: 'Tenebre', color: '#b77cff', beats: 'luce',    glyph: '◆' },
  neutro:  { name: 'Neutro',  color: '#d8d8d8', beats: null,      glyph: '●' },
};
G.elemMult = function (atk, def, strong) {
  if (!atk || !def) return 1;
  const A = G.ELEMS[atk], D = G.ELEMS[def];
  if (!A || !D) return 1;
  if (A.beats === def) return strong || 1.5;
  if (D.beats === atk) return 0.75;
  return 1;
};

// ---------- Bus effetti (sostituito dal renderer nel browser) ----------
G.fx = new Proxy({}, { get: () => () => {} });
G.ui = new Proxy({}, { get: () => () => {} });

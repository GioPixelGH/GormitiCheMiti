'use strict';
// ============================================================
//  tiles.js : texture procedurali dei terreni per bioma
// ============================================================
(function () {
  const TS = 16;
  function mk() { const c = document.createElement('canvas'); c.width = TS; c.height = TS; return c; }
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const shade = (c, f) => G.shade(c, f);
  function px(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
  function rect(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }

  const BIOME_EXTRA = {
    foresta: { grass: ['#2f5a22', '#3f7a2a', '#5aa03a', '#7ac04a'], sand: '#6a5a3a', water: '#2a6a7a', deep: '#173a50', chasm: 'void', tree: true },
    mare: { grass: ['#1f5a4a', '#2a7a5a', '#3aa07a', '#5ac09a'], sand: '#b8a070', water: '#2a6aa8', deep: '#123a70', chasm: 'void' },
    roscamar: { grass: ['#3a4a2a', '#4a5a30', '#5a7040', '#708a50'], sand: '#7a6a50', water: '#2a5a7a', deep: '#14304a', chasm: 'void' },
    cieli: { grass: ['#4a6a4a', '#5a8a5a', '#7ab07a', '#a0d0a0'], sand: '#a09a8a', water: '#4a8ac0', deep: '#2a5a9a', chasm: 'sky' },
    vulcano: { grass: ['#4a3a2a', '#5a4a30', '#6a5a3a', '#7a6a4a'], sand: '#5a4a40', water: '#3a5a6a', deep: '#1a2a3a', chasm: 'void' },
    ghiaccio: { grass: ['#8aa0b4', '#9ab4c8', '#b4cadc', '#d8e8f4'], sand: '#c8d8e4', water: '#5a9ac8', deep: '#2a5a8a', chasm: 'void', snow: true },
    luce: { grass: ['#8a7a4a', '#a08a50', '#c0a860', '#e0c870'], sand: '#c8b080', water: '#6ab0d0', deep: '#2a6a9a', chasm: 'sky', mosaic: true },
  };

  G.buildTileset = function (biome) {
    const C = biome.colors, X = BIOME_EXTRA[biome.id];
    const r = rng(G.hashString(biome.id));
    const set = {};
    const variants = (n, fn) => { const out = []; for (let i = 0; i < n; i++) { const c = mk(); fn(c.getContext('2d'), i); out.push(c); } return out; };

    // ---- pavimento ----
    const floorFn = (base, alt) => (ctx, v) => {
      rect(ctx, 0, 0, TS, TS, base);
      for (let i = 0; i < 26; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, r() < 0.5 ? alt : shade(base, -0.18));
      for (let i = 0; i < 6; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, shade(base, 0.12));
      if (v === 1) { // crepa
        let x = (r() * 10 + 3) | 0, y = (r() * 6 + 3) | 0;
        for (let k = 0; k < 6; k++) { px(ctx, x, y, shade(base, -0.35)); x += r() < 0.5 ? 1 : 0; y += 1; }
      }
      if (v === 2) { // sassolino
        const x = (r() * 11 + 2) | 0, y = (r() * 11 + 2) | 0;
        rect(ctx, x, y, 2, 2, shade(alt, 0.15)); px(ctx, x, y + 2, shade(base, -0.3)); px(ctx, x + 1, y + 2, shade(base, -0.3));
      }
    };
    set.floor = variants(4, floorFn(C.floor, C.floor2));
    set.sand = variants(4, (ctx, v) => {
      rect(ctx, 0, 0, TS, TS, X.sand);
      for (let i = 0; i < 30; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, r() < 0.5 ? shade(X.sand, 0.15) : shade(X.sand, -0.15));
      if (v === 0) for (let x = 2; x < 14; x++) px(ctx, x, 6 + Math.round(Math.sin(x / 2) * 1), shade(X.sand, -0.22));
    });
    set.ash = variants(4, (ctx, v) => {
      rect(ctx, 0, 0, TS, TS, '#3a3232');
      for (let i = 0; i < 30; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, r() < 0.6 ? '#4a4040' : '#2a2424');
      if (v < 2) for (let i = 0; i < 2; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, '#ff6a2a');
    });
    set.rubble = variants(4, (ctx, v) => {
      floorFn(C.floor, C.floor2)(ctx, 0);
      for (let i = 0; i < 4; i++) {
        const x = (r() * 12 + 1) | 0, y = (r() * 12 + 1) | 0, s = 2 + ((r() * 2) | 0);
        rect(ctx, x, y, s, s - 1, shade(C.wallTop, 0.1)); rect(ctx, x, y + s - 1, s, 1, shade(C.wallTop, -0.35)); px(ctx, x, y, shade(C.wallTop, 0.35));
      }
    });
    // ---- erba ----
    const G4 = X.grass;
    set.grass = variants(4, (ctx, v) => {
      rect(ctx, 0, 0, TS, TS, G4[0]);
      for (let i = 0; i < 40; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, G4[(r() * 2) | 0]);
      for (let i = 0; i < 9; i++) { const x = (r() * 15) | 0, y = (r() * 13 + 2) | 0; px(ctx, x, y, G4[2]); px(ctx, x, y - 1, G4[3]); }
    });
    set.tall = variants(2, (ctx, v) => {
      rect(ctx, 0, 0, TS, TS, shade(G4[0], -0.2));
      for (let i = 0; i < 14; i++) {
        const x = (i * 1.15 + r() * 1.5) | 0, h = 7 + ((r() * 7) | 0), lean = v === 0 ? 0 : 1;
        for (let k = 0; k < h; k++) px(ctx, Math.min(15, x + (k > h - 3 ? lean : 0)), 15 - k, k > h - 3 ? G4[3] : (k > h / 2 ? G4[2] : G4[1]));
      }
    });
    // ---- muri ----
    const wallTopFn = (ctx, v) => {
      rect(ctx, 0, 0, TS, TS, C.wallTop);
      for (let i = 0; i < 22; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, r() < 0.5 ? shade(C.wallTop, -0.15) : shade(C.wallTop, 0.1));
      if (biome.id === 'roscamar' || biome.id === 'vulcano') { for (let x = 0; x < TS; x++) { px(ctx, x, 7, shade(C.wallTop, -0.25)); } px(ctx, (v * 4 + 3) % 16, 3, shade(C.wallTop, -0.3)); }
      if (biome.id === 'foresta') { // chiome fitte
        for (let i = 0; i < 7; i++) { const x = (r() * 14) | 0, y = (r() * 14) | 0; ctx.fillStyle = r() < 0.5 ? '#3a6a2a' : '#1e3a18'; ctx.beginPath(); ctx.arc(x + 1, y + 1, 2 + r() * 2, 0, 7); ctx.fill(); }
        for (let i = 0; i < 8; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, '#5a9a3a');
      }
    };
    set.wallTop = variants(4, wallTopFn);
    set.wallFace = variants(4, (ctx, v) => {
      wallTopFn(ctx, v);
      const F = C.wallFace;
      rect(ctx, 0, 6, TS, 10, F);
      rect(ctx, 0, 6, TS, 1, shade(C.wallTop, 0.25));
      if (biome.id === 'foresta') { // tronchi e radici
        for (let x = 1; x < TS; x += 4 + ((r() * 2) | 0)) { rect(ctx, x, 7, 2, 9, '#2a1c10'); px(ctx, x, 8 + ((r() * 6) | 0), '#5a4028'); }
        rect(ctx, 0, 6, TS, 2, '#1e3a18'); for (let x = 0; x < TS; x += 2) px(ctx, x, 8, '#2c5226');
      } else if (biome.id === 'roscamar') { // mattoni
        for (let row = 0; row < 3; row++) { const y = 8 + row * 3; rect(ctx, 0, y, TS, 1, shade(F, -0.35)); for (let x = (row % 2) * 4; x < TS; x += 8) rect(ctx, x, y - 2, 1, 2, shade(F, -0.35)); }
      } else {
        for (let i = 0; i < 18; i++) px(ctx, (r() * TS) | 0, 7 + ((r() * 9) | 0), r() < 0.5 ? shade(F, 0.12) : shade(F, -0.3));
        for (let x = 0; x < TS; x++) if (r() < 0.6) px(ctx, x, 11 + ((x + v) % 3 === 0 ? 1 : 0), shade(F, -0.25));
      }
      rect(ctx, 0, 15, TS, 1, shade(F, -0.5));
    });
    set.crystalTop = variants(2, (ctx, v) => { wallTopFn(ctx, v); for (let i = 0; i < 3; i++) { const x = (r() * 12 + 2) | 0, y = (r() * 10 + 3) | 0; rect(ctx, x, y, 2, 3, '#7ad8ff'); px(ctx, x, y, '#e0f8ff'); } });
    set.crystalFace = variants(2, (ctx, v) => {
      set.wallFace[v].getContext && ctx.drawImage(set.wallFace[v], 0, 0);
      for (let i = 0; i < 3; i++) { const x = 2 + i * 5, h = 5 + ((r() * 4) | 0); rect(ctx, x, 15 - h, 3, h, '#4ab0e0'); rect(ctx, x + 1, 15 - h, 1, h, '#a8ecff'); px(ctx, x + 1, 15 - h - 1, '#ffffff'); }
    });
    set.pillar = variants(1, (ctx) => {
      rect(ctx, 3, 1, 10, 3, shade(C.wallTop, 0.2));
      rect(ctx, 4, 4, 8, 10, C.wallFace);
      rect(ctx, 4, 4, 2, 10, shade(C.wallFace, 0.25));
      rect(ctx, 10, 4, 2, 10, shade(C.wallFace, -0.3));
      rect(ctx, 3, 13, 10, 3, shade(C.wallTop, -0.1));
    });
    set.tree = variants(2, (ctx, v) => {
      rect(ctx, 6, 9, 4, 7, '#5a3a1e'); rect(ctx, 6, 9, 1, 7, '#7a5a30');
      const cc = biome.id === 'vulcano' ? ['#3a2a20', '#5a4030', '#7a5a40'] : biome.id === 'cieli' ? ['#3a6a4a', '#5a9a6a', '#8ac08a'] : ['#1f4a1a', '#2f7a2a', '#5aa03a'];
      ctx.fillStyle = cc[0]; ctx.beginPath(); ctx.arc(8, 6, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cc[1]; ctx.beginPath(); ctx.arc(7.5, 5.5, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = cc[2]; ctx.beginPath(); ctx.arc(6, 4, 2.2, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 8; i++) px(ctx, (2 + r() * 12) | 0, (1 + r() * 10) | 0, i % 2 ? cc[0] : cc[2]);
    });
    // ---- liquidi (3 fotogrammi) ----
    const liquid = (base, light, dark, spark) => variants(3, (ctx, f) => {
      rect(ctx, 0, 0, TS, TS, base);
      for (let i = 0; i < 16; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, dark);
      for (let k = 0; k < 3; k++) {
        const y = (k * 5 + f * 2) % 16, x = (k * 7 + f * 3) % 12;
        rect(ctx, x, y, 4, 1, light);
        if (spark) px(ctx, x + 1, y, spark);
      }
    });
    set.shallow = liquid(X.water, shade(X.water, 0.35), shade(X.water, -0.15), null);
    set.deep = liquid(X.deep, shade(X.deep, 0.3), shade(X.deep, -0.25), null);
    set.lava = variants(3, (ctx, f) => {
      rect(ctx, 0, 0, TS, TS, '#c8320a');
      for (let i = 0; i < 26; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, r() < 0.5 ? '#ff6a1a' : '#8a1a0a');
      for (let k = 0; k < 4; k++) { const x = (k * 5 + f * 2) % 15, y = (k * 4 + f) % 15; rect(ctx, x, y, 2, 2, '#ffc83a'); px(ctx, x, y, '#fff2a0'); }
    });
    // ---- baratro ----
    set.chasm = variants(3, (ctx, f) => {
      if (X.chasm === 'sky') {
        const g = ctx.createLinearGradient(0, 0, 0, TS); g.addColorStop(0, '#6a8ab8'); g.addColorStop(1, '#8aaad0');
        ctx.fillStyle = g; ctx.fillRect(0, 0, TS, TS);
        for (let i = 0; i < 3; i++) { const x = ((r() * 16) + f * 2) % 16, y = r() * 14; ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(x | 0, y | 0, 5, 2); ctx.fillRect((x | 0) + 1, (y | 0) - 1, 3, 1); }
      } else {
        rect(ctx, 0, 0, TS, TS, '#05040a');
        for (let i = 0; i < 2; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, f === i ? '#6a5a9a' : '#2a2040');
      }
    });
    set.cliff = variants(2, (ctx, v) => { // parete di roccia sotto un bordo
      const col = X.chasm === 'sky' ? '#6a6a7a' : shade(C.wallFace, 0.1);
      rect(ctx, 0, 0, TS, 6, col);
      for (let x = 0; x < TS; x++) { px(ctx, x, 6 + ((x * 7 + v * 3) % 3 === 0 ? 1 : 0), shade(col, -0.3)); if (r() < 0.3) px(ctx, x, (r() * 6) | 0, shade(col, -0.25)); }
      rect(ctx, 0, 0, TS, 1, shade(col, 0.3));
    });
    set.bridge = variants(2, (ctx, v) => {
      rect(ctx, 0, 0, TS, TS, '#6a4a2a');
      for (let y = 0; y < TS; y += 4) { rect(ctx, 0, y, TS, 1, '#3a2614'); }
      rect(ctx, 0, 0, 2, TS, '#4a3018'); rect(ctx, 14, 0, 2, TS, '#4a3018');
      for (let i = 0; i < 10; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, '#8a6a3a');
    });
    // ---- porte ----
    set.door = variants(1, (ctx) => {
      ctx.drawImage(set.wallFace[0], 0, 0);
      rect(ctx, 3, 3, 10, 13, '#5a3a1e'); rect(ctx, 3, 3, 10, 1, '#3a2410');
      for (let x = 5; x < 13; x += 3) rect(ctx, x, 4, 1, 12, '#3a2410');
      rect(ctx, 11, 9, 1, 2, '#ffd23a');
    });
    set.doorOpen = variants(1, (ctx) => {
      floorFn(C.floor, C.floor2)(ctx, 0);
      rect(ctx, 0, 0, 3, TS, '#5a3a1e'); rect(ctx, 13, 0, 3, TS, '#5a3a1e');
    });
    set.stairs = variants(1, (ctx) => {
      floorFn(C.floor, C.floor2)(ctx, 0);
      ctx.fillStyle = '#1a1028'; ctx.beginPath(); ctx.ellipse(8, 9, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6a6a7a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(8, 9, 7, 6, 0, 0, Math.PI * 2); ctx.stroke();
    });
    // ---- ghiaccio scivoloso ----
    set.ice = variants(4, (ctx, v) => {
      rect(ctx, 0, 0, TS, TS, '#a8d8f0');
      for (let i = 0; i < 14; i++) px(ctx, (r() * TS) | 0, (r() * TS) | 0, '#d8f4ff');
      for (let k = 0; k < 2; k++) { const x = (r() * 10) | 0, y = (r() * 12 + 2) | 0; for (let j = 0; j < 5; j++) px(ctx, x + j, y - (j >> 1), '#ffffff'); }
      if (v === 1) { let x = (r() * 8 + 4) | 0, y = 3; for (let k = 0; k < 8; k++) { px(ctx, x, y, '#7ab0d0'); x += r() < 0.5 ? 1 : -1; y++; } }
      rect(ctx, 0, 15, TS, 1, '#8ac0e0');
    });
    // ---- muri incrinati ----
    const crack = (ctx) => {
      let x = 5 + ((r() * 6) | 0), y = 2;
      ctx.fillStyle = '#120d18';
      for (let k = 0; k < 12; k++) { ctx.fillRect(x, y, 1, 1); if (r() < 0.3) ctx.fillRect(x + 1, y, 1, 1); x += r() < 0.5 ? 1 : -1; y++; if (y > 14) break; }
      ctx.fillRect(3, 9, 3, 1); ctx.fillRect(10, 6, 3, 1);
    };
    set.crackedTop = variants(1, (ctx) => { wallTopFn(ctx, 0); crack(ctx); });
    set.crackedFace = variants(1, (ctx) => { ctx.drawImage(set.wallFace[0], 0, 0); crack(ctx); });
    return set;
  };
})();

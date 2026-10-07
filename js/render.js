'use strict';
// ============================================================
//  render.js : rendering su canvas, animazioni ed effetti
// ============================================================
(function () {
  const T = G.T, U = G.U, TS = 16;
  const RD = G.RD = {
    cv: null, ctx: null, W: 0, H: 0, S: 3, zoomAdj: 0,
    cam: { x: 0, y: 0 }, anim: {}, dying: [], parts: [], floats: [], projs: [], fxs: [], ambient: [],
    shakeAmt: 0, flashCol: null, flashT: 0, time: 0, last: 0,
    tileset: null, biomeId: null, mapLayer: null, fogCv: null, fogCtx: null, fogImg: null,
    target: null, hover: null, path: null,
  };

  RD.init = function (canvas) {
    RD.cv = canvas; RD.ctx = canvas.getContext('2d');
    RD.resize();
    window.addEventListener('resize', RD.resize);
  };
  RD.resize = function () {
    RD.W = RD.cv.width = window.innerWidth;
    RD.H = RD.cv.height = window.innerHeight;
    const base = Math.min(RD.W / (26 * TS), RD.H / (15 * TS));
    RD.S = Math.max(2, Math.min(6, Math.floor(base) + RD.zoomAdj));
    RD.ctx.imageSmoothingEnabled = false;
  };
  RD.zoom = function (d) { RD.zoomAdj = U.clamp(RD.zoomAdj + d, -2, 2); RD.resize(); };

  // ---------------------------------------------------------------- anim helpers
  function A(e) {
    let a = RD.anim[e.id];
    if (!a) a = RD.anim[e.id] = { x: e.x, y: e.y, flash: 0, lunge: null, face: 1, born: RD.time, alpha: 1, spawnT: 0 };
    return a;
  }
  RD.resetAnims = function () {
    RD.anim = {}; RD.dying = []; RD.parts = []; RD.floats = []; RD.projs = []; RD.fxs = [];
    const R = G.run; if (!R) return;
    for (const e of R.ents) A(e);
    RD.snapCam();
  };
  RD.snapCam = function () {
    const h = G.run && G.run.hero; if (!h) return;
    RD.cam.x = (h.x + 0.5) * TS; RD.cam.y = (h.y + 0.5) * TS;
  };

  // ---------------------------------------------------------------- map layer
  const hashXY = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
  RD.buildMap = function () {
    const R = G.run, m = R.map;
    const biome = G.BIOMES[G.regionOf(R.floor)];
    if (RD.biomeId !== biome.id || !RD.tileset) { RD.tileset = G.buildTileset(biome); RD.biomeId = biome.id; }
    if (!RD.mapLayer || RD.mapLayer.width !== m.w * TS || RD.mapLayer.height !== m.h * TS) {
      RD.mapLayer = document.createElement('canvas'); RD.mapLayer.width = m.w * TS; RD.mapLayer.height = m.h * TS;
    }
    const ctx = RD.mapLayer.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, RD.mapLayer.width, RD.mapLayer.height);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) drawTile(ctx, x, y);
    if (!RD.fogCv || RD.fogCv.width !== m.w || RD.fogCv.height !== m.h) {
      RD.fogCv = document.createElement('canvas'); RD.fogCv.width = m.w; RD.fogCv.height = m.h;
      RD.fogCtx = RD.fogCv.getContext('2d'); RD.fogImg = RD.fogCtx.createImageData(m.w, m.h);
    }
    R.mapDirty = false;
  };
  const isGroundLike = (t) => t !== T.WALL && t !== T.CRYSTAL && t !== T.CHASM && t !== T.PILLAR && t !== T.TREE;
  function drawTile(ctx, x, y) {
    const ts = RD.tileset, R = G.run, m = R.map;
    const t = m.t[y * m.w + x], v = hashXY(x, y) % 4, px = x * TS, py = y * TS;
    const south = G.tileAt(x, y + 1), north = G.tileAt(x, y - 1);
    const southSolid = G.TILE[south].solid || south === T.DOOR;
    const floorBase = () => ctx.drawImage(ts.floor[v], px, py);
    switch (t) {
      case T.WALL:
        ctx.drawImage(southSolid ? ts.wallTop[v] : ts.wallFace[v], px, py);
        if (!G.TILE[north].solid && north !== T.DOOR) { ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(px, py, TS, 1); }
        if (!G.TILE[G.tileAt(x - 1, y)].solid) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(px, py, 1, TS); }
        if (!G.TILE[G.tileAt(x + 1, y)].solid) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(px + TS - 1, py, 1, TS); }
        break;
      case T.CRYSTAL: ctx.drawImage(southSolid ? ts.crystalTop[v % 2] : ts.crystalFace[v % 2], px, py); break;
      case T.PILLAR: floorBase(); ctx.drawImage(ts.pillar[0], px, py); break;
      case T.TREE: ctx.drawImage(ts.grass[v], px, py); ctx.drawImage(ts.tree[v % 2], px, py); break;
      case T.FLOOR: floorBase(); break;
      case T.SAND: ctx.drawImage(ts.sand[v], px, py); break;
      case T.ASH: ctx.drawImage(ts.ash[v], px, py); break;
      case T.RUBBLE: ctx.drawImage(ts.rubble[v], px, py); break;
      case T.GRASS: ctx.drawImage(ts.grass[v], px, py); break;
      case T.TALL: ctx.drawImage(ts.tall[v % 2], px, py); break;
      case T.SHALLOW: ctx.drawImage(ts.shallow[0], px, py); break;
      case T.DEEP: ctx.drawImage(ts.deep[0], px, py); break;
      case T.LAVA: ctx.drawImage(ts.lava[0], px, py); break;
      case T.CHASM: ctx.drawImage(ts.chasm[v % 3], px, py); if (isGroundLike(north) && north !== T.BRIDGE) ctx.drawImage(ts.cliff[v % 2], px, py); break;
      case T.BRIDGE: ctx.drawImage(ts.chasm[v % 3], px, py); ctx.drawImage(ts.bridge[v % 2], px, py); break;
      case T.DOOR: ctx.drawImage(ts.door[0], px, py); break;
      case T.DOOR_OPEN: ctx.drawImage(ts.doorOpen[0], px, py); break;
      case T.STAIRS: ctx.drawImage(ts.stairs[0], px, py); break;
    }
    // ombre ambientali sotto i muri
    if (isGroundLike(t) && t !== T.DEEP && t !== T.LAVA) {
      if (G.TILE[north].solid) { ctx.fillStyle = 'rgba(0,0,0,0.32)'; ctx.fillRect(px, py, TS, 4); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(px, py + 4, TS, 2); }
      if (G.TILE[G.tileAt(x - 1, y)].solid) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(px, py, 2, TS); }
      if (G.TILE[G.tileAt(x + 1, y)].solid) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(px + TS - 2, py, 2, TS); }
    }
    const d = m.deco[y * m.w + x];
    if (d && G.SPR_DECO[d] && isGroundLike(t) && t !== T.DEEP) ctx.drawImage(G.SPR_DECO[d], px, py);
  }

  // ---------------------------------------------------------------- nebbia/luce
  function updateFog() {
    const R = G.run, m = R.map, h = R.hero, d = RD.fogImg.data;
    const r = G.heroSight(h);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const i = y * m.w + x;
      let a;
      if (R.vis[i]) {
        const dx = x - h.x, dy = y - h.y, dd = Math.sqrt(dx * dx + dy * dy) / (r + 0.5);
        a = Math.min(0.45, dd * dd * 0.45);
        const t = m.t[i];
        if (t === T.LAVA || m.fire[i] || t === T.STAIRS || t === T.CRYSTAL) a *= 0.4;
      } else if (m.seen[i]) a = 0.58;
      else a = 1;
      const o = i * 4;
      d[o] = 4; d[o + 1] = 3; d[o + 2] = 12; d[o + 3] = Math.round(a * 255);
    }
    RD.fogCtx.putImageData(RD.fogImg, 0, 0);
  }

  // ---------------------------------------------------------------- loop
  RD.frame = function (now) {
    const dt = Math.min(0.05, (now - (RD.last || now)) / 1000);
    RD.last = now; RD.time += dt;
    const R = G.run, ctx = RD.ctx, S = RD.S;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#05040a'; ctx.fillRect(0, 0, RD.W, RD.H);
    if (!R || !R.map) return;
    if (R.mapDirty || !RD.mapLayer) RD.buildMap();
    const h = R.hero, ha = A(h);
    // aggiorna animazioni
    for (const e of R.ents) {
      const a = A(e);
      const k = Math.min(1, dt * (e.kind === 'hero' ? 20 : 16));
      a.x += (e.x - a.x) * k; a.y += (e.y - a.y) * k;
      if (Math.abs(e.x - a.x) > 6 || Math.abs(e.y - a.y) > 6) { a.x = e.x; a.y = e.y; }
      if (a.flash > 0) a.flash -= dt;
      if (a.flashDelay > 0) { a.flashDelay -= dt; if (a.flashDelay <= 0) a.flash = 0.12; }
      if (a.lunge) { a.lunge.t += dt; if (a.lunge.t > 0.14) a.lunge = null; }
    }
    // camera
    const tx = (ha.x + 0.5) * TS, ty = (ha.y + 0.5) * TS;
    RD.cam.x += (tx - RD.cam.x) * Math.min(1, dt * 10);
    RD.cam.y += (ty - RD.cam.y) * Math.min(1, dt * 10);
    let sx = 0, sy = 0;
    if (RD.shakeAmt > 0.2) {
      const sh = (G.meta.data && G.meta.data.settings.shake === false) ? 0 : RD.shakeAmt;
      sx = (Math.random() * 2 - 1) * sh; sy = (Math.random() * 2 - 1) * sh;
      RD.shakeAmt *= Math.pow(0.002, dt);
    }
    const ox = Math.round(RD.W / 2 - RD.cam.x * S + sx), oy = Math.round(RD.H / 2 - RD.cam.y * S + sy);
    RD.ox = ox; RD.oy = oy;
    const m = R.map;
    // tiles statici
    ctx.drawImage(RD.mapLayer, ox, oy, m.w * TS * S, m.h * TS * S);
    // range visibile
    const x0 = Math.max(0, Math.floor(-ox / (TS * S)) - 1), y0 = Math.max(0, Math.floor(-oy / (TS * S)) - 1);
    const x1 = Math.min(m.w - 1, Math.ceil((RD.W - ox) / (TS * S)) + 1), y1 = Math.min(m.h - 1, Math.ceil((RD.H - oy) / (TS * S)) + 1);
    const W2S = (wx, wy) => [ox + wx * S, oy + wy * S];
    RD.W2S = W2S;
    // tiles animati
    const fr = Math.floor(RD.time * 3) % 3;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * m.w + x;
      if (!m.seen[i]) continue;
      const t = m.t[i];
      const [px, py] = W2S(x * TS, y * TS);
      if (t === T.SHALLOW) ctx.drawImage(RD.tileset.shallow[fr], px, py, TS * S, TS * S);
      else if (t === T.DEEP) ctx.drawImage(RD.tileset.deep[fr], px, py, TS * S, TS * S);
      else if (t === T.LAVA) ctx.drawImage(RD.tileset.lava[fr], px, py, TS * S, TS * S);
      else if (t === T.TALL && R.vis[i]) ctx.drawImage(RD.tileset.tall[(Math.floor(RD.time * 1.5 + x * 0.3) % 2)], px, py, TS * S, TS * S);
      else if (t === T.STAIRS) drawPortal(ctx, px, py, S, R.sealed);
      if (m.fire[i] > 0) drawFire(ctx, px, py, S, x, y);
    }
    // trappole
    for (const tr of R.traps) {
      if (tr.gone || !m.seen[tr.y * m.w + tr.x]) continue;
      const [px, py] = W2S(tr.x * TS, tr.y * TS);
      drawTrap(ctx, px, py, S, tr);
    }
    // oggetti
    for (const it of R.items) {
      if (!m.seen[it.y * m.w + it.x]) continue;
      const [px, py] = W2S(it.x * TS, it.y * TS);
      drawItem(ctx, px, py, S, it);
    }
    // elementi di scena
    for (const f of R.features) {
      if (f.gone || !m.seen[f.y * m.w + f.x]) continue;
      const [px, py] = W2S(f.x * TS, f.y * TS);
      let spr = f.type === 'chest' ? (f.rare ? G.SPR.chest_rare : G.SPR.chest) : f.type === 'merchant' ? G.SPR.merchant : G.SPR['shrine_' + f.kind];
      if (!spr) continue;
      ctx.globalAlpha = f.used ? 0.5 : 1;
      shadow(ctx, px, py, S, 0.8);
      const bob = f.type === 'merchant' ? Math.round(Math.sin(RD.time * 2) * 0.6) : 0;
      ctx.drawImage(spr.img, px, py + bob * S, TS * S, TS * S);
      if (f.rare && !f.gone) sparkle(ctx, px, py, S, '#ffe27a');
      ctx.globalAlpha = 1;
    }
    // telegrafi: riempimento del colore dell'attacco + bordo rosso di pericolo
    const pulse = 0.3 + 0.22 * Math.sin(RD.time * 10);
    for (const t of R.tele) {
      for (const [x, y] of t.tiles) {
        if (!m.seen[y * m.w + x]) continue;
        const [px, py] = W2S(x * TS, y * TS);
        ctx.globalAlpha = pulse;
        ctx.fillStyle = t.color;
        ctx.fillRect(px + S, py + S, (TS - 2) * S, (TS - 2) * S);
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = '#ff2a2a'; ctx.lineWidth = Math.max(2, S * 0.75);
        ctx.strokeRect(px + S * 1.5, py + S * 1.5, (TS - 3) * S, (TS - 3) * S);
        ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(RD.time * 12);
        ctx.fillRect(px + 7 * S, py + 7 * S, 2 * S, 2 * S);
      }
      ctx.globalAlpha = 1;
    }
    // entità
    const ents = R.ents.filter(e => !e.dead).sort((a, b) => A(a).y - A(b).y);
    for (const e of ents) {
      if (e !== h && (!G.visible(e.x, e.y) || G.isHiddenMonster(e))) continue;
      drawEntity(ctx, e, S, W2S);
    }
    // morti
    for (let i = RD.dying.length - 1; i >= 0; i--) {
      const d = RD.dying[i]; d.t += dt;
      if (d.t > d.dur) { RD.dying.splice(i, 1); continue; }
      const p = d.t / d.dur;
      const P = d.spr.w > TS ? S + 1 : S;
      const [bx, by] = W2S(d.x * TS + 8, d.y * TS + 16);
      ctx.globalAlpha = 1 - p;
      const sc = 1 - p * 0.3, w = d.spr.w * P * sc, hh = d.spr.h * P * sc;
      ctx.drawImage(p < 0.25 ? d.spr.flash : (d.flip ? d.spr.flip : d.spr.img), bx - w / 2, by - hh, w, hh);
      ctx.globalAlpha = 1;
    }
    // nebbia/luce
    updateFog();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(RD.fogCv, ox, oy, m.w * TS * S, m.h * TS * S);
    ctx.imageSmoothingEnabled = false;
    // elementi sopra la nebbia: telegrafi visibili, effetti
    drawEffects(ctx, dt, S, W2S);
    // overlay di mira
    drawTargeting(ctx, S, W2S);
    // particelle ambientali
    drawAmbient(ctx, dt, S);
    // flash schermo
    if (RD.flashT > 0) {
      RD.flashT -= dt;
      ctx.globalAlpha = Math.max(0, RD.flashT / 0.35) * 0.55;
      ctx.fillStyle = RD.flashCol; ctx.fillRect(0, 0, RD.W, RD.H);
      ctx.globalAlpha = 1;
    }
    // vignetta bassa vita
    if (h.hp < h.maxHp * 0.3 && !h.dead) {
      const g = ctx.createRadialGradient(RD.W / 2, RD.H / 2, Math.min(RD.W, RD.H) * 0.3, RD.W / 2, RD.H / 2, Math.max(RD.W, RD.H) * 0.7);
      g.addColorStop(0, 'rgba(160,0,0,0)'); g.addColorStop(1, 'rgba(160,0,20,' + (0.25 + 0.12 * Math.sin(RD.time * 5)) + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, RD.W, RD.H);
    }
  };

  // ---------------------------------------------------------------- disegno elementi
  function shadow(ctx, px, py, S, w) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(px + 8 * S, py + 14.5 * S, 5 * S * (w || 1), 1.6 * S, 0, 0, Math.PI * 2); ctx.fill();
  }
  function sparkle(ctx, px, py, S, col) {
    const t = RD.time * 3;
    for (let k = 0; k < 2; k++) {
      const a = t + k * 3.1, r = 6 + Math.sin(a * 1.3) * 2;
      const x = px + (8 + Math.cos(a) * r) * S, y = py + (8 + Math.sin(a) * r * 0.6) * S;
      ctx.fillStyle = col; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(a * 2);
      ctx.fillRect(x, y, S, S);
    }
    ctx.globalAlpha = 1;
  }
  function drawPortal(ctx, px, py, S, sealed) {
    const t = RD.time;
    const cx = px + 8 * S, cy = py + 9 * S;
    const col = sealed ? '#5a3a3a' : '#a070ff';
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8 * S);
    g.addColorStop(0, sealed ? 'rgba(80,40,40,0.9)' : 'rgba(230,200,255,0.95)');
    g.addColorStop(0.5, sealed ? 'rgba(60,20,20,0.7)' : 'rgba(140,80,255,0.7)');
    g.addColorStop(1, 'rgba(40,10,80,0)');
    ctx.fillStyle = g; ctx.fillRect(px - 2 * S, py - 2 * S, 20 * S, 20 * S);
    ctx.strokeStyle = col; ctx.lineWidth = S;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, (6 - k * 1.8) * S, (5 - k * 1.5) * S, 0, t * (2 + k) + k, t * (2 + k) + k + 3.6);
      ctx.stroke();
    }
    if (sealed) { ctx.strokeStyle = '#ff3a3a'; ctx.beginPath(); ctx.moveTo(cx - 5 * S, cy - 4 * S); ctx.lineTo(cx + 5 * S, cy + 4 * S); ctx.moveTo(cx + 5 * S, cy - 4 * S); ctx.lineTo(cx - 5 * S, cy + 4 * S); ctx.stroke(); }
  }
  function drawFire(ctx, px, py, S, x, y) {
    const t = RD.time * 8 + x * 1.7 + y * 2.3;
    const cols = ['#ff3a1a', '#ff8a2a', '#ffd23a'];
    for (let k = 0; k < 3; k++) {
      const h = 6 + Math.sin(t + k * 2) * 3;
      const fx = px + (3 + k * 4) * S, fy = py + (14 - h) * S;
      ctx.fillStyle = cols[k % 3];
      ctx.fillRect(fx, fy, 3 * S, h * S);
      ctx.fillStyle = cols[(k + 1) % 3];
      ctx.fillRect(fx + S, fy + h * S * 0.4, S, h * S * 0.5);
    }
  }
  function drawTrap(ctx, px, py, S, tr) {
    const info = G.TRAPS[tr.type];
    const cx = px + 8 * S, cy = py + 8 * S;
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = info.color; ctx.lineWidth = S;
    ctx.beginPath(); ctx.moveTo(cx, cy - 5 * S); ctx.lineTo(cx + 5 * S, cy); ctx.lineTo(cx, cy + 5 * S); ctx.lineTo(cx - 5 * S, cy); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = info.color;
    if (tr.type === 'spine') { for (const [dx, dy] of [[-2, -1], [1, -2], [0, 1], [2, 1], [-2, 2]]) ctx.fillRect(cx + dx * S, cy + dy * S, S, S); }
    else ctx.fillRect(cx - S, cy - S, 2 * S, 2 * S);
    ctx.globalAlpha = 1;
  }
  function itemSprite(it) {
    if (it.kind === 'gold') return G.SPR.gold.img;
    if (it.kind === 'pietra') return G.SPR.pietra.img;
    if (it.kind === 'relic') { const r = G.RELIC_BY_ID[it.id]; return G.itemSprite(r.icon, r.color); }
    const d = G.ITEM_BY_ID[it.id];
    return G.itemSprite(d.icon, d.color);
  }
  RD.itemSprite = itemSprite;
  function drawItem(ctx, px, py, S, it) {
    const bob = Math.round(Math.sin(RD.time * 3 + it.x + it.y) * 1);
    if (it.kind === 'relic' || it.kind === 'pietra') {
      const cx = px + 8 * S, cy = py + 8 * S;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10 * S);
      const col = it.kind === 'pietra' ? '255,220,90' : '255,200,80';
      g.addColorStop(0, 'rgba(' + col + ',0.55)'); g.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.fillStyle = g; ctx.fillRect(px - 4 * S, py - 4 * S, 24 * S, 24 * S);
    }
    shadow(ctx, px, py, S, 0.5);
    ctx.drawImage(itemSprite(it), px, py + bob * S, TS * S, TS * S);
    if (it.kind === 'relic' || it.kind === 'pietra') sparkle(ctx, px, py, S, '#fff6c0');
  }

  const STATUS_ICON = { burn: '#ff7a2a', poison: '#9be35a', wet: '#5ab0ff', stun: '#ffe066', freeze: '#bff4ff', root: '#5fbf3a', slow: '#8899bb', confuse: '#ff9ef0', blind: '#dddddd', weak: '#bb8866', vuln: '#ff4466', haste: '#ffffff', rage: '#ff3030', thorns: '#7be04a', shield: '#9fd0ff', regen: '#6effa0', primed: '#ff2020' };
  function drawEntity(ctx, e, S, W2S) {
    const a = A(e), spr = G.SPR[e.type] || G.SPR.golem;
    let wx = a.x * TS, wy = a.y * TS;
    if (a.lunge) { const p = Math.sin((a.lunge.t / 0.14) * Math.PI); wx += a.lunge.dx * 5 * p; wy += a.lunge.dy * 5 * p; }
    const fly = e.flags.fly && e.kind !== 'hero' || e.type === 'noctis';
    const bob = Math.round(Math.sin(RD.time * (fly ? 4 : 2.5) + e.id) * (fly ? 1.5 : 0.6));
    const stunned = e.status.stun || e.status.freeze;
    const [px, py] = W2S(wx, wy);
    const big = spr.w > TS;
    // aura élite/boss
    if (e.flags.elite || e.flags.boss) {
      const col = (G.ELEMS[e.elem] || G.ELEMS.neutro).color;
      const cx = px + 8 * S, cy = py + 10 * S;
      const rr = (big ? 16 : 11) * S;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
      g.addColorStop(0, hexA(col, 0.35 + 0.1 * Math.sin(RD.time * 4))); g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g; ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    }
    // ombra
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath(); ctx.ellipse(px + 8 * S, py + 14.8 * S, (big ? 9 : 5.5) * S, (big ? 2.4 : 1.7) * S, 0, 0, Math.PI * 2); ctx.fill();
    // sprite (i boss sono disegnati con pixel più grandi)
    const P = big ? S + 1 : S;
    const dx = px + 8 * S - spr.w * P / 2, dy = py + 16 * S - spr.h * P + (stunned ? 0 : (fly ? bob - 2 : bob)) * S;
    let alpha = 1;
    if (e.status.invis) alpha = 0.45;
    if (e.type === 'clone') alpha = 0.75;
    if (e.status.summon && e.status.summon.t < 4) alpha = 0.5 + 0.3 * Math.sin(RD.time * 10);
    const born = RD.time - a.born;
    if (born < 0.3) alpha *= born / 0.3;
    ctx.globalAlpha = alpha;
    const img = (a.face < 0) ? spr.flip : spr.img;
    ctx.drawImage(img, dx, dy, spr.w * P, spr.h * P);
    if (e.kind === 'monster' && e.flags.stoneForm && e.st.stone) { ctx.globalAlpha = 0.3; ctx.drawImage(spr.flash, dx, dy, spr.w * P, spr.h * P); }
    if (a.flash > 0) { ctx.globalAlpha = Math.min(1, a.flash / 0.12); ctx.drawImage(spr.flash, dx, dy, spr.w * P, spr.h * P); }
    if (e.status.freeze) { ctx.globalAlpha = 0.45; ctx.fillStyle = '#bff4ff'; ctx.fillRect(dx + 2 * P, dy + 2 * P, (spr.w - 4) * P, (spr.h - 3) * P); }
    if (e.status.primed) { ctx.globalAlpha = 0.35 + 0.35 * Math.sin(RD.time * 20); ctx.drawImage(spr.flash, dx, dy, spr.w * P, spr.h * P); }
    ctx.globalAlpha = 1;
    // scudo
    if (e.status.shield) {
      ctx.strokeStyle = 'rgba(160,210,255,' + (0.45 + 0.2 * Math.sin(RD.time * 5)) + ')'; ctx.lineWidth = S;
      ctx.beginPath(); ctx.ellipse(px + 8 * S, py + 8 * S, 9 * S, 9 * S, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // stordito: stelline
    if (stunned && e.status.stun) {
      for (let k = 0; k < 3; k++) {
        const ang = RD.time * 5 + k * 2.1;
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(px + (8 + Math.cos(ang) * 5) * S, dy - 2 * S + Math.sin(ang) * 1.5 * S, S, S);
      }
    }
    // dormiente: zZ
    if (e.kind === 'monster' && e.st.mode === 'sleep' && !e.flags.stoneForm) {
      const zt = (RD.time + e.id * 0.37) % 2;
      ctx.globalAlpha = 1 - zt / 2;
      ctx.fillStyle = '#c8d8ff'; ctx.font = (5 * S) + 'px "Press Start 2P", monospace';
      ctx.fillText('z', px + (11 + zt * 2) * S, dy + (2 - zt * 3) * S);
      ctx.globalAlpha = 1;
    }
    // barra vita
    if (e.kind !== 'hero' && !e.flags.boss && (e.hp < e.maxHp || e.flags.elite)) {
      const bw = 12 * S, bx = px + 2 * S, by = dy - 2.5 * S;
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx - S / 2, by - S / 2, bw + S, 2 * S);
      const f = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = e.faction === 'player' ? '#6ee05a' : (f > 0.5 ? '#e84a3a' : f > 0.25 ? '#ff9a2a' : '#ffd23a');
      ctx.fillRect(bx, by, bw * f, S);
    }
    // icone di stato
    const st = Object.keys(e.status).filter(k => STATUS_ICON[k] && k !== 'shield');
    if (st.length && e.kind !== 'hero') {
      let ix = px + 8 * S - (st.length * 3 * S) / 2;
      for (const k of st.slice(0, 5)) { ctx.fillStyle = '#000'; ctx.fillRect(ix - S / 2, py + 15.5 * S, 3 * S, 3 * S); ctx.fillStyle = STATUS_ICON[k]; ctx.fillRect(ix, py + 16 * S, 2 * S, 2 * S); ix += 3 * S; }
    }
    // effetti di stato a particelle
    if (Math.random() < 0.08) {
      if (e.status.burn) RD.addPart(a.x * TS + 4 + Math.random() * 8, a.y * TS + 8, '#ff8a2a', { vy: -25, life: 0.5 });
      if (e.status.poison) RD.addPart(a.x * TS + 4 + Math.random() * 8, a.y * TS + 10, '#9be35a', { vy: -12, life: 0.7 });
      if (e.status.wet) RD.addPart(a.x * TS + 4 + Math.random() * 8, a.y * TS + 6, '#5ab0ff', { vy: 20, life: 0.4 });
    }
  }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  RD.hexA = hexA;

  // ---------------------------------------------------------------- effetti
  RD.addPart = function (x, y, color, o) {
    o = o || {};
    if (RD.parts.length > 600) return;
    RD.parts.push({ x, y, vx: o.vx != null ? o.vx : (Math.random() * 2 - 1) * (o.spread || 40), vy: o.vy != null ? o.vy : (Math.random() * 2 - 1) * (o.spread || 40) - (o.up || 0), life: o.life || 0.6, max: o.life || 0.6, color, size: o.size || 1, grav: o.grav || 0, delay: o.delay || 0 });
  };
  function drawEffects(ctx, dt, S, W2S) {
    // proiettili
    for (let i = RD.projs.length - 1; i >= 0; i--) {
      const p = RD.projs[i];
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.t += dt;
      const k = Math.min(1, p.t / p.dur);
      const x = U.lerp(p.x0, p.x1, k), y = U.lerp(p.y0, p.y1, k) - Math.sin(k * Math.PI) * (p.arc || 0);
      const [sx, sy] = W2S(x, y);
      drawProjectile(ctx, sx, sy, S, p, k);
      if (Math.random() < 0.6) RD.addPart(x, y, p.trail, { spread: 8, life: 0.3 });
      if (k >= 1) { RD.projs.splice(i, 1); for (let n = 0; n < 6; n++) RD.addPart(p.x1, p.y1, p.trail, { spread: 50, life: 0.35 }); }
    }
    // effetti vari
    for (let i = RD.fxs.length - 1; i >= 0; i--) {
      const f = RD.fxs[i];
      if (f.delay > 0) { f.delay -= dt; continue; }
      f.t += dt;
      const k = f.t / f.dur;
      if (k >= 1) { RD.fxs.splice(i, 1); continue; }
      if (f.kind === 'ring') {
        const [sx, sy] = W2S(f.x, f.y);
        ctx.strokeStyle = f.color; ctx.globalAlpha = 1 - k; ctx.lineWidth = S * 2 * (1 - k) + S;
        ctx.beginPath(); ctx.arc(sx, sy, f.r * TS * S * (0.2 + 0.8 * k), 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (f.kind === 'bolt') {
        ctx.strokeStyle = f.color; ctx.lineWidth = S * (k < 0.3 ? 2 : 1); ctx.globalAlpha = 1 - k;
        ctx.beginPath();
        f.pts.forEach((p, j) => { const [sx, sy] = W2S(p[0], p[1]); if (j) ctx.lineTo(sx, sy); else ctx.moveTo(sx, sy); });
        ctx.stroke(); ctx.globalAlpha = 1;
      } else if (f.kind === 'beam') {
        const [ax, ay] = W2S(f.x0, f.y0), [bx, by] = W2S(f.x1, f.y1);
        ctx.strokeStyle = f.color; ctx.globalAlpha = 1 - k;
        ctx.lineWidth = S * 5 * (1 - k); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = S * 2 * (1 - k); ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (f.kind === 'tiles') {
        ctx.fillStyle = f.color; ctx.globalAlpha = (1 - k) * 0.6;
        for (const [x, y] of f.tiles) { const [sx, sy] = W2S(x * TS, y * TS); ctx.fillRect(sx, sy, TS * S, TS * S); }
        ctx.globalAlpha = 1;
      }
    }
    // particelle
    for (let i = RD.parts.length - 1; i >= 0; i--) {
      const p = RD.parts[i];
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.life -= dt;
      if (p.life <= 0) { RD.parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt;
      const [sx, sy] = W2S(p.x, p.y);
      ctx.globalAlpha = Math.min(1, p.life / p.max * 1.5);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(sx), Math.round(sy), S * p.size, S * p.size);
    }
    ctx.globalAlpha = 1;
    // testi fluttuanti
    ctx.textAlign = 'center';
    for (let i = RD.floats.length - 1; i >= 0; i--) {
      const f = RD.floats[i];
      if (f.delay > 0) { f.delay -= dt; continue; }
      f.t += dt;
      if (f.t > f.dur) { RD.floats.splice(i, 1); continue; }
      const k = f.t / f.dur;
      const [sx, sy] = W2S(f.x, f.y - k * 14 - (f.big ? 2 : 0));
      const size = f.small ? Math.max(8, 3 * S) : f.big ? Math.max(12, 5 * S) : Math.max(10, 4 * S);
      ctx.font = size + 'px "Press Start 2P", monospace';
      const pop = k < 0.15 ? 1 + (0.15 - k) * 3 : 1;
      ctx.save(); ctx.translate(sx, sy); ctx.scale(pop, pop);
      ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      ctx.fillStyle = '#000'; ctx.fillText(f.text, 2, 2);
      ctx.fillStyle = f.color; ctx.fillText(f.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }
  function drawProjectile(ctx, sx, sy, S, p, k) {
    const c = p.color;
    ctx.fillStyle = c;
    if (p.kind === 'bomb' || p.kind === 'ice') {
      ctx.drawImage(G.itemSprite(p.kind === 'bomb' ? 'bomb' : 'flask', p.kind === 'bomb' ? '#ff6a2a' : '#bff4ff'), sx - 8 * S, sy - 8 * S, 16 * S, 16 * S);
      return;
    }
    const s = p.kind === 'rock' ? 3 : 2.5;
    ctx.fillRect(sx - s * S, sy - s * S, s * 2 * S, s * 2 * S);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(sx - S, sy - S, S, S);
  }
  const PROJ = {
    water: { color: '#5ab0ff', trail: '#a8e8ff', speed: 220 }, spore: { color: '#9be35a', trail: '#c8ff9a', speed: 140, arc: 6 },
    ink: { color: '#3a2a5a', trail: '#6a4a9a', speed: 180 }, rock: { color: '#a08a70', trail: '#7a6a5a', speed: 180, arc: 8 },
    wind: { color: '#e8f8ff', trail: '#ffffff', speed: 240 }, fire: { color: '#ff7a2a', trail: '#ffd23a', speed: 200 },
    arcane: { color: '#d8b0ff', trail: '#f0e0ff', speed: 260 }, bomb: { color: '#ff6a2a', trail: '#ffd23a', speed: 160, arc: 14 },
    ice: { color: '#bff4ff', trail: '#ffffff', speed: 160, arc: 14 },
  };

  // ---------------------------------------------------------------- ambiente
  function drawAmbient(ctx, dt, S) {
    const R = G.run; if (!R) return;
    const b = G.BIOMES[G.regionOf(R.floor)].ambient;
    const n = 26;
    while (RD.ambient.length < n) RD.ambient.push(newAmb(b, true));
    for (let i = 0; i < RD.ambient.length; i++) {
      const p = RD.ambient[i];
      p.t += dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (b === 'leaves') p.x += Math.sin(p.t * 2 + i) * 12 * dt;
      if (p.x < -20 || p.x > RD.W + 20 || p.y < -20 || p.y > RD.H + 20 || p.t > p.life) { RD.ambient[i] = newAmb(b, false); continue; }
      ctx.globalAlpha = p.a * Math.min(1, p.t, p.life - p.t);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.s * (b === 'wind' ? 6 : 1), p.s);
    }
    ctx.globalAlpha = 1;
  }
  function newAmb(b, init) {
    const W = RD.W, H = RD.H, S = RD.S;
    const r = Math.random;
    switch (b) {
      case 'leaves': return { x: r() * W, y: init ? r() * H : -10, vx: 10 + r() * 15, vy: 20 + r() * 20, c: r() < 0.5 ? '#6ab040' : '#c0a040', s: S, a: 0.6, t: 0, life: 12 };
      case 'bubbles': return { x: r() * W, y: init ? r() * H : H + 10, vx: 0, vy: -(15 + r() * 25), c: '#a8e8ff', s: Math.max(2, S - 1), a: 0.35, t: 0, life: 12 };
      case 'dust': return { x: r() * W, y: r() * H, vx: (r() - 0.5) * 6, vy: (r() - 0.5) * 6, c: '#e0c890', s: Math.max(2, S - 1), a: 0.3, t: 0, life: 6 + r() * 4 };
      case 'wind': return { x: init ? r() * W : -40, y: r() * H, vx: 160 + r() * 120, vy: 10, c: '#ffffff', s: Math.max(1, S - 2), a: 0.25, t: 0, life: 8 };
      case 'embers': return { x: r() * W, y: init ? r() * H : H + 10, vx: (r() - 0.5) * 20, vy: -(25 + r() * 35), c: r() < 0.5 ? '#ff8a2a' : '#ffd23a', s: Math.max(2, S - 1), a: 0.7, t: 0, life: 10 };
    }
    return { x: 0, y: 0, vx: 0, vy: 0, c: '#fff', s: 1, a: 0, t: 0, life: 1 };
  }

  // ---------------------------------------------------------------- mira
  function drawTargeting(ctx, S, W2S) {
    const R = G.run;
    const tg = RD.target;
    if (RD.path && RD.path.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      for (const [x, y] of RD.path) { const [sx, sy] = W2S(x * TS, y * TS); ctx.fillRect(sx + 6 * S, sy + 6 * S, 4 * S, 4 * S); }
    }
    if (RD.hover && !tg) {
      const [x, y] = RD.hover;
      if (G.inb(x, y) && R.map.seen[y * R.map.w + x]) {
        const [sx, sy] = W2S(x * TS, y * TS);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1, S / 2);
        ctx.strokeRect(sx + S / 2, sy + S / 2, (TS - 1) * S, (TS - 1) * S);
      }
    }
    if (!tg) return;
    if (tg.range) {
      ctx.fillStyle = 'rgba(120,180,255,0.10)';
      for (const [x, y] of tg.range) { const [sx, sy] = W2S(x * TS, y * TS); ctx.fillRect(sx, sy, TS * S, TS * S); }
    }
    if (tg.area) {
      ctx.fillStyle = hexA(tg.color || '#ffd23a', 0.28 + 0.1 * Math.sin(RD.time * 8));
      for (const [x, y] of tg.area) { const [sx, sy] = W2S(x * TS, y * TS); ctx.fillRect(sx + S, sy + S, (TS - 2) * S, (TS - 2) * S); }
    }
    if (tg.cursor) {
      const [x, y] = tg.cursor;
      const [sx, sy] = W2S(x * TS, y * TS);
      const c = tg.valid ? '#ffd23a' : '#ff4a4a';
      ctx.strokeStyle = c; ctx.lineWidth = S;
      const L = 4 * S, Z = TS * S;
      ctx.beginPath();
      ctx.moveTo(sx, sy + L); ctx.lineTo(sx, sy); ctx.lineTo(sx + L, sy);
      ctx.moveTo(sx + Z - L, sy); ctx.lineTo(sx + Z, sy); ctx.lineTo(sx + Z, sy + L);
      ctx.moveTo(sx + Z, sy + Z - L); ctx.lineTo(sx + Z, sy + Z); ctx.lineTo(sx + Z - L, sy + Z);
      ctx.moveTo(sx + L, sy + Z); ctx.lineTo(sx, sy + Z); ctx.lineTo(sx, sy + Z - L);
      ctx.stroke();
    }
  }

  RD.screenToTile = function (mx, my) {
    const S = RD.S;
    return [Math.floor((mx - RD.ox) / (TS * S)), Math.floor((my - RD.oy) / (TS * S))];
  };

  // ============================================================
  //  Implementazione di G.fx
  // ============================================================
  const C = (x) => x * TS + 8;
  const FX = {
    move(e, ox, oy, opts) {
      const a = A(e);
      if (e.x !== ox) a.face = e.x > ox ? 1 : -1;
      if (opts && opts.dash) for (let k = 0; k < 6; k++) RD.addPart(C(ox) + (Math.random() - 0.5) * 10, C(oy) + (Math.random() - 0.5) * 10, '#ffffff', { spread: 10, life: 0.3 });
      if (e.kind === 'hero' && !(opts && (opts.slide || opts.dash))) G.audio && G.audio.play('step');
    },
    lunge(e, dx, dy) { const a = A(e); a.lunge = { dx: U.sign(dx), dy: U.sign(dy), t: 0 }; if (dx) a.face = dx > 0 ? 1 : -1; },
    hit(e, delay) { const a = A(e); if (delay) a.flashDelay = delay / 1000; else a.flash = 0.12; for (let k = 0; k < 5; k++) RD.addPart(C(e.x), C(e.y), '#ffffff', { spread: 60, life: 0.25, delay: (delay || 0) / 1000 }); },
    float(x, y, text, color, o) { o = o || {}; RD.floats.push({ x: C(x), y: x === undefined ? 0 : y * TS + 2, text, color, t: 0, dur: o.big ? 1.1 : 0.9, delay: (o.delay || 0) / 1000, big: o.big, small: o.small }); },
    burst(x, y, color, n, delay) { for (let k = 0; k < (n || 12); k++) RD.addPart(C(x), C(y), color, { spread: 70, life: 0.5, delay: (delay || 0) / 1000 }); },
    shake(n) { RD.shakeAmt = Math.max(RD.shakeAmt, n * 1.6); },
    sound(name) { G.audio && G.audio.play(name); },
    death(e, opts) {
      const spr = G.SPR[e.type]; if (!spr) return;
      const a = A(e);
      if (!(opts && opts.vanish && e.kind === 'ally')) RD.dying.push({ spr, x: a.x, y: a.y, t: 0, dur: 0.45, flip: a.face < 0 });
      const col = (G.ELEMS[e.elem] || G.ELEMS.neutro).color;
      for (let k = 0; k < (e.flags.boss ? 60 : 18); k++) RD.addPart(C(e.x), C(e.y), k % 3 ? col : '#ffffff', { spread: e.flags.boss ? 140 : 80, life: 0.7, grav: 60 });
      if (e.flags.boss) { RD.shakeAmt = 14; FX.flash('#ffffff'); }
      delete RD.anim[e.id];
    },
    ring(x, y, r, color) { RD.fxs.push({ kind: 'ring', x: C(x), y: C(y), r, color, t: 0, dur: 0.45 }); },
    projectile(x0, y0, x1, y1, kind, delay) {
      const P = PROJ[kind] || PROJ.rock;
      const dist = Math.hypot(x1 - x0, y1 - y0) * TS;
      RD.projs.push({ x0: C(x0), y0: C(y0), x1: C(x1), y1: C(y1), t: 0, dur: Math.max(0.08, dist / P.speed * 0.5), color: P.color, trail: P.trail, arc: P.arc || 0, kind, delay: (delay || 0) / 1000 });
    },
    bolt(x0, y0, x1, y1, color, delay) {
      const pts = [];
      const ax = C(x0), ay = C(y0), bx = C(x1), by = C(y1), n = 7;
      for (let i = 0; i <= n; i++) { const k = i / n; pts.push([U.lerp(ax, bx, k) + (i && i < n ? (Math.random() - 0.5) * 8 : 0), U.lerp(ay, by, k) + (i && i < n ? (Math.random() - 0.5) * 8 : 0)]); }
      RD.fxs.push({ kind: 'bolt', pts, color, t: 0, dur: 0.3, delay: (delay || 0) / 1000 });
    },
    beam(x0, y0, x1, y1, color) { RD.fxs.push({ kind: 'beam', x0: C(x0), y0: C(y0), x1: C(x1), y1: C(y1), color, t: 0, dur: 0.4 }); },
    trail(x0, y0, x1, y1, color) {
      const n = 14;
      for (let i = 0; i < n; i++) { const k = i / n; RD.addPart(U.lerp(C(x0), C(x1), k), U.lerp(C(y0), C(y1), k), color, { spread: 12, life: 0.4 }); }
    },
    wave(x, y, dx, dy, len) {
      for (let i = 1; i <= len; i++) for (let k = -1; k <= 1; k++) {
        const tx = x + dx * i + (-dy) * k, ty = y + dy * i + dx * k;
        for (let n = 0; n < 4; n++) RD.addPart(C(tx), C(ty), n % 2 ? '#5ab0ff' : '#e0f8ff', { spread: 30, life: 0.5, delay: i * 0.05, vx: dx * 60 + (Math.random() - 0.5) * 30, vy: dy * 60 + (Math.random() - 0.5) * 30 });
      }
    },
    roots(x, y) { for (let k = 0; k < 10; k++) RD.addPart(C(x) + (Math.random() - 0.5) * 12, C(y) + 6, k % 2 ? '#5a3a1e' : '#6ee05a', { vx: (Math.random() - 0.5) * 20, vy: -40 - Math.random() * 30, life: 0.5, grav: 120 }); },
    dust(x, y, r) { for (let k = 0; k < 20 + r * 10; k++) { const a = Math.random() * Math.PI * 2, d = Math.random() * (r + 0.5) * TS; RD.addPart(C(x) + Math.cos(a) * d, C(y) + Math.sin(a) * d, k % 2 ? '#a08a6a' : '#6a5a4a', { spread: 25, up: 20, life: 0.6 }); } },
    teleport(e, ox, oy) {
      const a = A(e);
      if (ox !== undefined) for (let k = 0; k < 16; k++) RD.addPart(C(ox), C(oy), '#d8b0ff', { spread: 60, life: 0.5 });
      a.x = e.x; a.y = e.y; a.born = RD.time - 0.1;
      for (let k = 0; k < 16; k++) RD.addPart(C(e.x), C(e.y), '#d8b0ff', { spread: 60, life: 0.5 });
      if (e.kind === 'hero') RD.snapCam();
    },
    spawn(e) { const a = A(e); a.born = RD.time; for (let k = 0; k < 14; k++) RD.addPart(C(e.x), C(e.y), '#b0a0ff', { spread: 50, life: 0.5 }); },
    status(e, name) {
      if (name === 'stun' || name === 'freeze' || name === 'root' || name === 'confuse' || name === 'blind' || name === 'vuln' || name === 'weak') {
        const info = G.STATUS_INFO[name];
        if (info && (e.kind === 'hero' || G.visible(e.x, e.y))) RD.floats.push({ x: C(e.x), y: e.y * TS - 10, text: info.name, color: info.color, t: 0, dur: 1.0, delay: 0.15, small: true });
      }
    },
    levelup(h) {
      FX.ring(h.x, h.y, 2, '#ffe27a');
      for (let k = 0; k < 30; k++) RD.addPart(C(h.x) + (Math.random() - 0.5) * 14, C(h.y) + 6, k % 2 ? '#ffe27a' : '#ffffff', { vx: (Math.random() - 0.5) * 20, vy: -50 - Math.random() * 40, life: 0.9 });
      RD.floats.push({ x: C(h.x), y: h.y * TS - 6, text: 'LIVELLO ' + h.level + '!', color: '#ffe27a', t: 0, dur: 1.4, delay: 0, big: true });
    },
    flash(color) { RD.flashCol = color; RD.flashT = 0.35; },
    banner(title, sub) { G.ui.banner && G.ui.banner(title, sub); },
    floorChange() { RD.mapLayer = null; RD.resetAnims(); RD.ambient = []; },
  };
  RD.FX = FX;
  G.fx = new Proxy(FX, { get: (t, k) => t[k] || (() => {}) });
})();

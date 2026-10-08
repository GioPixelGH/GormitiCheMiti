'use strict';
// ============================================================
//  main.js : avvio e ciclo principale
// ============================================================
(function () {
  G.showError = function (err) {
    console.error(err);
    const el = document.getElementById('err');
    if (!el) return;
    el.textContent = 'Si è verificato un errore (la partita è salvata a ogni piano):\n' + (err && err.stack ? err.stack : String(err));
    el.classList.remove('hidden');
    clearTimeout(G._errT); G._errT = setTimeout(() => el.classList.add('hidden'), 12000);
  };
  window.addEventListener('error', (e) => G.showError(e.error || e.message));

  const params = new URLSearchParams(location.search);

  function loop(now) {
    try {
      const st = G.UI.state;
      if ((st === 'game' || st === 'end') && G.run) {
        G.RD.frame(now);
        G.Input.tick(now);
      }
    } catch (err) { G.showError(err); }
    requestAnimationFrame(loop);
  }

  async function boot() {
    G.meta.load();
    G.KEYS.load();
    G.buildSprites();
    G.RD.init(document.getElementById('game'));
    G.Input.bindMouse();
    G.Touch.init();
    registerSW();
    try { await Promise.race([Promise.all([document.fonts.load('12px "Press Start 2P"'), document.fonts.load('20px "VT323"')]), new Promise(r => setTimeout(r, 1500))]); } catch (e) { }
    window.addEventListener('beforeunload', () => { if (G.run && !G.run.over && G.UI.state === 'game') { G.run.stats.playMs = Date.now() - G.run.stats.startTime; G.save(); } });

    // --- modalità di test (parametri URL) ---
    if (params.get('shot') === 'sprites') return spriteSheet();
    if (params.get('hero')) {
      G.meta.data.tutorialSeen = true;
      G.newRun(params.get('hero'), { seed: +(params.get('seed') || 7), eclissi: +(params.get('ecl') || 0), route: params.get('route') ? params.get('route').split(',').map(x => x || null) : null });
      const fl = +(params.get('floor') || 1);
      const h = G.run.hero;
      for (let l = 1; l < +(params.get('lvl') || 1); l++) { h.level++; h.maxHp += 3; h.hp = h.maxHp; }
      if (params.get('relics')) for (const r of params.get('relics').split(',')) G.gainRelic(h, r);
      if (fl > 1) G.enterFloor(fl);
      if (params.get('reveal')) G.revealMap();
      G.UI.enterGame(false);
      G.run.pending = [];
      if (params.get('ui') === 'levelup') G.run.pending.push({ type: 'levelup', opts: G.rollPerks(h, 3) });
      if (params.get('ui') === 'shop') { const f = { id: 999, type: 'merchant', x: 0, y: 0, stock: G.makeStock(G.run.rng, 0) }; G.run.features.push(f); G.ensureStockRelics(f); G.run.pending.push({ type: 'shop', fid: 999 }); }
      if (params.get('ui') === 'help') G.UI.showHelp(true);
      if (params.get('auto')) { for (let i = 0; i < +params.get('auto'); i++) { const s = G.autoExploreStep({ ignoreEnemies: true }); if (!s.dir) break; G.endTurn(G.act.move(s.dir[0], s.dir[1]) || 100); if (G.run.over) break; } G.run.pending = []; G.RD.resetAnims(); }
      if (params.get('boss')) { const b = G.run.ents.find(e => e.flags.boss); if (b) { h.x = b.x; h.y = b.y + 4; G.computeFOV(); G.checkBossIntro(); G.RD.resetAnims(); } }
      G.UI.processPending();
      G.UI.refresh();
    } else if (params.get('screen') === 'select') { G.UI.showSelect(); }
    else G.UI.showTitle();
    requestAnimationFrame(loop);
  }

  // cache offline (solo se servito via http/https: con file:// i service worker non esistono)
  function registerSW() {
    // nell'app desktop (host virtuale gormiti.local) i file sono già locali: niente cache
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || location.hostname === 'gormiti.local' || params.has('nosw')) return;
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }

  // foglio con tutti gli sprite per controllo visivo
  function spriteSheet() {
    document.getElementById('game').style.display = 'none';
    const s = document.getElementById('screen');
    s.classList.remove('hidden');
    s.style.cssText = 'display:block;background:#2a2438;overflow:auto;padding:10px';
    const cv = document.createElement('canvas');
    const names = Object.keys(G.SPR);
    const SC = 4, cell = 28 * SC;
    const cols = 10;
    cv.width = cols * cell; cv.height = Math.ceil((names.length + 40) / cols) * cell + 40;
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#3a3448'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.font = '12px monospace'; ctx.fillStyle = '#fff';
    names.forEach((n, i) => {
      const x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
      const sp = G.SPR[n];
      ctx.fillStyle = '#4a4458'; ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
      ctx.drawImage(sp.img, x + (cell - sp.w * SC) / 2, y + 4, sp.w * SC, sp.h * SC);
      ctx.fillStyle = '#fff'; ctx.fillText(n, x + 4, y + cell - 6);
    });
    // reliquie
    let i = names.length;
    for (const r of G.RELICS) {
      const x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
      ctx.drawImage(G.itemSprite(r.icon, r.color), x + 10, y + 4, 16 * SC, 16 * SC);
      ctx.fillStyle = '#fff'; ctx.fillText(r.id.slice(0, 14), x + 4, y + cell - 6);
      i++;
      if (i > names.length + 39) break;
    }
    s.appendChild(cv);
    // tileset del bioma scelto
    const b = G.BIOME_BY_ID[params.get('biome')] || G.BIOMES[0];
    const ts = G.buildTileset(b);
    const tc = document.createElement('canvas');
    const keys = Object.keys(ts);
    tc.width = 20 * 16 * 4; tc.height = Math.ceil(keys.length / 4) * 18 * 4 + 20;
    const tctx = tc.getContext('2d'); tctx.imageSmoothingEnabled = false;
    keys.forEach((k, j) => {
      ts[k].forEach((img, v) => tctx.drawImage(img, ((j % 4) * 5 + v) * 64, Math.floor(j / 4) * 72, 64, 64));
    });
    s.appendChild(tc);
  }

  window.addEventListener('DOMContentLoaded', () => { boot().catch(G.showError); });
})();

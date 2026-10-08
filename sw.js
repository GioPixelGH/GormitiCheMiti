'use strict';
// ============================================================
//  sw.js : cache offline per la versione web/PWA.
//  Strategia: rete prima (così gli aggiornamenti arrivano subito),
//  cache come riserva quando si gioca senza connessione.
//  Aggiorna VERSION quando cambi l'elenco dei file.
// ============================================================
const VERSION = 'gormiti-v5';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/fonts.css',
  'css/style.css',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  'js/affixes.js',
  'js/ai.js',
  'js/audio.js',
  'js/core.js',
  'js/data_heroes.js',
  'js/data_heroes2.js',
  'js/data_items.js',
  'js/data_monsters.js',
  'js/data_monsters2.js',
  'js/data_world.js',
  'js/events.js',
  'js/explore.js',
  'js/floor.js',
  'js/game.js',
  'js/geom.js',
  'js/icons.js',
  'js/input.js',
  'js/keys.js',
  'js/main.js',
  'js/mapgen.js',
  'js/render.js',
  'js/sprites.js',
  'js/sprites2.js',
  'js/synergy.js',
  'js/tiles.js',
  'js/touch.js',
  'js/ui.js',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});

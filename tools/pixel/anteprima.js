// Anteprima degli sprite e dei ritratti del gioco, ingranditi, in un'immagine PNG.
// Uso: node tools/pixel/anteprima.js <uscita.png> <nome> [nome ...] [--scala N] [--sfondo #rrggbb]
//   i nomi sono quelli di G.SPRITE_DEFS (sprite) oppure "ritratto:<nome>" (G.PORTRAIT_DEFS)
// Riproduce il disegno del gioco: simmetria, sprite derivati (base), tavolozza e contorno scuro.
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib');

const ROOT = path.join(__dirname, '..', '..');
global.G = { RELIC_ICON_MAP: {} };
for (const f of ['sprites.js', 'sprites2.js', 'volti.js']) {
  const p = path.join(ROOT, 'js', f);
  if (fs.existsSync(p)) vm.runInThisContext(fs.readFileSync(p, 'utf8'), { filename: f });
}
const S = G.SPRITE_DEFS, PR = G.PORTRAIT_DEFS || {};
const DEF_PAL = { k: '#120d18', w: '#ffffff', y: '#ffe25a', r: '#e83a3a' };
const OUTLINE = [0x0c, 0x08, 0x12];
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

function espandi(defs, def) {
  let rows = def.rows, sym = def.sym;
  if (def.base) { let b = defs[def.base]; while (b.base) b = defs[b.base]; rows = b.rows; sym = b.sym; }
  if (sym) rows = rows.map(r => r + r.split('').reverse().join(''));
  return rows;
}
// immagine RGBA di uno sprite (con contorno)
function disegna(defs, nome) {
  const def = defs[nome];
  if (!def) throw new Error('Sprite sconosciuto: ' + nome);
  const rows = espandi(defs, def), h = rows.length, w = rows[0].length;
  const px = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x];
    if (ch === '.' || ch === ' ') continue;
    const c = hex((def.pal || {})[ch] || DEF_PAL[ch] || '#ff00ff'), i = (y * w + x) * 4;
    px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
  }
  const pieno = (x, y) => x >= 0 && y >= 0 && x < w && y < h && px[(y * w + x) * 4 + 3] === 255;
  const bordo = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!pieno(x, y) && (pieno(x + 1, y) || pieno(x - 1, y) || pieno(x, y + 1) || pieno(x, y - 1))) bordo.push((y * w + x) * 4);
  for (const i of bordo) { px[i] = OUTLINE[0]; px[i + 1] = OUTLINE[1]; px[i + 2] = OUTLINE[2]; px[i + 3] = 254; }
  return { w, h, px };
}

function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const crc = (buf) => { let c = ~0; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return (~c) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let scala = 8, sfondo = '#3a3448';
  const nomi = [];
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--scala') scala = +args[++i];
    else if (args[i] === '--sfondo') sfondo = args[++i];
    else nomi.push(args[i]);
  }
  const imgs = nomi.map(n => n.startsWith('ritratto:') ? disegna(PR, n.slice(9)) : disegna(S, n));
  const cella = Math.max(...imgs.map(i => Math.max(i.w, i.h))) * scala + 2 * scala;
  const W = cella * imgs.length, H = cella;
  const out = Buffer.alloc(W * H * 4);
  const bg = hex(sfondo);
  for (let i = 0; i < W * H; i++) { out[i * 4] = bg[0]; out[i * 4 + 1] = bg[1]; out[i * 4 + 2] = bg[2]; out[i * 4 + 3] = 255; }
  imgs.forEach((im, k) => {
    const ox = k * cella + Math.floor((cella - im.w * scala) / 2), oy = Math.floor((cella - im.h * scala) / 2);
    for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
      const i = (y * im.w + x) * 4; if (!im.px[i + 3]) continue;
      for (let dy = 0; dy < scala; dy++) for (let dx = 0; dx < scala; dx++) { const o = ((oy + y * scala + dy) * W + ox + x * scala + dx) * 4; out[o] = im.px[i]; out[o + 1] = im.px[i + 1]; out[o + 2] = im.px[i + 2]; out[o + 3] = 255; }
    }
  });
  fs.writeFileSync(args[0], png(W, H, out));
  console.log('scritto ' + args[0] + ' (' + W + 'x' + H + ')');
}
module.exports = { disegna, png, espandi };

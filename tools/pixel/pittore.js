// Piccola libreria per disegnare pixel art con forme geometriche su una griglia di caratteri
// (ogni carattere è un colore della tavolozza, '.' è trasparente). Il risultato sono le "rows"
// usate da js/sprites.js; il contorno scuro lo aggiunge il gioco.
class Tela {
  constructor(w, h) { this.w = w; this.h = h || w; this.g = Array.from({ length: this.h }, () => Array(w).fill('.')); }
  dentro(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.dentro(x, y) ? this.g[y][x] : '.'; }
  px(x, y, c) { x = Math.round(x); y = Math.round(y); if (this.dentro(x, y)) this.g[y][x] = c; return this; }
  punti(lista, c) { for (const [x, y] of lista) this.px(x, y, c); return this; }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); return this; }
  // ellisse piena con centro (cx, cy) e semiassi rx, ry (in pixel; centri a .5 per forme su griglie pari)
  ellisse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1.0001) this.px(x, y, c);
    }
    return this;
  }
  // poligono pieno (vertici in coordinate di pixel; un pixel è dentro se lo è il suo centro)
  poligono(pts, c) {
    const ys = pts.map(p => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) for (let x = 0; x < this.w; x++) {
      const px = x + 0.5, py = y + 0.5; let dentro = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) dentro = !dentro;
      }
      if (dentro) this.px(x, y, c);
    }
    return this;
  }
  linea(x0, y0, x1, y1, c, sp) {
    sp = sp || 1;
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
      if (sp === 1) this.px(x, y, c); else this.rect(Math.round(x - (sp - 1) / 2), Math.round(y - (sp - 1) / 2), sp, sp, c);
    }
    return this;
  }
  // copia la metà sinistra sulla destra (o la destra sulla sinistra)
  specchia(daDestra) {
    for (const r of this.g) for (let x = 0; x < Math.floor(this.w / 2); x++) { if (daDestra) r[x] = r[this.w - 1 - x]; else r[this.w - 1 - x] = r[x]; }
    return this;
  }
  // sostituisce un colore con un altro solo dove la condizione è vera
  ricolora(da, a, cond) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.g[y][x] === da && (!cond || cond(x, y))) this.g[y][x] = a; return this; }
  // volume: bordo in alto/sinistra più chiaro, in basso/destra più scuro, per ogni colore della mappa { c: [chiaro, scuro] }
  luce(mappa, opz) {
    opz = opz || {};
    const g0 = this.g.map(r => r.slice());
    const stesso = (c, x, y) => (y >= 0 && y < this.h && x >= 0 && x < this.w) ? g0[y][x] === c : false;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const c = g0[y][x], m = mappa[c];
      if (!m) continue;
      const scuro = !stesso(c, x, y + 1) || (!opz.soloBasso && !stesso(c, x + 1, y));
      const chiaro = !stesso(c, x, y - 1) || (!opz.soloAlto && !stesso(c, x - 1, y));
      if (scuro && m[1]) this.g[y][x] = m[1];
      else if (chiaro && m[0]) this.g[y][x] = m[0];
    }
    return this;
  }
  righe() { return this.g.map(r => r.join('')); }
}
module.exports = { Tela };

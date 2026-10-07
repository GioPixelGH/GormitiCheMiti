'use strict';
// ============================================================
//  audio.js : effetti sonori sintetizzati e musica procedurale
// ============================================================
(function () {
  const AU = G.audio = {
    ctx: null, master: null, sfx: null, mus: null, noise: null, enabled: true,
    lastPlay: {},
  };

  AU.init = function () {
    if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = AU.ctx = new AC();
    AU.master = ctx.createGain(); AU.master.gain.value = 0.9; AU.master.connect(ctx.destination);
    // compressore per evitare picchi
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    comp.connect(AU.master);
    AU.sfx = ctx.createGain(); AU.sfx.connect(comp);
    AU.mus = ctx.createGain(); AU.mus.connect(comp);
    AU.applyVolumes();
    // buffer di rumore
    const len = ctx.sampleRate * 1.5;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    AU.noise = buf;
    MUS.start();
  };
  AU.applyVolumes = function () {
    if (!AU.ctx) return;
    const s = (G.meta.data && G.meta.data.settings) || { music: 0.5, sfx: 0.7 };
    AU.sfx.gain.value = s.sfx * 0.55;
    AU.mus.gain.value = s.music * 0.32;
  };

  // ---------------- primitive ----------------
  function tone(f, dur, type, vol, slide, delay, dest) {
    const ctx = AU.ctx, t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || AU.sfx);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, freq, ftype, delay, dest, slideF) {
    const ctx = AU.ctx, t = ctx.currentTime + (delay || 0);
    const s = ctx.createBufferSource(); s.buffer = AU.noise;
    const f = ctx.createBiquadFilter(); f.type = ftype || 'lowpass'; f.frequency.setValueAtTime(freq || 2000, t);
    if (slideF) f.frequency.exponentialRampToValueAtTime(slideF, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || AU.sfx);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  AU.tone = tone; AU.noiseFx = noise;

  const SFX = {
    step: () => noise(0.05, 0.04, 900, 'lowpass'),
    door: () => { noise(0.15, 0.12, 500); tone(110, 0.15, 'square', 0.05, 80); },
    hit: () => { noise(0.08, 0.22, 2400, 'lowpass', 0, null, 400); tone(180, 0.08, 'square', 0.08, 90); },
    crit: () => { noise(0.12, 0.3, 3000, 'lowpass', 0, null, 300); tone(320, 0.12, 'sawtooth', 0.12, 80); tone(640, 0.06, 'square', 0.06, 200, 0.02); },
    hurt: () => { tone(220, 0.18, 'sawtooth', 0.14, 70); noise(0.12, 0.18, 1200); },
    miss: () => noise(0.1, 0.06, 4000, 'highpass', 0, null, 1500),
    die: () => { tone(300, 0.25, 'square', 0.1, 50); noise(0.25, 0.14, 1500, 'lowpass', 0, null, 200); },
    bossdie: () => { for (let i = 0; i < 5; i++) { noise(0.5, 0.3, 1200, 'lowpass', i * 0.12, null, 100); tone(200 - i * 30, 0.5, 'sawtooth', 0.12, 40, i * 0.12); } },
    coin: () => { tone(1320, 0.06, 'square', 0.07); tone(1760, 0.1, 'square', 0.07, null, 0.05); },
    pickup: () => { tone(660, 0.07, 'square', 0.08); tone(990, 0.09, 'square', 0.08, null, 0.06); },
    relic: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.12, null, i * 0.07)); },
    levelup: () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'square', 0.08, null, i * 0.07)); tone(1568, 0.4, 'triangle', 0.08, null, 0.35); },
    ready: () => { tone(880, 0.1, 'triangle', 0.1); tone(1320, 0.2, 'triangle', 0.1, null, 0.08); },
    trap: () => { tone(150, 0.2, 'square', 0.12, 60); noise(0.15, 0.2, 2000); },
    boom: () => { noise(0.5, 0.45, 1400, 'lowpass', 0, null, 60); tone(90, 0.4, 'sine', 0.3, 30); },
    warn: () => { tone(440, 0.08, 'square', 0.06); tone(440, 0.08, 'square', 0.06, null, 0.12); },
    fall: () => tone(600, 0.6, 'triangle', 0.12, 60),
    death: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.35, 'triangle', 0.14, null, i * 0.22)); },
    heal: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.22, 'sine', 0.1, null, i * 0.06)); },
    shield: () => { tone(300, 0.3, 'triangle', 0.12, 600); noise(0.2, 0.06, 3000, 'highpass'); },
    quake: () => { noise(0.6, 0.45, 300, 'lowpass', 0, null, 50); tone(55, 0.6, 'sine', 0.35, 30); },
    charge: () => { noise(0.25, 0.25, 600, 'lowpass', 0, null, 150); tone(120, 0.25, 'square', 0.1, 60); },
    roots: () => { noise(0.25, 0.15, 800, 'bandpass'); tone(160, 0.2, 'triangle', 0.1, 220); },
    summon: () => { [262, 330, 392, 523].forEach((f, i) => tone(f, 0.3, 'triangle', 0.1, null, i * 0.08)); noise(0.4, 0.08, 600); },
    water: () => { noise(0.25, 0.2, 1800, 'bandpass', 0, null, 500); tone(700, 0.12, 'sine', 0.06, 300); },
    wave: () => noise(0.7, 0.3, 900, 'lowpass', 0, null, 200),
    splash: () => noise(0.3, 0.2, 1400, 'bandpass', 0, null, 300),
    dash: () => noise(0.2, 0.2, 3000, 'highpass', 0, null, 800),
    wind: () => noise(0.6, 0.18, 1500, 'bandpass', 0, null, 400),
    zap: () => { for (let i = 0; i < 4; i++) tone(800 + Math.random() * 1200, 0.05, 'sawtooth', 0.07, 200, i * 0.03); noise(0.15, 0.12, 5000, 'highpass'); },
    thunder: () => { noise(0.9, 0.4, 800, 'lowpass', 0, null, 60); noise(0.1, 0.25, 6000, 'highpass'); },
    arcane: () => { tone(880, 0.2, 'sine', 0.08, 1760); tone(660, 0.25, 'triangle', 0.06, 1320, 0.04); },
    teleport: () => { tone(300, 0.3, 'sine', 0.1, 1500); tone(1500, 0.3, 'sine', 0.06, 300, 0.1); },
    holy: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.4, 'sine', 0.07, null, i * 0.05)); },
    shoot: () => { noise(0.08, 0.1, 2500, 'bandpass'); tone(400, 0.08, 'square', 0.04, 200); },
    dark: () => { tone(110, 0.6, 'sawtooth', 0.12, 55); tone(116, 0.6, 'sawtooth', 0.1, 58); },
    roar: () => { noise(0.8, 0.35, 500, 'lowpass', 0, null, 120); tone(90, 0.8, 'sawtooth', 0.18, 50); tone(95, 0.8, 'square', 0.1, 45); },
    dig: () => noise(0.18, 0.15, 700, 'lowpass', 0, null, 200),
    stone: () => { noise(0.3, 0.2, 400); tone(80, 0.3, 'square', 0.1, 50); },
    drink: () => { tone(400, 0.08, 'sine', 0.08, 600); tone(500, 0.08, 'sine', 0.08, 700, 0.09); tone(600, 0.1, 'sine', 0.08, 800, 0.18); },
    ice: () => { tone(1800, 0.3, 'triangle', 0.06, 900); noise(0.3, 0.12, 6000, 'highpass'); },
    chest: () => { tone(220, 0.1, 'square', 0.08, 330); [523, 784, 1047].forEach((f, i) => tone(f, 0.15, 'triangle', 0.1, null, 0.1 + i * 0.06)); },
    portal: () => { tone(200, 0.8, 'sine', 0.14, 900); tone(300, 0.8, 'triangle', 0.08, 1200, 0.05); },
    victory: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.3, 'square', 0.08, null, i * 0.13)); },
    select: () => tone(880, 0.05, 'square', 0.06),
    click: () => tone(660, 0.04, 'square', 0.05),
  };
  AU.play = function (name) {
    if (!AU.ctx || !AU.enabled) return;
    const f = SFX[name]; if (!f) return;
    const now = performance.now();
    if (AU.lastPlay[name] && now - AU.lastPlay[name] < 40) return; // evita accumuli
    AU.lastPlay[name] = now;
    try { f(); } catch (e) { }
  };

  // ============================================================
  //  Musica procedurale
  // ============================================================
  const SCALES = {
    dorian: [0, 2, 3, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11], harmonic: [0, 2, 3, 5, 7, 8, 11], major: [0, 2, 4, 5, 7, 9, 11], phrydom: [0, 1, 4, 5, 7, 8, 10],
  };
  const TRACKS = {
    menu:     { bpm: 84,  root: 50, scale: 'dorian',   prog: [0, 5, 3, 4], drums: 1, lead: 0.5, seed: 11 },
    foresta:  { bpm: 92,  root: 57, scale: 'dorian',   prog: [0, 3, 6, 4], drums: 1, lead: 0.45, seed: 21 },
    mare:     { bpm: 78,  root: 50, scale: 'aeolian',  prog: [0, 5, 2, 6], drums: 0, lead: 0.4, seed: 31 },
    roscamar: { bpm: 70,  root: 45, scale: 'phrygian', prog: [0, 1, 0, 6], drums: 1, lead: 0.3, seed: 41 },
    cieli:    { bpm: 100, root: 60, scale: 'lydian',   prog: [0, 1, 4, 5], drums: 1, lead: 0.5, seed: 51 },
    vulcano:  { bpm: 112, root: 52, scale: 'harmonic', prog: [0, 5, 3, 4], drums: 2, lead: 0.45, seed: 61 },
    boss:     { bpm: 144, root: 45, scale: 'phrydom',  prog: [0, 1, 0, 6], drums: 3, lead: 0.55, seed: 71 },
    final:    { bpm: 150, root: 43, scale: 'harmonic', prog: [0, 5, 1, 4], drums: 3, lead: 0.6, seed: 81 },
    victory:  { bpm: 96,  root: 55, scale: 'major',    prog: [0, 3, 4, 0], drums: 1, lead: 0.6, seed: 91 },
    defeat:   { bpm: 60,  root: 45, scale: 'aeolian',  prog: [0, 5, 3, 4], drums: 0, lead: 0.3, seed: 101 },
  };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const MUS = AU.music = { cur: null, next: null, step: 0, nextTime: 0, timer: null, fade: 1, melody: null };

  MUS.start = function () {
    if (MUS.timer) return;
    MUS.timer = setInterval(MUS.tick, 30);
  };
  MUS.set = function (name) {
    if (MUS.cur === name) return;
    MUS.cur = name;
    MUS.step = 0;
    MUS.melody = null;
    if (AU.ctx) MUS.nextTime = AU.ctx.currentTime + 0.1;
  };
  function makeMelody(tr) {
    // genera una frase di 4 battute (64 sedicesimi) deterministica
    let s = tr.seed;
    const r = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const mel = [];
    let deg = 4;
    for (let i = 0; i < 64; i++) {
      const strong = i % 4 === 0;
      if ((strong && r() < tr.lead + 0.3) || (!strong && i % 2 === 0 && r() < tr.lead * 0.5)) {
        deg += [-2, -1, -1, 0, 1, 1, 2][Math.floor(r() * 7)];
        deg = Math.max(0, Math.min(11, deg));
        mel.push({ deg, len: strong && r() < 0.5 ? 4 : 2 });
      } else mel.push(null);
    }
    return mel;
  }
  function note(scale, root, deg) {
    const sc = SCALES[scale];
    const oct = Math.floor(deg / sc.length);
    return root + sc[((deg % sc.length) + sc.length) % sc.length] + 12 * oct;
  }
  MUS.tick = function () {
    const ctx = AU.ctx;
    if (!ctx || !MUS.cur) return;
    const tr = TRACKS[MUS.cur]; if (!tr) return;
    if (!MUS.melody) MUS.melody = makeMelody(tr);
    const spb = 60 / tr.bpm / 4;
    if (MUS.nextTime < ctx.currentTime - 0.5) MUS.nextTime = ctx.currentTime + 0.05;
    while (MUS.nextTime < ctx.currentTime + 0.2) {
      playStep(tr, MUS.step, MUS.nextTime, spb);
      MUS.nextTime += spb;
      MUS.step++;
    }
  };
  function voice(f, t, dur, type, vol, filt) {
    const ctx = AU.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (filt) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filt; o.connect(fl); node = fl; }
    node.connect(g); g.connect(AU.mus);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function drum(kind, t) {
    const ctx = AU.ctx;
    if (kind === 'kick') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g); g.connect(AU.mus); o.start(t); o.stop(t + 0.2);
    } else {
      const s = ctx.createBufferSource(); s.buffer = AU.noise;
      const f = ctx.createBiquadFilter(); f.type = kind === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'hat' ? 7000 : 1800;
      const g = ctx.createGain();
      const v = kind === 'hat' ? 0.06 : 0.22, d = kind === 'hat' ? 0.04 : 0.14;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      s.connect(f); f.connect(g); g.connect(AU.mus); s.start(t, Math.random()); s.stop(t + d + 0.02);
    }
  }
  function playStep(tr, step, t, spb) {
    const pos = step % 16, bar = Math.floor(step / 16);
    const chordDeg = tr.prog[bar % tr.prog.length];
    const root = tr.root;
    // pad
    if (pos === 0) {
      for (const k of [0, 2, 4]) voice(mtof(note(tr.scale, root, chordDeg + k)), t, spb * 16, 'triangle', 0.05, 1200);
    }
    // basso
    const bassHits = tr.drums >= 2 ? [0, 3, 6, 8, 11, 14] : [0, 6, 8];
    if (bassHits.includes(pos)) voice(mtof(note(tr.scale, root - 12, chordDeg)), t, spb * 2.5, tr.drums >= 2 ? 'sawtooth' : 'triangle', 0.16, 600);
    // arpeggio
    if (pos % 2 === 0) {
      const k = [0, 2, 4, 2, 0, 4, 2, 4][(pos / 2) % 8];
      voice(mtof(note(tr.scale, root + 12, chordDeg + k)), t, spb * 1.6, 'square', 0.025, 2400);
    }
    // melodia
    const mel = MUS.melody[step % 64];
    if (mel && bar % 8 >= 2) voice(mtof(note(tr.scale, root + 12, mel.deg)), t, spb * mel.len, 'square', 0.045, 3000);
    // percussioni
    if (tr.drums >= 1) {
      if (pos === 0 || (tr.drums >= 3 && pos % 4 === 0) || (tr.drums === 2 && pos === 10)) drum('kick', t);
      if (pos === 4 || pos === 12) drum('snare', t);
      if (pos % 2 === 0 || tr.drums >= 3) drum('hat', t);
    }
  }
})();

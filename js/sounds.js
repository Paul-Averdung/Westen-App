// Orden-Sounds im Spiele-Stil ("Level up" / Achievement): werden direkt im Browser
// erzeugt (Web Audio), keine Audiodateien nötig. Je höher der Orden, desto größer der Klang.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.

// Alles in einer Kapsel, damit Hilfsnamen (z.B. pad) nicht mit anderen Dateien kollidieren.
// Nach außen sichtbar sind nur medalSound(), playMedalSound() und die Slots-Sounds.
const { medalSound, playMedalSound, slotSound, slotSoundRender, gameSound, gameSoundRender } = (function() {
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);   // MIDI-Nummer -> Hz (60 = C4)

  // ── Grundbausteine ──────────────────────────────────────────────────────────
  function _noise(ctx, sec) {
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * sec), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  // Raumhall, damit es "groß" klingt (einmal pro AudioContext erzeugt)
  const _reverbs = new WeakMap();
  function _reverbIn(ctx, out) {
    if (!_reverbs.has(ctx)) {
      const sec = 1.6, ir = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * sec), ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      }
      const conv = ctx.createConvolver(); conv.buffer = ir;
      const wet = ctx.createGain(); wet.gain.value = 0.32;
      conv.connect(wet); wet.connect(out);
      _reverbs.set(ctx, conv);
    }
    return _reverbs.get(ctx);
  }
  // Ein Ton: Oszillator + Hüllkurve, optional im Stereo-Raum verteilt
  function voice(ctx, out, { freq, t, dur = 0.3, type = 'square', gain = 0.1, attack = 0.005, pan = 0, glide = 0, cutoff = 0 }) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (cutoff) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff; o.connect(f); node = f; }
    node.connect(g);
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(out); }
    else g.connect(out);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // ── Effekte ─────────────────────────────────────────────────────────────────
  // Münz-"Pling" pro fallendem Orden (zwei schnelle Töne, wird pro Orden höher)
  function coin(ctx, out, t, step) {
    const base = 83 + Math.min(step, 9);
    voice(ctx, out, { freq: NOTE(base),     t,        dur: 0.08, type: 'square', gain: 0.05, cutoff: 5000, pan: -0.2 });
    voice(ctx, out, { freq: NOTE(base + 5), t: t + 0.07, dur: 0.32, type: 'square', gain: 0.05, cutoff: 5000, pan: 0.2 });
  }
  // Aufsteigendes Arpeggio, doppelt (Rechteck + Dreieck eine Oktave tiefer)
  function arp(ctx, out, t, notes, step = 0.075, last = 0.6, gain = 0.07) {
    notes.forEach((n, i) => {
      const isLast = i === notes.length - 1, d = isLast ? last : step * 1.6, pan = (i % 2 ? 0.25 : -0.25);
      voice(ctx, out, { freq: NOTE(n),      t: t + i * step, dur: d, type: 'square',   gain,         cutoff: 4200, pan });
      voice(ctx, out, { freq: NOTE(n - 12), t: t + i * step, dur: d, type: 'triangle', gain: gain * 1.6, pan: -pan });
    });
    return t + (notes.length - 1) * step;   // Zeitpunkt des letzten Tons
  }
  // Glitzern: viele kurze hohe Töne, verteilt im Stereo-Raum
  function sparkle(ctx, out, t, root, count = 8, step = 0.045) {
    const iv = [0, 7, 12, 16, 19, 24, 28, 31];
    for (let i = 0; i < count; i++)
      voice(ctx, out, { freq: NOTE(root + iv[i % iv.length]), t: t + i * step, dur: 0.22, type: 'sine', gain: 0.045, attack: 0.002, pan: (Math.random() * 1.6 - 0.8) });
  }
  // Flächiger Akkord (weiche, leicht verstimmte Sägezähne)
  function pad(ctx, out, t, notes, dur = 1.4, gain = 0.03) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.25); f.frequency.exponentialRampToValueAtTime(1400, t + dur);
    f.connect(out);
    notes.forEach((n, i) => [-8, 8].forEach(dt => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = NOTE(n); o.detune.value = dt;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(f); o.start(t); o.stop(t + dur + 0.05);
    }));
  }
  // "Woosh" nach oben, kündigt große Orden an
  function riser(ctx, out, t, dur = 0.6, gain = 0.12) {
    const n = ctx.createBufferSource(); n.buffer = _noise(ctx, dur + 0.05);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5;
    f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(7000, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + dur + 0.05);
  }
  // Tiefer Einschlag (Sub-Bass), gibt großen Orden Wucht
  function impact(ctx, out, t, gain = 0.45) {
    voice(ctx, out, { freq: 90, t, dur: 0.7, type: 'sine', gain, attack: 0.003, glide: 0.4 });
    const n = ctx.createBufferSource(); n.buffer = _noise(ctx, 0.4);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    const g = ctx.createGain(); g.gain.setValueAtTime(gain * 0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + 0.4);
  }

  // ── Fanfare je Orden-Stufe ──────────────────────────────────────────────────
  // Steigerung: mehr Töne, höhere Tonart, mehr Ebenen (Glitzern, Fläche, Woosh, Einschlag).
  const MAJ = r => [r, r + 4, r + 7, r + 12];
  const MEDAL_SOUNDS = {
    5:  (c, o, t) => { arp(c, o, t, [72, 76, 79], 0.08, 0.45); },                                              // Bronze
    10: (c, o, t) => { arp(c, o, t, MAJ(72), 0.075, 0.55); },                                                  // Silber
    15: (c, o, t) => { const e = arp(c, o, t, [...MAJ(72), 88], 0.07, 0.7); sparkle(c, o, e + 0.05, 84, 6); }, // Gold
    20: (c, o, t) => { const e = arp(c, o, t, [...MAJ(74), 90], 0.07, 0.8); pad(c, o, e, [62, 66, 69, 74]); sparkle(c, o, e + 0.05, 86, 6); }, // Platin
    25: (c, o, t) => { riser(c, o, t - 0.45, 0.45, 0.08);
                       const e = arp(c, o, t, [...MAJ(76), 88, 92], 0.065, 0.9); pad(c, o, e, [64, 68, 71, 76]); sparkle(c, o, e, 88, 8, 0.04); }, // Diamant
    30: (c, o, t) => { riser(c, o, t - 0.5, 0.5, 0.1); impact(c, o, t, 0.25);
                       const e = arp(c, o, t, [...MAJ(77), 89, 93], 0.065, 0.9); pad(c, o, e, [65, 69, 72, 77], 1.5); sparkle(c, o, e, 89, 8, 0.04); }, // Rubin
    35: (c, o, t) => { riser(c, o, t - 0.5, 0.5, 0.1); impact(c, o, t, 0.3);
                       const e = arp(c, o, t, [...MAJ(79), 91, 95], 0.06, 1.0); pad(c, o, e, [67, 71, 74, 79], 1.6); sparkle(c, o, e, 91, 8, 0.04); }, // Saphir
    40: (c, o, t) => { riser(c, o, t - 0.55, 0.55, 0.11); impact(c, o, t, 0.35);
                       const e = arp(c, o, t, [...MAJ(72), ...MAJ(84).slice(1)], 0.06, 1.1); pad(c, o, e, [60, 64, 67, 72, 76], 1.7); sparkle(c, o, e, 84, 10, 0.04); }, // Smaragd
    45: (c, o, t) => { riser(c, o, t - 0.6, 0.6, 0.12); impact(c, o, t, 0.4);
                       const e = arp(c, o, t, [...MAJ(74), ...MAJ(86).slice(1)], 0.055, 1.2); pad(c, o, e, [62, 66, 69, 74, 78], 1.8); sparkle(c, o, e, 86, 12, 0.035); }, // Amethyst
    50: (c, o, t) => { riser(c, o, t - 0.8, 0.8, 0.14); impact(c, o, t, 0.5);
                       const e1 = arp(c, o, t, MAJ(72), 0.06, 0.3);
                       impact(c, o, e1 + 0.32, 0.4);
                       const e2 = arp(c, o, e1 + 0.32, [...MAJ(76), 88, 91, 96], 0.055, 1.5, 0.08);
                       pad(c, o, e2, [60, 64, 67, 72, 76, 79], 2.2, 0.032); sparkle(c, o, e2, 84, 16, 0.035); }, // Schwarzer Diamant
  };


  // ── Slots-Sounds ──────────────────────────────────────────────────────────
  // Kurzer mechanischer Klick (Walzen-Raster, Hebel-Ratsche)
  function tick(ctx, out, t, { freq = 2600, gain = 0.12, dur = 0.018, pan = 0 } = {}) {
    const n = ctx.createBufferSource(); n.buffer = _noise(ctx, dur + 0.01);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.4;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f); f.connect(g);
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(out); } else g.connect(out);
    n.start(t); n.stop(t + dur + 0.01);
  }
  // Dumpfes Einrasten einer Walze
  function clunk(ctx, out, t, pan = 0) {
    voice(ctx, out, { freq: 150, t, dur: 0.16, type: 'sine', gain: 0.35, attack: 0.002, glide: 0.5, pan });
    tick(ctx, out, t, { freq: 1200, gain: 0.25, dur: 0.05, pan });
    tick(ctx, out, t + 0.04, { freq: 3200, gain: 0.08, dur: 0.02, pan });
  }
  // Hebel: Ratsche beim Runterziehen, Feder-"Boing" beim Zurückschnellen
  function leverSound(ctx, out, t) {
    for (let i = 0; i < 7; i++) tick(ctx, out, t + i * 0.03, { freq: 3000 - i * 180, gain: 0.14, dur: 0.02, pan: 0.5 });
    voice(ctx, out, { freq: 95, t: t + 0.2, dur: 0.18, type: 'sine', gain: 0.3, attack: 0.003, glide: 0.6, pan: 0.5 });
    const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = 210; lfo.frequency.value = 28; lg.gain.setValueAtTime(40, t + 0.3); lg.gain.exponentialRampToValueAtTime(1, t + 0.75);
    lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t + 0.3); g.gain.exponentialRampToValueAtTime(0.06, t + 0.31); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g); g.connect(out); o.start(t + 0.3); o.stop(t + 0.8); lfo.start(t + 0.3); lfo.stop(t + 0.8);
  }
  // Rotierende Walzen wie im Online-Casino: helles, melodisches Klimpern, solange sich
  // die Walzen drehen. Es wird zum Ende hin langsamer; jede Walze rastet mit einem
  // weichen "Tock" und einem hellen Glöckchen ein (Ton steigt von Walze zu Walze).
  function plink(ctx, out, t, n, gain = 0.045, pan = 0) {
    voice(ctx, out, { freq: NOTE(n),      t, dur: 0.16, type: 'sine',     gain,         attack: 0.002, pan });
    voice(ctx, out, { freq: NOTE(n + 12), t, dur: 0.07, type: 'triangle', gain: gain * 0.35, attack: 0.001, pan });
  }
  function spinSound(ctx, out, t, leverMs, reelTimes) {
    leverSound(ctx, out, t);
    const t0 = t + leverMs / 1000;
    const scale = [76, 79, 81, 84, 86, 88, 91, 93];        // Pentatonik -> klingt immer "nett"
    const first = t0 + 0.05, last = t0 + Math.max(...reelTimes) / 1000;
    const stops = reelTimes.map(ms => t0 + ms / 1000);
    let x = first, i = 0;
    while (x < last - 0.06) {
      const running = stops.filter(s => s > x + 0.02).length;   // wie viele Walzen drehen noch
      if (!running) break;
      const k = (x - first) / (last - first);
      const step = 0.075 + (running === 1 ? 0.03 : 0) + Math.max(0, k - 0.8) * 0.25;
      const n = scale[(i * 3 + (i >> 2)) % scale.length];      // wandernde Tonfolge
      plink(ctx, out, x, n, 0.03 + 0.008 * running, Math.sin(i * 1.3) * 0.35);
      x += step; i++;
    }
    const pans = [-0.45, 0, 0.45], stopNotes = [84, 88, 91];
    stops.forEach((ts, r) => {
      voice(ctx, out, { freq: 160, t: ts, dur: 0.12, type: 'sine', gain: 0.22, attack: 0.002, glide: 0.6, pan: pans[r] });
      tick(ctx, out, ts, { freq: 1800, gain: 0.08, dur: 0.03, pan: pans[r] });
      ding(ctx, out, ts + 0.01, NOTE(stopNotes[r]), 0.06, pans[r]);
    });
  }
  // Glocke "Ding"
  function ding(ctx, out, t, f0, gain = 0.07, pan = 0) {
    [1, 2.4, 4.1, 5.9].forEach((r, i) => voice(ctx, out, { freq: f0 * r, t, dur: 1.0 - i * 0.18, type: 'sine', gain: gain / (i + 1), attack: 0.002, pan }));
  }
  // Gewinn: Glocken-Klingeln, Münzregen-Klimpern, kleine Siegesmelodie – länger bei großem Gewinn
  function winSound(ctx, out, t, gain, small) {
    const rings = small ? 4 : Math.min(14, 6 + Math.floor(gain / 3));
    for (let i = 0; i < rings; i++) ding(ctx, out, t + i * 0.09, i % 2 ? 1568 : 1318, 0.05, i % 2 ? 0.3 : -0.3);
    arp(ctx, out, t + 0.05, [72, 76, 79, 84], 0.08, 0.5, 0.06);
    const coins = small ? 10 : Math.min(40, 14 + gain);
    for (let i = 0; i < coins; i++) {
      const tt = t + 0.25 + Math.random() * (small ? 0.6 : 1.3), f = 2600 + Math.random() * 2200;
      voice(ctx, out, { freq: f, t: tt, dur: 0.12, type: 'sine', gain: 0.035, attack: 0.001, pan: Math.random() * 1.4 - 0.7 });
      voice(ctx, out, { freq: f * 1.47, t: tt + 0.01, dur: 0.09, type: 'sine', gain: 0.02, attack: 0.001 });
    }
    if (!small) sparkle(ctx, out, t + 0.45, 84, 8, 0.05);
  }
  // Verlust: zwei kurze, gedämpfte absteigende "Bwoo"-Töne (nicht hämisch, nur "schade")
  function loseSound(ctx, out, t) {
    [[55, 0, 0.28], [52, 0.3, 0.55]].forEach(([n, at, d]) => {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6;
      f.frequency.setValueAtTime(500, t + at); f.frequency.linearRampToValueAtTime(1400, t + at + 0.08); f.frequency.exponentialRampToValueAtTime(380, t + at + d);
      f.connect(out);
      voice(ctx, f, { freq: NOTE(n), t: t + at, dur: d, type: 'sawtooth', gain: 0.12, attack: 0.02, glide: 0.97 });
    });
  }
  // Doppel oder Nichts: Münze wird geworfen (wirbelnde Klicks)
  function flipSound(ctx, out, t) {
    for (let i = 0; i < 12; i++) tick(ctx, out, t + i * 0.05 + i * i * 0.0015, { freq: 4200, gain: 0.06, dur: 0.012, pan: Math.sin(i) * 0.4 });
  }

  function _slotGraph(ctx, dest) {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
    comp.connect(dest);
    const master = ctx.createGain(); master.gain.value = 1.8; master.connect(comp);
    const bus = ctx.createGain(); bus.connect(master); bus.connect(_reverbIn(ctx, master));
    return bus;
  }
  // Für die Hörprobe/Tests: in einen beliebigen (Offline-)Kontext rendern
  function slotSoundRender(ctx, kind, opts, at) {
    const bus = _slotGraph(ctx, ctx.destination), t = (at || 0) + 0.02;
    opts = opts || {};
    if (kind === 'spin') spinSound(ctx, bus, t, opts.leverMs, opts.reelTimes);
    else if (kind === 'win') winSound(ctx, bus, t, opts.gain || 3, opts.small);
    else if (kind === 'lose') loseSound(ctx, bus, t);
    else if (kind === 'flip') flipSound(ctx, bus, t);
  }
  function slotSound(kind, opts) {
    if (!isSoundOn()) return;
    try {
      if (!_audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        _audioCtx = new AC();
      }
      const go = () => slotSoundRender(_audioCtx, kind, opts, _audioCtx.currentTime);
      if (_audioCtx.state === 'suspended') _audioCtx.resume().then(go).catch(function(){});
      else go();
    } catch(e) {}
  }


  // ── Minispiel-Sounds ──────────────────────────────────────────────────────
  // Gewehrschuss: scharfer Knall, kurzer Körper, tiefer Druck, Nachhall wie im Freien
  function shot(ctx, out, t) {
    const v = 0.9 + Math.random() * 0.2;                         // jede Kugel klingt minimal anders
    const crack = ctx.createBufferSource(); crack.buffer = _noise(ctx, 0.05);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
    const cg = ctx.createGain(); cg.gain.setValueAtTime(1.0, t); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    crack.connect(hp); hp.connect(cg); cg.connect(out); crack.start(t); crack.stop(t + 0.05);
    const body = ctx.createBufferSource(); body.buffer = _noise(ctx, 0.3);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600 * v, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.2);
    const bg = ctx.createGain(); bg.gain.setValueAtTime(0.75, t); bg.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    body.connect(lp); lp.connect(bg); bg.connect(out); body.start(t); body.stop(t + 0.3);
    voice(ctx, out, { freq: 95 * v, t, dur: 0.18, type: 'sine', gain: 0.6, attack: 0.001, glide: 0.45 });
    const tail = ctx.createBufferSource(); tail.buffer = _noise(ctx, 1.0);
    const tl = ctx.createBiquadFilter(); tl.type = 'lowpass'; tl.frequency.value = 900;
    const tg = ctx.createGain(); tg.gain.setValueAtTime(0.0001, t + 0.03); tg.gain.exponentialRampToValueAtTime(0.09, t + 0.07); tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    tail.connect(tl); tl.connect(tg); tg.connect(out); tail.start(t + 0.03); tail.stop(t + 1.0);
  }
  // Würfel klackert auf dem Tisch (Holz/Kunststoff): kurzer Klick + hölzerne Resonanz
  function clack(ctx, out, t, strength = 1, final = false) {
    const g = (final ? 1.0 : 0.6) * strength;
    tick(ctx, out, t, { freq: 2600 + Math.random() * 1400, gain: g * 0.6, dur: 0.02, pan: Math.random() * 0.6 - 0.3 });
    voice(ctx, out, { freq: 700 + Math.random() * 500, t, dur: final ? 0.09 : 0.05, type: 'triangle', gain: g * 0.5, attack: 0.001, glide: 0.8 });
    if (final) voice(ctx, out, { freq: 180, t, dur: 0.12, type: 'sine', gain: 0.25, attack: 0.002, glide: 0.6 });
  }
  // Stoppuhr: Knopf-Klick und mechanisches Ticken (5 Ticks pro Sekunde, abwechselnd hell/dunkel)
  function watchClick(ctx, out, t) {
    tick(ctx, out, t, { freq: 3200, gain: 1.0, dur: 0.016 });
    tick(ctx, out, t + 0.035, { freq: 2000, gain: 0.8, dur: 0.02 });
    voice(ctx, out, { freq: 1800, t, dur: 0.06, type: 'sine', gain: 0.18, attack: 0.001 });
  }
  function watchTick(ctx, out, t, i) {
    const hi = i % 2 === 0;
    tick(ctx, out, t, { freq: hi ? 3800 : 3000, gain: hi ? 0.9 : 0.7, dur: 0.012 });
    voice(ctx, out, { freq: hi ? 2900 : 2400, t, dur: 0.03, type: 'sine', gain: hi ? 0.14 : 0.11, attack: 0.001 });
  }

  function _fxGraph(ctx, dest, wet) {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10; comp.knee.value = 6; comp.ratio.value = 4; comp.attack.value = 0.002; comp.release.value = 0.15;
    comp.connect(dest);
    const master = ctx.createGain(); master.gain.value = 1.8; master.connect(comp);
    const bus = ctx.createGain(); bus.connect(master);
    if (wet) bus.connect(_reverbIn(ctx, master));
    return bus;
  }
  function gameSoundRender(ctx, kind, opts, at) {
    opts = opts || {};
    const t = (at || 0) + 0.005;
    const bus = _fxGraph(ctx, ctx.destination, kind === 'shot' || kind === 'startShot' || kind === 'bell');
    if (kind === 'shot') shot(ctx, bus, t);
    else if (kind === 'clack') clack(ctx, bus, t, opts.strength, opts.final);
    else if (kind === 'watchClick') watchClick(ctx, bus, t);
    else if (kind === 'watchTick') watchTick(ctx, bus, t, opts.i || 0);
    else if (kind === 'card') cardSound(ctx, bus, t);
    else if (kind === 'chip') chipSound(ctx, bus, t);
    else if (kind === 'roulette') rouletteSpin(ctx, bus, t, opts.dur || 5);
    else if (kind === 'gallop') gallop(ctx, bus, t, opts.dur || 6);
    else if (kind === 'bell') ding(ctx, bus, t, 1318, 0.12);
    else if (kind === 'startShot') shot(ctx, bus, t);
  }
  // Karte austeilen/umdrehen: kurzes Wischen + leiser Tisch-Klopfer
  function cardSound(ctx, out, t) {
    const n = ctx.createBufferSource(); n.buffer = _noise(ctx, 0.12);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(1800, t + 0.08); f.Q.value = 0.9;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + 0.12);
    tick(ctx, out, t + 0.07, { freq: 900, gain: 0.25, dur: 0.03 });
  }
  // Spielchip auf den Tisch
  function chipSound(ctx, out, t) {
    tick(ctx, out, t, { freq: 3400, gain: 0.5, dur: 0.02 });
    tick(ctx, out, t + 0.045, { freq: 2900, gain: 0.3, dur: 0.02 });
    voice(ctx, out, { freq: 2300, t, dur: 0.06, type: 'sine', gain: 0.05, attack: 0.001 });
  }
  // Roulette: Kugel rattert über die Fächer, wird langsamer, fällt mit Klacken ins Fach
  function rouletteSpin(ctx, out, t, dur) {
    let x = t + 0.05, k = 0;
    while (x < t + dur - 0.05) {
      const p = (x - t) / dur;
      tick(ctx, out, x, { freq: 2600 + Math.random() * 900, gain: 0.12 + 0.1 * p, dur: 0.012, pan: Math.sin(k * 0.7) * 0.5 });
      x += 0.035 + Math.pow(p, 2.2) * 0.28; k++;
    }
    tick(ctx, out, t + dur, { freq: 1500, gain: 0.5, dur: 0.04 });
    tick(ctx, out, t + dur + 0.09, { freq: 2200, gain: 0.25, dur: 0.03 });
    tick(ctx, out, t + dur + 0.16, { freq: 2600, gain: 0.12, dur: 0.02 });
  }
  // Galopp: Dreiertakt dumpfer Hufschläge (viele Pferde -> leicht versetzt)
  function gallop(ctx, out, t, dur) {
    for (let h = 0; h < 3; h++) {
      let x = t + h * 0.09;
      while (x < t + dur) {
        [0, 0.07, 0.14].forEach((o, i) => {
          voice(ctx, out, { freq: 120 + h * 25 + i * 10, t: x + o, dur: 0.07, type: 'sine', gain: 0.16, attack: 0.002, glide: 0.6, pan: (h - 1) * 0.4 });
          tick(ctx, out, x + o, { freq: 700, gain: 0.06, dur: 0.02, pan: (h - 1) * 0.4 });
        });
        x += 0.36 + h * 0.013;
      }
    }
  }

  // Ticken der Stoppuhr: wird im Audio-Takt vorausgeplant, damit es gleichmäßig bleibt
  let _tickTimer = null, _tickNext = 0, _tickI = 0, _tickBus = null;
  function gameSound(kind, opts) {
    if (kind === 'tickStop') { clearInterval(_tickTimer); _tickTimer = null; return; }
    if (!isSoundOn()) return;
    try {
      if (!_audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        _audioCtx = new AC();
      }
      const go = () => {
        const ctx = _audioCtx;
        if (kind === 'tickStart') {
          clearInterval(_tickTimer);
          _tickBus = _tickBus && _tickBus.context === ctx ? _tickBus : _fxGraph(ctx, ctx.destination, false);
          _tickNext = ctx.currentTime + 0.2; _tickI = 0;
          _tickTimer = setInterval(() => {
            while (_tickNext < ctx.currentTime + 0.25) { watchTick(ctx, _tickBus, _tickNext, _tickI++); _tickNext += 0.2; }
          }, 60);
          return;
        }
        gameSoundRender(ctx, kind, opts, ctx.currentTime);
      };
      if (_audioCtx.state === 'suspended') _audioCtx.resume().then(go).catch(function(){});
      else go();
    } catch(e) {}
  }

  // Komplette Klangfolge zur Orden-Animation: ein "Pling" pro fallendem Orden, dann die Fanfare,
  // genau dann, wenn der Titel erscheint. ctx/out sind optional (für die Hörprobe).
  function medalSound(milestone, drops, dropDelay, titleAt, ctx, out) {
    const make = MEDAL_SOUNDS[milestone];
    if (!make) return;
    const dest = out || ctx.destination;
    const t0 = ctx.currentTime + 0.02;
    // Kompressor hält die großen Orden unter Kontrolle, die kleinen dürfen lauter sein
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.25;
    comp.connect(dest);
    const master = ctx.createGain(); master.gain.value = 2.4; master.connect(comp);
    const bus = ctx.createGain(); bus.connect(master); bus.connect(_reverbIn(ctx, master));
    for (let i = 0; i < drops; i++) coin(ctx, bus, t0 + (220 + i * dropDelay) / 1000, i);
    make(ctx, bus, t0 + titleAt / 1000);
  }

  function playMedalSound(milestone, drops, dropDelay, titleAt) {
    if (!isSoundOn()) return;
    try {
      if (!_audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        _audioCtx = new AC();
      }
      const go = () => medalSound(milestone, drops, dropDelay, titleAt, _audioCtx);
      if (_audioCtx.state === 'suspended') _audioCtx.resume().then(go).catch(function(){});
      else go();
    } catch(e) {}
  }

  return { medalSound, playMedalSound, slotSound, slotSoundRender, gameSound, gameSoundRender };
})();

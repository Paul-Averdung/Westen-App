// Orden-Sounds: werden direkt im Browser erzeugt (Web Audio), keine Audiodateien nötig.
// Jede Stufe hat ihre eigene Fanfare – je höher der Orden, desto größer der Klang.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.

const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);   // MIDI-Nummer -> Hz (60 = C4)

// Ein einzelner Ton mit weicher Hüllkurve
function tone(ctx, out, { freq, t, dur = 0.4, type = 'triangle', gain = 0.25, attack = 0.01, glide = 0 }) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + dur + 0.05);
}

// Metallisches "Klirr" – für jeden Orden, der ins Bild fällt
function clink(ctx, out, t, pitch = 1) {
  [1, 2.76, 5.4].forEach((r, i) =>
    tone(ctx, out, { freq: 1180 * pitch * r, t, dur: 0.35 - i * 0.08, type: 'sine', gain: 0.10 / (i + 1), attack: 0.002 }));
}

// Glitzern: schnelle, hohe Töne
function sparkle(ctx, out, t, base, count = 6, step = 0.05) {
  for (let i = 0; i < count; i++)
    tone(ctx, out, { freq: NOTE(base + [0, 4, 7, 12, 16, 19, 24][i % 7]), t: t + i * step, dur: 0.25, type: 'sine', gain: 0.07, attack: 0.003 });
}

// Akkord, der stehen bleibt (Blech-artig über gefilterten Sägezahn)
function chord(ctx, out, t, notes, dur = 1.2, gain = 0.08, bright = 2200) {
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = bright; f.connect(out);
  notes.forEach(n => tone(ctx, f, { freq: NOTE(n), t, dur, type: 'sawtooth', gain, attack: 0.04 }));
}

// Tiefer Schlag (Pauke)
function boom(ctx, out, t, gain = 0.5) {
  tone(ctx, out, { freq: 110, t, dur: 0.6, type: 'sine', gain, attack: 0.003, glide: 0.45 });
}

// Melodie aus [Note, Startzeit relativ, Dauer]
function melody(ctx, out, t, notes, type = 'triangle', gain = 0.22) {
  notes.forEach(([n, at, d]) => tone(ctx, out, { freq: NOTE(n), t: t + at, dur: d, type, gain }));
}

// Fanfare je Orden-Stufe
const MEDAL_SOUNDS = {
  5:  (c, o, t) => melody(c, o, t, [[67, 0, 0.25], [72, 0.16, 0.6]]),                                   // Bronze
  10: (c, o, t) => melody(c, o, t, [[72, 0, 0.2], [76, 0.13, 0.2], [79, 0.26, 0.7]]),                   // Silber
  15: (c, o, t) => { melody(c, o, t, [[72, 0, 0.18], [76, 0.11, 0.18], [79, 0.22, 0.18], [84, 0.33, 0.8]]);
                     sparkle(c, o, t + 0.4, 84, 5); },                                                   // Gold
  20: (c, o, t) => { melody(c, o, t, [[67, 0, 0.18], [72, 0.12, 0.18], [76, 0.24, 0.18], [79, 0.36, 0.9]]);
                     chord(c, o, t + 0.36, [60, 67, 72, 76], 1.1); },                                    // Platin
  25: (c, o, t) => { sparkle(c, o, t, 84, 7, 0.06); melody(c, o, t + 0.42, [[96, 0, 0.9]], 'sine', 0.12); }, // Diamant
  30: (c, o, t) => { melody(c, o, t, [[69, 0, 0.18], [72, 0.12, 0.18], [76, 0.24, 0.18], [81, 0.36, 0.9]]);
                     chord(c, o, t + 0.36, [57, 64, 69, 72], 1.1, 0.07); },                              // Rubin (moll)
  35: (c, o, t) => { melody(c, o, t, [[74, 0, 0.16], [78, 0.1, 0.16], [81, 0.2, 0.16], [86, 0.3, 0.9]], 'sine', 0.2);
                     sparkle(c, o, t + 0.35, 86, 4); },                                                  // Saphir
  40: (c, o, t) => { melody(c, o, t, [[67, 0, 0.16], [71, 0.1, 0.16], [74, 0.2, 0.16], [79, 0.3, 0.16], [83, 0.4, 0.9]]);
                     chord(c, o, t + 0.4, [55, 62, 67, 71], 1.2); },                                     // Smaragd
  45: (c, o, t) => { melody(c, o, t, [[70, 0, 0.16], [74, 0.1, 0.16], [77, 0.2, 0.16], [82, 0.3, 0.16], [86, 0.4, 1.0]]);
                     chord(c, o, t + 0.4, [58, 65, 70, 74], 1.3); sparkle(c, o, t + 0.5, 86, 5); },     // Amethyst
  50: (c, o, t) => { boom(c, o, t); boom(c, o, t + 0.22, 0.4);
                     chord(c, o, t + 0.45, [48, 55, 60, 64, 67, 72], 1.8, 0.07, 3000);
                     melody(c, o, t + 0.45, [[72, 0, 0.2], [76, 0.14, 0.2], [79, 0.28, 0.2], [84, 0.42, 1.3]], 'triangle', 0.2);
                     sparkle(c, o, t + 0.9, 84, 7, 0.07); },                                             // Schwarzer Diamant
};

// Komplette Klangfolge zur Orden-Animation: ein Klirren pro fallendem Orden, dann die Fanfare.
// ctx/out sind optional (für die Hörprobe), sonst wird der App-AudioContext genutzt.
function medalSound(milestone, drops, dropDelay, titleAt, ctx, out) {
  const make = MEDAL_SOUNDS[milestone];
  if (!make) return;
  const t0 = ctx.currentTime + 0.02;
  const master = ctx.createGain(); master.gain.value = 1.6; master.connect(out || ctx.destination);
  for (let i = 0; i < drops; i++) clink(ctx, master, t0 + (220 + i * dropDelay) / 1000, 1 + i * 0.06);
  make(ctx, master, t0 + titleAt / 1000);
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

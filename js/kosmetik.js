// Casino-Kosmetik: Kartenrücken, Tischfilz, Rennbahn, Renntiere, Roulette-Kessel.
// Optik in css/spiele.css (Abschnitt "Casino-Kosmetik"), gekauft wird im Shop (js/shop.js).
// Besitz:  localStorage 'hopfenkonto_owned'[kategorie] = [...]
// Aktiv:   localStorage 'hopfenkonto_equip' = { cardback: 'gold', felt: 'blau', ... }
// Angewendet als data-Attribute am #game-overlay (z. B. data-felt="blau").
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const K_EQUIP = 'hopfenkonto_equip', K_OWNED = 'hopfenkonto_owned';

  // thumb: kleines Vorschaubild im Shop (CSS-Hintergrund bzw. Emoji)
  const C = {
    cardback: { label: 'Kartenrücken', icon: '🂠', games: 'Hoch oder Tief · Blackjack', try: 'hochtief', items: {
      standard: { name: 'Casino Rot',      tier: 'standard' },
      blau:     { name: 'Klassisch Blau',  tier: 'gewoehnlich' },
      rauten:   { name: 'Rautenmuster',    tier: 'selten' },
      verein:   { name: 'Vereinsgrün',     tier: 'selten' },
      deckel:   { name: 'Bierdeckel',      tier: 'episch' },
      neon:     { name: 'Neon',            tier: 'episch' },
      gold:     { name: 'Gold-Ornament',   tier: 'legendaer' },
    }},
    felt: { label: 'Tischfilz', icon: '🟩', games: 'Hoch oder Tief · Blackjack · Roulette', try: 'blackjack', items: {
      standard: { name: 'Casino Grün',     tier: 'standard' },
      blau:     { name: 'Königsblau',      tier: 'gewoehnlich' },
      bordeaux: { name: 'Bordeaux',        tier: 'gewoehnlich' },
      lila:     { name: 'Royal-Lila',      tier: 'selten' },
      schwarz:  { name: 'Schwarz-Gold',    tier: 'selten' },
      holz:     { name: 'Stammtisch',      tier: 'episch' },
      vegas:    { name: 'Vegas-Nacht',     tier: 'episch' },
      gold:     { name: 'High Roller',     tier: 'legendaer' },
    }},
    track: { label: 'Rennbahn', icon: '🏁', games: 'Pferderennen', try: 'pferde', items: {
      standard: { name: 'Grasbahn',        tier: 'standard' },
      sand:     { name: 'Sandbahn',        tier: 'gewoehnlich' },
      schnee:   { name: 'Schneebahn',      tier: 'selten' },
      strand:   { name: 'Strand',          tier: 'selten' },
      nacht:    { name: 'Flutlicht-Nacht', tier: 'episch' },
      schwimm:  { name: 'Schwimmbahn',     tier: 'legendaer' },
    }},
    racer: { label: 'Renntiere', icon: '🏇', games: 'Pferderennen', try: 'pferde', items: {
      standard: { name: 'Jockeys',         tier: 'standard',    emoji: '🏇' },
      schwein:  { name: 'Sauwettrennen',   tier: 'gewoehnlich', emoji: '🐖' },
      ente:     { name: 'Entenrennen',     tier: 'gewoehnlich', emoji: '🦆' },
      schnecke: { name: 'Schneckenrennen', tier: 'selten',      emoji: '🐌' },
      kamel:    { name: 'Kamelrennen',     tier: 'selten',      emoji: '🐪' },
      dino:     { name: 'Dino-Derby',      tier: 'episch',      emoji: '🦖' },
      f1:       { name: 'Formel-Boliden',  tier: 'legendaer',   emoji: '🏎️', car: true },
    }},
    wheel: { label: 'Roulette-Kessel', icon: '🎡', games: 'Roulette', try: 'roulette', items: {
      standard: { name: 'Nussbaum',        tier: 'standard' },
      ebenholz: { name: 'Ebenholz',        tier: 'selten' },
      chrom:    { name: 'Chrom',           tier: 'selten' },
      neon:     { name: 'Neon',            tier: 'episch' },
      gold:     { name: 'Goldkessel',      tier: 'legendaer' },
    }},
  };
  window.COSMETICS = C;

  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch(e) { return d; } };
  function equipMap() {
    const e = read(K_EQUIP, {}), own = read(K_OWNED, {}), out = {};
    // Nur gekaufte Sachen zählen (Schutz gegen herumgespielten Speicher)
    Object.keys(C).forEach(cat => {
      const id = e[cat];
      out[cat] = (id && C[cat].items[id] && (own[cat] || []).includes(id)) ? id : 'standard';
    });
    return out;
  }
  window.cosmeticEquipped = cat => equipMap()[cat];
  window.cosmeticEquip = function(cat, id) {
    const e = read(K_EQUIP, {}); e[cat] = id;
    try { localStorage.setItem(K_EQUIP, JSON.stringify(e)); } catch(err) {}
    applyCosmetics();
  };

  // Vorschau (Anprobieren) überschreibt einzelne Kategorien vorübergehend
  let _preview = {};
  window.cosmeticPreview = function(cat, id) { if (id) _preview[cat] = id; else _preview = {}; applyCosmetics(); };

  window.applyCosmetics = function() {
    const ov = document.getElementById('game-overlay'); if (!ov) return;
    const m = Object.assign(equipMap(), _preview);
    Object.keys(C).forEach(cat => { ov.dataset[cat] = m[cat]; });
    // Renntier-Emoji in einem laufenden Rennen sofort tauschen
    const r = C.racer.items[m.racer];
    ov.querySelectorAll('.pr-emoji').forEach(el => { el.outerHTML = racerHTML(el.dataset.c, el.style.animationDelay, r); });
  };
  // Formel-Bolide als eigene Zeichnung (fährt immer nach rechts, Karosserie in der Farbe der Bahn)
  const CAR = c => `<svg viewBox="0 0 64 26" aria-hidden="true">
      <rect x="1" y="3" width="11" height="3" rx="1" fill="${c}"/><rect x="5" y="5" width="3" height="10" fill="#1b1b1b"/>
      <path d="M4,20 L5,13 Q6,11 10,11 L24,10 L28,6.5 Q29,5 31,5 L36,5 Q38,5 39,7 L41,11 L52,14 Q58,16 61,19 L61,21 L4,21 Z" fill="${c}"/>
      <path d="M24,10.5 L41,11.5 L41,13 L24,12.4 Z" fill="#fff" opacity="0.85"/>
      <path d="M28,7 Q33,2.5 39,7" stroke="#1b1b1b" stroke-width="1.6" fill="none"/>
      <circle cx="33" cy="7.3" r="3" fill="#ffd54a" stroke="#1b1b1b" stroke-width="0.6"/><rect x="32.5" y="6.3" width="3" height="1.6" rx="0.6" fill="#1b1b1b"/>
      <rect x="50" y="21" width="13" height="2.4" rx="1" fill="#1b1b1b"/>
      <circle cx="14" cy="19" r="6.2" fill="#1b1b1b"/><circle cx="14" cy="19" r="2.6" fill="#9a9a9a"/>
      <circle cx="48" cy="19.6" r="5.4" fill="#1b1b1b"/><circle cx="48" cy="19.6" r="2.2" fill="#9a9a9a"/>
    </svg>`;
  // Renntiere als eigene Zeichnungen (alle laufen nach rechts). Die Bahnfarbe c ist Teil der Figur:
  // Pferd = Satteldecke + Trikot/Kappe des Jockeys, Schwein = Halstuch + Decke, Ente = Mütze + Halstuch,
  // Schnecke = Schneckenhaus, Kamel = Satteldecke + Zaumzeug, Dino = ganzer Körper. lg1/lg2 = Beine (CSS-Animation).
  const LEG = (cls, x1, y1, x2, y2, col, w) => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  const DRAW = {
    standard: c => `<svg viewBox="0 0 48 34" aria-hidden="true">
      ${LEG('lg2', 13, 22, 9, 31, '#5e3a1a', 3.2)}${LEG('lg1', 30, 21, 35, 30, '#5e3a1a', 3.2)}
      <path d="M10,15 Q2,13 1,23 Q5,18 10,19 Z" fill="#3a2412"/>
      <ellipse cx="21" cy="18" rx="12.5" ry="7" fill="#8a5a2b"/>
      <path d="M29,14 L36,5 Q38,3 40,4 L46,8.5 Q47,10 45.5,11 L39,11 L34,20 Z" fill="#8a5a2b"/>
      <path d="M36,5 L37.5,1.5 L39,4.5 Z" fill="#8a5a2b"/><path d="M29,14 L36,5 L34,8 L30,16 Z" fill="#3a2412"/>
      <circle cx="41" cy="7" r="0.9" fill="#111"/>
      ${LEG('lg1', 16, 23, 20, 32, '#7a4c22', 3.2)}${LEG('lg2', 28, 23, 24, 32, '#7a4c22', 3.2)}
      <path d="M14.5,12.5 L26.5,12.5 L25.5,21 Q20,22.5 15.5,21 Z" fill="${c}" stroke="#fff" stroke-width="0.9"/>
      <path d="M17,15 h7 M17,18 h7" stroke="#fff" stroke-width="0.8" opacity="0.7"/>
      <path d="M20,10.5 L25.5,12.5 L23.8,16.5" stroke="#f4f4f4" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M23.8,16.2 L24.6,17.6" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M18.5,11 Q19,4 24.5,2 L27,3.8 Q23,6 22,11.5 Z" fill="${c}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>
      <path d="M25,4.5 L31,8" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><path d="M31,8 L44,10" stroke="#3a2412" stroke-width="0.6"/>
      <circle cx="27.4" cy="0.6" r="2.4" fill="#f1c7a3"/><path d="M25,0.2 Q27.4,-3 29.8,0.2 L31.6,0.6 L29.8,1 Z" fill="${c}" stroke="rgba(0,0,0,0.3)" stroke-width="0.4"/>
    </svg>`,
    schwein: c => `<svg viewBox="0 0 48 34" aria-hidden="true">
      ${LEG('lg2', 15, 24, 13, 32, '#e48ea3', 3.2)}${LEG('lg1', 29, 24, 31, 32, '#e48ea3', 3.2)}
      <path d="M7,17 q-5,-1 -4,-5 q1,3 4,2" stroke="#e48ea3" stroke-width="1.4" fill="none"/>
      <ellipse cx="21" cy="19" rx="15" ry="9" fill="#f4a6b8"/>
      <circle cx="36" cy="16" r="7.2" fill="#f4a6b8"/>
      <path d="M33,9.5 L35,4 L38.5,9.5 Z" fill="#e48ea3"/>
      <ellipse cx="43" cy="17.5" rx="3.2" ry="2.8" fill="#ee8aa3"/><circle cx="42.2" cy="17.3" r="0.6" fill="#a04060"/><circle cx="44" cy="17.3" r="0.6" fill="#a04060"/>
      <circle cx="38" cy="13.5" r="1" fill="#222"/>
      <path d="M13,11.5 Q21,8 29,11.5 L28,17 Q21,15 14,17 Z" fill="${c}" stroke="#fff" stroke-width="0.7"/>
      <path d="M30.5,10 Q31.5,17 30,23" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path d="M30,12 L25,9 L26,13 Z" fill="${c}"/>
      ${LEG('lg1', 18, 25, 20, 32, '#f0a0b3', 3.2)}${LEG('lg2', 26, 25, 24, 32, '#f0a0b3', 3.2)}
    </svg>`,
    ente: c => `<svg viewBox="0 0 48 34" aria-hidden="true">
      ${LEG('lg2', 19, 25, 17, 32, '#f29a1f', 1.8)}${LEG('lg1', 24, 25, 27, 32, '#f29a1f', 1.8)}
      <path d="M17,32 h-4 M27,32 h4" stroke="#f29a1f" stroke-width="2" stroke-linecap="round"/>
      <path d="M8,20 Q2,12 6,10 Q9,15 14,15 Q22,12 30,15 Q36,18 33,25 Q28,30 18,29 Q9,28 8,20 Z" fill="#fafaf2" stroke="#d8d8cc" stroke-width="0.6"/>
      <path d="M14,19 Q21,16 28,20 Q22,25 15,23 Z" fill="#dcdcd0"/>
      <path d="M29,16 Q28,10 31,7" stroke="#fafaf2" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="34" cy="7" r="6" fill="#fafaf2" stroke="#d8d8cc" stroke-width="0.6"/>
      <path d="M39,6.5 L46,8.5 L39.5,11 Z" fill="#f29a1f"/><circle cx="35.5" cy="5.8" r="1" fill="#222"/>
      <path d="M28.5,3.5 Q30,-1 35,-0.5 Q39.5,0 39.6,3.6 Z" fill="${c}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>
      <path d="M38,3 L44,3.6 L39.5,4.6 Z" fill="${c}" stroke="rgba(0,0,0,0.3)" stroke-width="0.4"/>
      <path d="M28,13 Q32,15.5 36,12.5" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M29,14 L24,13 L26.5,16.5 Z" fill="${c}"/>
    </svg>`,
    schnecke: c => `<svg viewBox="0 0 48 34" aria-hidden="true">
      <path d="M2,31 h30" stroke="#cfe8ff" stroke-width="2" opacity="0.5" stroke-linecap="round"/>
      <path class="sn-body" d="M4,31 Q4,27 12,27 L34,26 Q38,25 39,19 L40,15 Q42,14 43,16 L42.5,22 Q44,28 40,31 Z" fill="#e8c99a" stroke="#b8935e" stroke-width="0.6"/>
      <path d="M39.5,16 L37,8 M42,16.5 L43,8.5" stroke="#b8935e" stroke-width="1.2"/><circle cx="37" cy="7.6" r="1.4" fill="#3a2a1a"/><circle cx="43" cy="8" r="1.4" fill="#3a2a1a"/>
      <circle cx="21" cy="16" r="11.5" fill="${c}" stroke="rgba(0,0,0,0.35)" stroke-width="0.8"/>
      <path d="M21,16 m-1.5,0 a1.5,1.5 0 1 1 3,0 a3.2,3.2 0 1 1 -6.4,0 a5,5 0 1 1 10,0 a7,7 0 1 1 -14,0 a9,9 0 1 1 18,0" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1.3"/>
      <ellipse cx="16.5" cy="10.5" rx="3.5" ry="2.2" fill="#fff" opacity="0.35"/>
    </svg>`,
    kamel: c => `<svg viewBox="0 0 48 34" aria-hidden="true">
      ${LEG('lg2', 12, 20, 9, 33, '#a8803f', 2.2)}${LEG('lg1', 30, 20, 33, 33, '#a8803f', 2.2)}
      <path d="M6,15 Q2,18 3,24" stroke="#8a6630" stroke-width="1.5" fill="none"/>
      <path d="M6,20 Q5,13 10,12 Q12,5 16,5 Q19,5 20,10 Q22,5 26,5 Q30,5 31,12 Q34,13 35,17 L36,10 Q36,4 41,3 L45,5 Q46,7 44,8 L40,8 L39,18 Q38,23 32,23 L10,23 Q6,23 6,20 Z" fill="#c9a063"/>
      <path d="M43,4 L44,1.5 L45,4" fill="#c9a063"/><circle cx="42" cy="5" r="0.8" fill="#222"/>
      <path d="M17,9.5 Q20,12 23,9.5 L25,18 L15,18 Z" fill="${c}" stroke="#fff" stroke-width="0.7"/>
      <path d="M15,18 l-0.6,3 M18,18 v3.2 M21.5,18 v3.2 M25,18 l0.6,3" stroke="${c}" stroke-width="1.2"/>
      <path d="M38,5 L44.5,7.5 M38.5,7.5 L37.5,13" stroke="${c}" stroke-width="1.4"/>
      ${LEG('lg1', 14, 21, 17, 33, '#b8904f', 2.2)}${LEG('lg2', 28, 21, 26, 33, '#b8904f', 2.2)}
    </svg>`,
    dino: c => `<svg viewBox="0 0 48 34" aria-hidden="true">
      <g class="lg2"><path d="M17,20 L15,27 L13,32 L17,32 L19,27 Z" fill="${c}" stroke="rgba(0,0,0,0.35)" stroke-width="0.6"/></g>
      <path d="M1,14 Q10,15 16,12 Q22,9 30,10 Q31,4 36,3 L44,3 Q47,4 47,8 L46,12 L38,12 L37,15 Q36,22 28,24 Q20,26 15,22 Q8,19 1,14 Z" fill="${c}" stroke="rgba(0,0,0,0.35)" stroke-width="0.7"/>
      <path d="M16,21 Q24,24 31,20 Q30,24 24,25 Q19,25 16,21 Z" fill="#fff" opacity="0.35"/>
      <path d="M39,12 l1,1.6 l1,-1.6 l1,1.6 l1,-1.6 l1,1.6 l1,-1.6" stroke="#fff" stroke-width="0.7" fill="none"/>
      <circle cx="39" cy="6" r="1.4" fill="#fff"/><circle cx="39.4" cy="6" r="0.7" fill="#111"/>
      <path d="M32,16 l3,3 M33.5,15 l3,2" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M14,7 l2,-3 l2,3 M19,6 l2,-3 l2,3 M24,6 l2,-3 l2,3" fill="${c}" stroke="rgba(0,0,0,0.3)" stroke-width="0.4"/>
      <g class="lg1"><path d="M24,22 L25,28 L24,32 L28.5,32 L28.5,27 L28,21 Z" fill="${c}" stroke="rgba(0,0,0,0.35)" stroke-width="0.6"/></g>
    </svg>`,
    f1: CAR,
  };
  window.racerHTML = function(color, delay, r) {
    r = r || window.cosmeticRacer();
    const c = color || '#e10600', d = delay ? ` style="animation-delay:${delay}"` : '';
    const id = Object.keys(C.racer.items).find(k => C.racer.items[k] === r) || 'standard';
    return `<span class="pr-emoji ${r.car ? 'pr-car' : 'pr-svg'} r-${id}" data-c="${c}"${d}>${DRAW[id](c)}</span>`;
  };
  window.cosmeticRacer = function() {
    const m = Object.assign(equipMap(), _preview);
    return C.racer.items[m.racer] || C.racer.items.standard;
  };

  document.addEventListener('DOMContentLoaded', () => window.applyCosmetics());
})();

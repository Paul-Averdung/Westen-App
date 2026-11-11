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
  window.racerHTML = function(color, delay, r) {
    r = r || window.cosmeticRacer();
    const c = color || '#e10600', d = delay ? ` style="animation-delay:${delay}"` : '';
    return r.car ? `<span class="pr-emoji pr-car" data-c="${c}"${d}>${CAR(c)}</span>`
                 : `<span class="pr-emoji" data-c="${c}"${d}>${r.emoji}</span>`;
  };
  window.cosmeticRacer = function() {
    const m = Object.assign(equipMap(), _preview);
    return C.racer.items[m.racer] || C.racer.items.standard;
  };

  document.addEventListener('DOMContentLoaded', () => window.applyCosmetics());
})();

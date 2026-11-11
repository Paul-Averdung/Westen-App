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
      regenbogen: { name: 'Regenbogen',    tier: 'legendaer' },
    }},
    racer: { label: 'Renntiere', icon: '🏇', games: 'Pferderennen', try: 'pferde', items: {
      standard: { name: 'Jockeys',         tier: 'standard',    emoji: '🏇' },
      schwein:  { name: 'Sauwettrennen',   tier: 'gewoehnlich', emoji: '🐖' },
      ente:     { name: 'Entenrennen',     tier: 'gewoehnlich', emoji: '🦆' },
      schnecke: { name: 'Schneckenrennen', tier: 'selten',      emoji: '🐌' },
      kamel:    { name: 'Kamelrennen',     tier: 'selten',      emoji: '🐪' },
      dino:     { name: 'Dino-Derby',      tier: 'episch',      emoji: '🦖' },
      einhorn:  { name: 'Einhörner',       tier: 'legendaer',   emoji: '🦄', trail: true },
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
    ov.querySelectorAll('.pr-emoji').forEach(el => { el.textContent = r.emoji; });
  };
  window.cosmeticRacer = function() {
    const m = Object.assign(equipMap(), _preview);
    return C.racer.items[m.racer] || C.racer.items.standard;
  };

  document.addEventListener('DOMContentLoaded', () => window.applyCosmetics());
})();

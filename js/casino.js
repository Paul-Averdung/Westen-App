// Casino: zentrales Menü für alle Glücksspiele.
// Neues Spiel hinzufügen: Eintrag in GAMES mit ready: true und open: () => meinSpielÖffnen().
// Coins laufen über window.Coins (get / spend / add), siehe js/spiele.js.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const roulette = `<svg viewBox="0 0 64 64" width="56" height="56">${
    Array.from({ length: 12 }, (_, i) => {
      const a1 = i / 12 * Math.PI * 2, a2 = (i + 1) / 12 * Math.PI * 2, p = a => (32 + Math.cos(a) * 28).toFixed(1) + ',' + (32 + Math.sin(a) * 28).toFixed(1);
      return `<path d="M32,32 L${p(a1)} A28,28 0 0 1 ${p(a2)} Z" fill="${i === 0 ? '#1f8a3a' : i % 2 ? '#111' : '#c0182b'}"/>`;
    }).join('')}<circle cx="32" cy="32" r="28" fill="none" stroke="#E8B923" stroke-width="3"/><circle cx="32" cy="32" r="10" fill="#E8B923"/><circle cx="32" cy="32" r="4" fill="#7a5a12"/><circle cx="46" cy="18" r="3.2" fill="#fff"/></svg>`;

  const wheel = `<svg viewBox="0 0 64 64" width="56" height="56">${
    Array.from({ length: 8 }, (_, i) => {
      const a1 = (i / 8 - 0.0625) * Math.PI * 2, a2 = ((i + 1) / 8 - 0.0625) * Math.PI * 2, p = a => (32 + Math.cos(a) * 26).toFixed(1) + ',' + (34 + Math.sin(a) * 26).toFixed(1);
      return `<path d="M32,34 L${p(a1)} A26,26 0 0 1 ${p(a2)} Z" fill="${['#e63946', '#ffd54a', '#2a9d8f', '#f4a261', '#7b5cff', '#ffd54a', '#4dabf7', '#f4a261'][i]}"/>`;
    }).join('')}<circle cx="32" cy="34" r="26" fill="none" stroke="#fff" stroke-width="3"/><circle cx="32" cy="34" r="5" fill="#fff"/><polygon points="27,2 37,2 32,12" fill="#fff" stroke="#333" stroke-width="1"/></svg>`;
  const cards = `<svg viewBox="0 0 64 64" width="56" height="56">
    <g transform="rotate(-12 26 34)"><rect x="10" y="12" width="30" height="42" rx="4" fill="#fff" stroke="#333" stroke-width="1"/><text x="15" y="25" font-size="11" font-weight="700" fill="#111" font-family="Georgia,serif">A</text><text x="25" y="44" font-size="16" fill="#111">♠</text></g>
    <g transform="rotate(10 38 34)"><rect x="24" y="10" width="30" height="42" rx="4" fill="#fff" stroke="#333" stroke-width="1"/><text x="29" y="23" font-size="11" font-weight="700" fill="#c0182b" font-family="Georgia,serif">K</text><text x="38" y="42" font-size="16" fill="#c0182b">♥</text></g></svg>`;

  const hiLo = `<svg viewBox="0 0 64 64" width="56" height="56">
    <g transform="rotate(-8 22 34)"><rect x="6" y="14" width="30" height="42" rx="4" fill="#fff" stroke="#333"/><text x="11" y="27" font-size="11" font-weight="700" fill="#c0182b" font-family="Georgia,serif">7</text><text x="19" y="46" font-size="15" fill="#c0182b">♦</text></g>
    <path d="M48 10 l10 12 h-6 v10 h-8 v-10 h-6 z" fill="#3cbf6a" stroke="#0b3018" stroke-width="1.5"/>
    <path d="M48 58 l10 -12 h-6 v-10 h-8 v10 h-6 z" fill="#e0536a" stroke="#3a1015" stroke-width="1.5"/></svg>`;

  const GAMES = [
    { id: 'slots',     name: 'Hopfen-Slots', desc: 'Drei Gleiche = dreifacher Einsatz', icon: '🎰', ready: true,
      bg: 'linear-gradient(160deg, #8a1424 0%, #4e0912 100%)', open: () => openSlotsGame() },
    { id: 'hochtief',  name: 'Hoch oder Tief', desc: 'Je riskanter der Tipp, desto höher der Gewinn', icon: hiLo, ready: true,
      bg: 'linear-gradient(160deg, #6a3a0a 0%, #2a1604 100%)', open: () => openHochTief() },
    { id: 'pferde',    name: 'Pferderennen', desc: '8 Pferde – Geld für Platz 1, 2 und 3', icon: '🏇', ready: true,
      bg: 'linear-gradient(160deg, #3d8a2e 0%, #173a10 100%)', open: () => openPferderennen() },
    { id: 'blackjack', name: 'Blackjack',    desc: 'Komm näher an 21 als die Bank', icon: cards, ready: true,
      bg: 'linear-gradient(160deg, #1f6a3a 0%, #0b3018 100%)', open: () => openBlackjack() },
    { id: 'roulette',  name: 'Roulette',     desc: 'Rot, Schwarz oder volle Zahl', icon: roulette, ready: true,
      bg: 'linear-gradient(160deg, #3a2a6e 0%, #150c32 100%)', open: () => openRoulette() },
  ];
  window.CASINO_GAMES = GAMES;

  function render() {
    document.getElementById('casino-coins').textContent = Coins.get().toLocaleString('de-DE');
    document.getElementById('casino-grid').innerHTML = GAMES.map(g => `
      <div class="cs-game${g.ready ? '' : ' soon'}" style="background:${g.bg}" ${g.ready ? `onclick="playCasinoGame('${g.id}')" role="button" tabindex="0"` : ''}>
        <div class="cs-icon">${g.icon}</div>
        <div class="cs-name">${g.name}</div>
        <div class="cs-desc">${g.desc}</div>
        ${g.ready ? '<div class="cs-play">Spielen ›</div>' : '<div class="cs-soon">🔒 Bald verfügbar</div>'}
      </div>`).join('');
  }
  window.refreshCasino = function() {
    if (document.getElementById('casino-overlay').classList.contains('open')) render();
  };
  window.openCasino = function() {
    const d = Coins.daily(), msg = document.getElementById('casino-daily');
    msg.textContent = d === 'start' ? '🎁 Willkommen! 100 Start-Coins gutgeschrieben!' : d === 'daily' ? '🎁 +30 Tages-Coins gutgeschrieben!' : '';
    render();
    document.getElementById('casino-overlay').classList.add('open');
  };
  window.closeCasino = function() { document.getElementById('casino-overlay').classList.remove('open'); };
  window.playCasinoGame = function(id) {
    const g = GAMES.find(x => x.id === id);
    if (!g || !g.ready) return;
    closeCasino();
    g.open();
  };
})();

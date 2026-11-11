// Gemeinsamer Rahmen für die Casino-Spiele (Hoch oder Tief, Pferderennen, Blackjack, Roulette):
// ein Fenster mit Kopfzeile (Titel, Coins, zurück ins Casino) und ein Einsatz-Regler.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const MAX_BET = 100;
  let _onClose = null;
  window.GameShell = {
    MAX_BET,
    open(title, render, onClose) {
      const ov = document.getElementById('game-overlay');
      ov.querySelector('.gm-title').innerHTML = title;
      const root = document.getElementById('game-root');
      root.innerHTML = ''; root.className = '';
      _onClose = onClose || null;
      ov.classList.add('open'); ov.scrollTop = 0;
      render(root);
      GameShell.coins();
    },
    close() {
      if (_onClose) { try { _onClose(); } catch(e) {} }
      _onClose = null;
      document.getElementById('game-overlay').classList.remove('open');
      openCasino();
    },
    coins() { document.getElementById('game-coins').textContent = Coins.get().toLocaleString('de-DE'); },
    // Einsatz-Regler (HTML) und Wert
    betHTML(id, val) {
      return `<div class="gm-bet"><span>Einsatz</span>
        <button onclick="GameShell.step('${id}',-5)">−5</button><button onclick="GameShell.step('${id}',-1)">−</button>
        <input id="${id}" type="number" inputmode="numeric" min="1" max="${MAX_BET}" value="${val || 5}" oninput="GameShell.clamp('${id}')">
        <button onclick="GameShell.step('${id}',1)">+</button><button onclick="GameShell.step('${id}',5)">+5</button></div>`;
    },
    bet(id) { const v = parseInt(document.getElementById(id).value); return isNaN(v) ? 1 : Math.max(1, Math.min(MAX_BET, v)); },
    step(id, d) { const el = document.getElementById(id); el.value = Math.max(1, Math.min(MAX_BET, GameShell.bet(id) + d)); },
    clamp(id) { const el = document.getElementById(id); if (parseInt(el.value) > MAX_BET) el.value = MAX_BET; },
    // Einsatz abbuchen; false wenn zu wenig Coins
    take(n) { const ok = Coins.spend(n); GameShell.coins(); if (!ok) GameShell.toast('Nicht genug Coins'); return ok; },
    pay(n, big) { if (n <= 0) return; big ? Coins.add(n) : Coins.credit(n); GameShell.coins(); setTimeout(GameShell.coins, 1500); },
    toast(text) {
      const t = document.getElementById('game-toast');
      t.textContent = text; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    },
    // Spielkarte als HTML. card = { r: '2'..'10','B','D','K','A', s: '♠♥♦♣' } oder null (verdeckt)
    cardHTML(card, cls) {
      if (!card) return `<div class="pc back ${cls || ''}"></div>`;
      const red = card.s === '♥' || card.s === '♦';
      return `<div class="pc ${red ? 'red' : ''} ${cls || ''}"><span class="pc-r">${card.r}</span><span class="pc-s">${card.s}</span><span class="pc-big">${card.s}</span></div>`;
    },
    fmt: n => (Math.round(n * 100) / 100).toLocaleString('de-DE'),
  };
})();

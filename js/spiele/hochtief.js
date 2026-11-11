// Hoch oder Tief
// Regeln: Einsatz setzen → erste Karte. Tippe, ob die nächste höher oder tiefer ist.
// Der Multiplikator richtet sich nach der Wahrscheinlichkeit: unwahrscheinlicher Tipp = mehr Gewinn.
// Multiplikator = RUECKFLUSS / Wahrscheinlichkeit (110 % = Vorteil für die Spieler). Gleicher Wert = weiter.
// Nach dem ersten Treffer jederzeit auszahlen. Topf ist bei TOPF_MAX gedeckelt (dann Auto-Auszahlung).
// Ass ist hoch (2 … 10, B, D, K, A). Jede Karte wird unabhängig gezogen.
(function() {
  const RUECKFLUSS = 1.10;
  const TOPF_MAX = 1000;
  const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'];   // Wert = Index + 2
  const SUITS = ['♠', '♥', '♦', '♣'];
  let st = null;

  const draw = () => { const i = Math.floor(Math.random() * 13); return { v: i + 2, r: RANKS[i], s: SUITS[Math.floor(Math.random() * 4)] }; };
  // Wahrscheinlichkeit und Multiplikator für einen Tipp (Gleichstand zählt nicht)
  function chance(card, dir) {
    const above = 14 - card.v, below = card.v - 2;
    const n = dir === 'hi' ? above : below;
    if (n === 0) return { p: 0, m: 0 };
    const p = n / (above + below);
    return { p, m: RUECKFLUSS / p };
  }
  window.hochTiefChance = chance;   // für Tests

  function render() {
    const root = document.getElementById('game-root');
    if (!st || !st.active) {
      root.innerHTML = `
        <div class="ht-table">
          <div class="ht-cards">${st && st.card ? GameShell.cardHTML(st.card, 'big') : GameShell.cardHTML(null, 'big')}</div>
          <div class="gm-msg ${st && st.msgCls || 'info'}">${st && st.msg || 'Höher oder tiefer? Je riskanter, desto mehr Gewinn.'}</div>
          <div class="ht-hist">${st && st.hist ? st.hist.map(c => GameShell.cardHTML(c, 'small')).join('') : ''}</div>
        </div>
        ${GameShell.betHTML('ht-bet', st && st.bet)}
        <button class="gm-btn" onclick="hochTiefStart()">Karte ziehen</button>
        <div class="ht-rules">Ass ist hoch. Gleicher Wert = weiter ohne Verlust. Auszahlen nach dem ersten Treffer jederzeit. Topf max. ${TOPF_MAX.toLocaleString('de-DE')} Coins.</div>`;
      return;
    }
    const hi = chance(st.card, 'hi'), lo = chance(st.card, 'lo');
    const btn = (dir, c, label) => `<button class="ht-guess ${dir}" ${c.p ? '' : 'disabled'} onclick="hochTiefGuess('${dir}')">
        <b>${label}</b><span>${c.p ? Math.round(c.p * 100) + ' % Chance' : 'unmöglich'}</span><em>${c.p ? '×' + GameShell.fmt(c.m) + ' (+' + Math.round((c.m - 1) * 100) + ' %)' : '–'}</em></button>`;
    root.innerHTML = `
      <div class="ht-table">
        <div class="ht-pot"><span>Topf</span><b>🪙 ${Math.floor(st.pot).toLocaleString('de-DE')}</b><small>Einsatz ${st.bet} · ${st.steps} Treffer</small></div>
        <div class="ht-cards">${GameShell.cardHTML(st.card, 'big ' + (st.anim || ''))}</div>
        <div class="gm-msg ${st.msgCls || 'info'}">${st.msg || ''}</div>
        <div class="ht-hist">${st.hist.map(c => GameShell.cardHTML(c, 'small')).join('')}</div>
      </div>
      <div class="ht-btns">${btn('hi', hi, '▲ Höher')}${btn('lo', lo, '▼ Tiefer')}</div>
      <button class="gm-btn ${st.steps ? '' : 'sec'}" ${st.steps ? '' : 'disabled'} onclick="hochTiefCashout()">💰 Auszahlen: ${Math.floor(st.pot).toLocaleString('de-DE')} Coins</button>`;
    st.anim = '';
  }

  window.openHochTief = function() {
    st = null;
    GameShell.open('🃏 Hoch oder Tief', render);
  };
  window.hochTiefStart = function() {
    const bet = GameShell.bet('ht-bet');
    if (!GameShell.take(bet)) return;
    st = { active: true, bet, pot: bet, steps: 0, card: draw(), hist: [], msg: 'Höher oder tiefer?', msgCls: 'info', anim: 'deal' };
    gameSound('card');
    render();
  };
  window.hochTiefGuess = function(dir) {
    if (!st || !st.active) return;
    const c = chance(st.card, dir);
    if (!c.p) return;
    const next = draw();
    st.hist.push(st.card); if (st.hist.length > 9) st.hist.shift();
    gameSound('card');
    if (next.v === st.card.v) {
      st.msg = 'Gleicher Wert – weiter ohne Verlust'; st.msgCls = 'info';
    } else if ((dir === 'hi') === (next.v > st.card.v)) {
      st.pot *= c.m; st.steps++;
      st.msg = 'Richtig! +' + Math.round((c.m - 1) * 100) + ' %'; st.msgCls = 'win';
      if (st.pot >= TOPF_MAX) { st.pot = TOPF_MAX; st.card = next; st.anim = 'flip'; render(); setTimeout(() => cashout('Topf voll – automatisch ausgezahlt!'), 700); return; }
    } else {
      st.active = false; st.card = next; st.anim = 'flip';
      st.msg = 'Leider falsch – der Topf ist weg'; st.msgCls = 'lose';
      slotSound('lose'); render(); return;
    }
    st.card = next; st.anim = 'flip';
    render();
  };
  function cashout(text) {
    if (!st || !st.active || !st.steps) return;
    const win = Math.floor(st.pot);
    st.active = false;
    GameShell.pay(win, true);
    st.msg = (text || 'Ausgezahlt!') + ' +' + win.toLocaleString('de-DE') + ' Coins'; st.msgCls = 'win';
    render();
  }
  window.hochTiefCashout = () => cashout();
})();

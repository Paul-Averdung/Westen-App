// Blackjack – klassische Regeln:
// 6 Decks (neu gemischt, wenn weniger als ein Viertel übrig ist). Bank zieht bis 16, bleibt ab 17 (auch Soft 17).
// Hausregeln zugunsten der Spieler: Blackjack zahlt 2:1, Gleichstand bei 20 oder 21 gewinnt der Spieler
// (Rückfluss ca. 100–105 % je nach Spielweise). Verdoppeln mit den ersten zwei Karten. Einmal Teilen bei
// gleichem Rang; geteilte Asse bekommen je nur eine Karte. Ass-Zehn nach Teilen zählt als 21, nicht als Blackjack.
// Hat die Bank Blackjack (Ass oder Zehn offen → wird geprüft), verliert man sofort (außer bei eigenem Blackjack).
(function() {
  const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'], SUITS = ['♠', '♥', '♦', '♣'];
  let shoe = [], g = null;

  function newShoe() {
    shoe = [];
    for (let d = 0; d < 6; d++) for (const s of SUITS) for (const r of RANKS) shoe.push({ r, s });
    for (let i = shoe.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shoe[i], shoe[j]] = [shoe[j], shoe[i]]; }
  }
  let _testMode = false;
  const draw = () => { if (shoe.length < 78 && !_testMode) newShoe(); return shoe.pop(); };
  const val = c => c.r === 'A' ? 11 : ['B', 'D', 'K', '10'].includes(c.r) ? 10 : +c.r;
  function total(cards) {
    let t = 0, aces = 0;
    cards.forEach(c => { t += val(c); if (c.r === 'A') aces++; });
    while (t > 21 && aces) { t -= 10; aces--; }
    return { t, soft: aces > 0 };
  }
  const isBJ = h => h.cards.length === 2 && total(h.cards).t === 21 && !h.split;
  window.bjTotal = total;   // für Tests
  window.bjDebug = () => g;
  window.bjTestShoe = cards => { _testMode = true; shoe = cards.slice().reverse(); };   // für Tests: nächste Karten festlegen (vorne = zuerst)

  function handHTML(h, i) {
    const tt = total(h.cards);
    const lbl = isBJ(h) ? 'Blackjack!' : tt.t > 21 ? tt.t + ' – über 21' : (tt.soft && tt.t <= 21 && tt.t !== 21 ? (tt.t - 10) + ' / ' + tt.t : tt.t);
    return `<div class="bj-hand ${g.state === 'spieler' && i === g.cur ? 'cur' : ''}">
      <div class="bj-cards">${h.cards.map((c, k) => GameShell.cardHTML(c, k >= h.shown ? 'deal' : '')).join('')}</div>
      <div class="bj-total">${lbl}${h.doubled ? ' · verdoppelt' : ''}${h.res ? ' · <b class="' + h.resCls + '">' + h.res + '</b>' : ''}</div></div>`;
  }
  // Kartenschlitten oben rechts – zeigt den gewählten Kartenrücken
  const SHOE_HTML = () => `<div class="bj-shoe">${GameShell.cardHTML(null, 'small')}${GameShell.cardHTML(null, 'small')}${GameShell.cardHTML(null, 'small')}</div>`;
  function render() {
    const SHOE = SHOE_HTML();
    const root = document.getElementById('game-root');
    if (!g || g.state === 'bereit') {
      root.innerHTML = `<div class="bj-table">${SHOE}<div class="bj-label">BLACKJACK ZAHLT 2:1 · GLEICHSTAND BEI 20/21 GEWINNT</div>
          <div class="bj-empty">Setz deinen Einsatz und teil aus.</div>${g && g.msg ? `<div class="gm-msg ${g.msgCls}">${g.msg}</div>` : ''}</div>
        ${GameShell.betHTML('bj-bet', g && g.bet)}
        <button class="gm-btn" onclick="bjDeal()">Austeilen</button>`;
      return;
    }
    const dealerHidden = g.state === 'spieler';
    const dCards = g.dealer.map((c, k) => (k === 1 && dealerHidden) ? GameShell.cardHTML(null) : GameShell.cardHTML(c, k >= g.dShown ? 'deal' : '')).join('');
    const dTotal = dealerHidden ? total([g.dealer[0]]).t : total(g.dealer).t;
    const h = g.hands[g.cur];
    const canDouble = g.state === 'spieler' && h.cards.length === 2 && !h.splitAces && Coins.get() >= h.bet;
    const canSplit = g.state === 'spieler' && g.hands.length === 1 && h.cards.length === 2 && h.cards[0].r === h.cards[1].r && Coins.get() >= h.bet;
    root.innerHTML = `<div class="bj-table">${SHOE}
        <div class="bj-label">BANK ${g.state === 'spieler' ? '' : '· ' + (total(g.dealer).t > 21 ? 'über 21' : dTotal)}</div>
        <div class="bj-cards dealer">${dCards}</div>
        <div class="bj-sep"></div>
        <div class="bj-hands">${g.hands.map(handHTML).join('')}</div>
        <div class="gm-msg ${g.msgCls || 'info'}">${g.msg || ''}</div>
      </div>
      ${g.state === 'spieler' ? `<div class="bj-actions">
        <button class="gm-btn" onclick="bjHit()">Karte</button>
        <button class="gm-btn sec" onclick="bjStand()">Halten</button>
        <button class="gm-btn sec" ${canDouble ? '' : 'disabled'} onclick="bjDouble()">Verdoppeln</button>
        <button class="gm-btn sec" ${canSplit ? '' : 'disabled'} onclick="bjSplit()">Teilen</button></div>`
        : `<button class="gm-btn" onclick="bjNew()">Neue Runde</button>`}`;
    g.hands.forEach(x => x.shown = x.cards.length); g.dShown = g.dealer.length;
  }

  window.openBlackjack = function() {
    if (!shoe.length) newShoe();
    g = null;
    GameShell.open('🃏 Blackjack', render);
  };
  window.bjNew = function() {
    const bet = g ? g.bet : 5;
    g = { state: 'bereit', bet, msg: g && g.msg, msgCls: g && g.msgCls };
    render();
  };
  window.bjDeal = function() {
    const bet = GameShell.bet('bj-bet');
    if (!GameShell.take(bet)) return;
    g = { state: 'spieler', bet, dealer: [draw(), draw()], hands: [{ cards: [], bet, shown: 0 }], cur: 0, dShown: 0, msg: '', msgCls: 'info' };
    g.hands[0].cards.push(draw(), draw());
    // Reihenfolge wie am Tisch: Spieler, Bank, Spieler, Bank
    [0, 150, 300, 450].forEach(d => setTimeout(() => gameSound('card'), d));
    const pBJ = isBJ(g.hands[0]), dUp = val(g.dealer[0]), dBJ = total(g.dealer).t === 21;
    if (pBJ || (dBJ && dUp >= 10)) { settle(); return; }
    render();
  };
  window.bjHit = function() {
    const h = g.hands[g.cur];
    h.cards.push(draw()); gameSound('card');
    const t = total(h.cards).t;
    if (t > 21) { h.res = 'über 21'; h.resCls = 'lose'; nextHand(); return; }
    if (t === 21) { nextHand(); return; }
    render();
  };
  window.bjStand = () => nextHand();
  window.bjDouble = function() {
    const h = g.hands[g.cur];
    if (!GameShell.take(h.bet)) return;
    h.bet *= 2; h.doubled = true; h.cards.push(draw()); gameSound('card');
    if (total(h.cards).t > 21) { h.res = 'über 21'; h.resCls = 'lose'; }
    nextHand();
  };
  window.bjSplit = function() {
    const h = g.hands[0];
    if (!GameShell.take(h.bet)) return;
    const aces = h.cards[0].r === 'A';
    const a = { cards: [h.cards[0], draw()], bet: h.bet, split: true, splitAces: aces, shown: 1 };
    const b = { cards: [h.cards[1], draw()], bet: h.bet, split: true, splitAces: aces, shown: 1 };
    g.hands = [a, b]; g.cur = 0; gameSound('card'); setTimeout(() => gameSound('card'), 150);
    if (aces) { g.cur = 1; nextHand(); return; }   // geteilte Asse: je eine Karte, dann fertig
    if (total(a.cards).t === 21) { nextHand(); return; }
    render();
  };
  function nextHand() {
    if (g.cur < g.hands.length - 1) {
      g.cur++;
      if (total(g.hands[g.cur].cards).t === 21) return nextHand();
      render(); return;
    }
    dealerPlay();
  }
  function dealerPlay() {
    g.state = 'bank';
    const alive = g.hands.some(h => total(h.cards).t <= 21);
    if (alive) while (total(g.dealer).t < 17) g.dealer.push(draw());
    settle();
  }
  function settle() {
    g.state = 'ende';
    const d = total(g.dealer).t, dBJ = g.dealer.length === 2 && d === 21;
    let back = 0, stake = 0;
    g.hands.forEach(h => {
      stake += h.bet;
      const t = total(h.cards).t, bj = isBJ(h);
      if (bj && !dBJ) { back += h.bet * 3; h.res = 'Blackjack! 2:1'; h.resCls = 'win'; }
      else if (bj && dBJ) { back += h.bet; h.res = 'Unentschieden'; h.resCls = 'info'; }
      else if (t > 21) { h.res = 'über 21'; h.resCls = 'lose'; }
      else if (dBJ) { h.res = 'Bank hat Blackjack'; h.resCls = 'lose'; }
      else if (d > 21 || t > d) { back += h.bet * 2; h.res = 'Gewonnen'; h.resCls = 'win'; }
      else if (t === d && t >= 20) { back += h.bet * 2; h.res = 'Gleichstand ' + t + ' – gewonnen!'; h.resCls = 'win'; }
      else if (t === d) { back += h.bet; h.res = 'Unentschieden'; h.resCls = 'info'; }
      else { h.res = 'Verloren'; h.resCls = 'lose'; }
    });
    back = Math.floor(back);
    const net = back - stake;
    g.msg = net > 0 ? '+' + net.toLocaleString('de-DE') + ' Coins' : net === 0 ? 'Einsatz zurück' : 'Bank gewinnt';
    g.msgCls = net > 0 ? 'win' : net === 0 ? 'info' : 'lose';
    if (back > 0) GameShell.pay(back, net > 0); else slotSound('lose');
    render();
  }
})();

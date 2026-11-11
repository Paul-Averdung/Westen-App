// Roulette – europäisch, eine Null. Chips 1/5/10/25 auf das Tableau setzen (gesamt max. 100 pro Dreh).
// Auszahlung (inkl. Einsatz, erhöht zugunsten der Spieler, ca. 111–112 %):
// Zahl 41×, Dutzend/Kolonne 3,45×, Rot/Schwarz, Gerade/Ungerade, 1–18/19–36 je 2,3×. Summe wird gerundet.
// Fällt die 0, verlieren alle Außenwetten.
(function() {
  const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const MAX_TOTAL = 100, CHIPS = [1, 5, 10, 25];
  // Wett-Arten: Schlüssel → { label, payout (Faktor inkl. Einsatz), wins(n) }
  const BETS = {
    rot:    { label: 'Rot',      pay: 2.3, wins: n => RED.has(n) },
    schwarz:{ label: 'Schwarz',  pay: 2.3, wins: n => n > 0 && !RED.has(n) },
    gerade: { label: 'Gerade',   pay: 2.3, wins: n => n > 0 && n % 2 === 0 },
    ungerade:{ label: 'Ungerade',pay: 2.3, wins: n => n % 2 === 1 },
    tief:   { label: '1–18',     pay: 2.3, wins: n => n >= 1 && n <= 18 },
    hoch:   { label: '19–36',    pay: 2.3, wins: n => n >= 19 },
    d1: { label: '1. Dutzend', pay: 3.45, wins: n => n >= 1 && n <= 12 },
    d2: { label: '2. Dutzend', pay: 3.45, wins: n => n >= 13 && n <= 24 },
    d3: { label: '3. Dutzend', pay: 3.45, wins: n => n >= 25 },
    k1: { label: 'Kolonne 1', pay: 3.45, wins: n => n > 0 && n % 3 === 1 },
    k2: { label: 'Kolonne 2', pay: 3.45, wins: n => n > 0 && n % 3 === 2 },
    k3: { label: 'Kolonne 3', pay: 3.45, wins: n => n > 0 && n % 3 === 0 },
  };
  for (let n = 0; n <= 36; n++) BETS['z' + n] = { label: String(n), pay: 41, wins: x => x === n };
  window.rouletteBets = BETS;   // für Tests
  window.rouletteWheelSVG = () => wheelSVG(true);   // Vorschaubild im Shop

  let chip = 5, bets = {}, last = {}, spinning = false, rot = 0, history = [];
  const sum = o => Object.values(o).reduce((a, b) => a + b, 0);
  const color = n => n === 0 ? 'g' : RED.has(n) ? 'r' : 'b';

  function wheelSVG(thumb) {
    const seg = 360 / 37;
    let s = '';
    ORDER.forEach((n, i) => {
      const a1 = (i * seg - seg / 2 - 90) * Math.PI / 180, a2 = ((i + 1) * seg - seg / 2 - 90) * Math.PI / 180;
      const p = (a, r) => (Math.cos(a) * r).toFixed(2) + ',' + (Math.sin(a) * r).toFixed(2);
      s += `<path d="M${p(a1, 46)} A46,46 0 0 1 ${p(a2, 46)} L${p(a2, 32)} A32,32 0 0 0 ${p(a1, 32)} Z" fill="${n === 0 ? '#1f8a3a' : RED.has(n) ? '#c0182b' : '#151515'}" stroke="#d9b45a" stroke-width="0.3" class="rl-w-pocket"/>`;
      const am = (i * seg - 90) * Math.PI / 180;
      s += `<text x="${(Math.cos(am) * 40.5).toFixed(2)}" y="${(Math.sin(am) * 40.5).toFixed(2)}" fill="#fff" font-size="4" font-weight="700" text-anchor="middle" dominant-baseline="central" transform="rotate(${i * seg} ${(Math.cos(am) * 40.5).toFixed(2)} ${(Math.sin(am) * 40.5).toFixed(2)})">${n}</text>`;
    });
    return `<svg viewBox="-52 -52 104 104" class="rl-wheel-svg">
      <circle r="51" fill="#5a3418" class="rl-w-rim1"/><circle r="49" fill="#7a4a24" class="rl-w-rim2"/><circle r="47" fill="#2a1a0c" class="rl-w-track"/>
      <g ${thumb ? '' : 'id="rl-rotor"'}>${s}<circle r="32" fill="#7a4a24" class="rl-w-cone"/><circle r="22" fill="#a0622a" class="rl-w-cone2"/>
        ${[0, 1, 2, 3].map(k => `<rect x="-1.5" y="-21" width="3" height="20" rx="1.5" fill="#d9b45a" class="rl-w-spoke" transform="rotate(${k * 45})"/>`).join('')}<circle r="6" fill="#d9b45a" class="rl-w-spoke"/></g>
      <g ${thumb ? '' : 'id="rl-ball"'}><circle cx="0" cy="-37" r="2.6" fill="#fff" stroke="#bbb" stroke-width="0.4"/></g>
      <polygon points="0,-50 -3,-55 3,-55" fill="#EFC93D"/>
    </svg>`;
  }
  function cell(key, txt, cls, style) {
    const amt = bets[key] || 0;
    return `<div class="rl-cell ${cls || ''}" ${style ? `style="${style}"` : ''} onclick="rlBet('${key}')">${txt}${amt ? `<span class="rl-chip">${amt}</span>` : ''}</div>`;
  }
  function boardHTML() {
    // Klassisches Tableau hochkant: 0 oben, darunter 12 Reihen × 3 Spalten, rechts Dutzende und Außenwetten
    let nums = '';
    for (let r = 0; r < 12; r++) for (let c = 0; c < 3; c++) {
      const n = r * 3 + c + 1;
      nums += cell('z' + n, n, 'num ' + color(n), `grid-row:${r + 2};grid-column:${c + 1}`);
    }
    const side = [['d1', '1.<br>12', 2, 4], ['d2', '2.<br>12', 6, 4], ['d3', '3.<br>12', 10, 4]]
      .map(([k, t, row, span]) => cell(k, t, 'out', `grid-row:${row}/span ${span};grid-column:4`)).join('');
    const outer = [['tief', '1–18'], ['gerade', 'Gerade'], ['rot', '<i class="rl-dia r"></i>'], ['schwarz', '<i class="rl-dia b"></i>'], ['ungerade', 'Ung.'], ['hoch', '19–36']]
      .map(([k, t], i) => cell(k, t, 'out', `grid-row:${2 + i * 2}/span 2;grid-column:5`)).join('');
    const cols = ['k1', 'k2', 'k3'].map((k, i) => cell(k, '2:1', 'out', `grid-row:14;grid-column:${i + 1}`)).join('');
    return `<div class="rl-board">${cell('z0', '0', 'num g', 'grid-row:1;grid-column:1/span 3')}${nums}${side}${outer}${cols}</div>`;
  }
  function render() {
    const root = document.getElementById('game-root');
    const total = sum(bets);
    root.innerHTML = `
      <div class="rl-top">
        <div class="rl-wheel">${wheelSVG()}</div>
        <div class="rl-side">
          <div class="rl-hist">${history.slice(-8).reverse().map(n => `<span class="${color(n)}">${n}</span>`).join('')}</div>
          <div class="gm-msg info" id="rl-msg">${spinning ? 'Rien ne va plus …' : 'Faites vos jeux!'}</div>
          <div class="rl-total">Einsatz: <b>${total}</b> / ${MAX_TOTAL}</div>
        </div>
      </div>
      <div class="rl-chips">${CHIPS.map(v => `<button class="rl-chipbtn ${v === chip ? 'on' : ''}" onclick="rlChip(${v})">${v}</button>`).join('')}
        <button class="rl-small" onclick="rlClear()">Löschen</button><button class="rl-small" onclick="rlRepeat()">Wieder</button></div>
      ${boardHTML()}
      <div class="rl-pays">Auszahlung: Zahl ×41 · Dutzend/Kolonne ×3,45 · Rot/Schwarz, Gerade/Ungerade, Hälften ×2,3</div>
      <button class="gm-btn" id="rl-spin" ${total && !spinning ? '' : 'disabled'} onclick="rlSpin()">Drehen</button>`;
    document.getElementById('rl-rotor').style.transform = `rotate(${rot}deg)`;
  }

  window.openRoulette = function() { bets = {}; spinning = false; GameShell.open('🎡 Roulette', render); };
  window.rlChip = v => { chip = v; render(); };
  window.rlClear = () => { if (!spinning) { bets = {}; render(); } };
  window.rlRepeat = () => { if (!spinning && sum(last)) { bets = Object.assign({}, last); render(); } };
  window.rlBet = function(key) {
    if (spinning) return;
    const add = Math.min(chip, MAX_TOTAL - sum(bets));
    if (add <= 0) { GameShell.toast('Höchstens ' + MAX_TOTAL + ' Coins pro Dreh'); return; }
    bets[key] = (bets[key] || 0) + add; gameSound('chip'); render();
  };
  window.rlSpin = function() {
    const total = sum(bets);
    if (spinning || !total || !GameShell.take(total)) return;
    spinning = true; last = Object.assign({}, bets);
    const n = ORDER[Math.floor(Math.random() * 37)];
    render();
    // Kessel dreht 4–5 Runden und hält so, dass das Gewinnfach oben unter dem Zeiger liegt
    const idx = ORDER.indexOf(n), seg = 360 / 37, DUR = 5200;
    const target = -idx * seg, start = rot;
    const end = target - 360 * (4 + Math.floor(Math.random() * 2)) + Math.ceil((start - target) / 360) * 360 + 0;
    const rotor = document.getElementById('rl-rotor'), ball = document.getElementById('rl-ball');
    const t0 = performance.now();
    gameSound('roulette', { dur: DUR / 1000 });
    (function frame(now) {
      const k = Math.max(0, Math.min(1, (now - t0) / DUR)), e = 1 - Math.pow(1 - k, 3);
      rot = start + (end - start) * e;
      rotor.style.transform = `rotate(${rot}deg)`;
      // Kugel läuft gegenläufig außen, sinkt am Ende ins Fach (oben)
      const ballAng = 720 * 3 * (1 - e) * (1 - e);
      const r = k < 0.8 ? 0 : (k - 0.8) / 0.2;
      ball.style.transform = `rotate(${ballAng}deg) translateY(${(r * 3.5).toFixed(2)}px)`;
      if (k < 1) requestAnimationFrame(frame); else done(n);
    })(t0);
  };
  function done(n) {
    let back = 0;
    Object.entries(last).forEach(([k, amt]) => { if (BETS[k].wins(n)) back += amt * BETS[k].pay; });
    back = Math.round(back);
    if (last['z' + n] > 0 && window.Trophaeen) Trophaeen.award('roulette', 1400);
    history.push(n); spinning = false;
    const total = sum(last);
    bets = {};
    render();
    const msg = document.getElementById('rl-msg');
    const name = n + (n === 0 ? ' Grün' : RED.has(n) ? ' Rot' : ' Schwarz');
    if (back > 0) { GameShell.pay(back, back > total); msg.className = 'gm-msg win'; msg.textContent = name + ' · +' + back.toLocaleString('de-DE') + ' Coins'; }
    else { slotSound('lose'); msg.className = 'gm-msg lose'; msg.textContent = name + ' · leider nichts'; }
  }
})();

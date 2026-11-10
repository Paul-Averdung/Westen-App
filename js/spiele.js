// Minispiele: Reaktionstest, Exen-Timer, Würfelspiel, Hopfen-Slots
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich;
// die Reihenfolge der <script>-Tags in hopfenkonto.html ist wichtig.

// ── Promille-Reaktionstest ────────────────────────────────────────────────────
window.openReactionTest = function() {
  document.getElementById('reaction-overlay').style.display = 'block';
  startReactionTest();
};

window.closeReactionTest = function() {
  document.getElementById('reaction-overlay').style.display = 'none';
  const xh = document.getElementById('active-xhair');
  if (xh) xh.remove();
  if (window._rxnCountdown) clearInterval(window._rxnCountdown);
};

window.startReactionTest = function() {
  const overlay    = document.getElementById('reaction-overlay');
  const cdEl       = document.getElementById('rxn-countdown');
  const resultsEl  = document.getElementById('rxn-results');
  const numEl      = document.getElementById('rxn-num');
  const textEl     = document.getElementById('rxn-text');
  const old = document.getElementById('active-xhair');
  if (old) old.remove();
  resultsEl.style.display = 'none';
  cdEl.style.display = 'block';

  const times = [];
  let shownAt = 0, hitCount = 0;
  const TOTAL = 3;

  let count = 3;
  numEl.textContent  = count;
  textEl.textContent = 'Bereit machen…';

  window._rxnCountdown = setInterval(() => {
    count--;
    if (count > 0) {
      numEl.textContent  = count;
      textEl.textContent = '';
    } else if (count === 0) {
      numEl.textContent  = '🎯';
      textEl.textContent = 'LOS!';
    } else {
      clearInterval(window._rxnCountdown);
      cdEl.style.display = 'none';
      spawnTarget();
    }
  }, 850);

  function spawnTarget() {
    const W = overlay.clientWidth, H = overlay.clientHeight;
    const S = Math.min(72, W * 0.18);
    const pad = S + 10;
    const x = pad + Math.random() * (W - S - pad * 2);
    const y = pad + Math.random() * (H - S - pad * 2);

    const div = document.createElement('div');
    div.id = 'active-xhair';
    div.style.cssText = `position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${S}px;height:${S}px;cursor:crosshair;touch-action:none;`;
    const r = (S/2).toFixed(1), cx = r, cy = r;
    const gap = (S*0.15).toFixed(1), inner = (S*0.13).toFixed(1), end = (S*0.04).toFixed(1);
    div.innerHTML = `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" class="crosshair-svg crosshair-appear">
      <circle cx="${r}" cy="${r}" r="${(S/2-2).toFixed(1)}" fill="rgba(255,40,40,0.07)" stroke="#FF3333" stroke-width="2.5"/>
      <circle cx="${r}" cy="${r}" r="${inner}" fill="none" stroke="#FF3333" stroke-width="2"/>
      <line x1="${end}" y1="${r}" x2="${(parseFloat(r)-parseFloat(gap)-parseFloat(inner)).toFixed(1)}" y2="${r}" stroke="#FF3333" stroke-width="2.5"/>
      <line x1="${(parseFloat(r)+parseFloat(gap)+parseFloat(inner)).toFixed(1)}" y1="${r}" x2="${(S-parseFloat(end)).toFixed(1)}" y2="${r}" stroke="#FF3333" stroke-width="2.5"/>
      <line x1="${r}" y1="${end}" x2="${r}" y2="${(parseFloat(r)-parseFloat(gap)-parseFloat(inner)).toFixed(1)}" stroke="#FF3333" stroke-width="2.5"/>
      <line x1="${r}" y1="${(parseFloat(r)+parseFloat(gap)+parseFloat(inner)).toFixed(1)}" x2="${r}" y2="${(S-parseFloat(end)).toFixed(1)}" stroke="#FF3333" stroke-width="2.5"/>
      <circle cx="${r}" cy="${r}" r="2.8" fill="#FF3333"/>
    </svg>`;
    overlay.appendChild(div);
    shownAt = Date.now();
    hitCount++;

    div.addEventListener('pointerdown', function onHit(e) {
      e.preventDefault();
      div.removeEventListener('pointerdown', onHit);
      times.push(Date.now() - shownAt);
      gameSound('shot');
      div.style.transition = 'opacity 0.13s, transform 0.13s';
      div.style.opacity = '0';
      div.style.transform = 'scale(1.5)';
      setTimeout(() => {
        div.remove();
        if (hitCount < TOTAL) spawnTarget(); else showResults(times);
      }, 130);
    });
  }

  function showResults(times) {
    const total = times.reduce((a,b)=>a+b,0);
    let rating, col;
    if      (total < 900)  { rating = 'Scharf wie ein Adler 🦅';       col = '#50C878'; }
    else if (total < 1500) { rating = 'Leicht angeheitert 🍺';          col = '#FFD700'; }
    else if (total < 2100) { rating = 'Schützenfest-Niveau 🍻';         col = '#CD7F32'; }
    else if (total < 3000) { rating = 'Gut gebechert 🥴';               col = '#E0115F'; }
    else                   { rating = 'Lieber Taxi rufen 🚕';           col = '#9966CC'; }

    const rows = times.map((t,i) =>
      `<div style="color:#C0DD97;font-size:14px;margin:5px 0;">Treffer ${i+1}: <b>${(t/1000).toFixed(2)} s</b></div>`
    ).join('');

    document.getElementById('rxn-result-content').innerHTML = `
      <div style="font-size:22px;font-weight:900;color:#EFC93D;margin-bottom:16px;">Reaktionszeit</div>
      ${rows}
      <div style="margin-top:14px;font-size:20px;color:#C0DD97;">Gesamt: <b>${(total/1000).toFixed(2)} s</b></div>
      <div style="margin-top:18px;font-size:16px;font-weight:700;color:${col};">${rating}</div>
    `;
    document.getElementById('rxn-results').style.display = 'block';
  }
};

// ── Exen-Timer ────────────────────────────────────────────────────────────────
(function() {
  let _interval = null, _start = null, _elapsed = 0, _running = false, _stopped = false;

  function fmt(ms) {
    const cs   = Math.floor(ms / 10) % 100;
    const secs = Math.floor(ms / 1000);
    return String(secs).padStart(2,'0') + '.' + String(cs).padStart(2,'0');
  }

  function tick() {
    const el = document.getElementById('timer-display');
    if (el) el.textContent = fmt(Date.now() - _start);
  }

  function rating(ms) {
    const s = ms / 1000;
    if (s < 1.0) return { text: 'Absolute Legende 🏆',       col: '#50C878' };
    if (s < 1.8) return { text: 'Profi-Exer 🥇',             col: '#FFD700' };
    if (s < 3.0) return { text: 'Schützenfest-tauglich 🍺',  col: '#CD7F32' };
    if (s < 5.0) return { text: 'Noch Luft nach oben 😅',    col: '#C0C0C0' };
    return              { text: 'Lieber in Ruhe trinken 😄',  col: '#9966CC' };
  }

  window.openTimerOverlay = function() {
    const ov = document.getElementById('timer-overlay');
    ov.style.display = 'block';
    timerReset();
  };

  window.closeTimerOverlay = function() {
    document.getElementById('timer-overlay').style.display = 'none';
    if (_interval) clearInterval(_interval);
    _running = false;
    gameSound('tickStop');
  };

  window.timerStartStop = function() {
    const btn      = document.getElementById('timer-start-stop');
    const stateEl  = document.getElementById('timer-state');
    const resetBtn = document.getElementById('timer-reset-btn');
    const ratingEl = document.getElementById('timer-rating');

    if (!_running && !_stopped) {
      // ── START ──
      _start    = Date.now() - _elapsed;
      _interval = setInterval(tick, 10);
      _running  = true;
      gameSound('watchClick');
      gameSound('tickStart');
      btn.textContent   = 'STOP';
      btn.style.borderColor = '#CC2200';
      btn.style.color       = '#FF6666';
      btn.style.borderWidth = '2px';
      stateEl.textContent   = 'Läuft…';
      ratingEl.textContent  = '';
      resetBtn.style.display = 'none';

    } else if (_running) {
      // ── STOP ──
      clearInterval(_interval);
      _elapsed  = Date.now() - _start;
      _running  = false;
      _stopped  = true;
      gameSound('tickStop');
      gameSound('watchClick');
      const r   = rating(_elapsed);
      const dispEl = document.getElementById('timer-display');
      if (dispEl) dispEl.textContent = fmt(_elapsed);
      btn.textContent       = 'START';
      btn.style.borderColor = '#3B6D11';
      btn.style.color       = '#97C459';
      stateEl.textContent   = 'Gestoppt';
      ratingEl.textContent  = r.text;
      ratingEl.style.color  = r.col;
      resetBtn.style.display = 'inline-block';
    }
  };

  window.timerReset = function() {
    if (_interval) clearInterval(_interval);
    gameSound('tickStop');
    _interval = null; _start = null; _elapsed = 0; _running = false; _stopped = false;
    const dispEl   = document.getElementById('timer-display');
    const stateEl  = document.getElementById('timer-state');
    const ratingEl = document.getElementById('timer-rating');
    const btn      = document.getElementById('timer-start-stop');
    const resetBtn = document.getElementById('timer-reset-btn');
    if (dispEl)   dispEl.textContent   = '00.00';
    if (stateEl)  stateEl.textContent  = '';
    if (ratingEl) ratingEl.textContent = '';
    if (btn)      { btn.textContent = 'START'; btn.style.borderColor='#3B6D11'; btn.style.color='#97C459'; }
    if (resetBtn) resetBtn.style.display = 'none';
  };
})();

// ── Würfelspiel ───────────────────────────────────────────────────────────────
(function() {
  let _playerCount = 0;

  window.openDiceGame = function() {
    document.getElementById('dice-overlay').style.display = 'block';
    openDiceSetup();
  };
  window.closeDiceGame = function() {
    document.getElementById('dice-overlay').style.display = 'none';
  };
  window.openDiceSetup = function() {
    document.getElementById('dice-setup').style.display        = 'block';
    document.getElementById('dice-roll-screen').style.display  = 'none';
    document.getElementById('dice-result-screen').style.display= 'none';
    document.getElementById('dice-count-error').style.display  = 'none';
    const inp = document.getElementById('dice-count-input');
    inp.value = _playerCount || '';
    setTimeout(() => inp.focus(), 80);
  };
  window.confirmPlayerCount = function() {
    const val = parseInt(document.getElementById('dice-count-input').value);
    if (!val || val < 2 || val > 30) {
      document.getElementById('dice-count-error').style.display = 'block';
      return;
    }
    _playerCount = val;
    document.getElementById('dice-count-error').style.display  = 'none';
    document.getElementById('dice-setup').style.display        = 'none';
    document.getElementById('dice-roll-screen').style.display  = 'block';
    document.getElementById('dice-result-screen').style.display= 'none';
    document.getElementById('dice-player-count-label').textContent = _playerCount + ' Spieler · Wer zahlt?';
    document.getElementById('dice-face').textContent = '?';
    document.getElementById('dice-roll-btn').disabled = false;
  };
  window.rollDice = function() {
    const btn  = document.getElementById('dice-roll-btn');
    const face = document.getElementById('dice-face');
    btn.disabled = true;
    const result = 1 + Math.floor(Math.random() * _playerCount);
    let step = 0, total = 22;
    function tick() {
      face.textContent = 1 + Math.floor(Math.random() * _playerCount);
      gameSound('clack', { strength: 1 - step / total * 0.5 });
      step++;
      if (step < total) {
        // exponential slowdown
        setTimeout(tick, 55 + Math.pow(step, 1.7));
      } else {
        face.textContent = result;
        gameSound('clack', { final: true });
        setTimeout(() => showDiceResult(result), 280);
      }
    }
    tick();
  };
  window.rollDiceAgain = function() {
    document.getElementById('dice-roll-screen').style.display  = 'block';
    document.getElementById('dice-result-screen').style.display= 'none';
    document.getElementById('dice-face').textContent = '?';
    document.getElementById('dice-roll-btn').disabled = false;
  };
  function showDiceResult(num) {
    document.getElementById('dice-roll-screen').style.display  = 'none';
    document.getElementById('dice-result-screen').style.display= 'block';
    document.getElementById('dice-result-face').textContent    = num;
    document.getElementById('dice-result-text').textContent    = 'Spieler ' + num + ' ist dran!';
    const subs = ['Prost! 🍺', 'Eine Runde bitte! 🥂', 'Ab an die Bar! 🎉', 'Das Schicksal hat gesprochen! 🎲'];
    document.getElementById('dice-result-sub').textContent = subs[Math.floor(Math.random() * subs.length)];
  }
})();
// ── Hopfen-Slots ─────────────────────────────────────────────────────────────
// Regeln: 35 % Gewinnchance, Gewinn = 3 × Einsatz, danach optional "Doppel oder Nichts".
(function() {
  const SYMBOLS = ['🍺','🎩','🦅','🌭','🪶','🍟','🥃'];
  const REEL_TIMES = [1500, 2000, 2550];   // Dauer bis zum Stopp je Walze (ms, ab Walzenstart)
  const LEVER_MS = 300;                    // Walzen starten, wenn der Hebel unten ist
  const MAX_BET = 50;                      // höchster Einsatz pro Dreh (schützt die Shop-Preise)
  const MAX_DOUBLE = 3;                    // höchstens so oft hintereinander "Doppel oder Nichts"
  let _doubleCount = 0;
  let _spinning = false;
  let _doubleRisk = 0;
  let _doubling = false;
  let _bulbTimer = null, _bulbStep = 0, _bulbMode = 'idle';

  // ── Coins helpers ────────────────────────────────────────────────────────
  function getCoins() { return parseInt(localStorage.getItem('hopfenkonto_coins') || '-1'); }
  function setCoins(n) { localStorage.setItem('hopfenkonto_coins', String(Math.max(0, n))); }

  function checkDailyCoins() {
    const today = new Date().toDateString();
    const last  = localStorage.getItem('hopfenkonto_coins_day');
    if (!last) {
      // First ever open → 100 Startguthaben
      setCoins(100);
      localStorage.setItem('hopfenkonto_coins_day', today);
      return 'start';
    }
    if (last !== today) {
      setCoins(getCoins() + 30);
      localStorage.setItem('hopfenkonto_coins_day', today);
      return 'daily';
    }
    return false;
  }

  // Silent init on page load
  checkDailyCoins();

  const rnd = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const cellH = () => document.querySelector('.sm-reel').clientHeight / 3;

  // ── UI helpers ────────────────────────────────────────────────────────────
  function updateCoinsDisplay() {
    const el = document.getElementById('slots-coins-val');
    if (el) el.textContent = getCoins();
  }
  // Münzstand hochzählen (bei Gewinn)
  function countCoins(from, to) {
    const el = document.getElementById('slots-coins-val'), box = el.parentElement;
    const t0 = performance.now(), dur = Math.min(1400, 300 + (to - from) * 25);
    box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump');
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  function currentBet() {
    const inp = document.getElementById('slots-bet-input');
    const val = inp ? parseInt(inp.value) : 1;
    return (isNaN(val) || val < 1) ? 1 : Math.min(MAX_BET, val);
  }

  function updateSpinBtn() {
    const btn = document.getElementById('slots-spin-btn');
    if (!btn) return;
    const ok = !_spinning && getCoins() >= 1 && currentBet() >= 1 && currentBet() <= getCoins();
    btn.disabled  = !ok;
    btn.style.opacity = ok ? '1' : '0.45';
  }

  function refreshUI(skipCoins) {
    if (!skipCoins) updateCoinsDisplay();
    updateSpinBtn();
    const maxEl = document.getElementById('slots-bet-max');
    const inp   = document.getElementById('slots-bet-input');
    const coins = getCoins();
    const maxBet = Math.max(1, Math.min(MAX_BET, coins));
    if (maxEl) maxEl.textContent = 'Max: ' + maxBet;
    if (inp)   { inp.max = maxBet; if (parseInt(inp.value) > maxBet) inp.value = maxBet; }
    const nc = document.getElementById('slots-no-coins-msg');
    if (nc) nc.style.display = (coins === 0 && !_spinning) ? 'block' : 'none';
  }

  window.updateSlotsbet = function() { refreshUI(); };
  // Coin-Konto für andere Teile der App (Shop, später weitere Spiele)
  window.Coins = {
    get: () => { checkDailyCoins(); return Math.max(0, getCoins()); },
    daily: () => checkDailyCoins(),   // 'start' | 'daily' | false
    spend: n => { checkDailyCoins(); const c = getCoins(); if (n > c) return false; setCoins(c - n); refreshUI(); return true; },
    add: n => window.slotsAddCoins(n),
  };
  // Gutschrift von außen (Gutschein-Codes): mit Hochzählen, Münzregen und Sound
  window.slotsAddCoins = function(n) {
    checkDailyCoins();
    const before = Math.max(0, getCoins());
    setCoins(before + n);
    countCoins(before, before + n);
    coinRain(Math.min(30, 10 + Math.round(n / 3)));
    slotSound('win', { gain: n, small: n < 20 });
    refreshUI(true);
  };
  window.stepSlotsBet = function(d) {
    const inp = document.getElementById('slots-bet-input');
    inp.value = Math.max(1, Math.min(MAX_BET, Math.max(1, getCoins()), currentBet() + d));
    refreshUI();
  };

  // ── Walzen ────────────────────────────────────────────────────────────────
  function fillStrip(i, syms) {
    const strip = document.getElementById('strip-' + i);
    strip.innerHTML = syms.map(x => '<div class="sm-cell">' + x + '</div>').join('');
    return strip;
  }
  function visible(i) {      // aktuell sichtbare 3 Symbole (oben, Mitte, unten)
    const cells = document.querySelectorAll('#strip-' + i + ' .sm-cell');
    if (cells.length < 3) return [rnd(), '🍺', rnd()];
    const strip = document.getElementById('strip-' + i);
    const off = Math.round(-(new DOMMatrix(getComputedStyle(strip).transform).m42) / cellH());
    return [0, 1, 2].map(k => (cells[off + k] || cells[k]).textContent);
  }

  // ── Lauflichter am Schild ─────────────────────────────────────────────────
  function buildBulbs() {
    const box = document.getElementById('sm-bulbs');
    if (box.childElementCount) return;
    const n = 26;
    for (let i = 0; i < n; i++) {
      // gleichmäßig über den Rand verteilt (oben, rechts, unten, links)
      const t = i / n, b = document.createElement('span');
      let x, y;
      if (t < 0.35)      { x = t / 0.35 * 100; y = 0; }
      else if (t < 0.5)  { x = 100; y = (t - 0.35) / 0.15 * 100; }
      else if (t < 0.85) { x = 100 - (t - 0.5) / 0.35 * 100; y = 100; }
      else               { x = 0; y = 100 - (t - 0.85) / 0.15 * 100; }
      b.style.left = x + '%'; b.style.top = y + '%';
      box.appendChild(b);
    }
  }
  function bulbs(mode) {
    _bulbMode = mode;
    clearInterval(_bulbTimer);
    const speed = mode === 'win' ? 70 : mode === 'spin' ? 110 : 420;
    _bulbTimer = setInterval(() => {
      _bulbStep++;
      document.querySelectorAll('#sm-bulbs span').forEach((b, i) => {
        const on = _bulbMode === 'win' ? (_bulbStep % 2 === 0) : ((i + _bulbStep) % 3 === 0);
        b.classList.toggle('on', on);
      });
    }, speed);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.openSlotsGame = function() {
    const result = checkDailyCoins();
    document.getElementById('slots-overlay').style.display = 'block';
    document.getElementById('slots-result').innerHTML = '';
    document.getElementById('sm-window').classList.remove('dim', 'won');
    for (let i = 0; i < 3; i++) {
      const strip = fillStrip(i, [rnd(), '🍺', rnd()]);
      strip.getAnimations().forEach(a => a.cancel());
      strip.style.transform = 'translateY(0)';
    }
    buildBulbs(); bulbs('idle');
    const msgEl = document.getElementById('slots-daily-msg');
    if (msgEl) {
      if (result === 'start')      msgEl.textContent = '🎁 Willkommen! 100 Startguthaben gutgeschrieben!';
      else if (result === 'daily') msgEl.textContent = '🎁 +30 Tages-Coins gutgeschrieben!';
      else                         msgEl.textContent = '';
    }
    refreshUI();
  };

  window.closeSlotsGame = function() {
    document.getElementById('slots-overlay').style.display = 'none';
    clearInterval(_bulbTimer);
  };

  window.spinSlots = function() {
    const bet = currentBet();
    if (_spinning || bet < 1 || bet > getCoins()) return;
    _spinning = true;
    _doubleRisk = 0;
    _doubling = false;
    _doubleCount = 0;
    setCoins(getCoins() - bet);
    refreshUI();
    document.getElementById('slots-result').innerHTML = '';
    const win = document.getElementById('sm-window');
    win.classList.remove('dim', 'won');
    document.getElementById('sm-cabinet').classList.remove('lose');

    // 35 % Gewinnwahrscheinlichkeit
    let finals;
    if (Math.random() < 0.35) {
      const sym = rnd();
      finals = [sym, sym, sym];
    } else {
      finals = [rnd(), rnd(), rnd()];
      // Avoid accidental triple on the losing path
      if (finals[0] === finals[1] && finals[1] === finals[2]) finals[2] = SYMBOLS[(SYMBOLS.indexOf(finals[2]) + 1) % SYMBOLS.length];
    }

    // Hebel ziehen
    const lever = document.getElementById('sm-lever');
    lever.classList.remove('pull'); void lever.offsetWidth; lever.classList.add('pull');
    bulbs('spin');
    slotSound('spin', { leverMs: LEVER_MS, reelTimes: REEL_TIMES });

    const H = cellH();
    let done = 0;
    for (let i = 0; i < 3; i++) {
      // Streifen: oben die Zielsymbole, darunter Zufall, ganz unten die aktuell sichtbaren.
      // Er läuft von unten (alt sichtbar) nach oben (Ziel sichtbar) -> Symbole wandern nach unten.
      const old = visible(i);
      const filler = Array.from({ length: 16 + i * 6 }, rnd);
      const syms = [rnd(), finals[i], rnd(), ...filler, ...old];
      const strip = fillStrip(i, syms);
      strip.getAnimations().forEach(a => a.cancel());
      const start = -(syms.length - 3) * H;
      strip.style.transform = 'translateY(' + start + 'px)';
      const dur = REEL_TIMES[i];
      const anim = strip.animate([
        { transform: 'translateY(' + start + 'px)', easing: 'ease-out' },
        { transform: 'translateY(' + (start - H * 0.25) + 'px)', offset: 0.05, easing: 'cubic-bezier(.25,.1,.25,1)' },  // kurzes Ausholen
        { transform: 'translateY(' + (H * 0.18) + 'px)', offset: 0.93, easing: 'ease-in-out' },                           // überschwingen
        { transform: 'translateY(0px)' }                                                                                  // einrasten
      ], { duration: dur, delay: LEVER_MS, fill: 'forwards' });
      setTimeout(() => strip.classList.add('blur'), LEVER_MS + dur * 0.12);
      setTimeout(() => strip.classList.remove('blur'), LEVER_MS + dur * 0.8);
      anim.onfinish = () => {
        strip.style.transform = 'translateY(0px)'; anim.cancel();
        if (++done === 3) { _spinning = false; setTimeout(() => showSlotsResult(finals, bet), 180); }
      };
    }
  };

  function coinRain(n) {
    const box = document.getElementById('sm-coinrain');
    box.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span');
      c.className = 'sm-coin'; c.textContent = '🪙';
      c.style.left = (Math.random() * 100) + '%';
      c.style.setProperty('--d', (1.2 + Math.random() * 1.0).toFixed(2) + 's');
      c.style.setProperty('--delay', (Math.random() * 0.7).toFixed(2) + 's');
      c.style.setProperty('--dx', (Math.random() * 80 - 40).toFixed(0) + 'px');
      c.style.setProperty('--rot', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      box.appendChild(c);
    }
    setTimeout(() => { box.innerHTML = ''; }, 2600);
  }

  function showSlotsResult(syms, bet) {
    const win = syms[0] === syms[1] && syms[1] === syms[2];
    const resultEl = document.getElementById('slots-result');
    const windowEl = document.getElementById('sm-window');

    if (win) {
      const gain = bet * 3;
      const before = getCoins();
      setCoins(before + gain);
      _doubleRisk = gain;
      resultEl.innerHTML =
        '<div class="sm-msg-win">+' + gain + ' Coins 🪙</div>' +
        '<button id="double-btn" onclick="doubleOrNothing()">🎲 Doppel oder Nichts (' + gain + ' 🪙)</button>' +
        '<div id="double-msg"></div>';
      windowEl.classList.add('won');
      for (let i = 0; i < 3; i++) document.querySelectorAll('#strip-' + i + ' .sm-cell')[1].classList.add('win');
      bulbs('win'); setTimeout(() => bulbs('idle'), 2400);
      coinRain(Math.min(40, 10 + gain * 2));
      slotSound('win', { gain });
      countCoins(before, before + gain);
      refreshUI(true);
    } else {
      _doubleRisk = 0;
      resultEl.innerHTML = '<div class="sm-msg-lose">Kein Gewinn</div>';
      windowEl.classList.add('dim');
      document.getElementById('sm-cabinet').classList.add('lose');
      bulbs('idle');
      slotSound('lose');
      refreshUI();
    }
  }

  window.doubleOrNothing = function() {
    if (_doubleRisk <= 0 || _doubling || _doubleCount >= MAX_DOUBLE) return;
    _doubling = true;
    _doubleCount++;
    const btn   = document.getElementById('double-btn');
    const msgEl = document.getElementById('double-msg');
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.textContent = '🪙 ...';
    }
    if (msgEl) { msgEl.textContent = ''; msgEl.style.color = ''; }
    slotSound('flip');
    setTimeout(() => {
      const won = Math.random() < 0.5;
      if (won) {
        const before = getCoins();
        setCoins(before + _doubleRisk);
        countCoins(before, before + _doubleRisk);
        _doubleRisk *= 2;
        if (msgEl) { msgEl.style.color = '#6fe08d'; msgEl.textContent = 'Verdoppelt'; }
        if (btn && _doubleCount < MAX_DOUBLE) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.textContent = '🎲 Doppel oder Nichts (' + _doubleRisk + ' 🪙)';
        } else if (btn) {
          btn.remove();
          if (msgEl) msgEl.textContent = 'Verdoppelt – maximal ' + MAX_DOUBLE + '× hintereinander';
        }
        slotSound('win', { gain: _doubleRisk, small: true });
        coinRain(12);
        _doubling = false;
        refreshUI(true);
        return;
      } else {
        setCoins(getCoins() - _doubleRisk);
        _doubleRisk = 0;
        if (msgEl) { msgEl.style.color = '#ff6f9a'; msgEl.textContent = 'Verloren'; }
        if (btn) btn.remove();
        slotSound('lose');
      }
      _doubling = false;
      refreshUI();
    }, 700);
  };
})();

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
      step++;
      if (step < total) {
        // exponential slowdown
        setTimeout(tick, 55 + Math.pow(step, 1.7));
      } else {
        face.textContent = result;
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
(function() {
  const SYMBOLS = ['🍺','🎩','🦅','🌭','🪶','🍟','🥃'];
  let _spinning = false;
  let _doubleRisk = 0;
  let _doubling = false;

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

  // ── UI helpers ────────────────────────────────────────────────────────────
  function updateCoinsDisplay() {
    const el = document.getElementById('slots-coins-val');
    if (el) el.textContent = getCoins();
  }

  function currentBet() {
    const inp = document.getElementById('slots-bet-input');
    const val = inp ? parseInt(inp.value) : 1;
    return (isNaN(val) || val < 1) ? 1 : val;
  }

  function updateSpinBtn() {
    const btn = document.getElementById('slots-spin-btn');
    if (!btn) return;
    const ok = !_spinning && getCoins() >= 1 && currentBet() >= 1 && currentBet() <= getCoins();
    btn.disabled  = !ok;
    btn.style.opacity = ok ? '1' : '0.45';
  }

  function refreshUI() {
    updateCoinsDisplay();
    updateSpinBtn();
    const maxEl = document.getElementById('slots-bet-max');
    const inp   = document.getElementById('slots-bet-input');
    const coins = getCoins();
    if (maxEl) maxEl.textContent = 'Max: ' + coins;
    if (inp)   inp.max = coins;
    const nc = document.getElementById('slots-no-coins-msg');
    if (nc) nc.style.display = (coins === 0 && !_spinning) ? 'block' : 'none';
  }

  window.updateSlotsbet = function() { refreshUI(); };

  // ── Public API ────────────────────────────────────────────────────────────
  window.openSlotsGame = function() {
    const result = checkDailyCoins();
    document.getElementById('slots-overlay').style.display = 'block';
    document.getElementById('slots-result').innerHTML = '';
    ['reel-sym-0','reel-sym-1','reel-sym-2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '🍺';
    });
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
  };

  window.spinSlots = function() {
    const bet = currentBet();
    if (_spinning || bet < 1 || bet > getCoins()) return;
    _spinning = true;
    _doubleRisk = 0;
    _doubling = false;
    setCoins(getCoins() - bet);
    refreshUI();
    document.getElementById('slots-result').innerHTML = '';

    // 35 % Gewinnwahrscheinlichkeit
    let finals;
    if (Math.random() < 0.35) {
      const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      finals = [sym, sym, sym];
    } else {
      finals = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ];
      // Avoid accidental triple on the losing path
      if (finals[0] === finals[1] && finals[1] === finals[2]) finals[2] = SYMBOLS[(SYMBOLS.indexOf(finals[2]) + 1) % SYMBOLS.length];
    }

    const STEPS = 20;
    let done = 0;

    function spinReel(idx, finalSym, startDelay) {
      setTimeout(() => {
        const reel = document.getElementById('reel-' + idx);
        const sym  = document.getElementById('reel-sym-' + idx);
        if (!reel || !sym) { reelDone(); return; }
        reel.classList.add('spinning');
        let step = 0;
        function tick() {
          sym.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          step++;
          if (step < STEPS) {
            setTimeout(tick, 55 + Math.pow(step * 0.85, 1.7));
          } else {
            sym.textContent = finalSym;
            reel.classList.remove('spinning');
            reelDone();
          }
        }
        tick();
      }, startDelay);
    }

    function reelDone() {
      done++;
      if (done === 3) {
        _spinning = false;
        setTimeout(() => showSlotsResult(finals, bet), 220);
      }
    }

    spinReel(0, finals[0], 0);
    spinReel(1, finals[1], 380);
    spinReel(2, finals[2], 760);
  };

  function showSlotsResult(syms, bet) {
    const win = syms[0] === syms[1] && syms[1] === syms[2];
    const resultEl = document.getElementById('slots-result');

    if (win) {
      const gain = bet * 3;
      setCoins(getCoins() + gain);
      _doubleRisk = gain;
      const msgs = ['Jackpot! 🎉', 'Volltreffer! 🏆', 'Dreifach! 💰', 'Glückspilz! 🍀'];
      const msg  = msgs[Math.floor(Math.random() * msgs.length)];
      resultEl.innerHTML =
        '<div style="color:#FFD700;font-size:20px;font-weight:700;margin-bottom:4px;">' + msg + '</div>' +
        '<div style="color:#50C878;font-size:15px;margin-bottom:8px;">+' + gain + ' Coins gewonnen! 🪙</div>' +
        '<div style="font-size:30px;letter-spacing:6px;margin-bottom:12px;">' + syms.join(' ') + '</div>' +
        '<button id="double-btn" onclick="doubleOrNothing()" ' +
          'style="padding:10px 0;font-size:14px;font-weight:700;letter-spacing:0.5px;' +
          'background:transparent;border:2px solid #EFC93D;color:#EFC93D;' +
          'border-radius:10px;cursor:pointer;width:100%;' +
          'font-family:-apple-system,BlinkMacSystemFont,sans-serif;transition:opacity 0.2s;">' +
          '🎲 Doppel oder Nichts (' + gain + ' 🪙)' +
        '</button>' +
        '<div id="double-msg" style="margin-top:8px;font-size:13px;min-height:18px;font-weight:600;"></div>';
      ['reel-0','reel-1','reel-2'].forEach(id => {
        const r = document.getElementById(id);
        if (r) { r.classList.remove('win-flash'); void r.offsetWidth; r.classList.add('win-flash'); }
      });
    } else {
      _doubleRisk = 0;
      const msgs = ['Nicht heute… 😅','Knapp vorbei! 🍺','Nächstes Mal! 🎲','Das Glück kommt noch! 🤞'];
      const msg  = msgs[Math.floor(Math.random() * msgs.length)];
      resultEl.innerHTML =
        '<div style="color:#E0115F;font-size:18px;font-weight:700;margin-bottom:6px;">' + msg + '</div>' +
        '<div style="font-size:28px;letter-spacing:6px;opacity:0.7;">' + syms.join(' ') + '</div>';
    }
    refreshUI();
  }

  window.doubleOrNothing = function() {
    if (_doubleRisk <= 0 || _doubling) return;
    _doubling = true;
    const btn   = document.getElementById('double-btn');
    const msgEl = document.getElementById('double-msg');
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.textContent = '🪙 ...';
    }
    if (msgEl) { msgEl.textContent = ''; msgEl.style.color = ''; }
    setTimeout(() => {
      const won = Math.random() < 0.5;
      if (won) {
        setCoins(getCoins() + _doubleRisk);
        _doubleRisk *= 2;
        if (msgEl) { msgEl.style.color = '#50C878'; msgEl.textContent = 'Verdoppelt! 🎉'; }
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.textContent = '🎲 Doppel oder Nichts (' + _doubleRisk + ' 🪙)';
        }
      } else {
        setCoins(getCoins() - _doubleRisk);
        _doubleRisk = 0;
        if (msgEl) { msgEl.style.color = '#E0115F'; msgEl.textContent = 'Verloren! 😅'; }
        if (btn) btn.remove();
      }
      _doubling = false;
      refreshUI();
    }, 700);
  };
})();

// Getränkezähler, Speichern/Laden, Verlauf-Daten, Sound, Diagramm
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich;
// die Reihenfolge der <script>-Tags in hopfenkonto.html ist wichtig.

const state = {b02:0, b033:0, b05:0, shots:0, misch:0, manta:0};
let hourlyCount = {};
let milestonesShown = new Set();
let drinkLog = []; // current session: [{ts, key, dir}]
let chart = null;

// ── Restore saved state ───────────────────────────────────────────────────
(function restoreSaved() {
  try {
    // v2: continuous hour keys — try v2 first, fall back to v1 (state only, drop old hourlyCount)
    const raw = localStorage.getItem('hopfenkonto_v2') || localStorage.getItem('hopfenkonto_v1');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.state) Object.assign(state, d.state);
    // Only restore hourlyCount if it was saved with v2 (keys are large numbers, not 0-23)
    if (d.hourlyCount) {
      const keys = Object.keys(d.hourlyCount).map(Number);
      if (keys.length === 0 || Math.max(...keys) > 23) Object.assign(hourlyCount, d.hourlyCount);
    }
    if (Array.isArray(d.milestonesShown)) d.milestonesShown.forEach(m => milestonesShown.add(m));
    if (Array.isArray(d.drinkLog)) drinkLog = d.drinkLog;
  } catch(e) {}
})();

const LEVEL_MAX = 50;
let bubbleTimer = null;

// ── Punkte-Score für Orden & Bierpegel ──────────────────────────────────────
// 0,2 l Bier = 1 | 0,33 l Bier = 1,65 | 0,5 l Bier = 2,5 | Shot = 1 | Mischgetränk = 1,65
const DRINK_POINTS = { b02: 1, b033: 1.65, b05: 2.5, shots: 1, misch: 1.65 };
function calcScore() {
  let s = 0;
  for (const k in DRINK_POINTS) s += state[k] * DRINK_POINTS[k];
  return Math.round(s * 100) / 100;
}

// ── Verlauf / Historie ───────────────────────────────────────────────────────
const DRINK_INFO = {
  b02:   { label: '0,2 l Bier',   emoji: '🍺' },
  b033:  { label: '0,33 l Bier',  emoji: '🍺' },
  b05:   { label: '0,5 l Bier',   emoji: '🍺' },
  shots: { label: 'Shot',         emoji: '🥃' },
  misch: { label: 'Mischgetränk', emoji: '🍹' },
  manta: { label: 'Mantaplatte',  emoji: '🍽️' },
};
const WEEKDAYS = ['So','Mo','Di','Mi','Do','Fr','Sa'];

function localDateStr(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function dayLabel(dateStr) {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1]-1, parts[2], 12);
  return WEEKDAYS[d.getDay()] + ', ' + String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + d.getFullYear();
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('hopfenkonto_history') || '[]'); }
  catch(e) { return []; }
}
function saveHistory(hist) {
  try { localStorage.setItem('hopfenkonto_history', JSON.stringify(hist)); } catch(e) {}
}

function summarizeEntries(entries) {
  const totals = {};
  entries.forEach(e => { totals[e.key] = (totals[e.key]||0) + e.dir; });
  const count = (totals.b02||0)+(totals.b033||0)+(totals.b05||0)+(totals.shots||0)+(totals.misch||0);
  const liters = (totals.b02||0)*0.2 + (totals.b033||0)*0.33 + (totals.b05||0)*0.5;
  let score = 0;
  for (const k in DRINK_POINTS) score += (totals[k]||0) * DRINK_POINTS[k];
  return {
    count: Math.max(0, count),
    liters: Math.round(liters*100)/100,
    score: Math.round(score*100)/100
  };
}

function archiveCurrentSession() {
  if (drinkLog.length > 0) {
    const hist = loadHistory();
    hist.push({ date: localDateStr(drinkLog[0].ts), entries: drinkLog });
    saveHistory(hist);
  }
  drinkLog = [];
}

function spawnBubble() {
  const fill = document.getElementById('beer-fill');
  if (fill.offsetHeight < 6) return;
  const b = document.createElement('div');
  b.className = 'bubble';
  const size  = 7 + Math.random() * 10;
  const left  = 5 + Math.random() * 90;
  const rise  = -(80 + Math.random() * 180);
  const drift = (Math.random() - 0.5) * 18;
  const dur   = 2.2 + Math.random() * 2.8;
  b.style.cssText = [
    `width:${size}px`, `height:${size}px`,
    `left:${left}%`, `bottom:${4 + Math.random() * 18}%`,
    `--rise:${rise}px`, `--drift:${drift}px`,
    `animation-duration:${dur}s`
  ].join(';');
  fill.appendChild(b);
  b.addEventListener('animationend', () => b.remove(), { once: true });
}

function updateBeerLevel() {
  const score = calcScore();
  const pct = Math.min(score / LEVEL_MAX * 100, 100);
  document.getElementById('beer-fill').style.height = pct + '%';
  if (score > 0 && !bubbleTimer) {
    spawnBubble();
    bubbleTimer = setInterval(spawnBubble, 380);
  } else if (score === 0 && bubbleTimer) {
    clearInterval(bubbleTimer);
    bubbleTimer = null;
  }
}

function saveState() {
  try {
    localStorage.setItem('hopfenkonto_v2', JSON.stringify({state, hourlyCount, milestonesShown: [...milestonesShown], drinkLog}));
  } catch(e) {}
}

function currentHour() {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 3600000);
}
function hourLabel(h) {
  const now = new Date();
  const d = new Date(new Date(now.getFullYear(), 0, 1).getTime() + h * 3600000);
  return d.getHours() + ':00';
}

function allHours() {
  const keys = new Set(Object.keys(hourlyCount).map(Number));
  if (keys.size === 0) return [currentHour()];
  const min = Math.min(...keys), max = Math.max(...keys);
  const out = [];
  for (let h = min; h <= max; h++) out.push(h);
  return out;
}

function updateChart() {
  const hours = allHours();
  const labels    = hours.map(hourLabel);
  const countData = hours.map(h => hourlyCount[h] || 0);

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = countData;
    chart.update('none');
  }

  const totalBierL  = (state.b02 * 0.2) + (state.b033 * 0.33) + (state.b05 * 0.5);
  const totalShotsCl = state.shots * 2;
  const totalMischCl = state.misch * 20;
  document.getElementById('total-bier').textContent  = totalBierL.toFixed(2).replace('.',',') + ' l';
  document.getElementById('total-shots').textContent = totalShotsCl + ' cl';
  document.getElementById('total-misch').textContent = totalMischCl + ' cl';
  document.getElementById('grand-total').textContent = state.b02 + state.b033 + state.b05 + state.shots + state.misch;
}

function triggerAnim(btn, dir) {
  btn.classList.remove('btn-pop');
  void btn.offsetWidth; // reflow to restart animation
  btn.classList.add('btn-pop');
  btn.addEventListener('animationend', () => btn.classList.remove('btn-pop'), { once: true });
  if (dir > 0) {
    const rect = btn.getBoundingClientRect();
    const lbl = document.createElement('span');
    lbl.className = 'horrido-label';
    lbl.textContent = 'Horrido!';
    lbl.style.left = (rect.left + rect.width / 2 - 14) + 'px';
    lbl.style.top  = (rect.top - 8) + 'px';
    document.body.appendChild(lbl);
    lbl.addEventListener('animationend', () => lbl.remove(), { once: true });
  }
}

// ── Sound ─────────────────────────────────────────────────────────────────────────────────
function isSoundOn() { return localStorage.getItem('hopfenkonto_sound') !== 'off'; }

// ── Click sound (Web Audio API, iOS-compatible) ───────────────────────────────
var _clickArrayBuf = null;
var _clickBuffer   = null;
var _clickDecoding = false;
var _audioCtx      = null;

(function() {
  try {
    var b64 = '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';
    var bin = atob(b64);
    var buf = new ArrayBuffer(bin.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
    _clickArrayBuf = buf;
  } catch(e) {}
})();

function playClick() {
  if (!isSoundOn() || !_clickArrayBuf) return;
  try {
    if (!_audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      _audioCtx = new AC();
    }
    function doPlay() {
      var src = _audioCtx.createBufferSource();
      src.buffer = _clickBuffer;
      var g = _audioCtx.createGain(); g.gain.value = 0.9;
      src.connect(g); g.connect(_audioCtx.destination);
      src.start(0);
    }
    function tryPlay() {
      if (_clickBuffer) {
        doPlay();
      } else if (!_clickDecoding) {
        _clickDecoding = true;
        _audioCtx.decodeAudioData(_clickArrayBuf.slice(0), function(decoded) {
          _clickBuffer = decoded;
          _clickDecoding = false;
          doPlay();
        }, function() { _clickDecoding = false; });
      }
    }
    if (_audioCtx.state === 'suspended') {
      _audioCtx.resume().then(tryPlay).catch(function(){});
    } else {
      tryPlay();
    }
  } catch(e) {}
}

// Global button click sound
document.addEventListener("pointerdown", function(e) {
  if (e.target.closest("button")) playClick();
}, true);

window.toggleSound = function() {
  const nowOn = !isSoundOn();
  localStorage.setItem('hopfenkonto_sound', nowOn ? 'on' : 'off');
  const btn = document.getElementById('sound-toggle-btn');
  if (btn) btn.textContent = nowOn ? '🔊 Ton an' : '🔇 Ton aus';
  if (nowOn) playClick();
};

window.addDrink = function(key, dir, btn) {
  if (dir < 0 && state[key] <= 0) return;
  if (btn) triggerAnim(btn, dir);
  state[key] = Math.max(0, state[key] + dir);
  drinkLog.push({ts: Date.now(), key, dir});
  const h = currentHour();
  if (key !== 'manta') hourlyCount[h] = Math.max(0, (hourlyCount[h] || 0) + dir);
  document.getElementById('b02-count').textContent  = state.b02;
  document.getElementById('b033-count').textContent = state.b033;
  document.getElementById('b05-count').textContent  = state.b05;
  document.getElementById('beer-total').textContent  = state.b02 + state.b033 + state.b05;
  document.getElementById('shots-total').textContent = state.shots;
  document.getElementById('misch-total').textContent = state.misch;
  document.getElementById('manta-total').textContent = state.manta;
  updateChart();
  updateBeerLevel();
  if (dir > 0) { checkMilestone(); }
  saveState();
};

function performReset() {
  Object.keys(state).forEach(k => state[k] = 0);
  hourlyCount = {};
  ['b02-count','b033-count','b05-count'].forEach(id => document.getElementById(id).textContent = '0');
  ['beer-total','shots-total','misch-total','manta-total'].forEach(id => document.getElementById(id).textContent = '0');
  ['total-bier','total-shots','total-misch'].forEach(id => document.getElementById(id).textContent = id === 'total-bier' ? '0,00 l' : '0 cl');
  document.getElementById('grand-total').textContent = '0';
  if (chart) {
    chart.data.labels = [hourLabel(currentHour())];
    chart.data.datasets.forEach(ds => ds.data = [0]);
    chart.update();
  }
  milestonesShown.clear();
  updateMedalsDisplay();
  updateBeerLevel();
  saveState();
}

window.resetAll = function() {
  archiveCurrentSession();
  performReset();
};

window.addEventListener('load', function() {
  const ctx = document.getElementById('barChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [hourLabel(currentHour())],
      datasets: [
        { label: 'Getränke', data: [0], backgroundColor: '#EFC93D', borderRadius: 4, borderSkipped: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#27500A', titleColor: '#97C459',
          bodyColor: '#C0DD97', borderColor: '#3B6D11', borderWidth: 0.5,
          callbacks: { label: c => c.parsed.y + ' Getränk' + (c.parsed.y !== 1 ? 'e' : '') }
        }
      },
      scales: {
        x: {
          ticks: { color: '#639922', font: { size: 11 }, maxRotation: 0 },
          grid: { color: 'rgba(151,196,89,0.08)' },
          border: { color: 'rgba(151,196,89,0.2)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#639922', font: { size: 11 }, stepSize: 1, callback: v => Number.isInteger(v) ? v : '' },
          grid: { color: 'rgba(151,196,89,0.08)' },
          border: { color: 'rgba(151,196,89,0.2)' }
        }
      }
    }
  });

  // Update DOM with any restored state
  document.getElementById('b02-count').textContent  = state.b02;
  document.getElementById('b033-count').textContent = state.b033;
  document.getElementById('b05-count').textContent  = state.b05;
  document.getElementById('beer-total').textContent  = state.b02 + state.b033 + state.b05;
  document.getElementById('shots-total').textContent = state.shots;
  document.getElementById('misch-total').textContent = state.misch;
  document.getElementById('manta-total').textContent = state.manta;
  updateChart();
  updateBeerLevel();
  updateMedalsDisplay();
  updateCountdown();
});

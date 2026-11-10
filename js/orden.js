// Orden (Meilenstein-Animationen) und Halten-zum-Zurücksetzen
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich;
// die Reihenfolge der <script>-Tags in hopfenkonto.html ist wichtig.

// ── Orden (Medal) Milestone Animations ──────────────────────────────────────
const MEDAL_TIERS = {
  5:  { name:'Bronze',            fill:'#CD7F32', shade:'#9A5E20', dark:'#5C2F08', star:'#5C2F08' },
  10: { name:'Silber',            fill:'#C0C0C0', shade:'#909090', dark:'#484848', star:'#484848' },
  15: { name:'Gold',              fill:'#FFD700', shade:'#C8A200', dark:'#7A5800', star:'#7A5800' },
  20: { name:'Platin',            fill:'#E5E4E2', shade:'#AEADAB', dark:'#585858', star:'#585858' },
  25: { name:'Diamant',           fill:'#B9F2FF', shade:'#60C0D8', dark:'#107888', star:'#107888' },
  30: { name:'Rubin',             fill:'#E0115F', shade:'#A80040', dark:'#600020', star:'#FFD0DA' },
  35: { name:'Saphir',            fill:'#0F52BA', shade:'#0A3A88', dark:'#061A50', star:'#C8DAFF' },
  40: { name:'Smaragd',           fill:'#50C878', shade:'#2A9850', dark:'#0E4820', star:'#0E4820' },
  45: { name:'Amethyst',          fill:'#9966CC', shade:'#6A3A9A', dark:'#3C1868', star:'#F0DEFF' },
  50: { name:'Schwarzer Diamant', fill:'#2B2B2B', shade:'#181818', dark:'#060606', star:'#E0E0E0' },
};

function buildMedalSVG(size, fill, shade, dark, star) {
  star = star || dark;
  const h = Math.round(size * 100 / 58);
  return `<svg viewBox="0 0 58 100" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}">
    <rect x="17" y="2" width="24" height="32" rx="2" fill="${fill}" stroke="${dark}" stroke-width="1.8"/>
    <line x1="23" y1="2"  x2="23" y2="34" stroke="${dark}" stroke-width="1.3" stroke-opacity="0.5"/>
    <line x1="29" y1="2"  x2="29" y2="34" stroke="${dark}" stroke-width="1.3" stroke-opacity="0.5"/>
    <line x1="35" y1="2"  x2="35" y2="34" stroke="${dark}" stroke-width="1.3" stroke-opacity="0.5"/>
    <polygon points="17,34 29,43 41,34" fill="${shade}" stroke="${dark}" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="29" cy="72" r="26" fill="${fill}" stroke="${dark}" stroke-width="2.5"/>
    <circle cx="29" cy="72" r="20" fill="none" stroke="${dark}" stroke-width="1.3"/>
    <polygon points="29,56 33.1,66.3 44.2,67.1 35.7,74.2 38.4,84.9 29,79 19.6,84.9 22.3,74.2 13.8,67.1 24.9,66.3"
             fill="${star}"/>
  </svg>`;
}

function updateMedalsDisplay() {
  const el = document.getElementById('medals-display');
  if (!el) return;
  el.innerHTML = '';
  const newest = [...milestonesShown].pop();
  [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].forEach(m => {
    const tier = MEDAL_TIERS[m];
    const unlocked = milestonesShown.has(m);
    const div = document.createElement('div');
    div.className = 'medal-badge' + (unlocked ? ' unlocked' : '') + (m === newest ? ' newest' : '');
    if (unlocked) {
      div.innerHTML = buildMedalSVG(26, tier.fill, tier.shade, tier.dark, tier.star);
    } else {
      div.innerHTML = buildMedalSVG(26, '#303030', '#202020', '#101010', '#484848');
    }
    el.appendChild(div);
  });
}

function checkMilestone() {
  const score = calcScore();
  for (const m of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]) {
    if (score >= m && !milestonesShown.has(m)) {
      milestonesShown.add(m);
      saveState();
      setTimeout(() => showMedalAnimation(m), 600);
      break;
    }
  }
}

function showMedalAnimation(milestone) {
  const tier = MEDAL_TIERS[milestone];
  if (!tier) return;
  const count = milestonesShown.size;

  const overlay    = document.getElementById('medal-overlay');
  const wrap       = document.getElementById('medals-wrap');
  const titleEl    = document.getElementById('medal-title');
  const subtitleEl = document.getElementById('medal-subtitle');
  const hintEl     = document.getElementById('medal-tap-hint');

  overlay.classList.remove('active');
  titleEl.classList.remove('show');
  subtitleEl.classList.remove('show');
  hintEl.classList.remove('show');
  wrap.innerHTML = '';

  const medalSize = count <= 2 ? 82 : count <= 4 ? 68 : count <= 6 ? 56 : count <= 8 ? 48 : 42;
  const allTiers  = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const shown     = allTiers.filter(m => milestonesShown.has(m));

  shown.forEach((m, idx) => {
    const t = MEDAL_TIERS[m];
    const div = document.createElement('div');
    div.className = 'medal-item' + (m === milestone ? ' new-medal' : '');
    div.innerHTML = buildMedalSVG(medalSize, t.fill, t.shade, t.dark, t.star);
    wrap.appendChild(div);
  });

  titleEl.textContent    = tier.name + '-Orden!';
  subtitleEl.textContent = milestone + ' Punkte erreicht — Glückwunsch!';
  overlay.classList.add('active');

  const dropDelay = count <= 5 ? 155 : 110;
  const items = wrap.querySelectorAll('.medal-item');
  items.forEach((item, idx) => {
    setTimeout(() => item.classList.add('dropped'), 220 + idx * dropDelay);
  });

  const allDropped = 220 + count * dropDelay;
  setTimeout(() => subtitleEl.classList.add('show'), allDropped + 120);
  setTimeout(() => titleEl.classList.add('show'),    allDropped + 320);
  playMedalSound(milestone, count, dropDelay, allDropped + 320);
  setTimeout(() => hintEl.classList.add('show'),     allDropped + 1400);

  const t = setTimeout(closeMedalAnim, allDropped + 5000);
  overlay._closeTimer = t;
}

window.closeMedalAnim = function() {
  const overlay = document.getElementById('medal-overlay');
  if (overlay._closeTimer) clearTimeout(overlay._closeTimer);
  overlay.classList.remove('active');
  updateMedalsDisplay();
};


// ── Hold-to-Reset ────────────────────────────────────────────────────────────
(function() {
  const btn  = document.getElementById('reset-btn');
  const fill = document.getElementById('reset-fill');
  if (!btn || !fill) return;
  const HOLD_MS = 2000;
  let animFrame = null;
  let startTime = null;

  function startHold(e) {
    e.preventDefault();
    startTime = Date.now();
    fill.style.transition = 'none';
    tick();
  }

  function tick() {
    const pct = Math.min((Date.now() - startTime) / HOLD_MS, 1);
    fill.style.width = (pct * 100) + '%';
    if (pct < 1) {
      animFrame = requestAnimationFrame(tick);
    } else {
      // Held long enough — flash and reset
      fill.style.background = 'rgba(151,196,89,0.5)';
      setTimeout(() => {
        fill.style.transition = 'width 0.35s ease';
        fill.style.width = '0%';
        fill.style.background = 'linear-gradient(90deg, rgba(180,100,10,0.55) 0%, rgba(220,150,20,0.62) 60%, rgba(240,190,40,0.55) 100%)';
      }, 250);
      resetAll();
    }
  }

  function cancelHold() {
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    if (startTime === null) return;
    startTime = null;
    fill.style.transition = 'width 0.4s ease';
    fill.style.width = '0%';
  }

  btn.addEventListener('pointerdown', startHold);
  btn.addEventListener('pointerup',   cancelHold);
  btn.addEventListener('pointerleave', cancelHold);
  btn.addEventListener('contextmenu', e => e.preventDefault());
})();

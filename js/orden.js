// Orden (Meilenstein-Animationen) und Halten-zum-Zurücksetzen
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich;
// die Reihenfolge der <script>-Tags in hopfenkonto.html ist wichtig.

// ── Orden-Stufen ─────────────────────────────────────────────────────────────
// fill/shade/dark/star: Grundfarben. gem: Edelstein in der Mitte statt Stern.
// fx: Stärke der Animation (Partikel, Wackeln, Strahlen) – steigt mit der Stufe.
const MEDAL_TIERS = {
  5:  { name:'Bronze',            fill:'#CD7F32', shade:'#9A5E20', dark:'#5C2F08', star:'#5C2F08', ribbon:'#8B2E1F', fx:1 },
  10: { name:'Silber',            fill:'#C0C0C0', shade:'#909090', dark:'#484848', star:'#484848', ribbon:'#1F4E8B', fx:2 },
  15: { name:'Gold',              fill:'#FFD700', shade:'#C8A200', dark:'#7A5800', star:'#7A5800', ribbon:'#B3122E', fx:3 },
  20: { name:'Platin',            fill:'#E5E4E2', shade:'#AEADAB', dark:'#585858', star:'#585858', ribbon:'#3B2A7A', fx:4 },
  25: { name:'Diamant',           fill:'#B9F2FF', shade:'#60C0D8', dark:'#107888', star:'#107888', ribbon:'#0F5E73', fx:5, gem:true },
  30: { name:'Rubin',             fill:'#E0115F', shade:'#A80040', dark:'#600020', star:'#FFD0DA', ribbon:'#6E0A2A', fx:6, gem:true },
  35: { name:'Saphir',            fill:'#0F52BA', shade:'#0A3A88', dark:'#061A50', star:'#C8DAFF', ribbon:'#0A2A66', fx:7, gem:true },
  40: { name:'Smaragd',           fill:'#50C878', shade:'#2A9850', dark:'#0E4820', star:'#0E4820', ribbon:'#0E4A26', fx:8, gem:true },
  45: { name:'Amethyst',          fill:'#9966CC', shade:'#6A3A9A', dark:'#3C1868', star:'#F0DEFF', ribbon:'#3A1766', fx:9, gem:true },
  50: { name:'Schwarzer Diamant', fill:'#2B2B2B', shade:'#181818', dark:'#060606', star:'#E0E0E0', ribbon:'#111111', fx:10, gem:true, gemColor:'#D8E4F2' },
};
const MEDAL_STEPS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const LOCKED_TIER = { fill:'#3a3a3a', shade:'#2a2a2a', dark:'#151515', star:'#4a4a4a', ribbon:'#2a2a2a' };

// Farbe aufhellen (amt > 0) oder abdunkeln (amt < 0)
function _mix(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = s => { const c = (n >> s) & 255; return Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt)); };
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}

// Geschliffener Edelstein, symmetrisch, Mittelpunkt (50,88).
// cut 'side': klassische Diamantform von der Seite (Krone + Spitze), 'top': Brillant von oben (Achteck).
const GEM_CUT = 'side';
function gemSVG(c, cut) {
  cut = cut || GEM_CUT;
  const P = pts => pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  const L = a => _mix(c, a);
  let f = '';
  if (cut === 'top') {
    const cx = 50, cy = 88, R = 21, r = 10.5, o = Math.PI / 8;
    const pt = (rad, i) => [cx + Math.cos(o + i * Math.PI / 4) * rad, cy + Math.sin(o + i * Math.PI / 4) * rad];
    const shades = [0.55, 0.15, 0.35, -0.2, 0.05, -0.4, 0.25, -0.1];
    for (let i = 0; i < 8; i++) {
      const O1 = pt(R, i), O2 = pt(R, i + 1), I1 = pt(r, i), I2 = pt(r, i + 1);
      const mid = [(O1[0] + O2[0]) / 2, (O1[1] + O2[1]) / 2];
      f += `<polygon points="${P([I1, O1, mid])}" fill="${L(shades[i])}"/>`;
      f += `<polygon points="${P([I1, mid, I2])}" fill="${L(shades[(i + 3) % 8] * 0.8)}"/>`;
      f += `<polygon points="${P([I2, mid, O2])}" fill="${L(shades[(i + 5) % 8])}"/>`;
    }
    const table = []; for (let i = 0; i < 8; i++) table.push(pt(r, i));
    const outer = []; for (let i = 0; i < 8; i++) outer.push(pt(R, i));
    f += `<polygon points="${P(table)}" fill="${L(0.35)}"/>`;
    f += `<polygon points="${P(outer)}" fill="none" stroke="${L(-0.55)}" stroke-width="1.1" stroke-linejoin="round"/>`;
    f += `<polygon points="${P([[44,80],[50,79],[47,84]])}" fill="#fff" opacity="0.85"/>`;
  } else {
    // Seitenansicht: Rundiste (Gürtel) bei y=82, Tafel oben, Spitze unten – spiegelsymmetrisch
    const y0 = 70, yg = 81, yp = 107, xg = 23, xt = 12;      // Tafelhöhe, Gürtel, Spitze, halbe Breiten
    const G = [-xg, -xg / 2, 0, xg / 2, xg].map(dx => [50 + dx, yg]);
    const T0 = [50 - xt, y0], T1 = [50 + xt, y0], Pk = [50, yp];
    const crown = [[G[0], T0, G[1], 0.25], [T0, G[2], G[1], 0.5], [T0, T1, G[2], 0.65], [T1, G[3], G[2], 0.4], [T1, G[4], G[3], 0.1]];
    const pav   = [[G[0], G[1], Pk, -0.15], [G[1], G[2], Pk, 0.2], [G[2], G[3], Pk, -0.05], [G[3], G[4], Pk, -0.4]];
    [...crown, ...pav].forEach(([a, b, d, sh]) => { f += `<polygon points="${P([a, b, d])}" fill="${L(sh)}"/>`; });
    f += `<polygon points="${P([G[0], T0, T1, G[4], Pk])}" fill="none" stroke="${L(-0.55)}" stroke-width="1.1" stroke-linejoin="round"/>`;
    f += `<polyline points="${P(G)}" fill="none" stroke="${L(-0.35)}" stroke-width="0.6"/>`;
    f += `<polygon points="${P([[44,72],[50,71],[46,77]])}" fill="#fff" opacity="0.85"/>`;
  }
  return `<g>${f}</g>`;
}

let _medalUid = 0;
// Orden als SVG: Band, gezackter Metallrand mit Verlauf, Glanzlicht und Stern bzw. Edelstein.
// Aufruf wie bisher: buildMedalSVG(size, tier) – size = Breite in px.
function buildMedalSVG(size, tier, opts) {
  tier = tier || LOCKED_TIER;
  const id = 'md' + (++_medalUid);
  const h = Math.round(size * 132 / 100);
  const gemTier = tier.gem;
  // Rand: bei Edelstein-Stufen Gold (Schwarzer Diamant: dunkles Metall), sonst Stufenfarbe
  const rim  = gemTier ? (tier === MEDAL_TIERS[50] ? '#55585e' : '#E8B923') : tier.fill;
  const gc   = tier.gemColor || tier.fill;
  const rimL = _mix(rim, 0.55), rimD = _mix(rim, -0.45);
  const disc = gemTier ? _mix(tier.fill, -0.55) : tier.fill;
  // gezackter Rand (wie geprägte Medaille)
  let teeth = '';
  for (let i = 0; i < 32; i++) {
    const a = i / 32 * Math.PI * 2, r = i % 2 ? 41 : 44;
    teeth += (50 + Math.sin(a) * r).toFixed(1) + ',' + (88 - Math.cos(a) * r).toFixed(1) + ' ';
  }
  const star = '50,64 56.5,79 72,80.5 60,90.8 63.8,106 50,97.6 36.2,106 40,90.8 28,80.5 43.5,79';
  const emblem = gemTier ? gemSVG(gc, opts && opts.cut) : `
      <polygon points="${star}" fill="${_mix(tier.fill,-0.35)}" transform="translate(0,1.6)" opacity="0.6"/>
      <polygon points="${star}" fill="url(#${id}e)" stroke="${_mix(tier.fill,-0.4)}" stroke-width="0.8" stroke-linejoin="round"/>`;
  return `<svg class="medal-svg" viewBox="0 0 100 132" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}">
    <defs>
      <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${rimL}"/><stop offset="0.45" stop-color="${rim}"/><stop offset="1" stop-color="${rimD}"/>
      </linearGradient>
      <radialGradient id="${id}d" cx="0.38" cy="0.3" r="0.8">
        <stop offset="0" stop-color="${_mix(disc,0.45)}"/><stop offset="0.55" stop-color="${disc}"/><stop offset="1" stop-color="${_mix(disc,-0.4)}"/>
      </radialGradient>
      <linearGradient id="${id}e" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${_mix(tier.fill,0.6)}"/><stop offset="1" stop-color="${_mix(tier.fill,-0.15)}"/>
      </linearGradient>
      <clipPath id="${id}c"><circle cx="50" cy="88" r="40"/></clipPath>
    </defs>
    <!-- Band -->
    <polygon points="22,0 44,0 58,52 36,52" fill="${_mix(tier.ribbon,-0.25)}"/>
    <polygon points="78,0 56,0 42,52 64,52" fill="${tier.ribbon}"/>
    <polygon points="62,0 66,0 52,52 48,52" fill="${_mix(tier.ribbon,0.45)}" opacity="0.8"/>
    <!-- Medaille -->
    <circle cx="50" cy="90" r="43" fill="#000" opacity="0.28"/>
    <polygon points="${teeth}" fill="url(#${id}r)"/>
    <circle cx="50" cy="88" r="36" fill="url(#${id}d)" stroke="${rimD}" stroke-width="1.5"/>
    <circle cx="50" cy="88" r="31" fill="none" stroke="${_mix(disc,0.35)}" stroke-width="0.8" opacity="0.7"/>
    ${emblem}
    <g clip-path="url(#${id}c)">
      <ellipse cx="36" cy="66" rx="22" ry="10" fill="#fff" opacity="0.22" transform="rotate(-28 36 66)"/>
      ${opts && opts.shine ? '<rect class="medal-shine" x="-40" y="40" width="18" height="100" fill="#fff" opacity="0.55" transform="rotate(20 50 88)"/>' : ''}
    </g>
  </svg>`;
}

function updateMedalsDisplay() {
  const el = document.getElementById('medals-display');
  if (!el) return;
  el.innerHTML = '';
  const newest = [...milestonesShown].pop();
  MEDAL_STEPS.forEach(m => {
    const unlocked = milestonesShown.has(m);
    const div = document.createElement('div');
    div.className = 'medal-badge' + (unlocked ? ' unlocked' : '') + (m === newest ? ' newest' : '');
    div.innerHTML = buildMedalSVG(26, unlocked ? MEDAL_TIERS[m] : null);
    el.appendChild(div);
  });
}

// ── Orden-Übersicht (Antippen der Leiste unter dem Diagramm) ────────────────
window.openMedalGallery = function() {
  const score = calcScore();
  const got = MEDAL_STEPS.filter(m => milestonesShown.has(m)).length;
  const next = MEDAL_STEPS.find(m => !milestonesShown.has(m));
  const fmt = n => String(Math.round(n * 100) / 100).replace('.', ',');
  document.getElementById('mg-progress').textContent =
    got + ' von ' + MEDAL_STEPS.length + ' Medaillen · ' + fmt(score) + ' Punkte' +
    (next ? ' · noch ' + fmt(Math.max(0, next - score)) + ' bis ' + MEDAL_TIERS[next].name : ' · alle gesammelt! 🏆');
  const prev = next ? (MEDAL_STEPS[MEDAL_STEPS.indexOf(next) - 1] || 0) : 0;
  const pct = next ? Math.min(100, Math.max(0, (score - prev) / (next - prev) * 100)) : 100;
  const size = Math.min(84, Math.floor((Math.min(window.innerWidth, 420) - 70) / 3 * 0.72));
  document.getElementById('mg-grid').innerHTML = MEDAL_STEPS.map(m => {
    const t = MEDAL_TIERS[m], has = milestonesShown.has(m);
    return `<div class="mg-item${has ? '' : ' locked'}${m === next ? ' next' : ''}">
      ${buildMedalSVG(size, t)}${has ? '' : '<span class="mg-lock">🔒</span>'}
      <div class="mg-name">${t.name}</div><div class="mg-pts">ab ${m} Punkten</div></div>`;
  }).join('');
  const g = document.getElementById('medal-gallery');
  g.classList.add('open');
  const bar = document.getElementById('mg-bar-fill');
  bar.style.width = '0';
  requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = pct + '%'; }));
};
window.closeMedalGallery = function() {
  document.getElementById('medal-gallery').classList.remove('open');
};

function checkMilestone() {
  const score = calcScore();
  for (const m of MEDAL_STEPS) {
    if (score >= m && !milestonesShown.has(m)) {
      milestonesShown.add(m);
      saveState();
      setTimeout(() => showMedalAnimation(m), 600);
      break;
    }
  }
}

// ── Orden-Animation ─────────────────────────────────────────────────────────
// Ablauf: Bisherige Orden fallen unten in die Reihe (je ein "Pling"), dann schlägt
// der neue Orden groß in der Mitte ein – genau auf die Fanfare. Dazu Blitz,
// Schockwelle, Lichtstrahlen, Partikel und Wackeln, umso stärker je höher die Stufe.
let _medalTimers = [];
function _later(fn, ms) { _medalTimers.push(setTimeout(fn, ms)); }

function showMedalAnimation(milestone) {
  const tier = MEDAL_TIERS[milestone];
  if (!tier) return;
  _medalTimers.forEach(clearTimeout); _medalTimers = [];

  const overlay  = document.getElementById('medal-overlay');
  const scene    = document.getElementById('medal-scene');
  const wrap     = document.getElementById('medals-wrap');
  const stage    = document.getElementById('medal-stage');
  const titleEl  = document.getElementById('medal-title');
  const subEl    = document.getElementById('medal-subtitle');
  const hintEl   = document.getElementById('medal-tap-hint');
  const fx       = tier.fx;
  const calm     = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Zurücksetzen
  overlay.classList.remove('active');
  [titleEl, subEl, hintEl].forEach(e => e.classList.remove('show'));
  scene.classList.remove('shake');
  wrap.innerHTML = ''; stage.innerHTML = '';
  overlay.style.setProperty('--glow', tier.fill);
  void overlay.offsetWidth;

  // Reihe der bisherigen Orden
  const earlier   = MEDAL_STEPS.filter(m => milestonesShown.has(m) && m !== milestone);
  const dropDelay = earlier.length <= 5 ? 130 : 95;
  earlier.forEach(m => {
    const d = document.createElement('div');
    d.className = 'medal-item';
    d.innerHTML = buildMedalSVG(34, MEDAL_TIERS[m]);
    wrap.appendChild(d);
  });

  // Bühne für den neuen Orden
  stage.innerHTML = `
    <div class="stage-rays" style="--rays:${0.22 + fx * 0.035}">${raysSVG(tier, 12 + fx)}</div>
    <div class="stage-charge"></div>
    <div class="stage-ring"></div><div class="stage-ring r2"></div>
    <div class="stage-medal">${buildMedalSVG(Math.min(170, window.innerWidth * 0.42), tier, { shine: true })}</div>
    <div class="stage-flash"></div>
    <div class="stage-particles"></div>`;

  titleEl.innerHTML = `<span>${tier.name}-Medaille!</span>`;
  subEl.textContent = milestone + ' Punkte erreicht — Glückwunsch!';
  overlay.classList.add('active');

  // Zeitplan (ms): Orden der Reihe fallen, dann Einschlag des neuen Ordens
  const items  = wrap.querySelectorAll('.medal-item');
  items.forEach((it, i) => _later(() => it.classList.add('dropped'), 220 + i * dropDelay));
  const slamAt = Math.max(fx >= 5 ? 1000 : 750, 220 + items.length * dropDelay + 300);
  playMedalSound(milestone, items.length, dropDelay, slamAt);

  if (fx >= 5) _later(() => stage.classList.add('charging'), slamAt - 450);
  _later(() => {
    stage.classList.remove('charging');
    stage.classList.add('slam');
    if (!calm) { scene.style.setProperty('--shake', (2 + fx * 0.9) + 'px'); scene.classList.add('shake'); }
    burstParticles(stage.querySelector('.stage-particles'), tier, 14 + fx * 6);
  }, slamAt);
  _later(() => titleEl.classList.add('show'), slamAt + 120);
  _later(() => subEl.classList.add('show'),   slamAt + 450);
  _later(() => hintEl.classList.add('show'),  slamAt + 1600);
  _later(closeMedalAnim, slamAt + 6000);
}

// Lichtstrahlen als SVG (Fächer aus Keilen, nach außen ausblendend)
function raysSVG(tier, count) {
  let wedges = '';
  for (let i = 0; i < count; i++) {
    const a = i / count * Math.PI * 2, w = Math.PI / count * 0.55;
    const p = (ang) => (Math.cos(ang) * 100).toFixed(1) + ',' + (Math.sin(ang) * 100).toFixed(1);
    wedges += `<polygon points="0,0 ${p(a - w)} ${p(a + w)}"/>`;
  }
  const c = _mix(tier.fill, 0.35);
  return `<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="raysG" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c}" stop-opacity="0.9"/><stop offset="0.3" stop-color="${c}" stop-opacity="0.3"/><stop offset="0.6" stop-color="${c}" stop-opacity="0"/>
    </radialGradient></defs>
    <g fill="url(#raysG)">${wedges}</g>
  </svg>`;
}

// Partikel: Sterne und Funken fliegen in alle Richtungen
function burstParticles(box, tier, count) {
  const cols = [tier.fill, _mix(tier.fill, 0.6), '#FFE27A', '#FFFFFF'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    const a = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 150;
    const big = Math.random() < 0.35;
    p.className = 'particle' + (big ? ' star' : '');
    p.style.cssText = `--dx:${(Math.cos(a) * dist).toFixed(0)}px;--dy:${(Math.sin(a) * dist).toFixed(0)}px;` +
      `--rot:${(Math.random() * 540 - 270).toFixed(0)}deg;--d:${(0.7 + Math.random() * 0.7).toFixed(2)}s;` +
      `background:${cols[i % cols.length]};`;
    box.appendChild(p);
  }
}

window.closeMedalAnim = function() {
  _medalTimers.forEach(clearTimeout); _medalTimers = [];
  const overlay = document.getElementById('medal-overlay');
  overlay.classList.remove('active');
  document.getElementById('medal-stage').className = '';
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

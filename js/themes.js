// Themes für den Hauptbildschirm.
// Stufen: 'gewoehnlich' = nur Farben, 'selten' = Farbverlauf, 'episch'/'legendaer' = echtes Design
// mit Hintergrund-Szene. Jedes Theme setzt die Farbvariablen aus css/style.css (:root) und
// optional eine Szene (SVG/Animation) in #theme-scene. Feinschliff der Designs: css/themes.css.
// Vorschau ohne Shop: Adresse mit ?theme=<id> öffnen, z.B. hopfenkonto.html?theme=bierzelt
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const FS = window.THEME_SCENES;   // Fest-Themes aus js/themes-feste.js

  // ── Szenen ────────────────────────────────────────────────────────────────
  function bierzeltScene() {
    // Zeltdach: Bahnen in Grün/Weiß, die von oben in der Mitte ausstrahlen
    let roof = '';
    const n = 18;
    for (let i = 0; i < n; i++) {
      const x1 = -260 + i * (920 / n), x2 = x1 + 920 / n;
      roof += `<polygon points="200,-60 ${x1.toFixed(1)},270 ${x2.toFixed(1)},270" fill="${i % 2 ? '#2f6b2a' : '#efe6d0'}"/>`;
    }
    // Volant mit Bögen
    let val = '';
    for (let i = 0; i < 14; i++) val += `<path d="M${i * 30 - 10},262 q15,22 30,0 z" fill="${i % 2 ? '#efe6d0' : '#2f6b2a'}"/>`;
    // Wimpelkette entlang einer Kurve
    const bunting = (y, sag, cls) => {
      let f = `<path d="M-10,${y} Q200,${y + sag} 410,${y}" stroke="#d8cbb0" stroke-width="1.5" fill="none"/>`;
      const cols = ['#c0392b', '#f1c40f', '#2e7d32', '#fdfdf5'];
      for (let i = 0; i <= 13; i++) {
        const t = i / 13, x = -10 + 420 * t, yy = y + 2 * sag * t * (1 - t);
        f += `<polygon points="${(x - 9).toFixed(1)},${yy.toFixed(1)} ${(x + 9).toFixed(1)},${yy.toFixed(1)} ${x.toFixed(1)},${(yy + 22).toFixed(1)}" fill="${cols[i % 4]}" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"/>`;
      }
      return `<g class="${cls}">${f}</g>`;
    };
    // Lichterkette
    let lights = `<path d="M-10,150 Q200,215 410,150" stroke="#3a2a14" stroke-width="1.5" fill="none"/>`;
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, x = -10 + 420 * t, y = 150 + 2 * 32.5 * t * (1 - t) + 6;
      lights += `<circle class="bulb" style="animation-delay:${(i * 0.37 % 2.2).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="url(#bzGlow)"/>` +
                `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#fff4c2"/>`;
    }
    return `<svg class="scene-svg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bzBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a240f"/><stop offset="1" stop-color="#1a1007"/></linearGradient>
        <linearGradient id="bzShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.05"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient>
        <radialGradient id="bzGlow"><stop offset="0" stop-color="#ffe9a0" stop-opacity="0.95"/><stop offset="1" stop-color="#ffb030" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#bzBg)"/>
      <g opacity="0.9">${roof}</g><rect width="400" height="272" fill="url(#bzShade)"/>
      ${val}<rect y="270" width="400" height="3" fill="#c9b78f" opacity="0.6"/>
      <rect x="10" y="270" width="12" height="530" fill="#5a3a1c"/><rect x="378" y="270" width="12" height="530" fill="#5a3a1c"/>
      ${bunting(58, 50, 'sway')}${lights}${bunting(228, 40, 'sway s2')}
    </svg>`;
  }

  function kneipeScene() {
    let panels = '';
    for (let i = 0; i < 9; i++) panels += `<rect x="${i * 46 - 6}" y="0" width="44" height="800" fill="${i % 2 ? '#3a2416' : '#341f13'}"/><rect x="${i * 46 + 38}" y="0" width="2" height="800" fill="#1d110a"/>`;
    const bottle = (x, y, h, col) => `<g transform="translate(${x},${y})">
        <path d="M-6,0 v-${h * 0.5} q0,-8 4,-12 v-${h * 0.22} h4 v${h * 0.22} q4,4 4,12 v${h * 0.5} z" transform="translate(0,0)" fill="${col}" opacity="0.85"/>
        <rect x="-4.2" y="-${h * 0.42}" width="1.6" height="${h * 0.32}" fill="#fff" opacity="0.35"/></g>`;
    const cols = ['#2e5e2a', '#6b3a12', '#1f4f5c', '#8a6d1a', '#5c1f2a', '#2e5e2a', '#6b3a12', '#3f3f3f', '#8a6d1a'];
    let shelf1 = '', shelf2 = '';
    cols.forEach((c, i) => { shelf1 += bottle(30 + i * 42, 128, 52 + (i * 13 % 18), c); });
    for (let i = 0; i < 10; i++) shelf2 += `<path d="M${22 + i * 38},250 l3,-26 h16 l3,26 z" fill="#cfe8f0" opacity="0.18" stroke="#e8f6fa" stroke-opacity="0.35" stroke-width="0.8"/>`;
    return `<svg class="scene-svg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="knLamp" cx="0.5" cy="0.12" r="0.6"><stop offset="0" stop-color="#ffcf7a" stop-opacity="0.55"/><stop offset="0.5" stop-color="#ff9d3a" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <linearGradient id="knCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd890" stop-opacity="0.35"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></linearGradient>
        <linearGradient id="knShelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4f2c"/><stop offset="1" stop-color="#3e2615"/></linearGradient>
      </defs>
      ${panels}
      ${shelf1}<rect x="0" y="128" width="400" height="9" fill="url(#knShelf)"/>
      ${shelf2}<rect x="0" y="250" width="400" height="9" fill="url(#knShelf)"/>
      <text class="neon" x="200" y="345" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="44" fill="none" stroke="#ff7a59" stroke-width="2.2">Prost!</text>
      <rect x="0" y="560" width="400" height="5" fill="#b8892e" opacity="0.8"/>
      <line x1="200" y1="0" x2="200" y2="34" stroke="#111" stroke-width="2"/>
      <path d="M176,52 L186,34 h28 l10,18 z" fill="#1f3b26" stroke="#b8892e" stroke-width="1.5"/>
      <polygon points="178,52 222,52 330,420 70,420" fill="url(#knCone)"/>
      <rect width="400" height="800" fill="url(#knLamp)"/>
    </svg>`;
  }

  function herbstScene() {
    const tree = (x, y, s, c) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-3" y="-4" width="6" height="34" fill="#3a1d0e"/>
      <circle cx="0" cy="-16" r="18" fill="${c}"/><circle cx="-12" cy="-6" r="12" fill="${c}"/><circle cx="12" cy="-8" r="13" fill="${c}"/><circle cx="4" cy="-28" r="11" fill="${c}" opacity="0.9"/></g>`;
    const cols = ['#d35400', '#e67e22', '#c0392b', '#f39c12', '#b9461f'];
    let trees = '';
    [[40, 590, 1.1], [95, 610, 0.8], [300, 575, 1.2], [355, 600, 0.9], [210, 640, 0.7], [150, 650, 1.0]].forEach(([x, y, s], i) => trees += tree(x, y, s, cols[i % cols.length]));
    return `<svg class="scene-svg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hbSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241326"/><stop offset="0.45" stop-color="#6e2f3a"/><stop offset="0.68" stop-color="#d06a35"/><stop offset="0.8" stop-color="#f2b25a"/></linearGradient>
        <radialGradient id="hbSun"><stop offset="0" stop-color="#ffe7a8"/><stop offset="0.35" stop-color="#ffc067" stop-opacity="0.8"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#hbSky)"/>
      <circle cx="285" cy="560" r="110" fill="url(#hbSun)"/><circle cx="285" cy="560" r="26" fill="#ffe2a0"/>
      <path d="M40,330 q40,-10 90,0 t90,0" stroke="#f6c28b" stroke-opacity="0.25" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M220,400 q40,-8 80,0 t70,0" stroke="#f6c28b" stroke-opacity="0.2" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M0,600 Q80,540 170,585 T400,570 V800 H0 Z" fill="#7a3a1f"/>
      ${trees}
      <path d="M0,650 Q110,600 220,650 T400,640 V800 H0 Z" fill="#4a2312"/>
      <path d="M0,705 Q130,670 260,712 T400,700 V800 H0 Z" fill="#2c140a"/>
    </svg>`;
  }
  function herbstInit(el) {
    const leaf = c => `<svg viewBox="0 0 20 20"><path d="M10,1 L12,6 L17,5 L14,9 L19,11 L13,12 L14,18 L10,14 L6,18 L7,12 L1,11 L6,9 L3,5 L8,6 Z" fill="${c}"/></svg>`;
    const cols = ['#d35400', '#e67e22', '#c0392b', '#f39c12', '#b9461f', '#e2a33a'];
    for (let i = 0; i < 16; i++) {
      const d = document.createElement('span');
      d.className = 'leaf'; d.innerHTML = leaf(cols[i % cols.length]);
      d.style.cssText = `left:${rnd(0, 100)}%;--s:${rnd(12, 22).toFixed(0)}px;--dur:${rnd(9, 16).toFixed(1)}s;--delay:-${rnd(0, 16).toFixed(1)}s;--sway:${rnd(30, 70).toFixed(0)}px`;
      el.appendChild(d);
    }
  }

  function winterScene() {
    let stars = '';
    for (let i = 0; i < 40; i++) stars += `<circle class="star" style="animation-delay:-${rnd(0, 4).toFixed(1)}s" cx="${rnd(0, 400).toFixed(0)}" cy="${rnd(0, 420).toFixed(0)}" r="${rnd(0.6, 1.6).toFixed(1)}" fill="#fff"/>`;
    const pine = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-3" y="0" width="6" height="12" fill="#2b1a10"/>
      <polygon points="0,-70 -22,-28 22,-28" fill="#12301f"/><polygon points="0,-52 -28,-8 28,-8" fill="#163b26"/><polygon points="0,-34 -32,10 32,10" fill="#12301f"/>
      <polygon points="0,-70 -9,-53 9,-53" fill="#f3f8ff"/><polygon points="-14,-36 -28,-8 -6,-30" fill="#eef5ff" opacity="0.9"/><polygon points="14,-18 32,10 8,-12" fill="#eef5ff" opacity="0.9"/></g>`;
    return `<svg class="scene-svg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040a1c"/><stop offset="0.55" stop-color="#0e2248"/><stop offset="0.85" stop-color="#26457a"/></linearGradient>
        <radialGradient id="wnMoon"><stop offset="0" stop-color="#fffbe6" stop-opacity="0.9"/><stop offset="1" stop-color="#bcd4ff" stop-opacity="0"/></radialGradient>
        <linearGradient id="wnSnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8ff"/><stop offset="1" stop-color="#b7cbe6"/></linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#wnSky)"/>${stars}
      <circle cx="320" cy="110" r="70" fill="url(#wnMoon)"/><circle cx="320" cy="110" r="22" fill="#fbf6e2"/>
      <path d="M0,560 L70,470 L130,530 L210,440 L290,520 L350,470 L400,520 V800 H0 Z" fill="#2c4c7c"/>
      <path d="M210,440 L190,465 L205,460 L215,470 L228,458 Z M70,470 L58,486 L72,482 L84,490 Z" fill="#dfe9f7" opacity="0.8"/>
      <path d="M0,620 Q100,575 200,615 T400,600 V800 H0 Z" fill="url(#wnSnow)"/>
      ${pine(45, 640, 1.0)}${pine(95, 655, 0.7)}${pine(345, 630, 1.1)}${pine(300, 650, 0.75)}
      <g transform="translate(190,628)"><rect x="-26" y="-22" width="52" height="30" fill="#5a3420"/><polygon points="-32,-20 0,-44 32,-20" fill="#eef5ff"/>
        <rect x="-8" y="-14" width="14" height="12" fill="#ffcf6b"/><rect x="18" y="-50" width="7" height="16" fill="#4a2a18"/>
        <circle class="smoke" cx="22" cy="-58" r="5" fill="#dfe8f5" opacity="0.5"/></g>
      <path d="M0,690 Q140,660 260,695 T400,688 V800 H0 Z" fill="#e9f1fc"/>
    </svg>`;
  }
  function snowInit(el) {
    for (let i = 0; i < 45; i++) {
      const f = document.createElement('span');
      f.className = 'flake';
      f.style.cssText = `left:${rnd(0, 100)}%;--s:${rnd(2, 6).toFixed(1)}px;--dur:${rnd(7, 15).toFixed(1)}s;--delay:-${rnd(0, 15).toFixed(1)}s;--sway:${rnd(10, 40).toFixed(0)}px;opacity:${rnd(0.5, 0.95).toFixed(2)}`;
      el.appendChild(f);
    }
  }

  function goldScene() {
    return `<svg class="scene-svg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gdGlow" cx="0.5" cy="0" r="0.9"><stop offset="0" stop-color="#5a4210"/><stop offset="0.55" stop-color="#16110a"/><stop offset="1" stop-color="#070604"/></radialGradient>
        <pattern id="gdPat" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="28" height="28" fill="none" stroke="#d4af37" stroke-opacity="0.07" stroke-width="1"/>
          <circle cx="14" cy="14" r="1.4" fill="#d4af37" fill-opacity="0.12"/></pattern>
      </defs>
      <rect width="400" height="800" fill="url(#gdGlow)"/><rect width="400" height="800" fill="url(#gdPat)"/>
    </svg>`;
  }
  function goldInit(el) {
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('span');
      s.className = 'gold-spark';
      s.style.cssText = `left:${rnd(2, 98)}%;top:${rnd(2, 98)}%;--s:${rnd(6, 14).toFixed(0)}px;--dur:${rnd(2.5, 5).toFixed(1)}s;--delay:-${rnd(0, 5).toFixed(1)}s`;
      el.appendChild(s);
    }
  }

  function feuerwerkScene() {
    let city = '', wins = '';
    let x = 0, i = 0;
    while (x < 400) {
      const w = 22 + (i * 17 % 26), h = 40 + (i * 37 % 90);
      city += `<rect x="${x}" y="${800 - h}" width="${w}" height="${h}" fill="#070818"/>`;
      for (let wy = 800 - h + 8; wy < 790; wy += 12) for (let wx = x + 4; wx < x + w - 6; wx += 8)
        if ((wx * 7 + wy * 3 + i) % 5 === 0) wins += `<rect x="${wx}" y="${wy}" width="3" height="5" fill="#ffd27a" opacity="0.75"/>`;
      x += w + 2; i++;
    }
    return `<svg class="scene-svg" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="fwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02030b"/><stop offset="0.6" stop-color="#0b1036"/><stop offset="1" stop-color="#2a1a55"/></linearGradient></defs>
      <rect width="400" height="800" fill="url(#fwSky)"/>${city}${wins}
    </svg><canvas class="fw-canvas"></canvas>`;
  }
  function feuerwerkInit(el) {
    const cv = el.querySelector('.fw-canvas'), g = cv.getContext('2d');
    let W, H, parts = [], rockets = [], next = 0, raf = null, alive = true;
    const resize = () => { const d = Math.min(2, window.devicePixelRatio || 1); W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; };
    resize(); addEventListener('resize', resize);
    const COLS = ['#ff4d6d', '#ffd54a', '#4dd2ff', '#7dff8a', '#c38bff', '#ff9a3c', '#ffffff'];
    function burst(x, y) {
      const c = COLS[Math.floor(Math.random() * COLS.length)], c2 = COLS[Math.floor(Math.random() * COLS.length)];
      const n = 70 + Math.floor(Math.random() * 50), sp = (W / 400) * rnd(2.4, 3.6);
      for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n + rnd(-0.05, 0.05), v = sp * rnd(0.6, 1);
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: i % 3 ? c : c2 }); }
    }
    function frame(t) {
      if (!alive) return;
      if (document.hidden) { raf = requestAnimationFrame(frame); return; }
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      if (t > next) { rockets.push({ x: W * rnd(0.15, 0.85), y: H * 0.98, vy: -(H / 800) * rnd(7, 9.5), ty: H * rnd(0.12, 0.6) }); next = t + rnd(500, 1200); }
      rockets = rockets.filter(r => { r.y += r.vy; r.vy *= 0.985;
        g.fillStyle = '#ffe9b0'; g.fillRect(r.x - 1.5, r.y, 3, 7 * (W / 400));
        if (r.y <= r.ty) { burst(r.x, r.y); return false; } return true; });
      parts = parts.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.035 * (W / 400); p.vx *= 0.985; p.vy *= 0.985; p.life -= 0.0095;
        if (p.life <= 0) return false; g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, 2.6 * (W / 400), 0, 7); g.fill(); g.globalAlpha = 1; return true; });
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }

  function polarlichtScene() {
    return `<div class="aurora a1"></div><div class="aurora a2"></div><div class="aurora a3"></div>`;
  }

  // ── Theme-Katalog ─────────────────────────────────────────────────────────
  // vars: überschreibt Farbvariablen. bg kann auch ein Verlauf sein (dann über die Szene gelegt).
  const T = {
    standard:   { name: 'Vereinsgrün', tier: 'standard', vars: {} },
    // Gewöhnlich – nur Farben
    nachtblau:  { name: 'Nachtblau', tier: 'gewoehnlich', vars: { bg: '#0b1526', surface: '#132441', 'surface-2': '#1d3561', line: '#2f5590', text: '#d4e3ff', 'text-soft': '#8fb2e8', label: '#8a96a8', icon: '#4a6fa8', 'chart-fade': 'rgba(11,21,38,0.55)', 'btn-bg': '#1d3561', 'btn-fg': '#d4e3ff', 'btn-line': '#2f5590', 'card-accent': '#2f5590' } },
    bordeaux:   { name: 'Bordeaux', tier: 'gewoehnlich', vars: { bg: '#1f070c', surface: '#380f19', 'surface-2': '#551826', line: '#7a2638', text: '#ffdbe2', 'text-soft': '#e2939f', label: '#a08a8e', icon: '#8a3446', 'chart-fade': 'rgba(31,7,12,0.55)', 'btn-bg': '#551826', 'btn-fg': '#ffdbe2', 'btn-line': '#7a2638', 'card-accent': '#7a2638' } },
    anthrazit:  { name: 'Anthrazit', tier: 'gewoehnlich', vars: { bg: '#121314', surface: '#1e2022', 'surface-2': '#2b2e32', line: '#3d4146', text: '#e8e8e8', 'text-soft': '#a9adb3', label: '#8c8c8c', icon: '#5a5f66', 'chart-fade': 'rgba(18,19,20,0.55)', 'btn-bg': '#2b2e32', 'btn-fg': '#e8e8e8', 'btn-line': '#3d4146', 'card-accent': '#3d4146' } },
    bernstein:  { name: 'Bernstein', tier: 'gewoehnlich', vars: { bg: '#1c1106', surface: '#2e1c0a', 'surface-2': '#45290f', line: '#6b4316', text: '#ffe3ba', 'text-soft': '#d9a866', label: '#9a8a76', icon: '#8a5a1e', 'chart-fade': 'rgba(28,17,6,0.55)', 'btn-bg': '#6b4316', 'btn-fg': '#ffe3ba', 'btn-line': '#8a5a1e', 'card-accent': '#8a5a1e' } },
    petrol:     { name: 'Petrol', tier: 'gewoehnlich', vars: { bg: '#05191a', surface: '#0b2a2c', 'surface-2': '#123f42', line: '#1e5f63', text: '#cdf2ee', 'text-soft': '#79c7c0', label: '#7f9a98', icon: '#2a7a7f', 'chart-fade': 'rgba(5,25,26,0.55)', 'btn-bg': '#123f42', 'btn-fg': '#cdf2ee', 'btn-line': '#1e5f63', 'card-accent': '#1e5f63' } },
    // Selten – Farbverläufe
    abendrot:   { name: 'Abendrot', tier: 'selten', grad: 'linear-gradient(180deg, #1c0b2e 0%, #5a1f43 45%, #b4462f 80%, #e0773a 100%)',
                  vars: { bg: '#1c0b2e', surface: 'rgba(28,10,36,0.72)', 'surface-2': 'rgba(90,31,67,0.7)', line: 'rgba(255,170,120,0.35)', text: '#ffe2d0', 'text-soft': '#f0a98a', label: '#e8c2b0', icon: '#f0a98a', 'chart-fade': 'rgba(28,10,36,0.4)', 'btn-bg': '#5a1f43', 'btn-fg': '#ffe2d0', 'btn-line': '#b4462f', 'card-accent': '#b4462f' } },
    ozean:      { name: 'Ozean', tier: 'selten', grad: 'linear-gradient(180deg, #021626 0%, #06395a 50%, #0e7287 85%, #23a3a8 100%)',
                  vars: { bg: '#021626', surface: 'rgba(2,24,40,0.72)', 'surface-2': 'rgba(10,70,100,0.6)', line: 'rgba(120,220,240,0.3)', text: '#d6f6ff', 'text-soft': '#86cfe0', label: '#a9d6e0', icon: '#86cfe0', 'chart-fade': 'rgba(2,24,40,0.4)', 'btn-bg': '#06395a', 'btn-fg': '#d6f6ff', 'btn-line': '#0e7287', 'card-accent': '#0e7287' } },
    hopfengold: { name: 'Hopfengold', tier: 'selten', grad: 'linear-gradient(180deg, #0c1c03 0%, #23400a 45%, #6b6a10 80%, #b08a1c 100%)',
                  vars: { bg: '#0c1c03', surface: 'rgba(14,34,4,0.74)', 'surface-2': 'rgba(52,80,12,0.65)', line: 'rgba(230,200,90,0.35)', text: '#eaf3c8', 'text-soft': '#c9cf7a', label: '#d6d39a', icon: '#c9cf7a', 'chart-fade': 'rgba(14,34,4,0.4)', 'btn-bg': '#23400a', 'btn-fg': '#eaf3c8', 'btn-line': '#6b6a10', 'card-accent': '#6b6a10' } },
    polarlicht: { name: 'Polarlicht', tier: 'selten', grad: 'linear-gradient(180deg, #020a12 0%, #051a24 60%, #0a2a30 100%)', scene: polarlichtScene,
                  vars: { bg: '#020a12', surface: 'rgba(4,18,26,0.74)', 'surface-2': 'rgba(12,60,64,0.6)', line: 'rgba(110,255,200,0.28)', text: '#d8fff2', 'text-soft': '#7fe0c0', label: '#9fd8c8', icon: '#7fe0c0', 'chart-fade': 'rgba(4,18,26,0.4)', 'btn-bg': '#0c3c40', 'btn-fg': '#d8fff2', 'btn-line': '#148a7a', 'card-accent': '#148a7a' } },
    // Episch – echte Designs
    bierzelt:   { name: 'Bierzelt', tier: 'episch', scene: bierzeltScene,
                  vars: { bg: '#1a1007', surface: 'rgba(78,50,24,0.92)', 'surface-2': 'rgba(52,32,14,0.9)', line: '#a8783f', text: '#fff1d6', 'text-soft': '#e9c58e', label: '#f3e2c2', icon: '#e9c58e', accent: '#FFD54A', 'chart-fade': 'rgba(30,18,8,0.45)', 'card-bg': '#fbf1dc', 'card-border': '#d9c39a', 'card-title': '#3a2410', 'card-muted': '#8a7350', 'card-accent': '#2f6b2a', 'btn-bg': '#2f6b2a', 'btn-fg': '#f6ecd2', 'btn-line': '#245520' } },
    kneipe:     { name: 'Kneipe', tier: 'episch', scene: kneipeScene,
                  vars: { bg: '#2a190f', surface: '#202723', 'surface-2': '#2b332e', line: '#7a5532', text: '#efefe6', 'text-soft': '#c4cbbd', label: '#e2c9a6', icon: '#d8b27a', accent: '#f2d27a', 'chart-fade': 'rgba(10,14,12,0.35)', 'card-bg': '#f3ead7', 'card-border': '#c9b48e', 'card-title': '#2a1a0e', 'card-muted': '#7d6a52', 'card-accent': '#6b3a12', 'btn-bg': '#6b4526', 'btn-fg': '#f7e6c8', 'btn-line': '#4e301a' } },
    herbst:     { name: 'Herbstabend', tier: 'episch', season: { months: [9, 10, 11], label: 'September – November' }, scene: herbstScene, init: herbstInit,
                  vars: { bg: '#241326', surface: 'rgba(42,18,24,0.8)', 'surface-2': 'rgba(110,47,40,0.65)', line: 'rgba(242,178,90,0.45)', text: '#ffe6cc', 'text-soft': '#f2b27a', label: '#ffd9b5', icon: '#f2b27a', accent: '#FFC94A', 'chart-fade': 'rgba(36,19,38,0.4)', 'card-bg': '#fff3e6', 'card-border': '#f0c9a0', 'card-title': '#3d1a0c', 'card-muted': '#9a6a4a', 'card-accent': '#b9461f', 'btn-bg': '#b9461f', 'btn-fg': '#fff1e0', 'btn-line': '#8f3215' } },
    winter:     { name: 'Winternacht', tier: 'episch', season: { months: [12, 1, 2], label: 'Dezember – Februar' }, scene: winterScene, init: snowInit,
                  vars: { bg: '#040a1c', surface: 'rgba(14,34,72,0.66)', 'surface-2': 'rgba(60,100,160,0.38)', line: 'rgba(190,220,255,0.4)', text: '#f0f7ff', 'text-soft': '#a9c8f0', label: '#dbe9ff', icon: '#a9c8f0', accent: '#FFE08A', 'chart-fade': 'rgba(4,10,28,0.3)', 'card-bg': 'rgba(248,251,255,0.8)', 'card-border': '#c9dcf2', 'card-title': '#0e2248', 'card-muted': '#5a6f90', 'card-accent': '#2c5a9c', 'btn-bg': '#2c5a9c', 'btn-fg': '#eaf3ff', 'btn-line': '#1f467e' } },
    karneval:   { name: 'Karneval', tier: 'episch', season: { from: [11, 11], to: [2, 29], label: '11.11. – Februar' }, scene: FS.karneval.scene, init: FS.karneval.init,
                  vars: { bg: '#1b0b4a', surface: 'rgba(30,10,70,0.8)', 'surface-2': 'rgba(122,40,140,0.55)', line: 'rgba(255,210,63,0.45)', text: '#fff4fb', 'text-soft': '#ffc2e6', label: '#ffe9a8', icon: '#ffd23f', accent: '#FFD23F', 'chart-fade': 'rgba(27,11,74,0.4)', 'card-bg': '#fffaf3', 'card-border': '#ffd23f', 'card-title': '#3a0e5a', 'card-muted': '#8a5a9a', 'card-accent': '#d81b60', 'btn-bg': '#d81b60', 'btn-fg': '#fff4fb', 'btn-line': '#a3124a' } },
    fruehling:  { name: 'Frühlingswiese', tier: 'episch', season: { months: [3, 4, 5], label: 'März – Mai' }, scene: FS.fruehling.scene, init: FS.fruehling.init,
                  vars: { bg: '#6cc4f5', surface: 'rgba(36,92,40,0.78)', 'surface-2': 'rgba(90,160,60,0.5)', line: 'rgba(255,255,255,0.45)', text: '#f6fff0', 'text-soft': '#cdeeb8', label: '#ffffff', icon: '#ffe27a', accent: '#FFD23F', 'chart-fade': 'rgba(36,92,40,0.35)', 'card-bg': 'rgba(255,255,255,0.84)', 'card-border': 'rgba(255,255,255,0.95)', 'card-title': '#24451c', 'card-muted': '#5e7a52', 'card-accent': '#e0457b', 'btn-bg': '#4f9a35', 'btn-fg': '#ffffff', 'btn-line': '#3a7a26' } },
    biergarten: { name: 'Sommer-Biergarten', tier: 'episch', season: { months: [6, 7, 8], label: 'Juni – August' }, scene: FS.biergarten.scene, init: FS.biergarten.init,
                  vars: { bg: '#3f6fb0', surface: 'rgba(40,30,18,0.8)', 'surface-2': 'rgba(120,80,30,0.55)', line: 'rgba(255,207,122,0.45)', text: '#fff3dc', 'text-soft': '#f6cf8e', label: '#fff3dc', icon: '#ffcf7a', accent: '#FFCF4A', 'chart-fade': 'rgba(40,30,18,0.35)', 'card-bg': '#fffaf0', 'card-border': '#e8c98e', 'card-title': '#3a2410', 'card-muted': '#8a7350', 'card-accent': '#2f6b2a', 'btn-bg': '#2f6b2a', 'btn-fg': '#fff6e0', 'btn-line': '#245520' } },
    // Legendär
    schuetzenfest: { name: 'Schützenfest', tier: 'legendaer', thumbPos: 'xMidYMin slice', scene: FS.schuetzenfest.scene, init: FS.schuetzenfest.init,
                  vars: { bg: '#3d8fd9', surface: 'rgba(16,70,34,0.7)', 'surface-2': 'rgba(60,130,60,0.5)', line: 'rgba(255,255,255,0.5)', text: '#f4fbef', 'text-soft': '#c9ecb8', label: '#ffffff', icon: '#ffffff', accent: '#FFD54A', 'chart-fade': 'rgba(16,70,34,0.35)', 'card-bg': 'rgba(255,255,255,0.6)', 'card-border': 'rgba(255,255,255,0.95)', 'card-title': '#123a1c', 'card-muted': '#4f6b52', 'card-accent': '#c62828', 'btn-bg': '#2e7d32', 'btn-fg': '#ffffff', 'btn-line': '#1f5e24' } },
    gold:       { name: 'Gold-Edition', tier: 'legendaer', scene: goldScene, init: goldInit,
                  vars: { bg: '#070604', surface: 'rgba(18,14,6,0.92)', 'surface-2': 'rgba(60,45,12,0.7)', line: '#b8902e', text: '#fbe7a6', 'text-soft': '#d4b060', label: '#d4b060', icon: '#d4af37', accent: '#FFD54A', 'chart-fade': 'rgba(7,6,4,0.4)', 'card-bg': '#fffaf0', 'card-border': '#d4af37', 'card-title': '#2a2106', 'card-muted': '#8a7440', 'card-accent': '#9a7412', 'btn-bg': '#1a150a', 'btn-fg': '#FFD54A', 'btn-line': '#b8902e' } },
    feuerwerk:  { name: 'Silvester-Feuerwerk', tier: 'legendaer', season: { from: [12, 27], to: [1, 6], label: '27. Dezember – 6. Januar' }, scene: feuerwerkScene, init: feuerwerkInit,
                  vars: { bg: '#02030b', surface: 'rgba(8,10,34,0.78)', 'surface-2': 'rgba(42,26,85,0.62)', line: 'rgba(160,140,255,0.4)', text: '#eef0ff', 'text-soft': '#b4b6f0', label: '#d6d8ff', icon: '#b4b6f0', accent: '#FFD54A', 'chart-fade': 'rgba(2,3,11,0.3)', 'card-bg': 'rgba(14,12,48,0.5)', 'card-border': 'rgba(170,160,255,0.35)', 'card-title': '#f2f0ff', 'card-muted': '#b4b0e8', 'card-accent': '#FFD54A', 'btn-bg': '#2a1a6e', 'btn-fg': '#FFD54A', 'btn-line': '#5a3fd0' } },
  };
  window.THEMES = T;


  // ── Automaten-Skins (Optik in css/themes.css, Abschnitt "Automaten-Skins") ──
  const SKINS = {
    // thumb: Farben für das kleine Vorschaubild im Shop
    standard: { name: 'Casino Rot',       tier: 'standard',  thumb: { cab: 'linear-gradient(#7a0f1d,#4e0912)', frame: '#E8B923', marq: '#2a0a0e', glow: 'none' } },
    holz:     { name: 'Holz-Retro',       tier: 'selten',    thumb: { cab: 'linear-gradient(#7a4a24,#4a2a12)', frame: '#c9a24a', marq: '#1f3b26', glow: 'none' } },
    bierfass: { name: 'Bierfass',         tier: 'episch',    thumb: { cab: 'radial-gradient(ellipse,#a0622a,#4a2508)', frame: '#2b2b2b', marq: '#f3e6c4', glow: 'none' } },
    eis:      { name: 'Eispalast',        tier: 'episch',    thumb: { cab: 'linear-gradient(#5aa2d8,#1f5a96)', frame: '#e6f2ff', marq: '#0e2b55', glow: '0 0 10px rgba(150,210,255,0.6)' } },
    neon:     { name: 'Neon-Vegas',       tier: 'legendaer', thumb: { cab: 'linear-gradient(#120018,#05000a)', frame: '#ff2fa0', marq: '#05000a', glow: '0 0 10px #ff2fa0' } },
    gold:     { name: 'Goldener Automat', tier: 'legendaer', thumb: { cab: 'linear-gradient(135deg,#7a5a12,#ffe08a 30%,#c99a2e 55%,#fff1b8 75%,#7a5a12)', frame: '#fff1b8', marq: '#000', glow: '0 0 10px rgba(255,200,60,0.5)' } },
  };
  window.SLOT_SKINS = SKINS;
  window.applySlotSkin = function(id) {
    const ov = document.getElementById('slots-overlay');
    if (ov) ov.dataset.skin = SKINS[id] ? id : 'standard';
  };

  let _cleanup = null;
  window.applyTheme = function(id) {
    const th = T[id] || T.standard;
    const root = document.documentElement, scene = document.getElementById('theme-scene');
    if (_cleanup) { try { _cleanup(); } catch(e) {} _cleanup = null; }
    ['bg', 'surface', 'surface-2', 'line', 'text', 'text-soft', 'accent', 'label', 'icon', 'chart-fade', 'card-bg', 'card-border', 'card-title', 'card-muted', 'card-accent', 'btn-bg', 'btn-fg', 'btn-line'].forEach(k => root.style.removeProperty('--' + k));
    Object.entries(th.vars).forEach(([k, v]) => root.style.setProperty('--' + k, v));
    document.body.dataset.theme = T[id] ? id : 'standard';
    scene.innerHTML = (th.grad ? `<div class="scene-grad" style="background:${th.grad}"></div>` : '') + (th.scene ? th.scene() : '');
    if (th.init) _cleanup = th.init(scene) || null;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', th.vars.bg || '#0f2204');
  };

  // Aktives Theme/Skin laden – nur wenn gekauft (Besitz-Liste aus dem Shop).
  // Vorschau per ?theme=<id> / ?skin=<id> funktioniert nur lokal beim Entwickeln.
  const dev = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  let own = {};
  try { own = JSON.parse(localStorage.getItem('hopfenkonto_owned') || '{}') || {}; } catch(e) {}
  const has = (kind, x) => x === 'standard' || (own[kind] || []).includes(x);
  let id = null, sk = null;
  try {
    const q = new URLSearchParams(location.search);
    id = (dev && q.get('theme')) || localStorage.getItem('hopfenkonto_theme');
    sk = (dev && q.get('skin'))  || localStorage.getItem('hopfenkonto_slot_skin');
    if (!(dev && q.get('theme')) && !has('themes', id)) id = null;
    if (!(dev && q.get('skin'))  && !has('skins', sk))  sk = null;
  } catch(e) {}
  if (id && T[id]) window.applyTheme(id);
  // Das Slots-Fenster steht im HTML hinter den Skripten -> erst nach dem Laden anwenden
  if (sk) document.addEventListener('DOMContentLoaded', () => window.applySlotSkin(sk));
})();

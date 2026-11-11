// Szenen für die Fest- und Jahreszeiten-Themes (Schützenfest, Karneval, Sommer-Biergarten).
// Wird VOR js/themes.js geladen; der Theme-Katalog dort holt sich Szene und Animation aus window.THEME_SCENES.
// Feinschliff (Animationen, Karten-Optik) in css/themes.css, Abschnitt "Fest-Themes".
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const span = (el, cls, html, css) => { const s = document.createElement('span'); s.className = cls; s.innerHTML = html; s.style.cssText = css; el.appendChild(s); return s; };

  // Ziehende Wolken direkt im SVG, damit sie HINTER Vogelstange & Co. vorbeiziehen (und im Shop-Vorschaubild zu sehen sind)
  const CLOUD_PATH = `<path d="M14,44 Q0,44 2,33 Q4,23 16,25 Q16,9 34,9 Q46,9 51,19 Q58,4 76,7 Q94,10 93,26 Q108,22 114,33 Q118,44 104,44 Z" fill="#fff"/><path d="M14,44 Q4,43 4,36 Q30,40 60,38 Q90,40 114,36 Q114,44 104,44 Z" fill="#dbe9f6"/>`;
  function driftClouds(n, yMin, yMax) {
    let g = '';
    for (let i = 0; i < n; i++) {
      const y = yMin + (yMax - yMin) * ((i * 0.618) % 1), s = 0.55 + ((i * 0.37) % 0.6), dur = 70 + (i * 23 % 60);
      g += `<g class="sv-cloud" style="--dur:${dur}s;--delay:-${(dur * ((i * 0.43) % 1)).toFixed(0)}s" opacity="${(0.8 + (i % 3) * 0.06).toFixed(2)}"><g transform="translate(0,${y.toFixed(0)}) scale(${s.toFixed(2)})">${CLOUD_PATH}</g></g>`;
    }
    return g;
  }

  // ── Schützenfest ──────────────────────────────────────────────────────────
  // Vogel auf der Stange: geschnitzter Holzadler, sitzt hinten im grünen Kugelfang
  function vogel() {
    const wing = `<path d="M-5,-12 C-14,-26 -30,-34 -40,-27 L-35,-23 L-41,-18 L-35,-15 L-39,-9 L-32,-7 L-34,-1 L-26,-1 L-26,5 L-17,3 L-6,2 Z"/>`;
    const carve = `<path d="M-8,-9 Q-22,-21 -36,-23 M-8,-5 Q-21,-13 -34,-14 M-8,-1 Q-19,-5 -30,-5 M-9,2 Q-16,1 -24,2" fill="none"/>`;
    return `<g fill="url(#sfWood)" stroke="#6e3f17" stroke-width="0.9" stroke-linejoin="round">
        ${wing}<g transform="scale(-1,1)">${wing}</g>
        <path d="M-6,18 L-13,35 L-6,31 L-3,38 L0,32 L3,38 L6,31 L13,35 L6,18 Z"/>
        <ellipse cx="0" cy="4" rx="8.5" ry="17"/>
        <circle cx="0" cy="-17" r="5.5"/>
        <path d="M-4.6,-21 L-4,-27 L-1.6,-23.5 L0,-28 L1.6,-23.5 L4,-27 L4.6,-21 Z"/>
      </g>
      <g stroke="#7a4a1e" stroke-width="0.7" stroke-linecap="round" opacity="0.8">
        ${carve}<g transform="scale(-1,1)">${carve}</g>
        <path d="M-3,22 L-6,33 M0,22 L0,35 M3,22 L6,33 M-4,-4 l4,3 l4,-3 M-4,3 l4,3 l4,-3 M-4,10 l4,3 l4,-3" fill="none"/>
      </g>
      <ellipse cx="-3" cy="-2" rx="3" ry="9" fill="#fff3d6" opacity="0.25"/>
      <path d="M-5,-17 L-10,-15.5 L-5,-14.5 Z" fill="#a8692c" stroke="#6e3f17" stroke-width="0.5"/>
      <circle cx="-2" cy="-18" r="1" fill="#3a1f08"/>`;
  }
  function vogelstange(x, base, top) {
    // Gittermast (wie ein Kranausleger), unten breiter
    const wT = 16, wB = 30;
    let m = `<polygon points="${x - wB / 2},${base} ${x - wT / 2},${top} ${x + wT / 2},${top} ${x + wB / 2},${base}" fill="#c9cfc6" opacity="0.18"/>`;
    m += `<line x1="${x - wB / 2}" y1="${base}" x2="${x - wT / 2}" y2="${top}" stroke="#e4e8e2" stroke-width="3.2"/>
          <line x1="${x + wB / 2}" y1="${base}" x2="${x + wT / 2}" y2="${top}" stroke="#b9c0b6" stroke-width="3.2"/>`;
    const n = 14; let pts = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n, y = base + (top - base) * t, w = wB + (wT - wB) * t;
      pts += `${(x + (i % 2 ? w / 2 : -w / 2)).toFixed(1)},${y.toFixed(1)} `;
    }
    m += `<polyline points="${pts}" fill="none" stroke="#d8ddd5" stroke-width="1.4"/>`;
    // Betonsockel und Abspannseile
    m += `<rect x="${x - 24}" y="${base - 4}" width="48" height="10" rx="2" fill="#9b9b94"/>
          <line x1="${x}" y1="${top + 60}" x2="${x - 70}" y2="${base + 4}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.8"/>
          <line x1="${x}" y1="${top + 60}" x2="${x + 70}" y2="${base + 4}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.8"/>`;
    // Kugelfang: Öffnung O vorne, Rückwand B weiter hinten (von unten links gesehen → rechte und untere Innenwand sichtbar).
    // Reihenfolge: Innenwände, Rückwand, Vogel, zuletzt der Frontrahmen mit Loch → der Vogel sitzt IM Kasten.
    const bx = x - 44, by = top - 92, s = 88;
    const O = { l: bx + 9, t: by + 9, r: bx + s - 9, b: by + s - 9 }, B = { l: bx + 14, t: by + 12, r: bx + s - 22, b: by + s - 20 };
    const cx = (B.l + B.r) / 2, cy = (B.t + B.b) / 2;
    m += `<g transform="translate(${x},${top}) scale(1.25) translate(${-x},${-top})"><g class="sf-box">
        <polygon points="${bx - 16},${by + 8} ${bx},${by} ${bx},${by + s} ${bx - 16},${by + s - 10}" fill="#7fb07a"/>
        <rect x="${O.l}" y="${O.t}" width="${O.r - O.l}" height="${O.b - O.t}" fill="#e9e5d8"/>
        <polygon points="${O.r},${O.t} ${O.r},${O.b} ${B.r},${B.b} ${B.r},${B.t}" fill="#c9a77a"/>
        <polygon points="${O.l},${O.b} ${O.r},${O.b} ${B.r},${B.b} ${B.l},${B.b}" fill="#b08d60"/>
        <rect x="${B.l}" y="${B.t}" width="${B.r - B.l}" height="${B.b - B.t}" fill="#f3f1e8"/>
        ${[[3, 6], [44, 4], [8, 50], [40, 52], [24, 3], [48, 30], [2, 30]].map(([dx, dy]) => `<circle cx="${B.l + dx}" cy="${B.t + dy}" r="1" fill="#6b5a44" opacity="0.7"/>`).join('')}
        <g transform="translate(${cx + 2.5},${cy + 2.5}) scale(0.6)" opacity="0.22"><g fill="#2a1a08">${vogel().replace(/fill="[^"]*"/g, '')}</g></g>
        <g transform="translate(${cx},${cy}) scale(0.6)">${vogel()}</g>
        <path fill-rule="evenodd" d="M${bx},${by} h${s} v${s} h${-s} Z M${O.l},${O.t} V${O.b} H${O.r} V${O.t} Z" fill="#0f5a2c"/>
        <path d="M${bx},${by} h${s} v${s} h${-s} Z" fill="none" stroke="#0a4220" stroke-width="1"/>
        <circle cx="${bx - 6}" cy="${by - 2}" r="3.5" fill="none" stroke="#5b5b55" stroke-width="1.3"/>
      </g>`;
    // Fähnchen auf dem Kasten
    m += `<line x1="${bx + s - 6}" y1="${by}" x2="${bx + s - 6}" y2="${by - 26}" stroke="#555" stroke-width="1.2"/>
          <path class="sf-flag" d="M${bx + s - 6},${by - 26} q10,3 18,0 v10 q-8,3 -18,0 z" fill="#2e7d32"/>
          <path class="sf-flag" d="M${bx + s - 6},${by - 21} q10,3 18,0 v2.6 q-8,3 -18,0 z" fill="#fff"/></g>`;
    return m;
  }

  // Festbesucher: Schützen in Uniform (grüne Jacke, schwarze Hose/Schuhe, weißes Hemd, grüne Krawatte, grüner Hut mit Feder)
  // und normal gekleidete Gäste. Füße bei (0,0), etwa 50 Einheiten hoch.
  const SKIN = ['#f1c7a3', '#e0ac85', '#c98d64', '#f5d3b8', '#a8714d'];
  function person(x, y, sc, k, schuetze) {
    const skin = SKIN[k % SKIN.length], beer = k % 3 === 1, flip = k % 2 ? -1 : 1;
    const glass = `<rect x="8.2" y="-43" width="3.2" height="5.4" rx="0.6" fill="#f2b43a" stroke="#fff" stroke-width="0.4"/><rect x="8.2" y="-44" width="3.2" height="1.6" rx="0.6" fill="#fffaf0"/>`;
    let g;
    if (schuetze) {
      const J = '#2e5e2b';
      g = `<ellipse cx="-2.6" cy="-0.8" rx="2.7" ry="1.3" fill="#111"/><ellipse cx="2.6" cy="-0.8" rx="2.7" ry="1.3" fill="#111"/>
        <rect x="-4" y="-17" width="3.5" height="16.5" fill="#1c1c1c"/><rect x="0.5" y="-17" width="3.5" height="16.5" fill="#1c1c1c"/>
        <path d="M-6,-31 Q0,-33 6,-31 L5.8,-14 L-5.8,-14 Z" fill="${J}"/>
        <path d="M0,-25 V-14" stroke="#1d3f1b" stroke-width="0.6"/>
        <path d="M-2.5,-31.6 L2.5,-31.6 L0,-24.8 Z" fill="#fff"/>
        <path d="M-0.8,-31 L0.8,-31 L1.1,-26.4 L0,-25 L-1.1,-26.4 Z" fill="#163f19"/>
        <circle cx="1.8" cy="-21" r="0.55" fill="#e6c45a"/><circle cx="1.8" cy="-17.5" r="0.55" fill="#e6c45a"/>
        <path d="M-6,-30 L-7.8,-17.5" stroke="${J}" stroke-width="3" stroke-linecap="round"/><circle cx="-7.9" cy="-16.6" r="1.3" fill="${skin}"/>
        ${beer ? `<path d="M6,-30 L9.3,-36.5" stroke="${J}" stroke-width="3" stroke-linecap="round"/><circle cx="9.6" cy="-37.4" r="1.3" fill="${skin}"/>${glass}`
               : `<path d="M6,-30 L7.8,-17.5" stroke="${J}" stroke-width="3" stroke-linecap="round"/><circle cx="7.9" cy="-16.6" r="1.3" fill="${skin}"/>`}
        <rect x="-1.3" y="-33.5" width="2.6" height="2.5" fill="${skin}"/>
        <circle cx="0" cy="-35.8" r="3.9" fill="${skin}"/>
        <path d="M2.6,-40.6 Q7.4,-45 6,-51.5 Q4.4,-46 1.8,-41.6 Z" fill="#f4f4ec" stroke="#b8b8aa" stroke-width="0.3"/>
        <ellipse cx="0" cy="-38.9" rx="5.8" ry="1.35" fill="#24521f"/>
        <path d="M-3.5,-39 Q-3.7,-44 0,-44.2 Q3.7,-44 3.5,-39 Z" fill="#2e6a28"/><rect x="-3.5" y="-40.4" width="7" height="1" fill="#173a14"/>`;
    } else {
      const shirt = ['#e53935', '#1e88e5', '#fdd835', '#8e24aa', '#ffffff', '#fb8c00', '#00897b'][k % 7];
      const pants = ['#2f4f8a', '#3a3a3a', '#c8b48a', '#2f4f8a'][k % 4];
      const hair = ['#3a2412', '#d9b26a', '#1a1a1a', '#8a4b22', '#bdbdbd'][k % 5];
      const dress = k % 4 === 2;
      g = `<ellipse cx="-2.6" cy="-0.8" rx="2.5" ry="1.2" fill="${k % 2 ? '#f5f5f5' : '#4a3020'}"/><ellipse cx="2.6" cy="-0.8" rx="2.5" ry="1.2" fill="${k % 2 ? '#f5f5f5' : '#4a3020'}"/>
        ${dress ? `<rect x="-3.6" y="-12" width="2.6" height="11.5" fill="${skin}"/><rect x="1" y="-12" width="2.6" height="11.5" fill="${skin}"/><path d="M-5,-25 L5,-25 L7.5,-11 L-7.5,-11 Z" fill="${shirt}"/>`
                : `<rect x="-4" y="-17" width="3.5" height="16.5" fill="${pants}"/><rect x="0.5" y="-17" width="3.5" height="16.5" fill="${pants}"/>`}
        <path d="M-5.6,-31 Q0,-32.6 5.6,-31 L5.4,${dress ? -22 : -15} L-5.4,${dress ? -22 : -15} Z" fill="${shirt}" stroke="rgba(0,0,0,0.12)" stroke-width="0.4"/>
        <path d="M-5.6,-30 L-7.2,-24" stroke="${shirt}" stroke-width="3" stroke-linecap="round"/><path d="M-7.2,-24 L-7.8,-17.5" stroke="${skin}" stroke-width="2.2" stroke-linecap="round"/>
        ${beer ? `<path d="M5.6,-30 L8.5,-34" stroke="${shirt}" stroke-width="3" stroke-linecap="round"/><path d="M8.5,-34 L9.4,-36.8" stroke="${skin}" stroke-width="2.2" stroke-linecap="round"/>${glass}`
               : `<path d="M5.6,-30 L7.2,-24" stroke="${shirt}" stroke-width="3" stroke-linecap="round"/><path d="M7.2,-24 L7.8,-17.5" stroke="${skin}" stroke-width="2.2" stroke-linecap="round"/>`}
        <rect x="-1.3" y="-33.5" width="2.6" height="2.5" fill="${skin}"/>
        <circle cx="0" cy="-35.8" r="3.9" fill="${skin}"/>
        ${dress ? `<path d="M-4.4,-35 Q-5,-41 0,-40.6 Q5,-41 4.4,-35 L4.6,-29 L3.2,-31 L3.4,-36 Q0,-38 -3.4,-36 L-3.2,-31 L-4.6,-29 Z" fill="${hair}"/>`
                : `<path d="M-4,-36 Q-4.4,-40.6 0,-40.4 Q4.4,-40.6 4,-36 Q0,-38.6 -4,-36 Z" fill="${hair}"/>`}`;
    }
    return `<g transform="translate(${x},${y}) scale(${(sc * flip).toFixed(2)},${sc.toFixed(2)})">
      <ellipse cx="0" cy="0" rx="7" ry="1.6" fill="#0b3d12" opacity="0.25"/>${g}</g>`;
  }
  function festbesucher() {
    // [x, y, Schütze?] – grob in Grüppchen: vorm Zelt, Schlange am Wurstwagen, unter der Vogelstange, vorne auf der Wiese
    const P = [[52, 556, 1], [78, 562, 0], [104, 552, 1], [134, 566, 1], [176, 560, 1], [198, 572, 0],
      [158, 604, 1], [186, 616, 1], [214, 600, 0], [230, 636, 1], [252, 646, 1], [270, 632, 1], [334, 652, 1], [356, 640, 0], [378, 660, 1],
      [160, 680, 1], [196, 668, 1], [242, 700, 1], [284, 712, 0], [322, 718, 1], [356, 728, 1], [388, 712, 1],
      [26, 700, 0], [50, 706, 1], [74, 698, 1], [98, 712, 0], [122, 704, 1],
      [136, 748, 0], [174, 734, 1], [214, 760, 0], [30, 792, 1], [72, 800, 0], [150, 776, 1], [188, 796, 1], [262, 790, 1], [304, 800, 1], [344, 786, 0], [384, 798, 1]];
    return P.sort((a, b) => a[1] - b[1]).map(([x, y, sch], i) => person(x, y, 0.55 + (y - 540) / 260 * 0.85, i * 7 + x, !!sch)).join('');
  }
  function wurstwagen(x, y, sc = 1) {
    let awn = '';
    for (let i = 0; i < 10; i++) awn += `<rect x="${16 + i * 11.8}" y="20" width="11.8" height="11" fill="${i % 2 ? '#fff' : '#d32f2f'}"/>
      <path d="M${16 + i * 11.8},31 a5.9,5.9 0 0 0 11.8,0 z" fill="${i % 2 ? '#fff' : '#d32f2f'}"/>`;
    let wurst = '';
    for (let i = 0; i < 5; i++) wurst += `<rect x="${40 + i * 13}" y="46" width="11" height="4" rx="2" fill="#a0521d"/><line x1="${42 + i * 13}" y1="47" x2="${49 + i * 13}" y2="47" stroke="#6b2f0c" stroke-width="0.6"/>`;
    return `<g transform="translate(${x},${y}) scale(${sc})">
      <ellipse cx="78" cy="96" rx="82" ry="6" fill="#0b3d12" opacity="0.35"/>
      <line x1="148" y1="74" x2="176" y2="86" stroke="#3a3a3a" stroke-width="3"/>
      <rect x="2" y="12" width="146" height="70" rx="6" fill="#d32f2f"/>
      <rect x="2" y="12" width="146" height="70" rx="6" fill="url(#sfCarShade)"/>
      <rect x="2" y="62" width="146" height="8" fill="#fff"/><rect x="2" y="73" width="146" height="3" fill="#fff"/>
      <rect x="0" y="7" width="150" height="7" rx="3" fill="#f2f2f2"/>
      <rect x="20" y="28" width="110" height="26" fill="#ffe4ad"/>
      <rect x="20" y="28" width="110" height="9" fill="#e9c27e" opacity="0.6"/>
      <rect x="34" y="50" width="76" height="2" fill="#555"/>${wurst}
      ${awn}
      <rect x="14" y="54" width="122" height="6" rx="1" fill="#8d5a2b"/>
      <rect x="118" y="45" width="4" height="9" rx="1" fill="#d32f2f"/><rect x="124" y="46" width="4" height="8" rx="1" fill="#f2c200"/>
      <rect x="22" y="-14" width="106" height="20" rx="4" fill="#fff" stroke="#c62828" stroke-width="2"/>
      <text x="75" y="1" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="12.5" fill="#c62828" letter-spacing="0.5">BRATWURST</text>
      <rect x="136" y="-6" width="7" height="14" fill="#7a7a7a"/>
      <circle class="smoke" cx="140" cy="-12" r="5" fill="#fff" opacity="0.6"/>
      <circle class="smoke" style="animation-delay:-2s" cx="140" cy="-12" r="4" fill="#fff" opacity="0.6"/>
      <circle cx="34" cy="84" r="10" fill="#222"/><circle cx="34" cy="84" r="4" fill="#bbb"/>
      <circle cx="116" cy="84" r="10" fill="#222"/><circle cx="116" cy="84" r="4" fill="#bbb"/>
    </g>`;
  }
  function festzelt(x, y) {
    let s = '';
    for (let i = 0; i < 3; i++) {
      const px = x + i * 52;
      s += `<polygon points="${px},${y} ${px + 26},${y - 26} ${px + 52},${y}" fill="#f7f7f2" stroke="#d9d9d0" stroke-width="0.8"/>
            <line x1="${px + 26}" y1="${y - 26}" x2="${px + 26}" y2="${y - 40}" stroke="#777" stroke-width="1"/>
            <path class="sf-flag" d="M${px + 26},${y - 40} h11 l-3,4 l3,4 h-11 z" fill="${['#2e7d32', '#d32f2f', '#2e7d32'][i]}"/>`;
    }
    for (let i = 0; i < 13; i++) s += `<rect x="${x + i * 12}" y="${y}" width="12" height="42" fill="${i % 2 ? '#2e7d32' : '#f7f7f2'}"/>`;
    s += `<rect x="${x + 64}" y="${y + 14}" width="28" height="28" fill="#3b2a16"/><rect x="${x + 64}" y="${y + 14}" width="28" height="28" fill="#ffcf75" opacity="0.35"/>`;
    return s;
  }
  function wimpel(x1, y1, x2, y2, sag, n) {
    let f = `<path d="M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2 + sag * 2} ${x2},${y2}" stroke="#eee" stroke-width="0.9" fill="none"/>`;
    const cols = ['#2e7d32', '#ffffff', '#d32f2f', '#f2c200'];
    for (let i = 1; i < n; i++) {
      const t = i / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t + sag * 4 * t * (1 - t);
      f += `<polygon points="${(x - 5).toFixed(1)},${y.toFixed(1)} ${(x + 5).toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${(y + 12).toFixed(1)}" fill="${cols[i % 4]}"/>`;
    }
    return `<g class="sway">${f}</g>`;
  }
  function schuetzenfestScene() {
    let trees = '';
    for (let i = 0; i < 16; i++) { const x = i * 27 - 8, r = 16 + (i * 7 % 9); trees += `<circle cx="${x}" cy="${524 - r * 0.5}" r="${r}" fill="${i % 3 ? '#4f8c3a' : '#3f7a30'}"/>`; }
    // Wiese beginnt schon bei 520: der Bierpegel steigt von unten und soll Leute & Wurstwagen nicht sofort verdecken
    return `<svg class="scene-svg" viewBox="0 0 400 860" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8fd9"/><stop offset="0.45" stop-color="#7dbef0"/><stop offset="0.6" stop-color="#cfe9fb"/></linearGradient>
        <radialGradient id="sfSun"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.3" stop-color="#fff2a8" stop-opacity="0.75"/><stop offset="1" stop-color="#ffe68a" stop-opacity="0"/></radialGradient>
        <linearGradient id="sfGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc24f"/><stop offset="1" stop-color="#3f8a2a"/></linearGradient>
        <linearGradient id="sfCarShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.12"/><stop offset="0.4" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.15"/></linearGradient>
        <pattern id="sfWood" width="16" height="7" patternUnits="userSpaceOnUse">
          <rect width="16" height="7" fill="#d9a465"/>
          <path d="M0,1.6 Q4,0.6 8,1.8 T16,1.6 M0,4.6 Q5,3.6 9,4.8 T16,4.4" fill="none" stroke="#b77d40" stroke-width="0.7" opacity="0.75"/>
          <path d="M3,6.2 Q7,5.6 11,6.4" fill="none" stroke="#e9bf86" stroke-width="0.6"/></pattern>
        <pattern id="sfMow" width="40" height="860" patternUnits="userSpaceOnUse"><rect width="20" height="860" fill="#fff" opacity="0.05"/></pattern>
      </defs>
      <rect width="400" height="860" fill="url(#sfSky)"/>
      <g class="sf-sun"><circle cx="70" cy="110" r="95" fill="url(#sfSun)"/></g><circle cx="70" cy="110" r="24" fill="#fffbe6"/>
      ${driftClouds(7, 30, 420)}
      ${trees}
      ${festzelt(20, 482)}
      <rect y="520" width="400" height="340" fill="url(#sfGrass)"/><rect y="520" width="400" height="340" fill="url(#sfMow)"/>
      ${wimpel(176, 462, 300, 400, 18, 12)}
      ${vogelstange(300, 690, 196)}
      ${wurstwagen(8, 584, 0.85)}
      ${festbesucher()}
    </svg>`;
  }
  function schuetzenfestInit(el) {
    const bird = `<svg viewBox="0 0 20 8"><path d="M0,2 Q5,-1 10,5 Q15,-1 20,2" fill="none" stroke="#2b3a4a" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    for (let i = 0; i < 3; i++)
      span(el, 'sky-bird', bird, `top:${rnd(8, 30).toFixed(0)}%;--dur:${rnd(26, 40).toFixed(0)}s;--delay:-${rnd(0, 40).toFixed(0)}s`);
  }

  // ── Karneval ──────────────────────────────────────────────────────────────
  function karnevalScene() {
    const cols = ['#ff3b5c', '#ffd23f', '#2ec4b6', '#7b5cff', '#ff8a2b', '#3bd16f'];
    let streamers = '';
    for (let i = 0; i < 11; i++) {
      const x = 10 + i * 38, len = 120 + (i * 53 % 140);
      let d = `M${x},-5`;
      for (let y = 0; y < len; y += 24) d += ` q${i % 2 ? 14 : -14},12 0,24`;
      streamers += `<path class="sway${i % 2 ? ' s2' : ''}" d="${d}" stroke="${cols[i % cols.length]}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    const balloon = (x, y, c, s) => `<g transform="translate(${x},${y}) scale(${s})"><g class="kv-balloon" style="animation-delay:-${(x % 7) * 0.6}s">
      <path d="M0,30 q-6,22 4,44" stroke="#fff" stroke-opacity="0.6" stroke-width="1" fill="none"/>
      <ellipse cx="0" cy="0" rx="22" ry="27" fill="${c}"/><path d="M-4,26 h8 l-4,6 z" fill="${c}"/>
      <ellipse cx="-8" cy="-10" rx="5" ry="8" fill="#fff" opacity="0.35"/></g></g>`;
    return `<svg class="scene-svg" viewBox="0 0 400 860" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kvBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b0b4a"/><stop offset="0.55" stop-color="#4a1470"/><stop offset="1" stop-color="#8a1f6a"/></linearGradient>
        <radialGradient id="kvSpot" cx="0.5" cy="0.62" r="0.5"><stop offset="0" stop-color="#ffd8f0" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="400" height="860" fill="url(#kvBg)"/><rect width="400" height="860" fill="url(#kvSpot)"/>
      ${streamers}
      <text class="kv-helau" x="200" y="470" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="64" fill="#ffd23f" stroke="#7a2a00" stroke-width="1.5">Helau!</text>
      ${balloon(50, 640, '#ff3b5c', 1)}${balloon(95, 690, '#ffd23f', 0.8)}${balloon(330, 630, '#2ec4b6', 1.1)}${balloon(370, 700, '#7b5cff', 0.85)}${balloon(290, 710, '#ff8a2b', 0.7)}
      <g transform="translate(200,800)">
        <path d="M-60,0 Q-70,-50 -110,-62 Q-60,-70 -22,-20 Z" fill="#d81b60"/><path d="M60,0 Q70,-50 110,-62 Q60,-70 22,-20 Z" fill="#ffd23f"/>
        <path d="M-26,0 Q0,-90 26,0 Z" fill="#2ec4b6"/>
        <circle cx="-110" cy="-62" r="8" fill="#ffd23f"/><circle cx="110" cy="-62" r="8" fill="#d81b60"/><circle cx="0" cy="-74" r="8" fill="#ff8a2b"/>
        <rect x="-66" y="-4" width="132" height="16" rx="6" fill="#fff"/><path d="M-66,4 h132" stroke="#d81b60" stroke-width="3" stroke-dasharray="10 8"/>
      </g>
    </svg>`;
  }
  function karnevalInit(el) {
    const cols = ['#ff3b5c', '#ffd23f', '#2ec4b6', '#7b5cff', '#ff8a2b', '#3bd16f', '#ffffff'];
    for (let i = 0; i < 55; i++)
      span(el, 'confetti', '', `left:${rnd(0, 100).toFixed(1)}%;background:${cols[i % cols.length]};--w:${rnd(5, 9).toFixed(0)}px;--h:${rnd(8, 14).toFixed(0)}px;--dur:${rnd(6, 12).toFixed(1)}s;--delay:-${rnd(0, 12).toFixed(1)}s;--sway:${rnd(15, 45).toFixed(0)}px${i % 4 ? '' : ';border-radius:50%'}`);
  }

  // ── Sommer-Biergarten ─────────────────────────────────────────────────────
  function biergartenScene() {
    const canopy = (cx, cy, r) => {
      let g = '';
      for (let i = 0; i < 22; i++) { const a = i * 2.39, d = r * Math.sqrt(i / 22); g += `<circle cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d * 0.7).toFixed(1)}" r="${(r * 0.38).toFixed(1)}" fill="${i % 3 ? '#2f5d22' : '#3b6f2a'}"/>`; }
      // Kastanienblüten ("Kerzen")
      for (let i = 0; i < 12; i++) { const a = i * 1.9, d = r * 0.85; g += `<path d="M${(cx + Math.cos(a) * d).toFixed(1)},${(cy + Math.sin(a) * d * 0.7 + 8).toFixed(1)} l-3,0 l3,-11 l3,11 z" fill="#fff6e8" opacity="0.9"/>`; }
      return g;
    };
    let lights = `<path d="M40,200 Q200,290 360,200" stroke="#2a1c10" stroke-width="1.3" fill="none"/>`;
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, x = 40 + 320 * t, y = 200 + 2 * 45 * t * (1 - t) + 5;
      lights += `<circle class="bulb" style="animation-delay:${(i * 0.41 % 2.2).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="url(#bgGlow)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="#fff4c2"/>`;
    }
    const table = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">
      <rect x="-70" y="-8" width="140" height="9" rx="2" fill="#8a5a2c"/><rect x="-70" y="-8" width="140" height="3" fill="#a8743e"/>
      <path d="M-56,1 l-10,34 M-44,1 l10,34 M56,1 l-10,34 M44,1 l10,34" stroke="#5a3a1a" stroke-width="3"/>
      <rect x="-76" y="16" width="38" height="5" rx="1" fill="#7a4e24"/><rect x="38" y="16" width="38" height="5" rx="1" fill="#7a4e24"/>
      ${[-40, -6, 30].map(mx => `<g transform="translate(${mx},-30)"><rect x="0" y="0" width="16" height="22" rx="2" fill="#f2b43a" opacity="0.92"/>
        <rect x="0" y="-5" width="16" height="7" rx="3" fill="#fffaf0"/><path d="M16,5 h4 q3,0 3,4 v4 q0,4 -3,4 h-4" stroke="#e8e0cc" stroke-width="2" fill="none"/></g>`).join('')}
      <path d="M-62,-14 q4,-8 8,0 q4,-8 8,0" stroke="#b5712c" stroke-width="3" fill="none"/></g>`;
    return `<svg class="scene-svg" viewBox="0 0 400 860" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f6fb0"/><stop offset="0.45" stop-color="#e8a76a"/><stop offset="0.72" stop-color="#ffcf7a"/></linearGradient>
        <radialGradient id="bgGlow"><stop offset="0" stop-color="#ffe9a0" stop-opacity="0.95"/><stop offset="1" stop-color="#ffb030" stop-opacity="0"/></radialGradient>
        <radialGradient id="bgSun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff2c0"/><stop offset="0.4" stop-color="#ffc870" stop-opacity="0.6"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
        <linearGradient id="bgKiesShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a10" stop-opacity="0.25"/><stop offset="0.3" stop-color="#5a3a10" stop-opacity="0"/></linearGradient>
        <pattern id="bgKies" width="9" height="7" patternUnits="userSpaceOnUse"><rect width="9" height="7" fill="#d9c08f"/><circle cx="2" cy="2" r="1" fill="#b89d6a"/><circle cx="6.5" cy="5" r="1.2" fill="#c9b07c"/></pattern>
      </defs>
      <rect width="400" height="860" fill="url(#bgSky)"/>
      <circle cx="200" cy="470" r="150" fill="url(#bgSun)"/>
      <path d="M0,500 Q100,470 200,490 T400,480 V860 H0 Z" fill="#6b7f3a"/>
      <rect x="40" y="150" width="14" height="400" fill="#4a2f1a"/><rect x="346" y="150" width="14" height="400" fill="#4a2f1a"/>
      ${canopy(40, 90, 120)}${canopy(360, 100, 120)}
      ${lights}
      <rect y="540" width="400" height="320" fill="url(#bgKies)"/>
      <rect y="540" width="400" height="320" fill="url(#bgKiesShade)"/>
      ${table(110, 585, 0.9)}${table(300, 610, 1)}${gaeste()}${table(120, 690, 1.2)}${table(310, 740, 1.3)}${table(90, 810, 1.45)}
    </svg>`;
  }
  // ein paar Gäste, die mit dem Krug in der Hand zwischen den Tischen stehen
  function gaeste() {
    return [[200, 600], [228, 612], [52, 650], [380, 668], [214, 700]].map(([x, y], i) => person(x, y, 0.7 + (y - 560) / 300, i * 3 + 1, false)).join('');
  }
  function biergartenInit(el) {
    for (let i = 0; i < 14; i++)
      span(el, 'firefly', '', `left:${rnd(5, 95).toFixed(0)}%;top:${rnd(30, 85).toFixed(0)}%;--dur:${rnd(5, 9).toFixed(1)}s;--delay:-${rnd(0, 9).toFixed(1)}s;--dx:${rnd(-40, 40).toFixed(0)}px;--dy:${rnd(-40, 20).toFixed(0)}px`);
  }

  window.THEME_SCENES = {
    schuetzenfest: { scene: schuetzenfestScene, init: schuetzenfestInit },
    karneval:      { scene: karnevalScene,      init: karnevalInit },
    biergarten:    { scene: biergartenScene,    init: biergartenInit },
  };
})();

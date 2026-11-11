// Szenen für die Fest- und Jahreszeiten-Themes (Schützenfest, Karneval, Frühlingswiese, Sommer-Biergarten).
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
  // Vogel auf der Stange: Holzadler mit Schuppenmuster und roter Krone, im grünen Kugelfang
  function vogel() {
    const wing = `<path d="M-5,-12 C-14,-26 -30,-34 -40,-27 L-35,-23 L-41,-18 L-35,-15 L-39,-9 L-32,-7 L-34,-1 L-26,-1 L-26,5 L-17,3 L-6,2 Z"/>`;
    return `<g fill="url(#sfScale)" stroke="#2b2b2b" stroke-width="0.7" stroke-linejoin="round">
        ${wing}<g transform="scale(-1,1)">${wing}</g>
        <path d="M-6,18 L-13,35 L-6,31 L-3,38 L0,32 L3,38 L6,31 L13,35 L6,18 Z"/>
        <ellipse cx="0" cy="4" rx="8.5" ry="17"/>
        <circle cx="0" cy="-17" r="5.5"/>
      </g>
      <path d="M-5,-17 L-10,-15.5 L-5,-14.5 Z" fill="#e8a317" stroke="#2b2b2b" stroke-width="0.5"/>
      <path d="M-4.5,-21 L-4,-27 L-1.6,-23.5 L0,-28 L1.6,-23.5 L4,-27 L4.5,-21 Z" fill="#d6262b" stroke="#7a0f12" stroke-width="0.5"/>
      <circle cx="-2" cy="-18" r="0.9" fill="#111"/>`;
  }
  function vogelstange(x, base, top) {
    // Gittermast (wie ein Kranausleger), unten breiter
    const wT = 16, wB = 30;
    let m = `<polygon points="${x - wB / 2},${base} ${x - wT / 2},${top} ${x + wT / 2},${top} ${x + wB / 2},${base}" fill="#c9cfc6" opacity="0.18"/>`;
    m += `<line x1="${x - wB / 2}" y1="${base}" x2="${x - wT / 2}" y2="${top}" stroke="#e4e8e2" stroke-width="3.2"/>
          <line x1="${x + wB / 2}" y1="${base}" x2="${x + wT / 2}" y2="${top}" stroke="#b9c0b6" stroke-width="3.2"/>`;
    const n = 16; let pts = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n, y = base + (top - base) * t, w = wB + (wT - wB) * t;
      pts += `${(x + (i % 2 ? w / 2 : -w / 2)).toFixed(1)},${y.toFixed(1)} `;
    }
    m += `<polyline points="${pts}" fill="none" stroke="#d8ddd5" stroke-width="1.4"/>`;
    // Betonsockel und Abspannseile
    m += `<rect x="${x - 24}" y="${base - 4}" width="48" height="10" rx="2" fill="#9b9b94"/>
          <line x1="${x}" y1="${top + 60}" x2="${x - 70}" y2="${base + 4}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.8"/>
          <line x1="${x}" y1="${top + 60}" x2="${x + 70}" y2="${base + 4}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.8"/>`;
    // Kugelfang: grüner Kasten, Seitenwand hell, Rahmen dunkel, weiße Rückwand mit Einschüssen
    const bx = x - 44, by = top - 92, s = 88;
    m += `<g transform="translate(${x},${top}) scale(1.25) translate(${-x},${-top})"><g class="sf-box">
        <polygon points="${bx - 16},${by + 8} ${bx},${by} ${bx},${by + s} ${bx - 16},${by + s - 10}" fill="#7fb07a"/>
        <polygon points="${bx - 16},${by + 8} ${bx},${by} ${bx + s},${by} ${bx + s - 14},${by + 8}" fill="#5f9a5a"/>
        <rect x="${bx}" y="${by}" width="${s}" height="${s}" fill="#0f5a2c"/>
        <rect x="${bx + 9}" y="${by + 9}" width="${s - 18}" height="${s - 18}" fill="#f3f1e8"/>
        <polygon points="${bx + s - 9},${by + 9} ${bx + s - 9},${by + s - 9} ${bx + s - 20},${by + s - 15} ${bx + s - 20},${by + 15}" fill="#c9a77a"/>
        ${[[14, 20], [60, 16], [22, 66], [56, 70], [40, 24], [66, 44], [18, 44]].map(([dx, dy]) => `<circle cx="${bx + dx}" cy="${by + dy}" r="1.1" fill="#6b5a44" opacity="0.7"/>`).join('')}
        <circle cx="${bx - 6}" cy="${by - 2}" r="3.5" fill="none" stroke="#5b5b55" stroke-width="1.3"/>
        <g transform="translate(${bx + s / 2 - 5},${by + s / 2 + 2}) scale(0.92)">${vogel()}</g>
      </g>`;
    // Fähnchen auf dem Kasten
    m += `<line x1="${bx + s - 6}" y1="${by}" x2="${bx + s - 6}" y2="${by - 26}" stroke="#555" stroke-width="1.2"/>
          <path class="sf-flag" d="M${bx + s - 6},${by - 26} q10,3 18,0 v10 q-8,3 -18,0 z" fill="#2e7d32"/>
          <path class="sf-flag" d="M${bx + s - 6},${by - 21} q10,3 18,0 v2.6 q-8,3 -18,0 z" fill="#fff"/></g>`;
    return m;
  }
  function wurstwagen(x, y) {
    let awn = '';
    for (let i = 0; i < 10; i++) awn += `<rect x="${16 + i * 11.8}" y="20" width="11.8" height="11" fill="${i % 2 ? '#fff' : '#d32f2f'}"/>
      <path d="M${16 + i * 11.8},31 a5.9,5.9 0 0 0 11.8,0 z" fill="${i % 2 ? '#fff' : '#d32f2f'}"/>`;
    let wurst = '';
    for (let i = 0; i < 5; i++) wurst += `<rect x="${40 + i * 13}" y="46" width="11" height="4" rx="2" fill="#a0521d"/><line x1="${42 + i * 13}" y1="47" x2="${49 + i * 13}" y2="47" stroke="#6b2f0c" stroke-width="0.6"/>`;
    return `<g transform="translate(${x},${y})">
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
    for (let i = 0; i < 16; i++) { const x = i * 27 - 8, r = 16 + (i * 7 % 9); trees += `<circle cx="${x}" cy="${652 - r * 0.5}" r="${r}" fill="${i % 3 ? '#4f8c3a' : '#3f7a30'}"/>`; }
    return `<svg class="scene-svg" viewBox="0 0 400 860" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8fd9"/><stop offset="0.5" stop-color="#7dbef0"/><stop offset="0.76" stop-color="#cfe9fb"/></linearGradient>
        <radialGradient id="sfSun"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.3" stop-color="#fff2a8" stop-opacity="0.75"/><stop offset="1" stop-color="#ffe68a" stop-opacity="0"/></radialGradient>
        <linearGradient id="sfGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc24f"/><stop offset="1" stop-color="#3f8a2a"/></linearGradient>
        <linearGradient id="sfCarShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.12"/><stop offset="0.4" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.15"/></linearGradient>
        <pattern id="sfScale" width="7" height="6" patternUnits="userSpaceOnUse">
          <rect width="7" height="6" fill="#f6f5ef"/>
          <path d="M0.8,0.6 Q3.5,4.4 6.2,0.6 Q3.5,2.6 0.8,0.6 Z M-2.7,3.6 Q0,7.4 2.7,3.6 Q0,5.6 -2.7,3.6 Z M4.3,3.6 Q7,7.4 9.7,3.6 Q7,5.6 4.3,3.6 Z" fill="#262626"/></pattern>
        <pattern id="sfMow" width="40" height="860" patternUnits="userSpaceOnUse"><rect width="20" height="860" fill="#fff" opacity="0.05"/></pattern>
      </defs>
      <rect width="400" height="860" fill="url(#sfSky)"/>
      <g class="sf-sun"><circle cx="70" cy="110" r="95" fill="url(#sfSun)"/></g><circle cx="70" cy="110" r="24" fill="#fffbe6"/>
      ${driftClouds(7, 30, 520)}
      ${trees}
      ${festzelt(20, 610)}
      <rect y="648" width="400" height="212" fill="url(#sfGrass)"/><rect y="648" width="400" height="212" fill="url(#sfMow)"/>
      ${wimpel(176, 590, 300, 520, 22, 12)}
      ${vogelstange(300, 760, 196)}
      ${wurstwagen(14, 724)}
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

  // ── Frühlingswiese ────────────────────────────────────────────────────────
  function fruehlingScene() {
    let flowers = '';
    const fl = (x, y, c, s) => `<g transform="translate(${x},${y}) scale(${s})"><line x1="0" y1="0" x2="0" y2="18" stroke="#3f8a2a" stroke-width="1.6"/>
      ${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-5" rx="3" ry="5" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="2.6" fill="#ffcc2a"/></g>`;
    const tulip = (x, y, c, s) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,0 v22" stroke="#3f8a2a" stroke-width="1.8"/><path d="M0,16 q-8,-4 -9,-12 q6,2 9,8" fill="#4f9a35"/>
      <path d="M-6,-10 q0,10 6,10 q6,0 6,-10 l-3,4 l-3,-6 l-3,6 z" fill="${c}"/></g>`;
    const cols = ['#ffffff', '#ffd1e3', '#fff3a8', '#d7c4ff'];
    for (let i = 0; i < 46; i++) {
      const x = (i * 83) % 400, y = 700 + (i * 37) % 150, s = 0.6 + (y - 700) / 220;
      flowers += i % 3 ? fl(x, y, cols[i % 4], s) : tulip(x, y, ['#ff4f6d', '#ffb02e', '#ff7ab0'][i % 3], s);
    }
    let blossom = '';
    for (let i = 0; i < 26; i++) blossom += `<circle cx="${300 + Math.cos(i * 2.4) * (20 + i * 2.2)}" cy="${470 + Math.sin(i * 2.4) * (14 + i * 1.6)}" r="${10 + (i * 5 % 9)}" fill="${i % 3 ? '#ffc8dd' : '#ffe1ec'}"/>`;
    return `<svg class="scene-svg" viewBox="0 0 400 860" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="frSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc4f5"/><stop offset="0.7" stop-color="#d4effc"/></linearGradient>
        <radialGradient id="frSun"><stop offset="0" stop-color="#fffbe0"/><stop offset="1" stop-color="#fff2a8" stop-opacity="0"/></radialGradient></defs>
      <rect width="400" height="860" fill="url(#frSky)"/>
      <circle cx="330" cy="110" r="80" fill="url(#frSun)"/><circle cx="330" cy="110" r="22" fill="#fffbe6"/>
      ${driftClouds(5, 40, 330)}
      <path d="M0,600 Q120,540 240,590 T400,570 V860 H0 Z" fill="#9fd66a"/>
      <rect x="294" y="470" width="12" height="150" fill="#7a5132"/><path d="M300,520 l-30,-30 M300,540 l26,-26" stroke="#7a5132" stroke-width="5"/>
      ${blossom}
      <path d="M0,650 Q140,610 260,660 T400,640 V860 H0 Z" fill="#7cc24f"/>
      <path d="M0,710 Q120,690 250,715 T400,705 V860 H0 Z" fill="#5fae3c"/>
      ${flowers}
    </svg>`;
  }
  function fruehlingInit(el) {
    const bee = `<svg viewBox="0 0 26 18"><ellipse class="bee-wing" cx="12" cy="4" rx="5" ry="4" fill="#e8f6ff" opacity="0.85"/><ellipse class="bee-wing" cx="16" cy="4" rx="4" ry="3.4" fill="#e8f6ff" opacity="0.75"/>
      <ellipse cx="13" cy="11" rx="9" ry="6" fill="#ffc72a"/><path d="M10,5.5 v11 M14.5,5 v12" stroke="#2a1c00" stroke-width="2.2"/>
      <circle cx="21" cy="10" r="3.6" fill="#2a1c00"/><circle cx="22.3" cy="9" r="0.9" fill="#fff"/><path d="M4,11 l-3,0" stroke="#2a1c00" stroke-width="1.2"/></svg>`;
    for (let i = 0; i < 5; i++)
      span(el, 'bee', bee, `top:${rnd(45, 85).toFixed(0)}%;--dur:${rnd(14, 22).toFixed(0)}s;--delay:-${rnd(0, 22).toFixed(0)}s;--amp:${rnd(18, 40).toFixed(0)}px`);
    const bfl = c => `<svg viewBox="0 0 20 16"><g class="bf-wings"><path d="M10,8 C4,-2 -1,3 3,9 C0,14 7,15 10,9" fill="${c}"/><path d="M10,8 C16,-2 21,3 17,9 C20,14 13,15 10,9" fill="${c}"/></g><rect x="9.3" y="4" width="1.4" height="9" rx="0.7" fill="#3a2a1a"/></svg>`;
    ['#ff8ac0', '#ffd23f', '#8ac8ff'].forEach(c =>
      span(el, 'butterfly', bfl(c), `top:${rnd(35, 70).toFixed(0)}%;--dur:${rnd(18, 28).toFixed(0)}s;--delay:-${rnd(0, 28).toFixed(0)}s;--amp:${rnd(30, 60).toFixed(0)}px`));
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
        <pattern id="bgKies" width="9" height="7" patternUnits="userSpaceOnUse"><rect width="9" height="7" fill="#d9c08f"/><circle cx="2" cy="2" r="1" fill="#b89d6a"/><circle cx="6.5" cy="5" r="1.2" fill="#c9b07c"/></pattern>
      </defs>
      <rect width="400" height="860" fill="url(#bgSky)"/>
      <circle cx="200" cy="600" r="150" fill="url(#bgSun)"/>
      <path d="M0,640 Q100,610 200,630 T400,620 V860 H0 Z" fill="#6b7f3a"/>
      <rect x="40" y="150" width="14" height="520" fill="#4a2f1a"/><rect x="346" y="150" width="14" height="520" fill="#4a2f1a"/>
      ${canopy(40, 90, 120)}${canopy(360, 100, 120)}
      ${lights}
      <rect y="680" width="400" height="180" fill="url(#bgKies)"/>
      ${table(120, 720, 0.85)}${table(300, 760, 1)}${table(90, 820, 1.15)}
    </svg>`;
  }
  function biergartenInit(el) {
    for (let i = 0; i < 14; i++)
      span(el, 'firefly', '', `left:${rnd(5, 95).toFixed(0)}%;top:${rnd(30, 85).toFixed(0)}%;--dur:${rnd(5, 9).toFixed(1)}s;--delay:-${rnd(0, 9).toFixed(1)}s;--dx:${rnd(-40, 40).toFixed(0)}px;--dy:${rnd(-40, 20).toFixed(0)}px`);
  }

  window.THEME_SCENES = {
    schuetzenfest: { scene: schuetzenfestScene, init: schuetzenfestInit },
    karneval:      { scene: karnevalScene,      init: karnevalInit },
    fruehling:     { scene: fruehlingScene,     init: fruehlingInit },
    biergarten:    { scene: biergartenScene,    init: biergartenInit },
  };
})();

// Avatar-Baukasten: Schützenfigur aus frei kombinierbaren Teilen (Gesicht, Frisur, Bart, Augen, Mund, Brille, Hut).
// avatarSVG(cfg, groesse, rahmenFarben) → SVG. cfg = { haut, gesicht, frisur, haar, bart, augen, mund, brille, hut }
// Die Schützenjacke (dunkelgrün, Hemd, Krawatte, Eichenlaub, Schulterstücke) ist fest und nicht wählbar.
// Der Rahmen bekommt die Farbe der höchsten Medaille (js/profil.js). Alle Teile stehen allen offen.
// Neues Teil: in TEILE eintragen und an der passenden Stelle zeichnen (Koordinatenfeld 0–100, Kopfmitte ca. 50/48).
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function(root) {
  const HAUT = { h1: ['#FCE3CF', '#E9BFA2'], h2: ['#F1C9A5', '#D9A47C'], h3: ['#D9A066', '#B97C45'], h4: ['#A86B3C', '#84502A'], h5: ['#6E4426', '#51301A'] };
  const HAAR = { blond: ['#E8C56A', '#C49A3A'], braun: ['#7A4A22', '#55321A'], schwarz: ['#2A2320', '#141110'], rot: ['#B5522A', '#8A3A1A'], grau: ['#9A9A9A', '#707070'], weiss: ['#ECECEC', '#C4C4C4'] };

  const TEILE = {
    haut: Object.keys(HAUT),
    gesicht: ['rund', 'oval', 'kantig'],
    frisur: ['kurz', 'scheitel', 'flow', 'locken', 'glatze', 'bob', 'lang', 'wellig', 'zopf', 'dutt'],
    haar: Object.keys(HAAR),
    bart: ['ohne', 'stoppeln', 'schnauzer', 'kinnbart', 'vollbart'],
    augen: ['normal', 'wimpern', 'froh'],
    mund: ['laecheln', 'lippen', 'grinsen'],
    brille: ['ohne', 'rund', 'eckig', 'sonne'],
    hut: ['schuetzenhut', 'ohne'],
  };

  const GESICHT = {
    rund:   'M32,46 C32,29 68,29 68,46 C68,60 60,68 50,68 C40,68 32,60 32,46 Z',
    oval:   'M33.500,45 C33.500,29 66.500,29 66.500,45 C66.500,57 59,69 50,69 C41,69 33.500,57 33.500,45 Z',
    kantig: 'M32.500,43 C32.500,29 67.500,29 67.500,43 L66.500,56 C65.500,63 58,68 50,68 C42,68 34.500,63 33.500,56 Z',
  };

  let nr = 0;
  function avatarSVG(c, g, rahmen) {
    c = Object.assign({ haut: 'h2', gesicht: 'rund', frisur: 'kurz', haar: 'braun', bart: 'ohne', augen: 'normal', mund: 'laecheln', brille: 'ohne', hut: 'schuetzenhut' }, c);
    const id = 'av' + (++nr), [sk, skD] = HAUT[c.haut] || HAUT.h2, [hr, hrD] = HAAR[c.haar] || HAAR.braun;
    const R = rahmen || ['#5a7a3a', '#3B6D11', '#27500A'];
    let hinten = '', vorn = '';

    // ── Haare hinter dem Kopf ──
    if (c.frisur === 'lang')   hinten = `<path d="M29,46 C26,22 74,22 71,46 L74,80 C67,85 60,82 58,77 L42,77 C40,82 33,85 26,80 Z" fill="${hr}"/>`;
    if (c.frisur === 'wellig') hinten = `<path d="M29,46 C26,22 74,22 71,46 C76,54 70,58 74,66 C78,74 70,78 73,84 C64,88 60,82 58,77 L42,77 C40,82 36,88 27,84 C30,78 22,74 26,66 C30,58 24,54 29,46 Z" fill="${hr}"/>`;
    if (c.frisur === 'bob')    hinten = `<path d="M28.500,46 C26,22 74,22 71.500,46 L72,62 C70,68 63,68 62,62 L38,62 C37,68 30,68 28,62 Z" fill="${hr}"/>`;
    if (c.frisur === 'zopf')   hinten = `<path d="M64,30 C82,30 84,56 76,74 C74,78 69,77 70,72 C72,60 72,48 62,40 Z" fill="${hr}" stroke="${hrD}" stroke-width="0.800"/><rect x="66" y="33" width="6" height="3.500" rx="1.500" transform="rotate(35 69 35)" fill="#B3122E"/>`;
    if (c.frisur === 'flow')   hinten = `<path d="M31,46 C26,54 27,62 30.500,66 C33,62 34,55 34,48 Z" fill="${hr}"/><path d="M69,46 C74,54 73,62 69.500,66 C67,62 66,55 66,48 Z" fill="${hr}"/>`;
    if (c.frisur === 'dutt')   hinten = `<circle cx="50" cy="20.500" r="9" fill="${hr}" stroke="${hrD}" stroke-width="0.800"/>`;

    // ── Haare auf dem Kopf ──
    const kappe = 'M31.500,46 C28,24 72,24 68.500,46 C67,38 61,33 50,33 C39,33 33,38 31.500,46 Z';
    if (['kurz', 'zopf', 'dutt'].includes(c.frisur)) vorn = `<path d="${kappe}" fill="${hr}"/>`;
    if (c.frisur === 'scheitel') vorn = `<path d="M31.500,47 C27,23 73,22 68.500,47 C67,40 63,36 57,35 C49,39 38,38 31.500,47 Z" fill="${hr}"/><path d="M57,35 C52,30 44,28 38,30" fill="none" stroke="${hrD}" stroke-width="1" stroke-linecap="round"/>`;
    if (c.frisur === 'flow')     vorn = `<path d="M31.500,48 C27,34 31,21 45,19.500 C59,18 72,25 68.500,48 C68,42 65.500,38 61.500,36 C54,33.500 43,34 38,36.500 C34.500,39 32.500,43 31.500,48 Z" fill="${hr}"/>
      <path d="M39,36 C40,28 46,23 54,22.500 M46,34.500 C48,28 54,25 61,26 M54,34.500 C57,30 62,29.500 66,32" fill="none" stroke="${hrD}" stroke-width="1" stroke-linecap="round"/>`;
    if (c.frisur === 'locken')   vorn = [[35, 38, 6], [41, 31, 6.500], [50, 28.500, 7], [59, 31, 6.500], [65, 38, 6], [33, 45, 4.500], [67, 45, 4.500]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${hr}" stroke="${hrD}" stroke-width="0.600"/>`).join('');
    if (c.frisur === 'lang' || c.frisur === 'wellig') vorn = `<path d="M31,50 C27,24 73,24 69,50 C68,40 60,32 50,31.500 C40,32 32,40 31,50 Z" fill="${hr}"/><path d="M50,31.500 V27" stroke="${hrD}" stroke-width="1" stroke-linecap="round"/>`;
    if (c.frisur === 'bob')      vorn = `<path d="M31,48 C27,24 73,24 69,48 L68.500,41 C60,37 40,37 31.500,41 Z" fill="${hr}"/>`;

    // ── Kleidung ──
    const schulter = 'M14,102 C14,84 30,78 43,75.500 L57,75.500 C70,78 86,84 86,102 Z';
    // Schützenjacke (fest): dunkelgrün, weißes Hemd, grüne Krawatte, silbernes Eichenlaub am Revers, Schulterstücke
    const BLATT = 'M0,4.200 C-1,3.200 -3,3.400 -3.300,1.900 C-2.300,1.600 -2.700,0.500 -3.500,0 C-2.500,-0.500 -2.700,-1.700 -3.100,-2.300 C-1.900,-2.300 -1.900,-3.500 -1.700,-4.200 C-0.900,-3.800 -0.300,-4.500 0,-5.300 C0.300,-4.500 0.900,-3.800 1.700,-4.200 C1.900,-3.500 1.900,-2.300 3.100,-2.300 C2.700,-1.700 2.500,-0.500 3.500,0 C2.700,0.500 2.300,1.600 3.300,1.900 C3,3.400 1,3.200 0,4.200 Z';
    const blatt = (x, y, w) => `<g transform="translate(${x} ${y}) rotate(${w}) scale(0.72)"><path d="${BLATT}" fill="#E2E6EA" stroke="#868d95" stroke-width="0.500"/><path d="M0,6 V-4" stroke="#868d95" stroke-width="0.500"/></g>`;
    const jacke = `<path d="${schulter}" fill="#213D2D"/>
      <path d="M41.500,75 L50,93 L58.500,75 Z" fill="#FDFDFB"/>
      <path d="M47.300,81 h5.400 l1,3.200 -2,2.200 2.500,15.600 h-8.400 l2.500,-15.600 -2,-2.200 Z" fill="#2C4C3A" stroke="#1a3024" stroke-width="0.500"/>
      <path d="M41.500,75 L47.500,82.500 L44.200,87 L38.500,77.500 Z" fill="#fff" stroke="#cfcfc8" stroke-width="0.600"/><path d="M58.500,75 L52.500,82.500 L55.800,87 L61.500,77.500 Z" fill="#fff" stroke="#cfcfc8" stroke-width="0.600"/>
      <path d="M38.500,77.500 L46.500,102 L28,102 L31.500,90 L27.500,86.500 Z" fill="#182E21"/><path d="M61.500,77.500 L53.500,102 L72,102 L68.500,90 L72.500,86.500 Z" fill="#182E21"/>
      ${blatt(36.300, 85.500, -16)}${blatt(63.700, 85.500, 16)}
      <g transform="rotate(-16 23 84.500)"><rect x="15" y="81.800" width="16" height="5.600" rx="2.300" fill="#D5DADF" stroke="#8a9097" stroke-width="0.500"/><rect x="16.800" y="83.300" width="12.400" height="2.600" rx="1.300" fill="#213D2D"/></g>
      <g transform="rotate(16 77 84.500)"><rect x="69" y="81.800" width="16" height="5.600" rx="2.300" fill="#D5DADF" stroke="#8a9097" stroke-width="0.500"/><rect x="70.800" y="83.300" width="12.400" height="2.600" rx="1.300" fill="#213D2D"/></g>`;

    // ── Gesicht ──
    const augeY = 48.500;
    const auge = x => c.augen === 'froh'
      ? `<path d="M${x - 3.200},${augeY + 0.500} q3.200,-4 6.400,0" fill="none" stroke="#2a1c14" stroke-width="1.700" stroke-linecap="round"/>`
      : `<ellipse cx="${x}" cy="${augeY}" rx="2.300" ry="2.700" fill="#2a1c14"/><circle cx="${x + 0.800}" cy="${augeY - 0.900}" r="0.800" fill="#fff"/>` +
        (c.augen === 'wimpern' ? `<path d="M${x - 2.800},${augeY - 1.800} l-1.700,-1.500 M${x - 1.200},${augeY - 2.800} l-0.800,-2 M${x + 0.800},${augeY - 3} l0.300,-2.100" stroke="#2a1c14" stroke-width="0.900" stroke-linecap="round" transform="${x > 50 ? `translate(${2 * x} 0) scale(-1 1)` : ''}"/>` : '');
    const braue = (x, s) => `<path d="M${x - 3.800},${augeY - 6.300 + s} q3.800,-2.200 7.600,${-s * 2}" fill="none" stroke="${c.frisur === 'glatze' && c.bart === 'ohne' ? '#5a4030' : hrD}" stroke-width="${c.augen === 'wimpern' ? 1.200 : 1.600}" stroke-linecap="round"/>`;
    const MUND = {
      laecheln: `<path d="M44,59 q6,5 12,0" fill="none" stroke="#7a3b2e" stroke-width="1.700" stroke-linecap="round"/>`,
      lippen: `<path d="M44,59 q3,-2.200 6,-0.600 q3,-1.600 6,0.600 q-6,6 -12,0 Z" fill="#C9506A"/><path d="M44,59 q6,1.600 12,0" fill="none" stroke="#8c2f47" stroke-width="0.700"/>`,
      grinsen: `<path d="M43,58 h14 q-1,7.500 -7,7.500 q-6,0 -7,-7.500 Z" fill="#6a2a22"/><path d="M44.500,58 h11 v2.300 h-11 Z" fill="#fff"/>`,
    };
    const BART = {
      ohne: '',
      stoppeln: `<path d="M33,52 C34,64 42,69.500 50,69.500 C58,69.500 66,64 67,52 C63,58 57,56.500 50,56.500 C43,56.500 37,58 33,52 Z" fill="${hrD}" opacity="0.220"/>`,
      schnauzer: `<path d="M41.500,57 C45,52.500 49,54 50,55.500 C51,54 55,52.500 58.500,57 C55,57.500 52,57 50,56.500 C48,57 45,57.500 41.500,57 Z" fill="${hr}" stroke="${hrD}" stroke-width="0.500"/>`,
      kinnbart: `<path d="M45,63 C46,69.500 54,69.500 55,63 C52,64.500 48,64.500 45,63 Z" fill="${hr}" stroke="${hrD}" stroke-width="0.500"/>`,
      vollbart: `<path d="M32.300,48 C31.500,64 41,72.500 50,72.500 C59,72.500 68.500,64 67.700,48 C65,56 59,55 50,55 C41,55 35,56 32.300,48 Z" fill="${hr}" stroke="${hrD}" stroke-width="0.600"/><path d="M43,57.500 h14 q-1,6 -7,6 q-6,0 -7,-6 Z" fill="${sk}"/>`,
    };
    const BRILLE = {
      ohne: '',
      rund: `<g fill="rgba(255,255,255,0.18)" stroke="#2b2b2b" stroke-width="1.300"><circle cx="43" cy="${augeY}" r="5.200"/><circle cx="57" cy="${augeY}" r="5.200"/></g><path d="M48.200,${augeY} h3.600 M37.800,${augeY} l-5,-1.500 M62.200,${augeY} l5,-1.500" stroke="#2b2b2b" stroke-width="1.300"/>`,
      eckig: `<g fill="rgba(255,255,255,0.18)" stroke="#2b2b2b" stroke-width="1.400"><rect x="37.300" y="${augeY - 4}" width="11" height="8" rx="2"/><rect x="51.700" y="${augeY - 4}" width="11" height="8" rx="2"/></g><path d="M48.300,${augeY} h3.400 M37.300,${augeY - 1} l-4.800,-1.300 M62.700,${augeY - 1} l4.800,-1.300" stroke="#2b2b2b" stroke-width="1.400"/>`,
      sonne: `<g fill="#1d1d1f" stroke="#000" stroke-width="1"><path d="M37,${augeY - 3.800} h11.500 v4 a4.500,4.500 0 0 1 -4.500,4.500 h-2.500 a4.500,4.500 0 0 1 -4.500,-4.500 Z"/><path d="M51.500,${augeY - 3.800} h11.500 v4 a4.500,4.500 0 0 1 -4.500,4.500 h-2.500 a4.500,4.500 0 0 1 -4.500,-4.500 Z"/></g><path d="M48.500,${augeY - 2.500} h3 M37,${augeY - 2.500} l-4.600,-1 M63,${augeY - 2.500} l4.600,-1" stroke="#000" stroke-width="1.300"/><path d="M39,${augeY - 2} l3,3" stroke="#fff" stroke-opacity="0.35" stroke-width="1"/>`,
    };
    // Schützenhut: dunkelgrüner Filz, braunes Band, breite Krempe (links hochgeschlagen), großer weißer Federbusch mit brauner Feder
    const HUT = {
      ohne: '',
      schuetzenhut: (() => {
        // Lange weiße Feder: steht vom Hutband schräg nach links oben, mit Kiel und feinen Federästen
        return `<g transform="translate(0 -3.500)">
        <path d="M36.500,29.500 C30,26 21.500,17 17.500,6 C16.500,2.500 17,-1.500 19.500,-4 C24,-2.500 28.500,1.500 32.500,7.500 C36.500,14 39,21.500 38.800,29 Z" fill="#FBFAF4" stroke="#d2cebd" stroke-width="0.800" stroke-linejoin="round"/>
        <path d="M37,29 C32.500,20 26.500,9 19.800,-3" fill="none" stroke="#cfcab8" stroke-width="0.900" stroke-linecap="round"/>
        <path d="M33.500,22.500 l-6,-1.500 M30.800,17.500 l-6.500,-2.500 M28,12.500 l-6.500,-3 M25.200,7.500 l-5.800,-3.200 M22.500,2.500 l-4,-2.500 M34.500,23 l3.200,-3.500 M32,18 l3.800,-4.500 M29.200,13 l3.500,-5 M26.300,8 l2.800,-4.800 M23.500,3 l1.700,-3.800" fill="none" stroke="#e2decf" stroke-width="0.700" stroke-linecap="round"/>
        <path d="M35.200,30 C32.500,25 32.800,19.500 34.800,16 C36.800,20 37.600,25 37.400,30 Z" fill="#6B4A2A" stroke="#4a3018" stroke-width="0.500"/>
        <path d="M35,36 C33.300,24.500 37,13.500 45.500,12.300 C48.500,11.900 51,13.800 54,13.100 C62,12.200 66.700,23.500 65,36 Z" fill="#1E3326"/>
        <path d="M45,14 C49,17.300 53,16.800 56,14" fill="none" stroke="#132118" stroke-width="1.100" stroke-linecap="round"/>
        <path d="M38,20 C38.500,17 40,15.500 42,14.500" fill="none" stroke="#2f4d3b" stroke-width="1" stroke-linecap="round"/>
        <path d="M34.600,29.500 C44,33 56,33 65.600,29.500 L65.200,36.300 C56,38.800 44,38.800 34.900,36.300 Z" fill="#5C4A2B"/><path d="M34.600,29.500 C44,33 56,33 65.600,29.500" fill="none" stroke="#7a6540" stroke-width="0.700"/>
        <path d="M22.500,23 C19.500,24.500 20,29.500 23.500,32.500 C30,37.500 40,38.800 50,38.800 C63,38.800 74.500,37.300 80.500,32 C82,30.800 83.800,31.500 82.800,33.500 C78,40.500 64,43.300 50,43.300 C34,43.300 20.500,39.500 17.800,30.500 C16.800,26.500 19.500,22.500 22.500,23 Z" fill="#1E3326"/>
        <path d="M22.500,23 C19.500,22.500 16.800,26.500 17.800,30.500 C20.500,39.500 34,43.300 50,43.300 C64,43.300 78,40.500 82.800,33.500" fill="none" stroke="#6B5231" stroke-width="1.300" stroke-linecap="round"/>
        <path d="M23.500,32.500 C30,37.500 40,38.800 50,38.800 C63,38.800 74.500,37.300 80.500,32" fill="none" stroke="#2f4d3b" stroke-width="0.700"/>
      </g>`; })(),
    };
    const T = 'translate(50 45.500) scale(0.9) translate(-50 -50)';   // Figur etwas kleiner und höher: mehr Jacke im Bild, Platz für den Hut
    const hatHut = c.hut !== 'ohne';
    // Unter einem Hut werden hohe Frisuren oben gekappt, damit nichts durch den Hut sticht
    const haarClip = hatHut ? ` clip-path="url(#${id}h)"` : '';

    return `<svg viewBox="0 0 100 100" width="${g}" height="${g}" class="av-svg" style="overflow:visible">
      <defs><clipPath id="${id}c"><circle cx="50" cy="50" r="45"/></clipPath><clipPath id="${id}h"><rect x="0" y="36.500" width="100" height="80"/></clipPath>
        <radialGradient id="${id}b" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#3f7a22"/><stop offset="1" stop-color="#17340a"/></radialGradient>
        <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${R[0]}"/><stop offset="0.5" stop-color="${R[1]}"/><stop offset="1" stop-color="${R[2]}"/></linearGradient></defs>
      <circle cx="50" cy="50" r="45" fill="url(#${id}b)"/>
      <g clip-path="url(#${id}c)"><g transform="${T}">
        <g${haarClip}>${hinten}</g>
        ${jacke}
        <path d="M44,62 h12 v12 q-6,5 -12,0 Z" fill="${skD}"/>
        <circle cx="32.500" cy="49.500" r="3.800" fill="${sk}"/><circle cx="67.500" cy="49.500" r="3.800" fill="${sk}"/>
        <path d="${GESICHT[c.gesicht] || GESICHT.rund}" fill="${sk}"/>
        ${BART[c.bart] || ''}
        <g${haarClip}>${vorn}</g>
        ${braue(43, 0.600)}<g transform="translate(100 0) scale(-1 1)">${braue(43, 0.600)}</g>
        ${auge(43)}${auge(57)}
        <path d="M50,51 q-2.200,4.500 0.300,5.300" fill="none" stroke="${skD}" stroke-width="1.300" stroke-linecap="round"/>
        ${c.bart === 'vollbart' ? '' : ''}${MUND[c.mund] || MUND.laecheln}
        ${BRILLE[c.brille] || ''}
      </g></g>
      <circle cx="50" cy="50" r="46.500" fill="none" stroke="url(#${id}r)" stroke-width="5"/><circle cx="50" cy="50" r="49" fill="none" stroke="${R[2]}" stroke-width="0.800"/><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="0.800"/>
      <g transform="${T}">${HUT[c.hut] || ''}</g>
    </svg>`;
  }
  root.avatarSVG = avatarSVG; root.AVATAR_TEILE = TEILE;
  root.AVATAR_FARBEN = { haut: Object.fromEntries(Object.keys(HAUT).map(k => [k, HAUT[k][0]])), haar: Object.fromEntries(Object.keys(HAAR).map(k => [k, HAAR[k][0]])) };
})(typeof window !== 'undefined' ? window : globalThis);

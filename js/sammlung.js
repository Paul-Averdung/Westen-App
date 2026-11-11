// Sammlung: dauerhafte Auszeichnungen in vier Vitrinen.
//   Medaillen – aus dem Verlauf berechnet (jeder gespeicherte Abend + der laufende). Gelöschte Abende zählen nicht.
//   Trophäen  – Schützenfest-Jahre und Abende-Stufen ebenfalls aus dem Verlauf berechnet;
//               Spiel-Trophäen (Jackpot, Reaktionstest …) werden beim Erreichen gespeichert:
//               localStorage 'hopfenkonto_trophaeen' = { id: { n, first, last } }
//   Wappen    – Vereinsämter und Ehrungen, kommen per Code (js/gutschein.js):
//               localStorage 'hopfenkonto_wappen' = [ { t, n, d } ]
//   Treue     – eine Spange je 3 Jahre, berechnet aus dem Eintrittsjahr (Einstellungen).
//   Rekorde   – bester Abend und bestes Schützenfest aus dem Verlauf berechnet; höchster Gewinn und
//               höchster Kontostand werden mitgeschrieben: localStorage 'hopfenkonto_rekorde'
//   Verliehene Trophäen – frei gestaltbar per Code (Titel, Beschreibung, Stufe, Motiv), ohne App-Update:
//               localStorage 'hopfenkonto_verliehen' = [ { n, x, s, a, d } ]
// Neue Spiel-Trophäe: Eintrag in SPIEL_TROPHAEEN + an passender Stelle Trophaeen.award('id') aufrufen.
// Optik in css/sammlung.css.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const K_TROPH = 'hopfenkonto_trophaeen', K_WAPPEN = 'hopfenkonto_wappen', K_VERL = 'hopfenkonto_verliehen', K_REK = 'hopfenkonto_rekorde';
  const lesen = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch(e) { return d; } };
  const schreiben = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} };
  const heute = () => localDateStr(Date.now());
  const datum = s => s ? s.split('-').reverse().join('.') : '';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ── Stufen (Material) ─────────────────────────────────────────────────────
  // Je höher die Stufe, desto edler das Material und desto aufwendiger die Form.
  const MAT = {
    0: { name: '',        a: '#565656', b: '#3f3f3f', c: '#2c2c2c', d: '#1b1b1b' },   // noch nicht erreicht
    1: { name: 'Bronze',  a: '#F0B878', b: '#CD7F32', c: '#8A4F1A', d: '#4A2606' },
    2: { name: 'Silber',  a: '#FAFAFA', b: '#C4C8CC', c: '#878D94', d: '#3A3F45' },
    3: { name: 'Gold',    a: '#FFF3B0', b: '#FFD23A', c: '#C8960A', d: '#684800' },
    4: { name: 'Platin',  a: '#FFFFFF', b: '#DCE8F2', c: '#98AEC4', d: '#3C5068' },
    5: { name: 'Diamant', a: '#F4FEFF', b: '#A6EEFF', c: '#3DB8DA', d: '#0A566E' },
  };

  // ── Motive (zeigen, worum es geht) – gezeichnet in einem Feld von -14 bis 14 ──
  const MOTIV = {
    reaktion: c => `<circle r="11.5" fill="none" stroke="${c}" stroke-width="2.4"/><circle r="4.2" fill="${c}"/>
      <path d="M0-15v7M0 8v7M-15 0h7M8 0h7" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
    abende: c => `<path d="M-9-7h13v15a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3z" fill="${c}"/>
      <path d="M4-3h3.500a3.500 3.500 0 0 1 3.500 3.500v2a3.500 3.500 0 0 1-3.500 3.500H4" fill="none" stroke="${c}" stroke-width="2.400"/>
      <circle cx="-6" cy="-9" r="3.600" fill="${c}"/><circle cx="-1.500" cy="-10.500" r="4" fill="${c}"/><circle cx="3" cy="-9" r="3.200" fill="${c}"/>`,
    jackpot: c => `<rect x="-14" y="-9" width="28" height="18" rx="3" fill="none" stroke="${c}" stroke-width="2.2"/>
      <path d="M-4.700-9v18M4.700-9v18" stroke="${c}" stroke-width="1.6"/>
      <text y="4.600" text-anchor="middle" font-size="12" font-weight="900" fill="${c}" font-family="Georgia,serif" letter-spacing="3.300">777</text>`,
    blackjack: c => `<g transform="rotate(-14 -4 0)"><rect x="-12" y="-11" width="14" height="20" rx="2.200" fill="none" stroke="${c}" stroke-width="2.200"/></g>
      <g transform="rotate(10 4 0)"><rect x="-3" y="-11" width="14" height="20" rx="2.200" fill="${c}"/></g>
      <text x="4.600" y="3.500" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" fill-opacity="0.85" font-family="Georgia,serif" transform="rotate(10 4 0)">A</text>`,
    roulette: c => `<circle r="12.500" fill="none" stroke="${c}" stroke-width="2.400"/>${
      [0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3, b = a + Math.PI / 6, p = t => (Math.cos(t) * 11).toFixed(1) + ',' + (Math.sin(t) * 11).toFixed(1);
        return `<path d="M0,0 L${p(a)} A11,11 0 0 1 ${p(b)} Z" fill="${c}"/>`; }).join('')}<circle r="3.400" fill="${c}"/><circle cx="7.500" cy="-7.500" r="2.300" fill="${c}" stroke="#fff" stroke-opacity="0.7" stroke-width="1"/>`,
    pferde: c => `<path d="M-9 12V-2a9 9 0 0 1 18 0v14" fill="none" stroke="${c}" stroke-width="5.500"/>
      <g fill="#fff" fill-opacity="0.75"><circle cx="-9" cy="7" r="1.100"/><circle cx="-9" cy="1" r="1.100"/><circle cx="-6.300" cy="-6.300" r="1.100"/><circle cx="0" cy="-10.800" r="1.100"/><circle cx="6.300" cy="-6.300" r="1.100"/><circle cx="9" cy="1" r="1.100"/><circle cx="9" cy="7" r="1.100"/></g>`,
    shop: c => `<path d="M-12-3 -6-11h12l6 8L0 13z" fill="${c}"/><path d="M-12-3h24M-6-11l3 8L0 13M6-11 3-3 0 13" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="1.100"/>`,
    fest: c => `<circle r="12" fill="none" stroke="${c}" stroke-width="2.200"/><circle r="7.300" fill="none" stroke="${c}" stroke-width="2.200"/><circle r="2.800" fill="${c}"/>`,
    stern: c => stern(0, 0.500, 13, c, c),
    scheibe: c => MOTIV.fest(c),
    muenze: c => `<circle r="12.500" fill="${c}"/><circle r="9" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="1.200"/>` + stern(0, 0.300, 6, '#fff', '#fff').replace('fill="#fff"', 'fill="#fff" fill-opacity="0.8"'),
    stapel: c => [9, 3, -3, -9].map(y => `<ellipse cx="0" cy="${y}" rx="12" ry="4.400" fill="${c}" stroke="#fff" stroke-opacity="0.55" stroke-width="1"/>`).join(''),
  };
  // Bekanntes Motiv zeichnen – alles andere (z. B. ein Emoji aus einem Code) wird als Zeichen gesetzt
  function motiv(art, c) {
    if (MOTIV[art]) return MOTIV[art](c);
    return `<text y="7" text-anchor="middle" font-size="20">${esc(String(art || '★').slice(0, 8))}</text>`;
  }

  let _nr = 0;
  // Lorbeerzweig: Blätter entlang eines Bogens
  function lorbeer(cx, cy, r, von, bis, n, farbe, rand) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const w = (von + (bis - von) * i / (n - 1)) * Math.PI / 180;
      const x = cx + Math.cos(w) * r, y = cy + Math.sin(w) * r;
      const dreh = w * 180 / Math.PI + (bis > von ? 135 : 45);
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.100" ry="6.400" transform="rotate(${dreh.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${farbe}" stroke="${rand}" stroke-width="0.600"/>`;
    }
    return s;
  }
  const stern = (cx, cy, r, f, rand) => `<polygon points="${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.42 : r;
    return (cx + Math.cos(a) * q).toFixed(1) + ',' + (cy + Math.sin(a) * q).toFixed(1); }).join(' ')}" fill="${f}" stroke="${rand}" stroke-width="0.800" stroke-linejoin="round"/>`;

  // Trophäe als SVG. t = { art, stufe, schild }, zu = noch nicht erreicht
  function trophaeSVG(t, groesse, zu) {
    const st = t.art === 'fest' ? 3 : t.stufe, mat = t.mat || st, m = MAT[zu ? 0 : mat], id = 'tr' + (++_nr);
    const defs = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m.a}"/><stop offset="0.45" stop-color="${m.b}"/><stop offset="1" stop-color="${m.c}"/></linearGradient>
      <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
    const F = `url(#${id}g)`, R = `stroke="${m.d}" stroke-width="1.400" stroke-linejoin="round"`;
    const sockel = (b) => `<rect x="${50 - b / 2}" y="92" width="${b}" height="12" rx="2.500" fill="${zu ? '#242424' : '#3b2513'}" stroke="${zu ? '#151515' : '#1d1107'}" stroke-width="1.200"/>` +
      (t.schild ? `<rect x="${50 - b / 2 + 4}" y="94.500" width="${b - 8}" height="7" rx="1.500" fill="${m.b}" stroke="${m.d}" stroke-width="0.700"/><text x="50" y="100.300" text-anchor="middle" font-size="6.400" font-weight="800" fill="${m.d}" font-family="-apple-system,BlinkMacSystemFont,sans-serif">${esc(t.schild)}</text>` : '');
    let form = '', mx = 50, my = 46, ms = 1.25;

    if (t.art === 'fest') {
      // Schützenfest: Eichenkranz mit Scheibe und Jahres-Banner
      const gr = zu ? '#3a3a3a' : '#3F8F2A', grD = zu ? '#1c1c1c' : '#17420d', go = m;
      form = lorbeer(50, 46, 33, 100, 440, 22, gr, grD) +
        `<circle cx="50" cy="46" r="23" fill="${zu ? '#3f3f3f' : `url(#${id}g)`}" stroke="${go.d}" stroke-width="1.400"/><circle cx="50" cy="46" r="23" fill="url(#${id}h)" opacity="0.5"/>` +
        `<path d="M22 80h56l-5 6.500 5 6.500H22l5-6.500z" fill="${zu ? '#2c2c2c' : '#B3122E'}" stroke="${zu ? '#151515' : '#5a0714'}" stroke-width="1.200" stroke-linejoin="round"/>` +
        `<text x="50" y="90" text-anchor="middle" font-size="9.500" font-weight="900" fill="${zu ? '#666' : '#FFE9A8'}" font-family="-apple-system,BlinkMacSystemFont,sans-serif">${esc(t.schild || '')}</text>`;
      return `<svg viewBox="0 0 100 106" width="${groesse}" height="${Math.round(groesse * 1.06)}" class="tr-svg">${defs}${form}<g transform="translate(50 46) scale(1.25)">${MOTIV.fest(zu ? '#8a8a8a' : m.d)}</g></svg>`;
    }

    if (st <= 1) {            // Plakette auf kleinem Sockel
      form = `<rect x="46" y="76" width="8" height="17" fill="${F}" ${R}/>` + sockel(34) +
        `<circle cx="50" cy="46" r="31" fill="${F}" ${R}/><circle cx="50" cy="46" r="25.500" fill="none" stroke="${m.d}" stroke-opacity="0.45" stroke-width="1.200"/><path d="M24 36a28 28 0 0 1 52 0a40 30 0 0 0-52 0z" fill="url(#${id}h)"/>`;
    } else if (st === 2) {    // Schild
      form = `<rect x="45.500" y="80" width="9" height="13" fill="${F}" ${R}/>` + sockel(38) +
        `<path d="M20 14h60v34c0 20-16 30-30 36-14-6-30-16-30-36z" fill="${F}" ${R}/><path d="M25 19h50v29c0 16-13 25-25 30-12-5-25-14-25-30z" fill="none" stroke="${m.d}" stroke-opacity="0.45" stroke-width="1.200"/><path d="M23 17h54v16a60 40 0 0 0-54 0z" fill="url(#${id}h)"/>`;
      my = 44;
    } else {                  // Pokal mit Henkeln
      const henkel = `<path d="M27 22H16c-3 0-4 2-4 5 0 12 6 20 17 22" fill="none" stroke="${m.d}" stroke-width="6.400" stroke-linecap="round"/><path d="M27 22H16c-3 0-4 2-4 5 0 12 6 20 17 22" fill="none" stroke="${m.b}" stroke-width="3.600" stroke-linecap="round"/>`;
      form = (st >= 4 ? lorbeer(50, 48, 43, 172, 82, 7, m.b, m.d) + lorbeer(50, 48, 43, 8, 98, 7, m.b, m.d) : '') +
        henkel + `<g transform="translate(100 0) scale(-1 1)">${henkel}</g>` +
        `<path d="M44 68h12l2 16H42z" fill="${F}" ${R}/><rect x="34" y="83" width="32" height="9" rx="2.500" fill="${F}" ${R}/>` + sockel(44) +
        `<path d="M24 12h52v26c0 18-12 31-26 31S24 56 24 38z" fill="${F}" ${R}/><rect x="22" y="9" width="56" height="7" rx="3" fill="${F}" ${R}/><path d="M28 17h20v40c-11-3-20-9-20-22z" fill="url(#${id}h)"/>` +
        (st >= 5 ? stern(50, 4.500, 7.500, m.a, m.d) + stern(13, 8, 3.600, '#fff', m.c) + stern(88, 13, 3, '#fff', m.c) + stern(84, 62, 2.600, '#fff', m.c) : '');
      my = 39; ms = 1.2;
    }
    const top = st >= 5 ? -5 : 0;
    return `<svg viewBox="0 ${top} 100 ${106 - top}" width="${groesse}" height="${Math.round(groesse * (106 - top) / 100)}" class="tr-svg${!zu && mat >= 3 ? ' tr-glanz' + mat : ''}">${defs}${form}<g transform="translate(${mx} ${my}) scale(${ms})">${motiv(t.art, zu ? '#8a8a8a' : m.d)}</g></svg>`;
  }

  // ── Wappen (Vereinsämter und Ehrungen) ────────────────────────────────────
  const G = '#F4CF57', GD = '#6a4a08';
  const AEMTER = {
    hauptmann: { name: 'Hauptmann', feld: '#8a1424', text: 'Für alle, die das Amt des Hauptmanns innehaben oder innehatten.',
      motiv: () => stern(-11, -9, 5, G, GD) + stern(0, -12, 6, G, GD) + stern(11, -9, 5, G, GD) + `<path d="M-11 12 11-4M11 12-11-4" stroke="${G}" stroke-width="3" stroke-linecap="round"/><path d="M-11 12-8 9M11 12 8 9" stroke="${GD}" stroke-width="3" stroke-linecap="round"/>` },
    stv: { name: 'Stellvertretender Hauptmann', feld: '#1f4e8b', text: 'Für alle, die stellvertretender Hauptmann sind oder waren.',
      motiv: () => stern(-7, -10, 5.500, G, GD) + stern(7, -10, 5.500, G, GD) + `<path d="M-11 12 11-4M11 12-11-4" stroke="${G}" stroke-width="3" stroke-linecap="round"/><path d="M-11 12-8 9M11 12 8 9" stroke="${GD}" stroke-width="3" stroke-linecap="round"/>` },
    schrift: { name: 'Statistiker / Schriftführer', feld: '#3b2a7a', text: 'Für alle, die Statistiker oder Schriftführer sind oder waren.',
      motiv: () => `<path d="M10-14C1-12-6-4-8 8l3 1C1 6 8-1 10-14z" fill="${G}" stroke="${GD}" stroke-width="0.900"/><path d="M-10 13 4-6" stroke="${GD}" stroke-width="1.300" stroke-linecap="round"/><path d="M-13 14h26" stroke="${G}" stroke-width="2.200" stroke-linecap="round"/>` },
    kasse: { name: 'Kassenwart', feld: '#6b4a10', text: 'Für alle, die Kassenwart sind oder waren.',
      motiv: () => [10, 4, -2].map(y => `<ellipse cx="0" cy="${y}" rx="11" ry="4.200" fill="${G}" stroke="${GD}" stroke-width="1"/>`).join('') + `<ellipse cx="0" cy="-8" rx="11" ry="4.200" fill="${G}" stroke="${GD}" stroke-width="1"/><text y="-5.600" text-anchor="middle" font-size="7" font-weight="900" fill="${GD}" font-family="Georgia,serif">€</text>` },
    bier: { name: 'Bierwart', feld: '#1f5a14', text: 'Für alle, die Bierwart sind oder waren.',
      motiv: () => MOTIV.abende(G) },
    presse: { name: 'Pressewart', feld: '#0f5e73', text: 'Für alle, die Pressewart sind oder waren.',
      motiv: () => `<path d="M-12-3h6L6-11v22L-6 3h-6z" fill="${G}" stroke="${GD}" stroke-width="1" stroke-linejoin="round"/><path d="M-9 3v8h4V4" fill="${G}" stroke="${GD}" stroke-width="1"/><path d="M9-5a6 6 0 0 1 0 10M12-9a11 11 0 0 1 0 18" fill="none" stroke="${G}" stroke-width="1.900" stroke-linecap="round"/>` },
    ehrung: { name: 'Ehrung', feld: '#2b2b2b', text: 'Eine persönliche Auszeichnung.',
      motiv: () => `<circle r="13.500" fill="none" stroke="${G}" stroke-width="1.800"/><circle r="10.500" fill="none" stroke="${G}" stroke-opacity="0.5" stroke-width="0.900"/>` + stern(0, 0.500, 8.500, G, GD) },
  };
  function wappenSVG(amt, groesse) {
    const a = AEMTER[amt] || AEMTER.ehrung, id = 'wp' + (++_nr);
    return `<svg viewBox="0 0 100 110" width="${groesse}" height="${Math.round(groesse * 1.1)}" class="tr-svg tr-glanz3">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset="0.5" stop-color="#FFD23A"/><stop offset="1" stop-color="#B8860B"/></linearGradient>
      <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <path d="M10 8h80v46c0 26-22 40-40 50C32 94 10 80 10 54z" fill="url(#${id})" stroke="#5a3d05" stroke-width="1.600" stroke-linejoin="round"/>
      <path d="M17 15h66v39c0 21-18 33-33 41.500C35 87 17 75 17 54z" fill="${a.feld}" stroke="#5a3d05" stroke-width="1.200" stroke-linejoin="round"/>
      <path d="M17 15h66v22a80 46 0 0 0-66 0z" fill="url(#${id}h)"/>
      <g transform="translate(50 50) scale(1.55)">${a.motiv()}</g></svg>`;
  }

  // ── Treue-Spange ──────────────────────────────────────────────────────────
  function spangeSVG(jahre, groesse, zu) {
    const st = jahre >= 33 ? 5 : jahre >= 24 ? 4 : jahre >= 15 ? 3 : jahre >= 9 ? 2 : 1, m = MAT[zu ? 0 : st], id = 'sp' + (++_nr);
    const band = zu ? ['#2c2c2c', '#3a3a3a'] : ['#1f5a14', '#f3f0e2'];
    return `<svg viewBox="0 0 100 64" width="${groesse}" height="${Math.round(groesse * 0.64)}" class="tr-svg${!zu && st >= 4 ? ' tr-glanz' + st : ''}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m.a}"/><stop offset="0.5" stop-color="${m.b}"/><stop offset="1" stop-color="${m.c}"/></linearGradient></defs>
      <rect x="8" y="6" width="84" height="22" rx="2" fill="${band[0]}" stroke="${m.d}" stroke-width="1"/><rect x="36" y="6" width="28" height="22" fill="${band[1]}"/><rect x="47" y="6" width="6" height="22" fill="${band[0]}"/>
      <rect x="4" y="24" width="92" height="32" rx="6" fill="url(#${id})" stroke="${m.d}" stroke-width="1.500"/><rect x="8.500" y="28.500" width="83" height="23" rx="3.500" fill="none" stroke="${m.d}" stroke-opacity="0.45" stroke-width="1"/>
      <text x="50" y="47.500" text-anchor="middle" font-size="19" font-weight="900" fill="${m.d}" font-family="Georgia,serif">${jahre}</text>
      ${stern(20, 40, 5, m.d, m.d)}${stern(80, 40, 5, m.d, m.d)}</svg>`;
  }

  // ── Daten ─────────────────────────────────────────────────────────────────
  // Alle Abende aus dem Verlauf (älteste zuerst) plus der laufende – Stand immer frisch berechnet.
  function zaehle(entries) {
    const z = { bier: 0, shots: 0, misch: 0 };
    (entries || []).forEach(e => {
      if (e.key === 'shots') z.shots += e.dir; else if (e.key === 'misch') z.misch += e.dir; else if (e.key !== 'manta') z.bier += e.dir;
    });
    z.bier = Math.max(0, z.bier); z.shots = Math.max(0, z.shots); z.misch = Math.max(0, z.misch);
    z.alle = z.bier + z.shots + z.misch;
    return z;
  }
  function abende() {
    const liste = loadHistory().map(t => ({ date: t.date, score: summarizeEntries(t.entries || []).score, z: zaehle(t.entries) }));
    if (drinkLog.length > 0) liste.push({ date: localDateStr(drinkLog[0].ts), score: summarizeEntries(drinkLog).score, z: zaehle(drinkLog), laeuft: true });
    return liste.filter(a => a.date).sort((x, y) => x.date < y.date ? -1 : x.date > y.date ? 1 : 0);
  }
  // Schützenfest: Donnerstag (Fronleichnam) bis einschließlich Sonntag
  function festEnde(jahr) { const d = new Date(getFestDates(jahr).thu); d.setDate(d.getDate() + 3); return d; }
  function istFesttag(dateStr) {
    const p = dateStr.split('-').map(Number);
    const d = new Date(p[0], p[1] - 1, p[2]).getTime();
    return d >= getFestDates(p[0]).thu.getTime() && d <= festEnde(p[0]).getTime();
  }
  const zahl = n => String(Math.round(n * 100) / 100).replace('.', ',');
  const tsd = n => Number(n).toLocaleString('de-DE');

  const SPIEL_TROPHAEEN = [
    { id: 'rx1500', gruppe: 'Reaktionstest', art: 'reaktion', stufe: 1, schild: '1,5 s',  ms: 1500, name: 'Reaktionstest unter 1,5 s',  text: 'Alle drei Ziele in zusammen weniger als 1,5 Sekunden getroffen.' },
    { id: 'rx1200', gruppe: 'Reaktionstest', art: 'reaktion', stufe: 2, schild: '1,2 s',  ms: 1200, name: 'Reaktionstest unter 1,2 s',  text: 'Alle drei Ziele in zusammen weniger als 1,2 Sekunden getroffen.' },
    { id: 'rx900',  gruppe: 'Reaktionstest', art: 'reaktion', stufe: 3, schild: '0,9 s',  ms: 900,  name: 'Reaktionstest unter 0,9 s',  text: 'Alle drei Ziele in zusammen weniger als 0,9 Sekunden getroffen.' },
    { id: 'rx750',  gruppe: 'Reaktionstest', art: 'reaktion', stufe: 4, schild: '0,75 s', ms: 750,  name: 'Reaktionstest unter 0,75 s', text: 'Alle drei Ziele in zusammen weniger als 0,75 Sekunden getroffen.' },
    { id: 'rx650',  gruppe: 'Reaktionstest', art: 'reaktion', stufe: 5, schild: '0,65 s', ms: 650,  name: 'Reaktionstest unter 0,65 s', text: 'Alle drei Ziele in zusammen weniger als 0,65 Sekunden getroffen.' },
    { id: 'pferde',    gruppe: 'Casino & Shop', art: 'pferde',    stufe: 1, name: 'Sieger-Tipp',      text: 'Beim Pferderennen auf das Siegerpferd gesetzt.' },
    { id: 'blackjack', gruppe: 'Casino & Shop', art: 'blackjack', stufe: 2, name: 'Blackjack',        text: 'Beim Blackjack mit den ersten beiden Karten genau 21 bekommen.' },
    { id: 'roulette',  gruppe: 'Casino & Shop', art: 'roulette',  stufe: 3, name: 'Volle Zahl',       text: 'Beim Roulette auf eine einzelne Zahl gesetzt und getroffen.' },
    { id: 'jackpot',   gruppe: 'Casino & Shop', art: 'jackpot',   stufe: 4, name: 'Jackpot',          text: 'An den Hopfen-Slots den Jackpot geholt: dreimal Bier in einer Reihe.' },
    { id: 'legendaer', gruppe: 'Casino & Shop', art: 'shop',      stufe: 5, name: 'Legendäres Teil',  text: 'Im Shop ein legendäres Teil gekauft.' },
  ];
  const ABENDE_STUFEN = [10, 25, 50, 75, 100];
  const ANRECHNEN_BIS = 2026;        // Schützenfeste bis zu diesem Jahr werden über das Eintrittsjahr angerechnet
  const JUNGSCHUETZEN_SEIT = 1991;   // früher kann niemand dabei gewesen sein

  // Stellt alles zusammen. Jedes Stück: { id, name, text, svg(groesse), hat, n, first, last, fortschritt }
  function stand() {
    const ab = abende(), sp = lesen(K_TROPH, {});

    const medaillen = MEDAL_STEPS.map(pkt => {
      const treffer = ab.filter(a => a.score >= pkt), t = MEDAL_TIERS[pkt];
      return { id: 'm' + pkt, name: t.name, hat: treffer.length > 0, n: treffer.length, einheit: ['Abend', 'Abenden'],
        first: treffer[0] && treffer[0].date, last: treffer.length && treffer[treffer.length - 1].date,
        text: 'Medaille für einen Abend mit mindestens ' + pkt + ' Punkten. Ein Punkt entspricht etwa einem Standardgetränk.',
        fortschritt: treffer.length ? '' : 'Bisher bester Abend: ' + String(Math.max(0, ...ab.map(a => a.score))).replace('.', ',') + ' von ' + pkt + ' Punkten',
        svg: g => buildMedalSVG(g, treffer.length ? t : LOCKED_TIER) };
    });

    const gruppen = [];
    // Schützenfest – eine Trophäe je Jahr.
    // Bis einschließlich ANRECHNEN_BIS zählt die Mitgliedschaft (Eintrittsjahr), weil es die App vorher nicht gab;
    // danach nur noch Jahre, in denen an einem Festtag gezählt wurde.
    const jahre = {};
    ab.filter(a => istFesttag(a.date)).forEach(a => { const j = a.date.slice(0, 4); (jahre[j] = jahre[j] || []).push(a.date); });
    const ejFest = parseInt(localStorage.getItem('hopfenkonto_entry_year') || ''), angerechnet = {};
    if (!isNaN(ejFest) && ejFest > 1900 && ejFest <= new Date().getFullYear()) {
      for (let j = Math.max(ejFest, JUNGSCHUETZEN_SEIT); j <= ANRECHNEN_BIS; j++) if (festEnde(j).getTime() < Date.now()) angerechnet[j] = true;
    }
    const fest = [...new Set(Object.keys(jahre).concat(Object.keys(angerechnet)))].sort().map(j => {
      const tage = jahre[j] || [], f = getFestDates(+j), iso = d => localDateStr(d.getTime());
      const fakten = [];
      if (angerechnet[j]) fakten.push(['Angerechnet', 'Mitglied seit ' + ejFest]);
      if (tage.length) fakten.push(['Mitgezählt', 'an ' + tage.length + (tage.length === 1 ? ' Festtag' : ' Festtagen')]);
      fakten.push(['Festtage', datum(iso(f.thu)).slice(0, 6) + ' bis ' + datum(iso(festEnde(+j)))]);
      return { id: 'fest' + j, name: 'Schützenfest ' + j, hat: true, n: tage.length || 1, einmalig: tage.length < 2, fakten,
        text: angerechnet[j] && !tage.length ? 'Schützenfest ' + j + ' – angerechnet über deine Mitgliedschaft, weil es die App damals noch nicht gab.'
                             : 'Beim Schützenfest ' + j + ' an mindestens einem Festtag (Donnerstag bis Sonntag) mitgezählt.',
        svg: g => trophaeSVG({ art: 'fest', schild: j }, g, false) };
    });
    const jetzt = new Date(); let nj = jetzt.getFullYear();
    if (jetzt.getTime() > festEnde(nj).getTime() + 864e5) nj++;
    if (!jahre[nj]) {
      const f = getFestDates(nj), dm = d => String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.';
      fest.push({ id: 'fest' + nj, name: 'Schützenfest ' + nj, hat: false, n: 0, text: 'Zähle beim Schützenfest ' + nj + ' an mindestens einem Festtag mit.',
        fortschritt: 'Festtage: ' + dm(f.thu) + ' bis ' + dm(festEnde(nj)) + nj, svg: g => trophaeSVG({ art: 'fest', schild: String(nj) }, g, true) });
    }
    const verl = lesen(K_VERL, []).map((v, i) => { const st = Math.max(1, Math.min(5, parseInt(v.s) || 3));
      return { id: 'v' + i, name: v.n || 'Trophäe', hat: true, n: 1, einmalig: true, verliehen: true, first: v.d, stufe: st,
        text: v.x || 'Eine persönliche Trophäe.', svg: g => trophaeSVG({ art: v.a || 'stern', stufe: st }, g, false) }; });
    if (verl.length) gruppen.push({ titel: 'Verliehen', teile: verl });
    gruppen.push({ titel: 'Schützenfest', teile: fest });

    // Abende im Verlauf – steigende Stufen
    gruppen.push({ titel: 'Abende', teile: ABENDE_STUFEN.map((z, i) => {
      const hat = ab.length >= z;
      return { id: 'ab' + z, name: z + ' Abende', hat, n: hat ? 1 : 0, einmalig: true, first: hat ? ab[z - 1].date : null,
        text: z + ' Abende im Verlauf gesammelt. Gelöschte Abende zählen nicht mit.', fortschritt: hat ? '' : ab.length + ' von ' + z + ' Abenden',
        svg: g => trophaeSVG({ art: 'abende', stufe: i + 1, schild: String(z) }, g, !hat) };
    }) });

    // Spiel-Trophäen (gespeichert)
    ['Reaktionstest', 'Casino & Shop'].forEach(titel => gruppen.push({ titel, teile: SPIEL_TROPHAEEN.filter(t => t.gruppe === titel).map(t => {
      const s = sp[t.id] || { n: 0 };
      return { id: t.id, name: t.name, hat: s.n > 0, n: s.n, first: s.first, last: s.last, text: t.text, stufe: t.stufe, svg: g => trophaeSVG(t, g, !(s.n > 0)) };
    }) }));

    const wappen = lesen(K_WAPPEN, []).map((w, i) => {
      const a = AEMTER[w.t] || AEMTER.ehrung;
      return { id: 'w' + i, name: (w.t === 'ehrung' || !AEMTER[w.t]) && w.n ? w.n : a.name, hat: true, n: 1, einmalig: true, first: w.d, text: a.text, verliehen: true, svg: g => wappenSVG(w.t, g) };
    });

    // Treue – je 3 Jahre eine Spange
    const jahr = new Date().getFullYear(), ej = parseInt(localStorage.getItem('hopfenkonto_entry_year') || '');
    const gueltig = !isNaN(ej) && ej > 1900 && ej <= jahr, dabei = gueltig ? jahr - ej : 0;
    const treue = [];
    for (let j = 3; j <= dabei; j += 3) treue.push({ id: 'tr' + j, name: j + ' Jahre dabei', hat: true, n: 1, einmalig: true, breit: true, jahrErreicht: ej + j,
      text: 'Treue-Spange für ' + j + ' Jahre Mitgliedschaft, berechnet aus deinem Eintrittsjahr ' + ej + '.', svg: g => spangeSVG(j, g, false) });
    if (gueltig) { const n = Math.floor(dabei / 3) * 3 + 3;
      treue.push({ id: 'tr' + n, name: n + ' Jahre dabei', hat: false, n: 0, text: 'Treue-Spange für ' + n + ' Jahre Mitgliedschaft.', breit: true, fortschritt: 'Erreichst du ' + (ej + n), svg: g => spangeSVG(n, g, true) }); }

    // Rekorde
    const rk = lesen(K_REK, {}), rekorde = [];
    const plakette = (art, hat) => g => trophaeSVG({ art, stufe: 1, mat: 3 }, g, !hat);
    const top = ab.reduce((b, a) => a.score > 0 && (!b || a.score > b.score) ? a : b, null);
    rekorde.push({ id: 'rkabend', name: 'Bester Abend', hat: !!top, wert: top ? zahl(top.score) + ' Punkte' : '–', unter: top ? datum(top.date) + ' · ' + top.z.alle + ' Getränke' : 'Noch kein Abend im Verlauf',
      text: 'Der Abend mit den meisten Punkten im Verlauf. Ein Punkt entspricht etwa einem Standardgetränk.', svg: plakette('abende', !!top),
      fakten: top ? [['Punkte', zahl(top.score)], ['Datum', datum(top.date)], ['Bier', String(top.z.bier)], ['Shots', String(top.z.shots)], ['Mischgetränke', String(top.z.misch)]] : null });
    const fj = {};
    ab.filter(a => istFesttag(a.date)).forEach(a => { const j = a.date.slice(0, 4), f = fj[j] = fj[j] || { jahr: j, bier: 0, shots: 0, misch: 0, alle: 0, tage: 0 };
      f.bier += a.z.bier; f.shots += a.z.shots; f.misch += a.z.misch; f.alle += a.z.alle; f.tage++; });
    const bf = Object.values(fj).reduce((b, f) => f.alle > 0 && (!b || f.alle > b.alle) ? f : b, null);
    rekorde.push({ id: 'rkfest', name: 'Bestes Schützenfest', hat: !!bf, wert: bf ? bf.alle + ' Getränke' : '–', unter: bf ? 'Schützenfest ' + bf.jahr + ' · ' + bf.bier + ' Bier · ' + bf.shots + ' Shots · ' + bf.misch + ' Mischen' : 'Noch kein Schützenfest gezählt',
      text: 'Das Schützenfest mit den meisten Getränken, zusammengezählt von Donnerstag (Fronleichnam) bis Sonntag.', svg: plakette('scheibe', !!bf),
      fakten: bf ? [['Schützenfest', bf.jahr], ['Getränke insgesamt', String(bf.alle)], ['Bier', String(bf.bier)], ['Shots', String(bf.shots)], ['Mischgetränke', String(bf.misch)], ['Gezählte Tage', String(bf.tage)]] : null });
    const gw = rk.gewinn;
    rekorde.push({ id: 'rkgewinn', name: 'Höchster Gewinn im Casino', hat: !!gw, wert: gw ? tsd(gw.v) + ' Coins' : '–', unter: gw ? (gw.spiel ? gw.spiel + ' · ' : '') + datum(gw.d) : 'Noch nichts gewonnen',
      text: 'Die höchste Auszahlung in einer einzelnen Runde im Casino.', svg: plakette('muenze', !!gw),
      fakten: gw ? [['Auszahlung', tsd(gw.v) + ' Coins']].concat(gw.spiel ? [['Spiel', gw.spiel]] : [], [['Datum', datum(gw.d)]]) : null });
    let stand0 = parseInt(localStorage.getItem('hopfenkonto_coins') || ''); if (isNaN(stand0) || stand0 < 0) stand0 = 0;
    const ko = rk.konto && rk.konto.v >= stand0 ? rk.konto : (stand0 > 0 ? { v: stand0, d: heute() } : null);
    rekorde.push({ id: 'rkkonto', name: 'Höchster Kontostand', hat: !!ko, wert: ko ? tsd(ko.v) + ' Coins' : '–', unter: ko ? datum(ko.d) : 'Noch keine Coins',
      text: 'So viele Coins hattest du höchstens gleichzeitig auf dem Konto.', svg: plakette('stapel', !!ko),
      fakten: ko ? [['Kontostand', tsd(ko.v) + ' Coins'], ['Datum', datum(ko.d)]] : null });

    return { medaillen, gruppen, wappen, treue, gueltig, rekorde, abende: ab };
  }

  // ── Seite ─────────────────────────────────────────────────────────────────
  let _teile = {};
  function kachel(t, g, klasse) {
    _teile[t.id] = t;
    return `<button type="button" class="sa-teil ${klasse || ''}${t.hat ? '' : ' zu'}" onclick="sammlungDetail('${t.id}')">
      <span class="sa-bild">${t.svg(g)}${t.hat && !t.einmalig && t.n > 1 ? `<b class="sa-n">${t.n}×</b>` : ''}${t.hat ? '' : '<i class="sa-schloss">🔒</i>'}</span>
      <span class="sa-name">${esc(t.name)}</span></button>`;
  }
  function render() {
    const s = stand(); _teile = {};
    const g = Math.min(84, Math.floor((Math.min(window.innerWidth, 460) - 60) / 3 * 0.74));
    const alle = s.medaillen.concat(...s.gruppen.map(x => x.teile), s.wappen, s.treue);
    const best = Math.max(0, ...s.abende.map(a => a.score));
    document.getElementById('sa-summe').textContent = alle.filter(t => t.hat).length + ' Auszeichnungen' + (s.abende.length ? ' · bester Abend: ' + String(best).replace('.', ',') + ' Punkte' : '');
    const anz = teile => `<em>${teile.filter(t => t.hat).length} von ${teile.length}</em>`;
    let h = `<div class="sa-vitrine"><h3>Medaillen ${anz(s.medaillen)}</h3><p class="sa-info">Aus deinen Abenden im Verlauf – der laufende Abend zählt schon mit.</p>
      <div class="sa-raster">${s.medaillen.map(t => kachel(t, g)).join('')}</div></div>`;
    h += `<div class="sa-vitrine"><h3>Trophäen ${anz([].concat(...s.gruppen.map(x => x.teile)))}</h3>` +
      s.gruppen.map(x => `<div class="sa-gruppe">${x.titel}</div><div class="sa-raster">${x.teile.map(t => kachel(t, g)).join('')}</div>`).join('') + '</div>';
    s.rekorde.forEach(t => { _teile[t.id] = t; });
    h += `<div class="sa-vitrine"><h3>Rekorde</h3><div class="sa-rekorde">${s.rekorde.map(t => `<button type="button" class="sa-rek${t.hat ? '' : ' zu'}" onclick="sammlungDetail('${t.id}')">
      <span class="sa-rek-bild">${t.svg(46)}</span><span class="sa-rek-text"><i>${t.name}</i><b>${esc(t.wert)}</b><u>${esc(t.unter)}</u></span></button>`).join('')}</div></div>`;
    h += `<div class="sa-vitrine"><h3>Wappen</h3>` + (s.wappen.length
      ? `<div class="sa-raster">${s.wappen.map(t => kachel(t, g)).join('')}</div>`
      : `<p class="sa-info">Wappen für Vereinsämter und persönliche Ehrungen werden per Gutschein eingelöst.</p>`) + '</div>';
    h += `<div class="sa-vitrine"><h3>Treue</h3>` + (s.gueltig
      ? `<div class="sa-raster sa-spangen">${s.treue.map(t => kachel(t, Math.min(120, g * 1.5), 'sa-spange')).join('')}</div>`
      : `<p class="sa-info">Trag in den Einstellungen dein Eintrittsjahr ein – für je drei Jahre im Verein gibt es eine Spange.</p>`) + '</div>';
    document.getElementById('sa-inhalt').innerHTML = h;
  }

  window.openSammlung = function() {
    render();
    const ov = document.getElementById('sammlung-overlay');
    ov.classList.add('open'); ov.scrollTop = 0;
  };
  window.closeSammlung = function() { sammlungDetailZu(); document.getElementById('sammlung-overlay').classList.remove('open'); };

  function fakten(t) {
    const z = [];
    if (t.fakten) return t.fakten;
    if (!t.hat) { z.push(['Stand', 'Noch nicht erreicht']); if (t.fortschritt) z.push(['Fortschritt', t.fortschritt]); return z; }
    if (t.verliehen) { z.push(['Verliehen am', datum(t.first)]); return z; }
    if (t.jahrErreicht) { z.push(['Erreicht', String(t.jahrErreicht)]); return z; }
    if (t.einmalig) { z.push(['Erreicht am', datum(t.first)]); return z; }
    z.push(['Erreicht', t.einheit ? 'an ' + t.n + ' ' + t.einheit[t.n === 1 ? 0 : 1] : t.n + '×']);
    if (t.first) z.push(['Zum ersten Mal', datum(t.first)]);
    if (t.last && t.last !== t.first) z.push(['Zuletzt', datum(t.last)]);
    return z;
  }
  function detailHTML(t, kopf) {
    return `${kopf ? `<div class="sa-d-kopf">${kopf}</div>` : ''}<div class="sa-d-bild">${t.svg(t.breit ? 190 : 150)}</div>
      <div class="sa-d-name">${esc(t.name)}</div>${t.stufe && t.hat ? `<div class="sa-d-stufe s${t.stufe}">${MAT[t.stufe].name}</div>` : ''}
      <p class="sa-d-text">${esc(t.text)}</p>
      <dl class="sa-d-fakten">${fakten(t).map(f => `<div><dt>${f[0]}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>`;
  }
  window.sammlungDetail = function(id) {
    const t = _teile[id]; if (!t) return;
    const d = document.getElementById('sammlung-detail');
    d.querySelector('.sa-d-inhalt').innerHTML = detailHTML(t);
    d.querySelector('.sa-d-zur').style.display = 'none';
    d.classList.add('open');
  };
  window.sammlungDetailZu = function() { document.getElementById('sammlung-detail').classList.remove('open'); };

  // ── Erhalten: großes Fenster beim ersten Mal, kurzer Hinweis bei Wiederholungen ──
  function feiern(t, kopf) {
    const d = document.getElementById('sammlung-detail');
    d.querySelector('.sa-d-inhalt').innerHTML = detailHTML(t, kopf);
    d.querySelector('.sa-d-zur').style.display = document.getElementById('sammlung-overlay').classList.contains('open') ? 'none' : '';
    d.classList.remove('open'); void d.offsetWidth; d.classList.add('open', 'neu');
    setTimeout(() => d.classList.remove('neu'), 900);
    if (typeof slotSound === 'function') { try { slotSound('win', { gain: 30 }); } catch(e) {} }
  }
  function hinweis(t) {
    const el = document.getElementById('sammlung-hinweis');
    el.innerHTML = `<span class="sa-h-bild">${t.svg(34)}</span><span><b>${esc(t.name)}</b><i>Trophäe zum ${t.n}. Mal erreicht</i></span>`;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }
  function alsTeil(def, s) {
    return { id: def.id, name: def.name, text: def.text, stufe: def.stufe, hat: true, n: s.n, first: s.first, last: s.last, svg: g => trophaeSVG(def, g, false) };
  }

  window.Trophaeen = {
    // Spiel-Trophäe gutschreiben. verzoegerung (ms), damit die Animation des Spiels erst ausläuft.
    award(id, verzoegerung) {
      const def = SPIEL_TROPHAEEN.find(t => t.id === id); if (!def) return;
      const sp = lesen(K_TROPH, {}), s = sp[id] || { n: 0, first: heute() };
      s.n++; s.last = heute(); sp[id] = s; schreiben(K_TROPH, sp);
      const teil = alsTeil(def, s);
      setTimeout(() => s.n === 1 ? feiern(teil, 'Neue Trophäe') : hinweis(teil), verzoegerung || 0);
    },
    // Reaktionstest: alle erreichten Stufen zählen, gefeiert wird die höchste neue
    reaktion(ms) {
      const sp = lesen(K_TROPH, {}), erreicht = SPIEL_TROPHAEEN.filter(t => t.ms && ms < t.ms);
      if (!erreicht.length) return;
      let neu = null;
      erreicht.forEach(def => { const s = sp[def.id] || { n: 0, first: heute() }; s.n++; s.last = heute(); sp[def.id] = s; if (s.n === 1) neu = def; });
      schreiben(K_TROPH, sp);
      const top = erreicht[erreicht.length - 1];
      setTimeout(() => neu ? feiern(alsTeil(neu, sp[neu.id]), 'Neue Trophäe') : hinweis(alsTeil(top, sp[top.id])), 900);
    },
    // Wappen aus einem Code (js/gutschein.js). Rückgabe: Name des Wappens
    wappen(amt, titel) {
      const t = AEMTER[amt] ? amt : 'ehrung', n = t === 'ehrung' ? String(titel || 'Ehrung').slice(0, 60) : '';
      const liste = lesen(K_WAPPEN, []);
      let w = liste.find(x => x.t === t && (x.n || '') === n);
      if (!w) { w = { t, n, d: heute() }; liste.push(w); schreiben(K_WAPPEN, liste); }
      const a = AEMTER[t], name = t === 'ehrung' ? n : a.name;
      setTimeout(() => feiern({ id: 'wneu', name, text: a.text, hat: true, n: 1, einmalig: true, verliehen: true, first: w.d, svg: g => wappenSVG(t, g) }, 'Neues Wappen'), 500);
      if (document.getElementById('sammlung-overlay').classList.contains('open')) render();
      return name;
    },
    // Aus einem Code (js/gutschein.js): Wappen oder frei gestaltete Trophäe. Rückgabe: Meldung für das Einlöse-Fenster
    verleihen(p) {
      if (p.t !== 'trophaee') return '🛡️ Wappen erhalten: ' + this.wappen(p.t, p.n);
      const v = { n: String(p.n || 'Trophäe').slice(0, 60), x: String(p.x || '').slice(0, 160), s: Math.max(1, Math.min(5, parseInt(p.s) || 3)), a: String(p.a || 'stern').slice(0, 12), d: heute() };
      const liste = lesen(K_VERL, []); liste.push(v); schreiben(K_VERL, liste);
      setTimeout(() => feiern({ id: 'vneu', name: v.n, text: v.x || 'Eine persönliche Trophäe.', stufe: v.s, hat: true, n: 1, einmalig: true, verliehen: true, first: v.d,
        svg: g => trophaeSVG({ art: v.a, stufe: v.s }, g, false) }, 'Neue Trophäe'), 500);
      if (document.getElementById('sammlung-overlay').classList.contains('open')) render();
      return '🏆 Trophäe erhalten: ' + v.n;
    },
    AEMTER: Object.keys(AEMTER),
    // Alles, was in der Sammlung liegt – für das Profil (Aushängeschild, Rahmenfarbe)
    stand: () => stand(),
    // Ein paar Beispielstücke als SVG, z. B. für die Neuigkeiten-Tour
    vorschau: g => [buildMedalSVG(Math.round(g * 0.86), MEDAL_TIERS[15]), trophaeSVG({ art: 'fest', schild: '2026' }, g, false), trophaeSVG({ art: 'reaktion', stufe: 3, schild: '0,9 s' }, g, false),
      trophaeSVG({ art: 'jackpot', stufe: 5 }, g, false), wappenSVG('bier', Math.round(g * 0.9)), spangeSVG(9, Math.round(g * 1.15), false)],
  };

  // Rekorde, die sich nicht aus dem Verlauf berechnen lassen, werden hier mitgeschrieben
  window.Rekorde = {
    gewinn(n, spiel) {
      n = Math.floor(n); if (!(n > 0)) return;
      const rk = lesen(K_REK, {});
      if (!rk.gewinn || n > rk.gewinn.v) { rk.gewinn = { v: n, d: heute(), spiel: String(spiel || '').slice(0, 30) }; schreiben(K_REK, rk); }
    },
    konto(n) {
      n = Math.floor(n); if (!(n > 0)) return;
      const rk = lesen(K_REK, {});
      if (!rk.konto || n > rk.konto.v) { rk.konto = { v: n, d: heute() }; schreiben(K_REK, rk); }
    },
  };
})();

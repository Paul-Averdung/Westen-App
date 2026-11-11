// Profil: der fünfte Reiter. Avatar mit Rahmen in der Farbe der höchsten Medaille, Spitzname,
// Aushängeschild (drei Lieblingsstücke aus der Sammlung) und die Summen über alle Abende.
//   localStorage 'hopfenkonto_profil' = { name, avatar: { haut, gesicht, … }, schild: [id, id, id] }
// Die Summen werden – wie die Medaillen – aus dem Verlauf plus dem laufenden Abend berechnet.
// Figur: js/avatar.js · Stücke und Rahmenfarbe: js/sammlung.js · Optik: css/profil.css
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const KEY = 'hopfenkonto_profil';
  const lesen = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e) { return {}; } };
  const schreiben = p => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch(e) {} };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = id => document.getElementById(id);
  const START = { haut: 'h2', gesicht: 'rund', frisur: 'kurz', haar: 'braun', bart: 'ohne', augen: 'normal', mund: 'laecheln', brille: 'ohne', hut: 'schuetzenhut' };
  const SCHLICHT = ['#5a7a3a', '#3B6D11', '#27500A'];

  // Alle Stücke der Sammlung als flache Liste (nur die, die man hat)
  function stuecke(s) {
    return s.medaillen.concat(...s.gruppen.map(g => g.teile), s.wappen, s.treue).filter(t => t.hat);
  }
  // Rahmenfarbe = höchste Medaille der Sammlung
  function rahmen(s) {
    const hoechste = s.medaillen.filter(m => m.hat).pop();
    if (!hoechste) return SCHLICHT;
    const t = MEDAL_TIERS[parseInt(hoechste.id.slice(1))];
    return [_mix(t.fill, 0.5), t.fill, t.shade];
  }
  // Vorschlag, solange noch nichts gewählt wurde: höchste Medaille, neuestes Schützenfest, dann das Wertvollste vom Rest
  function vorschlag(s) {
    const alle = stuecke(s), wahl = [];
    const med = s.medaillen.filter(m => m.hat).pop(); if (med) wahl.push(med.id);
    const fest = alle.filter(t => /^fest\d/.test(t.id)).pop(); if (fest) wahl.push(fest.id);
    const rest = s.wappen.concat(alle.filter(t => t.stufe).sort((a, b) => b.stufe - a.stufe), s.treue.filter(t => t.hat).reverse(), alle);
    rest.forEach(t => { if (wahl.length < 3 && t.hat && !wahl.includes(t.id)) wahl.push(t.id); });
    while (wahl.length < 3) wahl.push(null);
    return wahl;
  }

  // Summen über alle Abende im Verlauf plus den laufenden
  function summen() {
    const L = { b02: 0.2, b033: 0.33, b05: 0.5 }, z = { bier: 0, shots: 0, misch: 0, manta: 0 };
    const zaehl = e => {
      if (e.key === 'manta') z.manta += e.dir;
      else if (e.key === 'shots') z.shots += e.dir * (entryAmt(e) || 0);
      else if (e.key === 'misch') z.misch += e.dir * (entryAmt(e) || 0);
      else if (L[e.key]) z.bier += e.dir * L[e.key];
      else if (e.key === 'bfree') z.bier += e.dir * (e.amt || 0);
    };
    loadHistory().forEach(t => (t.entries || []).forEach(zaehl));
    drinkLog.forEach(zaehl);
    Object.keys(z).forEach(k => { z[k] = Math.max(0, z[k]); });
    return z;
  }
  const zahl = (n, st) => (Math.round(n * Math.pow(10, st)) / Math.pow(10, st)).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: st });

  let _stand = null;
  function render() {
    const p = lesen(), s = _stand = Trophaeen.stand(), R = rahmen(s);
    const alle = stuecke(s), nachId = Object.fromEntries(alle.map(t => [t.id, t]));
    const schild = (p.schild || vorschlag(s)).slice(0, 3); while (schild.length < 3) schild.push(null);
    const jahr = new Date().getFullYear(), ej = parseInt(localStorage.getItem('hopfenkonto_entry_year') || '');
    const dabei = !isNaN(ej) && ej > 1900 && ej <= jahr
      ? 'Dabei seit ' + ej + (jahr - ej > 0 ? ' · ' + (jahr - ej) + (jahr - ej === 1 ? ' Jahr' : ' Jahre') : '')
      : '';
    const z = summen();
    $('pf-inhalt').innerHTML = `
      <div class="pf-karte">
        <button class="pf-zahnrad" onclick="toggleSettings()" aria-label="Einstellungen"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.49.49 0 0 0 13.92 2.400H10.080a.49.49 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.720 8.870c-.12.22-.07.47.12.61l2.030 1.580c-.05.300-.07.630-.07.940s.02.640.07.940L2.840 14.520c-.18.140-.23.410-.12.610l1.920 3.320c.12.220.37.290.59.220l2.390-.960c.5.380 1.030.700 1.620.940l.36 2.540c.05.240.24.410.48.410h3.840c.24 0 .44-.170.47-.410l.36-2.540c.59-.240 1.130-.560 1.620-.940l2.390.960c.22.080.47 0 .59-.220l1.920-3.320c.12-.220.07-.470-.12-.610l-2.010-1.580zM12 15.600a3.600 3.600 0 1 1 0-7.200 3.600 3.600 0 0 1 0 7.200z"/></svg></button>
        <button class="pf-avatar" onclick="avatarBearbeiten()" aria-label="Avatar ändern">${avatarSVG(Object.assign({}, START, p.avatar), 132, R)}</button>
        <div class="pf-name">${p.name ? esc(p.name) : 'Jungschütze'}</div>
        ${dabei ? `<div class="pf-dabei">${dabei}</div>` : `<button class="pf-dabei pf-link" onclick="toggleSettings()">Eintrittsjahr eintragen ›</button>`}
        <button class="pf-aendern" onclick="avatarBearbeiten()">${p.avatar || p.name ? 'Avatar und Name ändern' : 'Avatar und Name festlegen'}</button>
      </div>
      <div class="pf-label"><span>Aushängeschild</span></div>
      <div class="pf-schild">${schild.map((id, i) => { const t = id && nachId[id];
        return `<button onclick="schildWahl(${i})" class="${t ? '' : 'leer'}">${t ? `<span>${t.svg(/^tr\d/.test(t.id) ? 92 : 66)}</span><b>${esc(t.name)}</b>` : `<span class="pf-plus">+</span><b>${alle.length ? 'Auswählen' : 'Noch leer'}</b>`}</button>`; }).join('')}</div>
      <div class="pf-label"><span>Insgesamt</span></div>
      <div class="pf-zahlen">
        <div><b>${zahl(z.bier, 1)} l</b><i>Bier</i></div><div><b>${zahl(z.shots, 0)} cl</b><i>Shots</i></div>
        <div><b>${zahl(z.misch, 0)} cl</b><i>Mischen</i></div><div><b>${zahl(z.manta, 0)}</b><i>${z.manta === 1 ? 'Mantaplatte' : 'Mantaplatten'}</i></div>
      </div>
      <div class="pf-zeilen">
        <button onclick="openSammlung()"><span>🏆</span>Sammlung<u>${alle.length} ›</u></button>
        <button onclick="openVerlauf()"><span>📖</span>Verlauf<u>›</u></button>
      </div>`;
  }

  window.openProfil = function() { render(); const o = $('profil-overlay'); o.classList.add('open'); };
  window.closeProfil = function() { $('profil-overlay').classList.remove('open'); };
  const neu = () => { if ($('profil-overlay').classList.contains('open')) render(); };

  // ── Aushängeschild wählen ────────────────────────────────────────────────
  let _platz = 0;
  window.schildWahl = function(i) {
    _platz = i;
    const p = lesen(), s = _stand || Trophaeen.stand(), alle = stuecke(s);
    const aktuell = (p.schild || vorschlag(s));
    $('sw-raster').innerHTML = alle.length
      ? alle.map(t => `<button class="${aktuell[i] === t.id ? 'on' : ''}${aktuell.includes(t.id) && aktuell[i] !== t.id ? ' belegt' : ''}" onclick="schildSetzen('${t.id}')"><span>${t.svg(/^tr\d/.test(t.id) ? 78 : 56)}</span><b>${esc(t.name)}</b></button>`).join('') +
        (aktuell[i] ? `<button class="sw-leer" onclick="schildSetzen('')"><span class="pf-plus">×</span><b>Leer lassen</b></button>` : '')
      : '<p>Noch nichts in der Sammlung. Medaillen bekommst du beim Zählen, Trophäen beim Spielen.</p>';
    $('schild-wahl').classList.add('open');
  };
  window.schildWahlZu = function() { $('schild-wahl').classList.remove('open'); };
  window.schildSetzen = function(id) {
    const p = lesen(), s = _stand || Trophaeen.stand();
    const schild = (p.schild || vorschlag(s)).slice(0, 3); while (schild.length < 3) schild.push(null);
    const schon = schild.indexOf(id);
    if (id && schon > -1 && schon !== _platz) schild[schon] = schild[_platz];   // schon gewählt: Plätze tauschen
    schild[_platz] = id || null;
    p.schild = schild; schreiben(p);
    schildWahlZu(); render();
  };

  // ── Avatar-Editor ────────────────────────────────────────────────────────
  const REITER = [['gesicht', 'Gesicht'], ['frisur', 'Frisur'], ['bart', 'Bart'], ['augen', 'Augen'], ['mund', 'Mund'], ['brille', 'Brille'], ['hut', 'Hut']];
  let _entwurf = null, _reiter = 'gesicht';
  function buehne() { $('ae-buehne').innerHTML = avatarSVG(_entwurf, 150, rahmen(_stand || Trophaeen.stand())); }
  function auswahl() {
    $('ae-reiter').innerHTML = REITER.map(r => `<button class="${r[0] === _reiter ? 'on' : ''}" onclick="avatarReiter('${r[0]}')">${r[1]}</button>`).join('');
    const farben = (teil, titel) => `<div class="pf-label"><span>${titel}</span></div><div class="ae-farben">${AVATAR_TEILE[teil].map(v =>
      `<button class="${_entwurf[teil] === v ? 'on' : ''}" style="background:${AVATAR_FARBEN[teil][v]}" onclick="avatarSetze('${teil}','${v}')" aria-label="${v}"></button>`).join('')}</div>`;
    // Vorschaubilder ohne Beschriftung; bei Frisuren ohne Hut, damit man die Haare sieht
    const raster = teil => `<div class="ae-raster">${AVATAR_TEILE[teil].map(v =>
      `<button class="${_entwurf[teil] === v ? 'on' : ''}" onclick="avatarSetze('${teil}','${v}')" aria-label="${v}">${avatarSVG(Object.assign({}, _entwurf, { [teil]: v }, teil === 'frisur' ? { hut: 'ohne' } : {}), 70, ['#3B6D11', '#3B6D11', '#27500A'])}</button>`).join('')}</div>`;
    $('ae-auswahl').innerHTML = _reiter === 'gesicht' ? farben('haut', 'Hautton') + '<div class="pf-label"><span>Gesichtsform</span></div>' + raster('gesicht')
      : _reiter === 'frisur' ? farben('haar', 'Haarfarbe') + '<div class="pf-label"><span>Frisur</span></div>' + raster('frisur')
      : raster(_reiter);
  }
  window.avatarBearbeiten = function() {
    const p = lesen();
    _entwurf = Object.assign({}, START, p.avatar); _reiter = 'gesicht';
    $('ae-name').value = p.name || '';
    buehne(); auswahl();
    const o = $('avatar-editor'); o.classList.add('open'); o.scrollTop = 0;
  };
  window.avatarReiter = function(r) { _reiter = r; auswahl(); };
  window.avatarSetze = function(teil, wert) { _entwurf[teil] = wert; buehne(); auswahl(); };
  window.avatarAbbrechen = function() { $('avatar-editor').classList.remove('open'); };
  window.avatarFertig = function() {
    const p = lesen();
    p.avatar = _entwurf; p.name = $('ae-name').value.trim().slice(0, 16);
    schreiben(p);
    $('avatar-editor').classList.remove('open');
    neu();
  };

  // Profil frisch zeichnen, wenn darunter etwas geändert wurde (Eintrittsjahr, Sammlung, Verlauf)
  function start() {
    ['settings-overlay', 'sammlung-overlay', 'verlauf-overlay'].forEach(id => {
      const el = $(id); if (!el) return;
      new MutationObserver(neu).observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

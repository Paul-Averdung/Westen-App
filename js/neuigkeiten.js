// Neuigkeiten-Tour: Kacheln zum Durchwischen, die einmalig nach einem größeren Update erscheinen.
// Neue Tour ausspielen: VERSION ändern (z. B. '2027-06') und SLIDES anpassen – dann sehen sie alle noch einmal.
// Gemerkt wird das in localStorage 'hopfenkonto_neuigkeiten'. Optik in css/neuigkeiten.css.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const VERSION = '2026-11';
  const KEY = 'hopfenkonto_neuigkeiten';
  const ls = { get: k => { try { return localStorage.getItem(k); } catch(e) { return null; } },
               set: (k, v) => { try { localStorage.setItem(k, v); } catch(e) {} } };

  const TIER = { gewoehnlich: 'Gewöhnlich', selten: 'Selten', episch: 'Episch', legendaer: 'Legendär' };
  // Vorschaubild aus dem Shop (js/shop.js) mit Name und Seltenheit
  function shopKachel(kind, id) {
    const src = kind === 'themes' ? THEMES : kind === 'skins' ? SLOT_SKINS : COSMETICS[kind].items;
    const item = src[id];
    return `<div class="nw-item t-${item.tier}">${shopThumb(kind, id)}<div class="nw-item-name">${item.name}</div><div class="nw-item-tier">${TIER[item.tier] || ''}</div></div>`;
  }
  const raster = teile => `<div class="nw-grid">${teile.map(t => shopKachel(t[0], t[1])).join('')}</div>`;

  const SLIDES = [
    { kicker: 'Großes Update', title: 'Neu im Hopfenkonto',
      text: 'Es hat sich einiges getan: ein Casino, ein Shop und neue Designs für die ganze App. Wisch einmal durch – dauert keine halbe Minute.',
      bild: () => `<div class="nw-hero"><img src="img/wappen.png" alt=""><div class="nw-hero-icons"><span>🎰</span><span>🛍️</span><span>🎨</span></div></div>` },
    { kicker: 'Casino', title: 'Fünf Spiele, ein Casino',
      text: 'Hopfen-Slots, Hoch oder Tief, Pferderennen, Blackjack und Roulette. Zum Start gibt es 100 Coins, danach jeden Tag 30 dazu.',
      bild: () => `<div class="nw-games">${CASINO_GAMES.map(g => `<div class="nw-game" style="background:${g.bg}"><div class="nw-game-icon">${g.icon}</div><div class="nw-game-name">${g.name}</div></div>`).join('')}</div>` },
    { kicker: 'Shop', title: 'Gib deine Coins aus',
      text: 'Kartenrücken, Tischfilz, Rennbahnen, Renntiere, Roulette-Kessel und Automaten-Skins.',
      bild: () => raster([['racer', 'dino'], ['cardback', 'gold'], ['skins', 'neon'], ['wheel', 'neon']]) },
    { kicker: 'Themes', title: 'Die App in deinem Look',
      text: 'Von Nachtblau bis Bierzelt bekommt die ganze App ein neues Design. Manche Themes gibt es nur zur passenden Zeit – Karneval ab dem 11.11., Schützenfest rund um Fronleichnam.',
      bild: () => raster([['themes', 'bierzelt'], ['themes', 'karneval'], ['themes', 'abendrot'], ['themes', 'gold']]) },
    { kicker: 'Coins', title: 'So kommst du an Coins',
      text: 'Jeden Tag gibt es 30 Coins geschenkt, den Rest holst du dir im Casino.',
      bild: () => `<div class="nw-list">
        <div class="nw-row"><span>🎁</span><div><b>Tages-Coins</b><i>Einmal täglich das Casino öffnen</i></div></div>
        <div class="nw-row"><span>🎟️</span><div><b>Gutscheine</b><i>Einlösen im Casino unter „Gutschein einlösen“</i></div></div>
        <div class="nw-row"><span>🏅</span><div><b>Außerdem neu</b><i>Neue Orden, Sounds und Mengen-Regler für Shots und Mischgetränke</i></div></div>
      </div>` },
  ];

  let el = null, track = null, aktuell = 0;

  function bauen() {
    el = document.createElement('div');
    el.id = 'news-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Neuigkeiten');
    el.innerHTML = `
      <button class="nw-skip" type="button">Überspringen</button>
      <div class="nw-track">${SLIDES.map((s, i) => `
        <section class="nw-slide" aria-label="${i + 1} von ${SLIDES.length}">
          <div class="nw-bild">${s.bild()}</div>
          <div class="nw-kicker">${s.kicker}</div>
          <h2 class="nw-title">${s.title}</h2>
          <p class="nw-text">${s.text}</p>
        </section>`).join('')}
      </div>
      <div class="nw-foot">
        <div class="nw-dots">${SLIDES.map((_, i) => `<button type="button" class="nw-dot" aria-label="Kachel ${i + 1}"></button>`).join('')}</div>
        <button class="nw-next" type="button">Weiter</button>
        <button class="nw-casino" type="button">🎰 Direkt ins Casino</button>
      </div>`;
    document.body.appendChild(el);
    track = el.querySelector('.nw-track');

    el.querySelector('.nw-skip').onclick = () => schliessen();
    el.querySelector('.nw-next').onclick = () => aktuell >= SLIDES.length - 1 ? schliessen() : gehe(aktuell + 1);
    el.querySelector('.nw-casino').onclick = () => { schliessen(); if (window.openCasino) openCasino(); };
    el.querySelectorAll('.nw-dot').forEach((d, i) => { d.onclick = () => gehe(i); });
    let warten = false;
    track.addEventListener('scroll', () => {
      if (warten) return;
      warten = true;
      requestAnimationFrame(() => { warten = false; zeige(Math.round(track.scrollLeft / track.clientWidth)); });
    }, { passive: true });
  }

  function gehe(i) {
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  }

  function zeige(i) {
    i = Math.max(0, Math.min(SLIDES.length - 1, i));
    aktuell = i;
    const letzte = i === SLIDES.length - 1;
    el.querySelectorAll('.nw-dot').forEach((d, n) => d.classList.toggle('on', n === i));
    el.querySelectorAll('.nw-slide').forEach((s, n) => s.classList.toggle('on', n === i));
    el.querySelector('.nw-next').textContent = letzte ? 'Los geht’s' : 'Weiter';
    el.classList.toggle('nw-ende', letzte);
  }

  function schliessen() {
    ls.set(KEY, VERSION);
    if (!el) return;
    el.classList.remove('open');
    const weg = el; el = null;
    setTimeout(() => weg.remove(), 220);
  }

  window.openNeuigkeiten = function() {
    if (el) return;
    bauen();
    zeige(0);
    requestAnimationFrame(() => el && el.classList.add('open'));
  };

  // Einmalig beim ersten Öffnen nach dem Update
  window.addEventListener('load', () => {
    if (ls.get(KEY) === VERSION) return;
    setTimeout(() => { try { openNeuigkeiten(); } catch (e) { ls.set(KEY, VERSION); } }, 350);
  });
})();

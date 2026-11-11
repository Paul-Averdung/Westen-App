// Navigation unten: Zähler · Spiele · Casino · Shop · Profil.
// Jeder Bereich außer dem Zähler ist ein bildschirmfüllendes Fenster; die Leiste liegt darüber.
// Einzelne Spiele, Verlauf, Orden usw. öffnen sich wie bisher über der Leiste (z-index in css/nav.css).
// Welcher Reiter leuchtet, wird aus dem Zustand der Fenster abgelesen – so stimmt die Leiste auch,
// wenn ein Fenster von anderer Stelle geöffnet wird (z. B. „‹ Casino“ in einem Spiel).
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const $ = id => document.getElementById(id);
  const hatKlasse = id => () => $(id).classList.contains('open');

  const BEREICHE = {
    spiele: { el: 'spiele-overlay',   offen: hatKlasse('spiele-overlay'),
              auf: () => $('spiele-overlay').classList.add('open'), zu: () => $('spiele-overlay').classList.remove('open') },
    casino: { el: 'casino-overlay',   offen: hatKlasse('casino-overlay'), auf: () => openCasino(), zu: () => closeCasino() },
    shop:   { el: 'shop-overlay',     offen: hatKlasse('shop-overlay'),   auf: () => openShop(),   zu: () => closeShop() },
    profil: { el: 'profil-overlay',   offen: hatKlasse('profil-overlay'), auf: () => openProfil(), zu: () => closeProfil() },
  };

  function aktiv() {
    return Object.keys(BEREICHE).find(k => BEREICHE[k].offen()) || 'home';
  }

  function abgleich() {
    const a = aktiv();
    document.querySelectorAll('#tabbar .tb-item').forEach(b => {
      const an = b.dataset.tab === a;
      b.classList.toggle('on', an);
      if (an) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
  }

  window.showTab = function(id) {
    // Läuft gerade ein „Anprobieren“ aus dem Shop, wird es sauber beendet
    const probe = $('shop-trybar');
    if (probe && probe.classList.contains('show') && window.shopEndTry) shopEndTry();

    const vorher = aktiv();
    if (id === vorher) {
      // Noch einmal auf den aktiven Reiter: zurück nach oben
      if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
      else $(BEREICHE[id].el).scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    Object.keys(BEREICHE).forEach(k => { if (k !== id && BEREICHE[k].offen()) BEREICHE[k].zu(); });
    if (id === 'home') {
      const app = document.querySelector('.app');
      app.classList.remove('tb-rein'); void app.offsetWidth; app.classList.add('tb-rein');
    } else {
      BEREICHE[id].auf();
      $(BEREICHE[id].el).scrollTop = 0;
    }
    abgleich();
  };

  function start() {
    if (!$('tabbar')) return;
    const mo = new MutationObserver(abgleich);
    Object.keys(BEREICHE).forEach(k => mo.observe($(BEREICHE[k].el), { attributes: true, attributeFilter: ['class', 'style'] }));
    abgleich();
    // Kopfzeilen bekommen ihren dunklen Hintergrund erst, wenn darunter gescrollt wird –
    // oben läuft der Hintergrund so ohne Kante bis an den Bildschirmrand durch.
    ['game-overlay', 'shop-overlay', 'sammlung-overlay'].forEach(id => {
      const el = $(id); if (!el) return;
      el.addEventListener('scroll', () => el.classList.toggle('gescrollt', el.scrollTop > 6), { passive: true });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

// Offline-Betrieb: meldet den Service Worker (sw.js) an und zeigt einen Hinweis,
// sobald eine neue Version der App bereitliegt.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.

(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  const PAUSE_MS = 10 * 60 * 1000;   // höchstens alle 10 Minuten nach Updates fragen
  let letztePruefung = 0;

  function zeigeHinweis() {
    if (document.getElementById('hk-update-hinweis')) return;
    const b = document.createElement('button');
    b.id = 'hk-update-hinweis';
    b.type = 'button';
    b.textContent = '✨ Neue Version – tippen zum Aktualisieren';
    b.style.cssText = 'position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);' +
      'z-index:20000;max-width:92%;white-space:nowrap;padding:11px 16px;border-radius:999px;border:1px solid #EFC93D;' +
      'background:#173404;color:#EFC93D;font-size:13px;font-weight:600;cursor:pointer;' +
      'box-shadow:0 6px 20px rgba(0,0,0,.45);font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
    b.onclick = () => location.reload();
    document.body.appendChild(b);
  }

  // Fragt den Service Worker, ob es etwas Neues gibt. Ergebnis: true = neue Version liegt bereit.
  function pruefe(erzwingen) {
    const jetzt = Date.now();
    if (!erzwingen && jetzt - letztePruefung < PAUSE_MS) return Promise.resolve(false);
    letztePruefung = jetzt;
    return navigator.serviceWorker.ready.then(reg => new Promise(resolve => {
      if (!reg.active) return resolve(false);
      const kanal = new MessageChannel();
      const ende = setTimeout(() => resolve(false), 8000);
      kanal.port1.onmessage = e => { clearTimeout(ende); resolve(!!(e.data && e.data.update)); };
      reg.active.postMessage({ type: 'check' }, [kanal.port2]);
    })).catch(() => false);
  }

  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.type === 'update-ready') zeigeHinweis();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(() => pruefe(true)).catch(() => {});
  });

  // Homescreen-Apps bleiben oft tagelang im Hintergrund offen – beim Zurückkommen nachsehen.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pruefe(false);
  });

  // Knopf „App aktualisieren“ in den Einstellungen: erst nachsehen, dann neu laden.
  window.hkAppAktualisieren = function (btn) {
    if (btn) { btn.disabled = true; btn.textContent = '🔄 Suche nach Updates …'; }
    pruefe(true).then(() => location.reload());
  };
})();

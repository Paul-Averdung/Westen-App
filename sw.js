// Hopfenkonto – Service Worker: die App startet auch ohne Netz.
//
// So funktioniert es (kein Pflegeaufwand, keine Versionsnummer zum Hochzählen):
//  • Beim ersten Besuch werden die Seite und alle Dateien, die hopfenkonto.html einbindet
//    (CSS, JS, Bilder, Chart.js), in einen Cache gelegt. Die Dateiliste wird aus der Seite
//    selbst gelesen – neue Dateien werden also automatisch mit erfasst.
//  • Danach kommt alles sofort aus dem Cache, egal ob Netz da ist oder nicht.
//  • Die Seite bittet beim Öffnen um eine Update-Prüfung ('check'). Hat sich auf dem Server
//    etwas geändert, wird ein KOMPLETTER neuer Cache gebaut und erst dann umgeschaltet –
//    es gibt nie einen Mix aus alten und neuen Dateien. Die Seite zeigt dann einen Hinweis.
//  • Geht irgendetwas schief, wird einfach normal aus dem Netz geladen.
//
// Der Service Worker speichert ausschließlich die App-Dateien. Spielstände (localStorage)
// fasst er nicht an.

const PREFIX = 'hk-cache-';
const MARKER = new URL('__vollstaendig__', self.registration.scope).href;
const PAGE = new URL('hopfenkonto.html', self.registration.scope).href;
const CDN_OK = 'https://cdnjs.cloudflare.com/';
const MATCH = { ignoreVary: true };

let aktiv = null;          // Promise<string|null>: Name des aktiven (vollständigen) Caches
let pruefung = null;       // läuft gerade eine Update-Prüfung?

function findeAktiv() {
  return caches.keys().then(async keys => {
    const namen = keys.filter(k => k.startsWith(PREFIX)).sort().reverse();
    for (const n of namen) {
      const c = await caches.open(n);
      if (await c.match(MARKER)) return n;
    }
    return null;
  });
}
function aktiverCache() {
  if (!aktiv) aktiv = findeAktiv();
  return aktiv;
}

function erlaubt(url) {
  return url.startsWith(self.registration.scope) || url.startsWith(CDN_OK);
}

// Alle Dateien, die die Seite einbindet (src="…" / href="…"), als absolute Adressen.
function dateienAus(html) {
  const out = new Set();
  const re = /<(?:script|link|img)\b[^>]*?\b(?:src|href)\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    const roh = m[1];
    if (/^(data:|blob:|#|javascript:)/i.test(roh)) continue;
    let u;
    try { u = new URL(roh, PAGE); } catch (e) { continue; }
    u.hash = '';
    if (erlaubt(u.href)) out.add(u.href);
  }
  return [...out];
}

// Holt eine Datei frisch vom Server. Ist sie unverändert (ETag gleich), wird die
// vorhandene Kopie weiterverwendet – das kostet dann nur ein paar Bytes.
async function hole(url, alt) {
  const fremd = !url.startsWith(self.registration.scope);
  if (fremd) {
    // Versionierte CDN-Datei: ändert sich nie, also nur einmal laden.
    if (alt) return { res: alt, neu: false };
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error(url + ' → ' + res.status);
    return { res, neu: true };
  }
  const etag = alt && alt.headers.get('ETag');
  const init = { credentials: 'same-origin' };
  if (etag) init.headers = { 'If-None-Match': etag };
  else init.cache = 'no-cache';
  const res = await fetch(url, init);
  if (res.status === 304 && alt) return { res: alt, neu: false };
  if (!res.ok) throw new Error(url + ' → ' + res.status);
  if (alt) {
    // Sicherheitsnetz: Inhalt direkt vergleichen (falls der Server trotz gleichem Stand neu liefert).
    const [a, b] = await Promise.all([alt.clone().arrayBuffer(), res.clone().arrayBuffer()]);
    if (a.byteLength === b.byteLength) {
      const x = new Uint8Array(a), y = new Uint8Array(b);
      let gleich = true;
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) { gleich = false; break; }
      if (gleich) return { res: alt, neu: false };
    }
  }
  return { res, neu: true };
}

// Baut bei Bedarf einen neuen, vollständigen Cache. Rückgabe: true = neue Version liegt bereit.
async function pruefe() {
  const altName = await aktiverCache();
  const alt = altName ? await caches.open(altName) : null;
  const vorher = async url => (alt ? (await alt.match(url, MATCH)) || null : null);

  // 1. Seite holen und daraus die Pflicht-Dateien lesen
  const seite = await hole(PAGE, await vorher(PAGE));
  const pflicht = dateienAus(await seite.res.clone().text()).filter(u => u !== PAGE);

  // 2. Zusätzlich alles, was bisher schon im Cache lag (z. B. später nachgeladene Dateien)
  const extra = [];
  if (alt) {
    for (const req of await alt.keys()) {
      if (req.url !== PAGE && req.url !== MARKER && !pflicht.includes(req.url) && erlaubt(req.url)) extra.push(req.url);
    }
  }

  const eintraege = [[PAGE, seite]];
  await Promise.all(pflicht.map(async url => {
    const alte = await vorher(url);
    try {
      eintraege.push([url, await hole(url, alte)]);
    } catch (e) {
      // Die CDN-Datei darf fehlen (dann lädt die Seite sie wie bisher direkt) – alles andere nicht.
      if (url.startsWith(self.registration.scope)) throw e;
    }
  }));
  await Promise.all(extra.map(async url => {
    try { eintraege.push([url, await hole(url, await vorher(url))]); } catch (e) { /* gibt es nicht mehr */ }
  }));

  const geaendert = !alt || eintraege.some(([, e]) => e.neu) ||
    (await alt.keys()).filter(r => r.url !== MARKER).length !== eintraege.length;
  if (!geaendert) return false;

  // 3. Neuen Cache komplett füllen, erst ganz zum Schluss als vollständig markieren
  const neuName = PREFIX + String(Date.now()).padStart(15, '0');
  const neu = await caches.open(neuName);
  try {
    await Promise.all(eintraege.map(([url, e]) => neu.put(url, e.res.clone())));
    await neu.put(MARKER, new Response('ok'));
  } catch (e) {
    await caches.delete(neuName);
    throw e;
  }
  aktiv = Promise.resolve(neuName);
  for (const k of await caches.keys()) {
    if (k.startsWith(PREFIX) && k !== neuName) await caches.delete(k);
  }
  return !!alt;   // beim allerersten Füllen gibt es nichts zu melden
}

function pruefeEinmal() {
  if (!pruefung) {
    pruefung = pruefe().finally(() => { pruefung = null; });
  }
  return pruefung;
}

self.addEventListener('install', event => {
  self.skipWaiting();
  // Erstes Füllen. Klappt es nicht (z. B. Netz weg), wird es beim nächsten Öffnen nachgeholt.
  event.waitUntil(pruefeEinmal().catch(() => {}));
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'check') return;
  const antwort = msg => { if (event.ports && event.ports[0]) event.ports[0].postMessage(msg); };
  event.waitUntil(
    pruefeEinmal().then(async neu => {
      antwort({ type: 'check-done', update: neu });
      if (neu) {
        const alle = await self.clients.matchAll({ type: 'window' });
        alle.forEach(c => c.postMessage({ type: 'update-ready' }));
      }
    }).catch(() => antwort({ type: 'check-done', update: false, offline: true }))
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !erlaubt(req.url)) return;
  const url = new URL(req.url);
  url.hash = '';
  const istSeite = req.mode === 'navigate';
  // Die Seite wird auch mit Zusätzen wie ?theme=… gefunden.
  const schluessel = istSeite && url.origin + url.pathname === PAGE ? PAGE : url.href;

  event.respondWith((async () => {
    let cache = null;
    try {
      const name = await aktiverCache();
      if (name) {
        cache = await caches.open(name);
        const treffer = await cache.match(schluessel, MATCH);
        if (treffer) return treffer;
      }
    } catch (e) { /* weiter mit Netz */ }
    const res = await fetch(req);
    // Eigene Dateien, die (noch) nicht im Cache liegen, für das nächste Mal merken.
    if (cache && res.ok && res.type === 'basic' && !istSeite && !url.search) {
      cache.put(schluessel, res.clone()).catch(() => {});
    }
    return res;
  })());
});

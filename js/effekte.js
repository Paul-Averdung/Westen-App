// Effekte: alles, was Gewinnen (und Verlieren) spürbar macht – für alle Casino-Spiele und den Shop.
//   Effekte.gewinn({ betrag, einsatz, von, vor, spiel })  Münzen fliegen ins Konto, Zahl zählt hoch, Banner je Stufe
//   Effekte.verlust({ von, spiel })                        kurzes Wackeln, leiser Ton
//   Effekte.kauf({ bild, name, stufe, stufeName }, danach) Enthüllung nach einem Kauf im Shop
// Stufen richten sich nach Auszahlung ÷ Einsatz: Gewinn, Großer Gewinn (ab GROSS_AB), Riesengewinn (ab RIESEN_AB).
// Nichts davon blockiert das Spiel: Die Ebene fängt keine Tipper ab, ein Tipp blendet Banner sofort aus.
// Optik in css/effekte.css.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const GROSS_AB = 5, RIESEN_AB = 20, SERIE_AB = 3;
  const ruhig = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const zufall = (a, b) => a + Math.random() * (b - a);
  const fmt = n => Math.round(n).toLocaleString('de-DE');
  const sichtbar = el => !!(el && el.getClientRects().length);
  const finde = sel => { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; return sichtbar(el) ? el : null; };
  const mitte = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const brummen = m => { try { if (navigator.vibrate) navigator.vibrate(m); } catch(e) {} };   // nur Android

  let _ebene = null;
  function ebene() {
    if (!_ebene || !_ebene.isConnected) { _ebene = document.createElement('div'); _ebene.id = 'fx-ebene'; document.body.appendChild(_ebene); }
    return _ebene;
  }
  // Die gerade sichtbare Coin-Anzeige (Spiel, Slots, Casino oder Shop)
  const kontoAnzeige = () => ['#game-coins', '#slots-coins-val', '#casino-coins', '#shop-coins'].map(s => document.querySelector(s)).find(sichtbar) || null;

  // ── Münzen fliegen in einem Bogen zum Konto ──────────────────────────────
  function muenzen(von, nach, anzahl, beiAnkunft) {
    const E = ebene();
    for (let i = 0; i < anzahl; i++) {
      const a = document.createElement('div'), b = document.createElement('i');
      a.className = 'fx-muenze'; a.appendChild(b);
      const sx = von.x + zufall(-26, 26), sy = von.y + zufall(-16, 16);
      a.style.left = sx + 'px'; a.style.top = sy + 'px';
      E.appendChild(a);
      const dauer = zufall(520, 780), delay = i * 36;
      a.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${nach.x - sx}px)` }], { duration: dauer, delay, easing: 'cubic-bezier(.5,0,.9,.65)', fill: 'both' });
      const flug = b.animate([
        { transform: 'translateY(0) scale(0.3)', opacity: 0 },
        { transform: `translateY(${-zufall(26, 70)}px) scale(1.15)`, opacity: 1, offset: 0.28 },
        { transform: `translateY(${nach.y - sy}px) scale(0.65)`, opacity: 1 },
      ], { duration: dauer, delay, easing: 'cubic-bezier(.35,0,.65,1)', fill: 'both' });
      flug.onfinish = () => { a.remove(); if (beiAnkunft) { beiAnkunft(); beiAnkunft = null; } };
    }
  }

  // ── Kontostand zählt hoch ────────────────────────────────────────────────
  let _zaehlNr = 0;
  function zaehle(el, von, bis, dauer) {
    const nr = String(++_zaehlNr), t0 = performance.now();
    el.dataset.fx = nr;
    const box = el.closest('.sh-coins') || el.parentElement;
    box.classList.remove('fx-puls'); void box.offsetWidth; box.classList.add('fx-puls');
    (function schritt(jetzt) {
      if (el.dataset.fx !== nr) return;                      // inzwischen hat jemand anderes die Anzeige gesetzt
      const k = Math.max(0, Math.min(1, (jetzt - t0) / dauer));
      el.textContent = fmt(von + (bis - von) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(schritt); else { el.dataset.fx = ''; }
    })(t0);
  }

  // ── Konfetti ─────────────────────────────────────────────────────────────
  function konfetti(anzahl) {
    const E = ebene(), B = window.innerWidth, H = window.innerHeight;
    const farben = ['#FFD23A', '#FFF3B0', '#6fe08d', '#ffffff', '#ff6b81', '#5fb6ff'];
    for (let i = 0; i < anzahl; i++) {
      const s = document.createElement('div');
      s.className = 'fx-konfetti';
      s.style.background = farben[i % farben.length];
      s.style.left = B / 2 + 'px'; s.style.top = H * 0.32 + 'px';
      if (i % 3 === 0) s.style.borderRadius = '50%';
      E.appendChild(s);
      const dx = zufall(-B * 0.55, B * 0.55), hoch = zufall(60, H * 0.3), dreh = zufall(-720, 720);
      const an = s.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${-hoch}px) rotate(${dreh * 0.4}deg)`, opacity: 1, offset: 0.3, easing: 'cubic-bezier(.3,0,.7,.4)' },
        { transform: `translate(${dx}px, ${H * 0.75}px) rotate(${dreh}deg)`, opacity: 0.9 },
      ], { duration: zufall(1500, 2400), delay: zufall(0, 180), easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'both' });
      an.onfinish = () => s.remove();
    }
  }

  // ── Banner ───────────────────────────────────────────────────────────────
  const FLAMME = '<svg viewBox="0 0 24 24" width="1.1em" height="1.1em"><path d="M12 1.500c1 4.500 6 6.500 6 12a6 6 0 0 1-12 0c0-2.700 1.600-4 2.300-6.200 1.700 1 2.300 2.500 2.300 4C12.200 8.500 11 5 12 1.500z" fill="#FF7A1A"/><path d="M12 11c.6 2 2.600 2.800 2.600 5.200a2.600 2.600 0 0 1-5.200 0c0-1.300.9-2 1.300-3 .6.400 1 .9 1.100 1.600.3-1.200-.200-2.500.200-3.800z" fill="#FFD23A"/></svg>';
  function banner(stufe, netto, serie, ort) {
    const el = document.createElement('div');
    el.className = 'fx-banner fx-' + stufe;
    el.innerHTML = (stufe === 'gewinn' ? '' : `<span>${stufe === 'riesen' ? 'Riesengewinn' : 'Großer Gewinn'}</span>`) +
      `<b>+${fmt(netto)}</b>` +
      (serie >= SERIE_AB ? `<em style="font-size:${Math.min(19, 11 + serie)}px">${FLAMME}${serie}er-Serie</em>` : '');
    if (stufe === 'gewinn' && ort) { el.style.left = Math.max(70, Math.min(window.innerWidth - 70, ort.x)) + 'px'; el.style.top = Math.max(90, ort.y - 34) + 'px'; }
    el._seit = performance.now();
    ebene().appendChild(el);
    const dauer = stufe === 'gewinn' ? 1100 : stufe === 'gross' ? 1700 : 2300;
    setTimeout(() => el.classList.add('weg'), dauer);
    setTimeout(() => el.remove(), dauer + 320);
  }
  // Ein Tipp irgendwo blendet Banner und Konfetti sofort aus – niemand muss etwas abwarten
  document.addEventListener('pointerdown', () => {
    if (!_ebene) return;
    _ebene.querySelectorAll('.fx-banner:not(.weg)').forEach(b => { if (performance.now() - (b._seit || 0) > 250) { b.classList.add('weg'); setTimeout(() => b.remove(), 250); } });
    _ebene.querySelectorAll('.fx-konfetti').forEach(k => k.remove());
  }, true);

  // ── Leiser Ton beim Verlieren ────────────────────────────────────────────
  let _ton = null;
  function leiserTon() {
    if (typeof isSoundOn === 'function' && !isSoundOn()) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      _ton = _ton || new AC();
      const los = () => {
        const t = _ton.currentTime + 0.01, o = _ton.createOscillator(), g = _ton.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.22);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        o.connect(g); g.connect(_ton.destination); o.start(t); o.stop(t + 0.3);
      };
      if (_ton.state === 'suspended') _ton.resume().then(los).catch(function() {}); else los();
    } catch(e) {}
  }

  const _serie = {};   // Gewinne in Folge je Spiel

  window.Effekte = {
    // betrag = Auszahlung inkl. Einsatz. vor = Kontostand vor der Gutschrift (für das Hochzählen).
    // nurBanner: Münzen, Ton und Zähler übernimmt das Spiel selbst (Slots).
    gewinn(o) {
      const netto = o.betrag - (o.einsatz || 0);
      const anzeige = kontoAnzeige();
      if (!(netto > 0)) {                                   // Einsatz zurück oder Teilverlust: nur still nachziehen
        if (anzeige && !o.nurBanner && o.vor !== undefined) zaehle(anzeige, o.vor, o.vor + o.betrag, 500);
        return;
      }
      const mal = o.einsatz > 0 ? o.betrag / o.einsatz : 1;
      const stufe = mal >= RIESEN_AB ? 'riesen' : mal >= GROSS_AB ? 'gross' : 'gewinn';
      const serie = o.spiel ? (_serie[o.spiel] = (_serie[o.spiel] || 0) + 1) : 0;
      if (o.nurBanner) {
        if (stufe !== 'gewinn') { banner(stufe, netto, serie); if (stufe === 'riesen' && !ruhig()) konfetti(90); brummen(stufe === 'riesen' ? [40, 40, 40, 40, 140] : [30, 40, 70]); }
        return;
      }
      if (typeof slotSound === 'function') slotSound('win', stufe === 'gewinn' ? { gain: 6, small: true } : { gain: stufe === 'gross' ? 25 : 60 });
      brummen(stufe === 'riesen' ? [40, 40, 40, 40, 140] : stufe === 'gross' ? [30, 40, 70] : 20);
      // Kurz warten, bis das Spiel sein Ergebnis gezeichnet hat – dann stimmt der Startpunkt der Münzen
      setTimeout(() => {
        const start = finde(o.von), ort = start ? mitte(start) : { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
        banner(stufe, netto, serie, ort);
        if (stufe === 'riesen' && !ruhig()) konfetti(90);
        if (start && stufe !== 'gewinn') { start.classList.remove('fx-leuchten'); void start.offsetWidth; start.classList.add('fx-leuchten'); }
        const n = stufe === 'gewinn' ? 7 : stufe === 'gross' ? 14 : 22;
        const hoch = () => { if (anzeige && o.vor !== undefined) zaehle(anzeige, o.vor, o.vor + o.betrag, 500 + n * 36); };
        if (anzeige && !ruhig() && anzeige.animate) muenzen(ort, mitte(anzeige), n, hoch); else hoch();
      }, 40);
    },
    verlust(o) {
      o = o || {};
      if (o.spiel) _serie[o.spiel] = 0;
      leiserTon(); brummen(15);
      setTimeout(() => { const el = finde(o.von); if (el && !ruhig()) { el.classList.remove('fx-wackeln'); void el.offsetWidth; el.classList.add('fx-wackeln'); } }, 40);
    },
    // Enthüllung nach einem Kauf. o.bild = fertiges HTML (Vorschaubild), danach() läuft nach dem Schließen.
    kauf(o, danach) {
      const alt = document.getElementById('fx-kauf'); if (alt) alt.remove();
      const el = document.createElement('div');
      el.id = 'fx-kauf'; el.className = 't-' + o.stufe;
      el.innerHTML = `<div class="fxk-karte"><div class="fxk-kopf">Freigeschaltet</div>
        <div class="fxk-buehne"><div class="fxk-strahlen"></div><div class="fxk-bild">${o.bild}</div></div>
        <div class="fxk-name">${o.name}</div><div class="fxk-stufe">${o.stufeName || ''}</div>
        <div class="fxk-info">Ist jetzt aktiv.</div><button type="button" class="fxk-ok">Weiter</button></div>`;
      const zu = () => { if (!el.isConnected) return; el.classList.add('weg'); setTimeout(() => el.remove(), 200); if (danach) danach(); };
      el.addEventListener('click', e => { if (e.target === el || e.target.classList.contains('fxk-ok')) zu(); });
      document.body.appendChild(el);
      if (typeof slotSound === 'function') slotSound('win', { gain: { gewoehnlich: 8, selten: 16, episch: 30, legendaer: 60 }[o.stufe] || 8 });
      brummen(o.stufe === 'legendaer' ? [40, 40, 40, 40, 140] : [25, 40, 50]);
      if (o.stufe === 'legendaer' && !ruhig()) setTimeout(() => konfetti(70), 350);
    },
    // Für die Anzeige im Spiel: Gewinne in Folge
    serie: spiel => _serie[spiel] || 0,
    FLAMME,
  };
})();

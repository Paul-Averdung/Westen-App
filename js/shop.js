// Shop: Themes, Automaten-Skins und Casino-Kosmetik für Coins kaufen, anprobieren und benutzen.
// Besitz:   localStorage 'hopfenkonto_owned' = { themes: [...], skins: [...], cardback: [...], felt: [...], ... }
// Aktiv:    localStorage 'hopfenkonto_theme' / 'hopfenkonto_slot_skin' (werden in js/themes.js geladen)
//           Casino-Kosmetik: 'hopfenkonto_equip' (js/kosmetik.js)
// Preise je Seltenheit unten in PRICE. Saison-Themes (season in js/themes.js) sind nur zeitweise kaufbar.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const PRICE = { gewoehnlich: 150, selten: 400, episch: 1000, legendaer: 2500 };
  const TIER  = { standard: 'Gratis', gewoehnlich: 'Gewöhnlich', selten: 'Selten', episch: 'Episch', legendaer: 'Legendär' };
  const TRY_SECONDS = 10;
  const K_OWNED = 'hopfenkonto_owned', K_THEME = 'hopfenkonto_theme', K_SKIN = 'hopfenkonto_slot_skin';

  const ls = { get: k => { try { return localStorage.getItem(k); } catch(e) { return null; } },
               set: (k, v) => { try { localStorage.setItem(k, v); } catch(e) {} } };
  function owned() {
    let o = null; try { o = JSON.parse(ls.get(K_OWNED)); } catch(e) {}
    o = o || {}; o.themes = o.themes || []; o.skins = o.skins || [];
    Object.keys(COSMETICS).forEach(c => { o[c] = o[c] || []; });
    return o;
  }
  const isCos = kind => !!COSMETICS[kind];
  const source = kind => kind === 'themes' ? THEMES : kind === 'skins' ? SLOT_SKINS : COSMETICS[kind].items;
  const isOwned = (kind, id) => id === 'standard' || owned()[kind].includes(id);
  const equipped = kind => isCos(kind) ? cosmeticEquipped(kind) : (ls.get(kind === 'themes' ? K_THEME : K_SKIN) || 'standard');
  const fmt = n => n.toLocaleString('de-DE');

  // Saison-Prüfung: { months: [...] }, { from: [m,d], to: [m,d] } (über den Jahreswechsel möglich) oder { test(datum) }
  function inSeason(item, d) {
    const s = item.season; if (!s) return true;
    d = d || new Date();
    const m = d.getMonth() + 1, day = d.getDate();
    if (s.test) return s.test(d);                       // eigene Regel, z. B. rund um Fronleichnam
    if (s.months) return s.months.includes(m);
    const v = m * 100 + day, a = s.from[0] * 100 + s.from[1], b = s.to[0] * 100 + s.to[1];
    return a <= b ? (v >= a && v <= b) : (v >= a || v <= b);
  }
  window.shopInSeason = inSeason;

  // ── Vorschaubilder ────────────────────────────────────────────────────────
  const DEF = { bg: '#0f2204', surface: '#173404', line: '#3B6D11', 'card-bg': '#fff', 'btn-bg': '#27500A', 'btn-fg': '#C0DD97', 'card-accent': '#3B6D11' };
  function themeThumb(id) {
    const th = THEMES[id], v = Object.assign({}, DEF, th.vars);
    let scene = th.grad ? `<div class="sh-fill" style="background:${th.grad}"></div>` : '';
    // thumbPos: welcher Ausschnitt der Szene im Vorschaubild zu sehen ist (z. B. oben die Vogelstange)
    if (th.scene) scene += `<div class="sh-fill sh-scene">${th.scene().replace(/<canvas[^>]*><\/canvas>/, '').replace('xMidYMax slice', th.thumbPos || 'xMidYMax slice')}</div>`;
    return `<div class="sh-thumb" style="background:${v.bg}">${scene}
      <div class="sh-mini-head" style="background:${v.surface};border-color:${v.line}"></div>
      <div class="sh-mini-card" style="background:${v['card-bg']}"><b style="background:${v['card-accent']}"></b><i style="background:${v['btn-bg']}"></i></div>
      <div class="sh-mini-card" style="background:${v['card-bg']}"><b style="background:${v['card-accent']}"></b><i style="background:${v['btn-bg']}"></i></div>
    </div>`;
  }
  function skinThumb(id) {
    const t = SLOT_SKINS[id].thumb;
    return `<div class="sh-thumb sh-thumb-slot"><div class="sh-cab" style="background:${t.cab};border-color:${t.frame};box-shadow:${t.glow}">
      <div class="sh-marq" style="background:${t.marq};border-color:${t.frame}"></div>
      <div class="sh-reels" style="border-color:${t.frame}"><span>🍺</span><span>🦅</span><span>🍺</span></div></div></div>`;
  }

  // Casino-Kosmetik: echtes Spiel-Element im Kleinformat, data-Attribut schaltet die Optik
  function cosThumb(cat, id) {
    const card = GameShell.cardHTML, inner = {
      cardback: () => card(null) + card(null),
      felt:     () => `<div class="cos-felt"></div>${card({ r: 'A', s: '♠' })}<div class="cos-chip"></div>`,
      track:    () => `<div class="pr-course"><div class="pr-finish"></div>${[0, 1, 2].map(l => `<div class="pr-lane"><div class="pr-track"><div class="pr-runner" style="left:${[14, 48, 30][l]}%"><span class="pr-emoji">🏇</span></div></div></div>`).join('')}</div>`,
      racer:    () => `<div class="pr-course"><div class="pr-finish"></div>${[0, 1, 2].map(l => `<div class="pr-lane"><div class="pr-track"><div class="pr-runner" style="left:${[40, 18, 58][l]}%">${racerHTML(['#e10600', '#00a19c', '#ff8700'][l], (l * 0.15) + 's', COSMETICS.racer.items[id])}</div></div></div>`).join('')}</div>`,
      wheel:    () => rouletteWheelSVG(),
    }[cat]();
    return `<div class="cos-thumb" data-${cat}="${id}">${inner}</div>`;
  }
  function thumb(kind, id) { return kind === 'themes' ? themeThumb(id) : kind === 'skins' ? skinThumb(id) : cosThumb(kind, id); }
  window.shopThumb = thumb;   // auch für die Neuigkeiten-Tour (js/neuigkeiten.js)

  // ── Shop-Fenster ──────────────────────────────────────────────────────────
  let _tab = 'themes', _sub = 'cardback';
  window.openShop = function(tab) {
    if (tab && isCos(tab)) { _tab = 'casino'; _sub = tab; }
    else if (tab) _tab = tab;
    document.getElementById('shop-overlay').classList.add('open');
    renderShop();
  };
  window.closeShop = function() { document.getElementById('shop-overlay').classList.remove('open'); };
  window.shopTab = function(t) { _tab = t; renderShop(); };
  window.shopSub = function(c) { _sub = c; renderShop(); };

  function itemHTML(kind, id, item) {
    const own = isOwned(kind, id), active = equipped(kind) === id;
    const price = PRICE[item.tier] || 0, season = inSeason(item), coins = Coins.get();
    let btn;
    if (active)               btn = `<button class="sh-btn sh-active" disabled>✓ Aktiv</button>`;
    else if (own)             btn = `<button class="sh-btn sh-use" onclick="shopUse('${kind}','${id}')">Benutzen</button>`;
    else if (!season)         btn = `<button class="sh-btn sh-buy" disabled>🪙 ${fmt(price)}</button>`;
    else                      btn = `<button class="sh-btn sh-buy" ${coins < price ? 'disabled' : ''} onclick="shopBuy('${kind}','${id}',this)">🪙 ${fmt(price)}</button>`;
    const tryBtn = !own ? `<button class="sh-try" onclick="shopTry('${kind}','${id}')">👁 Anprobieren</button>` : '';
    // Gerade nicht kaufbar (außerhalb der Saison, noch nicht gekauft): ausgegraut + wann es verfügbar ist
    const off = !own && !season;
    const when = off ? `<div class="sh-when">📅 Verfügbar<br><b>${item.season.label}</b></div>` : '';
    return `<div class="sh-item t-${item.tier}${active ? ' is-active' : ''}${off ? ' sh-off' : ''}">
      ${thumb(kind, id)}
      <div class="sh-meta"><div class="sh-name">${item.name}</div><div class="sh-tier">${TIER[item.tier]}${item.season ? ' · Saison' : ''}</div></div>
      ${btn}${when}${tryBtn}</div>`;
  }

  function renderShop() {
    document.getElementById('shop-coins').textContent = fmt(Coins.get());
    document.querySelectorAll('.sh-tab').forEach(b => b.classList.toggle('on', b.dataset.tab === _tab));
    const kind = _tab === 'casino' ? _sub : _tab, src = source(kind);
    let html = '';
    if (_tab === 'casino') {
      html += `<div class="sh-subs">${Object.keys(COSMETICS).map(c => `<button class="sh-sub ${c === _sub ? 'on' : ''}" onclick="shopSub('${c}')"><span>${COSMETICS[c].icon}</span>${COSMETICS[c].label}</button>`).join('')}</div>
        <div class="sh-subinfo">Gilt für: ${COSMETICS[_sub].games}</div>`;
    }
    const groups = ['standard', 'gewoehnlich', 'selten', 'episch', 'legendaer'];
    groups.forEach(g => {
      const ids = Object.keys(src).filter(id => src[id].tier === g);
      if (!ids.length) return;
      html += `<div class="sh-group t-${g}"><span>${TIER[g]}</span>${g !== 'standard' ? `<em>🪙 ${fmt(PRICE[g])}</em>` : ''}</div>`;
      html += `<div class="sh-grid">${ids.map(id => itemHTML(kind, id, src[id])).join('')}</div>`;
    });
    document.getElementById('shop-list').innerHTML = html;
  }

  function equip(kind, id) {
    if (kind === 'themes') { ls.set(K_THEME, id); applyTheme(id); }
    else if (kind === 'skins') { ls.set(K_SKIN, id); applySlotSkin(id); }
    else cosmeticEquip(kind, id);
  }
  window.shopUse = function(kind, id) { if (isOwned(kind, id)) { equip(kind, id); renderShop(); } };

  // Kaufen: erster Tipp fragt nach, zweiter Tipp kauft
  window.shopBuy = function(kind, id, btn) {
    const item = source(kind)[id], price = PRICE[item.tier];
    if (!inSeason(item) || isOwned(kind, id)) return;
    if (btn && !btn.dataset.sure) {
      btn.dataset.sure = '1'; btn.classList.add('sh-sure'); btn.textContent = 'Kaufen?';
      setTimeout(() => { if (btn.isConnected && btn.dataset.sure) { delete btn.dataset.sure; btn.classList.remove('sh-sure'); btn.textContent = '🪙 ' + fmt(price); } }, 3000);
      return;
    }
    if (!Coins.spend(price)) { toast('Nicht genug Coins'); return; }
    const o = owned(); o[kind].push(id); ls.set(K_OWNED, JSON.stringify(o));
    equip(kind, id);
    if (typeof slotSound === 'function') slotSound('win', { gain: 10, small: true });
    toast(item.name + ' gehört jetzt dir! 🎉');
    renderShop();
  };

  function toast(text) {
    const t = document.getElementById('shop-toast');
    t.textContent = text; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  }

  // Anprobieren: 10 Sekunden live ansehen, danach zurück zum Shop
  let _tryTimer = null, _tryTick = null;
  const TRY_GAME = { hochtief: () => openHochTief(), blackjack: () => openBlackjack(), pferde: () => openPferderennen(), roulette: () => openRoulette() };
  window.shopTry = function(kind, id) {
    const item = source(kind)[id];
    closeShop();
    if (kind === 'themes') applyTheme(id);
    else if (kind === 'skins') { applySlotSkin(id); openSlotsGame(); }
    else { cosmeticPreview(kind, id); TRY_GAME[COSMETICS[kind].try](); }
    const bar = document.getElementById('shop-trybar');
    let left = TRY_SECONDS;
    bar.querySelector('.st-name').textContent = item.name;
    bar.querySelector('.st-sec').textContent = left;
    const buy = bar.querySelector('.st-buy');
    buy.textContent = '🪙 ' + fmt(PRICE[item.tier]) + ' kaufen';
    buy.disabled = Coins.get() < PRICE[item.tier];
    buy.onclick = () => { endTry(false); shopBuy(kind, id); openShop(kind); };
    bar.classList.add('show');
    clearInterval(_tryTick); clearTimeout(_tryTimer);
    _tryTick = setInterval(() => { left--; bar.querySelector('.st-sec').textContent = Math.max(0, left); }, 1000);
    _tryTimer = setTimeout(() => endTry(true), TRY_SECONDS * 1000);
    window._tryKind = kind;
  };
  function endTry(reopen) {
    clearInterval(_tryTick); clearTimeout(_tryTimer);
    document.getElementById('shop-trybar').classList.remove('show');
    const kind = window._tryKind;
    if (kind === 'themes') applyTheme(equipped('themes'));
    else if (kind === 'skins') { applySlotSkin(equipped('skins')); if (reopen) closeSlotsGame(); }
    else { cosmeticPreview(null); GameShell.close(); closeCasino(); }
    if (reopen) openShop(kind);
  }
  window.shopEndTry = () => endTry(true);
})();

// Gutscheine & Mitgliedsnummer
// Jedes Handy bekommt beim ersten Start eine zufällige Mitgliedsnummer (z.B. 7K3P-9QXG,
// letztes Zeichen = Prüfziffer). Paul erstellt damit Gutschein-Codes, die hier geprüft werden.
// Die Codes sind digital signiert (ECDSA P-256). In der App steckt nur der ÖFFENTLICHE
// Schlüssel – damit kann man Codes prüfen, aber keine erzeugen.
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich.
(function() {
  const PUBLIC_KEY = {"kty":"EC","crv":"P-256","x":"zcaeoCKflMa722Wfmu7779k9KLmX1q2f_aC4y0Y2O4s","y":"PP-bh4VgNVKI_5_WRdcaXcttZHalol8Ij9RWmrW8Pgw"};
  const ALPHA = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';   // ohne 0/O/1/I/L
  const KEY_ID = 'hopfenkonto_member_id';
  const KEY_REDEEMED = 'hopfenkonto_redeemed';

  function checkChar(s) { let sum = 0; for (let i = 0; i < s.length; i++) sum += ALPHA.indexOf(s[i]) * (i + 1); return ALPHA[sum % ALPHA.length]; }

  // Mitgliedsnummer: einmal erzeugen, danach immer dieselbe
  function memberId() {
    let id = null;
    try { id = localStorage.getItem(KEY_ID); } catch(e) {}
    if (!id || id.length !== 8 || checkChar(id.slice(0, 7)) !== id[7]) {
      const r = new Uint8Array(7); crypto.getRandomValues(r);
      const base = Array.from(r, b => ALPHA[b % ALPHA.length]).join('');
      id = base + checkChar(base);
      try { localStorage.setItem(KEY_ID, id); } catch(e) {}
    }
    return id;
  }
  const fmtId = id => id.slice(0, 4) + '-' + id.slice(4);
  window.getMemberId = () => fmtId(memberId());
  memberId();   // gleich beim Laden anlegen

  function redeemed() { try { return JSON.parse(localStorage.getItem(KEY_REDEEMED) || '[]'); } catch(e) { return []; } }

  const b64uToBytes = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); return Uint8Array.from(bin, c => c.charCodeAt(0)); };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  // Prüft einen Code. Ergebnis: { ok, payload } oder { ok:false, msg }
  async function checkCode(text) {
    const m = String(text).match(/HK1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)/);
    if (!m) return { ok: false, msg: 'Kein Gutschein-Code gefunden. Bitte den ganzen Code einfügen.' };
    if (!(window.crypto && crypto.subtle)) return { ok: false, msg: 'Dieser Browser kann Codes leider nicht prüfen.' };
    let valid = false, payload = null;
    try {
      const key = await crypto.subtle.importKey('jwk', PUBLIC_KEY, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64uToBytes(m[2]), new TextEncoder().encode('HK1.' + m[1]));
      payload = JSON.parse(new TextDecoder().decode(b64uToBytes(m[1])));
    } catch(e) { valid = false; }
    if (!valid || !payload || !(payload.c > 0) || !payload.i) return { ok: false, msg: 'Dieser Code ist ungültig.' };
    if (payload.m && payload.m !== memberId()) return { ok: false, msg: 'Dieser Code gehört zu einer anderen Mitgliedsnummer.' };
    if (payload.e && today() > payload.e) return { ok: false, msg: 'Dieser Code ist abgelaufen (gültig bis ' + payload.e.split('-').reverse().join('.') + ').' };
    if (redeemed().includes(payload.i)) return { ok: false, msg: 'Dieser Code wurde auf diesem Handy schon eingelöst.' };
    return { ok: true, payload };
  }

  // ── Oberfläche ──────────────────────────────────────────────────────────
  window.copyMemberId = function(btn) {
    const txt = window.getMemberId();
    const done = () => { if (btn) { const o = btn.textContent; btn.textContent = '✓ Kopiert'; setTimeout(() => btn.textContent = o, 1500); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => fallback());
    else fallback();
    function fallback() {
      const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch(e) {} ta.remove();
    }
  };
  function fillIds() { document.querySelectorAll('.member-id-val').forEach(el => el.textContent = window.getMemberId()); }
  document.addEventListener('DOMContentLoaded', fillIds); fillIds();

  window.openRedeem = function() {
    fillIds();
    document.getElementById('redeem-input').value = '';
    const msg = document.getElementById('redeem-msg'); msg.textContent = ''; msg.className = '';
    document.getElementById('redeem-overlay').classList.add('open');
  };
  window.closeRedeem = function() { document.getElementById('redeem-overlay').classList.remove('open'); };

  window.redeemCode = async function() {
    const btn = document.getElementById('redeem-btn'), msg = document.getElementById('redeem-msg');
    btn.disabled = true; msg.className = ''; msg.textContent = 'Prüfe…';
    const res = await checkCode(document.getElementById('redeem-input').value);
    btn.disabled = false;
    if (!res.ok) { msg.className = 'err'; msg.textContent = res.msg; if (typeof slotSound === 'function') slotSound('lose'); return; }
    const p = res.payload;
    const list = redeemed(); list.push(p.i);
    try { localStorage.setItem(KEY_REDEEMED, JSON.stringify(list)); } catch(e) {}
    window.slotsAddCoins(p.c);
    if (window.refreshCasino) window.refreshCasino();
    msg.className = 'ok';
    msg.textContent = '🎁 +' + p.c + ' Coins gutgeschrieben!' + (p.r ? ' (' + p.r + ')' : '');
    document.getElementById('redeem-input').value = '';
  };
})();

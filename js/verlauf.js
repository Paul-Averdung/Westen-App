// Verlauf-Ansicht und Bestätigungsdialog
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich;
// die Reihenfolge der <script>-Tags in hopfenkonto.html ist wichtig.

// ── Verlauf-UI ───────────────────────────────────────────────────────────────
(function() {
  let _confirmAction = null;

  function fmtNum(n) {
    return n.toFixed(2).replace('.', ',');
  }

  function summaryLine(sum) {
    return sum.count + ' Getränke · ' + fmtNum(sum.liters) + ' l Bier · ' + fmtNum(sum.score) + ' Punkte';
  }

  function dayCardHTML(labelHtml, sum, type, idx) {
    return '<div onclick="openVerlaufDay(\'' + type + '\',' + idx + ')" ' +
      'style="background:#173404;border:0.5px solid #3B6D11;border-radius:10px;padding:12px 14px;margin-bottom:10px;cursor:pointer;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
          '<div style="color:#EFC93D;font-weight:700;font-size:15px;">' + labelHtml + '</div>' +
          '<button onclick="event.stopPropagation(); deleteVerlaufDay(\'' + type + '\',' + idx + ')" ' +
            'style="background:none;border:none;color:#E0115F;font-size:16px;cursor:pointer;padding:2px 6px;opacity:0.85;flex-shrink:0;">🗑️</button>' +
        '</div>' +
        '<div style="color:#97C459;font-size:12px;margin-top:4px;">' + summaryLine(sum) + '</div>' +
      '</div>';
  }

  function renderVerlaufList() {
    const listEl = document.getElementById('verlauf-list');
    const hist = loadHistory();
    let html = '';

    if (drinkLog.length > 0) {
      const sum   = summarizeEntries(drinkLog);
      const label = dayLabel(localDateStr(drinkLog[0].ts)) +
        ' <span style="color:#50C878;font-weight:400;font-size:11px;">(läuft)</span>';
      html += dayCardHTML(label, sum, 'current', -1);
    }

    hist.forEach((day, idx) => {
      const sum = summarizeEntries(day.entries);
      html += dayCardHTML(dayLabel(day.date), sum, 'hist', idx);
    });

    if (!html) {
      html = '<div style="color:#97C459;font-size:13px;text-align:center;opacity:0.7;margin-top:30px;">Noch keine Einträge vorhanden.</div>';
    }
    listEl.innerHTML = html;
  }

  function renderDetailEntries(entries) {
    const listEl = document.getElementById('verlauf-detail-list');
    if (entries.length === 0) {
      listEl.innerHTML = '<div style="color:#97C459;font-size:13px;text-align:center;opacity:0.7;margin-top:20px;">Keine Einträge.</div>';
      return;
    }
    let html = '';
    entries.forEach(e => {
      const info  = DRINK_INFO[e.key] || { label: e.key, emoji: '•' };
      const t     = new Date(e.ts);
      const time  = String(t.getHours()).padStart(2,'0') + ':' + String(t.getMinutes()).padStart(2,'0');
      const sign  = e.dir > 0 ? '+1' : '−1';
      const a     = entryAmt(e);
      const amtTx = e.key === 'bfree' ? ' ' + fmtL(a || 0) : (a !== undefined ? ' · ' + fmtCl(a) : '');
      const color = e.dir > 0 ? '#C0DD97' : '#E0115F';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:0.5px solid #1f3d0a;">' +
        '<span style="color:' + color + ';font-size:13px;">' + info.emoji + ' ' + info.label + amtTx + ' (' + sign + ')</span>' +
        '<span style="color:#97C459;font-size:12px;">' + time + '</span>' +
      '</div>';
    });
    listEl.innerHTML = html;
  }

  window.openVerlauf = function() {
    document.getElementById('verlauf-detail-view').style.display = 'none';
    document.getElementById('verlauf-list-view').style.display = 'block';
    renderVerlaufList();
    document.getElementById('verlauf-overlay').style.display = 'block';
  };

  window.closeVerlauf = function() {
    document.getElementById('verlauf-overlay').style.display = 'none';
  };

  window.openVerlaufDay = function(type, idx) {
    let entries, label;
    if (type === 'current') {
      entries = drinkLog;
      if (entries.length === 0) return;
      label = dayLabel(localDateStr(entries[0].ts)) + ' (läuft)';
    } else {
      const hist = loadHistory();
      const day  = hist[idx];
      if (!day) return;
      entries = day.entries;
      label   = dayLabel(day.date);
    }
    const sum = summarizeEntries(entries);
    document.getElementById('verlauf-detail-header').textContent  = label;
    document.getElementById('verlauf-detail-summary').textContent = summaryLine(sum);
    renderDetailEntries(entries);
    document.getElementById('verlauf-list-view').style.display   = 'none';
    document.getElementById('verlauf-detail-view').style.display = 'block';
  };

  window.closeVerlaufDetail = function() {
    document.getElementById('verlauf-detail-view').style.display = 'none';
    document.getElementById('verlauf-list-view').style.display   = 'block';
    renderVerlaufList();
  };

  window.deleteVerlaufDay = function(type, idx) {
    if (type === 'current') {
      showConfirm('Den heutigen Verlauf löschen? Dabei werden auch alle aktuellen Zähler und Medaillen zurückgesetzt.', function() {
        drinkLog = [];
        performReset();
        renderVerlaufList();
      });
    } else {
      showConfirm('Diesen Tag wirklich aus dem Verlauf löschen?', function() {
        const hist = loadHistory();
        hist.splice(idx, 1);
        saveHistory(hist);
        renderVerlaufList();
      });
    }
  };

  // ── Bestätigungs-Dialog ──────────────────────────────────────────────────
  function showConfirm(text, onConfirm) {
    document.getElementById('confirm-text').textContent = text;
    _confirmAction = onConfirm;
    document.getElementById('confirm-overlay').style.display = 'flex';
  }

  window.hideConfirm = function() {
    document.getElementById('confirm-overlay').style.display = 'none';
    _confirmAction = null;
  };

  window.confirmOkClicked = function() {
    const action = _confirmAction;
    window.hideConfirm();
    if (action) action();
  };
})();

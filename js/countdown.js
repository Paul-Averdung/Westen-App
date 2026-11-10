// Schützenfest-Countdown, Vereinstermine-Anzeige, Einstellungen
// Hinweis: Alle Dateien in js/ teilen sich einen Gültigkeitsbereich;
// die Reihenfolge der <script>-Tags in hopfenkonto.html ist wichtig.

// ── Fronleichnam & Countdown ─────────────────────────────────────────────
const FOUNDED = 1926; // Gründungsjahr Gemütlicher Westen

function easterSunday(y) {
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,
        f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
        h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,
        l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
        mo=Math.floor((h+l-7*m+114)/31),dy=((h+l-7*m+114)%31)+1;
  return new Date(y,mo-1,dy);
}
function fronleichnam(y) { const d=easterSunday(y); d.setDate(d.getDate()+60); return d; }
function dateOnly(d) { return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }
function pad(n) { return String(Math.floor(n)).padStart(2,'0'); }

let countdownTimer = null;

function eventToday(today) {
  const key = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
  return EVENTS.find(e => e.date === key) || null;
}

function getFestDates(y) {
  const thu = dateOnly(fronleichnam(y));
  const fri = new Date(thu); fri.setDate(thu.getDate()+1);
  const sat = new Date(thu); sat.setDate(thu.getDate()+2);
  return { thu, fri, sat };
}

function updateCountdown() {
  const now   = new Date();
  const today = dateOnly(now);
  let y = today.getFullYear();
  let { thu, fri, sat } = getFestDates(y);
  if (today > sat) { y++; ({ thu, fri, sat } = getFestDates(y)); }

  // Header year
  const yearEl = document.getElementById('fest-year');
  if (yearEl) yearEl.textContent = y;

  // Jubilee badge (every 5 years since founding)
  const age    = y - FOUNDED;
  const badge  = document.getElementById('jubilee-badge');
  if (badge) {
    if (age > 0 && age % 5 === 0) {
      badge.textContent = age + ' Jahre Gemütlicher Westen 🏅';
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  // Member years from settings
  const entryYear = parseInt(localStorage.getItem('hopfenkonto_entry_year') || '');
  const memberEl  = document.getElementById('member-years-text');
  if (memberEl) {
    if (!isNaN(entryYear) && entryYear > 1900 && entryYear <= y) {
      memberEl.textContent = ' · ' + (y - entryYear) + ' Jahre Mitglied';
    } else {
      memberEl.textContent = '';
    }
  }

  const clock   = document.getElementById('countdown-clock');
  const festday = document.getElementById('countdown-festday');
  const label   = document.getElementById('countdown-label');
  const sub     = document.getElementById('countdown-sub');
  const dateEl  = document.getElementById('countdown-date');
  const title   = document.getElementById('countdown-title');

  const MO = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

  // Always show the Fronleichnam date
  if (dateEl) dateEl.textContent = 'Fronleichnam · ' + thu.getDate() + '. ' + MO[thu.getMonth()] + ' ' + y;

  const isFest = (d1, d2) => d1.getTime() === d2.getTime();

  if (isFest(today, thu) || isFest(today, fri) || isFest(today, sat)) {
    clock.style.display   = 'none';
    festday.style.display = 'block';
    title.textContent = '🎯 SCHÜTZENFEST '+y;
    if (isFest(today, thu)) {
      festday.textContent = '1. Festtag';
      label.textContent   = 'Schützenfest '+y+' hat begonnen!';
    } else if (isFest(today, fri)) {
      festday.textContent = '🎠 Kinderschützenfest';
      label.textContent   = 'Tag 2 · Schützenfest '+y;
    } else {
      festday.textContent = '🏆 2. Festtag';
      label.textContent   = 'Letzter Tag · Schützenfest '+y;
    }
    sub.textContent = 'Horrido!';
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  } else if (eventToday(today)) {
    const ev = eventToday(today);
    clock.style.display   = 'none';
    festday.style.display = 'block';
    title.textContent   = '📅 HEUTE BEIM GEMÜTLICHEN WESTEN';
    festday.textContent = ev.emoji + ' ' + ev.title;
    label.textContent   = ev.title + ' · ' + today.getDate() + '. ' + MO[today.getMonth()] + ' ' + today.getFullYear();
    const daysLeft = Math.round((thu - today) / 86400000);
    sub.textContent = 'Noch ' + daysLeft + ' Tage bis zum Schützenfest ' + y;
    // Timer weiterlaufen lassen, damit um Mitternacht zurückgeschaltet wird
    if (!countdownTimer) countdownTimer = setInterval(updateCountdown, 1000);
  } else {
    clock.style.display   = 'flex';
    festday.style.display = 'none';
    title.textContent = '🎯 SCHÜTZENFEST COUNTDOWN';

    const target  = thu.getTime(); // midnight of Fronleichnam
    const diffMs  = Math.max(0, target - now.getTime());
    const totalSec = Math.floor(diffMs / 1000);
    const days    = Math.floor(totalSec / 86400);
    const hours   = Math.floor((totalSec % 86400) / 3600);
    const mins    = Math.floor((totalSec % 3600) / 60);
    const secs    = totalSec % 60;

    document.getElementById('cd-days').textContent  = pad(days);
    document.getElementById('cd-hours').textContent = pad(hours);
    document.getElementById('cd-mins').textContent  = pad(mins);
    document.getElementById('cd-secs').textContent  = pad(secs);

    label.textContent = 'bis zum Schützenfest '+y;
    sub.textContent   = '';

    if (!countdownTimer) countdownTimer = setInterval(updateCountdown, 1000);
  }
}

window.toggleSettings = function() {
  const overlay = document.getElementById('settings-overlay');
  const open    = overlay.style.display === 'none' || overlay.style.display === '';
  overlay.style.display = open ? 'block' : 'none';
  if (open) {
    const saved = localStorage.getItem('hopfenkonto_entry_year');
    if (saved) document.getElementById('entry-year-input').value = saved;
    const sndBtn = document.getElementById('sound-toggle-btn');
    if (sndBtn) sndBtn.textContent = isSoundOn() ? '🔊 Ton an' : '🔇 Ton aus';
  }
};

window.closeSettings = function() {
  document.getElementById('settings-overlay').style.display = 'none';
};

window.saveEntryYear = function() {
  const val = document.getElementById('entry-year-input').value;
  if (val) localStorage.setItem('hopfenkonto_entry_year', val);
  else     localStorage.removeItem('hopfenkonto_entry_year');
  updateCountdown();
};

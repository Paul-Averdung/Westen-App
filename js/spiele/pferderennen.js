// Pferderennen – 8 Pferde, Wette auf ein Pferd, Auszahlung für Platz 1, 2 und 3.
// Vor jedem Rennen bekommt jedes Pferd eine neue "Form". Das Rennen wird vorab
// SIMULATIONEN-mal simuliert; daraus ergeben sich die Chancen auf Platz 1/2/3 und faire Quoten:
//   Quote Platz k = AUSZAHLQUOTE × ANTEIL[k] / Chance(Platz k)
// Je wahrscheinlicher ein Platz, desto kleiner die Quote. Insgesamt fließen im Schnitt
// AUSZAHLQUOTE (112 %, Vorteil für die Spieler) der Einsätze zurück. Quote = Faktor auf den Einsatz.
(function() {
  const AUSZAHLQUOTE = 1.12;
  const ANTEIL = [0.60, 0.25, 0.15];          // wie sich die Auszahlung auf Platz 1/2/3 verteilt
  const FORM_SPANNE = 0.03, TAGESFORM = 0.05; // Unterschied der Pferde vs. Zufall am Renntag
  const QUOTE_MAX = 50;
  const SIMULATIONEN = 2500;
  const ZIEL = 100, SCHRITT = 0.55;           // Streckenlänge und Grundtempo pro Takt
  const HORSES = [
    { name: 'Rot', c: '#e63946' },  { name: 'Orange', c: '#f4a261' }, { name: 'Türkis', c: '#2a9d8f' },
    { name: 'Gelb', c: '#ffd166' }, { name: 'Lila', c: '#7b5cff' },   { name: 'Blau', c: '#4dabf7' },
    { name: 'Braun', c: '#8d6e63' }, { name: 'Grün', c: '#2f6b2a' },
  ];
  let race = null, anim = null;

  // Ein Rennen (Modell): Tempo = Form × Zufall, gelegentliche Zwischenspurts. Ergebnis: Reihenfolge der Pferde.
  function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function runRace(form, record) {
    const tag = form.map(f => f * (1 + TAGESFORM * gauss()));   // Tagesform
    const pos = form.map(() => 0), fin = [], frames = [];
    const burst = form.map(() => 0);
    while (fin.length < form.length) {
      for (let i = 0; i < form.length; i++) {
        if (pos[i] >= ZIEL) continue;
        if (burst[i] <= 0 && Math.random() < 0.012) burst[i] = 12 + Math.random() * 18;
        const b = burst[i] > 0 ? 1.18 : 1; if (burst[i] > 0) burst[i]--;
        pos[i] += SCHRITT * tag[i] * b * (0.82 + Math.random() * 0.36);
        if (pos[i] >= ZIEL) fin.push(i);
      }
      if (record) frames.push(pos.slice());
    }
    return { order: fin, frames };
  }
  function newRace() {
    const form = HORSES.map(() => 1 + FORM_SPANNE * (Math.random() * 2 - 1));
    const place = HORSES.map(() => [0, 0, 0]);
    for (let n = 0; n < SIMULATIONEN; n++) {
      const o = runRace(form).order;
      for (let k = 0; k < 3; k++) place[o[k]][k]++;
    }
    const odds = place.map(pl => pl.map((cnt, k) => {
      const p = Math.max(cnt, 1) / SIMULATIONEN;
      return Math.min(QUOTE_MAX, Math.max(0.1, Math.round(AUSZAHLQUOTE * ANTEIL[k] / p * 10) / 10));
    }));
    const chance = place.map(pl => pl[0] / SIMULATIONEN);
    return { form, odds, chance, pick: null, bet: race ? race.bet : 5, state: 'wetten' };
  }
  window.pferdeNeuesRennen = newRace;   // für Tests
  window.pferdeRennenSim = runRace;

  function render() {
    const root = document.getElementById('game-root');
    if (race.state === 'wetten') {
      const rows = HORSES.map((h, i) => `
        <div class="pr-horse ${race.pick === i ? 'on' : ''}" onclick="pferdWaehlen(${i})">
          <span class="pr-nr" style="background:${h.c}">${i + 1}</span>
          <div class="pr-info"><b>${h.name}</b><small>Siegchance ${Math.round(race.chance[i] * 100)} %</small></div>
          <div class="pr-odds"><span>1. ×${GameShell.fmt(race.odds[i][0])}</span><span>2. ×${GameShell.fmt(race.odds[i][1])}</span><span>3. ×${GameShell.fmt(race.odds[i][2])}</span></div>
        </div>`).join('');
      // Kleine Vorschau der Rennbahn mit den aktuellen Renntieren (Kosmetik aus dem Shop)
      const racer = cosmeticRacer(), pos = [[8, 52], [30, 74]];
      const mini = pos.map((ps, l) => `<div class="pr-lane"><div class="pr-track">${ps.map((x, k) =>
        `<div class="pr-runner" style="left:${x}%">${racerHTML(HORSES[l * 2 + k].c, ((l + k) * 0.13) + 's', racer)}<i style="background:${HORSES[l * 2 + k].c}"></i></div>`).join('')}</div></div>`).join('');
      root.innerHTML = `<div class="pr-course pr-mini"><div class="pr-finish"></div>${mini}</div>
        <div class="pr-hint">Wähle ein Pferd. Je wahrscheinlicher, desto kleiner die Quote. Gewinn = Einsatz × Quote.</div>
        <div class="pr-list">${rows}</div>
        ${GameShell.betHTML('pr-bet', race.bet)}
        <button class="gm-btn" ${race.pick === null ? 'disabled' : ''} onclick="pferdeStart()">${race.pick === null ? 'Pferd wählen' : '🏁 Rennen starten'}</button>`;
      return;
    }
    // Rennbahn
    const racer = cosmeticRacer();
    const lanes = HORSES.map((h, i) => `<div class="pr-lane ${race.pick === i ? 'mine' : ''}"><span class="pr-nr" style="background:${h.c}">${i + 1}</span>
        <div class="pr-track"><div class="pr-runner" id="pr-r${i}">${racerHTML(h.c, null, racer)}<i style="background:${h.c}"></i></div></div></div>`).join('');
    root.innerHTML = `<div class="pr-comment" id="pr-comment">Und sie sind gestartet!</div>
      <div class="pr-course"><div class="pr-finish"></div>${lanes}</div>
      <div id="pr-result"></div>`;
  }

  window.openPferderennen = function() {
    race = newRace();
    GameShell.open('🏇 Pferderennen', render, () => { cancelAnimationFrame(anim); gameSound('tickStop'); });
  };
  window.pferdWaehlen = function(i) {
    if (race.state !== 'wetten') return;
    race.bet = GameShell.bet('pr-bet'); race.pick = i; gameSound('chip'); render();
  };
  window.pferdeStart = function() {
    if (race.pick === null) return;
    const bet = GameShell.bet('pr-bet');
    if (!GameShell.take(bet)) return;
    race.bet = bet; race.state = 'rennen';
    const res = runRace(race.form, true);
    race.result = res.order;
    render();
    const frames = res.frames, TAKT = 1000 / 26;                 // 26 Takte pro Sekunde
    const dur = frames.length * TAKT;
    gameSound('startShot'); gameSound('gallop', { dur: dur / 1000 });
    const t0 = performance.now(); let leader = -1;
    const lanes = HORSES.map((h, i) => document.getElementById('pr-r' + i));
    const comment = document.getElementById('pr-comment');
    function frame(now) {
      const f = Math.max(0, Math.min(frames.length - 1, (now - t0) / TAKT)), a = Math.floor(f), b = Math.min(frames.length - 1, a + 1), k = f - a;
      const pos = frames[a].map((p, i) => p + (frames[b][i] - p) * k);
      pos.forEach((p, i) => { lanes[i].style.left = 'calc(' + Math.min(100, p) / ZIEL + ' * (100% - 34px))'; });
      const lead = pos.indexOf(Math.max(...pos));
      if (lead !== leader && f < frames.length - 8) {
        leader = lead;
        const t = ['übernimmt die Führung!', 'schiebt sich nach vorn!', 'liegt jetzt vorne!', 'zieht an allen vorbei!'];
        comment.textContent = HORSES[lead].name + ' ' + t[Math.floor(Math.random() * t.length)];
      }
      if (f < frames.length - 1) anim = requestAnimationFrame(frame); else finish();
    }
    anim = requestAnimationFrame(frame);
  };
  function finish() {
    const place = race.result.indexOf(race.pick);   // 0 = Sieger
    if (place === 0 && window.Trophaeen) Trophaeen.award('pferde', 1400);
    const top = race.result.slice(0, 3);
    gameSound('bell');
    document.getElementById('pr-comment').textContent = HORSES[top[0]].name + ' gewinnt!';
    let win = 0;
    if (place <= 2) win = Math.floor(race.bet * race.odds[race.pick][place]);
    if (win > 0) GameShell.pay(win, place === 0 || win > race.bet); else slotSound('lose');
    const medal = ['🥇', '🥈', '🥉'];
    document.getElementById('pr-result').innerHTML = `
      <div class="pr-podium">${top.map((i, k) => `<div class="${i === race.pick ? 'mine' : ''}">${medal[k]} <span class="pr-nr" style="background:${HORSES[i].c}">${i + 1}</span> ${HORSES[i].name}</div>`).join('')}</div>
      <div class="gm-msg ${win > race.bet ? 'win' : win > 0 ? 'info' : 'lose'}">${place <= 2
        ? `Dein Pferd wurde ${place + 1}.! Auszahlung ${win.toLocaleString('de-DE')} Coins` + (win > race.bet ? ` (+${(win - race.bet).toLocaleString('de-DE')})` : win === race.bet ? ' (Einsatz zurück)' : ` (${(win - race.bet).toLocaleString('de-DE')})`)
        : `Dein Pferd wurde ${place + 1}. – leider nichts`}</div>
      <button class="gm-btn" onclick="pferdeNochmal()">Nächstes Rennen</button>`;
  }
  window.pferdeNochmal = function() { const bet = race.bet; race = newRace(); race.bet = bet; render(); };
})();

/* Voyage avec le Coran — Mode Écoute
   Sourates entières de Saad Al-Ghamidi (un fichier par sourate, mp3quran.net),
   sans texte, gros boutons pour la voiture, répétition, enchaînement, hors ligne. */
(function () {
  const SRC = n => 'https://server7.mp3quran.net/s_gmd/' + pad3(n) + '.mp3';
  const AR = () => S().lang === 'ar';
  const L = (fr, ar) => AR() ? ar : fr;
  const la = new Audio(); la.preload = 'auto'; la.setAttribute('playsinline', '');
  const LS = () => { const s = S(); if (!s.lsn) s.lsn = { s: 1, t: 0, rep: 'once', n: 3, from: 78, to: 114, loop: true, speed: 1 }; return s.lsn; };

  /* ---------- Stockage hors ligne (sourates entières) ---------- */
  let db; const have = new Set();
  const open = () => new Promise((res, rej) => { const r = indexedDB.open('vac-surahs', 1); r.onupgradeneeded = () => r.result.createObjectStore('s'); r.onsuccess = () => { db = r.result; res(); }; r.onerror = () => rej(r.error); });
  const tx = (mode, fn) => new Promise((res, rej) => { const t = db.transaction('s', mode); const r = fn(t.objectStore('s')); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); });
  const ready = open().then(() => tx('readonly', st => st.getAllKeys())).then(ks => ks.forEach(k => have.add(k))).catch(() => { });
  const DLS = { n: 0, pct: 0, abort: null, queue: [] };
  async function dlOne(n) {
    const ctrl = new AbortController(); DLS.abort = ctrl; DLS.n = n; DLS.pct = 0; draw();
    const r = await fetch(SRC(n), { signal: ctrl.signal }); if (!r.ok) throw new Error('HTTP ' + r.status);
    const total = +r.headers.get('content-length') || 0, rd = r.body.getReader(), parts = []; let got = 0, last = 0;
    for (; ;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; if (total && Date.now() - last > 300) { DLS.pct = Math.round(got / total * 100); last = Date.now(); drawDl(); } }
    await tx('readwrite', st => st.put(new Blob(parts, { type: 'audio/mpeg' }), n)); have.add(n);
  }
  async function download(list) {
    if (!navigator.onLine) { toast(L('Pas de connexion', 'لا يوجد اتصال')); return; }
    const todo = list.filter(n => !have.has(n)); if (!todo.length) { toast(L('Déjà téléchargé', 'تم التنزيل مسبقًا')); return; }
    if (DLS.n) { DLS.queue.push(...todo); toast(L('Ajouté à la file de téléchargement', 'أضيف إلى قائمة التنزيل')); return; }
    DLS.queue = todo.slice(); let fails = 0;
    while (DLS.queue.length) { const n = DLS.queue.shift(); try { await dlOne(n); } catch (e) { if (e.name === 'AbortError') { DLS.queue = []; break; } fails++; } }
    DLS.n = 0; DLS.abort = null; draw();
    toast(fails ? L(`${fails} sourate(s) en échec, relance le téléchargement.`, 'فشل بعض التنزيلات') : L('Prêt pour l’écoute hors ligne', 'جاهز للاستماع دون اتصال'));
  }
  async function remove(n) { await tx('readwrite', st => st.delete(n)); have.delete(n); draw(); }
  let blobUrl = null;
  async function srcFor(n) {
    if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
    await ready;
    if (have.has(n)) { const b = await tx('readonly', st => st.get(n)); if (b) { blobUrl = URL.createObjectURL(b); return blobUrl; } }
    if (!navigator.onLine) throw new Error('offline');
    return SRC(n);
  }

  /* ---------- Lecteur ---------- */
  const P_ = { s: 1, count: 1, playing: false, loading: false };
  async function play(n, fromT) {
    const c = LS();
    if (typeof stopPlayback === 'function' && PL.queue && PL.queue.length) stopPlayback(false);
    P_.s = n; c.s = n; P_.off = false; if (!fromT) c.t = 0; save();
    P_.loading = true; draw();
    try {
      la.src = await srcFor(n); la.playbackRate = c.speed || 1; la.defaultPlaybackRate = c.speed || 1;
      if (fromT) { await new Promise(r => { la.addEventListener('loadedmetadata', r, { once: true }); setTimeout(r, 4000); }); try { la.currentTime = fromT; } catch (e) { } }
      await la.play(); P_.playing = true;
    } catch (e) {
      P_.playing = false;
      if (e.message === 'offline') toast(L('Cette sourate n’est pas téléchargée. Télécharge-la avec du réseau pour l’écouter hors ligne.', 'هذه السورة غير منزّلة.'), 4000);
      else if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') toast(L('Lecture impossible : ', 'تعذّر التشغيل: ') + (e.message || e));
    }
    P_.loading = false; meta(); draw();
  }
  function toggle() {
    if (P_.loading) return;
    if (!la.src) { const c = LS(); P_.count = 1; play(c.s || 1, c.t || 0); return; }
    if (la.paused) { P_.off = false; if (typeof stopPlayback === 'function' && PL.queue && PL.queue.length) stopPlayback(false); la.play().then(() => { P_.playing = true; draw(); }).catch(() => { }); }
    else { la.pause(); P_.playing = false; draw(); }
  }
  function nextN(dir) {
    const c = LS();
    if (c.rep === 'range') { let n = P_.s + dir; if (n > c.to) n = c.loop ? c.from : 0; if (n < c.from) n = c.from; return n; }
    const n = P_.s + dir; return n >= 1 && n <= 114 ? n : 0;
  }
  function skip(dir) {
    if (dir < 0 && la.currentTime > 5) { la.currentTime = 0; return; }
    const n = nextN(dir) || (dir < 0 ? P_.s : 0); if (n) { P_.count = 1; play(n); }
  }
  la.addEventListener('ended', () => {
    const c = LS();
    if (c.rep === 'loop') return play(P_.s);
    if (c.rep === 'times' && P_.count < c.n) { P_.count++; return play(P_.s); }
    P_.count = 1;
    if (c.rep === 'chain' || c.rep === 'range') { const n = nextN(1); if (n) return play(n); }
    P_.playing = false; c.t = 0; save(); draw();
  });
  let lastSave = 0;
  la.addEventListener('timeupdate', () => {
    const c = LS(); c.t = la.currentTime; if (Date.now() - lastSave > 5000) { lastSave = Date.now(); save(); }
    drawTime();
    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && la.duration) { try { navigator.mediaSession.setPositionState({ duration: la.duration, position: la.currentTime, playbackRate: la.playbackRate }); } catch (e) { } }
  });
  la.addEventListener('pause', () => { P_.playing = false; drawBtns(); });
  la.addEventListener('play', () => { P_.playing = true; drawBtns(); });
  la.addEventListener('waiting', () => { const e = document.getElementById('lsnState'); if (e) e.textContent = L('Chargement…', 'جارٍ التحميل…'); });
  la.addEventListener('playing', () => { const e = document.getElementById('lsnState'); if (e) e.textContent = ''; });
  function meta() {
    if (!('mediaSession' in navigator)) return;
    const s = sur(P_.s);
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${s.n}. ${s.tr} · ${s.fr}`, artist: RECITER.name, album: t('appName'), artwork: [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
    const h = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
    try { h('play', toggle); h('pause', toggle); h('nexttrack', () => skip(1)); h('previoustrack', () => skip(-1)); h('seekbackward', () => { la.currentTime = Math.max(0, la.currentTime - 15); }); h('seekforward', () => { la.currentTime = Math.min(la.duration || 0, la.currentTime + 15); }); h('seekto', d => { la.currentTime = d.seekTime; }); } catch (e) { }
  }
  window.LSN = { pause: () => { if (!la.paused) la.pause(); P_.off = true; drawMini(); } };

  /* ---------- Interface ---------- */
  const fmt = s => { s = Math.floor(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM9.5 12l8.5 6V6z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',
    back15: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/><text x="12" y="15.5" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui">15</text></svg>',
    fwd15: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-3-6.2"/><path d="M20 4v4h-4"/><text x="12" y="15.5" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui">15</text></svg>',
    ear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="2.5" y="14" width="5" height="7" rx="2"/><rect x="16.5" y="14" width="5" height="7" rx="2"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  };
  const REP = [['once', 'Une fois', 'مرة واحدة'], ['times', 'Répéter ×N', 'تكرار'], ['loop', 'En boucle', 'بلا توقف'], ['chain', 'Enchaîner', 'متابعة'], ['range', 'Plage', 'مجموعة سور']];
  const REPDESC = {
    once: ['La sourate est lue une fois, puis la lecture s’arrête.', 'تُقرأ السورة مرة ثم يتوقف التشغيل.'],
    times: ['La sourate est répétée le nombre de fois choisi.', 'تُكرر السورة بالعدد المختار.'],
    loop: ['La même sourate tourne en boucle jusqu’à ce que tu arrêtes.', 'تُكرر السورة دون توقف.'],
    chain: ['À la fin de la sourate, la suivante démarre toute seule (ordre du Coran).', 'تبدأ السورة التالية تلقائيًا.'],
    range: ['Seulement les sourates de la plage choisie, dans l’ordre.', 'السور المختارة بالترتيب فقط.'],
  };
  let filter = '';
  function listenView() {
    const c = LS(), s = sur(P_.s || c.s || 1);
    const rep = REP.map(([k, f, a]) => `<button class="chip" data-l="rep" data-v="${k}" aria-pressed="${c.rep === k}">${L(f, a)}</button>`).join('');
    const opts = c.rep === 'times' ? `<div class="optrow"><div class="l"><b>${L('Nombre de lectures', 'عدد المرات')}</b></div><div class="stepper"><button data-l="n" data-d="-1">−</button><output id="lsnN">${c.n}</output><button data-l="n" data-d="1">+</button></div></div>`
      : c.rep === 'range' ? `<div class="grid2" style="margin-top:8px"><div class="field"><label for="lf">${L('De la sourate', 'من السورة')}</label><input class="input" id="lf" type="number" min="1" max="114" inputmode="numeric" value="${c.from}" data-l="from"></div><div class="field"><label for="lt">${L('À la sourate', 'إلى السورة')}</label><input class="input" id="lt" type="number" min="1" max="114" inputmode="numeric" value="${c.to}" data-l="to"></div></div>
        <div class="chips" style="margin-top:8px"><button class="chip" data-l="preset" data-a="78" data-b="114">Juz ʿAmma (78–114)</button><button class="chip" data-l="preset" data-a="67" data-b="77">Juz Tabarak (67–77)</button><button class="chip" data-l="preset" data-a="1" data-b="114">${L('Tout le Coran', 'القرآن كاملًا')}</button></div>
        <label class="switch"><span>${L('Recommencer au début de la plage', 'إعادة من بداية المجموعة')}</span><input type="checkbox" data-l="loop" ${c.loop ? 'checked' : ''}></label>` : '';
    const speeds = [0.75, 0.9, 1, 1.15, 1.25].map(v => `<button class="chip" data-l="speed" data-v="${v}" aria-pressed="${(c.speed || 1) === v}">×${String(v).replace('.', ',')}</button>`).join('');
    const f = filter.trim().toLowerCase();
    const rows = Q.filter(x => !f || String(x.n) === f || x.fr.toLowerCase().includes(f) || x.tr.toLowerCase().includes(f) || x.ar.includes(f)).map(x => `<li class="lrow ${x.n === P_.s ? 'on' : ''}">
      <button class="lmain" data-l="play" data-s="${x.n}"><span class="ln">${x.n}</span><span class="lnm"><span class="lar">${x.ar.replace('سُورَةُ ', '')}</span><span class="small">${esc(x.tr)} · ${esc(x.fr)}</span></span></button>
      ${have.has(x.n) ? `<button class="icon-btn lok" data-l="del" data-s="${x.n}" title="${L('Disponible hors ligne (toucher pour supprimer)', 'متاح دون اتصال')}">${ICON.ok}</button>` : DLS.n === x.n ? `<span class="lpct">${DLS.pct} %</span>` : `<button class="icon-btn" data-l="dl" data-s="${x.n}" title="${L('Télécharger pour le hors ligne', 'تنزيل')}">${ICON.dl}</button>`}
    </li>`).join('');
    return `<div class="lsn">
      <div class="lcard">
        <div class="lrec">${RECITER.ar} · ${RECITER.name}</div>
        <div class="larbig">${s.ar.replace('سُورَةُ ', '')}</div>
        <div class="lsub">${s.n}. ${esc(s.tr)} · ${esc(s.fr)} · ${s.a.length} ${t('ayasWord')}</div>
        <div class="lstate" id="lsnState">${have.has(s.n) ? L('Hors ligne', 'دون اتصال') : ''}</div>
        <input type="range" class="lseek" id="lsnSeek" min="0" max="1000" value="0" aria-label="${L('Position', 'الموضع')}">
        <div class="ltimes"><span id="lsnCur">0:00</span><span id="lsnDur">--:--</span></div>
        <div class="lctrl">
          <button class="lb" data-l="prev" aria-label="${L('Sourate précédente', 'السورة السابقة')}">${ICON.prev}</button>
          <button class="lb" data-l="b15" aria-label="-15 s">${ICON.back15}</button>
          <button class="lplay" data-l="toggle" id="lsnPlay" aria-label="${L('Lecture / pause', 'تشغيل / إيقاف')}">${P_.playing ? ICON.pause : ICON.play}</button>
          <button class="lb" data-l="f15" aria-label="+15 s">${ICON.fwd15}</button>
          <button class="lb" data-l="next" aria-label="${L('Sourate suivante', 'السورة التالية')}">${ICON.next}</button>
        </div>
      </div>
      <div class="panel" style="margin-top:12px">
        <div class="field"><span class="lbl">${L('Répétition', 'التكرار')}</span><div class="chips">${rep}</div></div>
        <p class="small muted" style="margin:8px 0 0">${L(...REPDESC[c.rep])}</p>
        ${opts}
        <div class="field" style="margin-top:12px"><span class="lbl">${t('speed')}</span><div class="chips">${speeds}</div></div>
      </div>
      <div class="sec-title"><h2>${L('Choisir une sourate', 'اختر سورة')}</h2>
        <button class="btn sm" data-l="dlrange">${ICON.dl}${L('Télécharger Juz ʿAmma', 'تنزيل جزء عم')}</button></div>
      <p class="small muted" style="margin:-4px 0 10px" id="lsnDl">${DLS.n ? L(`Téléchargement de la sourate ${DLS.n}… ${DLS.pct} %`, `جارٍ تنزيل السورة ${DLS.n}… ${DLS.pct}٪`) + (DLS.queue.length ? ` (+${DLS.queue.length})` : '') : L('Sans réseau, seules les sourates marquées ✓ sont disponibles. Une sourate courte fait moins de 1 Mo ; Al-Baqara environ 85 Mo.', 'دون اتصال تتوفر فقط السور المعلّمة ✓.')}</p>
      <div class="search"><span>${I.search}</span><input class="input" data-l="q" type="search" value="${esc(filter)}" placeholder="${t('search')}" aria-label="${t('search')}"></div>
      <ul class="llist">${rows}</ul>
    </div>`;
  }
  function draw() {
    if (S().view === 'listen') { const y = scrollY, q = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.l === 'q'; render(); scrollTo(0, y); if (q) { const i = document.querySelector('[data-l="q"]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } } }
    drawMini();
  }
  function drawDl() { const e = document.getElementById('lsnDl'); if (e && DLS.n) e.textContent = L(`Téléchargement de la sourate ${DLS.n}… ${DLS.pct} %`, `جارٍ تنزيل السورة ${DLS.n}… ${DLS.pct}٪`) + (DLS.queue.length ? ` (+${DLS.queue.length})` : ''); const p = document.querySelector('.lpct'); if (p) p.textContent = DLS.pct + ' %'; }
  let seeking = false;
  function drawTime() {
    const cur = document.getElementById('lsnCur'); if (!cur) return;
    cur.textContent = fmt(la.currentTime); document.getElementById('lsnDur').textContent = la.duration ? fmt(la.duration) : '--:--';
    const sk = document.getElementById('lsnSeek'); if (sk && !seeking && la.duration) sk.value = Math.round(la.currentTime / la.duration * 1000);
    const mb = document.getElementById('lmBar'); if (mb && la.duration) mb.style.width = (la.currentTime / la.duration * 100) + '%';
  }
  function drawBtns() { const b = document.getElementById('lsnPlay'); if (b) b.innerHTML = P_.playing ? ICON.pause : ICON.play; const m = document.getElementById('lmPlay'); if (m) m.innerHTML = P_.playing ? ICON.pause : ICON.play; drawMini(); }

  /* Mini-lecteur visible sur les autres onglets */
  const mini = document.createElement('div'); mini.className = 'dock lmini'; mini.hidden = true;
  mini.innerHTML = `<div class="dock-in"><button class="info" data-l="go" style="text-align:start"><b id="lmTitle"></b><span id="lmSub"></span><div class="bar"><i id="lmBar"></i></div></button><button class="icon-btn play" id="lmPlay" data-l="toggle"></button><button class="icon-btn" data-l="next" aria-label="${'Sourate suivante'}">${ICON.next}</button><button class="icon-btn" data-l="stop" aria-label="Arrêter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v10H7z"/></svg></button></div>`;
  document.body.appendChild(mini);
  function drawMini() {
    const show = !!la.src && !P_.off && S().view !== 'listen' && (P_.playing || la.currentTime > 0) && $('#dock').hidden;
    mini.hidden = !show;
    document.documentElement.style.setProperty('--dock-h', (show || !$('#dock').hidden) ? '74px' : '0px');
    if (!show) return;
    const s = sur(P_.s); document.getElementById('lmTitle').textContent = `${s.tr} · ${s.fr}`;
    document.getElementById('lmSub').textContent = L('Mode écoute', 'وضع الاستماع') + ' · ' + RECITER.name;
    document.getElementById('lmPlay').innerHTML = P_.playing ? ICON.pause : ICON.play;
  }

  /* ---------- Branchements dans l'app ---------- */
  const baseNav = navHtml;
  navHtml = function () {
    const v = S().view, due = dueList().length;
    const it = (id, ic, lbl) => `<button data-act="nav" data-v="${id}" ${v === id ? 'aria-current="page"' : ''}>${ic}<span>${lbl}${id === 'stats' && due ? ' <span class="badge">' + due + '</span>' : ''}</span></button>`;
    return it('home', I.home, t('home')) + it('read', I.read, t('read')) + it('listen', ICON.ear, L('Écoute', 'استماع')) + it('stats', I.stats, t('stats')) + it('settings', I.gear, t('settings'));
  };
  const baseSettings = settingsView;
  settingsView = function () { return S().view === 'listen' ? listenView() : baseSettings(); };
  const baseRender2 = render;
  render = function () { baseRender2(); drawTime(); drawMini(); };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-l]'); if (!el || el.tagName === 'INPUT') return;
    const k = el.dataset.l, c = LS();
    if (k === 'toggle') toggle();
    else if (k === 'play') { P_.count = 1; if (+el.dataset.s === P_.s && la.src) { if (la.paused) toggle(); } else play(+el.dataset.s); scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (k === 'prev') skip(-1);
    else if (k === 'next') skip(1);
    else if (k === 'b15') la.currentTime = Math.max(0, la.currentTime - 15);
    else if (k === 'f15') la.currentTime = Math.min(la.duration || 0, la.currentTime + 15);
    else if (k === 'rep') { c.rep = el.dataset.v; P_.count = 1; save(); draw(); }
    else if (k === 'n') { c.n = clamp(c.n + +el.dataset.d, 2, 99); save(); document.getElementById('lsnN').textContent = c.n; }
    else if (k === 'preset') { c.from = +el.dataset.a; c.to = +el.dataset.b; save(); draw(); }
    else if (k === 'speed') { c.speed = +el.dataset.v; la.playbackRate = c.speed; save(); draw(); }
    else if (k === 'dl') download([+el.dataset.s]);
    else if (k === 'del') { if (confirm(L('Supprimer cette sourate du téléphone ?', 'حذف هذه السورة من الجهاز؟'))) remove(+el.dataset.s); }
    else if (k === 'dlrange') { const list = []; for (let n = 78; n <= 114; n++) list.push(n); download(list); }
    else if (k === 'go') { S().view = 'listen'; save(); render(); scrollTo(0, 0); }
    else if (k === 'stop') { la.pause(); P_.off = true; P_.playing = false; drawMini(); }
  });
  document.addEventListener('change', e => {
    const el = e.target, k = el.dataset && el.dataset.l; if (!k) return; const c = LS();
    if (k === 'from' || k === 'to') { c[k] = clamp(parseInt(el.value) || 1, 1, 114); if (c.to < c.from) c.to = c.from; save(); draw(); }
    if (k === 'loop') { c.loop = el.checked; save(); }
  });
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'lsnSeek') { seeking = true; if (la.duration) document.getElementById('lsnCur').textContent = fmt(el.value / 1000 * la.duration); }
    if (el.dataset && el.dataset.l === 'q') { filter = el.value; const ul = document.querySelector('.llist'); if (ul) { const tmp = document.createElement('div'); tmp.innerHTML = listenView(); ul.replaceWith(tmp.querySelector('.llist')); } }
  });
  document.addEventListener('change', e => { if (e.target.id === 'lsnSeek') { if (la.duration) la.currentTime = e.target.value / 1000 * la.duration; seeking = false; } });
  addEventListener('keydown', e => { if (S().view === 'listen' && e.code === 'Space' && !e.target.matches('input')) { e.preventDefault(); e.stopImmediatePropagation(); toggle(); } }, true);
  ready.then(() => { P_.s = LS().s || 1; if (S().view === 'listen') draw(); });
})();

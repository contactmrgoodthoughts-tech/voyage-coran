/* Compléments chargés après app.js : tajwid (palette, légende), numéros bilingues, liste des sourates,
   lecture simple, sélection d'ayas, bouton Valider, pourcentage par sourate. */
(function () {
  const GROUPS = [
    ['m', ['m'], 'Prolongation nécessaire', '6 voyelles', 'مد لازم ٦ حركات'],
    ['o', ['o'], 'Prolongation obligatoire', '4 ou 5 voyelles', 'مد واجب ٤ أو ٥'],
    ['p', ['p'], 'Prolongation permise', '2, 4 ou 6 voyelles', 'مد جائز ٢ أو ٤ أو ٦'],
    ['n', ['n'], 'Prolongation normale', '2 voyelles', 'مد طبيعي حركتان'],
    ['g', ['g', 'f', 'c', 'a', 'w', 'i'], 'Nasalisation (ghunna)', '2 voyelles : ghunna, ikhfa, idgham avec ghunna, iqlab', 'غنة حركتان'],
    ['q', ['q'], 'Qalqala', 'écho de la lettre', 'قلقلة'],
    ['h', ['h', 's', 'l', 'u', 'd', 'b'], 'Lettres non prononcées', 'hamzat al-wasl, lam chamsiyya, idgham sans ghunna', 'حروف لا تُلفظ'],
  ];
  const AR = () => S().lang === 'ar';
  const L = (fr, ar) => AR() ? ar : fr;
  function tjs() { const s = S(); if (!s.tjMode) s.tjMode = 'color'; if (!Array.isArray(s.tjOff)) s.tjOff = []; return s; }
  function applyTj() {
    const s = tjs();
    document.body.classList.toggle('tjbg', s.tjMode === 'bg');
    let el = document.getElementById('tjoff');
    if (!el) { el = document.createElement('style'); el.id = 'tjoff'; document.head.appendChild(el); }
    const codes = GROUPS.filter(g => s.tjOff.includes(g[0])).flatMap(g => g[1]);
    el.textContent = codes.length ? codes.map(c => 'span.tj-' + c).join(',') + '{color:inherit!important;text-decoration:none!important;text-shadow:none!important}' : '';
  }
  const baseApply = applyPrefs;
  applyPrefs = function () { baseApply(); applyTj(); };
  /* ---------- Pourcentage par sourate ---------- */
  function pctInfo(n) { const st = surahStats(n), raw = st.l / st.tot * 100; return { st, pc: st.l === 0 ? 0 : st.l === st.tot ? 100 : Math.max(1, Math.floor(raw)) }; }
  function pctHtml(n) { const { st, pc } = pctInfo(n); return `<div class="progress"><i style="width:${st.l / st.tot * 100}%"></i></div><div class="small"><b>${pc} %</b> · ${st.l} / ${st.tot} ${L('ayas apprises', 'آية محفوظة')}${st.p ? ` · ${st.p} ${L('en cours', 'قيد الحفظ')}` : ''}</div>`; }

  /* ---------- Sélection d'ayas ---------- */
  const SEL = new Set(); let selSurah = 0;
  const selList = () => [...SEL].map(k => +k.split(':')[1]).sort((a, b) => a - b);
  const SQ = svg('<rect x="4" y="4" width="16" height="16" rx="4"/><path class="ck" d="M8 12.5l3 3 5-6"/>');
  function drawSel() {
    let bar = document.getElementById('selbar');
    if (!bar) { bar = document.createElement('div'); bar.id = 'selbar'; bar.className = 'selbar'; document.body.appendChild(bar); }
    const show = SEL.size > 0 && S().view === 'read' && S().readMode !== 'page';
    bar.hidden = !show; if (!show) return;
    bar.innerHTML = `<div class="selbar-in"><b>${SEL.size}</b><span class="lbl">${L(SEL.size > 1 ? 'ayas choisies' : 'aya choisie', 'آيات مختارة')}</span><span class="spacer"></span><button class="btn sm" data-x="selplay">${I.play}${L('Écouter', 'استماع')}</button><button class="btn sm" data-x="selrep">${I.rep}${L('Répéter', 'تكرار')}</button><button class="btn sm primary" data-x="selok">${I.check}${L('Valider', 'تأكيد')}</button><button class="icon-btn" data-x="selclear" aria-label="${L('Effacer la sélection', 'مسح الاختيار')}">✕</button></div>`;
  }
  function markSel() {
    SEL.forEach(k => { const [s, a] = k.split(':'); const el = document.getElementById(`a-${s}-${a}`); if (el) { el.classList.add('sel'); const b = el.querySelector('.selbtn'); if (b) b.setAttribute('aria-pressed', 'true'); } });
    drawSel();
  }
  const baseRender = render;
  render = function () { baseRender(); markSel(); };

  /* ---------- Vue lecture : boutons ajoutés ---------- */
  const baseRead = readView;
  readView = function () {
    const n = currentSurah();
    if (selSurah !== n) { SEL.clear(); selSurah = n; }
    let h = baseRead();
    h = h.replace('<div class="tools">', `<div class="spct" id="spct">${pctHtml(n)}</div><div class="tools">`);
    h = h.replace('<button class="btn primary sm" data-act="repsheet">', `<button class="btn sm gold" data-x="readall">${I.play}${L('Lecture simple', 'قراءة متواصلة')}</button><button class="btn primary sm" data-act="repsheet">`);
    h = h.replace('\n    </div>\n    <div class="small muted" style="margin-top:8px">', `<button class="btn sm" data-act="legend">${I.palette}${L('Couleurs du tajwid', 'ألوان التجويد')}</button>\n    </div>\n    <div class="small muted" style="margin-top:8px">`);
    h = h.replace(/<div class="acts">(\s*<button class="icon-btn" data-act="playfrom" data-s="(\d+)" data-a="(\d+)")/g, (m, rest, s, a) => `<div class="acts"><button class="icon-btn selbtn" data-x="sel" data-s="${s}" data-a="${a}" aria-pressed="false" aria-label="${L('Sélectionner cette aya', 'اختيار الآية')}" title="${L('Sélectionner cette aya', 'اختيار الآية')}">${SQ}</button>${rest}`);
    if (S().rep.mode === 'read') h = h.replace(/class="aya inrange"/g, 'class="aya "');
    return h;
  };
  const baseRefresh = refreshAya;
  refreshAya = function (s, a) { baseRefresh(s, a); const el = document.getElementById('spct'); if (el && s === currentSurah()) el.innerHTML = pctHtml(s); };

  /* ---------- Lecture simple et lecture d'une sélection ---------- */
  const baseBuild = buildQueue;
  buildQueue = function (cfg, s, startAya) {
    if (cfg.mode === 'read') {
      cfg.gap = 0; cfg.inf = false;
      const N = sur(s).a.length, q = [];
      for (let a = clamp(startAya || cfg.from || 1, 1, N); a <= N; a++) q.push({ s, a, k: 1, n: 1 });
      if (S().basmala && s !== 1 && s !== 9 && q.length && q[0].a === 1) q.unshift({ s: 1, a: 1, basm: true, real: s });
      return q;
    }
    if (cfg.mode === 'sel') {
      const q = [];
      for (let l = 1; l <= cfg.m; l++) for (const a of cfg.sel) for (let k = 1; k <= cfg.n; k++) q.push({ s, a, k, n: cfg.n, l, m: cfg.m });
      return q;
    }
    return baseBuild(cfg, s, startAya);
  };
  const baseStart = startPlayback;
  startPlayback = function (s, a) { PL.finished = false; if (window.LSN) LSN.pause(); return baseStart(s, a); };
  function startCustom(s, cfg, startAya) {
    unlockAudio(); if (window.LSN) LSN.pause();
    PL.cfg = cfg; PL.queue = buildQueue(cfg, s, startAya); PL.i = 0; PL.playing = true; PL.finished = false; PL.s = s;
    if (!PL.queue.length) return;
    S().last = { s, a: startAya || PL.queue[PL.queue.length > 1 && PL.queue[0].basm ? 1 : 0].a }; save();
    $('#dock').hidden = false; setDockH(); playCurrent();
  }
  const baseStop = stopPlayback;
  stopPlayback = function (finished) {
    if (finished && PL.cfg && PL.cfg.mode === 'read' && S().readChain !== false && PL.s < 114) {
      const n = PL.s + 1; clearTimeout(PL.gapT);
      openSurah(n); startCustom(n, { ...PL.cfg, from: 1 }, 1); return;
    }
    return baseStop(finished);
  };
  const baseDock = drawDock;
  drawDock = function (gap) {
    baseDock(gap);
    const m = (PL.cfg && PL.cfg.mode) || S().rep.mode;
    const names = { read: L('Lecture', 'قراءة'), sel: L('Sélection', 'اختيار'), aya: t('modeAya'), serie: t('modeSerie'), prog: t('modeProg') };
    $('#dockRep').innerHTML = I.rep + '<span>' + (names[m] || '') + '</span>';
    const it = PL.queue[PL.i];
    if (m === 'read' && it && !it.basm && !PL.finished) $('#dockSub').textContent = `${L('Aya', 'آية')} ${it.a} / ${sur(it.s).a.length}`;
  };
  repSheet = function () {
    const c = S().rep, N = sur(currentSurah()).a.length, rd = c.mode === 'read';
    const stp = (k, v) => `<div class="stepper"><button data-act="rstep" data-k="${k}" data-d="-1" data-min="1" data-max="99" aria-label="-1">−</button><output>${v}</output><button data-act="rstep" data-k="${k}" data-d="1" data-min="1" data-max="99" aria-label="+1">+</button></div>`;
    const chip = (k, v, lbl) => `<button class="chip" data-act="rset" data-k="${k}" data-v="${v}" aria-pressed="${String(c[k]) === String(v)}">${lbl}</button>`;
    const sp = v => `<button class="chip" data-act="speed" data-v="${v}" aria-pressed="${S().speed === v}">×${String(v).replace('.', ',')}</button>`;
    const names = { read: L('Lecture', 'قراءة'), aya: t('modeAya'), serie: t('modeSerie'), prog: t('modeProg') };
    const desc = {
      read: 'Lecture simple : chaque aya une seule fois, sans répétition, jusqu’à la fin de la sourate.',
      aya: 'Chaque aya est répétée, puis on passe à la suivante (ou on s’arrête).',
      serie: 'Chaque aya de la série est répétée, puis toute la série recommence.',
      prog: 'Aya 1 répétée, aya 2 répétée, puis 1+2 ensemble, aya 3, puis 1+2+3, etc.',
    };
    openSheet(`${L('Écoute', 'الاستماع')} · ${sur(currentSurah()).fr}`, `
      <div class="seg seg4" style="margin-bottom:14px">${['read', 'aya', 'serie', 'prog'].map(m => `<button data-act="rset" data-k="mode" data-v="${m}" aria-pressed="${c.mode === m}">${names[m]}</button>`).join('')}</div>
      <p class="small muted" style="margin:-4px 0 12px">${desc[c.mode]}</p>
      <div class="grid2" style="margin-bottom:6px">
        <div class="field"><label for="rf">${c.mode === 'aya' || rd ? t('playFrom') : t('from')}</label><input class="input" id="rf" type="number" inputmode="numeric" min="1" max="${N}" value="${c.from}" data-rnum="from"></div>
        ${c.mode === 'serie' || c.mode === 'prog' ? `<div class="field"><label for="rt">${t('to')}</label><input class="input" id="rt" type="number" inputmode="numeric" min="1" max="${N}" value="${c.to}" data-rnum="to"></div>` : '<div></div>'}
      </div>
      ${rd ? `<label class="switch"><span>${L('Enchaîner avec la sourate suivante', 'متابعة السورة التالية')}</span><input type="checkbox" data-set="readChain" ${S().readChain !== false ? 'checked' : ''}></label>` : `
      <div class="optrow"><div class="l"><b>${t('ayaTimes')}</b><span>nombre d’écoutes de chaque aya</span></div>${stp('n', c.n)}</div>
      ${c.mode === 'serie' ? `<div class="optrow"><div class="l"><b>${t('serieTimes')}</b></div>${stp('m', c.m)}</div>` : ''}
      ${c.mode === 'prog' ? `<div class="optrow"><div class="l"><b>${t('blockTimes')}</b></div>${stp('m', c.m)}</div>` : ''}
      ${c.mode === 'aya' ? `<label class="switch"><span>${t('advance')}</span><input type="checkbox" data-rbool="adv" ${c.adv ? 'checked' : ''}></label>` : ''}
      <label class="switch"><span>${t('infinite')}</span><input type="checkbox" data-rbool="inf" ${c.inf ? 'checked' : ''}></label>`}
      <label class="switch"><span>${t('basmala')}</span><input type="checkbox" data-set="basmala" ${S().basmala ? 'checked' : ''}></label>
      ${rd ? '' : `<div class="field" style="margin:12px 0"><span class="lbl">${t('pause')}</span><div class="chips">${chip('gap', 0, '0 s')}${chip('gap', 2, '2 s')}${chip('gap', 4, '4 s')}${chip('gap', 8, '8 s')}${chip('gap', 'echo', t('echo'))}</div></div>`}
      <div class="field" style="margin-top:12px"><span class="lbl">${t('speed')}</span><div class="chips">${[0.75, 0.9, 1, 1.15, 1.25, 1.5].map(sp).join('')}</div></div>
      ${c.mode === 'serie' || c.mode === 'prog' ? `<button class="btn" style="width:100%;margin-top:16px" data-act="markserie">${I.check}${t('markSerie')} (${c.from}–${c.to})</button>` : ''}`,
      `<button class="btn primary" data-act="launch">${I.play}${rd ? L('Lancer la lecture', 'ابدأ القراءة') : t('launch')}</button>`);
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-x]'); if (!el) return;
    const x = el.dataset.x, n = currentSurah();
    const redraw = () => { const y = scrollY; render(); scrollTo(0, y); };
    if (x === 'sel') {
      const k = el.dataset.s + ':' + el.dataset.a, on = !SEL.has(k);
      if (on) SEL.add(k); else SEL.delete(k);
      el.setAttribute('aria-pressed', on); el.closest('.aya').classList.toggle('sel', on); drawSel();
    } else if (x === 'selclear') { SEL.clear(); redraw(); }
    else if (x === 'selok') {
      selList().forEach(a => { if (((P().ay[key(n, a)] || {}).s || 0) !== 2) setStatus(n, a, 2); });
      toast(L(`${SEL.size} aya(s) validée(s)`, 'تم التأكيد')); SEL.clear(); redraw();
    } else if (x === 'selplay' || x === 'selrep') {
      const rep = x === 'selrep', r = S().rep;
      startCustom(n, { ...r, mode: 'sel', sel: selList(), n: rep ? r.n : 1, m: rep ? r.m : 1, gap: rep ? r.gap : 0, inf: rep ? r.inf : false });
    } else if (x === 'readall') { startCustom(n, { ...S().rep, mode: 'read' }, 1); }
  });

  /* ---------- Progrès : avancement par sourate ---------- */
  const baseStats = statsView;
  statsView = function () {
    const h = baseStats();
    const rows = Q.map(s => ({ s, ...pctInfo(s.n) })).filter(x => x.st.l || x.st.p);
    const sec = `<div class="sec-title"><h2>${L('Avancement par sourate', 'التقدّم حسب السورة')}</h2></div><div class="panel">${rows.length ? '<ul class="list-plain">' + rows.map(({ s, st, pc }) => `<li class="spr" data-act="open" data-s="${s.n}">${med(s.n, st.l === st.tot ? 2 : 1)}<span class="spn"><b>${s.ar.replace('سُورَةُ ', '')}</b> <span class="small muted">${esc(s.fr)}</span><div class="progress"><i style="width:${st.l / st.tot * 100}%"></i></div></span><span class="spv"><b>${pc} %</b><br><span class="small muted">${st.l}/${st.tot}</span></span></li>`).join('') + '</ul>' : `<p class="muted" style="margin:0">${L('Aucune sourate commencée. Valide une aya pour voir ton avancement ici.', 'لم تبدأ أي سورة بعد.')}</p>`}</div>`;
    const mark = '<div class="sec-title"><h2>' + t('reviewList'); const i = h.indexOf(mark);
    return i < 0 ? h + sec : h.slice(0, i) + sec + h.slice(i);
  };

  legendSheet = function () {
    const s = tjs();
    const seg = `<div class="seg"><button data-tj="style" data-v="color" aria-pressed="${s.tjMode === 'color'}">${AR() ? 'لون النص' : 'Couleur du texte'}</button><button data-tj="style" data-v="bg" aria-pressed="${s.tjMode === 'bg'}">${AR() ? 'لون مع خط' : 'Couleur + soulignement'}</button></div>`;
    const sample = `<div class="tj-sample ${S().tajweed ? '' : 'no-tj'}">${tjHtml(ayaData(50, 9)[0])}</div>`;
    const list = `<div class="tjl">${GROUPS.map(([id, , fr, sub, ar]) => `<button class="tj-${id}" data-tj="grp" data-g="${id}" aria-pressed="${!s.tjOff.includes(id)}"><span class="sw"></span><span class="tx"><b>${fr}</b><span>${sub}</span></span><span class="arx">${ar}</span></button>`).join('')}</div>`;
    const note = `<p class="small muted" style="margin:12px 0 0">${AR() ? 'اضغط على قاعدة لإخفاء لونها أو إظهاره.' : 'Code couleur des mushafs Dar Al-Maarifa. Touche une règle pour masquer ou afficher sa couleur. Exemple : sourate Qaf, aya 9. Le bleu foncé (r emphatique) n’existe pas dans le texte source et n’est donc pas affiché.'}</p>`;
    openSheet(t('legend'), seg + sample + list + note, `<button class="btn" data-tj="all">${AR() ? 'إظهار الكل' : 'Tout afficher'}</button><button class="btn primary" data-act="sheetclose">${t('close')}</button>`);
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-tj]'); if (!el) return;
    const s = tjs(), k = el.dataset.tj;
    if (k === 'style') s.tjMode = el.dataset.v;
    else if (k === 'grp') { const g = el.dataset.g; s.tjOff = s.tjOff.includes(g) ? s.tjOff.filter(x => x !== g) : [...s.tjOff, g]; }
    else if (k === 'all') s.tjOff = [];
    if (!S().tajweed) S().tajweed = true;
    save(); applyTj();
    const sb = document.getElementById('sheetBody'), top = sb.scrollTop; legendSheet(); sb.scrollTop = top;
    if (S().view === 'read') { const y = scrollY; render(); scrollTo(0, y); }
  });
  /* Numéros d'aya : ajoute le chiffre français sous le chiffre arabe */
  const AD = '٠١٢٣٤٥٦٧٨٩';
  function latinize() {
    document.querySelectorAll('.med b:not([data-l])').forEach(b => {
      const tx = b.textContent;
      if (!/[٠-٩]/.test(tx)) { b.dataset.l = ''; return; }
      const n = tx.replace(/[٠-٩]/g, d => AD.indexOf(d));
      b.dataset.l = n; b.innerHTML = `<span class="ad">${tx}</span><span class="ld">${n}</span>`;
    });
  }
  new MutationObserver(latinize).observe(document.body, { childList: true, subtree: true });

  /* Liste des sourates : nom arabe en premier */
  surahRows = function (filter = '') {
    const f = filter.trim().toLowerCase(); const cur = currentSurah();
    return '<ul class="slist">' + Q.filter(s => !f || String(s.n) === f || s.fr.toLowerCase().includes(f) || s.tr.toLowerCase().includes(f) || s.ar.includes(f)).map(s => {
      const st = surahStats(s.n), pc = st.l ? Math.max(1, Math.floor(st.l / st.tot * 100)) : 0, full = st.l === st.tot;
      const dl = surahAudioCount(s.n) === st.tot ? `<span class="dl" title="${t('audioReady')}">${I.done}</span>` : '';
      return `<li><button class="srow srow-ar" data-act="open" data-s="${s.n}" ${s.n === cur && S().view === 'read' ? 'aria-current="true"' : ''}>
        ${med(s.n, full ? 2 : st.l || st.p ? 1 : 0)}
        <span class="sb"><span class="arn">${s.ar.replace('سُورَةُ ', '')}</span><span class="nm">${esc(s.tr)} · ${esc(s.fr)}</span>
        <span class="mt">${s.a.length} ${t('ayasWord')} · ${s.t === 'M' ? t('meccan') : t('medinan')} ${dl}</span>
        <div class="progress"><i style="width:${st.l / st.tot * 100}%"></i></div></span>
        <span class="pc">${full ? 100 : pc} %</span>
      </button></li>`;
    }).join('') + '</ul>';
  };

  if (document.readyState !== 'loading') { applyTj(); latinize(); } else addEventListener('DOMContentLoaded', () => { applyTj(); latinize(); });
})();

/* Tajwid : palette contrastée, surlignage et choix des règles affichées.
   Chargé après app.js : remplace la légende et complète l'affichage. */
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
  const baseRead = readView;
  readView = function () {
    return baseRead().replace('<div class="tools">', `<div class="tools"><button class="btn sm" data-act="legend">${I.palette}${AR() ? 'ألوان التجويد' : 'Couleurs du tajwid'}</button>`);
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
        ${st.l || st.p ? `<div class="progress"><i style="width:${pc}%"></i></div>` : ''}</span>
        <span class="pc">${st.l ? pc + ' %' : ''}</span>
      </button></li>`;
    }).join('') + '</ul>';
  };

  if (document.readyState !== 'loading') { applyTj(); latinize(); } else addEventListener('DOMContentLoaded', () => { applyTj(); latinize(); });
})();

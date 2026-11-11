/* Tajwid : palette contrastée, surlignage et choix des règles affichées.
   Chargé après app.js : remplace la légende et complète l'affichage. */
(function () {
  const GROUPS = [
    ['m', ['m'], 'Madd nécessaire', '6 temps', 'مد لازم'],
    ['o', ['o'], 'Madd obligatoire', '4 à 5 temps', 'مد واجب'],
    ['p', ['p'], 'Madd permis', '2, 4 ou 6 temps', 'مد جائز'],
    ['n', ['n'], 'Madd naturel', '2 temps', 'مد طبيعي'],
    ['g', ['g'], 'Ghunna', 'nasalisation de 2 temps', 'غنة'],
    ['f', ['f', 'c'], 'Ikhfa', 'son caché nasalisé (y compris chafawi)', 'إخفاء'],
    ['a', ['a', 'w'], 'Idgham avec ghunna', 'fusion nasalisée (y compris chafawi)', 'إدغام بغنة'],
    ['i', ['i'], 'Iqlab', 'le noun se prononce mim', 'إقلاب'],
    ['q', ['q'], 'Qalqala', 'rebond de la lettre', 'قلقلة'],
    ['h', ['h', 's', 'l', 'u', 'd', 'b'], 'Non prononcé ou assimilé', 'hamzat al-wasl, lam chamsiyya, idgham sans ghunna', 'لا يُلفظ'],
  ];
  const AR = () => S().lang === 'ar';
  function tjs() { const s = S(); if (!s.tjStyle) s.tjStyle = 'bg'; if (!Array.isArray(s.tjOff)) s.tjOff = []; return s; }
  function applyTj() {
    const s = tjs();
    document.body.classList.toggle('tjbg', s.tjStyle === 'bg');
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
    const seg = `<div class="seg"><button data-tj="style" data-v="color" aria-pressed="${s.tjStyle === 'color'}">${AR() ? 'لون النص' : 'Couleur du texte'}</button><button data-tj="style" data-v="bg" aria-pressed="${s.tjStyle === 'bg'}">${AR() ? 'لون مع خط' : 'Couleur + soulignement'}</button></div>`;
    const sample = `<div class="tj-sample ${S().tajweed ? '' : 'no-tj'}">${tjHtml(ayaData(50, 9)[0])}</div>`;
    const list = `<div class="tjl">${GROUPS.map(([id, , fr, sub, ar]) => `<button class="tj-${id}" data-tj="grp" data-g="${id}" aria-pressed="${!s.tjOff.includes(id)}"><span class="sw"></span><span class="tx"><b>${fr}</b><span>${sub}</span></span><span class="arx">${ar}</span></button>`).join('')}</div>`;
    const note = `<p class="small muted" style="margin:12px 0 0">${AR() ? 'اضغط على قاعدة لإخفاء لونها أو إظهاره.' : 'Touche une règle pour masquer ou afficher sa couleur. Exemple : sourate Qaf, aya 9.'}</p>`;
    openSheet(t('legend'), seg + sample + list + note, `<button class="btn" data-tj="all">${AR() ? 'إظهار الكل' : 'Tout afficher'}</button><button class="btn primary" data-act="sheetclose">${t('close')}</button>`);
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-tj]'); if (!el) return;
    const s = tjs(), k = el.dataset.tj;
    if (k === 'style') s.tjStyle = el.dataset.v;
    else if (k === 'grp') { const g = el.dataset.g; s.tjOff = s.tjOff.includes(g) ? s.tjOff.filter(x => x !== g) : [...s.tjOff, g]; }
    else if (k === 'all') s.tjOff = [];
    if (!S().tajweed) S().tajweed = true;
    save(); applyTj();
    const sb = document.getElementById('sheetBody'), top = sb.scrollTop; legendSheet(); sb.scrollTop = top;
    if (S().view === 'read') { const y = scrollY; render(); scrollTo(0, y); }
  });
  if (document.readyState !== 'loading') applyTj(); else addEventListener('DOMContentLoaded', applyTj);
})();

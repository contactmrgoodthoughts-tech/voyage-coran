/* Voyage avec le Coran — app.js
   Texte : Tanzil (Hafs, tajwid) via AlQuran.cloud · Traduction : M. Hamidullah
   Audio : Saad Al-Ghamidi, fichiers par aya (EveryAyah) · Tafsir : Ibn Kathir (spa5k/tafsir_api) */
'use strict';

/* ============ Constantes ============ */
const APP_VERSION = '1.0.0';
const STORE_KEY = 'vac:v1';
const RECITER = { id: 'Ghamadi_40kbps', name: 'Saad Al-Ghamidi', ar: 'سعد الغامدي' };
const AUDIO_BASE = 'https://everyayah.com/data/' + RECITER.id + '/';
const TAFSIR_BASE = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/';
const TAFSIR_SLUG = { en: 'en-tafisr-ibn-kathir', ar: 'ar-tafsir-ibn-kathir' };
const PDF_BASE = 'https://archive.org/download/tafsir-ibnkathir-complet-francais/';
const GIST_FILE = 'voyage-coran-sync.json';
const REVIEW_DAYS = [1, 3, 7, 14, 30, 60, 120];
const IDLE_MS = 10 * 60 * 1000;
const NEW_SESSION_GAP = 30 * 60 * 1000;
const TOTAL_AYAS = 6236;

/* ============ Traductions de l'interface ============ */
const T = {
  fr: {
    appName: 'Voyage avec le Coran', home: 'Sourates', read: 'Lecture', stats: 'Progrès', settings: 'Réglages',
    resume: 'Reprendre', start: 'Commencer', ayaWord: 'aya', ayasWord: 'ayas', meccan: 'Mecquoise', medinan: 'Médinoise',
    today: "Aujourd'hui", goalOf: 'sur', min: 'min', search: 'Chercher une sourate (nom ou numéro)',
    toReview: 'à réviser aujourd’hui', reviewNow: 'Voir les révisions', learned: 'Apprises', inProgress: 'En cours', due: 'À réviser',
    none: 'Non commencée', statusTitle: 'Aya', markLearned: 'Appris', markProgress: 'En cours', markNone: 'Retirer',
    reviewed: 'Marquer comme révisée', playFrom: 'Écouter à partir d’ici', setFrom: 'Début de série ici', setTo: 'Fin de série ici',
    tafsir: 'Tafsir', tafsirOf: 'Tafsir Ibn Kathir', modeList: 'Mode liste', modePage: 'Mode page', hide: 'Masquer le texte',
    tajweed: 'Tajwid en couleurs', translation: 'Traduction française', showTafsir: 'Boutons tafsir', downloadAudio: 'Télécharger l’audio',
    audioReady: 'Audio hors ligne prêt', downloading: 'Téléchargement…', deleteAudio: 'Supprimer l’audio',
    repetition: 'Répétition', modeAya: 'Par aya', modeSerie: 'Série', modeProg: 'Progressive', from: 'De l’aya', to: 'À l’aya',
    ayaTimes: 'Chaque aya', serieTimes: 'Toute la série', blockTimes: 'Chaque bloc cumulé', infinite: 'Répétition infinie',
    advance: 'Passer ensuite aux ayas suivantes', pause: 'Pause entre deux écoutes', echo: 'Temps de réciter', speed: 'Vitesse',
    basmala: 'Basmala avant l’aya 1', launch: 'Lancer la répétition', markSerie: 'Marquer la série comme apprise',
    playing: 'Lecture', finished: 'Terminé', paused: 'En pause', session: 'Session en cours', endSession: 'Terminer la session',
    pauseChrono: 'Mettre le chrono en pause', resumeChrono: 'Reprendre le chrono', idle: 'En pause (inactivité)',
    total: 'Progression totale', ofQuran: 'ayas apprises sur 6 236', byJuz: 'Par juz', bilan: 'Bilan',
    thisWeek: 'Cette semaine', lastWeek: 'Semaine dernière', thisMonth: 'Ce mois', lastMonth: 'Mois dernier',
    timeSpent: 'Temps passé', activeDays: 'Jours actifs', perDay: 'Moyenne / jour actif', newLearned: 'Ayas apprises',
    topSurahs: 'Sourates travaillées', history: 'Dernières sessions', reviewList: 'Révisions du jour', nothingDue: 'Aucune révision aujourd’hui.',
    reviseBtn: 'Réviser', weekEnd: 'Fin de semaine : voici ton bilan.', monthEnd: 'Fin du mois : voici ton bilan.',
    profiles: 'Profils', addProfile: 'Ajouter un profil', rename: 'Renommer', delete: 'Supprimer', use: 'Utiliser', active: 'Actif',
    display: 'Affichage', theme: 'Thème', themeAuto: 'Auto', themeLight: 'Clair', themeDark: 'Sombre', themeSepia: 'Sépia',
    uiLang: 'Langue des menus', fontSize: 'Taille du texte arabe', legend: 'Légende du tajwid', goal: 'Objectif quotidien',
    audio: 'Audio', reciter: 'Récitateur', keepAudio: 'Garder l’audio écouté pour le hors ligne', downloadAll: 'Télécharger tout le Coran',
    storage: 'Espace utilisé', sync: 'Synchronisation PC ↔ iPhone', syncNow: 'Synchroniser maintenant', token: 'Jeton GitHub (gist)',
    saveToken: 'Enregistrer le jeton', lastSync: 'Dernière synchro', never: 'jamais', exportData: 'Exporter ma progression',
    importData: 'Importer une progression', about: 'Sources', cancel: 'Annuler', save: 'Enregistrer', close: 'Fermer',
    offlineAudio: 'Audio non téléchargé pour cette aya. Télécharge la sourate quand tu as du réseau.',
    tafsirOffline: 'Ce tafsir n’est pas encore enregistré. Ouvre-le une fois avec du réseau pour le garder hors ligne.',
    commonTafsir: 'Commentaire commun aux ayas', frPdfNote: 'La traduction française du tafsir d’Ibn Kathir (Ahmad Harakat) existe par sourate, au format PDF. Elle s’ouvre en ligne ; tu peux ensuite l’enregistrer sur ton appareil.',
    openPdf: 'Ouvrir le tafsir en français', prev: 'Précédente', next: 'Suivante', page: 'Page', juz: 'Juz',
    saved: 'Enregistré', synced: 'Synchronisé', syncErr: 'Échec de la synchro', imported: 'Progression importée',
    confirmDelete: 'Supprimer ce profil et toute sa progression ?', newProfileName: 'Nom du profil', minutesPerDay: 'minutes par jour',
    learnedToast: 'Aya marquée apprise', serieMarked: 'Série marquée apprise', check: 'Valider',
  },
  ar: {
    appName: 'رحلة مع القرآن', home: 'السور', read: 'القراءة', stats: 'التقدّم', settings: 'الإعدادات',
    resume: 'متابعة', start: 'ابدأ', ayaWord: 'آية', ayasWord: 'آيات', meccan: 'مكية', medinan: 'مدنية',
    today: 'اليوم', goalOf: 'من', min: 'د', search: 'ابحث عن سورة (الاسم أو الرقم)',
    toReview: 'للمراجعة اليوم', reviewNow: 'عرض المراجعات', learned: 'محفوظة', inProgress: 'قيد الحفظ', due: 'للمراجعة',
    none: 'لم تبدأ', statusTitle: 'آية', markLearned: 'محفوظة', markProgress: 'قيد الحفظ', markNone: 'إزالة',
    reviewed: 'تمت المراجعة', playFrom: 'استمع من هنا', setFrom: 'بداية المقطع هنا', setTo: 'نهاية المقطع هنا',
    tafsir: 'التفسير', tafsirOf: 'تفسير ابن كثير', modeList: 'عرض القائمة', modePage: 'عرض الصفحة', hide: 'إخفاء النص',
    tajweed: 'التجويد الملوّن', translation: 'الترجمة الفرنسية', showTafsir: 'أزرار التفسير', downloadAudio: 'تنزيل الصوت',
    audioReady: 'الصوت متاح دون اتصال', downloading: 'جارٍ التنزيل…', deleteAudio: 'حذف الصوت',
    repetition: 'التكرار', modeAya: 'آية آية', modeSerie: 'مقطع', modeProg: 'تدريجي', from: 'من الآية', to: 'إلى الآية',
    ayaTimes: 'كل آية', serieTimes: 'المقطع كاملًا', blockTimes: 'كل مقطع تراكمي', infinite: 'تكرار بلا نهاية',
    advance: 'الانتقال بعدها إلى الآيات التالية', pause: 'مهلة بين كل تكرار', echo: 'وقت للتسميع', speed: 'السرعة',
    basmala: 'البسملة قبل الآية الأولى', launch: 'ابدأ التكرار', markSerie: 'تحديد المقطع كمحفوظ',
    playing: 'تشغيل', finished: 'انتهى', paused: 'متوقف', session: 'الجلسة الحالية', endSession: 'إنهاء الجلسة',
    pauseChrono: 'إيقاف المؤقت', resumeChrono: 'استئناف المؤقت', idle: 'متوقف (عدم نشاط)',
    total: 'التقدّم الإجمالي', ofQuran: 'آية محفوظة من ٦٢٣٦', byJuz: 'حسب الجزء', bilan: 'الحصيلة',
    thisWeek: 'هذا الأسبوع', lastWeek: 'الأسبوع الماضي', thisMonth: 'هذا الشهر', lastMonth: 'الشهر الماضي',
    timeSpent: 'الوقت', activeDays: 'أيام النشاط', perDay: 'المعدل اليومي', newLearned: 'آيات حُفظت',
    topSurahs: 'السور المدروسة', history: 'آخر الجلسات', reviewList: 'مراجعات اليوم', nothingDue: 'لا مراجعة اليوم.',
    reviseBtn: 'راجع', weekEnd: 'نهاية الأسبوع: هذه حصيلتك.', monthEnd: 'نهاية الشهر: هذه حصيلتك.',
    profiles: 'الحسابات', addProfile: 'إضافة حساب', rename: 'إعادة التسمية', delete: 'حذف', use: 'استخدام', active: 'نشط',
    display: 'العرض', theme: 'المظهر', themeAuto: 'تلقائي', themeLight: 'فاتح', themeDark: 'داكن', themeSepia: 'بني',
    uiLang: 'لغة القوائم', fontSize: 'حجم الخط العربي', legend: 'دليل ألوان التجويد', goal: 'الهدف اليومي',
    audio: 'الصوت', reciter: 'القارئ', keepAudio: 'حفظ الصوت المسموع للاستخدام دون اتصال', downloadAll: 'تنزيل القرآن كاملًا',
    storage: 'المساحة المستخدمة', sync: 'المزامنة بين الحاسوب والهاتف', syncNow: 'زامن الآن', token: 'رمز GitHub (gist)',
    saveToken: 'حفظ الرمز', lastSync: 'آخر مزامنة', never: 'أبدًا', exportData: 'تصدير التقدّم',
    importData: 'استيراد التقدّم', about: 'المصادر', cancel: 'إلغاء', save: 'حفظ', close: 'إغلاق',
    offlineAudio: 'صوت هذه الآية غير منزّل. نزّل السورة عند توفر الاتصال.',
    tafsirOffline: 'هذا التفسير غير محفوظ بعد. افتحه مرة مع الاتصال ليُحفظ.',
    commonTafsir: 'تفسير مشترك للآيات', frPdfNote: 'الترجمة الفرنسية لتفسير ابن كثير (أحمد حركات) متوفرة لكل سورة بصيغة PDF، وتُفتح عبر الإنترنت.',
    openPdf: 'فتح التفسير بالفرنسية', prev: 'السابقة', next: 'التالية', page: 'صفحة', juz: 'جزء',
    saved: 'تم الحفظ', synced: 'تمت المزامنة', syncErr: 'فشلت المزامنة', imported: 'تم الاستيراد',
    confirmDelete: 'حذف هذا الحساب وكل تقدّمه؟', newProfileName: 'اسم الحساب', minutesPerDay: 'دقيقة يوميًا',
    learnedToast: 'تم تحديد الآية كمحفوظة', serieMarked: 'تم تحديد المقطع كمحفوظ', check: 'تأكيد',
  }
};

/* ============ Icônes ============ */
const svg = (p, fill) => `<svg viewBox="0 0 24 24" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${p}</svg>`;
const I = {
  home: svg('<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5z"/>'),
  read: svg('<path d="M12 7v13M3 5h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6v13h-6a3 3 0 0 0-3 2 3 3 0 0 0-3-2H3z"/>'),
  stats: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  play: svg('<path d="M8 5v14l11-7z"/>', 1),
  pause: svg('<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>', 1),
  book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  dl: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  done: svg('<path d="M4 12.5l5 5L20 6.5"/>'),
  eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  eyeoff: svg('<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  page: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  palette: svg('<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-.9-.7-1.4-.7-2.3 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>'),
  trans: svg('<path d="M4 5h8M8 3v2M5.5 5c.8 3 3 5.5 6 7M10.5 5c-.8 3-3 5.5-6 7M13 21l4-9 4 9M14.5 18h5"/>'),
  back: svg('<path d="M15 5l-7 7 7 7"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  rep: svg('<path d="M17 2l3 3-3 3M3 11V9a4 4 0 0 1 4-4h13M7 22l-3-3 3-3M21 13v2a4 4 0 0 1-4 4H4"/>'),
  trash: svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  sync: svg('<path d="M21 12a9 9 0 0 1-15.5 6.2M3 12A9 9 0 0 1 18.5 5.8M18 2v4h-4M6 22v-4h4"/>'),
  pdf: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 14h8M8 18h5"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>'),
  chevL: svg('<path d="M15 5l-7 7 7 7"/>'), chevR: svg('<path d="M9 5l7 7-7 7"/>'),
};
const med = (n, s, tag = 'span', extra = '') => `<${tag} class="med" data-st="${s || 0}" ${extra}><svg viewBox="0 0 40 40"><use href="#star"/></svg><b>${toAr(n)}</b></${tag}>`;

/* ============ Utilitaires ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad3 = n => String(n).padStart(3, '0');
const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const dayKey = (d = new Date()) => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function t(k) { return (T[S().lang] || T.fr)[k] ?? T.fr[k] ?? k; }
function fmtClock(ms) { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(ss).padStart(2, '0'); }
function fmtDur(ms) { const m = Math.round(ms / 60000); if (m < 60) return m + ' min'; return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); }
function toast(msg, ms = 2600) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => el.hidden = true, ms); }
const tjHtml = txt => esc(txt).replace(/\[([a-z])(?::\d+)?\[([^\]]*)\]/g, '<span class="tj tj-$1">$2</span>');
const tjPlain = txt => txt.replace(/\[([a-z])(?::\d+)?\[([^\]]*)\]/g, '$2');

/* ============ Stockage local ============ */
let DB;
function defaultDB() {
  const pid = 'p_' + uid();
  return {
    v: 1, device: 'd_' + uid(),
    settings: {
      lang: 'fr', theme: 'auto', tajweed: true, trans: true, tafsirBtn: true, tafsirLang: 'fr', qsize: 34, goal: 20,
      keepAudio: true, basmala: true, speed: 1, hide: false, readMode: 'list', page: 1, view: 'home', surah: 1,
      last: null, rep: { mode: 'aya', s: 1, from: 1, to: 5, n: 3, m: 3, gap: 0, inf: false, adv: true },
    },
    profiles: { [pid]: { id: pid, name: 'Mon profil', nameT: Date.now(), created: Date.now(), ay: {}, sessions: [] } },
    tomb: {}, active: pid, sync: { token: '', gist: '', last: 0 },
  };
}
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { DB = null; }
  if (!DB || !DB.profiles) DB = defaultDB();
  const d = defaultDB();
  DB.settings = Object.assign(d.settings, DB.settings || {});
  DB.settings.rep = Object.assign(d.settings.rep, DB.settings.rep || {});
  DB.sync = Object.assign(d.sync, DB.sync || {});
  DB.tomb = DB.tomb || {};
  if (!DB.profiles[DB.active]) DB.active = Object.keys(DB.profiles)[0];
}
let saveT;
function save(now) { clearTimeout(saveT); const w = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); } catch (e) { toast('Stockage plein'); } }; now ? w() : saveT = setTimeout(w, 300); }
const S = () => DB.settings;
const P = () => DB.profiles[DB.active];

/* ============ Données coran ============ */
let Q = [];            // [{n, ar, tr, fr, t, pdf, a:[[tj, fr, juz, page, hizb, sajda]]}]
let PAGES = [];        // PAGES[p] = [[s,a],...]
let JUZ_TOTAL = [];    // JUZ_TOTAL[j]
async function loadQuran() {
  const r = await fetch('data/quran.json');
  Q = await r.json();
  PAGES = Array.from({ length: 605 }, () => []);
  JUZ_TOTAL = Array(31).fill(0);
  Q.forEach(s => s.a.forEach((x, i) => { PAGES[x[3]].push([s.n, i + 1]); JUZ_TOTAL[x[2]]++; }));
}
const sur = n => Q[n - 1];
const ayaData = (s, a) => Q[s - 1].a[a - 1];

/* ============ Statuts & révisions ============ */
const key = (s, a) => s + ':' + a;
function effStatus(k) {
  const r = P().ay[k]; if (!r || !r.s) return 0;
  if (r.s === 2 && r.due && r.due <= startOfDay().getTime()) return 3;
  return r.s;
}
function setStatus(s, a, st) {
  const k = key(s, a), prev = P().ay[k] || {}, now = Date.now();
  const rec = { s: st, t: now };
  if (st === 2) {
    if (prev.s === 2) Object.assign(rec, { la: prev.la, lv: prev.lv, due: prev.due });
    else Object.assign(rec, { la: now, lv: 0, due: startOfDay(addDays(new Date(), REVIEW_DAYS[0])).getTime() });
  }
  P().ay[k] = rec; save(); scheduleSync();
}
function markReviewed(s, a) {
  const k = key(s, a), r = P().ay[k]; if (!r || r.s !== 2) return;
  const lv = Math.min((r.lv || 0) + 1, REVIEW_DAYS.length - 1);
  P().ay[k] = { ...r, lv, t: Date.now(), due: startOfDay(addDays(new Date(), REVIEW_DAYS[lv])).getTime() };
  save(); scheduleSync();
}
function surahStats(n) {
  const s = sur(n); let l = 0, p = 0, d = 0;
  for (let a = 1; a <= s.a.length; a++) { const e = effStatus(key(n, a)); if (e === 2) l++; else if (e === 1) p++; else if (e === 3) { d++; l++; } }
  return { l, p, d, tot: s.a.length };
}
function dueList() {
  const out = []; const today = startOfDay().getTime();
  for (const [k, r] of Object.entries(P().ay)) if (r.s === 2 && r.due && r.due <= today) { const [s, a] = k.split(':').map(Number); out.push([s, a]); }
  return out.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
}
function totals() {
  let l = 0, p = 0, d = 0; const juz = Array(31).fill(0);
  for (const [k, r] of Object.entries(P().ay)) {
    if (!r.s) continue; const e = effStatus(k); const [s, a] = k.split(':').map(Number);
    if (e === 1) p++; else { l++; if (e === 3) d++; if (Q[s - 1]) juz[ayaData(s, a)[2]]++; }
  }
  return { l, p, d, juz };
}

/* ============ Audio : IndexedDB ============ */
let idb; const audioKeys = new Set();
function idbOpen() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('vac-audio', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('ayas');
    r.onsuccess = () => { idb = r.result; res(); }; r.onerror = () => rej(r.error);
  });
}
const idbReq = (mode, fn) => new Promise((res, rej) => { const tx = idb.transaction('ayas', mode); const st = tx.objectStore('ayas'); const r = fn(st); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); });
async function idbKeys() { try { const ks = await idbReq('readonly', st => st.getAllKeys()); ks.forEach(k => audioKeys.add(k)); } catch (e) { } }
const audioKey = (s, a) => pad3(s) + pad3(a);
const audioUrl = (s, a) => AUDIO_BASE + audioKey(s, a) + '.mp3';
const urlCache = new Map();
async function fetchAudioBlob(s, a, store) {
  const r = await fetch(audioUrl(s, a)); if (!r.ok) throw new Error('HTTP ' + r.status);
  const b = await r.blob();
  if (store) { await idbReq('readwrite', st => st.put(b, audioKey(s, a))); audioKeys.add(audioKey(s, a)); }
  return b;
}
async function getSrc(s, a) {
  const k = audioKey(s, a);
  if (urlCache.has(k)) return urlCache.get(k);
  let blob;
  if (audioKeys.has(k)) blob = await idbReq('readonly', st => st.get(k));
  if (!blob) { if (!navigator.onLine) throw new Error('offline'); blob = await fetchAudioBlob(s, a, S().keepAudio); }
  const u = URL.createObjectURL(blob); urlCache.set(k, u);
  if (urlCache.size > 40) { const [fk, fu] = urlCache.entries().next().value; URL.revokeObjectURL(fu); urlCache.delete(fk); }
  return u;
}
function surahAudioCount(n) { let c = 0; const N = sur(n).a.length; for (let a = 1; a <= N; a++) if (audioKeys.has(audioKey(n, a))) c++; return c; }
const DL = { busy: false, abort: false, label: '', done: 0, total: 0 };
async function downloadAyas(list, label) {
  if (DL.busy) { toast(t('downloading')); return; }
  if (!navigator.onLine) { toast('Pas de connexion'); return; }
  const todo = list.filter(([s, a]) => !audioKeys.has(audioKey(s, a)));
  Object.assign(DL, { busy: true, abort: false, label, done: 0, total: todo.length });
  updateDL();
  let i = 0, fails = 0;
  const worker = async () => { while (i < todo.length && !DL.abort) { const [s, a] = todo[i++]; try { await fetchAudioBlob(s, a, true); } catch (e) { fails++; } DL.done++; updateDL(); } };
  await Promise.all([worker(), worker(), worker(), worker()]);
  DL.busy = false; updateDL();
  toast(fails ? `${fails} fichier(s) en échec, relance le téléchargement.` : t('audioReady'));
  render();
}
function surahList(n) { const out = []; if (n !== 1 && n !== 9) out.push([1, 1]); for (let a = 1; a <= sur(n).a.length; a++) out.push([n, a]); return out; }
async function deleteSurahAudio(n) {
  for (let a = 1; a <= sur(n).a.length; a++) { const k = audioKey(n, a); if (audioKeys.has(k)) { await idbReq('readwrite', st => st.delete(k)); audioKeys.delete(k); } }
  render();
}
function updateDL() { $$('[data-dlbar]').forEach(el => { el.hidden = !DL.busy; const i = el.querySelector('i'); if (i) i.style.width = (DL.total ? DL.done / DL.total * 100 : 0) + '%'; const sp = el.parentElement.querySelector('[data-dltxt]'); if (sp) sp.textContent = DL.busy ? `${t('downloading')} ${DL.done}/${DL.total}` : ''; }); }

/* ============ Tafsir ============ */
const tafMem = new Map();
async function getTafsir(lang, s) {
  const id = lang + s; if (tafMem.has(id)) return tafMem.get(id);
  const url = TAFSIR_BASE + TAFSIR_SLUG[lang] + '/' + s + '.json';
  let data = null;
  try { const c = await caches.open('vac-tafsir-v1'); const hit = await c.match(url); if (hit) data = await hit.json(); else if (navigator.onLine) { const r = await fetch(url); if (r.ok) { await c.put(url, r.clone()); data = await r.json(); } } }
  catch (e) { try { const r = await fetch(url); data = await r.json(); } catch (_) { } }
  if (data) tafMem.set(id, data);
  return data;
}
function tafsirFor(arr, a) {
  const txt = i => (arr.find(x => x.ayah === i) || {}).text || '';
  const cur = txt(a); let lo = a, hi = a;
  while (lo > 1 && txt(lo - 1) === cur && cur) lo--;
  while (txt(hi + 1) === cur && cur) hi++;
  return { text: cur, lo, hi };
}
function tafsirHtml(text, ar) {
  return esc(text).split(/\n+/).filter(Boolean).map(p => '<p>' + (ar ? p.replace(/\[\[(.*?)\]\]/g, '<span class="fn">[$1]</span>') : p) + '</p>').join('');
}

/* ============ Session & chrono ============ */
let sess = null, sessRunning = false, manualPause = false, lastTick = Date.now(), lastAct = Date.now(), lastRun = 0;
function newSession() {
  sess = { id: DB.device + '_' + uid(), start: Date.now(), dur: 0, sb: {} };
  P().sessions.push(sess); save();
}
function ensureSession() { if (!sess || !P().sessions.includes(sess)) newSession(); }
function tick() {
  const now = Date.now(); const dt = Math.min(now - lastTick, 5000); lastTick = now;
  const playing = PL.playing;
  if (playing) lastAct = now;
  const idle = now - lastAct > IDLE_MS;
  const run = !manualPause && document.visibilityState === 'visible' && !idle;
  if (run) {
    if (!sessRunning && lastRun && now - lastRun > NEW_SESSION_GAP) sess = null;
    ensureSession();
    sess.dur += dt; const cs = String(S().view === 'read' ? currentSurah() : 0); if (cs !== '0') sess.sb[cs] = (sess.sb[cs] || 0) + dt;
    lastRun = now;
    if (Math.floor(sess.dur / 1000) % 10 === 0) save();
  }
  sessRunning = run;
  drawChrono(idle);
}
function todayMs() { const d0 = startOfDay().getTime(); return P().sessions.filter(x => x.start >= d0).reduce((a, x) => a + x.dur, 0); }
function drawChrono(idle) {
  const el = $('#chrono'); if (!el) return;
  $('#chronoT').textContent = fmtClock(sess ? sess.dur : 0);
  el.classList.toggle('paused', !sessRunning);
  el.title = manualPause ? t('paused') : idle ? t('idle') : t('session');
  const pct = clamp(todayMs() / (S().goal * 60000), 0, 1);
  $('#chrono .fg').setAttribute('stroke-dashoffset', String(75.4 * (1 - pct)));
}
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true }));

/* ============ Lecteur avec répétitions ============ */
const audio = $('#audio');
const PL = { queue: [], i: 0, playing: false, gapT: null, unlocked: false, cfg: null };
function silentWav() {
  const n = 800, b = new ArrayBuffer(44 + n), v = new DataView(b); const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
}
function unlockAudio() { if (PL.unlocked) return; PL.unlocked = true; try { audio.src = silentWav(); const p = audio.play(); if (p) p.catch(() => { }); } catch (e) { } }
function buildQueue(cfg, s, startAya) {
  const N = sur(s).a.length, q = [];
  const rep = (a, n, extra) => { for (let k = 1; k <= n; k++) q.push({ s, a, k, n, ...extra }); };
  const from = clamp(cfg.from, 1, N), to = clamp(Math.max(cfg.to, cfg.from), 1, N);
  if (cfg.mode === 'aya') {
    const x = clamp(startAya || from, 1, N); const end = cfg.adv ? N : x;
    for (let a = x; a <= end; a++) rep(a, cfg.n);
  } else if (cfg.mode === 'serie') {
    for (let l = 1; l <= cfg.m; l++) for (let a = from; a <= to; a++) rep(a, cfg.n, { l, m: cfg.m });
  } else {
    for (let i = from; i <= to; i++) { rep(i, cfg.n, { stage: 'aya' }); if (i > from) for (let l = 1; l <= cfg.m; l++) for (let a = from; a <= i; a++) q.push({ s, a, k: l, n: cfg.m, block: [from, i] }); }
  }
  if (S().basmala && s !== 1 && s !== 9 && q.length && q[0].a === 1) q.unshift({ s: 1, a: 1, basm: true, real: s });
  return q;
}
function startPlayback(s, startAya) {
  unlockAudio();
  const cfg = { ...S().rep };
  if (cfg.mode !== 'aya' && startAya && (startAya < cfg.from || startAya > cfg.to)) { cfg.from = startAya; cfg.to = Math.max(startAya, Math.min(cfg.to, sur(s).a.length)); if (cfg.to < cfg.from) cfg.to = cfg.from; S().rep.from = cfg.from; S().rep.to = cfg.to; save(); }
  PL.cfg = cfg; PL.queue = buildQueue(cfg, s, startAya); PL.i = 0; PL.playing = true; PL.s = s;
  S().last = { s, a: startAya || cfg.from }; save();
  $('#dock').hidden = false; setDockH();
  playCurrent();
}
async function playCurrent() {
  clearTimeout(PL.gapT);
  const it = PL.queue[PL.i]; if (!it) return stopPlayback(true);
  highlight(it.basm ? null : it);
  drawDock();
  try {
    const src = await getSrc(it.s, it.a);
    if (PL.queue[PL.i] !== it || !PL.playing) return;
    PL.curSrc = src; audio.src = src; audio.playbackRate = S().speed; audio.defaultPlaybackRate = S().speed;
    await audio.play();
    setMediaSession(it);
    const nx = PL.queue[PL.i + 1]; if (nx) getSrc(nx.s, nx.a).catch(() => { });
  } catch (e) {
    if (e && e.name === 'NotAllowedError') { PL.playing = false; drawDock(); return; }
    toast(e.message === 'offline' ? t('offlineAudio') : 'Lecture impossible : ' + (e.message || e));
    PL.playing = false; drawDock();
  }
}
audio.addEventListener('ended', () => {
  if (!PL.playing || audio.src !== PL.curSrc) return;
  const it = PL.queue[PL.i]; const g = PL.cfg.gap;
  const wait = it && it.basm ? 0 : (g === 'echo' ? (audio.duration || 3) * 1000 / (S().speed || 1) : (+g || 0) * 1000);
  PL.gapT = setTimeout(advance, wait);
  drawDock(wait > 0);
});
audio.addEventListener('timeupdate', () => { const b = $('#dockBar'); if (b && audio.duration) b.style.width = (audio.currentTime / audio.duration * 100) + '%'; });
function advance() {
  PL.i++;
  if (PL.i >= PL.queue.length) { if (PL.cfg.inf) { PL.i = PL.queue[0] && PL.queue[0].basm ? 1 : 0; } else return stopPlayback(true); }
  playCurrent();
}
function stopPlayback(finished) {
  clearTimeout(PL.gapT); audio.pause(); PL.playing = false;
  if (!finished) { PL.queue = []; $('#dock').hidden = true; setDockH(); highlight(null); }
  else { PL.finished = true; drawDock(); }
}
function togglePlay() {
  unlockAudio();
  if (!PL.queue.length) { startPlayback(currentSurah(), S().rep.mode === 'aya' ? (S().last && S().last.s === currentSurah() ? S().last.a : 1) : S().rep.from); return; }
  if (PL.finished) { PL.finished = false; PL.i = 0; PL.playing = true; playCurrent(); return; }
  if (PL.playing) { PL.playing = false; clearTimeout(PL.gapT); audio.pause(); drawDock(); }
  else { PL.playing = true; if (audio.src && audio.currentTime > 0 && !audio.ended) audio.play().catch(() => { }); else playCurrent(); drawDock(); }
}
function jump(dir) {
  if (!PL.queue.length) return;
  const cur = PL.queue[PL.i]; let i = PL.i;
  if (dir > 0) { while (i < PL.queue.length - 1 && PL.queue[i].a === cur.a && PL.queue[i].s === cur.s) i++; }
  else { while (i > 0 && PL.queue[i - 1].a === cur.a) i--; if (i > 0) { i--; const a = PL.queue[i].a; while (i > 0 && PL.queue[i - 1].a === a) i--; } }
  PL.i = i; PL.playing = true; PL.finished = false; playCurrent();
}
function drawDock(gap) {
  const it = PL.queue[PL.i]; if (!it) return;
  const s = it.basm ? it.real : it.s;
  $('#dockTitle').textContent = sur(s).fr;
  const Aw = t('ayaWord').charAt(0).toUpperCase() + t('ayaWord').slice(1);
  let sub = it.basm ? 'Basmala' : `${Aw} ${it.a} · `;
  if (!it.basm) {
    if (it.block) sub += `Bloc ${it.block[0]}–${it.block[1]} · ${it.k}/${it.n}`;
    else sub += `×${it.k}/${it.n}` + (it.m ? ` · Série ${it.l}/${it.m}` : '');
    if (PL.cfg.inf) sub += ' · ∞';
  }
  if (gap) sub += ' · ' + t('echo') + '…';
  if (PL.finished) sub = t('finished');
  $('#dockSub').textContent = sub;
  $('#dockPlayIco').innerHTML = PL.playing ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
  $('#dockRep').innerHTML = I.rep + '<span>' + { aya: t('modeAya'), serie: t('modeSerie'), prog: t('modeProg') }[S().rep.mode] + '</span>';
}
function highlight(it) {
  $$('.aya.cur,.pa.cur').forEach(e => e.classList.remove('cur'));
  if (!it) return;
  S().last = { s: it.s, a: it.a };
  const el = document.getElementById(`a-${it.s}-${it.a}`) || document.getElementById(`pa-${it.s}-${it.a}`);
  if (el) { el.classList.add('cur'); const r = el.getBoundingClientRect(); if (r.top < 120 || r.bottom > innerHeight - 160) el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  if (S().readMode === 'page' && S().view === 'read') { const p = ayaData(it.s, it.a)[3]; if (p !== S().page) { S().page = p; render(); } }
}
function setMediaSession(it) {
  if (!('mediaSession' in navigator)) return;
  const s = it.basm ? it.real : it.s;
  navigator.mediaSession.metadata = new MediaMetadata({ title: `${sur(s).fr} · ${it.basm ? 'Basmala' : t('ayaWord') + ' ' + it.a}`, artist: RECITER.name, album: t('appName'), artwork: [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
  navigator.mediaSession.setActionHandler('play', togglePlay);
  navigator.mediaSession.setActionHandler('pause', togglePlay);
  navigator.mediaSession.setActionHandler('nexttrack', () => jump(1));
  navigator.mediaSession.setActionHandler('previoustrack', () => jump(-1));
}
function setDockH() { document.documentElement.style.setProperty('--dock-h', $('#dock').hidden ? '0px' : '74px'); }
const currentSurah = () => S().surah || 1;

/* ============ Rendu ============ */
function applyPrefs() {
  const s = S(), root = document.documentElement;
  if (s.theme === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', s.theme);
  root.lang = s.lang; root.dir = s.lang === 'ar' ? 'rtl' : 'ltr';
  root.style.setProperty('--qsize', s.qsize + 'px');
  const tc = getComputedStyle(root).getPropertyValue('--surface').trim(); $('meta[name="theme-color"]').content = tc || '#0F3D3A';
  $$('[data-t]').forEach(e => e.textContent = t(e.dataset.t));
}
function navHtml() {
  const v = S().view, due = dueList().length;
  const it = (id, ic) => `<button data-act="nav" data-v="${id}" ${v === id ? 'aria-current="page"' : ''}>${ic}<span>${t(id)}${id === 'stats' && due ? ' <span class="badge">' + due + '</span>' : ''}</span></button>`;
  return it('home', I.home) + it('read', I.read) + it('stats', I.stats) + it('settings', I.gear);
}
function surahRows(filter = '') {
  const f = filter.trim().toLowerCase(); const cur = currentSurah();
  return '<ul class="slist">' + Q.filter(s => !f || String(s.n) === f || s.fr.toLowerCase().includes(f) || s.tr.toLowerCase().includes(f) || s.ar.includes(f)).map(s => {
    const st = surahStats(s.n), pc = st.l ? Math.max(1, Math.floor(st.l / st.tot * 100)) : 0, full = st.l === st.tot;
    const dl = surahAudioCount(s.n) === st.tot ? `<span class="dl" title="${t('audioReady')}">${I.done}</span>` : '';
    return `<li><button class="srow" data-act="open" data-s="${s.n}" ${s.n === cur && S().view === 'read' ? 'aria-current="true"' : ''}>
      ${med(s.n, full ? 2 : st.l || st.p ? 1 : 0)}
      <span><span class="nm">${esc(s.fr)}</span> <span class="mt">${esc(s.tr)}</span><br><span class="mt">${s.a.length} ${t('ayasWord')} · ${s.t === 'M' ? t('meccan') : t('medinan')} ${dl}</span>
      ${st.l || st.p ? `<div class="progress"><i style="width:${pc}%"></i></div>` : ''}</span>
      <span><span class="arn">${s.ar.replace('سُورَةُ ', '')}</span><br><span class="pc">${st.l ? pc + ' %' : ''}</span></span>
    </button></li>`;
  }).join('') + '</ul>';
}
function render() {
  applyPrefs();
  const v = S().view, view = $('#view');
  $('#tabbar').innerHTML = navHtml(); $('#sideNav').innerHTML = navHtml();
  view.className = 'view ' + v + '-view';
  if (v === 'home') view.innerHTML = homeView();
  else if (v === 'read') view.innerHTML = readView();
  else if (v === 'stats') view.innerHTML = statsView();
  else view.innerHTML = settingsView();
  const sl = $('#sideList'); if (getComputedStyle($('#side')).display !== 'none') { const st = sl.scrollTop; sl.innerHTML = `<div class="search"><span>${I.search}</span><input class="input" data-search type="search" placeholder="${t('search')}" aria-label="${t('search')}"></div>` + surahRows(); sl.scrollTop = st; }
  updateDL(); if (PL.queue.length) drawDock();
  if (v === 'read' && PL.queue[PL.i] && !PL.queue[PL.i].basm) { const it = PL.queue[PL.i]; const el = document.getElementById(`a-${it.s}-${it.a}`) || document.getElementById(`pa-${it.s}-${it.a}`); if (el) el.classList.add('cur'); }
}
function homeView() {
  const last = S().last, due = dueList().length, tm = todayMs(), g = S().goal * 60000, pct = clamp(tm / g, 0, 1);
  const ls = last ? sur(last.s) : null;
  return `<div class="hero"><div class="ar-title">رِحْلَةٌ مَعَ ٱلْقُرْءَانِ</div><div class="fr-title">${esc(t('appName'))} · ${RECITER.name}</div></div>
  <div class="today">
    <button class="resume" data-act="${last ? 'goto' : 'open'}" data-s="${last ? last.s : 1}" data-a="${last ? last.a : 1}">
      <span><span class="k">${last ? t('resume') : t('start')}</span><br><span class="v">${ls ? esc(ls.fr) + ' · ' + t('ayaWord') + ' ' + last.a : esc(sur(1).fr)}</span></span>
      <span class="a">${(ls || sur(1)).ar.replace('سُورَةُ ', '')}</span>
    </button>
    <div class="goal"><svg viewBox="0 0 60 60"><circle class="bg" cx="30" cy="30" r="25"/><circle class="fg" cx="30" cy="30" r="25" stroke-dasharray="157" stroke-dashoffset="${157 * (1 - pct)}" transform="rotate(-90 30 30)"/></svg>
      <div><div class="small muted">${t('today')}</div><b>${fmtDur(tm)}</b> <span class="muted">${t('goalOf')} ${S().goal} ${t('min')}</span></div></div>
  </div>
  ${due ? `<button class="review-cta" data-act="nav" data-v="stats">${med('!', 3)}<span><b>${due} ${t('ayasWord')}</b> ${t('toReview')}</span><span class="spacer"></span>${I.chevR}</button>` : ''}
  <div class="home-list"><div class="search"><span>${I.search}</span><input class="input" data-search type="search" placeholder="${t('search')}" aria-label="${t('search')}"></div><div id="homeList">${surahRows()}</div></div>`;
}
function readView() {
  const n = currentSurah(), s = sur(n), cfg = S().rep;
  if (cfg.s !== n) { cfg.s = n; cfg.from = 1; cfg.to = Math.min(s.a.length, 5); save(); }
  const cls = [!S().tajweed && 'no-tj', !S().trans && 'no-tr', !S().tafsirBtn && 'no-tf', S().hide && 'hidetxt'].filter(Boolean).join(' ');
  const pageMode = S().readMode === 'page';
  const title = pageMode ? pageTitle() : `${esc(s.fr)} · ${s.a.length} ${t('ayasWord')}`;
  const head = `<div class="rhead">
    <button class="icon-btn" data-act="nav" data-v="home" aria-label="${t('home')}">${I.back}</button>
    <div class="ttl"><b>${title}</b><span>${pageMode ? '' : esc(s.tr) + ' · ' + (s.t === 'M' ? t('meccan') : t('medinan'))}</span></div>
    <button class="icon-btn" data-act="toggle" data-k="readMode" aria-pressed="${pageMode}" title="${pageMode ? t('modeList') : t('modePage')}">${pageMode ? I.list : I.page}</button>
    <button class="icon-btn" data-act="toggle" data-k="hide" aria-pressed="${S().hide}" title="${t('hide')}">${S().hide ? I.eyeoff : I.eye}</button>
    <button class="icon-btn" data-act="toggle" data-k="tajweed" aria-pressed="${S().tajweed}" title="${t('tajweed')}">${I.palette}</button>
    <button class="icon-btn" data-act="toggle" data-k="trans" aria-pressed="${S().trans}" title="${t('translation')}">${I.trans}</button>
  </div>`;
  if (pageMode) return head + `<div class="${cls}">${pageHtml()}</div>`;
  const dlc = surahAudioCount(n), ready = dlc === s.a.length;
  const inRange = a => cfg.mode !== 'aya' && a >= cfg.from && a <= cfg.to;
  const rows = s.a.map((x, i) => {
    const a = i + 1, st = effStatus(key(n, a));
    return `<li class="aya ${inRange(a) ? 'inrange' : ''}" id="a-${n}-${a}" data-s="${n}" data-a="${a}">
      <div class="q"><span class="w" data-act="reveal">${tjHtml(x[0])}</span>${med(a, st, 'button', `data-act="aya" data-s="${n}" data-a="${a}" aria-label="${t('ayaWord')} ${a}"`)}</div>
      <p class="tr" dir="ltr"><span class="n">${n}:${a}</span>${esc(x[1])}</p>
      <div class="acts">
        <button class="icon-btn" data-act="playfrom" data-s="${n}" data-a="${a}" aria-label="${t('playFrom')}">${I.play}</button>
        <button class="icon-btn" data-act="quick" data-s="${n}" data-a="${a}" aria-pressed="${st >= 2}" aria-label="${t('markLearned')}">${I.check}</button>
        <button class="icon-btn tf-btn" data-act="tafsir" data-s="${n}" data-a="${a}" aria-label="${t('tafsir')}">${I.book}</button>
        <span class="meta">${x[5] ? '<span class="sajda">۩ Sajda</span> · ' : ''}${t('juz')} ${x[2]} · ${t('page')} ${x[3]}</span>
      </div></li>`;
  }).join('');
  return head + `<div class="sbanner">
    <div class="nm">${s.ar}</div>
    <div class="sub">${n}. ${esc(s.fr)} · ${esc(s.tr)}</div>
    <div class="tools">
      <button class="btn primary sm" data-act="repsheet">${I.rep}${t('repetition')}</button>
      ${ready ? `<button class="btn sm" data-act="delaudio" data-s="${n}">${I.done}${t('audioReady')}</button>` : `<button class="btn sm" data-act="dlsurah" data-s="${n}">${I.dl}${t('downloadAudio')}${dlc ? ` (${dlc}/${s.a.length})` : ''}</button>`}
    </div>
    <div class="small muted" style="margin-top:8px"><span data-dltxt></span></div><div class="dlbar" data-dlbar hidden><i></i></div>
  </div>
  ${n !== 1 && n !== 9 ? '<div class="basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>' : ''}
  <ul class="ayas ${cls}">${rows}</ul>
  <div class="pager">${n > 1 ? `<button class="btn" data-act="open" data-s="${n - 1}">${I.chevL}${esc(sur(n - 1).fr)}</button>` : '<span></span>'}${n < 114 ? `<button class="btn" data-act="open" data-s="${n + 1}">${esc(sur(n + 1).fr)}${I.chevR}</button>` : ''}</div>`;
}
function pageTitle() { const p = S().page, f = PAGES[p][0]; return `${t('page')} ${p} · ${esc(sur(f[0]).fr)}`; }
function pageHtml() {
  const p = clamp(S().page, 1, 604), items = PAGES[p]; const first = items[0];
  let body = '';
  for (const [s, a] of items) {
    if (a === 1) { body += `<span class="sh">${sur(s).ar}</span>`; if (s !== 1 && s !== 9) body += '<span class="bs">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>'; }
    body += `<span class="pa" id="pa-${s}-${a}" data-act="reveal"><span class="w">${tjHtml(ayaData(s, a)[0])}</span> ${med(a, effStatus(key(s, a)), 'button', `data-act="aya" data-s="${s}" data-a="${a}" aria-label="${t('ayaWord')} ${a}"`)} </span>`;
  }
  return `<div class="page"><div class="page-head"><span>${t('juz')} ${ayaData(first[0], first[1])[2]}</span><span>${esc(sur(first[0]).fr)}</span></div>
  <div class="page-body">${body}</div>
  <div class="pager"><button class="btn" data-act="pg" data-d="1" ${p >= 604 ? 'disabled' : ''}>${I.chevL}${t('next')}</button><span class="muted small">${toAr(p)} · ${p}/604</span><button class="btn" data-act="pg" data-d="-1" ${p <= 1 ? 'disabled' : ''}>${t('prev')}${I.chevR}</button></div></div>`;
}

/* ----- Progrès ----- */
let period = null;
function periodRange(k) {
  const now = new Date(); let a, b, days = [];
  if (k === 'week' || k === 'lweek') { const d = startOfDay(now); const dow = (d.getDay() + 6) % 7; a = addDays(d, -dow - (k === 'lweek' ? 7 : 0)); b = addDays(a, 7); }
  else { a = new Date(now.getFullYear(), now.getMonth() - (k === 'lmonth' ? 1 : 0), 1); b = new Date(a.getFullYear(), a.getMonth() + 1, 1); }
  for (let d = new Date(a); d < b; d = addDays(d, 1)) days.push(new Date(d));
  return { a: a.getTime(), b: b.getTime(), days };
}
function statsView() {
  const tt = totals(), pct = (tt.l / TOTAL_AYAS * 100);
  const now = new Date(); const isSunday = now.getDay() === 0; const lastDay = addDays(now, 1).getDate() === 1;
  if (!period) period = lastDay ? 'month' : 'week';
  const R = periodRange(period), ses = P().sessions.filter(x => x.start >= R.a && x.start < R.b && x.dur > 5000);
  const tot = ses.reduce((s, x) => s + x.dur, 0);
  const perDay = R.days.map(d => { const a = d.getTime(), b = addDays(d, 1).getTime(); return ses.filter(x => x.start >= a && x.start < b).reduce((s, x) => s + x.dur, 0); });
  const active = perDay.filter(x => x > 0).length; const maxD = Math.max(...perDay, S().goal * 60000);
  let learnedP = 0; for (const r of Object.values(P().ay)) if (r.s === 2 && r.la >= R.a && r.la < R.b) learnedP++;
  const bySur = {}; ses.forEach(x => Object.entries(x.sb || {}).forEach(([s, ms]) => bySur[s] = (bySur[s] || 0) + ms));
  const top = Object.entries(bySur).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const due = dueList(); const dueBy = {}; due.forEach(([s, a]) => (dueBy[s] = dueBy[s] || []).push(a));
  const dayLbl = d => R.days.length <= 7 ? d.toLocaleDateString(S().lang, { weekday: 'narrow' }) : (d.getDate() % 5 === 1 ? d.getDate() : '');
  const hist = P().sessions.filter(x => x.dur > 5000).slice(-12).reverse();
  return `<div class="hero" style="padding-top:8px"><h2>${t('total')}</h2></div>
  <div class="panel">
    <div class="big"><span class="n">${tt.l.toLocaleString('fr-FR')}</span><span class="d">${t('ofQuran')} · ${pct.toFixed(pct < 10 ? 1 : 0)} %</span></div>
    <div class="progress" style="margin-top:12px;height:8px"><i style="width:${pct}%"></i></div>
    <div class="counts"><div><b>${tt.l - tt.d}</b><span>${t('learned')}</span></div><div><b>${tt.p}</b><span>${t('inProgress')}</span></div><div><b>${tt.d}</b><span>${t('due')}</span></div></div>
  </div>
  <div class="sec-title"><h2>${t('byJuz')}</h2></div>
  <div class="juzgrid">${Array.from({ length: 30 }, (_, i) => { const j = i + 1, p = tt.juz[j] / JUZ_TOTAL[j]; return `<div class="juz ${p >= .55 ? 'full' : ''}" title="${t('juz')} ${j} : ${Math.round(p * 100)} %"><i style="height:${p * 100}%"></i><span>${j}</span></div>`; }).join('')}</div>

  <div class="sec-title"><h2>${t('reviewList')}</h2></div>
  <div class="panel">${due.length ? '<ul class="list-plain">' + Object.entries(dueBy).map(([s, as]) => `<li>${med(s, 3)}<span><b>${esc(sur(+s).fr)}</b><br><span class="small muted">${t('ayasWord')} ${as.slice(0, 20).join(', ')}${as.length > 20 ? '…' : ''}</span></span><span class="spacer"></span><button class="btn sm gold" data-act="revise" data-s="${s}" data-from="${as[0]}" data-to="${as[as.length - 1]}">${t('reviseBtn')}</button></li>`).join('') + '</ul>' : `<p class="muted" style="margin:0">${t('nothingDue')}</p>`}</div>

  <div class="sec-title"><h2>${t('bilan')}</h2></div>
  ${(isSunday && period === 'week') ? `<div class="recap-banner">${t('weekEnd')}</div>` : ''}${(lastDay && period === 'month') ? `<div class="recap-banner">${t('monthEnd')}</div>` : ''}
  <div class="seg" role="group" style="margin-bottom:12px">${['week', 'lweek', 'month', 'lmonth'].map(k => `<button data-act="period" data-p="${k}" aria-pressed="${period === k}">${t({ week: 'thisWeek', lweek: 'lastWeek', month: 'thisMonth', lmonth: 'lastMonth' }[k])}</button>`).join('')}</div>
  <div class="kpis"><div><b>${fmtDur(tot)}</b><span>${t('timeSpent')}</span></div><div><b>${active}</b><span>${t('activeDays')}</span></div><div><b>${fmtDur(active ? tot / active : 0)}</b><span>${t('perDay')}</span></div><div><b>${learnedP}</b><span>${t('newLearned')}</span></div></div>
  <div class="panel" style="margin-top:10px"><div class="bars">${perDay.map((ms, i) => `<div title="${R.days[i].toLocaleDateString(S().lang)} : ${fmtDur(ms)}"><i class="${ms >= S().goal * 60000 ? 'goal-ok' : ''}" style="height:${ms / maxD * 100}%"></i><span>${dayLbl(R.days[i])}</span></div>`).join('')}</div>
  <p class="small muted" style="margin:8px 0 0">${t('goal')} : ${S().goal} ${t('min')}. ${S().lang === 'ar' ? 'العمود الذهبي = الهدف محقق' : 'Barre dorée = objectif atteint'}</p></div>
  ${top.length ? `<div class="panel" style="margin-top:10px"><h3 style="margin-bottom:6px">${t('topSurahs')}</h3><ul class="list-plain">${top.map(([s, ms]) => `<li>${med(s, 0)}<span>${esc(sur(+s).fr)}</span><span class="spacer"></span><b>${fmtDur(ms)}</b></li>`).join('')}</ul></div>` : ''}
  <div class="sec-title"><h2>${t('history')}</h2></div>
  <div class="panel">${hist.length ? '<ul class="list-plain">' + hist.map(x => { const top1 = Object.entries(x.sb || {}).sort((a, b) => b[1] - a[1])[0]; return `<li><span>${new Date(x.start).toLocaleDateString(S().lang, { weekday: 'short', day: 'numeric', month: 'short' })} · ${new Date(x.start).toLocaleTimeString(S().lang, { hour: '2-digit', minute: '2-digit' })}</span><span class="spacer"></span><span class="muted small">${top1 ? esc(sur(+top1[0]).fr) : ''}</span><b>${fmtDur(x.dur)}</b></li>`; }).join('') + '</ul>' : '<p class="muted" style="margin:0">—</p>'}</div>`;
}

/* ----- Réglages ----- */
function settingsView() {
  const s = S(), profs = Object.values(DB.profiles);
  const sw = (k, lbl) => `<label class="switch"><span>${lbl}</span><input type="checkbox" data-set="${k}" ${s[k] ? 'checked' : ''}></label>`;
  const total = Q.reduce((a, x) => a + x.a.length, 0);
  return `<div class="hero" style="padding-top:8px"><h2>${t('settings')}</h2></div>
  <div class="set-group"><h3>${t('profiles')}</h3><div class="panel">
    ${profs.map(p => `<div class="prof ${p.id === DB.active ? 'on' : ''}"><span class="av">${esc(p.name.slice(0, 1).toUpperCase())}</span><span><b>${esc(p.name)}</b><br><span class="small muted">${Object.values(p.ay).filter(r => r.s === 2).length} ${t('learned').toLowerCase()}</span></span><span class="spacer"></span>
      ${p.id === DB.active ? `<span class="small muted">${t('active')}</span>` : `<button class="btn sm" data-act="useprof" data-id="${p.id}">${t('use')}</button>`}
      <button class="icon-btn" data-act="renprof" data-id="${p.id}" aria-label="${t('rename')}">${svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>')}</button>
      ${profs.length > 1 ? `<button class="icon-btn" data-act="delprof" data-id="${p.id}" aria-label="${t('delete')}">${I.trash}</button>` : ''}</div>`).join('')}
    <button class="btn sm" style="margin-top:10px" data-act="addprof">+ ${t('addProfile')}</button>
  </div></div>

  <div class="set-group"><h3>${t('display')}</h3><div class="panel">
    <div class="field" style="margin-bottom:12px"><span class="lbl">${t('theme')}</span><div class="seg">${['auto', 'light', 'dark', 'sepia'].map(k => `<button data-act="theme" data-th="${k}" aria-pressed="${s.theme === k}">${t('theme' + k[0].toUpperCase() + k.slice(1))}</button>`).join('')}</div></div>
    <div class="field" style="margin-bottom:12px"><span class="lbl">${t('uiLang')}</span><div class="seg"><button data-act="lang" data-l="fr" aria-pressed="${s.lang === 'fr'}">Français</button><button data-act="lang" data-l="ar" aria-pressed="${s.lang === 'ar'}">العربية</button></div></div>
    <div class="field" style="margin-bottom:6px"><span class="lbl">${t('fontSize')} · ${s.qsize}px</span><input type="range" min="24" max="52" step="2" value="${s.qsize}" data-range="qsize" aria-label="${t('fontSize')}"></div>
    <div class="ar" style="font-family:var(--font-quran);font-size:${s.qsize}px;text-align:center;line-height:2">${tjHtml(ayaData(1, 2)[0])}</div>
    ${sw('tajweed', t('tajweed'))}${sw('trans', t('translation'))}${sw('tafsirBtn', t('showTafsir'))}
    <button class="btn sm" style="margin-top:10px" data-act="legend">${I.palette}${t('legend')}</button>
  </div></div>

  <div class="set-group"><h3>${t('goal')}</h3><div class="panel"><div class="row"><div class="stepper"><button data-act="goal" data-d="-5" aria-label="-5">−</button><output>${s.goal}</output><button data-act="goal" data-d="5" aria-label="+5">+</button></div><span class="muted">${t('minutesPerDay')}</span></div></div></div>

  <div class="set-group"><h3>${t('audio')}</h3><div class="panel">
    <div class="optrow"><div class="l"><b>${t('reciter')}</b><span>${RECITER.name} · ${RECITER.ar} · Hafs</span></div></div>
    ${sw('keepAudio', t('keepAudio'))}
    <div class="optrow"><div class="l"><b>${t('downloadAll')}</b><span>${audioKeys.size} / ${total} · <span data-dltxt></span></span><div class="dlbar" data-dlbar hidden><i></i></div></div>
      ${DL.busy ? `<button class="btn sm" data-act="dlstop">${t('cancel')}</button>` : `<button class="btn sm" data-act="dlall">${I.dl}</button>`}</div>
    <div class="optrow"><div class="l"><b>${t('storage')}</b><span id="storageEst">…</span></div></div>
  </div></div>

  <div class="set-group"><h3>${t('sync')}</h3><div class="panel stack">
    <p class="small muted" style="margin:0">Ta progression reste sur l’appareil et fonctionne hors ligne. Avec un jeton GitHub (droit « gist » uniquement), elle se synchronise automatiquement entre PC et iPhone dès qu’il y a du réseau.</p>
    <div class="field"><label for="tok">${t('token')}</label><input class="input" id="tok" type="password" autocomplete="off" value="${esc(DB.sync.token)}" placeholder="ghp_…"></div>
    <div class="row" style="flex-wrap:wrap"><button class="btn sm" data-act="savetok">${t('saveToken')}</button><button class="btn sm primary" data-act="syncnow" ${DB.sync.token ? '' : 'disabled'}>${I.sync}${t('syncNow')}</button>
    <span class="small muted">${t('lastSync')} : ${DB.sync.last ? new Date(DB.sync.last).toLocaleString(S().lang) : t('never')}</span></div>
    <div class="row" style="flex-wrap:wrap"><button class="btn sm" data-act="export">${t('exportData')}</button><button class="btn sm" data-act="import">${t('importData')}</button></div>
  </div></div>

  <div class="set-group"><h3>${t('about')}</h3><div class="panel small muted">
    <p style="margin-top:0">Texte coranique Hafs avec marquage tajwid : Tanzil, via AlQuran.cloud. Traduction française : Muhammad Hamidullah. Récitation : Saad Al-Ghamidi, fichiers par aya d’EveryAyah. Tafsir Ibn Kathir (arabe intégral et anglais abrégé) : projet spa5k/tafsir_api. Tafsir en français : PDF par sourate, traduction Ahmad Harakat, hébergés sur Internet Archive.</p>
    <p style="margin-bottom:0">Version ${APP_VERSION}</p></div></div>`;
}

/* ============ Feuilles (sheets) ============ */
const sheet = $('#sheet');
function openSheet(title, body, foot) {
  $('#sheetTitle').textContent = title; $('#sheetBody').innerHTML = body;
  const f = $('#sheetFoot'); f.hidden = !foot; f.innerHTML = foot || '';
  if (!sheet.open) sheet.showModal(); $('#sheetBody').scrollTop = 0;
}
function closeSheet() { if (sheet.open) sheet.close(); }
$('#sheetClose').onclick = closeSheet;
sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });

function ayaSheet(s, a) {
  const st = effStatus(key(s, a)), raw = (P().ay[key(s, a)] || {}).s || 0;
  const x = ayaData(s, a);
  const b = (v, lbl) => `<button data-act="setst" data-s="${s}" data-a="${a}" data-v="${v}" aria-pressed="${raw === v}">${med(a, v === 2 && st === 3 ? 3 : v)}<span>${lbl}</span></button>`;
  openSheet(`${sur(s).fr} · ${t('ayaWord')} ${a}`, `
    <div class="tf-aya ${S().tajweed ? '' : 'no-tj'}">${tjHtml(x[0])}</div>
    <div class="status-pick">${b(0, t('markNone'))}${b(1, t('markProgress'))}${b(2, t('markLearned'))}</div>
    ${raw === 2 ? `<button class="btn ${st === 3 ? 'gold' : ''}" style="width:100%;margin-top:10px" data-act="reviewed" data-s="${s}" data-a="${a}">${I.check}${t('reviewed')}</button>` : ''}
    <div class="stack" style="margin-top:14px">
      <button class="btn" style="width:100%" data-act="playfrom" data-s="${s}" data-a="${a}">${I.play}${t('playFrom')}</button>
      <div class="grid2"><button class="btn" data-act="setfrom" data-s="${s}" data-a="${a}">${t('setFrom')}</button><button class="btn" data-act="setto" data-s="${s}" data-a="${a}">${t('setTo')}</button></div>
      ${S().tafsirBtn ? `<button class="btn" style="width:100%" data-act="tafsir" data-s="${s}" data-a="${a}">${I.book}${t('tafsirOf')}</button>` : ''}
    </div>`);
}
function repSheet() {
  const c = S().rep, N = sur(currentSurah()).a.length;
  const stp = (k, v, min = 1, max = 99) => `<div class="stepper"><button data-act="rstep" data-k="${k}" data-d="-1" data-min="${min}" data-max="${max}" aria-label="-1">−</button><output>${v}</output><button data-act="rstep" data-k="${k}" data-d="1" data-min="${min}" data-max="${max}" aria-label="+1">+</button></div>`;
  const chip = (k, v, lbl) => `<button class="chip" data-act="rset" data-k="${k}" data-v="${v}" aria-pressed="${String(c[k]) === String(v)}">${lbl}</button>`;
  const sp = v => `<button class="chip" data-act="speed" data-v="${v}" aria-pressed="${S().speed === v}">×${String(v).replace('.', ',')}</button>`;
  openSheet(`${t('repetition')} · ${sur(currentSurah()).fr}`, `
    <div class="seg" style="margin-bottom:14px">${['aya', 'serie', 'prog'].map(m => `<button data-act="rset" data-k="mode" data-v="${m}" aria-pressed="${c.mode === m}">${t({ aya: 'modeAya', serie: 'modeSerie', prog: 'modeProg' }[m])}</button>`).join('')}</div>
    <p class="small muted" style="margin:-4px 0 12px">${{ aya: 'Chaque aya est répétée, puis on passe à la suivante (ou on s’arrête).', serie: 'Chaque aya de la série est répétée, puis toute la série recommence.', prog: 'Aya 1 répétée, aya 2 répétée, puis 1+2 ensemble, aya 3, puis 1+2+3, etc.' }[c.mode]}</p>
    <div class="grid2" style="margin-bottom:6px">
      <div class="field"><label for="rf">${c.mode === 'aya' ? t('playFrom') : t('from')}</label><input class="input" id="rf" type="number" inputmode="numeric" min="1" max="${N}" value="${c.from}" data-rnum="from"></div>
      ${c.mode !== 'aya' ? `<div class="field"><label for="rt">${t('to')}</label><input class="input" id="rt" type="number" inputmode="numeric" min="1" max="${N}" value="${c.to}" data-rnum="to"></div>` : '<div></div>'}
    </div>
    <div class="optrow"><div class="l"><b>${t('ayaTimes')}</b><span>nombre d’écoutes de chaque aya</span></div>${stp('n', c.n)}</div>
    ${c.mode === 'serie' ? `<div class="optrow"><div class="l"><b>${t('serieTimes')}</b></div>${stp('m', c.m)}</div>` : ''}
    ${c.mode === 'prog' ? `<div class="optrow"><div class="l"><b>${t('blockTimes')}</b></div>${stp('m', c.m)}</div>` : ''}
    ${c.mode === 'aya' ? `<label class="switch"><span>${t('advance')}</span><input type="checkbox" data-rbool="adv" ${c.adv ? 'checked' : ''}></label>` : ''}
    <label class="switch"><span>${t('infinite')}</span><input type="checkbox" data-rbool="inf" ${c.inf ? 'checked' : ''}></label>
    <label class="switch"><span>${t('basmala')}</span><input type="checkbox" data-set="basmala" ${S().basmala ? 'checked' : ''}></label>
    <div class="field" style="margin:12px 0"><span class="lbl">${t('pause')}</span><div class="chips">${chip('gap', 0, '0 s')}${chip('gap', 2, '2 s')}${chip('gap', 4, '4 s')}${chip('gap', 8, '8 s')}${chip('gap', 'echo', t('echo'))}</div></div>
    <div class="field"><span class="lbl">${t('speed')}</span><div class="chips">${[0.75, 0.9, 1, 1.15, 1.25, 1.5].map(sp).join('')}</div></div>
    ${c.mode !== 'aya' ? `<button class="btn" style="width:100%;margin-top:16px" data-act="markserie">${I.check}${t('markSerie')} (${c.from}–${c.to})</button>` : ''}`,
    `<button class="btn primary" data-act="launch">${I.play}${t('launch')}</button>`);
}
let tafState = { s: 1, a: 1, lang: 'fr' };
async function tafsirSheet(s, a, lang) {
  tafState = { s, a, lang: lang || tafState.lang || S().tafsirLang };
  const L = tafState.lang; S().tafsirLang = L; save();
  const tabs = `<div class="seg" style="margin-bottom:14px">${[['fr', 'Français'], ['en', 'English'], ['ar', 'العربية']].map(([k, l]) => `<button data-act="tflang" data-l="${k}" aria-pressed="${L === k}">${l}</button>`).join('')}</div>`;
  const head = `<div class="tf-aya ${S().tajweed ? '' : 'no-tj'}">${tjHtml(ayaData(s, a)[0])} ${med(a, effStatus(key(s, a)))}</div>`;
  const foot = `<button class="btn" data-act="tfnav" data-d="-1" ${a <= 1 ? 'disabled' : ''}>${I.chevL}${t('prev')}</button><button class="btn" data-act="tfnav" data-d="1" ${a >= sur(s).a.length ? 'disabled' : ''}>${t('next')}${I.chevR}</button>`;
  const title = `${t('tafsirOf')} · ${sur(s).fr} ${a}`;
  if (L === 'fr') {
    const url = PDF_BASE + encodeURIComponent(sur(s).pdf);
    openSheet(title, tabs + head + `<p class="tr" dir="ltr" style="font-family:var(--font-read);line-height:1.65;margin:0 0 14px">${esc(ayaData(s, a)[1])}</p>
      <div class="pdf-card">${I.pdf}<div><b>${t('openPdf')}</b><br><span class="small muted">${esc(sur(s).fr)} · Ibn Kathir · trad. Ahmad Harakat</span></div><span class="spacer"></span><a class="btn sm primary" href="${url}" target="_blank" rel="noopener">${t('openPdf').split(' ')[0]}</a></div>
      <p class="tf-note" style="margin-top:12px">${t('frPdfNote')} Le commentaire par aya est disponible dans les onglets English (version abrégée) et العربية (version intégrale).</p>`, foot);
    return;
  }
  openSheet(title, tabs + head + `<p class="muted">…</p>`, foot);
  const data = await getTafsir(L, s);
  if (tafState.s !== s || tafState.a !== a || tafState.lang !== L || !sheet.open) return;
  if (!data) { $('#sheetBody').innerHTML = tabs + head + `<p class="tf-note">${t('tafsirOffline')}</p>`; return; }
  const r = tafsirFor(data, a);
  $('#sheetBody').innerHTML = tabs + head + (r.lo !== r.hi ? `<div class="tf-note">${t('commonTafsir')} ${r.lo}–${r.hi}</div>` : '') + `<div class="tf-text ${L === 'ar' ? 'ar' : ''}" ${L === 'en' ? 'dir="ltr" lang="en"' : 'lang="ar"'}>${tafsirHtml(r.text, L === 'ar') || '<p class="muted">—</p>'}</div>`;
}
function legendSheet() {
  const L = [['g', 'Ghunna (nasalisation)', 'غنة'], ['f', 'Ikhfa (dissimulation)', 'إخفاء'], ['c', 'Ikhfa chafawi', 'إخفاء شفوي'], ['i', 'Iqlab (conversion)', 'إقلاب'],
  ['a', 'Idgham avec ghunna', 'إدغام بغنة'], ['u', 'Idgham sans ghunna', 'إدغام بلا غنة'], ['w', 'Idgham chafawi', 'إدغام شفوي'], ['q', 'Qalqala (rebond)', 'قلقلة'],
  ['n', 'Madd naturel (2)', 'مد طبيعي'], ['p', 'Madd permis (2, 4, 6)', 'مد جائز'], ['o', 'Madd obligatoire (4, 5)', 'مد واجب'], ['m', 'Madd nécessaire (6)', 'مد لازم'],
  ['h', 'Hamzat al-wasl, lettre muette, lam chamsiyya', 'همزة وصل / لا يُلفظ']];
  openSheet(t('legend'), `<div class="legend">${L.map(([c, f, a]) => `<div class="tj-${c}"><i></i><span style="color:var(--ink)">${f}</span><span class="arx">${a}</span></div>`).join('')}</div>`);
}
function chronoSheet() {
  openSheet(t('session'), `<div class="big"><span class="n">${fmtClock(sess ? sess.dur : 0)}</span><span class="d">${manualPause ? t('paused') : ''}</span></div>
    <p class="muted">${t('today')} : <b>${fmtDur(todayMs())}</b> ${t('goalOf')} ${S().goal} ${t('min')}</p>
    <div class="stack"><button class="btn" style="width:100%" data-act="chronopause">${manualPause ? t('resumeChrono') : t('pauseChrono')}</button>
    <button class="btn" style="width:100%" data-act="endsession">${t('endSession')}</button>
    <button class="btn ghost" style="width:100%" data-act="nav" data-v="stats">${t('stats')}</button></div>`);
}
function promptSheet(title, value, cb) {
  openSheet(title, `<input class="input" id="pIn" value="${esc(value)}" maxlength="30">`, `<button class="btn" data-act="sheetclose">${t('cancel')}</button><button class="btn primary" id="pOk">${t('save')}</button>`);
  setTimeout(() => $('#pIn').focus(), 50);
  $('#pOk').onclick = () => { const v = $('#pIn').value.trim(); if (v) { cb(v); closeSheet(); } };
}

/* ============ Synchronisation (GitHub Gist) ============ */
function mergeData(remote) {
  if (!remote || !remote.profiles) return;
  Object.entries(remote.tomb || {}).forEach(([id, ts]) => { DB.tomb[id] = Math.max(DB.tomb[id] || 0, ts); });
  for (const [id, rp] of Object.entries(remote.profiles)) {
    if (DB.tomb[id]) continue;
    const lp = DB.profiles[id];
    if (!lp) { DB.profiles[id] = JSON.parse(JSON.stringify(rp)); continue; }
    if ((rp.nameT || 0) > (lp.nameT || 0)) { lp.name = rp.name; lp.nameT = rp.nameT; }
    for (const [k, r] of Object.entries(rp.ay || {})) if (!lp.ay[k] || (r.t || 0) > (lp.ay[k].t || 0)) lp.ay[k] = r;
    const byId = new Map(lp.sessions.map(x => [x.id, x]));
    for (const rs of rp.sessions || []) {
      const ls = byId.get(rs.id);
      if (!ls) { lp.sessions.push({ ...rs, sb: { ...(rs.sb || {}) } }); }
      else if (ls !== sess) { ls.dur = Math.max(ls.dur, rs.dur); for (const [s, ms] of Object.entries(rs.sb || {})) ls.sb[s] = Math.max(ls.sb[s] || 0, ms); }
    }
    lp.sessions.sort((a, b) => a.start - b.start);
  }
  Object.keys(DB.tomb).forEach(id => { delete DB.profiles[id]; });
  if (!DB.profiles[DB.active]) { DB.active = Object.keys(DB.profiles)[0]; sess = null; }
  if (!DB.active) { const d = defaultDB(); DB.profiles = d.profiles; DB.active = d.active; }
}
const payload = () => ({ app: 'voyage-coran', v: 1, profiles: DB.profiles, tomb: DB.tomb, updated: Date.now() });
async function gh(path, opt = {}) {
  const r = await fetch('https://api.github.com' + path, { ...opt, headers: { Authorization: 'Bearer ' + DB.sync.token, Accept: 'application/vnd.github+json', ...(opt.body ? { 'Content-Type': 'application/json' } : {}) } });
  if (!r.ok) throw new Error('GitHub ' + r.status);
  return r.json();
}
let syncing = false, syncT;
async function syncNow(silent) {
  if (!DB.sync.token || syncing || !navigator.onLine) return;
  syncing = true;
  try {
    let g = null;
    if (DB.sync.gist) { try { g = await gh('/gists/' + DB.sync.gist); } catch (e) { g = null; } }
    if (!g) { const list = await gh('/gists?per_page=100'); const f = list.find(x => x.files && x.files[GIST_FILE]); if (f) g = await gh('/gists/' + f.id); }
    if (g) {
      const file = g.files[GIST_FILE];
      const txt = file.truncated ? await (await fetch(file.raw_url)).text() : file.content;
      try { mergeData(JSON.parse(txt)); } catch (e) { }
      DB.sync.gist = g.id;
      await gh('/gists/' + g.id, { method: 'PATCH', body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(payload()) } } }) });
    } else {
      const c = await gh('/gists', { method: 'POST', body: JSON.stringify({ description: 'Voyage avec le Coran — synchronisation', public: false, files: { [GIST_FILE]: { content: JSON.stringify(payload()) } } }) });
      DB.sync.gist = c.id;
    }
    DB.sync.last = Date.now(); save(true);
    if (!silent) toast(t('synced'));
    if (!sheet.open && !PL.playing) render();
  } catch (e) { if (!silent) toast(t('syncErr') + ' : ' + e.message); }
  finally { syncing = false; }
}
function scheduleSync() { if (!DB.sync.token) return; clearTimeout(syncT); syncT = setTimeout(() => syncNow(true), 20000); }
function exportData() {
  const blob = new Blob([JSON.stringify(payload(), null, 1)], { type: 'application/json' });
  const name = 'voyage-coran-' + dayKey() + '.json';
  const file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(() => { }); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
}
$('#importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try { mergeData(JSON.parse(await f.text())); save(true); render(); toast(t('imported')); } catch (err) { toast('Fichier invalide'); }
  e.target.value = '';
});

/* ============ Événements ============ */
function openSurah(n, a) {
  S().surah = n; S().view = 'read';
  if (S().readMode === 'page') S().page = ayaData(n, a || 1)[3];
  save(); render();
  if (a && a > 1) requestAnimationFrame(() => { const el = document.getElementById(`a-${n}-${a}`) || document.getElementById(`pa-${n}-${a}`); if (el) el.scrollIntoView({ block: 'center' }); });
  else scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const d = el.dataset, s = +d.s, a = +d.a, act = d.act;
  switch (act) {
    case 'nav': closeSheet(); S().view = d.v; save(); render(); scrollTo(0, 0); break;
    case 'open': openSurah(s); break;
    case 'goto': openSurah(s, a); break;
    case 'aya': e.stopPropagation(); ayaSheet(s, a); break;
    case 'reveal': if (S().hide) { const r = el.closest('.aya') || el.closest('.pa'); r && r.classList.toggle('reveal'); } else if (el.classList.contains('pa')) { const b = el.querySelector('.med'); b && ayaSheet(+b.dataset.s, +b.dataset.a); } break;
    case 'quick': { const cur = (P().ay[key(s, a)] || {}).s || 0; setStatus(s, a, cur === 2 ? 0 : 2); if (cur !== 2) toast(t('learnedToast'), 1400); refreshAya(s, a); break; }
    case 'setst': setStatus(s, a, +d.v); refreshAya(s, a); ayaSheet(s, a); break;
    case 'reviewed': markReviewed(s, a); refreshAya(s, a); closeSheet(); toast(t('saved'), 1200); break;
    case 'playfrom': closeSheet(); if (S().rep.mode !== 'aya') { S().rep.from = a; if (S().rep.to < a) S().rep.to = a; } else S().rep.from = a; save(); if (S().surah !== s) { S().surah = s; render(); } startPlayback(s, a); break;
    case 'setfrom': S().rep.from = a; if (S().rep.to < a) S().rep.to = a; if (S().rep.mode === 'aya') S().rep.mode = 'serie'; save(); closeSheet(); render(); toast(`${t('from')} ${a}`, 1200); break;
    case 'setto': S().rep.to = a; if (S().rep.from > a) S().rep.from = a; if (S().rep.mode === 'aya') S().rep.mode = 'serie'; save(); closeSheet(); render(); toast(`${t('to')} ${a}`, 1200); break;
    case 'tafsir': tafsirSheet(s, a); break;
    case 'tflang': tafsirSheet(tafState.s, tafState.a, d.l); break;
    case 'tfnav': tafsirSheet(tafState.s, clamp(tafState.a + +d.d, 1, sur(tafState.s).a.length)); break;
    case 'toggle': { const k = d.k; if (k === 'readMode') { S().readMode = S().readMode === 'page' ? 'list' : 'page'; const l = S().last && S().last.s === currentSurah() ? S().last.a : 1; S().page = ayaData(currentSurah(), l)[3]; } else S()[k] = !S()[k]; save(); render(); break; }
    case 'pg': { S().page = clamp(S().page + +d.d, 1, 604); const f = PAGES[S().page][0]; S().surah = f[0]; save(); render(); scrollTo(0, 0); break; }
    case 'repsheet': repSheet(); break;
    case 'rset': { let v = d.v; if (d.k === 'gap' && v !== 'echo') v = +v; S().rep[d.k] = v; save(); repSheet(); render(); break; }
    case 'rstep': { const k = d.k; S().rep[k] = clamp(S().rep[k] + +d.d, +d.min, +d.max); el.parentElement.querySelector('output').textContent = S().rep[k]; save(); break; }
    case 'speed': S().speed = +d.v; audio.playbackRate = S().speed; save(); repSheet(); break;
    case 'launch': closeSheet(); startPlayback(currentSurah(), S().rep.from); break;
    case 'markserie': { for (let i = S().rep.from; i <= S().rep.to; i++) if (((P().ay[key(currentSurah(), i)] || {}).s || 0) !== 2) setStatus(currentSurah(), i, 2); closeSheet(); render(); toast(t('serieMarked')); break; }
    case 'dlsurah': downloadAyas(surahList(s), sur(s).fr); break;
    case 'delaudio': if (confirm(t('deleteAudio') + ' ?')) deleteSurahAudio(s); break;
    case 'dlall': { const all = [[1, 1]]; Q.forEach(x => x.a.forEach((_, i) => all.push([x.n, i + 1]))); downloadAyas(all, 'Coran'); render(); break; }
    case 'dlstop': DL.abort = true; break;
    case 'revise': Object.assign(S().rep, { mode: 'serie', s, from: +d.from, to: +d.to }); openSurah(s, +d.from); repSheet(); break;
    case 'period': period = d.p; render(); break;
    case 'theme': S().theme = d.th; save(); render(); break;
    case 'lang': S().lang = d.l; save(); render(); break;
    case 'legend': legendSheet(); break;
    case 'goal': S().goal = clamp(S().goal + +d.d, 5, 240); save(); render(); break;
    case 'useprof': DB.active = d.id; sess = null; save(); render(); break;
    case 'addprof': promptSheet(t('addProfile'), '', v => { const id = 'p_' + uid(); DB.profiles[id] = { id, name: v, nameT: Date.now(), created: Date.now(), ay: {}, sessions: [] }; DB.active = id; sess = null; save(); render(); scheduleSync(); }); break;
    case 'renprof': promptSheet(t('rename'), DB.profiles[d.id].name, v => { DB.profiles[d.id].name = v; DB.profiles[d.id].nameT = Date.now(); save(); render(); scheduleSync(); }); break;
    case 'delprof': if (confirm(t('confirmDelete'))) { DB.tomb[d.id] = Date.now(); delete DB.profiles[d.id]; if (DB.active === d.id) { DB.active = Object.keys(DB.profiles)[0]; sess = null; } save(); render(); scheduleSync(); } break;
    case 'savetok': DB.sync.token = $('#tok').value.trim(); DB.sync.gist = ''; save(true); render(); toast(t('saved')); if (DB.sync.token) syncNow(); break;
    case 'syncnow': syncNow(); break;
    case 'export': exportData(); break;
    case 'import': $('#importFile').click(); break;
    case 'chronopause': manualPause = !manualPause; lastAct = Date.now(); chronoSheet(); break;
    case 'endsession': save(true); sess = null; newSession(); lastRun = Date.now(); closeSheet(); toast(t('saved')); break;
    case 'sheetclose': closeSheet(); break;
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.set) { S()[el.dataset.set] = el.checked; save(); render(); }
  if (el.dataset.rbool) { S().rep[el.dataset.rbool] = el.checked; save(); }
  if (el.dataset.rnum) { const N = sur(currentSurah()).a.length; S().rep[el.dataset.rnum] = clamp(parseInt(el.value) || 1, 1, N); if (S().rep.to < S().rep.from) S().rep.to = S().rep.from; save(); render(); }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.range) { S()[el.dataset.range] = +el.value; save(); applyPrefs(); const lbl = el.closest('.field').querySelector('.lbl'); lbl.textContent = `${t('fontSize')} · ${el.value}px`; const pv = el.closest('.panel').querySelector('.ar'); if (pv) pv.style.fontSize = el.value + 'px'; }
  if (el.dataset.search !== undefined) { const html = surahRows(el.value); const side = el.closest('.side-list'); if (side) side.querySelector('.slist').outerHTML = html; else { const box = $('#homeList'); if (box) box.innerHTML = html; } }
});
function refreshAya(s, a) {
  const st = effStatus(key(s, a));
  $$(`.med[data-act="aya"][data-s="${s}"][data-a="${a}"]`).forEach(m => m.dataset.st = st);
  $$(`[data-act="quick"][data-s="${s}"][data-a="${a}"]`).forEach(b => b.setAttribute('aria-pressed', st >= 2));
  const sl = $('#sideList'); if (sl && getComputedStyle($('#side')).display !== 'none') { const q = sl.querySelector('input')?.value || ''; sl.querySelector('.slist').outerHTML = surahRows(q); }
}
$('#chrono').onclick = chronoSheet;
$('#dockPlay').onclick = togglePlay;
$('#dockNext').onclick = () => jump(1);
$('#dockPrev').onclick = () => jump(-1);
$('#dockStop').onclick = () => stopPlayback(false);
$('#dockRep').onclick = repSheet;
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { save(true); if (DB.sync.token && navigator.onLine) syncNow(true); }
  else { lastTick = Date.now(); lastAct = Date.now(); }
});
addEventListener('pagehide', () => save(true));
addEventListener('keydown', e => { if (e.target.matches('input,textarea') || sheet.open) return; if (e.code === 'Space' && PL.queue.length) { e.preventDefault(); togglePlay(); } if (e.key === 'ArrowRight' && PL.queue.length) jump(S().lang === 'ar' ? 1 : -1); if (e.key === 'ArrowLeft' && PL.queue.length) jump(S().lang === 'ar' ? -1 : 1); });

/* ============ Démarrage ============ */
(async function init() {
  loadDB();
  if (DB.settings.view === 'read' && !DB.settings.surah) DB.settings.view = 'home';
  applyPrefs();
  $('#view').innerHTML = '<p class="muted" style="padding:40px 0;text-align:center">Chargement du Coran…</p>';
  try { await loadQuran(); } catch (e) { $('#view').innerHTML = '<p style="padding:40px 16px">Impossible de charger le texte du Coran. Ouvre l’app une première fois avec du réseau.</p>'; return; }
  try { await idbOpen(); await idbKeys(); } catch (e) { }
  render();
  setInterval(tick, 1000);
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
  setTimeout(() => syncNow(true), 2500); setInterval(() => syncNow(true), 5 * 60 * 1000);
  setInterval(async () => { const el = $('#storageEst'); if (el && navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); el.textContent = `${(e.usage / 1048576).toFixed(0)} Mo utilisés`; } }, 3000);
  addEventListener('online', () => syncNow(true));
})();

"""Construit le site dans ./site : texte du Coran (tajwid Hafs + Hamidullah), polices, icônes, service worker.
Lancé automatiquement par GitHub Actions à chaque mise à jour du dépôt."""
import json, os, re, shutil, hashlib, math, urllib.request, datetime
from PIL import Image, ImageDraw

OUT = 'site'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'}
def get(url, raw=False):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        b = r.read()
    return b if raw else b.decode('utf-8')

shutil.rmtree(OUT, ignore_errors=True)
for d in ('data', 'fonts', 'icons'): os.makedirs(f'{OUT}/{d}')
for f in ('index.html', 'styles.css', 'app.js', 'manifest.webmanifest'): shutil.copy(f, f'{OUT}/{f}')

# --- Texte du Coran ---
FR = ("L'Ouverture|La Vache|La Famille d'Imran|Les Femmes|La Table servie|Les Bestiaux|Al-A'raf|Le Butin|Le Repentir|Jonas|Houd|Joseph|Le Tonnerre|Abraham|Al-Hijr|Les Abeilles|Le Voyage nocturne|La Caverne|Marie|Ta-Ha|Les Prophètes|Le Pèlerinage|Les Croyants|La Lumière|Le Discernement|Les Poètes|Les Fourmis|Le Récit|L'Araignée|Les Romains|Luqman|La Prosternation|Les Coalisés|Saba|Le Créateur|Ya-Sin|Les Rangées|Sad|Les Groupes|Le Pardonneur|Les Versets détaillés|La Consultation|L'Ornement|La Fumée|L'Agenouillée|Al-Ahqaf|Muhammad|La Victoire éclatante|Les Appartements|Qaf|Qui éparpillent|At-Tur|L'Étoile|La Lune|Le Tout Miséricordieux|L'Événement|Le Fer|La Discussion|L'Exode|L'Éprouvée|Le Rang|Le Vendredi|Les Hypocrites|La Grande Perte|Le Divorce|L'Interdiction|La Royauté|La Plume|Celle qui montre la vérité|Les Voies d'ascension|Noé|Les Djinns|L'Enveloppé|Le Revêtu d'un manteau|La Résurrection|L'Homme|Les Envoyés|La Nouvelle|Les Anges qui arrachent les âmes|Il s'est renfrogné|L'Obscurcissement|La Rupture|Les Fraudeurs|La Déchirure|Les Constellations|L'Astre nocturne|Le Très-Haut|L'Enveloppante|L'Aube|La Cité|Le Soleil|La Nuit|Le Jour montant|L'Ouverture de la poitrine|Le Figuier|L'Adhérence|La Destinée|La Preuve|La Secousse|Les Coursiers|Le Fracas|La Course aux richesses|Le Temps|Les Calomniateurs|L'Éléphant|Quraych|L'Ustensile|L'Abondance|Les Infidèles|Les Secours|Les Fibres|Le Monothéisme pur|L'Aube naissante|Les Hommes").split('|')
assert len(FR) == 114
meta = json.loads(get('https://archive.org/metadata/tafsir-ibnkathir-complet-francais'))
PDF = {int(f['name'].split(' ')[0]): f['name'] for f in meta['files'] if f['name'].lower().endswith('.pdf') and f['name'].split(' ')[0].isdigit()}
assert len(PDF) == 114
tj = json.loads(get('https://api.alquran.cloud/v1/quran/quran-tajweed'))['data']['surahs']
fr = json.loads(get('https://api.alquran.cloud/v1/quran/fr.hamidullah'))['data']['surahs']
out = []
for s, f in zip(tj, fr):
    ay = [[a['text'], b['text'], a['juz'], a['page'], a['hizbQuarter'], 1 if a['sajda'] else 0] for a, b in zip(s['ayahs'], f['ayahs'])]
    out.append({'n': s['number'], 'ar': s['name'], 'tr': s['englishName'], 'fr': FR[s['number'] - 1],
                't': 'M' if s['revelationType'] == 'Meccan' else 'D', 'pdf': PDF[s['number']], 'a': ay})
assert sum(len(s['a']) for s in out) == 6236
json.dump(out, open(f'{OUT}/data/quran.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# --- Polices (hébergées localement pour le hors ligne) ---
css_all = ''.join(get('https://fonts.googleapis.com/css2?family=' + fam + '&display=swap') for fam in
                  ('Amiri+Quran', 'Literata:wght@400;600', 'Instrument+Sans:wght@400;500;600', 'Noto+Naskh+Arabic:wght@400;600'))
faces, seen = [], {}
for sub, body in re.findall(r'/\* ([\w-]+) \*/\s*@font-face \{(.*?)\}', css_all, re.S):
    if sub not in ('arabic', 'latin', 'latin-ext'): continue
    fam = re.search(r"font-family: '([^']+)'", body).group(1)
    url = re.search(r'url\((.*?)\)', body).group(1)
    ur = re.search(r'unicode-range: ([^;]+);', body).group(1)
    w = re.search(r'font-weight: (\d+)', body).group(1)
    if url not in seen:
        name = fam.replace(' ', '') + '-' + sub + '-' + hashlib.md5(url.encode()).hexdigest()[:6] + '.woff2'
        open(f'{OUT}/fonts/{name}', 'wb').write(get(url, raw=True)); seen[url] = name
    faces.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url(fonts/{seen[url]}) format('woff2');unicode-range:{ur};}}")
open(f'{OUT}/fonts.css', 'w').write('\n'.join(faces))

# --- Icônes (étoile à 8 branches) ---
def icon(size, name, pad=0.0):
    S = size * 4; im = Image.new('RGB', (S, S), '#0F3D3A'); d = ImageDraw.Draw(im); c = S / 2; r = S * (0.36 - pad)
    star = lambda rr: [[(c + rr * math.cos(math.radians(rot + 45 + 90 * i)), c + rr * math.sin(math.radians(rot + 45 + 90 * i))) for i in range(4)] for rot in (0, 45)]
    for p in star(r): d.polygon(p, fill='#D9A441')
    for p in star(r * 0.62): d.polygon(p, fill='#0F3D3A')
    r3 = r * 0.26; d.ellipse([c - r3, c - r3, c + r3, c + r3], fill='#F3EEDF')
    im.resize((size, size), Image.LANCZOS).save(f'{OUT}/icons/{name}')
icon(192, 'icon-192.png'); icon(512, 'icon-512.png'); icon(180, 'apple-touch-icon.png'); icon(512, 'icon-maskable.png', pad=0.08)

# --- Service worker ---
build = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M')
sw = open('sw.template.js').read().replace('__BUILD__', build).replace('__FONTS__', ', '.join(f"'fonts/{n}'" for n in sorted(seen.values())))
open(f'{OUT}/sw.js', 'w').write(sw)
open(f'{OUT}/.nojekyll', 'w').write('')
print('Site prêt :', build, len(seen), 'polices')

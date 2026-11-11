# Voyage avec le Coran

Application de mémorisation du Coran (PWA, fonctionne hors ligne sur PC et iPhone).

- Récitation : Saad Al-Ghamidi, fichiers par aya (EveryAyah)
- Texte Hafs avec tajwid en couleurs (Tanzil, via AlQuran.cloud)
- Traduction française : Muhammad Hamidullah
- Tafsir Ibn Kathir : arabe intégral et anglais abrégé (spa5k/tafsir_api), français en PDF par sourate (trad. Ahmad Harakat, Internet Archive)
- Répétition par aya, par série et progressive, statuts appris / en cours / à réviser, révisions espacées
- Chrono de session, objectif quotidien, bilans de la semaine et du mois, profils, synchronisation via gist

## Publication

À chaque mise à jour de la branche `main`, GitHub Actions lance `build.py` : il télécharge le texte du Coran, les polices et génère les icônes dans `site/`, puis publie le tout sur GitHub Pages.

Adresse : https://contactmrgoodthoughts-tech.github.io/voyage-coran/

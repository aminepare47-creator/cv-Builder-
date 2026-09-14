# 📄 CV Builder — Créez un CV professionnel avec l'IA

Application web complète de création de CV (React + TypeScript + Vite + Tailwind), 100 % dans le navigateur : aucune donnée n'est envoyée sur un serveur.

## ✨ Fonctionnalités

### Rédaction assistée par IA
- **Vraie IA connectable** : **Groq** (Llama 3.3 70B…) ou **Google Gemini** (2.0 Flash…). La clé API reste dans le `localStorage` de votre navigateur.
- Repli automatique sur un générateur local si aucune clé n'est configurée.
- **5 tons** : Classique · Dynamique · Élégant · Direct · Créatif.
- **Génération de plusieurs versions** d'une même description.
- **Adaptation à une offre d'emploi** : collez l'annonce, l'IA cible les mots-clés.
- Prompts professionnels : vocabulaire métier, verbes d'action variés, interdiction d'inventer des informations.

### Analyse & score qualité
- **Note sur 100** avec 12 critères (lisibilité, structure, ATS, dates, résumé…).
- **Comparaison CV ↔ offre d'emploi** : compétences manquantes, mots-clés, taux de compatibilité ATS.
- Recommandations concrètes (« Ajoutez des résultats chiffrés », « Votre résumé est trop long »…).

### Studio photo
- Analyse de la photo (netteté, exposition, cadrage du visage, fond, résolution) avec score /100.
- Recadrage automatique centré sur le visage, amélioration auto, noir & blanc, formes rect/cercle.

### Contenu
- **17 profils métiers** prêts à l'emploi (compétences, mots-clés ATS, formulations, modèle conseillé).
- **15+ sections personnalisables** (Réalisations, Publications, Bénévolat, Portfolio, Permis…) + sections 100 % libres (titre, lignes, réorganisation, masquage).
- 10 modèles visuels, 8 palettes de couleurs, 8 langues (dont arabe RTL).
- Édition directe dans l'aperçu A4.

### Import / Export
- Import PDF, DOCX, TXT, JSON avec détection de sections, aperçu avant remplacement, OCR via PDF scanné.
- Export : **PDF multi-pages, DOC (Word), TXT, Markdown, JSON, PNG, JPG** + impression.

### Expérience utilisateur
- Mode sombre · Annuler/Rétablir · sauvegarde automatique avec historique · barre de progression du CV · raccourcis clavier · tutoriel de première visite · aperçu plein écran.

## 🚀 Démarrage

```bash
npm install
npm run dev      # développement
npm run build    # build de production
```

## 🔑 Activer l'IA (gratuit)

1. Ouvrez l'assistant de rédaction (✨) puis l'icône ⚙️.
2. Choisissez **Groq** (clé gratuite sur [console.groq.com](https://console.groq.com)) ou **Gemini** (gratuit sur [aistudio.google.com](https://aistudio.google.com)).
3. Collez votre clé API — elle ne quitte jamais votre navigateur.

## 🛠 Stack

React 18 · TypeScript · Vite · Tailwind CSS · jsPDF · html2canvas · pdfjs-dist

## 📁 Structure

```
src/
├── components/
│   ├── editor/        # Panneaux d'édition (profil, IA, score, profils métiers…)
│   ├── templates/     # 10 modèles de CV + édition en ligne
│   └── …              # Studio photo, import, export, aperçu A4
├── utils/             # IA (Groq/Gemini), score qualité, photo, exports, profils métiers
├── types/cv.ts        # Modèle de données
└── i18n/              # Traductions (8 langues)
```

## Licence

MIT

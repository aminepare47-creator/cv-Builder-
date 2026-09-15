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

**Deux modes possibles, aucun code à changer :**

### Mode 1 — IA serveur (recommandé pour un site public)
L'utilisateur ne saisit **rien** : la clé reste secrète côté serveur.

1. Déployez le projet sur [Vercel](https://vercel.com) (import du dépôt GitHub).
2. Dans **Settings → Environment Variables**, ajoutez au moins une variable :
   - `GROQ_API_KEY` = votre clé Groq (gratuite sur [console.groq.com](https://console.groq.com))
   - `GEMINI_API_KEY` = votre clé Google AI Studio (facultative, [aistudio.google.com](https://aistudio.google.com))
3. Redéployez. Le site appelle `/api/ai` : l'IA est active d'emblée, les visiteurs ne voient aucune clé.

> L'API serverless est dans `api/ai.js` (aucune dépendance à installer). En local : `npx vercel dev`.

### Mode 2 — Clé personnelle (BYOK)
Chaque utilisateur peut ouvrir l'assistant ✨ → ⚙️ et coller sa propre clé : elle reste stockée dans son navigateur (localStorage). Sans clé ni serveur, un générateur local prend le relais (hors ligne).

📄 Le fichier `.env.example` liste les variables attendues.

### 🔁 Basculement automatique de modèle

Plus besoin de choisir le « bon » modèle : le service essaie les modèles gratuits **en cascade** et change tout seul dès qu'un modèle atteint sa limite (HTTP 429), est saturé (503) ou n'est pas accessible au compte.

- Chaîne Groq : `openai/gpt-oss-120b` → `openai/gpt-oss-20b` → `qwen/qwen3.8-27b` → `groq/compound` → `allam-2-7b`
- Puis chaîne Gemini (si `GEMINI_API_KEY` est définie) : `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-1.5-pro`
- Un modèle qui vient d'échouer est mis en **quarantaine 60 s** et évité lors des appels suivants (il est retenté ensuite).
- Le même mécanisme existe côté navigateur pour les utilisateurs qui utilisent leur propre clé.
- L'interface affiche le modèle réellement utilisé (badge ⚡ sous les versions générées).

## 🛠 Stack

React 18 · TypeScript · Vite · Tailwind CSS · jsPDF · html-to-image · pdfjs-dist

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

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description README - Frontend User (Next.js 15)
 * @created 2026-04-18
 */

# 📱 Frontend User — EmiID

Application web principale destinée aux utilisateurs finaux (professionnels, artisans, entreprises).

## 📖 Documentation Détaillée
Pour une documentation complète des fonctionnalités et de l'architecture, voir :
👉 **[docs/FRONTEND_USER.md](file:///home/hopsyder/Projet/app-emiid/docs/FRONTEND_USER.md)**

## 🚀 Stack Technique
- **Framework** : Next.js 15 (App Router)
- **Styling** : Tailwind CSS + Framer Motion
- **Auth/DB** : Supabase SSR (`@supabase/ssr`)
- **i18n** : Internationalisation dynamique (`[locale]`)

## 🛠️ Installation & Lancement

```bash
# Aller dans le dossier
cd frontend-user

# Installer les dépendances
npm install

# Lancer en mode dev
npm run dev
```

## 🏗️ Structure du dossier `app/`
- `[locale]/annuaire` : Recherche et listing des membres.
- `[locale]/creer-profil` : Workflow de création de profil.
- `[locale]/dashboard` : Tableau de bord privé.
- `[locale]/messages` : Messagerie temps réel.
- `[locale]/parametres` : Gestion du profil et sécurité.

## ⚠️ Notes de Développement
- Le middleware gère la protection des routes.
- Les appels API passent majoritairement par le proxy backend ou directement vers Supabase via le client SSR.

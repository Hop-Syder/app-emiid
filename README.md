/\*\*

- @author @hopsyder
- @organization Nexus Partners
- @description Analyse et documentation technique du projet Nexus Connect
- @created 2026-01-04
- @updated 2026-01-04
- 🌐 ceo.nexuspartners.xyz
- 📧 daoudaabassichristian@gmail.com
  \*/──────────────────────────────────

# 🚀 Nexus Connect - Solution Professionnelle "All-in-One"

**Nexus Connect** est une plateforme de mise en relation stratégique et de gestion de projets conçue pour dynamiser l'écosystème professionnel. Elle permet la connexion fluide entre talents, la collaboration sur des marchés de projets complexes et la gestion centralisée d'une communauté d'affaires.

---

## 🛠️ Stack Technique

### 💻 Frontend (Utilisateur)

- **Framework** : Next.js 15.5 (App Router)
- **UI/UX** : React 19, Framer Motion, TailwindCSS
- **Composants** : Radix UI / Shadcn UI
- **Lib d'Icônes** : Lucide React

### ⚙️ Backend (API)

- **Environnement** : Node.js (TypeScript)
- **Framework** : Express 4.19
- **Sécurité** : Helmet, CORS, Supabase Auth middleware

### 🛡️ Admin Panel

- **Framework** : Next.js 16.1 (Experimental)
- **Styling** : TailwindCSS 4

### 🗄️ Infrastructure & Services

- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (via `@supabase/ssr`)
- **Déploiement** : Vercel (Edge & Serverless)

---

## 🏗️ Architecture & Structure

Le projet est structuré en **Monorepo** pour une gestion cohérente du frontend, du backend et des outils administratifs.

```text
.
├── admin/                # dashboard-user administratif (Next.js 16 + Tailwind 4)
├── backend/              # API Express sécurisée (TypeScript)
│   ├── src/
│   │   ├── api/routes/   # Définition des points d'entrée (Auth, etc.)
│   │   ├── controllers/  # Logique métier & interaction Base de Données
│   │   ├── middlewares/  # Validation, Auth, Sécurité (Helmet)
│   │   └── app.ts        # Configuration & middleware Express
├── frontend-user/        # Application utilisateur principale (Next.js 15)
│   ├── app/              # Routes Next.js (dashboard-user, Market, Messagerie)
│   ├── components/       # Librairie de composants UI réutilisables
│   └── lib/              # Client Supabase et outils utilitaires
├── package.json          # Scripts globaux (concurrently)
└── DEPLOYMENT.md         # Documentation stratégique de déploiement
```

---

## 🚀 Installation & Démarrage

### Pré-requis

- **Node.js** (v18.0+)
- **npm** (v10.0+)
- Un compte **Supabase** avec un projet configuré.

### Configuration Locale

1. **Cloner le projet** :

   ```bash
   git clone https://github.com/votre-compte/app-nexus-connect.git
   cd app-nexus-connect
   ```

2. **Installer les dépendances** :

   ```bash
   # À la racine
   npm install
   # Dans chaque package (nécessaire pour le démarrage local)
   npm run install:all # (Optionnel : si script ajouté ou manuellement via cd)
   ```

3. **Variables d'environnement** :
   Créez les fichiers `.env` dans les dossiers respectifs basés sur les exemples fournis :
   - **backend/.env** : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CORS_ORIGIN`
   - **frontend-user/.env.local** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Lancer le projet

```bash
# Pour lancer Frontend + Backend + Admin en simultané (Mode Dev)
npm run dev:all
```

---

## ✨ Fonctionnalités Clés

- **Authentification Sécurisée** : Gestion robuste des sessions avec Supabase SSR.

- **Annuaire de Profils** : Réseau interactif pour découvrir et se connecter à des experts.
- **Messagerie Temps-Réel** : Centre de discussion intégré pour une collaboration efficace.
- **Gestion Administrative** : Interface dédiée pour la modération et le suivi de la plateforme.

---

## 📈 État du Projet

- **Version** : 1.0.0-beta
- **Status** : Développement Actif 🛠️
- **Objectif** : Finalisation du module Backend et déploiement de la version Admin Stable.

---

> "Le code est le reflet de l'excellence opérationnelle."

**@hopsyder** | **Nexus Partners**
🌐 [ceo.nexuspartners.xyz](https://ceo.nexuspartners.xyz)
📧 daoudaabassichristian@gmail.com

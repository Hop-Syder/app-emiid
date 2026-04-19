/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Arborescence logicielle complète de l'écosystème Nukun
 * @created 2026-03-24
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

# 📂 Arborescence Complète - Nukun

Ce document détaille la structure organisationnelle du projet Nukun pour une reconstruction fidèle du système.

```tree
.
├── admin/                     # Dashboard Administratif (Next.js 16)
│   ├── app/                   # Routes administratives
│   ├── components/            # Composants UI d'administration
│   ├── lib/                   # Outils et clients API (Supabase)
│   ├── package.json
│   └── tsconfig.json
├── backend/                   # API Express Centrale (TypeScript)
│   ├── src/
│   │   ├── api/routes/        # Routes : auth, user, references, dashboard, public, messages
│   │   ├── config/            # Configurations : supabase, env, vars
│   │   ├── controllers/       # Logique métier : authController, userController, etc.
│   │   ├── middlewares/       # Sécurité : authenticateUser, validateInput, errorHandler
│   │   ├── models/            # Types et Schémas (TypeScript)
│   │   ├── services/          # Services externes (Email, Paiement, Stockage)
│   │   ├── types/             # Fichiers de définition des types (.d.ts)
│   │   ├── utils/             # Fonctions utilitaires diverses
│   │   └── app.ts             # Initialisation Express
│   ├── package.json
│   └── tsconfig.json
├── design-system/             # Composants partagés (Atomic Design)
│   ├── src/
│   │   ├── components/        # ProfileCard, AnnuaireCard, MarketCard, Navbar, Footer
│   │   ├── hooks/             # Custom hooks partagés
│   │   ├── styles/            # Tailwind Global Styles & Design Tokens
│   │   └── utils/
│   └── package.json
├── document-projet/           # Documentation de référence (Analyse & Architecture)
│   ├── api-endpoints.md
│   ├── arborescence-complete.md
│   ├── boilerplate-code.md
│   ├── modeles-donnees.md
│   └── rapport-architectural.md
├── frontend-user/             # Application Utilisateur (Next.js 15)
│   ├── app/                   # Structure de routing [App Router]
│   │   ├── [locale]/          # Internationalisation (i18n)
│   │   ├── annuaire/          # Recherche de profils
│   │   ├── auth/              # Connexion, Inscription, Reset Password

│   │   ├── creer-profil/      # Onboarding initial
│   │   ├── dashboard-user/    # Panel utilisateur central

│   │   ├── messages/          # Centre de messagerie
│   │   ├── onboarding/        # Flux de bienvenue
│   │   ├── parametres/        # Gestion du compte
│   │   └── portefeuille/      # Wallet et gestion financière
│   ├── components/            # Composants spécifiques au frontend
│   ├── lib/                   # client supabase, utils, validations
│   ├── public/                # Assets statiques : logos, images, svgs
│   ├── package.json
│   └── tailwind.config.ts
├── sql/                       # Scripts Base de Données (Supabase/PostgreSQL)
│   ├── nexus_connect_unified.sql  # Schéma unifié, triggers, et RLS
│   └── init_data.sql          # Données de base
├── scripts/                   # Scripts d'automatisation (Setup, Deploy, Backup)
├── .gitignore
├── package.json               # Racine Monorepo (npm workspaces / concurrently)
├── README.md                  # Vue d'ensemble stratégique
└── FEATURES.md                # Analyse fonctionnelle systémique
```

## 🔐 Fichiers de Configuration Sensibles (À recréer)

- `backend/.env`
- `frontend-user/.env.local`
- `admin/.env.local`
- `supabase.toml` (si utilisation de Supabase CLI)

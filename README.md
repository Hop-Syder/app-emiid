/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Documentation racine de l'écosystème Nukun
 * @created 2026-01-04
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/──────────────────────────────────

# 🚀 Nukun — Ton réseau, ta force

**Nukun** est une infrastructure digitale centralisée conçue pour structurer, connecter et dynamiser l’écosystème professionnel à travers une gestion intelligente de profils, d’interactions et de validations.

---

## 📖 Documentation Complète

Pour une immersion profonde dans les différentes couches du projet, consultez la documentation dédiée :

- 🌌 **[Project Overview](file:///home/hopsyder/Projet/app-nukun/docs/PROJECT_OVERVIEW.md)** : Vision, Stratégie SaaS et Roadmap.
- 📱 **[Frontend User](file:///home/hopsyder/Projet/app-nukun/docs/FRONTEND_USER.md)** : Guide technique et fonctionnel de l'application utilisateur.
- 🛠️ **[Frontend Admin](file:///home/hopsyder/Projet/app-nukun/docs/FRONTEND_ADMIN.md)** : Cockpit d'administration, sécurité et modération.
- 🗄️ **[Database & SQL](file:///home/hopsyder/Projet/app-nukun/docs/DATABASE_SCHEMA.md)** : Schéma master, RLS et logique métier SQL.

---

## 🏗️ Architecture du Monorepo

```bash
.
├── docs/                 # Documentation centralisée (MAJ 2026-04-18)
├── frontend-user/        # App Utilisateur (Next.js 15 + Supabase SSR)
├── frontend-admin/       # Cockpit Admin (Next.js 16 + Tailwind 4)
├── backend/              # Proxy API (Express + TypeScript)
├── sql/                  # Source of Truth Base de Données
└── design-system/        # Tokens et composants UI partagés
```

---

## ⚙️ État des Fonctionnalités (Core Features)

- 🔐 **Auth** : Authentification sécurisée (Email/OAuth) avec middleware de protection.
- 👥 **Profiles** : Système extensible de profils pro/artisans avec publication contrôlée.
- 💬 **Messaging** : Messagerie temps réel avec support média et médiation admin.
- 🗺️ **Directory** : Annuaire intelligent avec filtres géographiques et sectoriels.
- 🛡️ **Security** : Protection par PIN et Row Level Security (RLS) granulaire.

---

## 🚀 Démarrage Rapide

1. **Installation** : `pnpm install` à la racine.
2. **Configuration** : Configurer les `.env.local` dans `frontend-user` et `frontend-admin`.
3. **Développement** :
   - User : `cd frontend-user && npm run dev`
   - Admin : `cd frontend-admin && npm run dev`

---

## 📊 Audit & Qualité
Consultez l'**[Audit des Frontends](file:///home/hopsyder/Projet/app-nukun/AUDIT_FRONTENDS.md)** pour connaître les points de vigilance techniques et les priorités de développement actuelles.

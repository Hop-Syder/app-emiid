# 🚀 EmiID — Votre empreinte numérique professionnelle

**EmiID** est une infrastructure digitale centralisée conçue pour structurer, connecter et dynamiser l’écosystème professionnel à travers une gestion intelligente de profils, d’interactions et de validations.

---

## 📖 Documentation Complète

Pour une immersion profonde dans les différentes couches du projet, consultez la documentation dédiée :

- 🌌 **[Project Overview](docs/PROJECT_OVERVIEW.md)** : Vision, Stratégie SaaS et Roadmap.
- 📱 **[Frontend User](docs/FRONTEND_USER.md)** : Guide technique et fonctionnel de l'application utilisateur.
- 🛠️ **[Frontend Admin](docs/FRONTEND_ADMIN.md)** : Cockpit d'administration, sécurité et modération.
- 🗄️ **[Database & SQL](docs/DATABASE_SCHEMA.md)** : Schéma master, RLS et logique métier SQL.
- 💳 **[Monétisation](docs/MONETISATION.md)** : Abonnements Pro, Boosts territoriaux et paiements FedaPay.
- 🤖 **[Recherche IA & Sémantique](docs/RECHERCHE_IA.md)** : Moteur d'embeddings, FTS PostgreSQL et assistant Groq.
- 🎭 **[Jeu de Démonstration](docs/JEU_DEMO.md)** : Données réalistes marquées et réversibles pour les démos.

---

## 🏗️ Architecture du Monorepo

```bash
.
├── docs/                 # Documentation centralisée (MAJ 2026-08-22)
├── frontend-user/        # App Utilisateur (Next.js 16 + React 19 + Supabase SSR)
├── frontend-admin/       # Cockpit Admin (Next.js 16 + Tailwind 4)
├── frontend-commercial/  # Site Vitrine & Commercial (Next.js 16)
├── backend/              # API Proxy & Paiements (Express + TypeScript)
├── sql/                  # Source of Truth Base de Données (Migrations & Seeds)
└── design-system/        # Tokens et composants UI partagés
```

---

## ⚙️ État des Fonctionnalités (Core Features)

- 🔐 **Auth & Sécurité** : Authentification sécurisée (Email/OTP), protection par PIN et RLS granulaire.
- 👥 **Profils & Réalisations** : Profils professionnels avec portfolio Bento, QR Code, vCard et badges vérifiés.
- 🤖 **Recherche Intelligente & Vocale** : Moteur IA avec recherche sémantique (Groq/Gemini), FTS avec ranking et dictée vocale.
- 💳 **Monétisation & Boosts** : Abonnements Pro mensuels/annuels, boosts communaux/départementaux et FedaPay Mobile Money.
- 💬 **Messagerie & Médiation** : Chat temps réel, partage de pièces jointes et médiation de litiges admin.
- 🗺️ **Annuaire & Référentiel** : Annuaire avec géolocalisation et filtres sectoriels (77 communes du Bénin).
- 🛠️ **Cockpit Admin** : Vue des revenus réels encaissés, modération, suspensions et journal d'audit.

---

## 🚀 Démarrage Rapide

1. **Installation** : `pnpm install` à la racine.
2. **Configuration** : Configurer les `.env.local` dans `frontend-user`, `frontend-admin`, `frontend-commercial` et `.env` dans `backend`.
3. **Développement complet** :
   - Tous les services : `npm run dev:all`
   - User : `npm run dev:frontend`
   - Admin : `npm run dev:admin`
   - Commercial : `npm run dev:commercial`
   - Backend : `npm run dev:backend`

---

## 📊 Audit & Qualité
Consultez le **[Rapport d'Audit Consolidé](docs/RAPPORT_AUDIT_CONSOLIDE.md)** et l'**[État du MVP](docs/ETAT_MVP.md)** pour connaître la synthèse complète des fonctionnalités et vérifications du projet.

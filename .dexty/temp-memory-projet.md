# DEXTY — Mémoire Projet
> Généré automatiquement — Ne pas éditer manuellement
> @author @hopsyder | Nexus Partners

## 📌 Méta-projet
- **Nom** : EmiID
- **Type** : SaaS (Web App + Backend API + Admin)
- **Initialisé le** : 2026-05-27
- **Dernière mise à jour** : 2026-05-27

## 🛠️ Stack détectée
- **Frontend** : Next.js, React 19, TailwindCSS, Radix UI
- **Backend** : Node.js, Express, TypeScript, WebSockets
- **Base de données** : Supabase (PostgreSQL)
- **DevOps** : Concurrently (structure monorepo-like)
- **Authentification** : Supabase Auth, bcrypt

## 🎯 Skills actifs pour ce projet
> Skills pré-sélectionnés à charger selon la tâche demandée

### Toujours disponibles (core)
- `senior-fullstack` — Architecture et fonctionnalités métier
- `clean-code` — Standards et qualité de code
- `api-design-principles` — Conception API

### Frontend / UI
- `nextjs-best-practices` — Bonnes pratiques App Router et rendu Next.js
- `react-best-practices` — Standards React 19 et composants
- `tailwind-design-system` — Styling et utilitaires UI

### Backend
- `nodejs-best-practices` — Standards de l'écosystème Node.js
- `nodejs-backend-patterns` — Architecture Express et TypeScript

### Base de données / Auth
- `supabase-automation` — Requêtes et intégration Supabase
- `nextjs-supabase-auth` — Intégration Supabase SSR dans Next.js

## 📁 Contexte projet
- **Description courte** : EmiID — "Ton réseau, ta force". Plateforme SaaS segmentée en trois parties : frontend utilisateur, portail admin, et API backend Node.js.
- **Patterns architecturaux** : Monorepo logique avec exécution concurrente. Séparation de l'API Node/Express des clients Next.js.
- **Dépendances critiques** : `@supabase/ssr`, `express`, `ws` pour les fonctionnalités en temps réel.

## ⚠️ Notes importantes
- Le backend utilise des WebSockets (`ws`) pour le temps réel.
- Deux applications Next.js distinctes (`frontend-user` et `frontend-admin`) accèdent aux mêmes bases de données / APIs.

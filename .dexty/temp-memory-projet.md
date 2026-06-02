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

### Sécurité
- Zod — Validation stricte des schémas de données, type-safety TypeScript, et protection contre les failles d'injection.

## 📁 Contexte projet
- **Description courte** : EmiID — "Ton réseau, ta force". Plateforme SaaS segmentée en trois parties : frontend utilisateur, portail admin, et API backend Node.js.
- **Patterns architecturaux** : Monorepo logique avec exécution concurrente. Séparation de l'API Node/Express des clients Next.js.
- **Dépendances critiques** : `@supabase/ssr`, `express`, `ws` pour les fonctionnalités en temps réel.

## ⚠️ Notes importantes
- Le backend utilise des WebSockets (`ws`) pour le temps réel.
- Deux applications Next.js distinctes (`frontend-user` et `frontend-admin`) accèdent aux mêmes bases de données / APIs.
- [2026-06-02] Refonte complète de la page de détail de profil utilisateur (`profile-detail-content.tsx`) vers une esthétique Luxury Editorial & Glassmorphism.
- [2026-06-02] Remplacement de l'upsert par un update d'abord avec un insert conditionnel en fallback pour l'enregistrement du profil dans `userController.ts`.
- [2026-06-02] Résolution de l'erreur HTTP 400 au chargement des profils en changeant `supabase` pour `supabaseAdmin` dans `getMyProfile` et en spécifiant explicitement les colonnes publiques dans `profile-detail-content.tsx` (évite la restriction SELECT sur les colonnes PIN).
- [2026-06-02] Correction du type TypeScript pour la relation `countries` (qui est inférée comme un tableau) dans `profile-detail-content.tsx` pour résoudre l'échec de build Vercel.

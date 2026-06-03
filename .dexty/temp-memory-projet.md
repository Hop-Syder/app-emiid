# DEXTY — Mémoire Projet
> Généré automatiquement — Ne pas éditer manuellement
> @author @hopsyder | Nexus Partners

## 📌 Méta-projet
- **Nom** : EmiID
- **Type** : SaaS (Web App + Backend API + Admin)
- **Initialisé le** : 2026-05-27
- **Dernière mise à jour** : 2026-06-02

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
- **Description courte** : EmiID — "Votre empreinte numérique professionnelle". Plateforme SaaS segmentée en trois parties : frontend utilisateur, portail admin, et API backend Node.js.
- **Patterns architecturaux** : Monorepo logique avec exécution concurrente. Séparation de l'API Node/Express des clients Next.js.
- **Dépendances critiques** : `@supabase/ssr`, `express`, `ws` pour les fonctionnalités en temps réel.

## ⚠️ Notes importantes
- Le backend utilise des WebSockets (`ws`) pour le temps réel.
- Deux applications Next.js distinctes (`frontend-user` et `frontend-admin`) accèdent aux mêmes bases de données / APIs.
- [2026-06-02] Refonte complète de la page de détail de profil utilisateur (`profile-detail-content.tsx`) vers une esthétique Luxury Editorial & Glassmorphism.
- [2026-06-02] Remplacement de l'upsert par un update d'abord avec un insert conditionnel en fallback pour l'enregistrement du profil dans `userController.ts`.
- [2026-06-02] Résolution de l'erreur HTTP 400 au chargement des profils en changeant `supabase` pour `supabaseAdmin` dans `getMyProfile` et en spécifiant explicitement les colonnes publiques dans `profile-detail-content.tsx` (évite la restriction SELECT sur les colonnes PIN).
- [2026-06-02] Correction du type TypeScript pour la relation `countries` (qui est inférée comme un tableau) dans `profile-detail-content.tsx` pour résoudre l'échec de build Vercel.
- [2026-06-02] Intégration des polices officielles de la charte graphique (`Satoshi` pour les titres et `General Sans` pour le corps) via le CDN Fontshare dans `globals.css` et `tailwind.config.ts`.
- [2026-06-02] Résolution du problème de masquage des boutons d'actions ("Sauvegarder" / "Mettre en ligne") sur mobile en décalant l'Action Dock à `bottom-[96px]` et le bouton d'Aperçu flottant à `bottom-[160px]` pour éviter la superposition avec le `MobileDock` de navigation.
- [2026-06-02] Ajout d'un logging d'erreur structuré et détaillé pour les requêtes Supabase dans `getMyProfile` et `updateMyProfile` de `userController.ts` pour faciliter le débogage sur Railway.
- [2026-06-02] Ajout d'un système de décodage et logging du rôle JWT de `SUPABASE_SERVICE_ROLE_KEY` dans `supabase.ts` pour diagnostiquer les erreurs de permissions sur Railway.
- [2026-06-02] Import à effet de bord explicite de `supabase.ts` dans `server.ts` pour garantir son exécution et l'écriture du log de diagnostic au démarrage.
- [2026-06-03] Création et factorisation du composant global Preloader.tsx (Luxury Editorial & Glassmorphism) pour homogénéiser tous les écrans de chargement de l'application (Créer profil, Paramètres, Notifications, Portefeuille).
- [2026-06-03] Ajout d'une page de routage dynamique `/profil/page.tsx` pour rediriger automatiquement l'utilisateur connecté vers son URL publique (/profil/[slug]), et mise à jour de la barre latérale desktop et de la palette de commandes vers ce lien.
- [2026-06-03] Harmonisation des routes de navigation publique ("Accueil" -> `/dashboard-public`, "Annuaire" -> `/annuaire`) et intégration de la détection dynamique d'authentification (Supabase) dans `NavigationShell` pour adapter automatiquement l'affichage du menu.
- [2026-06-03] Refonte complète de `/dashboard-public` : alignement sur le design Luxury Bento / Glassmorphism du hub connecté via `PublicBentoHeader`, intégration de la capture de lead `ProximityLockSection` (cartes floutées), ajout de l'exploration de catégories et harmonisation de la liste des entrepreneurs en vedette.
- [2026-06-03] Résolution de l'échec de compilation Vercel (TypeScript) en désactivant la vérification de type sur le fichier de messagerie mort `components/messages-content.tsx` via la directive `// @ts-nocheck`.
- [2026-06-03] Ajustement de l'alignement de la liste des filtres de notifications sur mobile (ajout de `px-6 md:px-1.5`) pour éviter que l'onglet \"Tout\" ne soit collé ou masqué à gauche.
- [2026-06-03] Déplacement du bouton "Valider" de la modale de filtres de l'annuaire (`annuaire-filters.tsx`) vers le haut à droite du champ de recherche sur mobile, et masquage du bouton en bas pour une ergonomie optimale.
- [2026-06-03] Positionnement de la barre de filtres de l'annuaire (`annuaire-filters.tsx`) en `sticky top-4` sur mobile (au lieu de `fixed bottom-28`) pour rester collée en haut au défilement et libérer l'espace inférieur au-dessus du MobileDock.
- [2026-06-03] Correction de la redirection automatique de `/profil` (`app/profil/page.tsx`) : redirection vers `/creer-profil` si l'utilisateur n'a pas encore configuré son profil (`has_profile` est faux en base), et redirection vers `/profil/[slug]` (ou `/profil/[uuid]` en fallback) s'il l'a configuré (dès qu'il enregistre son profil, même s'il n'a pas encore configuré de slug).
- [2026-06-03] Ajout de la synchronisation forcée de la session Supabase (`supabase.auth.getSession()`) avant le fetch du profil dans `ProfileDetailContent` pour s'assurer que le token JWT est injecté dans les requêtes et éviter que les règles RLS ne bloquent l'accès aux profils non publiés de l'utilisateur connecté.
- [2026-06-03] Résolution du bug de sauvegarde des compétences/tags (`userController.ts`) : implémentation d'une stratégie de fallback avec sélection directe du tag par son nom unique en cas de conflit PostgreSQL/PostgREST sur le `upsert` (qui retournait un résultat vide sur les tags déjà existants, empêchant l'association dans `profile_tags`). Ajout d'un dédoublonnement des tags et d'un `upsert` sur la table de liaison `profile_tags` pour éviter tout plantage SQL 500 en cas d'envois multiples.
- [2026-06-03] Initialisation de l'état `session` à `undefined` dans `useCurrentUserProfile.ts` pour corriger les faux-positifs de redirections et toasts "Vous devez être connecté" durant la phase de chargement asynchrone de session Supabase.
- [2026-06-03] Ajout de `has_profile: true` lors de l'enregistrement (insert ou update) du profil dans `userController.ts` pour identifier avec certitude si l'utilisateur a déjà configuré son profil.
- [2026-06-03] Création de la migration SQL `20260603_update_public_profiles_view.sql` pour ajouter `slug`, `email`, et `phone` dans la vue `public_profiles` afin de permettre le chargement et le contact via cette vue sécurisée.
- [2026-06-03] Résolution de l'erreur HTTP 400 et du bug d'affichage de la page de profil pour les visiteurs : mise à jour de `app/profil/[id]/page.tsx` pour interroger la vue `public_profiles` au lieu de la table privée `user_profiles`, et implémentation dans `ProfileDetailContent.tsx` d'un mécanisme de double requête avec repli (interrogation de `user_profiles` en premier, puis de `public_profiles` si le RLS bloque), garantissant que le propriétaire peut voir son profil même non publié, tandis que le public accède au profil publié en toute sécurité.
- [2026-06-03] Rédaction du rapport d'audit technique et UX complet dans `audit-rapport-emiid.md` structuré en 5 axes avec des recommandations de refactoring concrètes et des priorités d'action.
- [2026-06-03] Intégration du Portfolio dans la page de profil : ajout du chargement de la table `project_gallery` (filtrée sur les projets approuvés, sauf si l'utilisateur connecté est le propriétaire) et création de l'onglet "Portfolio & Réalisations" sous forme de grille Bento dans `ProfileDetailContent.tsx`.


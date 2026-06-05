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
- [2026-06-03] Résolution de la redirection abusive vers `/creer-profil` : modification de `app/profil/page.tsx` pour valider l'existence du profil de manière résiliente via `has_profile`, l'existence d'un `slug` ou de champs d'identité (`first_name` / `last_name`). Ajout de la rétrocompatibilité des données dans la migration `20260603_update_public_profiles_view.sql` en mettant à jour la colonne `has_profile` à `true` pour tous les profils existants déjà configurés.
- [2026-06-03] Correction de l'erreur TypeScript dans `app/profil/page.tsx` liée à la possibilité que `session` soit `undefined` lors de la redirection.
- [2026-06-03] Correction du bug de création de profil : ajout de la persistance d'`activity_domain` (Secteur d'activité) dans le frontend (`creer-profil-content.tsx`) pour qu'il soit correctement hydraté, sauvegardé et envoyé au backend.
- [2026-06-03] Restauration complète de la version WhatsApp fonctionnelle de la messagerie : suppression du hook alternatif `use-chat.ts` et du composant `chat-window.tsx` pour réactiver le composant autonome `messages-content.tsx` et ses fichiers associés.


- [2026-06-03] Correction de la sauvegarde de `activity_domain` : ajout du champ dans l'interface `CreateProfileFormData`, l'état initial, le chargeur d'hydratation et le payload envoyé à l'API backend dans `creer-profil-content.tsx`.
- [2026-06-03] Stabilisation de la logique des tags dans `userController.ts` : remplacement du upsert de tags PostgREST par un flux SELECT -> INSERT -> SELECT de repli en cas de concurrence, et remplacement de l'upsert de liaison composite de `profile_tags` par un simple `insert` après nettoyage par `delete`.
- [2026-06-03] Droit d'accès SQL pour les tags : ajout de privilèges `GRANT SELECT ON public.tags TO anon, authenticated;` et `GRANT SELECT ON public.profile_tags TO anon, authenticated;` dans la migration `20260603_update_public_profiles_view.sql` pour garantir l'hydratation fluide des tags après actualisation.
- [2026-06-05] Mise à jour de la section "Entrepreneurs du Réseau" sur le Dashboard Public pour utiliser la variante esthétique `glass-blue` sur les composants `EmiIDProfileCard`.
- [2026-06-05] Correction de l'erreur de prerender Next.js liée à `useSearchParams` dans `NavigationShell` en l'isolant dans un conteneur Suspense avec `ChatActiveWatcher`.
- [2026-06-05] Intégration des balises de métadonnées SEO complètes (OpenGraph, Twitter preview cards, descriptions, images de couverture) au niveau du layout global de l'application (`app/layout.tsx`).
- [2026-06-05] Création de l'icône de l'application `public/icon.svg` (design moderne et épuré avec dégradé indigo/violet et lettre E de l'identité de marque) pour résoudre l'erreur 404 lors du chargement des favicons de l'application.
- [2026-06-05] Correction de l'affichage mobile de la messagerie : remplacement de la hauteur rigide `h-[calc(100vh)]` par `h-full w-full` dans `MessagesContent` pour hériter dynamiquement de la hauteur fluide gérée par `MessagesLayout`, évitant ainsi le masquage de la zone de saisie de messages et des boutons d'upload sur mobile.
- [2026-06-05] Affichage conditionnel des boutons "Message" : masquage des boutons de contact/messagerie sur la carte `EmiIDProfileCard` et la page `ProfileDetailContent` si l'utilisateur visiteur n'est pas connecté.
- [2026-06-05] Indicateurs de statut des messages : implémentation du style de lecture WhatsApp dans `message-list.tsx` (simple coche pour envoyé, double coche bleu ciel pour lu, enveloppées dans des balises span pour la conformité TypeScript, avec infobulles contextuelles).
- [2026-06-05] Stabilisation de la conversation de messagerie : ajustement de la structure flexbox dans `app/messages/page.tsx` (`h-full max-h-full overflow-hidden` au lieu de `min-h-screen`) et retrait du padding-bottom global de `NavigationShell` sur `/messages` pour figer l'input de texte et d'upload au bas de l'écran, faisant de la zone des messages le seul conteneur scrollable.
- [2026-06-05] Masquage intelligent des menus de navigation : configuration de `NavigationShell` pour masquer le menu mobile (`MobileDock`) et la barre latérale desktop (`DesktopSidebar`) uniquement lorsqu'une conversation de chat est active (présence de paramètres d'URL), et les réafficher sur la vue générale de la messagerie.
- [2026-06-05] Masquage du flux de conversation sur Desktop : mise à jour de `messages-content.tsx` (colonne droite en `md:hidden`, colonne gauche en `md:w-full`) et de `navigation-shell.tsx` (`DesktopSidebar` toujours visible et `lg:pl-[88px]` constant sur ordinateur) afin d'afficher uniquement le menu/barre de navigation et la liste des conversations sur grand écran, tout en préservant le comportement fluide sur mobile.



# DEXTY — Mémoire Projet

> Généré automatiquement — Ne pas éditer manuellement
> @author @hopsyder | Nexus Partners

## 📌 Méta-projet

- **Nom** : EmiID
- **Type** : SaaS (Web App + Backend API + Admin + Commercial)
- **Initialisé le** : 2026-05-27
- **Dernière mise à jour** : 2026-08-29

## 🛠️ Stack détectée

- **Frontend** : Next.js (App Router), React 19, TailwindCSS, Radix UI, Framer Motion
- **Backend** : Node.js, Express, TypeScript, WebSockets
- **Base de données** : Supabase (PostgreSQL, RLS, Realtime, Storage, pgvector)
- **IA / Recherche** : Groq API (LLaMA), Google Gemini / Embeddings, FTS PostgreSQL avec ranking
- **Paiements** : FedaPay (Mobile Money MTN/Moov/Orange en XOF), Stripe
- **DevOps** : Concurrently (structure monorepo-like), Render (Backend), Vercel (Frontends)
- **Authentification** : Supabase Auth, SSR Cookies, bcrypt, PIN protection

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
- `ui-ux-pro-max` — Intelligence et guidelines UX/UI complètes
- `frontend-design` — Esthétique distinctive et design system
- `mobile-design` — Guidelines pour interfaces tactiles et mobiles
- `magic-animator` — Animations et micro-interactions magiques
- `theme-factory` — Création de thèmes dynamiques et dark mode

### Backend

- `nodejs-best-practices` — Standards de l'écosystème Node.js
- `nodejs-backend-patterns` — Architecture Express et TypeScript

### Base de données / Auth

- `supabase-automation` — Requêtes et intégration Supabase
- `nextjs-supabase-auth` — Intégration Supabase SSR dans Next.js

### Sécurité

- Zod — Validation stricte des schémas de données, type-safety TypeScript, et protection contre les failles d'injection.

### SEO / Open Graph / Indexation & Social Cards

- `seo` — Framework et orchestration globale d'audit et stratégie SEO
- `fixing-metadata` — Audit et correction fine des balises méta, Open Graph (og:title, og:image, og:description, og:url), Twitter Cards, favicons, canonicals
- `seo-meta-optimizer` — Optimisation des titres, descriptions et accroches pour le taux de clic (CTR) et le partage social
- `seo-technical` — Audit technique (robots.txt, sitemaps XML, indexabilité, crawlers IA : GPTBot, ClaudeBot, PerplexityBot)
- `seo-schema` — Données structurées Schema.org en JSON-LD (Person, ProfilePage, Organization, WebSite) pour Google Rich Results
- `seo-geo` — Optimisation pour les moteurs de recherche IA (Google AI Overviews, ChatGPT Search, Perplexity)
- `seo-audit` — Audits complets de performance, balisage et conformité SEO

## 📁 Contexte projet

- **Description courte** : EmiID — "Votre empreinte numérique professionnelle". Plateforme SaaS segmentée en plusieurs parties : frontend utilisateur, portail admin, site commercial, et API backend Node.js.
- **Origine & Conception** : Conçu au Bénin, à Cotonou (notamment `frontend-commercial`).
- **Patterns architecturaux** : Monorepo logique avec exécution concurrente. Séparation de l'API Node/Express des clients Next.js.
- **Dépendances critiques** : `@supabase/ssr`, `express`, `ws` pour les fonctionnalités en temps réel.

## ⚠️ Notes importantes

- Le backend utilise des WebSockets (`ws`) pour le temps réel.
- Trois applications Next.js distinctes (`frontend-user`, `frontend-admin` et `frontend-commercial`) accèdent aux mêmes bases de données / APIs.
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
- [2026-06-05] Améliorations de l'UI de messagerie (Réf. B & C) : intégration de transitions fluides avec Framer Motion (`chat-sidebar.tsx`) lors du tri, épinglage ou archivage, habillage Desktop (colonne de liste à 360px fixes, panneau Bento minimaliste et décoratif statique à droite, `messages-content.tsx`), et ajout d'un bouton de retour (`ArrowLeft`) vers l'annuaire à côté du titre principal.
- [2026-06-05] Correction de l'alignement des filtres de notifications sur mobile (`page.tsx`) : ajustement du padding horizontal à `px-4` (16px) et suppression de l'ajustement parent de padding afin de démarrer le premier onglet parfaitement aligné avec le reste de la page au repos, tout en conservant le défilement horizontal fluide sur les bords.
- [2026-06-05] Création et initialisation du dossier `frontend-tester` : implémentation de la page de signature légale d'accord de testeur bêta (stepper interactif avec 7 articles séquentiels obligatoires, canvas de signature) et du dashboard admin de suivi (avec export CSV, audit logs et génération de PDF certifié avec QR code). Utilisation de Next.js 15, Tailwind v4 et Prisma v6.
- [2026-06-11] Résolution de la dette technique et du type-safety : Typage strict des relations Supabase dans `profile-detail-content.tsx` via l'interface `ProfileQueryResult` pour éliminer les assertions `as any`. Rétablissement du typecheck strict dans `messages-content.tsx` en supprimant le `// @ts-nocheck` et en typant de manière rigoureuse les variables internes, fonctions asynchrones de messagerie (`sendMessageToDB`, `handleFileUpload`) et les prop callbacks.
- [2026-06-11] Résolution des erreurs d'inférence PostgREST : Ajout des structures vides `Functions: {}` et `Enums: {}` requises par le type `GenericSchema` du client Supabase, et du tableau `Relationships: []` obligatoire pour chaque table et vue dans `database.types.ts`. Cela résout à la racine les erreurs d'inférence de type `never` sur les requêtes `.from()` dans toute l'application de manière 100% type-safe et sans aucun cast `as any`.
- [2026-06-11] Enforcement du typage côté serveur : Ajout du paramètre générique `<Database>` sur le client serveur Supabase (`createServerClient`) dans `server.ts` pour garantir une validation stricte du schéma également sur le backend Next.js.
- [2026-06-12] Détection et scan du nouveau dossier `frontend-commercial` : projet de site commercial Next.js contenant des sections Hero, Fomo, Comparison, Social Proof et Pricing interfacées avec Supabase.
- [2026-06-12] Rédaction et création du `README.md` professionnel pour le projet `frontend-commercial` spécifiant la stack, l'installation locale, l'architecture du dossier et la procédure complète de déploiement sur Vercel.
- [2026-06-14] Mise à jour des Hubs (Public & Privé) : Ajout du badge "Fondateurs" dans la grille Bento 5 colonnes.
- [2026-06-14] Connexion au backend Supabase des statistiques du "CategoriesExplorer" (Annuaire) pour remplacer les chiffres statiques par de vraies données temps-réel.
- [2026-06-14] Refonte Dashboard Public : Ajout du "HubCommunities" et création d'un "PublicHubContextualCta" premium incitant les visiteurs à créer un compte.
- [2026-06-17] Ajout du lien vers la page "Portefeuille" dans le sous-menu de navigation mobile (MobileDockAuth) pour s'aligner avec les options de la barre latérale desktop.
- [2026-06-17] Propagation globale du nouveau logo d'EmiID : copie du dossier public/logo vers frontend-admin et frontend-commercial, et mise à jour de toutes les références d'images de logo obsolètes vers logo-emiid.png et icon.svg dans l'ensemble de l'espace de travail.
- [2026-06-17] Remplacement final des icônes Lucide par des icônes SVG Streamline colorées dans les menus (mobile-dock-guest, mobile-dock-auth, desktop-sidebar-auth, et desktop-sidebar-guest) avec typage TypeScript strict pour la sécurité et correction complète des imports et du typage de rendu.
- [2026-06-17] Augmentation de la taille du logo dans les barres de menus desktop (desktop-sidebar-auth et desktop-sidebar-guest) à w-12 h-12 (40x40px pour l'image) et réajustement du padding à px-5 pour un centrage parfait et une meilleure visibilité de la marque.
- [2026-06-17] Refonte de la section "En vue cette semaine" (`annuaire-spotlight.tsx`) pour utiliser un carrousel horizontal fluide (touch-scroll natif et snap-center) avec boutons de navigation gauche/droite interactifs (Chevron) identiques à ceux du Hub. Augmentation de la limite de chargement de profils de 3 à 10.
- [2026-06-17] Remplacement de la grille verticale "Tous les Profils" (`annuaire-grid.tsx`) par un affichage structuré en lignes horizontales défilantes indépendantes (jusqu'à 10 profils par ligne), dotées chacune de leurs propres boutons de défilement interactifs et du swipe natif sur mobile.
- [2026-06-17] Échange de position entre "Notifications" et "Portefeuille" dans le menu mobile (`mobile-dock-auth.tsx`). Portefeuille rejoint le dock principal et les Notifications sont intégrées au sous-menu flottant avec pastille rouge dynamique reportée sur l'icône Profil du dock.
- [2026-06-17] Nouvelle augmentation de la taille du logo dans les barres de menus desktop (desktop-sidebar-auth et desktop-sidebar-guest) à w-14 h-14 (48x48px pour l'image) avec ajustement du padding parent à px-4 pour assurer un centrage parfait et maximiser l'identité de marque.
- [2026-06-17] Mise à jour des URLs de l'image de prévisualisation sociale Open Graph / Twitter dans `layout.tsx` et `page.tsx` pour pointer vers `/logo/og-image.png` afin de correspondre au nouveau répertoire d'assets.
- [2026-06-17] Changement de la couleur du nom de marque "EmiID" dans les barres de navigation desktop (desktop-sidebar-auth et desktop-sidebar-guest) de blanc à bleu de marque (`text-blue-500`) pour une meilleure harmonie visuelle.
- [2026-06-21] Cache & Revalidation Next.js : Implémentation du cache persistant (`unstable_cache`) et de la déduplication au rendu (`cache` React) pour les profils. Revalidation sélective par tag (`revalidateTag("profile", "default")`) via l'intercepteur proxy d'API lors de modifications, follow ou suppressions.
- [2026-06-21] Augmentation de la taille du logo dans la page de connexion (login) de h-9 (36px) à h-14 (56px) pour une meilleure visibilité de la marque.
- [2026-06-22] Mise à jour esthétique de l'UI : Remplacement de l'icône de notification par `/svg/notification.svg` dans la barre latérale desktop et le dock mobile. Remplacement du texte `"Fondateur"` par le badge SVG `/svg/Badge-fondateur.svg` dans le header du dashboard connecté.
- [2026-06-22] Annuaire : Suppression de la section "Affiner votre recherche" et "Explorer par domaine d'activité" de l'annuaire public.
- [2026-06-22] Annuaire : Remplacement de la recherche de profil classique par une palette de commande (Cmd+K) avec filtres intégrés (type de profil et 12 secteurs d'activité). Ajout de la logique de filtrage par membres vérifiés (`onlyVerified`) au backend.
- [2026-06-22] Annuaire : Suppression de la statistique "Premium" du bloc d'informations de l'entête.
- [2026-06-22] Navigation : Augmentation de la taille de l'icône de notification dans le menu mobile (`size-3.5` -> `size-4.5`).
- [2026-06-22] Logo & SEO : Intégration du logo dynamique dans le header (`logo-emiid-light.png` en mode sombre / `logo-emiid-dark.png` en mode clair) et le footer (`logo-emiid-light.png`) du site commercial. Configuration complète des icônes d'application, metadataBase et images OpenGraph / Twitter Cards dans le layout SEO.
- [2026-06-22] Contenu commercial & Catégories : Remplacement du badge de lancement du Hero par un badge de recommandation étoilé. Conversion des mentions et filtres de profil 'Investisseur' en 'Entreprise / Investisseur' (frontend-user) ou 'Entreprise' (site commercial).
- [2026-06-22] Thème Menu : Changement dynamique de la couleur du texte 'EmiID' dans les barres latérales desktop (`desktop-sidebar-auth` et `desktop-sidebar-guest`) : bleu (`text-blue-500`) de jour, blanc (`dark:text-white`) de nuit.
- [2026-06-22] Thème User App : Intégration globale de ThemeProvider dans le layout racine (RootLayout) de frontend-user afin de propager correctement le thème actif et de rendre les styles et sélecteurs de mode nuit (dark:) opérationnels.
- [2026-06-22] Logo frontend-commercial : Augmentation de la taille du logo dans le Header (menus desktop/mobile) de h-9 (36px) à h-14 (56px) pour une meilleure visibilité de la marque.
- [2026-06-22] Contenu commercial : Suppression du badge de lancement étoilé ("Rejoignez 500+ professionnels...") de la section Hero.
- [2026-06-22] Portefeuille frontend-user : Suppression du composant de statistiques ProfileStats dans l'onglet Réseau (Favoris/Abonnés) du portefeuille.
- [2026-06-22] Logo frontend-commercial : Remplacement des images de logo textuel par l'icône icon.svg accompagnée du nom de marque "EmiID" en bleu (text-blue-500) dans le Header (desktop et mobile).
- [2026-06-22] Onboarding frontend-user : Rétablissement des illustrations à leur taille d'origine, et verrouillage du conteneur en plein écran (fixed inset-0 overflow-hidden) pour supprimer le scroll vertical.
- [2026-06-22] Onboarding frontend-user : Masquage conditionnel du logo de l'en-tête lors de la 3ème étape (step 3), augmentation de la taille du logo à 2x (h-24/sm:h-28) sur les deux premières étapes, et espacement des éléments avec un flexbox justify-between et du padding vertical.
- [2026-06-22] Annuaire frontend-user : Suppression du bloc de statistiques globales (Membres, Vérifiés, Pays) situé sous la barre de recherche (Cmd+K) dans le composant AnnuaireHero.
- [2026-06-22] Nettoyage : Suppression du dossier orphelin `frontend-user/app/reset-password`.
- [2026-06-22] Qualité & Perf : Résorption majeure de plus de 55 warnings ESLint. Conversion systématique des balises `<img>` vers `next/image` dans les composants clés, correction de typage explicit-any et nettoyage des dépendances manquantes/inutilisées des hooks React (Vague 1, 3, 4 et partie de la Vague 2 terminées).
- [2026-07-07] Design System : Mise à jour du master design system (`design-system/emiid/MASTER.md`) et des READMEs pour refléter officiellement la nouvelle charte graphique EmiID (polices Mitsuha/Inter, couleurs Bleu Roi, Bleu Cyan et Bleu Nuit, et style Luxury Bento / Glassmorphism).
- [2026-07-08] Avatar par défaut : Modification d'AvatarUpload.tsx pour initialiser la prévisualisation avec l'avatar par défaut `/profil/avatar.jpg` et s'assurer que l'image change dynamiquement dès que l'utilisateur téléverse son propre fichier.
- [2026-07-08] Avatar par défaut global : Extension de l'utilisation de l'image d'avatar par défaut `/profil/avatar.jpg` sur l'ensemble de l'application utilisateur (barre de navigation, panneau de messagerie, éléments de conversation et paramètres) lorsqu'aucune photo personnalisée n'est disponible.
- [2026-07-08] Tooltips Admin : Intégration de Tooltips customisés (via Radix Tooltip) au survol de chaque icône du tableau d'actions d'administration des utilisateurs (`users-client.tsx`) afin de clarifier le rôle de chaque bouton et prévenir les erreurs d'activation d'actions.
- [2026-07-08] P0 Admin - Suspension & Audit (par Claude Code) :
  - Création de la migration SQL `20260708_admin_p0_suspension_audit.sql` ajoutant les colonnes de suspension sur `user_profiles`, créant la table `admin_audit_log` (RLS réservé aux admins) et mettant à jour la vue `public_profiles` pour en exclure automatiquement les profils suspendus.
  - Implémentation côté serveur des actions d'administration (`suspendUser`, `reactivateUser`, `toggleAdmin`) dans `lib/actions/admin.ts`.
  - Intégration côté client dans `users-client.tsx` (badge d'état "Suspendu", boîte de dialogue de saisie de motif et de durée de suspension, appel des actions de réactivation/suspension).
  - Création du composant journal d'audit `audit-log-client.tsx` et sa route protégée `/audit` correspondante.
- [2026-07-13] Refactoring modulaire de `frontend-user` :
  - **Hub (`dashboard-user`)** : Création du hook `usePersonalHero` et dégroupage de `ProfileCompleteness` et `StatTile` pour dégraisser `PersonalHero`. Création de `useEntrepreneurActions` et `useRealisationsShowcase`.
  - **Annuaire (`annuaire`)** : Création de `useAnnuaireProfiles` avec requêtage de suivi conditionnel à la session active (économise les requêtes de base de données pour les visiteurs anonymes). Isolation du carrousel de défilement horizontal dans `ProfileRow`.
  - **Créer Profil (`creer-profil`)** : Création de `useCreerProfil` (hydratation pays, auto-sauvegarde du brouillon de profil, mutations de publication/modification) et typage strict complet de ses étapes et composants.
  - **Connexion (`login`)** : Intégration du widget Cloudflare Turnstile anti-spam en façade pour bloquer la redirection OAuth tant que l'utilisateur n'est pas validé.
  - **Messagerie (`messages`)** : Création du hook `useMessages` encapsulant les statuts de présence, la reconnexion et les actions de discussion. Implémentation d'une variable de garde `active = false` dans les effets de chargement pour éliminer les race conditions lors du zapping rapide entre discussions.
  - **Notifications (`notifications`)** : Refactoring de la route `page.tsx` en Server Component (RSC) et création du hook `useNotificationsUI` pour piloter le Bento Grid d'alertes et l'infinite scroll.
  - **Portefeuille & Paramètres (`portefeuille`, `parametres`)** : Création des hooks `usePortefeuille`, `useFollowedProfiles`, `useSettings` et `useSecuritySection`. Suppression complète du typage `any` (dette technique), fiabilisation du cycle de vie par `isMountedRef` et interfaçage direct avec Supabase MFA client.
  - **Navigation Mobile (`mobile-dock-auth`)** : Implémentation de la navigation minimaliste à 4 icônes principales (Hub, Annuaire, Messages, Espace) et déportation verticale du sous-menu flottant (Portefeuille, Modifier profil, Notifications, Paramètres, Déconnexion) sous forme de Bento vertical élégant.
  - **Sécurité Messagerie (`use-conversation-actions`)** : Remplacement de l'insertion Supabase directe côté client par un appel sécurisé à la route d'API Express `/api/messages/send`, appliquant ainsi les contrôles de sécurité et le rate-limiting centralisé du serveur backend.
  - **Correction Compilation Vercel (`package.json`, `creer-profil-preview`)** : Résolution du manque de la dépendance `@marsidev/react-turnstile` dans le build Vercel. Correction de l'erreur de type TypeScript sur la propriété inexistante `avatar_url` et `premium` dans le composant d'aperçu dynamique du profil en cours de création.
- [2026-08-19 - 2026-08-23] Monétisation Phase 1 & 2 :
  - Intégration complète de la passerelle de paiement **FedaPay** (Mobile Money MTN/Moov/Orange en XOF) dans `backend/src/services/fedapay.ts` avec signature webhook et validation idempotente.
  - Implémentation des abonnements Pro mensuels (1 000 FCFA) et annuels (10 000 FCFA), et des boosts de profil communaux (Score +2) et départementaux (Score +3).
  - Migration SQL pour référentiel territorial (77 communes du Bénin) et gestion RLS des abonnements / transactions.
- [2026-08-20 - 2026-08-22] Moteur de Recherche IA & Sémantique :
  - Recherche FTS PostgreSQL multi-critères avec ranking pondéré (`search_ranking.sql`, `fts_search.sql`).
  - Intégration des embeddings sémantiques (Gemini / pgvector) et assistant de recherche conversationnel Groq (LLaMA) dans `frontend-user/app/api/search-assistant/route.ts`.
  - Intégration de la recherche vocale / dictée validante tolérante au langage parlé.
- [2026-08-22] Cockpit Admin & Données de Démo :
  - Refonte du tableau de bord admin pour l'affichage des revenus réels encaissés (`payment_transactions`) et suppression de l'estimation de CA fictive.
  - Ajout des actions 1-clic d'appel et WhatsApp pour la modération et gestion des abonnés.
  - Création du jeu de données de démonstration réversible et documenté (`docs/JEU_DEMO.md`).
- [2026-08-22] Navigation Mobile & Luxury Glass :
  - Refonte de la barre de navigation mobile avec courbes Bézier continues C1 et berceau concave élégant épousant le bouton de recherche central.
  - Amélioration de l'effet verre réel `backdrop-blur-2xl` via masque SVG de précision `DOCK_MASK`.
- [2026-08-26] Résolution des dettes d'accessibilité (WCAG focus ring sur liens), amélioration du contraste (slate-500 -> slate-600) et renommage des composants Desktop (`sidebar` vers `topbar`) dans le système de navigation.
- [2026-08-26] Résolution des warnings Next.js : renommage de `middleware.ts` en `proxy.ts` et suppression des fichiers `pnpm-lock.yaml` orphelins pour éviter les conflits de workspace avec npm.
- [2026-08-30] Intégration des 10 catégories officielles EmiID dans `BentoMatrixPublic` et connexion directe aux statistiques temps réel Supabase (`public_profiles`) sans aucun chiffre factice ni mock résiduel.
- [2026-08-30] Dashboard User : Limitation et calibrage responsive de la section `InlineActivityFeed` à exactement 2 activités récentes sur desktop et mobile.
- [2026-08-30] Dashboard User : Refonte ergonomique et visuelle épurée du header (`DashboardBentoHeader`) pour une lisibilité maximale, des contrastes renforcés et une disposition responsive adaptée mobile/desktop.
- [2026-08-30] Dashboard User : Intégration de l'icône de notification avec compteur temps réel en haut à droite de `ProfileCompleteness` sur mobile pour un accès direct et un gain d'espace.
- [2026-08-30] Dashboard User : Masquage du bloc `InlineActivityFeed` sur mobile (`hidden lg:block`) pour supprimer la redondance et libérer l'espace au-dessus du pli.
- [2026-08-30] Dashboard User : Suppression de l'onglet et du filtre `Premium` dans `ExplorerHub` (restent : Nouveaux, Réalisations, Catégories).
- [2026-08-30] Dashboard User : Refonte épurée du CTA contextuel `HubContextualCta` avec des textes courts et percutants, format compact bento horizontal et style `#000616`.
- [2026-08-30] Annuaire Public : Refonte et simplification du composant `AnnuaireHero` (thème `#000616`, typographie compacte, barre de recherche moderne et allégée).
- [2026-08-30] Annuaire Public : Renommage du titre de la section `AnnuaireSpotlight` en « En vue cette semaine dans votre entourage » avec accent chaleureux ambré.
- [2026-08-30] Annuaire Public : Affichage compact en icônes seules (`BadgeCheck` et `Crown`) et regroupement sur la même ligne avec le filtre `Pays` et `Autour de moi` sur mobile dans `AnnuaireFilters`.
- [2026-08-30] Paramètres User : Refonte de la navigation mobile en 2 écrans natifs (Écran 1 : carte d'identité + rubriques tapables avec icône colorée & chevrons + déconnexion ; Écran 2 : barre de retour sticky + contenu avec transitions fluides Framer Motion et réinitialisation de scroll).
- [2026-08-30] Paramètres User : Déplacement et intégration directe du bloc « À propos & Bio » (`BioSection`) sous la carte « Informations personnelles » dans `ProfileSection`.
- [2026-08-30] Git : Synchronisation réussie de `origin/main` via `git pull --rebase` et résolution propre des divergences sur `parametre-content.tsx`.
- [2026-08-30] SEO & Open Graph : Activation complète de l'écosystème d'agents et compétences SEO (`seo`, `fixing-metadata`, `seo-meta-optimizer`, `seo-technical`, `seo-schema`, `seo-geo`, `seo-audit`).
- [2026-08-30] SEO & Open Graph (frontend-user & frontend-commercial) : Refonte intégrale des métadonnées, Open Graph, Twitter Cards et données structurées JSON-LD (`Organization`, `WebSite`, `ProfilePage`, `Person`, `AboutPage`, `SoftwareApplication`, `BreadcrumbList`, `SearchAction`). Intégration du logo officiel `logo-emiid-bleu-blanc.png` comme image de référence Open Graph, Google Search & Schema sur l'ensemble des routes publiques et dynamiques. Compilation validée à 100% sur les deux applications Next.js.



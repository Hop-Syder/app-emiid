/\*\*

- @author @hopsyder
- @organization Nexus Partners
- @description FRONTEND USER DOCUMENTATION - App EmiID
- @created 2026-04-18
- @updated 2026-04-19
- 🌐 ceo.nexuspartners.xyz
- 📧 daoudaabassichristian@gmail.com
  \*/

# 📱 Frontend User — EmiID

L'application utilisateur est le cœur de l'expérience EmiID. Elle est conçue pour être fluide, visuellement premium et hautement interactive.

## 🚀 Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Internationalisation** : Système `[locale]` (FR/EN)
- **State Management** : React Hooks + Realtime Supabase
- **Styling** : Tailwind CSS + Framer Motion
- **Services** : Client Supabase SSR (`@supabase/ssr`)

---

## 🛠️ Fonctionnalités Clés (Agent Business Analyst)

### 1. Onboarding & Profiling

- **Flux** : Inscription -> Complétion Profil -> Publication.
- **Détails** : Gestion des secteurs d'activité, professions, pays et tags.
- **Sécurité** : Protection par code PIN optionnelle pour l'accès aux données sensibles.

### 2. Annuaire Intelligent

- **Recherche** : Multi-critères (mots-clés, secteur, localisation).
- **Interactions** : Follow/Unfollow, notes privées sur les profils, démarrage immédiat de conversation.

### 3. Messagerie & Collaboration

- **Realtime** : Chat instantané avec indicateurs de lecture.
- **Média** : Support des images et fichiers via Supabase Storage.
- **Litiges** : Possibilité de contacter le support ou demander une médiation admin directement depuis un chat.

### 4. Portefeuille & Réseau

- **Dashboard** : Vue d'ensemble des statistiques (vues, followers).
- **Networking** : Gestion centralisée des abonnés et abonnements.

---

## 🎨 Design & UX (UI/UX Pro Max)

- **Principes** : "Beauty First", micro-interactions, animations de transition.
- **Composants** : Utilisation d'un design system cohérent (cartes profils, boutons, modales).
- **Responsive** : Mobile-first total pour un usage terrain (artisans).

---

## ⚠️ État des Lieux & Limitations (Agent Dexty)

### ✅ Ce qui fonctionne (Production Ready)

- Authentification et redirection middleware.
- Dashboard public et privé.
- Annuaire et fiches profils publiques.
- Messagerie temps réel complète.
- Code PIN de sécurité.
- **Paramètres** : Les préférences (Notifications, App) sont connectées au backend avec sauvegarde instantanée.
- **Emailing** : Les notifications transactionnelles (Messages, Alertes) sont gérées via Supabase.
- **Follow State** : Synchronisation du bouton follow corrigée dans l'annuaire.
- **Sécurité** : 2FA WhatsApp/SMS active (6 chiffres).
- **Performance** : Optimisation des images via le CDN Supabase (redimensionnement & WebP).
- **Caching** : Règles de cache navigateur (365j) pour les polices et SVGs (Next.js Headers).
- **Cookies** : Gestion optimisée des sessions via Supabase SSR avec attributs de sécurité.
- **Hubs & Dashboards** : Tableaux de bord Public et Privé (User) connectés en temps-réel (Explorateur de catégories, intégration des communautés, CTA contextuels premium).

### ❌ Ce qui reste à implémenter / corriger

- **Emailing** : Branchement final des clés SMTP Supabase (Production).

---

## 🏗️ Architecture de Modularisation & Refactorisation (Juillet 2026)

Afin d'éliminer la dette technique, de maximiser la lisibilité du code et d'assurer des performances optimales, un refactoring structurel complet a été appliqué :

### 1. Séparation stricte Server (RSC) vs Client
Les fichiers de routage `app/page.tsx` sont configurés comme des **React Server Components (RSC)**. Ils gèrent la récupération asynchrone initiale et le SEO statique, puis instancient un composant conteneur client (`"use client"`) situé dans `components/`.
- *Exemple* : [`app/notifications/page.tsx`](file:///home/hopsyder/Projet/emiid-app/frontend-user/app/notifications/page.tsx) (RSC) charge [`components/notifications/notifications-content.tsx`](file:///home/hopsyder/Projet/emiid-app/frontend-user/components/notifications/notifications-content.tsx) (Client).

### 2. Isolation de la logique métier (Hooks Customisés)
Toutes les souscriptions temps réel, l'interrogation d'APIs Supabase et les états interactifs complexes ont été extraits des composants visuels pour être isolés dans des hooks dédiés sous `/hooks/` :
- [`use-personal-hero.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-personal-hero.ts) : Complétude du profil, statistiques et souscriptions de messages non lus pour le Hub.
- [`use-entrepreneur-actions.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-entrepreneur-actions.ts) : Suivi global temps réel des abonnements du tableau de bord.
- [`use-realisations-showcase.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-realisations-showcase.ts) : Double fetch asynchrone des projets approuvés et de leurs auteurs.
- [`use-annuaire-profiles.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-annuaire-profiles.ts) : Pagination, tri et appels conditionnels de suivi (économise les requêtes de base de données pour les visiteurs invités).
- [`use-creer-profil.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-creer-profil.ts) : Auto-sauvegarde périodique du brouillon de profil dans le `localStorage` (`emiid_profile_draft`) et mutations d'onboarding.
- [`use-messages.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-messages.ts) : Orchestration de la messagerie temps réel, détection de présence, et **protection contre les race conditions** lors du zapping rapide entre discussions.
- [`use-notifications-ui.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-notifications-ui.ts) : Scroll infini, filtres d'onglets synchronisés dans l'URL et tri chronologique périodique.
- [`use-portefeuille.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-portefeuille.ts) : Sessions et statistiques d'impact de profil unifiées.
- [`use-followed-profiles.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-followed-profiles.ts) : Écoute realtime de follow/unfollow et sécurisation des états asynchrones par `isMountedRef` (anti-memory leak).
- [`use-settings.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-settings.ts) & [`use-security-section.ts`](file:///home/hopsyder/Projet/emiid-app/frontend-user/hooks/use-security-section.ts) : Éradication complète du typage `any` dans l'onglet de configuration, interfaçage direct avec `supabase.auth.mfa` client pour l'activation MFA WhatsApp/SMS et la validation PIN à 6 chiffres.

---

## 📂 Structure des fichiers

```
frontend-user/
├── app/
│   ├── api/                # API Routes (Proxy backend)
│   ├── login/              # Intégration widget Turnstile anti-spam
│   └── globals.css         # Styles de base
├── components/             # Composants réutilisables d'assemblage visuel
├── hooks/                  # Hooks customisés d'isolation logique
├── lib/                    # Supabase client & utilitaires
└── messages/               # Traductions i18n
```

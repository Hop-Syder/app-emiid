/\*\*

- @author @hopsyder
- @organization Nexus Partners
- @description FRONTEND USER DOCUMENTATION - App Nexus Connect
- @created 2026-04-18
- @updated 2026-04-18
  \*/

# 📱 Frontend User — Nexus Connect

L'application utilisateur est le cœur de l'expérience Nexus. Elle est conçue pour être fluide, visuellement premium et hautement interactive.

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
- **Follow State** : Synchronisation du bouton follow corrigée dans l'annuaire.
- **Sécurité** : 2FA WhatsApp/SMS active avec code à 5 chiffres (via Supabase Auth MFA). Le changement de mot de passe est retiré au profit des Providers.

### ❌ Ce qui reste à implémenter / corriger

- **Emailing** : Les notifications par email (Newsletter, Activité) nécessitent le branchement d'un fournisseur SMTP.
- **Performance** : Optimisation des images via le CDN Supabase.

---

## 📂 Structure des fichiers

```
frontend-user/
├── app/
│   ├── [locale]/           # Routes internationalisées
│   ├── api/                # API Routes (Proxy backend)
│   └── globals.css         # Styles de base
├── components/             # Composants réutilisables
├── hooks/                  # Logique métier (useNotifications, useProfile, etc.)
├── lib/                    # Supabase client & utilitaires
└── messages/               # Traductions i18n
```

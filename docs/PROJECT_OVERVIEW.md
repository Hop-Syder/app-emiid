/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description PROJECT OVERVIEW - Vision, Strategy & Roadmap pour Nukun
 * @created 2026-04-18
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/──────────────────────────────────

# 🌌 Nukun — Project Overview

Nukun est bien plus qu'une plateforme de réseautage ; c'est une **infrastructure de confiance** pour l'écosystème professionnel, conçue pour transformer les interactions informelles en opportunités vérifiables et qualifiées.

---

## 🚀 Perspective SaaS (Agent SaaS)

### 🎯 Cible & Marché
Nukun s'adresse à trois segments clés :
1. **Artisans & Indépendants** : Besoin de visibilité et de crédibilité (profils vérifiés).
2. **Professionnels & Experts** : Besoin de réseautage stratégique et de gestion de carrière.
3. **Entreprises & ONG** : Besoin de recrutement, de gestion de communauté et de visibilité institutionnelle.

### 💰 Stratégie de Monétisation (Roadmap)
- **Freemium** : Accès à l'annuaire et messagerie de base.
- **Premium (Individual)** : Badges de vérification, mise en avant dans l'annuaire, statistiques avancées.
- **Business/Enterprise** : Comptes organisations, campagnes de mailing ciblées, outils de recrutement, API d'intégration.

### 📈 Scalabilité
L'architecture repose sur **Supabase** pour une mise à l'échelle horizontale fluide des données et du temps réel. Le choix de **Next.js** permet un SEO optimal (crucial pour les profils publics) et des performances frontend de premier ordre.

---

## 📋 Perspective Produit (Agent PM)

### 🗺️ Roadmap de Développement

#### Phase 1 : Fondations (Complété)
- [x] Authentification multi-méthodes (OAuth, Email).
- [x] Système de profils extensibles.
- [x] Annuaire intelligent avec filtres dynamiques.
- [x] Messagerie temps réel robuste.

#### Phase 2 : Confiance & Engagement (En cours)
- [ ] Système de certification et validation par les pairs.
- [ ] Portefeuille de compétences interactif.
- [ ] Notifications push et mail centralisées.
- [ ] Gestion complète des Organisations (Entreprises/ONG).

#### Phase 3 : Écosystème & Expansion (Futur)
- [ ] Marketplace de services professionnels.
- [ ] Intégration d'outils de productivité.
- [ ] Algorithmes de matching basés sur l'IA.

---

## 🏗️ Perspective Architecturale (Agent Dexty)

### Stack Technologique
- **Frontend** : Next.js 15+ (User) & Next.js 16/Tailwind 4 (Admin - expérimental).
- **Backend** : Supabase (Auth, DB, Realtime, Storage) + Proxy backend optionnel.
- **Langage** : TypeScript Strict Mode pour la sécurité des types.
- **Design System** : Approche "Beauty First" avec Framer Motion pour les interactions.

### Principes de Clean Architecture
- **Séparation des responsabilités** : UI (Components), Logique (Hooks/Actions), Data (Services/Supabase).
- **Sécurité RLS** : La base de données est la première ligne de défense (Row Level Security).
- **Single Source of Truth** : Le schéma SQL master définit la structure du domaine.

---

## 🔍 État Actuel & Audit (Business Analyst)

| Module | État | Fiabilité | Note |
| :--- | :--- | :--- | :--- |
| **Auth** | ✅ Prêt | 90% | Middleware stable. |
| **Profils** | ✅ Prêt | 85% | Publication/Dépublication fonctionnelle. |
| **Messagerie** | ✅ Prêt | 95% | Module le plus stable. |
| **Admin** | ⚠️ Partiel | 50% | Risque de sécurité critique sur les accès. |
| **Paramètres** | ⚠️ Partiel | 40% | Beaucoup d'UI non persistée. |

> [!WARNING]
> **Risque Critique** : Le frontend admin utilise des clés `service_role` sans garde d'accès robuste. Une sécurisation via rôles (RBAC) est impérative avant toute mise en production.

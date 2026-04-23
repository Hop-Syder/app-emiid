/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Analyse et documentation des points d'entrée de l'API EmiID
 * @created 2026-03-24
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

# 📡 Points d'Entrée API (Backend) - EmiID

Ce document recense les endpoints de l'API Express, leurs méthodes HTTP et leurs fonctions dans l'écosystème.

## 🔑 Authentification (`/api/auth`)
Bien que gérée principalement par Supabase côté client, certaines routes backend peuvent exister :
- `POST /api/auth/register` : Logique additionnelle de post-inscription (facultatif).
- `POST /api/auth/login` : Validation de service.

---

## 👤 Utilisateurs & Profils (`/api/users`)
- `GET /api/users` : Liste tous les profils publics (pour l'Annuaires).
- `GET /api/users/me` : Récupère le profil complet de l'utilisateur authentifié (via JWT).
- `PUT /api/users/me` : Met à jour les informations du profil connecté.
- `GET /api/users/:id` : Récupère les détails d'un profil spécifique par son ID.
- `POST /api/users/verify-pin` : Vérifie le code PIN de sécurité d'un utilisateur.

---

## 📊 Tableau de Bord (`/api/dashboard-user`)
- `GET /api/dashboard-user/stats` : Statistiques de l'utilisateur (vues, messages).
- `GET /api/dashboard-user/activities` : Flux d'activités récent.

---

## 📑 Données de Référence (`/api/reference`)
- `GET /api/reference/sectors` : Liste tous les secteurs d'activité.
- `GET /api/reference/professions` : Liste toutes les professions (avec ID secteur).
- `GET /api/reference/countries` : Liste tous les pays disponibles.

---

## 💬 Messagerie (`/api/messages`)
- `GET /api/messages` : Liste les conversations de l'utilisateur.
- `GET /api/messages/:id` : Récupère l'historique d'une conversation.
- `POST /api/messages` : Envoie un nouveau message.

---

## 📄 Public (`/api/public`)
- `GET /api/public/stats-globales` : Chiffres clés pour la landing page (nombre d'inscrits, projets).


## 🛡️ Middlewares de Sécurité (Logique Interne)

L'API utilise systématiquement :
1.  **`authenticateUser`** : Vérifie la validité du JWT Supabase.
2.  **`express-validator`** : Sanitize les entrées (title, descriptions, email).
3.  **`cors`** : Restreint l'accès aux origines autorisées (Frontend User & Admin).

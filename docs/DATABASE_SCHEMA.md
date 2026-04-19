/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description DATABASE DOCUMENTATION - Schema & Security (SSoT) pour Nukun
 * @version 1.2.1
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

# 🗄️ Database — Nukun Master Schema

La base de données repose sur **PostgreSQL (via Supabase)**. Le fichier `sql/MASTER_NUKUN_SCHEMA.sql` sert de source unique de vérité (Single Source of Truth).

---

## 🏗️ Modèle de Données (Agent Design Document)

### 1. Référentiels (Statics)
- `countries` : Liste des pays (Focus Afrique de l'Ouest).
- `activity_sectors` : Grands domaines (Tech, Artisanat, Santé, etc.).
- `professions` : Sous-catégories liées aux secteurs.
- `jobs` & `industries` : Taxonomies additionnelles.
- `tags` : Étiquettes de compétences transversales.

### 2. Cœur : Profils Utilisateurs
- `user_profiles` : Table principale liée à `auth.users`.
  - Contient les bios, avatars, catégories, et statuts (published, premium, verified).
  - Inclut un système de code PIN sécurisé (`pin_code`, `pin_enabled`).

### 3. Réseautage & Messagerie
- `user_follows` : Relation Many-to-Many pour le système d'abonnés.
- `conversations` : Entité de liaison entre deux participants.
- `messages` : Contenu des échanges, immuable après envoi (sauf statut `is_read`).

---

## 🛡️ Sécurité & Automatisation (Agent Dexty)

### Row Level Security (RLS)
- **Profils** : Un utilisateur a accès total à son profil. Lecture publique uniquement si `is_published = true`.
- **Messagerie** : Seuls les participants d'une conversation peuvent lire et envoyer des messages.
- **Immuabilité** : Un trigger empêche la modification du contenu d'un message après sa création.

### Triggers & Functions
- `handle_new_user()` : Crée automatiquement une entrée dans `user_profiles` après l'inscription `auth.users`.
- `sync_followers_count()` : Met à jour dynamiquement le compteur de followers sur les profils lors d'un follow/unfollow.
- `enforce_message_read_only()` : Garantit l'intégrité des messages.

---

## 👁️ Vues & API
- `public_profiles` : Vue filtrée pour l'annuaire public, exposant uniquement les données non-sensibles des profils publiés.

---

## 🚀 Maintenance & Evolution (Business Analyst)
> [!IMPORTANT]
> Toute modification du schéma doit être reportée dans le fichier `sql/MASTER_NUKUN_SCHEMA.sql` et versionnée. Les extensions comme `pg_crypto` sont requises pour la gestion des PIN.

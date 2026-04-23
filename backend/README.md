# EmiID - API Backend 🚀

> **@author**: @hopsyder  
> **@organization**: Nexus Partners  
> **Mission**: API robuste et sécurisée pour la plateforme EmiID.

## 📌 Préservation & Vision

Ce backend est le moteur "Gendarme" de EmiID. Il assure le relais d'authentification (Token Relay), la gestion des profils d'entrepreneurs, la messagerie et les services centraux de modération de la plateforme.

---

## 🛠️ Stack Technique

- **Runtime**: Node.js
- **Framework**: Express (TypeScript)
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth (JWT Verification)
- **Déploiement**: Railway / Vercel

---

## 🛰️ Fonctionnalités Actuelles

### 1. Authentification (Token Relay)

- Validation des JWT Supabase côté serveur.
- Extraction de `user_id` pour isolation stricte des données.
- Middleware `requireAuth` pour la protection des routes sensibles.

### 2. Gestion des Profils (Annuaire)

- **Profil Personnel**: Récupération et mise à jour des infos (Prénom, Nom, Bio, Avatar).
- **Enrichissement**: Gestion des rôles professionnels, spécialités et catégories (Artisan, Freelance, Entreprise, ONG).
- **Annuaire Public**: Listing dynamique des profils avec filtrage par catégorie.

### 3. dashboard-user & Statistiques

- Calcul en temps réel des statistiques globales (Membres connectés, profils vérifiés, membres premium).
- Discovery : Entrepreneurs en vedette et nouveaux arrivants.

---

## 🔐 Configuration (Variables d'Environnement)

Créer un fichier `.env` à la racine du dossier `/backend` :

```env
PORT=5000
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_cle_anon
CORS_ORIGIN=http://localhost:3000,https://votre-frontend.vercel.app
```

---

## 🚀 Installation & Développement

```bash
# Installation des dépendances
npm install

# Lancer en mode développement (watch mode)
npm run dev

# Build pour la production
npm run build

# Lancer le serveur buildé
npm start
```

---

## ☁️ Déploiement sur Railway

Pour déployer ce backend sur Railway :

1.  **Connecter le Repo** : Dans Railway, créez un nouveau projet et connectez votre dépôt GitHub.
2.  **Configuration des Variables** : Allez dans l'onglet **Variables** et ajoutez toutes les variables du `.env` (SUPABASE_URL, SUPABASE_ANON_KEY, etc.).
3.  **CORS_ORIGIN** : N'oubliez pas d'ajouter l'URL de votre frontend local ou déployé pour autoriser les requêtes.
4.  **Build Command** : Railway détectera automatiquement le `package.json` et lancera `npm run build` puis `npm start`.
5.  **Domaine** : Allez dans l'onglet **Settings** > **Public Networking** pour générer un domaine `up.railway.app`.

---

## 📡 Documentation des Endpoints API

| Méthode  | Endpoint                                     | Description                        | Auth |
| -------- | -------------------------------------------- | ---------------------------------- | ---- |
| **GET**  | `/`                                          | État de santé de l'API             | 🔓   |
| **GET**  | `/api/users/me`                              | Récupérer mon profil               | 🔒   |
| **PUT**  | `/api/users/me`                              | Mettre à jour mon profil           | 🔒   |
| **GET**  | `/api/users`                                 | Lister tous les profils (Annuaire) | 🔒   |
| **GET**  | `/api/dashboard-user/stats`                  | Statistiques globales              | 🔓   |
| **GET**  | `/api/dashboard-user/featured-entrepreneurs` | Entrepreneurs Discovery            | 🔓   |

---

## 🗺️ Architecture de Sécurité

Le backend utilise une stratégie de **Multi-Origin CORS**. Vous pouvez définir plusieurs frontends autorisés en les séparant par des virgules dans la variable `CORS_ORIGIN`.

---

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description README du Backend EmiID
 * @created 2026-01-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

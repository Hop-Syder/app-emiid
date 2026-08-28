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
- **Déploiement**: Render (production : https://app-emiid.onrender.com)

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

## ☁️ Déploiement sur Render

Le backend est déployé sur [Render](https://render.com) en tant que **Web Service**.
Production : **https://app-emiid.onrender.com**

Deux méthodes :

- **Blueprint (recommandé)** : le fichier `render.yaml` décrit le service. Sur Render,
  **New +** > **Blueprint**, connectez le repo, renseignez les secrets (`sync: false`),
  puis **Apply**.
- **Manuel** : **New +** > **Web Service**, avec **Root Directory** = `backend`,
  **Build Command** = `pnpm install --no-frozen-lockfile && pnpm run build`,
  **Start Command** = `pnpm start`, **Health Check Path** = `/health`.

N'oubliez pas de renseigner `CORS_ORIGIN` avec les URLs de vos frontends autorisés.
Render fournit automatiquement la variable `PORT` (ne pas la définir manuellement).

📖 Guide détaillé : voir [`RENDER_DEPLOYMENT.md`](./RENDER_DEPLOYMENT.md).

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

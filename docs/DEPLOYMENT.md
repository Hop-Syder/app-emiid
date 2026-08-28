# 🚀 Guide de Déploiement Vercel - EmiID

Ce projet est un **Monorepo**. Il contient 3 applications distinctes à déployer séparément sur Vercel.

## 📋 Résumé des Projets

| Projet            | Dossier Racine  | Type         | URL (Exemple)              |
| ----------------- | --------------- | ------------ | -------------------------- |
| **Frontend User** | `frontend-user` | Next.js      | `app.emiid.com` |
| **Admin Panel**   | `admin`         | Next.js      | `admin-nexus.vercel.app`   |
| **Backend API**   | `backend`       | Node/Express | `app-emiid.onrender.com` (Render) |

---

## 1. Pré-requis

1. Pousser ton code sur **GitHub**.
2. Avoir un compte sur [Vercel.com](https://vercel.com).
3. Avoir tes clés Supabase sous la main.

---

## 2. Déployer le Frontend (User App)

C'est l'application principale pour les utilisateurs.

1. Sur Vercel, clique sur **"Add New..."** → **"Project"**.
2. Importe le repository `app-nexus-connect`.
3. **Configuration du Projet** :
   - **Framework Preset** : Next.js (Défaut).
   - **Root Directory** : Clique sur `Edit` et sélectionne **`frontend-user`**.
4. **Environment Variables** :
   Ajoute les variables présentes dans `frontend-user/.env.local` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique sur **Deploy**.

---

## 3. Déployer l'Admin (Back Office)

Le dashboard-user pour gérer la plateforme.

1. Retourne sur le dashboard-user Vercel.
2. Clique encore sur **"Add New..."** → **"Project"**.
3. Importe le **GÊME** repository `app-nexus-connect` (Oui, encore une fois).
4. **Configuration du Projet** :
   - **Root Directory** : Clique sur `Edit` et sélectionne **`admin`**.
5. Clique sur **Deploy**.

---

## 4. Déployer le Backend (API) sur Render

Le serveur Express est déployé sur **Render** (et non Vercel) : c'est un service
Node long-running qui gère les WebSockets et le heartbeat. Production :
**https://app-emiid.onrender.com**.

1. Sur [render.com](https://render.com) : **New +** > **Blueprint** (le repo contient
   `backend/render.yaml`), ou **New +** > **Web Service** en configuration manuelle.
2. Importe le repo `Hop-Syder/app-emiid`.
3. **Configuration** (si manuelle) :
   - **Root Directory** : **`backend`**
   - **Build Command** : `pnpm install --no-frozen-lockfile && pnpm run build`
   - **Start Command** : `pnpm start`
   - **Health Check Path** : `/health`
4. **Environment Variables** — ajoute les infos de `backend/.env` :
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`
   - `CORS_ORIGIN` (l'URL de ton frontend déployé, ex : `https://app.emiid.com`)
   - `NODE_ENV=production`
5. Clique sur **Create Web Service** / **Apply**.

> 📖 Guide détaillé : [`backend/RENDER_DEPLOYMENT.md`](../backend/RENDER_DEPLOYMENT.md).

---

## 🔗 Connexion Finale

Une fois tout déployé :

1. Récupère l'URL de ton Backend Render : `https://app-emiid.onrender.com`.
2. Va dans les réglages de tes projets Frontend sur Vercel (`Settings` > `Environment Variables`).
3. Ajoute une variable `NEXT_PUBLIC_API_URL=https://app-emiid.onrender.com` pour que les frontends appellent l'API.
4. Côté Render, ajoute ces mêmes URLs frontend dans `CORS_ORIGIN` pour autoriser les requêtes.

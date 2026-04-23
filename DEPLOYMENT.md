# 🚀 Guide de Déploiement Vercel - EmiID

Ce projet est un **Monorepo**. Il contient 3 applications distinctes à déployer séparément sur Vercel.

## 📋 Résumé des Projets

| Projet            | Dossier Racine  | Type         | URL (Exemple)              |
| ----------------- | --------------- | ------------ | -------------------------- |
| **Frontend User** | `frontend-user` | Next.js      | `emiid.app` |
| **Admin Panel**   | `admin`         | Next.js      | `admin-nexus.vercel.app`   |
| **Backend API**   | `backend`       | Node/Express | `api-nexus.vercel.app`     |

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

## 4. Déployer le Backend (API)

Ton serveur Express sécurisé. J'ai ajouté les fichiers (`vercel.json`, `api/index.ts`) pour qu'il fonctionne en mode Serverless sur Vercel.

1. Nouveau Projet Vercel (3ème fois).
2. Importe `app-nexus-connect`.
3. **Configuration** :
   - **Framework Preset** : "Other" (Vercel va détecter `package.json` ou `vercel.json`).
   - **Root Directory** : Sélectionne **`backend`**.
4. **Environment Variables** :
   Ajoute les infos de `backend/.env` :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `CORS_ORIGIN` (Mets l'URL de ton Frontend déployé, ex: `https://emiid.app`)
5. Clique sur **Deploy**.

---

## 🔗 Connexion Finale

Une fois tout déployé :

1. Récupère l'URL de ton Backend (ex: `https://api-nexus.vercel.app`).
2. Va dans les réglages de ton projet Frontend sur Vercel (`Settings` > `Environment Variables`).
3. Ajoute une variable `NEXT_PUBLIC_API_URL` avec cette URL (si tu en as besoin plus tard pour fetcher ton API).

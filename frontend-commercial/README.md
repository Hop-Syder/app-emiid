
# EmiID Commercial (Vitrine & Marketing)

Bienvenue dans le dépôt du site commercial d'**EmiID** — "Votre empreinte numérique professionnelle". Ce projet gère toute la vitrine marketing, la présentation de l'offre commerciale, la conversion de prospects, ainsi que l'exploration publique des profils des membres de l'écosystème.

---

## 🚀 Présentation du Projet

Le site commercial est conçu pour capter l'intérêt des entrepreneurs, professionnels et investisseurs, les guider à travers les avantages d'EmiID et faciliter leur inscription sur la plateforme.

### Sections & Parcours utilisateur

1. **Hero Section** : Introduction immersive de la proposition de valeur avec call-to-actions stratégiques.
2. **FOMO Section (Social Proof / Urgency)** : Présentation dynamique de la croissance du réseau pour susciter l'intérêt d'inscription.
3. **Comparison Section** : Tableau comparatif détaillant la supériorité d'EmiID face aux annuaires classiques et aux réseaux sociaux traditionnels.
4. **Social Proof Section** : Témoignages et avis clients pour renforcer la confiance.
5. **Pricing Section** : Offres d'abonnement claires avec sélection mensuelle / annuelle.
6. **Espace Exploration** :
   - `/explore` : Annuaire public interactif listant les membres de l'écosystème.
   - `/explore/[slug]` : Pages de profils publiques optimisées SEO.
7. **À propos (`/about`)** : Vision, mission, équipe et partenaires de Nexus Partners.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 15 (App Router)](https://nextjs.org/) avec React 19 et TypeScript.
- **Style & Design** : [Tailwind CSS v3](https://tailwindcss.com/) avec des polices premium (`Satoshi` pour les titres et `General Sans` pour le corps) importées via CDN.
- **Animations** : [Framer Motion](https://www.framer.com/motion/) pour les transitions fluides et micro-interactions haut de gamme.
- **Base de données & Services** : [Supabase](https://supabase.com/) pour le stockage des données de profils, de formulaires de contact et d'exploration.
- **Icônes** : [Lucide React](https://lucide.dev/).

---

## 💻 Installation & Développement Local

### Prérequis

* Node.js >= 18.x
- Un gestionnaire de paquets : `pnpm` (recommandé pour ce sous-projet) ou `npm`

### Étapes d'installation

1. **Naviguer dans le dossier du projet** :

   ```bash
   cd frontend-commercial
   ```

2. **Installer les dépendances** :

   ```bash
   pnpm install
   ```

3. **Configurer les variables d'environnement** :
   Créez un fichier `.env.local` à la racine de `frontend-commercial/` sur le modèle suivant :

   ```env
   # URL de l'application utilisateur (frontend-user) pour les redirections CTA
   NEXT_PUBLIC_USER_APP_URL=http://localhost:3000

   # Identifiants Supabase (accès public)
   NEXT_PUBLIC_SUPABASE_URL=votre_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_supabase_anon_key
   ```

4. **Lancer le serveur de développement** :

   ```bash
   pnpm dev
   ```

   *Le serveur sera disponible sur `http://localhost:3000` (ou `http://localhost:3001` si le port 3000 est déjà occupé).*

### Démarrage depuis la racine du monorepo

Si vous êtes à la racine d'EmiID, vous pouvez lancer ce projet individuellement :

```bash
npm run dev:commercial
```

Ou lancer l'ensemble de la stack (Backend + Frontend User + Admin + Commercial) :

```bash
npm run dev:all
```

---

## ⚙️ Configuration & Variables d'Environnement

| Variable | Description | Exemple en Local |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_USER_APP_URL` | URL de la Web App utilisateur (pour les liens de connexion/inscription) | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Point d'accès de votre instance Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme Supabase pour les requêtes client | `eyJhbGciOiJIUzI1...` |

---

## 🚀 Guide de Déploiement

Le projet est configuré pour être déployé très facilement sur **Vercel** ou toute plateforme d'hébergement Next.js moderne.

### Déploiement sur Vercel (Recommandé)

1. Connectez-vous à votre tableau de bord **Vercel** et créez un nouveau projet.
2. Liez votre dépôt Git contenant le projet EmiID.
3. Configurez les paramètres du projet Vercel comme suit :
   - **Framework Preset** : `Next.js`
   - **Root Directory** : `frontend-commercial` (Très important, car le projet est dans un sous-dossier).
   - **Build Command** : `next build` (Détection automatique).
   - **Output Directory** : `.next` (Détection automatique).
4. Ajoutez les variables d'environnement listées dans la section ci-dessus (dans les paramètres du projet Vercel).
5. Cliquez sur **Deploy**. Vercel se chargera du build de production et générera des URLs de preview pour chaque branche.

---

## 📂 Structure du Projet

```
frontend-commercial/
├── app/                  # Dossier principal App Router (Next.js)
│   ├── about/            # Page À propos
│   ├── explore/          # Exploration des profils publiques & de l'annuaire
│   ├── globals.css       # Styles CSS globaux & configuration polices
│   ├── layout.tsx        # Layout racine avec Header & Footer globaux
│   ├── page.tsx          # Page d'accueil marketing
│   ├── robots.ts         # Fichier robots.txt dynamique
│   └── sitemap.ts        # Sitemap XML dynamique pour le SEO
├── components/           # Composants réutilisables
│   ├── home/             # Composants spécifiques à la page d'accueil (Hero, FOMO, etc.)
│   ├── footer.tsx        # Pied de page global
│   ├── header.tsx        # Barre de navigation globale
│   ├── theme-provider.tsx# Provider du mode sombre (next-themes)
│   └── theme-toggle.tsx  # Bouton de basculement mode sombre/clair
├── lib/                  # Bibliothèques partagées
│   ├── supabase/         # Clients & Helpers Supabase (client, serveur, middleware)
│   └── utils.ts          # Utilitaires génériques (ex: cn pour classnames)
├── tailwind.config.ts    # Configuration Tailwind CSS
└── package.json          # Fichier de configuration des dépendances
```

---

## 🔒 Sécurité & Performance

- **SEO Automatique** : Balises de métadonnées OpenGraph, fichiers `sitemap.ts` et `robots.ts` générés dynamiquement à chaque compilation.
- **Optimisation des Images** : Utilisation systématique de `next/image` pour le lazy loading automatique et le formatage moderne (WebP).
- **Sécurisation Supabase** : Les requêtes côté client passent par des politiques de sécurité RLS (Row Level Security) strictes définies au niveau de la base de données Supabase.

---

> Développé avec excellence par **Nexus Partners**.

# 🛠️ Frontend Admin — Nexus Cockpit

Panneau d'administration pour la plateforme App Nexus Connect. Interface moderne construite avec Next.js 16, Tailwind CSS 4, et connectée à Supabase.

## 📖 Documentation Détaillée
Pour une documentation technique et sécuritaire complète, voir :
👉 **[docs/FRONTEND_ADMIN.md](file:///home/hopsyder/Projet/app-nukun/docs/FRONTEND_ADMIN.md)**

## 🚀 Fonctionnalités Actuelles
- Statistiques en temps reel (utilisateurs, profils publies, messages)
- Graphique d'activite hebdomadaire
- Etat du systeme (API, Base de donnees, Stockage)
- Liste des nouveaux utilisateurs
- Repartition geographique par pays

### Gestion Utilisateurs (`/users`)
- Liste paginee des utilisateurs depuis Supabase
- Filtres par statut (tous, publie, non publie) et role (tous, pro, particulier)
- Recherche par nom ou email
- Selection multiple pour actions groupees
- Actions: publier/depublier profil, supprimer utilisateur
- Modal de detail utilisateur avec informations completes

### Moderation Galeries (`/moderation/galerie`)
- Vue grille ou liste des images
- Filtres par statut (en attente, approuve, rejete)
- Indicateurs de signalements
- Actions d'approbation/rejet
- *Note: Utilise actuellement des donnees de demo*

### Parametres (`/settings`)
- Profil administrateur
- Configuration des notifications (email, push)
- Securite (2FA, timeout session)
- Parametres systeme (stats serveur, backup, maintenance)
- Apparence (theme, langue)

## Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Base de donnees**: Supabase
- **Langage**: TypeScript

## Structure du Projet

```
frontend-admin/
├── app/
│   ├── page.tsx                    # Dashboard (Server Component)
│   ├── layout.tsx                  # Layout principal
│   ├── globals.css                 # Styles globaux
│   ├── users/
│   │   └── page.tsx                # Page utilisateurs
│   ├── moderation/
│   │   └── galerie/
│   │       └── page.tsx            # Moderation images
│   └── settings/
│       └── page.tsx                # Parametres
├── components/
│   ├── admin-layout.tsx            # Layout admin avec sidebar
│   ├── dashboard-client.tsx        # Dashboard (Client Component)
│   └── users-client.tsx            # Gestion utilisateurs (Client)
└── lib/
    ├── actions/
    │   └── admin.ts                # Server Actions (CRUD Supabase)
    ├── supabase/
    │   ├── client.ts               # Client Supabase (browser)
    │   └── server.ts               # Client Supabase (server/admin)
    └── utils.ts                    # Utilitaires (cn)
```

## Variables d'Environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Schema Supabase Requis

Le frontend-admin se connecte aux tables suivantes:

- `user_profiles` - Profils utilisateurs
- `conversations` - Conversations
- `messages` - Messages
- `countries` - Pays

## Installation

```bash
# Installer les dependances
npm install

# Lancer en developpement
npm run dev

# Build pour production
npm run build
npm start
```

## Server Actions Disponibles

| Action | Description |
|--------|-------------|
| `getDashboardStats()` | Recupere les statistiques du dashboard |
| `getUsers(params)` | Liste les utilisateurs avec filtres et pagination |
| `updateUserProfile(id, data)` | Met a jour un profil utilisateur |
| `toggleUserPublished(id, published)` | Publie/depublie un profil |
| `deleteUser(id)` | Supprime un utilisateur |
| `getCountries()` | Liste des pays |

## Design

- Palette: Slate (neutres), Blue (primaire), Emerald (succes), Amber (warning), Rose (danger)
- Animations subtiles avec Framer Motion
- Interface responsive (sidebar collapsible sur mobile)
- Theme clair (dark mode disponible dans settings)

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description FRONTEND ADMIN DOCUMENTATION - EmiID Cockpit
 * @created 2026-04-18
 * @updated 2026-04-18
 */

# 🛠️ Frontend Admin — EmiID Cockpit

Le "EmiID Cockpit" est l'interface de contrôle et de modération de la plateforme. Il permet de piloter l'écosystème utilisateur et d'assurer la sécurité du contenu.

## 🚀 Stack Technique
- **Framework** : Next.js 16 (App Router - Expérimental)
- **Styling** : Tailwind CSS 4
- **Backend Communication** : Server Actions + Supabase Service Role Client
- **UI Components** : Composants sur mesure avec Framer Motion

---

## 🏗️ Architecture & Sécurité (Agent Dexty)

### 🚨 Alerte Sécurité Majeure
Le frontend admin utilise `SUPABASE_SERVICE_ROLE_KEY` pour bypasser les RLS. 
> [!CAUTION]
> **IL EST IMPÉRATIF** de mettre en place un middleware de protection qui vérifie le rôle `admin` de l'utilisateur connecté avant de rendre le layout admin ou d'autoriser l'exécution des Server Actions. Actuellement, cette protection est insuffisante.

### Server Actions
Les actions sont centralisées dans `lib/actions/admin.ts`. Elles permettent de :
- Récupérer des statistiques globales (SaaS stats).
- Gérer le cycle de vie des utilisateurs (CRUD).
- Intervenir dans les litiges de messagerie.

---

## 🛠️ Modules du Cockpit (Agent PM)

### 1. Dashboard (Statistiques SaaS)
- Visualisation des KPIS : Utilisateurs totaux, profils publiés, volume de messages.
- État de santé du système (DB, API, Storage).

### 2. Gestion des Utilisateurs
- Listing complet avec filtres par rôle et catégorie.
- Actions directes : Publication/Dépublication, Vérification (Badge), Passage en Premium.
- Suppression de profils (Note : Actuellement ne supprime que le profil, pas le compte Auth).

### 3. Modération & Litiges
- Accès aux conversations signalées pour médiation.
- Possibilité pour l'admin de poster des messages système dans les chats en litige.

### 4. Modération Galerie (À brancher)
- Interface de revue des médias téléchargés par les utilisateurs.

---

## 📂 Structure des fichiers
```
frontend-admin/
├── app/
│   ├── (dashboard)/        # Dashboard principal
│   ├── users/              # Gestion utilisateurs
│   ├── moderation/         # Litiges et médias
│   └── settings/           # Paramètres système
├── components/             # UI spécifique admin
├── lib/
│   ├── actions/            # Server Actions (Service Role)
│   └── supabase/           # Clients Supabase (Client/Server)
```

---

## 📉 Limitations Actuelles (Agent Business Analyst)
1. **Accès** : Absence de garde-fou admin robuste au niveau du middleware/layout.
2. **Référentiels** : L'admin ne peut pas encore éditer les pays, secteurs ou professions via l'UI.
3. **Persistance** : Les paramètres admin et la modération galerie sont actuellement des maquettes visuelles (Mock data).

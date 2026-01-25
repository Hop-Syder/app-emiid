# Nexus Connect - Plan et Fonctionnalités

## Vue d'ensemble

**Nexus Connect** est une plateforme pan-africaine dédiée à la cartographie et à la mise en réseau des acteurs économiques d'Afrique de l'Ouest. L'objectif ambitieux est de répertorier et de connecter **100 000 acteurs économiques d'ici 2027**.

### Mission

Propulser l'écosystème entrepreneurial ouest-africain en créant un réseau interconnecté d'entrepreneurs, artisans, freelances, entreprises et ONG pour faciliter la collaboration, le financement et les opportunités commerciales.

### Couverture géographique

- 15 pays d'Afrique de l'Ouest
- Focus sur les hubs économiques : Dakar (Sénégal), Accra (Ghana), Abidjan (Côte d'Ivoire), Bamako (Mali), Lagos (Nigeria), etc.

---

## Architecture Technique

### Stack Technologique

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS avec shadcn/ui components
- **Animation**: Framer Motion
- **TypeScript**: Pour la sécurité des types
- **Fonts**: Geist (sans-serif) et Geist Mono

### Structure du Projet

```
app/
├── page.tsx                          # dashboard-user principal
├── annuaire/
│   ├── artisans/page.tsx             # Liste des artisans
│   ├── freelances/page.tsx           # Liste des freelances
│   ├── entreprises/page.tsx          # Liste des entreprises
│   └── ong/page.tsx                  # Liste des ONG
├── portefeuille/
│   ├── profils/page.tsx              # Profils suivis
│   └── projets/page.tsx              # Projets suivis
├── market-projets/
│   ├── financement/page.tsx          # Projets recherchant financement
│   ├── partenaires/page.tsx          # Recherche de partenaires
│   └── a-vendre/page.tsx             # Projets/entreprises à vendre
├── creer-profil/page.tsx             # Formulaire création profil
├── creer-annonce/page.tsx            # Formulaire création annonce Market
├── messages/page.tsx                 # Messagerie
└── parametres/page.tsx               # Paramètres utilisateur

components/
├── nexus-layout.tsx                  # Layout principal avec sidebar/header
├── nexus-sidebar.tsx                 # Navigation latérale
├── nexus-header.tsx                  # En-tête avec menu horizontal
├── dashboard-user-content.tsx             # Contenu du dashboard-user
├── profiles-grid.tsx                 # Grille d'affichage des profils
├── financement-projects.tsx          # Projets de financement
├── partenaires-projects.tsx          # Projets partenaires
├── a-vendre-projects.tsx             # Projets à vendre
└── ui/                               # Composants shadcn/ui
```

### Design System

- **Couleurs principales**:
  - Vert (#16a34a) - Représente la croissance
  - Ambre (#f59e0b) - Représente l'énergie
  - Rouge (#dc2626) - Représente la passion
- **Rayons de bordure**: rounded-2xl et rounded-3xl (design moderne)
- **Typographie**: Geist pour un look professionnel et lisible
- **Thème**: Support light/dark mode

---

## Fonctionnalités Principales

### 1. dashboard-user (Page d'accueil)

**Objectif**: Vue d'ensemble de l'activité du réseau

**Composants**:

- **Hero Section**:

  - Message de bienvenue avec mission
  - Gradient pan-africain (vert → ambre → rouge)
  - Deux CTA principaux: "Créer une Annonce" et "Créer mon Profil"

- **Statistiques en temps réel**:

  - Entrepreneurs connectés (12,458)
  - Projets actifs (3,847)
  - Pays couverts (15)
  - Financement levé (8.2M €)

- **Entrepreneurs du Réseau**:

  - Grille de 4 cartes de profils récemment actifs
  - Affichage: Avatar, nom, rôle, localisation, spécialité
  - Badge de vérification
  - Nombre d'abonnés
  - Bouton "Suivre"

- **Projets en Vedette**:
  - 3 projets mis en avant du Market
  - Types: Financement, Partenaires, À vendre
  - Détails: montant, progression, nombre de contributeurs
  - CTA contextuels par type de projet

### 2. Annuaire

**Objectif**: Répertoire complet des acteurs économiques

**Catégories**:

#### 2.1 Artisans (`/annuaire/artisans`)

- Professionnels du textile, bois, métal, céramique, etc.
- Filtres: localisation, spécialité, niveau d'expérience
- Affichage en grille avec cartes de profil
- Informations: nom, métier, localisation, spécialité, nombre d'abonnés
- Action: Bouton "Suivre" pour chaque profil

#### 2.2 Freelances (`/annuaire/freelances`)

- Designers, développeurs, consultants, photographes, etc.
- Filtres: compétences, tarifs, disponibilité
- Portfolio et réalisations
- Notation et avis clients

#### 2.3 Entreprises (`/annuaire/entreprises`)

- PME, startups, entreprises établies
- Filtres: secteur, taille, chiffre d'affaires
- Informations: secteur d'activité, équipe, projets réalisés
- Badge de vérification pour les entreprises certifiées

#### 2.4 ONG (`/annuaire/ong`)

- Organisations non gouvernementales et associations
- Filtres: domaine d'intervention, zone géographique
- Causes soutenues et projets en cours
- Possibilité de partenariat ou bénévolat

**Fonctionnalités communes**:

- Recherche par mots-clés
- Filtres avancés multiples
- Tri par pertinence, popularité, nouveauté
- Pagination
- Vue grille/liste
- Bouton "Suivre" sur chaque carte

### 3. Création de Profil (`/creer-profil`)

**Objectif**: Permettre aux utilisateurs de créer leur carte de profil pour l'annuaire

**Formulaire**:

- **Catégorie**: Choix entre Artisan / Freelance / Entreprise / ONG
- **Informations personnelles**:
  - Nom complet (requis)
  - Titre professionnel (requis)
  - Localisation (requis)
  - Spécialité (requis)
  - Biographie (optionnel)
- **Contact**:
  - Téléphone
  - Email
  - Site web
- **Photo de profil**: Upload d'avatar

**Fonctionnalités**:

- **Aperçu en temps réel**: Visualisation de la carte de profil pendant la saisie
- **Enregistrer**: Sauvegarde comme brouillon
- **Publier/Dépublier**:
  - Publier rend le profil visible dans l'annuaire
  - Dépublier retire le profil de l'annuaire public
- **Statut visible**: Badge "Publié" ou "Brouillon"
- **Validation**: Champs requis marqués

**Aperçu de carte**:

- Avatar
- Nom et titre
- Badge de vérification (à venir après validation)
- Localisation
- Spécialité
- Extrait de biographie
- Statistiques: abonnés, projets

### 4. Market (Marketplace de Projets)

**Objectif**: Faciliter le financement, les partenariats et les transactions

#### 4.1 Financement (`/market-projets/financement`)

Projets recherchant des investissements ou du crowdfunding

**Informations par projet**:

- Titre et description
- Porteur de projet
- Montant recherché
- Montant actuel collecté
- Barre de progression
- Nombre de contributeurs
- Échéance (jours restants)
- Catégorie (textile, tech, agriculture, etc.)
- Localisation

**Actions**:

- Bouton "Détails" pour voir le projet complet
- Bouton "Suivre" pour recevoir les mises à jour
- Bouton "Contribuer" pour investir

#### 4.2 Partenaires (`/market-projets/partenaires`)

Recherche de collaborations commerciales ou stratégiques

**Informations**:

- Type de partenariat recherché
- Secteur d'activité
- Description des besoins
- Profil du partenaire idéal
- Nombre de réponses reçues

**Actions**:

- "Proposer un Partenariat"
- Système de matching intelligent

#### 4.3 À vendre (`/market-projets/a-vendre`)

Projets, entreprises ou parts sociales en vente

**Informations**:

- Prix demandé
- Pourcentage de parts
- Chiffre d'affaires annuel
- Croissance
- Secteur
- Raison de la vente
- Nombre d'intéressés

**Actions**:

- "Manifester son Intérêt"
- Contact direct avec le vendeur

### 5. Création d'Annonce Market (`/creer-annonce`)

**Objectif**: Publier un projet sur le Market

**Formulaire**:

- **Type d'annonce**: Financement / Partenaire / À vendre
- **Titre du projet** (requis)
- **Description détaillée** (requis)
- **Montant** (en euros)
- **Localisation**
- **Date limite**
- **Catégorie**: Textile, Tech, Agriculture, Artisanat, Services

**Fonctionnalités**:

- Aperçu en temps réel de la carte d'annonce
- Enregistrer comme brouillon
- Publier dans le Market
- Badge coloré selon le type (vert/ambre/rouge)
- Icônes contextuelles par type

### 6. Portefeuille

**Objectif**: Gestion des profils et projets suivis

#### 6.1 Profils suivis (`/portefeuille/`)

- Liste complète des entrepreneurs suivis
- Notifications d'activité
- Accès rapide aux profils
- Badge avec nombre (ex: 12 profils)

### 7. Mes Annonces

**Objectif**: Gestion des contenus créés par l'utilisateur

#### 7.1 Carte d'Annuaire (`/creer-profil`)

- Redirection vers la page de création/édition de profil
- Modification du profil existant
- Gestion statut publié/brouillon

#### 7.2 Carte Market (`/creer-annonce`)

- Redirection vers création/édition d'annonce
- Liste des annonces créées
- Statistiques: vues, réponses, intérêt

### 8. Messages (`/messages`)

**Objectif**: Communication entre membres

**Fonctionnalités**:

- Messagerie directe entre utilisateurs
- Notifications en temps réel (badge avec nombre)
- Historique des conversations
- Pièces jointes
- Accusés de lecture

### 9. Paramètres (`/parametres`)

**Objectif**: Configuration du compte utilisateur

**Sections**:

- **Profil**:
  - Modification informations personnelles
  - Photo de profil
  - Bannière
- **Compte**:
  - Email et mot de passe
  - Vérification d'identité
  - Badges et certifications
- **Notifications**:
  - Préférences de notification
  - Email, push, SMS
  - Fréquence
- **Confidentialité**:
  - Visibilité du profil
  - Qui peut me contacter
  - Données partagées
- **Facturation**:
  - Méthodes de paiement
  - Historique des transactions
  - Abonnements

---

## Navigation et UX

### Menu Principal (Sidebar)

**Sections**:

1. **dashboard-user** - Vue d'ensemble
2. **Annuaire** - 4 sous-catégories
3. **Portefeuille** - Profils et projets suivis (avec badges)
4. **Mes annonces** - Carte Annuaire et Carte Market
5. **Market** - 3 types de projets (avec badge nouveau)
6. **Messages** - Messagerie (avec badge nombre)
7. **Paramètres** - Configuration

**Fonctionnalités**:

- Collapsible sur desktop
- Drawer mobile avec overlay
- Recherche intégrée
- Items expandables avec chevron
- Badges de notification
- Active state visuel
- Avatar utilisateur en bas

### Menu Horizontal (Header)

**Onglets principaux**:

1. dashboard-user
2. Annuaire
3. Portefeuille
4. Market

**Responsive**:

- Desktop: Icône + texte
- Tablet: Icône + texte réduit
- Mobile: Icône uniquement

**Éléments supplémentaires**:

- Logo Nexus Connect (gauche)
- Titre de page dynamique (centre mobile)
- Icône Messages (droite)
- Icône Paramètres (droite)
- Menu hamburger (mobile gauche)

### Design Patterns

**Cartes de profil**:

- Border radius: rounded-3xl
- Hover: shadow-lg
- Transition fluide
- Avatar en haut
- Badge de vérification
- Informations hiérarchisées
- CTA en bas

**Cartes de projet Market**:

- Badge coloré par type
- Badge d'échéance
- Progress bar pour financement
- Informations clés visibles
- Actions contextuelles

**Boutons**:

- Primary: rounded-2xl, fond coloré
- Outline: rounded-2xl, transparent, bordure
- Icônes contextuelles
- États hover/active

**Badges**:

- rounded-xl ou rounded-full
- Couleurs sémantiques
- Petit texte avec icône optionnelle

---

## Flux Utilisateur Typiques

### Flux 1: Nouveau membre s'inscrit et crée son profil

1. Arrivée sur le dashboard-user
2. Clic sur "Créer mon Profil"
3. Sélection de la catégorie (Artisan/Freelance/Entreprise/ONG)
4. Remplissage du formulaire avec aperçu en temps réel
5. Clic "Enregistrer" (sauvegarde brouillon)
6. Révision de l'aperçu
7. Clic "Publier dans l'annuaire"
8. Profil visible dans la catégorie appropriée

### Flux 2: Entrepreneur recherche financement

1. Clic sur "Créer une Annonce" depuis dashboard-user ou menu
2. Sélection "Recherche de Financement"
3. Remplissage détails: titre, description, montant, échéance
4. Aperçu de la carte en temps réel
5. Enregistrement brouillon ou publication directe
6. Annonce visible dans Market > Financement
7. Réception de contributions et messages d'intéressés

### Flux 3: Utilisateur explore l'annuaire

1. Clic sur "Annuaire" dans le menu
2. Sélection catégorie (ex: Freelances)
3. Application de filtres (compétences, localisation)
4. Parcours des cartes de profils
5. Clic "Suivre" sur profils intéressants
6. Profils ajoutés au Portefeuille > Profils suivis
7. Réception de notifications d'activité

### Flux 4: Investisseur cherche opportunités

1. Navigation vers Market > Financement
2. Consultation des projets en vedette
3. Clic "Détails" sur un projet
4. Lecture description complète
5. Clic "Suivre" pour surveiller progression
6. Clic "Contribuer" pour investir
7. Communication via Messages avec porteur de projet

---

## Données Mock Actuelles

### Entrepreneurs

- **Awa Diallo** - Artisan Textile, Dakar (234 abonnés)
- **Kofi Mensah** - Designer Graphique, Accra (489 abonnés)
- **Aminata Touré** - Fondatrice Startup Fintech, Abidjan (1203 abonnés)
- **Ibrahim Keita** - Menuisier, Bamako (156 abonnés)

### Projets Market

- **Expansion Atelier Textile** - Financement 25k€, 60% financé, 45 contributeurs
- **Distribution Artisanat** - Partenaires, 12 réponses
- **Startup Fintech** - À vendre 50k€ (20% parts), croissance 150%

### Statistiques

- 12,458 entrepreneurs connectés (+2,350 ce mois)
- 3,847 projets actifs (+890 ce mois)
- 15 pays couverts (Afrique de l'Ouest)
- 8.2M € financements levés (+1.5M ce trimestre)

---

## Fonctionnalités Futures (Roadmap)

### Phase 2 (Court terme)

- Système d'authentification complet
- Base de données réelle avec Supabase/Neon
- Upload d'images et documents
- Système de notation et avis
- Matching intelligent profils/projets
- Chat en temps réel
- Notifications push

### Phase 3 (Moyen terme)

- Paiements intégrés (Stripe, Mobile Money)
- Vérification d'identité KYC
- Programme de certification
- Analytics avancés pour créateurs
- API publique
- Application mobile native
- Support multilingue (Français, Anglais, langues locales)

### Phase 4 (Long terme)

- Intelligence artificielle pour recommandations
- Blockchain pour transparence financière
- Système de réputation décentralisé
- Formation en ligne intégrée
- Événements et networking
- Expansion à toute l'Afrique

---

## Métriques de Succès

### Indicateurs Clés (KPIs)

- Nombre d'utilisateurs inscrits
- Nombre de profils publiés par catégorie
- Nombre de projets Market actifs
- Taux de financement réussi
- Nombre de partenariats créés
- Montant total levé sur la plateforme
- Taux d'engagement (connexions, messages, suivis)
- Couverture géographique (villes, pays)

### Objectif 2027

- **100 000 acteurs économiques** répertoriés et actifs
- Présence dans tous les pays CEDEAO
- Plateforme leader du networking entrepreneurial en Afrique de l'Ouest

---

## Sécurité et Conformité

### Sécurité

- Authentification sécurisée (JWT, OAuth)
- Chiffrement des données sensibles
- Protection RGPD/GDPR
- Modération de contenu
- Système anti-fraude pour paiements
- Vérification des identités

### Conformité

- Respect réglementations locales
- Transparence financière
- Protection données personnelles
- Conditions d'utilisation claires
- Politique de confidentialité

---

## Support et Contact

### Pour les utilisateurs

- Centre d'aide intégré
- Chat support (section Messages)
- FAQ contextuelle
- Tutoriels vidéo
- Webinaires de formation

### Pour les partenaires

- Programme partenaires
- API documentation
- Support dédié
- Co-branding opportunités

---

## Conclusion

**Nexus Connect** est bien plus qu'un simple annuaire : c'est un écosystème complet pour propulser l'entrepreneuriat ouest-africain. La plateforme combine découvrabilité, networking, financement et opportunités commerciales dans une expérience utilisateur moderne et fluide.

Avec un design pan-africain distinctif (vert-ambre-rouge), une architecture technique robuste (Next.js + Tailwind), et des fonctionnalités pensées pour les besoins réels des entrepreneurs africains, Nexus Connect est positionné pour devenir **la référence du networking entrepreneurial en Afrique de l'Ouest**.

L'objectif de **100 000 acteurs économiques en 2027** est ambitieux mais réalisable grâce à une approche progressive (phase par phase), un focus sur la valeur ajoutée (pas juste un listing), et un engagement fort envers la communauté entrepreneuriale africaine.

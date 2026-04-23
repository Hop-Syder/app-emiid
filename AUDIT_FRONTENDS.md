# Audit Frontends — EmiID

## Périmètre analysé

- Frontend utilisateur principal: `frontend-user`
- Frontend administration principal: `frontend-admin`
- Backend de support: `backend`
- Ancien frontend admin détecté mais non prioritaire: `admin`

## Résumé exécutif

L’architecture actuelle est cohérente dans son intention: un frontend utilisateur riche, un backend Express + Supabase, et un frontend admin séparé.

En l’état, le **frontend user est le plus avancé fonctionnellement**. Il couvre déjà l’authentification, les profils, l’annuaire public, la messagerie, le portefeuille et une partie des paramètres.

Le **frontend admin est seulement partiellement opérationnel**. Il permet déjà de visualiser des statistiques, lister les utilisateurs, modifier certains statuts et intervenir sur les médiations de messages. En revanche, il **ne pilote pas encore toute la plateforme utilisateur**: plusieurs écrans sont encore en démo, plusieurs réglages sont simulés, et la protection d’accès admin est insuffisante.

Le point le plus critique observé est le suivant:

- le frontend admin exécute des actions avec un client `service_role`,
- mais l’interface admin n’est pas réellement verrouillée en amont par un garde d’accès fort,
- ce qui crée un **risque de sécurité majeur** si l’app est exposée telle quelle.

## Applications réellement utilisées

### Frontend user

- Application active: `frontend-user`
- Stack: Next.js App Router + Supabase SSR + backend proxy + composants UI personnalisés

### Frontend admin

- Application active: `frontend-admin`
- Stack: Next.js App Router + Server Actions + Supabase
- `admin` semble être un ancien prototype ou un dashboard legacy à ne pas prendre comme base principale

## Audit du frontend user

## 1. Authentification et contrôle d’accès

### État

- **OK / Partiel**

### Ce qui fonctionne

- middleware de protection des routes privées
- redirection des utilisateurs connectés vers `dashboard-user`
- accès public autorisé pour `/`, `/login`, `/dashboard-public`, `/annuaire`, `/profil/[id]`
- callback OAuth présent

### Ce qui ne fonctionne pas ou reste fragile

- un bypass dev pour `/messages` existe encore
- la sécurité repose en grande partie sur le middleware frontend, pas sur une stratégie globale de rôles côté frontend user

### Impact

- bon niveau de protection pour les parcours standards
- risque de comportement incohérent en environnement de test/dev si les variables de bypass restent actives

## 2. Création, édition et publication de profil

### État

- **OK / Partiel**

### Ce qui fonctionne

- chargement du profil courant via `/api/users/me`
- chargement des pays depuis le backend
- sauvegarde brouillon du profil
- publication du profil via `is_published: true`
- dépublication via `is_published: false`
- gestion des tags et données principales du profil

### Ce qui ne fonctionne pas ou reste incomplet

- l’upload avatar existe comme composant dédié mais n’est pas pleinement central dans le flux principal de création de profil
- certaines validations sont présentes côté UI mais restent minimales
- le build de l’application échoue actuellement, donc le flux n’est pas validé en production build dans cet audit

### Impact

- fonctionnalité métier importante déjà exploitable
- encore fragile tant que le build final n’est pas stabilisé

## 3. Annuaire public et profils publics

### État

- **OK / Partiel**

### Ce qui fonctionne

- affichage de profils publics depuis `/api/public/profiles`
- filtres de recherche, catégorie, pays, ville, tags
- navigation vers la fiche profil publique
- possibilité de démarrer un message ou suivre un membre connecté

### Ce qui ne fonctionne pas ou reste incomplet

- l’état `isFollowed` n’est pas initialisé depuis les données remontées de la grille
- la cohérence visuelle follow/unfollow peut donc être fausse au premier affichage
- le backend récupère un profil public par `user_id` sans filtrer explicitement `is_published`

### Impact

- UX annuaire globalement bonne
- problème métier potentiellement critique: un profil non publié pourrait devenir consultable si l’endpoint n’est pas durci correctement

## 4. Dashboard public et dashboard user

### État

- **OK / Partiel**

### Ce qui fonctionne

- dashboard public alimenté par `/api/public/stats`
- dashboard user alimenté par `/api/dashboard-user/stats`
- chargement des profils mis en avant
- rafraîchissement périodique des statistiques

### Ce qui ne fonctionne pas ou reste incomplet

- certains chargements de follows sont optionnels et silencieux en cas d’erreur
- le système est robuste côté UX mais cache certains incidents backend

### Impact

- bonne perception produit
- observabilité insuffisante si les APIs tombent partiellement

## 5. Messagerie, support et médiation

### État

- **OK / Partiel**

### Ce qui fonctionne

- chargement des conversations
- chargement des messages d’une conversation
- envoi de messages
- création implicite de conversation au premier envoi
- temps réel Supabase sur les messages
- contact du support
- demande de médiation admin
- upload d’images et fichiers dans le bucket `messages`
- marquage des messages comme lus

### Ce qui ne fonctionne pas ou reste incomplet

- pas d’indication claire d’échec structuré pour certains appels temps réel
- plusieurs flux dépendent fortement de la cohérence backend + storage + realtime
- pas de couche admin/modération visible côté user une fois la médiation déclenchée, au-delà du message système

### Impact

- c’est l’un des modules les plus avancés du produit
- forte dépendance à l’infrastructure Supabase

---

## 6. Portefeuille, abonnements et followers

### État

- **Partiel**

### Ce qui fonctionne

- chargement des profils suivis
- chargement des abonnés
- unfollow
- note privée sur un profil suivi
- ouverture rapide du profil ou de la messagerie

### Ce qui ne fonctionne pas ou reste incomplet

- abonnement realtime branché sur toute la table `user_follows` sans filtre utilisateur
- certains champs d’activité affichés (`new_updates`, `is_active_today`, `last_update_title`) semblent supposés mais non garantis par le backend actuel
- les cartes followers sont rendues avec `verified: true` en dur, ce qui est incorrect fonctionnellement

### Impact

- module utile mais encore approximatif dans sa vérité métier

## 7. Paramètres utilisateur ??/

### État

- **Partiel / KO selon sous-module**

### Profil

- **OK / Partiel**
- chargement et sauvegarde via `/api/users/me`
- références pays/secteurs/professions chargées depuis le backend

### Sécurité

- **Partiel**
- PIN fonctionnel: activation, désactivation, vérification, verrouillage d’accès au dashboard
- changement de mot de passe: **UI seule**, non branchée
- 2FA applicative: **UI seule**, non branchée
- désactivation/suppression de compte: **UI seule**, non branchée

### Notifications

- **KO fonctionnel**
- écran visuel uniquement
- pas de persistance utilisateur observée

### Préférences générales

- **KO fonctionnel**
- écran visuel uniquement
- pas de persistance observée pour langue, devise, fuseau, mode sombre, visibilité

### Impact

- seule la partie profil et PIN est réellement exploitable
- le reste donne l’impression d’être prêt mais ne pilote encore rien côté métier

## 8. Notifications temps réel

### État

- **Partiel**

### Ce qui fonctionne

- hook dédié de lecture des notifications
- calcul du nombre de non lues
- marquage comme lu

### Ce qui ne fonctionne pas ou reste fragile

- abonnement realtime initialisé avant que `userId` soit garanti
- tests unitaires existants mais actuellement cassés

### Impact

- fonctionnalité potentiellement utile mais pas encore fiabilisée

## Audit du frontend admin

## 1. Dashboard admin

### État

- **OK / Partiel**

### Ce qui fonctionne

- statistiques utilisateurs, profils publiés, messages
- activité hebdomadaire
- utilisateurs récents
- répartition géographique

### Ce qui ne fonctionne pas ou reste incomplet

- état système affiché de façon essentiellement statique côté UI
- pas de monitoring métier profond

### Impact

- bon point d’entrée décisionnel
- pas encore un vrai centre d’exploitation temps réel

## 2. Gestion utilisateurs

### État

- **OK / Partiel**

### Ce qui fonctionne

- listing paginé
- recherche
- filtre par rôle/catégorie
- ouverture d’une fiche utilisateur
- bascule publication
- bascule vérification
- bascule premium
- suppression du profil

### Ce qui ne fonctionne pas ou reste incomplet

- la suppression observée porte sur `user_profiles` mais pas sur le compte auth Supabase lui-même
- pas de workflow d’édition avancée du profil admin
- pas de journal d’actions admin
- pas de modération des tags, avatar, bio, pièces jointes ou documents utilisateur

### Impact

- premier niveau de pilotage disponible
- gestion lifecycle utilisateur encore incomplète

## 3. Messagerie admin / litiges / médiation

### État

- **OK / Partiel**

### Ce qui fonctionne

- liste des conversations en litige
- lecture de la conversation de médiation
- marquage comme lu côté admin
- réponse admin dans la conversation
- temps réel sur la table `messages`

### Ce qui ne fonctionne pas ou reste incomplet

- pas de gestion de statut du litige
- pas d’assignation à un agent ou admin
- pas d’historique de traitement
- pas de priorisation, catégorisation, SLA, notes internes

### Impact

- bon MVP de médiation
- insuffisant pour une vraie exploitation support/modération

## 4. Modération galerie

### État

- **KO fonctionnel**

### Ce qui fonctionne

- écran visuel soigné
- filtres locaux
- vue grille/liste
- aperçu modal

### Ce qui ne fonctionne pas

- toutes les données sont statiques
- `handleApprove` et `handleReject` ne font qu’un `console.log`
- aucune connexion backend réelle

### Impact

- écran de démonstration uniquement
- ne pilote aucun flux du frontend user à ce stade

## 5. Paramètres admin

### État

- **KO fonctionnel**

### Ce qui fonctionne

- navigation par onglets
- état local de formulaire
- rendu visuel complet

### Ce qui ne fonctionne pas

- sauvegarde simulée via timeout
- aucune persistance réelle observée
- statistiques système affichées en dur

### Impact

- écran maquette, pas un vrai cockpit d’administration

## 6. Sécurité du frontend admin

### État

- **KO critique**

### Constats

- le layout admin n’impose pas de garde d’accès explicite côté app avant rendu
- les Server Actions s’appuient sur un client utilisant `SUPABASE_SERVICE_ROLE_KEY`
- aucune couche visible de vérification de rôle admin n’est imposée avant utilisation de ces actions

### Impact

- c’est le risque le plus grave de tout l’audit
- une administration ne doit pas reposer sur la simple discrétion d’URL ou sur un contrôle implicite

## Ce que le frontend admin doit avoir pour piloter le frontend user

Pour piloter réellement le frontend user, le frontend admin doit couvrir au minimum les capacités suivantes:

## 1. Gouvernance utilisateurs

- publier / dépublier un profil
- vérifier / révoquer une vérification
- activer / retirer le premium
- suspendre / désactiver / supprimer un compte complet
- consulter les historiques d’actions admin sur chaque utilisateur

## 2. Modération de contenu

- modération avatars, images, fichiers et galeries
- modération bio, tags, catégories, contenus signalés
- gestion des signalements utilisateurs
- motifs de rejet et traçabilité

## 3. Pilotage des référentiels utilisés par le frontend user

- CRUD pays
- CRUD secteurs / professions / jobs / industries
- CRUD tags ou taxonomies visibles dans l’annuaire et les profils

## 4. Support et médiation

- voir tous les litiges
- assigner un litige à un admin
- changer son statut
- historiser les interventions
- ajouter des notes internes non visibles des utilisateurs

## 5. Notifications et communications

- envoyer des notifications ciblées
- configurer les templates système
- déclencher des emails, notifications in-app ou push
- superviser les messages système envoyés au frontend user

## 6. Paramètres plateforme

- maintenance mode
- réglages sécurité
- paramètres d’apparence globaux
- langues disponibles
- règles de publication / vérification

## 7. Sécurité et conformité

- authentification admin stricte
- contrôle de rôles et permissions
- audit log
- séparation claire entre lecture, modération et suppression

## Fonctionnalités qui marchent aujourd’hui

## Frontend user — fonctionnel

- onboarding / login
- protection de routes principales
- dashboard public
- dashboard user
- lecture et mise à jour de profil
- publication / dépublication profil
- annuaire public
- fiche profil
- follows / unfollow / notes privées
- messagerie
- support
- médiation admin
- PIN de sécurité

## Frontend admin — fonctionnel ou partiellement fonctionnel

- dashboard statistiques
- listing utilisateurs
- changement des statuts publication / vérification / premium
- suppression de profil
- médiation / réponses admin sur messages

## Fonctionnalités qui ne marchent pas ou pas complètement

## Frontend user

- notifications de préférences non persistées
- préférences générales non persistées
- changement mot de passe non branché
- 2FA non branchée
- désactivation / suppression de compte non branchées
- cohérence follow initiale de l’annuaire non fiable
- notification realtime encore fragile
- build production non validé
- tests notifications cassés

## Frontend admin

- absence de garde d’accès admin robuste en façade
- modération galerie non branchée
- paramètres admin simulés
- suppression utilisateur incomplète au niveau compte auth
- absence de gestion des référentiels du frontend user
- absence de notifications système pilotées par admin
- absence de workflow de modération complet

## Validation technique réalisée pendant l’audit

## frontend-user

- `typecheck`: OK
- `test`: KO
- `lint`: KO
- `build`: KO

### Détails observés

- les tests `useNotifications` échouent à cause du mock `createClient`
- la configuration ESLint est rejetée par l’outil disponible dans l’environnement
- le build échoue avec une erreur webpack non détaillée dans cette session

## frontend-admin

- `lint`: KO
- `build`: KO dans cet environnement

### Détails observés

- le build dépend des Google Fonts et échoue sans accès réseau adéquat
- plusieurs erreurs lint réelles subsistent

## backend

- `build`: OK
- `test`: KO

### Détails observés

- les tests backend ciblent des routes auth obsolètes (`/signup`, `/login`, `/logout`) alors que le code actuel expose surtout `/register` et `/me`

## Priorités de correction

## Critique

1. sécuriser réellement le frontend admin et ses Server Actions
2. corriger l’endpoint public de profil pour garantir `is_published = true`
3. compléter la suppression admin pour inclure le compte auth si c’est bien la règle métier voulue
4. remettre la chaîne de build/lint/test dans un état fiable

## Haute

5. brancher réellement la modération galerie
6. brancher réellement les paramètres admin
7. brancher réellement les paramètres user non persistés
8. corriger le follow state initial dans l’annuaire

## Moyenne

9. filtrer correctement le realtime portefeuille
10. fiabiliser le hook notifications realtime
11. enrichir le module de médiation admin avec statuts et historique

## Conclusion

Le projet repose sur une base solide et déjà exploitable côté utilisateur. Le frontend user est proche d’un produit fonctionnel, mais il reste plusieurs zones “faussement prêtes” dans les paramètres et quelques incohérences de vérité métier.

Le frontend admin, lui, est encore à mi-chemin entre **cockpit réel** et **maquette avancée**. Il sait déjà intervenir sur les utilisateurs et les litiges, mais il ne contrôle pas encore suffisamment les contenus, les référentiels, les paramètres plateforme ni les flux de communication.

La prochaine phase de correction doit commencer par la **sécurité admin**, puis par les **blocants fonctionnels qui empêchent l’admin de piloter réellement le frontend user**.

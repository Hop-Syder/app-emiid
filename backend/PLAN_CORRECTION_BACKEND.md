# Plan de Correction Backend - `app-nukun/backend`

## Objectif

Stabiliser le backend Express/Supabase, éliminer les écarts entre le code source et le code réellement servi, fiabiliser la configuration d'environnement, et préparer une exploitation plus sûre en local comme en production.

Ce plan s'appuie sur les constats observés lors du démarrage réel du backend sur `http://localhost:5000` et sur la revue du code source dans `backend/src`.

---

## Résumé des Problèmes à Corriger

### P0 - Critiques

1. Écart entre `src/app.ts` et `dist/app.js`
   - `dist/app.js` expose `/api/ads`
   - `src/app.ts` ne branche pas `adsRoutes`
   - risque de régression immédiate au prochain build

2. Variable CORS incohérente
   - le code lit `CORS_ORIGINS`
   - le `.env` définit `CORS_ORIGIN`
   - la configuration réelle du `.env` n'est donc pas appliquée

3. Réponse CORS non autorisée mal gérée
   - origine interdite => `500` HTML avec stack trace
   - doit devenir une réponse JSON contrôlée

4. Dérive entre routes `messages` source et build
   - le source contient les routes de médiation/admin
   - le `dist` lancé ne les expose pas toutes

### P1 - Importantes

5. Référentiels `/api/reference/*` vides
   - endpoints fonctionnels, mais retournent `[]`
   - besoin d'identifier si le problème vient des données, des droits, ou du client Supabase utilisé

6. Sécurité de configuration
   - présence de secrets sensibles dans `.env`
   - nécessité de rotation / durcissement / vérification d'exclusion Git

7. Journalisation trop artisanale
   - `console.log`, `console.warn`, `console.error` dispersés
   - pas de format standard ni de niveaux contrôlés

### P2 - Qualité et maintenabilité

8. Couverture de tests insuffisante
9. Gestion d'erreurs à homogénéiser
10. Observabilité et endpoint de santé à enrichir
11. Middleware de sécurité HTTP non activé alors que `helmet` est installé

---

## Stratégie de Correction

## Phase 1 - Recaler la vérité du runtime sur le source

### Objectif

Faire en sorte que ce qui est dans `src/` soit exactement ce qui sera servi après build.

### Actions

1. Corriger `src/app.ts`
   - ajouter l'import de `adsRoutes`
   - rebrancher `app.use('/api/ads', adsRoutes)`

2. Rebuilder immédiatement le backend
   - `npm run build`

3. Vérifier la parité source/build
   - `/api/ads`
   - `/api/messages/dispute/:conversationId`
   - `/api/messages/admin/disputes`
   - `/api/messages/admin/reply/:conversationId`

### Livrables

- source et build alignés
- plus de route “présente seulement dans dist”

### Critère de validation

- après rebuild, les routes disponibles correspondent exactement au code de `src/`

---

## Phase 2 - Corriger la configuration CORS et environnement

### Objectif

Appliquer réellement la configuration d'environnement attendue et éviter les erreurs de comportement entre local, CI et production.

### Actions

1. Standardiser la variable CORS
   - choisir `CORS_ORIGINS`
   - mettre à jour `.env.example`
   - garder éventuellement une compatibilité temporaire avec `CORS_ORIGIN`

2. Durcir le parsing des origines
   - trim des valeurs
   - gestion explicite du vide
   - log clair de la liste chargée au démarrage en mode développement

3. Corriger la réponse en cas d'origine interdite
   - ne plus renvoyer une page HTML `500`
   - retourner un JSON propre avec statut `403` ou `401`

4. Vérifier toutes les variables critiques
   - `PORT`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CORS_ORIGINS`

### Livrables

- configuration CORS réellement appliquée
- erreur CORS propre et prédictible

### Critère de validation

- origine autorisée => `200` avec `Access-Control-Allow-Origin`
- origine interdite => réponse JSON maîtrisée sans stack trace brute

---

## Phase 3 - Stabiliser l'accès Supabase et les routes de référence

### Objectif

Comprendre pourquoi les routes de référence répondent vide et sécuriser la couche accès données.

### Actions

1. Diagnostiquer `/api/reference/countries`, `/sectors`, `/professions`
   - vérifier si les tables contiennent réellement des données
   - vérifier les politiques RLS
   - comparer comportement avec `supabase` et `supabaseAdmin`

2. Décider le bon client selon le besoin métier
   - si données purement publiques : `supabase` avec RLS publique cohérente
   - si référentiels globaux internes : `supabaseAdmin`

3. Ajouter des logs métiers temporaires de diagnostic
   - table interrogée
   - nombre de lignes retournées
   - message d'erreur Supabase si présent

4. Vérifier les endpoints dashboard
   - cohérence entre `getGlobalStats` et `getPublicStats`
   - comportement si une table est vide

### Livrables

- routes de référence documentées et comprises
- comportement vide expliqué ou corrigé

### Critère de validation

- chaque route de référence retourne soit des données cohérentes, soit une erreur métier explicite

---

## Phase 4 - Sécuriser les secrets et la configuration sensible

### Objectif

Réduire le risque opérationnel lié aux secrets backend.

### Actions

1. Vérifier que `backend/.env` est bien ignoré par Git
2. Rotater les secrets sensibles si ce fichier a été partagé ou versionné
   - surtout la clé `SUPABASE_SERVICE_ROLE_KEY`
   - vérifier aussi `SUPABASE_JWT_SECRET`

3. Réduire le contenu de `.env.example`
   - ne laisser aucun secret réel
   - documenter seulement les noms et formats attendus

4. Ajouter une validation explicite au démarrage
   - sortie claire si une variable obligatoire manque
   - éviter de démarrer avec une config partielle

### Livrables

- environnement backend assaini
- risque de fuite de secrets réduit

### Critère de validation

- aucun secret réel hors du fichier local privé
- démarrage refusé si les variables critiques sont absentes

---

## Phase 5 - Homogénéiser les erreurs et les logs

### Objectif

Rendre le backend lisible, observable et moins fragile en incident.

### Actions

1. Introduire un logger centralisé
   - niveaux `info`, `warn`, `error`, `debug`
   - préfixe backend
   - désactivation partielle en production si nécessaire

2. Remplacer les `console.*` directs
   - `app.ts`
   - `controllers/*`
   - `middlewares/*`

3. Ajouter un middleware d'erreur Express
   - format JSON unifié
   - pas de stack trace brute côté client
   - statut HTTP cohérent

4. Normaliser les réponses d'erreur
   - `{ error, message, details? }`

### Livrables

- logs homogènes
- erreurs backend cohérentes

### Critère de validation

- une erreur inattendue ne renvoie plus de HTML Express brut

---

## Phase 6 - Renforcer la sécurité HTTP

### Objectif

Activer les protections HTTP de base déjà prévues par les dépendances.

### Actions

1. Activer `helmet`
2. Vérifier les en-têtes générés
3. Vérifier la compatibilité CORS + credentials + helmet
4. Réviser le comportement sur les routes publiques et protégées

### Livrables

- sécurité HTTP de base active

### Critère de validation

- réponses avec en-têtes de sécurité attendus

---

## Phase 7 - Ajouter les tests backend

### Objectif

Sortir d'une validation purement manuelle.

### Priorités de test

1. Healthcheck `/`
2. CORS autorisé / refusé
3. Auth middleware sans token => `401`
4. `/api/public/stats`
5. `/api/public/profiles`
6. `/api/ads`
7. routes messages critiques

### Approche recommandée

- tests d'intégration HTTP avec `supertest`
- mocks ciblés si nécessaire sur Supabase
- quelques tests de contrôleurs si la logique devient plus riche

### Livrables

- base de tests backend exécutable en CI

### Critère de validation

- les principaux endpoints publics et protégés sont couverts

---

## Ordre d'Exécution Recommandé

1. corriger `src/app.ts` pour réaligner `/api/ads`
2. corriger `CORS_ORIGINS` vs `CORS_ORIGIN`
3. ajouter une gestion JSON propre des erreurs CORS
4. rebuild et retester toutes les routes publiques
5. diagnostiquer les routes de référence
6. sécuriser les secrets et la validation `.env`
7. ajouter logger + middleware d'erreur
8. activer `helmet`
9. ajouter les tests d'intégration

---

## Estimation de Charge

- Phase 1 : 0,5 jour
- Phase 2 : 0,5 jour
- Phase 3 : 0,5 à 1 jour
- Phase 4 : 0,5 jour
- Phase 5 : 1 jour
- Phase 6 : 0,5 jour
- Phase 7 : 1 à 2 jours

### Total estimé

- **4,5 à 6 jours** pour une stabilisation backend propre

---

## Définition de "corrigé"

Le backend pourra être considéré comme stabilisé quand les conditions suivantes seront vraies :

1. `npm run build` passe
2. `npm start` expose exactement les routes définies dans `src/`
3. `/api/ads` est bien branché après rebuild
4. la config CORS lit les bonnes variables
5. une origine interdite ne renvoie plus de stack HTML brute
6. les routes de référence ont un comportement expliqué et maîtrisé
7. les secrets backend sont sécurisés
8. les principaux endpoints sont couverts par des tests

---

## Recommandation Immédiate

Commencer par ce lot minimal :

1. corriger `src/app.ts`
2. corriger `CORS_ORIGINS`
3. rebuild
4. retester `/`, `/api/public/stats`, `/api/public/profiles`, `/api/ads`
5. corriger la réponse CORS en erreur propre

Ce lot réduit immédiatement le risque de régression runtime et met le backend dans un état plus prévisible.

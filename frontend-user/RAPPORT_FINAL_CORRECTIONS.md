# Rapport d'Audit Technique Final - `frontend-user`

## Contexte

- **Projet audité :** `frontend-user`
- **Emplacement :** `/home/hopsyder/Projet/app-nukun/frontend-user`
- **Date d'analyse :** 26 mars 2026
- **Stack principale :** Next.js 15.5.9, React 19.2.0, TypeScript 5, Tailwind CSS, Supabase SSR/Auth/Realtime

## Résumé Exécutif

L'application repose sur une base moderne et globalement cohérente. La structure App Router est claire, le découpage `app/`, `components/`, `lib/`, `hooks/` est lisible, et la protection des routes privées par middleware fonctionne correctement dans les tests HTTP effectués.

En revanche, le projet n'est pas encore stabilisé sur les axes de qualité d'exécution. Le typage compile, mais la chaîne de lint est cassée, la suite de tests échoue entièrement, plusieurs défauts fonctionnels concrets subsistent dans la gestion des notifications et dans les métadonnées d'assets, et les bundles de certaines pages restent très lourds.

## Verdict Professionnel

### Appréciation Globale : **Bonne base, mais stabilisation incomplète** `3.5/5`

Le projet est **architecturalement sérieux**, mais **pas encore "production-ready" au sens strict** tant que :

- `lint` n'est pas réellement opérationnel
- les tests automatisés restent rouges
- la messagerie/notification conserve des fragilités temps réel
- les métadonnées d'icônes pointent vers des fichiers absents
- les pages lourdes `/annuaire` et `/creer-profil` restent au-dessus de 2.4 MB de First Load JS

---

## Méthodologie

### Revue de code

Analyse des zones suivantes :

- structure des routes App Router
- composants métier principaux
- middleware et authentification
- intégration API
- qualité TypeScript et tests
- performances de build

### Vérifications exécutées

Commandes lancées pendant l'audit :

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
npm run build
./node_modules/.bin/next build --no-lint
npm start -- -p 3005
curl -I http://localhost:3005/...
```

### Limite importante

Le backend attendu sur `http://127.0.0.1:5000` n'était pas joignable pendant l'audit.

Conséquence :

- les intégrations API externes n'ont pas pu être validées de bout en bout
- l'audit fonctionnel complet des écrans dépendants des données live reste partiel
- plusieurs composants sont donc évalués à la fois sur leur code et sur leur comportement en mode dégradé

---

## État des Vérifications

### `npm run typecheck`

**Résultat :** ✅ Succès

Le périmètre TypeScript passe actuellement avec `tsc --noEmit`.

### `npm run lint`

**Résultat :** ❌ Échec

Constats :

- `package.json` déclare le script `lint`, mais aucune dépendance `eslint` locale n'est installée
- `npm ls eslint` retourne un arbre vide
- `./node_modules/.bin/eslint` est absent
- `npm run lint` s'appuie donc sur un `eslint` global système en version `6.4.0`
- cette version rejette la configuration actuelle `.eslintrc.json`

Erreur observée :

```text
ESLint configuration in .eslintrc.json is invalid:
Unexpected top-level property "ignorePatterns".
```

### `npm test -- --runInBand`

**Résultat :** ❌ Échec

- 1 suite exécutée
- 6 tests échoués
- aucun test vert

Cause principale observée :

- le mock de `createClient` dans `__tests__/use-notifications.test.tsx` n'est pas compatible avec l'usage qui en est fait
- l'appel `(createClient as jest.Mock).mockReturnValue(...)` échoue car `createClient` n'est pas correctement mocké comme fonction Jest

### `npm run build`

**Résultat :** ❌ Échec partiel

Le build compile, puis échoue au moment où Next.js exige une installation locale d'ESLint :

```text
ESLint must be installed in order to run during builds
```

### `./node_modules/.bin/next build --no-lint`

**Résultat :** ✅ Succès

Le build de production passe sans lint, ce qui confirme que :

- le code compile
- les routes sont générables
- le principal blocage build actuel est bien la couche lint

### Vérifications HTTP locales

Après démarrage de l'application sur `http://localhost:3005` :

- `GET /` -> `200 OK`
- `GET /dashboard-public` -> `200 OK`
- `GET /messages` -> `307 Temporary Redirect` vers `/`
- `GET /dashboard-user` -> `307 Temporary Redirect` vers `/`
- `GET /portefeuille` -> `307 Temporary Redirect` vers `/`
- `GET /profil/123` -> `200 OK`

Conclusion :

- le middleware protège correctement les routes privées
- les routes publiques principales répondent
- la logique d'accès anonyme est cohérente avec les intentions métier

---

## Architecture et Structure

## Points forts

- **Architecture App Router claire**
  - routes lisibles dans `app/`
  - séparation correcte entre pages, composants, hooks et librairies

- **Middleware d'authentification fonctionnel**
  - protection des routes privées
  - redirection cohérente des utilisateurs non connectés

- **Client API centralisé**
  - `lib/apiClient.ts` évite la duplication des appels `fetch`
  - injection automatique du token Supabase sur les routes authentifiées

- **Typage en progression**
  - un fichier `types/index.ts` centralise maintenant plusieurs modèles métier utiles

- **Build Next.js viable**
  - en dehors du lint, l'application peut être générée correctement

## Points structurels à surveiller

- la logique métier reste très concentrée dans de gros composants
- plusieurs composants mélangent UI, orchestration réseau et mapping de données
- le mode dégradé avec données mock masque parfois les indisponibilités backend

---

## Problèmes Identifiés

## 1. Chaîne de lint non fiable et non reproductible

### Gravité : Élevée

Fichiers concernés :

- `package.json`
- `.eslintrc.json`

Constats :

- `package.json` ne contient pas `eslint` dans les `devDependencies`
- le script `lint` dépend donc de l'environnement machine
- `.eslintrc.json` n'est pas compatible avec l'ESLint global effectivement utilisé
- `next build` échoue tant qu'ESLint n'est pas installé localement

Impact :

- la qualité statique n'est pas pilotée de façon fiable
- deux machines peuvent obtenir des résultats différents
- le CI/CD casserait au build si la dépendance n'est pas fixée correctement

Preuves :

- `package.json:74-89`
- `.eslintrc.json:36-42`

### Évaluation

C'est aujourd'hui le principal défaut opérationnel du frontend : le projet typecheck, mais sa chaîne de qualité n'est pas stabilisée.

---

## 2. Métadonnées d'icônes cassées

### Gravité : Élevée

Fichier concerné :

- `app/layout.tsx`

Le layout déclare :

- `/icon-light-32x32.png`
- `/icon-dark-32x32.png`
- `/icon.svg`
- `/apple-icon.png`

Or les vérifications HTTP ont donné :

- `GET /icon.svg` -> `404`
- `GET /icon-light-32x32.png` -> `404`
- `GET /icon-dark-32x32.png` -> `404`
- `GET /apple-icon.png` -> `404`

Seul `GET /logo/apple-icon.png` répond en `200`.

Impact :

- favicon cassé
- icône Apple non servie
- rendu navigateur et partage moins soignés
- dette visible côté branding/SEO/PWA

Preuves :

- `app/layout.tsx:15-31`

### Évaluation

Ce n'est pas bloquant pour la navigation, mais c'est un bug fonctionnel réel et directement observable.

---

## 3. Hook de notifications fragile en temps réel

### Gravité : Élevée

Fichier concerné :

- `hooks/use-notifications.ts`

Problèmes observés :

1. le client Supabase est recréé à chaque rendu
2. l'effet dépend de `supabase`, ce qui favorise les re-souscriptions inutiles
3. `userId` vaut `null` au moment de créer le channel Realtime
4. le filtre `user_id=eq...` risque donc de ne jamais être appliqué au premier abonnement

Impact :

- souscriptions instables
- doubles chargements potentiels
- notifications temps réel possiblement non filtrées ou non reçues correctement
- comportement difficile à tester

Preuves :

- `hooks/use-notifications.ts:28-30`
- `hooks/use-notifications.ts:31-37`
- `hooks/use-notifications.ts:53-70`
- `hooks/use-notifications.ts:75`

### Évaluation

Le hook fonctionne conceptuellement, mais sa mise en oeuvre actuelle est fragile et mérite un refactoring avant de le considérer comme fiable.

---

## 4. Suite de tests introduite mais non exploitable

### Gravité : Élevée

Fichier concerné :

- `__tests__/use-notifications.test.tsx`

Constats :

- le mock de `createClient` n'est pas correctement initialisé comme `jest.fn()`
- un test "realtime subscription" est incomplet et ne vérifie rien
- la suite échoue avant de réellement valider le hook

Impact :

- faux sentiment de couverture
- pipeline rouge
- faible confiance sur la couche notifications

Preuves :

- `__tests__/use-notifications.test.tsx:10`
- `__tests__/use-notifications.test.tsx:56-63`
- `__tests__/use-notifications.test.tsx:158-176`

### Évaluation

La direction prise est bonne, mais l'implémentation de test n'est pas encore au niveau d'une base fiable.

---

## 5. Dépendance backend forte et mode dégradé qui masque les incidents

### Gravité : Moyenne à élevée

Fichiers concernés :

- `lib/apiClient.ts`
- `components/dashboard-user-content/dashboard-user-content.tsx`
- `components/dashboard-public-content/dashboard-public-content.tsx`

Constats :

- le frontend cible par défaut `http://127.0.0.1:5000`
- pendant l'audit, les endpoints appelés ont répondu `000`, donc backend indisponible
- plusieurs écrans retombent sur des mocks sans forcément exposer clairement l'incident à l'utilisateur

Impact :

- un backend indisponible peut être partiellement masqué
- le diagnostic d'incident devient plus difficile
- les métriques fonctionnelles peuvent sembler correctes alors que les données sont simulées

Exemple :

- `dashboard-user-content.tsx` recharge des statistiques puis bascule sur `mockStats` et `mockEntrepreneurs` en cas d'échec

### Évaluation

Le fallback est utile pour préserver l'UX, mais il devrait être encadré par une signalisation explicite et du monitoring.

---

## 6. Performances toujours insuffisantes sur les pages catalogue et profil

### Gravité : Moyenne

Résultats de build observés :

```text
/annuaire      2.46 MB First Load JS
/creer-profil  2.47 MB First Load JS
```

Ces valeurs restent très au-dessus d'un budget raisonnable pour une expérience fluide sur mobile.

Conséquences probables :

- temps d'interactivité dégradé
- coût réseau élevé
- perception de lenteur sur terminaux modestes

Causes plausibles au vu du code :

- composants très volumineux
- logique métier, mapping et UI regroupés
- peu de découpage paresseux
- usage encore limité de stratégies d'optimisation d'image

Signaux complémentaires :

- `components/messages-content.tsx` fait `1077` lignes
- `components/creative.tsx` fait `1835` lignes

### Évaluation

Le build est sain, mais pas encore optimisé pour l'échelle ou les connexions lentes.

---

## 7. Qualité de code en amélioration, mais dette encore visible

### Gravité : Moyenne

Constats observés dans le code :

- des `any` subsistent
- plusieurs `console.error`, `console.warn` et même au moins un `console.log` métier sont encore présents
- certains composants utilisent encore des `<img>` directs au lieu d'une stratégie homogène
- `annuaire-grid.tsx` conserve un état `profiles` en `any[]` et un import `Skeleton` inutilisé

Exemples :

- `components/annuaire-public-content/annuaire-grid.tsx:17`
- `components/annuaire-public-content/annuaire-grid.tsx:32`
- `components/messages-content.tsx:197`
- `components/creer-profil-content/creer-profil-content.tsx` contient encore un log de sauvegarde

### Évaluation

La base devient plus propre, mais le refactoring n'est pas encore achevé.

---

## 8. Composants métier trop massifs

### Gravité : Moyenne

Fichiers concernés :

- `components/messages-content.tsx`
- `components/creative.tsx`

Effets négatifs :

- lecture difficile
- tests plus coûteux
- risques de régression accrus
- faible réutilisabilité

`messages-content.tsx` concentre notamment :

- récupération conversations
- récupération messages
- logique realtime
- envoi de message
- upload de fichiers
- médiation
- filtres de recherche
- rendu complet desktop/mobile

### Évaluation

Le composant fait preuve de richesse fonctionnelle, mais son niveau de concentration dépasse ce qui reste confortable à maintenir.

---

## Intégration API

## Forces

- wrapper `fetchWithAuth` simple et lisible
- injection du bearer token Supabase centralisée
- distinction nette entre appels publics et authentifiés

## Faiblesses

- pas de timeout natif
- pas de stratégie de retry
- pas de normalisation des erreurs
- valeur par défaut locale `http://127.0.0.1:5000` qui couple fortement le frontend à un environnement précis

### Évaluation

Le socle d'intégration est correct pour un projet en croissance, mais encore trop léger pour une exploitation robuste.

---

## Routage et Authentification

## Points validés

- les routes publiques principales sont accessibles
- les routes privées redirigent correctement un utilisateur non connecté
- la route `auth/callback` est propre et minimaliste

## Réserve

Le middleware dépend directement des variables Supabase publiques et de la disponibilité auth au runtime. L'approche est standard, mais l'observabilité en cas de panne reste limitée.

---

## Accessibilité et UX

## Points positifs

- UI visuellement ambitieuse
- usage cohérent de composants shadcn/ui et Radix
- responsive présent dans les principaux layouts

## Points à revoir

- assets metadata cassés
- accessibilité des tooltips et contrôles non entièrement auditée
- certaines interactions riches gagneraient à être validées systématiquement au clavier et au lecteur d'écran

### Évaluation

L'expérience perçue est bonne, mais la couche a11y n'est pas encore démontrée de façon robuste.

---

## Recommandations Prioritaires

## P0 - À corriger immédiatement

1. Installer `eslint` localement et stabiliser la configuration lint
2. Corriger `app/layout.tsx` ou ajouter les assets réellement référencés
3. Refactorer `useNotifications` pour :
   - créer le client Supabase de manière stable
   - récupérer l'utilisateur avant l'abonnement
   - éviter les souscriptions basées sur un `userId` nul
4. Réparer les tests Jest du hook notifications

## P1 - À traiter dans le prochain lot

1. Ajouter timeout, gestion d'erreur et éventuellement abort controller dans `lib/apiClient.ts`
2. Remplacer les derniers `any` critiques
3. Uniformiser l'usage du logger introduit récemment
4. Supprimer les imports inutilisés et les logs métier restants

## P2 - À planifier pour la montée en qualité

1. Découper `messages-content.tsx` en sous-composants
2. Réduire le poids de `/annuaire` et `/creer-profil`
3. Ajouter un vrai scénario E2E sur messagerie
4. Ajouter des garde-fous de monitoring quand les écrans retombent sur des mocks

---

## Conclusion Générale

`frontend-user` présente une **base applicative crédible**, avec un bon niveau de conception pour un produit Next.js moderne connecté à Supabase. Les protections de routes fonctionnent, le build applicatif passe hors lint, et la structure générale montre une vraie intention d'industrialisation.

Cependant, l'état actuel correspond davantage à une **phase de consolidation avancée** qu'à un frontend totalement verrouillé :

- la qualité automatique n'est pas encore complètement fiable
- les tests ne sécurisent pas encore le comportement
- certaines fonctionnalités temps réel restent fragiles
- la performance sur les pages lourdes reste insuffisante

### Conclusion professionnelle

Le projet est **prometteur et sérieusement construit**, mais il lui manque encore une dernière passe de robustesse pour être considéré comme pleinement stabilisé.

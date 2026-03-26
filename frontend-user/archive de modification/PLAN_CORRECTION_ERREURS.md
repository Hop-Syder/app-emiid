# Plan de Proposition - Correction des Erreurs `frontend-user`

## Objectif

Corriger les erreurs techniques, réduire le risque de régression, et stabiliser le projet avant toute montée en charge ou mise en production étendue.

Ce plan couvre les problèmes remontés dans `RAPPORT_ANALYSE.md` et les constats visibles dans le code actuel :

- `next.config.mjs` ignore les erreurs TypeScript et ESLint au build
- plusieurs `console.error` et `console.log` sont présents dans le code applicatif
- plusieurs `catch {}` sont silencieux
- absence de tests automatisés
- usage répété de `any`
- composants trop volumineux, surtout `messages-content.tsx` et `creative.tsx`
- risques de performance et d'accessibilité

---

## 1. Priorités de correction

### P0 - Bloquants de fiabilité

À traiter en premier :

1. Réactiver les garde-fous du build
2. Corriger les erreurs TypeScript et ESLint réelles
3. Supprimer les `catch` silencieux
4. Encadrer ou supprimer les logs de debug

### P1 - Régression fonctionnelle

À traiter juste après :

1. Ajouter des tests sur les zones critiques
2. Sécuriser les appels API et les états d'erreur
3. Réduire l'usage de `any`

### P2 - Maintenabilité et performance

À traiter ensuite :

1. Découper les gros composants
2. Optimiser les images et le bundle
3. Renforcer l'accessibilité

---

## 2. Plan d'exécution proposé

## Phase 1 - Assainir le build

### Actions

1. Modifier `next.config.mjs`
   - passer `typescript.ignoreBuildErrors` à `false`
   - passer `eslint.ignoreDuringBuilds` à `false`
   - préparer la réactivation de l'optimisation d'images

2. Ajouter les scripts qualité manquants dans `package.json`
   - `typecheck`
   - `lint`
   - `test`
   - `test:watch`

3. Lancer un diagnostic complet
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run build`

### Procédure sécurisée recommandée

1. créer une branche dédiée, par exemple `fix/build-errors`
2. modifier `next.config.mjs` pour réactiver les garde-fous
3. lancer `npm run build`
4. consigner toutes les erreurs dans un fichier `BUILD_ERRORS.md`
5. corriger erreur par erreur, sans élargir le périmètre
6. relancer le build après chaque correction importante

### Livrables

- build qui échoue uniquement sur de vraies erreurs
- première liste consolidée des erreurs TypeScript/ESLint
- fichier de suivi `BUILD_ERRORS.md`

### Critère de validation

- aucune erreur masquée au build

---

## Phase 2 - Corriger les erreurs de robustesse

### Actions

1. Remplacer tous les `catch (e) {}` par une gestion explicite
   - journalisation contrôlée
   - message utilisateur si l'action a un impact UX
   - retour sûr ou fallback défini

2. Introduire un logger centralisé, par exemple `lib/logger.ts`
   - logs actifs en développement
   - logs minimaux en production
   - homogénéiser `console.log`, `console.error`, `console.warn`

Exemple recommandé :

```typescript
const isDev = process.env.NODE_ENV === "development"

type LogLevel = "log" | "warn" | "error" | "info"

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isDev) return true
    return level === "error"
  }

  log(...args: unknown[]) {
    if (this.shouldLog("log")) console.log(...args)
  }

  info(...args: unknown[]) {
    if (this.shouldLog("info")) console.info(...args)
  }

  warn(...args: unknown[]) {
    if (this.shouldLog("warn")) console.warn(...args)
  }

  error(...args: unknown[]) {
    if (this.shouldLog("error")) console.error(...args)
  }
}

export const logger = new Logger()
```

3. Passer en revue les fichiers déjà identifiés
   - `components/messages-content.tsx`
   - `components/dashboard-user-content/dashboard-user-content.tsx`
   - `components/dashboard-public-content/dashboard-public-content.tsx`
   - `components/creer-profil-content/creer-profil-content.tsx`
   - `components/annuaire-public-content/annuaire-grid.tsx`
   - `app/login/page.tsx`

### Livrables

- plus de `catch` vide dans `frontend-user`
- plus de logs de debug bruts dans les composants métier

### Critère de validation

- `rg -n "catch \\([^)]*\\) \\{\\}" frontend-user`
  ne retourne aucun résultat utile dans le code applicatif

---

## Phase 3 - Corriger le typage

### Actions

1. Remplacer les `any` prioritaires par des types explicites
   - réponses API
   - structures de profil
   - conversations/messages
   - listes de pays, secteurs, professions

2. Centraliser les types dans un dossier dédié
   - `types/profile.ts`
   - `types/messages.ts`
   - `types/api.ts`

### Types à créer en priorité

1. `types/api.ts`

```typescript
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
```

2. `types/profile.ts`

```typescript
export interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  role?: string
}
```

3. `types/messages.ts`

```typescript
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
  type: "text" | "image" | "file" | "audio"
}
```

3. Sécuriser les transformations de données
   - mapping API vers modèle UI
   - vérifications null/undefined
   - narrowing sur les erreurs

### Zones prioritaires

- `components/messages-content.tsx`
- `components/creer-profil-content/*`
- `components/parametre-content/*`
- `components/annuaire-public-content/annuaire-grid.tsx`
- `components/portefeuille-content/followed-profiles-content.tsx`

### Livrables

- réduction forte du nombre de `any`
- erreurs TypeScript ramenées à zéro sur le périmètre frontend-user

### Critère de validation

- `npx tsc --noEmit` passe sans erreur

---

## Phase 4 - Mettre en place les tests

### Actions

1. Installer la stack de test
   - `jest`
   - `@testing-library/react`
   - `@testing-library/jest-dom`
   - `@types/jest`

2. Créer la configuration minimale
   - `jest.config.*`
   - setup de test
   - mocks Next.js et Supabase si nécessaire

3. Écrire les premiers tests critiques
   - `hooks/use-notifications.ts`
   - logique du dashboard utilisateur
   - chargement et fallback des listes
   - comportements principaux de messagerie

4. Ajouter au moins un test par catégorie
   - hook
   - composant métier
   - utilitaire API

### Test E2E prioritaire

Scénario recommandé :

- flux complet de messagerie
- création de conversation
- envoi de message
- réception en temps réel
- marquage comme lu

Ce scénario valide :

- l'intégration API
- le temps réel Supabase
- la gestion des états critiques

### Stratégie de test Supabase

Le temps réel Supabase est plus complexe à tester. Commencer par des mocks stables, puis ajouter l'E2E quand la base de test est prête.

Exemple de mock minimal :

```typescript
export const createClient = () => ({
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
  },
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
  })),
  removeChannel: jest.fn(),
})
```

### Livrables

- pipeline de test exécutable localement
- couverture minimale sur les parcours critiques
- premier scénario E2E critique défini, ou implémenté si l'environnement le permet

### Critère de validation

- `npm test` passe

---

## Phase 5 - Performance et structure

### Actions

1. Activer l'optimisation des images Next.js
   - retirer `images.unoptimized: true` si compatible avec le déploiement
   - migrer les usages vers `next/image` là où c'est pertinent

2. Mesurer le bundle
   - ajouter `@next/bundle-analyzer`
   - identifier les routes lourdes, surtout `/annuaire` et `/creer-profil`

### Objectifs chiffrés

- `/annuaire` : 2.46 MB -> viser d'abord < 800 KB, puis < 500 KB en objectif ambitieux
- `/creer-profil` : 2.47 MB -> viser d'abord < 800 KB, puis < 500 KB en objectif ambitieux
- First Contentful Paint : < 2s
- Time to Interactive : < 3.5s

3. Découper les composants trop gros
   - `components/messages-content.tsx`
   - `components/creative.tsx`
   - `components/menu/nexus-header.tsx` si la logique continue à grossir

### Garde-fou de périmètre

- Phase 5.1 : traiter seulement `components/messages-content.tsx`
- Phase 5.2 : traiter `components/creative.tsx`
- ne pas élargir aux autres composants dans le premier lot sans nouvelle mesure

4. Introduire du lazy loading ciblé
   - `dynamic()` sur les composants coûteux
   - chargement différé des blocs non critiques

### Livrables

- bundle analysé
- composants critiques segmentés
- réduction du poids initial des pages les plus lourdes

### Critère de validation

- baisse mesurable du First Load JS sur les routes concernées

---

## Phase 6 - Accessibilité et qualité finale

### Actions

1. Ajouter les labels et attributs ARIA manquants
2. Vérifier les parcours clavier
3. Corriger les contrastes faibles
4. Valider les modales, drawers et tooltips

### Livrables

- composants interactifs conformes aux attentes de base a11y

### Critère de validation

- revue manuelle clavier + contrôle Lighthouse Accessibility

---

## 3. Ordre concret des fichiers à traiter

Ordre recommandé pour limiter le risque :

1. `frontend-user/next.config.mjs`
2. `frontend-user/package.json`
3. `frontend-user/BUILD_ERRORS.md`
4. `frontend-user/lib/`
5. `frontend-user/types/`
6. `frontend-user/components/dashboard-user-content/dashboard-user-content.tsx`
7. `frontend-user/components/dashboard-public-content/dashboard-public-content.tsx`
8. `frontend-user/components/annuaire-public-content/annuaire-grid.tsx`
9. `frontend-user/components/creer-profil-content/creer-profil-content.tsx`
10. `frontend-user/components/messages-content.tsx`
11. `frontend-user/components/parametre-content/*`
12. `frontend-user/components/portefeuille-content/*`

Raison :

- on rétablit d'abord la qualité du build
- on corrige ensuite les erreurs silencieuses
- on traite les zones métier les plus sensibles avant le refactoring lourd

---

## 4. Estimation de charge

Estimation pragmatique pour une première vague de stabilisation :

- Phase 1 : 0,5 à 1 jour
- Phase 2 : 1 à 2 jours
- Phase 3 : 1 à 3 jours
- Phase 4 : 1 à 2 jours
- Phase 5 : 2 à 4 jours
- Phase 6 : 1 jour

Total estimé :

- 6,5 à 13 jours selon le nombre réel d'erreurs TypeScript et le niveau de refactoring retenu

---

## 5. Définition de "corrigé"

Le périmètre pourra être considéré comme stabilisé quand les conditions suivantes seront vraies :

1. `npm run lint` passe
2. `npx tsc --noEmit` passe
3. `npm run build` passe avec garde-fous activés
4. `npm test` passe
5. aucun `catch` vide ne reste dans le code applicatif
6. les logs de debug ne sont plus exposés en production
7. les écrans critiques sont validés manuellement
   - login
   - dashboard public
   - dashboard user
   - annuaire
   - création de profil
   - messagerie
   - paramètres

---

## 6. Proposition de livraison

Je recommande de livrer en 3 lots :

### Lot 1 - Stabilisation technique

- build strict
- inventaire des erreurs dans `BUILD_ERRORS.md`
- correction TypeScript/ESLint
- suppression des `catch` silencieux
- logger centralisé

### Lot 2 - Sécurisation fonctionnelle

- tests initiaux
- typage métier
- gestion d'erreurs homogène

### Lot 3 - Optimisation

- refactoring composants lourds
- optimisation bundle/images
- accessibilité

---

## 7. Recommandation immédiate

Commencer par ce sprint minimal :

1. corriger `next.config.mjs`
2. lancer `lint`, `tsc`, `build`
3. corriger toutes les erreurs bloquantes
4. remplacer les `catch {}` vides
5. créer `lib/logger.ts`
6. ajouter la base de test Jest

Ce sprint donne une base saine pour traiter le reste sans masquer les défauts.

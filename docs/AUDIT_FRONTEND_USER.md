# 🔎 Audit fonctionnel — frontend-user

> Audit statique (sans navigateur) page par page : bugs, rôle de chaque page, états, liens.
> Date : 2026-06-22 · Périmètre : `frontend-user` · Méthode : lecture du code + ESLint + typecheck.
> ⚠️ Le rendu visuel et le comportement runtime (clics, temps réel) doivent être validés en **QA navigateur** (voir §4).

---

## 1. Synthèse

| Indicateur | Résultat |
|---|---|
| Pages (`page.tsx`) | 17 routes |
| TypeScript | ✅ 0 erreur |
| ESLint | 🟡 113 problèmes (23 erreurs, 90 warnings) — **non bloquants** (build Vercel OK) |
| Liens internes cassés | ✅ 0 (après corrections `/parametre`, `/premium`) |
| Handlers morts / TODO / console.log | ✅ aucun |
| Bug fonctionnel majeur | 🐛 **1 corrigé** (proximité — voir §3) |

---

## 2. Rôle de chaque page (évaluation)

| Route | Rôle | Verdict |
|---|---|---|
| `/` | Landing publique : stats + 6 profils publiés | ✅ OK |
| `/login` | Connexion **OAuth only** (Google/LinkedIn/Apple) + CGU obligatoire | ✅ OK (ℹ️ pas d'UI email/mot de passe bien que `/api/auth/register` existe) |
| `/auth/callback` | Échange code OAuth, reset PIN, détection nouvel utilisateur → onboarding | ✅ OK |
| `/auth/auth-code-error` | Page d'erreur d'auth | ✅ OK |
| `/onboarding` | 3 slides de présentation, marque `has_profile` | ✅ OK |
| `/dashboard-user` | Hub : premium / nouveaux / proximité | ✅ OK **après correctif** (§3) |
| `/profil` | Redirige vers le profil de l'utilisateur connecté | ✅ OK |
| `/profil/[id]` | Profil public détaillé (responsive) | ✅ OK |
| `/creer-profil` | Création/édition de profil (validation, brouillon, publication) | ✅ OK (bonne gestion d'erreurs) |
| `/annuaire` | Recherche Cmd+K + 2 filtres (type de profil / secteur) | ✅ OK |
| `/annuaire/[category]`, `/[category]/[city]` | Pages SEO catégorie/ville | 🟡 à valider en QA |
| `/messages` | Messagerie temps réel (Suspense + Preloader) | 🟡 à valider en QA (temps réel) |
| `/notifications` | Liste des notifications (360 l.) | 🟡 à valider en QA |
| `/portefeuille` | Abonnements + réalisations | 🟡 à valider en QA |
| `/parametres` | Réglages (sécurité PIN, profil, notifications) | 🟡 à valider en QA |
| `/conditions`, `/confidentialite` | Pages légales statiques | ✅ OK |

---

## 3. 🐛 Bug corrigé — Matching de proximité (id vs user_id)

**Sévérité : moyenne (fonctionnalité dégradée silencieusement).**

Le dashboard et la route proximity interrogeaient la vue `public_profiles` en comparant la colonne **`id`** (= ID du profil, `user_profiles.id`) à **`user.id`** (= ID d'authentification, correspondant à la colonne **`user_id`**). Ces deux identifiants sont **différents**.

Conséquences :
- La **localisation de l'utilisateur n'était jamais trouvée** (`.eq('id', user.id)` ne matchait rien) → la section « proximité » retombait **toujours** sur le fallback global au lieu d'afficher des profils de la même ville/pays.
- L'**auto-exclusion** (ne pas se voir soi-même dans les résultats) ne fonctionnait pas aux niveaux pays/global.

**Corrigé dans :**
- [app/dashboard-user/page.tsx](../frontend-user/app/dashboard-user/page.tsx) — lookup localisation + exclusions par `user_id`.
- [app/api/dashboard-user/proximity/route.ts](../frontend-user/app/api/dashboard-user/proximity/route.ts) — exclusions par `user_id`.

---

## 4. ⚠️ Points à traiter

### Bloquants potentiels (à valider)
- **`/reset-password`** : dossier **vide orphelin** (aucun `page.tsx`, jamais référencé). À supprimer ou à implémenter si un flux « mot de passe oublié » est prévu.

### Qualité (ESLint — non bloquant mais à nettoyer)
- **23 erreurs** `react/no-unescaped-entities` : apostrophes `'` à échapper (`&apos;`). Cosmétique mais bruyant.
- **~70 warnings `@typescript-eslint/no-explicit-any`** : typer les `any` (les types Supabase existent désormais — cf. `types/database.types.ts`).
- **Warnings `@next/next/no-img-element`** : remplacer `<img>` par `next/image` pour le LCP/bande passante.
- 1 warning `empty object type {}` à resserrer.

### À valider en QA navigateur (non testable statiquement)
- **Messagerie** temps réel : envoi/réception, indicateurs de lecture, upload image.
- **Notifications** : marquage lu, liens de redirection.
- **Paramètres** : activation/désactivation PIN, OTP, préférences notifications.
- **Portefeuille** : modération des réalisations, abonnements.
- **Géolocalisation** dashboard (GPS) après le correctif §3.
- **Responsive** réel sur mobile (profil, onboarding, annuaire) — validé en lecture, à confirmer à l'écran.

---

## 5. Recommandations (ordre)
1. Supprimer/implémenter `/reset-password`.
2. QA navigateur des pages 🟡 (messages, notifications, paramètres, portefeuille).
3. Nettoyer les erreurs ESLint (apostrophes) — quick win. ✅ **Fait** (23 → 0 erreurs).
4. Remplacer progressivement les `any` par les types `Database` et `<img>` par `next/image`. 🔄 **En cours**.

---

## 6. Audit en profondeur des pages 🟡 (2026-06-22)

Lecture détaillée de messages / notifications / paramètres / portefeuille.

### Bugs corrigés ✅
- **Notifications — erreurs de mutation silencieuses** ([hooks/use-notifications.ts](../frontend-user/hooks/use-notifications.ts)) : `markAsRead` / `markAllAsRead` / `deleteNotification` ne `throw`-aient jamais (`if (!error)`), donc le `try/catch` de la page n'affichait aucun toast en cas d'échec. → ajout de `if (error) throw error`.
- **Portefeuille — réalisation orpheline** ([realisations-section.tsx](../frontend-user/components/portefeuille-content/realisations-section.tsx)) : `profile_id: profileId ?? undefined` créait un item **sans `profile_id`** (invisible sur le profil public) si le profil n'était pas chargé. → blocage de l'upload si `profileId` est null + `profile_id: profileId`.
- **Notifications — `min-w-0` manquant** ([app/notifications/page.tsx](../frontend-user/app/notifications/page.tsx)) : ajouté sur les 2 colonnes de la grille `lg:grid-cols-12` (anti-débordement).

### Vérifié — pas de faille ✅
- **Messagerie Realtime** ([useMessagesRealtime.ts](../frontend-user/features/messages/useMessagesRealtime.ts)) : souscriptions `postgres_changes` **sans `filter`**, mais `messages` a la RLS activée (SELECT = participants uniquement) et est dans la publication `supabase_realtime` → Supabase applique la RLS aux changements → **aucune fuite cross-conversation**. Reste une inefficacité d'architecture (le consommateur doit router par conversation) — non bloquant.
- **Portefeuille** : `profile_views.profile_id` = uid auth du propriétaire (cf. RLS `auth.uid() = profile_id`) → requêtes correctes. PIN : bonne gestion d'erreurs.

### Limitations / à améliorer 🟡
- **Notifications — onglets filtrés non paginés** : l'infinite scroll ne fonctionne que sur « Tout » ; les onglets Messages/Suivis/Visites n'affichent que le set chargé (15) et leurs compteurs reflètent le set chargé, pas les totaux.
- **Notifications — pagination curseur** sur `created_at` (`.lt()`) : peut sauter des notifications de timestamp identique ; pas de souscription realtime UPDATE/DELETE (lu sur autre appareil non reflété).
- **Paramètres** : la « re-vérification simplifiée pour compte social » contourne la re-saisie du PIN pour les comptes OAuth — à valider côté produit.

### ⚠️ Régression de compilation à résoudre
Le typage `any → Database` en cours a introduit **4 erreurs TypeScript** (hors correctifs ci-dessus) à corriger pour garder la branche compilable :
`creer-profil-content.tsx` (signature `handleInputChange`), `dashboard-public-content.tsx` (type de `mapProfiles`), `profile-detail-content.tsx` (`GalleryItem` local ≠ type du hook), `hooks/use-notification-preferences.ts` (upsert `Record<string,unknown>`).

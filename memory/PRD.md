# PRD — EmiID Audit Consolidé 2026

## Contexte
Audit complet (Sécurité · Performance · UX/UI · Backend · Global) d'une codebase existante :
- Backend Node.js/Express/TypeScript + Supabase
- Frontend-user (Next.js 14)
- Frontend-admin (Next.js 16)

## Problem Statement
L'utilisateur a demandé :
1. Audit complet + corrections des bugs critiques détectés
2. Rapport Markdown **et** correctifs code
3. Priorités couvrant **toutes** les dimensions (sécurité, perf, UX, backend, global)
4. Reprendre à zéro ET se concentrer sur les bugs critiques non corrigés
5. Périmètre : backend + frontend-user + frontend-admin
6. Fixes critiques + majeurs + raisonnables
7. Ne **pas** toucher aux policies RLS Supabase (code applicatif uniquement) — _exception validée par l'utilisateur : la policy `Gallery Read Published` a été mise à jour pour filtrer sur `status='approved'` dans le cadre du P1 galerie_
8. Mode audit statique (pas de .env frontends configurés)

## Architecture
```
/app
  backend/                       # Express + TypeScript + Supabase client
  frontend-user/                 # Next.js 14, App Router
  frontend-admin/                # Next.js 16, App Router
  sql/migrations/                # Migrations SQL idempotentes
  AUDIT_CONSOLIDE_2026.md        # Rapport consolidé (livrable)
```

## Livrables
- ✅ Rapport d'audit consolidé : `/app/AUDIT_CONSOLIDE_2026.md`
- ✅ 14 correctifs appliqués dans le code (6 critiques + 5 majeurs + 3 hardening)
- ✅ Tests de non-régression : `backend/tests/audit-fixes.test.js`
- ✅ Backend TS compile (tsc --noEmit → exit 0)
- ✅ Tests smoke + audit-fixes : 8/8 OK

## Implémenté

### 2026-05 — P1 Galerie projet : modération complète
- Migration SQL `sql/migrations/add_project_gallery_status.sql` **appliquée en prod Supabase**
  - Colonnes ajoutées : `status` (CHECK pending/approved/rejected, DEFAULT pending), `reviewed_at`, `reviewed_by`, `rejection_reason`
  - Indexes : `idx_gallery_status`, `idx_gallery_status_created`
  - Rétrocompat : tous les items pré-existants marqués `approved`
  - RLS mise à jour : `Gallery Read Approved` = public ne voit que `status='approved'`
- `frontend-admin/lib/actions/admin.ts`
  - `getGalleryItems` : lit vraiment `status`, `rejection_reason`, `reviewed_at`
  - `approveGalleryItem` : UPDATE status='approved' + notif (non bloquante)
  - `rejectGalleryItem(id, reason?)` : soft-reject (UPDATE) + motif persisté + notif
  - `deleteGalleryItem(id)` : hard-delete séparé
- `frontend-admin/components/gallery-moderation-client.tsx`
  - Filtre par défaut = `pending`
  - Cartes-stats cliquables (filtrent la liste)
  - Boutons : Valider · Retirer · Rétablir · Supprimer
  - Prompts : motif de rejet + confirmation delete
  - Affichage : motif + date modération + badges
  - `data-testid` sur tous les éléments interactifs
- Tests end-to-end via service role : insert/update/delete/CHECK/RLS → 7/7 OK

### 2026-01 — Audit initial

#### Critiques fixés
- C1 `requireAdmin` : logique OR correcte (DB role / allowlist / metadata)
- C2 Rate-limit sur `/api/auth/register`
- C3 Nouveau `phoneVerifyLimiter` (défense en profondeur, OTP)
- C4 XSS JSON-LD sur page publique de profil (échappement < > U+2028 U+2029)
- C5 Guard null sur `pin_code` + création pays via `supabaseAdmin`
- C6 Sanitization PostgREST sur search admin (anti-injection `or`)

#### Majeurs fixés
- M1 Dashboard utilisateur : requêtes parallélisées (Promise.all)
- M2 Dashboard admin : weekly activity parallélisée + bug `setHours` corrigé
- M3 Emails : escape HTML senderName/preview
- M4 Webhook : guard content null
- M5 Nettoyage imports inutiles (`supabase`, `createHash`)

#### Hardening
- VAPID rotées + clé hardcoded retirée de `push-notifications.ts`

## Backlog prioritaire (pour futures itérations)

### P0 — Actions manuelles utilisateur
- Rotation manuelle restante : `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`, `SMTP_PASS` — procédure complète dans `/app/memory/SECRETS_ROTATION.md`
- Configurer `ADMIN_EMAILS` dans env backend

### P1 — Code-only restants
- ✅ ~~Colonne `status` à `project_gallery` + approve/reject~~ (2026-05)
- Vérifier RLS policies Supabase (messages, conversations, project_gallery) — partiellement fait (project_gallery OK)
- Appliquer migration `sql/migrations/create_get_network_stats.sql` (RPC optimisée, backend prêt avec fallback)
- Retirer forward `x-dev-user-*` du proxy Next.js en prod

### P2 — Qualité / dette
- Archiver/supprimer les 7 anciens rapports redondants
- Migrer l'envoi de message côté client vers le backend (harmoniser validation)
- Logger JSON structuré backend
- Étoffer la suite de tests backend

## Test credentials
N/A — aucune credential applicative créée ou modifiée.
Auth Supabase : 10 users en base (gérés via Supabase Auth directement, pas de seed applicatif).

## Données live (snapshot 2026-05)
- 10 users auth, 10 user_profiles (tous reliés)
- 12 tags, 6 profile_tags, 9 jobs, 0 industries (vide)
- 2 user_follows, 4 conversations, 15 messages
- 14 countries, 1 notification
- 1 project_gallery item (status=approved après migration)
- 0 phone_verifications, 0 push_subscriptions

## Statut global
**Audit livré + P1 galerie complet en prod.** Backend compile, tests smoke OK, tests de non-régression OK, flow galerie modération validé end-to-end sur Supabase live.

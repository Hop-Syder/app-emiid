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
7. Ne **pas** toucher aux policies RLS Supabase (code applicatif uniquement)
8. Mode audit statique (pas de .env frontends configurés)

## Architecture
```
/app
  backend/         # Express + TypeScript + Supabase client
  frontend-user/   # Next.js 14, App Router
  frontend-admin/  # Next.js 16, App Router
  AUDIT_CONSOLIDE_2026.md  # Rapport consolidé (livrable)
```

## Livrables
- ✅ Rapport d'audit consolidé : `/app/AUDIT_CONSOLIDE_2026.md`
- ✅ 14 correctifs appliqués dans le code (6 critiques + 5 majeurs + 3 hardening)
- ✅ Tests de non-régression : `backend/tests/audit-fixes.test.js`
- ✅ Backend TS compile (tsc --noEmit → exit 0)
- ✅ Tests smoke + audit-fixes : 8/8 OK

## Implémenté (2026-01)

### Critiques fixés
- C1 `requireAdmin` : logique OR correcte (DB role / allowlist / metadata)
- C2 Rate-limit sur `/api/auth/register`
- C3 Nouveau `phoneVerifyLimiter` (défense en profondeur, OTP)
- C4 XSS JSON-LD sur page publique de profil (échappement < > U+2028 U+2029)
- C5 Guard null sur `pin_code` + création pays via `supabaseAdmin`
- C6 Sanitization PostgREST sur search admin (anti-injection `or`)

### Majeurs fixés
- M1 Dashboard utilisateur : requêtes parallélisées (Promise.all)
- M2 Dashboard admin : weekly activity parallélisée + bug `setHours` corrigé
- M3 Emails : escape HTML senderName/preview
- M4 Webhook : guard content null
- M5 Nettoyage imports inutiles (`supabase`, `createHash`)

## Backlog prioritaire (pour futures itérations)
- ✅ VAPID rotées (2026-01) + clé hardcoded retirée de `push-notifications.ts`
- **P0** Rotation manuelle restante : `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`, `SMTP_PASS` — procédure complète dans `/app/memory/SECRETS_ROTATION.md`
- **P0** Configurer `ADMIN_EMAILS` dans env backend
- **P1** Vérifier RLS policies Supabase (messages, conversations, project_gallery)
- **P1** Ajouter colonne `status` à `project_gallery` + MAJ approve/reject
- **P1** Retirer forward `x-dev-user-*` du proxy Next.js en prod
- **P2** Archiver/supprimer les 7 anciens rapports redondants
- **P2** Migrer l'envoi de message côté client vers le backend (harmoniser validation)
- **P2** Logger JSON structuré backend
- **P2** Étoffer la suite de tests backend

## Test credentials
N/A (aucune credential créée ou modifiée dans cette itération — audit + fix code only).

## Statut global
**Audit livré**. Backend compile, tests smoke OK, tests de non-régression OK.

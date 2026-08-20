# Monétisation EmiID — implémentation Supabase

> Décision : implémenté **en Supabase** (tables SQL + RLS + RPC), **pas en Prisma**.
> Le `schema.prisma` du document de cadrage sert de *blueprint* de référence.

## Phasage

| Phase | Périmètre | État |
|-------|-----------|------|
| **1** | Abonnement **Pro** + priorité recherche + **paiement** + analytics profil | 🟡 DB prête |
| 2 | **Boosts** géolocalisés (communal d'abord) + table `communes` | ⏳ à venir |
| 3 | **B2B Teams / NFC / ONG** | ⏳ sur demande/contrats |

---

## Phase 1 — modèle de données (`sql/migrations/20260823_monetization_phase1.sql`)

- **`subscriptions`** — une ligne/utilisateur. Source de vérité du forfait (`FREE` /
  `PRO_MONTHLY` / `PRO_ANNUAL` / `B2B`), statut, `end_date`, `auto_renew`.
- **`payment_transactions`** — traçabilité Mobile Money. `provider_ref` **unique**
  (idempotence webhook), `type` (`SUBSCRIPTION_PRO` / `PROFILE_BOOST`), `status`,
  `metadata` JSONB. Montants **entiers FCFA** (devise `XOF`).
- **`profile_analytics`** — compteurs `views` / `whatsapp` / `call` / `share`.

### Automatismes livrés
- **`is_premium` dérivé** : trigger `sync_is_premium` → met `user_profiles.is_premium`
  à jour dès qu'un abonnement Pro devient/cesse d'être actif. **Le classement de
  recherche lit déjà `is_premium`** (Score 2 « Pro Vérifié ») → rien à recâbler.
- **`expire_subscriptions()`** : passe les abonnements échus en `EXPIRED`
  (à planifier via **pg_cron** ou un endpoint quotidien).
- **`increment_profile_metric(profile_id, metric)`** : RPC `SECURITY DEFINER`
  (appelable par `anon`) pour tracker vues/clics **sans** droit d'écriture direct.

### Sécurité (RLS)
- Chaque table : **lecture de ses propres lignes uniquement**.
- **Aucune écriture côté client** : abonnements/paiements écrits par le **service
  role** (webhook) ; analytics via la **RPC** whitelistée.

---

## Reste à faire (Phase 1)

### a. Paiement — webhook + checkout
- **Décision requise** : fournisseur **FedaPay** ou **KKiaPay** (ou les deux).
- Backend :
  - `POST /api/payments/checkout` → crée une `payment_transaction` `PENDING`,
    initialise le paiement, renvoie l'URL/token.
  - `POST /api/payments/webhook` → **vérifie la signature**, retrouve la transaction
    par `provider_ref`, passe en `SUCCESS` **de façon idempotente**, puis **active
    l'abonnement** (upsert `subscriptions` : tier + `end_date = now()+1 mois/an`).
- Clés API en **variables d'environnement** (jamais commitées).

### b. UI Dashboard
- `/dashboard/subscription` : forfait actuel, échéance, bouton « Passer Pro »
  (Mobile Money), badge « Pro Vérifié ».
- `/dashboard/analytics` : vues, clics WhatsApp, appels (lecture `profile_analytics`).
- Carte annuaire : liseré bleu `#013ff4` + badge Pro (déjà géré via `is_premium`).

### c. Tracking
- Sur la vitrine profil : appeler `increment_profile_metric` à l'affichage (vue)
  et sur clic WhatsApp/Appel/Partage.

---

## Priorité recherche (déjà en place)
Le classement `Score 4→1` du cadrage se branche sur l'existant :
`Score 2 (Pro Vérifié)` et `Score 1 (Standard)` **fonctionnent déjà** (bonus
`is_premium`/`is_verified` + FTS pondéré). Les `Score 4/3` (boosts) arrivent en
Phase 2 via une table `profile_boosts` + un signal au-dessus du premium.

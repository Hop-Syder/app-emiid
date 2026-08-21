# Monétisation EmiID — implémentation Supabase

> Décision : implémenté **en Supabase** (tables SQL + RLS + RPC), **pas en Prisma**.
> Le `schema.prisma` du document de cadrage sert de *blueprint* de référence.

## Phasage

| Phase | Périmètre | État |
|-------|-----------|------|
| **1** | Abonnement **Pro** + priorité recherche + **paiement** + analytics profil | ✅ livré |
| 2 | **Boosts** communaux + référentiel territorial | 🟡 DB + paiement livrés, UI à venir |
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

### a. Paiement FedaPay — ✅ livré (backend)
- Fournisseur retenu : **FedaPay**. Forfaits : **PRO_MONTHLY (1 000 F / 1 mois)**,
  **PRO_ANNUAL (10 000 F / 12 mois)**.
- `backend/src/services/fedapay.ts` : création de transaction, token de paiement,
  **vérification de signature** du webhook (HMAC-SHA256, comparaison constante).
- `backend/src/controllers/paymentController.ts` :
  - `POST /api/payments/checkout` (authentifié) → `payment_transaction` `PENDING`
    → transaction FedaPay → renvoie `{ transactionId, token, url }`.
  - `POST /api/payments/webhook` (raw body) → signature vérifiée → `SUCCESS`
    **idempotent** (via `provider_ref`) → **active/prolonge** l'abonnement.
- Câblé dans `app.ts` (webhook monté **avant** le parser JSON pour le corps brut).

**Variables d'environnement backend (Render)** — cf. `render.yaml` :

| Variable | Rôle |
|----------|------|
| `FEDAPAY_SECRET_KEY` | Clé secrète FedaPay (`sk_sandbox_…` puis `sk_live_…`) |
| `FEDAPAY_WEBHOOK_SECRET` | Secret de signature des webhooks |
| `FEDAPAY_BASE_URL` | déf. `https://sandbox-api.fedapay.com/v1` → live en prod |
| `APP_PUBLIC_URL` (ou `APP_URL`) | URL de retour après paiement |

> Webhook à déclarer côté FedaPay : `https://<backend>/api/payments/webhook`.
> Tester d'abord en **sandbox**. Aucune clé n'est commitée.

### b. UI — ✅ livré
Intégrée dans **Paramètres → onglet « Abonnement »** (`components/parametre-content/plan-section.tsx`),
pas dans une route parallèle : l'onglet existait déjà.
- Offre active réelle (tier + échéance) via `hooks/use-subscription.ts`.
- Deux forfaits (mensuel / annuel, « 2 mois offerts ») → `POST /api/payments/checkout`
  puis redirection FedaPay. L'ancien faux paiement (`setTimeout` + URL fictive
  `checkout.emiid.com`) est supprimé.
- Bloc « Performance du profil » : vues, clics WhatsApp, appels, partages.

### c. Tracking — ✅ complet
| Métrique | Source | État |
|----------|--------|------|
| **Vues** | table `profile_views` (append-only, anti-auto-vue, alimentée par `use-profile-data`) | ✅ |
| **Clics WhatsApp** | bouton vert de la vitrine → `trackProfileMetric(id, 'whatsapp')` | ✅ |
| **Clics Appel** | bouton `tel:` de la vitrine → `trackProfileMetric(id, 'call')` | ✅ |
| **Partages** | `share-modal` (WhatsApp / LinkedIn / X) | ✅ |

Les **actions 1-clic** de la spec (§2.A) sont en place dans la carte Coordonnées :
WhatsApp (vert `#059669`, message pré-rempli) et Appel direct (`#0F172A`).
Les numéros sont normalisés au format international (indicatif Bénin `229`
appliqué par défaut ; un numéro déjà préfixé `+` est conservé tel quel).

> Les vues NE passent PAS par `profile_analytics.views_count` (colonne laissée
> inutilisée) pour éviter un compteur en double avec `profile_views`.

## Administration (back-office)

`user_profiles.is_premium` étant **dérivé** de `subscriptions` via le trigger
`sync_is_premium`, le back-office ne l'écrit jamais directement :

- **Accorder Pro** → upsert d'un abonnement `PRO_MONTHLY` sans échéance
  (`end_date = null`) ; **Révoquer** → statut `CANCELLED`. Le trigger recalcule
  `is_premium`. Les deux actions sont tracées dans `admin_audit_log`
  (`subscription.grant_pro` / `subscription.revoke_pro`).
- La fiche utilisateur affiche l'**abonnement courant** (tier, statut, échéance)
  et les **5 dernières transactions** avec leur statut.

## Priorité recherche (déjà en place)
Le classement `Score 4→1` du cadrage se branche sur l'existant :
`Score 2 (Pro Vérifié)` et `Score 1 (Standard)` **fonctionnent déjà** (bonus
`is_premium`/`is_verified` + FTS pondéré). Les `Score 4/3` (boosts) arrivent en
Phase 2 via une table `profile_boosts` + un signal au-dessus du premium.

---

## Phase 2 — Boosts communaux (`sql/migrations/20260824_boosts_phase2.sql`)

### Référentiel territorial (prérequis)
`user_profiles` ne portait que `city` / `district` en **texte libre** : « Cotonou »,
« cotonou » et « COTONOU » ne se rapprochaient pas, rendant tout ciblage impossible.

- **`departments`** (12) et **`communes`** (77) du Bénin, seedées par la migration.
- **`normalize_place(text)`** : clé de rapprochement (sans accents, minuscules,
  séparateurs retirés). Indexée sur `communes`.
- **`user_profiles.commune_id`** + **rattachement automatique** des profils
  existants par nom normalisé. Les villes non reconnues restent `NULL` : le profil
  reste visible, simplement non ciblable tant que sa commune n'est pas choisie.
- **`resolve_commune_id(label)`** : résout le filtre ville de l'annuaire
  (« porto novo » → Porto-Novo).

### Boosts
- **`profile_boosts`** : portée `COMMUNE` (colonne `DEPARTMENT` prévue, non
  exploitée), fenêtre `starts_at` / `expires_at`, `status`, `price_paid`,
  `transaction_id` unique. Contrainte : la cible doit correspondre à la portée.
- **`active_boosted_profile_ids(commune_id)`** : profils boostés actifs d'une
  commune. **L'expiration est évaluée à la lecture** — aucun cron indispensable.
- **`expire_boosts()`** : clôture des boosts échus (à planifier, comme
  `expire_subscriptions()`).
- RLS : chacun lit ses propres boosts ; l'exposition publique passe uniquement
  par la fonction `SECURITY DEFINER`. Référentiel lisible par tous.

### Classement (Score 4 du cadrage)
Dans `app/api/annuaire/route.ts`, quand la recherche cible une ville :
`score = pertinence × (1 + 1,20·boost + 0,30·premium + 0,15·vérifié)`.

Le boost reste **multiplicatif** : un profil boosté hors-sujet (pertinence nulle)
n'est pas remonté — on n'affiche pas un couturier quand on cherche un électricien.
Départage : boost → premium → vérifié → abonnés → récence. Hors recherche, les
profils boostés de la commune passent en tête.

### Tarifs et paiement
| Forfait | Durée | Prix |
|---------|-------|------|
| `COMMUNE_48H` | 48 h | 500 FCFA |
| `COMMUNE_7D` | 7 jours | 1 200 FCFA |
| `COMMUNE_30D` | 30 jours | 4 000 FCFA |

`POST /api/payments/boost/checkout` (authentifié) crée la transaction **et** un
boost `PENDING` ; le webhook l'active à la confirmation. **La durée achetée court
à partir du paiement**, pas de la création — un paiement tardif ne consomme pas
le forfait. Activation idempotente ; échec/annulation ⇒ boost `CANCELLED`.

### Reste à faire
- **UI** : sélecteur de commune + achat de boost (onglet Paramètres), et
  affichage du liseré doré « En vedette » sur la carte annuaire (spec §2.A).
- Boost **départemental** (Score 3) : structure déjà prête.

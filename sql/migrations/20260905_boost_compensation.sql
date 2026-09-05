/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Prolongation compensatoire des boosts restés sans effet.
 *
 *   ── Pourquoi ────────────────────────────────────────────────────────────
 *   De la mise en service des boosts (24/08/2026) jusqu'au correctif
 *   20260905_fix_boost_profile_join.sql, active_boosted_profile_ids() joignait
 *   deux identifiants incomparables et renvoyait toujours zéro ligne : AUCUN
 *   profil boosté n'a jamais été mis en avant. Le service facturé n'a pas été
 *   rendu. Ce script rend aux clients le temps qu'ils ont perdu.
 *
 *   ── Ce qu'il fait ───────────────────────────────────────────────────────
 *   Pour chaque boost payé, il calcule le temps écoulé pendant la panne, puis :
 *     • boost ENCORE ACTIF   → son expiration recule d'autant ;
 *     • boost DÉJÀ EXPIRÉ    → il repart maintenant, pour la durée perdue
 *                              (étape 4, volontairement séparée et optionnelle).
 *
 *   ── Garde-fous ──────────────────────────────────────────────────────────
 *   Ce script écrit sur des données liées à des paiements. Trois protections :
 *     1. IDEMPOTENCE — chaque compensation est journalisée dans
 *        `boost_compensations`, dont la contrainte UNIQUE(boost_id) empêche
 *        toute seconde prolongation, même si le script est rejoué.
 *     2. TRAÇABILITÉ — le journal conserve l'ancienne et la nouvelle échéance,
 *        la durée accordée et le motif : la décision reste auditable.
 *     3. INSPECTION D'ABORD — l'étape 2 ne modifie rien et chiffre ce qui sera
 *        accordé. À lire AVANT de lancer les étapes 3 et 4.
 *
 *   Les boosts PENDING (paiement jamais confirmé) et CANCELLED sont exclus :
 *   ils n'ont rien été facturé, il n'y a rien à compenser.
 *
 *   ── Mode d'emploi ───────────────────────────────────────────────────────
 *     1. Jouer d'abord 20260905_fix_boost_profile_join.sql (sinon on prolonge
 *        un service toujours cassé).
 *     2. Exécuter les étapes 1 et 2, LIRE le tableau d'inspection.
 *     3. Si le résultat convient, exécuter l'étape 3 (boosts actifs).
 *     4. L'étape 4 (boosts expirés) est un choix commercial : elle est
 *        commentée par défaut. La décommenter pour l'appliquer.
 *
 *   Ajuster `p_outage_end` si le correctif a été déployé à une autre date que
 *   le moment où vous lancez ce script.
 * @created 2026-09-05
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

-- ─── ÉTAPE 1 · Journal des compensations (idempotence + audit) ─────────────
CREATE TABLE IF NOT EXISTS public.boost_compensations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- UNIQUE : le cœur de l'idempotence. Un boost ne peut être compensé qu'une fois.
  boost_id           uuid NOT NULL UNIQUE REFERENCES public.profile_boosts(id) ON DELETE CASCADE,
  granted_at         timestamptz NOT NULL DEFAULT now(),
  lost_duration      interval    NOT NULL,
  previous_expires_at timestamptz NOT NULL,
  new_expires_at     timestamptz NOT NULL,
  previous_status    public.boost_status NOT NULL,
  reason             text NOT NULL DEFAULT 'Boost sans effet : active_boosted_profile_ids() ne remontait aucun profil (24/08 → correctif 20260905).'
);

COMMENT ON TABLE public.boost_compensations IS
  'Journal des prolongations accordées après la panne des boosts. Une ligne par boost, jamais deux.';

ALTER TABLE public.boost_compensations ENABLE ROW LEVEL SECURITY;
-- Aucune policy : table d'administration, lisible via service_role uniquement.

-- ─── ÉTAPE 2 · INSPECTION (ne modifie rien — à lire avant d'aller plus loin) ─
WITH params AS (
  SELECT
    -- Mise en service des boosts : rien n'a jamais fonctionné avant.
    timestamptz '2026-08-24 00:00:00+00' AS outage_start,
    -- Fin de la panne = déploiement du correctif. Ajuster si nécessaire.
    now()                                AS outage_end
),
affected AS (
  SELECT
    b.id,
    b.profile_id,
    b.scope,
    b.status,
    b.price_paid,
    b.starts_at,
    b.expires_at,
    -- Temps du boost tombé dans la fenêtre de panne, jamais négatif.
    GREATEST(
      interval '0',
      LEAST(b.expires_at, p.outage_end) - GREATEST(b.starts_at, p.outage_start)
    ) AS lost_duration
  FROM public.profile_boosts b
  CROSS JOIN params p
  WHERE b.status IN ('ACTIVE', 'EXPIRED')       -- payés ; PENDING/CANCELLED exclus
    AND b.starts_at < p.outage_end
    AND NOT EXISTS (                             -- déjà compensés : ignorés
      SELECT 1 FROM public.boost_compensations c WHERE c.boost_id = b.id
    )
)
SELECT
  status                                   AS statut,
  count(*)                                 AS boosts,
  count(DISTINCT profile_id)               AS clients,
  sum(price_paid)                          AS total_fcfa,
  round(avg(extract(epoch FROM lost_duration) / 3600)::numeric, 1) AS heures_perdues_moy,
  round(sum(extract(epoch FROM lost_duration) / 3600)::numeric, 1) AS heures_perdues_total
FROM affected
WHERE lost_duration > interval '0'
GROUP BY ROLLUP (status)
ORDER BY status NULLS LAST;

-- ─── ÉTAPE 3 · Prolonger les boosts ENCORE ACTIFS ──────────────────────────
--     Leur échéance recule du temps perdu. Le client garde exactement la durée
--     de visibilité qu'il a payée.
WITH params AS (
  SELECT timestamptz '2026-08-24 00:00:00+00' AS outage_start, now() AS outage_end
),
target AS (
  SELECT
    b.id, b.expires_at, b.status,
    GREATEST(interval '0',
      LEAST(b.expires_at, p.outage_end) - GREATEST(b.starts_at, p.outage_start)
    ) AS lost_duration
  FROM public.profile_boosts b
  CROSS JOIN params p
  WHERE b.status = 'ACTIVE'
    AND b.starts_at < p.outage_end
    AND NOT EXISTS (SELECT 1 FROM public.boost_compensations c WHERE c.boost_id = b.id)
),
eligible AS (
  SELECT * FROM target WHERE lost_duration > interval '0'
),
updated AS (
  UPDATE public.profile_boosts b
     SET expires_at = b.expires_at + e.lost_duration,
         updated_at = now()
    FROM eligible e
   WHERE b.id = e.id
  RETURNING b.id, e.lost_duration, e.expires_at AS previous_expires_at,
            b.expires_at AS new_expires_at, e.status AS previous_status
)
INSERT INTO public.boost_compensations
  (boost_id, lost_duration, previous_expires_at, new_expires_at, previous_status)
SELECT id, lost_duration, previous_expires_at, new_expires_at, previous_status
FROM updated;

-- ─── ÉTAPE 4 · Boosts DÉJÀ EXPIRÉS — décision commerciale ──────────────────
--     Ces clients n'ont RIEN reçu : toute leur période est passée sans effet.
--     Les relancer maintenant pour la durée perdue est le geste équitable, mais
--     c'est un choix qui vous appartient : leur mise en avant arrivera plus tard
--     que prévu, et vous pouvez préférer un remboursement ou un geste commercial.
--
--     Décommenter le bloc pour l'appliquer.
--
-- WITH params AS (
--   SELECT timestamptz '2026-08-24 00:00:00+00' AS outage_start, now() AS outage_end
-- ),
-- eligible AS (
--   SELECT b.id, b.expires_at, b.status,
--     GREATEST(interval '0',
--       LEAST(b.expires_at, p.outage_end) - GREATEST(b.starts_at, p.outage_start)
--     ) AS lost_duration
--   FROM public.profile_boosts b
--   CROSS JOIN params p
--   WHERE b.status = 'EXPIRED'
--     AND b.starts_at < p.outage_end
--     AND NOT EXISTS (SELECT 1 FROM public.boost_compensations c WHERE c.boost_id = b.id)
-- ),
-- updated AS (
--   UPDATE public.profile_boosts b
--      SET status     = 'ACTIVE',
--          starts_at  = now(),
--          expires_at = now() + e.lost_duration,
--          updated_at = now()
--     FROM eligible e
--    WHERE b.id = e.id AND e.lost_duration > interval '0'
--   RETURNING b.id, e.lost_duration, e.expires_at AS previous_expires_at,
--             b.expires_at AS new_expires_at, e.status AS previous_status
-- )
-- INSERT INTO public.boost_compensations
--   (boost_id, lost_duration, previous_expires_at, new_expires_at, previous_status)
-- SELECT id, lost_duration, previous_expires_at, new_expires_at, previous_status
-- FROM updated;

-- ─── Contrôle final : ce qui a été accordé ─────────────────────────────────
SELECT
  count(*)                                                        AS compensations,
  round(sum(extract(epoch FROM lost_duration) / 3600)::numeric, 1) AS heures_rendues
FROM public.boost_compensations;

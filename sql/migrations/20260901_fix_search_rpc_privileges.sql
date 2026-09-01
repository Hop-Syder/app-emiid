/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Correctif BLOQUANT : la recherche de l'annuaire renvoyait
 *              systématiquement zéro profil depuis le 29-30/08/2026.
 *
 *   ── Cause racine ────────────────────────────────────────────────────────
 *   Les deux RPC de recherche sont déclarées `LANGUAGE sql STABLE`, donc en
 *   SECURITY INVOKER : elles s'exécutent avec les privilèges de l'appelant
 *   (anon / authenticated). Or elles lisent deux colonnes de user_profiles
 *   qui ne sont accordées à AUCUN de ces deux rôles :
 *     • search_profile_ids()      → user_profiles.search_vector
 *     • match_profiles_semantic() → user_profiles.embedding
 *
 *   Ces privilèges ont été retirés par le durcissement légitime des 29 et 30
 *   août, qui a remplacé un GRANT SELECT au niveau TABLE par des GRANT au
 *   niveau COLONNE :
 *     • 20260829_gate_contact_by_auth      → REVOKE SELECT … FROM anon
 *     • 20260830_fix_user_profiles_exposure→ REVOKE SELECT … FROM authenticated
 *                                            + REVOKE (…, search_vector) des deux rôles
 *     • 20260830_fix_public_profiles_rls_permission → re-GRANT colonne par colonne
 *   Aucune des listes de re-GRANT ne réintègre search_vector ni embedding —
 *   volontairement, ce sont des colonnes dérivées qu'un client ne doit pas lire.
 *
 *   Conséquence exacte : les deux RPC lèvent 42501 « permission denied for
 *   column … ». La route /api/annuaire journalise l'erreur, obtient deux listes
 *   vides, et son garde-fou `if (fused.size === 0) return { profiles: [], count: 0 }`
 *   transforme un incident de privilèges en « aucun résultat ». L'annuaire sans
 *   recherche continuait de fonctionner car il lit la vue public_profiles.
 *
 *   ── Correctif ───────────────────────────────────────────────────────────
 *   Aligner ces deux fonctions sur la convention DÉJÀ appliquée à toutes les
 *   autres RPC du projet qui touchent user_profiles — search_profiles_by_proximity(),
 *   active_boosted_profile_ids(), active_boosted_profile_ids_v2() sont toutes
 *   SECURITY DEFINER. Les deux fonctions de recherche étaient les seules
 *   restées en INVOKER : c'est l'incohérence à l'origine de la panne.
 *
 *   SECURITY DEFINER est sûr ici, et strictement plus sûr qu'un re-GRANT :
 *     • la surface de sortie se limite à (profile_id uuid, score) — aucune PII,
 *       ni search_vector, ni embedding ne quittent la base ;
 *     • le filtre `is_published = true` reste appliqué dans chaque branche ;
 *     • search_path est figé (cf. durcissement M3 du 21/06), ce qui interdit
 *       le détournement par shadowing d'objets.
 *   Aucun privilège n'est rendu à anon/authenticated : la fermeture des fuites
 *   pin_code / email / phone des 29-30/08 reste intacte.
 *
 *   Corps des fonctions inchangés (repris à l'identique de
 *   20260828_search_natural_language.sql et 20260821_semantic_search.sql) :
 *   seul le mode d'exécution change. Idempotent.
 * @created 2026-09-01
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

-- ─── ① Recherche lexicale (FTS français + trigram + tags) ───────────────────
CREATE OR REPLACE FUNCTION public.search_profile_ids(q text, max_results int DEFAULT 200)
RETURNS TABLE(profile_id uuid, rank real)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH cleaned AS (
    -- Formulations de requête, pas des critères : on les retire avant analyse.
    SELECT NULLIF(trim(regexp_replace(
      regexp_replace(lower(coalesce(q, '')),
        '\y(je|j''|jai|recherche|rechercher|cherche|chercher|chercherais|veux|voudrais|souhaite|besoin|faut|trouve|trouver|quelqu''un|quelqun|serait|urgent|urgente|svp|stp|s''il|sil|vous|plait|plaît|merci|bonjour|salut|moi|mon|ma|mes|nous|pour|avec|dans|chez|vers|aupres|aupr[eè]s|autour|pres|pr[eè]s)\y',
        ' ', 'g'),
      '\s+', ' ', 'g')), '') AS txt
  ),
  base AS (
    -- Si le nettoyage a tout supprimé, on repart de la saisie d'origine.
    SELECT coalesce((SELECT txt FROM cleaned), q) AS txt
  ),
  tsq AS (
    SELECT
      websearch_to_tsquery('french', (SELECT txt FROM base)) AS q_and,
      -- Variante permissive : le ET devient un OU.
      NULLIF(replace(websearch_to_tsquery('french', (SELECT txt FROM base))::text, '&', '|'), '')::tsquery AS q_or
  ),
  fts AS (
    SELECT p.id AS profile_id,
           CASE
             WHEN p.search_vector @@ (SELECT q_and FROM tsq)
               THEN 0.60 + ts_rank(p.search_vector, (SELECT q_and FROM tsq))
             ELSE 0.25 + 0.5 * ts_rank(p.search_vector, (SELECT q_or FROM tsq))
           END AS r
    FROM public.user_profiles p
    WHERE p.is_published = true
      AND (
        p.search_vector @@ (SELECT q_and FROM tsq)
        OR p.search_vector @@ (SELECT q_or FROM tsq)
      )
  ),
  tagm AS (
    SELECT pt.profile_id, 0.20::real AS r
    FROM public.profile_tags pt
    JOIN public.tags t ON t.id = pt.tag_id
    JOIN public.user_profiles p ON p.id = pt.profile_id AND p.is_published = true
    WHERE t.name ILIKE '%' || (SELECT txt FROM base) || '%'
  ),
  fuzzy AS (
    SELECT p.id AS profile_id,
           GREATEST(
             similarity(coalesce(p.role, '') || ' ' || coalesce(p.specialty, ''), (SELECT txt FROM base)),
             similarity(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, ''), (SELECT txt FROM base)),
             0.6 * similarity(coalesce(p.city, ''), (SELECT txt FROM base))
           ) AS r
    FROM public.user_profiles p
    WHERE p.is_published = true
      AND (
        p.role % (SELECT txt FROM base) OR p.specialty % (SELECT txt FROM base)
        OR (coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')) % (SELECT txt FROM base)
        OR p.city % (SELECT txt FROM base)
      )
  ),
  agg AS (
    SELECT u.profile_id,
           MAX(u.r) FILTER (WHERE u.src = 'fts')   AS fts_r,
           MAX(u.r) FILTER (WHERE u.src = 'tag')   AS tag_r,
           MAX(u.r) FILTER (WHERE u.src = 'fuzzy') AS fuzzy_r
    FROM (
      SELECT profile_id, r, 'fts'::text   AS src FROM fts
      UNION ALL SELECT profile_id, r, 'tag'   FROM tagm
      UNION ALL SELECT profile_id, r, 'fuzzy' FROM fuzzy
    ) u
    GROUP BY u.profile_id
  )
  SELECT a.profile_id,
         (CASE
            WHEN a.fts_r IS NOT NULL OR a.tag_r IS NOT NULL
              THEN 1.0 + coalesce(a.fts_r, 0) + coalesce(a.tag_r, 0)
            ELSE 0.5 * coalesce(a.fuzzy_r, 0)
          END)::real AS rank
  FROM agg a
  ORDER BY rank DESC
  LIMIT max_results;
$$;

-- ─── ② Recherche sémantique (embeddings 768d) ──────────────────────────────
CREATE OR REPLACE FUNCTION public.match_profiles_semantic(
  query_embedding vector(768),
  match_count     int   DEFAULT 50,
  min_similarity  float DEFAULT 0.30
)
RETURNS TABLE(profile_id uuid, similarity real)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT p.id AS profile_id,
         (1 - (p.embedding <=> query_embedding))::real AS similarity
  FROM public.user_profiles p
  WHERE p.is_published = true
    AND p.embedding IS NOT NULL
    AND (1 - (p.embedding <=> query_embedding)) > min_similarity
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ─── Droits d'exécution (inchangés — rappelés pour l'idempotence) ──────────
GRANT EXECUTE ON FUNCTION public.search_profile_ids(text, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_profiles_semantic(vector, int, float) TO anon, authenticated;

-- ─── Recharger le cache de schéma PostgREST ────────────────────────────────
NOTIFY pgrst, 'reload schema';

SELECT '✅ Recherche annuaire réparée : search_profile_ids() et match_profiles_semantic() passent en SECURITY DEFINER (search_path figé). Aucun privilège rendu à anon/authenticated.' AS status;

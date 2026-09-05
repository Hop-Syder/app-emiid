/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Index de tri pour le listing de l'annuaire.
 *
 *   ── Le problème ─────────────────────────────────────────────────────────
 *   /api/annuaire ordonne TOUJOURS le listing par
 *       is_premium DESC, is_verified DESC, created_at DESC
 *   et demande un `count: 'exact'`. Aucun index ne couvrait cet ordre : à
 *   chaque changement de filtre, PostgreSQL parcourait tous les profils
 *   publiés, les triait entièrement, puis les comptait — avant de n'en rendre
 *   que trente. Le coût grandit avec le nombre de profils, pas avec la page
 *   demandée : la page 1 est aussi chère que la dernière.
 *
 *   ── Le correctif ────────────────────────────────────────────────────────
 *   Un index partiel sur les seuls profils visibles, dans l'ordre exact du
 *   tri. PostgreSQL peut alors lire les trente premières lignes dans l'ordre
 *   et s'arrêter, au lieu de tout trier.
 *
 *   Partiel (`WHERE is_published AND NOT is_suspended`) : il ne contient que
 *   les lignes que la vue public_profiles laisse passer. Plus petit, donc plus
 *   souvent en cache — et applicable puisque la vue applique exactement ce
 *   prédicat.
 *
 *   ── Vérifier l'effet ────────────────────────────────────────────────────
 *     EXPLAIN (ANALYZE, BUFFERS)
 *     SELECT id FROM public.public_profiles
 *     ORDER BY is_premium DESC, is_verified DESC, created_at DESC
 *     LIMIT 30;
 *   Avant : « Sort » + « Seq Scan ». Après : « Index Scan using
 *   idx_user_profiles_listing », sans nœud Sort.
 *
 *   CONCURRENTLY : la construction ne bloque ni les lectures ni les écritures.
 *   À exécuter SEUL, hors transaction — l'éditeur SQL de Supabase convient.
 *
 *   Idempotent.
 * @created 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_listing
  ON public.user_profiles (is_premium DESC, is_verified DESC, created_at DESC)
  WHERE is_published = TRUE AND COALESCE(is_suspended, FALSE) = FALSE;

COMMENT ON INDEX public.idx_user_profiles_listing IS
  'Tri par défaut de l''annuaire (premium → vérifié → récence) sur les seuls profils visibles.';

-- Rafraîchit les statistiques du planificateur pour qu'il adopte l'index
-- immédiatement, sans attendre le prochain autovacuum.
ANALYZE public.user_profiles;

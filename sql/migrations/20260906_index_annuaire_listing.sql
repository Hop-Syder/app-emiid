/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Index de tri pour le listing de l'annuaire.
 *
 *   ⚠️  NE PAS JOUER POUR L'INSTANT — mesuré sur la base réelle le 06/09.
 *   Le projet compte 19 profils visibles (33 en base). La requête de listing
 *   s'y exécute en 0,241 ms, la planification en coûtant 2,862 ms à elle
 *   seule : la base n'est pas le facteur limitant, et cet index n'apporterait
 *   qu'un coût d'écriture supplémentaire. Supabase signale d'ailleurs déjà 29
 *   index inutilisés et 4 doublons sur ce projet.
 *
 *   La lenteur ressentie vient d'ailleurs : les fonctions Vercel (plan Hobby,
 *   région unique, us-east par défaut) dialoguent avec une base à Paris —
 *   ~100 ms par aller-retour, contre 0,24 ms de calcul.
 *
 *   Ce fichier reste valable et vérifié ; le jouer le jour où la table
 *   dépassera quelques milliers de profils publiés. Le gain mesuré sur un jeu
 *   de 50 000 profils était alors de 17,5 ms → 0,21 ms.
 *
 *   ── Le problème (à l'échelle où il se pose) ─────────────────────────────
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
 *   ── Verrou pris ─────────────────────────────────────────────────────────
 *   CREATE INDEX (sans CONCURRENTLY) prend un verrou SHARE sur user_profiles :
 *   les LECTURES continuent, les ÉCRITURES attendent la fin de la
 *   construction. Sur une table de cette taille, c'est une fraction de
 *   seconde — un utilisateur qui enregistrerait son profil pile à cet instant
 *   ne verrait rien.
 *
 *   La variante CONCURRENTLY, qui ne bloque pas les écritures, ne peut PAS
 *   être lancée depuis l'éditeur SQL de Supabase : celui-ci enveloppe chaque
 *   exécution dans une transaction, et PostgreSQL refuse
 *   (« 25001: CREATE INDEX CONCURRENTLY cannot run inside a transaction
 *   block »). Elle reste possible plus tard, par connexion directe (psql), si
 *   la table devient assez grosse pour que l'attente se remarque — la
 *   commande est donnée en fin de fichier.
 *
 *   ── Vérifier l'effet ────────────────────────────────────────────────────
 *     EXPLAIN (ANALYZE, BUFFERS)
 *     SELECT id FROM public.public_profiles
 *     ORDER BY is_premium DESC, is_verified DESC, created_at DESC
 *     LIMIT 30;
 *   Avant : « Sort » + « Seq Scan ». Après : « Index Scan using
 *   idx_user_profiles_listing », sans nœud Sort.
 *
 *   Idempotent.
 * @created 2026-09-06
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_user_profiles_listing
  ON public.user_profiles (is_premium DESC, is_verified DESC, created_at DESC)
  WHERE is_published = TRUE AND COALESCE(is_suspended, FALSE) = FALSE;

COMMENT ON INDEX public.idx_user_profiles_listing IS
  'Tri par défaut de l''annuaire (premium → vérifié → récence) sur les seuls profils visibles.';

-- Rafraîchit les statistiques du planificateur pour qu'il adopte l'index
-- immédiatement, sans attendre le prochain autovacuum.
ANALYZE public.user_profiles;

SELECT '✅ Index de listing créé. Vérifiez avec le EXPLAIN donné en en-tête de ce fichier.' AS status;

-- ─── Pour plus tard, si la table grossit ───────────────────────────────────
--   À lancer par connexion directe (psql), JAMAIS depuis l'éditeur SQL :
--
--     DROP INDEX IF EXISTS public.idx_user_profiles_listing;
--     CREATE INDEX CONCURRENTLY idx_user_profiles_listing
--       ON public.user_profiles (is_premium DESC, is_verified DESC, created_at DESC)
--       WHERE is_published = TRUE AND COALESCE(is_suspended, FALSE) = FALSE;

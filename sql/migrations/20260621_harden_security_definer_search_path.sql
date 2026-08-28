-- /**
--  * @author @hopsyder
--  * @organization Nexus Partners
--  * @description Durcissement M3 : fixe un search_path explicite sur toutes les
--  *              fonctions SECURITY DEFINER qui n'en avaient pas. Sans cela, une
--  *              fonction SECURITY DEFINER s'exécute avec un search_path mutable :
--  *              un appelant pouvant créer des objets dans un schéma prioritaire
--  *              peut détourner l'exécution (résolution de table/fonction shadowée)
--  *              avec les privilèges du propriétaire (escalade).
--  *              Cf. linter Supabase « Function Search Path Mutable ».
--  * @created 2026-06-21
--  * 🌐 ceo.nexuspartners.xyz
--  * 📧 daoudaabassichristian@gmail.com
--  *
--  * NB : on utilise ALTER FUNCTION (et non CREATE OR REPLACE) pour ne PAS toucher
--  *      au corps des fonctions — changement minimal et réversible. Les corps
--  *      référencent déjà des noms qualifiés (public.*, auth.*), donc
--  *      `search_path = public` est sûr et n'altère aucun comportement.
--  *      Idempotent : ré-exécutable sans effet de bord.
--  *
--  *      Déjà durcies (ignorées ici) : public.get_network_stats(),
--  *      et les fonctions de 20260603_fix_notification_links_and_policies.sql.
--  */
-- ──────────────────────────────────

ALTER FUNCTION public.handle_new_user()                   SET search_path = public;
ALTER FUNCTION public.sync_followers_count()              SET search_path = public;
ALTER FUNCTION public.enforce_message_read_only()         SET search_path = public;
ALTER FUNCTION public.update_conversation_last_message()  SET search_path = public;
ALTER FUNCTION public.notify_new_follower()               SET search_path = public;
ALTER FUNCTION public.notify_new_message()                SET search_path = public;
ALTER FUNCTION public.notify_profile_view()               SET search_path = public;
ALTER FUNCTION public.handle_new_user_notification_prefs() SET search_path = public;

SELECT '✅ search_path figé sur les 8 fonctions SECURITY DEFINER restantes (M3).' AS status;

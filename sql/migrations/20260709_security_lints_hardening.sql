-- ════════════════════════════════════════════════════════════════════════════
--  DURCISSEMENT — Supabase Security Lints (2 errors / 41 warnings / 5 info)
--  À exécuter dans le SQL Editor Supabase. Idempotent et tolérant aux absences.
--
--  NON traité volontairement :
--   • Vue public_profiles (SECURITY DEFINER) : pattern VOULU — expose un sous-ensemble
--     sûr (sans email/phone) aux anonymes tout en gardant user_profiles verrouillée.
--     La passer en security_invoker casserait l'annuaire. Lint assumé.
--   • Leaked Password Protection : à activer dans le Dashboard (Auth → Passwords),
--     ce n'est pas du SQL.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Supprimer la vue orpheline public_profiles_view ─────────────────────
--     (introuvable dans les migrations ET le code — legacy jamais utilisée)
DROP VIEW IF EXISTS public.public_profiles_view CASCADE;

-- ─── 2. Retirer l'exécution RPC des FONCTIONS DE TRIGGER ────────────────────
--     Ces fonctions ne doivent JAMAIS être appelables via /rest/v1/rpc.
--     Les triggers continuent de les exécuter (contexte propriétaire) — seul
--     l'accès direct anon/authenticated est révoqué.
DO $$
DECLARE
  fn text;
  trigger_fns text[] := ARRAY[
    'handle_new_user()',
    'handle_new_user_notification_prefs()',
    'handle_new_message_webhook()',
    'increment_followers_count()',
    'decrement_followers_count()',
    'sync_followers_count()',
    'notify_new_follower()',
    'notify_new_message()',
    'notify_profile_view()',
    'update_conversation_last_message()',
    'enforce_message_read_only()',
    'prevent_ads_user_id_change()'
  ];
BEGIN
  FOREACH fn IN ARRAY trigger_fns LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skip (absente): %', fn;
    END;
  END LOOP;
END $$;

-- Les vrais RPC gardent leur EXECUTE (get_public_profile, get_network_stats,
-- get_user_providers, save_profile_card) — rien à faire pour eux.

-- ─── 3. Figer le search_path des fonctions signalées ────────────────────────
DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'decrement_followers_count()',
    'increment_followers_count()',
    'sync_followers_count()',
    'prevent_ads_user_id_change()',
    'handle_new_message_webhook()',
    'get_user_providers(uuid)',
    'save_profile_card(uuid, text, text, text, text, text, text, text, text, uuid, text, boolean, text[])'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION public.%s SET search_path = public', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skip (absente): %', fn;
    END;
  END LOOP;
END $$;

-- ─── 4. Tables de référence : lecture publique (fix RLS-enabled-no-policy) ───
--     Données de référence non sensibles, lues par les dropdowns côté anon.
DO $$
DECLARE
  t text;
  ref_tables text[] := ARRAY['countries', 'industries', 'jobs', 'professions', 'activity_sectors'];
BEGIN
  FOREACH t IN ARRAY ref_tables LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "ref_public_read" ON public.%I', t);
      EXECUTE format('CREATE POLICY "ref_public_read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'skip (table absente): %', t;
    END;
  END LOOP;
END $$;

-- ─── 5. Empêcher l'ÉNUMÉRATION des buckets publics ──────────────────────────
--     Les URLs publiques (/object/public/…) restent servies sans policy SELECT.
--     Vérifié : aucun .list() sur ces buckets dans le code → suppression sûre.
--     (Réversible : recréer la policy SELECT USING (bucket_id = '…') au besoin.)
DROP POLICY IF EXISTS "Avatar Public Access"          ON storage.objects;
DROP POLICY IF EXISTS "Public Access"                 ON storage.objects;
DROP POLICY IF EXISTS "Project Gallery Public Access" ON storage.objects;

-- ─── (Optionnel) 6. Resserrer l'INSERT des tags ─────────────────────────────
--     Décommente si tu veux limiter la création de tags (actuellement WITH CHECK true).
-- DROP POLICY IF EXISTS "Insertion tags par authentifiés" ON public.tags;
-- CREATE POLICY "tags_insert_authenticated" ON public.tags
--   FOR INSERT TO authenticated
--   WITH CHECK (char_length(coalesce(name, '')) BETWEEN 2 AND 40);

SELECT '✅ Durcissement lints appliqué (vue orpheline, RPC triggers, search_path, tables ref, buckets).' AS status;

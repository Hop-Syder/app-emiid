-- ============================================================================
-- Gestion self-service de l'abonnement — autoRenew + résiliation
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-26
--
-- Aucune policy UPDATE générale sur subscriptions : l'utilisateur ne doit
-- JAMAIS pouvoir écrire tier / status / end_date directement (sinon
-- auto-attribution Pro). Deux RPC SECURITY DEFINER bornées à auth.uid() :
--   • set_auto_renew(boolean)   → colonne auto_renew uniquement ;
--   • cancel_my_subscription()  → status='CANCELLED' si ACTIVE ; le trigger
--     sync_is_premium (migration 20260823) retire alors is_premium.
-- Idempotent.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_auto_renew(p_enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  UPDATE public.subscriptions
     SET auto_renew = p_enabled,
         updated_at = now()
   WHERE user_id = auth.uid()
     AND status = 'ACTIVE';

  -- Pas de ligne ACTIVE : aucun effet (offre gratuite) — silencieux par design.
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_my_subscription()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  UPDATE public.subscriptions
     SET status = 'CANCELLED',
         auto_renew = false,
         updated_at = now()
   WHERE user_id = auth.uid()
     AND status = 'ACTIVE';

  -- Le trigger trg_sync_is_premium met user_profiles.is_premium à jour.
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_auto_renew(boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.set_auto_renew(boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.cancel_my_subscription() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.cancel_my_subscription() FROM anon, public;

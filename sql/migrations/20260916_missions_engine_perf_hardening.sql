/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Moteur Missions Courtes — durcissement perf post-Phase 1-4,
 *              suite à l'audit des advisors Supabase (2026-09-16) :
 *              1) 8 clés étrangères sans index de couverture (missions,
 *                 credit_transactions, mission_reviews, sponsorship_strikes) ;
 *              2) 9 policies RLS qui ré-évaluaient auth.uid() ligne par ligne
 *                 au lieu d'une fois par requête (anti-pattern déjà connu et
 *                 documenté dans 20260709_security_lints_hardening.sql pour
 *                 le reste du projet — mêmes correctifs appliqués ici).
 *              Tables concernées vides ou quasi vides à ce stade (0-38 lignes) :
 *              CREATE INDEX classique suffit, pas besoin de CONCURRENTLY.
 * @created 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

-- ── 1. Index de couverture sur les clés étrangères ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_missions_selected_pro_id ON public.missions (selected_pro_id);
CREATE INDEX IF NOT EXISTS idx_missions_escrow_released_by ON public.missions (escrow_released_by);
CREATE INDEX IF NOT EXISTS idx_missions_escrow_transaction_id ON public.missions (escrow_transaction_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_mission_id ON public.credit_transactions (mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_reviews_client_id ON public.mission_reviews (client_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_strikes_mission_id ON public.sponsorship_strikes (mission_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_strikes_recorded_by ON public.sponsorship_strikes (recorded_by);
CREATE INDEX IF NOT EXISTS idx_sponsorship_strikes_sponsored_id ON public.sponsorship_strikes (sponsored_id);

-- ── 2. RLS : auth.uid() → (select auth.uid()) (initplan, une éval/requête) ─
ALTER POLICY credit_wallets_select_own ON public.credit_wallets
  USING ((select auth.uid()) = user_id);

ALTER POLICY credit_transactions_select_own ON public.credit_transactions
  USING (EXISTS (
    SELECT 1 FROM public.credit_wallets cw
    WHERE cw.id = credit_transactions.wallet_id AND cw.user_id = (select auth.uid())
  ));

ALTER POLICY mission_applications_select ON public.mission_applications
  USING (
    (select auth.uid()) = pro_id
    OR EXISTS (
      SELECT 1 FROM public.missions m
      WHERE m.id = mission_applications.mission_id AND m.client_id = (select auth.uid())
    )
  );

ALTER POLICY mission_reviews_insert_client ON public.mission_reviews
  WITH CHECK (
    (select auth.uid()) = client_id
    AND EXISTS (
      SELECT 1 FROM public.missions m
      WHERE m.id = mission_reviews.mission_id
        AND m.client_id = (select auth.uid())
        AND m.status = 'COMPLETED'::mission_status
        AND m.selected_pro_id = mission_reviews.pro_id
    )
  );

ALTER POLICY missions_delete_draft ON public.missions
  USING ((select auth.uid()) = client_id AND status = 'DRAFT'::mission_status);

ALTER POLICY missions_insert ON public.missions
  WITH CHECK (
    (select auth.uid()) = client_id
    AND status = ANY (ARRAY['DRAFT'::mission_status, 'PUBLISHED'::mission_status])
    AND selected_pro_id IS NULL
    AND started_at IS NULL
    AND delivered_at IS NULL
    AND auto_release_at IS NULL
    AND client_confirmed_at IS NULL
  );

ALTER POLICY missions_select ON public.missions
  USING (
    status = ANY (ARRAY['PUBLISHED'::mission_status, 'APPLICATIONS_OPEN'::mission_status])
    OR (select auth.uid()) = client_id
    OR (select auth.uid()) = selected_pro_id
    OR EXISTS (
      SELECT 1 FROM public.mission_applications ma
      WHERE ma.mission_id = missions.id AND ma.pro_id = (select auth.uid())
    )
  );

ALTER POLICY missions_update_own ON public.missions
  USING ((select auth.uid()) = client_id)
  WITH CHECK ((select auth.uid()) = client_id);

ALTER POLICY sponsorship_strikes_select_participants ON public.sponsorship_strikes
  USING (
    (select auth.uid()) = sponsored_id
    OR EXISTS (
      SELECT 1 FROM public.sponsorships s
      WHERE s.id = sponsorship_strikes.sponsorship_id AND s.referrer_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = (select auth.uid()) AND up.is_admin = true
    )
  );

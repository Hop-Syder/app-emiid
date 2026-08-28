/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Indexes manquants + unicité conversations (A,B) == (B,A) + table profile_views
 * @created 2026-04-28
 */

-- ==========================================
-- 1) INDEXES (perf)
-- ==========================================

-- Follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant1_id ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2_id ON public.conversations(participant2_id);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created_at ON public.messages(conversation_id, created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ==========================================
-- 2) CONVERSATIONS: empêcher doublons (A,B) et (B,A)
-- ==========================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT
        LEAST(participant1_id, participant2_id) AS p_low,
        GREATEST(participant1_id, participant2_id) AS p_high,
        COUNT(*) AS cnt
      FROM public.conversations
      GROUP BY 1, 2
      HAVING COUNT(*) > 1
    ) duplicates
  ) THEN
    RAISE EXCEPTION
      'Doublons detectes dans conversations (A,B) vs (B,A). Dedoublonnez avant d''appliquer la contrainte unique.';
  END IF;
END $$;

-- Unicité symétrique (A,B) == (B,A)
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_participants_unique
  ON public.conversations (
    LEAST(participant1_id, participant2_id),
    GREATEST(participant1_id, participant2_id)
  );

-- ==========================================
-- 3) PROFILE VIEWS (pour dashboard stats)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Note: correspond à auth.users.id (utilisé côté backend comme req.user.id)
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON public.profile_views(created_at DESC);

-- RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profile views insert (anon/auth)" ON public.profile_views;
CREATE POLICY "Profile views insert (anon/auth)" ON public.profile_views
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND viewer_id IS NULL)
    OR
    (auth.uid() IS NOT NULL AND viewer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Profile views owner read" ON public.profile_views;
CREATE POLICY "Profile views owner read" ON public.profile_views
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Grants
GRANT SELECT, INSERT ON public.profile_views TO anon, authenticated;

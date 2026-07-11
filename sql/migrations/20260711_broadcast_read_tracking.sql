-- ============================================================
-- P2 #10 — Boucle de valeur des annonces : taux de lecture
-- ------------------------------------------------------------
-- Ajoute un identifiant de campagne (broadcast_id) sur les notifications
-- pour corréler chaque annonce admin à ses destinataires et calculer
-- son taux de lecture (via is_read). Nullable : n'impacte pas les
-- notifications non-broadcast (message, système, etc.).
-- ============================================================

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS broadcast_id uuid;

-- Index partiel : les requêtes de stats ne portent que sur les notifs de broadcast.
CREATE INDEX IF NOT EXISTS idx_notifications_broadcast_id
  ON public.notifications (broadcast_id)
  WHERE broadcast_id IS NOT NULL;

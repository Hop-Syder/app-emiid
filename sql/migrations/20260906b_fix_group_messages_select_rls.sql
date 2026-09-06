-- ============================================================
-- FIX #2 — Le badge "non lu" des groupes revenait MÊME après le
-- correctif de la policy d'UPDATE (20260906_fix_group_messages_mark_as_read_rls.sql)
-- ------------------------------------------------------------
-- Vérification empirique en base (requêtes simulant l'utilisateur réel,
-- en lecture seule) : après application du correctif précédent, l'UPDATE
-- de `markMessagesAsRead` touchait toujours 0 ligne pour une conversation
-- de groupe.
--
-- Cause : la table `messages` porte QUATRE policies de SELECT strictement
-- redondantes (probablement empilées par des migrations successives sans
-- jamais être nettoyées) — "Messages Participant Read", "Messages Read",
-- "Msg Own", "Voir les messages de ses conversations" — toutes identiques
-- et toutes limitées au modèle DM legacy (`conversations.participant1_id`
-- / `participant2_id`, NULL pour un groupe). Sans qu'AUCUNE policy SELECT
-- ne rende la ligne visible, l'UPDATE de `is_read` ne peut pas s'appliquer
-- (vérifié : `is_conversation_member()` renvoie bien `true` pour ces
-- utilisateurs, mais un SELECT direct sur la ligne renvoie 0 ligne tant
-- que seule la policy d'UPDATE avait été corrigée).
--
-- Correctif : suppression des 3 doublons, et la policy de lecture restante
-- reconnaît désormais aussi l'appartenance via `is_conversation_member()`.
-- ============================================================

DROP POLICY IF EXISTS "Messages Read" ON public.messages;
DROP POLICY IF EXISTS "Msg Own" ON public.messages;
DROP POLICY IF EXISTS "Voir les messages de ses conversations" ON public.messages;

DROP POLICY IF EXISTS "Messages Participant Read" ON public.messages;
CREATE POLICY "Messages Participant Read" ON public.messages FOR SELECT
    USING (
        conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() IN (participant1_id, participant2_id))
        OR public.is_conversation_member(conversation_id, auth.uid())
    );

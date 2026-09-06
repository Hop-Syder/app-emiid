-- ============================================================
-- FIX — Marquage "lu" impossible sur les messages de groupe
-- ------------------------------------------------------------
-- Symptôme : dans une conversation de groupe (is_group = true, y compris
-- les groupes à 2 membres créés via le bouton "Nouveau groupe"), un message
-- déjà lu réapparaissait comme non lu dans la liste après l'envoi d'une
-- réponse — y compris quand le dernier message affiché était le sien.
--
-- Cause racine : `markMessagesAsRead` (frontend, hooks/use-messages.ts)
-- exécute un UPDATE Supabase CÔTÉ CLIENT (soumis à la RLS de l'utilisateur
-- connecté, contrairement à l'API backend qui utilise le rôle de service).
-- La policy "Messages Mark as Read" ne reconnaissait que les DM historiques
-- via `conversations.participant1_id` / `participant2_id` — colonnes qui
-- restent NULL pour toute conversation de groupe (celles-ci s'appuient sur
-- `conversation_participants`, introduite par 20260710_community_groups.sql).
-- L'UPDATE ne levait aucune erreur mais ne touchait silencieusement AUCUNE
-- ligne : `is_read` ne passait jamais à TRUE en base pour un groupe, alors
-- que l'état local (React) affichait à tort la conversation comme lue.
-- Au prochain rafraîchissement (ex. juste après l'envoi d'une réponse,
-- quand la liste des conversations est recalculée côté backend à partir
-- des VRAIES valeurs de `is_read`), le message plus ancien redevenait non
-- lu aux yeux de l'utilisateur.
--
-- Correctif : la policy accepte désormais aussi l'appartenance via
-- `conversation_participants` (fonction existante `is_conversation_member`,
-- SECURITY DEFINER, anti-récursion RLS), en plus du chemin DM legacy.
-- ============================================================

DROP POLICY IF EXISTS "Messages Mark as Read" ON public.messages;
CREATE POLICY "Messages Mark as Read" ON public.messages FOR UPDATE
    USING (
        conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() IN (participant1_id, participant2_id))
        OR public.is_conversation_member(conversation_id, auth.uid())
    )
    WITH CHECK (
        (
            conversation_id IN (SELECT id FROM public.conversations WHERE auth.uid() IN (participant1_id, participant2_id))
            OR public.is_conversation_member(conversation_id, auth.uid())
        )
        AND sender_id <> auth.uid()
        AND is_read = TRUE
    );

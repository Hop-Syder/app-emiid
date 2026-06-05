-- ==========================================
-- SCRIPT DE MIGRATION : AUTORISER L'ÉDITION ET LA SUPPRESSION DE SES PROPRES MESSAGES
-- ==========================================

-- 1. Ajouter la colonne is_edited si elle n'existe pas
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- 2. Supprimer l'ancien trigger restrictif
DROP TRIGGER IF EXISTS trg_messages_read_only ON public.messages;

-- 3. Créer la nouvelle fonction de trigger permettant la modification du contenu par l'expéditeur
CREATE OR REPLACE FUNCTION public.enforce_message_read_only()
RETURNS TRIGGER AS $$
BEGIN
    -- Cas 1 : L'utilisateur connecté est l'expéditeur (il a le droit de modifier le contenu de son message)
    IF OLD.sender_id = auth.uid() THEN
        -- Empêcher la modification de la structure globale du message
        IF NEW.id <> OLD.id OR NEW.conversation_id <> OLD.conversation_id OR NEW.sender_id <> OLD.sender_id THEN
            RAISE EXCEPTION 'Modification de la structure du message interdite';
        END IF;
        
        -- Si le contenu change, on marque le message comme édité
        IF NEW.content <> OLD.content THEN
            NEW.is_edited := TRUE;
        END IF;
        
        RETURN NEW;
    END IF;

    -- Cas 2 : L'utilisateur connecté est le destinataire (il a le droit de marquer comme lu uniquement)
    IF OLD.sender_id <> auth.uid() THEN
        -- Empêcher le destinataire de modifier le contenu, l'expéditeur ou la conversation
        IF NEW.id <> OLD.id OR NEW.conversation_id <> OLD.conversation_id OR NEW.sender_id <> OLD.sender_id OR NEW.content <> OLD.content THEN
            RAISE EXCEPTION 'Modification du contenu du message par le destinataire interdite';
        END IF;

        -- Seul is_read peut évoluer de FALSE vers TRUE
        IF NEW.is_read IS DISTINCT FROM OLD.is_read THEN
            IF NEW.is_read = TRUE THEN
                RETURN NEW;
            ELSE
                RAISE EXCEPTION 'Retour en arrière sur is_read interdit';
            END IF;
        END IF;
    END IF;

    -- Pas de modification détectée : on laisse passer
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ré-associer le trigger BEFORE UPDATE
CREATE TRIGGER trg_messages_read_only
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_message_read_only();

-- 4. Déclarer les stratégies d'accès RLS pour UPDATE et DELETE sur les messages
DROP POLICY IF EXISTS "Messages Participant Update Self" ON public.messages;
CREATE POLICY "Messages Participant Update Self" ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Messages Participant Delete Self" ON public.messages;
CREATE POLICY "Messages Participant Delete Self" ON public.messages FOR DELETE
    USING (auth.uid() = sender_id);

-- 5. Attribuer les droits SQL d'écriture pour les utilisateurs connectés
GRANT UPDATE, DELETE ON public.messages TO authenticated;

-- ==========================================
-- SCRIPT DE MIGRATION : SETUP LOGIQUE DE MESSAGERIE
-- ==========================================

-- 1. ACTIVER LE REALTIME SUR LES TABLES DE MESSAGERIE ET CONNEXIONS
BEGIN;
  -- On ajoute les tables à la publication realtime pour pouvoir écouter les nouveaux messages
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
COMMIT;

-- 2. TRIGGER POUR METTRE A JOUR 'last_message_content'
-- Ce trigger met automatiquement à jour la table "conversations" 
-- lorsqu'un nouveau message y est inséré. Cela permet d'afficher 
-- le dernier message dans la sidebar.
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_content = NEW.content,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_last_message ON public.messages;
CREATE TRIGGER trg_update_last_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

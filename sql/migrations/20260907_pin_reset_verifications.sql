-- ==========================================
-- Réinitialisation du PIN — vérification OTP serveur
-- ==========================================
-- Corrige BUG-001 / S-02 : POST /api/users/reset-pin réinitialisait le PIN
-- sans aucune vérification côté serveur. Cette table stocke un OTP envoyé
-- par email, sur le modèle exact de public.phone_verifications, pour que
-- resetMyPin puisse valider le code avant d'appliquer un nouveau PIN.

CREATE TABLE IF NOT EXISTS public.pin_reset_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pin_reset_verif_user_id ON public.pin_reset_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_reset_verif_expires ON public.pin_reset_verifications(expires_at);

ALTER TABLE public.pin_reset_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pin Reset Verifications Access" ON public.pin_reset_verifications;
CREATE POLICY "Pin Reset Verifications Access" ON public.pin_reset_verifications FOR ALL USING (auth.uid() = user_id);

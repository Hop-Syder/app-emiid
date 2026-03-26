/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Nouvelles fonctionnalités : Smart Autocomplete & Sécurité PIN
 * @created 2026-01-05
*/

-- ==========================================
-- 1. TABLES POUR SMART AUTOCOMPLETE (CROWDSOURCING)
-- ==========================================

-- Table pour les Secteurs/Industries évolutifs
CREATE TABLE IF NOT EXISTS public.industries (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les Métiers/Jobs évolutifs
CREATE TABLE IF NOT EXISTS public.jobs (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour la lecture publique
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique industries" ON public.industries;
CREATE POLICY "Lecture publique industries" ON public.industries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lecture publique jobs" ON public.jobs;
CREATE POLICY "Lecture publique jobs" ON public.jobs FOR SELECT USING (true);

-- Insertion initiale (Seed)
INSERT INTO public.industries (name) VALUES 
('Informatique & Tech'), ('Santé'), ('BTP & Construction'), ('Commerce'), ('Education'), ('Agriculture'), ('Artisanat'), ('Agences'), ('Startup')
ON CONFLICT DO NOTHING;

INSERT INTO public.jobs (name) VALUES 
('Développeur Web'), ('Infirmier'), ('Maçon'), ('Commercial'), ('Enseignant'), ('Menuisier'), ('Plombier')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 2. ÉVOLUTION DE USER_PROFILES (PIN & NOUVEAUX CHAMPS)
-- ==========================================

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS pin_code TEXT,      -- PIN hashé
ADD COLUMN IF NOT EXISTS pin_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pin_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS job_title TEXT,     -- Remplacement évolutif de 'role'
ADD COLUMN IF NOT EXISTS industry TEXT;      -- Remplacement évolutif de 'activity_domain'

-- Politique pour permettre aux utilisateurs d'insérer dans jobs/industries (via trigger ou direct)
-- On autorise les utilisateurs authentifiés à insérer pour le crowdsourcing
CREATE POLICY "Utilisateurs authentifiés peuvent ajouter des industries" 
ON public.industries FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent ajouter des jobs" 
ON public.jobs FOR INSERT 
TO authenticated 
WITH CHECK (true);

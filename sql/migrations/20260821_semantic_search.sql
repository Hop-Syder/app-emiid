-- ============================================================================
-- Recherche annuaire — Couche ② : recherche sémantique (pgvector + embeddings)
-- @author @hopsyder — Nexus Partners
-- @date 2026-08-21
--
-- Ajoute la compréhension du *sens* d'une requête (ex. « quelqu'un pour refaire
-- mon électricité » → électricien) grâce à des embeddings vectoriels :
--   • extension pgvector ;
--   • colonne embedding vector(768) sur user_profiles (modèle Gemini
--     text-embedding-004 → 768 dimensions) ;
--   • indicateur embedding_stale + trigger : rembarque un profil pour
--     ré-embedding dès qu'un de ses champs texte change ;
--   • index HNSW (distance cosinus) pour une recherche approchée rapide ;
--   • RPC match_profiles_semantic() : profils publiés les plus proches d'un
--     vecteur de requête, classés par similarité.
--
-- La génération des vecteurs se fait hors-SQL (script backend/scripts/
-- embed-profiles.js appelant l'API Gemini). Tant qu'aucun profil n'est
-- embarqué, la recherche continue de fonctionner via la Couche ① (FTS).
--
-- Idempotent. Jouer après 20260820_fts_search.sql.
-- ============================================================================

-- ── 1. Extension vectorielle ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── 2. Colonne d'embedding + indicateur de fraîcheur ───────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS embedding        vector(768),
  ADD COLUMN IF NOT EXISTS embedding_stale  boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.user_profiles.embedding IS
  'Vecteur sémantique (Gemini text-embedding-004, 768 dims). Généré hors-SQL.';
COMMENT ON COLUMN public.user_profiles.embedding_stale IS
  'true = le profil doit être (ré)embarqué par le script embed-profiles.';

-- ── 3. Trigger : marquer « à ré-embarquer » quand le texte change ──────────
--     On compare uniquement les champs qui composent le texte embarqué,
--     identiques à ceux du search_vector (Couche ①).
CREATE OR REPLACE FUNCTION public.mark_embedding_stale()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
       coalesce(NEW.first_name, '')      IS DISTINCT FROM coalesce(OLD.first_name, '')      OR
       coalesce(NEW.last_name, '')       IS DISTINCT FROM coalesce(OLD.last_name, '')       OR
       coalesce(NEW.business_name, '')   IS DISTINCT FROM coalesce(OLD.business_name, '')   OR
       coalesce(NEW.role, '')            IS DISTINCT FROM coalesce(OLD.role, '')            OR
       coalesce(NEW.specialty, '')       IS DISTINCT FROM coalesce(OLD.specialty, '')       OR
       coalesce(NEW.job_title, '')       IS DISTINCT FROM coalesce(OLD.job_title, '')       OR
       coalesce(NEW.category, '')        IS DISTINCT FROM coalesce(OLD.category, '')        OR
       coalesce(NEW.activity_domain, '') IS DISTINCT FROM coalesce(OLD.activity_domain, '') OR
       coalesce(NEW.city, '')            IS DISTINCT FROM coalesce(OLD.city, '')            OR
       coalesce(NEW.district, '')        IS DISTINCT FROM coalesce(OLD.district, '')        OR
       coalesce(NEW.slogan, '')          IS DISTINCT FROM coalesce(OLD.slogan, '')          OR
       coalesce(NEW.bio, '')             IS DISTINCT FROM coalesce(OLD.bio, '')
     ) THEN
    NEW.embedding_stale := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_embedding_stale ON public.user_profiles;
CREATE TRIGGER trg_mark_embedding_stale
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_embedding_stale();

-- ── 4. Index HNSW (cosinus) pour la recherche approchée rapide ─────────────
CREATE INDEX IF NOT EXISTS idx_user_profiles_embedding_hnsw
  ON public.user_profiles
  USING hnsw (embedding vector_cosine_ops);

-- ── 5. RPC de recherche sémantique (profils publiés uniquement) ────────────
--     Renvoie la similarité cosinus (1 = identique, 0 = orthogonal).
CREATE OR REPLACE FUNCTION public.match_profiles_semantic(
  query_embedding vector(768),
  match_count     int   DEFAULT 50,
  min_similarity  float DEFAULT 0.30
)
RETURNS TABLE(profile_id uuid, similarity real)
LANGUAGE sql STABLE
AS $$
  SELECT p.id AS profile_id,
         (1 - (p.embedding <=> query_embedding))::real AS similarity
  FROM public.user_profiles p
  WHERE p.is_published = true
    AND p.embedding IS NOT NULL
    AND (1 - (p.embedding <=> query_embedding)) > min_similarity
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_profiles_semantic(vector, int, float)
  TO anon, authenticated;

SELECT '✅ pgvector + embedding + match_profiles_semantic() prêts. '
       'Lancez backend/scripts/embed-profiles.js pour générer les vecteurs.' AS status;

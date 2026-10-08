/**
 * Types partagés pour les résultats de requêtes Supabase joints (public_profiles + jointures).
 * La vue public_profiles n'a pas de relation FK déclarée → l'inférence des joins échoue ;
 * on caste les résultats vers ces types (cf. règle: `data as unknown as PublicProfileJoined[]`).
 */

export type CountryJoin = { name?: string | null; iso_code?: string | null }
export type ProfileTagJoin = { tags?: { name?: string | null } | null }

export interface PublicProfileJoined {
    id?: string | null
    user_id?: string | null
    first_name?: string | null
    last_name?: string | null
    role?: string | null
    job_title?: string | null
    bio?: string | null
    city?: string | null
    avatar_url?: string | null
    specialty?: string | null
    category?: string | null
    slug?: string | null
    is_verified?: boolean | null
    is_premium?: boolean | null
    is_nomad?: boolean | null
    card_variant?: string | null
    followers_count?: number | null
    commune_id?: string | null
    created_at?: string | null
    updated_at?: string | null
    latitude?: number | null
    longitude?: number | null
    country_id?: string | null
    /** Quartier (20261009). */
    district?: string | null
    /** Plus petit prix du catalogue de prestations, en FCFA (20261009). */
    starting_price?: number | null
    countries?: CountryJoin | CountryJoin[] | null
    profile_tags?: ProfileTagJoin[] | null
}

/** Extrait le nom du pays, que la jointure renvoie un objet ou un tableau. */
export function countryName(c: CountryJoin | CountryJoin[] | null | undefined): string {
    if (!c) return ""
    return (Array.isArray(c) ? c[0]?.name : c.name) || ""
}

/** Extrait les noms de tags (string[]) depuis la jointure profile_tags. */
export function tagNames(profileTags: ProfileTagJoin[] | null | undefined): string[] {
    return (profileTags || [])
        .map((pt) => pt.tags?.name)
        .filter((n): n is string => typeof n === "string" && n.length > 0)
}

/** Message d'erreur lisible depuis un catch typé `unknown`. */
export function errorMessage(e: unknown, fallback = "Erreur"): string {
    return e instanceof Error ? e.message : fallback
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Mesure d'audience — envoi d'événements Google Analytics 4.
 *
 *              À ne pas confondre avec `lib/track-profile.ts`, qui alimente les
 *              compteurs internes affichés au professionnel (vues, clics). Ici
 *              il s'agit de la mesure côté produit/marketing.
 *
 *              Sans identifiant de mesure configuré, toutes les fonctions sont
 *              des no-op : rien ne casse en développement.
 * @created 2026-08-26
 */

"use client"

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || ""

type GtagArgs =
    | ["js", Date]
    | ["config", string, Record<string, unknown>?]
    | ["event", string, Record<string, unknown>?]

declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: (...args: GtagArgs) => void
    }
}

/** Vrai si la mesure est configurée et le script chargé. */
function ready(): boolean {
    return typeof window !== "undefined" && !!GA_MEASUREMENT_ID && typeof window.gtag === "function"
}

/**
 * Signale un changement de page. Nécessaire avec l'App Router : la navigation
 * côté client ne recharge pas le document, donc aucune vue n'est envoyée seule.
 */
export function pageview(url: string): void {
    if (!ready()) return
    window.gtag!("config", GA_MEASUREMENT_ID, { page_path: url })
}

/** Envoie un événement personnalisé. */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
    if (!ready()) return
    window.gtag!("event", name, params)
}

// ── Événements métier ──────────────────────────────────────────────────────

/** Consultation d'une vitrine professionnelle. */
export function trackProfileView(profileId: string, slug?: string | null): void {
    trackEvent("view_profile", { profile_id: profileId, profile_slug: slug || undefined })
}

/** Prise de contact depuis une vitrine (WhatsApp, appel, partage). */
export function trackProfileContact(
    profileId: string,
    method: "whatsapp" | "call" | "share",
): void {
    trackEvent("contact_profile", { profile_id: profileId, method })
}

/** Recherche lancée dans l'annuaire. */
export function trackSearch(term: string, resultCount?: number): void {
    trackEvent("search", { search_term: term, result_count: resultCount })
}

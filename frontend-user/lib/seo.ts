/**
 * Centralisation SEO : origine canonique unique + utilitaires JSON-LD.
 *
 * Décision d'architecture (cf. next.config.mjs du site commercial, « Option A ») :
 * les pages publiques (annuaire, profils) sont SERVIES par app.emiid.com ;
 * emiid.com se contente de rediriger en 308 les anciens liens /profil vers l'app.
 * Les canonicals, l'og:url et les @id JSON-LD doivent donc pointer vers l'origine
 * qui sert réellement le contenu — jamais vers emiid.com, sinon Google suivrait
 * une chaîne canonical → 308 → app, et le sitemap listerait des URL qui 404/redirigent.
 *
 * NEXT_PUBLIC_SITE_URL est LA variable d'origine du SEO. Ne pas y mélanger
 * NEXT_PUBLIC_PUBLIC_URL (réservé au branding du domaine officiel côté partage).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://app.emiid.com").replace(/\/+$/, "")

/** URL absolue à partir d'un chemin racine (« /annuaire » → https://…/annuaire). */
export function absoluteUrl(path = "/"): string {
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * Sérialise un objet JSON-LD de façon sûre : échappe < et > pour empêcher une
 * injection </script> via du contenu utilisateur (noms, bios, tags…). Tout
 * nouveau bloc de données structurées DOIT passer par ici.
 */
export function serializeJsonLd(data: unknown): string {
    return JSON.stringify(data)
        .split("<").join("\\u003c")
        .split(">").join("\\u003e")
}

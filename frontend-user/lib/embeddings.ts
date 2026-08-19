/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Embeddings Gemini — helper serveur pour la recherche sémantique.
 *              Transforme une requête en langage naturel en vecteur (768 dims)
 *              comparable aux embeddings des profils (cf. match_profiles_semantic).
 *
 *              Dégradation propre : sans clé ou en cas d'erreur réseau/quota,
 *              retourne null → la recherche retombe sur la Couche ① (FTS).
 * @created 2026-08-21
 * 🌐 ceo.nexuspartners.xyz
 */

// Modèle d'embedding Gemini (gratuit). 768 dimensions — doit correspondre à la
// dimension de la colonne user_profiles.embedding (migration 20260821).
const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || 'text-embedding-004'
const ENDPOINT = (model: string, key: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${key}`

/** Temps max avant abandon (ms) — la recherche ne doit jamais rester bloquée. */
const TIMEOUT_MS = 3500

/**
 * Embarque un texte de requête. Utilise taskType=RETRIEVAL_QUERY (asymétrique :
 * les profils sont embarqués en RETRIEVAL_DOCUMENT côté script de backfill).
 * @returns le vecteur (number[]) ou null si indisponible.
 */
export async function embedQuery(text: string): Promise<number[] | null> {
    const key = process.env.GEMINI_API_KEY
    const q = text?.trim()
    if (!key || !q) return null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
        const res = await fetch(ENDPOINT(EMBED_MODEL, key), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: `models/${EMBED_MODEL}`,
                content: { parts: [{ text: q }] },
                taskType: 'RETRIEVAL_QUERY',
            }),
            signal: controller.signal,
        })
        if (!res.ok) {
            console.warn('embedQuery: réponse Gemini non OK', res.status)
            return null
        }
        const json = (await res.json()) as { embedding?: { values?: number[] } }
        const values = json?.embedding?.values
        return Array.isArray(values) && values.length > 0 ? values : null
    } catch (err) {
        // Timeout, réseau, quota… → dégradation silencieuse vers la Couche ①.
        if ((err as Error)?.name !== 'AbortError') {
            console.warn('embedQuery: échec', (err as Error)?.message)
        }
        return null
    } finally {
        clearTimeout(timer)
    }
}

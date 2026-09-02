/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Embeddings Gemini — helper serveur pour la recherche sémantique.
 *              Transforme une requête en langage naturel en vecteur comparable
 *              aux embeddings des profils (cf. match_profiles_semantic).
 *
 *              Dégradation propre : sans clé ou en cas d'erreur réseau/quota,
 *              retourne null → la recherche retombe sur la Couche ① (FTS).
 * @created 2026-08-21
 * @updated 2026-09-02
 * 🌐 ceo.nexuspartners.xyz
 */

// Modèle d'embedding Gemini (gratuit).
//
// ⚠️ text-embedding-004, utilisé jusqu'ici, a été ARRÊTÉ par Google le
//    14/01/2026 : l'appel renvoie 404 et la couche sémantique ne peut plus
//    fonctionner avec. gemini-embedding-001 est son remplaçant sur le même
//    endpoint embedContent.
const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001'

// Dimensions demandées. gemini-embedding-001 renvoie 3072 dimensions par
// défaut ; la colonne user_profiles.embedding est un vector(768). Sans ce
// paramètre, l'écriture en base échouerait sur une taille de vecteur invalide.
// Toute modification doit être répercutée sur la colonne, l'index HNSW et
// backend/scripts/embed-profiles.js — les trois doivent rester alignés.
const EMBED_DIM = 768

const ENDPOINT = (model: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent`

/** Temps max avant abandon (ms) — la recherche ne doit jamais rester bloquée. */
const TIMEOUT_MS = 3500

/**
 * Normalise un vecteur (norme L2 = 1).
 *
 * Google l'exige pour toute dimension autre que 3072 : les vecteurs tronqués
 * ne sont plus unitaires, ce qui fausse les calculs de similarité. On le fait
 * ici plutôt qu'en base pour que les vecteurs stockés soient directement
 * comparables, quel que soit l'opérateur de distance utilisé ensuite.
 */
function normalize(values: number[]): number[] {
    const norm = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0))
    // Un vecteur nul n'est pas normalisable : on le renvoie tel quel plutôt que
    // de produire des NaN qui contamineraient l'index.
    return norm > 0 ? values.map((v) => v / norm) : values
}

/**
 * Embarque un texte de requête. Utilise taskType=RETRIEVAL_QUERY (asymétrique :
 * les profils sont embarqués en RETRIEVAL_DOCUMENT côté script de backfill).
 * @returns le vecteur normalisé (number[]) ou null si indisponible.
 */
export async function embedQuery(text: string): Promise<number[] | null> {
    const key = process.env.GEMINI_API_KEY
    const q = text?.trim()
    if (!key || !q) return null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
        const res = await fetch(ENDPOINT(EMBED_MODEL), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // En-tête plutôt que `?key=` : c'est la forme documentée par
                // Google, la seule acceptée par toutes les routes depuis les
                // clés « auth » (préfixe AQ.), et elle évite d'écrire la clé
                // dans une URL — donc dans les journaux de proxy.
                'x-goog-api-key': key,
            },
            body: JSON.stringify({
                model: `models/${EMBED_MODEL}`,
                content: { parts: [{ text: q }] },
                taskType: 'RETRIEVAL_QUERY',
                outputDimensionality: EMBED_DIM,
            }),
            signal: controller.signal,
        })
        if (!res.ok) {
            console.warn('embedQuery: réponse Gemini non OK', res.status)
            return null
        }
        const json = (await res.json()) as { embedding?: { values?: number[] } }
        const values = json?.embedding?.values
        if (!Array.isArray(values) || values.length === 0) return null
        // Garde-fou : un vecteur de taille inattendue serait rejeté par la base
        // (vector(768)). Mieux vaut retomber sur le FTS que faire échouer la RPC.
        if (values.length !== EMBED_DIM) {
            console.warn(`embedQuery: ${values.length} dimensions reçues, ${EMBED_DIM} attendues`)
            return null
        }
        return normalize(values)
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

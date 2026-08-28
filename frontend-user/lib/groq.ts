/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Assistant de recherche Groq (Llama) — Couche ③.
 *              Quand une recherche annuaire ne renvoie aucun résultat, propose
 *              une reformulation empathique et des pistes de recherche réalistes
 *              (métier + ville au Bénin), directement cliquables.
 *
 *              Dégradation propre : sans GROQ_API_KEY, en cas d'erreur, de quota
 *              ou de timeout, retourne null → l'UI reste silencieuse.
 * @created 2026-08-21
 * 🌐 ceo.nexuspartners.xyz
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
// Modèle gratuit, bon en français. Surchargeable par env.
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const TIMEOUT_MS = 6000

export interface SearchAssistantResult {
    message: string
    suggestions: string[]
}

const SYSTEM_PROMPT = [
    "Tu es l'assistant de recherche d'EmiID, un annuaire de professionnels et",
    "d'artisans au Bénin (couturiers, électriciens, menuisiers, graphistes, etc.).",
    "L'utilisateur a fait une recherche qui n'a donné AUCUN résultat.",
    'Réponds UNIQUEMENT par un objet JSON valide de la forme exacte :',
    '{"message": string, "suggestions": string[]}',
    '- "message" : une seule phrase courte, chaleureuse, en français, qui',
    '  reconnaît l\'absence de résultat et invite à essayer une piste.',
    '- "suggestions" : 3 à 5 requêtes de recherche courtes et réalistes au Bénin',
    '  (métier + ville, ex. "électricien Cotonou"), directement réutilisables,',
    '  sans numérotation ni ponctuation superflue. Élargis intelligemment',
    '  (métiers proches, villes voisines). N\'invente jamais de noms de personnes.',
].join(' ')

/**
 * Interroge Groq pour obtenir un message + des suggestions de recherche.
 * @returns le résultat structuré, ou null si l'assistant est indisponible.
 */
export async function searchAssistant(query: string): Promise<SearchAssistantResult | null> {
    const key = process.env.GROQ_API_KEY
    const q = query?.trim()
    if (!key || !q) return null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
        const res = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                temperature: 0.4,
                max_tokens: 400,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Recherche sans résultat : « ${q} »` },
                ],
            }),
            signal: controller.signal,
        })
        if (!res.ok) {
            console.warn('searchAssistant: réponse Groq non OK', res.status)
            return null
        }
        const json = (await res.json()) as {
            choices?: { message?: { content?: string } }[]
        }
        const content = json?.choices?.[0]?.message?.content
        if (!content) return null

        const parsed = JSON.parse(content) as Partial<SearchAssistantResult>
        const message = typeof parsed.message === 'string' ? parsed.message.trim() : ''
        const suggestions = Array.isArray(parsed.suggestions)
            ? parsed.suggestions
                  .filter((s): s is string => typeof s === 'string')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 5)
            : []

        if (!message && suggestions.length === 0) return null
        return { message, suggestions }
    } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
            console.warn('searchAssistant: échec', (err as Error)?.message)
        }
        return null
    } finally {
        clearTimeout(timer)
    }
}

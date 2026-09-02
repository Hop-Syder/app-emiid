/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Assistant de recherche (Couche ③) — Gemini Flash-Lite.
 *              Quand une recherche annuaire ne renvoie aucun résultat, propose
 *              une reformulation empathique et des pistes de recherche réalistes
 *              (métier + ville au Bénin), directement cliquables.
 *
 *              Remplace l'implémentation Groq/Llama : la couche ② (embeddings)
 *              utilisant déjà Gemini, tout tient désormais sur GEMINI_API_KEY —
 *              une seule clé à provisionner et à surveiller.
 *
 *              Dégradation propre : sans GEMINI_API_KEY, en cas d'erreur, de
 *              quota (429) ou de timeout, retourne null → l'UI reste silencieuse
 *              et l'état vide standard de l'annuaire s'affiche normalement.
 * @created 2026-09-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

// Modèle : le moins coûteux et le plus rapide de la famille Flash, taillé pour
// des appels courts et ponctuels — exactement le profil de cet assistant, qui
// n'est sollicité que sur une recherche à 0 résultat. Surchargeable par env
// pour suivre le catalogue Google sans redéploiement de code.
const MODEL = process.env.GEMINI_ASSISTANT_MODEL || 'gemini-3.5-flash-lite'

const ENDPOINT = (model: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

const TIMEOUT_MS = 6000

export interface SearchAssistantResult {
    message: string
    suggestions: string[]
}

const SYSTEM_PROMPT = [
    "Tu es l'assistant de recherche d'EmiID, un annuaire de professionnels et",
    "d'artisans au Bénin (couturiers, électriciens, menuisiers, graphistes, etc.).",
    "L'utilisateur a fait une recherche qui n'a donné AUCUN résultat.",
    '- "message" : une seule phrase courte, chaleureuse, en français, qui',
    "  reconnaît l'absence de résultat et invite à essayer une piste.",
    '- "suggestions" : 3 à 5 requêtes de recherche courtes et réalistes au Bénin',
    '  (métier + ville, ex. "électricien Cotonou"), directement réutilisables,',
    '  sans numérotation ni ponctuation superflue. Élargis intelligemment',
    "  (métiers proches, villes voisines). N'invente jamais de noms de personnes.",
].join(' ')

// Schéma de sortie imposé au modèle. Plus sûr qu'une simple consigne de format :
// Gemini contraint le décodage, la réponse est donc du JSON valide et conforme.
const RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        message: { type: 'STRING' },
        suggestions: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: ['message', 'suggestions'],
}

/**
 * Interroge Gemini pour obtenir un message + des suggestions de recherche.
 * @returns le résultat structuré, ou null si l'assistant est indisponible.
 */
export async function searchAssistant(query: string): Promise<SearchAssistantResult | null> {
    const key = process.env.GEMINI_API_KEY
    const q = query?.trim()
    if (!key || !q) return null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
        const res = await fetch(ENDPOINT(MODEL), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // En-tête plutôt que `?key=` : forme documentée par Google, seule
                // acceptée par toutes les routes avec les clés « auth » (AQ.), et
                // le secret ne transite pas dans une URL.
                'x-goog-api-key': key,
            },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [
                    { role: 'user', parts: [{ text: `Recherche sans résultat : « ${q} »` }] },
                ],
                generationConfig: {
                    temperature: 0.4,
                    // Budget large : sur les modèles récents, le raisonnement interne
                    // consomme ce quota avant la réponse. Trop juste, la génération
                    // serait tronquée et le JSON inexploitable.
                    maxOutputTokens: 1024,
                    responseMimeType: 'application/json',
                    responseSchema: RESPONSE_SCHEMA,
                },
            }),
            signal: controller.signal,
        })
        if (!res.ok) {
            // 429 = quota gratuit atteint : cas normal, pas une anomalie.
            console.warn('searchAssistant: réponse Gemini non OK', res.status)
            return null
        }

        const json = (await res.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[]
        }
        const content = json?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!content) return null

        // Le schéma contraint la forme, mais la réponse reste une donnée externe :
        // on la valide avant de la présenter à l'utilisateur.
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
        // Timeout, réseau, quota, JSON illisible… → l'UI reste simplement muette.
        if ((err as Error)?.name !== 'AbortError') {
            console.warn('searchAssistant: échec', (err as Error)?.message)
        }
        return null
    } finally {
        clearTimeout(timer)
    }
}

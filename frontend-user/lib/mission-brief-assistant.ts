/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Moteur Missions Courtes — Phase 2, cadrage IA du besoin.
 *              À partir d'une description libre et informelle du client
 *              ("j'ai besoin de quelqu'un pour refaire mon électricité, vite"),
 *              produit un brouillon structuré de mission (titre, catégorie,
 *              description reformulée, fourchette budgétaire indicative) que
 *              le client reste libre de corriger avant publication — l'IA ne
 *              publie jamais rien elle-même.
 *
 *              Même pattern que lib/search-assistant.ts (Gemini Flash-Lite,
 *              une seule clé GEMINI_API_KEY déjà provisionnée pour les
 *              embeddings/la recherche sémantique) : schéma de sortie
 *              contraint, dégradation silencieuse (retourne null) sans clé,
 *              en cas de quota, timeout ou erreur réseau — le formulaire de
 *              création de mission doit rester utilisable manuellement même
 *              si l'assistant est indisponible.
 * @created 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

const MODEL = process.env.GEMINI_ASSISTANT_MODEL || 'gemini-3.6-flash'

const ENDPOINT = (model: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

const TIMEOUT_MS = 8000

export interface MissionBriefResult {
    title: string
    category: string
    description: string
    budgetMinXof: number | null
    budgetMaxXof: number | null
}

const SYSTEM_PROMPT = [
    "Tu es l'assistant de cadrage de mission d'EmiID, un annuaire de",
    "professionnels et d'artisans au Bénin. Un client décrit un besoin en",
    "langage libre et informel. Transforme-le en brouillon structuré :",
    '- "title" : titre court (5-10 mots) résumant le besoin.',
    '- "category" : un métier générique (ex. "Électricité", "Couture",',
    '  "Menuiserie", "Plomberie", "Graphisme") — un seul mot ou groupe court.',
    '- "description" : reformulation claire et complète en français, 2-4',
    "  phrases, qui garde toutes les informations utiles données par le",
    "  client (urgence, lieu, contraintes) sans en inventer de nouvelles.",
    '- "budgetMinXof"/"budgetMaxXof" : fourchette indicative en francs CFA',
    "  (entiers, budgetMinXof <= budgetMaxXof) SEULEMENT si le texte du client",
    "  donne assez d'indices pour l'estimer raisonnablement (ex. ampleur du",
    "  travail, durée) ; sinon les deux valeurs doivent être null. N'invente",
    "  jamais un montant précis à partir de rien — un budget vide est normal",
    "  et préférable à un chiffre halluciné.",
].join(' ')

const RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        title: { type: 'STRING' },
        category: { type: 'STRING' },
        description: { type: 'STRING' },
        budgetMinXof: { type: 'NUMBER', nullable: true },
        budgetMaxXof: { type: 'NUMBER', nullable: true },
    },
    required: ['title', 'category', 'description', 'budgetMinXof', 'budgetMaxXof'],
}

/**
 * Interroge Gemini pour structurer une description de mission en langage
 * libre. Ne fait AUCUN appel réseau autre que Gemini, n'écrit rien en base :
 * le résultat est un brouillon à valider/corriger par le client avant tout
 * appel à l'API de création de mission.
 * @returns le brouillon structuré, ou null si l'assistant est indisponible
 *          ou si le texte est trop court pour être exploité.
 */
export async function draftMissionBrief(rawDescription: string): Promise<MissionBriefResult | null> {
    const key = process.env.GEMINI_API_KEY
    const text = rawDescription?.trim()
    if (!key || !text || text.length < 10) return null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
        const res = await fetch(ENDPOINT(MODEL), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': key,
            },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [
                    { role: 'user', parts: [{ text: `Besoin décrit par le client : « ${text} »` }] },
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                    responseMimeType: 'application/json',
                    responseSchema: RESPONSE_SCHEMA,
                },
            }),
            signal: controller.signal,
        })
        if (!res.ok) {
            console.warn('draftMissionBrief: réponse Gemini non OK', res.status)
            return null
        }

        const json = (await res.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[]
        }
        const content = json?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!content) return null

        const parsed = JSON.parse(content) as Partial<{
            title: unknown
            category: unknown
            description: unknown
            budgetMinXof: unknown
            budgetMaxXof: unknown
        }>

        const title = typeof parsed.title === 'string' ? parsed.title.trim() : ''
        const category = typeof parsed.category === 'string' ? parsed.category.trim() : ''
        const description = typeof parsed.description === 'string' ? parsed.description.trim() : ''
        if (!title || !description) return null

        const toBudget = (v: unknown): number | null => {
            const n = typeof v === 'number' ? v : Number(v)
            return Number.isFinite(n) && n > 0 ? Math.round(n) : null
        }
        let budgetMinXof = toBudget(parsed.budgetMinXof)
        let budgetMaxXof = toBudget(parsed.budgetMaxXof)
        // Cohérence défensive : une fourchette incohérente vaut mieux vide que fausse.
        if (budgetMinXof !== null && budgetMaxXof !== null && budgetMinXof > budgetMaxXof) {
            budgetMinXof = null
            budgetMaxXof = null
        }

        return { title, category, description, budgetMinXof, budgetMaxXof }
    } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
            console.warn('draftMissionBrief: échec', (err as Error)?.message)
        }
        return null
    } finally {
        clearTimeout(timer)
    }
}

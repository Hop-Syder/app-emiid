/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description API Route — Assistant de recherche (Couche ③, Gemini Flash-Lite).
 *              Appelée par l'annuaire quand une recherche renvoie 0 résultat.
 *              Renvoie un message + des suggestions de recherche cliquables.
 *              Non bloquant : si l'assistant est indisponible, renvoie une
 *              charge vide (l'UI ne montre alors rien de particulier).
 * @created 2026-08-21
 * @updated 2026-09-02 — bascule Groq/Llama → Gemini Flash-Lite (clé unique).
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchAssistant } from '@/lib/search-assistant'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')?.trim() || ''

        // Garde-fous : requête absente ou aberrante → pas d'appel LLM.
        if (!q || q.length < 2 || q.length > 120) {
            return NextResponse.json({ message: '', suggestions: [] })
        }

        const result = await searchAssistant(q)
        return NextResponse.json(result ?? { message: '', suggestions: [] })
    } catch {
        // Jamais d'erreur bloquante côté client.
        return NextResponse.json({ message: '', suggestions: [] })
    }
}

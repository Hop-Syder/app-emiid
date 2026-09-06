/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Transcription d'une note vocale par Gemini.
 *
 *              Même convention que lib/search-assistant : une seule clé,
 *              GEMINI_API_KEY, un modèle surchargeable, et une dégradation
 *              propre — sans clé, en cas d'erreur ou de dépassement de délai,
 *              on renvoie un texte vide plutôt qu'une erreur bloquante. La note
 *              vocale reste alors enregistrable, simplement sans texte.
 *
 *              L'audio ne transite pas par la base : il est envoyé en ligne,
 *              transcrit, puis oublié. Seul le texte est conservé.
 * @created 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { errorMessage } from '@/types/supabase-rows'

export const dynamic = 'force-dynamic'

const MODEL = process.env.GEMINI_TRANSCRIBE_MODEL || 'gemini-3.6-flash'
const ENDPOINT = (model: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

// Une dictée de note tient en quelques dizaines de secondes ; au-delà, c'est
// autre chose, et le coût comme le délai ne sont plus ceux d'un pense-bête.
const MAX_BYTES = 8 * 1024 * 1024
const TIMEOUT_MS = 20_000

const PROMPT = [
    "Transcris fidèlement cet enregistrement audio en français.",
    "Rends UNIQUEMENT le texte prononcé, sans préambule, sans guillemets,",
    "sans commentaire et sans horodatage.",
    "Ponctue normalement. Si l'audio est inaudible ou vide, réponds exactement : (inaudible)",
].join(' ')

export async function POST(request: NextRequest) {
    try {
        // Réservé aux personnes connectées (vérifié via Bearer token ou cookie)
        const { user } = await getAuthenticatedUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Connectez-vous pour dicter une note.' }, { status: 401 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.warn('[transcription] GEMINI_API_KEY absente — dictée renvoyée sans texte')
            return NextResponse.json({ text: '', degraded: true })
        }

        const form = await request.formData()
        const file = form.get('audio')
        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'Aucun audio reçu.' }, { status: 422 })
        }
        if (file.size === 0) {
            return NextResponse.json({ error: 'Enregistrement vide.' }, { status: 422 })
        }
        if (file.size > MAX_BYTES) {
            return NextResponse.json({ error: 'Enregistrement trop long (8 Mo maximum).' }, { status: 413 })
        }

        const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
        // Le navigateur ajoute souvent « ;codecs=opus » : Gemini attend le type nu.
        const mimeType = (file.type || 'audio/webm').split(';')[0]

        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

        let res: Response
        try {
            res = await fetch(ENDPOINT(MODEL), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [
                            { text: PROMPT },
                            { inline_data: { mime_type: mimeType, data: base64 } },
                        ],
                    }],
                    generationConfig: { temperature: 0, maxOutputTokens: 2048 },
                }),
            })
        } catch (e) {
            clearTimeout(timer)
            // Délai dépassé ou réseau : la note reste enregistrable sans texte.
            console.error('[transcription] appel Gemini :', errorMessage(e))
            return NextResponse.json({ text: '', degraded: true })
        }
        clearTimeout(timer)

        if (!res.ok) {
            console.error('[transcription] Gemini a répondu', res.status, (await res.text()).slice(0, 300))
            return NextResponse.json({ text: '', degraded: true })
        }

        const data = await res.json()
        const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
            .map((p: { text?: string }) => p?.text || '')
            .join('')
            .trim()

        if (!text || text === '(inaudible)') {
            return NextResponse.json({ text: '', inaudible: true })
        }

        return NextResponse.json({ text })
    } catch (error) {
        console.error('[transcription] erreur critique :', errorMessage(error))
        return NextResponse.json({ text: '', degraded: true })
    }
}

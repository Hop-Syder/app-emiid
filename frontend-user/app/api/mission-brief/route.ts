/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description API Route — Cadrage IA d'une mission (moteur Missions Courtes,
 *              Phase 2, Gemini Flash-Lite). Appelée par le formulaire de
 *              création de mission pour transformer une description libre en
 *              brouillon structuré (titre, catégorie, description, budget).
 *              Authentifiée : seul un utilisateur connecté peut déclencher un
 *              appel Gemini (coût + anti-abus), la clé GEMINI_API_KEY ne
 *              transite jamais côté client. Non bloquant : si l'assistant est
 *              indisponible, renvoie un brouillon vide, le formulaire reste
 *              utilisable manuellement.
 * @created 2026-09-16
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { draftMissionBrief } from '@/lib/mission-brief-assistant'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
        }

        const body = await request.json().catch(() => null)
        const description = typeof body?.description === 'string' ? body.description : ''

        if (!description || description.trim().length < 10 || description.length > 2000) {
            return NextResponse.json({ brief: null })
        }

        const brief = await draftMissionBrief(description)
        return NextResponse.json({ brief })
    } catch {
        // Jamais d'erreur bloquante côté client : le formulaire reste utilisable.
        return NextResponse.json({ brief: null })
    }
}

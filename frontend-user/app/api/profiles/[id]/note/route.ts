/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Note privée d'un visiteur sur un profil — lecture et écriture.
 *              Supporte les identifiants sous forme de UUID ou de slug public.
 * @created 2026-09-06
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { errorMessage } from '@/types/supabase-rows'

export const dynamic = 'force-dynamic'

const MAX = 4000

/** Résout un identifiant (slug ou UUID) vers le user_id UUID requis par profile_notes */
async function resolveProfileOwnerId(supabase: any, identifier: string): Promise<string | null> {
    const cleanId = (identifier || '').trim().toLowerCase()
    if (!cleanId) return null

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId)
    if (isUUID) return cleanId

    // 1. Recherche dans public_profiles par slug
    const { data: bySlug } = await supabase
        .from('public_profiles')
        .select('user_id')
        .eq('slug', cleanId)
        .maybeSingle()

    if (bySlug?.user_id) return bySlug.user_id

    // 2. Fallback via RPC get_public_profile
    try {
        const { data: rpcData } = await supabase.rpc('get_public_profile', { identifier: cleanId })
        if (rpcData && typeof rpcData === 'object') {
            const row = rpcData as { user_id?: string; id?: string }
            if (row.user_id) return row.user_id
            if (row.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.id)) {
                return row.id
            }
        }
    } catch {
        // Silencieux
    }

    return null
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: rawProfileId } = await ctx.params
        const { user, supabase } = await getAuthenticatedUser(request)

        // Pas connecté : pas de note, et surtout aucune erreur — le bouton
        // s'affiche simplement dans son état neutre.
        if (!user) return NextResponse.json({ note: null, canWrite: false })

        const targetUserId = await resolveProfileOwnerId(supabase, rawProfileId)
        if (!targetUserId) {
            return NextResponse.json({ note: null, canWrite: false })
        }

        const { data, error } = await supabase
            .from('profile_notes')
            .select('content, is_voice, updated_at')
            .eq('author_id', user.id)
            .eq('profile_id', targetUserId)
            .maybeSingle()

        if (error) {
            console.error('[note] lecture :', error.message)
            return NextResponse.json({ note: null, canWrite: true })
        }

        return NextResponse.json({
            note: data ? { content: data.content, isVoice: data.is_voice, updatedAt: data.updated_at } : null,
            canWrite: true,
        })
    } catch (error) {
        console.error('[note] erreur critique :', errorMessage(error))
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: rawProfileId } = await ctx.params
        const { user, supabase } = await getAuthenticatedUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Connectez-vous pour enregistrer une note.' }, { status: 401 })
        }

        const targetUserId = await resolveProfileOwnerId(supabase, rawProfileId)
        if (!targetUserId) {
            return NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 })
        }

        const body = await request.json().catch(() => null)
        const content = String(body?.content ?? '').trim()
        const isVoice = body?.isVoice === true

        if (content.length > MAX) {
            return NextResponse.json({ error: `Note trop longue (max ${MAX} caractères).` }, { status: 422 })
        }

        // Une note vidée est une note supprimée : garder une ligne vide
        // laisserait le bouton allumé pour rien.
        if (content.length === 0) {
            const { error } = await supabase
                .from('profile_notes')
                .delete()
                .eq('author_id', user.id)
                .eq('profile_id', targetUserId)
            if (error) {
                console.error('[note] suppression :', error.message)
                return NextResponse.json({ error: 'Impossible de supprimer la note.' }, { status: 400 })
            }
            return NextResponse.json({ ok: true, note: null })
        }

        const { data, error } = await supabase
            .from('profile_notes')
            .upsert(
                { author_id: user.id, profile_id: targetUserId, content, is_voice: isVoice, updated_at: new Date().toISOString() },
                { onConflict: 'author_id,profile_id' },
            )
            .select('content, is_voice, updated_at')
            .single()

        if (error) {
            console.error('[note] écriture :', error.message)
            return NextResponse.json({ error: "Impossible d'enregistrer la note." }, { status: 400 })
        }

        return NextResponse.json({
            ok: true,
            note: { content: data.content, isVoice: data.is_voice, updatedAt: data.updated_at },
        })
    } catch (error) {
        console.error('[note] erreur critique :', errorMessage(error))
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}


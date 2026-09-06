/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Note privée d'un visiteur sur un profil — lecture et écriture.
 *
 *              Un pense-bête, pas un avis : personne d'autre que son auteur ne
 *              la lit, le professionnel concerné pas davantage. La RLS de
 *              `profile_notes` l'impose (author_id = auth.uid() sur TOUS les
 *              verbes) ; cette route n'ajoute que la validation et les messages.
 * @created 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorMessage } from '@/types/supabase-rows'

export const dynamic = 'force-dynamic'

const MAX = 4000

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: profileId } = await ctx.params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        // Pas connecté : pas de note, et surtout aucune erreur — le bouton
        // s'affiche simplement dans son état neutre.
        if (!user) return NextResponse.json({ note: null, canWrite: false })

        const { data, error } = await supabase
            .from('profile_notes')
            .select('content, is_voice, updated_at')
            .eq('author_id', user.id)
            .eq('profile_id', profileId)
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
        const { id: profileId } = await ctx.params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Connectez-vous pour enregistrer une note.' }, { status: 401 })
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
                .eq('profile_id', profileId)
            if (error) {
                console.error('[note] suppression :', error.message)
                return NextResponse.json({ error: 'Impossible de supprimer la note.' }, { status: 400 })
            }
            return NextResponse.json({ ok: true, note: null })
        }

        const { data, error } = await supabase
            .from('profile_notes')
            .upsert(
                { author_id: user.id, profile_id: profileId, content, is_voice: isVoice, updated_at: new Date().toISOString() },
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

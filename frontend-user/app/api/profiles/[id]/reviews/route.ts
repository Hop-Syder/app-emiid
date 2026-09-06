/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Avis publics d'un profil — lecture, dépôt, réponse du professionnel.
 *
 *              Le droit de déposer un avis n'est PAS une affaire d'interface :
 *              il est vérifié ici ET dans la politique RLS (can_review_profile).
 *              Une clé publique détournée ne doit pas permettre d'écrire un avis
 *              de complaisance, et l'écran ne doit pas être la seule barrière.
 *
 *              La règle : avoir tenu une conversation privée de plus de dix
 *              messages avec le professionnel, avec au moins un message de
 *              chaque côté.
 * @created 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorMessage } from '@/types/supabase-rows'

export const dynamic = 'force-dynamic'

interface ReviewRow {
    id: string
    reviewer_id: string
    rating: number
    comment: string
    owner_reply: string | null
    replied_at: string | null
    created_at: string
}

/** « Il y a 3 semaines » plutôt qu'une date brute : c'est ce que lit l'écran. */
function relativeDate(iso: string): string {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
    if (days <= 0) return "Aujourd'hui"
    if (days === 1) return 'Hier'
    if (days < 7) return `Il y a ${days} jours`
    if (days < 31) {
        const w = Math.floor(days / 7)
        return `Il y a ${w} semaine${w > 1 ? 's' : ''}`
    }
    if (days < 365) {
        const m = Math.floor(days / 30)
        return `Il y a ${m} mois`
    }
    const y = Math.floor(days / 365)
    return `Il y a ${y} an${y > 1 ? 's' : ''}`
}

function initials(first?: string | null, last?: string | null): string {
    const a = (first || '').trim()[0] || ''
    const b = (last || '').trim()[0] || ''
    return (a + b).toUpperCase() || '?'
}

/** Nom d'affichage abrégé : prénom + initiale du nom, comme sur les avis publics. */
function shortName(first?: string | null, last?: string | null): string {
    const f = (first || '').trim()
    const l = (last || '').trim()
    if (!f && !l) return 'Client EmiID'
    return l ? `${f} ${l[0].toUpperCase()}.` : f
}

// ─── GET : la liste, la synthèse, et le droit du visiteur à déposer ────────
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: profileId } = await ctx.params
        const supabase = await createClient()

        const [{ data: rows, error }, { data: stats }, { data: auth }] = await Promise.all([
            supabase
                .from('profile_reviews')
                .select('id, reviewer_id, rating, comment, owner_reply, replied_at, created_at')
                .eq('profile_id', profileId)
                .eq('is_hidden', false)
                .order('created_at', { ascending: false }),
            supabase.rpc('get_profile_review_stats', { p_profile_id: profileId }),
            supabase.auth.getUser(),
        ])

        if (error) {
            console.error('[avis] lecture :', error.message)
            return NextResponse.json({ reviews: [], stats: null, canReview: false })
        }

        const list = (rows || []) as ReviewRow[]

        // Les noms viennent de user_profiles : la table d'avis ne duplique pas
        // une identité qui changerait dans son dos.
        const ids = [...new Set(list.map((r) => r.reviewer_id))]
        const names = new Map<string, { first: string | null; last: string | null }>()
        if (ids.length > 0) {
            const { data: authors } = await supabase
                .from('public_profiles')
                .select('user_id, first_name, last_name')
                .in('user_id', ids)
            for (const a of (authors || []) as { user_id: string; first_name: string | null; last_name: string | null }[]) {
                names.set(a.user_id, { first: a.first_name, last: a.last_name })
            }
        }

        const viewer = auth?.user ?? null
        let canReview = false
        let ownReviewId: string | null = null

        if (viewer && viewer.id !== profileId) {
            ownReviewId = list.find((r) => r.reviewer_id === viewer.id)?.id ?? null
            const { data: eligible } = await supabase.rpc('can_review_profile', {
                p_reviewer_id: viewer.id,
                p_profile_owner_id: profileId,
            })
            canReview = eligible === true
        }

        return NextResponse.json({
            reviews: list.map((r) => {
                const n = names.get(r.reviewer_id) || { first: null, last: null }
                return {
                    id: r.id,
                    authorName: shortName(n.first, n.last),
                    authorInitials: initials(n.first, n.last),
                    rating: r.rating,
                    date: relativeDate(r.created_at),
                    comment: r.comment,
                    // Le droit de déposer un avis PROUVE l'échange : tout avis
                    // publié vient donc d'un client vérifié, par construction.
                    isVerifiedClient: true,
                    isMine: viewer?.id === r.reviewer_id,
                    artisanResponse: r.owner_reply
                        ? { authorName: 'Réponse du professionnel', comment: r.owner_reply }
                        : undefined,
                }
            }),
            stats: stats ?? { count: 0, average: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
            canReview,
            ownReviewId,
            isOwner: viewer?.id === profileId,
        })
    } catch (error) {
        console.error('[avis] erreur critique :', errorMessage(error))
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}

// ─── POST : déposer ou mettre à jour son propre avis ───────────────────────
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: profileId } = await ctx.params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Connectez-vous pour laisser un avis.' }, { status: 401 })
        }
        if (user.id === profileId) {
            return NextResponse.json({ error: 'On ne note pas son propre profil.' }, { status: 403 })
        }

        const body = await request.json().catch(() => null)
        const rating = Number(body?.rating)
        const comment = String(body?.comment ?? '').trim()

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Note attendue entre 1 et 5.' }, { status: 422 })
        }
        if (comment.length < 10 || comment.length > 2000) {
            return NextResponse.json({ error: 'Le commentaire doit faire entre 10 et 2000 caractères.' }, { status: 422 })
        }

        // Contrôle explicite pour pouvoir expliquer le refus. La RLS le
        // rejouera de toute façon : c'est elle qui fait autorité.
        const { data: eligible } = await supabase.rpc('can_review_profile', {
            p_reviewer_id: user.id,
            p_profile_owner_id: profileId,
        })
        if (eligible !== true) {
            return NextResponse.json({
                error: "Vous devez avoir échangé plus de dix messages avec ce professionnel pour laisser un avis.",
                code: 'NOT_ELIGIBLE',
            }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('profile_reviews')
            .upsert(
                { profile_id: profileId, reviewer_id: user.id, rating, comment },
                { onConflict: 'profile_id,reviewer_id' },
            )
            .select('id')
            .single()

        if (error) {
            console.error('[avis] écriture :', error.message)
            return NextResponse.json({ error: "Impossible d'enregistrer l'avis." }, { status: 400 })
        }

        return NextResponse.json({ id: data.id, ok: true })
    } catch (error) {
        console.error('[avis] erreur critique :', errorMessage(error))
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}

// ─── PATCH : réponse du professionnel à un avis reçu ───────────────────────
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: profileId } = await ctx.params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.id !== profileId) {
            return NextResponse.json({ error: 'Seul le professionnel concerné peut répondre.' }, { status: 403 })
        }

        const body = await request.json().catch(() => null)
        const reviewId = String(body?.reviewId ?? '')
        const reply = String(body?.reply ?? '').trim()

        if (!reviewId) return NextResponse.json({ error: 'Avis non précisé.' }, { status: 422 })
        if (reply.length < 1 || reply.length > 2000) {
            return NextResponse.json({ error: 'Réponse vide ou trop longue.' }, { status: 422 })
        }

        // Le déclencheur en base empêche de toucher à la note ou au texte reçu.
        const { error } = await supabase
            .from('profile_reviews')
            .update({ owner_reply: reply })
            .eq('id', reviewId)
            .eq('profile_id', user.id)

        if (error) {
            console.error('[avis] réponse :', error.message)
            return NextResponse.json({ error: "Impossible d'enregistrer la réponse." }, { status: 400 })
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[avis] erreur critique :', errorMessage(error))
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}

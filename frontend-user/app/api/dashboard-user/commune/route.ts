/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Talents de la commune de l'utilisateur connecté.
 *
 *              Complète /api/dashboard-user/proximity, qui raisonne en ville et
 *              en GPS : ici le périmètre est la COMMUNE administrative
 *              (user_profiles.commune_id), le même découpage que les boosts
 *              payants. Les profils boostés dans cette commune remontent donc
 *              en tête — c'est leur vitrine.
 *
 *              Nécessite la migration 20260904 (commune_id exposé par la vue
 *              public_profiles, tables communes/departments lisibles).
 * @created 2026-09-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PublicProfileJoined, ProfileTagJoin, countryName, errorMessage } from '@/types/supabase-rows'

const LIMIT = 12

/** Réponse vide, mais explicite : le client sait pourquoi il n'a rien. */
function empty(reason: string) {
    return NextResponse.json({ profiles: [], commune: null, reason })
}

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return empty('not_authenticated')

        // 1. Commune de l'utilisateur — sa propre ligne, autorisée par la RLS.
        // eslint-disable-next-line no-restricted-syntax -- accès authentifié à SA propre ligne
        const { data: me, error: meError } = await supabase
            .from('user_profiles')
            .select('id, commune_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (meError) {
            console.error('[commune] lecture du profil courant :', meError.message)
            return empty('profile_unavailable')
        }
        // Une ville non reconnue laisse commune_id à NULL (cf. 20260824) : ce
        // n'est pas une anomalie, la section se masque simplement.
        if (!me?.commune_id) return empty('no_commune')

        // 2. Nom de la commune, pour l'intitulé de la section.
        const { data: commune } = await supabase
            .from('communes')
            .select('id, name')
            .eq('id', me.commune_id)
            .maybeSingle()

        // 3. Profils boostés de la commune. La RPC est SECURITY DEFINER et ne
        //    renvoie que des identifiants : un échec ne doit pas priver la
        //    section de ses profils, il la prive seulement de son classement.
        const boosted = new Set<string>()
        const { data: boostRows, error: boostError } = await supabase
            .rpc('active_boosted_profile_ids', { p_commune_id: me.commune_id })
        if (boostError) {
            console.warn('[commune] boosts indisponibles :', boostError.message)
        } else {
            for (const row of (boostRows as { profile_id: string }[] | null) || []) {
                if (row?.profile_id) boosted.add(row.profile_id)
            }
        }

        // 4. Profils publiés de la commune, l'utilisateur exclu de sa propre liste.
        const { data, error } = await supabase
            .from('public_profiles')
            .select('*, countries(name, iso_code), profile_tags(tags(name))')
            .eq('commune_id', me.commune_id)
            .neq('id', me.id)
            .order('created_at', { ascending: false })
            .limit(60)

        if (error) {
            console.error('[commune] lecture des profils :', error.message)
            return empty('profiles_unavailable')
        }

        const rows = (data || []) as unknown as PublicProfileJoined[]

        // 5. Classement : boostés d'abord, puis premium, vérifiés, et récence.
        //    Le tri se fait sur `id` (clé base), jamais sur l'identifiant rendu
        //    au client — ce sont deux valeurs différentes, cf. mapping ci-dessous.
        const rank = (p: PublicProfileJoined) =>
            (boosted.has(p.id ?? '') ? 8 : 0) +
            (p.is_premium ? 2 : 0) +
            (p.is_verified ? 1 : 0)

        const sorted = [...rows].sort((a, b) => {
            const diff = rank(b) - rank(a)
            if (diff !== 0) return diff
            return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''))
        })

        // ⚠️ L'identifiant rendu au client est `user_id` (celui des URL de profil
        //    et du cache des suivis), pas `id` (clé base utilisée ci-dessus).
        const profiles = sorted.slice(0, LIMIT).map((e) => {
            const country = countryName(e.countries)
            return {
                id: e.user_id || e.id || '0',
                slug: e.slug || undefined,
                name: (e.first_name || e.last_name)
                    ? `${e.first_name || ''} ${e.last_name || ''}`.trim()
                    : 'Membre EmiID',
                role: e.role || 'Professionnel',
                location: e.city ? `${e.city}, ${country}` : (country || 'Afrique'),
                avatar: e.avatar_url || '/profil/avatar.jpg',
                specialty: e.specialty || 'Expertise',
                category: e.category || '',
                verified: !!e.is_verified,
                premium: !!e.is_premium,
                boosted: boosted.has(e.id ?? ''),
                card_variant: e.card_variant || 'glass',
                followers: e.followers_count || 0,
                isFollowed: false,
                tags: e.profile_tags?.map((pt: ProfileTagJoin) => pt.tags?.name).filter(Boolean) || [],
            }
        })

        return NextResponse.json({
            profiles,
            commune: commune?.name ?? null,
            boostedCount: profiles.filter((p) => p.boosted).length,
        })
    } catch (error) {
        console.error('[commune] erreur critique :', errorMessage(error))
        return empty('error')
    }
}

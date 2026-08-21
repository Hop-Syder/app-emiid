/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description API Route de l'Annuaire - Recherche, Filtres & Pagination côté Serveur
 * @created 2026-06-02
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PublicProfileJoined, ProfileTagJoin, countryName, errorMessage } from '@/types/supabase-rows'
import { embedQuery } from '@/lib/embeddings'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12', 10)))
        const search = searchParams.get('search')?.trim()
        const category = searchParams.get('category')
        const activity_domain = searchParams.get('activity_domain')
        const country = searchParams.get('country')
        const city = searchParams.get('city')?.trim()
        const tags = searchParams.get('tags')?.trim()
        const onlyPremium = searchParams.get('onlyPremium') === 'true'
        const onlyVerified = searchParams.get('onlyVerified') === 'true'

        const supabase = await createClient()

        // 1. Initialisation de la requête principale sur public_profiles
        let query = supabase
            .from('public_profiles')
            .select(`
                *,
                countries(name, iso_code),
                profile_tags(tags(name))
            `, { count: 'exact' })
            
        // Tri (navigation sans recherche) : Premium → Vérifié → plus récents
        query = query.order('is_premium', { ascending: false })
                     .order('is_verified', { ascending: false })
                     .order('created_at', { ascending: false })

        // 2. Filtres simples
        if (onlyPremium) {
            query = query.eq('is_premium', true)
        }
        if (onlyVerified) {
            query = query.eq('is_verified', true)
        }

        if (category && category !== 'all') {
            query = query.ilike('category', category)
        }

        if (activity_domain && activity_domain !== 'all') {
            query = query.ilike('activity_domain', activity_domain)
        }

        if (city) {
            query = query.ilike('city', `%${city}%`)
        }

        // 3. Filtrage par pays (via country_id de public_profiles)
        if (country && country !== 'all') {
            // Trouver le country_id à partir de l'iso_code
            const { data: countryData } = await supabase
                .from('countries')
                .select('id')
                .eq('iso_code', country)
                .single()
                
            if (countryData) {
                query = query.eq('country_id', countryData.id)
            } else {
                // Si le pays n'existe pas, on retourne vide
                return NextResponse.json({ profiles: [], count: 0 })
            }
        }

        // 4. Filtrage par Tags côté serveur
        if (tags) {
            const { data: tagData } = await supabase
                .from('profile_tags')
                .select('profile_id, tags!inner(name)')
                .ilike('tags.name', `%${tags}%`)

            const profileIds = tagData
                ?.map((item: { profile_id: string }) => item.profile_id)
                .filter(Boolean) || []

            if (profileIds.length > 0) {
                query = query.in('id', profileIds)
            } else {
                return NextResponse.json({ profiles: [], count: 0 })
            }
        }

        // 5. Recherche textuelle hybride :
        //    ① FTS français + trigram + tags  → search_profile_ids()      (toujours)
        //    ② sémantique (embeddings Gemini) → match_profiles_semantic()  (si dispo)
        //    Les deux classements sont fusionnés par Reciprocal Rank Fusion
        //    (RRF), robuste aux échelles de score différentes. Si l'embedding
        //    est indisponible (pas de clé / quota / erreur), on retombe
        //    proprement sur la seule Couche ① — la recherche marche toujours.
        let rankMap: Map<string, number> | null = null
        if (search) {
            const safe = search.replace(/[,()]/g, ' ').trim()
            if (safe) {
                // ① et ② en parallèle. L'embedding échoue « en douceur » (null).
                const [ftsRes, queryVec] = await Promise.all([
                    supabase.rpc('search_profile_ids', { q: safe, max_results: 200 }),
                    embedQuery(safe),
                ])

                if (ftsRes.error) {
                    console.error('search_profile_ids RPC error:', ftsRes.error)
                }
                const ftsRows =
                    (ftsRes.data as { profile_id: string; rank: number }[] | null) || []

                // ② Recherche sémantique (uniquement si la requête a pu être embarquée).
                let semRows: { profile_id: string; similarity: number }[] = []
                if (queryVec) {
                    const { data: sem, error: semErr } = await supabase.rpc(
                        'match_profiles_semantic',
                        { query_embedding: queryVec, match_count: 100, min_similarity: 0.3 }
                    )
                    if (semErr) {
                        console.error('match_profiles_semantic RPC error:', semErr)
                    } else {
                        semRows =
                            (sem as { profile_id: string; similarity: number }[] | null) || []
                    }
                }

                // ── Fusion RRF : score(id) = Σ  poids / (K + rang_dans_la_liste) ──
                //    K amortit l'importance des tout premiers rangs ; on pondère
                //    légèrement le FTS (précision lexicale) au-dessus du sémantique.
                const K = 60
                const W_FTS = 1.0
                const W_SEM = 0.9
                const fused = new Map<string, number>()
                const addList = (
                    rows: { profile_id: string }[],
                    weight: number
                ) => {
                    rows.forEach((r, i) => {
                        const inc = weight / (K + i + 1)
                        fused.set(r.profile_id, (fused.get(r.profile_id) ?? 0) + inc)
                    })
                }
                addList(ftsRows, W_FTS)
                addList(semRows, W_SEM)

                if (fused.size === 0) {
                    return NextResponse.json({ profiles: [], count: 0 })
                }

                rankMap = fused
                query = query.in('id', Array.from(fused.keys()))
            }
        }

        // 6. Pagination. En recherche, on récupère l'ensemble fusionné classé
        //    (FTS + sémantique) puis on trie par pertinence et on pagine côté
        //    serveur (voir plus bas).
        const from = (page - 1) * limit
        const to = from + limit - 1
        if (rankMap) {
            query = query.limit(rankMap.size)
        } else {
            query = query.range(from, to)
        }

        // Execution de la requête
        const { data, count, error } = await query

        if (error) {
            console.error('Supabase query error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // En recherche : classement « pertinence d'abord + bonus statut ».
        //   score_final = pertinence × (1 + 0,30·premium + 0,15·vérifié)
        //   → un premium/vérifié pertinent remonte, mais un statut hors-sujet
        //     (pertinence ~0) reste en bas : pas de pollution des résultats.
        //   Départages à score égal : premium → vérifié → abonnés → récence.
        let rows = ((data || []) as unknown as PublicProfileJoined[])
        if (rankMap) {
            const PREMIUM_BOOST = 0.30
            const VERIFIED_BOOST = 0.15
            const finalScore = (p: PublicProfileJoined) => {
                const relevance = rankMap!.get(p.id ?? '') ?? 0
                const boost = 1
                    + (p.is_premium ? PREMIUM_BOOST : 0)
                    + (p.is_verified ? VERIFIED_BOOST : 0)
                return relevance * boost
            }
            rows = [...rows].sort((a, b) => {
                const diff = finalScore(b) - finalScore(a)
                if (Math.abs(diff) > 1e-9) return diff
                // Départages
                const premiumDiff = (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0)
                if (premiumDiff !== 0) return premiumDiff
                const verifiedDiff = (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0)
                if (verifiedDiff !== 0) return verifiedDiff
                const followersDiff = (b.followers_count ?? 0) - (a.followers_count ?? 0)
                if (followersDiff !== 0) return followersDiff
                return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''))
            })
        }

        // Transformation format retourné pour le frontend
        const formattedProfiles = rows.map((e) => {
            const profileId = e.user_id || e.id || "0"
            const country = countryName(e.countries)
            return {
                id: profileId,
                slug: e.slug || undefined,
                name: (e.first_name || e.last_name)
                    ? `${e.first_name || ""} ${e.last_name || ""}`.trim()
                    : "Utilisateur EmiID",
                role: e.role || "Membre EmiID",
                job_title: e.job_title || "",
                location: e.city
                    ? `${e.city}, ${country}`
                    : country || "Afrique ",
                avatar: e.avatar_url || "/profil/avatar.jpg",
                specialty: e.specialty || "Expertise",
                category: e.category || "",
                verified: !!e.is_verified,
                premium: !!e.is_premium,
                followers: e.followers_count || 0,
                isFollowed: false, // Sera résolu côté client si l'utilisateur est connecté
                tags: e.profile_tags?.map((pt: ProfileTagJoin) => pt.tags?.name).filter(Boolean) || [],
            }
        })

        return NextResponse.json({
            profiles: rankMap ? formattedProfiles.slice(from, to + 1) : formattedProfiles,
            count: rankMap ? formattedProfiles.length : (count || 0),
        })

    } catch (error) {
        console.error('Annuaire route critical error:', error)
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}

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
import { extractSearchTerms } from '@/lib/search-terms'

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
        
        const lat = searchParams.get('lat')
        const lng = searchParams.get('lng')
        const radius = searchParams.get('radius')

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

        // 4 bis. Boosts communaux (Score 4 du cadrage) : si la recherche cible une
        //    ville, on récupère les profils dont le boost est actif dans cette
        //    commune. Résolution tolérante aux accents/casse via resolve_commune_id.
        //    Deux portées : boost sur la commune exacte (Score 4) et boost sur son
        //    département (Score 3), pondérés différemment.
        const boostedCommune: Set<string> = new Set()
        const boostedDepartment: Set<string> = new Set()
        if (city) {
            const { data: communeId } = await supabase.rpc('resolve_commune_id', { p_label: city })
            if (communeId) {
                const { data: boosted } = await supabase
                    .rpc('active_boosted_profile_ids', { p_commune_id: communeId as string })
                for (const b of (boosted as { profile_id: string; scope: string }[] | null) || []) {
                    if (b.scope === 'COMMUNE') boostedCommune.add(b.profile_id)
                    else boostedDepartment.add(b.profile_id)
                }
            }
        }
        // Un profil boosté au niveau communal l'emporte : on ne cumule pas.
        const isBoosted = (id: string) => boostedCommune.has(id) || boostedDepartment.has(id)

        // 5. Recherche textuelle hybride :
        //    ① FTS français + trigram + tags  → search_profile_ids()      (toujours)
        //    ② sémantique (embeddings Gemini) → match_profiles_semantic()  (si dispo)
        //    Les deux classements sont fusionnés par Reciprocal Rank Fusion
        //    (RRF), robuste aux échelles de score différentes. Si l'embedding
        //    est indisponible (pas de clé / quota / erreur), on retombe
        //    proprement sur la seule Couche ① — la recherche marche toujours.
        let rankMap: Map<string, number> | null = null
        // Vrai quand aucune couche de recherche n'a pu répondre (panne RPC) : on le
        // distingue d'une recherche qui a bien tourné sans rien trouver.
        let searchDegraded = false
        if (search) {
            const safe = search.replace(/[,()]/g, ' ').trim()
            if (safe) {
                // ① et ② en parallèle. L'embedding échoue « en douceur » (null).
                const [ftsRes, queryVec] = await Promise.all([
                    supabase.rpc('search_profile_ids', { q: safe, max_results: 200 }),
                    embedQuery(safe),
                ])

                const ftsFailed = !!ftsRes.error
                if (ftsFailed) {
                    console.error('search_profile_ids RPC error:', ftsRes.error)
                }
                const ftsRows =
                    (ftsRes.data as { profile_id: string; rank: number }[] | null) || []

                // ② Recherche sémantique (uniquement si la requête a pu être embarquée).
                let semRows: { profile_id: string; similarity: number }[] = []
                // Sans clé d'embedding, la couche ② n'est pas « en panne » : elle est
                // hors service par configuration. Seul un échec du RPC compte comme panne.
                let semFailed = false
                if (queryVec) {
                    const { data: sem, error: semErr } = await supabase.rpc(
                        'match_profiles_semantic',
                        { query_embedding: queryVec, match_count: 100, min_similarity: 0.3 }
                    )
                    if (semErr) {
                        console.error('match_profiles_semantic RPC error:', semErr)
                        semFailed = true
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
                    // Deux situations très différentes aboutissaient ici à la même
                    // page vide. Le 29-30/08, un REVOKE de privilèges a cassé les deux
                    // RPC (42501 sur search_vector / embedding) et la recherche a
                    // silencieusement affiché « aucun résultat » pendant des jours.
                    // Une panne d'infrastructure ne doit jamais être présentée à
                    // l'utilisateur comme une absence de profils.
                    const noLayerAnswered = ftsFailed && (!queryVec || semFailed)
                    if (!noLayerAnswered) {
                        // Les couches ont répondu : il n'existe réellement aucun profil.
                        return NextResponse.json({ profiles: [], count: 0 })
                    }

                    // ③ Filet de sécurité lexical : ILIKE sur les colonnes que la vue
                    //    public_profiles expose déjà à tous. Moins pertinent que le FTS,
                    //    mais il tient debout sans aucune RPC — la recherche continue de
                    //    rendre des profils même si la base refuse les fonctions.
                    searchDegraded = true
                    const terms = extractSearchTerms(safe)
                    if (terms.length === 0) {
                        return NextResponse.json({ profiles: [], count: 0, degraded: true })
                    }
                    const FALLBACK_COLUMNS = [
                        'first_name', 'last_name', 'role', 'specialty',
                        'category', 'activity_domain', 'job_title', 'city', 'bio',
                    ]
                    // Un profil correspond dès qu'un terme touche une colonne (OR),
                    // à l'image de la variante permissive du FTS.
                    const orFilter = terms
                        .flatMap((term) => FALLBACK_COLUMNS.map((col) => `${col}.ilike.%${term}%`))
                        .join(',')
                    query = query.or(orFilter)
                } else {
                    rankMap = fused
                    query = query.in('id', Array.from(fused.keys()))
                }
            }
        }

        // 5 bis. Proximité (Autour de moi)
        let proximityMap: Map<string, number> | null = null
        if (lat && lng) {
            const radius_km = radius ? parseFloat(radius) : 50
            const { data: prox, error: proxErr } = await supabase.rpc('search_profiles_by_proximity', {
                p_lat: parseFloat(lat),
                p_lng: parseFloat(lng),
                p_radius_km: radius_km
            })
            if (proxErr) {
                console.error('search_profiles_by_proximity RPC error:', proxErr)
            } else {
                proximityMap = new Map()
                for (const row of (prox as { profile_id: string; distance_km: number }[] | null) || []) {
                    proximityMap.set(row.profile_id, row.distance_km)
                }
                
                if (proximityMap.size > 0) {
                    // Si un filtre de texte est déjà actif, on réduit l'intersection
                    if (rankMap) {
                        const newFused = new Map<string, number>()
                        for (const id of Array.from(proximityMap.keys())) {
                            if (rankMap.has(id)) {
                                newFused.set(id, rankMap.get(id)!)
                            }
                        }
                        rankMap = newFused
                        if (rankMap.size === 0) {
                            return NextResponse.json({ profiles: [], count: 0 })
                        }
                        // La clause 'in' précédente avec les IDs fusionnés sera écrasée, 
                        // il vaudrait mieux utiliser un filtre supplémentaire ou remplacer.
                        // Supabase empile les eq/in. Donc un deuxième 'in' fonctionne comme un AND.
                        query = query.in('id', Array.from(rankMap.keys()))
                    } else {
                        query = query.in('id', Array.from(proximityMap.keys()))
                    }
                } else {
                    return NextResponse.json({ profiles: [], count: 0 })
                }
            }
        }

        // 6. Pagination. En recherche, on récupère l'ensemble fusionné classé
        //    (FTS + sémantique + proximité) puis on trie par pertinence et on pagine côté
        //    serveur (voir plus bas).
        const from = (page - 1) * limit
        const to = from + limit - 1
        if (rankMap || proximityMap) {
            query = query.limit(rankMap ? rankMap.size : (proximityMap ? proximityMap.size : 100))
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
        // Hors recherche : les profils boostés de la commune passent en tête.
        if (!rankMap && !proximityMap && (boostedCommune.size > 0 || boostedDepartment.size > 0)) {
            const geoRank = (id: string) =>
                boostedCommune.has(id) ? 2 : boostedDepartment.has(id) ? 1 : 0
            rows = [...rows].sort((a, b) => geoRank(b.id ?? '') - geoRank(a.id ?? ''))
        }
        if (rankMap || proximityMap) {
            // Boost payant : bonus nettement supérieur au statut, pour placer le
            // profil en tête de sa commune. Multiplicatif comme les autres : un
            // profil boosté hors-sujet (pertinence nulle) n'est pas remonté —
            // on ne montre pas un couturier quand on cherche un électricien.
            const COMMUNE_BOOST = 1.20   // Score 4 : ciblage le plus fin
            const DEPARTMENT_BOOST = 0.70 // Score 3 : au-dessus du premium, sous le communal
            const PREMIUM_BOOST = 0.30
            const VERIFIED_BOOST = 0.15
            const finalScore = (p: PublicProfileJoined) => {
                const id = p.id ?? ''
                const relevance = rankMap ? (rankMap.get(id) ?? 0) : 100 // Score de base arbitraire si pas de FTS
                const geo = boostedCommune.has(id)
                    ? COMMUNE_BOOST
                    : boostedDepartment.has(id)
                        ? DEPARTMENT_BOOST
                        : 0
                        
                const dist = proximityMap ? (proximityMap.get(id) ?? 50) : 50
                // Bonus de distance (ex: 50km = 0, 0km = 1). Multiplié par 0.5 pour modérer l'impact global.
                const distanceBonus = proximityMap ? Math.max(0, (50 - dist) / 50) * 0.5 : 0

                const boost = 1 + geo + distanceBonus
                    + (p.is_premium ? PREMIUM_BOOST : 0)
                    + (p.is_verified ? VERIFIED_BOOST : 0)
                return relevance * boost
            }
            rows = [...rows].sort((a, b) => {
                const diff = finalScore(b) - finalScore(a)
                if (Math.abs(diff) > 1e-9) return diff
                // Départages : boost communal, puis départemental, puis statut
                const communeDiff =
                    (boostedCommune.has(b.id ?? '') ? 1 : 0) - (boostedCommune.has(a.id ?? '') ? 1 : 0)
                if (communeDiff !== 0) return communeDiff
                const deptDiff =
                    (boostedDepartment.has(b.id ?? '') ? 1 : 0) - (boostedDepartment.has(a.id ?? '') ? 1 : 0)
                if (deptDiff !== 0) return deptDiff
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
            // ⚠️ Deux identifiants coexistent et ne sont PAS interchangeables :
            //    • `user_profiles.id`  → clé manipulée en base (RPC de recherche,
            //      boosts, profile_tags) et par tous les filtres `.in('id', …)` ci-dessus ;
            //    • `user_profiles.user_id` → clé exposée au client, celle qu'utilisent
            //      les URLs de profil et le cache des suivis (cf. fetchFollowedIds).
            //    La conversion se fait ici, et seulement ici. Ne jamais réinjecter un id
            //    venu du client dans un filtre `.in('id', …)` : il ne correspondrait à rien.
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
                is_nomad: !!e.is_nomad,
                // Mise en vedette payante dans la commune recherchée (spec §2.A).
                boosted: isBoosted(e.id ?? ''),
                followers: e.followers_count || 0,
                isFollowed: false, // Sera résolu côté client si l'utilisateur est connecté
                tags: e.profile_tags?.map((pt: ProfileTagJoin) => pt.tags?.name).filter(Boolean) || [],
            }
        })

        return NextResponse.json({
            profiles: (rankMap || proximityMap) ? formattedProfiles.slice(from, to + 1) : formattedProfiles,
            count: (rankMap || proximityMap) ? formattedProfiles.length : (count || 0),
            // Signale au client que le classement par pertinence était indisponible
            // et que ces résultats viennent du filet lexical (couche ③).
            ...(searchDegraded ? { degraded: true } : {}),
        })

    } catch (error) {
        console.error('Annuaire route critical error:', error)
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 })
    }
}

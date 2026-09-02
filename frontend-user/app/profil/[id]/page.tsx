/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de profil public ou privé d'un utilisateur
 * @created 2026-06-03
 * @updated 2026-06-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { Metadata } from "next"
import { cache } from "react"
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import { ProfileDetailContent } from "@/components/profile-detail/profile-detail-content"
import { createClient } from "@/lib/supabase/server"
import { SITE_URL, serializeJsonLd } from "@/lib/seo"
import { PublicProfileJoined, ProfileTagJoin } from "@/types/supabase-rows"

interface ProfilePageProps {
    params: Promise<{ id: string }>
}

// Cache persistant cross-request pour les profils publics (sans cookies/auth)
export const getCachedPublicProfile = unstable_cache(
    async (idOrSlug: string, isUUID: boolean) => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        
        // Import dynamique pour éviter de charger le SDK lourd côté serveur inutilement
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
        const client = createSupabaseClient(supabaseUrl, supabaseAnonKey)
        
        const profileSelect = `
            first_name, 
            last_name, 
            specialty,
            role,
            bio,
            city,
            slug,
            avatar_url,
            profile_tags(tags(name))
        `
        
        let publicQuery = client
            .from('public_profiles')
            .select(profileSelect)

        if (isUUID) {
            publicQuery = publicQuery.or(`slug.eq.${idOrSlug},user_id.eq.${idOrSlug},id.eq.${idOrSlug}`)
        } else {
            publicQuery = publicQuery.eq('slug', idOrSlug)
        }

        const { data, error } = await publicQuery.maybeSingle()
        if (error) {
            console.error("[getCachedPublicProfile] Error querying public_profiles:", error)
            return null
        }
        return data
    },
    ['public-profile'],
    { tags: ['profile'], revalidate: 3600 }
)

// Déduplication de requête au cours d'un même rendu (generateMetadata + Page)
export const getProfileForRequest = cache(async (idOrSlug: string) => {
    const cleanId = idOrSlug.toLowerCase()
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId)
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let data: PublicProfileJoined | null = null
    
    if (user) {
        // Si utilisateur connecté, on tente la table privée user_profiles
        // eslint-disable-next-line no-restricted-syntax -- gardé par if(user) : lecture authentifiée de SON profil, fallback public_profiles ensuite
        let query = supabase
            .from('user_profiles')
            .select(`
                first_name, 
                last_name, 
                specialty,
                role,
                bio,
                city,
                slug,
                avatar_url,
                profile_tags(tags(name))
            `)

        if (isUUID) {
            query = query.or(`slug.eq.${cleanId},user_id.eq.${cleanId},id.eq.${cleanId}`)
        } else {
            query = query.eq('slug', cleanId)
        }

        const { data: userData, error } = await query.maybeSingle()
        if (!error && userData) {
            data = userData as unknown as PublicProfileJoined
        }
    }
    
    // Repli sur le cache public si non trouvé dans la table privée
    if (!data) {
        data = await getCachedPublicProfile(cleanId, isUUID) as unknown as PublicProfileJoined
    }
    
    return data
})

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const { id } = await params
    
    try {
        const data = await getProfileForRequest(id)
        if (!data) {
            return {
                title: 'Profil non trouvé | EmiID'
            }
        }

        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()
        const tagsList = data.profile_tags?.map((pt: ProfileTagJoin) => pt.tags?.name).filter(Boolean) || []
        const seoKeywords = [
            fullName,
            data.specialty,
            data.role,
            "EmiID",
            "Réseau Professionnel",
            "Afrique",
            ...tagsList
        ].filter(Boolean).join(', ')

        const description = data.bio 
            ? (data.bio.length > 150 ? data.bio.substring(0, 147) + '...' : data.bio)
            : `Découvrez le profil de ${fullName}, expert en ${data.specialty || data.role || 'son domaine'} sur EmiID.`

        const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://app.emiid.com'}/api/og/profile?id=${id}`
        const fallbackLogoUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://app.emiid.com'}/logo-emiid-bleu-blanc.png`

        return {
            title: `${fullName} - ${data.role || 'Profil'} | EmiID`,
            description: description,
            keywords: seoKeywords,
            // URL canonique (slug si dispo) : évite le contenu dupliqué entre
            // /profil/{slug}, /profil/{user_id} et /profil/{id}.
            alternates: {
                canonical: `/profil/${data.slug || id}`,
            },
            openGraph: {
                title: `${fullName} — Profil certifié sur EmiID`,
                description: description,
                url: `/profil/${data.slug || id}`,
                siteName: 'EmiID',
                locale: 'fr_FR',
                type: 'profile',
                // Propriétés structurées du type « profile » (spec Open Graph,
                // namespace http://ogp.me/ns/profile#) : identité explicite
                // pour les consommateurs du graphe social.
                firstName: data.first_name || undefined,
                lastName: data.last_name || undefined,
                username: data.slug || undefined,
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: `Carte de profil de ${fullName}`,
                    },
                    {
                        url: fallbackLogoUrl,
                        width: 500,
                        height: 500,
                        alt: `EmiID - ${fullName}`,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${fullName} sur EmiID`,
                description: description,
                creator: '@hopsyder',
                images: [ogImageUrl, fallbackLogoUrl],
            }
        }
    } catch {
        return {
            title: 'Profil | EmiID',
            openGraph: {
                images: ['/logo-emiid-bleu-blanc.png']
            }
        }
    }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params
    const data = await getProfileForRequest(id)

    // Profil inexistant, dépublié ou suspendu → 404 HTTP réel (via not-found).
    // Répondre 200 avec l'UI « introuvable » serait un soft-404 : Google
    // conserverait ces URL vides dans l'index alors qu'elles sont listées au
    // sitemap. notFound() est typé never → data est non-nulle ci-dessous.
    if (!data) notFound()

    // Origine canonique unique (voir lib/seo.ts) : les @id JSON-LD doivent
    // matcher la canonical servie, pas un domaine qui redirige.
    const baseUrl = SITE_URL
    const fullName = data ? `${data.first_name || ''} ${data.last_name || ''}`.trim() : ''
    const skills: string[] = data?.profile_tags?.map((pt: ProfileTagJoin) => pt.tags?.name).filter((n): n is string => Boolean(n)) || []

    // Données structurées ProfilePage + Person pour Google Rich Results
    const jsonLd = data ? {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'ProfilePage',
                '@id': `${baseUrl}/profil/${data.slug || id}#webpage`,
                url: `${baseUrl}/profil/${data.slug || id}`,
                name: `${fullName} — EmiID`,
                isPartOf: {
                    '@type': 'WebSite',
                    '@id': `${baseUrl}/#website`,
                    name: 'EmiID',
                    url: baseUrl,
                },
                mainEntity: {
                    '@id': `${baseUrl}/profil/${data.slug || id}#person`,
                },
            },
            {
                '@type': 'Person',
                '@id': `${baseUrl}/profil/${data.slug || id}#person`,
                name: fullName,
                jobTitle: data.role || data.specialty || undefined,
                description: data.bio || undefined,
                image: data.avatar_url || `${baseUrl}/logo-emiid-bleu-blanc.png`,
                url: `${baseUrl}/profil/${data.slug || id}`,
                ...(skills.length ? { knowsAbout: skills } : {}),
                ...(data.city ? { areaServed: { '@type': 'City', name: data.city } } : {}),
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: data.city || 'Afrique',
                    addressCountry: 'BJ'
                },
                memberOf: {
                    '@type': 'Organization',
                    name: 'EmiID',
                    url: baseUrl,
                    logo: `${baseUrl}/logo-emiid-bleu-blanc.png`
                }
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Accueil',
                        item: baseUrl,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Annuaire',
                        item: `${baseUrl}/annuaire`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: fullName,
                        item: `${baseUrl}/profil/${data.slug || id}`,
                    }
                ]
            }
        ]
    } : null

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
                />
            )}
            <ProfileDetailContent profileId={id} />
        </>
    )
}

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
import { unstable_cache } from "next/cache"
import { ProfileDetailContent } from "@/components/profile-detail/profile-detail-content"
import { createClient } from "@/lib/supabase/server"
import { PublicProfileJoined, ProfileTagJoin } from "@/types/supabase-rows"

// Sérialise un objet JSON-LD de façon sûre : échappe < et > pour
// empêcher une injection </script> via le contenu utilisateur.
function serializeJsonLd(data: unknown): string {
    return JSON.stringify(data)
        .split('<').join('\u003c')
        .split('>').join('\u003e')
}

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
                title: `${fullName} sur EmiID`,
                description: description,
                type: 'profile',
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: `Carte de profil de ${fullName}`,
                    }
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${fullName} sur EmiID`,
                description: description,
                images: [ogImageUrl],
            }
        }
    } catch {
        return {
            title: 'Profil | EmiID'
        }
    }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params
    const data = await getProfileForRequest(id)

    const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://app.emiid.com'
    const fullName = data ? `${data.first_name || ''} ${data.last_name || ''}`.trim() : ''
    const skills: string[] = data?.profile_tags?.map((pt: ProfileTagJoin) => pt.tags?.name).filter((n): n is string => Boolean(n)) || []

    const jsonLd = data ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: fullName,
        jobTitle: data.role || data.specialty || undefined,
        description: data.bio || undefined,
        image: data.avatar_url || undefined,
        url: `${baseUrl}/profil/${data.slug || id}`,
        ...(skills.length ? { knowsAbout: skills } : {}),
        address: {
            '@type': 'PostalAddress',
            addressLocality: data.city || 'Afrique'
        }
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

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
import { ProfileDetailContent } from "@/components/profile-detail/profile-detail-content"
import { createClient } from "@/lib/supabase/server"

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

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const { id } = await params
    const cleanId = id.toLowerCase()
    const supabase = await createClient()

    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId);
        const profileSelect = `
            first_name, 
            last_name, 
            specialty,
            role,
            bio,
            profile_tags(tags(name))
        `

        let ownerQuery = supabase
            .from('user_profiles')
            .select(profileSelect)

        if (isUUID) {
            ownerQuery = ownerQuery.or(`slug.eq.${cleanId},user_id.eq.${cleanId},id.eq.${cleanId}`)
        } else {
            ownerQuery = ownerQuery.eq('slug', cleanId)
        }

        const ownerRes = await ownerQuery.maybeSingle()
        let data: any = ownerRes.data

        if (!data) {
            let publicQuery = supabase
                .from('public_profiles')
                .select(profileSelect)

            if (isUUID) {
                publicQuery = publicQuery.or(`slug.eq.${cleanId},user_id.eq.${cleanId},id.eq.${cleanId}`)
            } else {
                publicQuery = publicQuery.eq('slug', cleanId)
            }

            const publicRes = await publicQuery.maybeSingle()
            data = publicRes.data
        }

        if (!data) {
            return {
                title: 'Profil non trouvé | EmiID'
            }
        }

        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()
        const tagsList = data.profile_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || []
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
    } catch (_e) {
        return {
            title: 'Profil | EmiID'
        }
    }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params
    const cleanId = id.toLowerCase()
    const supabase = await createClient()
    
    let data: any;
    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId);
        
        // 1. Tenter de lire directement la table user_profiles (fonctionnera si c'est le profil du propriétaire connecté)
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

        let { data: userData, error } = await query.single()
        data = userData

        // 2. Repli sur la vue public_profiles pour les tiers ou visiteurs anonymes
        if (error || !data) {
            let publicQuery = supabase
                .from('public_profiles')
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
                publicQuery = publicQuery.or(`slug.eq.${cleanId},user_id.eq.${cleanId},id.eq.${cleanId}`)
            } else {
                publicQuery = publicQuery.eq('slug', cleanId)
            }

            const { data: publicData } = await publicQuery.single()
            data = publicData
        }
    } catch (e) {
        // Handle error silently
    }

    const jsonLd = data ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        jobTitle: data.role || data.specialty,
        description: data.bio,
        address: {
            '@type': 'PostalAddress',
            addressLocality: data.city || 'Afrique'
        }
    } : null

    return (
        <>            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
                />
            )}
            <ProfileDetailContent profileId={id} />
        </>
    )
}

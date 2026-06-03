import { Metadata } from "next"
import { ProfileDetailContent } from "@/components/profile-detail/profile-detail-content"
import { createClient } from "@/lib/supabase/server"

interface ProfilePageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const { id } = await params
    const cleanId = id.toLowerCase()
    const supabase = await createClient()

    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId);
        let query = supabase
            .from('public_profiles')
            .select(`
                first_name, 
                last_name, 
                specialty,
                role,
                bio,
                profile_tags(tags(name))
            `)

        if (isUUID) {
            query = query.or(`slug.eq.${cleanId},user_id.eq.${cleanId}`)
        } else {
            query = query.eq('slug', cleanId)
        }

        const { data } = await query.single()

        if (!data) {
            return {
                title: 'Profil non trouvé | EmiID'
            }
        }

        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()
        
        // Extraction des tags pour enrichir le SEO
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
    
    // Fetch base info for JSON-LD (deduped by Next.js/Supabase SSR)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId);
    let query = supabase
        .from('public_profiles')
        .select(`first_name, last_name, specialty, role, city, bio`)

    if (isUUID) {
        query = query.or(`slug.eq.${cleanId},user_id.eq.${cleanId}`)
    } else {
        query = query.eq('slug', cleanId)
    }

    const { data } = await query.single()

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
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    // Échappe < / > et 2028/2029 pour empêcher un "</script>" injecté
                    // via first_name/last_name/bio de casser le parser et introduire du XSS.
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd)
                            .replace(/</g, '\\u003c')
                            .replace(/>/g, '\\u003e')
                            .replace(/\u2028/g, '\\u2028')
                            .replace(/\u2029/g, '\\u2029'),
                    }}
                />
            )}
            <ProfileDetailContent profileId={id} />
        </>
    )
}

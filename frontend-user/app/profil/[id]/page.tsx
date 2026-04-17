import { Metadata } from "next"
import { ProfileDetailContent } from "@/components/profile-detail/profile-detail-content"
import { createClient } from "@/lib/supabase/server"

interface ProfilePageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()

    try {
        const { data } = await supabase
            .from('user_profiles')
            .select(`
                first_name, 
                last_name, 
                specialty,
                role,
                bio,
                profile_tags(tags(name))
            `)
            .eq('id', id)
            .single()

        if (!data) {
            return {
                title: 'Profil non trouvé | Nexus Connect'
            }
        }

        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()
        
        // Extraction des tags pour enrichir le SEO
        const tagsList = data.profile_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || []
        
        const seoKeywords = [
            fullName,
            data.specialty,
            data.role,
            "Nexus Connect",
            "Réseau Professionnel",
            "Afrique",
            ...tagsList
        ].filter(Boolean).join(', ')

        const description = data.bio 
            ? (data.bio.length > 150 ? data.bio.substring(0, 147) + '...' : data.bio)
            : `Découvrez le profil de ${fullName}, expert en ${data.specialty || data.role || 'son domaine'} sur Nexus Connect.`

        const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://app-nexus-connect.vercel.app'}/api/og/profile?id=${id}`

        return {
            title: `${fullName} - ${data.role || 'Profil'} | Nexus Connect`,
            description: description,
            keywords: seoKeywords,
            openGraph: {
                title: `${fullName} sur Nexus Connect`,
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
                title: `${fullName} sur Nexus Connect`,
                description: description,
                images: [ogImageUrl],
            }
        }
    } catch (e) {
        return {
            title: 'Profil | Nexus Connect'
        }
    }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params
    const supabase = await createClient()
    
    // Fetch base info for JSON-LD (deduped by Next.js/Supabase SSR)
    const { data } = await supabase
        .from('user_profiles')
        .select(`first_name, last_name, specialty, role, city, bio`)
        .eq('id', id)
        .single()

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
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <ProfileDetailContent profileId={id} />
        </>
    )
}

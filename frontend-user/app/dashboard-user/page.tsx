/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page dashboard-user (après connexion)
 * @created 2025-12-24
 * @updated 2025-12-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { DashboardHubContent } from "@/components/dashboard-user-content/dashboard-hub"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 60 // ISR 60s

async function fetchInitialDirectoryProfiles(supabase: any) {
    const { data, error } = await supabase
        .from('public_profiles')
        .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error || !data) return []
    return mapProfiles(data)
}

async function fetchCuratedProfiles(supabase: any, filter: string, limit: number) {
    let query = supabase
        .from('public_profiles')
        .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
        .limit(limit)

    if (filter === 'premium') {
        query = query.eq('is_premium', true)
    } else if (filter === 'new') {
        query = query.order('created_at', { ascending: false })
    } else if (filter === 'verified') {
        query = query.eq('is_verified', true)
    }

    const { data, error } = await query
    if (error || !data) return []
    return mapProfiles(data)
}

function mapProfiles(data: any[]) {
    return data.map((e: any) => {
        const profileId = e.user_id || e.id || "0"
        return {
            id: profileId,
            name: (e.first_name || e.last_name) ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : "Membre EmiID",
            role: e.role || "Professionnel",
            location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique"),
            avatar: e.avatar_url || "/profil/avatar.jpg",
            specialty: e.specialty || "Expertise",
            category: e.category || "",
            verified: !!e.is_verified,
            premium: !!e.is_premium,
            card_variant: e.card_variant || 'glass',
            followers: e.followers_count || 0,
            isFollowed: false, // Sera mis à jour côté client
            tags: e.profile_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || []
        }
    })
}

export default async function DashboardPage() {
    const supabase = await createClient()

    // Requêtes en parallèle pour éviter le waterfall
    const [
        initialDirectoryProfiles,
        premiumProfiles,
        newProfiles,
        verifiedProfiles
    ] = await Promise.all([
        fetchInitialDirectoryProfiles(supabase),
        fetchCuratedProfiles(supabase, 'premium', 6),
        fetchCuratedProfiles(supabase, 'new', 6),
        fetchCuratedProfiles(supabase, 'verified', 6),
    ])

    return (
        <div className="flex-1 w-full min-h-screen flex flex-col">
            <DashboardHubContent 
                initialDirectoryProfiles={initialDirectoryProfiles} 
                initialPremiumProfiles={premiumProfiles}
                initialNewProfiles={newProfiles}
                initialVerifiedProfiles={verifiedProfiles}
            />
        </div>
    )
}

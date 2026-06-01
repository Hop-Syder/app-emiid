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

// Utilitaire pour mélanger un tableau
function shuffleArray(array: any[]) {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

async function fetchCuratedProfiles(supabase: any, filter: string, limit: number) {
    let query = supabase
        .from('public_profiles')
        .select(`*, countries(name, iso_code), profile_tags(tags(name))`)

    if (filter === 'premium') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        // 1. On tente de récupérer tous les profils premium des 30 derniers jours
        const { data: recentPremium, error: premiumError } = await supabase
            .from('public_profiles')
            .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
            .eq('is_premium', true)
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false })

        // 2. Fallback : S'il y a très peu de premium récents, ou une erreur sur la date, on prend les 50 derniers globaux
        if (premiumError || !recentPremium || recentPremium.length < 8) {
            const { data: fallbackPremium, error: fallbackError } = await supabase
                .from('public_profiles')
                .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                .eq('is_premium', true)
                .order('created_at', { ascending: false })
                .limit(50)
            
            if (fallbackError || !fallbackPremium) return []
            return mapProfiles(shuffleArray(fallbackPremium))
        }

        return mapProfiles(recentPremium)

    } else if (filter === 'new') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        // 1. On tente de récupérer tous les profils des 30 derniers jours
        const { data: recentData, error: recentError } = await supabase
            .from('public_profiles')
            .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false })

        // 2. Fallback : S'il y a très peu d'inscrits récents, ou une erreur sur la date, on prend les 50 derniers globaux
        if (recentError || !recentData || recentData.length < 8) {
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('public_profiles')
                .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                .order('created_at', { ascending: false })
                .limit(50)
            
            if (fallbackError || !fallbackData) return []
            return mapProfiles(shuffleArray(fallbackData))
        }

        return mapProfiles(recentData)

    } else if (filter === 'verified') {
        query = query.eq('is_verified', true).limit(limit)
        const { data, error } = await query
        
        if (error || !data || data.length < 8) {
            const { data: fallbackData } = await supabase
                .from('public_profiles')
                .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                .order('created_at', { ascending: false })
                .limit(50)
            return mapProfiles(shuffleArray(fallbackData || []))
        }
        return mapProfiles(data)
    } else {
        query = query.limit(limit)
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
        initialPremiumProfiles,
        initialNewProfiles,
        initialVerifiedProfiles
    ] = await Promise.all([
        fetchCuratedProfiles(supabase, 'premium', 8),
        fetchCuratedProfiles(supabase, 'new', 8),
        fetchCuratedProfiles(supabase, 'verified', 8)
    ])

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHubContent 
                initialPremiumProfiles={initialPremiumProfiles} 
                initialNewProfiles={initialNewProfiles}
                initialVerifiedProfiles={initialVerifiedProfiles}
            />
        </div>
    )
}

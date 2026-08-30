/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page dashboard-user (après connexion)
 * @created 2025-12-24
 * @updated 2026-06-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { DashboardHubContent } from "@/components/dashboard-user-content/dashboard-hub"
import { createClient } from "@/lib/supabase/server"
import { PublicProfileJoined, CountryJoin, countryName, tagNames } from "@/types/supabase-rows"

type SupabaseServer = Awaited<ReturnType<typeof createClient>>

export const revalidate = 60 // ISR 60s


// Utilitaire pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

async function fetchCuratedProfiles(supabase: SupabaseServer, filter: string, limit: number) {
    const query = supabase
        .from('public_profiles')
        .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
        .eq('is_published', true)

    if (filter === 'premium') {
        const { data: premiumData, error } = await query
            .eq('is_premium', true)
            .order('created_at', { ascending: false })
            .limit(50)
            
        if (error || !premiumData) return []
        // On mélange seulement les premium pour avoir de la variété, mais on prend juste la limite
        return mapProfiles(shuffleArray(premiumData as unknown as PublicProfileJoined[]).slice(0, limit))

    } else if (filter === 'new') {
        // Pour "Nouveaux Talents", on veut TOUJOURS les plus récents, sans aucun mélange
        const { data: newData, error } = await query
            .order('created_at', { ascending: false })
            .limit(limit)
            
        if (error || !newData) return []
        return mapProfiles(newData as unknown as PublicProfileJoined[])

    } else if (filter === 'verified') {
        const { data: verifiedData, error } = await query
            .eq('is_verified', true)
            .order('created_at', { ascending: false })
            .limit(50)
            
        if (error || !verifiedData) return []
        return mapProfiles(shuffleArray(verifiedData as unknown as PublicProfileJoined[]).slice(0, limit))
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit)
        
    if (error || !data) return []
    return mapProfiles(data as unknown as PublicProfileJoined[])
}

function mapProfiles(data: PublicProfileJoined[]) {
    return data.map((e) => {
        const profileId = e.user_id || e.id || "0"
        const country = countryName(e.countries)
        return {
            id: profileId,
            slug: e.slug || undefined,
            name: (e.first_name || e.last_name) ? `${e.first_name || ''} ${e.last_name || ''}`.trim() : "Membre EmiID",
            role: e.role || "Professionnel",
            location: e.city ? `${e.city}, ${country}` : (country || "Afrique"),
            avatar: e.avatar_url || "/profil/avatar.jpg",
            specialty: e.specialty || "Expertise",
            category: e.category || "",
            verified: !!e.is_verified,
            premium: !!e.is_premium,
            card_variant: e.card_variant || 'glass',
            followers: e.followers_count || 0,
            isFollowed: false, // Sera mis à jour côté client
            tags: tagNames(e.profile_tags)
        }
    })
}

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Récupérer l'utilisateur courant et sa localisation
    const { data: { user } } = await supabase.auth.getUser()
    let userLocation = null;
    let proximityProfiles: PublicProfileJoined[] = [];
    
    if (user) {
        const { data: userProfile } = await supabase
            .from('public_profiles')
            .select('city, country_id, countries(name)')
            .eq('user_id', user.id)
            .single()
            
        if (userProfile && (userProfile.city || userProfile.country_id)) {
            const countryLabel = countryName(userProfile.countries as unknown as CountryJoin | CountryJoin[] | null);

            userLocation = {
                city: userProfile.city,
                country_id: userProfile.country_id,
                country_name: countryLabel
            };
            
            // Niveau 1 : Même Ville & Pays
            if (userLocation.city && userLocation.country_id) {
                const { data: cityData } = await supabase
                    .from('public_profiles')
                    .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                    .eq('country_id', userLocation.country_id)
                    .ilike('city', userLocation.city)
                    .neq('user_id', user.id)
                    .limit(20)
                if (cityData) proximityProfiles = [...(cityData as unknown as PublicProfileJoined[])]
            }

            // Niveau 2 : Même Pays (si Niveau 1 < 8)
            if (proximityProfiles.length < 8 && userLocation.country_id) {
                const excludeUserIds = [user.id, ...proximityProfiles.map(p => p.user_id)]
                const { data: countryData } = await supabase
                    .from('public_profiles')
                    .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                    .eq('country_id', userLocation.country_id)
                    .not('user_id', 'in', `(${excludeUserIds.join(',')})`)
                    .order('is_premium', { ascending: false }) // Priorité aux premium
                    .limit(20)
                if (countryData) proximityProfiles = [...proximityProfiles, ...(countryData as unknown as PublicProfileJoined[])]
            }
        }
    }
    
    // Niveau 3 : Fallback Global (si < 8 ou pas de localisation)
    if (proximityProfiles.length < 8) {
        const excludeUserIds = user ? [user.id, ...proximityProfiles.map(p => p.user_id)] : proximityProfiles.map(p => p.user_id)
        let fallbackQuery = supabase
            .from('public_profiles')
            .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(30)

        if (excludeUserIds.length > 0) {
             fallbackQuery = fallbackQuery.not('user_id', 'in', `(${excludeUserIds.join(',')})`)
        }
        
        const { data: fallbackData } = await fallbackQuery
        if (fallbackData) proximityProfiles = [...proximityProfiles, ...(fallbackData as unknown as PublicProfileJoined[])]
    }
    
    // On peut mélanger le fallback de proximité, mais on prend d'abord les plus proches
    const initialProximityProfiles = mapProfiles(proximityProfiles.slice(0, 8))

    // Requêtes en parallèle pour les autres sections (sans bloquer)
    const [
        initialPremiumProfiles,
        initialNewProfiles
    ] = await Promise.all([
        fetchCuratedProfiles(supabase, 'premium', 8),
        fetchCuratedProfiles(supabase, 'new', 8)
    ])

    return (
        <div className="min-h-screen bg-muted">
            <DashboardHubContent 
                initialPremiumProfiles={initialPremiumProfiles} 
                initialNewProfiles={initialNewProfiles}
                initialProximityProfiles={initialProximityProfiles}
                userLocation={userLocation}
            />
        </div>
    )
}

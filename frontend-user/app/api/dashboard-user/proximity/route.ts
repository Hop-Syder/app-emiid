import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { PublicProfileJoined, ProfileTagJoin, countryName } from "@/types/supabase-rows"

function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
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
            isFollowed: false,
            tags: e.profile_tags?.map((pt: ProfileTagJoin) => pt.tags?.name).filter(Boolean) || []
        }
    })
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const city = searchParams.get('city')
        const countryName = searchParams.get('country_name')
        const countryId = searchParams.get('country_id') // Fallback depuis le profil si pas de GPS
        
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        let proximityProfiles: PublicProfileJoined[] = []
        let actualCountryId = countryId

        // Si on a un countryName (GPS), on essaie de trouver son ID dans la base
        if (countryName && !countryId) {
            const { data: countryData } = await supabase
                .from('countries')
                .select('id')
                .ilike('name', countryName)
                .single()
                
            if (countryData) {
                actualCountryId = countryData.id
            }
        }

        // 1. Niveau 1 : Même Ville & Pays
        if (city && actualCountryId) {
            const { data: cityData } = await supabase
                .from('public_profiles')
                .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                .eq('country_id', actualCountryId)
                .ilike('city', city)
                .limit(20)
                
            if (cityData) {
                const rows = cityData as unknown as PublicProfileJoined[]
                // Filtrer l'utilisateur lui-même
                const filtered = user ? rows.filter(p => p.id !== user.id && p.user_id !== user.id) : rows
                proximityProfiles = [...filtered]
            }
        }

        // 2. Niveau 2 : Même Pays (si Niveau 1 < 20)
        if (proximityProfiles.length < 20 && actualCountryId) {
            const excludeUserIds = [user?.id, ...proximityProfiles.map(p => p.user_id)].filter(Boolean)
            let query = supabase
                .from('public_profiles')
                .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                .eq('country_id', actualCountryId)
                .order('is_premium', { ascending: false })
                .limit(20)

            if (excludeUserIds.length > 0) {
                query = query.not('user_id', 'in', `(${excludeUserIds.join(',')})`)
            }
            
            const { data: countryData } = await query
            if (countryData) {
                proximityProfiles = [...proximityProfiles, ...(countryData as unknown as PublicProfileJoined[])]
            }
        }

        // 3. Niveau 3 : Fallback Global (si < 20 ou pas de localisation)
        if (proximityProfiles.length < 20) {
            const excludeUserIds = [user?.id, ...proximityProfiles.map(p => p.user_id)].filter(Boolean)
            let fallbackQuery = supabase
                .from('public_profiles')
                .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                .eq('is_verified', true)
                .order('created_at', { ascending: false })
                .limit(30)

            if (excludeUserIds.length > 0) {
                fallbackQuery = fallbackQuery.not('user_id', 'in', `(${excludeUserIds.join(',')})`)
            }
            
            const { data: fallbackData } = await fallbackQuery
            if (fallbackData) proximityProfiles = [...proximityProfiles, ...(fallbackData as unknown as PublicProfileJoined[])]
        }

        const finalProfiles = mapProfiles(shuffleArray(proximityProfiles).slice(0, 20))
        
        return NextResponse.json({ profiles: finalProfiles })
        
    } catch (error) {
        console.error('Proximity API Error:', error)
        return NextResponse.json({ profiles: [], error: "Internal Server Error" }, { status: 500 })
    }
}

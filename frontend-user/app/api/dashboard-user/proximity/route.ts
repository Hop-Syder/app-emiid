import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function shuffleArray(array: any[]) {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function mapProfiles(data: any[]) {
    return data.map((e: any) => {
        const profileId = e.user_id || e.id || "0"
        return {
            id: profileId,
            slug: e.slug || undefined,
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
            isFollowed: false,
            tags: e.profile_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || []
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
        
        let proximityProfiles: any[] = []
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
                // Filtrer l'utilisateur lui-même
                const filtered = user ? cityData.filter(p => p.id !== user.id && p.user_id !== user.id) : cityData
                proximityProfiles = [...filtered]
            }
        }

        // 2. Niveau 2 : Même Pays (si Niveau 1 < 8)
        if (proximityProfiles.length < 8 && actualCountryId) {
            const excludeIds = [user?.id, ...proximityProfiles.map(p => p.id || p.user_id)].filter(Boolean)
            let query = supabase
                .from('public_profiles')
                .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                .eq('country_id', actualCountryId)
                .order('is_premium', { ascending: false })
                .limit(20)
                
            if (excludeIds.length > 0) {
                query = query.not('id', 'in', `(${excludeIds.join(',')})`)
            }
            
            const { data: countryData } = await query
            if (countryData) {
                proximityProfiles = [...proximityProfiles, ...countryData]
            }
        }

        // 3. Niveau 3 : Fallback Global (si < 8 ou pas de localisation)
        if (proximityProfiles.length < 8) {
            const excludeIds = [user?.id, ...proximityProfiles.map(p => p.id || p.user_id)].filter(Boolean)
            let fallbackQuery = supabase
                .from('public_profiles')
                .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                .eq('is_verified', true)
                .order('created_at', { ascending: false })
                .limit(30)
                
            if (excludeIds.length > 0) {
                fallbackQuery = fallbackQuery.not('id', 'in', `(${excludeIds.join(',')})`)
            }
            
            const { data: fallbackData } = await fallbackQuery
            if (fallbackData) proximityProfiles = [...proximityProfiles, ...fallbackData]
        }

        const finalProfiles = mapProfiles(shuffleArray(proximityProfiles).slice(0, 8))
        
        return NextResponse.json({ profiles: finalProfiles })
        
    } catch (error) {
        console.error('Proximity API Error:', error)
        return NextResponse.json({ profiles: [], error: "Internal Server Error" }, { status: 500 })
    }
}

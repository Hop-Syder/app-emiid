/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page principale de l'annuaire global (Artisans, Freelances, Entreprises, ONG)
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { NavigationShell } from "@/components/navigation/navigation-shell"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 60 // ISR 60s

async function fetchInitialProfiles() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from("public_profiles")
            .select("*, countries(name, iso_code), profile_tags(tags(name))")
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .limit(12)

        if (error || !data) return []

        return data.map((e: any) => {
            const profileId = e.user_id || e.id || "0"
            return {
                id: profileId,
                name: (e.first_name || e.last_name)
                    ? `${e.first_name || ""} ${e.last_name || ""}`.trim()
                    : "Utilisateur EmiID",
                role: e.role || "Membre EmiID",
                location: e.city
                    ? `${e.city}, ${e.countries?.name || ""}`
                    : e.countries?.name || "Afrique ",
                avatar: e.avatar_url || "/profil/avatar.jpg",
                specialty: e.specialty || "Expertise",
                category: e.category || "",
                verified: !!e.is_verified,
                premium: !!e.is_premium,
                followers: e.followers_count || 0,
                isFollowed: false,
                tags: e.profile_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [],
            }
        })
    } catch {
        return []
    }
}

export default async function AnnuairePage() {
    const initialProfiles = await fetchInitialProfiles()

    return (
        <NavigationShell isPublic={false}>
            <div className="flex-1 w-full min-h-screen flex flex-col pt-8">
                <AnnuairePublicContent initialProfiles={initialProfiles} />
            </div>
        </NavigationShell>
    )
}

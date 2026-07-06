/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page principale de l'annuaire global (Artisans, Freelances, Entreprises, ONG)
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import type { Metadata } from "next"
import { NavigationShell } from "@/components/navigation/navigation-shell"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
    title: "Annuaire des professionnels d'Afrique | EmiID",
    description:
        "Découvrez et contactez artisans, freelances, entreprises, startups et ONG vérifiés à travers l'Afrique. Filtrez par type de profil et secteur d'activité sur EmiID.",
    alternates: { canonical: "/annuaire" },
    openGraph: {
        title: "Annuaire des professionnels d'Afrique | EmiID",
        description:
            "Artisans, freelances, entreprises, startups et ONG vérifiés. Trouvez le bon contact près de chez vous.",
        type: "website",
    },
}

export const revalidate = 60 // ISR 60s

interface AnnuaireProfileRow {
    id: string | null
    user_id: string | null
    first_name: string | null
    last_name: string | null
    slug: string | null
    role: string | null
    city: string | null
    avatar_url: string | null
    specialty: string | null
    category: string | null
    is_verified: boolean | null
    is_premium: boolean | null
    followers_count: number | null
    countries: { name: string; iso_code: string } | { name: string; iso_code: string }[] | null
    profile_tags?: Array<{
        tags: { name: string } | null
    }> | null
}

async function fetchInitialProfiles(category: string, activityDomain: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from("public_profiles")
            .select("*, countries(name, iso_code), profile_tags(tags(name))")
            .eq("is_published", true)
            .order("created_at", { ascending: false })

        if (category && category !== "all") {
            query = query.ilike("category", category)
        }
        if (activityDomain && activityDomain !== "all") {
            query = query.ilike("activity_domain", activityDomain)
        }

        const { data, error } = await query.limit(12)

        if (error || !data) return []

        const typedData = data as unknown as AnnuaireProfileRow[]

        return typedData.map((e) => {
            const profileId = e.user_id || e.id || "0"
            const countryInfo = e.countries
            const countryName = Array.isArray(countryInfo)
                ? countryInfo[0]?.name
                : countryInfo?.name

            const locationStr = e.city
                ? `${e.city}, ${countryName || ""}`
                : countryName || "Afrique "

            const tagsList = e.profile_tags
                ? e.profile_tags.map((pt) => pt.tags?.name).filter((name): name is string => typeof name === "string")
                : []

            return {
                id: profileId,
                slug: e.slug || undefined,
                name: (e.first_name || e.last_name)
                    ? `${e.first_name || ""} ${e.last_name || ""}`.trim()
                    : "Utilisateur EmiID",
                role: e.role || "Membre EmiID",
                location: locationStr,
                avatar: e.avatar_url || "/profil/avatar.jpg",
                specialty: e.specialty || "Expertise",
                category: e.category || "",
                verified: !!e.is_verified,
                premium: !!e.is_premium,
                followers: e.followers_count || 0,
                isFollowed: false,
                tags: tagsList,
            }
        })
    } catch {
        return []
    }
}

export default async function AnnuairePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams
    const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : "all"
    const activityDomain = typeof resolvedSearchParams.activity_domain === 'string' ? resolvedSearchParams.activity_domain : "all"
    
    const initialProfiles = await fetchInitialProfiles(category, activityDomain)

    return (
        <NavigationShell isPublic={true}>
            <div className="flex-1 w-full min-h-screen flex flex-col pt-8">
                <AnnuairePublicContent 
                    initialProfiles={initialProfiles} 
                    initialCategory={category}
                    initialActivityDomain={activityDomain}
                />
            </div>
        </NavigationShell>
    )
}

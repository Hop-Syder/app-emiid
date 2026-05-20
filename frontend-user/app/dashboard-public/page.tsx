/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Dashboard Public (visible sans authentification) — ISR 60s
 *              Les profils et les stats sont chargés côté serveur (SSR/ISR) pour
 *              garantir un premier rendu sans Layout Shift (CLS 0) et une indexation
 *              SEO complète par les crawlers (contenu visible dans le HTML brut).
 * @created 2026-01-24
 * @updated 2026-05-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { createClient } from "@/lib/supabase/server"
import { EmiIDLayout } from "@/components/menu/emiid-layout"
import { DashboardPublicContent } from "@/components/dashboard-public-content/dashboard-public-content"
import type { EntrepreneurProfile } from "@/components/dashboard-public-content/dashboard-public-content"
import type { DashboardStats } from "@/types"

// Régénération statique incrémentielle toutes les 60 secondes
export const revalidate = 60

async function fetchInitialStats(): Promise<DashboardStats | null> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"
        const res = await fetch(`${apiUrl}/api/public/stats`, {
            next: { revalidate: 60 },
            headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}

async function fetchInitialProfiles(): Promise<EntrepreneurProfile[]> {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from("public_profiles")
            .select("*, countries(name, iso_code), profile_tags(tags(name))")
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .limit(6)

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
                    : e.countries?.name || "Afrique de l'Ouest",
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

export default async function DashboardPublicPage() {
    // Chargement parallèle — stats & profils résolus avant le premier octet envoyé au client
    const [initialStats, initialProfiles] = await Promise.all([
        fetchInitialStats(),
        fetchInitialProfiles(),
    ])

    return (
        <EmiIDLayout>
            <DashboardPublicContent
                initialStats={initialStats}
                initialProfiles={initialProfiles}
            />
        </EmiIDLayout>
    )
}

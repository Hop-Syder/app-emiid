/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Grille d'affichage des profils dans l'annuaire global
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { AnnuaireCard } from "./annuaire-card"
import { EmptyState } from "@/components/EmptyState"
import { Search } from "lucide-react"
import type { EntrepreneurStats, PublicProfile } from "@/types"

interface AnnuaireGridProps {
    filters?: {
        search: string
        category: string
        country: string
        city: string
        tags: string
        status: string
    }
    initialProfiles?: PublicProfile[]
}

export function AnnuaireGrid({ filters, initialProfiles = [] }: AnnuaireGridProps) {
    const [loading, setLoading] = useState(!initialProfiles.length)
    const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles)
    const [isFirstRender, setIsFirstRender] = useState(true)

    useEffect(() => {
        // Skip first fetch if we have initial profiles and filters are default
        const isDefaultFilters = !filters || (
            !filters.search && 
            (!filters.category || filters.category === "all") && 
            (!filters.country || filters.country === "all") && 
            !filters.city && 
            !filters.tags
        )

        if (isFirstRender && isDefaultFilters && initialProfiles.length > 0) {
            setIsFirstRender(false)
            return
        }

        const loadProfiles = async () => {
            setLoading(true)
            try {
                const supabase = createClient()
                // On utilise la vue public_profiles pour plus de sécurité et de conformité au schéma
                let query = supabase
                    .from('public_profiles')
                    .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                    .order('created_at', { ascending: false })

                if (filters?.category && filters.category !== "all") query = query.ilike('category', filters.category)
                if (filters?.country && filters.country !== "all") query = query.eq('countries.iso_code', filters.country)
                if (filters?.city) query = query.ilike('city', `%${filters.city}%`)
                if (filters?.search) query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,role.ilike.%${filters.search}%,specialty.ilike.%${filters.search}%`)

                const { data, error: profilesError } = await query
                let profilesData = data

                if (filters?.tags && profilesData) {
                    const tagSearch = filters.tags.toLowerCase()
                    profilesData = profilesData.filter((profile: any) => 
                        profile.profile_tags?.some((pt: any) => pt.tags?.name?.toLowerCase().includes(tagSearch))
                    )
                }

                let userFollowsIds: string[] = []
                try {
                    const followsRes = await fetchWithAuth("/api/users/follows")
                    if (followsRes.ok) {
                        const followsData = await followsRes.json()
                        userFollowsIds = followsData.map((f: { user_id?: string; id?: string }) => f.user_id || f.id)
                    }
                } catch {
                    // Silent failure - follows are optional
                    console.warn("Failed to load follows in annuaire")
                }

                if (!profilesError && profilesData) {
                    // Nettoyage de la structure pour correspondre à l'ancienne API
                    const data = profilesData.map((p: any) => ({
                        ...p,
                        tags: p.profile_tags?.map((pt: any) => pt.tags?.name) || []
                    }))
                    setProfiles(data.map((e: EntrepreneurStats) => {
                        const profileId = e.user_id || e.id
                        return {
                            id: profileId,
                            name: `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Utilisateur EmiID',
                            role: e.role || "Membre EmiID",
                            location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique"),
                            avatar: e.avatar_url || "/profil/avatar.jpg",
                            specialty: e.specialty || "Expertise",
                            category: e.category || "",
                            verified: !!e.is_verified,
                            premium: !!e.is_premium,
                            card_variant: e.card_variant, // PASS THE VARIANT
                            followers: e.followers_count || 0,
                            isFollowed: userFollowsIds.includes(profileId),
                            tags: e.tags || []
                        }
                    }))
                }
            } catch (error) {
                console.error("Erreur chargement annuaire:", error)
            } finally {
                setLoading(false)
                setIsFirstRender(false)
            }
        }
        loadProfiles()
    }, [filters, initialProfiles.length, isFirstRender])

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-[1/1.4] w-full bg-slate-100 animate-pulse rounded-3xl" />
                ))}
            </div>
        )
    }

    if (profiles.length === 0) {
        return (
            <div className="max-w-md mx-auto py-10">
                <EmptyState 
                    icon={Search}
                    title="Aucun résultat trouvé"
                    description="Nous n'avons trouvé aucun profil correspondant à vos critères de recherche. Essayez d'autres filtres."
                    actionText="Réinitialiser les filtres"
                    onAction={() => window.location.href = "/annuaire"}
                />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {profiles.map((profile, index) => (
                <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="w-full"
                >
                    <AnnuaireCard profile={profile} />
                </motion.div>
            ))}
        </div>
    )
}

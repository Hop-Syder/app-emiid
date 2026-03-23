/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Grille d'affichage des profils dans l'annuaire global
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { fetchPublic, fetchWithAuth } from "@/lib/apiClient"
import { AnnuaireCard } from "./annuaire-card"
import { Skeleton } from "@/components/ui/skeleton"

interface AnnuaireGridProps {
    filters?: {
        search: string
        category: string
        country: string
        city: string
        tags: string
        status: string
    }
}

export function AnnuaireGrid({ filters }: AnnuaireGridProps) {
    const [loading, setLoading] = useState(true)
    const [profiles, setProfiles] = useState<any[]>([])

    useEffect(() => {
        const loadProfiles = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (filters?.search) params.append("search", filters.search)
                if (filters?.category && filters.category !== "all") params.append("category", filters.category)
                if (filters?.country && filters.country !== "all") params.append("country", filters.country)
                if (filters?.city) params.append("city", filters.city)
                if (filters?.tags) params.append("tags", filters.tags)

                const response = await fetchPublic(`/api/public/profiles?${params.toString()}`)

                let userFollowsIds: string[] = []
                try {
                    const followsRes = await fetchWithAuth("/api/users/follows")
                    if (followsRes.ok) {
                        const followsData = await followsRes.json()
                        userFollowsIds = followsData.map((f: any) => f.user_id || f.id)
                    }
                } catch (e) {}

                if (response.ok) {
                    const data = await response.json()
                    setProfiles(data.map((e: any) => {
                        const profileId = e.user_id || e.id
                        return {
                            id: profileId,
                            name: `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Utilisateur Nexus',
                            role: e.role || "Membre Nexus",
                            location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique"),
                            avatar: e.avatar_url || "/african-user.jpg",
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
            }
        }
        loadProfiles()
    }, [filters])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-[1/1.4] w-full bg-slate-100 animate-pulse rounded-[2.5rem]" />
                ))}
            </div>
        )
    }

    if (profiles.length === 0) {
        return (
            <div className="py-20 text-center">
                <p className="text-xl text-muted-foreground">Aucun profil trouvé.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profiles.map((profile, index) => (
                <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                    <AnnuaireCard profile={profile} />
                </motion.div>
            ))}
        </div>
    )
}

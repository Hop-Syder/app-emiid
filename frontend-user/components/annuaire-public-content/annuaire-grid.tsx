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
import { motion, AnimatePresence } from "framer-motion"
import { fetchPublic, fetchWithAuth } from "@/lib/apiClient"
import { CardPremium } from "@/components/carte-profil/card-premium/card-premium"
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
                // Construction dynamique des query params
                const params = new URLSearchParams()
                if (filters?.search) params.append("search", filters.search)
                if (filters?.category && filters.category !== "all") params.append("category", filters.category)
                if (filters?.country && filters.country !== "all") params.append("country", filters.country)
                if (filters?.city) params.append("city", filters.city)
                if (filters?.tags) params.append("tags", filters.tags)

                const response = await fetchPublic(`/api/public/profiles?${params.toString()}`)

                // Récupérer les follows de l'utilisateur (s'il est co) pour initialiser correctement les boutons
                let userFollowsIds: string[] = []
                try {
                    const followsRes = await fetchWithAuth("/api/users/follows")
                    if (followsRes.ok) {
                        const followsData = await followsRes.json()
                        userFollowsIds = followsData.map((f: any) => f.user_id || f.id)
                    }
                } catch (e) {
                    // Ignorer (utilisateur non connecté)
                }

                if (response.ok) {
                    const data = await response.json()
                    setProfiles(data.map((e: any) => {
                        const profileId = e.user_id || e.id
                        return {
                            id: profileId,
                            name: `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Utilisateur Nexus',
                            role: e.role || "Membre Nexus",
                            location: e.city ? `${e.city}, ${e.countries?.name || ''}` : (e.countries?.name || "Afrique de l'Ouest"),
                            avatar: e.avatar_url || "/african-user.jpg",
                            specialty: e.specialty || "Expertise",
                            category: e.category || "",
                            verified: true,
                            premium: e.category?.toLowerCase() === 'entreprise',
                            followers: e.followers_count || 0, // Fallback si le backend ne le retourne pas encore
                            isFollowed: userFollowsIds.includes(profileId),
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
                {loading ? (
                    Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="h-[350px] w-full bg-muted animate-pulse rounded-3xl" />
                    ))
                ) : profiles.length > 0 ? (
                    profiles.map((profile, index) => (
                        <motion.div
                            key={profile.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <CardPremium entrepreneur={profile} />
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-xl text-muted-foreground">Aucun profil trouvé dans l'annuaire.</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

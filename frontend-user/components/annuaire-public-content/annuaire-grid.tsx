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
import type { EntrepreneurStats } from "@/types"

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
                const supabase = createClient()
                let query = supabase
                    .from('user_profiles')
                    .select(`*, countries(name, iso_code), profile_tags(tags(name))`)
                    .eq('is_published', true)
                    .order('updated_at', { ascending: false })

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
                            name: `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Utilisateur Nexus',
                            role: e.role || "Membre Nexus",
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
            }
        }
        loadProfiles()
    }, [filters])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-[1/1.4] w-full bg-slate-100 animate-pulse rounded-3xl" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
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

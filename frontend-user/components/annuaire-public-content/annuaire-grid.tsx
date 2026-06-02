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

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { AnnuaireCard } from "./annuaire-card"
import { EmptyState } from "@/components/EmptyState"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import type { EntrepreneurStats, PublicProfile } from "@/types"

interface AnnuaireGridProps {
    filters?: {
        search: string
        category: string
        country: string
        city: string
        tags: string
        status: string
        activity_domain: string
    }
    initialProfiles?: PublicProfile[]
    onlyPremium?: boolean
    theme?: "default" | "red" | "orange"
}

export function AnnuaireGrid({ filters, initialProfiles = [], onlyPremium = false, theme = "default" }: AnnuaireGridProps) {
    const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles)
    const [loading, setLoading] = useState(!initialProfiles.length)
    const [isFirstRender, setIsFirstRender] = useState(true)
    const scrollRef1 = useRef<HTMLDivElement>(null)
    const scrollRef2 = useRef<HTMLDivElement>(null)

    const scroll = (row: 1 | 2, direction: "left" | "right") => {
        const targetRef = row === 1 ? scrollRef1 : scrollRef2
        if (targetRef.current) {
            const { current } = targetRef
            const scrollAmount = direction === "left" ? -400 : 400
            current.scrollBy({ left: scrollAmount, behavior: "smooth" })
        }
    }

    useEffect(() => {
        // Skip first fetch if we have initial profiles and filters are default
        const isDefaultFilters = !filters || (
            !filters.search && 
            (!filters.category || filters.category === "all") && 
            (!filters.activity_domain || filters.activity_domain === "all") && 
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

                if (filters?.category && filters.category !== "all") query = query.ilike('category', `%${filters.category}%`)
                if (filters?.activity_domain && filters.activity_domain !== "all") query = query.ilike('activity_domain', `%${filters.activity_domain}%`)
                if (filters?.country && filters.country !== "all") query = query.eq('countries.iso_code', filters.country)
                if (filters?.city) query = query.ilike('city', `%${filters.city}%`)
                if (filters?.search) query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,role.ilike.%${filters.search}%,specialty.ilike.%${filters.search}%`)
                
                if (onlyPremium) {
                    query = query.eq('is_premium', true)
                }

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
            <div className="grid grid-rows-2 grid-flow-col gap-6 xl:gap-8 overflow-x-auto snap-x no-scrollbar w-full pb-8 pt-4 px-4 -mx-4 scroll-smooth">
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div 
                        key={`skeleton-${i}`} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="w-[280px] sm:w-[320px] aspect-[1/1.4] bg-white rounded-[2rem] border border-slate-100/50 shadow-sm overflow-hidden flex flex-col snap-center"
                    >
                        <div className="h-[100px] w-full bg-slate-200/50 animate-pulse" />
                        <div className="flex-1 p-5 relative">
                            <div className="absolute -top-12 left-5 w-20 h-20 rounded-full bg-slate-300/50 animate-pulse border-4 border-white" />
                            <div className="mt-10 space-y-3">
                                <div className="h-5 w-3/4 bg-slate-200/60 rounded-md animate-pulse" />
                                <div className="h-4 w-1/2 bg-slate-200/40 rounded-md animate-pulse" />
                            </div>
                            <div className="mt-6 space-y-2">
                                <div className="h-3 w-full bg-slate-100 rounded-md animate-pulse" />
                                <div className="h-3 w-full bg-slate-100 rounded-md animate-pulse" />
                                <div className="h-3 w-2/3 bg-slate-100 rounded-md animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
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
                    colorTheme={theme}
                />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* --- LIGNE 1 --- */}
            {profiles.length > 0 && (
                <div className="relative group/carousel1">
                    <button
                        onClick={() => scroll(1, "left")}
                        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full shadow-xl opacity-80 hover:opacity-100 transition-all backdrop-blur-md ${theme === 'red' ? 'bg-red-600/90 text-white/90 border border-red-500/50 hover:bg-red-700' : theme === 'orange' ? 'bg-orange-500/90 text-white/90 border border-orange-400/50 hover:bg-orange-600' : 'bg-slate-900/90 text-white/90 border border-white/10 hover:bg-slate-800'}`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div 
                        ref={scrollRef1}
                        className="flex gap-6 xl:gap-8 overflow-x-auto snap-x no-scrollbar w-full pb-6 pt-4 px-4 -mx-4 scroll-smooth"
                    >
                        {profiles.slice(0, 25).map((profile, index) => (
                            <motion.div
                                key={`row1-${profile.id}`}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.5, delay: Math.min(index, 10) * 0.08, type: "spring", stiffness: 100, damping: 15 }}
                                className="w-[280px] sm:w-[320px] shrink-0 snap-center"
                            >
                                <AnnuaireCard profile={profile} theme={theme} />
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={() => scroll(1, "right")}
                        className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full shadow-xl opacity-80 hover:opacity-100 transition-all backdrop-blur-md ${theme === 'red' ? 'bg-red-600/90 text-white/90 border border-red-500/50 hover:bg-red-700' : theme === 'orange' ? 'bg-orange-500/90 text-white/90 border border-orange-400/50 hover:bg-orange-600' : 'bg-slate-900/90 text-white/90 border border-white/10 hover:bg-slate-800'}`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* --- LIGNE 2 --- */}
            {profiles.length > 25 && (
                <div className="relative group/carousel2">
                    <button
                        onClick={() => scroll(2, "left")}
                        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full shadow-xl opacity-80 hover:opacity-100 transition-all backdrop-blur-md ${theme === 'red' ? 'bg-red-600/90 text-white/90 border border-red-500/50 hover:bg-red-700' : theme === 'orange' ? 'bg-orange-500/90 text-white/90 border border-orange-400/50 hover:bg-orange-600' : 'bg-slate-900/90 text-white/90 border border-white/10 hover:bg-slate-800'}`}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div 
                        ref={scrollRef2}
                        className="flex gap-6 xl:gap-8 overflow-x-auto snap-x no-scrollbar w-full pb-6 pt-4 px-4 -mx-4 scroll-smooth"
                    >
                        {profiles.slice(25, 50).map((profile, index) => (
                            <motion.div
                                key={`row2-${profile.id}`}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.5, delay: Math.min(index, 10) * 0.08, type: "spring", stiffness: 100, damping: 15 }}
                                className="w-[280px] sm:w-[320px] shrink-0 snap-center"
                            >
                                <AnnuaireCard profile={profile} theme={theme} />
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={() => scroll(2, "right")}
                        className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full shadow-xl opacity-80 hover:opacity-100 transition-all backdrop-blur-md ${theme === 'red' ? 'bg-red-600/90 text-white/90 border border-red-500/50 hover:bg-red-700' : theme === 'orange' ? 'bg-orange-500/90 text-white/90 border border-orange-400/50 hover:bg-orange-600' : 'bg-slate-900/90 text-white/90 border border-white/10 hover:bg-slate-800'}`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Grille de l'annuaire public découpée en lignes horizontales défilantes de 10 profils avec flèches de contrôle.
 * @created 2026-06-13
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { fetchFollowedIds } from "@/lib/follows"
import { AnnuaireCard } from "./annuaire-card"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import type { PublicProfile } from "@/types"

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

// Nombre de cartes par ligne défilante avant passage à la ligne suivante.
const ROW_SIZE = 10

/** Ligne horizontale défilante de profils avec flèches de contrôle. */
function ProfileRow({ profiles, theme }: { profiles: PublicProfile[]; theme: "default" | "red" | "orange" }) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    const updateArrows = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 4)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }, [])

    useEffect(() => {
        updateArrows()
        window.addEventListener("resize", updateArrows)
        return () => window.removeEventListener("resize", updateArrows)
    }, [updateArrows, profiles.length])

    const scrollByCards = (direction: 1 | -1) => {
        const el = scrollRef.current
        if (!el) return
        el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" })
    }

    return (
        <div className="relative group">
            {/* Flèche gauche — desktop uniquement (mobile/tablette : scroll tactile) */}
            {canScrollLeft && (
                <button
                    type="button"
                    aria-label="Faire défiler vers la gauche"
                    onClick={() => scrollByCards(-1)}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-105 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            {/* Piste défilante — chaque ligne défile indépendamment des autres */}
            <div
                ref={scrollRef}
                onScroll={updateArrows}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 md:mx-0 md:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {profiles.map((profile, index) => (
                    <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04 }}
                        className="min-w-[280px] max-w-[300px] w-[280px] shrink-0 snap-start"
                    >
                        <AnnuaireCard profile={profile} theme={theme} />
                    </motion.div>
                ))}
            </div>

            {/* Flèche droite — desktop uniquement */}
            {canScrollRight && (
                <button
                    type="button"
                    aria-label="Faire défiler vers la droite"
                    onClick={() => scrollByCards(1)}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-105 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}

export function AnnuaireGrid({ filters, initialProfiles = [], onlyPremium = false, theme = "default" }: AnnuaireGridProps) {
    const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles)
    const [loading, setLoading] = useState(false)
    const [isFirstRender, setIsFirstRender] = useState(true)
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(initialProfiles.length)
    // Multiple de ROW_SIZE : chaque page affiche des lignes complètes de 10 cartes.
    const limit = 30

    // Hydratation au montage : les profils rendus côté serveur (initialProfiles)
    // arrivent sans état de suivi. Si l'utilisateur est connecté, on marque
    // isFollowed en croisant les IDs avec ses abonnements — l'état de couleur
    // des boutons Suivre/Abonné est ainsi correct dès le premier rendu.
    useEffect(() => {
        let cancelled = false
        void (async () => {
            const followedIds = await fetchFollowedIds()
            if (cancelled || !followedIds) return
            setProfiles((prev) => prev.map((p) => ({ ...p, isFollowed: followedIds.has(p.id) })))
        })()
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- une seule fois au montage client
    }, [])

    // Reset page on filter change
    useEffect(() => {
        setPage(1)
    }, [filters])

    useEffect(() => {
        const isDefaultFilters = !filters || (
            !filters.search && 
            (!filters.category || filters.category === "all") && 
            (!filters.activity_domain || filters.activity_domain === "all") && 
            (!filters.country || filters.country === "all") && 
            !filters.city && 
            !filters.tags
        )

        if (isFirstRender && isDefaultFilters && initialProfiles.length > 0 && page === 1) {
            setIsFirstRender(false)
            return
        }

        const loadProfiles = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                params.append("page", page.toString())
                params.append("limit", limit.toString())
                
                if (filters?.search) params.append("search", filters.search)
                if (filters?.category && filters.category !== "all") params.append("category", filters.category)
                if (filters?.activity_domain && filters.activity_domain !== "all") params.append("activity_domain", filters.activity_domain)
                if (filters?.country && filters.country !== "all") params.append("country", filters.country)
                if (filters?.city) params.append("city", filters.city)
                if (filters?.tags) params.append("tags", filters.tags)
                
                // Gestion du type de profil (status)
                if (filters?.status === "premium" || onlyPremium) {
                    params.append("onlyPremium", "true")
                }
                if (filters?.status === "verified") {
                    params.append("onlyVerified", "true")
                }

                const res = await fetch(`/api/annuaire?${params.toString()}`)
                if (!res.ok) throw new Error("Failed to fetch")
                
                const result = await res.json()
                const fetchedProfiles = result.profiles || []
                
                // Marquage isFollowed via la même source de vérité que l'hydratation
                // initiale (requête directe user_follows, cf. fetchFollowedIds).
                const followedIds = await fetchFollowedIds()

                const updatedProfiles = fetchedProfiles.map((p: PublicProfile) => ({
                    ...p,
                    isFollowed: !!followedIds?.has(p.id)
                }))

                setProfiles(updatedProfiles)
                setTotalCount(result.count || 0)
            } catch (error) {
                console.error("Erreur chargement annuaire:", error)
            } finally {
                setLoading(false)
                setIsFirstRender(false)
            }
        }
        
        loadProfiles()
    }, [filters, page, onlyPremium, isFirstRender, initialProfiles.length])

    const totalPages = Math.ceil(totalCount / limit)

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div 
                        key={`skeleton-${i}`} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="w-full aspect-[1/1.4] bg-white rounded-[2rem] border border-slate-100/50 shadow-sm overflow-hidden flex flex-col"
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
            {/* Lignes de ROW_SIZE cartes max : la ligne N se remplit à 10 avant
                d'ouvrir la ligne N+1. Carrousel horizontal sur tous les écrans
                (tactile + snap sur mobile/tablette, flèches en plus sur desktop). */}
            {Array.from({ length: Math.ceil(profiles.length / ROW_SIZE) }, (_, rowIndex) => (
                <ProfileRow
                    key={`row-${rowIndex}-${profiles[rowIndex * ROW_SIZE]?.id ?? rowIndex}`}
                    profiles={profiles.slice(rowIndex * ROW_SIZE, (rowIndex + 1) * ROW_SIZE)}
                    theme={theme}
                />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200/60">
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={theme === 'red' ? 'hover:bg-red-50 hover:text-red-600' : theme === 'orange' ? 'hover:bg-orange-50 hover:text-orange-600' : 'hover:bg-slate-100'}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
                    </Button>
                    <span className="text-sm font-semibold text-slate-500 select-none">
                        Page <span className={theme === 'red' ? 'text-red-600 font-bold' : theme === 'orange' ? 'text-orange-600 font-bold' : 'text-slate-800 font-bold'}>{page}</span> sur {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={theme === 'red' ? 'hover:bg-red-50 hover:text-red-600' : theme === 'orange' ? 'hover:bg-orange-50 hover:text-orange-600' : 'hover:bg-slate-100'}
                    >
                        Suivant <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    )
}


/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section des entrepreneurs (vedettes/premium) du Dashboard Public avec carrousel fluide 3D.
 * @created 2026-06-03
 * @updated 2026-06-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmiIDProfileCard } from "@/components/carte-profil/emiid-profile-card"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/apiClient"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import type { PublicProfile } from "@/types"
import { ChevronLeft, ChevronRight, Crown, ArrowRight } from "lucide-react"
import Link from "next/link"

interface EntrepreneursSectionProps {
    entrepreneursList: PublicProfile[]
    loading: boolean
}

export function EntrepreneursSection({ entrepreneursList, loading }: EntrepreneursSectionProps) {
    const router = useRouter()
    const { session } = useCurrentUserProfile()
    const [profiles, setProfiles] = useState(entrepreneursList)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setProfiles(entrepreneursList)
    }, [entrepreneursList])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { current } = scrollRef
            const scrollAmount = direction === "left" ? -300 : 300
            current.scrollBy({ left: scrollAmount, behavior: "smooth" })
        }
    }

    const handleCardAction = async (type: 'message' | 'follow' | 'view', entrepreneurId?: string) => {
        if (!entrepreneurId) return

        if (type === "view") {
            router.push(`/profil/${entrepreneurId}`)
            return
        }

        if (!session) {
            toast.info("Veuillez vous connecter pour interagir avec ce membre", {
                action: {
                    label: "Connexion",
                    onClick: () => router.push("/login")
                }
            })
            return
        }

        if (type === "message") {
            router.push(`/messages?contact=${entrepreneurId}`)
            return
        }

        if (type === "follow") {
            try {
                const res = await fetchWithAuth(`/api/users/follow/${entrepreneurId}`, { method: "POST" })
                if (res.ok) {
                    const data = await res.json()
                    setProfiles((prev) => prev.map((profile) => {
                        if (profile.id !== entrepreneurId) {
                            return profile
                        }

                        return {
                            ...profile,
                            isFollowed: data.followed,
                            followers: data.followed ? profile.followers + 1 : Math.max(0, profile.followers - 1),
                        }
                    }))
                    toast.success(data.followed ? "Abonnement effectué" : "Désabonné avec succès")
                } else {
                    toast.error("Impossible de suivre ce membre pour le moment")
                }
            } catch (error) {
                console.error("Follow error:", error)
                toast.error("Erreur de connexion")
            }
        }
    }

    return (
        <section className="space-y-4">
            {/* Header de la section avec design assorti au Hub connecté */}
            <div className="flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
                <h3 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2 sm:gap-3 tracking-tight">
                    <div className="p-1.5 sm:p-2 bg-amber-100 rounded-xl shrink-0">
                        <Crown className="text-amber-500 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="truncate">Entrepreneurs du Réseau</span>
                </h3>
                <Link 
                    href="/annuaire" 
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group shrink-0"
                >
                    Voir tout <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {loading ? (
                <div className="flex overflow-x-auto pb-6 gap-6 snap-x no-scrollbar w-full pt-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="min-w-[280px] space-y-4 p-6 border border-slate-100 rounded-2xl bg-white shadow-sm snap-center">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[120px]" />
                                    <Skeleton className="h-3 w-[80px]" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <div className="flex justify-between items-center pt-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-24 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : profiles.length > 0 ? (
                <div className="relative group/carousel">
                    {/* Flèche gauche */}
                    <button
                        onClick={() => scroll("left")}
                        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white/90 border border-white/10 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-md"
                        aria-label="Défiler vers la gauche"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Flèche droite */}
                    <button
                        onClick={() => scroll("right")}
                        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white/90 border border-white/10 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-md"
                        aria-label="Défiler vers la droite"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Liste défilante */}
                    <div 
                        ref={scrollRef}
                        className="flex overflow-x-auto pb-10 pt-4 px-4 -mx-4 gap-6 snap-x no-scrollbar w-full scroll-smooth"
                    >
                        {profiles.map((entrepreneur, index) => (
                            <motion.div
                                key={entrepreneur.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.03, y: -5, rotateY: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.08 }}
                                className="min-w-[280px] snap-center relative group perspective-1000"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-yellow-300/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500 z-0"></div>
                                <div className="relative z-10 h-full">
                                    <EmiIDProfileCard
                                        user={{
                                            id: entrepreneur.id,
                                            name: entrepreneur.name,
                                            role: entrepreneur.role,
                                            avatar: entrepreneur.avatar,
                                            category: entrepreneur.category,
                                            specialty: entrepreneur.specialty,
                                            location: entrepreneur.location,
                                            followers: entrepreneur.followers,
                                            verified: entrepreneur.verified,
                                            premium: entrepreneur.premium,
                                            tags: entrepreneur.tags || [entrepreneur.specialty],
                                        }}
                                        variant="tech"
                                        isFollowed={!!entrepreneur.isFollowed}
                                        onAction={(type) => handleCardAction(type, entrepreneur.id)}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-500 font-medium">Aucun entrepreneur en vedette pour le moment.</p>
                </div>
            )}
        </section>
    )
}

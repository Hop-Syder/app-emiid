/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section d'affichage des entrepreneurs (carrousel horizontal fluide sur tous les écrans).
 * @created 2026-05-24
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmiIDProfileCard, EmiIDCardVariant } from "@/components/carte-profil/emiid-profile-card"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import type { PublicProfile } from "@/types"

import { EmptyState } from "@/components/EmptyState"
import { Users } from "lucide-react"

interface EntrepreneursSectionProps {
    entrepreneursList: PublicProfile[]
    loading: boolean
    variant?: EmiIDCardVariant
}

export function EntrepreneursSection({ entrepreneursList, loading, variant = "tech" }: EntrepreneursSectionProps) {
    const router = useRouter()
    const { session } = useCurrentUserProfile()
    const [profiles, setProfiles] = useState(entrepreneursList)

    useEffect(() => {
        setProfiles(entrepreneursList)
    }, [entrepreneursList])

    const handleCardAction = async (type: 'message' | 'follow' | 'view', entrepreneurId?: string) => {
        if (!entrepreneurId) return
        if (type === "view") {
            router.push(`/profil/${entrepreneurId}`)
            return
        }
        if (type === "follow") {
            if (!session) {
                toast.info("Veuillez vous connecter pour interagir avec ce membre", {
                    action: {
                        label: "Connexion",
                        onClick: () => router.push("/login")
                    }
                })
                return
            }

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

            return
        }
        if (type === "message") {
            router.push(`/messages?contact=${entrepreneurId}`)
            return
        }
    }

    return (
        <section>
            {loading ? (
                <div className="flex overflow-x-auto pb-6 gap-6 snap-x no-scrollbar w-full">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="min-w-[280px] space-y-4 p-6 border rounded-xl bg-card snap-center">
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
                <div className="flex overflow-x-auto pb-10 pt-4 px-4 -mx-4 gap-6 snap-x no-scrollbar w-full">
                    {profiles.map((entrepreneur, index) => (
                        <motion.div
                            key={entrepreneur.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.03, y: -5, rotateY: 2 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="min-w-[280px] snap-center relative group perspective-1000"
                        >
                            {/* Magic glow for Elite (Premium) variant if applicable */}
                            {variant === "elite" && (
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500 z-0"></div>
                            )}
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
                                    variant={variant}
                                    isFollowed={!!entrepreneur.isFollowed}
                                    onAction={(type) => handleCardAction(type, entrepreneur.id)}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <EmptyState 
                    icon={Users}
                    title="Aucun entrepreneur trouvé"
                    description="Soyez le premier à rejoindre cette catégorie ou essayez d'autres filtres."
                    actionText="Découvrir l'annuaire"
                    onAction={() => router.push("/annuaire")}
                />
            )}
        </section>
    )
}


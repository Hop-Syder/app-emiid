"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmiIDProfileCard } from "@/components/carte-profil/emiid-profile-card"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/apiClient"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import type { PublicProfile } from "@/types"

interface EntrepreneursSectionProps {
    entrepreneursList: PublicProfile[]
    loading: boolean
}

export function EntrepreneursSection({ entrepreneursList, loading }: EntrepreneursSectionProps) {
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
        <section className="space-y-6 py-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800 px-6 sm:px-8 shadow-2xl relative overflow-hidden mt-8">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="mb-6 flex items-center justify-between relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2 italic uppercase tracking-tighter">
                        <span className="text-amber-400">👑</span> Entrepreneurs du Réseau
                    </h3>
                    <p className="text-sm text-slate-400 font-medium mt-1">Découvrez les profils premium du moment</p>
                </div>
                <Button
                    variant="outline"
                    className="rounded-xl border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                    onClick={() => router.push("/annuaire")}
                >
                    Voir Tout
                </Button>
            </div>

            <div className="relative z-10">

            {loading ? (
                <div className="flex overflow-x-auto pb-6 gap-6 snap-x no-scrollbar w-full">
                    {Array.from({ length: 6 }).map((_, i) => (
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
                <div className="flex overflow-x-auto pb-6 gap-6 snap-x no-scrollbar w-full">
                    {profiles.map((entrepreneur, index) => (
                        <motion.div
                            key={entrepreneur.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="min-w-[280px] snap-center"
                        >
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
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center bg-muted/20 rounded-xl border-2 border-dashed">
                    <p className="text-muted-foreground">Aucun entrepreneur en vedette pour le moment.</p>
                </div>
            )}
            </div>
        </section>
    )
}

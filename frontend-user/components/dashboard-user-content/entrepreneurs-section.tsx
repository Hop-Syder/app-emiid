"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { NexusProfileCard } from "@/components/carte-profil/nexus-profile-card"

interface EntrepreneursSectionProps {
    entrepreneursList: any[]
    loading: boolean
}

export function EntrepreneursSection({ entrepreneursList, loading }: EntrepreneursSectionProps) {
    const router = useRouter()
    const handleCardAction = (type: 'message' | 'follow' | 'view', entrepreneurId?: string) => {
        if (!entrepreneurId) return
        if (type === "view") {
            router.push(`/profil/${entrepreneurId}`)
            return
        }
        if (type === "message") {
            router.push(`/messages?user=${entrepreneurId}`)
            return
        }
    }

    return (
        <section>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold">Entrepreneurs du Réseau</h3>
                    <p className="text-sm text-muted-foreground">Découvrez les profils premium du moment</p>
                </div>
                <Button
                    variant="outline"
                    className="rounded-xl bg-transparent"
                    onClick={() => router.push("/annuaire/artisans")}
                >
                    Voir Tout
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-4 p-6 border rounded-xl bg-card">
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
            ) : entrepreneursList.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {entrepreneursList.map((entrepreneur, index) => (
                        <motion.div
                            key={entrepreneur.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <NexusProfileCard
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
        </section>
    )
}

"use client"

import { EmiIDProfileCard, EmiIDCardVariant } from "@/components/carte-profil/emiid-profile-card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"

export interface Profile {
    name: string
    role: string
    location: string
    avatar: string
    specialty: string
    verified: boolean
    followers: number
    projects?: number
    premium?: boolean
    id?: string
    card_variant?: string
    isFollowed?: boolean
}

interface AnnuaireCardProps {
    profile: Profile
}

export function AnnuaireCard({ profile }: AnnuaireCardProps) {
    const router = useRouter()
    const { session } = useCurrentUserProfile()
    const [isFollowed, setIsFollowed] = useState(!!profile.isFollowed)
    const [followersCount, setFollowersCount] = useState(profile.followers)

    // Synchronisation de l'état local avec les props (important pour le premier chargement)
    useEffect(() => {
        setIsFollowed(!!profile.isFollowed)
    }, [profile.isFollowed])

    useEffect(() => {
        setFollowersCount(profile.followers)
    }, [profile.followers])

    const handleAction = async (type: 'message' | 'follow' | 'view') => {
        if (type === 'view') {
            if (profile.id) router.push(`/profil/${profile.id}`)
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

        if (type === 'message' && profile.id) {
            router.push(`/messages?contact=${profile.id}`)
            return
        }

        if (type === 'follow' && profile.id) {
            try {
                const res = await fetchWithAuth(`/api/users/follow/${profile.id}`, { method: 'POST' })
                if (res.ok) {
                    const data = await res.json()
                    setIsFollowed(data.followed)
                    setFollowersCount(prev => data.followed ? prev + 1 : Math.max(0, prev - 1))
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

    const userData = {
        ...profile,
        id: profile.id || "temp",
        name: profile.name || "Membre EmiID",
        role: profile.role || "Professionnel",
        followers: followersCount,
        tags: [profile.specialty]
    }

    const activeVariant = profile.premium ? "elite" : "glass-blue"

    return (
        <EmiIDProfileCard 
            user={userData}
            variant={activeVariant}
            isFollowed={isFollowed}
            onAction={handleAction}
        />
    )
}

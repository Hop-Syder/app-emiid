"use client"

import { MapPin } from "lucide-react"

import { EmiIDProfileCard } from "@/components/carte-profil/emiid-profile-card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
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
    /** Mise en avant payante dans la commune recherchée (boost actif). */
    boosted?: boolean
    id?: string
    slug?: string
    card_variant?: string
    isFollowed?: boolean
}

interface AnnuaireCardProps {
    profile: Profile
    theme?: 'default' | 'red' | 'orange'
}

export function AnnuaireCard({ profile, theme = 'default' }: AnnuaireCardProps) {
    const router = useRouter()
    const { session } = useCurrentUserProfile()
    const [isFollowed, setIsFollowed] = useState(!!profile.isFollowed)
    const [followersCount, setFollowersCount] = useState(profile.followers)
    // Ref miroir de isFollowed pour le guard de synchro globale (évite le double-comptage).
    const isFollowedRef = useRef(!!profile.isFollowed)
    useEffect(() => { isFollowedRef.current = isFollowed }, [isFollowed])

    // Synchronisation de l'état local avec les props (important pour le premier chargement)
    useEffect(() => {
        setIsFollowed(!!profile.isFollowed)
    }, [profile.isFollowed])

    useEffect(() => {
        setFollowersCount(profile.followers)
    }, [profile.followers])

    // Synchro temps réel : écoute les changements de suivi émis ailleurs dans l'app.
    useEffect(() => {
        const handler = (e: Event) => {
            const { userId, followed } = (e as CustomEvent).detail || {}
            if (userId !== profile.id || isFollowedRef.current === followed) return
            isFollowedRef.current = followed
            setIsFollowed(followed)
            setFollowersCount((c) => (followed ? c + 1 : Math.max(0, c - 1)))
        }
        window.addEventListener("emiid-follow-toggle", handler)
        return () => window.removeEventListener("emiid-follow-toggle", handler)
    }, [profile.id])

    const handleAction = async (type: 'message' | 'follow' | 'view') => {
        if (type === 'view') {
            const profileIdentifier = profile.slug || profile.id
            if (profileIdentifier) router.push(`/profil/${profileIdentifier}`)
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
                    isFollowedRef.current = data.followed
                    setIsFollowed(data.followed)
                    setFollowersCount(prev => data.followed ? prev + 1 : Math.max(0, prev - 1))
                    // Propage le changement aux autres surfaces (dashboard, page profil…)
                    window.dispatchEvent(new CustomEvent("emiid-follow-toggle", {
                        detail: { userId: profile.id, followed: data.followed },
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

    const userData = {
        ...profile,
        id: profile.id || "temp",
        name: profile.name || "Membre EmiID",
        role: profile.role || "Professionnel",
        followers: followersCount,
        tags: [profile.specialty]
    }

    const activeVariant = profile.premium ? "elite" : (theme === 'red' ? "glass-red" : theme === 'orange' ? "glass-orange" : "glass-orange")

    const card = (
        <EmiIDProfileCard 
            user={userData}
            variant={activeVariant}
            size="compact"
            isFollowed={isFollowed}
            onAction={handleAction}
            isLoggedIn={!!session}
        />
    )

    // Profil boosté : liseré doré + étiquette « En vedette » (spec §2.A).
    // On enveloppe la carte plutôt que d'en modifier les variantes.
    if (profile.boosted) {
        return (
            <div className="relative rounded-[1.625rem] p-[2px] bg-[linear-gradient(135deg,#F59E0B,#FBBF24)] shadow-[0_12px_32px_-10px_rgba(245,158,11,0.55)]">
                <span className="absolute -top-2.5 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-[#F59E0B] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                    <MapPin className="h-3 w-3" />
                    En vedette
                </span>
                <div className="overflow-hidden rounded-3xl bg-card">{card}</div>
            </div>
        )
    }

    return card
}

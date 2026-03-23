"use client"

import { useState } from "react"
import { Shield, MapPin, Users, Eye } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { fetchWithAuth } from "@/lib/apiClient"

import { NexusProfileCard, NexusCardVariant } from "@/components/carte-profil/nexus-profile-card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export interface Profile {
    id: string
    name: string
    role: string
    location: string
    avatar: string
    specialty: string
    category?: string
    verified: boolean
    followers: number
    projects: number
    premium?: boolean
    card_variant?: string
    tags?: string[]
}

interface AnnuaireCardProps {
    profile: Profile
}

export function AnnuaireCard({ profile }: AnnuaireCardProps) {
    const [isFollowed, setIsFollowed] = useState(false)
    const [followersCount, setFollowersCount] = useState(profile.followers)
    const router = useRouter()

    const handleAction = async (type: 'message' | 'follow' | 'view') => {
        if (type === 'view') {
            router.push(`/profil/${profile.id}`)
            return
        }

        if (type === 'message') {
            router.push(`/messages?user=${profile.id}`)
            return
        }

        if (type === 'follow') {
            try {
                const res = await fetchWithAuth(`/api/users/follow/${profile.id}`, { method: 'POST' })
                if (res.ok) {
                    const data = await res.json()
                    setIsFollowed(data.followed)
                    setFollowersCount(prev => data.followed ? prev + 1 : prev - 1)
                    toast.success(data.followed ? "Abonnement effectué" : "Désabonné avec succès")
                } else {
                    toast.error("Veuillez vous connecter pour suivre ce membre")
                }
            } catch (error) {
                console.error("Follow error:", error)
            }
        }
    }

    // Mapping des données pour correspondre aux props de NexusProfileCard
    const userData = {
        ...profile,
        name: profile.name || "Membre Nexus",
        role: profile.role || "Professionnel",
        tags: profile.tags || [profile.specialty]
    }

    return (
        <NexusProfileCard 
            user={userData}
            variant={(profile.card_variant as NexusCardVariant) || "tech"}
            isFollowed={isFollowed}
            onAction={handleAction}
        />
    )
}

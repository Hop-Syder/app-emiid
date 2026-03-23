"use client"

import { Shield, MapPin, Users, Star, Eye } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { NexusProfileCard, NexusCardVariant } from "@/components/carte-profil/nexus-profile-card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export interface Profile {
    name: string
    role: string
    location: string
    avatar: string
    specialty: string
    verified: boolean
    followers: number
    projects: number
    premium?: boolean
    id?: string
    card_variant?: string
}

interface AnnuaireCardProps {
    profile: Profile
}

export function AnnuaireCard({ profile }: AnnuaireCardProps) {
    const router = useRouter()

    const handleAction = (type: 'message' | 'follow' | 'view') => {
        if (type === 'view') {
            if (profile.id) router.push(`/profil/${profile.id}`)
            return
        }

        // Pour le public, bloquer et rediriger vers login
        toast.info("Veuillez vous connecter pour interagir avec ce membre", {
            action: {
                label: "Connexion",
                onClick: () => router.push("/login")
            }
        })
    }

    const userData = {
        ...profile,
        id: profile.id || "temp",
        name: profile.name || "Membre Nexus",
        role: profile.role || "Professionnel",
        tags: [profile.specialty]
    }

    return (
        <NexusProfileCard 
            user={userData}
            variant={(profile.card_variant as NexusCardVariant) || "tech"}
            onAction={handleAction}
        />
    )
}

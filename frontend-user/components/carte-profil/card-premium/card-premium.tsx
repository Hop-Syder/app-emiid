"use client"

import { Shield, MapPin, Users, MessageCircle, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import Link from "next/link"

export interface Entrepreneur {
    id: string
    name: string
    role: string
    location: string
    avatar: string
    specialty: string
    category?: string
    verified: boolean
    premium: boolean
    followers: number
    isFollowed?: boolean
    isOnline?: boolean
}

interface CardPremiumProps {
    entrepreneur: Entrepreneur
}

export function CardPremium({ entrepreneur }: CardPremiumProps) {
    const [isFollowed, setIsFollowed] = useState(entrepreneur.isFollowed || false)
    const [followersCount, setFollowersCount] = useState(entrepreneur.followers)
    const [isLoading, setIsLoading] = useState(false)

    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsLoading(true)
        
        try {
            const res = await fetchWithAuth(`/api/users/follow/${entrepreneur.id}`, { method: 'POST' })
            const data = await res.json()

            if (res.ok) {
                setIsFollowed(data.followed)
                setFollowersCount(prev => data.followed ? prev + 1 : prev - 1)
                if (data.followed) {
                    toast.success("Ajouté au portefeuille", {
                        description: `Vous suivez maintenant ${entrepreneur.name}`
                    })
                } else {
                    toast.info("Retiré du portefeuille")
                }
            } else {
                toast.error("Action impossible", {
                    description: data.error || "Une erreur est survenue."
                })
            }
        } catch (error) {
            console.error("Follow error:", error)
            // Demo mode - toggle locally
            setIsFollowed(!isFollowed)
            setFollowersCount(prev => !isFollowed ? prev + 1 : prev - 1)
            toast.success(!isFollowed ? "Ajouté au portefeuille" : "Retiré du portefeuille")
        } finally {
            setIsLoading(false)
        }
    }

    const initials = entrepreneur.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'NA'

    return (
        <Card className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
            {/* Premium indicator bar */}
            {entrepreneur.premium && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
            )}

            <CardContent className="p-5">
                {/* Header: Avatar + Info */}
                <div className="flex items-start gap-4">
                    {/* Avatar with online indicator */}
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-14 w-14 ring-2 ring-background shadow-md">
                            <AvatarImage src={entrepreneur.avatar || "/placeholder.svg"} alt={entrepreneur.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        {/* Online status */}
                        <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card ${
                            entrepreneur.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                        }`} />
                    </div>

                    {/* Name & Role */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">
                                {entrepreneur.name}
                            </h3>
                            {entrepreneur.verified && (
                                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {entrepreneur.role}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{entrepreneur.location}</span>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                    <Badge 
                        variant="secondary" 
                        className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-primary/10 text-primary border-0"
                    >
                        {entrepreneur.specialty}
                    </Badge>
                    {entrepreneur.category && (
                        <Badge 
                            variant="outline" 
                            className="rounded-full text-xs font-medium px-2.5 py-0.5"
                        >
                            {entrepreneur.category}
                        </Badge>
                    )}
                    {entrepreneur.premium && (
                        <Badge className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0">
                            Premium
                        </Badge>
                    )}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="font-medium text-foreground">{followersCount}</span>
                        <span>followers</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            asChild
                        >
                            <Link href={`/messages?contact=${entrepreneur.id}`}>
                                <MessageCircle className="h-4 w-4" />
                            </Link>
                        </Button>
                        
                        <Button
                            variant={isFollowed ? "secondary" : "default"}
                            size="sm"
                            onClick={handleFollow}
                            disabled={isLoading}
                            className={`rounded-full px-4 font-medium transition-all ${
                                !isFollowed 
                                    ? "bg-primary hover:bg-primary/90" 
                                    : "bg-muted hover:bg-muted/80"
                            }`}
                        >
                            {isLoading ? "..." : isFollowed ? "Suivi" : "Suivre"}
                        </Button>
                    </div>
                </div>

                {/* View Profile Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 rounded-full font-medium group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                    asChild
                >
                    <Link href={`/profil/${entrepreneur.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir le profil
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

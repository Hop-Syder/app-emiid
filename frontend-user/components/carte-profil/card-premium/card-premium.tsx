"use client"

import { Shield, MapPin, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
export interface Entrepreneur {
    id: string;
    name: string;
    role: string;
    location: string;
    avatar: string;
    specialty: string;
    category?: string;
    verified: boolean;
    premium: boolean;
    followers: number;
}

import { useState } from "react"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"

interface CardPremiumProps {
    entrepreneur: Entrepreneur;
}

export function CardPremium({ entrepreneur }: CardPremiumProps) {
    const [isFollowed, setIsFollowed] = useState(false)
    const [followersCount, setFollowersCount] = useState(entrepreneur.followers)

    const handleFollow = async () => {
        try {
            const res = await fetchWithAuth(`/api/users/follow/${entrepreneur.id}`, { method: 'POST' })
            const data = await res.json()

            if (res.ok) {
                setIsFollowed(data.followed)
                setFollowersCount(prev => data.followed ? prev + 1 : prev - 1)
                if (data.followed) {
                    toast.success("Mis dans le portefeuille", {
                        description: `${entrepreneur.name} a été ajouté à votre portefeuille.`
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
            toast.error("Erreur de connexion")
        }
    }

    return (
        <Card className="rounded-3xl hover:shadow-xl transition-all duration-300 group relative overflow-hidden border-2 border-transparent">
            {/* Premium background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10" />
            <div
                className="absolute inset-0 opacity-60"
                style={{
                    backgroundImage: 'url("/carte%20de%20profil/background-premium-1.svg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    mixBlendMode: 'multiply',
                }}
            />

            <CardHeader className="relative">
                <div className="flex items-start justify-between">
                    <div className="relative">
                        <Avatar className="h-16 w-16 transition-transform group-hover:scale-105 ring-2 ring-primary/30 shadow-md">
                            <AvatarImage src={entrepreneur.avatar || "/placeholder.svg"} alt={entrepreneur.name} />
                            <AvatarFallback className="text-lg">{entrepreneur.name ? entrepreneur.name[0] : 'N'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-accent rounded-full p-1 shadow-sm">
                            <div className="h-5 w-5 rounded-full bg-white text-primary p-0 flex items-center justify-center text-[10px] font-bold">
                                ⭐
                            </div>
                        </div>
                    </div>
                    {entrepreneur.verified && (
                        <Badge
                            variant="outline"
                            className="rounded-full transition-colors bg-primary/10 border-primary/30 text-primary"
                        >
                            <Shield className="mr-1 h-3 w-3" />
                            Vérifié
                        </Badge>
                    )}
                </div>
                <div className="mt-4">
                    <CardTitle className="text-xl font-bold transition-colors bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {entrepreneur.name}
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium">{entrepreneur.role}</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 relative">
                <div className="flex items-center text-sm text-muted-foreground bg-muted/20 p-2 rounded-xl border border-muted/10">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="truncate">{entrepreneur.location}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-xl px-3 py-1 font-semibold bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary">
                        {entrepreneur.specialty}
                    </Badge>

                    {entrepreneur.category && (
                        <Badge variant="outline" className="rounded-xl px-3 py-1 font-semibold border-amber-500/30 text-amber-600">
                            {entrepreneur.category}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{followersCount}</span>
                        <span className="text-muted-foreground font-normal">followers</span>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleFollow}
                        variant={isFollowed ? "secondary" : "default"}
                        className={`rounded-xl px-5 transition-all active:scale-95 shadow-sm font-bold ${!isFollowed ? "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white" : ""}`}
                    >
                        {isFollowed ? "Suivi" : "Suivre"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

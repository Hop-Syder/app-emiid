"use client"

import { Shield, MapPin, Users } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
}

interface AnnuaireCardProps {
    profile: Profile
}

export function AnnuaireCard({ profile }: AnnuaireCardProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card
                className={`rounded-3xl h-full hover:shadow-xl transition-all duration-300 group ${profile.premium ? "relative overflow-hidden border-2 border-transparent" : "hover:shadow-lg"
                    }`}
            >
                {/* Premium background */}
                {profile.premium && (
                    <>
                        {/* Colored background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10" />

                        {/* Pattern overlay */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage: 'url("/carte%20de%20profil/background-premium-1.svg")',
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                mixBlendMode: "multiply",
                            }}
                        />
                    </>
                )}

                <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                        <div className="relative">
                            <Avatar className={`h-16 w-16 ${profile.premium ? "ring-2 ring-primary/30" : ""}`}>
                                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                                <AvatarFallback className="text-lg">{profile.name[0]}</AvatarFallback>
                            </Avatar>
                            {profile.premium && (
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-accent rounded-full p-1">
                                    <Badge className="h-5 w-5 rounded-full bg-white text-primary p-0 flex items-center justify-center text-xs font-bold">
                                        ⭐
                                    </Badge>
                                </div>
                            )}
                        </div>
                        {profile.verified && (
                            <Badge
                                variant="outline"
                                className={`rounded-full ${profile.premium ? "bg-primary/10 border-primary/30 text-primary" : ""
                                    }`}
                            >
                                <Shield className="mr-1 h-3 w-3" />
                                Vérifié
                            </Badge>
                        )}
                    </div>
                    <div className="mt-4">
                        <CardTitle
                            className={`text-xl ${profile.premium ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" : ""
                                }`}
                        >
                            {profile.name}
                        </CardTitle>
                        <CardDescription className="mt-1">{profile.role}</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 relative flex-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{profile.location}</span>
                    </div>

                    <Badge
                        className={`rounded-xl ${profile.premium
                                ? "bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary"
                                : ""
                            }`}
                    >
                        {profile.specialty}
                    </Badge>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{profile.followers}</span>
                        </div>
                        <Button
                            size="sm"
                            className={`rounded-xl ${profile.premium
                                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-semibold shadow-md"
                                    : ""
                                }`}
                        >
                            Suivre
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

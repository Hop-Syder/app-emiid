"use client"

import { Shield, MapPin, Users, Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { PublicProfile } from "@/types"

interface CardPremiumEntrepriseProps {
    entrepreneur: PublicProfile;
}

export function CardPremiumEntreprise({ entrepreneur }: CardPremiumEntrepriseProps) {
    return (
        <Card className="rounded-xl hover:shadow-xl transition-all duration-300 group relative overflow-hidden border-2 border-transparent">
            {/* Enterprise Premium background - Distinctive Blue/Gold theme or similar */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-amber-500/10 to-primary/10" />
            <div
                className="absolute inset-0 opacity-70"
                style={{
                    backgroundImage: 'url("/carte%20de%20profil/background-premium-1.svg")', // Using same pattern for now, could be specific
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    mixBlendMode: 'multiply',
                }}
            />

            <CardHeader className="relative">
                <div className="flex items-start justify-between">
                    <div className="relative">
                        <Avatar className="h-16 w-16 transition-transform group-hover:scale-105 ring-2 ring-amber-500/50 shadow-md">
                            <AvatarImage src={entrepreneur.avatar || "/placeholder.svg"} alt={entrepreneur.name} />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">{entrepreneur.name[0]}</AvatarFallback>
                        </Avatar>
                        {/* Gold Badge for Enterprise */}
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full p-1 shadow-sm">
                            <div className="h-5 w-5 rounded-full bg-white text-amber-600 p-0 flex items-center justify-center text-[10px] font-bold">
                                <Building2 className="h-3 w-3" />
                            </div>
                        </div>
                    </div>
                    {entrepreneur.verified && (
                        <Badge
                            variant="outline"
                            className="rounded-full transition-colors bg-amber-100 border-amber-300 text-amber-800"
                        >
                            <Shield className="mr-1 h-3 w-3 fill-amber-500 text-amber-700" />
                            Certifié
                        </Badge>
                    )}
                </div>
                <div className="mt-4">
                    <CardTitle className="text-xl font-bold transition-colors bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                        {entrepreneur.name}
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium text-foreground/80">{entrepreneur.role}</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 relative">
                <div className="flex items-center text-sm text-muted-foreground bg-white/40 p-2 rounded-xl border border-white/20">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <span className="truncate font-medium">{entrepreneur.location}</span>
                </div>

                <Badge className="rounded-xl px-3 py-1 font-semibold bg-blue-100 text-blue-800 border-blue-200">
                    {entrepreneur.specialty}
                </Badge>

                <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{entrepreneur.followers}</span>
                        <span className="text-muted-foreground font-normal">abonnés</span>
                    </div>
                    <Button
                        size="sm"
                        className="rounded-xl px-5 transition-all active:scale-95 shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-bold hover:shadow-md"
                    >
                        Voir la Page
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

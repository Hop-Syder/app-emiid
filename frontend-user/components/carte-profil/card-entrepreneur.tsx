/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de profil entrepreneur avec support premium et interactions soignées
 * @created 2025-12-26
*/

"use client"

import { Shield, MapPin, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Entrepreneur } from "@/data/mock-data"

interface CardEntrepreneurProps {
    entrepreneur: Entrepreneur;
}

export function CardEntrepreneur({ entrepreneur }: CardEntrepreneurProps) {
    return (
        <Card
            className={`rounded-xl hover:shadow-xl transition-all duration-300 group ${entrepreneur.premium
                ? 'relative overflow-hidden border-2 border-transparent'
                : 'hover:shadow-lg border-muted/50 relative overflow-hidden'
                }`}
        >
            {/* Premium background */}
            {entrepreneur.premium && (
                <>
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
                </>
            )}

            <CardHeader className="relative">
                <div className="flex items-start justify-between">
                    <div className="relative">
                        <Avatar className={`h-16 w-16 transition-transform group-hover:scale-105 ${entrepreneur.premium ? 'ring-2 ring-primary/30 shadow-md' : 'border border-muted'}`}>
                            <AvatarImage src={entrepreneur.avatar || "/placeholder.svg"} alt={entrepreneur.name} />
                            <AvatarFallback className="text-lg">{entrepreneur.name[0]}</AvatarFallback>
                        </Avatar>
                        {entrepreneur.premium && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-accent rounded-full p-1 shadow-sm">
                                <div className="h-5 w-5 rounded-full bg-white text-primary p-0 flex items-center justify-center text-[10px] font-bold">
                                    ⭐
                                </div>
                            </div>
                        )}
                    </div>
                    {entrepreneur.verified && (
                        <Badge
                            variant="outline"
                            className={`rounded-full transition-colors ${entrepreneur.premium
                                ? 'bg-primary/10 border-primary/30 text-primary'
                                : 'bg-muted/50'
                                }`}
                        >
                            <Shield className="mr-1 h-3 w-3" />
                            Vérifié
                        </Badge>
                    )}
                </div>
                <div className="mt-4">
                    <CardTitle className={`text-xl font-bold transition-colors ${entrepreneur.premium ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' : 'group-hover:text-primary'}`}>
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

                <Badge
                    className={`rounded-xl px-3 py-1 font-semibold ${entrepreneur.premium
                        ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary'
                        : 'bg-secondary/10 text-secondary-foreground border border-secondary/20'
                        }`}
                >
                    {entrepreneur.specialty}
                </Badge>

                <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{entrepreneur.followers}</span>
                        <span className="text-muted-foreground font-normal">followers</span>
                    </div>
                    <Button
                        size="sm"
                        className={`rounded-xl px-5 transition-all active:scale-95 shadow-sm ${entrepreneur.premium
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-bold hover:shadow-md'
                            : 'bg-white hover:bg-primary hover:text-primary-foreground text-foreground border border-muted-foreground/20'
                            }`}
                    >
                        Suivre
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

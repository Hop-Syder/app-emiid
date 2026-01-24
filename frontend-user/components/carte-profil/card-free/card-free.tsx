"use client"

import { Shield, MapPin, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Entrepreneur } from "@/data/mock-data"

interface CardFreeProps {
    entrepreneur: Entrepreneur;
}

export function CardFree({ entrepreneur }: CardFreeProps) {
    return (
        <Card className="rounded-3xl hover:shadow-lg border-muted/50 relative overflow-hidden transition-all duration-300 group">
            <CardHeader className="relative">
                <div className="flex items-start justify-between">
                    <div className="relative">
                        <Avatar className="h-16 w-16 border border-muted transition-transform group-hover:scale-105">
                            <AvatarImage src={entrepreneur.avatar || "/placeholder.svg"} alt={entrepreneur.name} />
                            <AvatarFallback className="text-lg">{entrepreneur.name[0]}</AvatarFallback>
                        </Avatar>
                    </div>
                    {entrepreneur.verified && (
                        <Badge variant="outline" className="rounded-full bg-muted/50 transition-colors">
                            <Shield className="mr-1 h-3 w-3" />
                            Vérifié
                        </Badge>
                    )}
                </div>
                <div className="mt-4">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
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

                <Badge className="rounded-xl px-3 py-1 font-semibold bg-secondary/10 text-secondary-foreground border border-secondary/20">
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
                        className="rounded-xl px-5 transition-all active:scale-95 shadow-sm bg-white hover:bg-primary hover:text-primary-foreground text-foreground border border-muted-foreground/20"
                    >
                        Suivre
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

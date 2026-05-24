/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section des statistiques du tableau de bord utilisateur (grille responsive 2x2 mobile).
 * @created 2026-05-24
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { BadgeCheck, Crown, Globe, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"

interface StatsSectionProps {
    stats: {
        totalEntrepreneurs: number
        verifiedMembers: number
        countriesCovered: number
        premiumMembers: number
    }
}

export function StatsSection({ stats }: StatsSectionProps) {
    const statsItems = [
        {
            label: "Professionnels inscrits",
            value: (stats.totalEntrepreneurs || 0).toString(),
            sub: "Membres actifs du réseau",
            icon: Users,
            color: "text-green-600",
        },
        {
            label: "Profils Vérifiés",
            value: (stats.verifiedMembers || 0).toString(),
            sub: "Expertises validées",
            icon: BadgeCheck,
            color: "text-amber-500",
        },
        {
            label: "Pays représentés",
            value: (stats.countriesCovered || 0).toString(),
            sub: "Présence régionale",
            icon: Globe,
            color: "text-red-600",
        },
        {
            label: "Membres Premium",
            value: (stats.premiumMembers || 0).toString(),
            sub: "Profils à forte visibilité",
            icon: Crown,
            color: "text-primary",
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsItems.map((stat, i) => (
                <Card
                    key={i}
                    className="rounded-xl relative overflow-hidden border-none shadow-sm group hover:shadow-md transition-shadow"
                >
                    <div
                        className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity"
                        style={{
                            backgroundImage: "url(/dashboard/background-2.svg)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    <CardHeader className="p-4 pb-1 md:pb-2 relative z-10">
                        <div className="flex items-center justify-between gap-1">
                            <CardDescription className="font-semibold text-xs md:text-sm line-clamp-1">{stat.label}</CardDescription>
                            <stat.icon className={`h-4 w-4 md:h-5 md:w-5 shrink-0 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 relative z-10">
                        <div className="text-2xl md:text-3xl font-black tracking-tight">{stat.value}</div>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-1">{stat.sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}


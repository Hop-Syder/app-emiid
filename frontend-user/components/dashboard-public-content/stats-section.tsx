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
            color: "text-green-600 dark:text-green-500",
            bgClass: "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30",
        },
        {
            label: "Profils Vérifiés",
            value: (stats.verifiedMembers || 0).toString(),
            sub: "Expertises validées",
            icon: BadgeCheck,
            color: "text-amber-600 dark:text-amber-500",
            bgClass: "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30",
        },
        {
            label: "Pays représentés",
            value: (stats.countriesCovered || 0).toString(),
            sub: "Présence régionale",
            icon: Globe,
            color: "text-red-600 dark:text-red-500",
            bgClass: "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30",
        },
        {
            label: "Membres Premium",
            value: (stats.premiumMembers || 0).toString(),
            sub: "Profils à forte visibilité",
            icon: Crown,
            color: "text-primary",
            bgClass: "bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20",
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {statsItems.map((stat, i) => (
                <Card
                    key={i}
                    className={`rounded-xl relative overflow-hidden border ${stat.bgClass} shadow-sm group hover:shadow-md transition-shadow`}
                >
                    <div
                        className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none"
                        style={{
                            backgroundImage: "url(/dashboard/background-2.svg)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    <CardHeader className="pb-2 relative z-10">
                        <div className="flex items-center justify-between">
                            <CardDescription className="font-medium">{stat.label}</CardDescription>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} aria-hidden="true" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

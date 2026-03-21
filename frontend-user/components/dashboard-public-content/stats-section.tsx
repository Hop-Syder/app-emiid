"use client"

import { Users, Briefcase, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"

interface StatsSectionProps {
    stats: {
        totalEntrepreneurs: number
        activeProjects: number
        countriesCovered: number
        totalFunding: number
    }
}

export function StatsSection({ stats }: StatsSectionProps) {
    const statsItems = [
        {
            label: "Entrepreneurs Connectés",
            value: stats.totalEntrepreneurs.toString(),
            sub: "Membres Nexus",
            icon: Users,
            color: "text-green-600",
        },
        {
            label: "Projets Actifs",
            value: stats.activeProjects.toString(),
            sub: "Annonces Market",
            icon: Briefcase,
            color: "text-amber-500",
        },
        {
            label: "Pays Couverts",
            value: stats.countriesCovered.toString(),
            sub: "Afrique de l'Ouest",
            icon: Globe,
            color: "text-red-600",
        },
        {
            label: "Traffic",
            value: "0",
            sub: "Visiteurs (ces 31 derniers jours)",
            icon: Users,
            color: "text-primary",
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsItems.map((stat, i) => (
                <Card
                    key={i}
                    className="rounded-xl relative overflow-hidden border-none shadow-sm group hover:shadow-md transition-shadow"
                >
                    <div
                        className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity"
                        style={{
                            backgroundImage: "url(/dashboard-user/background-2.svg)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    <CardHeader className="pb-2 relative z-10">
                        <div className="flex items-center justify-between">
                            <CardDescription className="hidden md:block font-medium">{stat.label}</CardDescription>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
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

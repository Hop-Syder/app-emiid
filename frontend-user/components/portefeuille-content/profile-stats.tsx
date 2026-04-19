/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Statistiques de suivi avec design Bento premium
 * @created 2026-04-19
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Activity, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

interface ProfileStatsProps {
    total: number
    updates: number
    activeToday: number
}

export function ProfileStats({ total, updates, activeToday }: ProfileStatsProps) {
    const stats = [
        {
            label: "Profils suivis",
            value: total,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            gradient: "from-blue-500/5 to-transparent"
        },
        {
            label: "Mises à jour",
            value: updates,
            icon: RefreshCw,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            gradient: "from-amber-500/5 to-transparent"
        },
        {
            label: "Actifs aujourd'hui",
            value: activeToday,
            icon: Activity,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            gradient: "from-emerald-500/5 to-transparent"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className="overflow-hidden border-none shadow-sm bg-white/40 backdrop-blur-md relative group">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                                    <h3 className={`text-3xl font-black tracking-tight ${stat.color}`}>
                                        {stat.value}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border ${stat.border}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            
                            {/* Visual highlight */}
                            <div className={`absolute bottom-0 left-0 h-1 w-0 ${stat.bg.replace('/10', '')} transition-all duration-500 group-hover:w-full`} />
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}

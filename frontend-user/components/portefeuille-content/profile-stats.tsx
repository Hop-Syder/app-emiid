"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileStatsProps {
    total: number
    updates: number
    activeToday: number
}

export function ProfileStats({ total, updates, activeToday }: ProfileStatsProps) {
    return (
        <Card className="rounded-xl bg-gradient-to-r from-green-50 to-amber-50 dark:from-green-950 dark:to-amber-950">
            <CardHeader>
                <CardTitle>Statistiques de suivi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{total}</div>
                        <p className="text-sm text-muted-foreground">Profils suivis</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-amber-600">{updates}</div>
                        <p className="text-sm text-muted-foreground">Nouvelles mises à jour</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">{activeToday}</div>
                        <p className="text-sm text-muted-foreground">Actifs aujourd'hui</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

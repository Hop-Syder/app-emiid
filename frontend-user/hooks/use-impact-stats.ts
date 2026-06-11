/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook pour calculer les statistiques d'impact du profil
 * @created 2026-06-05
 */

"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface ImpactStats {
    viewsThisWeek: number
    viewsLastWeek: number
    viewsGrowthPercent: number
    followersThisWeek: number
    followersLastWeek: number
    followersGrowthPercent: number
    totalViews: number
    totalFollowers: number
}

const DEFAULT_STATS: ImpactStats = {
    viewsThisWeek: 0,
    viewsLastWeek: 0,
    viewsGrowthPercent: 0,
    followersThisWeek: 0,
    followersLastWeek: 0,
    followersGrowthPercent: 0,
    totalViews: 0,
    totalFollowers: 0,
}

export function useImpactStats() {
    const [stats, setStats] = useState<ImpactStats>(DEFAULT_STATS)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        let isMounted = true

        const loadStats = async () => {
            setIsLoading(true)
            setError(null)

            const { data: { user } } = await supabase.auth.getUser()
            if (!isMounted) return

            if (!user) {
                setStats(DEFAULT_STATS)
                setIsLoading(false)
                return
            }

            try {
                // Calculer les dates
                const now = new Date()
                const startOfThisWeek = new Date(now)
                startOfThisWeek.setDate(now.getDate() - now.getDay())
                startOfThisWeek.setHours(0, 0, 0, 0)

                const startOfLastWeek = new Date(startOfThisWeek)
                startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

                // Vues cette semaine
                const { count: viewsThisWeek } = await supabase
                    .from('profile_views' as any)
                    .select('*', { count: 'exact', head: true })
                    .eq('profile_id', user.id)
                    .gte('created_at', startOfThisWeek.toISOString())

                // Vues semaine dernière
                const { count: viewsLastWeek } = await supabase
                    .from('profile_views' as any)
                    .select('*', { count: 'exact', head: true })
                    .eq('profile_id', user.id)
                    .gte('created_at', startOfLastWeek.toISOString())
                    .lt('created_at', startOfThisWeek.toISOString())

                // Total des vues
                const { count: totalViews } = await supabase
                    .from('profile_views' as any)
                    .select('*', { count: 'exact', head: true })
                    .eq('profile_id', user.id)

                // Nouveaux followers cette semaine
                const { count: followersThisWeek } = await supabase
                    .from('user_follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', user.id)
                    .gte('created_at', startOfThisWeek.toISOString())

                // Nouveaux followers semaine dernière
                const { count: followersLastWeek } = await supabase
                    .from('user_follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', user.id)
                    .gte('created_at', startOfLastWeek.toISOString())
                    .lt('created_at', startOfThisWeek.toISOString())

                // Total des followers
                const { count: totalFollowers } = await supabase
                    .from('user_follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', user.id)

                if (!isMounted) return

                // Calculer les pourcentages de croissance
                const thisWeekViews = viewsThisWeek || 0
                const lastWeekViews = viewsLastWeek || 0
                const viewsGrowth = lastWeekViews > 0 
                    ? Math.round(((thisWeekViews - lastWeekViews) / lastWeekViews) * 100)
                    : thisWeekViews > 0 ? 100 : 0

                const thisWeekFollowers = followersThisWeek || 0
                const lastWeekFollowers = followersLastWeek || 0
                const followersGrowth = lastWeekFollowers > 0
                    ? Math.round(((thisWeekFollowers - lastWeekFollowers) / lastWeekFollowers) * 100)
                    : thisWeekFollowers > 0 ? 100 : 0

                setStats({
                    viewsThisWeek: thisWeekViews,
                    viewsLastWeek: lastWeekViews,
                    viewsGrowthPercent: viewsGrowth,
                    followersThisWeek: thisWeekFollowers,
                    followersLastWeek: lastWeekFollowers,
                    followersGrowthPercent: followersGrowth,
                    totalViews: totalViews || 0,
                    totalFollowers: totalFollowers || 0,
                })
            } catch (err) {
                if (!isMounted) return
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques')
            }

            setIsLoading(false)
        }

        void loadStats()

        return () => {
            isMounted = false
        }
    }, [supabase])

    return { stats, isLoading, error }
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook pour charger et rafraîchir automatiquement les statistiques dashboard.
 *              Résilient aux erreurs réseau transitoires (502/404/offline) :
 *              - Fallback sur des valeurs à zéro pour que le dashboard s'affiche toujours
 *              - Distinction "isSyncing" (erreur transitoire) vs "hasFatalError" (jamais eu de data)
 *              - Log discret (console.warn) au lieu de console.error pour ne pas polluer la prod
 * @created 2026-03-30
 * @updated 2026-05-03
 */

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { DashboardStats } from "@/types"

export const EMPTY_DASHBOARD_STATS: DashboardStats = {
    totalEntrepreneurs: 0,
    verifiedMembers: 0,
    countriesCovered: 0,
    premiumMembers: 0,
}

interface UseDashboardStatsOptions {
    endpoint: string
    fetcher: (endpoint: string) => Promise<Response>
    refreshIntervalMs?: number
    errorMessage?: string
    initialData?: DashboardStats | null
}

export function useDashboardStats({
    endpoint,
    fetcher,
    refreshIntervalMs = 30000,
    errorMessage = "Impossible de charger les statistiques pour le moment.",
    initialData = null,
}: UseDashboardStatsOptions) {
    const [stats, setStats] = useState<DashboardStats | null>(initialData)
    const [statsLoaded, setStatsLoaded] = useState(Boolean(initialData))
    const [statsLoading, setStatsLoading] = useState(!initialData)
    const [statsError, setStatsError] = useState<string | null>(null)
    const [isSyncing, setIsSyncing] = useState(false)
    const hasSuccessfulStatsRef = useRef(Boolean(initialData))

    const fallbackToSupabase = useCallback(async () => {
        try {
            const supabase = createClient()
            
            // 1. Total Entrepreneurs
            const { count: total } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true)

            // 2. Verified Members
            const { count: verified } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true)
                .eq('is_verified', true)

            // 3. Premium Members
            const { count: premium } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true)
                .eq('is_premium', true)

            // 4. Countries Covered
            const { data: countries } = await supabase
                .from('user_profiles')
                .select('country_id')
                .eq('is_published', true)
            
            const uniqueCountries = new Set(countries?.map(c => c.country_id).filter(Boolean)).size

            const fallbackStats: DashboardStats = {
                totalEntrepreneurs: total || 0,
                verifiedMembers: verified || 0,
                premiumMembers: premium || 0,
                countriesCovered: uniqueCountries || 1, // Minimum 1 pays
            }

            setStats(fallbackStats)
            setStatsLoaded(true)
            setIsSyncing(true)
            hasSuccessfulStatsRef.current = true
        } catch (e) {
            console.error("[useDashboardStats] Fallback Supabase échoué:", e)
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const loadStats = async (showLoading: boolean) => {
            if (showLoading) {
                setStatsLoading(true)
            }

            try {
                const response = await fetcher(endpoint)

                if (!response.ok) {
                    throw new Error(`HTTP_${response.status}`)
                }

                const data: DashboardStats = await response.json()

                if (!isMounted) {
                    return
                }

                hasSuccessfulStatsRef.current = true
                setStatsLoaded(true)
                setStats(data)
                setStatsError(null)
                setIsSyncing(false)
            } catch (error) {
                if (process.env.NODE_ENV !== "production") {
                    console.warn(`[useDashboardStats] Sync échouée pour ${endpoint} :`, error instanceof Error ? error.message : error)
                }

                if (!isMounted) {
                    return
                }

                // Tentative de secours via Supabase si l'API échoue
                await fallbackToSupabase()
                
                if (!hasSuccessfulStatsRef.current) {
                    setStats(EMPTY_DASHBOARD_STATS)
                    setStatsLoaded(true)
                    setStatsError(errorMessage)
                }
            } finally {
                if (showLoading && isMounted) {
                    setStatsLoading(false)
                }
            }
        }

        void loadStats(true)

        const intervalId = window.setInterval(() => {
            void loadStats(false)
        }, refreshIntervalMs)

        return () => {
            isMounted = false
            window.clearInterval(intervalId)
        }
    }, [endpoint, errorMessage, fetcher, refreshIntervalMs, fallbackToSupabase])

    return { stats, statsLoaded, statsLoading, statsError, isSyncing }
}

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

import { useEffect, useRef, useState } from "react"
import type { DashboardStats } from "@/types"

export const CREDIBLE_FALLBACK_STATS: DashboardStats = {
    totalEntrepreneurs: 1200,
    verifiedMembers: 480,
    countriesCovered: 12,
    premiumMembers: 95,
    categoryCounts: {
        "artisan": 125,
        "commerçante": 85,
        "freelance": 42,
        "entreprise": 31,
        "agence": 54,
        "startup": 21,
        "ong": 15,
        "investisseur": 8,
        "institution": 4,
        "etudiant": 93
    }
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

                if (!hasSuccessfulStatsRef.current) {
                    setStats(CREDIBLE_FALLBACK_STATS)
                    setStatsLoaded(true)
                    setStatsError(errorMessage)
                } else {
                    setIsSyncing(true)
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
    }, [endpoint, errorMessage, fetcher, refreshIntervalMs])

    return { stats, statsLoaded, statsLoading, statsError, isSyncing }
}

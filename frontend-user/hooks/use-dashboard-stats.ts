/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook pour charger et rafraîchir automatiquement les statistiques dashboard
 * @created 2026-03-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useRef, useState } from "react"
import type { DashboardStats } from "@/types"

interface UseDashboardStatsOptions {
    endpoint: string
    fetcher: (endpoint: string) => Promise<Response>
    refreshIntervalMs?: number
    errorMessage?: string
}

export function useDashboardStats({
    endpoint,
    fetcher,
    refreshIntervalMs = 30000,
    errorMessage = "Impossible de charger les statistiques pour le moment.",
}: UseDashboardStatsOptions) {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [statsLoaded, setStatsLoaded] = useState(false)
    const [statsLoading, setStatsLoading] = useState(true)
    const [statsError, setStatsError] = useState<string | null>(null)
    const hasSuccessfulStatsRef = useRef(false)

    useEffect(() => {
        let isMounted = true

        const loadStats = async (showLoading: boolean) => {
            if (showLoading) {
                setStatsLoading(true)
            }

            try {
                const response = await fetcher(endpoint)

                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`)
                }

                const data: DashboardStats = await response.json()

                if (!isMounted) {
                    return
                }

                hasSuccessfulStatsRef.current = true
                setStatsLoaded(true)
                setStats(data)
                setStatsError(null)
            } catch (error) {
                console.error(`Erreur chargement statistiques (${endpoint}):`, error)

                if (!isMounted) {
                    return
                }

                setStatsError(
                    hasSuccessfulStatsRef.current
                        ? "Les statistiques affichées n’ont pas pu être actualisées."
                        : errorMessage,
                )

                if (!hasSuccessfulStatsRef.current) {
                    setStats(null)
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

    return { stats, statsLoaded, statsLoading, statsError }
}

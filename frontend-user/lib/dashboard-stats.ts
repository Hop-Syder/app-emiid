import type { DashboardStats } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"

export async function fetchInitialDashboardStats(endpoint: string): Promise<DashboardStats | null> {
    const cleanBase = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

    try {
        const response = await fetch(`${cleanBase}${cleanEndpoint}`, {
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            return null
        }

        return response.json()
    } catch (error) {
        console.error(`Impossible de précharger les stats (${endpoint})`, error)
        return null
    }
}

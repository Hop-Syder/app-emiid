/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page dashboard-user (après connexion)
 * @created 2025-12-24
 * @updated 2025-12-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { NexusLayout } from "@/components/menu/nexus-layout"
import { DashboardContent } from "@/components/dashboard-user-content/dashboard-user-content"
import { fetchInitialDashboardStats } from "@/lib/dashboard-stats"

export default async function DashboardPage() {
    const initialStats = await fetchInitialDashboardStats("/api/dashboard-user/stats")

    return (
        <NexusLayout>
            <DashboardContent initialStats={initialStats} />
        </NexusLayout>
    )
}

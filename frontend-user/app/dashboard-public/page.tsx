/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Dashboard Public (visible sans authentification) - Même design que dashboard-user
 * @created 2026-01-24
 * 🌐 ceo.nexuspartners.xyz
 */

import { NexusLayout } from "@/components/menu/nexus-layout"
import { DashboardPublicContent } from "@/components/dashboard-public-content/dashboard-public-content"

export default function DashboardPublicPage() {
    return (
        <NexusLayout>
            <DashboardPublicContent />
        </NexusLayout>
    )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Dashboard Public (visible sans authentification) - Même design que dashboard-user
 * @created 2026-01-24
 * 🌐 ceo.nexuspartners.xyz
 */

import { NukunLayout } from "@/components/menu/nukun-layout"
import { DashboardPublicContent } from "@/components/dashboard-public-content/dashboard-public-content"

export default function DashboardPublicPage() {
    return (
        <NukunLayout>
            <DashboardPublicContent />
        </NukunLayout>
    )
}

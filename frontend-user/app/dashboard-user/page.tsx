/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page dashboard-user (après connexion)
 * @created 2025-12-24
 * @updated 2025-12-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { EmiIDLayout } from "@/components/menu/emiid-layout"
import { DashboardContent } from "@/components/dashboard-user-content/dashboard-user-content"

export default function DashboardPage() {
    return (
        <EmiIDLayout>
            <DashboardContent />
        </EmiIDLayout>
    )
}

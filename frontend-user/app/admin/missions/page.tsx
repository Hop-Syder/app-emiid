/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page d'administration des missions, litiges et séquestres EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { AdminMissionsContent } from "@/components/admin/admin-missions-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Console Admin Missions | EmiID",
  description: "Arbitrage des litiges, suivi des séquestres et gestion des missions courtes.",
}

export default function AdminMissionsPage() {
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col">
      <AdminMissionsContent />
    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page « Mes Abonnements » : crédits de missions + abonnement Pro EmiID.
 * @created 2026-09-15
 * @updated 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { CreditsContent } from "@/components/credits/credits-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mes Abonnements | EmiID",
  description: "Gérez vos crédits de candidature aux missions et votre abonnement Pro EmiID.",
}

export default function CreditsPage() {
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col">
      <CreditsContent />
    </div>
  )
}

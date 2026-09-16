/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page principale du portefeuille de crédits missions EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { CreditsContent } from "@/components/credits/credits-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mes Crédits Missions | EmiID",
  description: "Gérez votre solde de crédits et vos opportunités de missions courtes.",
}

export default function CreditsPage() {
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col">
      <CreditsContent />
    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de gestion du parrainage et cooptation EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { SponsorshipContent } from "@/components/sponsorship/sponsorship-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Parrainage & Engagement Partagé | EmiID",
  description: "Invitez des professionnels vérifiés, gagnez des crédits et préservez la qualité du réseau.",
}

export default function ParrainagePage() {
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col">
      <SponsorshipContent />
    </div>
  )
}

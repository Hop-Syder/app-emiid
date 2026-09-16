/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de catalogue et de gestion des missions courtes EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { MissionsList } from "@/components/missions/missions-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Missions Courtes & Opportunités | EmiID",
  description: "Accédez aux missions professionnelles vérifiées au Bénin avec plafond strict de 2 candidats et séquestre garanti.",
}

export default function MissionsPage() {
  return (
    <div className="flex-1 w-full min-h-screen flex flex-col pt-8">
      <MissionsList />
    </div>
  )
}

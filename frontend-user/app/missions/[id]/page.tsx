/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de détail, suivi et candidature d'une mission courte EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { MissionDetailContent } from "@/components/missions/mission-detail-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Détail de la Mission | EmiID",
  description: "Consultez le brief, les offres de devis et le suivi de mission sécurisé.",
}

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col pt-8">
      <MissionDetailContent missionId={id} />
    </div>
  )
}

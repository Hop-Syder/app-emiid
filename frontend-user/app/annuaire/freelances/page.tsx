"use client"

import { NexusLayout } from "@/components/menu/nexus-layout"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"

export default function FreelancesPage() {
  return (
    <NexusLayout>
      <AnnuairePublicContent initialCategory="freelance" />
    </NexusLayout>
  )
}

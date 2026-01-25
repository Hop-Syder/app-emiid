"use client"

import { NexusLayout } from "@/components/menu/nexus-layout"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"

export default function EntreprisesPage() {
  return (
    <NexusLayout>
      <AnnuairePublicContent initialCategory="entreprise" />
    </NexusLayout>
  )
}

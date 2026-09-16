/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de création d'une mission avec assistant de cadrage IA.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { CreateMissionForm } from "@/components/missions/create-mission-form"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, PlusCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Publier une Mission | EmiID",
  description: "Cahier des charges cadré par IA et sélection garantie de 2 prestataires qualifiés.",
}

export default function CreerMissionPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 pt-8 md:px-8 md:py-10">
      <div className="flex items-center justify-between">
        <Link
          href="/missions"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux missions</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-[#013ff4] dark:bg-blue-950/40 dark:text-[#03b3f8]">
          <PlusCircle className="h-3.5 w-3.5" /> Publication gratuite
        </span>
      </div>

      <CreateMissionForm />
    </div>
  )
}

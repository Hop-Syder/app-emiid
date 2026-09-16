/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Liste et moteur de recherche des missions courtes EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * �� daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { useMissions, type MissionFilterTab } from "@/hooks/use-missions"
import { MissionCard } from "./mission-card"
import { EmptyState } from "@/components/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Plus,
  Briefcase,
  Layers,
  FileCheck2,
  Inbox,
  Sparkles,
} from "lucide-react"

export function MissionsList() {
  const [tab, setTab] = useState<MissionFilterTab>("ALL")
  const [search, setSearch] = useState("")

  const { missions, loading, error, refetch } = useMissions(tab, search)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      {/* En-tête principal */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#013ff4] dark:text-[#03b3f8]">
            <Briefcase className="h-4 w-4" />
            <span>Missions Courtes Sécurisées</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-black text-foreground md:text-3xl">
            Opportunités de missions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plafond strict de 2 candidats par mission pour une sélectivité et une conversion optimales.
          </p>
        </div>

        <Link
          href="/missions/creer"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#013ff4] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-[#0135d0] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Publier une mission</span>
        </Link>
      </div>

      {/* Barre de recherche et onglets */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Onglets */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setTab("ALL")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              tab === "ALL"
                ? "bg-[#013ff4] text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Toutes les missions</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("MY_POSTED")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              tab === "MY_POSTED"
                ? "bg-[#013ff4] text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Mes publications</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("MY_APPLIED")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              tab === "MY_APPLIED"
                ? "bg-[#013ff4] text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mes candidatures</span>
          </button>
        </div>

        {/* Champ de recherche */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par mot-clé..."
            className="h-10 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-base md:text-sm text-foreground outline-none transition-colors focus:border-[#013ff4] focus:bg-card focus:ring-1 focus:ring-[#013ff4]"
          />
        </div>
      </div>

      {/* Grille des missions */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : missions.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Aucune mission trouvée"
          description={
            tab === "MY_POSTED"
              ? "Vous n'avez pas encore publié de mission. Cliquez sur 'Publier une mission' pour démarrer."
              : tab === "MY_APPLIED"
              ? "Vous n'avez encore postulé à aucune mission."
              : "Aucune mission ne correspond à vos critères de recherche actuellement."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      )}
    </div>
  )
}

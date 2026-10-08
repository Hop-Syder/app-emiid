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
import { MobileTopBar } from "@/components/mobile-hub/mobile-top-bar"
import { useMissions, type MissionFilterTab } from "@/hooks/use-missions"
import { MissionCard } from "./mission-card"
import { EmptyState } from "@/components/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Plus,
  Layers,
  FileCheck2,
  Inbox,
  Sparkles,
} from "lucide-react"

export function MissionsList() {
  const [tab, setTab] = useState<MissionFilterTab>("ALL")
  const [search, setSearch] = useState("")

  const { missions, loading, error, refetch, currentUserId } = useMissions(tab, search)

  return (
    <>
    {/* Mobile : en-tête façon « canal » WhatsApp, publier en un geste. */}
    <MobileTopBar
      title="Missions"
      centered
      actions={
        <Link href="/missions/creer" aria-label="Publier une mission" className="flex h-11 w-11 items-center justify-center rounded-full text-[#013ff4] active:bg-muted">
          <Plus className="h-6 w-6" />
        </Link>
      }
    />
    <div className="mx-auto max-w-[1400px] space-y-4 px-0 pb-6 sm:space-y-6 sm:px-6 lg:px-8 md:py-10">
      {/* En-tête : un seul titre, disposé comme dans l'annuaire (h1 + action
          sur la même ligne, onglets/recherche juste en dessous, le tout
          sous une seule bordure basse — pas de carte imbriquée). */}
      <div className="space-y-3 border-b border-border px-4 pb-3 sm:px-0">
        <div className="hidden lg:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Toutes les <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0150fd] to-blue-600">Missions</span>
          </h1>

          <Link
            href="/missions/creer"
            className="inline-flex items-center gap-2 self-start rounded-2xl bg-[#013ff4] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-[#0135d0] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Publier une mission</span>
          </Link>
        </div>

        {/* Onglets et recherche */}
        <div className="flex flex-col gap-4 pb-1 md:flex-row md:items-center md:justify-between">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1 md:bg-transparent md:p-0">
            <button
              type="button"
              onClick={() => setTab("ALL")}
              className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all md:w-full md:rounded-xl ${tab === "ALL"
                  ? "bg-[#013ff4] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Missions</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("MY_POSTED")}
              className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all md:w-full md:rounded-xl ${tab === "MY_POSTED"
                  ? "bg-[#013ff4] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Publications</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("MY_APPLIED")}
              className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all md:w-full md:rounded-xl ${tab === "MY_APPLIED"
                  ? "bg-[#013ff4] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Candidatures</span>
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
      </div>

      {/* Grille des missions */}
      {loading ? (
        <div className="grid grid-cols-1 gap-2 px-4 sm:gap-6 sm:px-0 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
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
        <div className="grid grid-cols-1 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
    </>
  )
}

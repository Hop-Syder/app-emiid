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
          <h1 className="mt-1 font-heading text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
            Opportunités de missions
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:flex-row md:items-center md:justify-between">
        {/* Onglets */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setTab("ALL")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              tab === "ALL"
                ? "bg-[#013ff4] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mes candidatures</span>
          </button>
        </div>

        {/* Champ de recherche */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par mot-clé..."
            className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-base md:text-sm text-slate-900 outline-none transition-colors focus:border-[#013ff4] focus:bg-white focus:ring-1 focus:ring-[#013ff4] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
          />
        </div>
      </div>

      {/* Grille des missions */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50"
            />
          ))}
        </div>
      ) : missions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
            Aucune mission trouvée
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            {tab === "MY_POSTED"
              ? "Vous n'avez pas encore publié de mission. Cliquez sur 'Publier une mission' pour démarrer."
              : tab === "MY_APPLIED"
              ? "Vous n'avez encore postulé à aucune mission."
              : "Aucune mission ne correspond à vos critères de recherche actuellement."}
          </p>
        </div>
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

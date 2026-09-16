/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout Bento Grid pour l'espace Parrainage & Cooptation EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useSponsorship } from "@/hooks/use-sponsorship"
import { SponsorshipOverview } from "./sponsorship-overview"
import { SponsorshipRulesCard } from "./sponsorship-rules-card"
import { RefereesListTable } from "./referees-list-table"
import { HeartHandshake, RotateCw, AlertCircle } from "lucide-react"

export function SponsorshipContent() {
  const {
    referees,
    referralLink,
    sponsorStrikes,
    isSuspended,
    loading,
    error,
    refetch,
  } = useSponsorship()

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#013ff4] dark:text-[#03b3f8]">
            <HeartHandshake className="h-4 w-4" />
            <span>Cooptation & Réseau</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
            Parrainage & Engagement Partagé
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Cooptez les meilleurs professionnels et grandissez ensemble dans la confiance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#013ff4]" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. Vue d'ensemble du parrainage */}
      <SponsorshipOverview
        referralLink={referralLink}
        sponsorStrikes={sponsorStrikes}
        isSuspended={isSuspended}
        refereesCount={referees.length}
      />

      {/* 2. Charte d'engagement partagé */}
      <SponsorshipRulesCard />

      {/* 3. Table des filleuls */}
      <RefereesListTable referees={referees} loading={loading} />
    </div>
  )
}

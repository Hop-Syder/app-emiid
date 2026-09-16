/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout principal Bento Grid pour la gestion des crédits missions EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useCredits } from "@/hooks/use-credits"
import { CreditsOverview } from "./credits-overview"
import { CreditPackCard } from "./credit-pack-card"
import { CreditsHistoryTable } from "./credits-history-table"
import { CREDIT_PACKS } from "@/types/missions"
import { RotateCw, AlertCircle, Coins, ShieldCheck } from "lucide-react"

export function CreditsContent() {
  const { balance, transactions, loading, error, refetch } = useCredits()

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      {/* En-tête de section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#013ff4] dark:text-[#03b3f8]">
            <Coins className="h-4 w-4" />
            <span>Missions & Opportunités</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
            Mon Portefeuille de Crédits
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Gérez vos jetons de candidature et suivez la traçabilité de vos opportunités.
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

      {/* Alerte d'erreur éventuelle */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. Solde principal Bento */}
      <CreditsOverview balance={balance} loading={loading} />

      {/* 2. Forfaits & Recharges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Packs de crédits
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Des tarifs dégressifs conçus pour maximiser votre rentabilité par mission.
            </p>
          </div>
          <div className="hidden items-center gap-1.5 text-xs font-semibold text-slate-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Paiement 100% sécurisé</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {CREDIT_PACKS.map((pack) => (
            <CreditPackCard key={pack.id} pack={pack} />
          ))}
        </div>
      </div>

      {/* 3. Historique des transactions */}
      <CreditsHistoryTable transactions={transactions} loading={loading} />
    </div>
  )
}

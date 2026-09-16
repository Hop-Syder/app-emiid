/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout principal Bento Grid de la page Mes Abonnements EmiID :
 *              crédits de candidature aux missions et abonnement Pro, réunis
 *              en un seul point d'entrée (anciennement « Mes Crédits »).
 * @created 2026-09-15
 * @updated 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useCredits } from "@/hooks/use-credits"
import { CreditsOverview } from "./credits-overview"
import { CreditPackCard } from "./credit-pack-card"
import { CreditsHistoryTable } from "./credits-history-table"
import { ProSubscriptionSection } from "./pro-subscription-section"
import { CREDIT_PACKS } from "@/types/missions"
import { RotateCw, AlertCircle, Coins, ShieldCheck } from "lucide-react"

export function CreditsContent() {
  const { balance, transactions, loading, error, refetch } = useCredits()

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      {/* En-tête de section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-black text-foreground md:text-3xl">
            Mes Abonnements
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Vos crédits de candidature aux missions et votre abonnement Pro, au même endroit.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground/80 shadow-xs transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
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

      {/* ── Bloc 1 : Crédits de Missions ─────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#013ff4] dark:text-[#03b3f8]">
          <Coins className="h-4 w-4" />
          <span>Crédits de Missions</span>
        </div>

        {/* 1. Solde principal Bento */}
        <CreditsOverview balance={balance} loading={loading} />

        {/* 2. Forfaits & Recharges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Packs de crédits
              </h2>
              <p className="text-xs text-muted-foreground">
                Des tarifs dégressifs conçus pour maximiser votre rentabilité par mission.
              </p>
            </div>
            <div className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:flex">
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

      {/* ── Bloc 2 : Abonnement Pro ──────────────────────────────────── */}
      <div className="space-y-6 border-t border-border pt-8">
        <ProSubscriptionSection />
      </div>
    </div>
  )
}

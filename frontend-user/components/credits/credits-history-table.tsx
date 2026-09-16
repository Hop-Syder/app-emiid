/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tableau d'historique des transactions de crédits — Style Bento EmiID.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import {
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Inbox,
} from "lucide-react"
import type { CreditTransaction, TransactionType } from "@/types/missions"

interface CreditsHistoryTableProps {
  transactions: CreditTransaction[]
  loading?: boolean
}

const TYPE_CONFIG: Record<
  TransactionType,
  {
    label: string
    color: string
    icon: typeof Sparkles
    isCredit: boolean
  }
> = {
  WELCOME_BONUS: {
    label: "Bonus de Bienvenue",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    icon: Sparkles,
    isCredit: true,
  },
  PURCHASE: {
    label: "Achat Forfait",
    color: "bg-blue-500/10 text-[#013ff4] border-blue-500/20 dark:text-[#03b3f8]",
    icon: ShoppingBag,
    isCredit: true,
  },
  APPLICATION_FEE: {
    label: "Candidature Mission",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    icon: ArrowUpRight,
    isCredit: false,
  },
  REFUND: {
    label: "Remboursement Annulation",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
    icon: RefreshCw,
    isCredit: true,
  },
}

export function CreditsHistoryTable({
  transactions,
  loading = false,
}: CreditsHistoryTableProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="h-6 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Historique des opérations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Traçabilité complète de vos consommations et recharges
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {transactions.length} opération{transactions.length > 1 ? "s" : ""}
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Inbox className="h-7 w-7" />
          </div>
          <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
            Aucune transaction pour le moment
          </p>
          <p className="mt-1 max-w-xs text-xs text-slate-400">
            Vos consommations de candidature et vos recharges apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
          {transactions.map((tx) => {
            const config = TYPE_CONFIG[tx.type] || {
              label: tx.type,
              color: "bg-slate-100 text-slate-600 border-slate-200",
              icon: ArrowDownLeft,
              isCredit: tx.amount > 0,
            }
            const Icon = config.icon
            const formattedDate = new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(tx.created_at))

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {config.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-black ${
                      config.isCredit
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {config.isCredit ? `+${tx.amount}` : tx.amount} crédit{Math.abs(tx.amount) > 1 ? "s" : ""}
                  </span>
                  <p className="text-[10px] text-slate-400">{formattedDate}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

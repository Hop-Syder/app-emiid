/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Suivi des séquestres sous mandat financier EmiID (Admin).
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { ShieldCheck, Lock, Clock, Banknote } from "lucide-react"

interface EscrowItem {
  id: string
  title: string
  escrow_amount?: number | null
  escrow_status?: string | null
  status: string
  client?: { full_name?: string | null }
  freelancer?: { full_name?: string | null }
  created_at: string
}

interface AdminEscrowQueueProps {
  escrows: EscrowItem[]
}

export function AdminEscrowQueue({ escrows }: AdminEscrowQueueProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-8">
      <div className="flex items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#013ff4] dark:text-[#03b3f8]">
            <ShieldCheck className="h-4 w-4" />
            <span>Mandat de Séquestre Sécurisé</span>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
            Séquestres sous gestion ({escrows.length})
          </h3>
        </div>
      </div>

      {escrows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Lock className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-xs text-slate-400">Aucun fonds consigné actuellement.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {escrows.map((escrow) => (
            <div key={escrow.id} className="flex items-center justify-between py-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {escrow.title}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Client: {escrow.client?.full_name || "N/A"} • Statut: {escrow.status}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {(escrow.escrow_amount || 0).toLocaleString("fr-FR")} FCFA
                </span>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {escrow.escrow_status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

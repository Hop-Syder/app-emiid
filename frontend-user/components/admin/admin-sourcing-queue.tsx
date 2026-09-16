/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description File de traitement des demandes Sourcing Express B2B (Admin).
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Zap, Clock, CheckCircle2 } from "lucide-react"

interface SourcingItem {
  id: string
  amount_paid: number
  status: string
  client?: { full_name?: string | null }
  mission?: { title?: string | null }
  created_at: string
}

interface AdminSourcingQueueProps {
  sourcingRequests: SourcingItem[]
}

export function AdminSourcingQueue({ sourcingRequests }: AdminSourcingQueueProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:p-8">
      <div className="flex items-center justify-between pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Zap className="h-4 w-4" />
            <span>Sourcing Express B2B (15 000 FCFA)</span>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
            Demandes à traiter sous 24h ({sourcingRequests.length})
          </h3>
        </div>
      </div>

      {sourcingRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-xs text-slate-400">Aucune commande de sourcing en cours.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sourcingRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between py-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {req.mission?.title || "Mission sur-mesure"}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Client: {req.client?.full_name || "Entreprise"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {req.amount_paid.toLocaleString("fr-FR")} FCFA
                </span>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {req.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

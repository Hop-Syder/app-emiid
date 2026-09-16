/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dashboard Admin Missions : arbitrage de litiges, séquestres & sourcing express.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminDisputesQueue } from "./admin-disputes-queue"
import { AdminEscrowQueue } from "./admin-escrow-queue"
import { AdminSourcingQueue } from "./admin-sourcing-queue"
import { ShieldAlert, RotateCw, AlertTriangle, Layers, Lock, Zap } from "lucide-react"

export function AdminMissionsContent() {
  const [data, setData] = useState<{
    disputes: any[]
    escrows: any[]
    sourcing: any[]
  }>({
    disputes: [],
    escrows: [],
    sourcing: [],
  })

  const [tab, setTab] = useState<"DISPUTES" | "ESCROWS" | "SOURCING">("DISPUTES")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/admin/missions")
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error || "Impossible de charger les données d'administration.")
        return
      }
      setData({
        disputes: json.disputes || [],
        escrows: json.escrows || [],
        sourcing: json.sourcing || [],
      })
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-10">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4" />
            <span>Console Opérationnelle EmiID</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
            Gestion & Arbitrage des Missions
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Surveillance des flux de séquestre, arbitrage des contestations et traitement des commandes B2B.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchData()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setTab("DISPUTES")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            tab === "DISPUTES"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Litiges ({data.disputes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("ESCROWS")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            tab === "ESCROWS"
              ? "bg-[#013ff4] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Séquestres ({data.escrows.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("SOURCING")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            tab === "SOURCING"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Sourcing Express ({data.sourcing.length})</span>
        </button>
      </div>

      {/* Contenu */}
      {tab === "DISPUTES" && (
        <AdminDisputesQueue disputes={data.disputes} onRefresh={fetchData} />
      )}
      {tab === "ESCROWS" && <AdminEscrowQueue escrows={data.escrows} />}
      {tab === "SOURCING" && (
        <AdminSourcingQueue sourcingRequests={data.sourcing} />
      )}
    </div>
  )
}

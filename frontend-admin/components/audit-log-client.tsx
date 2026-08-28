/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Journal d'audit des actions admin — lecture seule, filtrable.
 * @created 2026-07-08
 */

"use client"

import { useMemo, useState } from "react"
import { Search, ScrollText, ShieldAlert } from "lucide-react"
import type { AuditLogEntry } from "@/lib/actions/admin"

interface AuditLogClientProps {
  initialEntries: AuditLogEntry[]
}

// Libellés + tonalités par type d'action.
const ACTION_META: Record<string, { label: string; badge: string }> = {
  "user.suspend":      { label: "Suspension",        badge: "bg-orange-100 text-orange-700" },
  "user.reactivate":   { label: "Réactivation",      badge: "bg-emerald-100 text-emerald-700" },
  "user.delete":       { label: "Suppression",       badge: "bg-rose-100 text-rose-700" },
  "user.grant_admin":  { label: "Promotion admin",   badge: "bg-blue-100 text-blue-700" },
  "user.revoke_admin": { label: "Révocation admin",  badge: "bg-slate-200 text-slate-700" },
}

function meta(action: string) {
  return ACTION_META[action] ?? { label: action, badge: "bg-slate-100 text-slate-600" }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function AuditLogClient({ initialEntries }: AuditLogClientProps) {
  const [entries] = useState(initialEntries)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")

  const actionTypes = useMemo(
    () => Array.from(new Set(entries.map((e) => e.action))),
    [entries],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false
      if (!q) return true
      return [e.admin_email, e.target_label, e.target_id, meta(e.action).label]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    })
  }, [entries, search, actionFilter])

  return (
    <div className="space-y-6" data-testid="audit-page">
      <header className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#013ff4]/10 flex items-center justify-center">
          <ScrollText className="h-5 w-5 text-[#013ff4]" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Journal d&apos;audit</h1>
          <p className="text-slate-500 text-sm mt-0.5">Traçabilité des actions sensibles des administrateurs</p>
        </div>
      </header>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par admin, cible ou action..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
        >
          <option value="all">Toutes les actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>{meta(a).label}</option>
          ))}
        </select>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Aucune entrée d&apos;audit pour ces critères.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {filtered.map((e) => {
            const m = meta(e.action)
            const reason = typeof e.details?.reason === "string" ? e.details.reason : null
            const until = typeof e.details?.until === "string" ? e.details.until : null
            return (
              <div key={e.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${m.badge}`}>
                  {m.label}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 truncate">
                    <span className="font-semibold">{e.target_label || e.target_id || "—"}</span>
                    {reason && <span className="text-slate-500"> · {reason}</span>}
                    {until && <span className="text-slate-400"> · jusqu&apos;au {formatDate(until)}</span>}
                    {until === null && e.action === "user.suspend" && <span className="text-slate-400"> · permanente</span>}
                  </p>
                  <p className="text-xs text-slate-400 truncate">par {e.admin_email || e.admin_id}</p>
                </div>
                <time className="shrink-0 text-xs font-medium text-slate-400 tabular-nums">{formatDate(e.created_at)}</time>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

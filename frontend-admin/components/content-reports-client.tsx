"use client"

import { useMemo, useState, useTransition, useEffect } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  UserX,
  Flag,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { resolveContentReport, dismissContentReport, getContentReports, type ContentReport } from "@/lib/actions/admin"

type FilterStatus = "open" | "resolved" | "dismissed" | "all"
type FilterType = "all" | "gallery" | "message" | "profile"

interface ContentReportsClientProps {
  initialReports: ContentReport[]
}

const TYPE_META = {
  gallery: { label: "Galerie", icon: ImageIcon, tone: "bg-amber-100 text-amber-700" },
  message: { label: "Message", icon: MessageSquare, tone: "bg-blue-100 text-blue-700" },
  profile: { label: "Profil", icon: UserX, tone: "bg-purple-100 text-purple-700" },
} as const

export function ContentReportsClient({ initialReports }: ContentReportsClientProps) {
  const [reports, setReports] = useState<ContentReport[]>(initialReports)
  const [status, setStatus] = useState<FilterStatus>("open")
  const [subjectType, setSubjectType] = useState<FilterType>("all")
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const [isFetching, setIsFetching] = useState(false)

  // Refetch when filters change (except initial render where status="open" matches initialReports)
  useEffect(() => {
    if (status === "open" && subjectType === "all" && reports === initialReports) return
    let cancelled = false
    setIsFetching(true)
    getContentReports({ status, subjectType, limit: 200 })
      .then((data) => { if (!cancelled) setReports(data) })
      .catch(() => { if (!cancelled) toast.error("Impossible de charger les signalements") })
      .finally(() => { if (!cancelled) setIsFetching(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, subjectType])

  const filtered = useMemo(() => {
    if (!search) return reports
    const q = search.toLowerCase()
    return reports.filter((r) =>
      [r.reason, r.subject_preview, r.reporter_name, r.reporter_email]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    )
  }, [reports, search])

  const handleResolve = (id: string) => {
    const note = typeof window !== "undefined"
      ? window.prompt("Note interne (optionnel — visible admin uniquement) :") ?? undefined
      : undefined
    startTransition(async () => {
      const res = await resolveContentReport(id, note)
      if (!res.success) { toast.error(res.error || "Échec"); return }
      setReports((prev) => prev.filter((r) => r.id !== id))
      toast.success("Signalement résolu")
    })
  }

  const handleDismiss = (id: string) => {
    const note = typeof window !== "undefined"
      ? window.prompt("Motif du rejet (optionnel) :") ?? undefined
      : undefined
    startTransition(async () => {
      const res = await dismissContentReport(id, note)
      if (!res.success) { toast.error(res.error || "Échec"); return }
      setReports((prev) => prev.filter((r) => r.id !== id))
      toast.success("Signalement écarté")
    })
  }

  return (
    <div className="space-y-6" data-testid="reports-page">
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Signalements</h1>
        <p className="text-slate-500 text-sm mt-1">Traitement des contenus signalés par les utilisateurs</p>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par motif, auteur, contenu..."
            data-testid="reports-search-input"
            className="w-full rounded-xl bg-slate-50 pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as FilterStatus)}
          data-testid="reports-status-filter"
          className="rounded-xl bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="open">Ouverts</option>
          <option value="resolved">Résolus</option>
          <option value="dismissed">Écartés</option>
          <option value="all">Tous</option>
        </select>
        <select
          value={subjectType}
          onChange={(e) => setSubjectType(e.target.value as FilterType)}
          data-testid="reports-type-filter"
          className="rounded-xl bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">Tous types</option>
          <option value="gallery">Galerie</option>
          <option value="message">Messages</option>
          <option value="profile">Profils</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isFetching ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-500">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <Flag className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun signalement ne correspond à ces filtres.</p>
          </div>
        ) : (
          filtered.map((r) => {
            const meta = TYPE_META[r.subject_type]
            const Icon = meta.icon
            return (
              <article
                key={r.id}
                data-testid={`report-${r.id}`}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col lg:flex-row gap-4"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.tone}`}>
                        {meta.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        r.status === "open" ? "bg-rose-100 text-rose-700"
                        : r.status === "resolved" ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                      }`}>
                        {r.status === "open" ? <Clock className="h-3 w-3" /> : r.status === "resolved" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {r.status === "open" ? "Ouvert" : r.status === "resolved" ? "Résolu" : "Écarté"}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate" data-testid={`report-preview-${r.id}`}>
                      {r.subject_preview || "(contenu indisponible)"}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 italic">« {r.reason} »</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Signalé par <span className="font-semibold text-slate-700">{r.reporter_name}</span>
                      {r.reporter_email ? ` · ${r.reporter_email}` : ""}
                    </p>
                    {r.admin_note && (
                      <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600">
                        <span className="font-semibold">Note admin :</span> {r.admin_note}
                      </div>
                    )}
                  </div>
                </div>
                {r.status === "open" && (
                  <div className="flex gap-2 lg:flex-col lg:w-40 flex-shrink-0">
                    <button
                      onClick={() => handleResolve(r.id)}
                      disabled={isPending}
                      data-testid={`report-resolve-${r.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Résoudre
                    </button>
                    <button
                      onClick={() => handleDismiss(r.id)}
                      disabled={isPending}
                      data-testid={`report-dismiss-${r.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" /> Écarter
                    </button>
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}

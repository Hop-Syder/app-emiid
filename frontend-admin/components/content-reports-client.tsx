"use client"

import { useMemo, useState, useTransition, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  UserX,
  Flag,
  Search,
  Ban,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { resolveContentReport, dismissContentReport, actOnReport, getContentReports, type ContentReport } from "@/lib/actions/admin"

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
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const [isFetching, setIsFetching] = useState(false)
  const isMounted = useRef(false)

  // Modales d'action personnalisées
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)

  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean
    title: string
    description: string
    placeholder?: string
    onConfirm: (text: string) => void
  } | null>(null)

  const [promptValue, setPromptValue] = useState("")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Refetch when filters change
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    let cancelled = false
    setIsFetching(true)
    getContentReports({ status, subjectType, limit: 200 })
      .then((data) => { if (!cancelled) setReports(data) })
      .catch(() => { if (!cancelled) toast.error("Impossible de charger les signalements") })
      .finally(() => { if (!cancelled) setIsFetching(false) })
    return () => { cancelled = true }
  }, [status, subjectType])

  const filtered = useMemo(() => {
    if (!debouncedSearch) return reports
    const q = debouncedSearch.toLowerCase()
    return reports.filter((r) =>
      [r.reason, r.subject_preview, r.reporter_name, r.reporter_email]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    )
  }, [reports, debouncedSearch])

  const handleResolve = (id: string) => {
    setPromptValue("")
    setPromptModal({
      isOpen: true,
      title: "Résoudre le signalement",
      description: "Note interne (optionnel — visible admin uniquement) :",
      placeholder: "Note de résolution...",
      onConfirm: (note) => {
        startTransition(async () => {
          const res = await resolveContentReport(id, note || undefined)
          if (!res.success) { toast.error(res.error || "Échec"); return }
          setReports((prev) => prev.filter((r) => r.id !== id))
          toast.success("Signalement résolu")
        })
      }
    })
  }

  const handleActOnReport = (id: string, action: "suspend_author" | "delete_content", label: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmer l'action",
      description: `Voulez-vous vraiment ${label} ? Le signalement sera automatiquement clôturé (résolu).`,
      onConfirm: () => {
        startTransition(async () => {
          const res = await actOnReport(id, action)
          if (!res.success) { toast.error(res.error || "Échec"); return }
          setReports((prev) => prev.filter((r) => r.id !== id))
          toast.success(action === "suspend_author" ? "Auteur suspendu · signalement résolu" : "Contenu supprimé · signalement résolu")
        })
      }
    })
  }

  const handleDismiss = (id: string) => {
    setPromptValue("")
    setPromptModal({
      isOpen: true,
      title: "Écarter le signalement",
      description: "Motif du rejet (optionnel) :",
      placeholder: "Motif d'écartement...",
      onConfirm: (note) => {
        startTransition(async () => {
          const res = await dismissContentReport(id, note || undefined)
          if (!res.success) { toast.error(res.error || "Échec"); return }
          setReports((prev) => prev.filter((r) => r.id !== id))
          toast.success("Signalement écarté")
        })
      }
    })
  }

  return (
    <div className="space-y-4" data-testid="reports-page">
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Signalements</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Traitement des contenus signalés par les utilisateurs</p>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 flex flex-col lg:flex-row gap-3 lg:items-center shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par motif, auteur, contenu..."
            data-testid="reports-search-input"
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-850 pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as FilterStatus)}
          data-testid="reports-status-filter"
          className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-850 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 text-sm cursor-pointer"
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
          className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-850 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 text-sm cursor-pointer"
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
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-10 text-center text-slate-500 dark:text-slate-400">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center shadow-sm">
            <Flag className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Aucun signalement ne correspond à ces filtres.</p>
          </div>
        ) : (
          filtered.map((r) => {
            const meta = TYPE_META[r.subject_type]
            const Icon = meta.icon
            return (
              <article
                key={r.id}
                data-testid={`report-${r.id}`}
                className="bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 flex flex-col lg:flex-row gap-4 shadow-sm"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.tone} dark:bg-slate-850`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.tone} dark:bg-slate-800`}>
                        {meta.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        r.status === "open" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                        : r.status === "resolved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {r.status === "open" ? <Clock className="h-3 w-3" /> : r.status === "resolved" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {r.status === "open" ? "Ouvert" : r.status === "resolved" ? "Résolu" : "Écarté"}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-555">{new Date(r.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" data-testid={`report-preview-${r.id}`}>
                      {r.subject_preview || "(contenu indisponible)"}
                    </p>
                    <p className="text-sm text-slate-650 dark:text-slate-300 mt-1 italic">« {r.reason} »</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Signalé par <span className="font-semibold text-slate-700 dark:text-slate-300">{r.reporter_name}</span>
                      {r.reporter_email ? ` · ${r.reporter_email}` : ""}
                    </p>
                    {r.admin_note && (
                      <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 px-3 py-2 text-xs text-slate-650 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Note admin :</span> {r.admin_note}
                      </div>
                    )}
                  </div>
                </div>
                {r.status === "open" && (
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:w-44 flex-shrink-0">
                    {/* Actions directes sur la cible du signalement */}
                    <button
                      onClick={() => handleActOnReport(r.id, "suspend_author", "suspendre l'auteur")}
                      disabled={isPending}
                      data-testid={`report-suspend-${r.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      <Ban className="h-4 w-4" /> Suspendre l&apos;auteur
                    </button>
                    {(r.subject_type === "gallery" || r.subject_type === "message") && (
                      <button
                        onClick={() => handleActOnReport(r.id, "delete_content", "supprimer le contenu")}
                        disabled={isPending}
                        data-testid={`report-delete-${r.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" /> Supprimer le contenu
                      </button>
                    )}
                    <div className="hidden lg:block h-px bg-slate-100 dark:bg-slate-800 my-0.5" />
                    <button
                      onClick={() => handleResolve(r.id)}
                      disabled={isPending}
                      data-testid={`report-resolve-${r.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Résoudre
                    </button>
                    <button
                      onClick={() => handleDismiss(r.id)}
                      disabled={isPending}
                      data-testid={`report-dismiss-${r.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 transition-colors cursor-pointer"
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

      {/* Modale de Confirmation Personnalisée */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-amber-500">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{confirmModal.title}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                {confirmModal.description}
              </p>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm()
                    setConfirmModal(null)
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale de Saisie (Prompt) Personnalisée */}
      <AnimatePresence>
        {promptModal?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPromptModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{promptModal.title}</h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {promptModal.description}
              </p>
              <input
                type="text"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={promptModal.placeholder || "Saisir ici..."}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-4 py-2.5 outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 text-sm"
                autoFocus
              />
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setPromptModal(null)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    promptModal.onConfirm(promptValue)
                    setPromptModal(null)
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Valider
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

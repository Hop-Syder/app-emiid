"use client"

import { useMemo, useState, useTransition, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Clock,
  Flag,
  Image as ImageIcon,
  Search,
  Trash2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  X,
  Eye,
  Maximize2
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import {
  approveGalleryItem,
  rejectGalleryItem,
  deleteGalleryItem,
  type GalleryItem,
} from "@/lib/actions/admin"

type ModerationStatus = "all" | "pending" | "approved" | "rejected"

interface GalleryModerationClientProps {
  initialItems: GalleryItem[]
}

export function GalleryModerationClient({ initialItems }: GalleryModerationClientProps) {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filter, setFilter] = useState<ModerationStatus>("pending")
  const [isPending, startTransition] = useTransition()

  // Visionneuse HD et dialogues customisés
  const [activeImage, setActiveImage] = useState<string | null>(null)
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !debouncedSearch ||
        [item.title, item.description, item.user_name]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(debouncedSearch.toLowerCase()))

      const matchesFilter = filter === "all" || item.status === filter
      return matchesSearch && matchesFilter
    })
  }, [filter, items, debouncedSearch])

  const handleApprove = (itemId: string) => {
    startTransition(async () => {
      const result = await approveGalleryItem(itemId)
      if (!result.success) {
        toast.error(result.error || "Impossible de valider l'élément")
        return
      }

      const reviewedAt = new Date().toISOString()
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, status: "approved", reviewed_at: reviewedAt, rejection_reason: null }
            : item,
        ),
      )
      toast.success(result.error ? `Validé. ${result.error}` : "Élément validé et auteur notifié")
    })
  }

  const handleReject = (itemId: string) => {
    setPromptValue("")
    setPromptModal({
      isOpen: true,
      title: "Retirer l'élément de la galerie",
      description: "Motif du rejet (optionnel — sera communiqué à l'auteur) :",
      placeholder: "Indiquer la raison...",
      onConfirm: (reason) => {
        startTransition(async () => {
          const result = await rejectGalleryItem(itemId, reason || undefined)
          if (!result.success) {
            toast.error(result.error || "Impossible de retirer l'élément")
            return
          }

          const reviewedAt = new Date().toISOString()
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? { ...item, status: "rejected", reviewed_at: reviewedAt, rejection_reason: reason?.trim() || null }
                : item,
            ),
          )
          toast.success("Élément retiré de la galerie")
        })
      }
    })
  }

  const handleDelete = (itemId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Supprimer définitivement ce projet",
      description: "Cette action est irréversible. L'élément sera définitivement effacé de la base de données.",
      onConfirm: () => {
        startTransition(async () => {
          const result = await deleteGalleryItem(itemId)
          if (!result.success) {
            toast.error(result.error || "Impossible de supprimer l'élément")
            return
          }
          setItems((prev) => prev.filter((item) => item.id !== itemId))
          toast.success("Élément supprimé définitivement")
        })
      }
    })
  }

  const stats = {
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    rejected: items.filter((item) => item.status === "rejected").length,
  }

  return (
    <div className="space-y-4" data-testid="gallery-moderation-page">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Modération galerie</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Contrôle des visuels projet publiés par les membres</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: ImageIcon, color: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800", filterKey: "all" as const },
          { label: "En attente", value: stats.pending, icon: Clock, color: "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/20", filterKey: "pending" as const },
          { label: "Validés", value: stats.approved, icon: CheckCircle2, color: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20", filterKey: "approved" as const },
          { label: "Retirés", value: stats.rejected, icon: XCircle, color: "text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/20", filterKey: "rejected" as const },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.filterKey)}
            data-testid={`gallery-stat-${stat.filterKey}`}
            className={`bg-white dark:bg-slate-900/50 rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
              filter === stat.filterKey 
                ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/30" 
                : "border-slate-100 dark:border-slate-800/80"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, auteur ou description..."
            data-testid="gallery-search-input"
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ModerationStatus)}
          data-testid="gallery-filter-select"
          className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 text-sm cursor-pointer"
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="approved">Validés</option>
          <option value="rejected">Retirés</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <article
              key={item.id}
              data-testid={`gallery-item-${item.id}`}
              className="bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div 
                className="aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center relative group/image cursor-zoom-in"
                onClick={() => item.image_url && setActiveImage(item.image_url)}
              >
                {item.image_url ? (
                  <>
                    <Image src={item.image_url} alt={item.title || "Projet"} className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300" width={800} height={450} unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-sm">
                      <Maximize2 className="h-5 w-5" />
                      <span>Inspecter HD</span>
                    </div>
                  </>
                ) : (
                  <ImageIcon className="h-12 w-12 text-slate-400 dark:text-slate-700" />
                )}
              </div>
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white truncate" title={item.title || "Projet sans titre"}>{item.title || "Projet sans titre"}</h2>
                    <span
                      data-testid={`gallery-item-status-${item.id}`}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold shrink-0 ${
                        item.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : item.status === "rejected"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                      }`}
                    >
                      {item.status === "approved" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : item.status === "rejected" ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {item.status === "approved" ? "Validé" : item.status === "rejected" ? "Retiré" : "À modérer"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Par {item.user_name}</p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {item.description || "Aucune description fournie."}
                  </p>

                  {item.status === "rejected" && item.rejection_reason && (
                    <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-3 py-2 text-xs text-rose-700 dark:text-rose-400">
                      <span className="font-semibold">Motif :</span> {item.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800 pt-2">
                    <span className="truncate max-w-[150px]">
                      Soumis le {new Date(item.created_at).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <Flag className="h-3.5 w-3.5" /> {item.reports} signalement
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={isPending}
                        data-testid={`gallery-approve-${item.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{item.status === "rejected" ? "Rétablir" : "Valider"}</span>
                      </button>
                    )}
                    {item.status !== "rejected" && (
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={isPending}
                        data-testid={`gallery-reject-${item.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Retirer</span>
                      </button>
                    )}
                    {item.status === "rejected" && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={isPending}
                        data-testid={`gallery-restore-${item.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Rétablir</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      data-testid={`gallery-delete-${item.id}`}
                      title="Supprimer définitivement"
                      className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center text-slate-500 dark:text-slate-400">
            Aucun élément de galerie à afficher.
          </div>
        )}
      </div>

      {/* Lightbox Visionneuse HD */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-55 flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative max-w-5xl w-full max-h-[85vh] overflow-hidden rounded-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <img
                src={activeImage}
                alt="Projet HD"
                className="w-full h-full object-contain mx-auto"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {confirmModal.description}
              </p>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 text-sm"
                autoFocus
              />
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setPromptModal(null)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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

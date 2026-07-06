"use client"

import { useMemo, useState, useTransition } from "react"
import { CheckCircle2, Clock, Flag, Image as ImageIcon, Search, Trash2, XCircle, RotateCcw } from "lucide-react"
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
  const [filter, setFilter] = useState<ModerationStatus>("pending")
  const [isPending, startTransition] = useTransition()

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        [item.title, item.description, item.user_name]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(search.toLowerCase()))

      const matchesFilter = filter === "all" || item.status === filter
      return matchesSearch && matchesFilter
    })
  }, [filter, items, search])

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
    const reason = typeof window !== "undefined"
      ? window.prompt("Motif du rejet (optionnel — sera communiqué à l'auteur) :") ?? undefined
      : undefined
    // Si l'utilisateur annule (null -> undefined par coercion), on continue quand même sans motif
    startTransition(async () => {
      const result = await rejectGalleryItem(itemId, reason)
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

  const handleDelete = (itemId: string) => {
    if (typeof window !== "undefined" && !window.confirm("Supprimer définitivement ce projet ? Cette action est irréversible.")) {
      return
    }
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

  const stats = {
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    rejected: items.filter((item) => item.status === "rejected").length,
  }

  return (
    <div className="space-y-6" data-testid="gallery-moderation-page">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Modération galerie</h1>
        <p className="text-slate-500 text-sm mt-1">Contrôle des visuels projet publiés par les membres</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: ImageIcon, color: "text-slate-700 bg-slate-100", filterKey: "all" as const },
          { label: "En attente", value: stats.pending, icon: Clock, color: "text-amber-700 bg-amber-100", filterKey: "pending" as const },
          { label: "Validés", value: stats.approved, icon: CheckCircle2, color: "text-emerald-700 bg-emerald-100", filterKey: "approved" as const },
          { label: "Retirés", value: stats.rejected, icon: XCircle, color: "text-rose-700 bg-rose-100", filterKey: "rejected" as const },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.filterKey)}
            data-testid={`gallery-stat-${stat.filterKey}`}
            className={`bg-white rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
              filter === stat.filterKey ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-100"
            }`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, auteur ou description..."
            data-testid="gallery-search-input"
            className="w-full rounded-xl bg-slate-50 pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ModerationStatus)}
          data-testid="gallery-filter-select"
          className="rounded-xl bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="approved">Validés</option>
          <option value="rejected">Retirés</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <article
              key={item.id}
              data-testid={`gallery-item-${item.id}`}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            >
              <div className="aspect-video bg-slate-100 overflow-hidden flex items-center justify-center">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title || "Projet"} className="w-full h-full object-cover" width={800} height={450} unoptimized />
                ) : (
                  <ImageIcon className="h-12 w-12 text-slate-300" />
                )}
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{item.title || "Projet sans titre"}</h2>
                    <p className="text-sm text-slate-500">Par {item.user_name}</p>
                  </div>
                  <span
                    data-testid={`gallery-item-status-${item.id}`}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : item.status === "rejected"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
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

                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description || "Aucune description fournie."}
                </p>

                {item.status === "rejected" && item.rejection_reason && (
                  <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-700">
                    <span className="font-semibold">Motif :</span> {item.rejection_reason}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Soumis le {new Date(item.created_at).toLocaleString("fr-FR")}
                    {item.reviewed_at && item.status !== "pending" && (
                      <> · modéré le {new Date(item.reviewed_at).toLocaleString("fr-FR")}</>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Flag className="h-3.5 w-3.5" /> {item.reports} signalement
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={isPending}
                      data-testid={`gallery-approve-${item.id}`}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {item.status === "rejected" ? "Rétablir" : "Valider"}
                    </button>
                  )}
                  {item.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={isPending}
                      data-testid={`gallery-reject-${item.id}`}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Retirer
                    </button>
                  )}
                  {item.status === "rejected" && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={isPending}
                      data-testid={`gallery-restore-${item.id}`}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Rétablir
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    data-testid={`gallery-delete-${item.id}`}
                    title="Supprimer définitivement"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            Aucun élément de galerie à afficher.
          </div>
        )}
      </div>
    </div>
  )
}

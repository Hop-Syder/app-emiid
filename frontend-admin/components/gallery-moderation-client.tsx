"use client"

import { useMemo, useState, useTransition } from "react"
import { CheckCircle2, Clock, Flag, Image as ImageIcon, Search, Trash2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { approveGalleryItem, rejectGalleryItem, type GalleryItem } from "@/lib/actions/admin"

type ModerationStatus = "all" | "pending" | "approved" | "rejected"

interface GalleryModerationClientProps {
  initialItems: GalleryItem[]
}

export function GalleryModerationClient({ initialItems }: GalleryModerationClientProps) {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<ModerationStatus>("all")
  const [isPending, startTransition] = useTransition()

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !search || [item.title, item.description, item.user_name]
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

      setItems((prev) => prev.map((item) => item.id === itemId ? { ...item, status: "approved" } : item))
      toast.success("Élément validé et auteur notifié")
    })
  }

  const handleReject = (itemId: string) => {
    startTransition(async () => {
      const result = await rejectGalleryItem(itemId)
      if (!result.success) {
        toast.error(result.error || "Impossible de retirer l'élément")
        return
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success("Élément retiré de la galerie")
    })
  }

  const stats = {
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    rejected: items.filter((item) => item.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Modération galerie</h1>
        <p className="text-slate-500 text-sm mt-1">Contrôle des visuels projet publiés par les membres</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: ImageIcon, color: "text-slate-700 bg-slate-100" },
          { label: "En attente", value: stats.pending, icon: Clock, color: "text-amber-700 bg-amber-100" },
          { label: "Validés", value: stats.approved, icon: CheckCircle2, color: "text-emerald-700 bg-emerald-100" },
          { label: "Retirés", value: stats.rejected, icon: XCircle, color: "text-rose-700 bg-rose-100" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, auteur ou description..."
            className="w-full rounded-xl bg-slate-50 pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as ModerationStatus)} className="rounded-xl bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="approved">Validés</option>
          <option value="rejected">Retirés</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredItems.length > 0 ? filteredItems.map((item) => (
          <article key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-video bg-slate-100 overflow-hidden flex items-center justify-center">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title || "Projet"} className="w-full h-full object-cover" />
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
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  item.status === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : item.status === "rejected"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                }`}>
                  {item.status === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : item.status === "rejected" ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  {item.status === "approved" ? "Validé" : item.status === "rejected" ? "Retiré" : "À modérer"}
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{item.description || "Aucune description fournie."}</p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{new Date(item.created_at).toLocaleString("fr-FR")}</span>
                <span className="inline-flex items-center gap-1"><Flag className="h-3.5 w-3.5" /> {item.reports} signalement</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(item.id)}
                  disabled={isPending || item.status === "approved"}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Valider
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  disabled={isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Retirer
                </button>
              </div>
            </div>
          </article>
        )) : (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            Aucun élément de galerie à afficher.
          </div>
        )}
      </div>
    </div>
  )
}

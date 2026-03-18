"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Image as ImageIcon,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Flag,
  Clock,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Maximize2,
  MessageSquare
} from "lucide-react"

type ModerationStatus = "pending" | "approved" | "rejected" | "all"

interface GalleryItem {
  id: string
  title: string
  description: string
  image: string
  author: {
    name: string
    avatar: string
    id: string
  }
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  category: string
  reports: number
}

export default function GalleryModerationPage() {
  const [filter, setFilter] = useState<ModerationStatus>("pending")
  const [search, setSearch] = useState("")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const galleryItems: GalleryItem[] = [
    {
      id: "1",
      title: "Collection Mode Ethique 2026",
      description: "Nouvelle collection de vetements fabriques a partir de materiaux recycles locaux.",
      image: "/placeholder.svg?height=400&width=600",
      author: { name: "Fatou Sow", avatar: "FS", id: "u1" },
      submittedAt: "Il y a 30 min",
      status: "pending",
      category: "Mode",
      reports: 0
    },
    {
      id: "2",
      title: "Atelier Menuiserie Artisanale",
      description: "Photos de notre nouvel atelier de fabrication de meubles en bois local.",
      image: "/placeholder.svg?height=400&width=600",
      author: { name: "Ibrahim Keita", avatar: "IK", id: "u2" },
      submittedAt: "Il y a 2h",
      status: "pending",
      category: "Artisanat",
      reports: 1
    },
    {
      id: "3",
      title: "Startup Tech Summit Dakar",
      description: "Moments forts de notre participation au sommet tech de Dakar.",
      image: "/placeholder.svg?height=400&width=600",
      author: { name: "Amara Diallo", avatar: "AD", id: "u3" },
      submittedAt: "Il y a 5h",
      status: "pending",
      category: "Evenement",
      reports: 0
    },
    {
      id: "4",
      title: "Produits Bio Locaux",
      description: "Notre gamme de produits cosmetiques bio fabriques au Senegal.",
      image: "/placeholder.svg?height=400&width=600",
      author: { name: "Aissatou Barry", avatar: "AB", id: "u4" },
      submittedAt: "Hier",
      status: "approved",
      category: "Cosmetique",
      reports: 0
    },
    {
      id: "5",
      title: "Formation Jeunes Entrepreneurs",
      description: "Session de formation pour les jeunes entrepreneurs de Conakry.",
      image: "/placeholder.svg?height=400&width=600",
      author: { name: "Mariama Camara", avatar: "MC", id: "u5" },
      submittedAt: "Il y a 2j",
      status: "rejected",
      category: "Formation",
      reports: 3
    },
  ]

  const filteredItems = galleryItems.filter(item => {
    const matchesFilter = filter === "all" || item.status === filter
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = [
    { label: "En attente", value: galleryItems.filter(i => i.status === "pending").length, icon: Clock, color: "bg-amber-500" },
    { label: "Approuvees", value: galleryItems.filter(i => i.status === "approved").length, icon: CheckCircle2, color: "bg-emerald-500" },
    { label: "Rejetees", value: galleryItems.filter(i => i.status === "rejected").length, icon: XCircle, color: "bg-rose-500" },
    { label: "Signalees", value: galleryItems.filter(i => i.reports > 0).length, icon: Flag, color: "bg-violet-500" },
  ]

  const handleApprove = (id: string) => {
    // API call to approve
    console.log("Approved:", id)
  }

  const handleReject = (id: string) => {
    // API call to reject
    console.log("Rejected:", id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Moderation Galeries</h1>
          <p className="text-slate-500 text-sm mt-1">Examinez et validez les images soumises par les utilisateurs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.label === "En attente" ? "pending" : stat.label === "Approuvees" ? "approved" : stat.label === "Rejetees" ? "rejected" : "all")}
            className={cn(
              "bg-white p-4 rounded-xl border transition-all text-left",
              (filter === "pending" && stat.label === "En attente") ||
              (filter === "approved" && stat.label === "Approuvees") ||
              (filter === "rejected" && stat.label === "Rejetees")
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-slate-100 hover:border-slate-200"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-2 rounded-lg", stat.color.replace("bg-", "bg-").replace("500", "50"))}>
                <stat.icon className={cn("h-4 w-4", stat.color.replace("bg-", "text-"))} />
              </div>
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ModerationStatus)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvees</option>
              <option value="rejected">Rejetees</option>
            </select>
            <div className="flex items-center bg-slate-50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-white/50"
                )}
              >
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-white/50"
                )}
              >
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-lg hover:shadow-slate-100 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-slate-300" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg font-semibold uppercase tracking-wide backdrop-blur-sm",
                    item.status === "pending" ? "bg-amber-500/90 text-white" :
                    item.status === "approved" ? "bg-emerald-500/90 text-white" :
                    "bg-rose-500/90 text-white"
                  )}>
                    {item.status === "pending" ? "En attente" : item.status === "approved" ? "Approuvee" : "Rejetee"}
                  </span>
                </div>

                {/* Reports Badge */}
                {item.reports > 0 && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-semibold bg-rose-500/90 text-white backdrop-blur-sm">
                      <Flag className="h-3 w-3" />
                      {item.reports}
                    </span>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-3 bg-white rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Eye className="h-5 w-5 text-slate-700" />
                  </button>
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="p-3 bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors"
                      >
                        <Check className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="p-3 bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{item.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                      {item.author.avatar}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{item.author.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.submittedAt}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="w-24 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{item.title}</h3>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0",
                      item.status === "pending" ? "bg-amber-50 text-amber-600" :
                      item.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                      "bg-rose-50 text-rose-600"
                    )}>
                      {item.status === "pending" ? "En attente" : item.status === "approved" ? "Approuvee" : "Rejetee"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{item.description}</p>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <User className="h-3 w-3" /> {item.author.name}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.submittedAt}
                    </span>
                    {item.reports > 0 && (
                      <span className="text-[10px] text-rose-500 flex items-center gap-1">
                        <Flag className="h-3 w-3" /> {item.reports} signalement(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4 text-slate-400" />
                  </button>
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <Check className="h-4 w-4 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-rose-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="relative aspect-video bg-slate-100 flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-slate-300" />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedItem.title}</h2>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs px-2.5 py-1 rounded-lg font-semibold",
                        selectedItem.status === "pending" ? "bg-amber-50 text-amber-600" :
                        selectedItem.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                        "bg-rose-50 text-rose-600"
                      )}>
                        {selectedItem.status === "pending" ? "En attente" : selectedItem.status === "approved" ? "Approuvee" : "Rejetee"}
                      </span>
                      <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">
                        {selectedItem.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-6">{selectedItem.description}</p>

                {/* Author Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {selectedItem.author.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedItem.author.name}</p>
                    <p className="text-xs text-slate-500">Soumis {selectedItem.submittedAt}</p>
                  </div>
                  <button className="ml-auto px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    Voir le profil
                  </button>
                </div>

                {/* Reports */}
                {selectedItem.reports > 0 && (
                  <div className="p-4 bg-rose-50 rounded-xl mb-6">
                    <div className="flex items-center gap-2 text-rose-600 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-semibold text-sm">{selectedItem.reports} signalement(s)</span>
                    </div>
                    <p className="text-xs text-rose-600/80">Cette image a ete signalee par des utilisateurs. Veuillez examiner attentivement.</p>
                  </div>
                )}

                {/* Actions */}
                {selectedItem.status === "pending" && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        handleApprove(selectedItem.id)
                        setSelectedItem(null)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <Check className="h-5 w-5" />
                      Approuver
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedItem.id)
                        setSelectedItem(null)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors"
                    >
                      <X className="h-5 w-5" />
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ")
}

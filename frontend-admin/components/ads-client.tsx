"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Megaphone, Search, Check, X, Eye, Flag, Clock, User, Calendar, DollarSign,
  MapPin, Tag, AlertTriangle, CheckCircle2, XCircle, ExternalLink, Mail, Phone,
  Building, Target, RefreshCw, Loader2
} from "lucide-react"
import { getAds, updateAdStatus, type Ad } from "@/lib/actions/admin"

type AdStatus = "pending" | "approved" | "rejected" | "all"
type AdType = "job" | "investment" | "partnership" | "service" | "all"

interface AdsClientProps {
  initialAds: Ad[]
  initialTotal: number
}

export function AdsClient({ initialAds, initialTotal }: AdsClientProps) {
  const [ads, setAds] = useState(initialAds)
  const [total, setTotal] = useState(initialTotal)
  const [filter, setFilter] = useState<AdStatus>("pending")
  const [typeFilter, setTypeFilter] = useState<AdType>("all")
  const [search, setSearch] = useState("")
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const fetchFilteredAds = async () => {
    setIsLoading(true)
    try {
      const result = await getAds({
        status: filter !== "all" ? filter : undefined,
        category: typeFilter !== "all" ? typeFilter : undefined,
        page: 1, limit: 100
      })
      setAds(result.ads)
      setTotal(result.total)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (adId: string, newStatus: string) => {
    setIsLoading(true)
    const result = await updateAdStatus(adId, newStatus)
    setIsLoading(false)
    if (result.success) {
      setAds(prev => prev.map(a => a.id === adId ? { ...a, status: newStatus } : a))
      if (selectedAd?.id === adId) setSelectedAd(null)
    } else {
      alert("Erreur: " + result.error)
    }
  }

  const filteredAds = ads.filter(ad => {
    const matchesSearch = !search || 
        (ad.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (ad.description || "").toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  // We mock author data purely for UI if not joined by supabase
  const mockAuthor = {
      name: "Utilisateur", avatar: "US", company: "Premium", email: "contact@nexus.com"
  }

  const typeLabels: Record<string, { label: string, color: string, icon: any }> = {
    job: { label: "Emploi", color: "bg-blue-50 text-blue-600", icon: Building },
    investment: { label: "Investissement", color: "bg-emerald-50 text-emerald-600", icon: DollarSign },
    partnership: { label: "Partenariat", color: "bg-violet-50 text-violet-600", icon: Target },
    service: { label: "Service", color: "bg-amber-50 text-amber-600", icon: Tag },
  }

  const getLabelInfo = (type: string | null) => {
      if (!type) return typeLabels.service
      return typeLabels[type] || typeLabels.service
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Moderation Annonces</h1>
          <p className="text-slate-500 text-sm mt-1">Validez les offres d'emploi, investissements et partenariats</p>
        </div>
        <button 
          onClick={() => fetchFilteredAds()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre ou description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as AdStatus)
                startTransition(() => fetchFilteredAds())
              }}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvees</option>
              <option value="rejected">Rejetees</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAds.length > 0 ? filteredAds.map((ad) => {
          const info = getLabelInfo(ad.category)
          const Icon = info.icon
          return (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-100 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className={cn("p-3 rounded-xl shrink-0", info.color.split(" ")[0])}>
                  <Icon className={cn("h-6 w-6", info.color.split(" ")[1])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">{ad.title || "Sans titre"}</h3>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", info.color)}>
                      {info.label}
                    </span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                      ad.status === "pending" ? "bg-amber-50 text-amber-600" :
                      ad.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                      "bg-rose-50 text-rose-600"
                    )}>
                      {ad.status === "pending" ? "En attente" : ad.status === "approved" ? "Approuvee" : "Rejetee"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{ad.description || ad.content}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> Budget: {ad.budget_limit || "Non spécifié"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Soumis le {new Date(ad.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setSelectedAd(ad)} className="p-2.5 hover:bg-slate-100 rounded-lg">
                    <Eye className="h-4 w-4 text-slate-400" />
                  </button>
                  {ad.status === "pending" && (
                    <>
                      <button onClick={() => handleStatusUpdate(ad.id, 'approved')} className="p-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg">
                        {isLoading ? <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" /> : <Check className="h-4 w-4 text-emerald-600" />}
                      </button>
                      <button onClick={() => handleStatusUpdate(ad.id, 'rejected')} className="p-2.5 bg-rose-50 hover:bg-rose-100 rounded-lg">
                        <X className="h-4 w-4 text-rose-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )
        }) : (
           <div className="text-center py-10 text-slate-500">Aucune annonce trouvee</div>
        )}
      </div>

      <AnimatePresence>
        {selectedAd && (() => {
          const info = getLabelInfo(selectedAd.category)
          const Icon = info.icon
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedAd(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-3 rounded-xl", info.color.split(" ")[0])}>
                        <Icon className={cn("h-6 w-6", info.color.split(" ")[1])} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedAd.title || "Titre inconnu"}</h2>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn("text-xs px-2.5 py-1 rounded-lg font-semibold", info.color)}>
                            {info.label}
                          </span>
                          <span className={cn(
                            "text-xs px-2.5 py-1 rounded-lg font-semibold",
                            selectedAd.status === "pending" ? "bg-amber-50 text-amber-600" :
                            selectedAd.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                            "bg-rose-50 text-rose-600"
                          )}>
                            {selectedAd.status === "pending" ? "En attente" : selectedAd.status === "approved" ? "Approuvee" : "Rejetee"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedAd(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                      <X className="h-5 w-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Description / Contenu</h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedAd.description || selectedAd.content || "Aucun détail"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs font-medium">Budget Limit</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{selectedAd.budget_limit || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-medium">Création</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{new Date(selectedAd.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedAd.status === "pending" && (
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <button onClick={() => handleStatusUpdate(selectedAd.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700">
                        <Check className="h-5 w-5" /> Approuver
                      </button>
                      <button onClick={() => handleStatusUpdate(selectedAd.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700">
                        <X className="h-5 w-5" /> Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ")
}

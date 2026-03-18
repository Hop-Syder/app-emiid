"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Megaphone,
  Search,
  Check,
  X,
  Eye,
  Flag,
  Clock,
  User,
  Calendar,
  DollarSign,
  MapPin,
  Tag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Phone,
  Building,
  Target
} from "lucide-react"

type AdStatus = "pending" | "approved" | "rejected" | "all"
type AdType = "job" | "investment" | "partnership" | "service" | "all"

interface Ad {
  id: string
  title: string
  description: string
  type: "job" | "investment" | "partnership" | "service"
  author: {
    name: string
    avatar: string
    company: string
    email: string
  }
  budget: string
  location: string
  submittedAt: string
  expiresAt: string
  status: "pending" | "approved" | "rejected"
  reports: number
  views: number
}

export default function AdsModérationPage() {
  const [filter, setFilter] = useState<AdStatus>("pending")
  const [typeFilter, setTypeFilter] = useState<AdType>("all")
  const [search, setSearch] = useState("")
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)

  const ads: Ad[] = [
    {
      id: "1",
      title: "Recherche Developpeur Full Stack",
      description: "Startup fintech recherche un developpeur full stack experimente pour rejoindre notre equipe a Dakar. Experience React/Node requise.",
      type: "job",
      author: { name: "Amara Diallo", avatar: "AD", company: "PayAfrik", email: "contact@payafrik.com" },
      budget: "800K - 1.2M FCFA/mois",
      location: "Dakar, Senegal",
      submittedAt: "Il y a 1h",
      expiresAt: "30 jours",
      status: "pending",
      reports: 0,
      views: 0
    },
    {
      id: "2",
      title: "Investissement Atelier Menuiserie",
      description: "Recherche investisseur pour agrandir mon atelier de menuiserie artisanale. ROI estime a 25% sur 2 ans.",
      type: "investment",
      author: { name: "Ibrahim Keita", avatar: "IK", company: "Bois & Art Mali", email: "ibrahim@boisartmali.ml" },
      budget: "5M - 10M FCFA",
      location: "Bamako, Mali",
      submittedAt: "Il y a 3h",
      expiresAt: "60 jours",
      status: "pending",
      reports: 1,
      views: 0
    },
    {
      id: "3",
      title: "Partenariat Distribution Cosmetiques",
      description: "Marque de cosmetiques bio cherche partenaires distributeurs en Afrique de l'Ouest.",
      type: "partnership",
      author: { name: "Fatou Sow", avatar: "FS", company: "BioShea", email: "fatou@bioshea.ci" },
      budget: "Negociable",
      location: "Multi-pays",
      submittedAt: "Il y a 5h",
      expiresAt: "90 jours",
      status: "pending",
      reports: 0,
      views: 0
    },
    {
      id: "4",
      title: "Service Formation Marketing Digital",
      description: "Formation complete en marketing digital pour entrepreneurs africains. Certification incluse.",
      type: "service",
      author: { name: "Kofi Mensah", avatar: "KM", company: "DigiSkills Africa", email: "kofi@digiskills.gh" },
      budget: "150K FCFA/session",
      location: "En ligne",
      submittedAt: "Hier",
      expiresAt: "45 jours",
      status: "approved",
      reports: 0,
      views: 156
    },
    {
      id: "5",
      title: "Offre Suspecte - A examiner",
      description: "Promesse de gains rapides sans effort. Investissement garanti a 500%.",
      type: "investment",
      author: { name: "Inconnu", avatar: "XX", company: "Quick Money", email: "scam@example.com" },
      budget: "10K FCFA minimum",
      location: "Non specifie",
      submittedAt: "Il y a 2j",
      expiresAt: "7 jours",
      status: "rejected",
      reports: 12,
      views: 0
    },
  ]

  const filteredAds = ads.filter(ad => {
    const matchesFilter = filter === "all" || ad.status === filter
    const matchesType = typeFilter === "all" || ad.type === typeFilter
    const matchesSearch = ad.title.toLowerCase().includes(search.toLowerCase()) ||
      ad.author.name.toLowerCase().includes(search.toLowerCase()) ||
      ad.author.company.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesType && matchesSearch
  })

  const stats = [
    { label: "En attente", value: ads.filter(a => a.status === "pending").length, icon: Clock, color: "bg-amber-500" },
    { label: "Approuvees", value: ads.filter(a => a.status === "approved").length, icon: CheckCircle2, color: "bg-emerald-500" },
    { label: "Rejetees", value: ads.filter(a => a.status === "rejected").length, icon: XCircle, color: "bg-rose-500" },
    { label: "Signalees", value: ads.filter(a => a.reports > 0).length, icon: Flag, color: "bg-violet-500" },
  ]

  const typeLabels = {
    job: { label: "Emploi", color: "bg-blue-50 text-blue-600", icon: Building },
    investment: { label: "Investissement", color: "bg-emerald-50 text-emerald-600", icon: DollarSign },
    partnership: { label: "Partenariat", color: "bg-violet-50 text-violet-600", icon: Target },
    service: { label: "Service", color: "bg-amber-50 text-amber-600", icon: Tag },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Moderation Annonces</h1>
          <p className="text-slate-500 text-sm mt-1">Validez les offres d'emploi, investissements et partenariats</p>
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
              placeholder="Rechercher par titre, auteur ou entreprise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as AdStatus)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvees</option>
              <option value="rejected">Rejetees</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AdType)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="all">Tous les types</option>
              <option value="job">Emploi</option>
              <option value="investment">Investissement</option>
              <option value="partnership">Partenariat</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {filteredAds.map((ad) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-100 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Icon */}
              <div className={cn("p-3 rounded-xl shrink-0", typeLabels[ad.type].color.split(" ")[0])}>
                {(() => {
                  const Icon = typeLabels[ad.type].icon
                  return <Icon className={cn("h-6 w-6", typeLabels[ad.type].color.split(" ")[1])} />
                })()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900">{ad.title}</h3>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", typeLabels[ad.type].color)}>
                    {typeLabels[ad.type].label}
                  </span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                    ad.status === "pending" ? "bg-amber-50 text-amber-600" :
                    ad.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                    "bg-rose-50 text-rose-600"
                  )}>
                    {ad.status === "pending" ? "En attente" : ad.status === "approved" ? "Approuvee" : "Rejetee"}
                  </span>
                  {ad.reports > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-600 flex items-center gap-1">
                      <Flag className="h-3 w-3" /> {ad.reports}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{ad.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {ad.author.name} - {ad.author.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {ad.budget}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {ad.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {ad.submittedAt}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedAd(ad)}
                  className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Voir details"
                >
                  <Eye className="h-4 w-4 text-slate-400" />
                </button>
                {ad.status === "pending" && (
                  <>
                    <button
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="Approuver"
                    >
                      <Check className="h-4 w-4 text-emerald-600" />
                    </button>
                    <button
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                      title="Rejeter"
                    >
                      <X className="h-4 w-4 text-rose-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAd && (
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
              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl", typeLabels[selectedAd.type].color.split(" ")[0])}>
                      {(() => {
                        const Icon = typeLabels[selectedAd.type].icon
                        return <Icon className={cn("h-6 w-6", typeLabels[selectedAd.type].color.split(" ")[1])} />
                      })()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedAd.title}</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("text-xs px-2.5 py-1 rounded-lg font-semibold", typeLabels[selectedAd.type].color)}>
                          {typeLabels[selectedAd.type].label}
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
                  <button
                    onClick={() => setSelectedAd(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedAd.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs font-medium">Budget</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{selectedAd.budget}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs font-medium">Localisation</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{selectedAd.location}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">Soumis</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{selectedAd.submittedAt}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-medium">Expire dans</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{selectedAd.expiresAt}</p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Auteur</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {selectedAd.author.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{selectedAd.author.name}</p>
                      <p className="text-xs text-slate-500">{selectedAd.author.company}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {selectedAd.author.email}
                    </div>
                  </div>
                </div>

                {/* Reports Warning */}
                {selectedAd.reports > 0 && (
                  <div className="p-4 bg-rose-50 rounded-xl">
                    <div className="flex items-center gap-2 text-rose-600 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-semibold text-sm">{selectedAd.reports} signalement(s)</span>
                    </div>
                    <p className="text-xs text-rose-600/80">Cette annonce a ete signalee par des utilisateurs. Veuillez examiner attentivement avant approbation.</p>
                  </div>
                )}

                {/* Actions */}
                {selectedAd.status === "pending" && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                      <Check className="h-5 w-5" />
                      Approuver
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors">
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

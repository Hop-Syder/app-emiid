/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Utilisateurs Client avec donnees Supabase
 * @created 2026-03-18
 * @updated 2026-07-08
 */

"use client"

import { useState, useTransition, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldX,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Calendar,
  X,
  Crown,
  BadgeCheck,
  Loader2,
  RefreshCw,
  Ban,
  RotateCcw,
  UserCog,
  Flag,
  ScrollText,
  Activity,
  Unlock,
  AlertTriangle,
} from "lucide-react"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getUsers,
  updateUserProfile,
  toggleUserPublished,
  toggleUserVerified,
  toggleUserPremium,
  unlockUserPin,
  deleteUser,
  suspendUser,
  reactivateUser,
  toggleAdmin,
  exportUsers,
  bulkUserAction,
  getUserDetail,
  type UserProfile,
  type Country,
  type UserDetail
} from "@/lib/actions/admin"

interface UsersClientProps {
  initialUsers: UserProfile[]
  initialTotal: number
  countries: Country[]
}

export function UsersClient({ initialUsers, initialTotal, countries }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [total, setTotal] = useState(initialTotal)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [isBulkPending, setIsBulkPending] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const isMounted = useRef(false)

  const limit = 10
  const totalPages = Math.ceil(total / limit)

  // Effet de debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = async (page: number = currentPage) => {
    setIsLoading(true)
    try {
      const result = await getUsers({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        country: countryFilter !== "all" ? countryFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        limit
      })
      setUsers(result.users)
      setTotal(result.total)
      setCurrentPage(page)
    } finally {
      setIsLoading(false)
    }
  }

  // Actualiser automatiquement quand la recherche ou les filtres changent
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    startTransition(() => {
      fetchUsers(1)
    })
  }, [debouncedSearch, roleFilter, countryFilter, statusFilter])

  const handleSearch = () => {
    startTransition(() => {
      fetchUsers(1)
    })
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    startTransition(() => {
      fetchUsers(page)
    })
  }

  const currentFilters = () => ({
    search: search || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    country: countryFilter !== "all" ? countryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const csv = await exportUsers(currentFilters())
      // BOM UTF-8 pour un affichage correct des accents dans Excel.
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `emiid-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Export impossible")
    } finally {
      setIsExporting(false)
    }
  }

  const handleBulk = async (action: "publish" | "unpublish" | "verify" | "suspend") => {
    if (selectedUsers.length === 0) return
    const labels: Record<typeof action, string> = { publish: "publier", unpublish: "dépublier", verify: "vérifier", suspend: "suspendre" }
    if (action === "suspend" && !confirm(`Suspendre ${selectedUsers.length} utilisateur(s) ? (les administrateurs seront ignorés)`)) return
    setIsBulkPending(true)
    try {
      const res = await bulkUserAction(selectedUsers, action)
      if (!res.success) { alert(`Erreur : ${res.error}`); return }
      const ids = new Set(selectedUsers)
      setUsers(prev => prev.map(u => !ids.has(u.id) ? u : {
        ...u,
        ...(action === "publish" ? { is_published: true } : {}),
        ...(action === "unpublish" ? { is_published: false } : {}),
        ...(action === "verify" ? { is_verified: true } : {}),
        ...(action === "suspend" && !u.is_admin ? { is_suspended: true } : {}),
      }))
      setSelectedUsers([])
      alert(`${res.count} utilisateur(s) : ${labels[action]}`)
    } finally {
      setIsBulkPending(false)
    }
  }

  const handleTogglePublished = async (userId: string, currentStatus: boolean) => {
    const result = await toggleUserPublished(userId, !currentStatus)
    if (result.success) {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_published: !currentStatus } : u
      ))
    }
  }

  const handleToggleVerified = async (userId: string, currentStatus: boolean) => {
    const result = await toggleUserVerified(userId, !currentStatus)
    if (result.success) {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_verified: !currentStatus } : u
      ))
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, is_verified: !currentStatus } : null)
      }
    }
  }

  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    const result = await toggleUserPremium(userId, !currentStatus)
    if (result.success) {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_premium: !currentStatus } : u
      ))
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, is_premium: !currentStatus } : null)
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Etes-vous sur de vouloir supprimer cet utilisateur?")) return
    const result = await deleteUser(userId)
    if (result.success) {
      setUsers(prev => prev.filter(u => u.id !== userId))
      setTotal(prev => prev - 1)
      setShowUserModal(false)
    }
  }

  const handleSuspend = async (userId: string) => {
    const reason = prompt("Motif de la suspension (visible dans le journal d'audit) :") ?? undefined
    if (reason === undefined) return // annulé
    const daysStr = prompt("Durée en jours (laisser vide = suspension permanente) :") ?? ""
    const days = daysStr.trim() ? Math.max(1, parseInt(daysStr, 10) || 0) : null
    const result = await suspendUser(userId, { reason: reason || undefined, days })
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: true } : u))
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, is_suspended: true } : null)
    } else {
      alert(`Erreur : ${result.error}`)
    }
  }

  const handleReactivate = async (userId: string) => {
    const result = await reactivateUser(userId)
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: false } : u))
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, is_suspended: false } : null)
    } else {
      alert(`Erreur : ${result.error}`)
    }
  }

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    const verb = currentIsAdmin ? "révoquer le rôle admin de" : "promouvoir administrateur"
    if (!confirm(`Confirmer : ${verb} cet utilisateur ?`)) return
    const result = await toggleAdmin(userId, !currentIsAdmin)
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentIsAdmin } : u))
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, is_admin: !currentIsAdmin } : null)
    } else {
      alert(`Erreur : ${result.error}`)
    }
  }

  const handleUnlockUserPin = async (userId: string) => {
    if (!confirm("Débloquer le compte de cet utilisateur (réinitialisation du PIN) ?")) return
    const result = await unlockUserPin(userId)
    if (result.success) {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_locked: false, pin_attempts: 0 } : u
      ))
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, is_locked: false, pin_attempts: 0 } : null)
      }
      alert("Le compte de l'utilisateur a été débloqué avec succès.")
    } else {
      alert(`Erreur : ${result.error}`)
    }
  }

  const toggleSelectUser = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
  }

  const openUserDetail = (user: UserProfile) => {
    setSelectedUser(user)
    setShowUserModal(true)
    setDetail(null)
    setDetailLoading(true)
    getUserDetail(user.id, user.user_id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false))
  }

  const getCountryName = (countryId: string | null) => {
    if (!countryId) return "Non defini"
    const country = countries.find(c => c.id === countryId)
    return country?.name || "Inconnu"
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || ""
    const last = lastName?.[0] || ""
    return (first + last).toUpperCase() || "?"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  const stats = [
    { label: "Total", value: total, color: "bg-slate-500" },
    { label: "Publies", value: users.filter(u => u.is_published).length, color: "bg-emerald-500" },
    { label: "En attente", value: users.filter(u => !u.is_published).length, color: "bg-amber-500" },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gérez les comptes et permissions des utilisateurs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchUsers()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
            <div className={`w-2 h-10 rounded-full ${stat.color}`}></div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-200 dark:focus:border-slate-700 transition-all outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[#013ff4]/20 outline-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="unpublished">Non publiés</option>
              <option value="verified">Vérifiés</option>
              <option value="premium">Premium</option>
              <option value="suspended">Suspendus</option>
              <option value="admin">Administrateurs</option>
            </select>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[#013ff4]/20 outline-none cursor-pointer max-w-[180px]"
            >
              <option value="all">Tous les pays</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[#013ff4]/20 outline-none cursor-pointer"
            >
              <option value="all">Toutes les categories</option>
              <option value="Entrepreneur">Entrepreneurs</option>
              <option value="Investisseur">Investisseurs</option>
              <option value="Expert">Experts</option>
              <option value="Partenaire">Partenaires</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between"
            >
              <span className="text-sm font-medium text-[#013ff4] flex items-center gap-2">
                {isBulkPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {selectedUsers.length} utilisateur(s) sélectionné(s)
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => handleBulk("publish")} disabled={isBulkPending}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50">
                  Publier
                </button>
                <button onClick={() => handleBulk("unpublish")} disabled={isBulkPending}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50">
                  Dépublier
                </button>
                <button onClick={() => handleBulk("verify")} disabled={isBulkPending}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50">
                  Vérifier
                </button>
                <button onClick={() => handleBulk("suspend")} disabled={isBulkPending}
                  className="px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50">
                  Suspendre
                </button>
                <button onClick={() => setSelectedUsers([])} disabled={isBulkPending}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                  Annuler
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Table Header */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectedUsers.length === users.length && users.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-900"
            />
          </div>
          <div className="col-span-3">Utilisateur</div>
          <div className="col-span-2">Categorie</div>
          <div className="col-span-2">Pays</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body (Responsive Bento Cards & Rows) */}
        <div className="divide-y divide-slate-50 dark:divide-slate-850 relative">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-5 lg:py-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors items-start lg:items-center bg-white dark:bg-slate-900/30 lg:bg-transparent"
              >
                {/* Checkbox (Desktop only) */}
                <div className="hidden lg:flex col-span-1 items-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleSelectUser(user.id)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-900"
                  />
                </div>

                {/* User Info */}
                <div className="col-span-3 flex items-center gap-3 w-full lg:w-auto">
                  <div className="relative shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-10 h-10 rounded-xl object-cover"
                        width={40}
                        height={40}
                        unoptimized
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="truncate">{user.first_name || ""} {user.last_name || ""}</span>
                        {user.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
                        {user.is_premium && <Crown className="h-4 w-4 text-amber-500 shrink-0" />}
                        {user.is_admin && <span title="Administrateur"><UserCog className="h-4 w-4 text-[#013ff4] shrink-0" /></span>}
                        {user.is_locked && <span title="Compte verrouillé (PIN)"><ShieldX className="h-4 w-4 text-red-500 shrink-0" /></span>}
                      </p>
                      {user.has_profile && !user.is_verified && <BadgeCheck className="h-4 w-4 text-slate-350 dark:text-slate-650 shrink-0" />}
                      {user.is_suspended && (
                        <span className="inline-flex items-center gap-1 rounded bg-orange-100 dark:bg-orange-950/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-700 dark:text-orange-500 shrink-0">
                          <Ban className="h-2.5 w-2.5" /> Suspendu
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email || "Pas d'email"}</p>
                  </div>
                </div>

                {/* Category (Responsive Badge row) */}
                <div className="col-span-2 mt-1 lg:mt-0 w-full lg:w-auto flex items-center justify-between lg:block">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase lg:hidden">Catégorie</span>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                    user.category === "Investisseur" 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500" 
                      : user.category === "Expert"
                      ? "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-500"
                      : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-500"
                  }`}>
                    {user.category || "Non défini"}
                  </span>
                </div>

                {/* Country */}
                <div className="col-span-2 mt-1 lg:mt-0 w-full lg:w-auto flex items-center justify-between lg:flex lg:items-center lg:gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase lg:hidden font-sans">Pays</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{getCountryName(user.country_id)}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 mt-1 lg:mt-0 w-full lg:w-auto flex items-center justify-between lg:block">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase lg:hidden">Statut</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold ${
                    user.is_published 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500" 
                      : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      user.is_published ? "bg-emerald-500" : "bg-amber-500"
                    }`}></span>
                    {user.is_published ? "Publié" : "En attente"}
                  </span>
                </div>

                {/* Actions Dropdown */}
                <div className="col-span-2 mt-3 lg:mt-0 w-full lg:w-auto flex items-center justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                  <button
                    onClick={() => openUserDetail(user)}
                    className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200/30 dark:border-slate-700/50"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Détails</span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-500 dark:text-slate-400 border border-transparent hover:border-slate-200/30 dark:hover:border-slate-700/30 active:scale-95">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl">
                      <DropdownMenuLabel className="text-[9px] font-bold text-slate-400 dark:text-slate-500 px-2.5 py-1.5 uppercase tracking-wider">
                        Visibilité & Badges
                      </DropdownMenuLabel>
                      
                      <DropdownMenuItem onClick={() => handleTogglePublished(user.id, user.is_published || false)} className="flex items-center gap-2 text-xs font-semibold px-2.5 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                        {user.is_published ? (
                          <>
                            <ShieldX className="h-4 w-4 text-amber-500 shrink-0" />
                            <span>Dépublier la fiche</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Publier la fiche</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleToggleVerified(user.id, user.is_verified || false)} className="flex items-center gap-2 text-xs font-semibold px-2.5 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
                        <span>{user.is_verified ? "Retirer badge bleu" : "Certifier (badge bleu)"}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleTogglePremium(user.id, user.is_premium || false)} className="flex items-center gap-2 text-xs font-semibold px-2.5 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>{user.is_premium ? "Retirer statut Premium" : "Passer Premium"}</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                      
                      <DropdownMenuLabel className="text-[9px] font-bold text-slate-400 dark:text-slate-500 px-2.5 py-1.5 uppercase tracking-wider">
                        Sécurité & Rôles
                      </DropdownMenuLabel>

                      <DropdownMenuItem onClick={() => handleToggleAdmin(user.id, user.is_admin || false)} className="flex items-center gap-2 text-xs font-semibold px-2.5 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <UserCog className="h-4 w-4 text-slate-500 shrink-0" />
                        <span>{user.is_admin ? "Révoquer l'accès Admin" : "Promouvoir Admin"}</span>
                      </DropdownMenuItem>

                      {user.is_locked && (
                        <DropdownMenuItem onClick={() => handleUnlockUserPin(user.id)} className="flex items-center gap-2 text-xs font-semibold px-2.5 py-2 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
                          <Unlock className="h-4 w-4 text-green-500 shrink-0" />
                          <span>Débloquer PIN</span>
                        </DropdownMenuItem>
                      )}

                      {user.is_suspended ? (
                        <DropdownMenuItem onClick={() => handleReactivate(user.id)} className="flex items-center gap-2 text-xs font-semibold px-2.5 py-2 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600">
                          <RotateCcw className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>Réactiver le compte</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleSuspend(user.id)} className="flex items-center gap-2 text-xs font-semibold px-2.5 py-2 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600">
                          <Ban className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>Suspendre le compte</span>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="flex items-center gap-2 text-xs font-bold px-2.5 py-2 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600">
                        <Trash2 className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>Supprimer</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold">{currentPage}</span> sur{" "}
            <span className="font-semibold">{totalPages || 1}</span> ({total} utilisateurs)
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={isPending}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {selectedUser.avatar_url ? (
                        <Image
                          src={selectedUser.avatar_url}
                          alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                          className="w-16 h-16 rounded-2xl object-cover"
                          width={64}
                          height={64}
                          unoptimized
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                          {getInitials(selectedUser.first_name, selectedUser.last_name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          {selectedUser.first_name || ""} {selectedUser.last_name || ""}
                          {selectedUser.is_verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                          {selectedUser.is_premium && <Crown className="h-5 w-5 text-amber-500" />}
                          {selectedUser.is_admin && <span title="Administrateur"><UserCog className="h-5 w-5 text-[#013ff4]" /></span>}
                          {selectedUser.is_locked && <span title="Compte verrouillé (PIN)"><ShieldX className="h-5 w-5 text-red-500" /></span>}
                        </h2>
                        {selectedUser.has_profile && !selectedUser.is_verified && <BadgeCheck className="h-5 w-5 text-slate-300" />}
                      </div>
                      <p className="text-sm text-slate-500">{selectedUser.email || "Pas d'email"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Status & Category */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-semibold ${
                    selectedUser.is_published 
                      ? "bg-emerald-50 text-emerald-600" 
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      selectedUser.is_published ? "bg-emerald-500" : "bg-amber-500"
                    }`}></span>
                    {selectedUser.is_published ? "Publie" : "En attente"}
                  </span>
                  <span className={`text-sm px-3 py-1.5 rounded-lg font-semibold ${
                    selectedUser.category === "Investisseur" 
                      ? "bg-emerald-50 text-emerald-600" 
                      : selectedUser.category === "Expert"
                      ? "bg-violet-50 text-violet-600"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    {selectedUser.category || "Non defini"}
                  </span>
                </div>

                {/* Bio */}
                {selectedUser.bio && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-medium text-slate-400 mb-2">Bio</p>
                    <p className="text-sm text-slate-700">{selectedUser.bio}</p>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs font-medium">Localisation</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedUser.city || getCountryName(selectedUser.country_id)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-medium">Inscription</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDate(selectedUser.created_at)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-medium">Abonnes</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedUser.followers_count || 0} abonnes
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-xs font-medium">Telephone</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedUser.phone || "Non renseigne"}
                    </p>
                  </div>
                </div>

                {/* Bandeau suspension */}
                {selectedUser.is_suspended && (
                  <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-wide text-orange-700 flex items-center gap-1.5">
                      <Ban className="h-3.5 w-3.5" /> Compte suspendu
                    </p>
                    {selectedUser.suspended_reason && <p className="text-sm text-orange-800 mt-1">{selectedUser.suspended_reason}</p>}
                    <p className="text-[11px] text-orange-600 mt-0.5">
                      {selectedUser.suspended_until ? `Jusqu'au ${formatDate(selectedUser.suspended_until)}` : "Suspension permanente"}
                    </p>
                  </div>
                )}

                {/* Fiche enrichie : activité, signalements, historique admin */}
                <div className="rounded-xl border border-slate-100 divide-y divide-slate-100">
                  {/* Activité */}
                  <div className="p-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{detailLoading ? "…" : detail?.galleryCount ?? 0}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Galerie</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{detailLoading ? "…" : detail?.reportsFiledCount ?? 0}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Signalés</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{selectedUser.followers_count || 0}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Abonnés</p>
                    </div>
                  </div>

                  {/* Signalements reçus */}
                  {(detail?.reportsAbout?.length ?? 0) > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <Flag className="h-3.5 w-3.5 text-rose-500" /> Signalements reçus ({detail!.reportsAbout.length})
                      </p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {detail!.reportsAbout.map((r) => (
                          <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-slate-600 truncate">« {r.reason} »</span>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full font-semibold ${
                              r.status === "open" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
                            }`}>{r.status === "open" ? "Ouvert" : r.status === "resolved" ? "Résolu" : "Écarté"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Historique admin */}
                  {(detail?.auditTrail?.length ?? 0) > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <ScrollText className="h-3.5 w-3.5 text-[#013ff4]" /> Historique admin
                      </p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {detail!.auditTrail.map((a) => (
                          <div key={a.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-slate-600 truncate">{a.action}</span>
                            <span className="shrink-0 text-slate-400">{formatDate(a.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailLoading && (
                    <div className="p-4 flex items-center gap-2 text-xs text-slate-400">
                      <Activity className="h-3.5 w-3.5 animate-pulse" /> Chargement de la fiche…
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                  {/* Modération : suspension + rôle admin */}
                  <div className="flex items-center gap-3">
                    {selectedUser.is_suspended ? (
                      <button
                        onClick={() => handleReactivate(selectedUser.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" /> Réactiver
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspend(selectedUser.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                      >
                        <Ban className="h-4 w-4" /> Suspendre
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleAdmin(selectedUser.id, selectedUser.is_admin || false)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        selectedUser.is_admin ? "bg-[#013ff4]/10 text-[#013ff4] hover:bg-[#013ff4]/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <UserCog className="h-4 w-4" /> {selectedUser.is_admin ? "Admin" : "Rendre admin"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleVerified(selectedUser.id, selectedUser.is_verified || false)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        selectedUser.is_verified
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <BadgeCheck className="h-4 w-4" />
                      {selectedUser.is_verified ? "Certifié" : "Certifier"}
                    </button>
                    <button
                      onClick={() => handleTogglePremium(selectedUser.id, selectedUser.is_premium || false)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        selectedUser.is_premium
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <Crown className="h-4 w-4" />
                      {selectedUser.is_premium ? "Premium" : "Rendre Premium"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTogglePublished(selectedUser.id, selectedUser.is_published || false)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        selectedUser.is_published
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {selectedUser.is_published ? (
                        <>
                          <ShieldX className="h-4 w-4" />
                          Depublier
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          Publier
                        </>
                      )}
                    </button>
                    {selectedUser.is_locked && (
                      <button
                        onClick={() => handleUnlockUserPin(selectedUser.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Débloquer PIN
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}

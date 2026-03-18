/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Utilisateurs Client avec donnees Supabase
 * @created 2026-03-18
 */

"use client"

import { useState, useTransition } from "react"
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
  RefreshCw
} from "lucide-react"
import { 
  getUsers, 
  updateUserProfile, 
  toggleUserPublished, 
  deleteUser,
  type UserProfile, 
  type Country 
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
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  const limit = 10
  const totalPages = Math.ceil(total / limit)

  const fetchUsers = async (page: number = currentPage) => {
    setIsLoading(true)
    try {
      const result = await getUsers({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
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

  const handleTogglePublished = async (userId: string, currentStatus: boolean) => {
    const result = await toggleUserPublished(userId, !currentStatus)
    if (result.success) {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_published: !currentStatus } : u
      ))
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerez les comptes et permissions des utilisateurs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchUsers()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4">
            <div className={`w-2 h-10 rounded-full ${stat.color}`}></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                startTransition(() => fetchUsers(1))
              }}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="all">Toutes les categories</option>
              <option value="Entrepreneur">Entrepreneurs</option>
              <option value="Investisseur">Investisseurs</option>
              <option value="Expert">Experts</option>
              <option value="Partenaire">Partenaires</option>
            </select>
            <button
              onClick={handleSearch}
              disabled={isPending}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rechercher"}
            </button>
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
              <span className="text-sm font-medium text-blue-700">
                {selectedUsers.length} utilisateur(s) selectionne(s)
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                  Publier
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                  Supprimer
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
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectedUsers.length === users.length && users.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-3">Utilisateur</div>
          <div className="col-span-2">Categorie</div>
          <div className="col-span-2">Pays</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-50 relative">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors items-center"
              >
                {/* Checkbox */}
                <div className="hidden lg:flex col-span-1 items-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleSelectUser(user.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* User Info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {user.first_name || ""} {user.last_name || ""}
                      </p>
                      {user.has_profile && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                    </div>
                    <p className="text-xs text-slate-500">{user.email || "Pas d'email"}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                    user.category === "Investisseur" 
                      ? "bg-emerald-50 text-emerald-600" 
                      : user.category === "Expert"
                      ? "bg-violet-50 text-violet-600"
                      : "bg-blue-50 text-blue-600"
                  }`}>
                    {user.category || "Non defini"}
                  </span>
                </div>

                {/* Country */}
                <div className="col-span-2 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{getCountryName(user.country_id)}</span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold ${
                    user.is_published 
                      ? "bg-emerald-50 text-emerald-600" 
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      user.is_published ? "bg-emerald-500" : "bg-amber-500"
                    }`}></span>
                    {user.is_published ? "Publie" : "En attente"}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openUserDetail(user)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Voir details"
                  >
                    <Eye className="h-4 w-4 text-slate-400" />
                  </button>
                  <button 
                    onClick={() => handleTogglePublished(user.id, user.is_published || false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors" 
                    title={user.is_published ? "Depublier" : "Publier"}
                  >
                    {user.is_published ? (
                      <ShieldX className="h-4 w-4 text-amber-500" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 hover:bg-rose-50 rounded-lg transition-colors" 
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-slate-400 hover:text-rose-500" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun utilisateur trouve</p>
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
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={isPending}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4 text-slate-500" />
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
                        <img
                          src={selectedUser.avatar_url}
                          alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                          {getInitials(selectedUser.first_name, selectedUser.last_name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedUser.first_name || ""} {selectedUser.last_name || ""}
                        </h2>
                        {selectedUser.has_profile && <BadgeCheck className="h-5 w-5 text-blue-500" />}
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

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
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
  )
}

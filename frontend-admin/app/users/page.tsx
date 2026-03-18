"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Search,
  Filter,
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
  Check,
  AlertTriangle,
  Crown,
  BadgeCheck
} from "lucide-react"

type UserStatus = "active" | "pending" | "suspended" | "all"
type UserRole = "entrepreneur" | "investor" | "admin" | "all"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "pending" | "suspended"
  location: string
  joinedAt: string
  lastActive: string
  premium: boolean
  verified: boolean
  projects: number
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<UserStatus>("all")
  const [roleFilter, setRoleFilter] = useState<UserRole>("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const users: User[] = [
    { id: "1", name: "Amara Diallo", email: "amara@email.com", role: "Entrepreneur", status: "active", location: "Dakar, Senegal", joinedAt: "2026-01-15", lastActive: "Il y a 2h", premium: true, verified: true, projects: 5 },
    { id: "2", name: "Kofi Mensah", email: "kofi@email.com", role: "Investisseur", status: "active", location: "Accra, Ghana", joinedAt: "2026-02-20", lastActive: "Il y a 1j", premium: true, verified: true, projects: 0 },
    { id: "3", name: "Fatou Sow", email: "fatou@email.com", role: "Entrepreneur", status: "pending", location: "Abidjan, Cote d'Ivoire", joinedAt: "2026-03-10", lastActive: "Il y a 30min", premium: false, verified: false, projects: 2 },
    { id: "4", name: "Ibrahim Keita", email: "ibrahim@email.com", role: "Entrepreneur", status: "active", location: "Bamako, Mali", joinedAt: "2025-11-05", lastActive: "Il y a 5h", premium: false, verified: true, projects: 8 },
    { id: "5", name: "Aissatou Barry", email: "aissatou@email.com", role: "Entrepreneur", status: "suspended", location: "Conakry, Guinee", joinedAt: "2025-09-22", lastActive: "Il y a 2sem", premium: true, verified: true, projects: 3 },
    { id: "6", name: "Youssef Mansouri", email: "youssef@email.com", role: "Investisseur", status: "active", location: "Casablanca, Maroc", joinedAt: "2026-03-01", lastActive: "En ligne", premium: true, verified: true, projects: 0 },
    { id: "7", name: "Mariama Camara", email: "mariama@email.com", role: "Entrepreneur", status: "active", location: "Dakar, Senegal", joinedAt: "2025-12-18", lastActive: "Il y a 3h", premium: false, verified: true, projects: 4 },
    { id: "8", name: "Oumar Diop", email: "oumar@email.com", role: "Admin", status: "active", location: "Dakar, Senegal", joinedAt: "2025-06-01", lastActive: "En ligne", premium: true, verified: true, projects: 0 },
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const toggleSelectUser = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  const openUserDetail = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const stats = [
    { label: "Total", value: users.length, color: "bg-slate-500" },
    { label: "Actifs", value: users.filter(u => u.status === "active").length, color: "bg-emerald-500" },
    { label: "En attente", value: users.filter(u => u.status === "pending").length, color: "bg-amber-500" },
    { label: "Suspendus", value: users.filter(u => u.status === "suspended").length, color: "bg-rose-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-1">Gerez les comptes et permissions des utilisateurs</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            Exporter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4">
            <div className={cn("w-2 h-10 rounded-full", stat.color)}></div>
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendus</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole)}
              className="px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="all">Tous les roles</option>
              <option value="entrepreneur">Entrepreneurs</option>
              <option value="investor">Investisseurs</option>
              <option value="admin">Admins</option>
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
              <span className="text-sm font-medium text-blue-700">
                {selectedUsers.length} utilisateur(s) selectionne(s)
              </span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                  Activer
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                  Suspendre
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                  Supprimer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Header */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-3">Utilisateur</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Localisation</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-50">
          {filteredUsers.map((user) => (
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
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {user.premium && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    {user.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                  </div>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={cn(
                  "text-xs px-2.5 py-1 rounded-lg font-semibold",
                  user.role === "Admin" ? "bg-violet-50 text-violet-600" :
                  user.role === "Investisseur" ? "bg-emerald-50 text-emerald-600" :
                  "bg-blue-50 text-blue-600"
                )}>
                  {user.role}
                </span>
              </div>

              {/* Location */}
              <div className="col-span-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{user.location}</span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={cn(
                  "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-semibold",
                  user.status === "active" ? "bg-emerald-50 text-emerald-600" :
                  user.status === "pending" ? "bg-amber-50 text-amber-600" :
                  "bg-rose-50 text-rose-600"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    user.status === "active" ? "bg-emerald-500" :
                    user.status === "pending" ? "bg-amber-500" : "bg-rose-500"
                  )}></span>
                  {user.status === "active" ? "Actif" : user.status === "pending" ? "En attente" : "Suspendu"}
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
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Modifier">
                  <Edit className="h-4 w-4 text-slate-400" />
                </button>
                <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors" title="Supprimer">
                  <Trash2 className="h-4 w-4 text-slate-400 hover:text-rose-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Affichage de <span className="font-semibold">{filteredUsers.length}</span> utilisateurs
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">1</button>
            <button className="px-3 py-1.5 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-500">2</button>
            <button className="px-3 py-1.5 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-500">3</button>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
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
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                        {selectedUser.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {selectedUser.premium && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center">
                          <Crown className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{selectedUser.name}</h2>
                        {selectedUser.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                      </div>
                      <p className="text-sm text-slate-500">{selectedUser.email}</p>
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
                {/* Status & Role */}
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-semibold",
                    selectedUser.status === "active" ? "bg-emerald-50 text-emerald-600" :
                    selectedUser.status === "pending" ? "bg-amber-50 text-amber-600" :
                    "bg-rose-50 text-rose-600"
                  )}>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      selectedUser.status === "active" ? "bg-emerald-500" :
                      selectedUser.status === "pending" ? "bg-amber-500" : "bg-rose-500"
                    )}></span>
                    {selectedUser.status === "active" ? "Actif" : selectedUser.status === "pending" ? "En attente" : "Suspendu"}
                  </span>
                  <span className={cn(
                    "text-sm px-3 py-1.5 rounded-lg font-semibold",
                    selectedUser.role === "Admin" ? "bg-violet-50 text-violet-600" :
                    selectedUser.role === "Investisseur" ? "bg-emerald-50 text-emerald-600" :
                    "bg-blue-50 text-blue-600"
                  )}>
                    {selectedUser.role}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs font-medium">Localisation</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{selectedUser.location}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-medium">Inscription</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{selectedUser.joinedAt}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-medium">Projets</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{selectedUser.projects} projets</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-xs font-medium">Derniere activite</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{selectedUser.lastActive}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                      <Mail className="h-4 w-4" />
                      Envoyer un message
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedUser.status === "active" ? (
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors">
                        <ShieldX className="h-4 w-4" />
                        Suspendre
                      </button>
                    ) : (
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors">
                        <ShieldCheck className="h-4 w-4" />
                        Activer
                      </button>
                    )}
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-colors">
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

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ")
}

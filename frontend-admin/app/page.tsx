"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Eye,
  Check,
  X,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Briefcase,
  DollarSign,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCcw
} from "lucide-react"

export default function AdminDashboard() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today")
  const [refreshing, setRefreshing] = useState(false)

  const stats = [
    { label: "Total Utilisateurs", value: "1,284", change: "+12%", trend: "up", icon: Users, color: "bg-blue-500" },
    { label: "Projets Publies", value: "452", change: "+5%", trend: "up", icon: Briefcase, color: "bg-emerald-500" },
    { label: "Messages (24h)", value: "3,842", change: "+24%", trend: "up", icon: MessageSquare, color: "bg-violet-500" },
    { label: "Revenus Premium", value: "2.4M FCFA", change: "-2%", trend: "down", icon: DollarSign, color: "bg-amber-500" },
  ]

  const pendingModerations = [
    { id: 1, type: "Galerie", user: "Awa Diallo", avatar: "AD", content: "Expansion Atelier Textile", date: "Il y a 10 min", priority: "high" },
    { id: 2, type: "Annonce", user: "Ibrahim Keita", avatar: "IK", content: "Recherche financement Menuiserie", date: "Il y a 45 min", priority: "medium" },
    { id: 3, type: "Profil", user: "Youssef Mansouri", avatar: "YM", content: "Nouveau membre Business", date: "Il y a 1h", priority: "low" },
    { id: 4, type: "Galerie", user: "Fatou Sow", avatar: "FS", content: "Collection Mode Ethique 2026", date: "Il y a 2h", priority: "medium" },
  ]

  const recentUsers = [
    { id: 1, name: "Amara Diallo", email: "amara@email.com", role: "Entrepreneur", status: "active", joined: "Aujourd'hui" },
    { id: 2, name: "Kofi Mensah", email: "kofi@email.com", role: "Investisseur", status: "pending", joined: "Hier" },
    { id: 3, name: "Aissatou Barry", email: "aissatou@email.com", role: "Entrepreneur", status: "active", joined: "Il y a 2j" },
  ]

  const activityData = [
    { day: "Lun", users: 45, projects: 12 },
    { day: "Mar", users: 52, projects: 18 },
    { day: "Mer", users: 38, projects: 8 },
    { day: "Jeu", users: 65, projects: 24 },
    { day: "Ven", users: 78, projects: 32 },
    { day: "Sam", users: 42, projects: 15 },
    { day: "Dim", users: 28, projects: 6 },
  ]

  const maxUsers = Math.max(...activityData.map(d => d.users))

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de la plateforme Nexus Connect</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw className={cn("h-4 w-4 text-slate-500", refreshing && "animate-spin")} />
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4 text-slate-500" />
          </button>
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl">
            {(["today", "week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                  period === p ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {p === "today" ? "Aujourd'hui" : p === "week" ? "7 jours" : "30 jours"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl", stat.color)}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
                stat.trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Activite de la semaine</h2>
              <p className="text-xs text-slate-500 mt-0.5">Inscriptions et projets publies</p>
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <MoreHorizontal className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-48 mb-4">
            {activityData.map((data, idx) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1" style={{ height: '160px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.users / maxUsers) * 100}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="w-full max-w-8 bg-blue-500 rounded-t-lg relative group cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.users} utilisateurs
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{data.day}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs text-slate-500">Utilisateurs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-xs text-slate-500">Projets</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold">Etat du systeme</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Operationnel
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Serveur API</span>
                  <span className="text-emerald-400">99.9%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-[99.9%] bg-emerald-400 rounded-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Base de donnees</span>
                  <span className="text-emerald-400">98.5%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-[98.5%] bg-emerald-400 rounded-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Stockage</span>
                  <span className="text-amber-400">72%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-amber-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-400">Derniere verification: il y a 2 min</span>
              </div>
            </div>
          </div>
          
          <div className="absolute -right-6 -bottom-6 opacity-5">
            <ShieldCheck className="h-40 w-40" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Moderations */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-xl">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Moderations en attente</h2>
                <p className="text-xs text-slate-500">{pendingModerations.length} elements a traiter</p>
              </div>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Voir tout
            </button>
          </div>
          
          <div className="divide-y divide-slate-50">
            {pendingModerations.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{item.user}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide",
                        item.type === "Galerie" ? "bg-violet-50 text-violet-600" :
                        item.type === "Annonce" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
                      )}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-all">
                    <X className="h-4 w-4" />
                  </button>
                  <button className="h-8 w-8 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all shadow-sm">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Nouveaux utilisateurs</h2>
                <p className="text-xs text-slate-500">Inscriptions recentes</p>
              </div>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Voir tout
            </button>
          </div>
          
          <div className="divide-y divide-slate-50">
            {recentUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-xs font-bold text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[10px] px-2 py-1 rounded-full font-semibold",
                    user.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {user.status === "active" ? "Actif" : "En attente"}
                  </span>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Globe className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Repartition geographique</h2>
              <p className="text-xs text-slate-500">Utilisateurs par pays</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { country: "Senegal", users: 342, percent: 27 },
            { country: "Cote d'Ivoire", users: 256, percent: 20 },
            { country: "Mali", users: 198, percent: 15 },
            { country: "Ghana", users: 167, percent: 13 },
            { country: "Nigeria", users: 156, percent: 12 },
            { country: "Autres", users: 165, percent: 13 },
          ].map((item) => (
            <div key={item.country} className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-lg font-bold text-slate-900">{item.users}</p>
              <p className="text-xs text-slate-500 mb-2">{item.country}</p>
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${item.percent}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{item.percent}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ")
}

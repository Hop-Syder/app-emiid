/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dashboard Client Component avec donnees Supabase
 * @created 2026-03-18
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Globe,
  Activity,
  Server,
  Database,
  HardDrive,
  CheckCircle2,
  BadgeCheck,
  Crown,
  UserPlus,
  BarChart3,
  RefreshCw,
  ShieldAlert,
  Lock,
  Unlock,
  Ban,
  AlertTriangle,
} from "lucide-react"
import {
  getDashboardStats,
  type DashboardStats,
  toggleUserPublished,
  toggleUserVerified,
  toggleUserPremium,
  bulkUserAction,
} from "@/lib/actions/admin"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface DashboardClientProps {
  initialStats: DashboardStats
}

export function DashboardClient({ initialStats }: DashboardClientProps) {
  const [stats, setStats] = useState(initialStats)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState(7)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      setStats(await getDashboardStats(period))
    } finally {
      setRefreshing(false)
    }
  }

  const handlePeriodChange = async (days: number) => {
    setPeriod(days)
    setRefreshing(true)
    try {
      setStats(await getDashboardStats(days))
    } finally {
      setRefreshing(false)
    }
  }

  const handleTogglePublished = async (user: any) => {
    setActionLoading(true)
    try {
      const res = await toggleUserPublished(user.id, !user.is_published)
      if (res.success) {
        setStats(prev => ({
          ...prev,
          recentUsers: prev.recentUsers.map((u: any) => u.id === user.id ? { ...u, is_published: !user.is_published } : u)
        }))
        setSelectedUser((prev: any) => prev ? { ...prev, is_published: !prev.is_published } : null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleVerified = async (user: any) => {
    setActionLoading(true)
    try {
      const res = await toggleUserVerified(user.id, !user.is_verified)
      if (res.success) {
        setStats(prev => ({
          ...prev,
          recentUsers: prev.recentUsers.map((u: any) => u.id === user.id ? { ...u, is_verified: !user.is_verified } : u)
        }))
        setSelectedUser((prev: any) => prev ? { ...prev, is_verified: !prev.is_verified } : null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleTogglePremium = async (user: any) => {
    setActionLoading(true)
    try {
      const res = await toggleUserPremium(user.id, !user.is_premium)
      if (res.success) {
        setStats(prev => ({
          ...prev,
          recentUsers: prev.recentUsers.map((u: any) => u.id === user.id ? { ...u, is_premium: !user.is_premium } : u)
        }))
        setSelectedUser((prev: any) => prev ? { ...prev, is_premium: !prev.is_premium } : null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleSuspended = async (user: any) => {
    setActionLoading(true)
    try {
      const action = user.is_suspended ? "reactivate" : "suspend"
      const res = await bulkUserAction([user.id], action)
      if (res.success) {
        const nextSuspended = !user.is_suspended
        setStats(prev => ({
          ...prev,
          recentUsers: prev.recentUsers.map((u: any) => u.id === user.id ? { ...u, is_suspended: nextSuspended } : u)
        }))
        setSelectedUser((prev: any) => prev ? { ...prev, is_suspended: nextSuspended } : null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  // Croissance des inscriptions (7 derniers jours vs 7 précédents)
  const growth = stats.newUsersPrevWeek > 0
    ? Math.round(((stats.newUsersThisWeek - stats.newUsersPrevWeek) / stats.newUsersPrevWeek) * 100)
    : (stats.newUsersThisWeek > 0 ? 100 : 0)
  const growthUp = growth >= 0

  const pct = (n: number) => (stats.totalUsers > 0 ? Math.round((n / stats.totalUsers) * 100) : 0)

  const statCards = [
    { title: "Utilisateurs", value: stats.totalUsers, icon: Users, lightColor: "bg-blue-50", textColor: "text-[#013ff4]", sub: null as string | null },
    { title: "Nouveaux (7 j)", value: stats.newUsersThisWeek, icon: UserPlus, lightColor: "bg-sky-50", textColor: "text-sky-600", sub: `${growthUp ? "+" : ""}${growth}% vs 7 j préc.`, up: growthUp },
    { title: "Profils publiés", value: stats.publishedProfiles, icon: CheckCircle2, lightColor: "bg-emerald-50", textColor: "text-emerald-600", sub: `${pct(stats.publishedProfiles)}% du total` },
    { title: "Vérifiés", value: stats.verifiedProfiles, icon: BadgeCheck, lightColor: "bg-cyan-50", textColor: "text-cyan-600", sub: `${pct(stats.verifiedProfiles)}% du total` },
    { title: "Premium", value: stats.premiumProfiles, icon: Crown, lightColor: "bg-amber-50", textColor: "text-amber-600", sub: `${pct(stats.premiumProfiles)}% du total` },
    { title: "Messages", value: stats.totalMessages, icon: MessageSquare, lightColor: "bg-violet-50", textColor: "text-violet-600", sub: null },
    { title: "Revenus (est.)", value: `${stats.totalRevenue.toLocaleString()} F`, icon: TrendingUp, lightColor: "bg-emerald-50", textColor: "text-emerald-600", sub: "10k F/premium" },
    { title: "Signalements", value: stats.activeReports, icon: AlertTriangle, lightColor: "bg-rose-50", textColor: "text-rose-600", sub: `${stats.activeReports} actif${stats.activeReports !== 1 ? "s" : ""}` },
  ]

  // Funnel de conversion
  const funnel = [
    { label: "Utilisateurs", value: stats.totalUsers, color: "bg-[#013ff4]" },
    { label: "Publiés", value: stats.publishedProfiles, color: "bg-emerald-500" },
    { label: "Vérifiés", value: stats.verifiedProfiles, color: "bg-cyan-500" },
    { label: "Premium", value: stats.premiumProfiles, color: "bg-amber-500" },
  ]

  const maxWeeklyUsers = Math.max(...stats.weeklyActivity.map(d => d.users), 1)
  const systemIcons = [Server, Database, HardDrive]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tableau de Bord
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Vue d’ensemble de la plateforme EmiID
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Rafraîchir
        </button>
      </div>

      {/* Inbox Opérationnelle (Bento Alertes) */}
      {(stats.pendingVerifications > 0 || stats.activeReports > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {stats.pendingVerifications > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50/70 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Vérifications en attente</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {stats.pendingVerifications} profil{stats.pendingVerifications !== 1 ? 's' : ''} en attente de validation.
                  </p>
                </div>
              </div>
              <a
                href="/moderation"
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer"
              >
                Traiter
              </a>
            </motion.div>
          )}
          {stats.activeReports > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50/70 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-500 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Signalements actifs</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {stats.activeReports} contenu{stats.activeReports !== 1 ? 's' : ''} signalé{stats.activeReports !== 1 ? 's' : ''} en attente.
                  </p>
                </div>
              </div>
              <a
                href="/moderation/signalements"
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer"
              >
                Modérer
              </a>
            </motion.div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className={`w-10 h-10 ${stat.lightColor} dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
            </div>
            <p className="text-lg xl:text-xl font-bold text-slate-900 dark:text-white truncate" title={String(stat.value)}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{stat.title}</p>
            {stat.sub && (
              <p className={`text-[10px] font-semibold mt-1.5 flex items-center gap-1 truncate ${
                "up" in stat ? (stat.up ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500") : "text-slate-400 dark:text-slate-500"
              }`}>
                {"up" in stat && (stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
                {stat.sub}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Funnel de conversion */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-[#013ff4]" /> Entonnoir de conversion
        </h2>
        <div className="space-y-3">
          {funnel.map((step) => {
            const width = stats.totalUsers > 0 ? Math.max(4, Math.round((step.value / stats.totalUsers) * 100)) : 0
            return (
              <div key={step.label} className="flex items-center gap-3">
                <span className="w-24 text-xs font-semibold text-slate-500 shrink-0">{step.label}</span>
                <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                  <div className={`h-full ${step.color} rounded-lg flex items-center justify-end px-2 transition-all`} style={{ width: `${width}%` }}>
                    <span className="text-[11px] font-bold text-white">{step.value.toLocaleString()}</span>
                  </div>
                </div>
                <span className="w-10 text-right text-xs font-bold text-slate-400 shrink-0">{width}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Activité des Inscriptions</h2>
              <p className="text-sm text-slate-500">
                Nouveaux profils sur les {period} derniers jours
              </p>
            </div>
            
            {/* Filtre de période Bento */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 self-start sm:self-auto">
              {[
                { label: "7j", value: 7 },
                { label: "14j", value: 14 },
                { label: "30j", value: 30 },
                { label: "90j", value: 90 },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePeriodChange(p.value)}
                  disabled={refreshing}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${
                    period === p.value
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200/40"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between h-48 gap-1.5 sm:gap-2 pt-4">
            {stats.weeklyActivity.map((day, index) => {
              const showLabel = 
                period <= 7 || 
                (period <= 14 && index % 2 === 0) || 
                (period <= 30 && index % 5 === 0) || 
                (period <= 90 && index % 15 === 0) || 
                index === stats.weeklyActivity.length - 1;

              return (
                <div key={day.day + index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end min-w-0">
                  <div className="relative group/bar flex flex-col items-center w-full h-full justify-end">
                    <span className="absolute -top-7 scale-0 group-hover/bar:scale-100 transition-all text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-lg z-10 whitespace-nowrap">
                      {day.users} inscrit{day.users !== 1 ? "s" : ""}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.users / maxWeeklyUsers) * 100}%` }}
                      transition={{ delay: 0.2 + (index * (0.3 / period)), duration: 0.4 }}
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 rounded-t-md min-h-[4px] cursor-pointer transition-colors shadow-sm"
                      style={{ maxHeight: "100%" }}
                    />
                  </div>
                  {showLabel ? (
                    <span className="text-[10px] font-bold text-slate-400 select-none whitespace-nowrap truncate w-full text-center">
                      {day.day}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300/40 select-none">•</span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Etat du Systeme</h2>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="space-y-4">
            {stats.systemChecks.map((check, index) => {
              const Icon = systemIcons[index] || Activity
              const isUp = check.status === "up"
              const isDown = check.status === "down"

              return (
                <div
                  key={check.label}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    isUp ? "bg-emerald-50" : isDown ? "bg-rose-50" : "bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isUp ? "text-emerald-600" : isDown ? "text-rose-600" : "text-slate-500"}`} />
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">{check.label}</span>
                      <span className="text-[11px] text-slate-500">{check.detail}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    isUp
                      ? "text-emerald-600 bg-emerald-100"
                      : isDown
                        ? "text-rose-600 bg-rose-100"
                        : "text-slate-600 bg-slate-200"
                  }`}>
                    {isUp ? "En ligne" : isDown ? "Incident" : "Inconnu"}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nouveaux Utilisateurs</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Dernières inscriptions</p>
            </div>
            <UserPlus className="h-5 w-5 text-blue-500" />
          </div>

          <div className="space-y-3">
            {stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-900/40 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/40 transition-all cursor-pointer active:scale-[0.99] select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(user.first_name, user.last_name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user.first_name || ""} {user.last_name || ""}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-[240px]">
                        {user.email || user.category || "Nouveau"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {user.is_premium && (
                      <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500" title="Premium">
                        <Crown className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {user.is_verified && (
                      <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-500" title="Vérifié">
                        <BadgeCheck className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {user.is_suspended && (
                      <span className="p-1 rounded-lg bg-rose-500/10 text-rose-600" title="Suspendu">
                        <Ban className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                      user.is_published 
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500" 
                        : "bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-550"
                    }`}>
                      {user.is_published ? "Publié" : "En attente"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun utilisateur pour le moment</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Users by Country */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Répartition Géographique</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Utilisateurs par pays</p>
            </div>
            <Globe className="h-5 w-5 text-violet-500" />
          </div>

          <div className="space-y-3">
            {stats.usersByCountry.length > 0 ? (
              stats.usersByCountry.map((item, index) => {
                const maxCount = stats.usersByCountry[0]?.count || 1
                const percentage = (item.count / maxCount) * 100
                return (
                  <div key={item.country} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.country}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune donnée géographique</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modale de Détail & Modération Rapide d'un profil */}
      <Dialog open={selectedUser !== null} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/10 shrink-0">
                    {getInitials(selectedUser.first_name, selectedUser.last_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">{selectedUser.first_name || ""} {selectedUser.last_name || ""}</span>
                      {selectedUser.is_admin && (
                        <span className="text-[9px] bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Admin</span>
                      )}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {selectedUser.email || "Aucun email renseigné"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-4 border-t border-b border-slate-100 dark:border-slate-850">
                {/* Métadonnées */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/70 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Catégorie</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {selectedUser.category || "Non spécifié"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Statut Actuel</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        selectedUser.is_published ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {selectedUser.is_published ? "Publié" : "En attente"}
                      </span>
                      {selectedUser.is_premium && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 flex items-center gap-0.5">
                          <Crown className="h-2.5 w-2.5" /> Premium
                        </span>
                      )}
                      {selectedUser.is_verified && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 flex items-center gap-0.5">
                          <BadgeCheck className="h-2.5 w-2.5" /> Vérifié
                        </span>
                      )}
                      {selectedUser.is_suspended && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 flex items-center gap-0.5 animate-pulse">
                          <Ban className="h-2.5 w-2.5" /> Suspendu
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions de Modération */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Actions de modération</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* Publication */}
                    <button
                      onClick={() => handleTogglePublished(selectedUser)}
                      disabled={actionLoading}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                        selectedUser.is_published
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:bg-slate-250/50"
                          : "bg-emerald-600 text-white border-transparent hover:bg-emerald-700"
                      }`}
                    >
                      {selectedUser.is_published ? "Masquer le profil" : "Publier le profil"}
                    </button>

                    {/* Vérification */}
                    <button
                      onClick={() => handleToggleVerified(selectedUser)}
                      disabled={actionLoading}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                        selectedUser.is_verified
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:bg-slate-250/50"
                          : "bg-cyan-600 text-white border-transparent hover:bg-cyan-700"
                      }`}
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {selectedUser.is_verified ? "Retirer badge bleu" : "Attribuer badge bleu"}
                    </button>

                    {/* Premium */}
                    <button
                      onClick={() => handleTogglePremium(selectedUser)}
                      disabled={actionLoading}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                        selectedUser.is_premium
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-700 hover:bg-slate-250/50"
                          : "bg-amber-500 text-white border-transparent hover:bg-amber-600"
                      }`}
                    >
                      <Crown className="h-3.5 w-3.5" />
                      {selectedUser.is_premium ? "Retirer Premium" : "Passer Premium"}
                    </button>

                    {/* Suspension */}
                    <button
                      onClick={() => handleToggleSuspended(selectedUser)}
                      disabled={actionLoading || selectedUser.is_admin}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                        selectedUser.is_suspended
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 border-emerald-200 dark:border-emerald-900/20 hover:bg-emerald-100/60"
                          : "bg-rose-600 text-white border-transparent hover:bg-rose-700"
                      }`}
                    >
                      {selectedUser.is_suspended ? (
                        <>
                          <Unlock className="h-3.5 w-3.5" /> Réactiver
                        </>
                      ) : (
                        <>
                          <Ban className="h-3.5 w-3.5" /> Suspendre
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 flex sm:justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0] || ""
  const last = lastName?.[0] || ""
  return (first + last).toUpperCase() || "?"
}

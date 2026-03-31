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
  Globe,
  Activity,
  Server,
  Database,
  HardDrive,
  CheckCircle2,
  UserPlus,
  BarChart3
} from "lucide-react"
import type { DashboardStats, UserProfile } from "@/lib/actions/admin"

interface DashboardClientProps {
  initialStats: DashboardStats
}

export function DashboardClient({ initialStats }: DashboardClientProps) {
  const [stats] = useState(initialStats)

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Profils Publies",
      value: stats.publishedProfiles,
      icon: CheckCircle2,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Messages",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "bg-violet-500",
      lightColor: "bg-violet-50",
      textColor: "text-violet-600"
    }
  ]

  const maxWeeklyUsers = Math.max(...stats.weeklyActivity.map(d => d.users), 1)
  const systemIcons = [Server, Database, HardDrive]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Tableau de Bord
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Vue d’ensemble de la plateforme Nexus
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.lightColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Activite Hebdomadaire</h2>
              <p className="text-sm text-slate-500">Nouveaux utilisateurs cette semaine</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
              <BarChart3 className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">7 jours</span>
            </div>
          </div>

          <div className="flex items-end justify-between h-48 gap-2">
            {stats.weeklyActivity.map((day, index) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.users / maxWeeklyUsers) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg min-h-[4px]"
                  style={{ maxHeight: "100%" }}
                />
                <span className="text-xs font-medium text-slate-400">{day.day}</span>
                <span className="text-xs font-semibold text-slate-600">{day.users}</span>
              </div>
            ))}
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
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Nouveaux Utilisateurs</h2>
              <p className="text-sm text-slate-500">Dernieres inscriptions</p>
            </div>
            <UserPlus className="h-5 w-5 text-blue-500" />
          </div>

          <div className="space-y-3">
            {stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(user.first_name, user.last_name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {user.first_name || ""} {user.last_name || ""}
                      </p>
                      <p className="text-xs text-slate-500">{user.email || user.category || "Nouveau"}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    user.is_published 
                      ? "bg-emerald-50 text-emerald-600" 
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    {user.is_published ? "Publie" : "En attente"}
                  </span>
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
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Repartition Geographique</h2>
              <p className="text-sm text-slate-500">Utilisateurs par pays</p>
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
                      <span className="text-sm font-medium text-slate-700">{item.country}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
                <p className="text-sm">Aucune donnee geographique</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0] || ""
  const last = lastName?.[0] || ""
  return (first + last).toUpperCase() || "?"
}

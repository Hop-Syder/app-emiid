/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Résumé de l'activité récente
 * @created 2026-06-01
 */

"use client"

import { Eye, UserPlus, MessageSquare, ArrowUpRight } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "view",
    title: "Nouveau visiteur",
    description: "Un recruteur a consulté votre profil.",
    time: "Il y a 2h",
    icon: Eye,
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    id: 2,
    type: "follow",
    title: "Nouvel abonné",
    description: "Marc Dupont a commencé à vous suivre.",
    time: "Il y a 4h",
    icon: UserPlus,
    color: "text-emerald-500",
    bg: "bg-emerald-100",
  },
  {
    id: 3,
    type: "message",
    title: "Nouveau message",
    description: "Vous avez reçu une demande de connexion.",
    time: "Hier",
    icon: MessageSquare,
    color: "text-purple-500",
    bg: "bg-purple-100",
  },
]

export function RecentActivitySection() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm overflow-hidden relative h-full">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <ArrowUpRight className="w-32 h-32 text-slate-900" />
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Activité Récente</h3>
        <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          Voir tout
        </button>
      </div>

      <div className="space-y-5 relative z-10">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-4 group">
              <div className={`p-3 rounded-2xl ${activity.bg} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{activity.title}</p>
                <p className="text-slate-500 text-xs truncate mt-0.5">{activity.description}</p>
              </div>
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap pt-1">
                {activity.time}
              </span>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 pt-5 border-t border-slate-100 relative z-10">
        <button className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
          Gérer mon impact
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

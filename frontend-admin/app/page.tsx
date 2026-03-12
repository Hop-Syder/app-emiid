/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Dashboard Admin - Vue d'ensemble et Modération
 * @created 2026-03-12
 * @updated 2026-03-12
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

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
  ArrowUpRight
} from "lucide-react"

export default function Home() {
  const stats = [
    { label: "Total Utilisateurs", value: "1,284", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Projets Publiés", value: "452", change: "+5%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Messages (24h)", value: "3,842", change: "+24%", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Annonces Actives", value: "156", change: "-2%", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  ]

  const pendingModerations = [
    { id: 1, type: "Galerie", user: "Awa Diallo", content: "Expansion Atelier Textile", date: "Il y a 10 min", status: "pending" },
    { id: 2, type: "Annonce", user: "Ibrahim Keita", content: "Recherche financement Menuiserie", date: "Il y a 45 min", status: "pending" },
    { id: 3, type: "Profil", user: "Youssef Mansouri", content: "Nouveau membre Business", date: "Il y a 1h", status: "pending" },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bonjour, Dexty 👋</h1>
          <p className="text-slate-500 font-medium">Voici ce qui s'est passé sur Nexus Connect aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button className="px-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all">Aujourd'hui</button>
          <button className="px-4 py-2 text-slate-500 hover:text-slate-900 rounded-xl text-xs font-bold transition-all">7 derniers jours</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                stat.change.startsWith("+") ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {stat.change}
                {stat.change.startsWith("+") ? <ArrowUpRight className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
              </div>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Moderation */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Modérations en attente
            </h2>
            <button className="text-blue-600 text-xs font-bold hover:underline underline-offset-4">Voir tout le flux</button>
          </div>
          <div className="flex-1">
            {pendingModerations.map((item, idx) => (
              <div key={item.id} className="p-5 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">
                    {item.user[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900">{item.user}</span>
                      <span className="text-[10px] h-5 flex items-center px-2 bg-blue-50 text-blue-600 rounded-lg font-bold uppercase tracking-tighter">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-1 line-clamp-1">{item.content}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                      <Clock className="h-3 w-3" />
                      {item.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-xl transition-all">
                    <X className="h-5 w-5" />
                  </button>
                  <button className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 rounded-xl transition-all">
                    <Check className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-lg font-bold mb-2">Sécurité Nexus</h2>
              <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">Le système tourne sur un serveur isolé. Aucune intrusion détectée.</p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">A</div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Système Optimal
                </span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="h-32 w-32" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Liens Rapides</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-700">
                Audit de sécurité
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all font-bold text-xs text-slate-700">
                Backup de la base de données
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 transition-all font-bold text-xs text-blue-600">
                Voir le site utilisateur
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}

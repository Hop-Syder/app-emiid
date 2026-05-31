/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description CTA pour l'activité récente menant vers la page de notifications
 * @created 2026-06-01
 */

"use client"

import Link from "next/link"
import { Bell, ArrowRight, Eye, UserPlus, MessageSquare } from "lucide-react"

export function RecentActivityCta() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm overflow-hidden relative h-full flex flex-col justify-between group">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:bg-blue-100 transition-colors duration-500" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:bg-purple-100 transition-colors duration-500" />

      <div className="relative z-10">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-slate-200">
          <Bell className="text-white w-6 h-6" />
        </div>
        
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">
          Votre activité
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          Découvrez qui a consulté votre profil, vos nouveaux abonnés et messages. Restez connecté avec votre réseau.
        </p>

        {/* Mini stats visual */}
        <div className="flex gap-3 mb-8">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center z-30">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center z-20">
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center z-10">
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">+3 nouvelles</span>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Link 
          href="/notifications"
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center justify-between group/btn"
        >
          <span>Voir mes notifications</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

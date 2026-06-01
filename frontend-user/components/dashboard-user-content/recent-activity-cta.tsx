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
    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-sm overflow-hidden relative w-full group">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:bg-blue-100 transition-colors duration-500" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:bg-purple-100 transition-colors duration-500" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Section: Icon & Text */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-md shadow-slate-200 shrink-0">
            <Bell className="text-white w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-1">
              Votre activité
            </h3>
            <p className="text-slate-500 text-sm max-w-lg">
              Découvrez qui a consulté votre profil, vos nouveaux abonnés et messages.
            </p>
          </div>
        </div>

        {/* Right Section: Stats & Button */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          {/* Mini stats visual */}
          <div className="flex gap-3">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center z-30">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center z-20">
                <UserPlus className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center z-10">
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">Nouveau</span>
            </div>
          </div>

          <Link 
            href="/notifications"
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 group/btn whitespace-nowrap"
          >
            <span>Voir mes notifications</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

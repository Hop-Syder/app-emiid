/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description CTA pour l'activité récente menant vers la page de notifications
 * @created 2026-06-01
 */

"use client"

import Link from "next/link"
import { BellRing, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"

export function RecentActivityCta() {
  const unreadCount = useUnreadNotifications()
  const hasNew = unreadCount > 0

  return (
    <div className="relative group cursor-pointer transition-all duration-300 hover:-translate-y-1">
      {/* Glow effect derrière la carte */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
      
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-sm overflow-hidden relative w-full h-full z-10">
        
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-full blur-3xl opacity-60 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-gradient-to-tr from-blue-50 to-blue-100/50 rounded-full blur-3xl opacity-60 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Left Section: Icon & Text */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-50 group-hover:scale-105 transition-transform duration-300">
              <BellRing className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-1 group-hover:text-emerald-600 transition-colors">
                  Activité Récente
                </h3>
                {hasNew && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ring-emerald-200/50 shadow-sm animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount} Nouveau{unreadCount > 1 ? "x" : ""}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-500">
                {hasNew
                  ? "Vous avez de nouvelles interactions sur votre profil."
                  : "Retrouvez ici l'historique de vos interactions."}
              </p>
            </div>
          </div>

          {/* Right Section: Action Button */}
          <div className="w-full md:w-auto shrink-0">
            <Link href="/notifications">
              <Button 
                className="w-full md:w-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 px-6 shadow-md transition-all group-hover:shadow-lg group-hover:bg-emerald-600"
              >
                Voir les notifications
                <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

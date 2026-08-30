/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant d'affichage de la complétude du profil utilisateur avec anneau de progression et accès rapide aux notifications sur mobile.
 * @created 2026-07-13
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { ArrowRight, Bell } from "lucide-react"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"

interface ProfileCompletenessProps {
  completion: number
  loading: boolean
  nextAction: { label: string; href: string } | null
}

export function ProfileCompleteness({ completion, loading, nextAction }: ProfileCompletenessProps) {
  const unreadCount = useUnreadNotifications()

  // Constantes pour l'anneau de progression SVG
  const R = 26
  const C = 2 * Math.PI * R
  const dash = C - (completion / 100) * C

  return (
    <div className="relative flex items-center gap-4 lg:w-[300px] shrink-0">
      {/* ── ICÔNE NOTIFICATIONS MOBILE (coin supérieur droit) ── */}
      <Link
        href="/notifications"
        aria-label="Voir mes notifications"
        className="lg:hidden absolute -top-1 right-0 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600 hover:text-[#013ff4] hover:bg-[#013ff4]/5 active:scale-95 transition-all shadow-sm"
      >
        <span className="relative flex items-center justify-center">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      </Link>

      <div className="relative shrink-0" aria-hidden>
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            stroke={completion >= 100 ? "#10b981" : "#013ff4"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={loading ? C : dash}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900">
          {loading ? "…" : `${completion}%`}
        </span>
      </div>

      <div className="min-w-0 pr-8 lg:pr-0">
        {completion >= 100 ? (
          <>
            <p className="text-sm font-black text-slate-900">Profil complet 🎉</p>
            <p className="text-xs text-slate-500 mt-0.5">Vous apparaissez au mieux dans les recherches.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-black text-slate-900">Complétez votre profil</p>
            <p className="text-xs text-slate-500 mt-0.5">Un profil complet apparaît bien plus haut dans l&apos;annuaire.</p>
            {nextAction && (
              <Link
                href={nextAction.href}
                className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#013ff4] hover:gap-2 transition-all"
              >
                {nextAction.label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}

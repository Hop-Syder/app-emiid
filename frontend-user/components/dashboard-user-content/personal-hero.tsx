/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Cockpit personnel du dashboard — complétude du profil, vues/abonnés (preuve
 *              sociale personnalisée) et upsell Premium. Conversion-first.
 * @created 2026-07-10
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { Eye, Users, Crown, ArrowRight, Sparkles, MessageSquare, Images } from "lucide-react"
import { usePersonalHero } from "@/hooks/use-personal-hero"
import { StatTile } from "./stat-tile"
import { ProfileCompleteness } from "./profile-completeness"

export function PersonalHero() {
  const {
    unreadMsgs,
    realisationsCount,
    loading,
    completion,
    nextAction,
    isPremium,
    stats,
  } = usePersonalHero()

  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-4 sm:p-5 shadow-[0_4px_24px_rgb(15,23,42,0.05)]">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Complétude */}
        <ProfileCompleteness completion={completion} loading={loading} nextAction={nextAction} />

        {/* Stats perso (preuve sociale personnalisée) */}
        <div className="flex-1 flex gap-3">
          <StatTile
            icon={Eye}
            value={stats.viewsThisWeek}
            label="Vues (7 j)"
            growth={stats.viewsGrowthPercent}
            tone="bg-[#013ff4]/10 text-[#013ff4]"
          />
          <StatTile
            icon={Eye}
            value={stats.totalViews}
            label="Vues totales"
            tone="bg-[#03b3f8]/10 text-[#03b3f8]"
          />
          <StatTile
            icon={Users}
            value={stats.totalFollowers}
            label="Abonnés"
            growth={stats.followersGrowthPercent}
            tone="bg-[#013ff4]/10 text-[#013ff4]"
          />
        </div>
      </div>

      {/* Messages non lus — signal d'action prioritaire */}
      {unreadMsgs > 0 && (
        <Link
          href="/messages"
          className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#013ff4]/[0.06] to-[#03b3f8]/[0.06] border border-[#013ff4]/20 px-4 py-3 hover:from-[#013ff4]/10 transition-colors group"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="relative shrink-0">
              <MessageSquare className="h-5 w-5 text-[#013ff4]" />
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black ring-2 ring-white">
                {unreadMsgs > 9 ? "9+" : unreadMsgs}
              </span>
            </span>
            <span className="text-sm font-bold text-slate-900 truncate">
              Vous avez {unreadMsgs} message{unreadMsgs > 1 ? "s" : ""} non lu{unreadMsgs > 1 ? "s" : ""}
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs font-black text-[#013ff4] shrink-0">
            Répondre <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      )}

      {/* Activation — aucune réalisation → inciter à exposer son travail */}
      {realisationsCount === 0 && !loading && (
        <Link
          href="/portefeuille"
          className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#03b3f8]/[0.06] to-[#013ff4]/[0.06] border border-[#03b3f8]/20 px-4 py-3 hover:from-[#03b3f8]/10 transition-colors group"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Images className="h-5 w-5 text-[#03b3f8] shrink-0" />
            <span className="text-sm font-bold text-slate-900 truncate">
              Exposez votre talent — ajoutez votre 1<sup>re</sup> réalisation
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs font-black text-[#03b3f8] shrink-0">
            Ajouter <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      )}

      {/* Upsell Premium contextuel */}
      {!isPremium && !loading && (
        <Link
          href="/parametres?tab=plan"
          className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/60 px-4 py-3 hover:from-amber-100 transition-colors group"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Crown className="h-5 w-5 text-amber-500 shrink-0" />
            <span className="text-sm font-bold text-amber-900 truncate">
              Passez Premium — les profils Premium sont vus <span className="whitespace-nowrap">5× plus</span>
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs font-black text-amber-700 shrink-0">
            <Sparkles className="h-3.5 w-3.5" /> Découvrir
          </span>
        </Link>
      )}
    </div>
  )
}

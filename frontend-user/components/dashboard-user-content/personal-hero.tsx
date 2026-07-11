/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Cockpit personnel du dashboard — complétude du profil, vues/abonnés (preuve
 *              sociale personnalisée) et upsell Premium. Conversion-first.
 * @created 2026-07-10
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, Users, TrendingUp, TrendingDown, Crown, ArrowRight, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useImpactStats } from "@/hooks/use-impact-stats"
import { cn } from "@/lib/utils"

// Champs comptant pour la complétude (mêmes clés que la création de profil).
const FIELD_LABELS: { key: string; label: string; href: string }[] = [
  { key: "avatar_url", label: "Ajoutez une photo", href: "/creer-profil" },
  { key: "bio", label: "Rédigez votre bio", href: "/creer-profil" },
  { key: "specialty", label: "Précisez votre spécialité", href: "/creer-profil" },
  { key: "city", label: "Indiquez votre ville", href: "/creer-profil" },
  { key: "phone", label: "Ajoutez un téléphone", href: "/parametres" },
  { key: "website", label: "Ajoutez un site web", href: "/creer-profil" },
  { key: "role", label: "Renseignez votre rôle", href: "/creer-profil" },
  { key: "category", label: "Choisissez une catégorie", href: "/creer-profil" },
]

interface OwnProfile {
  avatar_url?: string | null
  bio?: string | null
  specialty?: string | null
  city?: string | null
  phone?: string | null
  website?: string | null
  role?: string | null
  category?: string | null
  is_premium?: boolean | null
}

function StatTile({ icon: Icon, value, label, growth, tone }: {
  icon: typeof Eye; value: number; label: string; growth?: number; tone: string
}) {
  return (
    <div className="flex-1 min-w-[92px] rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center", tone)}>
          <Icon className="h-4 w-4" />
        </span>
        {typeof growth === "number" && growth !== 0 && (
          <span className={cn("text-[10px] font-bold flex items-center gap-0.5", growth > 0 ? "text-emerald-600" : "text-rose-500")}>
            {growth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {growth > 0 ? "+" : ""}{growth}%
          </span>
        )}
      </div>
      <p className="text-xl font-black text-slate-900 mt-2 leading-none tabular-nums">{value.toLocaleString("fr-FR")}</p>
      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

export function PersonalHero() {
  const supabase = createClient()
  const { stats } = useImpactStats()
  const [profile, setProfile] = useState<OwnProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (active) setLoading(false); return }
      // eslint-disable-next-line no-restricted-syntax -- accès authentifié à SA PROPRE ligne (RLS OK) pour la complétude
      const { data } = await supabase
        .from("user_profiles")
        .select("avatar_url, bio, specialty, city, phone, website, role, category, is_premium")
        .eq("user_id", user.id)
        .maybeSingle()
      if (active) { setProfile((data as OwnProfile) || null); setLoading(false) }
    })()
    return () => { active = false }
  }, [supabase])

  const filled = FIELD_LABELS.filter((f) => {
    const v = profile?.[f.key as keyof OwnProfile]
    return typeof v === "string" ? v.trim().length > 0 : !!v
  })
  const completion = FIELD_LABELS.length > 0 ? Math.round((filled.length / FIELD_LABELS.length) * 100) : 0
  const missing = FIELD_LABELS.filter((f) => !filled.includes(f))
  const nextAction = missing[0]
  const isPremium = !!profile?.is_premium

  // Anneau de progression
  const R = 26, C = 2 * Math.PI * R
  const dash = C - (completion / 100) * C

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#013ff4]/[0.04] via-white to-[#03b3f8]/[0.04] border border-slate-200/70 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Complétude */}
        <div className="flex items-center gap-4 lg:w-[300px] shrink-0">
          <div className="relative shrink-0" aria-hidden>
            <svg width="64" height="64" className="-rotate-90">
              <circle cx="32" cy="32" r={R} fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <circle
                cx="32" cy="32" r={R} fill="none"
                stroke={completion >= 100 ? "#10b981" : "#013ff4"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={loading ? C : dash}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900">
              {loading ? "…" : `${completion}%`}
            </span>
          </div>
          <div className="min-w-0">
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
                  <Link href={nextAction.href} className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#013ff4] hover:gap-2 transition-all">
                    {nextAction.label} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats perso (preuve sociale personnalisée) */}
        <div className="flex-1 flex gap-3">
          <StatTile icon={Eye} value={stats.viewsThisWeek} label="Vues (7 j)" growth={stats.viewsGrowthPercent} tone="bg-[#013ff4]/10 text-[#013ff4]" />
          <StatTile icon={Eye} value={stats.totalViews} label="Vues totales" tone="bg-[#03b3f8]/10 text-[#03b3f8]" />
          <StatTile icon={Users} value={stats.totalFollowers} label="Abonnés" growth={stats.followersGrowthPercent} tone="bg-violet-500/10 text-violet-600" />
        </div>
      </div>

      {/* Upsell Premium contextuel */}
      {!isPremium && !loading && (
        <Link
          href="/parametres?tab=premium"
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

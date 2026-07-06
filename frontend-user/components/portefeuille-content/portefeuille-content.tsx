/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hub professionnel personnel — réalisations, compétences, réseau
 * @updated 2026-06-14
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, Users, Images, Globe, Lock, Briefcase, Tag, Network } from "lucide-react"
import { Preloader } from "@/components/Preloader"
import { RealisationsSection } from "./realisations-section"
import { CompetencesSection } from "./competences-section"
import { FollowedProfilesContent } from "./followed-profiles-content"

type TabId = "realisations" | "competences" | "reseau"

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "realisations", label: "Réalisations", icon: Briefcase },
  { id: "competences",  label: "Compétences",  icon: Tag },
  { id: "reseau",       label: "Réseau",        icon: Network },
]

interface PortefeuilleStats {
  userId:       string
  profileId:    string | null
  profileViews: number
  followers:    number
  approvedItems: number
  isPublished:  boolean
}

export function PortefeuilleContent() {
  const [activeTab, setActiveTab] = useState<TabId>("realisations")
  const [stats, setStats]         = useState<PortefeuilleStats | null>(null)
  const [loading, setLoading]     = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [profileRes, viewsRes, galleryRes] = await Promise.all([
        // eslint-disable-next-line no-restricted-syntax -- accès authentifié à SA propre ligne (RLS OK)
        supabase
          .from("user_profiles")
          .select("id, followers_count, is_published")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .gte("created_at", thirtyDaysAgo),
        supabase
          .from("project_gallery")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "approved"),
      ])

      setStats({
        userId:       user.id,
        profileId:    profileRes.data?.id ?? null,
        followers:    profileRes.data?.followers_count ?? 0,
        isPublished:  profileRes.data?.is_published ?? false,
        profileViews: viewsRes.count ?? 0,
        approvedItems: galleryRes.count ?? 0,
      })
      setLoading(false)
    }

    void load()
  }, [supabase, router])

  if (loading || !stats) {
    return <Preloader text="Chargement de votre portefeuille" subtext="Un instant…" minHeight="min-h-[60vh]" />
  }

  const STAT_CARDS = [
    {
      label:    "Vues du profil",
      sublabel: "30 derniers jours",
      value:    stats.profileViews,
      icon:     Eye,
      color:    "text-blue-600",
      bg:       "bg-blue-50",
      border:   "border-blue-100",
      cta:      false,
    },
    {
      label:    "Abonnés",
      sublabel: "Followers",
      value:    stats.followers,
      icon:     Users,
      color:    "text-violet-600",
      bg:       "bg-violet-50",
      border:   "border-violet-100",
      cta:      false,
    },
    {
      label:    "Réalisations",
      sublabel: "Publiées sur votre profil",
      value:    stats.approvedItems,
      icon:     Images,
      color:    "text-emerald-600",
      bg:       "bg-emerald-50",
      border:   "border-emerald-100",
      cta:      false,
    },
    {
      label:    stats.isPublished ? "Profil visible" : "Profil masqué",
      sublabel: stats.isPublished ? "Vous êtes dans l'annuaire" : "Activez dans Paramètres",
      value:    null as number | null,
      icon:     stats.isPublished ? Globe : Lock,
      color:    stats.isPublished ? "text-emerald-600" : "text-slate-500",
      bg:       stats.isPublished ? "bg-emerald-50" : "bg-slate-50",
      border:   stats.isPublished ? "border-emerald-100" : "border-slate-200",
      cta:      true,
    },
  ]

  const activeContent: Record<TabId, React.ReactNode> = {
    realisations: <RealisationsSection userId={stats.userId} profileId={stats.profileId} />,
    competences:  <CompetencesSection  profileId={stats.profileId} />,
    reseau:       <FollowedProfilesContent />,
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mon Portefeuille</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gérez vos réalisations, compétences et votre réseau professionnel</p>
        </div>

        {/* ── Hero Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                onClick={card.cta ? () => router.push("/parametres") : undefined}
                className={`bg-white border ${card.border} rounded-2xl p-4 sm:p-5 ${
                  card.cta ? "cursor-pointer hover:shadow-md active:scale-[0.98]" : ""
                } transition-all`}
              >
                <div className={`w-9 h-9 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center mb-3 shrink-0`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>

                {card.value !== null ? (
                  <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                ) : (
                  <p className={`text-sm font-black leading-tight ${card.color}`}>{card.label}</p>
                )}

                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  {card.value !== null ? card.label : card.sublabel}
                </p>
              </div>
            )
          })}
        </div>

        {/* ── Tab navigation ─────────────────────────────────────────── */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border transition-all ${
                  activeTab === id
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Section title ──────────────────────────────────────────── */}
        {activeTab !== "reseau" && (
          <div className="hidden lg:block">
            <h2 className="text-lg font-black text-slate-900">
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
        )}

        {/* ── Tab content ────────────────────────────────────────────── */}
        {activeContent[activeTab]}

      </div>
    </div>
  )
}

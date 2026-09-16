/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hub professionnel personnel (réalisations, compétences, réseau), épuré de sa logique d'état et d'effets.
 * @created 2026-06-14
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useRouter } from "next/navigation"
import { Eye, Users, Images, Globe, Lock, Briefcase, Tag, Network, X } from "lucide-react"
import { Preloader } from "@/components/Preloader"
import { RealisationsSection } from "./realisations-section"
import { CompetencesSection } from "./competences-section"
import { FollowedProfilesContent } from "./followed-profiles-content"
import { CommunautesSection } from "./communautes-section"
import { usePortefeuille, TabId } from "@/hooks/use-portefeuille"
import { PersonalHero } from "@/components/dashboard-user-content/personal-hero"
import { InlineActivityFeed } from "@/components/dashboard-user-content/inline-activity-feed"

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "realisations", label: "Réalisations", icon: Briefcase },
  { id: "competences",  label: "Compétences",  icon: Tag },
  { id: "reseau",       label: "Réseau",        icon: Network },
  { id: "communautes",  label: "Communautés",   icon: Users },
]

export function PortefeuilleContent() {
  const router = useRouter()
  const { activeTab, setActiveTab, stats, loading, error, impact } = usePortefeuille()

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-card border border-red-200 dark:border-red-900/40 rounded-3xl p-8 text-center max-w-sm w-full shadow-lg">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-black text-foreground mb-2">Impossible de charger</h2>
          <p className="text-sm text-muted-foreground mb-6">Vérifiez votre connexion et réessayez.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full h-11 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors active:scale-[0.98]"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (loading || !stats) {
    return <Preloader text="Chargement de votre portefeuille" subtext="Un instant…" minHeight="min-h-[60vh]" />
  }

  const STAT_CARDS = [
    {
      label:    "Vues du profil",
      sublabel: "Au total",
      value:    impact.totalViews,
      icon:     Eye,
      color:    "text-[#013ff4]",
      bg:       "bg-[#013ff4]/5",
      border:   "border-[#013ff4]/15",
      cta:      false,
    },
    {
      label:    "Abonnés",
      sublabel: "Followers",
      value:    impact.totalFollowers,
      icon:     Users,
      color:    "text-[#03b3f8]",
      bg:       "bg-[#03b3f8]/10",
      border:   "border-[#03b3f8]/20",
      cta:      false,
    },
    {
      label:    "Réalisations",
      sublabel: "Publiées sur votre profil",
      value:    stats.approvedItems,
      icon:     Images,
      color:    "text-emerald-600",
      bg:       "bg-emerald-50 dark:bg-emerald-950/40",
      border:   "border-emerald-100 dark:border-emerald-900/40",
      cta:      false,
    },
    {
      label:    stats.isPublished ? "Profil visible" : "Profil masqué",
      sublabel: stats.isPublished ? "Vous êtes dans l'annuaire" : "Activez dans Paramètres",
      value:    null as number | null,
      icon:     stats.isPublished ? Globe : Lock,
      color:    stats.isPublished ? "text-emerald-600" : "text-muted-foreground",
      bg:       stats.isPublished ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-muted",
      border:   stats.isPublished ? "border-emerald-100 dark:border-emerald-900/40" : "border-border",
      cta:      true,
    },
  ]

  const activeContent: Record<TabId, React.ReactNode> = {
    realisations: <RealisationsSection userId={stats.userId} profileId={stats.profileId} />,
    competences:  <CompetencesSection  profileId={stats.profileId} />,
    reseau:       <FollowedProfilesContent />,
    communautes:  <CommunautesSection />,
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Mon Portefeuille</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gérez vos réalisations, compétences et votre réseau professionnel</p>
        </div>

        {/* ── Cockpit personnel (stats + activité récente) ─────────────
            Déménagé du Hub le 16/09 : complétude/stats de profil et
            activité récente (notifications) vivent ici désormais, pas sur
            le tableau de bord. Desktop uniquement (≥ lg), comme dans le Hub
            d'origine — comportement mobile inchangé par ce déplacement. */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8">
          <div className="lg:col-span-7">
            <PersonalHero />
          </div>
          <div className="lg:col-span-5">
            <InlineActivityFeed />
          </div>
        </div>

        {/* ── Hero Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                onClick={card.cta ? () => router.push("/parametres") : undefined}
                className={`bg-card border ${card.border} rounded-2xl p-4 sm:p-5 ${
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

                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                  {card.value !== null ? card.label : card.sublabel}
                </p>
              </div>
            )
          })}
        </div>

        {/* ── Navigation + contenu : rail vertical sur desktop ───────── */}
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:items-start">

          {/* Rail vertical — desktop */}
          <nav className="hidden lg:flex flex-col gap-2 bg-card border border-border rounded-2xl p-2 sticky top-24 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeTab === id
                    ? "bg-slate-900 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${activeTab === id ? "text-[#03b3f8]" : "text-slate-400"}`} />
                {label}
              </button>
            ))}
          </nav>

          {/* Colonne contenu */}
          <div className="min-w-0 space-y-5">

            {/* Tab navigation — mobile / tablette */}
            <div className="overflow-x-auto scrollbar-hide lg:hidden">
              <div className="flex gap-2 min-w-max">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border transition-all ${
                      activeTab === id
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section title */}
            {activeTab !== "reseau" && (
              <div className="hidden lg:block">
                <h2 className="text-lg font-black text-foreground">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h2>
              </div>
            )}

            {/* Tab content */}
            {activeContent[activeTab]}
          </div>
        </div>

      </div>
    </div>
  )
}

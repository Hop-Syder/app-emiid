/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Paramètres — barre latérale sur desktop, navigation à deux
 *              écrans sur mobile.
 *
 *              Refonte du 08/10 :
 *              - une seule source pour la liste des onglets (TAB_IDS / resolveTab
 *                dans use-settings) au lieu de trois copies divergentes ;
 *              - une seule barre d'enregistrement, réservée aux onglets de profil
 *                (Profil, Réseaux, Adresse & services). Les préférences et la
 *                sécurité s'enregistrent d'elles-mêmes ;
 *              - le bouton « Enregistrer » mobile n'apparaît que là où il sert ;
 *              - la carte d'identité du compte est un composant partagé.
 * @created 2026-06-22
 * @updated 2026-10-08
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import { User, Shield, Settings, Star, LogOut, X, Share2, MapPin, BadgeCheck, ChevronRight, ChevronLeft } from "lucide-react"
import { Preloader } from "@/components/Preloader"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ProfileSection } from "./profile-section"
import { SocialLinksSection } from "./social-links-section"
import { HoursPricingSection } from "./hours-pricing-section"
import { VerificationSection } from "./verification-section"
import { SecuritySection } from "./security-section"
import { NotificationsSection } from "./notifications-section"
import { PreferencesSection } from "./preferences-section"
import { PlanSection } from "./plan-section"
import { BoostSection } from "./boost-section"
import { StickySaveBar } from "./settings-primitives"
import { useSettings, resolveTab, PROFILE_FORM_TABS, TabId, UserProfileData } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"

interface TabConfig {
  label: string
  icon: React.ElementType
  desc: string
  color: string
  bg: string
}

/** Présentation des onglets — l'ordre d'affichage suit celui de TAB_IDS. */
const TABS: Record<TabId, TabConfig> = {
  profil:       { label: "Profil",             icon: User,       desc: "Identité, présentation, métier et coordonnées", color: "text-[#013ff4]",   bg: "bg-[#013ff4]/10" },
  reseaux:      { label: "Réseaux",            icon: Share2,     desc: "Liens sociaux et contacts publics",             color: "text-[#03b3f8]",   bg: "bg-[#03b3f8]/10" },
  horaires:     { label: "Adresse & services", icon: MapPin,     desc: "Localisation, horaires et prestations",         color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/40" },
  verification: { label: "Vérification",       icon: BadgeCheck, desc: "Badge vérifié et pièces justificatives",        color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  securite:     { label: "Sécurité",           icon: Shield,     desc: "Double authentification, PIN et compte",        color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/40" },
  preferences:  { label: "Préférences",        icon: Settings,   desc: "Thème, visibilité et notifications",                color: "text-foreground",  bg: "bg-muted" },
  plan:         { label: "Abonnement",         icon: Star,       desc: "Offre EmiID Pro et mise en avant",              color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40" },
}

const TAB_ORDER = Object.keys(TABS) as TabId[]

/** Avatar, nom, email et badges du compte — partagé par le mobile et le desktop. */
function AccountIdentity({ profile, compact = false }: { profile: UserProfileData; compact?: boolean }) {
  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Mon compte"
  const size = compact ? 48 : 56
  const badge = compact ? "text-[9px] px-2" : "text-[10px] px-2.5"

  return (
    <div className="flex items-center gap-3.5 min-w-0">
      <div className="relative shrink-0">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={displayName}
            width={size}
            height={size}
            className="rounded-full object-cover ring-2 ring-primary/20 shadow-2xs"
            style={{ width: size, height: size }}
          />
        ) : (
          <div className="rounded-full bg-muted ring-2 ring-border flex items-center justify-center" style={{ width: size, height: size }}>
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        {profile.is_verified && (
          <span className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5 border-2 border-background">
            <Shield className="h-2.5 w-2.5 text-white" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("font-extrabold text-foreground truncate leading-tight", compact ? "text-sm" : "text-base")}>{displayName}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.email}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {profile.is_premium && (
            <span className={cn("inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider py-0.5 rounded-full border border-amber-500/20", badge)}>
              <Star className="h-2.5 w-2.5 fill-current" /> Premium
            </span>
          )}
          {profile.is_verified && (
            <span className={cn("inline-flex items-center gap-1 bg-primary/10 text-primary font-black uppercase tracking-wider py-0.5 rounded-full border border-primary/20", badge)}>
              <BadgeCheck className="h-2.5 w-2.5" /> Vérifié
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ParametresContent() {
  const s = useSettings()

  // Navigation mobile à deux écrans : null = liste des rubriques, sinon la rubrique ouverte.
  const [mobileTab, setMobileTab] = useState<TabId | null>(() =>
    typeof window === "undefined" ? null : resolveTab(new URLSearchParams(window.location.search).get("tab")),
  )
  const [direction, setDirection] = useState<1 | -1>(1)

  /** Ouvre un onglet, sur mobile comme sur desktop. */
  const openTab = (tab: TabId) => {
    setDirection(1)
    s.setActiveTab(tab)
    setMobileTab(tab)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  const closeMobileTab = () => {
    setDirection(-1)
    setMobileTab(null)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  if (s.loadingStatus === "loading") {
    return <Preloader text="Chargement de vos paramètres" subtext="Un instant..." minHeight="min-h-[60vh]" />
  }

  if (s.loadingStatus === "error") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-card border border-rose-200 dark:border-rose-900/50 rounded-2xl p-8 text-center max-w-sm w-full shadow-lg">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X className="h-7 w-7 text-rose-500" />
          </div>
          <h2 className="text-lg font-black text-foreground mb-2">Impossible de charger</h2>
          <p className="text-sm text-muted-foreground mb-6">Vérifiez votre connexion et réessayez.</p>
          <button
            onClick={() => void s.loadUserProfile()}
            className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const sectionFor = (tab: TabId): React.ReactNode => {
    switch (tab) {
      case "profil":
        return <ProfileSection profile={s.profile} setProfile={s.setProfile} onOpenTab={openTab} />
      case "reseaux":
        return <SocialLinksSection profile={s.profile} setProfile={s.setProfile} />
      case "horaires":
        return <HoursPricingSection profile={s.profile} setProfile={s.setProfile} />
      case "verification":
        return <VerificationSection profile={s.profile} />
      case "securite":
        return <SecuritySection profile={s.profile} setProfile={s.setProfile} />
      case "preferences":
        return (
          <div className="space-y-6">
            <PreferencesSection settings={s.preferences} onChange={(p) => void s.updatePreferences(p)} />
            <NotificationsSection settings={s.notificationSettings} onChange={(p) => void s.updateNotifications(p)} />
          </div>
        )
      case "plan":
        return (
          <div className="space-y-6">
            <PlanSection profile={s.profile} />
            <BoostSection />
          </div>
        )
    }
  }

  /** La barre d'enregistrement ne concerne que le brouillon de profil. */
  const saveBar = (tab: TabId) =>
    PROFILE_FORM_TABS.includes(tab) && (
      <StickySaveBar
        saving={s.saving}
        modifiedCount={s.modifiedCount}
        handleSave={() => void s.saveProfile()}
        handleCancel={s.discardProfile}
      />
    )

  const unsavedLabel = `${s.modifiedCount} modification${s.modifiedCount > 1 ? "s" : ""} non enregistrée${s.modifiedCount > 1 ? "s" : ""}`

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* ── En-tête ───────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Paramètres</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Gérez votre profil public, vos coordonnées, votre sécurité et vos préférences.
            </p>
          </div>
          {s.isDirty && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs font-bold shrink-0 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {unsavedLabel}
            </div>
          )}
        </div>

        {/* ── Mobile (< lg) : deux écrans ─────────────────────────────── */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {mobileTab === null ? (
              <motion.div
                key="mobile-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6 pb-8"
              >
                <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <AccountIdentity profile={s.profile} />
                </div>

                <div className="bg-card border border-border/70 rounded-2xl overflow-hidden divide-y divide-border/60 shadow-xs">
                  {TAB_ORDER.map((id) => {
                    const { label, icon: Icon, desc, color, bg } = TABS[id]
                    return (
                      <button
                        key={id}
                        onClick={() => openTab(id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/60 active:bg-muted/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                            <Icon className={cn("w-5 h-5", color)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground leading-tight">{label}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground/60 shrink-0" />
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => void s.handleLogout()}
                  className="w-full h-12 rounded-xl bg-card border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Se déconnecter
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`mobile-tab-${mobileTab}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 pb-8"
              >
                <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/80 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 flex items-center justify-between gap-3">
                  <button
                    onClick={closeMobileTab}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-primary -ml-1" />
                    Retour
                  </button>
                  <div className="flex flex-col items-center min-w-0 flex-1 text-center">
                    <h2 className="text-sm sm:text-base font-extrabold text-foreground truncate">{TABS[mobileTab].label}</h2>
                    {s.isDirty && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 leading-none mt-0.5">{unsavedLabel}</span>
                    )}
                  </div>
                  {/* N'existe que sur les onglets de profil : ailleurs tout s'enregistre seul. */}
                  {PROFILE_FORM_TABS.includes(mobileTab) ? (
                    <button
                      type="button"
                      onClick={() => void s.saveProfile()}
                      disabled={!s.isDirty || s.saving}
                      className="h-8 px-4 rounded-xl bg-[#0150fd] hover:bg-[#003ec7] text-white font-bold text-xs shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {s.saving ? "…" : "Enregistrer"}
                    </button>
                  ) : (
                    <span className="w-16 shrink-0" aria-hidden />
                  )}
                </div>

                <div className="pt-2 space-y-6">
                  {sectionFor(mobileTab)}
                  {saveBar(mobileTab)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Desktop (≥ lg) : barre latérale + contenu ──────────────────── */}
        <div className="hidden lg:grid lg:grid-cols-[260px_1fr] lg:gap-10 lg:items-start">
          <aside className="sticky top-24 space-y-6">
            <div className="px-2 py-1">
              <AccountIdentity profile={s.profile} compact />
            </div>

            <nav className="space-y-1">
              {TAB_ORDER.map((id) => {
                const { label, icon: Icon } = TABS[id]
                const isActive = s.activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => s.setActiveTab(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary font-bold dark:bg-primary/15"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    {label}
                  </button>
                )
              })}
            </nav>

            <div className="pt-2 border-t border-border/60">
              <button
                onClick={() => void s.handleLogout()}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-rose-600 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 text-left cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Se déconnecter
              </button>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6">
              <h2 className="text-xl font-black text-foreground tracking-tight">{TABS[s.activeTab].label}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{TABS[s.activeTab].desc}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={s.activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 space-y-6"
              >
                {sectionFor(s.activeTab)}
                {saveBar(s.activeTab)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

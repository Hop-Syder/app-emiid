/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Paramètres — Navigation mobile 2 écrans (Liste ⇆ Rubrique) & Sidebar Desktop.
 * @created 2026-06-22
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import { User, Shield, Settings, Star, LogOut, X, Share2, Clock, BadgeCheck, ChevronRight, ChevronLeft } from "lucide-react"
import { Preloader } from "@/components/Preloader"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ProfileSection } from "./profile-section"
import { BioSection } from "./bio-section"
import { SocialLinksSection } from "./social-links-section"
import { HoursPricingSection } from "./hours-pricing-section"
import { VerificationSection } from "./verification-section"
import { SecuritySection } from "./security-section"
import { NotificationsSection } from "./notifications-section"
import { PreferencesSection } from "./preferences-section"
import { PlanSection } from "./plan-section"
import { BoostSection } from "./boost-section"
import { useSettings, TabId } from "@/hooks/use-settings"

interface TabConfig {
  id: TabId
  label: string
  icon: React.ElementType
  desc: string
  color: string
  bg: string
}

const TABS: TabConfig[] = [
  { id: "profil",       label: "Profil",              icon: User,        desc: "Identité, bio, slogan et expérience",              color: "text-[#013ff4]", bg: "bg-[#013ff4]/10" },
  { id: "reseaux",      label: "Réseaux",             icon: Share2,      desc: "Liens sociaux et contacts publics",                color: "text-[#03b3f8]", bg: "bg-[#03b3f8]/10" },
  { id: "horaires",     label: "Horaires & Services", icon: Clock,       desc: "Adresse, horaires et prestations",                 color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "verification", label: "Vérification",        icon: BadgeCheck,  desc: "Badge vérifié et pièces justificatives",           color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "securite",     label: "Sécurité",            icon: Shield,      desc: "Accès, PIN et authentification",                  color: "text-violet-600", bg: "bg-violet-50" },
  { id: "preferences",  label: "Préférences",         icon: Settings,    desc: "Langue, thème, confidentialité et notifications", color: "text-foreground", bg: "bg-muted" },
  { id: "plan",         label: "Abonnement",          icon: Star,        desc: "Offre EmiID Premium et mise en avant",             color: "text-amber-600", bg: "bg-amber-50" },
]

export function ParametresContent() {
  const {
    activeTab,
    setActiveTab,
    loadingStatus,
    saving,
    notificationSettings,
    setNotificationSettings,
    preferences,
    setPreferences,
    securitySettings,
    setSecuritySettings,
    profile,
    setProfile,
    handleSave,
    handleCancel,
    saveSettings,
    handleLogout,
  } = useSettings()

  // Navigation mobile à deux écrans : null = Écran 1 (Liste), TabId = Écran 2 (Rubrique)
  const [mobileSelectedTab, setMobileSelectedTab] = useState<TabId | null>(() => {
    if (typeof window === "undefined") return null
    const param = new URLSearchParams(window.location.search).get("tab")
    const known: TabId[] = ["profil", "reseaux", "horaires", "verification", "securite", "preferences", "plan"]
    if (param && (known as string[]).includes(param)) return param as TabId
    return null
  })
  const [direction, setDirection] = useState<1 | -1>(1)

  const openMobileTab = (tabId: TabId) => {
    setDirection(1)
    setActiveTab(tabId)
    setMobileSelectedTab(tabId)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" })
  }

  const closeMobileTab = () => {
    setDirection(-1)
    setMobileSelectedTab(null)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" })
  }

  if (loadingStatus === "loading") {
    return <Preloader text="Chargement de vos paramètres" subtext="Un instant..." minHeight="min-h-[60vh]" />
  }

  if (loadingStatus === "error") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-card border border-red-100 rounded-2xl p-8 text-center max-w-sm w-full shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
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

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Mon Compte"

  const activeSection: Record<TabId, React.ReactNode> = {
    profil: (
      <div className="space-y-4">
        <ProfileSection profile={profile} setProfile={setProfile} saving={saving} handleSave={handleSave} handleCancel={handleCancel} hideActions />
        <BioSection profile={profile} setProfile={setProfile} saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
      </div>
    ),
    reseaux:      <SocialLinksSection profile={profile} setProfile={setProfile} saving={saving} handleSave={handleSave} handleCancel={handleCancel} />,
    horaires:     <HoursPricingSection profile={profile} setProfile={setProfile} saving={saving} handleSave={handleSave} handleCancel={handleCancel} />,
    verification: <VerificationSection profile={profile} />,
    securite:     <SecuritySection profile={profile} setProfile={setProfile} securitySettings={securitySettings} setSecuritySettings={setSecuritySettings} saveSettings={saveSettings} />,
    preferences: (
      <div className="space-y-4">
        <PreferencesSection settings={preferences} setSettings={setPreferences} saving={saving} handleSave={() => {}} handleCancel={handleCancel} hideActions />
        <NotificationsSection
          settings={notificationSettings}
          setSettings={setNotificationSettings}
          saving={saving}
          handleSave={() => saveSettings(
            { app_preferences: preferences, notification_preferences: notificationSettings },
            "Préférences mises à jour",
          )}
          handleCancel={handleCancel}
        />
      </div>
    ),
    plan: (
      <div className="space-y-4">
        <PlanSection profile={profile} />
        <BoostSection />
      </div>
    ),
  }

  const currentMobileConfig = TABS.find((t) => t.id === mobileSelectedTab)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/20 via-slate-50 to-slate-50 dark:bg-none dark:bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 lg:py-10">

        {/* ═════════════════════════════════════════════════════════════════════
            AFFICHAGE MOBILE (< lg) : NAVIGATION 2 ÉCRANS
            ═════════════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {mobileSelectedTab === null ? (
              /* ── ÉCRAN 1 MOBILE : LA LISTE DES RUBRIQUES ── */
              <motion.div
                key="mobile-list"
                custom={direction}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5 pb-8"
              >
                {/* En-tête */}
                <div>
                  <h1 className="text-2xl font-black text-foreground tracking-tight">Paramètres</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Gérez votre compte et vos préférences</p>
                </div>

                {/* Carte d'identité du compte */}
                <div className="bg-card border border-border/70 rounded-3xl p-4.5 sm:p-5 shadow-sm flex items-center gap-4">
                  <div className="relative shrink-0">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={displayName}
                        width={60}
                        height={60}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-muted ring-2 ring-slate-100 shadow-sm flex items-center justify-center">
                        <User className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    {profile.is_verified && (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-[#013ff4] rounded-full p-1 border-2 border-white shadow">
                        <Shield className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-extrabold text-foreground truncate leading-snug">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.email}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {profile.is_premium && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Premium
                        </span>
                      )}
                      {profile.is_verified && (
                        <span className="inline-flex items-center gap-1 bg-[#013ff4]/10 text-[#013ff4] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#013ff4]/20">
                          <BadgeCheck className="h-2.5 w-2.5" />
                          Vérifié
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Liste des rubriques tapables */}
                <div className="bg-card border border-border/70 rounded-3xl overflow-hidden divide-y divide-border shadow-sm">
                  {TABS.map(({ id, label, icon: Icon, desc, color, bg }) => (
                    <button
                      key={id}
                      onClick={() => openMobileTab(id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/80 active:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground leading-tight">{label}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-2xl bg-card border border-rose-200/80 text-rose-600 font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-rose-50 active:scale-[0.98] transition-all shadow-sm"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Se déconnecter
                </button>
              </motion.div>
            ) : (
              /* ── ÉCRAN 2 MOBILE : LA RUBRIQUE SÉLECTIONNÉE ── */
              <motion.div
                key={`mobile-tab-${mobileSelectedTab}`}
                custom={direction}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 pb-8"
              >
                {/* Barre de retour sticky en haut */}
                <div className="sticky top-0 z-30 bg-muted/95 backdrop-blur-md border-b border-border/80 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
                  <button
                    onClick={closeMobileTab}
                    className="inline-flex items-center gap-1 text-sm font-bold text-foreground hover:text-foreground active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#013ff4] -ml-1" />
                    <span>Retour</span>
                  </button>

                  <div className="flex items-center gap-2 min-w-0">
                    {currentMobileConfig && (
                      <span className={`w-2 h-2 rounded-full ${currentMobileConfig.color.replace("text-", "bg-")}`} />
                    )}
                    <h2 className="text-sm sm:text-base font-extrabold text-foreground truncate">
                      {currentMobileConfig?.label}
                    </h2>
                  </div>

                  <div className="w-12 shrink-0" aria-hidden />
                </div>

                {/* Contenu de la rubrique */}
                <div className="pt-1">
                  {activeSection[mobileSelectedTab]}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            AFFICHAGE DESKTOP (≥ lg) : SIDEBAR FIXE + CONTENU
            ═════════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-[230px_1fr] lg:gap-8 lg:items-start">

          {/* Desktop sidebar */}
          <aside className="flex flex-col gap-3 sticky top-24">

            {/* User identity card */}
            <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl p-5 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="relative inline-flex mb-3">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted ring-2 ring-slate-100 shadow-sm flex items-center justify-center">
                    <User className="h-7 w-7 text-slate-400" />
                  </div>
                )}
                {profile.is_verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-1 border-2 border-white shadow">
                    <Shield className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-foreground truncate leading-tight">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5 px-2">{profile.email}</p>
              {profile.is_premium && (
                <span className="mt-3 inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-200">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Premium
                </span>
              )}
            </div>

            {/* Navigation */}
            <nav className="bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all text-left ${
                    activeTab === id
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeTab === id && (
                    <motion.div
                      layoutId="active-tab-desktop"
                      className="absolute inset-0 bg-primary/5 border-l-[3px] border-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`relative z-10 h-4 w-4 shrink-0 transition-transform ${activeTab === id ? "text-primary scale-110" : "text-slate-400"}`} />
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 bg-card border border-border rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Se déconnecter
            </button>
          </aside>

          {/* Main content */}
          <div className="min-w-0">
            {/* Desktop section title */}
            <div className="mb-6">
              <h1 className="text-xl font-black text-foreground tracking-tight">
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {TABS.find(t => t.id === activeTab)?.desc}
              </p>
            </div>

            {/* Section content with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                {activeSection[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}

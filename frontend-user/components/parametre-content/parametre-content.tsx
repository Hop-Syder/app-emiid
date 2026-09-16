/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page Paramètres — Navigation moderne et épurée (Style SaaS Stripe/Linear/Supabase), Sidebar fluide sans encadrement lourd & navigation mobile 2 écrans.
 * @created 2026-06-22
 * @updated 2026-09-16
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
import { SocialLinksSection } from "./social-links-section"
import { HoursPricingSection } from "./hours-pricing-section"
import { VerificationSection } from "./verification-section"
import { SecuritySection } from "./security-section"
import { NotificationsSection } from "./notifications-section"
import { PreferencesSection } from "./preferences-section"
import { PlanSection } from "./plan-section"
import { BoostSection } from "./boost-section"
import { useSettings, TabId } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"

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
  { id: "horaires",     label: "Horaires & Services", icon: Clock,       desc: "Adresse, horaires et prestations",                 color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
  { id: "verification", label: "Vérification",        icon: BadgeCheck,  desc: "Badge vérifié et pièces justificatives",           color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { id: "securite",     label: "Sécurité",            icon: Shield,      desc: "Accès, PIN et authentification",                  color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/40" },
  { id: "preferences",  label: "Préférences",         icon: Settings,    desc: "Langue, thème, confidentialité et notifications", color: "text-foreground", bg: "bg-muted" },
  { id: "plan",         label: "Abonnement",          icon: Star,        desc: "Offre EmiID Premium et mise en avant",             color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
]

/**
 * Sections rendues avec `hideActions` : leur bouton « Enregistrer » n'est pas
 * affiché, la sauvegarde ne peut donc jamais être déclenchée depuis elles.
 */
const noActionNeeded = () => undefined

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
    modifiedCount,
    isDirty,
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
        <div className="bg-card border border-rose-200 dark:border-rose-900/50 rounded-2xl p-8 text-center max-w-sm w-full shadow-lg">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X className="h-7 w-7 text-rose-500" />
          </div>
          <h2 className="text-lg font-black text-foreground mb-2">Impossible de charger</h2>
          <p className="text-sm text-muted-foreground mb-6">Vérifiez votre connexion et réessayez.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-98 shadow-sm cursor-pointer"
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
      <ProfileSection
        profile={profile}
        setProfile={setProfile}
        saving={saving}
        handleSave={handleSave}
        handleCancel={handleCancel}
        modifiedCount={modifiedCount}
      />
    ),
    reseaux:      <SocialLinksSection profile={profile} setProfile={setProfile} saving={saving} handleSave={handleSave} handleCancel={handleCancel} />,
    horaires:     <HoursPricingSection profile={profile} setProfile={setProfile} saving={saving} handleSave={handleSave} handleCancel={handleCancel} />,
    verification: <VerificationSection profile={profile} />,
    securite:     <SecuritySection profile={profile} setProfile={setProfile} securitySettings={securitySettings} setSecuritySettings={setSecuritySettings} saveSettings={saveSettings} />,
    preferences: (
      <div className="space-y-6">
        <PreferencesSection settings={preferences} setSettings={setPreferences} saving={saving} handleSave={noActionNeeded} handleCancel={handleCancel} hideActions />
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
      <div className="space-y-6">
        <PlanSection profile={profile} />
        <BoostSection />
      </div>
    ),
  }

  const currentMobileConfig = TABS.find((t) => t.id === mobileSelectedTab)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* ═════════════════════════════════════════════════════════════════════
            EN-TÊTE PRINCIPAL DE LA PAGE
            ═════════════════════════════════════════════════════════════════════ */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Paramètres</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Gérez votre profil public, vos coordonnées, votre sécurité et vos préférences.
              </p>
            </div>

            {/* Badge de modifications non enregistrées */}
            {isDirty && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs font-bold shrink-0 self-start sm:self-auto animate-in fade-in duration-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  {modifiedCount} modification{modifiedCount > 1 ? "s" : ""} non enregistrée{modifiedCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6 pb-8"
              >
                {/* Carte d'identité du compte (élégante et adoucie) */}
                <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
                  <div className="relative shrink-0">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={displayName}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-muted ring-2 ring-border shadow-xs flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    {profile.is_verified && (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-1 border-2 border-background shadow-xs">
                        <Shield className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-extrabold text-foreground truncate leading-snug">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.email}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {profile.is_premium && (
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Premium
                        </span>
                      )}
                      {profile.is_verified && (
                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-primary/20">
                          <BadgeCheck className="h-2.5 w-2.5" />
                          Vérifié
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Liste des rubriques tapables */}
                <div className="bg-card border border-border/70 rounded-2xl overflow-hidden divide-y divide-border/60 shadow-xs">
                  {TABS.map(({ id, label, icon: Icon, desc, color, bg }) => (
                    <button
                      key={id}
                      onClick={() => openMobileTab(id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/60 active:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs", bg)}>
                          <Icon className={cn("w-5 h-5", color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground leading-tight">{label}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/60 shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-xl bg-card border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-98 transition-all shadow-2xs cursor-pointer"
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 pb-8"
              >
                {/* Barre de retour sticky en haut */}
                <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/80 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
                  <button
                    onClick={closeMobileTab}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-primary -ml-1" />
                    <span>Retour</span>
                  </button>

                  <div className="flex flex-col items-center min-w-0 flex-1 text-center">
                    <h2 className="text-sm sm:text-base font-extrabold text-foreground truncate">
                      {currentMobileConfig?.label}
                    </h2>
                    {isDirty && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 leading-none mt-0.5">
                        {modifiedCount} non enregistrée{modifiedCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Bouton rapide Enregistrer en haut à droite */}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || saving}
                    className="h-8 px-4 rounded-xl bg-[#0150fd] hover:bg-[#003ec7] text-white font-bold text-xs shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving ? "..." : "Enregistrer"}
                  </button>
                </div>

                {/* Contenu de la rubrique */}
                <div className="pt-2">
                  {activeSection[mobileSelectedTab]}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            AFFICHAGE DESKTOP (≥ lg) : SIDEBAR NON ENCADRÉE + CONTENU
            ═════════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-[260px_1fr] lg:gap-10 lg:items-start">

          {/* Desktop sidebar — fluide, aérée, sans boîte blanche d'arrière-plan */}
          <aside className="sticky top-24 space-y-6">

            {/* Mini identité utilisateur sans cadre écrasant */}
            <div className="flex items-center gap-3.5 px-2 py-1">
              <div className="relative shrink-0">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 shadow-2xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted ring-2 ring-border shadow-2xs flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                {profile.is_verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5 border-2 border-background shadow-xs">
                    <Shield className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-foreground truncate leading-tight">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.email}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  {profile.is_premium && (
                    <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Star className="h-2 w-2 fill-current" />
                      Premium
                    </span>
                  )}
                  {profile.is_verified && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/20">
                      <BadgeCheck className="h-2 w-2" />
                      Vérifié
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu de navigation flottant (sans carte blanche derrière !) */}
            <nav className="space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary font-bold dark:bg-primary/15 shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0 transition-transform", isActive ? "text-primary scale-110" : "text-muted-foreground")} />
                    <span>{label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Déconnexion discrète et élégante */}
            <div className="pt-2 border-t border-border/60">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-rose-600 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition-all text-left cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </aside>

          {/* Volet de contenu principal */}
          <div className="min-w-0">
            {/* Titre & description de la rubrique active */}
            <div className="mb-6">
              <h2 className="text-xl font-black text-foreground tracking-tight">
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {activeTab === "profil"
                  ? "Gérez votre identité publique, votre localisation et vos coordonnées visibles sur la plateforme."
                  : TABS.find(t => t.id === activeTab)?.desc}
              </p>
            </div>

            {/* Contenu de la section avec transition fluide */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 space-y-6"
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

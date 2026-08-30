/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Coquille de la page Paramètres.
 *
 *              Dix onglets ramenés à sept. « À propos » rejoint « Profil » —
 *              les deux éditaient le même champ bio, et l'on pouvait donc
 *              écrire deux valeurs différentes selon l'onglet ouvert.
 *              « Notifications » rejoint « Préférences », « Boost » rejoint
 *              « Abonnement » : dans les deux cas, deux onglets pour un même
 *              sujet.
 *
 *              Navigation façon « Réglages » de téléphone : sur mobile, un
 *              premier écran présente la LISTE des rubriques ; taper une
 *              rubrique ouvre son écran dédié, avec un bouton retour. Sur
 *              desktop, la vue deux colonnes (liste + contenu) est conservée.
 *
 *              Les anciens identifiants d'onglet restent acceptés en URL
 *              (voir use-settings) : aucun lien existant ne casse.
 * @created 2026-06-22
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect } from "react"
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

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "profil",       label: "Profil",              icon: User,      desc: "Identité, bio, slogan et expérience" },
  { id: "reseaux",      label: "Réseaux",             icon: Share2,    desc: "Liens sociaux et contacts publics" },
  { id: "horaires",     label: "Horaires & Services", icon: Clock,     desc: "Adresse, horaires et prestations" },
  { id: "verification", label: "Vérification",        icon: BadgeCheck, desc: "Badge vérifié et pièces justificatives" },
  { id: "securite",     label: "Sécurité",            icon: Shield,    desc: "Accès, PIN et authentification" },
  { id: "preferences",  label: "Préférences",         icon: Settings,  desc: "Langue, thème, confidentialité et notifications" },
  { id: "plan",         label: "Abonnement",          icon: Star,      desc: "Offre EmiID Premium et mise en avant" },
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

  // Navigation « Réglages » téléphone : sur mobile, `mobileDetail` distingue
  // l'écran LISTE des rubriques (false) de l'écran d'une rubrique (true).
  // Sur desktop, cet état est ignoré : les deux colonnes s'affichent toujours.
  const [mobileDetail, setMobileDetail] = useState(false)

  // Deep-link ?tab= (liens internes, retour de paiement…) : ouvrir directement
  // l'écran de la rubrique sur mobile plutôt que la liste.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (new URLSearchParams(window.location.search).get("tab")) setMobileDetail(true)
  }, [])

  /** Ouvre l'écran d'une rubrique sur mobile (et remonte en haut de page). */
  const openTab = (id: TabId) => {
    setActiveTab(id)
    setMobileDetail(true)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 })
  }

  if (loadingStatus === "loading") {
    return <Preloader text="Chargement de vos paramètres" subtext="Un instant..." minHeight="min-h-[60vh]" />
  }

  if (loadingStatus === "error") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center max-w-sm w-full shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">Impossible de charger</h2>
          <p className="text-sm text-slate-500 mb-6">Vérifiez votre connexion et réessayez.</p>
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
  const currentTab = TABS.find(t => t.id === activeTab)

  const activeSection: Record<TabId, React.ReactNode> = {
    // Identité puis bio : une seule barre d'enregistrement en bas, car les deux
    // écrivent dans le même profil.
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
    // Réglages de l'application et notifications : la barre finale enregistre
    // les deux jeux de préférences en une fois.
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
    // Abonnement et mise en avant : deux volets d'un même sujet, aucun n'ayant
    // de formulaire à enregistrer.
    plan: (
      <div className="space-y-4">
        <PlanSection profile={profile} />
        <BoostSection />
      </div>
    ),
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/20 via-slate-50 to-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10">

        {/* ══════════════════════════════════════════════════════════════════
            MOBILE — navigation façon « Réglages » : liste ⇆ écran de rubrique
            ══════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait" initial={false}>
            {!mobileDetail ? (
              // ── Écran 1 : LISTE des rubriques ──────────────────────────────
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* En-tête de page */}
                <div className="mb-5">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Paramètres</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Gérez votre compte et vos préférences</p>
                </div>

                {/* Carte identité (façon en-tête de compte iOS/Android) */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="relative shrink-0">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={displayName}
                        width={52}
                        height={52}
                        className="w-[52px] h-[52px] rounded-full object-cover ring-2 ring-slate-100"
                      />
                    ) : (
                      <div className="w-[52px] h-[52px] rounded-full bg-slate-100 ring-2 ring-slate-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    {profile.is_verified && (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-1 border-2 border-white shadow">
                        <Shield className="h-2.5 w-2.5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                  </div>
                  {profile.is_premium && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-amber-200 shrink-0">
                      <Star className="h-2.5 w-2.5 fill-current" />
                      Premium
                    </span>
                  )}
                </div>

                {/* Liste des rubriques — chaque rangée ouvre son écran */}
                <nav className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] divide-y divide-slate-100">
                  {TABS.map(({ id, label, icon: Icon, desc }) => (
                    <button
                      key={id}
                      onClick={() => openTab(id)}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                      <span className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-slate-900">{label}</span>
                        <span className="block text-xs text-slate-500 truncate">{desc}</span>
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
                    </button>
                  ))}
                </nav>

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Se déconnecter
                </button>
              </motion.div>
            ) : (
              // ── Écran 2 : contenu de la rubrique choisie ───────────────────
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Barre de navigation avec bouton retour */}
                <div className="flex items-center gap-2 mb-5 -mx-4 sm:-mx-6 px-2 sm:px-4 py-2 sticky top-16 z-20 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/60">
                  <button
                    onClick={() => setMobileDetail(false)}
                    aria-label="Retour aux paramètres"
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200/60 active:scale-95 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <h1 className="text-base font-black text-slate-900 tracking-tight truncate">{currentTab?.label}</h1>
                    <p className="text-[11px] text-slate-500 truncate">{currentTab?.desc}</p>
                  </div>
                </div>

                {/* Contenu de la rubrique */}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            DESKTOP — deux colonnes : liste des rubriques + contenu
            ══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-[220px_1fr] lg:gap-8 lg:items-start">

          {/* ── Barre latérale ──────────────────────────────────────────────── */}
          <aside className="flex flex-col gap-3 sticky top-24">

            {/* Carte identité */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
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
                  <div className="w-16 h-16 rounded-full bg-slate-100 ring-2 ring-slate-100 shadow-sm flex items-center justify-center">
                    <User className="h-7 w-7 text-slate-400" />
                  </div>
                )}
                {profile.is_verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-1 border-2 border-white shadow">
                    <Shield className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-slate-900 truncate leading-tight">{displayName}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5 px-2">{profile.email}</p>
              {profile.is_premium && (
                <span className="mt-3 inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-200">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Premium
                </span>
              )}
            </div>

            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all text-left ${
                    activeTab === id
                      ? "text-primary font-bold"
                      : "text-slate-600 hover:text-slate-900"
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

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Se déconnecter
            </button>
          </aside>

          {/* ── Contenu ──────────────────────────────────────────────────────── */}
          <div className="min-w-0">
            <div className="mb-6">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {currentTab?.label}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {currentTab?.desc}
              </p>
            </div>

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

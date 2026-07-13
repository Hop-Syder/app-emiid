/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Settings page shell — sidebar desktop / pill tabs mobile, épuré de sa logique d'état et d'effets.
 * @created 2026-06-22
 * @updated 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { User, Shield, Bell, Settings, Star, LogOut, X } from "lucide-react"
import { Preloader } from "@/components/Preloader"
import Image from "next/image"
import { ProfileSection } from "./profile-section"
import { SecuritySection } from "./security-section"
import { NotificationsSection } from "./notifications-section"
import { PreferencesSection } from "./preferences-section"
import { PlanSection } from "./plan-section"
import { useSettings, TabId } from "@/hooks/use-settings"

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "profil",         label: "Profil",        icon: User,     desc: "Informations personnelles et professionnelles" },
  { id: "securite",       label: "Sécurité",      icon: Shield,   desc: "Accès, PIN et authentification" },
  { id: "notifications",  label: "Notifications", icon: Bell,     desc: "Alertes et préférences de messages" },
  { id: "preferences",    label: "Préférences",   icon: Settings, desc: "Langue, thème et confidentialité" },
  { id: "plan",           label: "Abonnement",    icon: Star,     desc: "Gérez votre offre EmiID Premium" },
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

  const activeSection: Record<TabId, React.ReactNode> = {
    profil:        <ProfileSection profile={profile} setProfile={setProfile} saving={saving} handleSave={handleSave} handleCancel={handleCancel} />,
    securite:      <SecuritySection profile={profile} setProfile={setProfile} securitySettings={securitySettings} setSecuritySettings={setSecuritySettings} saveSettings={saveSettings} />,
    notifications: <NotificationsSection settings={notificationSettings} setSettings={setNotificationSettings} saving={saving} handleSave={() => saveSettings({ notification_preferences: notificationSettings }, "Notifications mises à jour")} handleCancel={handleCancel} />,
    preferences:   <PreferencesSection  settings={preferences}           setSettings={setPreferences}           saving={saving} handleSave={() => saveSettings({ app_preferences: preferences },              "Préférences mises à jour")}  handleCancel={handleCancel} />,
    plan:          <PlanSection profile={profile} />,
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10">

        {/* Mobile page header */}
        <div className="lg:hidden mb-5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Paramètres</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gérez votre compte et vos préférences</p>
        </div>

        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8 lg:items-start">

          {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-3 sticky top-24">

            {/* User identity card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center">
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
            <nav className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all text-left border-l-[3px] ${
                    activeTab === id
                      ? "border-l-primary text-primary bg-primary/5"
                      : "border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${activeTab === id ? "text-primary" : "text-slate-400"}`} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Se déconnecter
            </button>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────────── */}
          <div className="min-w-0">

            {/* Mobile horizontal tab strip */}
            <div className="lg:hidden mb-5 -mx-4 sm:-mx-6">
              <div className="overflow-x-auto scrollbar-hide px-4 sm:px-6">
                <div className="flex gap-2 pb-1" style={{ width: "max-content" }}>
                  {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                        activeTab === id
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop section title */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {TABS.find(t => t.id === activeTab)?.desc}
              </p>
            </div>

            {activeSection[activeTab]}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Settings page shell — sidebar desktop / pill tabs mobile (Premium Redesign)
 * @updated 2026-06-13
*/

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Shield, Bell, Settings, Star, LogOut, X } from "lucide-react"
import { Preloader } from "@/components/Preloader"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { getReferenceCountriesCached } from "@/lib/location-cache"
import { ProfileSection } from "./profile-section"
import { SecuritySection } from "./security-section"
import { NotificationsSection } from "./notifications-section"
import { PreferencesSection } from "./preferences-section"
import { motion, AnimatePresence } from "framer-motion"

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultNotificationSettings = { messages: true, network_activity: true, newsletter: false, push: true }
const defaultPreferences           = { language: "fr", currency: "xof", timezone: "gmt", theme: "light", public_profile: false }
const defaultSecuritySettings      = { two_factor_enabled: false }

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabId = "profil" | "securite" | "notifications" | "preferences"

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "profil",         label: "Profil",        icon: User,     desc: "Informations personnelles et professionnelles" },
  { id: "securite",       label: "Sécurité",      icon: Shield,   desc: "Accès, PIN et authentification" },
  { id: "notifications",  label: "Notifications", icon: Bell,     desc: "Alertes et préférences de messages" },
  { id: "preferences",    label: "Préférences",   icon: Settings, desc: "Langue, thème et confidentialité" },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function ParametresContent() {
  const [activeTab,             setActiveTab]             = useState<TabId>("profil")
  const [loadingStatus,         setLoadingStatus]         = useState<"loading" | "success" | "error">("loading")
  const [saving,                setSaving]                = useState(false)
  const [notificationSettings,  setNotificationSettings]  = useState(defaultNotificationSettings)
  const [preferences,           setPreferences]           = useState(defaultPreferences)
  const [securitySettings,      setSecuritySettings]      = useState(defaultSecuritySettings)
  const [profile, setProfile] = useState({
    id: "", first_name: "", last_name: "", email: "", bio: "",
    avatar_url: "", category: "Artisan", role: "", specialty: "",
    activity_domain: "", country_id: "", country_code: "", country_name: "",
    city: "", pin_enabled: false, phone: "", is_published: false,
    is_verified: false, is_premium: false,
  })

  const supabase = createClient()
  const router   = useRouter()

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadUserProfile = async () => {
    try {
      setLoadingStatus("loading")
      const [response, { data: { user: authUser } }] = await Promise.all([
        fetchWithAuth("/api/users/me"),
        supabase.auth.getUser(),
      ])

      if (response.ok) {
        const data = await response.json()
        setProfile({
          id:              data.id             || authUser?.id || "",
          first_name:      data.first_name     || authUser?.user_metadata?.first_name  || authUser?.user_metadata?.given_name  || "",
          last_name:       data.last_name      || authUser?.user_metadata?.last_name   || authUser?.user_metadata?.family_name || "",
          email:           data.email          || authUser?.email || "",
          bio:             data.bio            || "",
          avatar_url:      data.avatar_url     || authUser?.user_metadata?.avatar_url  || "",
          category:        data.category       || "Artisan",
          role:            data.role           || "",
          specialty:       data.specialty      || "",
          activity_domain: data.activity_domain|| "",
          country_id:      data.country_id     || "",
          country_code:    data.country_code   || "",
          country_name:    data.country_name   || "",
          city:            data.city           || "",
          pin_enabled:     data.pin_enabled    || false,
          phone:           data.phone          || authUser?.phone || "",
          is_published:    data.is_published   || false,
          is_verified:     data.is_verified    || false,
          is_premium:      data.is_premium     || false,
        })
        setNotificationSettings({ ...defaultNotificationSettings, ...(data.notification_preferences || {}) })
        setPreferences({
          ...defaultPreferences,
          ...(data.app_preferences || {}),
          public_profile: typeof data.app_preferences?.public_profile === "boolean"
            ? data.app_preferences.public_profile
            : !!data.is_published,
        })
        setSecuritySettings({ ...defaultSecuritySettings, ...(data.security_preferences || {}) })
        setLoadingStatus("success")
      } else if (authUser) {
        setProfile(prev => ({
          ...prev,
          first_name: authUser.user_metadata?.first_name || authUser.user_metadata?.given_name  || prev.first_name,
          last_name:  authUser.user_metadata?.last_name  || authUser.user_metadata?.family_name || prev.last_name,
          email:      authUser.email  || prev.email,
          phone:      authUser.phone  || prev.phone,
          avatar_url: authUser.user_metadata?.avatar_url || prev.avatar_url,
        }))
        setLoadingStatus("success")
      } else {
        setLoadingStatus("error")
      }
    } catch {
      toast.error("Impossible de charger votre profil")
      setLoadingStatus("error")
    }
  }

  useEffect(() => {
    const loadRefs = async () => {
      try {
        await Promise.all([
          fetchWithAuth("/api/reference/sectors"),
          fetchWithAuth("/api/reference/professions"),
          getReferenceCountriesCached(),
        ])
      } catch { /* non-blocking */ }
    }
    loadUserProfile()
    loadRefs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetchWithAuth("/api/users/me", { method: "PUT", body: JSON.stringify(profile) })
      if (res.ok) toast.success("Profil mis à jour !")
      else { const d = await res.json().catch(() => null); toast.error(d?.error || "Erreur lors de la mise à jour") }
    } catch { toast.error("Erreur réseau") }
    finally   { setSaving(false) }
  }

  const handleCancel = () => { loadUserProfile(); toast.info("Modifications annulées") }

  const saveSettings = async (
    payload: {
      notification_preferences?: typeof defaultNotificationSettings
      app_preferences?:          typeof defaultPreferences
      security_preferences?:     typeof defaultSecuritySettings
    },
    successMessage: string,
  ): Promise<boolean> => {
    setSaving(true)
    try {
      const res  = await fetchWithAuth("/api/users/settings", { method: "PUT", body: JSON.stringify(payload) })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        toast.error(d?.error || "Erreur lors de la sauvegarde")
        return false
      }
      const data = await res.json()
      if (data.notification_preferences) setNotificationSettings({ ...defaultNotificationSettings, ...data.notification_preferences })
      if (data.app_preferences) {
        setPreferences({ ...defaultPreferences, ...data.app_preferences })
        setProfile(prev => ({ ...prev, is_published: !!data.app_preferences.public_profile }))
      }
      if (data.security_preferences) setSecuritySettings({ ...defaultSecuritySettings, ...data.security_preferences })
      toast.success(successMessage)
      return true
    } catch {
      toast.error("Erreur réseau")
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      sessionStorage.removeItem("emiid_pin_verified")
      toast.success("Déconnexion réussie")
      router.push("/login")
      router.refresh()
    } catch { toast.error("Impossible de se déconnecter") }
  }

  // ── States ────────────────────────────────────────────────────────────────

  if (loadingStatus === "loading") {
    return <Preloader text="Chargement de vos paramètres" subtext="Un instant..." minHeight="min-h-[60vh]" />
  }

  if (loadingStatus === "error") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 bg-zinc-950">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 text-center max-w-sm w-full shadow-sm">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-black text-white mb-2">Impossible de charger</h2>
          <p className="text-sm text-white/60 mb-6">Vérifiez votre connexion et réessayez.</p>
          <button
            onClick={loadUserProfile}
            className="w-full h-11 bg-white text-zinc-950 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors active:scale-[0.98]"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Mon Compte"

  const activeSection: Record<TabId, React.ReactNode> = {
    profil:        <ProfileSection profile={profile} setProfile={setProfile} saving={saving} handleSave={handleSave} handleCancel={handleCancel} />,
    securite:      <SecuritySection profile={profile} setProfile={setProfile} securitySettings={securitySettings} setSecuritySettings={setSecuritySettings} saveSettings={saveSettings} />,
    notifications: <NotificationsSection settings={notificationSettings} setSettings={setNotificationSettings} saving={saving} handleSave={() => saveSettings({ notification_preferences: notificationSettings }, "Notifications mises à jour")} handleCancel={() => { loadUserProfile(); toast.info("Annulé") }} />,
    preferences:   <PreferencesSection  settings={preferences}           setSettings={setPreferences}           saving={saving} handleSave={() => saveSettings({ app_preferences: preferences },              "Préférences mises à jour")}  handleCancel={() => { loadUserProfile(); toast.info("Annulé") }} />,
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-zinc-950 text-white overflow-hidden">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
      `}</style>

      {/* Premium Background Effects */}
      <div 
        className="absolute inset-0 z-0 bg-[url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=80)] bg-cover bg-center opacity-10"
        style={{
          maskImage: "linear-gradient(180deg, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 10%, black 90%, transparent)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10">

        {/* Mobile page header */}
        <div className="lg:hidden mb-5 animate-fade-in delay-100">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md mb-4">
            <Settings className="w-4 h-4 text-white/80" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Paramètres
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Configuration</h1>
          <p className="text-sm text-white/60 mt-0.5">Gérez votre compte et vos préférences</p>
        </div>

        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8 lg:items-start animate-fade-in delay-100">

          {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-24">

            {/* User identity card - Glassmorphism */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10" />
              <div className="relative inline-flex mb-3">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 ring-2 ring-white/20 shadow-sm flex items-center justify-center">
                    <User className="h-7 w-7 text-white/40" />
                  </div>
                )}
                {profile.is_verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-indigo-500 rounded-full p-1 border-2 border-zinc-950 shadow">
                    <Shield className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-white truncate leading-tight">{displayName}</p>
              <p className="text-xs text-white/60 truncate mt-0.5 px-2">{profile.email}</p>
              {profile.is_premium && (
                <span className="mt-3 inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Premium
                </span>
              )}
            </div>

            {/* Navigation - Glassmorphism */}
            <nav className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden p-1.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                    activeTab === id
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${activeTab === id ? "text-white" : "text-white/60"}`} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Logout - Glassmorphism */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all backdrop-blur-xl"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Déconnexion
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
                          ? "bg-white text-zinc-950 border-white shadow-sm"
                          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
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
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md mb-4">
                <Settings className="w-4 h-4 text-white/80" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  Settings / {TABS.find(t => t.id === activeTab)?.label}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-lg text-white/60">
                {TABS.find(t => t.id === activeTab)?.desc}
              </p>
            </div>

            {/* Content wrapper with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
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

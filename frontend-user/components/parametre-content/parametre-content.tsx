/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Settings page shell — sidebar desktop / pill tabs mobile
 * @updated 2026-06-22
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
import Image from "next/image"
import { ProfileSection } from "./profile-section"
import { SecuritySection } from "./security-section"
import { NotificationsSection } from "./notifications-section"
import { PreferencesSection } from "./preferences-section"
import { PlanSection } from "./plan-section"

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultNotificationSettings = { messages: true, network_activity: true, newsletter: false, push: true }
const defaultPreferences           = { language: "fr", currency: "xof", timezone: "gmt", theme: "light", public_profile: false }
const defaultSecuritySettings      = { two_factor_enabled: false }

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabId = "profil" | "securite" | "notifications" | "preferences" | "plan"

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "profil",         label: "Profil",        icon: User,     desc: "Informations personnelles et professionnelles" },
  { id: "securite",       label: "Sécurité",      icon: Shield,   desc: "Accès, PIN et authentification" },
  { id: "notifications",  label: "Notifications", icon: Bell,     desc: "Alertes et préférences de messages" },
  { id: "preferences",    label: "Préférences",   icon: Settings, desc: "Langue, thème et confidentialité" },
  { id: "plan",           label: "Abonnement",    icon: Star,     desc: "Gérez votre offre EmiID Premium" },
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
    is_verified: false, is_premium: false, show_contact: true,
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
          avatar_url:      data.avatar_url     || authUser?.user_metadata?.avatar_url  || "/profil/avatar.jpg",
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
          show_contact:    data.show_contact ?? true,
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
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center max-w-sm w-full shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">Impossible de charger</h2>
          <p className="text-sm text-slate-500 mb-6">Vérifiez votre connexion et réessayez.</p>
          <button
            onClick={loadUserProfile}
            className="w-full h-11 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors active:scale-[0.98]"
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

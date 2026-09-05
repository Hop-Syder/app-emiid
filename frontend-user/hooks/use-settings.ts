/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook de gestion de l'état global et de la persistance des paramètres utilisateur.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"
import { getReferenceCountriesCached } from "@/lib/location-cache"
import { toast } from "sonner"

export type TabId =
  | "profil"
  | "reseaux"
  | "horaires"
  | "verification"
  | "securite"
  | "preferences"
  | "plan"

export interface OpeningHour {
  day: number // 0 = dimanche … 6 = samedi
  open: string // "08:00"
  close: string // "18:00"
  closed: boolean
}

export interface ServiceItem {
  title: string
  price: number | null // FCFA
  description: string
}

export interface UserProfileData {
  id: string
  first_name: string
  last_name: string
  email: string
  bio: string
  business_name: string
  avatar_url: string
  district: string | null
  /** Commune administrative choisie explicitement (Bénin). */
  commune_id: string | null
  /** Mots-clés — aplatis par l'API depuis profile_tags(tags(name)). */
  tags: string[]
  latitude: number | null
  longitude: number | null
  is_nomad: boolean
  category: string
  role: string | null
  specialty: string
  activity_domain: string
  country_id: string
  country_code: string
  country_name: string
  city: string
  pin_enabled: boolean
  phone: string
  is_published: boolean
  is_verified: boolean
  is_premium: boolean
  show_contact: boolean
  phone_verified?: boolean
  has_password?: boolean
  // ── Paramètres avancés ──
  slogan: string
  years_experience: number | null
  website: string
  facebook_url: string
  instagram_url: string
  tiktok_url: string
  linkedin_url: string
  secondary_phone: string
  public_email: string
  address: string
  opening_hours: OpeningHour[]
  services: ServiceItem[]
  gender?: "male" | "female" | "other" | string
  birth_date?: string
  department_id?: string
  department_name?: string
  commune_name?: string
  arrondissement?: string
  neighborhood?: string
  slug?: string
}

export const defaultNotificationSettings = {
  messages: true,
  network_activity: true,
  newsletter: false,
  push: true,
}

export const defaultPreferences = {
  language: "fr",
  currency: "xof",
  timezone: "gmt",
  theme: "light",
  public_profile: false,
}

export const defaultSecuritySettings = {
  two_factor_enabled: false,
}

export function useSettings() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const isMountedRef = useRef(true)

  const [activeTab, setActiveTab] = useState<TabId>("profil")

  // Ouverture directe d'un onglet via ?tab= (liens internes, retour de paiement
  // FedaPay…). Lu depuis window plutôt que useSearchParams : pas de contrainte
  // de Suspense, et la valeur est validée contre la liste des onglets connus.
  useEffect(() => {
    if (typeof window === "undefined") return
    const requested = new URLSearchParams(window.location.search).get("tab")
    const known: TabId[] = [
      "profil", "reseaux", "horaires", "verification",
      "securite", "preferences", "plan",
    ]

    // Anciens identifiants, conservés pour ne casser aucun lien existant :
    // « apropos », « notifications » et « boost » désignaient des onglets
    // désormais fusionnés. « premium » n'a jamais existé — personal-hero
    // pointait dessus, et le lien ne menait donc nulle part.
    const ALIASES: Record<string, TabId> = {
      apropos: "profil",
      notifications: "preferences",
      boost: "plan",
      premium: "plan",
    }

    if (!requested) return
    if ((known as string[]).includes(requested)) {
      setActiveTab(requested as TabId)
    } else if (ALIASES[requested]) {
      setActiveTab(ALIASES[requested])
    }
  }, [])
  const [loadingStatus, setLoadingStatus] = useState<"loading" | "success" | "error">("loading")
  const [saving, setSaving] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings)
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [securitySettings, setSecuritySettings] = useState(defaultSecuritySettings)
  const [profile, setProfile] = useState<UserProfileData>({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
    business_name: "",
    avatar_url: "",
    category: "Artisan",
    role: null,
    specialty: "",
    activity_domain: "",
    country_id: "",
    country_code: "",
    country_name: "",
    city: "",
    district: null,
    commune_id: null,
    tags: [],
    latitude: null,
    longitude: null,
    is_nomad: false,
    pin_enabled: false,
    phone: "",
    is_published: false,
    is_verified: false,
    is_premium: false,
    show_contact: true,
    phone_verified: false,
    has_password: false,
    slogan: "",
    years_experience: null,
    website: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    linkedin_url: "",
    secondary_phone: "",
    public_email: "",
    address: "",
    opening_hours: [],
    services: [],
  })

  const loadUserProfile = useCallback(async () => {
    try {
      setLoadingStatus("loading")
      const [response, { data: { user: authUser } }] = await Promise.all([
        fetchWithAuth("/api/users/me"),
        supabase.auth.getUser(),
      ])

      if (!isMountedRef.current) return

      if (response.ok) {
        const data = await response.json()
        const loaded: UserProfileData = {
          id: data.id || authUser?.id || "",
          first_name: data.first_name || authUser?.user_metadata?.first_name || authUser?.user_metadata?.given_name || "",
          last_name: data.last_name || authUser?.user_metadata?.last_name || authUser?.user_metadata?.family_name || "",
          email: data.email || authUser?.email || "",
          bio: data.bio || "",
          business_name: data.business_name || "",
          avatar_url: data.avatar_url || authUser?.user_metadata?.avatar_url || "/profil/avatar.jpg",
          category: data.category || "Artisan",
          role: data.role || null,
          specialty: data.specialty || "",
          activity_domain: data.activity_domain || "",
          country_id: data.country_id || "",
          country_code: data.country_code || "BJ",
          country_name: data.country_name || "Bénin",
          city: data.city || "",
          district: data.district ?? null,
          commune_id: data.commune_id ?? null,
          tags: Array.isArray(data.tags) ? data.tags : [],
          latitude: typeof data.latitude === "number" ? data.latitude : null,
          longitude: typeof data.longitude === "number" ? data.longitude : null,
          is_nomad: data.is_nomad ?? false,
          pin_enabled: !!data.pin_enabled,
          phone: data.phone || authUser?.phone || "",
          is_published: !!data.is_published,
          is_verified: !!data.is_verified,
          is_premium: !!data.is_premium,
          show_contact: data.show_contact !== false,
          phone_verified: !!data.phone_verified,
          has_password: !!data.has_password,
          slogan: data.slogan || "",
          years_experience: typeof data.years_experience === "number" ? data.years_experience : null,
          website: data.website || "",
          facebook_url: data.facebook_url || "",
          instagram_url: data.instagram_url || "",
          tiktok_url: data.tiktok_url || "",
          linkedin_url: data.linkedin_url || "",
          secondary_phone: data.secondary_phone || "",
          public_email: data.public_email || "",
          address: data.address || "",
          opening_hours: Array.isArray(data.opening_hours) ? data.opening_hours : [],
          services: Array.isArray(data.services) ? data.services : [],
          gender: data.gender || "male",
          birth_date: data.birth_date || "",
          department_id: data.department_id || "",
          department_name: data.department_name || "",
          commune_name: data.commune_name || "",
          arrondissement: data.arrondissement || "",
          neighborhood: data.neighborhood || "",
          slug: data.slug || "",
        }
        setProfile(loaded)
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
        // Le profil rendu par le serveur devient le point de comparaison :
        // à partir d'ici, tout écart est une modification de l'utilisateur.
        setProfile((fresh) => { savedSnapshot.current = JSON.stringify(fresh); return fresh })
      } else if (authUser) {
        setProfile(prev => ({
          ...prev,
          first_name: authUser.user_metadata?.first_name || authUser.user_metadata?.given_name || prev.first_name,
          last_name: authUser.user_metadata?.last_name || authUser.user_metadata?.family_name || prev.last_name,
          email: authUser.email || prev.email,
          phone: authUser.phone || prev.phone,
          avatar_url: authUser.user_metadata?.avatar_url || prev.avatar_url,
        }))
        setLoadingStatus("success")
      } else {
        setLoadingStatus("error")
      }
    } catch {
      if (isMountedRef.current) {
        toast.error("Impossible de charger votre profil")
        setLoadingStatus("error")
      }
    }
  }, [supabase])

  useEffect(() => {
    isMountedRef.current = true

    const loadRefs = async () => {
      try {
        await Promise.all([
          fetchWithAuth("/api/reference/sectors"),
          fetchWithAuth("/api/reference/professions"),
          getReferenceCountriesCached(),
        ])
      } catch {
        /* non-blocking */
      }
    }

    void loadUserProfile()
    void loadRefs()

    return () => {
      isMountedRef.current = false
    }
  }, [loadUserProfile])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetchWithAuth("/api/users/me", { method: "PUT", body: JSON.stringify(profile) })
      if (!isMountedRef.current) return
      if (res.ok) {
        // Ce qui vient d'être envoyé devient le nouveau repère : sans cela, la
        // barre « modifications non enregistrées » resterait affichée après un
        // enregistrement réussi.
        savedSnapshot.current = JSON.stringify(profile)
        setProfile((p) => ({ ...p }))
        toast.success("Profil mis à jour !")
      } else {
        const d = await res.json().catch(() => null)
        toast.error(d?.error || "Erreur lors de la mise à jour")
      }
    } catch {
      toast.error("Erreur réseau")
    } finally {
      if (isMountedRef.current) {
        setSaving(false)
      }
    }
  }, [profile])

  // Copie figée du profil tel que le serveur l'a rendu. Sans elle, impossible
  // de dire si l'utilisateur a modifié quoi que ce soit : le seul fait de taper
  // puis d'effacer laisserait croire à des changements en attente.
  const savedSnapshot = useRef<string>("")

  const handleCancel = useCallback(() => {
    void loadUserProfile()
    toast.info("Modifications annulées")
  }, [loadUserProfile])

  const saveSettings = useCallback(async (
    payload: {
      notification_preferences?: typeof defaultNotificationSettings
      app_preferences?: typeof defaultPreferences
      security_preferences?: typeof defaultSecuritySettings
    },
    successMessage: string,
  ): Promise<boolean> => {
    setSaving(true)
    try {
      const res = await fetchWithAuth("/api/users/settings", { method: "PUT", body: JSON.stringify(payload) })
      if (!isMountedRef.current) return false

      if (!res.ok) {
        const d = await res.json().catch(() => null)
        toast.error(d?.error || "Erreur lors de la sauvegarde")
        return false
      }

      const data = await res.json()
      if (data.notification_preferences) {
        setNotificationSettings({ ...defaultNotificationSettings, ...data.notification_preferences })
      }
      if (data.app_preferences) {
        setPreferences({ ...defaultPreferences, ...data.app_preferences })
        setProfile(prev => ({ ...prev, is_published: !!data.app_preferences.public_profile }))
      }
      if (data.security_preferences) {
        setSecuritySettings({ ...defaultSecuritySettings, ...data.security_preferences })
      }
      toast.success(successMessage)
      return true
    } catch {
      toast.error("Erreur réseau")
      return false
    } finally {
      if (isMountedRef.current) {
        setSaving(false)
      }
    }
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      sessionStorage.removeItem("emiid_pin_verified")
      toast.success("Déconnexion réussie")
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("Impossible de se déconnecter")
    }
  }, [supabase, router])

  // Comparaison structurelle, pas par référence : setProfile recrée l'objet à
  // chaque frappe, une égalité d'identité serait toujours fausse.
  const modifiedCount = useMemo(() => {
    if (!savedSnapshot.current) return 0
    let base: Record<string, unknown>
    try { base = JSON.parse(savedSnapshot.current) } catch { return 0 }
    const current = profile as unknown as Record<string, unknown>
    return Object.keys(current).filter(
      (k) => JSON.stringify(current[k]) !== JSON.stringify(base[k]),
    ).length
  }, [profile])

  return {
    modifiedCount,
    isDirty: modifiedCount > 0,
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
    loadUserProfile,
  }
}

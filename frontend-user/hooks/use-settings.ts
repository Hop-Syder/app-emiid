/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook d'état et de persistance de la page Paramètres.
 *
 *              Deux régimes d'enregistrement, chacun adapté à sa matière :
 *              - Profil (onglets Profil / Réseaux / Adresse & services) : formulaire
 *                avec brouillon, compteur de modifications et bouton Enregistrer.
 *                Seuls les champs modifiés sont envoyés au serveur.
 *              - Préférences & notifications : interrupteurs enregistrés
 *                immédiatement (thème, visibilité, alertes…), avec retour
 *                arrière si le serveur refuse. Rien ne peut donc être perdu.
 *
 *              Tant qu'un brouillon de profil n'est pas enregistré, quitter la
 *              page (rechargement, fermeture, lien interne) demande confirmation.
 * @created 2026-07-13
 * @updated 2026-10-08
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import type { ExperienceItem } from "@/types"

// ── Onglets ──────────────────────────────────────────────────────────────────

export const TAB_IDS = [
  "profil", "reseaux", "horaires", "verification", "securite", "preferences", "plan",
] as const

export type TabId = (typeof TAB_IDS)[number]

/** Onglets dont le contenu est un brouillon de profil à enregistrer. */
export const PROFILE_FORM_TABS: readonly TabId[] = ["profil", "reseaux", "horaires"]

/**
 * Anciens identifiants, conservés pour ne casser aucun lien existant :
 * « apropos », « notifications » et « boost » désignaient des onglets
 * désormais fusionnés ; « premium » était utilisé par personal-hero.
 */
const TAB_ALIASES: Record<string, TabId> = {
  apropos: "profil",
  notifications: "preferences",
  boost: "plan",
  premium: "plan",
  adresse: "horaires",
}

/** Traduit une valeur de `?tab=` en onglet connu (ou null). */
export function resolveTab(raw: string | null | undefined): TabId | null {
  if (!raw) return null
  if ((TAB_IDS as readonly string[]).includes(raw)) return raw as TabId
  return TAB_ALIASES[raw] ?? null
}

// ── Types ────────────────────────────────────────────────────────────────────

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
  /** Vide si l'utilisateur n'a pas de photo : l'image par défaut n'est qu'un affichage. */
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
  experiences: ExperienceItem[]
  slug?: string
}

/**
 * Champs affichés mais jamais modifiables depuis cette page : ils ne comptent
 * pas comme des modifications et ne sont jamais envoyés au serveur.
 * (Le PIN a ses propres routes sécurisées, cf. use-security-section.)
 */
const READ_ONLY_FIELDS: readonly (keyof UserProfileData)[] = [
  "id", "email", "is_verified", "is_premium", "phone_verified", "has_password", "pin_enabled", "is_published",
]

/** Le pays se résout côté serveur à partir de ces trois champs : ils voyagent ensemble. */
const COUNTRY_FIELDS: readonly (keyof UserProfileData)[] = ["country_id", "country_code", "country_name"]

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

export type NotificationSettings = typeof defaultNotificationSettings
export type AppPreferences = typeof defaultPreferences

const EMPTY_PROFILE: UserProfileData = {
  id: "", first_name: "", last_name: "", email: "", bio: "", business_name: "", avatar_url: "",
  category: "Artisan", role: null, specialty: "", activity_domain: "",
  country_id: "", country_code: "", country_name: "", city: "", district: null, commune_id: null,
  tags: [], latitude: null, longitude: null, is_nomad: false, pin_enabled: false, phone: "",
  is_published: false, is_verified: false, is_premium: false, show_contact: true,
  phone_verified: false, has_password: false, slogan: "", years_experience: null,
  website: "", facebook_url: "", instagram_url: "", tiktok_url: "", linkedin_url: "",
  secondary_phone: "", public_email: "", address: "", opening_hours: [], services: [], experiences: [],
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Liste des champs éditables qui diffèrent entre deux versions du profil. */
function changedFields(current: UserProfileData, saved: UserProfileData): (keyof UserProfileData)[] {
  return (Object.keys(current) as (keyof UserProfileData)[]).filter(
    (k) => !READ_ONLY_FIELDS.includes(k) && !same(current[k], saved[k]),
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSettings() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const isMountedRef = useRef(true)

  const [activeTab, setActiveTabState] = useState<TabId>("profil")

  // Ouverture directe via ?tab= (liens internes, retour de paiement FedaPay…).
  // Lu depuis window plutôt que useSearchParams : pas de contrainte de Suspense.
  useEffect(() => {
    const requested = resolveTab(new URLSearchParams(window.location.search).get("tab"))
    if (requested) setActiveTabState(requested)
  }, [])

  /** Change d'onglet et garde l'URL à jour, pour qu'un rechargement y revienne. */
  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", tab)
    window.history.replaceState(window.history.state, "", url)
  }, [])

  const [loadingStatus, setLoadingStatus] = useState<"loading" | "success" | "error">("loading")
  const [saving, setSaving] = useState(false)

  // Profil : brouillon (`profile`) + dernière version enregistrée (`savedProfile`).
  const [profile, setProfile] = useState<UserProfileData>(EMPTY_PROFILE)
  const [savedProfile, setSavedProfile] = useState<UserProfileData>(EMPTY_PROFILE)

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings)
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences)

  const loadUserProfile = useCallback(async () => {
    try {
      setLoadingStatus("loading")
      const [response, { data: { user: authUser } }] = await Promise.all([
        fetchWithAuth("/api/users/me"),
        supabase.auth.getUser(),
      ])
      if (!isMountedRef.current) return

      if (!response.ok) {
        if (!authUser) return setLoadingStatus("error")
        // API indisponible : on affiche au moins l'identité du compte.
        const fallback: UserProfileData = {
          ...EMPTY_PROFILE,
          id: authUser.id,
          first_name: authUser.user_metadata?.first_name || authUser.user_metadata?.given_name || "",
          last_name: authUser.user_metadata?.last_name || authUser.user_metadata?.family_name || "",
          email: authUser.email || "",
          phone: authUser.phone || "",
          avatar_url: authUser.user_metadata?.avatar_url || "",
        }
        setProfile(fallback)
        setSavedProfile(fallback)
        setLoadingStatus("success")
        return
      }

      const data = await response.json()
      const loaded: UserProfileData = {
        id: data.id || authUser?.id || "",
        first_name: data.first_name || authUser?.user_metadata?.first_name || authUser?.user_metadata?.given_name || "",
        last_name: data.last_name || authUser?.user_metadata?.last_name || authUser?.user_metadata?.family_name || "",
        email: data.email || authUser?.email || "",
        bio: data.bio || "",
        business_name: data.business_name || "",
        // Pas d'image par défaut ici : elle serait enregistrée comme une vraie photo.
        avatar_url: data.avatar_url || authUser?.user_metadata?.avatar_url || "",
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
        experiences: Array.isArray(data.experiences) ? data.experiences : [],
        slug: data.slug || "",
      }
      setProfile(loaded)
      setSavedProfile(loaded)
      setNotificationSettings({ ...defaultNotificationSettings, ...(data.notification_preferences || {}) })
      setPreferences({
        ...defaultPreferences,
        ...(data.app_preferences || {}),
        public_profile: typeof data.app_preferences?.public_profile === "boolean"
          ? data.app_preferences.public_profile
          : !!data.is_published,
      })
      setLoadingStatus("success")
    } catch {
      if (isMountedRef.current) {
        toast.error("Impossible de charger votre profil")
        setLoadingStatus("error")
      }
    }
  }, [supabase])

  useEffect(() => {
    isMountedRef.current = true
    void loadUserProfile()
    return () => {
      isMountedRef.current = false
    }
  }, [loadUserProfile])

  // ── Profil : brouillon ──────────────────────────────────────────────────────

  const dirtyFields = useMemo(() => changedFields(profile, savedProfile), [profile, savedProfile])
  const modifiedCount = dirtyFields.length
  const isDirty = modifiedCount > 0

  const saveProfile = useCallback(async () => {
    const fields = changedFields(profile, savedProfile)
    if (fields.length === 0) return
    if (fields.some((f) => COUNTRY_FIELDS.includes(f))) {
      COUNTRY_FIELDS.forEach((f) => { if (!fields.includes(f)) fields.push(f) })
    }
    // Seuls les champs modifiés partent : on n'écrase jamais une donnée que
    // l'utilisateur n'a pas touchée.
    const body = Object.fromEntries(fields.map((f) => [f, profile[f]]))

    setSaving(true)
    try {
      const res = await fetchWithAuth("/api/users/me", { method: "PUT", body: JSON.stringify(body) })
      if (!isMountedRef.current) return
      if (res.ok) {
        setSavedProfile(profile)
        toast.success("Profil mis à jour")
      } else {
        const d = await res.json().catch(() => null)
        toast.error(d?.error || "Erreur lors de la mise à jour")
      }
    } catch {
      toast.error("Erreur réseau")
    } finally {
      if (isMountedRef.current) setSaving(false)
    }
  }, [profile, savedProfile])

  /** Annule le brouillon sans recharger la page. */
  const discardProfile = useCallback(() => {
    setProfile(savedProfile)
    toast.info("Modifications annulées")
  }, [savedProfile])

  /**
   * Met à jour un champ en lecture seule (ex. téléphone certifié, PIN activé)
   * dans le brouillon ET la version enregistrée : c'est le serveur qui a
   * changé, pas un brouillon de l'utilisateur.
   */
  const applyServerProfilePatch = useCallback((patch: Partial<UserProfileData>) => {
    setProfile((p) => ({ ...p, ...patch }))
    setSavedProfile((p) => ({ ...p, ...patch }))
  }, [])

  // ── Préférences & notifications : enregistrement immédiat ──────────────────

  const putSettings = useCallback(async (payload: {
    notification_preferences?: NotificationSettings
    app_preferences?: AppPreferences
  }): Promise<boolean> => {
    try {
      const res = await fetchWithAuth("/api/users/settings", { method: "PUT", body: JSON.stringify(payload) })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        toast.error(d?.error || "Erreur lors de la sauvegarde")
        return false
      }
      return true
    } catch {
      toast.error("Erreur réseau")
      return false
    }
  }, [])

  /** Applique tout de suite une préférence, puis l'enregistre (retour arrière si refus). */
  const updatePreferences = useCallback(async (patch: Partial<AppPreferences>) => {
    const previous = preferences
    const next = { ...preferences, ...patch }
    setPreferences(next)
    const ok = await putSettings({ app_preferences: next })
    if (!isMountedRef.current) return
    if (!ok) return setPreferences(previous)
    if (patch.public_profile !== undefined) applyServerProfilePatch({ is_published: next.public_profile })
  }, [preferences, putSettings, applyServerProfilePatch])

  const updateNotifications = useCallback(async (patch: Partial<NotificationSettings>, persist = true) => {
    const previous = notificationSettings
    const next = { ...notificationSettings, ...patch }
    setNotificationSettings(next)
    if (!persist) return
    const ok = await putSettings({ notification_preferences: next })
    if (isMountedRef.current && !ok) setNotificationSettings(previous)
  }, [notificationSettings, putSettings])

  // ── Garde-fou : brouillon non enregistré ────────────────────────────────────

  useEffect(() => {
    if (!isDirty) return

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }

    // Les liens internes (next/link) ne déclenchent pas beforeunload : on les
    // intercepte en phase de capture, avant le routeur de Next.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null
      if (!anchor || anchor.target === "_blank") return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      if (!window.confirm("Vous avez des modifications non enregistrées. Quitter quand même ?")) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onClick, true)
    }
  }, [isDirty])

  const handleLogout = useCallback(async () => {
    if (isDirty && !window.confirm("Vous avez des modifications non enregistrées. Se déconnecter quand même ?")) return
    try {
      await supabase.auth.signOut()
      sessionStorage.removeItem("emiid_pin_verified")
      toast.success("Déconnexion réussie")
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("Impossible de se déconnecter")
    }
  }, [supabase, router, isDirty])

  return {
    activeTab,
    setActiveTab,
    loadingStatus,
    saving,
    // Profil
    profile,
    setProfile,
    modifiedCount,
    isDirty,
    saveProfile,
    discardProfile,
    applyServerProfilePatch,
    // Préférences
    preferences,
    updatePreferences,
    notificationSettings,
    updateNotifications,
    // Compte
    handleLogout,
    loadUserProfile,
  }
}

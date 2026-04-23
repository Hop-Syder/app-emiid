"use server"

import { createAdminClient, requireAdminSession } from "@/lib/supabase/server"

export interface UserProfile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  category: string | null
  role: string | null
  job_title: string | null
  specialty: string | null
  activity_domain: string | null
  industry: string | null
  city: string | null
  website: string | null
  phone: string | null
  followers_count: number | null
  country_id: string | null
  has_profile: boolean | null
  is_published: boolean | null
  is_verified?: boolean | null
  is_premium?: boolean | null
  created_at: string
  updated_at: string | null
}

export interface Country {
  id: string
  name: string
  iso_code: string
  is_west_africa: boolean
}

export interface SystemCheck {
  label: string
  status: "up" | "down" | "unknown"
  detail: string
}

export interface DashboardStats {
  totalUsers: number
  publishedProfiles: number
  totalMessages: number
  usersByCountry: { country: string; count: number }[]
  recentUsers: UserProfile[]
  weeklyActivity: { day: string; users: number }[]
  systemChecks: SystemCheck[]
}

export interface AdminSettings {
  profile: {
    name: string
    email: string
    phone: string
    role: string
  }
  notifications: {
    emailNewUser: boolean
    emailModeration: boolean
    emailReports: boolean
    pushNewUser: boolean
    pushModeration: boolean
    pushReports: boolean
    dailyDigest: boolean
    weeklyReport: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: string
    ipWhitelist: boolean
  }
  systemStats: {
    serverUptime: string
    databaseStatus: string
    databaseDetail: string
  }
}

export interface GalleryItem {
  id: string
  title: string | null
  description: string | null
  image_url: string
  created_at: string
  order_index: number | null
  user_id: string
  user_name: string
  user_avatar: string | null
  status: "pending" | "approved" | "rejected"
  reports: number
}

interface UserCountryRow {
  countries?: { name?: string | null } | Array<{ name?: string | null }> | null
}

interface GalleryProfileRow {
  user_id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

interface ProjectGalleryRow {
  id: string
  title: string | null
  description: string | null
  image_url: string
  created_at: string
  order_index: number | null
  user_id: string
  profile_id: string
}

const DEFAULT_ADMIN_NOTIFICATIONS = {
  emailNewUser: true,
  emailModeration: true,
  emailReports: true,
  pushNewUser: false,
  pushModeration: true,
  pushReports: true,
  dailyDigest: true,
  weeklyReport: true,
}

const DEFAULT_ADMIN_SECURITY = {
  twoFactor: false,
  sessionTimeout: "30",
  ipWhitelist: false,
}

async function getBackendHealth(): Promise<SystemCheck[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    return [
      { label: "API Serveur", status: "unknown", detail: "URL backend non configurée" },
      { label: "Base de données", status: "unknown", detail: "URL backend non configurée" },
      { label: "Stockage", status: "unknown", detail: "Vérification indisponible" },
    ]
  }

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/health`, { cache: "no-store" })
    const data = await res.json()
    const databaseStatus = data?.checks?.database?.status === "up" ? "up" : "down"
    const databaseDetail = data?.checks?.database?.response_time_ms
      ? `${data.checks.database.response_time_ms} ms`
      : data?.checks?.database?.message || "Aucun détail"

    return [
      {
        label: "API Serveur",
        status: data?.status === "ok" ? "up" : "down",
        detail: data?.uptime_seconds ? `${data.uptime_seconds}s uptime` : (data?.status || "Indisponible"),
      },
      {
        label: "Base de données",
        status: databaseStatus,
        detail: databaseDetail,
      },
      {
        label: "Stockage",
        status: databaseStatus,
        detail: "Santé approximée depuis le backend",
      },
    ]
  } catch {
    return [
      { label: "API Serveur", status: "unknown", detail: "Healthcheck indisponible" },
      { label: "Base de données", status: "unknown", detail: "Healthcheck indisponible" },
      { label: "Stockage", status: "unknown", detail: "Healthcheck indisponible" },
    ]
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createAdminClient()

  const { count: totalUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })

  const { count: publishedProfiles } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  const { count: totalMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })

  const { data: usersByCountryData } = await supabase
    .from("user_profiles")
    .select("country_id, countries(name)")
    .not("country_id", "is", null)

  const countryMap = new Map<string, number>()
  ;(usersByCountryData as UserCountryRow[] | null)?.forEach((user) => {
    const country = Array.isArray(user.countries) ? user.countries[0] : user.countries
    const countryName = country?.name || "Inconnu"
    countryMap.set(countryName, (countryMap.get(countryName) || 0) + 1)
  })

  const usersByCountry = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const { data: recentUsers } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const now = new Date()
  const weeklyActivity = []
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString()

    const { count } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)

    weeklyActivity.push({
      day: dayNames[new Date(startOfDay).getDay()],
      users: count || 0,
    })
  }

  return {
    totalUsers: totalUsers || 0,
    publishedProfiles: publishedProfiles || 0,
    totalMessages: totalMessages || 0,
    usersByCountry,
    recentUsers: (recentUsers as UserProfile[]) || [],
    weeklyActivity,
    systemChecks: await getBackendHealth(),
  }
}

export async function getUsers(params?: {
  search?: string
  status?: string
  role?: string
  page?: number
  limit?: number
}): Promise<{ users: UserProfile[]; total: number }> {
  const supabase = await createAdminClient()
  const { search, role, page = 1, limit = 10 } = params || {}

  let query = supabase
    .from("user_profiles")
    .select("*, countries(name)", { count: "exact" })

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (role && role !== "all") {
    query = query.eq("category", role)
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false })

  const { data, count } = await query

  return {
    users: (data as UserProfile[]) || [],
    total: count || 0,
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function toggleUserPublished(userId: string, isPublished: boolean) {
  return updateUserProfile(userId, { is_published: isPublished })
}

export async function toggleUserVerified(userId: string, isVerified: boolean) {
  return updateUserProfile(userId, { is_verified: isVerified })
}

export async function toggleUserPremium(userId: string, isPremium: boolean) {
  return updateUserProfile(userId, { is_premium: isPremium })
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("id", userId)
    .single()

  if (profileError || !profile?.user_id) {
    return { success: false, error: profileError?.message || "Utilisateur introuvable" }
  }

  const { error } = await supabase.auth.admin.deleteUser(profile.user_id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getCountries(): Promise<Country[]> {
  const supabase = await createAdminClient()

  const { data } = await supabase
    .from("countries")
    .select("*")
    .order("name", { ascending: true })

  return (data as Country[]) || []
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const supabase = await createAdminClient()
  const adminSession = await requireAdminSession()

  if (!adminSession) {
    throw new Error("UNAUTHORIZED_ADMIN")
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("first_name, last_name, email, phone, role")
    .eq("user_id", adminSession.userId)
    .single()

  const { data: authUserData } = await supabase.auth.admin.getUserById(adminSession.userId)
  const metadata = authUserData.user?.user_metadata || {}
  const systemChecks = await getBackendHealth()

  return {
    profile: {
      name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Admin EmiID",
      email: profile?.email || authUserData.user?.email || "",
      phone: profile?.phone || authUserData.user?.phone || "",
      role: profile?.role || "Administrateur",
    },
    notifications: {
      ...DEFAULT_ADMIN_NOTIFICATIONS,
      ...(metadata.admin_notifications || {}),
    },
    security: {
      ...DEFAULT_ADMIN_SECURITY,
      ...(metadata.admin_security || {}),
    },
    systemStats: {
      serverUptime: systemChecks[0]?.detail || "Indisponible",
      databaseStatus: systemChecks[1]?.status || "unknown",
      databaseDetail: systemChecks[1]?.detail || "Indisponible",
    },
  }
}

export async function saveAdminSettings(settings: Omit<AdminSettings, "systemStats">): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const adminSession = await requireAdminSession()

  if (!adminSession) {
    return { success: false, error: "Accès administrateur requis" }
  }

  const { data: authUserData } = await supabase.auth.admin.getUserById(adminSession.userId)
  const currentMetadata = authUserData.user?.user_metadata || {}

  const { error: profileError } = await supabase
    .from("user_profiles")
    .update({
      first_name: settings.profile.name.split(" ").slice(0, 1).join(" ") || null,
      last_name: settings.profile.name.split(" ").slice(1).join(" ") || null,
      email: settings.profile.email || null,
      phone: settings.profile.phone || null,
      role: settings.profile.role || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", adminSession.userId)

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(adminSession.userId, {
    user_metadata: {
      ...currentMetadata,
      admin_notifications: settings.notifications,
      admin_security: settings.security,
    },
    email: settings.profile.email || undefined,
    phone: settings.profile.phone || undefined,
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  return { success: true }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("project_gallery")
    .select("id, title, description, image_url, created_at, order_index, user_id, profile_id")
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  const userIds = Array.from(new Set(data.map((item) => item.user_id)))
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, first_name, last_name, avatar_url")
    .in("user_id", userIds)

  const profileMap = new Map((profiles as GalleryProfileRow[] || []).map((profile) => [profile.user_id, profile]))

  return (data as ProjectGalleryRow[]).map((item) => {
    const profile = profileMap.get(item.user_id)
    const userName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Membre EmiID"

    return {
      id: item.id,
      title: item.title || null,
      description: item.description || null,
      image_url: item.image_url,
      created_at: item.created_at,
      order_index: item.order_index,
      user_id: item.user_id,
      user_name: userName,
      user_avatar: profile?.avatar_url || null,
      status: "pending",
      reports: 0,
    }
  })
}

export async function approveGalleryItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const { data: item, error } = await supabase
    .from("project_gallery")
    .select("id, user_id, title")
    .eq("id", itemId)
    .single()

  if (error || !item) {
    return { success: false, error: error?.message || "Élément introuvable" }
  }

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: item.user_id,
      type: "admin",
      title: "Galerie validée",
      content: `Votre projet ${item.title ? `“${item.title}”` : "de galerie"} a été validé par l'administration.`,
      link: "/creer-profil",
    })

  if (notificationError) {
    return { success: false, error: notificationError.message }
  }

  return { success: true }
}

export async function rejectGalleryItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { data: item } = await supabase
    .from("project_gallery")
    .select("user_id, title")
    .eq("id", itemId)
    .single()

  const { error } = await supabase
    .from("project_gallery")
    .delete()
    .eq("id", itemId)

  if (error) {
    return { success: false, error: error.message }
  }

  if (item?.user_id) {
    await supabase
      .from("notifications")
      .insert({
        user_id: item.user_id,
        type: "admin",
        title: "Élément retiré de la galerie",
        content: `Un élément ${item.title ? `“${item.title}” ` : ""}a été retiré de votre galerie par l'administration.`,
        link: "/creer-profil",
      })
  }

  return { success: true }
}

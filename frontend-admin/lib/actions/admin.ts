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
  is_locked?: boolean | null
  pin_attempts?: number | null
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

const USER_PROFILE_SAFE_SELECT = `
  id,
  user_id,
  first_name,
  last_name,
  email,
  avatar_url,
  bio,
  category,
  role,
  job_title,
  specialty,
  activity_domain,
  industry,
  city,
  website,
  phone,
  followers_count,
  country_id,
  has_profile,
  is_published,
  is_verified,
  is_premium,
  is_locked,
  pin_attempts,
  created_at,
  updated_at,
  countries(name)
`

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

  // Initialize default values
  let totalUsers = 0
  let publishedProfiles = 0
  let totalMessages = 0
  let usersByCountry: { country: string; count: number }[] = []
  let recentUsers: UserProfile[] = []
  const weeklyActivity: { day: string; users: number }[] = []
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

  try {
    // Get total users
    const { count: totalUsersCount, error: totalUsersError } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })

    if (totalUsersError) {
      console.error('[Dashboard] Error fetching total users:', totalUsersError)
    } else {
      totalUsers = totalUsersCount || 0
    }

    // Get published profiles
    const { count: publishedCount, error: publishedError } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true)

    if (publishedError) {
      console.error('[Dashboard] Error fetching published profiles:', publishedError)
    } else {
      publishedProfiles = publishedCount || 0
    }

    // Get total messages
    const { count: messagesCount, error: messagesError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })

    if (messagesError) {
      console.error('[Dashboard] Error fetching total messages:', messagesError)
    } else {
      totalMessages = messagesCount || 0
    }

    // Get users by country
    try {
      const { data: usersByCountryData, error: countryError } = await supabase
        .from("user_profiles")
        .select("country_id, countries(name)")
        .not("country_id", "is", null)

      if (countryError) {
        console.error('[Dashboard] Error fetching users by country:', countryError)
      } else if (usersByCountryData) {
        const countryMap = new Map<string, number>()
          ; (usersByCountryData as UserCountryRow[]).forEach((user) => {
            const country = Array.isArray(user.countries) ? user.countries[0] : user.countries
            const countryName = country?.name || "Inconnu"
            countryMap.set(countryName, (countryMap.get(countryName) || 0) + 1)
          })

        usersByCountry = Array.from(countryMap.entries())
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
      }
    } catch (err) {
      console.error('[Dashboard] Exception in users by country:', err)
    }

    // Get recent users
    try {
      const { data: recentUsersData, error: recentUsersError } = await supabase
        .from("user_profiles")
        .select(USER_PROFILE_SAFE_SELECT)
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentUsersError) {
        console.error('[Dashboard] Error fetching recent users:', recentUsersError)
      } else {
        recentUsers = (recentUsersData as UserProfile[]) || []
      }
    } catch (err) {
      console.error('[Dashboard] Exception in recent users:', err)
    }

    // Get weekly activity (parallélisé pour perf)
    try {
      const now = new Date()
      const dayBounds: { start: string; end: string; day: string }[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0)).toISOString()
        const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999)).toISOString()
        dayBounds.push({
          start: startOfDay,
          end: endOfDay,
          day: dayNames[new Date(startOfDay).getDay()],
        })
      }

      const weeklyResults = await Promise.all(
        dayBounds.map(({ start, end }) =>
          supabase
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", start)
            .lte("created_at", end),
        ),
      )

      weeklyResults.forEach((result, index) => {
        if (result.error) {
          console.error(
            `[Dashboard] Error fetching weekly activity for ${dayBounds[index].start}:`,
            result.error,
          )
        }
        weeklyActivity.push({
          day: dayBounds[index].day,
          users: result.count || 0,
        })
      })
    } catch (err) {
      console.error('[Dashboard] Exception in weekly activity:', err)
      // Fill with zeros if fails
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        weeklyActivity.push({
          day: dayNames[date.getDay()],
          users: 0,
        })
      }
    }

  } catch (err) {
    console.error('[Dashboard] Critical error in getDashboardStats:', err)
  }

  // Get system health (can fail independently)
  let systemChecks: SystemCheck[] = []
  try {
    systemChecks = await getBackendHealth()
  } catch (err) {
    console.error('[Dashboard] Error fetching system health:', err)
    systemChecks = [
      { label: "API Serveur", status: "unknown", detail: "Verification indisponible" },
      { label: "Base de donnees", status: "unknown", detail: "Verification indisponible" },
      { label: "Stockage", status: "unknown", detail: "Verification indisponible" },
    ]
  }

  return {
    totalUsers,
    publishedProfiles,
    totalMessages,
    usersByCountry,
    recentUsers,
    weeklyActivity,
    systemChecks,
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
    .select(USER_PROFILE_SAFE_SELECT, { count: "exact" })

  if (search) {
    // Sanitization anti-injection PostgREST : échappe les caractères qui pourraient
    // casser la structure `.or()` (virgules, parenthèses, astérisques).
    const safeSearch = String(search)
      .replace(/[,()%*]/g, ' ')
      .trim()
      .slice(0, 100)
    if (safeSearch) {
      query = query.or(
        `first_name.ilike.%${safeSearch}%,last_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`,
      )
    }
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

export async function unlockUserPin(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("user_profiles")
    .update({
      is_locked: false,
      pin_attempts: 0,
      locked_at: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
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

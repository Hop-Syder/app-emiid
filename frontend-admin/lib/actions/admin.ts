"use server"

import { createAdminClient, createServiceRoleClient, requireAdminSession, type AdminSessionProfile } from "@/lib/supabase/server"
import { sendBulkEmails, isSmtpConfigured, verifyTransport } from "@/lib/mailer"

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
  is_admin?: boolean | null
  is_suspended?: boolean | null
  suspended_at?: string | null
  suspended_until?: string | null
  suspended_reason?: string | null
  pin_attempts?: number | null
  created_at: string
  updated_at: string | null
}

export interface AuditLogEntry {
  id: string
  admin_id: string
  admin_email: string | null
  action: string
  target_type: string | null
  target_id: string | null
  target_label: string | null
  details: Record<string, unknown>
  created_at: string
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
  verifiedProfiles: number
  premiumProfiles: number
  suspendedProfiles: number
  totalMessages: number
  newUsersThisWeek: number
  newUsersPrevWeek: number
  usersByCountry: { country: string; count: number }[]
  recentUsers: UserProfile[]
  weeklyActivity: { day: string; users: number }[]
  systemChecks: SystemCheck[]
  pendingVerifications: number
  activeReports: number
  /** Chiffre d'affaires encaissé, toutes transactions réussies (FCFA). */
  totalRevenue: number
  revenue: RevenueStats
}

/** Revenus réels, lus dans payment_transactions / subscriptions / profile_boosts. */
export interface RevenueStats {
  /** Encaissé sur le mois calendaire en cours (FCFA). */
  monthRevenue: number
  /** Nombre de transactions réussies ce mois-ci. */
  monthCount: number
  /** Abonnements Pro actifs et non échus. */
  activeSubscriptions: number
  /** Détail par formule : PRO_MONTHLY, PRO_ANNUAL, B2B. */
  subscriptionsByTier: { tier: string; count: number }[]
  /** Boosts en cours (statut ACTIF et fenêtre non expirée). */
  activeBoosts: number
  /** Répartition des boosts en cours par portée. */
  boostsByScope: { scope: string; count: number }[]
  /** Transactions initiées mais jamais confirmées (indicateur d'abandon). */
  pendingCount: number
  /** Dernières transactions réussies, pour vérification rapide. */
  lastPayments: { id: string; amount: number; type: string; created_at: string }[]
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
  rejection_reason: string | null
  reviewed_at: string | null
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
  status: "pending" | "approved" | "rejected" | null
  rejection_reason: string | null
  reviewed_at: string | null
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
  is_admin,
  is_suspended,
  suspended_at,
  suspended_until,
  suspended_reason,
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

export async function getDashboardStats(days: number = 7): Promise<DashboardStats> {
  const supabase = await createAdminClient()

  // Initialize default values
  let totalUsers = 0
  let publishedProfiles = 0
  let verifiedProfiles = 0
  let premiumProfiles = 0
  let suspendedProfiles = 0
  let totalMessages = 0
  let newUsersThisWeek = 0
  let newUsersPrevWeek = 0
  let pendingVerifications = 0
  let activeReports = 0
  let totalRevenue = 0
  let revenue: RevenueStats = {
    monthRevenue: 0, monthCount: 0, activeSubscriptions: 0, subscriptionsByTier: [],
    activeBoosts: 0, boostsByScope: [], pendingCount: 0, lastPayments: [],
  }
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

    // Compteurs de qualité + croissance (parallélisés, tolérants aux colonnes absentes)
    try {
      const weekMs = 7 * 24 * 60 * 60 * 1000
      const now = Date.now()
      const startThisWeek = new Date(now - weekMs).toISOString()
      const startPrevWeek = new Date(now - 2 * weekMs).toISOString()

      const [verifiedRes, premiumRes, suspendedRes, thisWeekRes, prevWeekRes, pendingVerifyRes, reportsRes] = await Promise.all([
        supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("is_verified", true),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("is_suspended", true),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }).gte("created_at", startThisWeek),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }).gte("created_at", startPrevWeek).lt("created_at", startThisWeek),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("is_published", true).eq("is_verified", false),
        supabase.from("content_reports").select("*", { count: "exact", head: true }).eq("status", "open"),
      ])
      verifiedProfiles = verifiedRes.count || 0
      premiumProfiles = premiumRes.count || 0
      suspendedProfiles = suspendedRes.error ? 0 : (suspendedRes.count || 0)
      newUsersThisWeek = thisWeekRes.count || 0
      newUsersPrevWeek = prevWeekRes.count || 0
      pendingVerifications = pendingVerifyRes.count || 0
      activeReports = reportsRes.error ? 0 : (reportsRes.count || 0)
    } catch (err) {
      console.error('[Dashboard] Exception in quality counters:', err)
    }

    // ── Revenus réels ────────────────────────────────────────────────────
    // Remplace l'ancienne estimation « premiumProfiles × 10 000 », qui inventait
    // un chiffre d'affaires et se trompait de tarif (le Pro est à 1 000 F/mois).
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const nowIso = now.toISOString()

      const [allPaid, monthPaid, pendingRes, subsRes, boostsRes, lastRes] = await Promise.all([
        supabase.from("payment_transactions").select("amount").eq("status", "SUCCESS"),
        supabase.from("payment_transactions").select("amount").eq("status", "SUCCESS").gte("created_at", startOfMonth),
        supabase.from("payment_transactions").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
        supabase.from("subscriptions").select("tier").eq("status", "ACTIVE").or(`end_date.is.null,end_date.gt.${nowIso}`),
        supabase.from("profile_boosts").select("scope").eq("status", "ACTIVE").gt("expires_at", nowIso),
        supabase.from("payment_transactions").select("id, amount, type, created_at").eq("status", "SUCCESS").order("created_at", { ascending: false }).limit(5),
      ])

      const sum = (rows: { amount: number }[] | null) =>
        (rows || []).reduce((acc, r) => acc + (r.amount || 0), 0)
      const groupBy = (rows: Record<string, string>[] | null, key: string) => {
        const counts = new Map<string, number>()
        for (const r of rows || []) counts.set(r[key], (counts.get(r[key]) || 0) + 1)
        return [...counts.entries()].map(([k, count]) => ({ [key]: k, count })) as never[]
      }

      totalRevenue = sum(allPaid.data as { amount: number }[] | null)
      revenue = {
        monthRevenue: sum(monthPaid.data as { amount: number }[] | null),
        monthCount: (monthPaid.data || []).length,
        activeSubscriptions: (subsRes.data || []).length,
        subscriptionsByTier: groupBy(subsRes.data as Record<string, string>[] | null, "tier"),
        activeBoosts: (boostsRes.data || []).length,
        boostsByScope: groupBy(boostsRes.data as Record<string, string>[] | null, "scope"),
        pendingCount: pendingRes.error ? 0 : (pendingRes.count || 0),
        lastPayments: (lastRes.data || []) as RevenueStats["lastPayments"],
      }
    } catch (err) {
      // Tables de monétisation absentes (migration non jouée) : on reste à zéro
      // plutôt que d'afficher un chiffre inventé.
      console.error('[Dashboard] Exception in revenue counters:', err)
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

    // Get activity for X days (optimisé à 1 seule requête globale)
    try {
      const now = new Date()
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - (days - 1))
      startDate.setHours(0, 0, 0, 0)
      
      const { data: activityData, error: activityError } = await supabase
        .from("user_profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true })

      if (activityError) {
        console.error('[Dashboard] Error fetching activity data:', activityError)
      } else {
        const countsMap = new Map<string, number>()
        
        // Initialiser toutes les dates à 0
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate)
          date.setDate(startDate.getDate() + i)
          const key = date.toISOString().split('T')[0]
          countsMap.set(key, 0)
        }

        if (activityData) {
          activityData.forEach((row) => {
            if (row.created_at) {
              const key = new Date(row.created_at).toISOString().split('T')[0]
              if (countsMap.has(key)) {
                countsMap.set(key, (countsMap.get(key) || 0) + 1)
              }
            }
          })
        }

        for (let i = 0; i < days; i++) {
          const date = new Date(startDate)
          date.setDate(startDate.getDate() + i)
          const key = date.toISOString().split('T')[0]
          
          let dayLabel = ""
          if (days <= 7) {
            dayLabel = dayNames[date.getDay()]
          } else if (days <= 30) {
            dayLabel = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
          } else {
            dayLabel = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
          }

          weeklyActivity.push({
            day: dayLabel,
            users: countsMap.get(key) || 0,
          })
        }
      }
    } catch (err) {
      console.error('[Dashboard] Exception in weekly activity calculation:', err)
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        weeklyActivity.push({
          day: days <= 7 ? dayNames[date.getDay()] : date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
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
    verifiedProfiles,
    premiumProfiles,
    suspendedProfiles,
    totalMessages,
    newUsersThisWeek,
    newUsersPrevWeek,
    usersByCountry,
    recentUsers,
    weeklyActivity,
    systemChecks,
    pendingVerifications,
    activeReports,
    totalRevenue,
    revenue,
  }
}

export interface UserFilters {
  search?: string
  status?: string   // all | published | unpublished | verified | premium | suspended | admin
  role?: string     // catégorie
  country?: string  // country_id
  page?: number
  limit?: number
}

// Applique les filtres communs (recherche, rôle, pays, statut) à une requête user_profiles.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- le query builder Supabase n'est pas générique ici
function applyUserFilters(query: any, f: UserFilters) {
  const { search, role, country, status } = f
  if (search) {
    const safe = String(search).replace(/[,()%*]/g, " ").trim().slice(0, 100)
    if (safe) {
      query = query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%`)
    }
  }
  if (role && role !== "all") query = query.eq("category", role)
  if (country && country !== "all") query = query.eq("country_id", country)
  if (status && status !== "all") {
    if (status === "published") query = query.eq("is_published", true)
    else if (status === "unpublished") query = query.eq("is_published", false)
    else if (status === "verified") query = query.eq("is_verified", true)
    else if (status === "premium") query = query.eq("is_premium", true)
    else if (status === "suspended") query = query.eq("is_suspended", true)
    else if (status === "admin") query = query.eq("is_admin", true)
  }
  return query
}

export async function getUsers(params?: UserFilters): Promise<{ users: UserProfile[]; total: number }> {
  const supabase = await createAdminClient()
  const { page = 1, limit = 10 } = params || {}

  let query = supabase
    .from("user_profiles")
    .select(USER_PROFILE_SAFE_SELECT, { count: "exact" })

  query = applyUserFilters(query, params || {})

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false })

  const { data, count } = await query

  return {
    users: (data as UserProfile[]) || [],
    total: count || 0,
  }
}

/** Export CSV des utilisateurs correspondant aux filtres (max 5000 lignes). */
export async function exportUsers(params?: UserFilters): Promise<string> {
  const supabase = await createAdminClient()
  let query = supabase
    .from("user_profiles")
    .select("first_name,last_name,email,phone,category,city,is_published,is_verified,is_premium,is_suspended,is_admin,created_at")
    .order("created_at", { ascending: false })
    .limit(5000)

  query = applyUserFilters(query, params || {})

  const { data } = await query
  type Row = Record<string, string | boolean | null>
  const rows = (data as Row[]) || []

  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v)
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const b = (v: unknown) => (v ? "oui" : "non")
  const header = ["Prénom", "Nom", "Email", "Téléphone", "Catégorie", "Ville", "Publié", "Vérifié", "Premium", "Suspendu", "Admin", "Inscription"]
  const lines = rows.map((r) => [
    r.first_name, r.last_name, r.email, r.phone, r.category, r.city,
    b(r.is_published), b(r.is_verified), b(r.is_premium), b(r.is_suspended), b(r.is_admin),
    r.created_at ? new Date(r.created_at as string).toISOString().slice(0, 10) : "",
  ].map(esc).join(","))

  return [header.join(","), ...lines].join("\n")
}

/** Action groupée sur une sélection d'utilisateurs. */
export async function bulkUserAction(
  userIds: string[],
  action: "publish" | "unpublish" | "verify" | "unverify" | "suspend" | "reactivate",
): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { success: false, count: 0, error: "Non autorisé" }
  if (!userIds.length) return { success: false, count: 0, error: "Aucun utilisateur sélectionné" }

  const now = new Date().toISOString()
  let error: string | undefined

  if (action === "publish" || action === "unpublish") {
    const { error: e } = await supabase.from("user_profiles").update({ is_published: action === "publish", updated_at: now }).in("id", userIds)
    error = e?.message
  } else if (action === "verify" || action === "unverify") {
    const { error: e } = await supabase.from("user_profiles").update({ is_verified: action === "verify", updated_at: now }).in("id", userIds)
    error = e?.message
  } else if (action === "reactivate") {
    const { error: e } = await supabase.from("user_profiles")
      .update({ is_suspended: false, suspended_at: null, suspended_until: null, suspended_reason: null, suspended_by: null, updated_at: now })
      .in("id", userIds)
    error = e?.message
  } else if (action === "suspend") {
    // Garde-fou : ne jamais suspendre un administrateur via une action groupée.
    const { error: e } = await supabase.from("user_profiles")
      .update({ is_suspended: true, suspended_at: now, suspended_reason: "Action groupée admin", suspended_by: admin.userId, updated_at: now })
      .in("id", userIds)
      .neq("is_admin", true)
    error = e?.message
  }

  if (error) return { success: false, count: 0, error }

  await logAdminAction(supabase, admin, {
    action: `user.bulk_${action}`,
    targetType: "user",
    targetLabel: `${userIds.length} utilisateur(s)`,
    details: { action, count: userIds.length },
  })
  return { success: true, count: userIds.length }
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

/**
 * Accorde ou révoque le statut Pro d'un utilisateur.
 *
 * IMPORTANT : n'écrit PAS `user_profiles.is_premium` directement. Depuis la
 * migration 20260823, cette colonne est DÉRIVÉE de la table `subscriptions`
 * par le trigger `sync_is_premium` — une écriture manuelle serait écrasée au
 * prochain changement d'abonnement et créerait un état incohérent
 * (is_premium = true sans abonnement correspondant).
 *
 * L'octroi administratif crée un abonnement PRO_MONTHLY sans échéance
 * (`end_date = null` = actif tant qu'il n'est pas révoqué). La révocation passe
 * l'abonnement en CANCELLED. Dans les deux cas, le trigger met `is_premium` à
 * jour automatiquement. Les paiements réels restent tracés dans
 * `payment_transactions`.
 */
export async function toggleUserPremium(userId: string, isPremium: boolean) {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }
  const supabase = await createAdminClient()
  const now = new Date().toISOString()

  const { error } = isPremium
    ? await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          tier: "PRO_MONTHLY",
          status: "ACTIVE",
          start_date: now,
          end_date: null,      // octroi administratif : pas d'échéance
          auto_renew: false,
          updated_at: now,
        },
        { onConflict: "user_id" },
      )
    : await supabase
        .from("subscriptions")
        .update({ status: "CANCELLED", updated_at: now })
        .eq("user_id", userId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction(supabase, admin, {
    action: isPremium ? "subscription.grant_pro" : "subscription.revoke_pro",
    targetType: "user",
    targetId: userId,
    details: { tier: isPremium ? "PRO_MONTHLY" : null, source: "admin" },
  })

  return { success: true }
}

/** Abonnement courant d'un utilisateur (lecture seule, pour la fiche admin). */
export async function getUserSubscription(userId: string): Promise<{
  tier: string
  status: string
  start_date: string | null
  end_date: string | null
  auto_renew: boolean
} | null> {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier, status, start_date, end_date, auto_renew")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) return null
  return data as {
    tier: string
    status: string
    start_date: string | null
    end_date: string | null
    auto_renew: boolean
  }
}

/** Dernières transactions de paiement d'un utilisateur (traçabilité support). */
export async function getUserPayments(userId: string, limit = 10) {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from("payment_transactions")
    .select("id, amount, currency, provider, provider_ref, type, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data
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
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_id, first_name, last_name, email, is_admin")
    .eq("id", userId)
    .single()

  if (profileError || !profile?.user_id) {
    return { success: false, error: profileError?.message || "Utilisateur introuvable" }
  }

  // Garde-fous : jamais se supprimer soi-même ni un autre administrateur.
  if (profile.user_id === admin.userId) {
    return { success: false, error: "Vous ne pouvez pas supprimer votre propre compte." }
  }
  if (profile.is_admin) {
    return { success: false, error: "Impossible de supprimer un administrateur. Révoquez d'abord son rôle." }
  }

  const { error } = await supabase.auth.admin.deleteUser(profile.user_id)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction(supabase, admin, {
    action: "user.delete",
    targetType: "user",
    targetId: profile.user_id,
    targetLabel: label(profile.first_name, profile.last_name, profile.email, userId),
  })

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
//  P0 ADMIN — Suspension, rôles & journal d'audit
// ─────────────────────────────────────────────────────────────────────────────

type ServiceClient = Awaited<ReturnType<typeof createAdminClient>>

function label(first?: string | null, last?: string | null, email?: string | null, fallback = "?") {
  return `${first ?? ""} ${last ?? ""}`.trim() || email || fallback
}

/** Écrit une entrée dans admin_audit_log. Ne fait jamais échouer l'action métier. */
async function logAdminAction(
  supabase: ServiceClient,
  admin: AdminSessionProfile,
  entry: {
    action: string
    targetType?: string
    targetId?: string
    targetLabel?: string
    details?: Record<string, unknown>
  },
): Promise<void> {
  try {
    await supabase.from("admin_audit_log").insert({
      admin_id: admin.userId,
      admin_email: admin.email,
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      target_label: entry.targetLabel ?? null,
      details: entry.details ?? {},
    })
  } catch (e) {
    console.error("[audit] échec d'écriture:", entry.action, e)
  }
}

/** Suspend un utilisateur (réversible). `days` null/absent = suspension permanente. */
export async function suspendUser(
  userId: string,
  opts?: { reason?: string; days?: number | null },
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }

  const { data: target } = await supabase
    .from("user_profiles")
    .select("id, user_id, first_name, last_name, email, is_admin")
    .eq("id", userId)
    .single()

  if (!target?.user_id) return { success: false, error: "Utilisateur introuvable" }
  if (target.user_id === admin.userId) return { success: false, error: "Vous ne pouvez pas vous suspendre vous-même." }
  if (target.is_admin) return { success: false, error: "Impossible de suspendre un administrateur. Révoquez d'abord son rôle." }

  const until = opts?.days && opts.days > 0
    ? new Date(Date.now() + opts.days * 86_400_000).toISOString()
    : null

  const { error } = await supabase
    .from("user_profiles")
    .update({
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspended_until: until,
      suspended_reason: opts?.reason ?? null,
      suspended_by: admin.userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, admin, {
    action: "user.suspend",
    targetType: "user",
    targetId: target.user_id,
    targetLabel: label(target.first_name, target.last_name, target.email, userId),
    details: { reason: opts?.reason ?? null, until },
  })
  return { success: true }
}

/** Réactive un utilisateur suspendu. */
export async function reactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }

  const { data: target } = await supabase
    .from("user_profiles")
    .select("id, user_id, first_name, last_name, email")
    .eq("id", userId)
    .single()

  if (!target?.user_id) return { success: false, error: "Utilisateur introuvable" }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      is_suspended: false,
      suspended_at: null,
      suspended_until: null,
      suspended_reason: null,
      suspended_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, admin, {
    action: "user.reactivate",
    targetType: "user",
    targetId: target.user_id,
    targetLabel: label(target.first_name, target.last_name, target.email, userId),
  })
  return { success: true }
}

/** Accorde ou révoque le rôle admin, avec garde-fous (dernier admin / soi-même). */
export async function toggleAdmin(
  userId: string,
  makeAdmin: boolean,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }

  const { data: target } = await supabase
    .from("user_profiles")
    .select("id, user_id, first_name, last_name, email, is_admin")
    .eq("id", userId)
    .single()

  if (!target?.user_id) return { success: false, error: "Utilisateur introuvable" }

  if (!makeAdmin) {
    if (target.user_id === admin.userId) {
      return { success: false, error: "Vous ne pouvez pas révoquer votre propre rôle admin." }
    }
    const { count } = await supabase
      .from("user_profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", true)
    if ((count ?? 0) <= 1) {
      return { success: false, error: "Impossible de révoquer le dernier administrateur." }
    }
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ is_admin: makeAdmin, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, admin, {
    action: makeAdmin ? "user.grant_admin" : "user.revoke_admin",
    targetType: "user",
    targetId: target.user_id,
    targetLabel: label(target.first_name, target.last_name, target.email, userId),
  })
  return { success: true }
}

/** Journal d'audit (lecture, réservé admin). */
export async function getAuditLog(params?: { limit?: number; action?: string }): Promise<AuditLogEntry[]> {
  const supabase = await createAdminClient()
  let query = supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(params?.limit ?? 200)

  if (params?.action && params.action !== "all") {
    query = query.eq("action", params.action)
  }

  const { data } = await query
  return (data as AuditLogEntry[]) || []
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
    .select("id, title, description, image_url, created_at, order_index, user_id, profile_id, status, rejection_reason, reviewed_at")
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
    const status: GalleryItem["status"] =
      item.status === "approved" || item.status === "rejected" ? item.status : "pending"

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
      status,
      rejection_reason: item.rejection_reason || null,
      reviewed_at: item.reviewed_at || null,
      reports: 0,
    }
  })
}

export async function approveGalleryItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { data: item, error: fetchError } = await supabase
    .from("project_gallery")
    .select("id, user_id, title")
    .eq("id", itemId)
    .single()

  if (fetchError || !item) {
    return { success: false, error: fetchError?.message || "Élément introuvable" }
  }

  const { error: updateError } = await supabase
    .from("project_gallery")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", itemId)

  if (updateError) {
    return { success: false, error: updateError.message }
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
    // Non bloquant : l'approbation est persistée, seule la notif a échoué.
    return { success: true, error: `Notification non envoyée : ${notificationError.message}` }
  }

  return { success: true }
}

export async function rejectGalleryItem(
  itemId: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { data: item, error: fetchError } = await supabase
    .from("project_gallery")
    .select("id, user_id, title")
    .eq("id", itemId)
    .single()

  if (fetchError || !item) {
    return { success: false, error: fetchError?.message || "Élément introuvable" }
  }

  const trimmedReason = reason?.trim() || null

  const { error: updateError } = await supabase
    .from("project_gallery")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      rejection_reason: trimmedReason,
    })
    .eq("id", itemId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  const reasonSuffix = trimmedReason ? ` Motif : ${trimmedReason}` : ""
  await supabase
    .from("notifications")
    .insert({
      user_id: item.user_id,
      type: "admin",
      title: "Élément retiré de la galerie",
      content: `Un élément ${item.title ? `“${item.title}” ` : ""}a été retiré de votre galerie par l'administration.${reasonSuffix}`,
      link: "/creer-profil",
    })

  return { success: true }
}

export async function deleteGalleryItem(itemId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("project_gallery")
    .delete()
    .eq("id", itemId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================================
// MODÉRATION — Hub & Signalements polymorphes (content_reports)
// ============================================================

export interface ModerationCounts {
  galleryPending: number
  reportsOpen: number
  reportsByType: {
    gallery: number
    message: number
    profile: number
  }
  totalPending: number
}

export interface ContentReport {
  id: string
  subject_type: "gallery" | "message" | "profile"
  subject_id: string
  reporter_id: string
  reporter_name: string
  reporter_email: string | null
  reason: string
  status: "open" | "resolved" | "dismissed"
  admin_note: string | null
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  subject_preview: string | null
}

interface ContentReportRow {
  id: string
  subject_type: "gallery" | "message" | "profile"
  subject_id: string
  reporter_id: string
  reason: string
  status: "open" | "resolved" | "dismissed"
  admin_note: string | null
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
}

/**
 * Compteurs agrégés de modération — utilisé par la sidebar (badge) et le hub.
 * Retourne toujours un objet valide même si la table content_reports n'est
 * pas encore déployée (fallback silencieux pour éviter de casser le layout).
 */
export async function getModerationCounts(): Promise<ModerationCounts> {
  const supabase = await createAdminClient()

  const [galleryRes, reportsRes] = await Promise.all([
    supabase
      .from("project_gallery")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("content_reports")
      .select("subject_type", { count: "exact" })
      .eq("status", "open"),
  ])

  const galleryPending = galleryRes.count ?? 0

  const reportsByType = { gallery: 0, message: 0, profile: 0 }
  let reportsOpen = 0
  if (!reportsRes.error && reportsRes.data) {
    reportsOpen = reportsRes.count ?? reportsRes.data.length
    for (const row of reportsRes.data as Array<{ subject_type: string }>) {
      if (row.subject_type === "gallery") reportsByType.gallery += 1
      else if (row.subject_type === "message") reportsByType.message += 1
      else if (row.subject_type === "profile") reportsByType.profile += 1
    }
  }

  return {
    galleryPending,
    reportsOpen,
    reportsByType,
    totalPending: galleryPending + reportsOpen,
  }
}

/**
 * Liste les signalements avec enrichissement du nom du reporter et un
 * aperçu textuel de la cible (titre galerie, extrait message, nom profil).
 */
export async function getContentReports(options?: {
  status?: "open" | "resolved" | "dismissed" | "all"
  subjectType?: "gallery" | "message" | "profile" | "all"
  limit?: number
}): Promise<ContentReport[]> {
  const supabase = await createAdminClient()
  const status = options?.status ?? "open"
  const subjectType = options?.subjectType ?? "all"
  const limit = Math.min(options?.limit ?? 100, 200)

  let query = supabase
    .from("content_reports")
    .select("id, subject_type, subject_id, reporter_id, reason, status, admin_note, resolved_at, resolved_by, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (status !== "all") query = query.eq("status", status)
  if (subjectType !== "all") query = query.eq("subject_type", subjectType)

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  const reports = data as ContentReportRow[]

  const reporterIds = Array.from(new Set(reports.map((r) => r.reporter_id)))
  const galleryIds = reports.filter((r) => r.subject_type === "gallery").map((r) => r.subject_id)
  const messageIds = reports.filter((r) => r.subject_type === "message").map((r) => r.subject_id)
  const profileIds = reports.filter((r) => r.subject_type === "profile").map((r) => r.subject_id)

  const [profilesRes, galleriesRes, messagesRes, subjectProfilesRes] = await Promise.all([
    reporterIds.length
      ? supabase
          .from("user_profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", reporterIds)
      : Promise.resolve({ data: [] as Array<{ user_id: string; first_name: string | null; last_name: string | null; email: string | null }> }),
    galleryIds.length
      ? supabase.from("project_gallery").select("id, title").in("id", galleryIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string | null }> }),
    messageIds.length
      ? supabase.from("messages").select("id, content").in("id", messageIds)
      : Promise.resolve({ data: [] as Array<{ id: string; content: string | null }> }),
    profileIds.length
      ? supabase
          .from("user_profiles")
          .select("id, first_name, last_name")
          .in("id", profileIds)
      : Promise.resolve({ data: [] as Array<{ id: string; first_name: string | null; last_name: string | null }> }),
  ])

  type ReporterRow = { user_id: string; first_name: string | null; last_name: string | null; email: string | null }
  type GalleryRow = { id: string; title: string | null }
  type MessageRow = { id: string; content: string | null }
  type SubjectProfileRow = { id: string; first_name: string | null; last_name: string | null }

  const reporterMap = new Map<string, ReporterRow>(
    ((profilesRes.data as ReporterRow[] | null) || []).map((p) => [p.user_id, p]),
  )
  const galleryMap = new Map<string, GalleryRow>(
    ((galleriesRes.data as GalleryRow[] | null) || []).map((g) => [g.id, g]),
  )
  const messageMap = new Map<string, MessageRow>(
    ((messagesRes.data as MessageRow[] | null) || []).map((m) => [m.id, m]),
  )
  const subjectProfileMap = new Map<string, SubjectProfileRow>(
    ((subjectProfilesRes.data as SubjectProfileRow[] | null) || []).map((p) => [p.id, p]),
  )

  return reports.map((r) => {
    const reporter = reporterMap.get(r.reporter_id)
    const reporterName = `${reporter?.first_name || ""} ${reporter?.last_name || ""}`.trim() || "Utilisateur"

    let preview: string | null = null
    if (r.subject_type === "gallery") {
      preview = galleryMap.get(r.subject_id)?.title || "(projet sans titre)"
    } else if (r.subject_type === "message") {
      const content = messageMap.get(r.subject_id)?.content || ""
      preview = content.length > 120 ? content.slice(0, 120) + "…" : content || "(message vide ou supprimé)"
    } else if (r.subject_type === "profile") {
      const p = subjectProfileMap.get(r.subject_id)
      preview = `${p?.first_name || ""} ${p?.last_name || ""}`.trim() || "(profil introuvable)"
    }

    return {
      id: r.id,
      subject_type: r.subject_type,
      subject_id: r.subject_id,
      reporter_id: r.reporter_id,
      reporter_name: reporterName,
      reporter_email: reporter?.email || null,
      reason: r.reason,
      status: r.status,
      admin_note: r.admin_note,
      resolved_at: r.resolved_at,
      resolved_by: r.resolved_by,
      created_at: r.created_at,
      subject_preview: preview,
    }
  })
}

export async function resolveContentReport(
  reportId: string,
  adminNote?: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminSession()
  if (!session) return { success: false, error: "Session admin requise" }
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("content_reports")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: session.userId,
      admin_note: adminNote?.trim() || null,
    })
    .eq("id", reportId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Action directe depuis un signalement : suspend l'auteur du contenu OU supprime
 * le contenu incriminé, puis clôture le signalement (résolu) + audit.
 */
export async function actOnReport(
  reportId: string,
  action: "suspend_author" | "delete_content",
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }

  const { data: report } = await supabase
    .from("content_reports")
    .select("id, subject_type, subject_id, reason")
    .eq("id", reportId)
    .single()
  if (!report) return { success: false, error: "Signalement introuvable" }

  // Résoudre l'auteur (user_profiles.id) selon le type de contenu.
  let authorProfileId: string | null = null
  if (report.subject_type === "profile") {
    authorProfileId = report.subject_id // subject_id EST déjà user_profiles.id
  } else if (report.subject_type === "gallery") {
    const { data: g } = await supabase.from("project_gallery").select("user_id").eq("id", report.subject_id).single()
    if (g?.user_id) {
      const { data: p } = await supabase.from("user_profiles").select("id").eq("user_id", g.user_id).single()
      authorProfileId = p?.id ?? null
    }
  } else if (report.subject_type === "message") {
    const { data: m } = await supabase.from("messages").select("sender_id").eq("id", report.subject_id).single()
    if (m?.sender_id) {
      const { data: p } = await supabase.from("user_profiles").select("id").eq("user_id", m.sender_id).single()
      authorProfileId = p?.id ?? null
    }
  }

  if (action === "delete_content") {
    if (report.subject_type === "gallery") {
      const { error } = await supabase.from("project_gallery").delete().eq("id", report.subject_id)
      if (error) return { success: false, error: error.message }
    } else if (report.subject_type === "message") {
      const { error } = await supabase.from("messages").delete().eq("id", report.subject_id)
      if (error) return { success: false, error: error.message }
    } else {
      return { success: false, error: "Suppression non applicable à un profil — utilisez « Suspendre l'auteur »." }
    }
  }

  if (action === "suspend_author") {
    if (!authorProfileId) return { success: false, error: "Auteur introuvable pour ce signalement." }
    const r = await suspendUser(authorProfileId, { reason: `Signalement : ${report.reason}`, days: null })
    if (!r.success) return r
  }

  // Clôture du signalement.
  await supabase.from("content_reports").update({
    status: "resolved",
    resolved_at: new Date().toISOString(),
    resolved_by: admin.userId,
    admin_note: action === "suspend_author" ? "Auteur suspendu depuis le signalement" : "Contenu supprimé depuis le signalement",
  }).eq("id", reportId)

  await logAdminAction(supabase, admin, {
    action: `report.${action}`,
    targetType: "report",
    targetId: reportId,
    targetLabel: `${report.subject_type} · ${report.reason}`,
    details: { subject_type: report.subject_type, subject_id: report.subject_id, authorProfileId },
  })

  return { success: true }
}

export async function dismissContentReport(
  reportId: string,
  adminNote?: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminSession()
  if (!session) return { success: false, error: "Session admin requise" }
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("content_reports")
    .update({
      status: "dismissed",
      resolved_at: new Date().toISOString(),
      resolved_by: session.userId,
      admin_note: adminNote?.trim() || null,
    })
    .eq("id", reportId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}


// ============================================================
// P2 — Broadcast / Annonces
// ============================================================

export type BroadcastSegment = "all" | "published" | "premium" | "verified" | "suspended"

/** Nombre estimé de destinataires d'un segment (portée) — sans transfert de données. */
export async function countSegment(segment: BroadcastSegment): Promise<{ count: number; error?: string }> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { count: 0, error: "Non autorisé" }

  let q = supabase.from("user_profiles").select("user_id", { count: "exact", head: true })
  if (segment === "published") q = q.eq("is_published", true)
  else if (segment === "premium") q = q.eq("is_premium", true)
  else if (segment === "verified") q = q.eq("is_verified", true)
  else if (segment === "suspended") q = q.eq("is_suspended", true)

  const { count, error } = await q
  if (error) return { count: 0, error: error.message }
  return { count: count ?? 0 }
}

export interface BroadcastResult {
  success: boolean
  /** Nombre de destinataires réellement notifiés. */
  count: number
  /** Nombre total de destinataires visés (pour distinguer un échec partiel). */
  total: number
  error?: string
}

/**
 * Cœur d'envoi (privé, sans session) : résolution du segment → insert notifications
 * → audit. Utilisé par l'envoi immédiat (admin) ET par le processeur planifié (cron).
 */
async function executeBroadcastCore(
  supabase: ServiceClient,
  input: { title: string; content: string; segment: BroadcastSegment; link?: string | null },
  actor: { userId: string | null; email: string | null },
): Promise<BroadcastResult & { broadcastId?: string }> {
  const title = input.title?.trim()
  const content = input.content?.trim()
  if (!title || !content) return { success: false, count: 0, total: 0, error: "Titre et message requis" }
  if (title.length > 120) return { success: false, count: 0, total: 0, error: "Titre trop long (120 max)" }

  // Résolution du segment → liste de user_id destinataires.
  let q = supabase.from("user_profiles").select("user_id")
  if (input.segment === "published") q = q.eq("is_published", true)
  else if (input.segment === "premium") q = q.eq("is_premium", true)
  else if (input.segment === "verified") q = q.eq("is_verified", true)
  else if (input.segment === "suspended") q = q.eq("is_suspended", true)

  const { data, error } = await q
  if (error) return { success: false, count: 0, total: 0, error: error.message }

  const userIds = Array.from(new Set(
    (data as { user_id: string | null }[]).map((r) => r.user_id).filter((v): v is string => !!v),
  ))
  const total = userIds.length
  if (!total) return { success: false, count: 0, total: 0, error: "Aucun destinataire pour ce segment" }

  const link = input.link?.trim() || null
  // Identifiant de campagne : corrèle l'annonce à ses notifications (taux de lecture).
  const broadcastId = crypto.randomUUID()
  const rows = userIds.map((uid) => ({ user_id: uid, type: "admin", title, content, link, broadcast_id: broadcastId }))

  // Insertion par lots pour éviter les payloads trop volumineux. En cas d'échec au
  // milieu, on remonte le nombre réellement envoyé (échec partiel explicite).
  const chunkSize = 500
  let sent = 0
  let sendError: string | undefined
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error: e } = await supabase.from("notifications").insert(chunk)
    if (e) { sendError = e.message; break }
    sent += chunk.length
  }

  // Journal d'audit : toujours tracé, avec le résultat réel (même partiel).
  try {
    await supabase.from("admin_audit_log").insert({
      admin_id: actor.userId,
      admin_email: actor.email,
      action: "broadcast",
      target_type: "segment",
      target_label: `${input.segment} · ${sent}/${total} destinataire(s)`,
      details: { title, segment: input.segment, count: sent, total, partial: sent < total, broadcast_id: broadcastId },
    })
  } catch (e) {
    console.error("[audit] échec d'écriture: broadcast", e)
  }

  if (sendError) {
    return { success: false, count: sent, total, broadcastId, error: `Échec partiel : ${sent}/${total} notifiés. ${sendError}` }
  }
  return { success: true, count: sent, total, broadcastId }
}

/** Envoie une notification (annonce) à tous les utilisateurs d'un segment. */
export async function broadcastAnnouncement(input: {
  title: string
  content: string
  segment: BroadcastSegment
  link?: string
}): Promise<BroadcastResult> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { success: false, count: 0, total: 0, error: "Non autorisé" }

  const title = input.title?.trim()
  if (!title || !input.content?.trim()) return { success: false, count: 0, total: 0, error: "Titre et message requis" }

  // Anti-double-envoi : refuse une annonce identique (même titre + segment) par le même
  // admin il y a moins de 2 minutes (protège contre le double-clic / retry).
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from("admin_audit_log")
    .select("details, created_at")
    .eq("action", "broadcast")
    .eq("admin_id", admin.userId)
    .gte("created_at", twoMinAgo)
    .order("created_at", { ascending: false })
    .limit(10)
  const isDuplicate = (recent as { details: { title?: string; segment?: string } | null }[] | null)?.some(
    (r) => r.details?.title === title && r.details?.segment === input.segment,
  )
  if (isDuplicate) {
    return { success: false, count: 0, total: 0, error: "Annonce identique déjà envoyée il y a moins de 2 minutes." }
  }

  const { success, count, total, error } = await executeBroadcastCore(
    supabase, input, { userId: admin.userId, email: admin.email },
  )
  return { success, count, total, error }
}

/** Nombre de notifications LUES par campagne (broadcast_id) → taux de lecture. */
export async function getBroadcastReadCounts(broadcastIds: string[]): Promise<Record<string, number>> {
  const ids = Array.from(new Set(broadcastIds.filter(Boolean)))
  if (!ids.length) return {}
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return {}

  const entries = await Promise.all(
    ids.map(async (id) => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("broadcast_id", id)
        .eq("is_read", true)
      return [id, count ?? 0] as const
    }),
  )
  return Object.fromEntries(entries)
}

// ============================================================
// P2 #11 — Programmation des annonces (scheduling)
// ============================================================

export interface ScheduledBroadcast {
  id: string
  title: string
  content: string
  segment: BroadcastSegment
  link: string | null
  scheduled_for: string
  status: "pending" | "sent" | "failed" | "canceled"
  created_by: string | null
  created_by_email: string | null
  created_at: string
  sent_at: string | null
  result_count: number | null
  result_total: number | null
  error: string | null
}

/** Programme une annonce pour un envoi futur. */
export async function scheduleBroadcast(input: {
  title: string
  content: string
  segment: BroadcastSegment
  link?: string
  scheduledFor: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }

  const title = input.title?.trim()
  const content = input.content?.trim()
  if (!title || !content) return { success: false, error: "Titre et message requis" }
  if (title.length > 120) return { success: false, error: "Titre trop long (120 max)" }

  const when = new Date(input.scheduledFor)
  if (isNaN(when.getTime())) return { success: false, error: "Date de programmation invalide" }
  if (when.getTime() < Date.now() + 60_000) return { success: false, error: "Choisissez une date au moins 1 minute dans le futur" }

  const { error } = await supabase.from("scheduled_broadcasts").insert({
    title, content, segment: input.segment, link: input.link?.trim() || null,
    scheduled_for: when.toISOString(), status: "pending",
    created_by: admin.userId, created_by_email: admin.email,
  })
  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, admin, {
    action: "broadcast_schedule",
    targetType: "segment",
    targetLabel: `${input.segment} · ${when.toISOString()}`,
    details: { title, segment: input.segment, scheduled_for: when.toISOString() },
  })
  return { success: true }
}

/** Liste les annonces programmées (à venir d'abord, puis historique récent). */
export async function listScheduledBroadcasts(): Promise<ScheduledBroadcast[]> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return []
  const { data } = await supabase
    .from("scheduled_broadcasts")
    .select("*")
    .order("scheduled_for", { ascending: true })
    .limit(50)
  return (data as ScheduledBroadcast[]) || []
}

/** Annule une annonce programmée encore en attente. */
export async function cancelScheduledBroadcast(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }
  const { error } = await supabase
    .from("scheduled_broadcasts")
    .update({ status: "canceled" })
    .eq("id", id)
    .eq("status", "pending")
  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Processeur des annonces dues (status 'pending' ET scheduled_for <= now()).
 * ⚠️ Sans session : appelé exclusivement par la route cron protégée par CRON_SECRET.
 * Retourne le nombre de campagnes traitées.
 */
export async function processDueScheduledBroadcasts(): Promise<{ processed: number; sent: number; failed: number }> {
  const supabase = createServiceRoleClient()

  const { data: due } = await supabase
    .from("scheduled_broadcasts")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(20)

  const rows = (due as ScheduledBroadcast[]) || []
  let sent = 0
  let failed = 0

  for (const row of rows) {
    // Verrou léger anti-double-traitement : on passe la ligne à 'sent' AVANT l'envoi,
    // conditionné au fait qu'elle soit encore 'pending' (idempotent entre deux crons).
    const { data: locked } = await supabase
      .from("scheduled_broadcasts")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", "pending")
      .select("id")
    if (!locked || (locked as { id: string }[]).length === 0) continue // déjà pris par un autre run

    const res = await executeBroadcastCore(
      supabase,
      { title: row.title, content: row.content, segment: row.segment, link: row.link },
      { userId: row.created_by, email: row.created_by_email },
    )

    if (res.success) {
      sent++
      await supabase.from("scheduled_broadcasts")
        .update({ result_count: res.count, result_total: res.total })
        .eq("id", row.id)
    } else {
      failed++
      await supabase.from("scheduled_broadcasts")
        .update({ status: "failed", error: res.error ?? "Échec inconnu", result_count: res.count, result_total: res.total })
        .eq("id", row.id)
    }
  }

  return { processed: rows.length, sent, failed }
}

// ============================================================
// Campagnes ciblées — Annonce In-App & Mailing (multicritère)
// ============================================================

export interface AudienceCriteria {
  verified?: boolean       // is_verified = true
  premium?: boolean        // is_premium = true
  standard?: boolean       // is_premium = false
  newUsers?: boolean       // inscrits < 30 jours
  inactive?: boolean       // updated_at > 60 jours (approx. faute de last_seen)
  manualEmails?: string[]  // e-mails saisis à la main
  userIds?: string[]       // sélection via autocomplete
}

export interface CampaignRecipient {
  user_id: string | null
  email: string
  first_name: string | null
  last_name: string | null
}

/** Remplace {first_name} / {last_name} dans un gabarit. */
function personalizeTemplate(tpl: string, r: { first_name?: string | null; last_name?: string | null }): string {
  return tpl
    .replace(/\{\{?\s*first_name\s*\}?\}/gi, (r.first_name || "").trim())
    .replace(/\{\{?\s*last_name\s*\}?\}/gi, (r.last_name || "").trim())
}

/** Résout la liste des destinataires (critères cumulatifs AND + e-mails/IDs ajoutés en union). */
async function resolveAudience(supabase: ServiceClient, criteria: AudienceCriteria): Promise<CampaignRecipient[]> {
  const byEmail = new Map<string, CampaignRecipient>()
  const add = (r: CampaignRecipient) => {
    const key = r.email.trim().toLowerCase()
    if (!key) return
    if (!byEmail.has(key)) byEmail.set(key, { ...r, email: r.email.trim() })
  }

  const hasDbCriteria = !!(criteria.verified || criteria.premium || criteria.standard || criteria.newUsers || criteria.inactive)
  if (hasDbCriteria) {
    let q = supabase.from("user_profiles").select("user_id, email, first_name, last_name")
    if (criteria.verified) q = q.eq("is_verified", true)
    if (criteria.premium) q = q.eq("is_premium", true)
    if (criteria.standard) q = q.eq("is_premium", false)
    if (criteria.newUsers) q = q.gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    if (criteria.inactive) q = q.lt("updated_at", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
    const { data } = await q
    for (const r of (data as CampaignRecipient[] | null) || []) {
      if (r.email) add(r)
    }
  }

  // Union : utilisateurs sélectionnés par ID (autocomplete)
  if (criteria.userIds?.length) {
    const { data } = await supabase
      .from("user_profiles")
      .select("user_id, email, first_name, last_name")
      .in("user_id", criteria.userIds)
    for (const r of (data as CampaignRecipient[] | null) || []) {
      if (r.email) add(r)
    }
  }

  // Union : e-mails saisis manuellement (hors base éventuellement)
  for (const raw of criteria.manualEmails || []) {
    const email = raw.trim()
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      add({ user_id: null, email, first_name: null, last_name: null })
    }
  }

  return Array.from(byEmail.values())
}

/** Compteur d'audience en direct. */
export async function countAudience(criteria: AudienceCriteria): Promise<{ count: number; withAccount: number; error?: string }> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { count: 0, withAccount: 0, error: "Non autorisé" }
  const recipients = await resolveAudience(supabase, criteria)
  return { count: recipients.length, withAccount: recipients.filter((r) => r.user_id).length }
}

/** Autocomplete : recherche d'utilisateurs par nom/email pour ciblage manuel. */
export async function searchCampaignUsers(query: string): Promise<CampaignRecipient[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return []
  const { data } = await supabase
    .from("user_profiles")
    .select("user_id, email, first_name, last_name")
    .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
    .not("email", "is", null)
    .limit(8)
  return (data as CampaignRecipient[] | null) || []
}

export interface CampaignResult {
  success: boolean
  sent: number
  total: number
  failed?: number
  /** Destinataires écartés du mailing car non abonnés à la newsletter (opt-in). */
  skipped?: number
  error?: string
}

/**
 * Filtre opt-in newsletter pour le canal e-mail : ne conserve que les comptes
 * ayant activé les e-mails (notification_preferences.email_enabled = true).
 * Les e-mails saisis manuellement (sans compte) passent — saisie explicite de l'admin.
 */
async function filterEmailOptIn(
  supabase: ServiceClient,
  recipients: CampaignRecipient[],
): Promise<{ kept: CampaignRecipient[]; skipped: number }> {
  const withAccount = recipients.filter((r) => r.user_id)
  const manual = recipients.filter((r) => !r.user_id)

  const optedIn = new Set<string>()
  const ids = withAccount.map((r) => r.user_id as string)
  for (let i = 0; i < ids.length; i += 500) {
    const { data } = await supabase
      .from("notification_preferences")
      .select("user_id")
      .eq("email_enabled", true)
      .in("user_id", ids.slice(i, i + 500))
    for (const row of (data as { user_id: string }[] | null) || []) optedIn.add(row.user_id)
  }

  const kept = [...withAccount.filter((r) => optedIn.has(r.user_id as string)), ...manual]
  return { kept, skipped: recipients.length - kept.length }
}

/** Envoi d'une campagne : In-App (notifications) ou Mailing (e-mail via backend SMTP). */
export async function sendCampaign(input: {
  type: "inapp" | "email"
  subject: string
  html: string
  criteria: AudienceCriteria
}): Promise<CampaignResult> {
  const supabase = await createAdminClient()
  const admin = await requireAdminSession()
  if (!admin) return { success: false, sent: 0, total: 0, error: "Non autorisé" }

  const subject = input.subject?.trim()
  const html = input.html?.trim()
  if (!subject || !html) return { success: false, sent: 0, total: 0, error: "Objet et contenu requis" }

  const recipients = await resolveAudience(supabase, input.criteria)
  if (!recipients.length) return { success: false, sent: 0, total: 0, error: "Aucun destinataire pour cette sélection" }

  // ─── In-App : insertion de notifications personnalisées ───
  if (input.type === "inapp") {
    const accounts = recipients.filter((r) => r.user_id)
    if (!accounts.length) return { success: false, sent: 0, total: recipients.length, error: "Aucun destinataire avec un compte (l'In-App requiert un compte)" }

    const broadcastId = crypto.randomUUID()
    // Contenu texte (on retire le HTML pour la notification in-app).
    const baseText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    const rows = accounts.map((r) => ({
      user_id: r.user_id,
      type: "admin",
      title: personalizeTemplate(subject, r),
      content: personalizeTemplate(baseText, r),
      link: null,
      broadcast_id: broadcastId,
    }))

    let sent = 0
    let sendError: string | undefined
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from("notifications").insert(rows.slice(i, i + 500))
      if (error) { sendError = error.message; break }
      sent += Math.min(500, rows.length - i)
    }

    await logAdminAction(supabase, admin, {
      action: "campaign",
      targetType: "audience",
      targetLabel: `in-app · ${sent}/${accounts.length}`,
      details: { channel: "inapp", subject, count: sent, total: accounts.length, broadcast_id: broadcastId, criteria: input.criteria },
    })

    if (sendError) return { success: false, sent, total: accounts.length, error: `Échec partiel : ${sendError}` }
    return { success: true, sent, total: accounts.length }
  }

  // ─── Mailing : envoi direct via SMTP (Nodemailer), sans dépendance au backend ───
  if (!isSmtpConfigured()) {
    return { success: false, sent: 0, total: recipients.length, error: "SMTP non configuré — ajoutez SMTP_HOST / SMTP_USER / SMTP_PASS (+ EMAIL_FROM) à l'environnement de frontend-admin." }
  }

  // Vérifie connexion + authentification AVANT d'envoyer → erreur claire si config invalide.
  const check = await verifyTransport()
  if (!check.ok) {
    return { success: false, sent: 0, total: recipients.length, error: `Connexion SMTP échouée : ${check.error}` }
  }

  // CONFORMITÉ : opt-in newsletter — on n'écrit qu'aux comptes ayant activé
  // les e-mails ; les adresses saisies manuellement passent (choix explicite).
  const { kept, skipped } = await filterEmailOptIn(supabase, recipients)
  if (kept.length === 0) {
    return { success: false, sent: 0, total: recipients.length, skipped, error: "Aucun destinataire abonné à la newsletter dans cette sélection (opt-in requis)." }
  }

  try {
    const { sent, failed, firstError } = await sendBulkEmails(
      kept.map((r) => ({ email: r.email, first_name: r.first_name, last_name: r.last_name })),
      subject,
      html,
    )

    await logAdminAction(supabase, admin, {
      action: "campaign",
      targetType: "audience",
      targetLabel: `email · ${sent}/${kept.length}`,
      details: { channel: "email", subject, count: sent, total: kept.length, failed, skipped_opt_out: skipped, criteria: input.criteria },
    })

    if (sent === 0) {
      return { success: false, sent: 0, total: kept.length, failed, skipped, error: `Aucun e-mail envoyé (${failed} échec(s)) : ${firstError || "vérifiez la configuration SMTP."}` }
    }
    return { success: true, sent, failed, skipped, total: kept.length }
  } catch (e) {
    return { success: false, sent: 0, total: kept.length, skipped, error: e instanceof Error ? e.message : "Erreur SMTP" }
  }
}

// ============================================================
// P2 #10 — Fiche utilisateur détaillée
// ============================================================

export interface SubscriptionInfo {
  tier: string
  status: string
  start_date: string | null
  end_date: string | null
  auto_renew: boolean
}

export interface PaymentInfo {
  id: string
  amount: number
  currency: string
  provider: string
  provider_ref: string | null
  type: string
  status: string
  created_at: string
}

export interface UserDetail {
  reportsAbout: { id: string; reason: string; status: string; created_at: string }[]
  reportsFiledCount: number
  galleryCount: number
  auditTrail: AuditLogEntry[]
  /** Abonnement courant (null = offre gratuite). Source de verite de is_premium. */
  subscription: SubscriptionInfo | null
  /** Dernieres transactions de paiement (tracabilite support). */
  payments: PaymentInfo[]
}

/** Enrichissement d'un utilisateur pour la fiche détaillée (signalements, activité, historique admin). */
export async function getUserDetail(profileId: string, userId: string): Promise<UserDetail> {
  const supabase = await createAdminClient()

  const [aboutRes, filedRes, galleryRes, auditRes] = await Promise.all([
    supabase.from("content_reports")
      .select("id, reason, status, created_at")
      .eq("subject_type", "profile").eq("subject_id", profileId)
      .order("created_at", { ascending: false }).limit(10),
    supabase.from("content_reports").select("id", { count: "exact", head: true }).eq("reporter_id", userId),
    supabase.from("project_gallery").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("admin_audit_log").select("*").eq("target_id", userId).order("created_at", { ascending: false }).limit(10),
  ])

  // Monetisation : abonnement courant + dernieres transactions.
  const [subRes, payRes] = await Promise.all([
    supabase.from("subscriptions")
      .select("tier, status, start_date, end_date, auto_renew")
      .eq("user_id", userId).maybeSingle(),
    supabase.from("payment_transactions")
      .select("id, amount, currency, provider, provider_ref, type, status, created_at")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
  ])

  return {
    reportsAbout: (aboutRes.data as UserDetail["reportsAbout"]) || [],
    reportsFiledCount: filedRes.error ? 0 : (filedRes.count || 0),
    galleryCount: galleryRes.error ? 0 : (galleryRes.count || 0),
    auditTrail: (auditRes.data as AuditLogEntry[]) || [],
    subscription: (subRes.error ? null : (subRes.data as SubscriptionInfo | null)) ?? null,
    payments: (payRes.error ? [] : (payRes.data as PaymentInfo[])) || [],
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Modèles d'annonces réutilisables
//
// Une annonce envoyée ne laissait qu'une ligne dans admin_audit_log : illisible
// et impossible à rejouer. Un modèle conserve le texte ET le ciblage, pour que
// « renvoyer la même chose » ne demande pas de tout retaper.
// ═══════════════════════════════════════════════════════════════════════════

export interface MessageTemplate {
  id: string
  name: string
  channel: "inapp" | "email"
  subject: string
  content: string
  segment: string | null
  criteria: Record<string, unknown> | null
  link: string | null
  use_count: number
  last_used_at: string | null
  created_at: string
  updated_at: string
}

/** Modèles enregistrés, les plus récemment modifiés d'abord. */
export async function listTemplates(channel?: "inapp" | "email"): Promise<MessageTemplate[]> {
  const supabase = await createAdminClient()
  let query = supabase
    .from("message_templates")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50)
  if (channel) query = query.eq("channel", channel)

  const { data, error } = await query
  if (error) {
    console.error("[templates] lecture échouée:", error.message)
    return []
  }
  return (data as MessageTemplate[]) || []
}

/** Enregistre une annonce comme modèle réutilisable. */
export async function saveTemplate(input: {
  name: string
  channel: "inapp" | "email"
  subject: string
  content: string
  segment?: string | null
  criteria?: Record<string, unknown> | null
  link?: string | null
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }

  const name = input.name?.trim()
  const subject = input.subject?.trim()
  const content = input.content?.trim()
  if (!name || !subject || !content) {
    return { success: false, error: "Nom, objet et contenu sont requis" }
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from("message_templates")
    .insert({
      name,
      channel: input.channel,
      subject,
      content,
      segment: input.segment ?? null,
      criteria: input.criteria ?? null,
      link: input.link ?? null,
      created_by: admin.userId,
    })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, admin, {
    action: "template.save",
    targetType: "template",
    targetId: (data as { id: string }).id,
    targetLabel: name,
    details: { channel: input.channel },
  })

  return { success: true, id: (data as { id: string }).id }
}

/** Signale qu'un modèle vient d'être réutilisé (pour remonter les plus utiles). */
export async function markTemplateUsed(templateId: string): Promise<void> {
  try {
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from("message_templates").select("use_count").eq("id", templateId).maybeSingle()
    await supabase
      .from("message_templates")
      .update({
        use_count: ((data as { use_count: number } | null)?.use_count ?? 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", templateId)
  } catch (e) {
    // Un compteur manqué ne doit pas empêcher l'envoi.
    console.error("[templates] compteur non mis à jour:", e)
  }
}

/** Supprime un modèle. L'historique des envois n'est pas touché. */
export async function deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdminSession()
  if (!admin) return { success: false, error: "Non autorisé" }

  const supabase = await createAdminClient()
  const { error } = await supabase.from("message_templates").delete().eq("id", templateId)
  if (error) return { success: false, error: error.message }

  await logAdminAction(supabase, admin, {
    action: "template.delete", targetType: "template", targetId: templateId,
  })
  return { success: true }
}

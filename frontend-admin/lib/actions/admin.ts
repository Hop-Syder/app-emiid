"use server"

import { createAdminClient } from "@/lib/supabase/server"

// Types based on your Supabase schema
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

export interface DashboardStats {
  totalUsers: number
  publishedProfiles: number
  totalMessages: number
  usersByCountry: { country: string; count: number }[]
  recentUsers: UserProfile[]
  weeklyActivity: { day: string; users: number }[]
}

// Fetch dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createAdminClient()

  // Get total users count
  const { count: totalUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })

  // Get published profiles count
  const { count: publishedProfiles } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  // Get total messages count
  const { count: totalMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })

  // Get users by country
  const { data: usersByCountryData } = await supabase
    .from("user_profiles")
    .select("country_id, countries(name)")
    .not("country_id", "is", null)

  const countryMap = new Map<string, number>()
  usersByCountryData?.forEach((user: any) => {
    // Handle case where countries might be interpreted as an array by PostgREST
    const country = Array.isArray(user.countries) ? user.countries[0] : user.countries
    const countryName = country?.name || "Inconnu"
    countryMap.set(countryName, (countryMap.get(countryName) || 0) + 1)
  })

  const usersByCountry = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  // Get recent users (last 5)
  const { data: recentUsers } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate weekly activity (last 7 days)
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
  }
}

// Fetch all users with filters
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

// Update user profile
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

// Toggle user publish status
export async function toggleUserPublished(
  userId: string,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { is_published: isPublished })
}

// Toggle user verified status
export async function toggleUserVerified(
  userId: string,
  isVerified: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { is_verified: isVerified })
}

// Toggle user premium status
export async function toggleUserPremium(
  userId: string,
  isPremium: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { is_premium: isPremium })
}

// Delete user
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from("user_profiles")
    .delete()
    .eq("id", userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Get countries
export async function getCountries(): Promise<Country[]> {
  const supabase = await createAdminClient()

  const { data } = await supabase
    .from("countries")
    .select("*")
    .order("name", { ascending: true })

  return (data as Country[]) || []
}

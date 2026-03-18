import { getDashboardStats } from "@/lib/actions/admin"
import { DashboardClient } from "@/components/dashboard-client"

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  
  return <DashboardClient initialStats={stats} />
}

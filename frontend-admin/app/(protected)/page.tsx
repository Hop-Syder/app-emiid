import { getDashboardStats } from "@/lib/actions/admin"
import { DashboardClient } from "@/components/dashboard-client"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  try {
    const stats = await getDashboardStats()
    return <DashboardClient initialStats={stats} />
  } catch (error: any) {
    // Si l'erreur est liée à l'absence de session (UNAUTHORIZED_ADMIN), on redirige vers le login.
    // Cela évite le bug de rendu concurrent Next.js où la page crash avant le redirect du layout.
    if (error?.message === "UNAUTHORIZED_ADMIN") {
      redirect("/login")
    }
    
    // Si c'est une autre erreur (ex: variables d'env manquantes), on l'affiche ou on retourne un state fallback
    console.error("Erreur critique sur le dashboard admin:", error)
    throw error // Laisse Next.js gérer via le Error Boundary (ou l'erreur générique 500)
  }
}

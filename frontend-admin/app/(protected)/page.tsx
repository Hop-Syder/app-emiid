import { getDashboardStats } from "@/lib/actions/admin"
import { DashboardClient } from "@/components/dashboard-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  try {
    const stats = await getDashboardStats()
    return <DashboardClient initialStats={stats} />
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') throw error;

    // Si l'erreur est liée à l'absence de session (UNAUTHORIZED_ADMIN), on redirige vers le login.
    if (error?.message === "UNAUTHORIZED_ADMIN") {
      redirect("/login")
    }
    
    // Si c'est une autre erreur (ex: variables d'env manquantes), on ne throw pas pour laisser
    // le layout afficher son propre message d'erreur d'initialisation.
    console.error("Erreur critique sur le dashboard admin:", error)
    return <div className="p-8 text-center text-red-500 font-medium">Le chargement des statistiques a échoué. Vérifiez vos variables d'environnement Supabase.</div>
  }
}

import { redirect } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { requireAdminSession } from "@/lib/supabase/server"
import { getModerationCounts } from "@/lib/actions/admin"

export const dynamic = "force-dynamic"

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let adminSession = null
  let initError = null

  try {
    adminSession = await requireAdminSession()
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    
    console.error("Erreur d'initialisation session admin (Variables d'env ?):", err)
    initError = err.message || "Erreur Supabase"
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg border border-red-100">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de Configuration Serveur</h1>
          <p className="mb-4">Le panel d'administration n'a pas pu se connecter à Supabase.</p>
          <pre className="bg-slate-100 p-4 rounded-lg text-sm text-red-800 break-words mb-4">
            {initError}
          </pre>
          <p className="text-sm text-slate-500">
            Veuillez vérifier que les variables d'environnement (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) sont bien configurées sur votre hébergeur (Vercel).
          </p>
        </div>
      </div>
    )
  }

  if (!adminSession) {
    redirect("/login")
  }

  const moderationCounts = await getModerationCounts().catch(() => ({
    galleryPending: 0,
    reportsOpen: 0,
    reportsByType: { gallery: 0, message: 0, profile: 0 },
    totalPending: 0,
  }))

  return (
    <AdminLayout adminProfile={adminSession} moderationCounts={moderationCounts}>
      {children}
    </AdminLayout>
  )
}

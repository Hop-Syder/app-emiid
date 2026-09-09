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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-lg border border-red-100 dark:border-red-900/40">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Erreur de Configuration Serveur</h1>
          <p className="mb-4">Le panel d'administration n'a pas pu se connecter à Supabase.</p>
          <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm text-red-800 dark:text-red-300 break-words mb-4 whitespace-pre-wrap overflow-x-auto">
            {initError}
          </pre>
          <p className="text-sm text-slate-500 dark:text-slate-400">
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

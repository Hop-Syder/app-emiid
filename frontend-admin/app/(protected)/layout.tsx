import { redirect } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { requireAdminSession } from "@/lib/supabase/server"
import { getModerationCounts } from "@/lib/actions/admin"

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const adminSession = await requireAdminSession()

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

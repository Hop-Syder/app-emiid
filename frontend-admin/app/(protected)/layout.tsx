import { redirect } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { requireAdminSession } from "@/lib/supabase/server"

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const adminSession = await requireAdminSession()

  if (!adminSession) {
    redirect("/login")
  }

  return <AdminLayout adminProfile={adminSession}>{children}</AdminLayout>
}

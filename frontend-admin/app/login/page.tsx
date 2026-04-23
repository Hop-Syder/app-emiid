import { Suspense } from "react"
import { AdminLoginForm } from "@/components/auth/admin-login-form"

export const metadata = {
  title: "Connexion | EmiID Admin",
  description: "Connexion administrateur EmiID",
}

export const dynamic = "force-dynamic"

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-lg">
            Chargement de la connexion admin...
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}

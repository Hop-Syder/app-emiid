import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Admin",
  description: "Cockpit d'administration Nexus Connect",
};

import { AdminLayout } from "@/components/admin-layout";
import { Toaster } from "sonner";
import { ShieldAlert } from "lucide-react";
import { requireAdminSession } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminSession = await requireAdminSession()

  return (
    <html lang="fr">
      <body className="antialiased font-sans bg-slate-50">
        {adminSession ? (
          <AdminLayout adminProfile={adminSession}>
            {children}
          </AdminLayout>
        ) : (
          <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">Accès administrateur requis</h1>
                <p className="text-sm text-slate-500">
                  Connectez-vous avec un compte administrateur depuis l’application principale, puis revenez sur ce cockpit.
                </p>
              </div>
            </div>
          </main>
        )}
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  );
}

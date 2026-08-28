/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Layout pour la page des notifications avec NavigationShell
 * @created 2026-06-02
 * @updated 2026-06-02
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import type { Metadata } from "next"
import { ProtectedShell } from "@/components/navigation/protected-shell"

// Page privée → exclue de l'indexation.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedShell>{children}</ProtectedShell>
  )
}

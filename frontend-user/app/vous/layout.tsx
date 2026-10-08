/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet « Vous » (connecté) — page privée, exclue de l'indexation.
 * @created 2026-10-09
 */

import type { Metadata } from "next"
import { ProtectedShell } from "@/components/navigation/protected-shell"

export const metadata: Metadata = {
  title: "Vous | EmiID",
  robots: { index: false, follow: false },
}

export default function VousLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>
}

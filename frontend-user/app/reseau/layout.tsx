/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Réseau (connecté) — page privée, exclue de l'indexation.
 * @created 2026-10-09
 */

import type { Metadata } from "next"
import { ProtectedShell } from "@/components/navigation/protected-shell"

export const metadata: Metadata = {
  title: "Réseau | EmiID",
  robots: { index: false, follow: false },
}

export default function ReseauLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>
}

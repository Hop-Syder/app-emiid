import type { Metadata } from "next"
import { ProtectedShell } from "@/components/navigation/protected-shell"

// Page privée → exclue de l'indexation.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function ParametresLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedShell>{children}</ProtectedShell>
    )
}

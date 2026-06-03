import { ProtectedShell } from "@/components/navigation/protected-shell"

export default function PortefeuilleLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedShell>{children}</ProtectedShell>
    )
}

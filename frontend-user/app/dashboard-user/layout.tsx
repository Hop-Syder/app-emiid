import { ProtectedShell } from "@/components/navigation/protected-shell"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedShell>{children}</ProtectedShell>
    )
}

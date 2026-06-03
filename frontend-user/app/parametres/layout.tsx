import { ProtectedShell } from "@/components/navigation/protected-shell"

export default function ParametresLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedShell>{children}</ProtectedShell>
    )
}

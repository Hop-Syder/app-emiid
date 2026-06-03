import { ProtectedShell } from "@/components/navigation/protected-shell"

export default function MessagesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedShell>
            <div className="h-[calc(100vh-80px)] md:h-screen w-full bg-slate-50 overflow-hidden flex flex-col">
                {children}
            </div>
        </ProtectedShell>
    )
}

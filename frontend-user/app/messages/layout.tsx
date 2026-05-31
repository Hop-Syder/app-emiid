import { NavigationShell } from "@/components/navigation/navigation-shell"

export default function MessagesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NavigationShell>
            {children}
        </NavigationShell>
    )
}

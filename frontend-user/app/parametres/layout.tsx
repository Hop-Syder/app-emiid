import { NavigationShell } from "@/components/navigation/navigation-shell"

export default function ParametresLayout({
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

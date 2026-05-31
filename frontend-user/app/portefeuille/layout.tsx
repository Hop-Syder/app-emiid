import { NavigationShell } from "@/components/navigation/navigation-shell"

export default function PortefeuilleLayout({
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

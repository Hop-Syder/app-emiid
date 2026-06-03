import { PinGate } from "@/components/PinGate"
import { NavigationShell } from "@/components/navigation/navigation-shell"

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <NavigationShell isPublic={false}>
      <PinGate>{children}</PinGate>
    </NavigationShell>
  )
}

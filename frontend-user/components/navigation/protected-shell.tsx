import { PinGate } from "@/components/PinGate"
import { NavigationShell } from "@/components/navigation/navigation-shell"
import { ProfileCompletionGuard } from "@/components/navigation/profile-completion-guard"

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <NavigationShell isPublic={false}>
      <PinGate>
        <ProfileCompletionGuard>{children}</ProfileCompletionGuard>
      </PinGate>
    </NavigationShell>
  )
}

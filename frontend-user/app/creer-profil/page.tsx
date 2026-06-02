/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de création de profil (vendeur/professionnel)
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { CreerProfilContent } from "@/components/creer-profil-content"
import { NavigationShell } from "@/components/navigation/navigation-shell"

export default function CreateProfilePage() {
  return (
    <NavigationShell isPublic={false}>
      <div className="flex-1 w-full min-h-screen flex flex-col pt-8">
        <CreerProfilContent />
      </div>
    </NavigationShell>
  )
}


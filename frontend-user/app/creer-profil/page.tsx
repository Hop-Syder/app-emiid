/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de création de profil (vendeur/professionnel)
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { Suspense } from "react"
import { CreerProfilContent } from "@/components/creer-profil-content"
import { ProtectedShell } from "@/components/navigation/protected-shell"
import { Preloader } from "@/components/Preloader"

export default function CreateProfilePage() {
  return (
    <ProtectedShell>
      <div className="flex-1 w-full min-h-screen flex flex-col pt-8">
        <Suspense fallback={<Preloader text="Initialisation du profil..." />}>
          <CreerProfilContent />
        </Suspense>
      </div>
    </ProtectedShell>
  )
}

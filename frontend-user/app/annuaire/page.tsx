/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page principale de l'annuaire global (Artisans, Freelances, Entreprises, ONG)
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { EmiIDLayout } from "@/components/menu/emiid-layout"
import { AnnuairePublicContent } from "@/components/annuaire-public-content/annuaire-main"

export default function AnnuairePage() {
    return (
        <EmiIDLayout>
            <AnnuairePublicContent />
        </EmiIDLayout>
    )
}

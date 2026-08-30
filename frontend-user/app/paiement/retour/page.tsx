/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Route « Retour de paiement » — destination du callback_url FedaPay
 *              (abonnement Pro et boosts). Réconcilie le statut réel de la
 *              transaction après le webhook signé.
 * @created 2026-08-26
 * 🌐 ceo.nexuspartners.xyz
 */

import { Suspense } from "react"
import type { Metadata } from "next"
import { Loader2 } from "lucide-react"
import { PaiementRetourContent } from "@/components/paiement/paiement-retour-content"

export const metadata: Metadata = {
    title: "Retour de paiement — EmiID",
}

export default function PaiementRetourPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen w-full flex items-center justify-center bg-[#000616]">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <PaiementRetourContent />
        </Suspense>
    )
}

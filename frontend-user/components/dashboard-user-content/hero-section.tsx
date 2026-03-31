"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function HeroSection() {
    const router = useRouter()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-xl p-8 text-white min-h-[300px] flex flex-col justify-center"
            style={{
                backgroundImage: 'url(/dashboard-user/background-1.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40 rounded-xl" />

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-4">
                    <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Réseau Pan-Africain</Badge>
                    <h2 className="text-4xl font-bold">Bienvenue sur Nexus Connect</h2>
                    <p className="max-w-[600px] text-white/90 text-lg">
                        Cartographier et propulser 100 000 acteurs économiques ouest-africains d&apos;ici 2027. Connectez-vous avec des
                        entrepreneurs, artisans et institutions à travers l&apos;Afrique de l&apos;Ouest.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            className="rounded-xl bg-white text-primary hover:bg-white/90 px-6 h-11"
                            onClick={() => router.push("/annuaire")}
                        >
                            Explorer l&apos;Annuaire
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl bg-transparent border-white text-white hover:bg-white/10 px-6 h-11"
                            onClick={() => router.push("/creer-profil")}
                        >
                            Créer mon Profil
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

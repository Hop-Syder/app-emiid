/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hero section pour l'annuaire global
 * @created 2026-01-25
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { motion } from "framer-motion"
import { Grid, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface AnnuaireHeroProps {
    title?: string;
    description?: string;
}

export function AnnuaireHero({
    title = "Découvrez les Talents de l'Afrique de l'Ouest",
    description = "Explorez notre réseau dynamique regroupant artisans, commerçants, freelances, entreprises, agences, startup et ONG. Trouvez les partenaires et experts dont vous avez besoin pour développer votre activité."
}: AnnuaireHeroProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-xl p-8 mb-8 text-white min-h-[250px] flex flex-col justify-center bg-[#022753]"
        >
            <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'url(/dashboard/background-1.svg)', backgroundSize: 'cover' }} />

            <div className="relative z-10 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-400">
                        <Grid className="w-6 h-6" />
                        <span className="font-semibold uppercase tracking-wider text-sm">Annuaire EmiID</span>
                    </div>
                    <h1 className="text-4xl font-bold">{title}</h1>
                    <p className="max-w-[700px] text-white/80 text-lg">
                        {description}
                    </p>
                </div>
                <div>
                    <Link href="/creer-profil">
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-11 px-6 font-semibold shadow-md">
                            Rejoindre l&apos;annuaire
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}

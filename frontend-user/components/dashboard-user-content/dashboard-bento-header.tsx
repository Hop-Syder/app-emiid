/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header Dashboard — hero épuré, salutation + accès rapides.
 *
 *              Refonte du 04/09 : le bloc a été allégé pour aller à l'essentiel.
 *              Retirés — le tag « Espace Membre » (qui n'apprenait rien à un
 *              utilisateur déjà connecté), l'image de fond (poids de chargement
 *              et contraste à gérer, pour un simple décor) et l'encart BAGBE.
 *              Le fond se limite désormais à la couleur de charte et deux halos.
 *
 *              16/09 : la barre de recherche (clavier + voix) a déménagé dans
 *              la barre latérale (`DesktopSidebarAuth`), accessible depuis
 *              tout l'espace connecté plutôt que le seul tableau de bord.
 *              Reste ici la salutation « Bonsoir, Prénom » et les deux accès
 *              rapides (profil, réalisations).
 * @created 2026-05-31
 * @updated 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight, Briefcase } from "lucide-react"
import { useEffect, useState } from "react"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { NotificationsBellLink } from "./notifications-bell-link"

export function DashboardBentoHeader() {
    const router = useRouter()
    const { session } = useCurrentUserProfile()

    // Salutation selon l'heure. Calculée après montage : l'heure du serveur
    // n'est pas celle du visiteur, la figer au rendu produirait un décalage
    // d'hydratation — et un « Bonjour » à 21 h.
    const [greeting, setGreeting] = useState("Bonjour")
    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Bonjour")
        else if (hour < 18) setGreeting("Bon après-midi")
        else setGreeting("Bonsoir")
    }, [])

    const userName =
        session?.user?.user_metadata?.first_name ||
        session?.user?.user_metadata?.name ||
        ""

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 26 } },
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full">
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#000616] shadow-xl"
            >
                {/* Décor : deux halos de charte, sans image de fond — rien à
                    télécharger, et le texte garde un contraste constant. */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#013ff4]/20 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#03b3f8]/15 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col justify-center min-h-[150px] sm:min-h-[170px] p-6 sm:p-7 md:p-8 gap-5 sm:gap-6">

                    {/* ── Salutation ───────────────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        <h1 className="min-w-0 flex-1 text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-tight text-white truncate">
                            {greeting}
                            {userName ? "," : ""}{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03b3f8] via-sky-200 to-white">
                                {userName || "Talent"}
                            </span>
                        </h1>

                        {/* Accès aux notifications, mobile uniquement. Il vivait
                            dans le cockpit personnel, désormais masqué sur petit
                            écran : sans ce relais, l'accès d'un geste
                            disparaissait avec lui. Le dock ne le propose qu'au
                            fond de son menu. */}
                        <NotificationsBellLink tone="dark" />
                    </div>

                    {/* ── Actions ──────────────────────────────────────────── */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <Button
                            size="sm"
                            className="flex-1 sm:flex-initial h-10 rounded-xl bg-card/[0.08] hover:bg-card/[0.15] border border-white/15 text-white font-semibold px-4 text-xs sm:text-sm backdrop-blur-md transition-all hover:border-white/30 shadow-sm"
                            onClick={() =>
                                router.push(session?.user?.id ? `/profil/${session.user.id}` : "/profil")
                            }
                        >
                            Mon Profil
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-sky-400" />
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1 sm:flex-initial h-10 rounded-xl bg-card/[0.08] hover:bg-card/[0.15] border border-white/15 text-white font-semibold px-4 text-xs sm:text-sm backdrop-blur-md transition-all hover:border-white/30 shadow-sm"
                            onClick={() => router.push("/portefeuille")}
                        >
                            <Briefcase className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
                            Mes réalisations
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

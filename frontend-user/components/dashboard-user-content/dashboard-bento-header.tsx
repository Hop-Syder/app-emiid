/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header Dashboard — Hero compact + Stats pills. Design Premium 2025.
 * @created 2026-05-31
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight, Briefcase } from "lucide-react"
import { useEffect, useState } from "react"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import Image from "next/image"

export function DashboardBentoHeader() {
    const router = useRouter()
    const { session } = useCurrentUserProfile()
    const [greeting, setGreeting] = useState("Bonjour")

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Bonjour")
        else if (hour < 18) setGreeting("Bon après-midi")
        else setGreeting("Bonsoir")
    }, [])

    const userName = session?.user?.user_metadata?.first_name || session?.user?.user_metadata?.name || ""

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 340, damping: 28 } }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
        >
            {/* ── HERO COMPACT ────────────────────────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl border border-white/10 shadow-xl bg-[url('/dashboard/background.jpg')] bg-cover bg-center min-h-[200px]"
            >
                {/* Overlay dégradé gauche → droite pour la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/75 to-slate-900/10" />
                {/* Vignette basse pour ancrer le contenu */}
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-slate-950/60 to-transparent" />

                {/* Layout vertical : salutation en haut, titre+actions en bas */}
                <div className="relative z-10 flex flex-col justify-between h-full px-8 md:px-12 pt-8 pb-8 gap-6">

                    {/* Ligne haute — sous-titre contextuel + signature fondateur */}
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/30 select-none flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Espace Membre
                        </p>
                        <div className="flex items-center gap-2 select-none shrink-0">
                            <span className="text-[10px] font-black tracking-[0.20em] uppercase text-white/50">BAGBE</span>
                            <span className="text-white/20 text-[10px]">·</span>
                            <Image 
                                src="/svg/Badge-fondateur.svg" 
                                alt="Badge Fondateur" 
                                title="Fondateur" 
                                width={16}
                                height={16}
                                className="size-4 object-contain opacity-80 hover:opacity-100 transition-opacity duration-200" 
                            />
                        </div>
                    </div>

                    {/* Ligne basse — titre grand + CTA alignés */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

                        {/* Titre plein écran */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05]">
                            {greeting}{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-white">
                                {userName || "Talent"}
                            </span>
                        </h1>

                        {/* Boutons ancrés en bas-droite */}
                        <div className="flex items-center gap-3 shrink-0 pb-0.5">
                            <Button
                                size="sm"
                                className="rounded-xl bg-white/8 hover:bg-white/15 border border-white/12 text-white/90 backdrop-blur-md font-semibold px-4 h-10 transition-all hover:border-white/25 text-sm"
                                onClick={() => router.push(session?.user?.id ? `/profil/${session.user.id}` : "/profil/me")}
                            >
                                Mon Profil
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5 opacity-50" />
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-xl bg-white text-slate-900 hover:bg-slate-50 font-bold px-5 h-10 shadow-xl transition-all hover:scale-[1.02] text-sm"
                                onClick={() => router.push("/portefeuille")}
                            >
                                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                                Mes réalisations
                            </Button>
                        </div>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    )
}

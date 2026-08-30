/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header Dashboard — Hero compact & épuré. Design Luxury & Lisibilité maximale.
 * @created 2026-05-31
 * @updated 2026-08-30
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
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 26 } }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full"
        >
            {/* ── HERO COMPACT & LISIBLE ────────────────────────────────── */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#000616] shadow-xl min-h-[180px] sm:min-h-[190px]"
            >
                {/* Image de fond avec overlay maîtrisé pour contraste 100% lisible */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/dashboard/background.jpg"
                        alt="EmiID Dashboard"
                        fill
                        sizes="100vw"
                        className="object-cover object-center opacity-25 mix-blend-luminosity"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#000616] via-[#000616]/90 to-[#000616]/75" />
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#013ff4]/20 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#03b3f8]/15 rounded-full blur-[100px]" />
                </div>

                {/* Contenu structuré et aéré */}
                <div className="relative z-10 flex flex-col justify-between h-full p-5 sm:p-7 md:p-8 gap-5 sm:gap-6">

                    {/* Ligne haute — Tag Espace Membre & Badge Fondateur */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/[0.06] border border-white/10 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-slate-300">
                                Espace Membre
                            </span>
                        </div>

                        <div className="flex items-center gap-2 bg-card/[0.04] border border-white/10 px-2.5 py-1 rounded-xl backdrop-blur-md shrink-0">
                            <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-slate-300">BAGBE</span>
                            <span className="text-white/30 text-xs">·</span>
                            <Image 
                                src="/svg/Badge-fondateur.svg" 
                                alt="Badge Fondateur" 
                                title="Fondateur" 
                                width={16}
                                height={16}
                                className="w-4 h-4 object-contain" 
                            />
                        </div>
                    </div>

                    {/* Ligne principale — Salutation + Actions */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-5">
                        
                        {/* Titre percutant et ultra-lisible */}
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black text-white tracking-tight leading-tight">
                                {greeting}{userName ? "," : ""}{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03b3f8] via-sky-200 to-white">
                                    {userName || "Talent"}
                                </span>
                            </h1>
                            <p className="text-xs sm:text-sm font-medium text-slate-300/90">
                                Bienvenue sur votre hub d&apos;opportunités professionnelles.
                            </p>
                        </div>

                        {/* Boutons d'action modernes et ergonomiques */}
                        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0 pt-1">
                            <Button
                                size="sm"
                                className="flex-1 sm:flex-initial h-10 sm:h-11 rounded-xl bg-card/[0.08] hover:bg-card/[0.15] border border-white/15 text-white font-semibold px-4 text-xs sm:text-sm backdrop-blur-md transition-all hover:border-white/30 shadow-sm"
                                onClick={() => router.push(session?.user?.id ? `/profil/${session.user.id}` : "/profil/me")}
                            >
                                Mon Profil
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-sky-400" />
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1 sm:flex-initial h-10 sm:h-11 rounded-xl bg-gradient-to-r from-[#013ff4] to-[#03b3f8] hover:from-[#0135d0] hover:to-[#029ad7] text-white font-bold px-4 sm:px-5 text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
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

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant Preloader global animé et réutilisable (logo EmiID + anneaux glassmorphism)
 * @created 2026-06-03
 * @updated 2026-06-21
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface PreloaderProps {
    text?: string
    subtext?: string
    minHeight?: string
    className?: string
}

export function Preloader({
    text = "Initialisation",
    subtext = "EmiID • Votre empreinte numérique professionnelle",
    minHeight = "min-h-[75vh]",
    className
}: PreloaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center relative overflow-hidden px-4 w-full", minHeight, className)}>
            {/* Glow d'ambiance en arrière-plan */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[350px] sm:h-[350px] bg-gradient-to-tr from-primary/10 via-secondary/5 to-secondary/10 rounded-full blur-3xl animate-pulse" />

            <div className="z-10 flex flex-col items-center gap-6 sm:gap-8 max-w-md w-full">
                {/* Anneaux + logo central */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                    {/* Anneau extérieur rotatif rapide */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-t-primary/80 border-r-primary/40 border-b-transparent border-l-transparent"
                    />

                    {/* Anneau intermédiaire rotatif lent et inversé */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border-2 border-b-secondary/50 border-l-secondary/30 border-t-transparent border-r-transparent"
                    />

                    {/* Disque central en verre poli avec le LOGO EmiID */}
                    <motion.div
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-full bg-card/80 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_10px_30px_rgba(0,0,0,0.06)] border border-white/50 flex items-center justify-center p-3"
                    >
                        <Image
                            src="/logo/logo-emiid.png"
                            alt="EmiID"
                            width={80}
                            height={80}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </motion.div>
                </div>

                {/* Textes animés de chargement */}
                <div className="text-center space-y-2">
                    <motion.p
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-xs font-black tracking-[0.25em] text-foreground uppercase"
                    >
                        {text}
                    </motion.p>
                    <p className="text-[11px] font-bold tracking-widest text-muted-foreground/80 uppercase">
                        {subtext}
                    </p>
                </div>
            </div>
        </div>
    )
}

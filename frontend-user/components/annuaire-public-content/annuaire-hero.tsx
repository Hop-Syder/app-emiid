"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Star, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Image from "next/image"

interface AnnuaireHeroProps {
    title?: string;
    description?: string;
}

export function AnnuaireHero({
    title = "Découvrez les Talents de l'Afrique",
    description = "Explorez notre réseau dynamique regroupant artisans, commerçants, freelances, entreprises, agences, startups et ONG."
}: AnnuaireHeroProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Optimisation : Utiliser le bounding client rect si nécessaire, mais ici on garde le global
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
            {/* =========================================
                BLOC PRINCIPAL (70%) - MESSAGE & CTA
                ========================================= */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-3xl px-8 md:px-12 py-8 md:py-10 text-white min-h-[200px] flex flex-col justify-center bg-slate-950 border border-white/10 group lg:col-span-8"
            >
                {/* Aurora Background Effects */}
                <div className="absolute inset-0 bg-slate-950" />
                <div
                    className="absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-60 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(30, 64, 175, 0.5) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.4) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(125, 211, 252, 0.1) 0%, transparent 60%)',
                        filter: 'blur(60px)'
                    }}
                />

                {/* Interactive Glow tracking mouse */}
                <motion.div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    animate={{
                        background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`
                    }}
                    transition={{ type: 'tween', ease: 'linear', duration: 0 }}
                />

                {/* Grid Pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start text-left space-y-6 max-w-2xl">

                    {/* Main Content */}
                    <div className="space-y-3">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 leading-[1.1]"
                        >
                            {title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.7 }}
                            className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-xl"
                        >
                            {description}
                        </motion.p>
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="pt-2"
                    >
                        <Link href="/creer-profil">
                            <Button className="group relative overflow-hidden bg-white text-slate-950 hover:bg-slate-100 hover:text-slate-900 rounded-xl h-11 px-6 font-bold text-sm shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105">
                                <span className="relative z-10 flex items-center">
                                    Créer mon profil
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* =========================================
                BLOC SECONDAIRE (30%) - SPOTLIGHT TALENT
                ========================================= */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-950 border border-indigo-500/20 lg:col-span-4 p-6 flex flex-col justify-between group"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] group-hover:bg-indigo-400/30 transition-colors duration-500" />

                <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Talent à la Une</span>
                    </div>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                </div>

                <div className="relative z-10 mt-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-400/30 shadow-lg group-hover:scale-105 transition-transform duration-500">
                            <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center text-white">
                                <Sparkles className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-indigo-300 transition-colors">Profils vérifiés</h3>
                            <p className="text-indigo-200/70 text-xs font-medium mt-0.5">Une communauté de confiance</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            Rejoignez des milliers de professionnels qui font confiance à notre réseau pour développer leur activité.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

"use client"

import { motion } from "framer-motion"
import { Grid, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface AnnuaireHeroProps {
    title?: string;
    description?: string;
}

export function AnnuaireHero({
    title = "Découvrez les Talents de l'Afrique de l'Ouest",
    description = "Explorez notre réseau dynamique regroupant artisans, commerçants, freelances, entreprises, agences, startups et ONG."
}: AnnuaireHeroProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[2rem] p-8 md:p-14 mb-10 text-white min-h-[400px] flex flex-col justify-center bg-slate-950 border border-white/10 group"
        >
            {/* Aurora Background Effects */}
            <div className="absolute inset-0 bg-slate-950" />
            <div 
                className="absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-60"
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

            <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                {/* Floating Badge */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl"
                >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold uppercase tracking-widest text-xs text-slate-300">Annuaire Elite EmiID</span>
                </motion.div>

                {/* Main Content */}
                <div className="space-y-6">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 leading-tight"
                    >
                        {title}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.7 }}
                        className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                >
                    <Link href="/creer-profil">
                        <Button className="group relative overflow-hidden bg-white text-slate-950 hover:bg-slate-100 hover:text-slate-900 rounded-full h-14 px-8 font-bold text-base shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105">
                            <span className="relative z-10 flex items-center">
                                Rejoindre l&apos;annuaire
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    )
}

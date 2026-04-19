/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onboarding cinématographique avec design Neural Network et Glassmorphism
 * @created 2026-04-11
 * @updated 2026-04-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronRight, Globe, ShieldCheck, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"


const SLIDES = [
    {
        id: 1,
        title: "L'Excellence Nukun",
        subtitle: "L'élite du réseau professionnel africain.",
        description: "Connectez-vous à un écosystème de talents vérifiés et d'expertises réelles. Là où la vision rencontre l'opportunité.",
        icon: Globe,
        color: "from-blue-600/20 to-cyan-500/20",
        accent: "text-blue-400",
        glow: "bg-blue-500/10"
    },
    {
        id: 2,
        title: "Propulsez votre Impact",
        subtitle: "Votre expertise mérite le sommet.",
        description: "Créez une vitrine professionnelle d'élite, gagnez en visibilité et accédez à des partenariats stratégiques de haut niveau.",
        icon: Zap,
        color: "from-amber-600/20 to-orange-500/20",
        accent: "text-amber-400",
        glow: "bg-amber-500/10"
    },
    {
        id: 3,
        title: "Confiance & Sécurité",
        subtitle: "Un réseau filtré, sans bruit.",
        description: "Échangez dans un environnement sécurisé où chaque interaction est valorisée. La qualité prime sur la quantité.",
        icon: ShieldCheck,
        color: "from-emerald-600/20 to-teal-500/20",
        accent: "text-emerald-400",
        glow: "bg-emerald-500/10"
    },
]

export function OnboardingCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)
    const [isMounted, setIsMounted] = useState(false)
    const [nodes, setNodes] = useState<{ top: string; left: string; delay: number; duration: number }[]>([])

    useEffect(() => {
        setIsMounted(true)
        // Génère les positions uniquement côté client pour éviter l'erreur d'hydratation
        const generatedNodes = [...Array(15)].map(() => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 4
        }))
        setNodes(generatedNodes)
    }, [])

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            setDirection(1)
            setCurrentIndex(prev => prev + 1)
        }
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px)"
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px)"
        })
    }

    const currentSlide = SLIDES[currentIndex]

    return (
        <div className="relative w-full h-[100dvh] bg-[#020617] text-white flex flex-col justify-between overflow-hidden font-sans">

            {/* --- BACKGROUND NEURAL NETWORK SYSTEM --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.15),transparent_70%)]" />

                {/* Simulated Neural Nodes */}
                {isMounted && nodes.map((node, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.1, 0.3, 0.1],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: node.duration,
                            repeat: Infinity,
                            delay: node.delay
                        }}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            top: node.top,
                            left: node.left,
                            boxShadow: "0 0 10px rgba(255,255,255,0.5)"
                        }}
                    />
                ))}

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* --- HEADER PROGRESS --- */}
            <header className="relative z-50 p-8 flex justify-center">
                <div className="flex gap-3 w-32">
                    {SLIDES.map((_, index) => (
                        <div key={index} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                animate={{
                                    width: index === currentIndex ? "100%" : index < currentIndex ? "100%" : "0%",
                                    backgroundColor: index === currentIndex ? "#3b82f6" : "#1e40af"
                                }}
                                className="h-full"
                            />
                        </div>
                    ))}
                </div>
            </header>

            {/* --- MAIN CONTENT (ANIMATED) --- */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.4 }
                        }}
                        className="w-full max-w-lg"
                    >
                        {/* Glassmorphism Icon Container */}
                        <div className="relative mx-auto w-32 h-32 mb-10 group">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className={`absolute inset-0 rounded-3xl blur-2xl opacity-40 ${currentSlide.glow}`}
                            />
                            <div className="relative flex items-center justify-center w-full h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                                <currentSlide.icon className={`w-14 h-14 ${currentSlide.accent}`} />
                                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 opacity-50" />
                            </div>
                        </div>

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4"
                        >
                            <span className={`text-sm font-bold uppercase tracking-[0.3em] ${currentSlide.accent}`}>
                                {currentSlide.subtitle}
                            </span>
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[1.1]">
                                {currentSlide.title}
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed max-w-sm mx-auto font-medium">
                                {currentSlide.description}
                            </p>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* --- FOOTER CONTROLS --- */}
            <div className="relative p-8 pb-12 flex flex-col items-center gap-8 z-20 w-full max-w-md mx-auto">
                <div className="w-full">
                    {currentIndex === SLIDES.length - 1 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <Link href="/dashboard-public" className="w-full block">
                                <Button
                                    size="lg"
                                    className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] font-black text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    REJOINDRE NUKUN <ArrowRight className="ml-3 w-6 h-6" />
                                </Button>
                            </Link>
                            <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 italic">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
                                +10,000 Experts Connectés
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
                            </div>
                        </motion.div>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleNext}
                            className="w-full h-16 text-lg bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 border-b-white/20 rounded-2xl font-bold text-white transition-all group"
                        >
                            SUIVANT
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                </div>

                {/* Skip Link */}
                {currentIndex < SLIDES.length - 1 && (
                    <Link href="/dashboard-public" className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold tracking-wide">
                        Passer l&apos;introduction
                    </Link>
                )}
            </div>

            {/* Corner Decorative Blur */}
            <div className="absolute top-0 right-0 w-[50%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />
        </div>
    )
}


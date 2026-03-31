"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "framer-motion"
import { ArrowRight, ChevronRight, Users, Globe, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SLIDES = [
    {
        id: 1,
        title: "Le réseau professionnel basé sur la confiance.",
        description: "Nexus Connect structure l’écosystème africain en connectant talents, entreprises et organisations autour de profils vérifiés et d’expertises réelles.",
        image: "/onboarding/slide1.jpg",
        icon: Globe,
        color: "bg-primary",
    },
    {
        id: 2,
        title: "Votre expertise mérite d’être reconnue.",
        description: "Créez un profil professionnel crédible, mettez en avant vos compétences et gagnez en visibilité auprès d’acteurs sérieux.",
        image: "/onboarding/slide2.jpg",
        icon: Users,
        color: "bg-amber-500",
    },
    {
        id: 3,
        title: "Des connexions qualifiées, pas du bruit.",
        description: "Accédez à un réseau filtré, échangez avec des profils pertinents et développez des relations professionnelles durables.",
        image: "/onboarding/slide3.jpg",
        icon: BadgeCheck,
        color: "bg-emerald-500",
    },
]

export function OnboardingCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
    const [selectedIndex, setSelectedIndex] = useState(0)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on("select", onSelect)
        return () => {
            emblaApi.off("select", onSelect)
        }
    }, [emblaApi, onSelect])



    const handleNext = () => {
        if (emblaApi) emblaApi.scrollNext()
    }

    return (
        <div className="relative w-full h-[100dvh] bg-white flex flex-col justify-between overflow-hidden">
            {/* Background Shapes / Decor */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -90, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-emerald-500/10 rounded-full blur-[120px]"
                />
            </div>

            {/* Header / Story Progress Pins */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex flex-col gap-6">
                <div className="flex gap-2 w-full max-w-md mx-auto">
                    {SLIDES.map((_, index) => (
                        <div key={index} className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: index === selectedIndex ? "100%" : index < selectedIndex ? "100%" : "0%" }}
                                transition={{ duration: index === selectedIndex ? 0.8 : 0.3 }}
                                className="h-full bg-primary"
                            />
                        </div>
                    ))}
                </div>
            </header>

            {/* Carousel */}
            <div className="flex-1 flex items-center" ref={emblaRef}>
                <div className="flex w-full h-full">
                    {SLIDES.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="flex-[0_0_100%] min-w-0 relative flex flex-col items-center justify-center p-6 text-center"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{
                                    opacity: selectedIndex === index ? 1 : 0,
                                    scale: selectedIndex === index ? 1 : 0.8,
                                    rotate: selectedIndex === index ? 0 : -10,
                                    y: selectedIndex === index ? [0, -15, 0] : 0
                                }}
                                transition={{
                                    opacity: { duration: 0.5 },
                                    scale: { duration: 0.5 },
                                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className={cn(
                                    "w-32 h-32 rounded-xl flex items-center justify-center mb-10 shadow-2xl text-white relative",
                                    slide.color
                                )}
                            >
                                <slide.icon className="w-16 h-16" />
                                <div className="absolute inset-0 rounded-xl ring-4 ring-white/20" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: selectedIndex === index ? 1 : 0, y: selectedIndex === index ? 0 : 30 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="text-4xl font-extrabold mb-6 tracking-tighter text-zinc-900 px-4"
                            >
                                {slide.title}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: selectedIndex === index ? 1 : 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-zinc-500 max-w-sm text-lg leading-relaxed font-medium"
                            >
                                {slide.description}
                            </motion.p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="p-8 flex flex-col items-center gap-6 z-10 w-full max-w-md mx-auto">
                <div className="w-full space-y-4">
                    {selectedIndex === SLIDES.length - 1 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <Link href="/dashboard-public" className="w-full block">
                                <Button
                                    size="lg"
                                    className="w-full h-16 text-lg bg-primary hover:bg-primary/90 rounded-xl shadow-xl shadow-primary/20 font-bold"
                                >
                                    Commencer l&apos;aventure <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                                <span className="h-[1px] w-4 bg-zinc-200" />
                                Déjà plus de 10k membres
                                <span className="h-[1px] w-4 bg-zinc-200" />
                            </div>
                        </motion.div>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleNext}
                            className="w-full h-16 text-lg bg-primary hover:bg-primary/90 rounded-xl shadow-xl shadow-primary/20 font-bold"
                        >
                            Suivant <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

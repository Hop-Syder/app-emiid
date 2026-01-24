"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronRight, Briefcase, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SLIDES = [
    {
        id: 1,
        title: "Connectez-vous aux opportunités",
        description: "Rejoignez le plus grand réseau professionnel d'Afrique de l'Ouest. Trouvez des partenaires, des clients et des talents vérifiés.",
        image: "/onboarding/slide1.jpg", // Placeholder path
        icon: Globe,
        color: "bg-blue-500",
    },
    {
        id: 2,
        title: "Trouvez les meilleurs talents",
        description: "Accédez à une base de données d'artisans, de freelances et d'entreprises qualifiés pour vos projets.",
        image: "/onboarding/slide2.jpg", // Placeholder path
        icon: Users,
        color: "bg-amber-500",
    },
    {
        id: 3,
        title: "Gérez vos projets simplement",
        description: "Une suite d'outils complète pour gérer vos devis, factures et paiements en toute sécurité.",
        image: "/onboarding/slide3.jpg", // Placeholder path
        icon: Briefcase,
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

    const scrollTo = useCallback(
        (index: number) => emblaApi && emblaApi.scrollTo(index),
        [emblaApi]
    )

    const handleNext = () => {
        if (emblaApi) emblaApi.scrollNext()
    }

    return (
        <div className="relative w-full h-[100dvh] bg-white flex flex-col justify-between overflow-hidden">
            {/* Background Shapes / Decor */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-amber-500 rounded-full blur-[100px]" />
            </div>

            {/* Header Logo */}
            <header className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo/logo-2.png"
                        alt="Nexus Connect"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                    />
                    <span className="font-bold text-xl text-[#022753]">Nexus Connect</span>
                </div>

                {selectedIndex < SLIDES.length - 1 && (
                    <Link href="/dashboard-public">
                        <Button variant="ghost" className="text-gray-500 hover:text-[#022753]">
                            Passer
                        </Button>
                    </Link>
                )}
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
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: selectedIndex === index ? 1 : 0,
                                    scale: selectedIndex === index ? 1 : 0.8
                                }}
                                transition={{ duration: 0.5 }}
                                className={cn(
                                    "w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl text-white",
                                    slide.color
                                )}
                            >
                                <slide.icon className="w-12 h-12" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: selectedIndex === index ? 1 : 0, y: selectedIndex === index ? 0 : 20 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="text-3xl font-bold mb-4 text-[#022753]"
                            >
                                {slide.title}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: selectedIndex === index ? 1 : 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-gray-500 max-w-md text-lg leading-relaxed"
                            >
                                {slide.description}
                            </motion.p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="p-8 flex flex-col items-center gap-8 z-10 w-full max-w-md mx-auto">
                {/* Dots */}
                <div className="flex gap-2">
                    {SLIDES.map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                index === selectedIndex ? "w-8 bg-[#022753]" : "bg-gray-300"
                            )}
                            onClick={() => scrollTo(index)}
                        />
                    ))}
                </div>

                {/* Action Button */}
                <div className="w-full space-y-3">
                    {selectedIndex === SLIDES.length - 1 ? (
                        <>
                            <Link href="/dashboard-public" className="w-full block">
                                <Button
                                    size="lg"
                                    className="w-full h-14 text-lg bg-[#022753] hover:bg-[#022753]/90 rounded-2xl shadow-lg shadow-blue-900/20"
                                >
                                    Commencer <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/dashboard-public" className="w-full block">
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="w-full h-14 text-lg rounded-2xl text-gray-500 hover:text-[#022753]"
                                >
                                    Passer l'onboarding
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Button
                            size="lg"
                            onClick={handleNext}
                            className="w-full h-14 text-lg bg-[#022753] hover:bg-[#022753]/90 rounded-2xl shadow-lg shadow-blue-900/20"
                        >
                            Suivant <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

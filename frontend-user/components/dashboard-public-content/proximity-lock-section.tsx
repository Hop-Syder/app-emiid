/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section public verrouillée "Talents à proximité" servant d'entonnoir de conversion.
 * @created 2026-06-03
 * @updated 2026-06-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { MapPin, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function ProximityLockSection() {
    const router = useRouter()

    // Faux profils à afficher floutés en arrière-plan
    const placeholderProfiles = [
        { name: "Daouda Abassi", role: "Développeur Fullstack", location: "Cotonou, Bénin", avatar: "D" },
        { name: "Marie Koné", role: "Designer UX/UI", location: "Abidjan, Côte d'Ivoire", avatar: "M" },
        { name: "Jean-Pierre T.", role: "Artisan Électricien", location: "Dakar, Sénégal", avatar: "J" },
        { name: "Sarah Nguema", role: "Consultante Marketing", location: "Libreville, Gabon", avatar: "S" },
    ]

    return (
        <section className="space-y-4 pt-4 relative overflow-hidden">
            {/* Titre de la section */}
            <div className="flex flex-row items-center justify-between px-1 sm:px-2 gap-2">
                <h3 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2 sm:gap-3 tracking-tight">
                    <div className="p-1.5 sm:p-2 bg-rose-100 rounded-xl shrink-0">
                        <MapPin className="text-rose-500 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="truncate">Talents à proximité</span>
                </h3>
            </div>

            {/* Conteneur avec les profils floutés et le CTA de verrouillage */}
            <div className="relative rounded-[2.5rem] border border-slate-200/80 shadow-md bg-white p-6 sm:p-8 min-h-[300px] flex items-center justify-center overflow-hidden">
                
                {/* 1. GRILLE DE PROFILS FLOUTÉS (ARRIÈRE-PLAN) */}
                <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-8 filter blur-[5px] select-none pointer-events-none opacity-40">
                    {placeholderProfiles.map((p, i) => (
                        <div 
                            key={i} 
                            className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col justify-between h-full"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-400">
                                    {p.avatar}
                                </div>
                                <div className="space-y-1">
                                    <div className="h-4 w-24 bg-slate-200 rounded" />
                                    <div className="h-3 w-16 bg-slate-200 rounded" />
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-3 w-full bg-slate-200 rounded" />
                                <div className="h-3 w-3/4 bg-slate-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dégradé radial pour assombrir et lier le fond flouté */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/80 to-white/95" />

                {/* 2. PANNEAU DE VERROUILLAGE (PREMIUM GLASSMORPHISM EN PREMIER PLAN) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative z-10 max-w-md w-full text-center px-6 py-8 rounded-3xl border border-slate-200/40 bg-white/70 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-5"
                >
                    <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-xl relative">
                        <Lock className="size-6 text-amber-400" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                            Découvrez qui est près de chez vous
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                            EmiID localise les compétences, artisans et prestataires à proximité pour faciliter vos échanges et opportunités locales.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                        <Button 
                            onClick={() => router.push("/creer-profil")}
                            className="flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            Créer mon profil
                            <ArrowRight className="size-4" />
                        </Button>
                        <Button 
                            onClick={() => router.push("/login")}
                            variant="outline"
                            className="rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-800 font-bold h-12 transition-all hover:scale-[1.02]"
                        >
                            Se connecter
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

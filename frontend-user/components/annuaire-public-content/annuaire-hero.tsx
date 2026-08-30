/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header de l'Annuaire — Hero épuré, design simple & barre de recherche universelle.
 * @created 2026-06-02
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Search, X } from "lucide-react"

interface AnnuaireHeroProps {
    title?: string;
    description?: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export function AnnuaireHero({
    title = "Annuaire des Talents",
    description = "Explorez notre réseau d'entrepreneurs, freelances, artisans et entreprises vérifiés.",
    searchQuery,
    onSearchChange
}: AnnuaireHeroProps) {
    const [value, setValue] = useState(searchQuery)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Resynchronise le champ si le filtre est réinitialisé ailleurs (ex. bouton « Réinitialiser »)
    useEffect(() => {
        setValue(searchQuery)
    }, [searchQuery])

    // Recherche « live » debouncée
    const handleChange = (v: string) => {
        setValue(v)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => onSearchChange(v), 300)
    }

    const clear = () => {
        setValue("")
        if (timer.current) clearTimeout(timer.current)
        onSearchChange("")
    }

    return (
        <div className="mb-6 sm:mb-8 w-full">
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 text-white flex flex-col justify-center items-center bg-[#000616] border border-white/10 shadow-xl text-center"
            >
                {/* Lueur d'ambiance discrète */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#013ff4]/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#03b3f8]/15 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center space-y-4 max-w-2xl w-full mx-auto">

                    {/* Titre & Description épurés */}
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                            {title}
                        </h1>
                        <p className="text-slate-300/90 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-xl mx-auto">
                            {description}
                        </p>
                    </div>

                    {/* Barre de recherche moderne & simple */}
                    <div className="w-full max-w-lg relative pt-2">
                        <div className="relative flex items-center bg-card/[0.06] hover:bg-card/[0.09] focus-within:bg-card/[0.1] border border-white/15 focus-within:border-[#03b3f8]/70 rounded-2xl transition-all duration-200 h-12 sm:h-13 px-4 shadow-sm backdrop-blur-md">
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2.5 shrink-0" />
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleChange(e.target.value)}
                                placeholder="Rechercher un profil, un métier, un mot-clé…"
                                aria-label="Rechercher dans l'annuaire"
                                className="flex-1 bg-transparent text-left text-sm sm:text-base font-medium text-white placeholder:text-slate-400/80 outline-none min-w-0"
                            />
                            {value && (
                                <button
                                    type="button"
                                    onClick={clear}
                                    aria-label="Effacer la recherche"
                                    className="ml-2 shrink-0 flex items-center justify-center h-6 w-6 rounded-full text-slate-400 hover:text-white hover:bg-card/20 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    )
}

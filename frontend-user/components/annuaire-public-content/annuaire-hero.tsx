/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header de l'Annuaire — Hero compact + barre de recherche universelle (live).
 * @created 2026-06-02
 * @updated 2026-07-07
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
    title = "Découvrez les Talents de l'Afrique",
    description = "Explorez notre réseau dynamique regroupant artisans, commerçants, freelances, entreprises, agences, startups et ONG.",
    searchQuery,
    onSearchChange
}: AnnuaireHeroProps) {
    const [value, setValue] = useState(searchQuery)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Resynchronise le champ si le filtre est réinitialisé ailleurs (ex. bouton « Réinitialiser »)
    useEffect(() => {
        setValue(searchQuery)
    }, [searchQuery])

    // Recherche « live » debouncée : on ne relance la requête qu'après une courte pause de frappe
    const handleChange = (v: string) => {
        setValue(v)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => onSearchChange(v), 350)
    }

    const clear = () => {
        setValue("")
        if (timer.current) clearTimeout(timer.current)
        onSearchChange("")
    }

    return (
        <div className="mb-8 w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-3xl px-6 md:px-12 py-10 md:py-16 text-white min-h-[300px] flex flex-col justify-center items-center bg-slate-950 border border-white/10 group text-center"
            >
                {/* Aurora Background Effects */}
                <div className="absolute inset-0 bg-slate-950" />
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(30, 64, 175, 0.5) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.3) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(125, 211, 252, 0.2) 0%, transparent 50%)',
                        filter: 'blur(60px)'
                    }}
                />

                {/* Grid Pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center space-y-6 max-w-3xl w-full mx-auto">

                    {/* Header */}
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.1]"
                        >
                            {title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-slate-400 text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-2xl mx-auto"
                        >
                            {description}
                        </motion.p>
                    </div>

                    {/* Barre de recherche universelle (nom, métier, compétence, tag, mot-clé de description) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="w-full max-w-xl relative mt-4 mb-2"
                    >
                        <div className="relative flex items-center bg-white/5 border backdrop-blur-md rounded-2xl transition-all duration-300 h-14 border-white/10 focus-within:border-[#03b3f8]/50 focus-within:bg-white/10 hover:border-white/20 px-4">
                            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleChange(e.target.value)}
                                placeholder="Rechercher un nom, un métier, une compétence, un mot-clé…"
                                aria-label="Rechercher dans l'annuaire"
                                className="flex-1 bg-transparent text-left text-base font-medium text-white placeholder:text-slate-400 outline-none min-w-0"
                            />
                            {value && (
                                <button
                                    type="button"
                                    onClick={clear}
                                    aria-label="Effacer la recherche"
                                    className="ml-2 shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    )
}

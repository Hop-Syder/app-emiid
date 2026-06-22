/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header de l'Annuaire — Hero compact, statistiques globales et déclencheur Cmd+K.
 * @created 2026-06-02
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url, { next: { revalidate: 60 } }).then(res => res.json())

interface AnnuaireHeroProps {
    title?: string;
    description?: string;
    searchQuery: string;
    onTriggerSearch: () => void;
}

export function AnnuaireHero({
    title = "Découvrez les Talents de l'Afrique",
    description = "Explorez notre réseau dynamique regroupant artisans, commerçants, freelances, entreprises, agences, startups et ONG.",
    searchQuery,
    onTriggerSearch
}: AnnuaireHeroProps) {


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

                    {/* Search Bar Trigger */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="w-full max-w-xl relative mt-4 mb-2 cursor-pointer"
                        onClick={onTriggerSearch}
                    >
                        <div className={cn(
                            "relative flex items-center bg-white/5 border backdrop-blur-md rounded-2xl transition-all duration-300 h-14 border-white/10 hover:border-white/20 hover:bg-white/10 px-4"
                        )}>
                            <Search className="w-5 h-5 text-slate-400 mr-3" />
                            <span className="text-slate-400 text-base font-medium flex-1 text-left select-none">
                                {searchQuery || "Rechercher par nom, métier, compétence..."}
                            </span>
                            <kbd className="pointer-events-none inline-flex h-6 select-none items-center rounded border border-white/15 bg-white/5 px-2 font-mono text-[10px] font-bold text-slate-400 gap-1 shadow-sm shrink-0">
                                <span>⌘</span><span>K</span>
                            </kbd>
                        </div>
                    </motion.div>


                </div>
            </motion.div>
        </div>
    )
}

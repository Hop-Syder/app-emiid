"use client"

import { useRef } from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
    Laptop, 
    Leaf, 
    HardHat, 
    LineChart, 
    HeartPulse, 
    GraduationCap, 
    Palette, 
    Store,
    Truck,
    Palmtree,
    Lightbulb,
    Briefcase
} from "lucide-react"

interface AnnuaireCategoriesProps {
    filters: {
        activity_domain: string
    }
    onFilterChange: (key: string, value: string) => void
}

const VISUAL_SECTORS = [
    { id: "tech", label: "Tech & Digital", icon: Laptop, color: "text-blue-500", bg: "bg-blue-500/10", border: "hover:border-blue-500/50" },
    { id: "agro", label: "Agroalimentaire", icon: Leaf, color: "text-green-500", bg: "bg-green-500/10", border: "hover:border-green-500/50" },
    { id: "btp", label: "Construction", icon: HardHat, color: "text-amber-600", bg: "bg-amber-600/10", border: "hover:border-amber-600/50" },
    { id: "finance", label: "Finance", icon: LineChart, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "hover:border-indigo-500/50" },
    { id: "sante", label: "Santé", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-500/10", border: "hover:border-rose-500/50" },
    { id: "education", label: "Éducation", icon: GraduationCap, color: "text-violet-500", bg: "bg-violet-500/10", border: "hover:border-violet-500/50" },
    { id: "creatif", label: "Créativité", icon: Palette, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", border: "hover:border-fuchsia-500/50" },
    { id: "commerce", label: "Commerce", icon: Store, color: "text-orange-500", bg: "bg-orange-500/10", border: "hover:border-orange-500/50" },
    { id: "transport", label: "Logistique", icon: Truck, color: "text-slate-500", bg: "bg-slate-500/10", border: "hover:border-slate-500/50" },
    { id: "tourisme", label: "Tourisme", icon: Palmtree, color: "text-teal-500", bg: "bg-teal-500/10", border: "hover:border-teal-500/50" },
    { id: "energie", label: "Énergie", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "hover:border-yellow-500/50" },
    { id: "b2b", label: "Services B2B", icon: Briefcase, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/50" },
]

export function AnnuaireCategories({ filters, onFilterChange }: AnnuaireCategoriesProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = direction === "left" ? -300 : 300
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
        }
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Explorer par domaine d&apos;activité</h3>
            </div>
            
            {/* Scroll horizontal masqué mais fonctionnel sur mobile, flèches sur desktop */}
            <div className="relative group/categoriesCarousel">
                <button
                    onClick={() => scroll("left")}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full shadow-xl transition-all backdrop-blur-md bg-white/90 text-slate-800 border border-slate-200 hover:bg-white hover:scale-105 opacity-80 hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>

                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 sm:gap-4 no-scrollbar snap-x scroll-smooth"
                >
                {VISUAL_SECTORS.map((sector, index) => {
                    const isActive = filters.activity_domain === sector.id;
                    const Icon = sector.icon;

                    return (
                        <motion.button
                            key={sector.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onFilterChange("activity_domain", isActive ? "all" : sector.id)}
                            className={cn(
                                "relative flex flex-col items-center justify-center min-w-[100px] sm:min-w-[110px] h-[100px] sm:h-[110px] rounded-2xl border transition-all duration-300 snap-start shrink-0 overflow-hidden group",
                                isActive 
                                    ? `bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-transparent scale-105` 
                                    : `bg-white border-slate-200 shadow-sm hover:shadow-md hover:bg-white ${sector.border}`
                            )}
                        >
                            {/* Fond coloré léger en cas d'activation */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
                                isActive ? `opacity-100 ${sector.bg}` : `group-hover:opacity-50 ${sector.bg}`
                            )} />
                            
                            <div className={cn(
                                "relative z-10 p-2.5 rounded-xl transition-transform duration-300 mb-2",
                                isActive ? `${sector.bg} scale-110` : "bg-slate-100 group-hover:bg-transparent group-hover:scale-110"
                            )}>
                                <Icon className={cn("w-6 h-6", isActive ? sector.color : "text-slate-500 group-hover:" + sector.color)} />
                            </div>
                            
                            <span className={cn(
                                "relative z-10 text-xs font-semibold px-2 text-center leading-tight transition-colors duration-300",
                                isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-800"
                            )}>
                                {sector.label}
                            </span>

                            {isActive && (
                                <motion.div 
                                    layoutId="activeCategoryBorder"
                                    className={cn("absolute bottom-0 left-0 right-0 h-1", sector.bg.replace('/10', ''))} 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </motion.button>
                    )
                })}
                </div>

                <button
                    onClick={() => scroll("right")}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full shadow-xl transition-all backdrop-blur-md bg-white/90 text-slate-800 border border-slate-200 hover:bg-white hover:scale-105 opacity-80 hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            </div>

            {/* Custom CSS for hiding scrollbar cleanly */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}

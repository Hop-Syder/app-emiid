/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section "En vue cette semaine" avec carrousel fluide et boutons de navigation.
 * @created 2026-06-13
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Profile {
    id: string
    name: string
    role: string
    job_title?: string
    location: string
    avatar: string
    bio?: string
    tags?: string[]
    slug?: string
}

export function AnnuaireSpotlight() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchSpotlight = async () => {
            try {
                // Récupère les profils premium avec une limite étendue à 10 pour permettre un défilement complet
                const res = await fetch("/api/annuaire?onlyPremium=true&limit=10")
                const data = await res.json()
                if (data.profiles) {
                    setProfiles(data.profiles)
                }
            } catch (error) {
                console.error("Failed to fetch spotlight profiles", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSpotlight()
    }, [])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { current } = scrollRef
            const scrollAmount = direction === "left" ? -320 : 320
            current.scrollBy({ left: scrollAmount, behavior: "smooth" })
        }
    }

    if (loading || profiles.length === 0) {
        return null
    }

    return (
        <div className="w-full">
            <div className="flex items-center mb-6 px-1 gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    En vue <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">cette semaine</span>
                </h2>
            </div>
            
            <div className="relative group/carousel">
                {/* Flèche gauche */}
                <button
                    onClick={() => scroll("left")}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white/90 border border-white/10 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-md cursor-pointer"
                    aria-label="Défiler vers la gauche"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Flèche droite */}
                <button
                    onClick={() => scroll("right")}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white/90 border border-white/10 shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-slate-800 hover:text-white backdrop-blur-md cursor-pointer"
                    aria-label="Défiler vers la droite"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>

                {/* Liste défilante */}
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto pb-10 pt-4 px-4 -mx-4 gap-6 snap-x no-scrollbar w-full scroll-smooth"
                >
                    {profiles.map((profile, index) => (
                        <motion.div
                            key={profile.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-amber-100 flex flex-col h-full relative overflow-hidden group snap-center shrink-0"
                        >
                            {/* Glow effect */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-500" />
                            
                            <div className="flex gap-4 mb-4 relative z-10">
                                <Image 
                                    src={profile.avatar} 
                                    alt={profile.name} 
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-100"
                                />
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{profile.name}</h3>
                                    <p className="text-sm font-medium text-amber-600">{profile.role}</p>
                                    <p className="text-xs text-slate-500 mt-1">{profile.location}</p>
                                </div>
                            </div>

                            {profile.bio && (
                                <p className="text-sm text-slate-600 mb-6 flex-grow line-clamp-3 relative z-10">
                                    {profile.bio}
                                </p>
                            )}

                            <div className="mt-auto relative z-10">
                                {profile.tags && profile.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {profile.tags.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                <a 
                                    href={`/profil/${profile.slug || profile.id}`}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
                                >
                                    Voir le profil
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

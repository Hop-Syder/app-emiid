/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Liste horizontale des nouveaux arrivants sur la plateforme
 * @created 2026-06-03
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkle, ArrowRight } from "lucide-react"
import Image from "next/image"

interface Profile {
    id: string
    name: string
    role: string
    category: string
    avatar: string
    slug?: string
}

export function AnnuaireNewcomers() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNewcomers = async () => {
            try {
                // Requête simple, l'API trie déjà par created_at DESC par défaut
                const res = await fetch("/api/annuaire?limit=8")
                const data = await res.json()
                if (data.profiles) {
                    setProfiles(data.profiles)
                }
            } catch (error) {
                console.error("Failed to fetch newcomers", error)
            } finally {
                setLoading(false)
            }
        }
        fetchNewcomers()
    }, [])

    if (loading || profiles.length === 0) {
        return null
    }

    return (
        <div className="w-full">
            <div className="flex items-center mb-4 px-1 gap-2">
                <Sparkle className="w-5 h-5 text-[#0150fd] dark:text-[#8ab0ff]" />
                <h3 className="text-lg font-bold text-foreground tracking-tight">Nouveaux arrivants</h3>
            </div>
            
            <div className="flex overflow-x-auto pb-6 -mx-4 sm:-mx-6 px-5 sm:px-6 gap-4 no-scrollbar snap-x snap-mandatory scroll-pl-5 sm:scroll-pl-6 scroll-smooth lg:grid lg:grid-cols-4 lg:gap-5 xl:gap-6 lg:overflow-visible lg:p-0 lg:m-0 lg:snap-none lg:scroll-pl-0">
                {profiles.map((profile, index) => (
                    <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-3 min-w-[280px] lg:min-w-0 snap-start shrink-0 hover:shadow-md transition-shadow"
                    >
                        <Image 
                            src={profile.avatar} 
                            alt={profile.name} 
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-foreground truncate">{profile.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{profile.role}</p>
                            {profile.category && (
                                <p className="text-[10px] uppercase font-bold tracking-wider text-[#0150fd] dark:text-[#8ab0ff] mt-0.5 truncate">{profile.category}</p>
                            )}
                        </div>
                        <a 
                            href={`/profil/${profile.slug || profile.id}`}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-slate-400 hover:bg-[#eaf0ff] hover:text-[#013ff4] transition-colors shrink-0"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </motion.div>
                ))}
            </div>
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Affichage de la galerie de projets pour le profil public (Read-only)
 * @created 2026-03-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, LayoutGrid, Star, ExternalLink, Image as ImageIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface ProjectImage {
    id: string
    image_url: string
    title: string
    description: string
}

interface ProjectShowcaseProps {
    userId: string
}

export function ProjectShowcase({ userId }: ProjectShowcaseProps) {
    const [images, setImages] = useState<ProjectImage[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const loadGallery = async () => {
            if (!userId) return
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('project_gallery')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true })

                if (error) throw error
                setImages(data || [])
            } catch (err) {
                console.error("Load gallery error:", err)
            } finally {
                setLoading(false)
            }
        }
        loadGallery()
    }, [userId, supabase])

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Chargement du Showcase...</p>
        </div>
    )

    if (images.length === 0) return (
        <div className="p-12 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <Star className="h-10 w-10 text-slate-200" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Showcase Bientôt Disponible</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">Ce membre n'a pas encore ajouté de projets à sa galerie visuelle.</p>
            </div>
        </div>
    )

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {images.map((img, idx) => (
                <Dialog key={img.id}>
                    <DialogTrigger asChild>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-zoom-in"
                        >
                            <img 
                                src={img.image_url} 
                                alt={img.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            
                            {/* Info Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <div className="space-y-2">
                                    <Badge className="bg-amber-400 text-slate-900 hover:bg-amber-400 border-none font-black text-[10px] uppercase px-3 py-1 mb-2">Projet</Badge>
                                    <h4 className="text-white font-black text-xl tracking-tight">{img.title}</h4>
                                    <p className="text-white/80 text-sm line-clamp-2 leading-relaxed font-medium">
                                        {img.description || "Voir les détails de cette réalisation exceptionnelle."}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-[2.5rem]">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="aspect-square md:aspect-auto h-full min-h-[400px]">
                                <img 
                                    src={img.image_url} 
                                    alt={img.title} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <div className="p-10 flex flex-col justify-center space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <ImageIcon className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Détails du Showcase</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{img.title}</h2>
                                    <div className="h-1 w-12 bg-[#CE1126] rounded-full my-4" />
                                    <p className="text-slate-600 font-medium leading-relaxed text-lg">
                                        {img.description || "Ce projet témoigne de l'expertise et du savoir-faire de ce membre Nexus. Chaque détail a été pensé pour offrir une expérience unique et une qualité irréprochable."}
                                    </p>
                                </div>
                                
                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <LayoutGrid className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase">Nexus Portfolio</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            ))}
        </div>
    )
}

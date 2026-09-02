/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Grille Portfolio & Réalisations + modale de détail (image plein + description complète).
 * @created 2026-07-10
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import Image from "next/image"
import { Maximize2, ExternalLink, FolderOpen } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getOptimizedImageUrl } from "@/lib/image-optimization"

export interface GalleryItem {
    id: string
    title: string | null
    description: string | null
    imageUrl: string
    status?: string
    projectUrl?: string | null
    driveUrl?: string | null
}

interface PortfolioGalleryProps {
    gallery: GalleryItem[]
    loadingGallery: boolean
}

export function PortfolioGallery({ gallery, loadingGallery }: PortfolioGalleryProps) {
    const [selected, setSelected] = useState<GalleryItem | null>(null)

    if (loadingGallery) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#013ff4] mb-4" />
                <p className="text-muted-foreground text-xs font-bold">Chargement du portfolio...</p>
            </div>
        )
    }

    if (gallery.length === 0) {
        return (
            <div className="p-8 border border-dashed border-border text-center w-full rounded-2xl bg-muted/50">
                <p className="text-muted-foreground font-bold text-xs">Aucune réalisation publiée pour le moment.</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {gallery.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelected(item)}
                        aria-label={`Voir la réalisation : ${item.title || "sans titre"}`}
                        className="group text-left bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#013ff4]/40"
                    >
                        <div className="aspect-video w-full overflow-hidden bg-muted relative">
                            <Image
                                src={item.imageUrl}
                                alt={item.title || "Réalisation"}
                                fill
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Indice cliquable */}
                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-300 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 bg-card/90 backdrop-blur-md text-foreground text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    <Maximize2 className="h-3.5 w-3.5" /> Voir le détail
                                </span>
                            </div>
                            {item.status === "pending" && (
                                <div className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-400/30">
                                    En attente de validation
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <h4 className="text-sm font-extrabold text-foreground group-hover:text-[#013ff4] transition-colors duration-300">
                                {item.title}
                            </h4>
                            {item.description && (
                                <p className="text-xs text-muted-foreground font-medium mt-1.5 line-clamp-2">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Modale de détail : image plein + description intégrale */}
            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl gap-0">
                    {selected && (
                        <>
                            <div className="relative aspect-video w-full bg-muted">
                                <Image
                                    src={getOptimizedImageUrl(selected.imageUrl, { width: 1200, height: 675, quality: 90 })}
                                    alt={selected.title || "Réalisation"}
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, 672px"
                                    className="object-cover"
                                />
                                {selected.status === "pending" && (
                                    <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-400/30">
                                        En attente de validation
                                    </div>
                                )}
                            </div>
                            <div className="p-6 max-h-[45vh] overflow-y-auto">
                                <DialogHeader className="text-left">
                                    <DialogTitle className="text-xl font-black text-foreground">
                                        {selected.title || "Réalisation"}
                                    </DialogTitle>
                                </DialogHeader>
                                {selected.description ? (
                                    <DialogDescription asChild>
                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mt-3">
                                            {selected.description}
                                        </p>
                                    </DialogDescription>
                                ) : (
                                    <DialogDescription className="text-sm text-slate-400 italic mt-3">
                                        Aucune description fournie pour cette réalisation.
                                    </DialogDescription>
                                )}

                                {/* Liens externes */}
                                {(selected.projectUrl || selected.driveUrl) && (
                                    <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
                                        {selected.projectUrl && (
                                            <a
                                                href={selected.projectUrl.startsWith('http') ? selected.projectUrl : `https://${selected.projectUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer ugc nofollow"
                                                className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs font-bold text-white bg-[#013ff4] hover:bg-[#013ff4]/90 active:scale-95 transition-all shadow-sm cursor-pointer"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Consulter le projet
                                            </a>
                                        )}
                                        {selected.driveUrl && (
                                            <a
                                                href={selected.driveUrl.startsWith('http') ? selected.driveUrl : `https://${selected.driveUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer ugc nofollow"
                                                className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs font-bold text-foreground bg-muted hover:bg-muted active:scale-95 transition-all border border-border cursor-pointer"
                                            >
                                                <FolderOpen className="h-4 w-4" />
                                                Voir les photos (Drive)
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

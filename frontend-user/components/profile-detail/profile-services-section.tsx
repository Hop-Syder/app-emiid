/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Section « Services & Tarifs » inspirée de la maquette (catalogue de prestations, tarifs indicatifs FCFA/Gratuit).
 * @created 2026-09-06
 * @updated 2026-09-06
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Tag, Sparkles, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ServiceItemData {
    title: string
    price: number | null
    description?: string
}

interface ProfileServicesSectionProps {
    services?: ServiceItemData[]
    professionName?: string
    onContactClick?: () => void
    className?: string
}

// Prestations exemplaires par défaut fidèles à la maquette (Image 2)
const DEFAULT_SAMPLE_SERVICES: ServiceItemData[] = [
    {
        title: "Mobilier sur mesure",
        price: 180000,
        description:
            "Bibliothèques, plans de travail, agencement de boutique. Relevé sur place, plan 3D, pose comprise."
    },
    {
        title: "Restauration de meuble ancien",
        price: 45000,
        description:
            "Décapage, reprise d'assemblages, finition à l'huile ou au vernis gomme-laque."
    },
    {
        title: "Devis & relevé à domicile",
        price: 0,
        description:
            "Déplacement dans le Littoral, mesures et estimation chiffrée sous 48 h."
    }
]

export function ProfileServicesSection({
    services,
    professionName,
    onContactClick,
    className
}: ProfileServicesSectionProps) {
    // Si des services réels sont renseignés, on les utilise ; sinon on affiche la démonstration fidèle
    const displayServices =
        services && services.length > 0 ? services : DEFAULT_SAMPLE_SERVICES

    const formatPrice = (price: number | null) => {
        if (price === 0 || price === null) {
            return { isFree: true, label: "Gratuit", sublabel: "" }
        }
        return {
            isFree: false,
            label: `${price.toLocaleString("fr-FR")} FCFA`,
            sublabel: "à partir de"
        }
    }

    return (
        <section
            className={cn(
                "bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-[0_4px_24px_rgb(15,23,42,0.05)] relative overflow-hidden",
                className
            )}
        >
            {/* ── En-tête : SERVICES & TARIFS + Tarifs indicatifs, hors matière ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#013ff4] shrink-0" />
                    <span>SERVICES & TARIFS</span>
                </h2>
                <span className="text-xs text-muted-foreground font-medium tracking-wide">
                    Tarifs indicatifs, hors matière
                </span>
            </div>

            {/* ── Liste des prestations (Image 2) ── */}
            <div className="mt-5 space-y-3.5">
                {displayServices.map((service, index) => {
                    const priceInfo = formatPrice(service.price)

                    return (
                        <div
                            key={index}
                            className="group rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/40 p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            {/* Titre & Description */}
                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm sm:text-base font-extrabold text-foreground group-hover:text-[#013ff4] transition-colors">
                                        {service.title}
                                    </h3>
                                </div>
                                {service.description && (
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                                        {service.description}
                                    </p>
                                )}
                            </div>

                            {/* Prix à droite */}
                            <div className="shrink-0 text-left sm:text-right self-start sm:self-center">
                                {priceInfo.isFree ? (
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-sm sm:text-base">
                                        Gratuit
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-base sm:text-lg font-black text-foreground tracking-tight">
                                            {priceInfo.label}
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-400 block sm:text-right">
                                            {priceInfo.sublabel}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

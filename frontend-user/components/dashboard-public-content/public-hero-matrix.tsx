/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description PublicHeroMatrix — Hero d'accueil interactif avec acquisition directe et showcase carte 3D.
 *              Design 2026 : fond #000616 pur, bordures affûtées, glassmorphism haute fidélité.
 * @created 2026-08-20
 * @updated 2026-08-29
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { FeaturedProfilesCarousel } from "./featured-profiles-carousel"

interface PublicHeroMatrixProps {
    stats: {
        totalEntrepreneurs: number
        verifiedMembers: number
        countriesCovered: number
        premiumMembers: number
    } | null
}

export function PublicHeroMatrix(_props: PublicHeroMatrixProps) {
    const router = useRouter()
    const [claimName, setClaimName] = useState("")

    // Effet d'inclinaison 3D au survol de la carte modèle
    const cardRef = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    const handleClaim = (e: React.FormEvent) => {
        e.preventDefault()
        if (claimName.trim()) {
            router.push(`/creer-profil?first_name=${encodeURIComponent(claimName.trim())}`)
        } else {
            router.push("/creer-profil")
        }
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.8)] bg-[#000616] pt-7 pb-6 px-6 sm:p-8 md:p-10 lg:p-12 text-white">
            {/* Arrière-plan atmosphérique #000616 avec orbes subtils (descendus sur mobile) */}
            <div className="absolute top-12 sm:top-0 left-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#013ff4]/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-16 sm:-bottom-24 -right-16 sm:-right-24 w-80 sm:w-96 h-80 sm:h-96 bg-[#03b3f8]/10 rounded-full blur-[130px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Col Gauche : Message d'Impact + Terminal d'Acquisition */}
                <div className="lg:col-span-7 space-y-6 lg:space-y-8 py-2 lg:py-6">

                    {/* Titre Principal */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-extrabold tracking-tight leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] via-[#03b3f8] to-[#7f9dff]">
                            Inspirez le monde.
                        </span>
                    </h1>

                    <p className="text-sm md:text-base text-[#8891AC] font-normal leading-relaxed max-w-xl">
                        Créez votre carte de visite numérique EmiID, certifiez vos compétences et rejoignez l&apos;annuaire d&apos;élite des leaders et créateurs d&apos;Afrique.
                    </p>

                    {/* Terminal d'acquisition directe (Instant Claim) */}
                    <form onSubmit={handleClaim} className="pt-1">
                        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-3.5 p-2 bg-card/[0.04] backdrop-blur-2xl rounded-xl border border-white/[0.12] shadow-[0_8px_30px_rgba(0,0,0,0.5)] focus-within:border-[#013ff4]/60 transition-all max-w-xl">
                            <Input
                                type="text"
                                placeholder="Entrez votre prénom ou métier..."
                                value={claimName}
                                onChange={(e) => setClaimName(e.target.value)}
                                className="bg-transparent border-0 text-white placeholder:text-[#6A7596] focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium h-11 px-3.5 flex-1"
                            />
                            <Button
                                type="submit"
                                className="h-11 px-5 rounded-lg bg-gradient-to-r from-[#013ff4] to-[#1e61ff] hover:from-[#0135d0] hover:to-[#1852df] text-white text-xs md:text-sm font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                            >
                                <span>Créer ma carte EmiID</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[11px] text-[#6A7596] font-medium mt-2 px-1 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            Gratuit • Création en 2 minutes • 100% sécurisé
                        </p>
                    </form>

                    {/* Métriques clés rapides 
                    {stats && (
                        <div className="pt-4 border-t border-white/[0.08] grid grid-cols-4 gap-3 max-w-xl">
                            <div className="space-y-0.5">
                                <p className="text-lg md:text-xl font-bold text-white tracking-tight">{stats.totalEntrepreneurs || 0}</p>
                                <p className="text-[10px] font-semibold text-[#8891AC] flex items-center gap-1">
                                    <Users className="h-3 w-3 text-emerald-400" /> Membres
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-lg md:text-xl font-bold text-white tracking-tight">{stats.verifiedMembers || 0}</p>
                                <p className="text-[10px] font-semibold text-[#8891AC] flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3 text-amber-400" /> Vérifiés
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-lg md:text-xl font-bold text-white tracking-tight">{stats.countriesCovered || 0}</p>
                                <p className="text-[10px] font-semibold text-[#8891AC] flex items-center gap-1">
                                    <Globe className="h-3 w-3 text-[#03b3f8]" /> Pays
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-lg md:text-xl font-bold text-white tracking-tight">{stats.premiumMembers || 0}</p>
                                <p className="text-[10px] font-semibold text-[#8891AC] flex items-center gap-1">
                                    <Crown className="h-3 w-3 text-rose-400" /> Premium
                                </p>
                            </div>
                        </div>
                    )} */}
                </div>

                {/* Col Droite : Showcase Carte EmiID 3D Interactive (Tilt Showcase) */}
                <div className="lg:col-span-5 flex justify-center items-center" style={{ perspective: 1000 }}>
                    <motion.div
                        ref={cardRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        className="relative w-full max-w-[200px] mx-auto cursor-pointer transition-transform duration-200 ease-out"
                    >
                        {/* Carrousel de profils vérifiés mis en avant — remplace
                            la carte démo statique "Calbert VITO" (donnée
                            fictive) par de vrais membres (voir
                            featured-profiles-carousel.tsx). Le halo lumineux
                            vit désormais dans le carrousel lui-même. */}
                        <div className="relative z-10 transform-gpu transition-all">
                            <FeaturedProfilesCarousel />
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    )
}

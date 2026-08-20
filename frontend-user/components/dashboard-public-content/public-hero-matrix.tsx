/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description PublicHeroMatrix — Nouveau Hero interactif avec champ d'acquisition directe
 *              et showcase de carte 3D Glassmorphism tiltable.
 * @created 2026-08-20
 * @updated 2026-08-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight, ShieldCheck, Award, Users, Globe, Crown } from "lucide-react"
import { EmiIDProfileCard } from "../carte-profil/emiid-profile-card"

interface PublicHeroMatrixProps {
  stats: {
    totalEntrepreneurs: number
    verifiedMembers: number
    countriesCovered: number
    premiumMembers: number
  } | null
}

export function PublicHeroMatrix({ stats }: PublicHeroMatrixProps) {
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
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] bg-slate-950 p-6 md:p-12 text-white">
      {/* Arrière-plan dynamique avec halos lumineux */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(1,63,244,0.25),transparent_60%)] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/dashboard/background.jpg')] bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Col Gauche : Message d'Impact + Terminal d'Acquisition */}
        <div className="lg:col-span-7 space-y-6">
          {/* Badge de statut */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
            <span className="text-xs font-bold text-blue-300 tracking-wide">
              L'empreinte numérique professionnelle d'Afrique & Diaspora
            </span>
          </div>

          {/* Titre Principal */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] font-satoshi">
            Exposez votre talent. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-200">
              Inspirez le monde.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
            Créez votre carte de visite numérique EmiID, certifiez vos compétences et rejoignez l'annuaire d'élite des leaders et créateurs d'Afrique.
          </p>

          {/* Terminal d'acquisition directe (Instant Claim) */}
          <form onSubmit={handleClaim} className="pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-white/10 backdrop-blur-2xl rounded-[22px] border border-white/20 shadow-2xl focus-within:ring-2 focus-within:ring-[#013ff4]/60 transition-all max-w-xl">
              <Input
                type="text"
                placeholder="Entrez votre prénom ou métier..."
                value={claimName}
                onChange={(e) => setClaimName(e.target.value)}
                className="bg-transparent border-0 text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold h-12 px-4 flex-1"
              />
              <Button
                type="submit"
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-[#013ff4] to-[#1e61ff] hover:from-[#0135d0] hover:to-[#1852df] text-white text-xs md:text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <span>Créer ma carte EmiID</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2.5 px-2 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              Gratuit • Création instantanée en 2 minutes • 100% sécurisé
            </p>
          </form>

          {/* Métriques clés rapides */}
          {stats && (
            <div className="pt-4 border-t border-white/10 grid grid-cols-4 gap-3 max-w-xl">
              <div className="space-y-0.5">
                <p className="text-lg md:text-xl font-black text-white">{stats.totalEntrepreneurs || 0}</p>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Users className="h-3 w-3 text-emerald-400" /> Membres
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg md:text-xl font-black text-white">{stats.verifiedMembers || 0}</p>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-amber-400" /> Vérifiés
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg md:text-xl font-black text-white">{stats.countriesCovered || 0}</p>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Globe className="h-3 w-3 text-indigo-400" /> Pays
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg md:text-xl font-black text-white">{stats.premiumMembers || 0}</p>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Crown className="h-3 w-3 text-rose-400" /> Premium
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Col Droite : Showcase Carte EmiID 3D Interactive (Tilt Showcase) */}
        <div className="lg:col-span-5 flex justify-center items-center perspective-1000">
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative w-full max-w-sm cursor-pointer transition-transform duration-200 ease-out"
          >
            {/* Halo lumineux holographique sous la carte */}
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-[#013ff4]/40 to-purple-500/40 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />

            {/* Carte DÉMO EmiID */}
            <div className="relative z-10 transform-gpu transition-all">
              <EmiIDProfileCard
                variant="glass-blue"
                user={{
                  id: "demo-showcase",
                  name: "Daouda C. ABASSICHAN",
                  role: "Fondateur & CEO • Nexus Partners",
                  location: "Cotonou, Bénin",
                  avatar: "/profil/avatar.jpg",
                  specialty: "IA, Architecture & Tech",
                  verified: true,
                  premium: true,
                  followers: 1280,
                  tags: ["FullStack", "IA & LLM", "Next.js", "Design System"],
                }}
              />
            </div>

            {/* Badge flottant interactif au-dessus de la carte */}
            <div className="absolute -bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 text-xs font-bold text-white shadow-2xl flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Carte EmiID Certifiée</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

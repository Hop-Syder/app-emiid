/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de profil unifiée avec variations de design (Elite, Glass, Tech) - EmiID
 * @created 2026-03-23
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

"use client"

import { Shield, Plus, Check, MessageSquare, ArrowRight } from "lucide-react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getOptimizedImageUrl } from "@/lib/image-optimization"

export type EmiIDCardVariant = "elite" | "glass" | "tech"

interface EmiIDProfileCardProps {
  user: {
    id: string
    name: string
    role: string
    avatar?: string
    category?: string
    specialty?: string
    location?: string
    followers?: number | string
    following?: number | string
    verified?: boolean
    premium?: boolean
    tags?: string[]
  }
  variant?: EmiIDCardVariant
  onAction?: (type: 'message' | 'follow' | 'view') => void
  isFollowed?: boolean
  className?: string
}

const VARIANT_COLORS = {
  tech: {
    accent: "text-orange-500",
    bgAccent: "bg-orange-500",
    borderAccent: "border-orange-500/20",
    glow: "rgba(249, 115, 22, 0.15)",
  },
  glass: {
    accent: "text-blue-500",
    bgAccent: "bg-blue-500",
    borderAccent: "border-blue-500/20",
    glow: "rgba(59, 130, 246, 0.15)",
  },
  elite: {
    accent: "text-amber-500",
    bgAccent: "bg-amber-500",
    borderAccent: "border-amber-500/20",
    glow: "rgba(245, 158, 11, 0.15)",
  },
}

export function EmiIDProfileCard({ 
  user, 
  variant = "tech", 
  onAction,
  isFollowed = false,
  className
}: EmiIDProfileCardProps) {
  const name = user.name || "Membre EmiID"
  const role = user.role || "Professionnel"
  const category = user.category || "EmiID"
  const following = user.following || 0

  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.tech

  // Framer Motion 3D Tilt Logic
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect()
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

  return (
    <motion.div 
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ y: -4 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onAction?.('view')}
      className={cn(
        "relative w-full max-w-[280px] aspect-[1/1.3] mx-auto rounded-3xl cursor-pointer group transition-shadow duration-500",
        // Base Glassmorphism (Dark)
        "bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-xl hover:shadow-2xl overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Subtle Glow Effect */}
      <div 
        className="absolute top-0 inset-x-0 h-48 opacity-40 blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle at 50% 0%, ${colors.glow}, transparent)` }}
      />

      {/* Top Banner Area (Minimalist) */}
      <div className="pt-6 pb-2 px-6 flex justify-between items-start z-10">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          {category}
        </span>
        {variant !== "tech" && (
          <span className={cn("text-[10px] font-bold tracking-widest uppercase", colors.accent)}>
            {variant}
          </span>
        )}
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mt-2 z-10 px-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-white/10 shadow-2xl ring-4 ring-black/20">
            <AvatarImage src={getOptimizedImageUrl(user.avatar, { width: 200, height: 200 })} className="object-cover" />
            <AvatarFallback className="bg-slate-800 text-white font-bold text-2xl">{name[0]}</AvatarFallback>
          </Avatar>
          {user.verified && (
            <div className={cn("absolute bottom-0 right-0 rounded-full p-1 shadow-lg bg-black border-2 border-slate-900", colors.borderAccent)}>
              <Shield className={cn("h-4 w-4", colors.accent)} />
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col items-center text-center px-6 pt-4 pb-6 z-10">
        <h3 className="text-xl font-bold tracking-tight text-white mb-1 line-clamp-1 w-full">
          {name}
        </h3>
        <p className="text-xs font-medium text-white/60 uppercase tracking-widest line-clamp-1 w-full mb-4">
          {role}
        </p>

        {/* Minimal Stats */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-white">{user.followers || '0'}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-semibold">Abonnés</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-white">{following}</span>
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-semibold">Suivis</span>
          </div>
        </div>

        {/* Action Buttons (Icon-based & Minimal) */}
        <div className="w-full flex gap-2 mt-auto">
          <Button 
            onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
            className={cn(
              "flex-1 h-10 rounded-2xl font-bold text-xs transition-all border-none text-white shadow-lg",
              colors.bgAccent, 
              "hover:brightness-110"
            )}
          >
            {isFollowed ? (
              <><Check className="h-4 w-4 mr-2" /> Suivi</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" /> Suivre</>
            )}
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
            variant="ghost"
            className="h-10 w-10 shrink-0 p-0 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}


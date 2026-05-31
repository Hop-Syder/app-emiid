"use client"

import { Shield, Plus, Check, MessageSquare, ArrowRight, Award } from "lucide-react"
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

// Configuration visuelle distincte pour chaque variant
const VARIANT_STYLES = {
  tech: {
    // Cyber / Modern Dark
    wrapper: "bg-slate-900/80 backdrop-blur-2xl border-slate-800 shadow-2xl hover:shadow-blue-500/10 hover:border-slate-700",
    textPrimary: "text-white",
    textSecondary: "text-slate-400",
    divider: "bg-slate-800",
    glow: "rgba(59, 130, 246, 0.2)",
    badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    accent: "text-blue-500",
    btnPrimary: "bg-blue-600 text-white hover:bg-blue-500",
    btnSecondary: "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
  },
  glass: {
    // Cristal / Frosted Glass (Lisibilité parfaite)
    wrapper: "bg-white/60 backdrop-blur-3xl border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] hover:border-white",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-500",
    divider: "bg-slate-200/60",
    glow: "rgba(255, 255, 255, 0.8)",
    badge: "text-emerald-600 bg-emerald-50 border-emerald-100",
    accent: "text-emerald-500",
    btnPrimary: "bg-emerald-500 text-white hover:bg-emerald-600",
    btnSecondary: "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
  },
  elite: {
    // Obsidian & Gold (Luxe)
    wrapper: "bg-stone-950/95 backdrop-blur-2xl border-stone-800 shadow-[0_8px_30px_rgba(245,158,11,0.05)] hover:shadow-[0_8px_40px_rgba(245,158,11,0.15)] hover:border-amber-500/40",
    textPrimary: "text-stone-50",
    textSecondary: "text-stone-400",
    divider: "bg-stone-800",
    glow: "rgba(245, 158, 11, 0.15)",
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    accent: "text-amber-500",
    btnPrimary: "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 hover:from-amber-400 hover:to-yellow-400 font-bold",
    btnSecondary: "bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-amber-400"
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

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.tech

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
        "relative w-full max-w-[280px] aspect-[1/1.3] mx-auto rounded-[2rem] cursor-pointer group transition-all duration-500",
        styles.wrapper,
        "overflow-hidden flex flex-col border",
        className
      )}
    >
      {/* Subtle Glow Effect */}
      <div 
        className="absolute top-0 inset-x-0 h-48 opacity-40 blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-80"
        style={{ background: `radial-gradient(circle at 50% 0%, ${styles.glow}, transparent)` }}
      />

      {/* Top Banner Area */}
      <div className="pt-6 pb-2 px-6 flex justify-between items-start z-10">
        <span className={cn("text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border", styles.badge)}>
          {category}
        </span>
        {variant === "elite" && (
          <Award className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        )}
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mt-2 z-10 px-6">
        <div className="relative">
          <Avatar className={cn("h-24 w-24 border-4 shadow-xl ring-1 ring-white/10", variant === "elite" ? "border-stone-900" : "border-white")}>
            <AvatarImage src={getOptimizedImageUrl(user.avatar, { width: 200, height: 200 })} className="object-cover" />
            <AvatarFallback className="bg-slate-100 text-slate-900 font-bold text-2xl">{name[0]}</AvatarFallback>
          </Avatar>
          {user.verified && (
            <div className={cn("absolute bottom-0 right-0 rounded-full p-1 shadow-lg border-2", variant === "elite" ? "bg-stone-900 border-stone-800" : "bg-white border-slate-100")}>
              <Shield className={cn("h-4 w-4", styles.accent)} />
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col items-center text-center px-6 pt-4 pb-6 z-10">
        <h3 className={cn("text-xl font-bold tracking-tight mb-1 line-clamp-1 w-full", styles.textPrimary)}>
          {name}
        </h3>
        <p className={cn("text-xs font-medium uppercase tracking-widest line-clamp-1 w-full mb-4", styles.textSecondary)}>
          {role}
        </p>

        {/* Minimal Stats */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <span className={cn("text-base font-bold", styles.textPrimary)}>{user.followers || '0'}</span>
            <span className={cn("text-[9px] uppercase tracking-wider font-semibold", styles.textSecondary)}>Abonnés</span>
          </div>
          <div className={cn("h-8 w-px", styles.divider)} />
          <div className="flex flex-col items-center">
            <span className={cn("text-base font-bold", styles.textPrimary)}>{following}</span>
            <span className={cn("text-[9px] uppercase tracking-wider font-semibold", styles.textSecondary)}>Suivis</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-2 mt-auto">
          <Button 
            onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
            className={cn(
              "flex-1 h-10 px-2 rounded-2xl font-bold text-[11px] transition-all border-none shadow-lg",
              styles.btnPrimary
            )}
          >
            {isFollowed ? (
              <><Check className="h-3.5 w-3.5 mr-1 shrink-0" /> <span className="truncate">Suivi</span></>
            ) : (
              <><Plus className="h-3.5 w-3.5 mr-1 shrink-0" /> <span className="truncate">Suivre</span></>
            )}
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
            variant="ghost"
            className={cn(
              "flex-1 h-10 px-2 rounded-2xl border transition-all flex items-center justify-center gap-1.5 text-[11px] font-semibold",
              styles.btnSecondary
            )}
          >
            <MessageSquare className={cn("h-3.5 w-3.5 shrink-0", styles.accent)} />
            <span className="truncate">Message</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}


"use client"

import { Plus, Check, MessageSquare, Award, Navigation } from "lucide-react"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getOptimizedImageUrl } from "@/lib/image-optimization"

export type EmiIDCardVariant = "elite" | "glass" | "glass-blue" | "glass-orange" | "glass-red" | "tech"

/**
 * Gabarit de la carte.
 *  • "default" — carte de visite pleine taille : l'aperçu de création de profil,
 *    où la carte EST le produit qu'on montre à l'utilisateur.
 *  • "compact" — listes et carrousels : mêmes informations, moins de vide, pour
 *    qu'il en tienne davantage à l'écran.
 */
export type EmiIDCardSize = "default" | "compact"

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
    is_nomad?: boolean
  }
  variant?: EmiIDCardVariant
  size?: EmiIDCardSize
  onAction?: (type: 'message' | 'follow' | 'view') => void
  isFollowed?: boolean
  className?: string
  isLoggedIn?: boolean
}

// Configuration visuelle distincte pour chaque variant
const VARIANT_STYLES = {
  tech: {
    // Cyber / Modern Dark (Glassmorphism)
    wrapper: "bg-slate-900/40 backdrop-blur-3xl border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_48px_rgba(59,130,246,0.15)] hover:border-slate-600/80",
    textPrimary: "text-white",
    textSecondary: "text-slate-300",
    divider: "bg-slate-700/50",
    glow: "rgba(59, 130, 246, 0.3)",
    badge: "text-blue-300 bg-blue-500/20 border-blue-500/30",
    accent: "text-blue-400",
    btnPrimary: "bg-blue-600/90 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    btnSecondary: "bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-700/70 hover:text-white"
  },
  glass: {
    // Cristal / Frosted Glass (Lisibilité parfaite) - Emerald
    wrapper: "bg-card/60 backdrop-blur-3xl border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] hover:border-white",
    textPrimary: "text-foreground",
    textSecondary: "text-muted-foreground",
    divider: "bg-muted/60",
    glow: "rgba(255, 255, 255, 0.8)",
    badge: "text-emerald-600 bg-emerald-50 border-emerald-100",
    accent: "text-emerald-500",
    btnPrimary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    btnSecondary: "bg-card/80 border-border text-foreground hover:bg-muted hover:text-emerald-600"
  },
  "glass-blue": {
    // Cristal / Frosted Glass - Blue
    wrapper: "bg-card/60 backdrop-blur-3xl border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] hover:border-white",
    textPrimary: "text-foreground",
    textSecondary: "text-muted-foreground",
    divider: "bg-muted/60",
    glow: "rgba(255, 255, 255, 0.8)",
    badge: "text-blue-600 bg-blue-50 border-blue-100",
    accent: "text-blue-500",
    btnPrimary: "bg-blue-500 text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    btnSecondary: "bg-card/80 border-border text-foreground hover:bg-muted hover:text-blue-600"
  },
  "glass-orange": {
    // Cristal / Frosted Glass - Orange
    wrapper: "bg-card/60 backdrop-blur-3xl border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] hover:border-white",
    textPrimary: "text-foreground",
    textSecondary: "text-muted-foreground",
    divider: "bg-muted/60",
    glow: "rgba(255, 255, 255, 0.8)",
    badge: "text-orange-600 bg-orange-50 border-orange-100",
    accent: "text-orange-500",
    btnPrimary: "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)]",
    btnSecondary: "bg-card/80 border-border text-foreground hover:bg-muted hover:text-orange-600"
  },
  "glass-red": {
    // Cristal / Frosted Glass - Red
    wrapper: "bg-card/60 backdrop-blur-3xl border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] hover:border-white",
    textPrimary: "text-foreground",
    textSecondary: "text-muted-foreground",
    divider: "bg-muted/60",
    glow: "rgba(255, 255, 255, 0.8)",
    badge: "text-red-600 bg-red-50 border-red-100",
    accent: "text-red-500",
    btnPrimary: "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)]",
    btnSecondary: "bg-card/80 border-border text-foreground hover:bg-muted hover:text-red-600"
  },
  elite: {
    // Obsidian & Vibrant Gold (Luxe Glassmorphism Premium)
    wrapper: "bg-gradient-to-b from-stone-900/90 to-black/90 backdrop-blur-3xl border-stone-800/80 shadow-[0_8px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(250,204,21,0.25),inset_0_1px_1px_rgba(250,204,21,0.3)] hover:border-yellow-500/60 ring-1 ring-white/5 hover:ring-yellow-500/40",
    textPrimary: "text-white drop-shadow-sm",
    textSecondary: "text-stone-400 font-medium",
    divider: "bg-gradient-to-b from-stone-800 to-transparent",
    glow: "rgba(250, 204, 21, 0.35)",
    badge: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.2)] backdrop-blur-md",
    accent: "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]",
    btnPrimary: "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 text-foreground font-extrabold shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] hover:scale-[1.02] active:scale-[0.98]",
    btnSecondary: "bg-stone-900/60 border-stone-700/50 text-stone-300 hover:bg-stone-800 hover:text-yellow-400 hover:border-yellow-500/30 shadow-inner"
  },
}

// Deux gabarits. Le compact réduit l'avatar, les marges et les corps de texte —
// c'est le vide qui disparaît, pas l'information : nom, rôle, statistiques et
// actions restent tous présents et lisibles.
const SIZE_STYLES = {
  default: {
    frame: "max-w-[280px] min-h-[380px] rounded-[2rem]",
    topPad: "pt-6 pb-2 px-6",
    avatar: "h-24 w-24 border-4",
    avatarFallback: "text-2xl",
    avatarWrap: "mt-2 px-6",
    info: "px-6 pt-4 pb-6",
    name: "text-xl mb-1",
    role: "text-xs mb-4",
    stats: "gap-6 mb-6",
    statValue: "text-base",
    divider: "h-8",
    button: "h-10 text-[11px]",
  },
  compact: {
    frame: "max-w-[200px] min-h-[268px] rounded-3xl",
    topPad: "pt-4 pb-1 px-4",
    avatar: "h-16 w-16 border-[3px]",
    avatarFallback: "text-lg",
    avatarWrap: "mt-1 px-4",
    info: "px-4 pt-3 pb-4",
    name: "text-base mb-0.5",
    role: "text-[10px] mb-3",
    stats: "gap-4 mb-4",
    statValue: "text-sm",
    divider: "h-6",
    button: "h-9 text-[10px]",
  },
} as const

export function EmiIDProfileCard({ 
  user, 
  variant = "tech", 
  size = "default",
  onAction,
  isFollowed = false,
  className,
  isLoggedIn = false
}: EmiIDProfileCardProps) {
  const name = user.name || "Membre EmiID"
  const role = user.role || "Professionnel"
  const category = user.category || "EmiID"
  const following = user.following || 0

  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.tech
  // Gabarit : la variante compacte resserre les mêmes éléments, sans en retirer.
  const sizing = SIZE_STYLES[size] || SIZE_STYLES.default

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
        `relative w-full h-full mx-auto cursor-pointer group transition-all duration-500 ${sizing.frame}`,
        styles.wrapper,
        "overflow-hidden flex flex-col justify-between border",
        className
      )}
    >
      {/* Subtle Glow Effect */}
      <div 
        className="absolute top-0 inset-x-0 h-48 opacity-40 blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-80"
        style={{ background: `radial-gradient(circle at 50% 0%, ${styles.glow}, transparent)` }}
      />

      {/* Top Banner Area — type de profil à gauche, badge de vérification à l'opposé */}
      <div className={cn("flex justify-between items-center z-10", sizing.topPad)}>
        <span className={cn("text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border", styles.badge)}>
          {category}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {variant === "elite" && (
            <Award className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          )}
          {user.verified && (
            <Image
              src="/badge/badge-blue-verifation.png"
              alt="Profil vérifié"
              width={20}
              height={20}
              className="h-5 w-5 shrink-0"
              title="Profil vérifié"
            />
          )}
        </div>
      </div>

      {/* Avatar Section */}
      <div className={cn("flex flex-col items-center z-10", sizing.avatarWrap)}>
        <div className="relative">
          <Avatar className={cn("shadow-xl ring-1 ring-white/10", sizing.avatar, variant === "elite" ? "border-stone-900 shadow-[0_0_25px_rgba(250,204,21,0.2)]" : "border-white")}>
            <AvatarImage src={getOptimizedImageUrl(user.avatar, { width: 200, height: 200 })} className="object-cover" />
            <AvatarFallback className={cn("bg-muted text-foreground font-bold", sizing.avatarFallback)}>{name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Info Section */}
      <div className={cn("flex-1 flex flex-col items-center text-center z-10", sizing.info)}>
        <h3 className={cn("font-bold tracking-tight line-clamp-1 w-full", sizing.name, styles.textPrimary)}>
          {name}
        </h3>
        <p className={cn("font-medium uppercase tracking-widest line-clamp-1 w-full flex items-center justify-center gap-2", sizing.role, styles.textSecondary)}>
          {role}
          {user.is_nomad && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-300 normal-case tracking-normal border border-blue-200 dark:border-blue-800/50">
              <Navigation className="h-2.5 w-2.5" />
              En déplacement
            </span>
          )}
        </p>

        {/* Minimal Stats */}
        <div className={cn("flex items-center justify-center", sizing.stats)}>
          <div className="flex flex-col items-center">
            <span className={cn("font-bold", sizing.statValue, styles.textPrimary)}>{user.followers || '0'}</span>
            <span className={cn("text-[9px] uppercase tracking-wider font-semibold", styles.textSecondary)}>Abonnés</span>
          </div>
          <div className={cn("w-px", sizing.divider, styles.divider)} />
          <div className="flex flex-col items-center">
            <span className={cn("font-bold", sizing.statValue, styles.textPrimary)}>{following}</span>
            <span className={cn("text-[9px] uppercase tracking-wider font-semibold", styles.textSecondary)}>Suivis</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-2 mt-auto">
          <Button 
            onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
            className={cn(
              "flex-1 px-2 rounded-2xl font-bold transition-all border-none shadow-lg", sizing.button,
              isFollowed 
                ? "bg-muted/50 dark:bg-slate-800/80 border border-slate-300/30 dark:border-slate-700/50 text-foreground dark:text-slate-300 shadow-none hover:bg-slate-350/50 dark:hover:bg-slate-750" 
                : styles.btnPrimary
            )}
          >
            {isFollowed ? (
              <><Check className="h-3.5 w-3.5 mr-1 shrink-0 text-emerald-500" /> <span className="truncate">Suivi</span></>
            ) : (
              <><Plus className="h-3.5 w-3.5 mr-1 shrink-0" /> <span className="truncate">Suivre</span></>
            )}
          </Button>
          {isLoggedIn && (
            <Button
              onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
              variant="ghost"
              className={cn(
                "flex-1 px-2 rounded-2xl border transition-all flex items-center justify-center gap-1.5 font-semibold", sizing.button,
                styles.btnSecondary
              )}
            >
              <MessageSquare className={cn("h-3.5 w-3.5 shrink-0", styles.accent)} />
              <span className="truncate">Message</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}


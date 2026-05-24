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

import { Shield, Plus, Check } from "lucide-react"
import { motion } from "framer-motion"
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

const VARIANT_CONFIGS = {
  tech: {
    container: "bg-white border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-slate-200/60 text-slate-800",
    banner: "bg-gradient-to-br from-slate-50 to-orange-50/40",
    bannerBlur: "bg-orange-500/10",
    bannerFade: "from-white via-white/70 to-transparent",
    bannerText: "text-slate-200/70",
    avatarBorder: "border-white",
    avatarFallback: "bg-orange-500 text-white",
    shieldBg: "bg-white border-slate-100",
    shieldIcon: "text-blue-600 fill-blue-600/10",
    name: "text-slate-800",
    role: "text-orange-500",
    tag: "text-orange-600 bg-orange-50 border-orange-100",
    statsDivider: "bg-slate-100",
    statCount: "text-slate-900",
    statLabel: "text-slate-400",
    btnMessage: "bg-[#FF4F01] hover:bg-[#FF4F01]/90 shadow-lg shadow-[#FF4F01]/10 text-white",
    btnView: "border-slate-200 text-slate-700 hover:text-orange-500 hover:bg-orange-50",
    btnFollow: "border-slate-100 text-slate-400 hover:text-orange-500 hover:bg-orange-50",
  },
  glass: {
    container: "bg-gradient-to-br from-blue-700/10 via-indigo-950/25 to-slate-950/35 border-white/15 backdrop-blur-xl shadow-xl hover:shadow-blue-500/20 text-white",
    banner: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10",
    bannerBlur: "bg-blue-500/15",
    bannerFade: "from-[#0d1226] via-[#0d1226]/60 to-transparent",
    bannerText: "text-blue-300/25",
    avatarBorder: "border-[#0d1226]/90",
    avatarFallback: "bg-blue-600/30 text-blue-100",
    shieldBg: "bg-[#0b1020] border-white/10",
    shieldIcon: "text-blue-400 fill-blue-400/10",
    name: "text-white",
    role: "text-blue-300",
    tag: "text-blue-100/90 bg-white/10 border-white/10",
    statsDivider: "bg-white/10",
    statCount: "text-blue-100",
    statLabel: "text-blue-300/60",
    btnMessage: "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-white",
    btnView: "border-white/10 text-white hover:text-blue-200 hover:bg-white/10",
    btnFollow: "border-white/10 text-blue-300 hover:text-white hover:bg-blue-500/20",
  },
  elite: {
    container: "bg-[#050505] border-amber-500/30 shadow-2xl hover:shadow-amber-500/15 text-white",
    banner: "bg-gradient-to-br from-zinc-900 to-amber-950/20",
    bannerBlur: "bg-amber-500/10",
    bannerFade: "from-[#050505] via-[#050505]/70 to-transparent",
    bannerText: "text-amber-500/15",
    avatarBorder: "border-black ring-1 ring-amber-500/30",
    avatarFallback: "bg-amber-950 text-amber-400",
    shieldBg: "bg-black border-amber-500/20",
    shieldIcon: "text-amber-500 fill-amber-500/10",
    name: "text-amber-50",
    role: "text-amber-400",
    tag: "text-amber-300/90 bg-amber-500/10 border-amber-500/25",
    statsDivider: "bg-amber-500/10",
    statCount: "text-amber-100",
    statLabel: "text-amber-500/50",
    btnMessage: "bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-700 text-black shadow-amber-500/15",
    btnView: "border-amber-500/25 text-amber-300 hover:bg-amber-500/10",
    btnFollow: "border-amber-500/25 text-amber-300 hover:bg-amber-500/10",
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

  const categoryLabelMap: Record<string, string> = {
    artisan: "Artisan",
    freelance: "Freelance",
    entreprise: "Entreprise",
    agence: "Agence",
    startup: "Startup",
    ong: "ONG",
  }
  const displayCategory = categoryLabelMap[category.toLowerCase()] || category
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.tech

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      onClick={() => onAction?.('view')}
      className={cn(
        "relative w-full max-w-[320px] sm:max-w-[280px] lg:max-w-[300px] aspect-[1/1.2] mx-auto rounded-3xl border p-1 flex flex-col cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-300",
        config.container,
        className
      )}
    >
      {/* Premium Specific Lighting Effects */}
      {variant === "elite" && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_62%)] z-0 pointer-events-none rounded-3xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/5 blur-[60px] rounded-full z-0 pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-0 pointer-events-none" />
        </>
      )}

      {variant === "glass" && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_55%)] z-0 pointer-events-none rounded-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.15),transparent_58%)] z-0 pointer-events-none rounded-3xl" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-500/8 blur-[70px] rounded-full z-0 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-44 h-44 bg-indigo-500/6 blur-[70px] rounded-full z-0 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 pointer-events-none" />
        </>
      )}

      {/* Header Banner */}
      <div className={cn("h-[22%] rounded-[1.5rem] relative overflow-visible m-1.5 flex items-center justify-between pl-6 z-10", config.banner)}>
        <div className={cn("absolute top-0 right-0 w-28 h-28 -mr-10 -mt-10 rounded-full blur-xl pointer-events-none", config.bannerBlur)} />
        <div className={cn("absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t pointer-events-none", config.bannerFade)} />

        <span className={cn("relative -top-1 text-3xl font-black select-none tracking-tighter italic", config.bannerText)}>
          {displayCategory}
        </span>

        {/* Level Badge */}
        {variant !== "tech" && (
          <div className={cn(
            "relative z-20 px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider uppercase select-none mr-4 border",
            variant === "elite" 
              ? "border-amber-500/25 bg-amber-500/10 text-amber-400" 
              : "border-white/10 bg-white/5 text-blue-200"
          )}>
            {variant}
          </div>
        )}

        {/* Avatar Positioned Absolute */}
        <div className="absolute left-6 -bottom-9 z-10">
          <Avatar className={cn("h-20 w-20 border-[6px] shadow-lg", config.avatarBorder)}>
            <AvatarImage src={getOptimizedImageUrl(user.avatar, { width: 200, height: 200 })} className="object-cover" />
            <AvatarFallback className={cn("font-black text-xl", config.avatarFallback)}>{name[0]}</AvatarFallback>
          </Avatar>
          {user.verified && (
            <div className={cn("absolute -bottom-1 -right-1 rounded-full p-1 shadow-md border", config.shieldBg)}>
              <Shield className={cn("h-3.5 w-3.5", config.shieldIcon)} />
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col items-center px-4 pt-14 pb-5 z-10">
        <div className="text-center space-y-1 w-full flex-1 flex flex-col justify-center min-h-[2.5rem]">
          <h3 className={cn("text-lg font-black tracking-tight leading-tight line-clamp-2 px-1", config.name)}>
            {name}
          </h3>
          <p className={cn("text-[11px] sm:text-[10px] font-bold tracking-[0.1em] uppercase line-clamp-2", config.role)}>
            {role}
          </p>

          {/* Tags */}
          {user.tags && user.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-2 w-full px-2">
              {user.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full max-w-full truncate border", config.tag)}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Followers / Following Stats */}
          <div className="flex items-center justify-center gap-3 py-4 px-2">
            <div className="text-center">
              <span className={cn("block text-sm font-black", config.statCount)}>{user.followers || '0'}</span>
              <span className={cn("text-[8px] font-bold uppercase tracking-wider", config.statLabel)}>Abonnés</span>
            </div>
            <div className={cn("h-6 w-px", config.statsDivider)} />
            <div className="text-center">
              <span className={cn("block text-sm font-black", config.statCount)}>{following}</span>
              <span className={cn("text-[8px] font-bold uppercase tracking-wider", config.statLabel)}>Suivis</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-1.5 mt-auto">
          <Button 
            onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
            className={cn("flex-1 rounded-xl h-9 font-black text-[9px] uppercase tracking-wider px-2 border-0", config.btnMessage)}
          >
            Message
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); onAction?.('view') }}
            variant="outline"
            className={cn("rounded-xl h-9 transition-colors px-2 text-[9px] font-black uppercase tracking-wider border", config.btnView)}
          >
            Voir profil
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
            variant="outline"
            className={cn("h-9 w-9 shrink-0 rounded-xl transition-colors p-0 border", config.btnFollow)}
          >
            {isFollowed ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

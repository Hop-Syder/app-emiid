/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de profil premium (Elite, Glass, Tech) - EmiID
 * @created 2026-03-23
 * @updated 2026-03-23
*/

"use client"

import { Shield, Plus, Check, Globe, MapPin, MoreHorizontal } from "lucide-react"
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

export function EmiIDProfileCard({ 
  user, 
  variant = "tech", 
  onAction,
  isFollowed = false,
  className
}: EmiIDProfileCardProps) {

  const name = user.name || "Membre EmiID"
  const role = user.role || "Professionnel"
  const location = user.location || "Afrique"
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

  // EMIID ELITE (Luxury Dark)
  if (variant === "elite") {
    return (
      <motion.div 
        whileHover={{ y: -6, transition: { duration: 0.3 } }}
        onClick={() => onAction?.('view')}
        className={cn(
          "relative w-full max-w-[320px] sm:max-w-[280px] lg:max-w-[300px] aspect-[1/1.2] mx-auto rounded-3xl overflow-hidden bg-[#050505] border border-amber-500/30 group shadow-2xl cursor-pointer",
          className
        )}
      >
        {/* Elite Decor */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.20),transparent_62%)] z-0" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/10 blur-[60px] rounded-full z-0" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-0" />
        
        <div className="relative z-20 h-full flex flex-col p-5 sm:p-4 lg:p-6 text-white">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-full border border-amber-500/25 bg-amber-500/10">
                   <span className="text-[8px] font-black tracking-[0.22em] text-amber-400 uppercase">ELITE</span>
                </div>
                <div className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                  <span className="text-[8px] font-black tracking-[0.18em] text-white/70 uppercase">{displayCategory}</span>
                </div>
              </div>
              <MoreHorizontal className="h-4 w-4 text-amber-500/30" />
           </div>

           <div className="mt-5 flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-500/15 blur-md scale-110" />
                <Avatar className="h-[74px] w-[74px] sm:h-[78px] sm:w-[78px] ring-1 ring-amber-500/45 p-0.5 bg-black shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
                  <AvatarImage src={getOptimizedImageUrl(user.avatar, { width: 220, height: 220 })} className="rounded-full object-cover" />
                  <AvatarFallback className="bg-amber-950 text-amber-400 font-black text-xl">{name[0]}</AvatarFallback>
                </Avatar>
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-black shadow-lg">
                    <Shield className="h-3 w-3 text-black fill-black/10" />
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-1 min-h-[3rem] flex flex-col justify-center">
                <h3 className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-amber-50 leading-tight line-clamp-2">
                  {name}
                </h3>
                <p className="text-[10px] font-semibold text-amber-400/70 tracking-[0.14em] uppercase line-clamp-2">
                  {role}
                </p>
              </div>
              
              {user.tags && user.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2 w-full px-1">
                   {user.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-[8px] font-bold text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full max-w-full truncate">
                         {tag}
                      </span>
                   ))}
                </div>
              )}
           </div>

           <div className="mt-4 grid grid-cols-2 gap-2 py-3 border border-amber-500/10 bg-white/5 rounded-2xl text-center">
              <div>
                 <p className="text-[9px] text-amber-500/45 font-black uppercase tracking-[0.18em]">Abonnés</p>
                 <p className="text-base font-extrabold text-amber-50 -mt-0.5">{user.followers || "0"}</p>
              </div>
              <div className="border-l border-amber-500/10">
                 <p className="text-[9px] text-amber-500/45 font-black uppercase tracking-[0.18em]">Suivis</p>
                 <p className="text-base font-extrabold text-amber-50 -mt-0.5">{following}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-2 mt-auto pt-4">
              <Button 
                onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
                className="rounded-2xl h-11 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-700 text-black font-black text-[10px] uppercase tracking-[0.18em] shadow-lg shadow-amber-500/15"
              >
                Message
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
                variant="outline"
                className="rounded-2xl h-11 border-amber-500/25 bg-transparent text-amber-300 font-black text-[10px] uppercase tracking-[0.18em] hover:bg-amber-500/10"
              >
                {isFollowed ? 'Abonné' : 'Suivre'}
              </Button>
           </div>
        </div>
      </motion.div>
    )
  }

  // EMIID GLASS (Modern Blue)
  if (variant === "glass") {
    return (
      <motion.div 
        whileHover={{ y: -6 }}
        onClick={() => onAction?.('view')}
        className={cn(
          "relative w-full max-w-[320px] sm:max-w-[280px] lg:max-w-[300px] aspect-[1/1.2] mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-blue-700/10 via-indigo-950/25 to-slate-950/35 border border-white/15 backdrop-blur-xl shadow-xl hover:shadow-blue-500/20 cursor-pointer group",
          className
        )}
      >
        {/* Glass decor */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.22),transparent_58%)]" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-500/12 blur-[70px] rounded-full" />
        <div className="absolute -top-24 -left-24 w-44 h-44 bg-indigo-500/10 blur-[70px] rounded-full" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        
        <div className="relative h-full flex flex-col p-6 sm:p-5 text-white">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-300/60" />
              <div className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-[8px] font-black tracking-[0.22em] text-blue-100/80 uppercase">
                GLASS
              </div>
            </div>
            <div className="px-2 py-1 rounded-full bg-blue-500/15 border border-white/10 text-[8px] font-black tracking-[0.22em] text-blue-200 uppercase">
              MODERN
            </div>
          </div>

          {/* Identity */}
          <div className="flex flex-col items-center mt-5 mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/15 blur-md scale-110" />
              <Avatar className="h-[78px] w-[78px] ring-1 ring-white/20 bg-white/5 shadow-[0_18px_44px_rgba(0,0,0,0.45)]">
                <AvatarImage src={getOptimizedImageUrl(user.avatar, { width: 220, height: 220 })} className="object-cover" />
                <AvatarFallback className="bg-blue-600/30 text-blue-100 font-black">{name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0b1020] rounded-full shadow-md" />
              {user.verified && (
                <div className="absolute -top-1 -left-1 bg-white/90 rounded-full p-1 shadow-md border border-white/20">
                  <Shield className="h-3.5 w-3.5 text-blue-700 fill-blue-700/10" />
                </div>
              )}
            </div>

            <div className="mt-3 text-center min-h-[2.25rem] flex flex-col justify-center">
              <h3 className="text-lg font-extrabold tracking-tight leading-tight line-clamp-2">
                {name}
              </h3>
              <p className="text-[10px] font-black text-blue-200/80 uppercase tracking-[0.22em] mt-1 line-clamp-2">
                {role}
              </p>
                
              {user.tags && user.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-3 w-full px-1">
                  {user.tags.slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[8px] font-extrabold text-blue-100/90 bg-white/10 border border-white/10 px-2.5 py-1 rounded-full max-w-full truncate"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-3 py-4 border-t border-white/10 flex-1">
            <div className="flex items-center gap-2 text-[11px] text-white/75">
              <MapPin className="h-3.5 w-3.5 text-blue-300/70" />
              <span className="truncate font-semibold">{location}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-[10px] font-black tracking-[0.22em] text-blue-100/70 uppercase">
                Expertise
              </div>
              <div className="mt-1 text-[12px] font-semibold text-white/85 line-clamp-2">
                {user.specialty || "Secteur digital"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/10">
            <Button 
              onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
              className="rounded-2xl h-11 bg-white text-blue-950 font-black text-[10px] tracking-[0.18em] uppercase hover:scale-[1.02] transition-transform"
            >
              Message
            </Button>
            <Button 
              onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
              className="rounded-2xl h-11 bg-blue-500/20 border border-white/15 font-black text-[10px] tracking-[0.18em] uppercase hover:bg-blue-500/35"
            >
              {isFollowed ? 'Suivi' : 'Suivre'}
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // EMIID TECH (White/Orange - Default)
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      onClick={() => onAction?.('view')}
      className={cn(
        "relative w-full max-w-[320px] sm:max-w-[280px] lg:max-w-[300px] aspect-[1/1.2] mx-auto rounded-3xl bg-white border border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-slate-200/60 p-1 flex flex-col cursor-pointer group",
        className
      )}
    >
      <div className="h-[22%] rounded-[1.5rem] bg-gradient-to-br from-slate-50 to-orange-50/40 relative overflow-visible m-1.5 flex items-center justify-start pl-6">
        <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/10 -mr-10 -mt-10 rounded-full blur-xl" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none" />

        <span className="relative -top-1 text-3xl font-black text-slate-200 select-none tracking-tighter italic">
          {displayCategory}
        </span>

        <div className="absolute left-6 -bottom-9 z-10">
          <Avatar className="h-20 w-20 border-[6px] border-white shadow-lg">
            <AvatarImage src={getOptimizedImageUrl(user.avatar, { width: 200, height: 200 })} className="object-cover" />
            <AvatarFallback className="bg-orange-500 text-white font-black text-xl">{name[0]}</AvatarFallback>
          </Avatar>
          {user.verified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-slate-100">
              <Shield className="h-3.5 w-3.5 text-blue-600 fill-blue-600/10" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-14 pb-5">
         <div className="text-center space-y-1 w-full flex-1 flex flex-col justify-center min-h-[2.5rem]">
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight line-clamp-2 px-1">
              {name}
            </h3>
            <p className="text-[11px] sm:text-[10px] font-bold text-orange-500 tracking-[0.1em] uppercase line-clamp-2">
              {role}
            </p>

            {user.tags && user.tags.length > 0 && (
               <div className="flex flex-wrap justify-center gap-1 mt-2 w-full px-2">
                  {user.tags.slice(0, 4).map((tag, i) => (
                     <span key={i} className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full max-w-full truncate">
                        {tag}
                     </span>
                  ))}
               </div>
            )}

            <div className="flex items-center justify-center gap-3 py-4 px-2">
               <div className="text-center">
                  <span className="block text-sm font-black text-slate-900">{user.followers || '0'}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Abonnés</span>
               </div>
               <div className="h-6 w-px bg-slate-100" />
               <div className="text-center">
                  <span className="block text-sm font-black text-slate-900">{following}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Suivis</span>
               </div>
            </div>

         </div>

         <div className="w-full flex gap-1.5 mt-auto">
            <Button 
               onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
               className="flex-1 rounded-xl h-9 bg-[#FF4F01] hover:bg-[#FF4F01]/90 shadow-lg shadow-[#FF4F01]/10 font-black text-[9px] uppercase tracking-wider px-2"
            >
               Message
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); onAction?.('view') }}
              variant="outline"
              className="rounded-xl h-9 border-slate-200 text-slate-700 hover:text-orange-500 hover:bg-orange-50 transition-colors px-2 text-[9px] font-black uppercase tracking-wider"
            >
              Voir profil
            </Button>
            <Button 
               onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
               variant="outline"
               className="h-9 w-9 shrink-0 rounded-xl border-slate-100 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors p-0"
            >
               {isFollowed ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </Button>
         </div>
      </div>
    </motion.div>
  )
}

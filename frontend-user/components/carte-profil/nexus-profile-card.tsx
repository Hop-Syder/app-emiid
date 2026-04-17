/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de profil premium (Elite, Glass, Tech) - Version Optimisée & Responsive
 * @created 2026-03-23
 * @updated 2026-03-23
*/

"use client"

import { Shield, Plus, Check, Star, Globe, MapPin, MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type NexusCardVariant = "elite" | "glass" | "tech"

interface NexusProfileCardProps {
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
  variant?: NexusCardVariant
  onAction?: (type: 'message' | 'follow' | 'view') => void
  isFollowed?: boolean
  className?: string
}

export function NexusProfileCard({ 
  user, 
  variant = "tech", 
  onAction,
  isFollowed = false,
  className
}: NexusProfileCardProps) {

  const name = user.name || "Membre Nexus"
  const role = user.role || "Professionnel"
  const location = user.location || "Afrique"
  const category = user.category || "Nexus"
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

  // NEXUS ELITE (Luxury Dark)
  if (variant === "elite") {
    return (
      <motion.div 
        whileHover={{ y: -6, transition: { duration: 0.3 } }}
        onClick={() => onAction?.('view')}
        className={cn(
          "relative w-full max-w-[320px] sm:max-w-[280px] lg:max-w-[300px] aspect-[1/1.4] mx-auto rounded-3xl overflow-hidden bg-[#050505] border border-amber-500/30 group shadow-2xl cursor-pointer",
          className
        )}
      >
        {/* Elite Decor */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_60%)] z-0" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent z-0" />
        
        <div className="relative z-20 h-full flex flex-col p-5 sm:p-4 lg:p-6 text-white text-center">
           <div className="flex justify-between items-center mb-4">
              <div className="px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/5">
                 <span className="text-[8px] font-black tracking-[0.2em] text-amber-500 uppercase">PRÉMIUM</span>
              </div>
              <MoreHorizontal className="h-4 w-4 text-amber-500/30" />
           </div>

           <div className="relative mx-auto mb-2">
              <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-md scale-105" />
              <Avatar className="h-16 w-16 sm:h-18 lg:h-22 ring-1 ring-amber-500/40 p-0.5 bg-black mx-auto">
                <AvatarImage src={user.avatar} className="rounded-full object-cover" />
                <AvatarFallback className="bg-amber-950 text-amber-500 font-bold text-xs">{name[0]}</AvatarFallback>
              </Avatar>
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-black shadow-lg">
                  <Shield className="h-2.5 w-2.5 text-black fill-black" />
                </div>
              )}
           </div>

           <div className="space-y-1 mb-2 flex flex-col justify-center min-h-[3.5rem]">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-amber-50 font-serif leading-tight">
                {name}
              </h3>
              <p className="text-[10px] sm:text-[10px] font-medium text-amber-500/60 tracking-wider">
                {role}
              </p>
              
              {user.tags && user.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2 w-full px-1">
                   {user.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-[8px] font-bold text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full max-w-full truncate">
                         {tag}
                      </span>
                   ))}
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-2 py-2 border-y border-amber-500/10 mb-2 bg-white/5 rounded-xl">
              <div>
                 <p className="text-[7px] text-amber-500/40 font-black uppercase mb-0 tracking-tighter">Abonnés</p>
                 <p className="text-xs font-bold">{user.followers || '0'}</p>
              </div>
              <div className="border-l border-amber-500/10">
                 <p className="text-[7px] text-amber-500/40 font-black uppercase mb-0 tracking-tighter">Activité</p>
                 <div className="flex justify-center items-center h-4">
                    <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 mr-1" />
                    <span className="text-[10px] font-bold tracking-tighter">PRO</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-2 mt-auto">
              <Button 
                onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
                className="rounded-xl h-10 bg-amber-500 hover:bg-amber-600 text-black font-black text-[9px] uppercase tracking-tighter"
              >
                Message
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
                variant="outline"
                className="rounded-xl h-10 border-amber-500/20 bg-transparent text-amber-500 font-black text-[9px] uppercase tracking-tighter hover:bg-amber-500/10"
              >
                {isFollowed ? 'Abonné' : 'Suivre'}
              </Button>
           </div>
        </div>
      </motion.div>
    )
  }

  // NEXUS GLASS (Modern Blue)
  if (variant === "glass") {
    return (
      <motion.div 
        whileHover={{ y: -6 }}
        onClick={() => onAction?.('view')}
        className={cn(
          "relative w-full max-w-[320px] sm:max-w-[280px] lg:max-w-[300px] aspect-[1/1.4] mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600/10 to-indigo-950/30 border border-white/20 backdrop-blur-xl shadow-xl hover:shadow-blue-500/20 cursor-pointer group",
          className
        )}
      >
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full" />
        
        <div className="relative h-full flex flex-col p-6 sm:p-5 text-white">
          <div className="flex items-center justify-between mb-4">
             <Globe className="h-4 w-4 text-blue-400 opacity-40" />
             <div className="px-2 py-0.5 rounded-md bg-blue-500/20 text-[8px] font-bold tracking-widest text-blue-300">MODERN</div>
          </div>

          <div className="flex flex-col items-center mb-6">
             <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-blue-500/10 shadow-2xl">
                  <AvatarImage src={user.avatar} className="object-cover" />
                  <AvatarFallback className="bg-blue-600/30">{name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 border-2 border-[#12121e] rounded-full" />
             </div>
             <div className="mt-3 text-center min-h-[3rem] flex flex-col justify-center">
                <h3 className="text-lg font-black tracking-tight leading-tight">{name}</h3>
                <p className="text-[10px] sm:text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-0.5 line-clamp-2">{category}</p>
                
                {user.tags && user.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-2 w-full px-1">
                     {user.tags.slice(0, 4).map((tag, i) => (
                         <span key={i} className="text-[8px] font-bold text-blue-200 bg-blue-500/20 border border-blue-400/20 px-2 py-0.5 rounded-full max-w-full truncate">
                            {tag}
                         </span>
                     ))}
                  </div>
                )}
             </div>
          </div>

          <div className="flex flex-col gap-3 py-4 border-t border-white/5 flex-1">
             <div className="flex items-center gap-2 text-[11px] opacity-70">
                <MapPin className="h-3 w-3 text-blue-400" />
                <span className="truncate">{location}</span>
             </div>
             <div className="h-10 text-[11px] font-medium leading-relaxed opacity-80 italic line-clamp-2">
                Expertise focalisée sur le {user.specialty || "secteur digital"}.
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
             <Button 
               onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
               className="rounded-full h-10 bg-white text-blue-900 font-bold text-[10px] tracking-wide hover:scale-105 transition-transform"
             >
               MESSAGE
             </Button>
             <Button 
               onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
               className="rounded-full h-10 bg-blue-500/20 border border-white/20 font-bold text-[10px] tracking-wide hover:bg-blue-500/40"
             >
               {isFollowed ? 'SUIVI' : 'SUIVRE'}
             </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // NEXUS TECH (White/Orange - Default)
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      onClick={() => onAction?.('view')}
      className={cn(
        "relative w-full max-w-[320px] sm:max-w-[280px] lg:max-w-[300px] aspect-[1/1.4] mx-auto rounded-3xl bg-white border border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-slate-200/60 p-1 flex flex-col cursor-pointer group",
        className
      )}
    >
      <div className="h-[20%] rounded-[1.5rem] bg-slate-50 relative overflow-visible m-1.5 flex items-center justify-start pl-6">
         <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 -mr-8 -mt-8 rounded-full blur-xl" />
         <span className="relative -top-1 text-3xl font-black text-slate-200 select-none tracking-tighter italic">{displayCategory}</span>
         
         <Avatar className="absolute left-6 -bottom-10 z-10 h-20 w-20 border-[6px] border-white shadow-lg">
            <AvatarImage src={user.avatar} className="object-cover" />
            <AvatarFallback className="bg-orange-500 text-white font-black text-xl">{name[0]}</AvatarFallback>
         </Avatar>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 pt-8 pb-5">
         <div className="text-center space-y-1 w-full flex-1 flex flex-col justify-center min-h-[3rem]">
            <h3 className="relative -top-2 text-lg font-black text-slate-800 tracking-tight leading-tight">{name}</h3>
            <p className="text-[11px] sm:text-[10px] font-bold text-orange-500 tracking-[0.1em] uppercase line-clamp-2">{role}</p>

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

         <div className="w-full flex gap-2 mt-auto">
            <Button 
               onClick={(e) => { e.stopPropagation(); onAction?.('message') }}
               className="flex-1 rounded-xl h-11 bg-[#FF4F01] hover:bg-[#FF4F01]/90 shadow-lg shadow-[#FF4F01]/10 font-black text-[10px] uppercase tracking-wider"
            >
               Message
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); onAction?.('view') }}
              variant="outline"
              className="rounded-xl h-11 border-slate-200 text-slate-700 hover:text-orange-500 hover:bg-orange-50 transition-colors px-4 text-[10px] font-black uppercase tracking-wider"
            >
              Voir profil
            </Button>
            <Button 
               onClick={(e) => { e.stopPropagation(); onAction?.('follow') }}
               variant="outline"
               className="h-11 w-11 rounded-xl border-slate-100 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            >
               {isFollowed ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
         </div>
      </div>
    </motion.div>
  )
}

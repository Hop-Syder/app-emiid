/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant de carte de profil multi-styles (Elite, Glass, Tech)
 * @created 2026-03-23
*/

"use client"

import { Shield, MessageSquare, Plus, Check, Star, Zap, Globe, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    followers?: number
    verified?: boolean
    premium?: boolean
    tags?: string[]
  }
  variant?: NexusCardVariant
  onAction?: (type: 'message' | 'follow' | 'view') => void
  isFollowed?: boolean
}

export function NexusProfileCard({ 
  user, 
  variant = "tech", 
  onAction,
  isFollowed = false
}: NexusProfileCardProps) {

  // RENDU NEXUS ELITE (DARK GOLD LUXURY)
  if (variant === "elite") {
    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="relative aspect-[3/4.2] w-full max-w-[340px] rounded-[32px] overflow-hidden bg-[#0A0B0E] border border-amber-500/20 shadow-2xl group"
      >
        {/* Elite Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.1),transparent_70%)]" />
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col p-6 text-white pt-10">
           {/* Header / Badge */}
           <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
                <Avatar className="h-28 w-28 ring-2 ring-amber-500/50 p-1 bg-[#0A0B0E]">
                  <AvatarImage src={user.avatar} className="rounded-full object-cover" />
                  <AvatarFallback className="bg-amber-500/10 text-amber-500 text-2xl font-black">
                     {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1.5 border-4 border-[#0A0B0E] shadow-lg">
                    <Shield className="h-4 w-4 text-black fill-black" />
                  </div>
                )}
              </div>
           </div>

           <div className="text-center space-y-1 mb-6 flex-1">
              <p className="text-[10px] font-black tracking-[0.3em] text-amber-500 uppercase mb-2">
                {user.category || "Membre Elite"}
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-amber-50 font-serif">
                {user.name}
              </h3>
              <p className="text-sm font-medium text-amber-100/60 tracking-wide">
                {user.role}
              </p>
           </div>

           {/* Stats / Tech */}
           <div className="grid grid-cols-2 gap-4 py-4 border-y border-amber-500/10 mb-6">
              <div className="text-center">
                 <p className="text-[10px] text-amber-500/50 font-bold uppercase mb-0.5">Followers</p>
                 <p className="text-lg font-bold">{user.followers || 0}</p>
              </div>
              <div className="text-center border-l border-amber-500/10">
                 <p className="text-[10px] text-amber-500/50 font-bold uppercase mb-0.5">Rating</p>
                 <div className="flex justify-center items-center h-7">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                    <span className="font-bold">4.9</span>
                 </div>
              </div>
           </div>

           {/* Actions */}
           <div className="grid grid-cols-2 gap-3 pb-2">
              <Button 
                onClick={() => onAction?.('message')}
                className="rounded-2xl h-12 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider text-[10px]"
              >
                Message
              </Button>
              <Button 
                onClick={() => onAction?.('follow')}
                variant="outline"
                className="rounded-2xl h-12 border-amber-500/30 font-black uppercase tracking-wider text-[10px] text-amber-500 hover:bg-amber-500/10"
              >
                {isFollowed ? 'Abonné' : 'Suivre'}
              </Button>
           </div>
        </div>
      </motion.div>
    )
  }

  // RENDU NEXUS GLASS (BLUE NEON)
  if (variant === "glass") {
    return (
      <motion.div 
        whileHover={{ y: -8 }}
        className="relative aspect-[3/4.2] w-full max-w-[340px] rounded-[40px] overflow-hidden bg-gradient-to-br from-blue-600/20 to-indigo-900/40 border border-white/20 backdrop-blur-xl shadow-2xl group shadow-blue-500/10"
      >
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 blur-[80px] rounded-full" />
        <div className="absolute top-8 right-8">
           <Zap className="h-8 w-8 text-blue-400 opacity-20 group-hover:opacity-60 transition-opacity" />
        </div>

        <div className="relative h-full flex flex-col p-8 text-white">
          <div className="mb-6">
             <div className="flex items-center gap-4">
               <Avatar className="h-20 w-20 ring-4 ring-white/10 shadow-2xl">
                 <AvatarImage src={user.avatar} className="object-cover" />
                 <AvatarFallback className="bg-blue-600/40">{user.name[0]}</AvatarFallback>
               </Avatar>
               <div>
                  <h3 className="text-xl font-black tracking-tight">{user.name}</h3>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{user.category}</p>
               </div>
             </div>
          </div>

          <p className="text-sm font-medium leading-relaxed opacity-80 flex-1 italic">
             "{user.role} expert au service de vos projets digitaux."
          </p>

          <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                   <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">Connecté</span>
                </div>
                <Badge className="rounded-lg bg-white/10 text-[10px] font-black tracking-widest border-0">#{user.specialty}</Badge>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <Button 
                   onClick={() => onAction?.('message')}
                   className="rounded-3xl h-12 bg-white text-blue-900 font-black tracking-widest text-[10px] hover:bg-blue-50 shadow-lg shadow-blue-500/20"
                >
                   CONTACT
                </Button>
                <Button 
                   onClick={() => onAction?.('follow')}
                   className="rounded-3xl h-12 bg-blue-500/20 border border-white/20 font-black tracking-widest text-[10px] hover:bg-blue-500/40"
                >
                   {isFollowed ? 'SUIVI' : 'JOIN'}
                </Button>
             </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // RENDU NEXUS TECH / MINIMAL (ORANGE MODERN)
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative aspect-[3/4.2] w-full max-w-[340px] rounded-[48px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 p-1 group flex flex-col"
    >
      {/* Top Banner with Geometry */}
      <div className="h-40 rounded-[38px] bg-[#F5F7FA] relative overflow-hidden m-2">
         <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 -mr-10 -mt-10 rounded-full blur-2xl" />
         <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
            <h1 className="text-8xl font-black tracking-tighter italic">NEXUS</h1>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 -mt-12 pb-8">
         <Avatar className="h-24 w-24 border-[6px] border-white shadow-xl mb-4 group-hover:scale-105 transition-transform duration-500">
            <AvatarImage src={user.avatar} className="object-cover" />
            <AvatarFallback className="bg-orange-500 text-white font-black text-2xl">{user.name[0]}</AvatarFallback>
         </Avatar>

         <div className="text-center space-y-2 flex-1 w-full">
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
              {user.name}
            </h3>
            <p className="text-xs font-bold text-orange-500 tracking-[0.2em] uppercase">
              {user.role}
            </p>
            
            <div className="flex items-center justify-center gap-4 py-4">
               <div className="text-center">
                  <span className="block text-lg font-black text-slate-900">{user.followers || 120}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Abonnés</span>
               </div>
               <div className="h-6 w-px bg-slate-100" />
               <div className="text-center">
                  <span className="block text-lg font-black text-slate-900">34</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projets</span>
               </div>
            </div>
         </div>

         {/* Tech Actions */}
         <div className="w-full flex gap-3 pt-6 border-t border-slate-50">
            <Button 
               onClick={() => onAction?.('message')}
               className="flex-1 rounded-2xl h-14 bg-[#FF4F01] hover:bg-[#FF4F01]/90 shadow-xl shadow-[#FF4F01]/20 font-black text-[11px] tracking-widest uppercase"
            >
               Message
            </Button>
            <Button 
               onClick={() => onAction?.('follow')}
               variant="outline"
               className="h-14 w-14 rounded-2xl border-slate-100 shadow-sm text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            >
               {isFollowed ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
         </div>
      </div>
    </motion.div>
  )
}

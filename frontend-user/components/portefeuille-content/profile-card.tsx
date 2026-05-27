/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de profil pour le portefeuille avec CRM Notes et design Premium Ethereal
 * @created 2026-03-23
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { StickyNote, Loader2, CheckCircle2, UserMinus, Mail, MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface ProfileData {
    id: string
    name: string
    role: string
    location: string
    avatar: string
    lastActive: string
    newUpdates: number
    lastUpdate: string
    followers: number
    premium?: boolean
    verified?: boolean
    specialty?: string
    notes?: string
    card_variant?: string
}

interface ProfileCardProps {
    profile: ProfileData
    onUnfollow?: (id: string) => void
    onViewProfile?: (id: string) => void
    onSaveNote?: (id: string, note: string) => void
    onMessage?: (id: string) => void
}

const NOTE_COLORS = [
    "bg-[#fef3c7]/30 border-[#fde68a]/40 text-[#92400e]",
    "bg-[#e0f2fe]/30 border-[#bae6fd]/40 text-[#075985]",
    "bg-[#dcfce7]/30 border-[#bbf7d0]/40 text-[#166534]",
    "bg-[#fce7f3]/30 border-[#fbcfe8]/40 text-[#9d174d]",
    "bg-[#f3e8ff]/30 border-[#e9d5ff]/40 text-[#6b21a8]",
    "bg-[#ffedd5]/30 border-[#fed7aa]/40 text-[#9a3412]",
];

export function ProfileCard({ profile, onUnfollow, onViewProfile, onSaveNote, onMessage }: ProfileCardProps) {
    const [localNote, setLocalNote] = useState(profile.notes || "")
    const [isSaving, setIsSaving] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const colorIndex = profile.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % NOTE_COLORS.length;
    const noteTheme = NOTE_COLORS[colorIndex];

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSaveNote?.(profile.id, localNote)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative w-full flex flex-col gap-4 items-stretch"
        >
            <div className="flex flex-col lg:flex-row gap-4 w-full">
                {/* Bloc Identité Premium */}
                <Card 
                    className={cn(
                        "relative w-full lg:w-[320px] rounded-[2rem] p-8 cursor-pointer overflow-hidden transition-all duration-500 border-none shadow-xl flex flex-col justify-between group/id",
                        profile.premium ? "bg-slate-950 text-white" : "bg-white text-slate-900"
                    )}
                    onClick={() => onViewProfile?.(profile.id)}
                >
                    {/* Animated Background Orbs */}
                    <div className={cn(
                        "absolute -top-24 -right-24 w-64 h-64 opacity-20 rounded-full blur-[80px] transition-transform duration-1000 group-hover/id:scale-125",
                        profile.premium ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <div className={cn(
                        "absolute -bottom-24 -left-24 w-64 h-64 opacity-10 rounded-full blur-[80px] transition-transform duration-1000 group-hover/id:scale-125 delay-150",
                        profile.premium ? "bg-purple-500" : "bg-emerald-500"
                    )} />

                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                        <div className="relative group/avatar">
                            <motion.div 
                                animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                                className={cn(
                                    "absolute inset-0 rounded-full blur-xl opacity-30",
                                    profile.premium ? "bg-amber-400" : "bg-blue-400"
                                )}
                            />
                            <img 
                                src={profile.avatar} 
                                alt={profile.name}
                                className="relative h-28 w-28 rounded-full object-cover border-4 border-white/20 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105"
                            />
                            {profile.verified && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute bottom-1 right-1 bg-blue-500 rounded-full p-1.5 border-4 border-white shadow-lg"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-white fill-white" />
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight leading-none group-hover/id:text-blue-500 transition-colors">
                                {profile.name}
                            </h3>
                            <div className="flex flex-col items-center gap-1">
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-[0.2em]",
                                    profile.premium ? "text-amber-500" : "text-blue-600"
                                )}>
                                    {profile.role}
                                </span>
                                <div className="flex items-center gap-1 opacity-50">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-[10px] font-semibold">{profile.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Rapides */}
                    <div className="relative z-10 flex items-center gap-3 mt-8">
                        <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onMessage?.(profile.id) }}
                            className={cn(
                                "flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg",
                                profile.premium ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-blue-600 text-white hover:bg-blue-500"
                            )}
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Message
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); onUnfollow?.(profile.id) }}
                            className={cn(
                                "h-12 w-12 rounded-2xl border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all",
                                profile.premium ? "border-white/10 text-white/40 hover:bg-white/5" : "bg-white/50 backdrop-blur-sm"
                            )}
                        >
                            <UserMinus className="h-5 w-5" />
                        </Button>
                    </div>
                </Card>

                {/* Bloc CRM Notes Ethereal */}
                <Card className={cn(
                    "flex-1 min-h-[300px] lg:min-h-0 p-8 rounded-[2rem] border-none shadow-xl flex flex-col transition-all duration-500 relative overflow-hidden group/note backdrop-blur-xl",
                    noteTheme
                )}>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
                    
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-black/5">
                                <StickyNote className="h-4 w-4 opacity-60" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Notes Stratégiques</span>
                                <span className="text-[9px] font-bold opacity-40 uppercase">CRM Personnel</span>
                            </div>
                        </div>
                        {isSaving ? (
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold opacity-40 uppercase">Sauvegarde...</span>
                                <Loader2 className="h-4 w-4 animate-spin opacity-40" />
                            </div>
                        ) : (
                            <motion.div 
                                animate={localNote !== (profile.notes || "") ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={cn(
                                    "h-2 w-2 rounded-full transition-colors",
                                    localNote !== (profile.notes || "") ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-green-500"
                                )} 
                            />
                        )}
                    </div>

                    <div className="flex-1 relative">
                        <Textarea
                            value={localNote}
                            onChange={(e) => setLocalNote(e.target.value)}
                            placeholder="Consignez vos observations clés, opportunités de collaboration ou points de discussion pour votre prochain échange..."
                            className="w-full h-full min-h-[160px] text-base resize-none bg-transparent border-0 focus-visible:ring-0 p-0 shadow-none placeholder:opacity-20 placeholder:text-slate-900 font-medium leading-relaxed"
                        />
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-black/5">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Dernière Mise à Jour</span>
                            <span className="text-xs font-bold opacity-50 italic">
                                {profile.lastUpdate || "Nouvelle connexion"}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewProfile?.(profile.id)}
                                className="h-11 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider opacity-60 hover:opacity-100"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Profil complet
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving || localNote === (profile.notes || "")}
                                className={cn(
                                    "h-11 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all",
                                    localNote !== (profile.notes || "") 
                                        ? "bg-slate-900 text-white hover:scale-105 active:scale-95 shadow-xl hover:bg-slate-800" 
                                        : "bg-black/5 text-black/20 cursor-not-allowed"
                                )}
                            >
                                {isSaving ? "Sauvegarde..." : "Enregistrer"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    )
}

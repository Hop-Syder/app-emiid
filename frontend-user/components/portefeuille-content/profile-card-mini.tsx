/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de profil miniature pour le portefeuille
 * @created 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
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

interface ProfileCardMiniProps {
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

export function ProfileCardMini({ profile, onUnfollow, onViewProfile, onSaveNote, onMessage }: ProfileCardMiniProps) {
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
            className="group relative w-full flex flex-col gap-3 items-stretch"
        >
            <div className="flex flex-col lg:flex-row gap-3 w-full">
                {/* Bloc Identité Premium - Miniature */}
                <Card 
                    className={cn(
                        "relative w-full lg:w-[350px] rounded-2xl p-4 cursor-pointer overflow-hidden transition-all duration-300 border-none shadow-md flex flex-col justify-between group/id",
                        profile.premium ? "bg-slate-950 text-white" : "bg-white text-slate-900"
                    )}
                    onClick={() => onViewProfile?.(profile.id)}
                >
                    {/* Background Orbs */}
                    <div className={cn(
                        "absolute -top-10 -right-10 w-32 h-32 opacity-20 rounded-full blur-[40px] transition-transform duration-700 group-hover/id:scale-110",
                        profile.premium ? "bg-amber-500" : "bg-blue-500"
                    )} />

                    <div className="relative z-10 flex flex-row items-center gap-4">
                        <div className="relative group/avatar shrink-0">
                            <motion.div 
                                animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                                className={cn(
                                    "absolute inset-0 rounded-full blur-md opacity-30",
                                    profile.premium ? "bg-amber-400" : "bg-blue-400"
                                )}
                            />
                            <img 
                                src={profile.avatar} 
                                alt={profile.name}
                                className="relative h-16 w-16 rounded-full object-cover border-2 border-white/20 shadow-lg transition-transform duration-300 group-hover/avatar:scale-105"
                            />
                            {profile.verified && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white shadow-sm"
                                >
                                    <CheckCircle2 className="h-3 w-3 text-white fill-white" />
                                </motion.div>
                            )}
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                            <h3 className="text-lg font-black tracking-tight truncate group-hover/id:text-blue-500 transition-colors">
                                {profile.name}
                            </h3>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-[0.1em] truncate",
                                profile.premium ? "text-amber-500" : "text-blue-600"
                            )}>
                                {profile.role}
                            </span>
                            <div className="flex items-center gap-1 opacity-50 mt-1 truncate">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="text-[10px] font-semibold truncate">{profile.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions Rapides - Compactes */}
                    <div className="relative z-10 flex items-center gap-2 mt-4">
                        <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onMessage?.(profile.id) }}
                            className={cn(
                                "flex-1 h-9 rounded-xl font-bold text-[10px] uppercase tracking-wide transition-all shadow-sm",
                                profile.premium ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-blue-600 text-white hover:bg-blue-500"
                            )}
                        >
                            <Mail className="h-3.5 w-3.5 mr-1.5" />
                            Message
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); onUnfollow?.(profile.id) }}
                            className={cn(
                                "h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shrink-0",
                                profile.premium ? "border-white/10 text-white/40 hover:bg-white/5" : "bg-white/50 backdrop-blur-sm"
                            )}
                            title="Ne plus suivre"
                        >
                            <UserMinus className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); onViewProfile?.(profile.id) }}
                            className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-blue-500 shrink-0"
                            title="Voir le profil"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>

                {/* Bloc CRM Notes Ethereal - Miniature */}
                <Card className={cn(
                    "flex-1 p-4 rounded-2xl border-none shadow-md flex flex-col transition-all duration-300 relative overflow-hidden group/note backdrop-blur-xl",
                    noteTheme
                )}>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
                    
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-black/5">
                                <StickyNote className="h-3.5 w-3.5 opacity-60" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60">Notes CRM</span>
                        </div>
                        {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin opacity-40" />
                        ) : (
                            <motion.div 
                                animate={localNote !== (profile.notes || "") ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-colors",
                                    localNote !== (profile.notes || "") ? "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" : "bg-green-500"
                                )} 
                            />
                        )}
                    </div>

                    <div className="flex-1 relative">
                        <Textarea
                            value={localNote}
                            onChange={(e) => setLocalNote(e.target.value)}
                            placeholder="Vos observations..."
                            className="w-full h-full min-h-[60px] text-sm resize-none bg-transparent border-0 focus-visible:ring-0 p-0 shadow-none placeholder:opacity-30 placeholder:text-slate-900 font-medium leading-relaxed"
                        />
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                        <span className="text-[9px] font-bold opacity-40 italic truncate max-w-[120px]">
                            {profile.lastUpdate || "Nouvelle connexion"}
                        </span>
                        
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || localNote === (profile.notes || "")}
                            className={cn(
                                "h-7 px-4 rounded-lg font-bold text-[9px] uppercase tracking-wide transition-all",
                                localNote !== (profile.notes || "") 
                                    ? "bg-slate-900 text-white shadow-md hover:bg-slate-800" 
                                    : "bg-black/5 text-black/30 cursor-not-allowed"
                            )}
                        >
                            {isSaving ? "Sauvegarde..." : "Enregistrer"}
                        </Button>
                    </div>
                </Card>
            </div>
        </motion.div>
    )
}

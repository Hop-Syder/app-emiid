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
    slug?: string
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

export function ProfileCardMini({ profile, onUnfollow, onViewProfile, onSaveNote, onMessage }: ProfileCardMiniProps) {
    const [localNote, setLocalNote] = useState(profile.notes || "")
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSaveNote?.(profile.id, localNote)
        } finally {
            setIsSaving(false)
        }
    }

    const cardBg = profile.premium ? "bg-slate-950/80 text-white border-white/10" : "bg-white/80 text-slate-900 border-slate-200/50"
    const accentColor = profile.premium ? "text-amber-500" : "text-blue-500"
    const bgAccent = profile.premium ? "bg-amber-500" : "bg-blue-500"

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group w-full flex flex-col lg:flex-row gap-3 items-stretch"
        >
            {/* Bloc Identité (Miniature Minimaliste) */}
            <Card 
                className={cn(
                    "relative w-full lg:w-[350px] rounded-2xl p-4 cursor-pointer overflow-hidden transition-all duration-300 backdrop-blur-xl shadow-sm hover:shadow-md flex flex-col justify-between group/id",
                    cardBg
                )}
                onClick={() => onViewProfile?.(profile.slug || profile.id)}
            >
                {profile.premium && (
                    <div className="absolute top-0 right-0 p-2 opacity-30 pointer-events-none">
                        <div className="w-16 h-16 bg-amber-500/20 blur-2xl rounded-full" />
                    </div>
                )}

                <div className="relative z-10 flex flex-row items-center gap-4">
                    <div className="relative group/avatar shrink-0">
                        <img 
                            src={profile.avatar} 
                            alt={profile.name}
                            className="relative h-16 w-16 rounded-full object-cover shadow-lg transition-transform duration-300 group-hover/avatar:scale-105"
                        />
                        {profile.verified && (
                            <div className={cn("absolute -bottom-1 -right-1 rounded-full p-1 shadow-sm border-2", profile.premium ? "bg-black border-amber-900" : "bg-white border-blue-100")}>
                                <CheckCircle2 className={cn("h-3 w-3", accentColor)} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="text-lg font-bold tracking-tight truncate group-hover/id:opacity-80 transition-opacity">
                            {profile.name}
                        </h3>
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest truncate", accentColor)}>
                            {profile.role}
                        </span>
                        <div className="flex items-center gap-1 opacity-50 mt-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="text-[10px] font-medium truncate">{profile.location}</span>
                        </div>
                    </div>
                </div>

                {/* Actions Rapides - Compactes */}
                <div className="relative z-10 flex items-center gap-2 mt-4">
                    <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onMessage?.(profile.id) }}
                        className={cn(
                            "flex-1 h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm",
                            profile.premium ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-blue-600 text-white hover:bg-blue-500"
                        )}
                    >
                        <Mail className="h-3.5 w-3.5 mr-1.5" /> Message
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); onUnfollow?.(profile.id) }}
                        className={cn(
                            "h-9 w-9 p-0 rounded-xl transition-all shrink-0",
                            profile.premium ? "border-white/10 text-white/50 hover:bg-white/10" : "border-slate-200 text-slate-400 hover:bg-slate-100"
                        )}
                        title="Ne plus suivre"
                    >
                        <UserMinus className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); onViewProfile?.(profile.slug || profile.id) }}
                        className="h-9 w-9 p-0 rounded-xl opacity-50 hover:opacity-100 shrink-0"
                        title="Voir le profil"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            {/* Bloc CRM Notes - Miniature */}
            <Card className={cn(
                "flex-1 p-4 rounded-2xl shadow-sm flex flex-col transition-all duration-300 relative overflow-hidden backdrop-blur-xl",
                profile.premium ? "bg-slate-900/50 border-white/5 text-white" : "bg-slate-50/80 border-slate-200/50 text-slate-900"
            )}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-current/5">
                            <StickyNote className="h-3.5 w-3.5 opacity-70" />
                        </div>
                        <span className="text-[10px] font-bold tracking-wider opacity-80">Notes Privées</span>
                    </div>
                    {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin opacity-50" />
                    ) : (
                        <motion.div 
                            animate={localNote !== (profile.notes || "") ? { opacity: [0.5, 1, 0.5] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                localNote !== (profile.notes || "") ? bgAccent : "bg-green-500/50"
                            )} 
                        />
                    )}
                </div>

                <div className="flex-1 relative mt-1">
                    <Textarea
                        value={localNote}
                        onChange={(e) => setLocalNote(e.target.value)}
                        placeholder="Vos observations..."
                        className="w-full h-full min-h-[60px] text-sm resize-none bg-transparent border-0 focus-visible:ring-0 p-0 shadow-none placeholder:opacity-30 font-medium leading-relaxed"
                    />
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
                    <span className="text-[9px] font-medium opacity-50 truncate max-w-[120px]">
                        {profile.lastUpdate || "Jamais"}
                    </span>
                    
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || localNote === (profile.notes || "")}
                        className={cn(
                            "h-7 px-4 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all",
                            localNote !== (profile.notes || "") 
                                ? "bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-black" 
                                : "bg-current/5 text-current/30 cursor-not-allowed"
                        )}
                    >
                        Enregistrer
                    </Button>
                </div>
            </Card>
        </motion.div>
    )
}

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

export function ProfileCard({ profile, onUnfollow, onViewProfile, onSaveNote, onMessage }: ProfileCardProps) {
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

    // Glassmorphism subtle variations based on premium status
    const cardBg = profile.premium ? "bg-slate-950/80 text-white border-white/10" : "bg-white/80 text-slate-900 border-slate-200/50"
    const accentColor = profile.premium ? "text-amber-500" : "text-blue-500"
    const bgAccent = profile.premium ? "bg-amber-500" : "bg-blue-500"

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group w-full flex flex-col lg:flex-row gap-4 items-stretch"
        >
            {/* Bloc Identité (Minimaliste) */}
            <Card 
                className={cn(
                    "relative w-full lg:w-[320px] rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-xl flex flex-col justify-between group/id",
                    cardBg
                )}
                onClick={() => onViewProfile?.(profile.id)}
            >
                {profile.premium && (
                    <div className="absolute top-0 right-0 p-4 opacity-30 pointer-events-none">
                        <div className="w-24 h-24 bg-amber-500/20 blur-3xl rounded-full" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col items-center text-center gap-4 mt-2">
                    <div className="relative group/avatar">
                        <img 
                            src={profile.avatar} 
                            alt={profile.name}
                            className="relative h-24 w-24 rounded-full object-cover shadow-xl transition-transform duration-500 group-hover/avatar:scale-105"
                        />
                        {profile.verified && (
                            <div className={cn("absolute bottom-0 right-0 rounded-full p-1 shadow-md border-2", profile.premium ? "bg-black border-amber-900" : "bg-white border-blue-100")}>
                                <CheckCircle2 className={cn("h-4 w-4", accentColor)} />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 mt-2">
                        <h3 className="text-xl font-bold tracking-tight leading-none group-hover/id:opacity-80 transition-opacity">
                            {profile.name}
                        </h3>
                        <div className="flex flex-col items-center gap-1.5 mt-2">
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", accentColor)}>
                                {profile.role}
                            </span>
                            <div className="flex items-center gap-1 opacity-50">
                                <MapPin className="h-3 w-3" />
                                <span className="text-[10px] font-medium">{profile.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Rapides */}
                <div className="relative z-10 flex items-center gap-2 mt-8">
                    <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onMessage?.(profile.id) }}
                        className={cn(
                            "flex-1 h-10 rounded-xl font-bold text-xs transition-all shadow-md px-2",
                            profile.premium ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-blue-600 text-white hover:bg-blue-500"
                        )}
                    >
                        <Mail className="h-4 w-4 mr-1 shrink-0" /> <span className="truncate">Message</span>
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); onUnfollow?.(profile.id) }}
                        className={cn(
                            "h-10 w-10 shrink-0 rounded-xl transition-all",
                            profile.premium ? "border-white/10 text-white/50 hover:bg-white/10" : "border-slate-200 text-slate-400 hover:bg-slate-100"
                        )}
                    >
                        <UserMinus className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            {/* Bloc CRM Notes (Style Apple Notes) */}
            <Card className={cn(
                "flex-1 min-h-[250px] lg:min-h-0 p-6 rounded-3xl shadow-lg flex flex-col transition-all duration-300 relative overflow-hidden backdrop-blur-xl",
                profile.premium ? "bg-slate-900/50 border-white/5 text-white" : "bg-slate-50/80 border-slate-200/50 text-slate-900"
            )}>
                <div className="flex items-center justify-between mb-4 border-b pb-4 border-current/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-current/5">
                            <StickyNote className="h-4 w-4 opacity-70" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold tracking-wider opacity-80">Notes Privées</span>
                            <span className="text-[10px] opacity-50">CRM Personnel</span>
                        </div>
                    </div>
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium opacity-50 uppercase">Sauvegarde...</span>
                            <Loader2 className="h-3.5 w-3.5 animate-spin opacity-50" />
                        </div>
                    ) : (
                        <motion.div 
                            animate={localNote !== (profile.notes || "") ? { opacity: [0.5, 1, 0.5] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={cn(
                                "h-2 w-2 rounded-full",
                                localNote !== (profile.notes || "") ? bgAccent : "bg-green-500/50"
                            )} 
                        />
                    )}
                </div>

                <div className="flex-1 relative mt-2">
                    <Textarea
                        value={localNote}
                        onChange={(e) => setLocalNote(e.target.value)}
                        placeholder="Ajouter des notes stratégiques..."
                        className="w-full h-full min-h-[120px] text-sm resize-none bg-transparent border-0 focus-visible:ring-0 p-0 shadow-none placeholder:opacity-30 font-medium leading-relaxed"
                    />
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-current/10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Mise à Jour</span>
                        <span className="text-[10px] font-medium opacity-60">
                            {profile.lastUpdate || "Jamais"}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProfile?.(profile.id)}
                            className="h-9 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider opacity-60 hover:opacity-100"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" /> Profil
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || localNote === (profile.notes || "")}
                            className={cn(
                                "h-9 px-6 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all",
                                localNote !== (profile.notes || "") 
                                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md dark:bg-white dark:text-black" 
                                    : "bg-current/5 text-current/30 cursor-not-allowed"
                            )}
                        >
                            Enregistrer
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

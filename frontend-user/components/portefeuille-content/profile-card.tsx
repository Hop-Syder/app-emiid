/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de profil pour le portefeuille avec CRM Notes
 * @created 2026-03-23
 * @updated 2026-03-23
*/

"use client"

import { StickyNote, Loader2, CheckCircle2, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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
    "bg-[#fef3c7] border-[#fde68a] text-[#92400e]",
    "bg-[#e0f2fe] border-[#bae6fd] text-[#075985]",
    "bg-[#dcfce7] border-[#bbf7d0] text-[#166534]",
    "bg-[#fce7f3] border-[#fbcfe8] text-[#9d174d]",
    "bg-[#f3e8ff] border-[#e9d5ff] text-[#6b21a8]",
    "bg-[#ffedd5] border-[#fed7aa] text-[#9a3412]",
];

export function ProfileCard({ profile, onUnfollow, onViewProfile, onSaveNote, onMessage }: ProfileCardProps) {
    const [localNote, setLocalNote] = useState(profile.notes || "")
    const [isSaving, setIsSaving] = useState(false)

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
        <div className="group relative w-full flex flex-col md:flex-row gap-4 items-stretch transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            {/* Bloc Identité Bento */}
            <div 
                onClick={() => onViewProfile?.(profile.id)}
                className={cn(
                    "relative w-full md:w-[280px] lg:w-[320px] rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-300 shadow-sm border border-slate-100 flex flex-col justify-between",
                    profile.premium ? "bg-black text-white" : "bg-white text-slate-900"
                )}
            >
                {/* Background Decor */}
                <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-12 -mt-12",
                    profile.premium ? "bg-amber-500" : "bg-orange-500"
                )} />

                <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left gap-4">
                    <div className="relative">
                        <div className={cn(
                            "absolute inset-0 rounded-full blur-md opacity-20 scale-110",
                            profile.premium ? "bg-amber-500" : "bg-orange-500"
                        )} />
                        <img 
                            src={profile.avatar} 
                            alt={profile.name}
                            className="relative h-20 w-20 rounded-full object-cover border-2 border-white/10 shadow-lg"
                        />
                        {profile.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white shadow-sm">
                                <CheckCircle2 className="h-3 w-3 text-white fill-white" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xl font-black tracking-tight leading-tight">{profile.name}</h3>
                        <div className="flex flex-col">
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-widest",
                                profile.premium ? "text-amber-500" : "text-orange-500"
                            )}>
                                {profile.role}
                            </span>
                            <span className="text-[10px] font-medium opacity-60 italic mt-0.5">
                                {profile.location}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Rapides */}
                <div className="relative z-10 flex items-center gap-2 mt-6">
                    <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onMessage?.(profile.id) }}
                        className={cn(
                            "flex-1 h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider",
                            profile.premium ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-orange-500 text-white hover:bg-orange-400"
                        )}
                    >
                        Message
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); onUnfollow?.(profile.id) }}
                        className={cn(
                            "h-10 w-10 rounded-xl border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors",
                            profile.premium ? "border-white/10 text-white/40 hover:bg-white/5" : ""
                        )}
                    >
                        <UserMinus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Bloc CRM Notes Bento */}
            <Card className={cn(
                "flex-1 min-h-[220px] md:min-h-0 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col transition-all duration-300 relative group/note",
                noteTheme
            )}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <StickyNote className="h-4 w-4 opacity-40" />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-40">Note CRM Stratégique</span>
                    </div>
                    {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin opacity-40" />
                    ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse opacity-0 group-hover/note:opacity-100 transition-opacity" />
                    )}
                </div>

                <div className="flex-1">
                    <Textarea
                        value={localNote}
                        onChange={(e) => setLocalNote(e.target.value)}
                        placeholder="Ajoutez vos observations stratégiques ici..."
                        className="w-full h-full min-h-[120px] text-sm md:text-base resize-none bg-transparent border-0 focus-visible:ring-0 p-0 shadow-none placeholder:opacity-30 placeholder:text-inherit font-medium leading-relaxed"
                    />
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                    <span className="text-[10px] font-bold opacity-40 italic">
                        {profile.lastUpdate || "Aucune mise à jour"}
                    </span>
                    
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || localNote === (profile.notes || "")}
                        className={cn(
                            "h-9 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                            localNote !== (profile.notes || "") 
                                ? "bg-black text-white hover:scale-105 active:scale-95 shadow-lg" 
                                : "bg-black/5 text-black/20 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? "Sauvegarde..." : "Enregistrer"}
                    </Button>
                </div>
            </Card>
        </div>
    )
}

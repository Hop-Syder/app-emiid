/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Carte de profil pour le portefeuille avec CRM Notes
 * @created 2026-03-23
 * @updated 2026-03-23
*/

"use client"

import { StickyNote, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NexusProfileCard, NexusCardVariant } from "@/components/carte-profil/nexus-profile-card"
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

    const handleAction = (type: 'message' | 'follow' | 'view') => {
        if (type === 'message') onMessage?.(profile.id)
        if (type === 'view') onViewProfile?.(profile.id)
        if (type === 'follow') onUnfollow?.(profile.id)
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            {/* Profil Nexus Card */}
            <div className="shrink-0 w-full sm:w-auto flex justify-center lg:justify-start">
                <NexusProfileCard 
                    user={{
                        ...profile,
                        followers: profile.followers
                    }}
                    variant={(profile.card_variant as NexusCardVariant) || (profile.premium ? 'elite' : 'tech')}
                    isFollowed={true}
                    onAction={handleAction}
                    className="shadow-2xl"
                />
            </div>

            {/* Note CRM Strategique */}
            <Card className={cn(
                "flex-1 w-full h-full lg:min-h-[380px] p-8 rounded-3xl border-2 shadow-sm overflow-hidden flex flex-col transition-all duration-300",
                noteTheme
            )}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/50 rounded-xl">
                            <StickyNote className="h-5 w-5 opacity-70" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Note Stratégique CRM</span>
                    </div>
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin opacity-40" />}
                </div>

                <div className="flex-1">
                    <Textarea
                        value={localNote}
                        onChange={(e) => setLocalNote(e.target.value)}
                        placeholder="Points clés du profil, prochaines étapes, contacts utiles..."
                        className="w-full min-h-[150px] lg:h-full lg:min-h-[200px] text-base md:text-lg resize-none bg-transparent border-0 focus-visible:ring-0 p-0 shadow-none placeholder:opacity-40 placeholder:text-inherit font-medium leading-relaxed"
                    />
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-black/40 uppercase tracking-wider">Activité</span>
                        <span className="text-[10px] font-black text-black/60">{profile.lastUpdate || "Mise à jour en attente"}</span>
                    </div>
                    
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || localNote === (profile.notes || "")}
                        className={cn(
                            "h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl",
                            localNote !== (profile.notes || "") 
                                ? "bg-black text-white hover:bg-[#FF4F01] hover:scale-105 active:scale-95 hover:shadow-[#FF4F01]/20 ring-4 ring-transparent hover:ring-[#FF4F01]/10" 
                                : "bg-black/5 text-black/40 scale-95 opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? "Synchronisation..." : "Sauvegarder"}
                    </Button>
                </div>
            </Card>
        </div>
    )
}

"use client"

import { MapPin, Users, Eye, MessageSquare as MessageIcon, StickyNote, Save, Loader2, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

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
}

interface ProfileCardProps {
    profile: ProfileData
    onUnfollow?: (id: string) => void
    onViewProfile?: (id: string) => void
    onSaveNote?: (id: string, note: string) => void
    onMessage?: (id: string) => void
}

// Couleurs douces style "Post-It" pour différencier visuellement les notes
const NOTE_COLORS = [
    "bg-[#fef3c7] border-[#fde68a] text-[#92400e]", // Amber/Yellow
    "bg-[#e0f2fe] border-[#bae6fd] text-[#075985]", // Sky/Blue
    "bg-[#dcfce7] border-[#bbf7d0] text-[#166534]", // Green
    "bg-[#fce7f3] border-[#fbcfe8] text-[#9d174d]", // Pink
    "bg-[#f3e8ff] border-[#e9d5ff] text-[#6b21a8]", // Purple
    "bg-[#ffedd5] border-[#fed7aa] text-[#9a3412]", // Orange
];

export function ProfileCard({ profile, onUnfollow, onViewProfile, onSaveNote, onMessage }: ProfileCardProps) {
    const [localNote, setLocalNote] = useState(profile.notes || "")
    const [isSaving, setIsSaving] = useState(false)

    // Calculer une couleur consistante basée sur l'ID du profil
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
        <Card className={`overflow-hidden transition-all duration-300 group ${profile.premium ? 'border-amber-200 shadow-md hover:shadow-lg' : 'border-muted/50 hover:border-border hover:shadow-sm'}`}>
            <div className="flex flex-col md:flex-row">

                {/* Partie Gauche : Infos Profil */}
                <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative bg-card">
                    {/* Indicateur Premium */}
                    {profile.premium && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-yellow-600" />
                    )}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <Avatar className={`h-16 w-16 shadow-sm ${profile.premium ? 'ring-2 ring-amber-400/50' : 'border border-border'}`}>
                            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                            <AvatarFallback>{profile.name[0]}</AvatarFallback>
                        </Avatar>
                        {profile.premium && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full p-0.5 shadow-sm">
                                <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center text-[8px]">⭐</div>
                            </div>
                        )}
                    </div>

                    {/* Détails */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold text-lg truncate ${profile.premium ? 'bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent' : ''}`}>
                                {profile.name}
                            </h3>
                            {profile.verified && <Shield className="h-3.5 w-3.5 text-blue-500" />}
                        </div>
                        <p className="text-sm font-medium text-foreground/80 truncate mb-1">{profile.role}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-md border border-muted">
                                <MapPin className="h-3 w-3" /> {profile.location}
                            </span>
                            <span className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-md border border-muted">
                                <Users className="h-3 w-3" /> {profile.followers} abonnés
                            </span>
                        </div>
                    </div>

                    {/* Actions Desktop */}
                    <div className="hidden sm:flex flex-col gap-2 shrink-0 ml-auto">
                        <Button
                            size="sm"
                            onClick={() => onViewProfile?.(profile.id)}
                            className={`h-8 text-xs rounded-xl shadow-sm ${profile.premium
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white'
                                : ''}`}
                        >
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> Voir profil
                        </Button>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => onMessage?.(profile.id)} className="h-8 flex-1 rounded-xl bg-background hover:bg-accent border-border">
                                <MessageIcon className="h-3.5 w-3.5 mr-1" /> Chat
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onUnfollow?.(profile.id)} className="h-8 px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors">
                                Retirer
                            </Button>
                        </div>
                    </div>

                    {/* Actions Mobile */}
                    <div className="flex sm:hidden w-full gap-2 mt-2 pt-2 border-t border-border">
                        <Button size="sm" onClick={() => onViewProfile?.(profile.id)} className="flex-1 h-8 text-xs rounded-xl">
                            Voir
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onMessage?.(profile.id)} className="flex-1 h-8 rounded-xl">
                            <MessageIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onUnfollow?.(profile.id)} className="flex-1 h-8 text-destructive hover:bg-destructive/10 rounded-xl">
                            Retirer
                        </Button>
                    </div>
                </div>

                {/* Partie Droite : Sticky Note (Mini CRM) */}
                <div className={`w-full md:w-[280px] lg:w-[320px] shrink-0 p-4 border-t md:border-t-0 md:border-l ${noteTheme} relative group/note transition-colors duration-300`}>
                    <div className="absolute top-3 right-4">
                        <StickyNote className="h-4 w-4 opacity-30" />
                    </div>

                    <div className="flex flex-col h-full min-h-[100px]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Note Privée CRM</span>
                            {isSaving && <Loader2 className="h-3 w-3 animate-spin opacity-60" />}
                        </div>

                        <Textarea
                            value={localNote}
                            onChange={(e) => setLocalNote(e.target.value)}
                            placeholder="Écrire une note (ex: à recontacter le 15, devis en attente...)"
                            className="flex-1 min-h-[60px] text-sm resize-none bg-transparent border-0 focus-visible:ring-0 p-0 shadow-none placeholder:opacity-50 placeholder:text-inherit font-medium leading-relaxed"
                            style={{
                                fontStyle: localNote ? 'normal' : 'italic'
                            }}
                        />

                        <div className="flex justify-end mt-2 pt-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleSave}
                                disabled={isSaving || localNote === (profile.notes || "")}
                                className={`h-6 text-[10px] px-2 rounded-md hover:bg-black/10 transition-opacity font-bold ${localNote !== (profile.notes || "") ? "opacity-100" : "opacity-0 md:group-hover/note:opacity-100"}`}
                            >
                                <Save className="h-3 w-3 mr-1" /> {isSaving ? "Auto-save..." : "Sauvegarder"}
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    )
}

"use client"

import { Clock, Bell, MapPin, TrendingUp, Eye, MessageSquare as MessageIcon, StickyNote, Save, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export function ProfileCard({ profile, onUnfollow, onViewProfile, onSaveNote, onMessage }: ProfileCardProps) {
    const [showNotes, setShowNotes] = useState(false)
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

    return (
        <Card
            className={`rounded-3xl hover:shadow-xl transition-all duration-300 group ${profile.premium
                ? 'relative overflow-hidden border-2 border-transparent'
                : 'hover:shadow-lg border-muted/50 relative overflow-hidden'
                }`}
        >
            {/* Premium background */}
            {profile.premium && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10" />
                    <div
                        className="absolute inset-0 opacity-60"
                        style={{
                            backgroundImage: 'url("/carte%20de%20profil/background-premium-1.svg")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            mixBlendMode: 'multiply',
                        }}
                    />
                </>
            )}

            <CardHeader className="relative">
                <div className="flex items-start justify-between">
                    <div className="relative">
                        <Avatar className={`h-16 w-16 transition-transform group-hover:scale-105 ${profile.premium ? 'ring-2 ring-primary/30 shadow-md' : 'border border-muted'}`}>
                            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                            <AvatarFallback>{profile.name[0]}</AvatarFallback>
                        </Avatar>
                        {profile.premium && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary to-accent rounded-full p-1 shadow-sm">
                                <div className="h-5 w-5 rounded-full bg-white text-primary p-0 flex items-center justify-center text-[10px] font-bold">
                                    ⭐
                                </div>
                            </div>
                        )}
                    </div>
                    {profile.newUpdates > 0 ? (
                        <Badge className="rounded-full bg-green-100 text-green-700 transition-colors">
                            <Bell className="mr-1 h-3 w-3" />
                            {profile.newUpdates} {profile.newUpdates > 1 ? "mises à jour" : "mise à jour"}
                        </Badge>
                    ) : (
                        profile.verified && (
                            <Badge
                                variant="outline"
                                className={`rounded-full transition-colors ${profile.premium
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-muted/50'
                                    }`}
                            >
                                Vérifié
                            </Badge>
                        )
                    )}
                </div>
                <div className="mt-4">
                    <CardTitle className={`text-xl font-bold transition-colors ${profile.premium ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' : 'group-hover:text-primary'}`}>
                        {profile.name}
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium">{profile.role}</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 relative">
                <div className="flex items-center text-sm text-muted-foreground bg-muted/20 p-2 rounded-xl border border-muted/10">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="truncate">{profile.location}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {profile.lastActive}
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {profile.followers} abonnés
                    </div>
                </div>

                <p className="text-sm italic bg-muted p-3 rounded-2xl border border-muted/50 text-muted-foreground/80">
                    {profile.lastUpdate}
                </p>

                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs text-muted-foreground hover:text-primary gap-2"
                        onClick={() => setShowNotes(!showNotes)}
                    >
                        <StickyNote className="h-3 w-3" />
                        {showNotes ? "Masquer mes notes" : (profile.notes ? "Voir mes notes" : "Ajouter une note privée")}
                    </Button>

                    {showNotes && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <Textarea
                                placeholder="Note personnelle sur cet entrepreneur..."
                                className="text-xs min-h-[60px] rounded-xl bg-muted/30 focus-visible:ring-primary/20"
                                value={localNote}
                                onChange={(e) => setLocalNote(e.target.value)}
                            />
                            <Button
                                size="sm"
                                className="w-full text-[10px] h-7 rounded-lg"
                                onClick={handleSave}
                                disabled={isSaving || localNote === profile.notes}
                            >
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                                Enregistrer la note
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        onClick={() => onViewProfile?.(profile.id)}
                        className={`flex-1 rounded-xl transition-all active:scale-95 shadow-sm ${profile.premium
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-bold hover:shadow-md'
                            : 'bg-white hover:bg-primary hover:text-primary-foreground text-foreground border border-muted-foreground/20'
                            }`}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMessage?.(profile.id)}
                        className="rounded-xl px-2 bg-white hover:bg-muted border-muted-foreground/20"
                    >
                        <MessageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUnfollow?.(profile.id)}
                        className="rounded-xl px-2 bg-transparent border-muted-foreground/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    >
                        Ne plus suivre
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

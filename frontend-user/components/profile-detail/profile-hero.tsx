/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Sous-composant Hero pour le détail de profil.
 * @created 2026-06-13
 * @updated 2026-06-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { Camera, Loader2, MapPin, MessageCircle, Share2, Shield, Star, Users } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getOptimizedImageUrl } from "@/lib/image-optimization"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// TYPES DES PROPS DU HERO
// ---------------------------------------------------------------------------
interface ProfileHeroData {
    id: string
    name: string
    avatar: string | null
    coverImage?: string | null
    specialty: string | null
    location: string | null
    verified: boolean
    premium: boolean
    following: number
    skills: unknown[]
}

interface ProfileHeroProps {
    profile: ProfileHeroData
    isOwnProfile?: boolean
    uploadingCover: boolean
    handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
    initials: string
    followersCount: number
    followLoading: boolean
    isFollowed: boolean
    handleFollow: () => Promise<void>
    isLoggedIn: boolean
    handleShare: () => Promise<void>
}

// ---------------------------------------------------------------------------
// COMPOSANT PRINCIPAL (PROFILE HERO) : 
// Affiche la bannière (Cover), l'avatar, les infos principales (Nom, Rôle)
// et les actions rapides (Suivre, Partager, etc.)
// ---------------------------------------------------------------------------
export function ProfileHero({
    profile,
    isOwnProfile,
    uploadingCover,
    handleCoverUpload,
    initials,
    followersCount,
    followLoading,
    isFollowed,
    handleFollow,
    isLoggedIn,
    handleShare
}: ProfileHeroProps) {
    return (
        <section className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] overflow-hidden relative">
            {/* Ambient background glow */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

            <div
                className={cn(
                    "relative h-32 sm:h-48 md:h-56 overflow-hidden",
                    isOwnProfile && !uploadingCover ? "cursor-pointer group/cover" : "",
                )}
                onClick={() => {
                    if (isOwnProfile && !uploadingCover) document.getElementById("cover-upload-input")?.click()
                }}
            >
                <img
                    src={
                        profile.coverImage
                            ? getOptimizedImageUrl(profile.coverImage, { width: 1400, height: 420, quality: 90 })
                            : "/placeholder.jpg"
                    }
                    alt="Couverture"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/cover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent mix-blend-multiply" />

                {isOwnProfile && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
                        <div className="bg-white/90 text-slate-900 font-medium text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-md border border-white/20 transition-transform hover:scale-105">
                            {uploadingCover ? (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                            ) : (
                                <Camera className="h-4 w-4 text-slate-700" />
                            )}
                            {uploadingCover ? "Mise à jour..." : "Modifier la couverture"}
                        </div>
                    </div>
                )}

                <input
                    id="cover-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="hidden"
                />
            </div>

            {/* Profile Meta Section */}
            <div className="px-5 sm:px-8 md:px-10 pb-7 sm:pb-8 relative z-10">
                {/* Avatar qui chevauche la couverture */}
                <div className="-mt-12 sm:-mt-16 mb-4">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-[4px] border-white/90 shadow-2xl shadow-slate-900/10 bg-white relative z-10 transition-transform duration-500 hover:scale-105 ring-1 ring-slate-900/5">
                        <AvatarImage
                            src={getOptimizedImageUrl(profile.avatar || "/profil/avatar.jpg", { width: 240, height: 240 })}
                            alt={profile.name}
                            className="object-cover rounded-full"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#022753] to-slate-800 text-white text-3xl font-bold rounded-full flex items-center justify-center">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Ligne : Infos (nom, rôle) + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 lg:gap-8">
                    <div className="space-y-3 min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 leading-tight break-words">
                                {profile.name}
                            </h1>
                            <div className="flex gap-2 shrink-0">
                                {profile.verified && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200/50 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                        <Shield className="h-3.5 w-3.5 text-blue-500" />
                                        Vérifié
                                    </span>
                                )}
                                {profile.premium && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200/50 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                        Premium
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 font-medium tracking-wide">
                            <span className="inline-flex items-center gap-2 min-w-0">
                                <Users className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="truncate">{profile.specialty}</span>
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-300 hidden sm:inline" />
                            <span className="inline-flex items-center gap-2 min-w-0">
                                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="truncate">{profile.location}</span>
                            </span>
                        </div>
                    </div>

                    {/* Actions : pleine largeur sur mobile, alignées à droite sur desktop */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
                        <Button
                            size="default"
                            disabled={followLoading}
                            className="rounded-full h-11 text-xs px-5 gap-2 font-semibold tracking-wide bg-[#022753] hover:bg-[#022753]/90 shadow-lg shadow-[#022753]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-white flex-1 sm:flex-none min-w-[120px]"
                            onClick={handleFollow}
                        >
                            {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                            {isFollowed ? "Abonné" : "Suivre"}
                        </Button>
                        {isLoggedIn && (
                            <Button
                                variant="outline"
                                size="default"
                                className="rounded-full h-11 text-xs px-5 gap-2 font-semibold tracking-wide border-slate-200/60 bg-white/50 backdrop-blur-md hover:bg-white shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 text-slate-700 flex-1 sm:flex-none min-w-[120px]"
                                asChild
                            >
                                <Link href={`/messages?contact=${profile.id}`}>
                                    <MessageCircle className="h-4 w-4" />
                                    Message
                                </Link>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="default"
                            aria-label="Partager le profil"
                            className="rounded-full h-11 w-11 p-0 flex items-center justify-center shrink-0 border-slate-200/60 bg-white/50 backdrop-blur-md hover:bg-white shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 text-slate-700"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Statistiques (ligne dédiée avec séparateur) */}
                <div className="flex items-center gap-6 sm:gap-10 mt-6 pt-6 border-t border-slate-200/50">
                    <div className="flex flex-col items-start group cursor-default">
                        <div className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-none group-hover:text-[#022753] transition-colors">{followersCount}</div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mt-1.5">Abonnés</div>
                    </div>
                    <div className="w-px h-8 bg-slate-200/60 rotate-12" />
                    <div className="flex flex-col items-start group cursor-default">
                        <div className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-none group-hover:text-[#022753] transition-colors">{profile.following}</div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mt-1.5">Suivis</div>
                    </div>
                    <div className="w-px h-8 bg-slate-200/60 rotate-12" />
                    <div className="flex flex-col items-start group cursor-default">
                        <div className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-none group-hover:text-[#022753] transition-colors">{profile.skills.length}</div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mt-1.5">Skills</div>
                    </div>
                </div>
            </div>
        </section>
    )
}

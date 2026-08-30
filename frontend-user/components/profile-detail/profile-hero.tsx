/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Sous-composant Hero pour le détail de profil.
 * @created 2026-06-13
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { Camera, Check, Loader2, MapPin, MessageCircle, Share2, Star, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getOptimizedImageUrl } from "@/lib/image-optimization"
import { cn } from "@/lib/utils"
import Image from "next/image"

// ---------------------------------------------------------------------------
// TYPES DES PROPS DU HERO
// ---------------------------------------------------------------------------
interface ProfileHeroData {
    id: string
    name: string
    business_name?: string
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
        <section className="bg-card border border-border shadow-[0_4px_24px_rgb(15,23,42,0.05)] rounded-3xl overflow-hidden relative">
            {/* Bannière encartée à coins arrondis (dégradé navy/acier par défaut) */}
            <div className="p-2.5 sm:p-3">
                <div
                    className={cn(
                        "relative h-32 sm:h-44 md:h-52 rounded-2xl overflow-hidden",
                        isOwnProfile && !uploadingCover ? "cursor-pointer group/cover" : "",
                    )}
                    onClick={() => {
                        if (isOwnProfile && !uploadingCover) document.getElementById("cover-upload-input")?.click()
                    }}
                >
                    {profile.coverImage ? (
                        <Image
                            src={getOptimizedImageUrl(profile.coverImage, { width: 1400, height: 420, quality: 90 })}
                            alt="Couverture"
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 1400px"
                            className="object-cover transition-transform duration-1000 group-hover/cover:scale-105"
                        />
                    ) : (
                        // Dégradé par défaut : acier clair → bleu nuit de la charte (#000616)
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#8a97ad_0%,#3c4a63_45%,#000616_100%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/5 to-transparent" />

                    {isOwnProfile && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
                            <div className="bg-card/90 text-foreground font-medium text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-md border border-white/20 transition-transform hover:scale-105">
                                {uploadingCover ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                                ) : (
                                    <Camera className="h-4 w-4 text-foreground" />
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
            </div>

            {/* Profile Meta Section */}
            <div className="px-5 sm:px-8 md:px-9 pb-7 sm:pb-8 relative z-10">
                {/* Avatar qui chevauche la couverture */}
                <div className="-mt-14 sm:-mt-16 mb-4">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-[4px] border-white shadow-xl shadow-slate-900/10 bg-card relative z-10 transition-transform duration-500 hover:scale-105">
                        <AvatarImage
                            src={getOptimizedImageUrl(profile.avatar || "/profil/avatar.jpg", { width: 240, height: 240 })}
                            alt={profile.name}
                            className="object-cover rounded-full"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#013ff4] to-slate-800 text-white text-3xl font-bold rounded-full flex items-center justify-center">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Ligne : Infos (nom, rôle) + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-8">
                    <div className="space-y-2.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-foreground leading-tight break-words">
                                {profile.name}
                            </h1>
                            <div className="flex items-center gap-2 shrink-0">
                                {profile.verified && (
                                    <Image
                                        src="/badge/badge-blue-verifation.png"
                                        alt="Profil vérifié"
                                        width={24}
                                        height={24}
                                        className="h-6 w-6 shrink-0"
                                        title="Profil vérifié"
                                    />
                                )}
                                {profile.premium && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-[0_1px_4px_rgb(15,23,42,0.04)]">
                                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                        Premium
                                    </span>
                                )}
                            </div>
                        </div>
                        {profile.business_name && (
                            <div className="text-base font-semibold text-foreground">
                                {profile.business_name}
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium tracking-wide">
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
                    <div className="flex items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
                        <Button
                            size="default"
                            disabled={followLoading}
                            className={cn(
                                "rounded-xl h-11 text-xs px-5 gap-2 font-semibold tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0 flex-1 lg:flex-none min-w-[112px]",
                                isFollowed
                                    ? "bg-muted dark:bg-slate-800 text-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-700 border border-border/60 dark:border-slate-700/50"
                                    : "bg-[#013ff4] hover:bg-[#013ff4]/90 shadow-lg shadow-[#013ff4]/25 text-white border-none"
                            )}
                            onClick={handleFollow}
                        >
                            {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowed ? <Check className="h-4 w-4 text-emerald-500" /> : <UserPlus className="h-4 w-4" />}
                            {isFollowed ? "Abonné" : "Suivre"}
                        </Button>
                        {isLoggedIn && (
                            <Button
                                variant="outline"
                                size="default"
                                className="rounded-xl h-11 text-xs px-5 gap-2 font-semibold tracking-wide border-border bg-card hover:bg-muted shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 text-foreground flex-1 lg:flex-none min-w-[112px]"
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
                            className="rounded-xl h-11 w-11 p-0 flex items-center justify-center shrink-0 border-border bg-card hover:bg-muted shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 text-foreground"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Statistiques (ligne dédiée avec séparateurs droits) */}
                <div className="flex items-center gap-5 sm:gap-8 mt-6 pt-6 border-t border-border">
                    <div className="flex flex-col items-start group cursor-default">
                        <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-none group-hover:text-[#013ff4] transition-colors">{followersCount}</div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mt-1.5">Abonnés</div>
                    </div>
                    <div className="w-px h-9 bg-muted" />
                    <div className="flex flex-col items-start group cursor-default">
                        <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-none group-hover:text-[#013ff4] transition-colors">{profile.following}</div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mt-1.5">Suivis</div>
                    </div>
                    <div className="w-px h-9 bg-muted" />
                    <div className="flex flex-col items-start group cursor-default">
                        <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-none group-hover:text-[#013ff4] transition-colors">{profile.skills.length}</div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mt-1.5">Skills</div>
                    </div>
                </div>
            </div>
        </section>
    )
}

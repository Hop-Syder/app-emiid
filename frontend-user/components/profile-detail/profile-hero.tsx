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
}: any) {
    return (
        <section className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/40 rounded-[32px] overflow-hidden">
            <div
                className={cn(
                    "relative h-44 sm:h-56 md:h-64 overflow-hidden",
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
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                {isOwnProfile && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 bg-black/30">
                        <div className="bg-white/95 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
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

            {/* Profile Meta Section (Overlapping Avatar) */}
            <div className="relative px-6 sm:px-8 pb-6 pt-16">
                {/* Avatar wrapper */}
                <div className="absolute -top-12 sm:-top-16 left-6 sm:left-8 flex items-end gap-4">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white shadow-xl relative z-10 transition-transform duration-500 hover:scale-105 bg-white">
                        <AvatarImage
                            src={getOptimizedImageUrl(profile.avatar || "/profil/avatar.jpg", { width: 240, height: 240 })}
                            alt={profile.name}
                            className="object-cover rounded-full"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#022753] to-[#022753]/80 text-white text-3xl font-black rounded-full flex items-center justify-center">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-none">
                                {profile.name}
                            </h1>
                            {profile.verified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/50 px-2.5 py-1 text-[11px] font-bold text-blue-600 shadow-sm shadow-blue-100/50">
                                    <Shield className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10 animate-pulse" />
                                    Vérifié
                                </span>
                            )}
                            {profile.premium && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/50 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-sm shadow-amber-100/50 animate-pulse">
                                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                    Premium
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-slate-600 font-semibold">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                                <Users className="h-3.5 w-3.5 text-[#CE1126]" />
                                <span>{profile.specialty}</span>
                            </span>
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 hidden sm:inline" />
                            <span className="inline-flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                                <MapPin className="h-3.5 w-3.5 text-[#022753]" />
                                <span>{profile.location}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t border-slate-100 md:border-transparent pt-4 md:pt-0">
                        {/* Stats Block */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 sm:flex-initial rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 py-2 text-center min-w-[75px] shadow-sm hover:scale-105 transition-transform duration-300">
                                <div className="text-lg font-black text-[#022753] leading-none">{followersCount}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Abonnés</div>
                            </div>
                            <div className="flex-1 sm:flex-initial rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 py-2 text-center min-w-[75px] shadow-sm hover:scale-105 transition-transform duration-300">
                                <div className="text-lg font-black text-[#022753] leading-none">{profile.following}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Suivis</div>
                            </div>
                            <div className="flex-1 sm:flex-initial rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 py-2 text-center min-w-[75px] shadow-sm hover:scale-105 transition-transform duration-300">
                                <div className="text-lg font-black text-[#022753] leading-none">{profile.skills.length}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Skills</div>
                            </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex gap-2.5 shrink-0">
                            <Button
                                size="lg"
                                disabled={followLoading}
                                className="flex-1 sm:flex-initial rounded-2xl h-11 text-xs gap-2 font-black bg-[#022753] hover:bg-[#022753]/95 shadow-md shadow-[#022753]/10 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-white disabled:opacity-70"
                                onClick={handleFollow}
                            >
                                {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                                {isFollowed ? "Abonné" : "Suivre"}
                            </Button>
                            {isLoggedIn && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 sm:flex-initial rounded-2xl h-11 text-xs gap-2 font-black border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                                    asChild
                                >
                                    <Link href={`/messages?contact=${profile.id}`}>
                                        <MessageCircle className="h-4 w-4 text-slate-700" />
                                        Message
                                    </Link>
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="lg"
                                className="hidden sm:flex md:flex-initial rounded-2xl h-11 text-xs gap-2 font-black border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                                onClick={handleShare}
                            >
                                <Share2 className="h-4 w-4 text-slate-700" />
                                Partager
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

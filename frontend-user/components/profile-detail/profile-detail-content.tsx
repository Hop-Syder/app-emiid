/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    MoreHorizontal,
    Share2,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { ProfileHero } from "./profile-hero"
import { ProfileMainContent } from "./profile-main-content"
import { ProfileSidebar } from "./profile-sidebar"
import { useProfileData } from "@/hooks/use-profile-data"
import { useProfileActions } from "@/hooks/use-profile-actions"

const ShareModal = dynamic(() => import("./share-modal").then((m) => m.ShareModal), { ssr: false })
const ProfileModerationDialogs = dynamic(
    () => import("./profile-moderation-dialogs").then((m) => m.ProfileModerationDialogs),
    { ssr: false }
)

interface ProfileDetailContentProps {
    profileId: string
}

export function ProfileDetailContent({ profileId }: ProfileDetailContentProps) {
    const router = useRouter()
    const [scrolled, setScrolled] = useState(false)

    const {
        profile, setProfile,
        loading,
        isFollowed, setIsFollowed,
        followersCount, setFollowersCount,
        joinedDate,
        isOwnProfile,
        isLoggedIn,
        gallery,
        loadingGallery,
        currentUserId,
        loadError,
    } = useProfileData(profileId)

    // Lien de partage : domaine public officiel si défini (SEO/branding),
    // sinon l'origine courante (app.emiid.com).
    const profileUrl =
        typeof window !== "undefined"
            ? `${process.env.NEXT_PUBLIC_PUBLIC_URL || window.location.origin}/profil/${profile?.slug || profile?.id}`
            : ""

    const {
        copiedLink,
        uploadingCover,
        followLoading,
        isShareModalOpen, setIsShareModalOpen,
        isReportOpen, setIsReportOpen,
        reportReason, setReportReason,
        reportSubmitting,
        isBlockOpen, setIsBlockOpen,
        blocking,
        copyToClipboard,
        downloadVCard,
        handleShare,
        handleFollow,
        openReport,
        handleReportSubmit,
        handleBlock,
        handleCoverUpload,
    } = useProfileActions(profile, profileUrl, { currentUserId, setProfile })

    // Synchro temps réel des suivis : la page profil est la source de vérité de son
    // propre bouton (le hook émet, on écoute ici) + reflète les changements émis ailleurs.
    const isFollowedRef = useRef(isFollowed)
    useEffect(() => { isFollowedRef.current = isFollowed }, [isFollowed])
    useEffect(() => {
        const targetId = profile?.id
        if (!targetId) return
        const handler = (e: Event) => {
            const { userId, followed } = (e as CustomEvent).detail || {}
            if (userId !== targetId || isFollowedRef.current === followed) return
            isFollowedRef.current = followed
            setIsFollowed(followed)
            setFollowersCount((c) => (followed ? c + 1 : Math.max(0, c - 1)))
        }
        window.addEventListener("emiid-follow-toggle", handler)
        return () => window.removeEventListener("emiid-follow-toggle", handler)
    }, [profile?.id, setIsFollowed, setFollowersCount])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    const initials = useMemo(() => {
        if (!profile?.name) return ""
        return profile.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join("")
    }, [profile?.name])

    if (loading) return <ProfileSkeleton />

    if (!profile && loadError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] gap-6 p-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-card border border-border rounded-3xl flex items-center justify-center mb-2 shadow-sm">
                    <Users className="h-9 w-9 text-slate-300" />
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight">Impossible de charger ce profil</h2>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Une erreur réseau est survenue. Vérifiez votre connexion et réessayez.
                    </p>
                </div>
                <Button
                    onClick={() => window.location.reload()}
                    size="lg"
                    className="rounded-2xl gap-2 font-bold bg-[#013ff4] hover:bg-[#013ff4]/95 shadow-lg shadow-[#013ff4]/20 transition-all active:scale-95"
                >
                    Réessayer
                </Button>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] gap-6 p-6 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-card border border-border rounded-3xl flex items-center justify-center mb-2 shadow-sm">
                    <Users className="h-9 w-9 text-slate-300" />
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight">Profil introuvable</h2>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Ce compte n&apos;existe pas ou a été désactivé par nos modérateurs.
                    </p>
                </div>
                <Button
                    onClick={() => router.push("/annuaire")}
                    size="lg"
                    className="rounded-2xl gap-2 font-bold bg-[#013ff4] hover:bg-[#013ff4]/95 shadow-lg shadow-[#013ff4]/20 transition-all active:scale-95"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l&apos;annuaire
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#013ff4]/5 via-[#f8fafc] to-[#03b3f8]/5 dark:bg-none dark:bg-background text-foreground antialiased selection:bg-[#013ff4]/10 selection:text-[#013ff4]">
            <div
                className={cn(
                    "sticky top-0 z-50 transition-all duration-300",
                    scrolled
                        ? "bg-card border-b border-border shadow-sm"
                        : "bg-transparent border-b border-transparent",
                )}
            >
                <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 rounded-xl hover:bg-muted active:scale-95 transition-all"
                    >
                        <ArrowLeft className="h-4 w-4 text-foreground" />
                        <span className="font-bold text-foreground">Retour</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="rounded-xl gap-2 border-border bg-card hover:bg-muted active:scale-95 transition-all shadow-sm"
                        >
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                            Partager
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Plus d'options"
                                    className="rounded-xl hover:bg-muted active:scale-95 transition-all"
                                >
                                    <MoreHorizontal className="h-5 w-5 text-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl shadow-xl border-border bg-card w-52 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                <DropdownMenuItem
                                    className="rounded-xl font-bold py-2.5 cursor-pointer hover:bg-muted text-xs text-foreground"
                                    onClick={() => setIsShareModalOpen(true)}
                                >
                                    Outils de partage
                                </DropdownMenuItem>
                                {!isOwnProfile && (
                                    <>
                                        <DropdownMenuItem
                                            className="rounded-xl font-bold py-2.5 cursor-pointer hover:bg-muted text-xs text-foreground"
                                            onClick={openReport}
                                        >
                                            Signaler
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="rounded-xl font-bold py-2.5 text-red-600 cursor-pointer hover:bg-red-50 text-xs"
                                            onClick={() => setIsBlockOpen(true)}
                                        >
                                            Bloquer
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <main className="container max-w-6xl mx-auto px-4 pb-24 pt-4">
                <ProfileHero
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                    uploadingCover={uploadingCover}
                    handleCoverUpload={handleCoverUpload}
                    initials={initials}
                    followersCount={followersCount}
                    followLoading={followLoading}
                    isFollowed={isFollowed}
                    handleFollow={handleFollow}
                    isLoggedIn={isLoggedIn}
                    handleShare={handleShare}
                />

                <section className="mt-6 grid lg:grid-cols-12 gap-6 items-start">
                    <ProfileMainContent
                        profile={profile}
                        gallery={gallery}
                        loadingGallery={loadingGallery}
                    />

                    <ProfileSidebar
                        profile={profile}
                        joinedDate={joinedDate}
                        profileUrl={profileUrl}
                        copiedLink={copiedLink}
                        copyToClipboard={copyToClipboard}
                        setIsShareModalOpen={setIsShareModalOpen}
                        downloadVCard={downloadVCard}
                        isLoggedIn={isLoggedIn}
                    />
                </section>
            </main>

            {profile && isShareModalOpen && (
                <ShareModal
                    isOpen={isShareModalOpen}
                    onOpenChange={setIsShareModalOpen}
                    profile={profile}
                    profileUrl={profileUrl}
                />
            )}

            {(isReportOpen || isBlockOpen) && (
                <ProfileModerationDialogs
                    profileName={profile?.name}
                    isReportOpen={isReportOpen}
                    onReportOpenChange={setIsReportOpen}
                    reportReason={reportReason}
                    onReportReasonChange={setReportReason}
                    reportSubmitting={reportSubmitting}
                    onReportSubmit={handleReportSubmit}
                    isBlockOpen={isBlockOpen}
                    onBlockOpenChange={setIsBlockOpen}
                    blocking={blocking}
                    onBlock={handleBlock}
                />
            )}
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-tr from-[#013ff4]/5 via-[#f8fafc] to-[#03b3f8]/5 dark:bg-none dark:bg-background animate-pulse">
            <div className="h-16 container max-w-6xl mx-auto px-4 flex items-center justify-between py-6">
                <div className="h-10 w-24 bg-muted rounded-2xl" />
                <div className="h-10 w-28 bg-muted rounded-2xl" />
            </div>

            <div className="container max-w-6xl mx-auto px-4">
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="h-48 sm:h-56 bg-muted" />
                    <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
                        <div className="h-24 w-24 bg-muted rounded-full ring-4 ring-white" />
                        <div className="flex-1 space-y-3 w-full">
                            <div className="h-7 w-1/3 bg-muted rounded-xl" />
                            <div className="h-5 w-1/2 bg-muted rounded-lg" />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="h-11 w-28 bg-muted rounded-2xl" />
                            <div className="h-11 w-28 bg-muted rounded-2xl" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-40 bg-card border border-border rounded-3xl" />
                        <div className="h-64 bg-card border border-border rounded-3xl" />
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className="h-44 bg-card border border-border rounded-3xl" />
                        <div className="h-44 bg-card border border-border rounded-3xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}

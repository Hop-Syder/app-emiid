"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import type { ProfileData } from "./use-profile-data"
import { compressImage } from "@/lib/compress-image"

interface UseProfileActionsOptions {
    currentUserId: string | null
    setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>
}

export function useProfileActions(
    profile: ProfileData | null,
    profileUrl: string,
    { currentUserId, setProfile }: UseProfileActionsOptions
) {
    const router = useRouter()
    const [copiedLink, setCopiedLink] = useState<string | null>(null)
    const [uploadingCover, setUploadingCover] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [reportReason, setReportReason] = useState("")
    const [reportSubmitting, setReportSubmitting] = useState(false)
    const [isBlockOpen, setIsBlockOpen] = useState(false)
    const [blocking, setBlocking] = useState(false)

    const copyToClipboard = useCallback(async (value: string) => {
        try {
            await navigator.clipboard.writeText(value)
            setCopiedLink(value)
            toast.success("Lien copié !", { description: "Prêt à être partagé." })
            setTimeout(() => setCopiedLink(null), 2000)
        } catch {
            toast.error("Impossible de copier le lien")
        }
    }, [])

    const getVCard = useCallback(() => {
        const safe = (value?: string) =>
            (value || "")
                .replace(/\r?\n/g, " ")
                .replace(/,/g, "\\,")
                .trim()

        return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${safe(profile?.name)}`,
            profile?.role ? `TITLE:${safe(profile.role)}` : null,
            profile?.phone ? `TEL;TYPE=CELL:${safe(profile.phone)}` : null,
            profile?.email ? `EMAIL;TYPE=INTERNET:${safe(profile.email)}` : null,
            profile?.website ? `URL:${safe(profile.website)}` : null,
            `URL:${profileUrl}`,
            "END:VCARD",
        ]
            .filter(Boolean)
            .join("\n")
    }, [profile, profileUrl])

    const downloadVCard = useCallback(() => {
        try {
            const vcard = getVCard()
            const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${(profile?.name || "contact").replace(/[^\p{L}\p{N}\s_-]/gu, "").trim() || "contact"}.vcf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
            toast.success("vCard téléchargée", { description: "Ajoutez ce contact à votre carnet." })
        } catch {
            toast.error("Impossible de télécharger la vCard")
        }
    }, [profile, getVCard])

    const handleShare = useCallback(async () => {
        if (!profileUrl) return
        const nav = typeof navigator !== "undefined"
            ? (navigator as Navigator & { share?: (data: ShareData) => Promise<void> })
            : null
        if (nav?.share) {
            try {
                await nav.share({
                    title: `${profile?.name || "Profil"} — EmiID`,
                    text: profile?.bio ? profile.bio.slice(0, 120) : `Découvrez le profil de ${profile?.name || "ce membre"} sur EmiID.`,
                    url: profileUrl,
                })
                return
            } catch {
                // Annulation utilisateur → fallback modal
            }
        }
        setIsShareModalOpen(true)
    }, [profile, profileUrl])

    const handleFollow = useCallback(async () => {
        if (!profile || followLoading) return
        setFollowLoading(true)
        try {
            const res = await fetchWithAuth(`/api/users/follow/${profile.id}`, { method: "POST" })
            if (res.ok) {
                const data = await res.json()
                // Source de vérité unique : on émet l'événement global ; le listener de
                // profile-detail-content met à jour isFollowed + followersCount (évite le double-comptage).
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("emiid-follow-toggle", {
                        detail: { userId: profile.id, followed: data.followed },
                    }))
                }
                toast.success(data.followed ? "Vous suivez ce membre" : "Abonnement retiré")
            } else {
                toast.error("Veuillez vous connecter pour suivre ce membre")
            }
        } catch {
            toast.error("Erreur de connexion")
        } finally {
            setFollowLoading(false)
        }
    }, [profile, followLoading])

    const openReport = useCallback(() => {
        if (!currentUserId) {
            toast.error("Veuillez vous connecter pour signaler ce profil")
            return
        }
        setReportReason("")
        setIsReportOpen(true)
    }, [currentUserId])

    const handleReportSubmit = useCallback(async () => {
        if (!profile || !currentUserId) return
        const reason = reportReason.trim()
        if (reason.length < 3) {
            toast.error("Merci de préciser la raison (3 caractères minimum)")
            return
        }
        setReportSubmitting(true)
        try {
            const supabase = createClient()
            type GenericTableClient = {
                from: (relation: string) => {
                    insert: (data: Record<string, unknown>) => Promise<{ error: { code?: string; message?: string } | null }>
                }
            }
            const { error } = await (supabase as unknown as GenericTableClient).from("content_reports").insert({
                subject_type: "profile",
                subject_id: profile.id,
                reporter_id: currentUserId,
                reason,
            })
            if (error) {
                if (error.code === "23505") {
                    toast.info("Vous avez déjà signalé ce profil. Il est en cours d'examen.")
                    setIsReportOpen(false)
                    return
                }
                throw error
            }
            toast.success("Signalement envoyé", { description: "Notre équipe va l'examiner." })
            setIsReportOpen(false)
        } catch (e) {
            console.error("Erreur signalement:", e)
            toast.error("Impossible d'envoyer le signalement")
        } finally {
            setReportSubmitting(false)
        }
    }, [profile, currentUserId, reportReason])

    const handleBlock = useCallback(async () => {
        if (!profile) return
        if (!currentUserId) {
            toast.error("Veuillez vous connecter pour bloquer ce profil")
            return
        }
        setBlocking(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from("user_blocks").insert({
                blocker_id: currentUserId,
                blocked_id: profile.id,
            })
            if (error && error.code !== "23505") throw error
            toast.success("Profil bloqué", { description: "Vous ne verrez plus ce membre." })
            setIsBlockOpen(false)
            router.push("/annuaire")
        } catch (e) {
            console.error("Erreur blocage:", e)
            toast.error("Impossible de bloquer ce profil")
        } finally {
            setBlocking(false)
        }
    }, [profile, currentUserId, router])

    const handleCoverUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return
            // Couverture : large mais légère, réduite dans le téléphone avant l'envoi.
            const file = await compressImage(event.target.files[0], { maxSize: 1920 })

            if (!file.type.startsWith("image/")) {
                toast.error("Veuillez sélectionner une image valide.")
                return
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error("L'image est trop lourde (Max 2MB) !")
                return
            }

            setUploadingCover(true)
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                toast.error("Vous devez être connecté pour effectuer cette action.")
                return
            }

            const user = session.user
            const fileExt = file.name.split(".").pop()
            const filePath = `${user.id}/cover_${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
                upsert: true,
                contentType: file.type,
            })
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-restricted-syntax -- update authentifié de SA propre couverture (RLS OK)
            const { error: updateError } = await supabase.from("user_profiles").update({ cover_url: publicUrl } as any).eq("user_id", user.id)
            if (updateError) throw updateError

            setProfile((prev) => (prev ? { ...prev, coverImage: publicUrl } : null))
            toast.success("Image de couverture mise à jour !")
        } catch (error: unknown) {
            console.error("Erreur upload couverture:", error)
            const message = (error as { message?: string })?.message || (typeof error === "string" ? error : "Inconnue")
            toast.error("Erreur lors de l'upload de la couverture : " + message)
        } finally {
            setUploadingCover(false)
        }
    }, [setProfile])

    return {
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
    }
}

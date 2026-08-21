/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Modale de partage de profil avec QR Code, vCard interactive, et boutons de partage Bento responsive.
 * @created 2026-06-11
 * @updated 2026-07-10
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useMemo } from "react"
import { Check, Copy, Download, Share2, QrCode, ExternalLink, Mail, FolderOpen, User } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import Image from "next/image"
import { trackProfileMetric } from "@/lib/track-profile"
import { trackProfileContact } from "@/lib/analytics"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Icônes SVG personnalisées pour le partage
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.46.002 9.9-4.434 9.903-9.893.002-2.643-1.029-5.127-2.906-7.004C16.492 1.83 14.015.799 11.374.798c-5.462 0-9.905 4.439-9.909 9.897-.001 1.62.423 3.202 1.232 4.616l-.993 3.62 3.713-.974zm13.114-6.27c-.125-.207-.46-.33-.966-.583s-2.99-1.476-3.455-1.645-.792-.25-.125.717c.666.966.875 1.191.966 1.314.092.125.125.25-.125.502s-1.062 1.212-1.314 1.455c-.253.25-.502.29-.966.04-.467-.251-1.97-.726-3.754-2.316-1.39-1.24-2.327-2.77-2.6-3.252-.272-.482-.03-.743.22-.993.228-.226.502-.583.75-.875.253-.29.333-.5.5-.833.166-.33.083-.625-.041-.875s-.966-2.328-1.323-3.18c-.347-.837-.7-.723-.966-.737-.25-.013-.538-.015-.826-.015s-.758.107-1.155.539c-.397.433-1.517 1.483-1.517 3.61s1.55 4.18 1.767 4.473c.216.29 3.05 4.66 7.39 6.54 1.033.447 1.84.713 2.47.915 1.038.33 1.986.283 2.733.17.833-.125 2.502-1.022 2.852-2.008.35-.987.35-1.83.246-2.008z" />
    </svg>
)

const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764.784-1.764 1.75-1.764.784-1.764 1.75-1.764-.783-1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
)

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
)

const EmailIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
)

interface ShareModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    profile: {
        id: string
        name: string
        role: string
        avatar_url?: string | null
        email?: string
        phone?: string
        website?: string
        slug?: string
        bio?: string
    }
    profileUrl: string
}

export function ShareModal({ isOpen, onOpenChange, profile, profileUrl }: ShareModalProps) {
    const [copiedLink, setCopiedLink] = useState<string | null>(null)
    const [copiedVCard, setCopiedVCard] = useState(false)
    const [qrLoading, setQrLoading] = useState(false)

    const initials = useMemo(() => {
        const value = profile.name || "EmiID"
        return (
            value
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("") || "EM"
        )
    }, [profile.name])

    const qrCodeUrl = useMemo(() => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(profileUrl)}&margin=10`
    }, [profileUrl])

    const copyToClipboard = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value)
            setCopiedLink(value)
            toast.success("Lien copié !", { description: "Prêt à être partagé." })
            setTimeout(() => setCopiedLink(null), 2000)
        } catch {
            toast.error("Impossible de copier le lien")
        }
    }

    const getVCard = () => {
        const safe = (value?: string) =>
            (value || "")
                .replace(/\r?\n/g, " ")
                .replace(/,/g, "\\,")
                .trim()

        const fullName = safe(profile.name)
        const role = safe(profile.role)
        const phone = safe(profile.phone)
        const email = safe(profile.email)
        const website = safe(profile.website)

        return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${fullName}`,
            role ? `TITLE:${role}` : null,
            phone ? `TEL;TYPE=CELL:${phone}` : null,
            email ? `EMAIL;TYPE=INTERNET:${email}` : null,
            website ? `URL:${website}` : null,
            `URL:${profileUrl}`,
            "END:VCARD",
        ]
            .filter(Boolean)
            .join("\n")
    }

    const copyVCardToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getVCard())
            setCopiedVCard(true)
            toast.success("vCard copiée !", { description: "Prêt à être importée." })
            setTimeout(() => setCopiedVCard(false), 2000)
        } catch {
            toast.error("Impossible de copier la vCard")
        }
    }

    const downloadVCard = () => {
        try {
            const vcard = getVCard()
            const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download =
                `${profile.name.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim() || "contact"}.vcf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
            toast.success("vCard téléchargée", { description: "Ajoutez ce contact à votre carnet." })
        } catch {
            toast.error("Impossible de télécharger la vCard")
        }
    }

    const downloadQRCode = async () => {
        setQrLoading(true)
        try {
            const response = await fetch(qrCodeUrl)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `qrcode-${profile.name.replace(/\s+/g, '-').toLowerCase()}.png`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
            toast.success("QR Code téléchargé", { description: "Prêt à être scanné." })
        } catch {
            toast.error("Impossible de télécharger le QR Code")
        } finally {
            setQrLoading(false)
        }
    }

    const shareToWhatsApp = (url: string) => {
        const text = `Découvrez le profil de ${profile.name} sur EmiID :`
        trackProfileMetric(profile.id, "share")
        trackProfileContact(profile.id, "share")
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank")
    }

    const shareToLinkedIn = (url: string) => {
        trackProfileMetric(profile.id, "share")
        trackProfileContact(profile.id, "share")
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
    }

    const shareToTwitter = (url: string) => {
        const text = `Découvrez le profil de ${profile.name} sur EmiID :`
        trackProfileMetric(profile.id, "share")
        trackProfileContact(profile.id, "share")
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            "_blank",
        )
    }

    const handleShare = async () => {
        const url = profileUrl
        if (!url) return

        const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }) : null
        if (nav?.share) {
            try {
                await nav.share({
                    title: `${profile.name} — EmiID`,
                    text: profile.bio
                        ? profile.bio.slice(0, 120)
                        : `Découvrez le profil de ${profile.name} sur EmiID.`,
                    url,
                })
                return
            } catch {
                // Annulation utilisateur ou refus
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[92vw] sm:max-w-xl md:max-w-2xl rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-white/5 text-left">
                    <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">Partager le profil</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
                        Faites découvrir le profil de <span className="font-extrabold text-[#013ff4] dark:text-blue-400">{profile.name}</span> à votre réseau.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-0">
                    {/* Colonne Gauche : QR Code */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 text-center min-w-0">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 justify-center">
                            <QrCode className="h-3.5 w-3.5" /> Scan en direct
                        </span>
                        
                        <div className="relative w-44 h-44 sm:w-48 sm:h-48 bg-white p-3 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-lg flex items-center justify-center overflow-hidden group">
                            <Image
                                src={qrCodeUrl}
                                alt={`QR Code de ${profile.name}`}
                                width={180}
                                height={180}
                                className="object-contain"
                                priority
                            />
                        </div>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-3 max-w-[200px]">
                            Présentez cet écran pour qu&apos;on scanne votre profil directement.
                        </p>

                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-4 h-9 rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-[11px] px-4 gap-1.5 shadow-sm hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all"
                            onClick={downloadQRCode}
                            disabled={qrLoading}
                        >
                            <Download className="h-3.5 w-3.5" />
                            {qrLoading ? "Téléchargement..." : "Enregistrer l'image"}
                        </Button>
                    </div>

                    {/* Colonne Droite : Partage Social & Liens */}
                    <div className="flex-[1.2] p-6 space-y-6 min-w-0">
                        {/* Custom link */}
                        <div className="space-y-2.5">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Lien personnalisé</span>
                            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/10 rounded-2xl focus-within:border-[#013ff4]/30 dark:focus-within:border-blue-500/30 focus-within:ring-2 focus-within:ring-[#013ff4]/5 dark:focus-within:ring-blue-500/5 transition-all">
                                <span className="pl-3 text-[11px] text-slate-400 dark:text-slate-500 font-bold select-none truncate max-w-[120px] sm:max-w-none">emiid.com/profil/</span>
                                <Input
                                    readOnly
                                    value={profile.slug || profile.id || ""}
                                    className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 px-1 font-bold text-slate-700 dark:text-slate-200 text-xs lowercase select-all flex-1 min-w-0"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-xl shrink-0 hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
                                    onClick={() => copyToClipboard(profileUrl)}
                                >
                                    {copiedLink === profileUrl ? <Check className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Partage rapide (Grille Responsive) */}
                        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Partager vers</span>
                            <div className="grid grid-cols-4 gap-2 sm:gap-3 py-1">
                                <button
                                    className="flex flex-col items-center gap-1.5 group outline-none cursor-pointer"
                                    onClick={() => shareToWhatsApp(profileUrl)}
                                >
                                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-500/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-white group-active:scale-95">
                                        <WhatsAppIcon className="h-5 w-5 transition-transform group-hover:rotate-6" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate w-full text-center">WhatsApp</span>
                                </button>

                                <button
                                    className="flex flex-col items-center gap-1.5 group outline-none cursor-pointer"
                                    onClick={() => shareToLinkedIn(profileUrl)}
                                >
                                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-500/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[#0a66c2] group-hover:text-white group-active:scale-95">
                                        <LinkedInIcon className="h-5 w-5 transition-transform group-hover:-rotate-6" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate w-full text-center">LinkedIn</span>
                                </button>

                                <button
                                    className="flex flex-col items-center gap-1.5 group outline-none cursor-pointer"
                                    onClick={() => shareToTwitter(profileUrl)}
                                >
                                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-black dark:group-hover:bg-white dark:group-hover:text-black group-hover:text-white group-active:scale-95">
                                        <XIcon className="h-4.5 w-4.5 transition-transform" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate w-full text-center">X</span>
                                </button>

                                <button
                                    className="flex flex-col items-center gap-1.5 group outline-none cursor-pointer"
                                    onClick={() => {
                                        const subject = encodeURIComponent(`Profil EmiID de ${profile.name}`);
                                        const body = encodeURIComponent(`Découvrez le profil professionnel de ${profile.name} sur EmiID :\n\n${profileUrl}`);
                                        window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
                                    }}
                                >
                                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#eaf0ff]/50 dark:bg-[#0150fd]/10 text-[#013ff4] dark:text-[#4d72ff] border border-[#d5e0ff]/60 dark:border-[#0150fd]/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[#013ff4] group-hover:text-white group-active:scale-95">
                                        <EmailIcon className="h-4.5 w-4.5 transition-transform group-hover:-translate-y-0.5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate w-full text-center">Email</span>
                                </button>
                            </div>
                        </div>

                        {/* Partager via système de partage natif de l'appareil si supporté */}
                        {typeof navigator !== "undefined" && "share" in navigator && (
                            <Button
                                variant="outline"
                                className="w-full h-11 rounded-2xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-white/5 flex gap-2 text-xs font-black transition-all active:scale-95 shadow-sm mt-2"
                                onClick={handleShare}
                            >
                                <Share2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                Options système de l&apos;appareil
                            </Button>
                        )}
                    </div>
                </div>

                {/* Section du bas : vCard interactive (imite le design de la carte EmiID) */}
                <div className="p-6 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-white/5 space-y-4">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Carte de contact (vCard)</span>
                    
                    <div className="relative p-5 bg-gradient-to-br from-[#013ff4] to-[#013ff4]/80 text-white rounded-3xl overflow-hidden shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-400/10 rounded-full blur-xl" />
                        
                        <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                                {profile.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.name}
                                        width={48}
                                        height={48}
                                        className="rounded-2xl object-cover h-full w-full"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-extrabold line-clamp-1">{profile.name}</h4>
                                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider line-clamp-1 mt-0.5">{profile.role}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto shrink-0 relative z-10">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="flex-1 sm:flex-initial h-10 rounded-xl bg-white/15 hover:bg-white/25 border-none text-white font-bold text-[11px] px-4 gap-1.5 active:scale-95 transition-all"
                                onClick={copyVCardToClipboard}
                            >
                                {copiedVCard ? <Check className="h-3.5 w-3.5 text-green-300 animate-in zoom-in duration-200" /> : <Copy className="h-3.5 w-3.5 text-blue-100" />}
                                Copier
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="flex-1 sm:flex-initial h-10 rounded-xl bg-white text-[#013ff4] font-bold text-[11px] px-4 gap-1.5 hover:bg-white/90 active:scale-95 transition-all shadow-md"
                                onClick={downloadVCard}
                            >
                                <Download className="h-3.5 w-3.5 text-[#013ff4]" />
                                Télécharger
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

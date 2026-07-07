/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Modale de partage de profil (WhatsApp, LinkedIn, X, Email, vCard, QR/Lien).
 * @created 2026-06-11
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useMemo } from "react"
import { Check, Copy, Download, Share2 } from "lucide-react"
import { toast } from "sonner"

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
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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
            toast.success("vCard copiée !", { description: "Coller dans un email ou une note." })
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

    const shareToWhatsApp = (url: string) => {
        const text = `Découvrez le profil de ${profile.name} sur EmiID :`
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank")
    }

    const shareToLinkedIn = (url: string) => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
    }

    const shareToTwitter = (url: string) => {
        const text = `Découvrez le profil de ${profile.name} sur EmiID :`
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
                // Annulation utilisateur ou refus navigateur → fallback modal.
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-[32px] border border-slate-100 bg-white/95 backdrop-blur-xl shadow-2xl p-6 overflow-hidden animate-in fade-in duration-300">
                <DialogHeader className="pb-4 border-b border-slate-100">
                    <DialogTitle className="text-xl font-black tracking-tight text-slate-900">Partager le profil</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 font-bold mt-1">
                        Faites découvrir le profil de <span className="font-extrabold text-slate-700">{profile.name}</span> à votre réseau professionnel.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Profile custom link */}
                    <div className="space-y-2.5">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Lien personnalisé</span>
                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200/60 rounded-2xl transition-all focus-within:border-[#013ff4]/30 focus-within:ring-2 focus-within:ring-[#013ff4]/5">
                            <span className="pl-3 text-xs text-slate-400 font-bold select-none">app.emiid.com/profil/</span>
                            <Input
                                readOnly
                                value={profile.slug || profile.id || ""}
                                className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 px-1 font-bold text-slate-700 text-xs lowercase select-all flex-1 min-w-0"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-xl shrink-0 hover:bg-slate-200/50 hover:text-slate-500 transition-all active:scale-95"
                                onClick={() => copyToClipboard(profileUrl)}
                            >
                                {copiedLink === profileUrl ? <Check className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" /> : <Copy className="h-4 w-4 text-slate-500" />}
                            </Button>
                        </div>

                        {typeof navigator !== "undefined" && "share" in navigator && (
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-2xl border-slate-200 text-slate-900 bg-white hover:bg-slate-50 flex gap-2 text-xs font-black transition-all active:scale-95 shadow-sm"
                                onClick={handleShare}
                            >
                                <Share2 className="h-4 w-4 text-slate-600" />
                                Partager via le système
                            </Button>
                        )}
                    </div>

                    {/* Quick share button icons */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Partage rapide</span>
                        <div className="flex justify-around items-center py-2">
                            <button
                                className="flex flex-col items-center gap-2 group outline-none"
                                onClick={() => shareToWhatsApp(profileUrl)}
                            >
                                <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/60 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200 group-active:scale-95">
                                    <WhatsAppIcon className="h-6 w-6 transition-transform group-hover:rotate-6" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-950 transition-colors">WhatsApp</span>
                            </button>

                            <button
                                className="flex flex-col items-center gap-2 group outline-none"
                                onClick={() => shareToLinkedIn(profileUrl)}
                            >
                                <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0a66c2] group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200 group-active:scale-95">
                                    <LinkedInIcon className="h-6 w-6 transition-transform group-hover:-rotate-6" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-950 transition-colors">LinkedIn</span>
                            </button>

                            <button
                                className="flex flex-col items-center gap-2 group outline-none"
                                onClick={() => shareToTwitter(profileUrl)}
                            >
                                <div className="h-14 w-14 rounded-full bg-slate-50 text-slate-900 border border-slate-200/60 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-black group-hover:text-white group-hover:shadow-lg group-hover:shadow-slate-300 group-active:scale-95">
                                    <XIcon className="h-5 w-5 transition-transform group-hover:scale-105" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-950 transition-colors">X</span>
                            </button>

                            <button
                                className="flex flex-col items-center gap-2 group outline-none"
                                onClick={() => {
                                    const subject = encodeURIComponent(`Profil EmiID de ${profile.name}`);
                                    const body = encodeURIComponent(`Découvrez le profil professionnel de ${profile.name} sur EmiID :\n\n${profileUrl}`);
                                    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
                                }}
                            >
                                <div className="h-14 w-14 rounded-full bg-indigo-50/50 text-indigo-600 border border-indigo-100/60 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200 group-active:scale-95">
                                    <EmailIcon className="h-5 w-5 transition-transform group-hover:translate-y-[-2px]" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-950 transition-colors">E-mail</span>
                            </button>
                        </div>
                    </div>

                    {/* Business card widget (vCard) */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Carte de contact (vCard)</span>
                        <div className="p-4 bg-slate-50/80 border border-slate-200/40 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-200/50 shrink-0">
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-black text-slate-800 line-clamp-1">{profile.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight line-clamp-1">{profile.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 rounded-xl border-slate-200 text-slate-700 bg-white font-bold text-[11px] px-3 gap-1 hover:bg-slate-50"
                                    onClick={copyVCardToClipboard}
                                >
                                    {copiedVCard ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                                    Copier
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-9 rounded-xl bg-slate-900 text-white font-bold text-[11px] px-3 gap-1 hover:bg-slate-800"
                                    onClick={downloadVCard}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    vCard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

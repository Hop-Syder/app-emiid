/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hero Section utilisateur de Nukun avec partage social
 * @created 2026-04-18
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/──────────────────────────────────

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Share2, Copy, Check, Linkedin, Twitter, MessageCircle } from "lucide-react"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function HeroSection() {
    const router = useRouter()
    const { session, currentUser } = useCurrentUserProfile()
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [copiedLink, setCopiedLink] = useState<string | null>(null)

    const handleOpenShare = () => {
        if (!session?.user?.id || !currentUser?.is_published) {
            toast.error("Profil non publié", { description: "Vous devez d'abord publier votre profil dans la section Édition pour le partager." })
            return
        }
        setIsShareModalOpen(true)
    }

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url)
        setCopiedLink(url)
        toast.success("Lien copié !", { description: "Prêt à être collé sur vos réseaux." })
        setTimeout(() => setCopiedLink(null), 2000)
    }

    const shareToWhatsApp = (url: string) => {
        const text = "Je viens de rejoindre l'élite sur Nukun ! Découvrez mon expertise :"
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, '_blank')
    }

    const shareToLinkedIn = (url: string) => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    }

    const shareToTwitter = (url: string) => {
        const text = "Je viens de rejoindre l'élite sur Nukun ! Découvrez mon expertise :"
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    }

    const baseHost = typeof window !== 'undefined' ? window.location.origin : 'https://nukun.app'
    const customUrl = currentUser?.slug ? `${baseHost}/profil/${currentUser.slug}` : null
    const techUrl = session?.user?.id ? `${baseHost}/profil/${session.user.id}` : ''
    
    // The main URL to share is the custom one if it exists, else tech URL
    const mainUrl = customUrl || techUrl

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-xl p-8 text-white min-h-[300px] flex flex-col justify-center"
                style={{
                    backgroundImage: 'url(/dashboard-user/background-1.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay pour améliorer la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40 rounded-xl" />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-4">
                        <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Nukun — Ton réseau, ta force</Badge>
                        <h2 className="text-4xl font-bold">Bienvenue sur Nukun</h2>
                        <p className="max-w-[600px] text-white/90 text-lg">
                            La plateforme de networking intelligente conçue pour connecter les talents, les artisans et les entreprises à travers l&apos;Afrique.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button
                                className="rounded-xl bg-white text-primary hover:bg-white/90 px-6 h-11 shadow-lg shadow-white/20"
                                onClick={() => router.push("/annuaire")}
                            >
                                Explorer l&apos;Annuaire
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-xl bg-transparent border-white text-white hover:bg-white/10 px-6 h-11"
                                onClick={() => router.push("/creer-profil")}
                            >
                                Mon Profil
                            </Button>
                            <Button
                                variant="default"
                                className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 border-none text-white hover:from-emerald-600 hover:to-green-700 px-6 h-11 font-black shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                                onClick={handleOpenShare}
                            >
                                <Share2 className="h-4 w-4" />
                                Boost (Partager)
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Booster votre profil 🚀</DialogTitle>
                        <DialogDescription>
                            Partagez votre profil professionnel pour étendre votre réseau.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {customUrl && (
                            <div className="space-y-2">
                                <span className="text-sm font-semibold text-primary flex items-center gap-2">
                                    <Badge variant="outline" className="border-primary text-primary text-[10px]">Recommandé</Badge>
                                    Lien personnalisé
                                </span>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        readOnly 
                                        value={customUrl} 
                                        className="h-12 bg-slate-50 border-slate-200 text-slate-600 font-medium font-mono text-xs focus-visible:ring-0"
                                    />
                                    <Button 
                                        size="icon" 
                                        variant="outline" 
                                        className="h-12 w-12 rounded-xl shrink-0"
                                        onClick={() => copyToClipboard(customUrl)}
                                    >
                                        {copiedLink === customUrl ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <span className="text-sm font-semibold text-slate-500">
                                Lien technique {customUrl && "(Alternatif)"}
                            </span>
                            <div className="flex items-center gap-2">
                                <Input 
                                    readOnly 
                                    value={techUrl} 
                                    className="h-12 bg-slate-50 border-slate-200 text-slate-400 font-mono text-xs focus-visible:ring-0"
                                />
                                <Button 
                                    size="icon" 
                                    variant="outline" 
                                    className="h-12 w-12 rounded-xl shrink-0 border-slate-200"
                                    onClick={() => copyToClipboard(techUrl)}
                                >
                                    {copiedLink === techUrl ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Partage rapide</span>
                            <div className="grid grid-cols-3 gap-3">
                                <Button 
                                    variant="outline" 
                                    className="h-12 rounded-xl border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 flex gap-2"
                                    onClick={() => shareToWhatsApp(mainUrl)}
                                >
                                    <img src="/svg/whatsapp-logo.svg" className="h-4 w-4" alt="WhatsApp" />
                                    WhatsApp
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-12 rounded-xl border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/10 flex gap-2"
                                    onClick={() => shareToLinkedIn(mainUrl)}
                                >
                                    <Linkedin className="h-4 w-4" />
                                    LinkedIn
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-12 rounded-xl border-slate-900 text-slate-900 hover:bg-slate-100 flex gap-2"
                                    onClick={() => shareToTwitter(mainUrl)}
                                >
                                    <Twitter className="h-4 w-4" />
                                    X (Twitter)
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}


"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Share2 } from "lucide-react"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { toast } from "sonner"

export function HeroSection() {
    const router = useRouter()
    const { session, currentUser } = useCurrentUserProfile()

    const handleShareProfile = () => {
        if (!session?.user?.id || !currentUser?.is_published) {
            toast.error("Profil non publié", { description: "Vous devez d'abord publier votre profil dans la section Édition pour le partager." })
            return
        }
        
        const profileSlugOrId = currentUser?.slug || session.user.id;
        const profileUrl = `${window.location.origin}/profil/${profileSlugOrId}`
        const text = "Je viens de rejoindre l'élite sur Nexus Connect ! Découvrez mon expertise et connectons-nous :"
        
        if (navigator.share) {
            navigator.share({
                title: "Mon profil Nexus Connect",
                text: text,
                url: profileUrl
            }).catch(() => {
                navigator.clipboard.writeText(`${text} ${profileUrl}`)
                toast.success("Lien copié !", { description: "Prêt à être collé sur WhatsApp ou LinkedIn !" })
            })
        } else {
            navigator.clipboard.writeText(`${text} ${profileUrl}`)
            toast.success("Lien copié !", { description: "Prêt à être collé sur WhatsApp ou LinkedIn !" })
        }
    }

    return (
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
                    <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Réseau Pan-Africain</Badge>
                    <h2 className="text-4xl font-bold">Bienvenue sur Nexus Connect</h2>
                    <p className="max-w-[600px] text-white/90 text-lg">
                        Cartographier et propulser 100 000 acteurs économiques ouest-africains d&apos;ici 2027. Connectez-vous avec des
                        entrepreneurs, artisans et institutions à travers l&apos;Afrique de l&apos;Ouest.
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
                            onClick={handleShareProfile}
                        >
                            <Share2 className="h-4 w-4" />
                            Boost (Partager)
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de redirection automatique vers le profil public de l'utilisateur connecté
 * @created 2026-06-03
 * @updated 2026-06-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { Preloader } from "@/components/Preloader"
import { toast } from "sonner"

export default function ProfilRedirectPage() {
    const router = useRouter()
    const { session, currentUser } = useCurrentUserProfile()

    useEffect(() => {
        // Si la session est explicitement nulle après chargement (non connecté)
        if (session === null) {
            toast.error("Vous devez être connecté pour accéder à cette page.")
            router.replace("/login")
            return
        }

        // Si l'utilisateur est chargé
        if (currentUser) {
            if (currentUser.has_profile) {
                const targetIdentifier = currentUser.slug || session?.user?.id
                router.replace(`/profil/${targetIdentifier}`)
            } else {
                toast.info("Veuillez d'abord configurer votre profil.")
                router.replace("/creer-profil")
            }
        }
    }, [session, currentUser, router])

    return (
        <Preloader 
            text="Accès à votre profil" 
            subtext="Redirection vers votre empreinte numérique professionnelle..." 
            minHeight="min-h-screen" 
        />
    )
}

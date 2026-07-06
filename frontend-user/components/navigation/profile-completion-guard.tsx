/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description R4 — Forçage de complétion : tant que le profil n'est pas publié,
 *              l'utilisateur est redirigé vers /creer-profil pour les pages privées.
 *              Les pages de complétion (/creer-profil, /parametres) restent accessibles.
 */
"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"

// Pages où l'utilisateur DOIT pouvoir aller pour compléter/publier son profil.
const ALLOWED_WHILE_INCOMPLETE = ["/creer-profil", "/parametres", "/onboarding"]

export function ProfileCompletionGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { currentUser } = useCurrentUserProfile()

    useEffect(() => {
        // Pas encore chargé (currentUser null) ou profil déjà publié → rien à forcer.
        if (!currentUser || currentUser.is_published) return

        const isAllowed = ALLOWED_WHILE_INCOMPLETE.some((p) => pathname?.startsWith(p))
        if (!isAllowed) {
            toast.info("Complétez et publiez votre profil pour accéder à EmiID.")
            router.replace("/creer-profil")
        }
    }, [currentUser, pathname, router])

    return <>{children}</>
}

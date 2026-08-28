import type { Metadata } from "next"

// Page privée (édition de profil) → exclue de l'indexation.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function CreerProfilLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

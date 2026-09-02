import type { Metadata } from "next"

// Page d'erreur publique (lien d'authentification expiré/invalide) : contenu
// sans valeur de lecture → exclue de l'index, mais l'exploration reste permise
// pour que la balise noindex soit bien lue par Googlebot.
export const metadata: Metadata = {
    title: "Lien d'authentification invalide | EmiID",
    robots: { index: false, follow: true },
}

export default function AuthCodeErrorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

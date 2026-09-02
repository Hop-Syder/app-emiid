/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Métadonnées de l'écran de recherche. La page elle-même est un
 *              composant client (« use client » — Web Speech API, état de
 *              saisie) et ne peut donc pas exporter `metadata` : ce layout s'en
 *              charge, comme pour /auth/auth-code-error.
 *
 *              noindex, pas disallow : /recherche est un outil de saisie, sans
 *              contenu de lecture — elle n'a rien à faire dans l'index. Mais
 *              elle est liée depuis la navigation publique (desktop-appbar-guest),
 *              donc la bloquer dans robots.txt aurait l'effet inverse : Googlebot
 *              n'aurait pas pu LIRE ce noindex, et aurait pu indexer l'URL seule,
 *              sans titre ni description. Elle reste donc explorable, et déclare
 *              elle-même son exclusion. `follow` est conservé : les liens qu'elle
 *              porte (vers l'annuaire) gardent leur valeur.
 * @created 2026-09-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Rechercher un profil | EmiID",
    description:
        "Recherchez un artisan, un freelance ou une entreprise sur EmiID, à la voix ou au clavier.",
    robots: { index: false, follow: true },
}

export default function RechercheLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

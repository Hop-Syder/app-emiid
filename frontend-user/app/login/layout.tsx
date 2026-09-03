/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Métadonnées de la page de connexion. La page est un composant
 *              client (« use client » — OAuth, Turnstile, localStorage) et ne
 *              peut donc pas exporter `metadata` : ce layout s'en charge, comme
 *              pour /recherche et /auth/auth-code-error.
 *
 *              noindex, pas disallow : /login est une porte d'entrée applicative,
 *              sans contenu de lecture — elle n'apporte rien à l'index et diluait
 *              le budget de crawl. Mais elle est liée depuis toute la navigation
 *              publique : la bloquer dans robots.txt empêcherait Googlebot de LIRE
 *              ce noindex, et l'URL pourrait finir indexée sans titre ni
 *              description. Elle reste donc explorable et déclare elle-même son
 *              exclusion. `follow` est conservé : les liens qu'elle porte (accueil,
 *              annuaire, mentions légales) gardent leur valeur.
 * @created 2026-09-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Connexion | EmiID",
    description:
        "Connectez-vous à EmiID pour gérer votre profil professionnel et votre réseau.",
    robots: { index: false, follow: true },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

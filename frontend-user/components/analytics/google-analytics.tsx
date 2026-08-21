/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Chargement de Google Analytics 4 et suivi des changements de page.
 *
 *              L'App Router navigue sans recharger le document : sans ce
 *              composant, GA n'enregistrerait que la toute première vue.
 *
 *              L'identifiant vient de NEXT_PUBLIC_GA_ID ; absent, rien n'est
 *              chargé (utile en développement et en préproduction).
 * @created 2026-08-26
 */

"use client"

import Script from "next/script"
import { Suspense, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { GA_MEASUREMENT_ID, pageview } from "@/lib/analytics"

/**
 * Suivi des navigations client.
 *
 * useSearchParams() impose une frontière <Suspense> : sans elle, Next bascule
 * toute l'application en rendu dynamique et le build échoue.
 */
function PageviewTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!pathname) return
        const query = searchParams?.toString()
        pageview(query ? `${pathname}?${query}` : pathname)
    }, [pathname, searchParams])

    return null
}

export function GoogleAnalytics() {
    if (!GA_MEASUREMENT_ID) return null

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    // send_page_view: false — les vues sont émises par PageviewTracker,
                    // sinon la première page serait comptée deux fois.
                    gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
                `}
            </Script>
            <Suspense fallback={null}>
                <PageviewTracker />
            </Suspense>
        </>
    )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Enregistrement du service worker au démarrage.
 *
 *              Il ne l'était jusqu'ici qu'au moment où l'utilisateur activait
 *              les notifications push (`lib/push-notifications.ts`). Or Chrome
 *              exige un service worker actif pour émettre `beforeinstallprompt` :
 *              sans cet enregistrement précoce, l'installation n'était proposée
 *              qu'aux personnes ayant déjà accepté les notifications.
 *
 *              L'enregistrement est repoussé après le chargement de la page pour
 *              ne pas disputer la bande passante au premier rendu.
 * @created 2026-08-28
 */

"use client"

import { useEffect } from "react"

export function RegisterServiceWorker() {
    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

        const register = () => {
            navigator.serviceWorker.register("/sw.js").catch((err) => {
                // Un échec d'enregistrement ne doit jamais empêcher l'application
                // de fonctionner : on perd l'installabilité, rien de plus.
                console.warn("Service worker non enregistré :", err?.message)
            })
        }

        if (document.readyState === "complete") {
            register()
            return
        }
        window.addEventListener("load", register)
        return () => window.removeEventListener("load", register)
    }, [])

    return null
}

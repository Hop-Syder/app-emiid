/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Vrai à partir du point de rupture `lg` (1024 px) de Tailwind.
 *              Sert à ne MONTER qu'une seule des deux versions d'un écran
 *              (mobile / ordinateur) : masquer en CSS laisse l'autre version
 *              vivante, avec ses requêtes et ses intervalles.
 *              Renvoie null tant que la largeur n'est pas connue (rendu serveur,
 *              premier rendu client) : afficher alors un squelette neutre.
 * @created 2026-10-09
 */

"use client"

import { useEffect, useState } from "react"

const DESKTOP_QUERY = "(min-width: 1024px)"

export function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  return isDesktop
}

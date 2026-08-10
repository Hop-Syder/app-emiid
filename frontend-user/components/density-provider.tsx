/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description DensityProvider — Gestion centralisée de la densité globale de l'interface (100% à 80%)
 * @created 2026-08-10
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type DensityLevel = "100" | "98" | "95" | "90" | "85" | "80"

interface DensityContextType {
  density: DensityLevel
  setDensity: (density: DensityLevel) => void
}

const DensityContext = createContext<DensityContextType>({
  density: "80",
  setDensity: () => {},
})

const STORAGE_KEY = "emiid_ui_density"

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<DensityLevel>("80")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as DensityLevel | null
      if (saved && ["100", "98", "95", "90", "85", "80"].includes(saved)) {
        setDensityState(saved)
        document.documentElement.setAttribute("data-density", saved)
      } else {
        setDensityState("80")
        document.documentElement.setAttribute("data-density", "80")
      }
    } catch {
      setDensityState("80")
      document.documentElement.setAttribute("data-density", "80")
    }
  }, [])

  const setDensity = (newDensity: DensityLevel) => {
    setDensityState(newDensity)
    document.documentElement.setAttribute("data-density", newDensity)
    try {
      localStorage.setItem(STORAGE_KEY, newDensity)
    } catch {
      // Ignorer si localStorage restreint
    }
  }

  return (
    <DensityContext.Provider value={{ density, setDensity }}>
      {children}
    </DensityContext.Provider>
  )
}

export function useDensity() {
  return useContext(DensityContext)
}

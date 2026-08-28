/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Contexte React pour piloter l'ouverture de la Command Palette
 *              depuis n'importe quel composant (sans synthétiser d'évènement clavier).
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

interface CommandPaletteContextValue {
  open: boolean
  setOpen: (value: boolean) => void
  toggle: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const value = useMemo<CommandPaletteContextValue>(
    () => ({ open, setOpen, toggle: () => setOpen((prev) => !prev) }),
    [open]
  )

  return <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>
}

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) {
    // Fallback no-op : évite tout crash si le hook est utilisé hors provider.
    return { open: false, setOpen: () => undefined, toggle: () => undefined }
  }
  return ctx
}

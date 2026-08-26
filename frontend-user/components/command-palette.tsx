/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Palette de commande intelligente (Command Palette) avec raccourcis de navigation
 * @created 2026-05-20
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { 
  Settings, 
  User, 
  Home, 
  Search, 
  Users, 
  MessageSquare, 
  Wallet
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useCommandPalette } from "@/components/command-palette-context"

export function CommandPalette() {
  const { open, setOpen, toggle } = useCommandPalette()
  const [searchQuery, setSearchQuery] = React.useState("")
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (pathname === "/annuaire") return // Ne pas intercepter CMD+K sur l'annuaire pour laisser la place à la palette dédiée
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [toggle, pathname])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [setOpen])

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={setOpen}
      /*
       * Le composant Command interne peint `bg-popover`, soit du blanc opaque
       * en thème clair, par-dessus ce panneau sombre : tous les textes clairs
       * se retrouvaient sur du blanc, donc invisibles. On le rend transparent
       * pour que le panneau reprenne la main.
       *
       * Le panneau lui-même passe de 70 % à 96 % d'opacité. Le flou
       * d'arrière-plan ne peut pas garantir la lisibilité : `backdrop-filter`
       * n'est pas honoré partout, et il ne faut pas qu'un texte dépende d'un
       * effet qui peut ne pas s'appliquer.
       */
      className="bg-slate-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_-20px_rgba(255,255,255,0.1)] text-slate-100 overflow-hidden sm:max-w-2xl [&_[data-slot=command]]:bg-transparent [&_[data-slot=command]]:text-slate-100"
    >
      {/* Subtle Aurora Glow inside the dialog */}
      <div className="absolute top-0 left-1/4 w-96 h-24 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-24 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />

      <CommandInput 
        placeholder="Que recherchez-vous ? Profils, pages, ou commandes (ex: 'Tech', 'Dashboard')..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
        className="border-b border-white/10 text-lg h-16 text-white placeholder:text-slate-400"
      />
      <CommandList className="max-h-[400px] no-scrollbar">
        <CommandEmpty className="py-12 text-center text-slate-400">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-white/5 border border-white/10">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-sm font-medium">Aucun résultat pour &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-slate-500">Essayez un autre mot-clé ou vérifiez l&apos;orthographe.</p>
          </div>
        </CommandEmpty>
        
        <div className="p-2 space-y-2">
          <CommandGroup heading={<span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">Navigation Rapide</span>}>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard-user"))}
              className="data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-3 my-1"
            >
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 mr-3">
                <Home className="h-4 w-4" />
              </div>
              <span className="font-medium">Dashboard Utilisateur</span>
            </CommandItem>

            <CommandItem 
              onSelect={() => runCommand(() => router.push("/annuaire"))}
              className="data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-3 my-1"
            >
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mr-3">
                <Users className="h-4 w-4" />
              </div>
              <span className="font-medium">Annuaire Global</span>
            </CommandItem>

            <CommandItem 
              onSelect={() => runCommand(() => router.push("/messages"))}
              className="data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-3 my-1"
            >
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 mr-3">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="font-medium">Messagerie Sécurisée</span>
            </CommandItem>
          </CommandGroup>
        </div>

        <CommandSeparator className="bg-white/5" />

        <div className="p-2 space-y-2">
          <CommandGroup heading={<span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">Gestion du Compte</span>}>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/profil"))}
              className="data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-3 my-1"
            >
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 mr-3">
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium">Mon Profil Public</span>
              <CommandShortcut className="text-slate-400 border border-slate-700 bg-slate-800/50 px-2 py-0.5 rounded-md">⌘P</CommandShortcut>
            </CommandItem>

            <CommandItem 
              onSelect={() => runCommand(() => router.push("/portefeuille"))}
              className="data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-3 my-1"
            >
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mr-3">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="font-medium">Mon Portefeuille EmiID</span>
              <CommandShortcut className="text-slate-400 border border-slate-700 bg-slate-800/50 px-2 py-0.5 rounded-md">⌘B</CommandShortcut>
            </CommandItem>

            <CommandItem 
              onSelect={() => runCommand(() => router.push("/parametres"))}
              className="data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-3 my-1"
            >
              <div className="p-2 rounded-lg bg-slate-500/20 text-slate-400 mr-3">
                <Settings className="h-4 w-4" />
              </div>
              <span className="font-medium">Paramètres & Sécurité</span>
              <CommandShortcut className="text-slate-400 border border-slate-700 bg-slate-800/50 px-2 py-0.5 rounded-md">⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </div>
      </CommandList>
    </CommandDialog>
  )
}

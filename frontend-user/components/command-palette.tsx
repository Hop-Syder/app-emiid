/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Palette de commande intelligente (Command Palette Cmd+K) — Style Luxury Bento, Aurora Glow, filtres et raccourcis rapides.
 * @created 2026-05-20
 * @updated 2026-08-30
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
  Wallet,
  Bell,
  BadgeCheck,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  CreditCard,
  Briefcase,
  X
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

type CategoryFilter = "all" | "nav" | "account" | "tools"

export function CommandPalette() {
  const { open, setOpen, toggle } = useCommandPalette()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<CategoryFilter>("all")
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (pathname === "/annuaire") return // Ne pas intercepter CMD+K sur l'annuaire pour laisser la place à la recherche locale
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [toggle, pathname])

  // Reset category and query when modal closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setActiveCategory("all")
    }
  }, [open])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [setOpen])

  const launchGlobalSearch = React.useCallback(() => {
    if (!searchQuery.trim()) {
      runCommand(() => router.push("/annuaire"))
    } else {
      runCommand(() => router.push(`/annuaire?q=${encodeURIComponent(searchQuery.trim())}`))
    }
  }, [searchQuery, router, runCommand])

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={setOpen}
      className="bg-[#000616]/95 dark:bg-[#000616]/95 backdrop-blur-2xl border border-white/15 dark:border-white/12 shadow-[0_25px_80px_-15px_rgba(1,63,244,0.35)] text-white overflow-hidden sm:max-w-2xl rounded-3xl p-0 [&_[data-slot=command]]:bg-transparent [&_[data-slot=command]]:text-white"
    >
      {/* ── Effets de lueur d'ambiance Aurora (Cyan / Bleu Roi / Violet) ── */}
      <div className="absolute -top-12 -left-12 w-80 h-36 bg-[#013ff4]/25 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute top-1/3 -right-12 w-80 h-36 bg-[#03b3f8]/20 rounded-full blur-[75px] pointer-events-none" />
      <div className="absolute -bottom-12 left-1/4 w-80 h-32 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />

      {/* ── En-tête de recherche avec icône vivante ───────────────────── */}
      <div className="relative border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#013ff4]/20 border border-[#013ff4]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(1,63,244,0.3)]">
          <Search className="w-5 h-5 text-[#03b3f8] animate-pulse" />
        </div>
        
        <CommandInput 
          placeholder="Rechercher une page, un profil, une action (ex: 'Portefeuille', 'Devis')..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="border-none bg-transparent text-base sm:text-lg h-12 text-white placeholder:text-slate-400 font-medium focus:ring-0 focus:outline-none flex-1"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Effacer la saisie"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Filtres / Filtres rapides sous l'input ──────────────────────── */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-white/[0.02] overflow-x-auto no-scrollbar text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Filtres :</span>
        
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 ${
            activeCategory === "all"
              ? "bg-[#013ff4] text-white shadow-[0_2px_10px_rgba(1,63,244,0.4)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
        >
          ⚡ Tout
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("nav")}
          className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 ${
            activeCategory === "nav"
              ? "bg-[#013ff4] text-white shadow-[0_2px_10px_rgba(1,63,244,0.4)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
        >
          📂 Navigation
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("account")}
          className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 ${
            activeCategory === "account"
              ? "bg-[#013ff4] text-white shadow-[0_2px_10px_rgba(1,63,244,0.4)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
        >
          👤 Mon Compte
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory("tools")}
          className={`px-3 py-1 rounded-xl font-bold transition-all shrink-0 ${
            activeCategory === "tools"
              ? "bg-[#013ff4] text-white shadow-[0_2px_10px_rgba(1,63,244,0.4)]"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
        >
          ⭐ Services & Boosts
        </button>
      </div>

      {/* ── Liste des résultats & Commandes ───────────────────────────── */}
      <CommandList className="max-h-[380px] overflow-y-auto no-scrollbar p-2.5">
        
        {/* Résultat vide ou suggestion de recherche universelle */}
        <CommandEmpty className="py-10 text-center text-slate-400">
          <div className="flex flex-col items-center justify-center space-y-3.5 max-w-sm mx-auto px-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#03b3f8] shadow-inner">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Aucun raccourci interne pour &quot;{searchQuery}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">
                Lancer une recherche globale dans l&apos;annuaire pour trouver des professionnels correspondants.
              </p>
            </div>
            <button
              type="button"
              onClick={launchGlobalSearch}
              className="mt-2 flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#013ff4] hover:bg-[#0135d0] text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Rechercher &quot;{searchQuery}&quot; dans l&apos;annuaire
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </CommandEmpty>

        {/* ── Action de recherche contextuelle directe si requête saisie ── */}
        {searchQuery.trim().length > 0 && (
          <div className="mb-2">
            <CommandItem
              onSelect={launchGlobalSearch}
              className="data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-[#013ff4]/30 data-[selected=true]:to-[#03b3f8]/20 data-[selected=true]:border-white/15 bg-white/[0.04] border border-white/10 text-white rounded-2xl p-3 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#013ff4]/20 border border-[#013ff4]/30 flex items-center justify-center text-[#03b3f8] shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    Rechercher <span className="text-[#03b3f8]">&quot;{searchQuery}&quot;</span> dans l&apos;annuaire universel
                  </p>
                  <p className="text-xs text-slate-400 truncate">Trouver tous les professionnels, artisans et entreprises</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entrée</span>
                <kbd className="px-1.5 py-0.5 rounded-lg bg-white/10 border border-white/15 text-[10px] font-mono text-slate-300">↵</kbd>
              </div>
            </CommandItem>
          </div>
        )}

        {/* ── GROUPE : Navigation Rapide ───────────────────────────────── */}
        {(activeCategory === "all" || activeCategory === "nav") && (
          <CommandGroup heading={<span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 block">Navigation Rapide</span>}>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/dashboard-user"))}
              className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#013ff4]/20 to-[#03b3f8]/20 border border-[#013ff4]/30 text-[#03b3f8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Home className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Hub & Tableau de Bord</p>
                  <p className="text-xs text-slate-400 truncate">Vue d&apos;ensemble, profil, complétude et actions clés</p>
                </div>
              </div>
              <CommandShortcut className="text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-mono">⌘H</CommandShortcut>
            </CommandItem>

            <CommandItem 
              onSelect={() => runCommand(() => router.push("/annuaire"))}
              className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Annuaire Global des Talents</p>
                  <p className="text-xs text-slate-400 truncate">Explorer 10 catégories de métiers et prestataires vérifiés</p>
                </div>
              </div>
              <CommandShortcut className="text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-mono">⌘A</CommandShortcut>
            </CommandItem>

            <CommandItem 
              onSelect={() => runCommand(() => router.push("/messages"))}
              className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Messagerie & Devis</p>
                  <p className="text-xs text-slate-400 truncate">Échanges directs, opportunités et discussions en direct</p>
                </div>
              </div>
              <CommandShortcut className="text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-mono">⌘M</CommandShortcut>
            </CommandItem>

            <CommandItem 
              onSelect={() => runCommand(() => router.push("/notifications"))}
              className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Notifications & Alertes</p>
                  <p className="text-xs text-slate-400 truncate">Vues de profil, nouveaux abonnés et mises à jour</p>
                </div>
              </div>
              <CommandShortcut className="text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-mono">⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandSeparator className="bg-white/10 my-1" />

        {/* ── GROUPE : Mon Compte & Profil ─────────────────────────────── */}
        {(activeCategory === "all" || activeCategory === "account") && (
          <CommandGroup heading={<span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 block">Mon Compte & Profil</span>}>
            <CommandItem 
              onSelect={() => runCommand(() => router.push("/profil"))}
              className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#03b3f8]/20 to-sky-500/20 border border-[#03b3f8]/30 text-[#03b3f8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Mon Profil Public</p>
                  <p className="text-xs text-slate-400 truncate">Prévisualiser ma fiche telle qu&apos;elle apparaît aux visiteurs</p>
                </div>
              </div>
              <CommandShortcut className="text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-mono">⌘P</CommandShortcut>
            </CommandItem>

            <CommandItem 
              onSelect={() => runCommand(() => router.push("/portefeuille"))}
              className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Wallet className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Portefeuille EmiID</p>
                  <p className="text-xs text-slate-400 truncate">Solde FCFA, historique des paiements et retraits Mobile Money</p>
                </div>
              </div>
              <CommandShortcut className="text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-mono">⌘B</CommandShortcut>
            </CommandItem>

            <CommandItem 
              onSelect={() => runCommand(() => router.push("/parametres"))}
              className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-400/20 border border-slate-400/30 text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Settings className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Paramètres & Sécurité</p>
                  <p className="text-xs text-slate-400 truncate">Réglages, mot de passe, code PIN et préférences globales</p>
                </div>
              </div>
              <CommandShortcut className="text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-mono">⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}

        {/* ── GROUPE : Services & Mise en Avant ───────────────────────── */}
        {(activeCategory === "all" || activeCategory === "tools") && (
          <>
            <CommandSeparator className="bg-white/10 my-1" />
            <CommandGroup heading={<span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 block">Services & Mise en Avant</span>}>
              <CommandItem 
                onSelect={() => runCommand(() => router.push("/parametres?tab=verification"))}
                className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BadgeCheck className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">Certification & Badge Vérifié</p>
                    <p className="text-xs text-slate-400 truncate">Transmettre CNI, IFU ou justificatif officiel</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">Badge</span>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand(() => router.push("/parametres?tab=plan"))}
                className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Crown className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">Abonnement EmiID Pro & Boosts</p>
                    <p className="text-xs text-slate-400 truncate">Propulser votre profil en tête des recherches locales</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">Pro</span>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand(() => router.push("/creer-profil"))}
                className="data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white text-slate-300 rounded-2xl transition-all cursor-pointer p-2.5 my-1 border border-transparent data-[selected=true]:border-white/10 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#013ff4]/20 to-indigo-500/20 border border-[#013ff4]/30 text-[#03b3f8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">Édition Rapide du Profil</p>
                    <p className="text-xs text-slate-400 truncate">Modifier photos, slogan, portfolio et prestations</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </CommandItem>
            </CommandGroup>
          </>
        )}

      </CommandList>

      {/* ── Pied de page / Raccourcis de navigation & Micro-légende ───── */}
      <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] font-mono text-slate-300">↑↓</kbd>
            Naviguer
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] font-mono text-slate-300">↵</kbd>
            Ouvrir
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] font-mono text-slate-300">ESC</kbd>
            Fermer
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400/80">
          <div className="w-1.5 h-1.5 rounded-full bg-[#03b3f8]" />
          <span>EmiID Command Engine</span>
        </div>
      </div>
    </CommandDialog>
  )
}


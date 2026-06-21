/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Palette de commande pour l'Annuaire — Recherche de profil et Filtres avancés.
 * @created 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import * as React from "react"
import { 
  Laptop, 
  Leaf, 
  HardHat, 
  LineChart, 
  HeartPulse, 
  GraduationCap, 
  Palette, 
  Store,
  Truck,
  Palmtree,
  Lightbulb,
  Briefcase,
  Search,
  BadgeCheck,
  Crown,
  Users
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface AnnuaireCommandPaletteProps {
  open: boolean
  setOpen: (open: boolean) => void
  filters: {
    search: string
    status: string
    activity_domain: string
  }
  onFilterChange: (key: string, value: string) => void
}

const SECTORS = [
  { id: "tech", label: "Tech & Digital", icon: Laptop },
  { id: "agro", label: "Agroalimentaire", icon: Leaf },
  { id: "btp", label: "Construction", icon: HardHat },
  { id: "finance", label: "Finance", icon: LineChart },
  { id: "sante", label: "Santé", icon: HeartPulse },
  { id: "education", label: "Éducation", icon: GraduationCap },
  { id: "creatif", label: "Créativité", icon: Palette },
  { id: "commerce", label: "Commerce", icon: Store },
  { id: "transport", label: "Logistique", icon: Truck },
  { id: "tourisme", label: "Tourisme", icon: Palmtree },
  { id: "energie", label: "Énergie", icon: Lightbulb },
  { id: "b2b", label: "Services B2B", icon: Briefcase },
]

const PROFILES = [
  { id: "all", label: "Tous les profils", icon: Users },
  { id: "premium", label: "Membres Premium", icon: Crown },
  { id: "verified", label: "Membres Vérifiés", icon: BadgeCheck },
]

export function AnnuaireCommandPalette({ open, setOpen, filters, onFilterChange }: AnnuaireCommandPaletteProps) {
  const [inputValue, setInputValue] = React.useState(filters.search)

  React.useEffect(() => {
    setInputValue(filters.search)
  }, [filters.search])

  const handleSelectSector = (sectorId: string) => {
    onFilterChange("activity_domain", sectorId)
    setOpen(false)
  }

  const handleSelectProfileType = (profileId: string) => {
    onFilterChange("status", profileId)
    setOpen(false)
  }

  const handleSearchSubmit = (value: string) => {
    onFilterChange("search", value)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="bg-slate-950/75 backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] text-slate-100 overflow-hidden sm:max-w-xl"
    >
      <div className="absolute top-0 left-1/4 w-96 h-24 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-24 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <CommandInput
        placeholder="Rechercher un profil, filtrer par secteur ou statut..."
        value={inputValue}
        onValueChange={(val) => {
          setInputValue(val)
          handleSearchSubmit(val)
        }}
        className="border-b border-white/10 text-base h-14 text-white placeholder:text-slate-500"
      />
      <CommandList className="max-h-[350px] no-scrollbar py-2">
        <CommandEmpty className="py-8 text-center text-slate-500">
          <p className="text-sm font-medium">Aucun secteur ou profil trouvé.</p>
        </CommandEmpty>

        <CommandGroup heading={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">Filtrer par type de profil</span>}>
          {PROFILES.map((p) => {
            const Icon = p.icon
            const isActive = filters.status === p.id
            return (
              <CommandItem
                key={p.id}
                onSelect={() => handleSelectProfileType(p.id)}
                className={`data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-2.5 my-0.5 mx-1 flex items-center ${isActive ? "bg-white/5 border border-white/10 text-white" : "border border-transparent"}`}
              >
                <div className={`p-1.5 rounded-lg mr-3 ${p.id === 'premium' ? 'bg-rose-500/20 text-rose-400' : p.id === 'verified' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">{p.label}</span>
                {isActive && <span className="ml-auto text-xs text-blue-400 font-bold uppercase tracking-wider">Actif</span>}
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator className="bg-white/5 my-2" />

        <CommandGroup heading={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">Filtrer par secteur d'activité</span>}>
          <CommandItem
            onSelect={() => handleSelectSector("all")}
            className={`data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-2.5 my-0.5 mx-1 flex items-center ${filters.activity_domain === "all" ? "bg-white/5 border border-white/10 text-white" : "border border-transparent"}`}
          >
            <div className="p-1.5 rounded-lg bg-slate-500/20 text-slate-400 mr-3">
              <Users className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Tous les secteurs</span>
            {filters.activity_domain === "all" && <span className="ml-auto text-xs text-blue-400 font-bold uppercase tracking-wider">Actif</span>}
          </CommandItem>

          {SECTORS.map((sector) => {
            const Icon = sector.icon
            const isActive = filters.activity_domain === sector.id
            return (
              <CommandItem
                key={sector.id}
                onSelect={() => handleSelectSector(sector.id)}
                className={`data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-2.5 my-0.5 mx-1 flex items-center ${isActive ? "bg-white/5 border border-white/10 text-white" : "border border-transparent"}`}
              >
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mr-3">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">{sector.label}</span>
                {isActive && <span className="ml-auto text-xs text-blue-400 font-bold uppercase tracking-wider">Actif</span>}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

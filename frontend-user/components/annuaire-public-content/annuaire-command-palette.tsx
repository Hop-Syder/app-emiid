/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Palette de commande (Cmd+K) de l'Annuaire — Recherche + 2 filtres :
 *              Type de profil (10 catégories) et Secteur d'activité.
 * @created 2026-06-22
 * @updated 2026-06-22
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
  Hammer,
  Building2,
  Megaphone,
  Rocket,
  HeartHandshake,
  TrendingUp,
  Landmark,
  Users,
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
    category: string
    activity_domain: string
  }
  onFilterChange: (key: string, value: string) => void
}

// ─── Filtre 1 : Type de profil (les 10 catégories — alignées sur creer-profil) ──
const PROFILE_TYPES = [
  { id: "all", label: "Tous les profils", icon: Users, tone: "bg-slate-500/20 text-slate-300" },
  { id: "artisan", label: "Artisan", icon: Hammer, tone: "bg-amber-500/20 text-amber-400" },
  { id: "commerçante", label: "Commerçant(e)", icon: Store, tone: "bg-orange-500/20 text-orange-400" },
  { id: "freelance", label: "Freelance", icon: Laptop, tone: "bg-blue-500/20 text-blue-400" },
  { id: "entreprise", label: "Entreprise", icon: Building2, tone: "bg-indigo-500/20 text-indigo-400" },
  { id: "agence", label: "Agence", icon: Megaphone, tone: "bg-fuchsia-500/20 text-fuchsia-400" },
  { id: "startup", label: "Startup", icon: Rocket, tone: "bg-violet-500/20 text-violet-400" },
  { id: "ong", label: "ONG / Association", icon: HeartHandshake, tone: "bg-rose-500/20 text-rose-400" },
  { id: "investisseur", label: "Investisseur", icon: TrendingUp, tone: "bg-emerald-500/20 text-emerald-400" },
  { id: "institution", label: "Institution Publique", icon: Landmark, tone: "bg-cyan-500/20 text-cyan-400" },
  { id: "etudiant", label: "Étudiant / Junior", icon: GraduationCap, tone: "bg-teal-500/20 text-teal-400" },
]

// ─── Filtre 2 : Secteur d'activité (alignés sur les valeurs BDD) ────────────────
const SECTORS = [
  { id: "tech", label: "Tech & Digital", icon: Laptop },
  { id: "agro", label: "Agroalimentaire", icon: Leaf },
  { id: "btp", label: "BTP & Construction", icon: HardHat },
  { id: "finance", label: "Finance & Assurance", icon: LineChart },
  { id: "sante", label: "Santé & Bien-être", icon: HeartPulse },
  { id: "education", label: "Éducation & Formation", icon: GraduationCap },
  { id: "creatif", label: "Arts & Créativité", icon: Palette },
  { id: "commerce", label: "Commerce & Distribution", icon: Store },
  { id: "transport", label: "Transport & Logistique", icon: Truck },
  { id: "tourisme", label: "Tourisme & Hôtellerie", icon: Palmtree },
  { id: "energie", label: "Énergie & Environnement", icon: Lightbulb },
  { id: "b2b", label: "Services B2B", icon: Briefcase },
]

const itemClass = (isActive: boolean) =>
  `data-[selected=true]:bg-white/10 data-[selected=true]:text-white text-slate-300 rounded-xl transition-all cursor-pointer py-2.5 my-0.5 mx-1 flex items-center ${
    isActive ? "bg-white/5 border border-white/10 text-white" : "border border-transparent"
  }`

export function AnnuaireCommandPalette({ open, setOpen, filters, onFilterChange }: AnnuaireCommandPaletteProps) {
  const [inputValue, setInputValue] = React.useState(filters.search)

  React.useEffect(() => {
    setInputValue(filters.search)
  }, [filters.search])

  const handleSelectProfileType = (id: string) => {
    onFilterChange("category", id)
    setOpen(false)
  }

  const handleSelectSector = (id: string) => {
    onFilterChange("activity_domain", id)
    setOpen(false)
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
        placeholder="Rechercher un profil, ou filtrer par type / secteur..."
        value={inputValue}
        onValueChange={(val) => {
          setInputValue(val)
          onFilterChange("search", val)
        }}
        className="border-b border-white/10 text-base h-14 text-white placeholder:text-slate-500"
      />
      <CommandList className="max-h-[60vh] sm:max-h-[400px] no-scrollbar py-2">
        <CommandEmpty className="py-8 text-center text-slate-500">
          <p className="text-sm font-medium">Aucun type de profil ou secteur trouvé.</p>
        </CommandEmpty>

        {/* FILTRE 1 — Type de profil */}
        <CommandGroup
          heading={
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">
              Type de profil
            </span>
          }
        >
          {PROFILE_TYPES.map((p) => {
            const Icon = p.icon
            const isActive = (filters.category || "all") === p.id
            return (
              <CommandItem
                key={p.id}
                value={`type ${p.label}`}
                onSelect={() => handleSelectProfileType(p.id)}
                className={itemClass(isActive)}
              >
                <div className={`p-1.5 rounded-lg mr-3 ${p.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">{p.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs text-blue-400 font-bold uppercase tracking-wider">Actif</span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator className="bg-white/5 my-2" />

        {/* FILTRE 2 — Secteur d'activité */}
        <CommandGroup
          heading={
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">
              Secteur d&apos;activité
            </span>
          }
        >
          <CommandItem
            value="secteur Tous les secteurs"
            onSelect={() => handleSelectSector("all")}
            className={itemClass((filters.activity_domain || "all") === "all")}
          >
            <div className="p-1.5 rounded-lg bg-slate-500/20 text-slate-300 mr-3">
              <Users className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Tous les secteurs</span>
            {(filters.activity_domain || "all") === "all" && (
              <span className="ml-auto text-xs text-blue-400 font-bold uppercase tracking-wider">Actif</span>
            )}
          </CommandItem>

          {SECTORS.map((sector) => {
            const Icon = sector.icon
            const isActive = filters.activity_domain === sector.id
            return (
              <CommandItem
                key={sector.id}
                value={`secteur ${sector.label}`}
                onSelect={() => handleSelectSector(sector.id)}
                className={itemClass(isActive)}
              >
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mr-3">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">{sector.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs text-blue-400 font-bold uppercase tracking-wider">Actif</span>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

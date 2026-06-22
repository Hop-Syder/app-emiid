/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Palette de commande (Cmd+K) de l'Annuaire — design clair "brand", lisible.
 *              Recherche + 2 filtres : Type de profil (10 catégories) et Secteur d'activité.
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
  Check,
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

interface Option {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string // classe text-* pour l'icône (lisible sur fond clair)
  chip: string // classe bg-* douce pour la pastille
}

// ─── Filtre 1 : Type de profil (les 10 catégories — alignées sur creer-profil) ──
const PROFILE_TYPES: Option[] = [
  { id: "all", label: "Tous les profils", icon: Users, color: "text-slate-500", chip: "bg-slate-100" },
  { id: "artisan", label: "Artisan", icon: Hammer, color: "text-amber-600", chip: "bg-amber-50" },
  { id: "commerçante", label: "Commerçant(e)", icon: Store, color: "text-orange-600", chip: "bg-orange-50" },
  { id: "freelance", label: "Freelance", icon: Laptop, color: "text-blue-600", chip: "bg-blue-50" },
  { id: "entreprise", label: "Entreprise", icon: Building2, color: "text-indigo-600", chip: "bg-indigo-50" },
  { id: "agence", label: "Agence", icon: Megaphone, color: "text-fuchsia-600", chip: "bg-fuchsia-50" },
  { id: "startup", label: "Startup", icon: Rocket, color: "text-violet-600", chip: "bg-violet-50" },
  { id: "ong", label: "ONG / Association", icon: HeartHandshake, color: "text-rose-600", chip: "bg-rose-50" },
  { id: "investisseur", label: "Investisseur", icon: TrendingUp, color: "text-emerald-600", chip: "bg-emerald-50" },
  { id: "institution", label: "Institution Publique", icon: Landmark, color: "text-cyan-600", chip: "bg-cyan-50" },
  { id: "etudiant", label: "Étudiant / Junior", icon: GraduationCap, color: "text-teal-600", chip: "bg-teal-50" },
]

// ─── Filtre 2 : Secteur d'activité (alignés sur les valeurs BDD) ────────────────
const SECTORS: Option[] = [
  { id: "all", label: "Tous les secteurs", icon: Users, color: "text-slate-500", chip: "bg-slate-100" },
  { id: "tech", label: "Tech & Digital", icon: Laptop, color: "text-blue-600", chip: "bg-blue-50" },
  { id: "agro", label: "Agroalimentaire", icon: Leaf, color: "text-green-600", chip: "bg-green-50" },
  { id: "btp", label: "BTP & Construction", icon: HardHat, color: "text-amber-600", chip: "bg-amber-50" },
  { id: "finance", label: "Finance & Assurance", icon: LineChart, color: "text-indigo-600", chip: "bg-indigo-50" },
  { id: "sante", label: "Santé & Bien-être", icon: HeartPulse, color: "text-rose-600", chip: "bg-rose-50" },
  { id: "education", label: "Éducation & Formation", icon: GraduationCap, color: "text-violet-600", chip: "bg-violet-50" },
  { id: "creatif", label: "Arts & Créativité", icon: Palette, color: "text-fuchsia-600", chip: "bg-fuchsia-50" },
  { id: "commerce", label: "Commerce & Distribution", icon: Store, color: "text-orange-600", chip: "bg-orange-50" },
  { id: "transport", label: "Transport & Logistique", icon: Truck, color: "text-slate-600", chip: "bg-slate-100" },
  { id: "tourisme", label: "Tourisme & Hôtellerie", icon: Palmtree, color: "text-teal-600", chip: "bg-teal-50" },
  { id: "energie", label: "Énergie & Environnement", icon: Lightbulb, color: "text-yellow-600", chip: "bg-yellow-50" },
  { id: "b2b", label: "Services B2B", icon: Briefcase, color: "text-cyan-600", chip: "bg-cyan-50" },
]

// État sélectionné cmdk (clavier/survol) → fond clair + texte foncé (toujours lisible).
// État ACTIF (filtre appliqué) → teinte "brand" navy + texte navy.
const itemClass = (isActive: boolean) =>
  `group rounded-xl my-0.5 mx-1 px-2.5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors
   data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900
   ${isActive ? "bg-[#022753]/[0.06] text-[#022753] ring-1 ring-[#022753]/15" : "text-slate-700"}`

export function AnnuaireCommandPalette({ open, setOpen, filters, onFilterChange }: AnnuaireCommandPaletteProps) {
  const [inputValue, setInputValue] = React.useState(filters.search)

  React.useEffect(() => {
    setInputValue(filters.search)
  }, [filters.search])

  const activeCategory = filters.category || "all"
  const activeSector = filters.activity_domain || "all"

  const renderItem = (opt: Option, group: "category" | "activity_domain", active: string) => {
    const Icon = opt.icon
    const isActive = active === opt.id
    return (
      <CommandItem
        key={opt.id}
        value={`${group} ${opt.label}`}
        onSelect={() => {
          onFilterChange(group, opt.id)
          setOpen(false)
        }}
        className={itemClass(isActive)}
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${opt.chip}`}>
          <Icon className={`h-4 w-4 ${opt.color}`} />
        </span>
        <span className="font-semibold text-sm truncate">{opt.label}</span>
        {isActive && <Check className="ml-auto h-4 w-4 text-[#022753] shrink-0" strokeWidth={3} />}
      </CommandItem>
    )
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Recherche annuaire"
      description="Rechercher un profil et filtrer par type ou secteur"
      className="sm:max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-2xl text-slate-900 shadow-[0_24px_70px_-15px_rgba(2,39,83,0.25)]"
    >
      {/* Liseré dégradé brand en haut */}
      <div className="h-1 w-full bg-gradient-to-r from-[#022753] via-indigo-500 to-[#CE1126]" />

      <CommandInput
        placeholder="Rechercher par nom, métier, compétence…"
        value={inputValue}
        onValueChange={(val) => {
          setInputValue(val)
          onFilterChange("search", val)
        }}
        className="h-14 text-base text-slate-900 placeholder:text-slate-400"
      />

      <CommandList className="max-h-[62vh] sm:max-h-[420px] no-scrollbar px-1 py-2">
        <CommandEmpty className="py-10 text-center">
          <p className="text-sm font-semibold text-slate-500">Aucun type de profil ou secteur trouvé.</p>
          <p className="text-xs text-slate-400 mt-1">Votre recherche est tout de même appliquée aux résultats.</p>
        </CommandEmpty>

        {/* FILTRE 1 — Type de profil */}
        <CommandGroup
          heading={
            <span className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Type de profil
            </span>
          }
        >
          {PROFILE_TYPES.map((opt) => renderItem(opt, "category", activeCategory))}
        </CommandGroup>

        <CommandSeparator className="bg-slate-200/70 my-2" />

        {/* FILTRE 2 — Secteur d'activité */}
        <CommandGroup
          heading={
            <span className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Secteur d&apos;activité
            </span>
          }
        >
          {SECTORS.map((opt) => renderItem(opt, "activity_domain", activeSector))}
        </CommandGroup>
      </CommandList>

      {/* Pied de page : raccourci */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] font-medium text-slate-400">
        <span className="flex items-center gap-1.5">
          <kbd className="inline-flex h-5 items-center rounded border border-slate-200 bg-slate-50 px-1.5 font-sans font-bold text-slate-500">↵</kbd>
          pour sélectionner
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="inline-flex h-5 items-center rounded border border-slate-200 bg-slate-50 px-1.5 font-sans font-bold text-slate-500">Esc</kbd>
          pour fermer
        </span>
      </div>
    </CommandDialog>
  )
}

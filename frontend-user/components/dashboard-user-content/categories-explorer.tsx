/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Explorateur de catégories pour le Dashboard
 * @created 2026-06-01
 */

"use client"

import Link from "next/link"
import { Hammer, Store, Laptop, Briefcase, Megaphone, Rocket, Globe, TrendingUp, Landmark, GraduationCap } from "lucide-react"

const categories = [
  // Ligne 1
  { id: "artisan", label: "Artisan", desc: "Création manuelle, métiers de l'artisanat, savoir-faire", icon: Hammer, color: "text-amber-600", bg: "bg-amber-50 border-amber-100", count: "1.2k+" },
  { id: "commerçante", label: "Commerçant", desc: "Vente de biens, boutiquier, grossiste", icon: Store, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100", count: "850+" },
  { id: "freelance", label: "Freelance / Indépendant", desc: "Prestation de service en solo, consultant", icon: Laptop, color: "text-blue-500", bg: "bg-blue-50 border-blue-100", count: "420+" },
  { id: "entreprise", label: "Entreprise", desc: "PME, TPE, Grande entreprise classique", icon: Briefcase, color: "text-slate-700", bg: "bg-slate-100 border-slate-200", count: "310+" },
  { id: "agence", label: "Agence", desc: "Communication, Marketing, Web, RH", icon: Megaphone, color: "text-purple-500", bg: "bg-purple-50 border-purple-100", count: "540+" },
  // Ligne 2
  { id: "startup", label: "Startup", desc: "Jeune entreprise innovante, Tech", icon: Rocket, color: "text-rose-500", bg: "bg-rose-50 border-rose-100", count: "210+" },
  { id: "ong", label: "ONG / Association", desc: "À but non lucratif, fondation", icon: Globe, color: "text-cyan-500", bg: "bg-cyan-50 border-cyan-100", count: "150+" },
  { id: "investisseur", label: "Investisseur / Business Angel", desc: "Fonds d'investissement, cherche des projets", icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50 border-indigo-100", count: "85+" },
  { id: "institution", label: "Institution Publique", desc: "Ministère, agence d'état, chambre de commerce", icon: Landmark, color: "text-teal-600", bg: "bg-teal-50 border-teal-100", count: "40+" },
  { id: "etudiant", label: "Étudiant / Jeune Diplômé", desc: "Pour la recherche de stage/emploi", icon: GraduationCap, color: "text-orange-500", bg: "bg-orange-50 border-orange-100", count: "930+" },
]

const CategoryCard = ({ cat, idx }: { cat: any, idx: number }) => {
  const Icon = cat.icon
  return (
    <Link
      key={idx}
      href={`/annuaire?category=${cat.id}`}
      className={`snap-start shrink-0 w-[70%] sm:w-[45%] md:w-[22%] lg:w-[19%] group relative flex flex-col p-5 rounded-2xl border ${cat.bg} hover:shadow-xl hover:-translate-y-1 transition-all duration-500 text-left overflow-hidden bg-white/40 backdrop-blur-md`}
    >
      {/* Décoration d'arrière-plan avec glow doux */}
      <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${cat.bg.replace('bg-', 'bg-gradient-to-br from-white to-')}`} />
      
      {/* Icône géante en filigrane */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none transform group-hover:scale-125 group-hover:rotate-6">
        <Icon className="w-28 h-28" />
      </div>

      <div className="p-3 bg-white/80 backdrop-blur-xl w-max rounded-xl mb-4 border border-white/60 shadow-sm group-hover:scale-110 transition-transform duration-300">
        <Icon className={`w-6 h-6 ${cat.color}`} />
      </div>
      <h4 className="font-bold text-slate-800 text-base md:text-lg tracking-tight z-10 group-hover:text-slate-950 transition-colors leading-tight">{cat.label}</h4>
      <p className="text-xs text-slate-500 z-10 mt-2 mb-1 line-clamp-2 leading-relaxed">{cat.desc}</p>
      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 z-10 mt-auto pt-2">{cat.count} profils</span>
      
      {/* Petit indicateur interactif */}
      <div className="absolute top-4 right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <div className="w-6 h-6 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center border border-white/50">
          <Icon className={`w-3 h-3 ${cat.color}`} />
        </div>
      </div>
    </Link>
  )
}

export function CategoriesExplorer() {
  const row1 = categories.slice(0, 5)
  const row2 = categories.slice(5, 10)

  return (
    <div className="flex flex-col gap-4">
      {/* LIGNE 1 */}
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {row1.map((cat, idx) => (
          <CategoryCard key={idx} cat={cat} idx={idx} />
        ))}
      </div>
      
      {/* LIGNE 2 */}
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {row2.map((cat, idx) => (
          <CategoryCard key={idx} cat={cat} idx={idx} />
        ))}
      </div>
    </div>
  )
}

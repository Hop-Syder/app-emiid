/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Explorateur de catégories pour le Dashboard
 * @created 2026-06-01
 */

"use client"

import Link from "next/link"
import { Briefcase, Code, Palette, LineChart, Camera, Music, Globe, Database } from "lucide-react"

const categories = [
  { name: "Technologie", icon: Code, color: "text-blue-500", bg: "bg-blue-50 border-blue-100", count: "1.2k+" },
  { name: "Business", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100", count: "850+" },
  { name: "Créatif & Art", icon: Palette, color: "text-purple-500", bg: "bg-purple-50 border-purple-100", count: "420+" },
  { name: "Finance", icon: LineChart, color: "text-amber-500", bg: "bg-amber-50 border-amber-100", count: "310+" },
  { name: "Média & Image", icon: Camera, color: "text-rose-500", bg: "bg-rose-50 border-rose-100", count: "540+" },
  { name: "Musique", icon: Music, color: "text-indigo-500", bg: "bg-indigo-50 border-indigo-100", count: "210+" },
  { name: "International", icon: Globe, color: "text-cyan-500", bg: "bg-cyan-50 border-cyan-100", count: "900+" },
  { name: "Data & IA", icon: Database, color: "text-slate-700", bg: "bg-slate-100 border-slate-200", count: "150+" },
]

export function CategoriesExplorer() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((cat, idx) => {
        const Icon = cat.icon
        return (
          <Link
            key={idx}
            href={`/annuaire?category=${encodeURIComponent(cat.name)}`}
            className={`group relative flex flex-col p-5 rounded-2xl border ${cat.bg} hover:shadow-md transition-all duration-300 text-left overflow-hidden`}
          >
            {/* Décoration d'arrière-plan */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300 pointer-events-none transform group-hover:scale-110">
              <Icon className="w-24 h-24" />
            </div>

            <div className="p-3 bg-white/60 backdrop-blur-sm w-max rounded-xl mb-4 border border-white/50 shadow-sm">
              <Icon className={`w-6 h-6 ${cat.color}`} />
            </div>
            <h4 className="font-bold text-slate-800 text-lg tracking-tight z-10">{cat.name}</h4>
            <span className="text-sm font-medium text-slate-500 z-10 mt-1">{cat.count} profils</span>
          </Link>
        )
      })}
    </div>
  )
}

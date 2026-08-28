/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Bloc « Réseau & Communautés » — les salons communautaires de l'utilisateur.
 * @created 2026-07-10
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Users, BadgeCheck, ArrowRight, Network } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Community {
  id: string
  name: string | null
  avatar_url: string | null
  slug: string | null
  is_verified: boolean | null
  member_count: number | null
}

export function CommunautesSection() {
  const supabase = createClient()
  const router = useRouter()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      // La RLS de `conversations` ne renvoie que les salons dont je suis membre (joined).
      // On filtre sur is_community → mes communautés uniquement.
      // Colonnes groupe/communauté pas encore dans les types Supabase → cast (Étape 5 : regen types).
      const { data } = await (supabase.from("conversations") as any)
        .select("id, name, avatar_url, slug, is_verified, member_count")
        .eq("is_community", true)
        .order("member_count", { ascending: false })
      if (active) {
        setCommunities((data as Community[]) || [])
        setLoading(false)
      }
    })()
    return () => { active = false }
  }, [supabase])

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {[0, 1].map((i) => <div key={i} className="h-20 rounded-2xl bg-white border border-slate-100 animate-pulse" />)}
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-white text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#013ff4]/10 flex items-center justify-center mx-auto mb-3">
          <Network className="h-6 w-6 text-[#013ff4]" />
        </div>
        <p className="text-sm font-bold text-slate-700">Aucune communauté pour le moment</p>
        <p className="text-xs text-slate-400 mt-1">Rejoignez ou créez une communauté depuis la messagerie pour afficher un badge sur votre carte.</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {communities.map((c) => (
        <button
          key={c.id}
          onClick={() => router.push(`/messages?conv=${c.id}`)}
          className="group flex items-center gap-3 rounded-2xl bg-white border border-slate-100 p-4 text-left hover:shadow-md hover:border-slate-200 transition-all"
        >
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            {c.avatar_url ? (
              <Image src={c.avatar_url} alt={c.name || "Communauté"} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#013ff4]/10 text-[#013ff4] font-black">
                {(c.name || "?")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-slate-900 truncate">{c.name || "Communauté"}</p>
              {c.is_verified && <BadgeCheck className="h-4 w-4 text-[#013ff4] shrink-0" />}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3" /> {c.member_count ?? 0} membre{(c.member_count ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#013ff4] group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      ))}
    </div>
  )
}

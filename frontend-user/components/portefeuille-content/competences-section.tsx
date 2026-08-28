/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Gestion des compétences (profile_tags) — ajout par autocomplete, suppression
 * @updated 2026-06-22
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, X, Tag, Search } from "lucide-react"
import { toast } from "sonner"

interface TagItem {
  id: string
  name: string
}

interface CompetencesSectionProps {
  profileId: string | null
}

export function CompetencesSection({ profileId }: CompetencesSectionProps) {
  const [currentTags, setCurrentTags]       = useState<TagItem[]>([])
  const [searchQuery, setSearchQuery]       = useState("")
  const [suggestions, setSuggestions]       = useState<TagItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading]               = useState(true)
  const searchRef = useRef<HTMLDivElement>(null)
  const supabase  = createClient()

  const loadTags = async () => {
    if (!profileId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from("profile_tags")
      .select("tag_id, tags(id, name)")
      .eq("profile_id", profileId)

    if (data) {
      const tags = (data as unknown as { tags: TagItem | null }[])
        .map(row => row.tags)
        .filter(Boolean) as TagItem[]
      setCurrentTags(tags)
    }
    setLoading(false)
  }

  useEffect(() => { void loadTags() }, [profileId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced autocomplete
  useEffect(() => {
    if (searchQuery.length < 1) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("tags")
        .select("id, name")
        .ilike("name", `%${searchQuery}%`)
        .limit(8)
      if (data) {
        const currentIds = new Set(currentTags.map(t => t.id))
        setSuggestions((data as TagItem[]).filter(t => !currentIds.has(t.id)))
        setShowSuggestions(true)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery, currentTags]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const addTag = async (tag: TagItem) => {
    if (!profileId) return
    const { error } = await supabase
      .from("profile_tags")
      .insert({ profile_id: profileId, tag_id: tag.id })

    if (!error) {
      setCurrentTags(prev => [...prev, tag])
      setSearchQuery("")
      setSuggestions([])
      setShowSuggestions(false)
      toast.success(`"${tag.name}" ajouté à votre profil`)
    } else {
      toast.error("Impossible d'ajouter cette compétence")
    }
  }

  const removeTag = async (tag: TagItem) => {
    if (!profileId) return
    const { error } = await supabase
      .from("profile_tags")
      .delete()
      .eq("profile_id", profileId)
      .eq("tag_id", tag.id)

    if (!error) {
      setCurrentTags(prev => prev.filter(t => t.id !== tag.id))
      toast.success(`"${tag.name}" retiré`)
    } else {
      toast.error("Impossible de retirer cette compétence")
    }
  }

  if (!profileId) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <p className="text-sm text-slate-500">Créez d&apos;abord votre profil pour gérer vos compétences.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Search with autocomplete */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Rechercher une compétence à ajouter…"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {suggestions.map(tag => (
              <button
                key={tag.id}
                onClick={() => void addTag(tag)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors text-sm"
              >
                <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium text-slate-900">{tag.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current tags card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5">
          Vos compétences ({currentTags.length})
        </h2>

        {loading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 rounded-full bg-slate-100 animate-pulse" style={{ width: `${60 + i * 14}px` }} />
            ))}
          </div>
        ) : currentTags.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Tag className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Aucune compétence ajoutée</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Ajoutez vos compétences pour apparaître dans les recherches de l&apos;annuaire.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentTags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 text-primary rounded-full text-sm font-semibold"
              >
                {tag.name}
                <button
                  onClick={() => void removeTag(tag)}
                  className="text-primary/60 hover:text-red-500 transition-colors shrink-0 leading-none"
                  aria-label={`Retirer ${tag.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Les compétences sont visibles immédiatement sur votre profil public et dans l&apos;annuaire.
      </p>
    </div>
  )
}

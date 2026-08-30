"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Hash } from "lucide-react"

interface Tag {
    id: number | string
    name: string
    count: number
}

interface AnnuaireTagsProps {
    filters: {
        tags: string
    }
    onFilterChange: (key: string, value: string) => void
}

export function AnnuaireTags({ filters, onFilterChange }: AnnuaireTagsProps) {
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await fetch("/api/annuaire/tags")
                const data = await res.json()
                if (data.tags) {
                    setTags(data.tags)
                }
            } catch (error) {
                console.error("Failed to fetch tags", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTags()
    }, [])

    if (loading || tags.length === 0) {
        return null
    }

    return (
        <div className="w-full">
            <div className="flex items-center mb-4 px-1 gap-2">
                <Hash className="w-5 h-5 text-[#0150fd] dark:text-[#8ab0ff]" />
                <h3 className="text-lg font-bold text-foreground tracking-tight">Tags Populaires</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                    const isActive = filters.tags === tag.name
                    
                    return (
                        <button
                            key={tag.id}
                            onClick={() => onFilterChange("tags", isActive ? "" : tag.name)}
                            className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                                isActive 
                                    ? "bg-[#013ff4] text-white border-[#013ff4] shadow-md shadow-[#0150fd]/20" 
                                    : "bg-card text-muted-foreground border-border hover:border-[#7f9dff] hover:bg-[#eaf0ff] hover:text-[#0132cc]"
                            )}
                        >
                            <span className="opacity-60">#</span>
                            {tag.name}
                            <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded-full ml-1",
                                isActive ? "bg-card/20 text-white" : "bg-muted text-muted-foreground"
                            )}>
                                {tag.count}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

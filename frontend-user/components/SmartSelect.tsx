/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant Select intelligent V2 (Pro Edition) - Style Autocomplete natif
 * @created 2026-01-05
 */

"use client"

import * as React from "react"
import { Check, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { createClient } from "@/lib/supabase/client"

interface SmartSelectProps {
    table: "jobs" | "industries"
    label: string
    value: string
    onChange: (val: string) => void
    placeholder?: string
}

export function SmartSelect({ table, label, value, onChange, placeholder }: SmartSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [options, setOptions] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(false)

    // Ref pour gérer le click outside
    const commandRef = React.useRef<HTMLDivElement>(null)

    // Charger les options au montage
    React.useEffect(() => {
        const supabase = createClient()
        const fetchOptions = async () => {
            setLoading(true)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nom de table dynamique (prop), non typable statiquement
            const { data } = await (supabase as any)
                .from(table)
                .select("name")
                .order("name")

            if (data) {
                setOptions(data.map((item: { name: string }) => item.name))
            }
            setLoading(false)
        }
        fetchOptions()
    }, [table])

    // Gestion du click outside pour fermer la liste
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Si une valeur est fournie (ex: depuis la DB), on l'affiche
    React.useEffect(() => {
        if (value) {
            // Ne pas écraser si l'utilisateur est en train de taper
            setInputValue(value)
        }
    }, [value])


    const handleSelect = (currentValue: string) => {
        setInputValue(currentValue)
        onChange(currentValue)
        setOpen(false)
    }

    const handleCreate = () => {
        if (inputValue.trim()) {
            // Auto-capitalisation (Première lettre majuscule) pour le côté Pro
            const rawValue = inputValue.trim()
            const confirmValue = rawValue.charAt(0).toUpperCase() + rawValue.slice(1)

            // Ajout optimiste
            if (!options.includes(confirmValue)) {
                setOptions([...options, confirmValue].sort())
            }
            handleSelect(confirmValue)
        }
    }

    // Filtrage local
    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(inputValue.toLowerCase())
    )
    const exactMatch = filteredOptions.some(opt => opt.toLowerCase() === inputValue.toLowerCase())

    return (
        <div className="flex flex-col gap-2 relative group" ref={commandRef}>
            <label className="text-sm font-medium text-gray-700 group-focus-within:text-[#013ff4] transition-colors">
                {label}
            </label>

            <div className="relative">
                <Command className="rounded-xl border border-gray-200 bg-card overflow-visible shadow-sm focus-within:ring-2 focus-within:ring-[#013ff4]/20 focus-within:border-[#013ff4] transition-all">
                    <div className="flex items-center px-3 border-b-0">
                        <CommandInput
                            placeholder={placeholder || "Rechercher ou créer..."}
                            value={inputValue}
                            onValueChange={(val) => {
                                setInputValue(val)
                                setOpen(true)
                                // Si l'utilisateur efface tout, on vide la valeur parent aussi ? 
                                // Non, on garde la valeur précédente tant qu'il n'a pas sélectionné autre chose
                                // ou on peut clear : if(val === "") onChange("")
                            }}
                            onFocus={() => setOpen(true)}
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                    </div>

                    {/* Liste déroulante Flottante */}
                    {open && (
                        <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-xl border border-gray-100 bg-card shadow-xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                            <CommandList className="max-h-[250px] overflow-y-auto p-1">

                                {/* Option de création si pas de match exact */}
                                {!exactMatch && inputValue.trim().length > 0 && (
                                    <CommandGroup heading="Création">
                                        <CommandItem
                                            onSelect={handleCreate}
                                            className="cursor-pointer bg-amber-50 text-amber-900 border border-amber-200 rounded-lg m-1"
                                        >
                                            <Plus className="mr-2 h-4 w-4 text-amber-600" />
                                            Créer &quot;<span className="font-bold">{inputValue}</span>&quot;
                                        </CommandItem>
                                    </CommandGroup>
                                )}

                                {filteredOptions.length > 0 && (
                                    <CommandGroup heading="Suggestions">
                                        {filteredOptions.map((option) => (
                                            <CommandItem
                                                key={option}
                                                value={option}
                                                onSelect={handleSelect}
                                                className="cursor-pointer rounded-lg aria-selected:bg-blue-50 aria-selected:text-blue-900"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4 text-[#013ff4]",
                                                        value === option ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {option}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}

                                {filteredOptions.length === 0 && inputValue.trim().length === 0 && (
                                    <div className="py-6 text-center text-sm text-gray-500">
                                        Commencez à taper pour rechercher...
                                    </div>
                                )}
                            </CommandList>
                        </div>
                    )}
                </Command>
            </div>
        </div>
    )
}

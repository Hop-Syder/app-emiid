/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant Select intelligent avec recherche et ajout dynamique
 * @created 2026-01-05
 */

"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"

interface SmartSelectProps {
    table: "jobs" | "industries"
    label: string
    value: string
    onChange: (val: string) => void
    placeholder?: string
}

export function SmartSelect({ table, label, value, onChange, placeholder }: SmartSelectProps) {
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    // Charger les options depuis Supabase
    useEffect(() => {
        const supabase = createClient()
        const fetchOptions = async () => {
            const { data } = await supabase
                .from(table)
                .select("name")
                .order("name")

            if (data) {
                setOptions(data.map((item: any) => item.name))
            }
        }
        fetchOptions()
    }, [table])

    // Filtrer les options selon la recherche
    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Vérifier si le terme de recherche existe déjà
    const isNewTerm = searchTerm.trim() !== "" &&
        !options.some(opt => opt.toLowerCase() === searchTerm.toLowerCase())

    // Ajouter un nouveau terme
    const handleAddNew = () => {
        const newTerm = searchTerm.trim()
        if (newTerm) {
            onChange(newTerm)
            setOptions([...options, newTerm]) // Mise à jour locale
            setOpen(false)
            setSearchTerm("")
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between w-full"
                    >
                        {value || placeholder || "Sélectionner..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput
                            placeholder={`Rechercher ${label.toLowerCase()}...`}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList>
                            {filteredOptions.length === 0 && !isNewTerm && (
                                <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                            )}

                            {isNewTerm && (
                                <CommandItem
                                    onSelect={handleAddNew}
                                    className="bg-amber-50 border-l-4 border-amber-500"
                                >
                                    <Plus className="mr-2 h-4 w-4 text-amber-600" />
                                    <span className="font-medium text-amber-900">
                                        Ajouter "{searchTerm}"
                                    </span>
                                </CommandItem>
                            )}

                            <CommandGroup>
                                {filteredOptions.map((option) => (
                                    <CommandItem
                                        key={option}
                                        value={option}
                                        onSelect={() => {
                                            onChange(option)
                                            setOpen(false)
                                            setSearchTerm("")
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

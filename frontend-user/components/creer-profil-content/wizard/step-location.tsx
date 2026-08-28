/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Étape 3 du tunnel — « Où es-tu ? » : pays, ville, arrondissement/quartier.
 */

"use client"

import { LocationSelector } from "@/components/LocationSelector"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreateProfileFormData } from "@/hooks/use-creer-profil"

interface StepLocationProps {
    formData: CreateProfileFormData
    handleInputChange: (field: keyof CreateProfileFormData, value: string | string[]) => void
    errors?: Partial<Record<"city" | "district", string>>
}

export function StepLocation({ formData, handleInputChange, errors }: StepLocationProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Où es-tu ?</h2>
                <p className="text-sm text-slate-500 mt-1">Pour être découvert par géolocalisation dans l&apos;annuaire.</p>
            </div>

            {/* Pays + Ville (Bénin par défaut, extensible CEDEAO) */}
            <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">
                    Pays &amp; Ville <span className="text-[#013ff4]">*</span>
                </Label>
                <LocationSelector
                    defaultCountryCode={formData.country_code || "BJ"}
                    defaultCity={formData.city}
                    onLocationSelect={(country, city) => {
                        handleInputChange("country_code", country.isoCode)
                        handleInputChange("country_name", country.name)
                        handleInputChange("city", city)
                    }}
                />
                {errors?.city && <p className="text-xs font-medium text-rose-500">{errors.city}</p>}
            </div>

            {/* Arrondissement / Quartier */}
            <div className="space-y-1.5">
                <Label htmlFor="district" className="text-sm font-semibold text-slate-700">
                    Arrondissement / Quartier <span className="text-[#013ff4]">*</span>
                </Label>
                <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    placeholder="Ex : Akpakpa, Menontin, Cadjehoun, Arconville"
                    className="h-12 rounded-xl"
                />
                {errors?.district && <p className="text-xs font-medium text-rose-500">{errors.district}</p>}
            </div>
        </div>
    )
}

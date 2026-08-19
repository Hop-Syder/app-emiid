/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Étape 2 du tunnel — « Que fais-tu ? » : métier, type de profil, secteur, WhatsApp.
 */

"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROFILE_CATEGORIES, ACTIVITY_DOMAINS } from "@/lib/profile-options"
import type { CreateProfileFormData } from "@/hooks/use-creer-profil"

interface StepActivityProps {
    formData: CreateProfileFormData
    handleInputChange: (field: keyof CreateProfileFormData, value: string | string[]) => void
    errors?: Partial<Record<"role" | "category" | "phone", string>>
}

export function StepActivity({ formData, handleInputChange, errors }: StepActivityProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Que fais-tu ?</h2>
                <p className="text-sm text-slate-500 mt-1">Ton activité et ton contact direct.</p>
            </div>

            {/* Corps de métier */}
            <div className="space-y-1.5">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-700">
                    Corps de métier <span className="text-[#013ff4]">*</span>
                </Label>
                <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    placeholder="Ex : Électricien bâtiment, Couturier, Développeur Web"
                    className="h-12 rounded-xl"
                />
                {errors?.role && <p className="text-xs font-medium text-rose-500">{errors.role}</p>}
            </div>

            {/* Type de profil */}
            <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-semibold text-slate-700">
                    Type de profil <span className="text-[#013ff4]">*</span>
                </Label>
                <Select value={formData.category || ""} onValueChange={(v) => handleInputChange("category", v)}>
                    <SelectTrigger id="category" className="h-12 rounded-xl">
                        <SelectValue placeholder="Choisir un type de profil..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1 max-h-[300px]">
                        {PROFILE_CATEGORIES.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="rounded-xl py-2.5 cursor-pointer">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors?.category && <p className="text-xs font-medium text-rose-500">{errors.category}</p>}
            </div>

            {/* Secteur d'activité */}
            <div className="space-y-1.5">
                <Label htmlFor="activity_domain" className="text-sm font-semibold text-slate-700">
                    Secteur d&apos;activité
                </Label>
                <Select value={formData.activity_domain || ""} onValueChange={(v) => handleInputChange("activity_domain", v)}>
                    <SelectTrigger id="activity_domain" className="h-12 rounded-xl">
                        <SelectValue placeholder="Choisir un secteur..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1 max-h-[300px]">
                        {ACTIVITY_DOMAINS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="rounded-xl py-2.5 cursor-pointer">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                    Téléphone (WhatsApp direct) <span className="text-[#013ff4]">*</span>
                </Label>
                <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    onFocus={() => {
                        if (!formData.phone) handleInputChange("phone", "+229 ")
                    }}
                    placeholder="+229 97 00 00 00"
                    className="h-12 rounded-xl"
                    autoComplete="tel"
                />
                <p className="text-xs text-slate-400">Format international, indicatif +229 (Bénin) par défaut.</p>
                {errors?.phone && <p className="text-xs font-medium text-rose-500">{errors.phone}</p>}
            </div>
        </div>
    )
}

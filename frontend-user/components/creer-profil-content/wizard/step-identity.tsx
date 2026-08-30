/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Étape 1 du tunnel — « Qui es-tu ? » : nom, nom commercial, photo/logo.
 */

"use client"

import { AvatarUpload } from "@/components/AvatarUpload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreateProfileFormData } from "@/hooks/use-creer-profil"

interface StepIdentityProps {
    formData: CreateProfileFormData
    handleInputChange: (field: keyof CreateProfileFormData, value: string | string[]) => void
    error?: string | null
}

export function StepIdentity({ formData, handleInputChange, error }: StepIdentityProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Qui es-tu ?</h2>
                <p className="text-sm text-muted-foreground mt-1">Ton identité personnelle et ta marque.</p>
            </div>

            {/* Photo / Logo */}
            <div className="flex flex-col items-center gap-3 py-2">
                <AvatarUpload
                    currentAvatarUrl={formData.avatar && formData.avatar !== "/profil/avatar.jpg" ? formData.avatar : null}
                    onUploadComplete={(url) => handleInputChange("avatar", url)}
                />
                <p className="text-xs text-slate-400 text-center">Photo de profil ou logo · JPG, PNG · Max 2 MB (facultatif)</p>
            </div>

            {/* Nom & Prénom */}
            <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                    Nom &amp; Prénom <span className="text-[#013ff4]">*</span>
                </Label>
                <Input
                    id="fullName"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex : Ismaël Christian DAOUDA ABASSI"
                    className="h-12 rounded-xl"
                    autoComplete="name"
                />
                {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
            </div>

            {/* Nom commercial / atelier */}
            <div className="space-y-1.5">
                <Label htmlFor="businessName" className="text-sm font-semibold text-foreground">
                    Nom commercial / Nom d&apos;atelier
                </Label>
                <Input
                    id="businessName"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange("business_name", e.target.value)}
                    placeholder="Ex : Atelier Confection Pro, Nexus Studio"
                    className="h-12 rounded-xl"
                />
                <p className="text-xs text-slate-400">Facultatif si tu utilises ton nom propre.</p>
            </div>
        </div>
    )
}

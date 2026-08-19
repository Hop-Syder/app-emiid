/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « Réseaux sociaux » : liens sociaux + contacts publics secondaires.
 */

"use client"

import { Globe, Facebook, Instagram, Linkedin, Music2, Phone, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { UserProfileData } from "@/hooks/use-settings"
import { SectionCard, Field, INPUT, SaveBar } from "./settings-primitives"

interface SectionProps {
    profile: UserProfileData
    setProfile: (profile: UserProfileData) => void
    saving: boolean
    handleSave: () => void
    handleCancel: () => void
}

export function SocialLinksSection({ profile, setProfile, saving, handleSave, handleCancel }: SectionProps) {
    function up<K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) {
        setProfile({ ...profile, [key]: value })
    }

    const linkField = (
        key: "website" | "facebook_url" | "instagram_url" | "tiktok_url" | "linkedin_url",
        label: string,
        Icon: React.ElementType,
        placeholder: string,
    ) => (
        <Field label={label}>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    type="url"
                    inputMode="url"
                    value={profile[key] || ""}
                    onChange={(e) => up(key, e.target.value)}
                    className={`${INPUT} pl-10`}
                    placeholder={placeholder}
                />
            </div>
        </Field>
    )

    return (
        <div className="space-y-4">
            <SectionCard title="Réseaux sociaux" description="Ajoute les liens vers tes réseaux et ton site.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {linkField("website", "Site web", Globe, "https://mon-site.com")}
                    {linkField("facebook_url", "Facebook", Facebook, "https://facebook.com/...")}
                    {linkField("instagram_url", "Instagram", Instagram, "https://instagram.com/...")}
                    {linkField("tiktok_url", "TikTok", Music2, "https://tiktok.com/@...")}
                    {linkField("linkedin_url", "LinkedIn", Linkedin, "https://linkedin.com/in/...")}
                </div>
            </SectionCard>

            <SectionCard title="Contacts publics secondaires" description="Facultatif — affichés sur ton profil public.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Téléphone secondaire">
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="tel"
                                inputMode="tel"
                                value={profile.secondary_phone || ""}
                                onChange={(e) => up("secondary_phone", e.target.value)}
                                className={`${INPUT} pl-10`}
                                placeholder="+229 ..."
                            />
                        </div>
                    </Field>
                    <Field label="Email public">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="email"
                                inputMode="email"
                                value={profile.public_email || ""}
                                onChange={(e) => up("public_email", e.target.value)}
                                className={`${INPUT} pl-10`}
                                placeholder="contact@exemple.com"
                            />
                        </div>
                    </Field>
                </div>
            </SectionCard>

            <SaveBar saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
        </div>
    )
}

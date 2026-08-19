/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « À propos & Bio » : bio, slogan, années d'expérience.
 */

"use client"

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

export function BioSection({ profile, setProfile, saving, handleSave, handleCancel }: SectionProps) {
    function up<K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) {
        setProfile({ ...profile, [key]: value })
    }

    return (
        <div className="space-y-4">
            <SectionCard title="À propos" description="Présente ton activité et ton parcours.">
                <div className="space-y-4">
                    <Field label="Slogan / Phrase d'accroche">
                        <Input
                            value={profile.slogan || ""}
                            onChange={(e) => up("slogan", e.target.value)}
                            className={INPUT}
                            maxLength={160}
                            placeholder="Ex : L'excellence artisanale à portée de main"
                        />
                    </Field>

                    <Field label="Bio / Description de l'activité">
                        <textarea
                            value={profile.bio || ""}
                            onChange={(e) => up("bio", e.target.value)}
                            rows={5}
                            maxLength={1200}
                            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-y placeholder:text-slate-400"
                            placeholder="Raconte ton parcours, ton savoir-faire et ce qui te distingue..."
                        />
                    </Field>

                    <Field label="Années d'expérience">
                        <Input
                            type="number"
                            min={0}
                            max={80}
                            value={profile.years_experience ?? ""}
                            onChange={(e) => up("years_experience", e.target.value === "" ? null : Number(e.target.value))}
                            className={`${INPUT} max-w-[160px]`}
                            placeholder="Ex : 8"
                        />
                    </Field>
                </div>
            </SectionCard>

            <SaveBar saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
        </div>
    )
}

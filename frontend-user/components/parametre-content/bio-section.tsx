/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « À propos & Bio » — Slogan, bio détaillée et expérience.
 * @created 2026-06-13
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { UserProfileData } from "@/hooks/use-settings"
import { SectionCard, Field, INPUT, TEXTAREA, SaveBar } from "./settings-primitives"

interface SectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
  hideActions?: boolean
}

export function BioSection({
  profile,
  setProfile,
  saving,
  handleSave,
  handleCancel,
  hideActions = false,
}: SectionProps) {
  function up<K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) {
    setProfile({ ...profile, [key]: value })
  }

  const sloganLen = (profile.slogan || "").length
  const bioLen = (profile.bio || "").length

  return (
    <div className="space-y-4">
      <SectionCard
        title="À propos & Présentation"
        icon={Sparkles}
        description="Présentez votre activité, votre histoire et votre proposition de valeur aux visiteurs."
      >
        <div className="space-y-4">
          <Field
            label="Slogan / Phrase d'accroche"
            counter={`${sloganLen}/160`}
            hint="Une courte phrase mémorable qui s'affiche sous votre nom sur votre profil public."
          >
            <Input
              value={profile.slogan || ""}
              onChange={(e) => up("slogan", e.target.value)}
              className={INPUT}
              maxLength={160}
              placeholder="Ex : L'excellence artisanale et l'innovation au quotidien"
            />
          </Field>

          <Field
            label="Bio / Description détaillée"
            counter={`${bioLen}/1200`}
            hint="Détaillez vos services, votre méthode de travail et vos réalisations."
          >
            <textarea
              value={profile.bio || ""}
              onChange={(e) => up("bio", e.target.value)}
              rows={5}
              maxLength={1200}
              className={TEXTAREA}
              placeholder="Racontez votre parcours, votre savoir-faire et ce qui vous distingue..."
            />
          </Field>

          <Field label="Années d'expérience professionnelle">
            <Input
              type="number"
              min={0}
              max={80}
              value={profile.years_experience ?? ""}
              onChange={(e) => up("years_experience", e.target.value === "" ? null : Number(e.target.value))}
              className={`${INPUT} max-w-[180px]`}
              placeholder="Ex : 5"
            />
          </Field>
        </div>
      </SectionCard>

      {!hideActions && (
        <SaveBar saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
      )}
    </div>
  )
}



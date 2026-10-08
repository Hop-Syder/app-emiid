/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « Préférences » — thème et visibilité dans l'annuaire.
 * @created 2026-06-13
 * @updated 2026-10-08 — chaque réglage est enregistré dès qu'il change (thème compris).
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Eye } from "lucide-react"
import { SectionCard, SettingToggle } from "./settings-primitives"

interface PreferenceSettings {
  language: string
  currency: string
  timezone: string
  theme: string
  public_profile: boolean
}

interface PreferencesSectionProps {
  settings: PreferenceSettings
  /** Applique et enregistre immédiatement la préférence modifiée. */
  onChange: (patch: Partial<PreferenceSettings>) => void
}

export function PreferencesSection({ settings, onChange }: PreferencesSectionProps) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(settings.theme === "dark" ? "dark" : "light")
  }, [settings.theme, setTheme])

  const update = <K extends keyof PreferenceSettings>(key: K, value: PreferenceSettings[K]) =>
    onChange({ [key]: value } as Partial<PreferenceSettings>)

  return (
    <div className="space-y-4">
      {/* Langue, devise et fuseau horaire ne sont plus proposés : l'application
          est en français, en FCFA et à l'heure de Cotonou, et rien ne lisait ces
          réglages. Les valeurs déjà enregistrées sont conservées pour le jour où
          l'internationalisation existera. */}
      {/* ── Apparence & Confidentialité ───────────────────────────────── */}
      <SectionCard title="Apparence & Affichage" icon={Moon}>
        <div className="divide-y divide-border">
          <SettingToggle
            id="theme-dark-mode"
            icon={Moon}
            iconBg="bg-muted"
            iconColor="text-foreground"
            title="Thème Sombre"
            description="Activez le mode sombre pour reposer vos yeux dans les environnements sombres."
            checked={settings.theme === "dark"}
            onCheckedChange={(checked) => update("theme", checked ? "dark" : "light")}
          />

          <SettingToggle
            id="public-profile-visibility"
            icon={Eye}
            iconBg="bg-[#013ff4]/10"
            iconColor="text-[#013ff4]"
            title="Visibilité dans l'Annuaire Public"
            description="Votre profil et vos prestations apparaissent dans l'annuaire universel et dans les résultats de recherche EmiID."
            checked={settings.public_profile}
            onCheckedChange={(checked) => update("public_profile", checked)}
          />
        </div>
      </SectionCard>

    </div>
  )
}


/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « Préférences » — Localisation, monnaie, thème et visibilité.
 * @created 2026-06-13
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { Globe, Moon, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SectionCard, SettingToggle, Field, SaveBar } from "./settings-primitives"

interface PreferenceSettings {
  language: string
  currency: string
  timezone: string
  theme: string
  public_profile: boolean
}

interface PreferencesSectionProps {
  settings: PreferenceSettings
  setSettings: (s: PreferenceSettings) => void
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
  hideActions?: boolean
}

export function PreferencesSection({
  settings,
  setSettings,
  saving,
  handleSave,
  handleCancel,
  hideActions = false,
}: PreferencesSectionProps) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(settings.theme === "dark" ? "dark" : "light")
  }, [settings.theme, setTheme])

  const update = <K extends keyof PreferenceSettings>(key: K, value: PreferenceSettings[K]) =>
    setSettings({ ...settings, [key]: value })

  return (
    <div className="space-y-4">
      {/* ── Région & International ─────────────────────────────────────── */}
      <SectionCard
        title="Localisation & Monnaie"
        icon={Globe}
        description="Configurez votre langue d'affichage, votre devise de tarification et votre fuseau horaire."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Langue de l'interface">
            <Select value={settings.language} onValueChange={(v) => update("language", v)}>
              <SelectTrigger className="h-11 rounded-none bg-muted/80 border-border text-sm font-medium focus:bg-card focus:ring-2 focus:ring-[#013ff4]/15 focus:border-[#013ff4]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="fr">🇫🇷 Français (Bénin / Afrique)</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="ar">🇸🇦 العربية</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Devise de facturation">
            <Select value={settings.currency} onValueChange={(v) => update("currency", v)}>
              <SelectTrigger className="h-11 rounded-none bg-muted/80 border-border text-sm font-medium focus:bg-card focus:ring-2 focus:ring-[#013ff4]/15 focus:border-[#013ff4]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="xof">XOF — Franc CFA (Bénin / UEMOA)</SelectItem>
                <SelectItem value="eur">EUR — Euro (€)</SelectItem>
                <SelectItem value="usd">USD — Dollar ($)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Fuseau horaire">
            <Select value={settings.timezone} onValueChange={(v) => update("timezone", v)}>
              <SelectTrigger className="h-11 rounded-none bg-muted/80 border-border text-sm font-medium focus:bg-card focus:ring-2 focus:ring-[#013ff4]/15 focus:border-[#013ff4]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="gmt">GMT+1 — Cotonou, Porto-Novo, Lagos</SelectItem>
                <SelectItem value="wat">GMT+0 — Accra, Lomé, Dakar</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </SectionCard>

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

      {/* Masquée si la barre suivante enregistre l'ensemble des préférences */}
      {!hideActions && (
        <SaveBar saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
      )}
    </div>
  )
}


/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Preferences section — redesign
 * @updated 2026-06-13
*/

"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

interface PreferenceSettings {
  language:       string
  currency:       string
  timezone:       string
  theme:          string
  public_profile: boolean
}

interface PreferencesSectionProps {
  settings:     PreferenceSettings
  setSettings:  (s: PreferenceSettings) => void
  saving:       boolean
  handleSave:   () => void
  handleCancel: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 relative z-10">
      <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}

export function PreferencesSection({ settings, setSettings, saving, handleSave, handleCancel }: PreferencesSectionProps) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(settings.theme === "dark" ? "dark" : "light")
  }, [settings.theme, setTheme])

  const update = <K extends keyof PreferenceSettings>(key: K, value: PreferenceSettings[K]) =>
    setSettings({ ...settings, [key]: value })

  return (
    <div className="space-y-4">

      {/* Localisation */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
        <h2 className="text-[11px] font-black text-white/50 uppercase tracking-wider mb-5 relative z-10">Localisation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Langue">
            <Select value={settings.language} onValueChange={v => update("language", v)}>
              <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/10 text-white text-sm font-medium focus:ring-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="fr" className="focus:bg-white/10 focus:text-white">🇫🇷 Français</SelectItem>
                <SelectItem value="en" className="focus:bg-white/10 focus:text-white">🇬🇧 English</SelectItem>
                <SelectItem value="ar" className="focus:bg-white/10 focus:text-white">🇸🇦 العربية</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Devise">
            <Select value={settings.currency} onValueChange={v => update("currency", v)}>
              <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/10 text-white text-sm font-medium focus:ring-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="xof" className="focus:bg-white/10 focus:text-white">XOF — Franc CFA</SelectItem>
                <SelectItem value="eur" className="focus:bg-white/10 focus:text-white">EUR — Euro</SelectItem>
                <SelectItem value="usd" className="focus:bg-white/10 focus:text-white">USD — Dollar</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Fuseau horaire">
            <Select value={settings.timezone} onValueChange={v => update("timezone", v)}>
              <SelectTrigger className="h-11 rounded-xl bg-white/5 border-white/10 text-white text-sm font-medium focus:ring-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="gmt" className="focus:bg-white/10 focus:text-white">GMT — Accra, Dakar</SelectItem>
                <SelectItem value="wat" className="focus:bg-white/10 focus:text-white">WAT — Lagos, Douala</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* Apparence & confidentialité */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
        <h2 className="text-[11px] font-black text-white/50 uppercase tracking-wider mb-5 relative z-10">Apparence & confidentialité</h2>
        <div className="divide-y divide-white/10 relative z-10">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Mode sombre</p>
              <p className="text-xs text-white/60 mt-0.5">Basculer vers un thème sombre</p>
            </div>
            <Switch
              className="shrink-0"
              checked={settings.theme === "dark"}
              onCheckedChange={checked => update("theme", checked ? "dark" : "light")}
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Profil public</p>
              <p className="text-xs text-white/60 mt-0.5">Votre profil apparaît dans l'annuaire et les recherches</p>
            </div>
            <Switch
              className="shrink-0"
              checked={settings.public_profile}
              onCheckedChange={checked => update("public_profile", checked)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
        <Button variant="ghost" onClick={handleCancel} className="w-full sm:w-auto h-11 rounded-xl text-white/60 hover:text-white hover:bg-white/10 font-bold">
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-11 rounded-xl bg-white text-zinc-950 hover:bg-white/90 font-bold shadow-sm">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

    </div>
  )
}

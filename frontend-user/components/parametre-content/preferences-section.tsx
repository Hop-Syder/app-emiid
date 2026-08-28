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
  /** Masque la barre d'actions quand une autre section enregistre déjà. */
  hideActions?: boolean
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}

export function PreferencesSection({ settings, setSettings, saving, handleSave, handleCancel, hideActions = false }: PreferencesSectionProps) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(settings.theme === "dark" ? "dark" : "light")
  }, [settings.theme, setTheme])

  const update = <K extends keyof PreferenceSettings>(key: K, value: PreferenceSettings[K]) =>
    setSettings({ ...settings, [key]: value })

  return (
    <div className="space-y-4">

      {/* Localisation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5">Localisation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Langue">
            <Select value={settings.language} onValueChange={v => update("language", v)}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="ar">🇸🇦 العربية</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Devise">
            <Select value={settings.currency} onValueChange={v => update("currency", v)}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xof">XOF — Franc CFA</SelectItem>
                <SelectItem value="eur">EUR — Euro</SelectItem>
                <SelectItem value="usd">USD — Dollar</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Fuseau horaire">
            <Select value={settings.timezone} onValueChange={v => update("timezone", v)}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmt">GMT — Accra, Dakar</SelectItem>
                <SelectItem value="wat">WAT — Lagos, Douala</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* Apparence & confidentialité */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5">Apparence & confidentialité</h2>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">Mode sombre</p>
              <p className="text-xs text-slate-500 mt-0.5">Basculer vers un thème sombre</p>
            </div>
            <Switch
              className="shrink-0"
              checked={settings.theme === "dark"}
              onCheckedChange={checked => update("theme", checked ? "dark" : "light")}
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">Profil public</p>
              <p className="text-xs text-slate-500 mt-0.5">Votre profil apparaît dans l&apos;annuaire et les recherches</p>
            </div>
            <Switch
              className="shrink-0"
              checked={settings.public_profile}
              onCheckedChange={checked => update("public_profile", checked)}
            />
          </div>
        </div>
      </div>

      {/* Masquée quand la section est empilée : la barre suivante enregistre
          déjà l'ensemble des réglages. */}
      {!hideActions && (
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto h-11 rounded-xl border-slate-200 font-bold">
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-11 rounded-xl font-bold shadow-sm">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      )}

    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Preferences section — redesign
 * @updated 2026-06-13
*/

"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { useDensity, DensityLevel } from "@/components/density-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

interface PreferenceSettings {
  language:       string
  currency:       string
  timezone:       string
  theme:          string
  density:        string
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
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}

export function PreferencesSection({ settings, setSettings, saving, handleSave, handleCancel }: PreferencesSectionProps) {
  const { setTheme } = useTheme()
  const { density, setDensity } = useDensity()

  useEffect(() => {
    setTheme(settings.theme === "dark" ? "dark" : "light")
  }, [settings.theme, setTheme])

  const currentDensity = (settings.density as DensityLevel) || density || "100"

  const update = <K extends keyof PreferenceSettings>(key: K, value: PreferenceSettings[K]) =>
    setSettings({ ...settings, [key]: value })

  const handleDensityChange = (value: DensityLevel) => {
    update("density", value)
    setDensity(value)
  }

  return (
    <div className="space-y-4">

      {/* Localisation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5">Localisation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Langue">
            <Select value={settings.language} onValueChange={v => update("language", v)}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-sm font-medium">
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
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-sm font-medium">
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
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-sm font-medium">
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

      {/* Apparence & Densité d'interface */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5">Apparence & Densité d&apos;interface</h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Mode sombre</p>
              <p className="text-xs text-slate-500 mt-0.5">Basculer vers un thème sombre</p>
            </div>
            <Switch
              className="shrink-0"
              checked={settings.theme === "dark"}
              onCheckedChange={checked => update("theme", checked ? "dark" : "light")}
            />
          </div>

          {/* Densité globale de l'interface */}
          <div className="py-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Densité globale de l&apos;interface</p>
                <p className="text-xs text-slate-500 mt-0.5">Ajuste proportionnellement cartes, textes, icônes, avatars et espacements</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                {currentDensity}%
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { level: "100", label: "100%", desc: "Normale" },
                { level: "98", label: "98%", desc: "Légère" },
                { level: "95", label: "95%", desc: "Compacte" },
                { level: "90", label: "90%", desc: "Haute" },
                { level: "85", label: "85%", desc: "Ultra" },
                { level: "80", label: "80%", desc: "Max (80%)" },
              ].map(({ level, label, desc }) => {
                const isActive = currentDensity === level
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleDensityChange(level as DensityLevel)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold scale-[1.02]"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-xs font-extrabold">{label}</span>
                    <span className={`text-[10px] ${isActive ? "text-blue-100" : "text-slate-400"}`}>{desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Profil public</p>
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

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
        <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto h-11 rounded-xl border-slate-200 font-bold">
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-11 rounded-xl font-bold shadow-sm">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

    </div>
  )
}

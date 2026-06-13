/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description General preferences section for Settings
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface PreferenceSettings {
    language: string
    currency: string
    timezone: string
    theme: string
    public_profile: boolean
}

interface PreferencesSectionProps {
    settings: PreferenceSettings
    setSettings: (settings: PreferenceSettings) => void
    onSave: (newSettings?: PreferenceSettings) => Promise<boolean>
    saving: boolean
}

export function PreferencesSection({ settings, setSettings, onSave, saving }: PreferencesSectionProps) {
    const { setTheme } = useTheme()

    useEffect(() => {
        setTheme(settings.theme === "dark" ? "dark" : "light")
    }, [settings.theme, setTheme])

    const updateSetting = <K extends keyof PreferenceSettings>(key: K, value: PreferenceSettings[K]) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        // Auto-save immédiat avec les nouvelles données
        void onSave(newSettings)
    }

    return (
        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Préférences générales</CardTitle>
                <CardDescription>Personnalisez votre expérience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="langue">Langue</Label>
                    <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="devise">Devise</Label>
                    <Select value={settings.currency} onValueChange={(value) => updateSetting("currency", value)}>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="eur">EUR (€)</SelectItem>
                            <SelectItem value="usd">USD ($)</SelectItem>
                            <SelectItem value="xof">XOF (CFA)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fuseau">Fuseau horaire</Label>
                    <Select value={settings.timezone} onValueChange={(value) => updateSetting("timezone", value)}>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gmt">GMT (Accra, Dakar)</SelectItem>
                            <SelectItem value="wat">WAT (Lagos, Abidjan)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                        <p className="font-medium">Mode sombre</p>
                        <p className="text-sm text-muted-foreground">Activer le thème sombre</p>
                    </div>
                    <Switch checked={settings.theme === "dark"} onCheckedChange={(checked) => updateSetting("theme", checked ? "dark" : "light")} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                        <p className="font-medium">Profil public</p>
                        <p className="text-sm text-muted-foreground">Visible dans les recherches</p>
                    </div>
                    <Switch checked={settings.public_profile} onCheckedChange={(checked) => updateSetting("public_profile", checked)} />
                </div>

                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground pt-1">
                    {saving ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…</>
                    ) : (
                        <><Check className="h-3.5 w-3.5 text-emerald-500" /> Modifications enregistrées automatiquement.</>
                    )}
                </p>
            </CardContent>
        </Card>
    )
}

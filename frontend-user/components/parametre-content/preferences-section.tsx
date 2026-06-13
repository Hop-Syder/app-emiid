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
import { Button } from "@/components/ui/button"

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
    saving: boolean
    handleSave: () => void
    handleCancel: () => void
}

export function PreferencesSection({ settings, setSettings, saving, handleSave, handleCancel }: PreferencesSectionProps) {
    const { setTheme } = useTheme()

    useEffect(() => {
        setTheme(settings.theme === "dark" ? "dark" : "light")
    }, [settings.theme, setTheme])

    const updateSetting = <K extends keyof PreferenceSettings>(key: K, value: PreferenceSettings[K]) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
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

                <div className="flex items-center justify-between gap-3 p-4 border rounded-xl">
                    <div className="min-w-0 flex-1">
                        <p className="font-medium">Mode sombre</p>
                        <p className="text-sm text-muted-foreground">Activer le thème sombre</p>
                    </div>
                    <Switch className="shrink-0" checked={settings.theme === "dark"} onCheckedChange={(checked) => updateSetting("theme", checked ? "dark" : "light")} />
                </div>

                <div className="flex items-center justify-between gap-3 p-4 border rounded-xl">
                    <div className="min-w-0 flex-1">
                        <p className="font-medium">Profil public</p>
                        <p className="text-sm text-muted-foreground">Visible dans les recherches</p>
                    </div>
                    <Switch className="shrink-0" checked={settings.public_profile} onCheckedChange={(checked) => updateSetting("public_profile", checked)} />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 pt-6 md:pt-8 border-t border-slate-100">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto rounded-xl h-12 md:h-14 px-8 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                        onClick={handleCancel}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto rounded-xl h-12 md:h-14 px-10 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        {saving ? "Sauvegarde en cours..." : "Enregistrer"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

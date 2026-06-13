/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Notifications preferences section for Settings
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { subscribeToPushNotifications } from "@/lib/push-notifications"

interface NotificationSettings {
    messages: boolean
    network_activity: boolean
    newsletter: boolean
    push: boolean
}

interface NotificationsSectionProps {
    settings: NotificationSettings
    setSettings: (settings: NotificationSettings) => void
    saving: boolean
    handleSave: () => void
    handleCancel: () => void
}

export function NotificationsSection({ settings, setSettings, saving, handleSave, handleCancel }: NotificationsSectionProps) {
    const toggle = async (key: keyof NotificationSettings, checked: boolean) => {
        const newSettings = { ...settings, [key]: checked }
        setSettings(newSettings)

        // Si l'utilisateur active les notifications push, on lance la procédure d'abonnement
        if (key === 'push' && checked) {
            const sub = await subscribeToPushNotifications()
            // Si l'abonnement échoue (refus permission etc), on peut choisir de désactiver le switch
            if (!sub) {
                setSettings({ ...settings, [key]: false })
                return
            }
        }
    }

    return (
        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Préférences de notifications</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être informé</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                        <p className="font-medium">Nouveaux messages</p>
                        <p className="text-sm text-muted-foreground">Notifications pour les nouveaux messages</p>
                    </div>
                    <Switch checked={settings.messages} onCheckedChange={(checked) => toggle("messages", checked)} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                        <p className="font-medium">Activité du réseau</p>
                        <p className="text-sm text-muted-foreground">Mises à jour des profils suivis</p>
                    </div>
                    <Switch checked={settings.network_activity} onCheckedChange={(checked) => toggle("network_activity", checked)} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                        <p className="font-medium">Newsletter hebdomadaire</p>
                        <p className="text-sm text-muted-foreground">Résumé des actualités du réseau</p>
                    </div>
                    <Switch checked={settings.newsletter} onCheckedChange={(checked) => toggle("newsletter", checked)} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                        <p className="font-medium">Notifications push</p>
                        <p className="text-sm text-muted-foreground">Notifications sur mobile</p>
                    </div>
                    <Switch checked={settings.push} onCheckedChange={(checked) => toggle("push", checked)} />
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

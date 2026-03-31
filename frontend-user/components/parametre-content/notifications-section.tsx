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
import { Button } from "@/components/ui/button"

interface NotificationSettings {
    messages: boolean
    network_activity: boolean
    newsletter: boolean
    push: boolean
}

interface NotificationsSectionProps {
    settings: NotificationSettings
    setSettings: (settings: NotificationSettings) => void
    onSave: () => Promise<boolean>
    saving: boolean
}

export function NotificationsSection({ settings, setSettings, onSave, saving }: NotificationsSectionProps) {
    const toggle = (key: keyof NotificationSettings, checked: boolean) => {
        setSettings({ ...settings, [key]: checked })
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
                <Button className="rounded-xl" onClick={() => void onSave()} disabled={saving}>
                    {saving ? "Enregistrement..." : "Enregistrer les notifications"}
                </Button>
            </CardContent>
        </Card>
    )
}

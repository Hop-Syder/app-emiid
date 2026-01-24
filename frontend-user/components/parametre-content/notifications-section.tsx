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

export function NotificationsSection() {
    return (
        <Card className="rounded-3xl">
            <CardHeader>
                <CardTitle>Préférences de notifications</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être informé</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                    <div>
                        <p className="font-medium">Nouveaux messages</p>
                        <p className="text-sm text-muted-foreground">Notifications pour les nouveaux messages</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                    <div>
                        <p className="font-medium">Activité du réseau</p>
                        <p className="text-sm text-muted-foreground">Mises à jour des profils suivis</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                    <div>
                        <p className="font-medium">Newsletter hebdomadaire</p>
                        <p className="text-sm text-muted-foreground">Résumé des actualités du réseau</p>
                    </div>
                    <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                    <div>
                        <p className="font-medium">Notifications push</p>
                        <p className="text-sm text-muted-foreground">Notifications sur mobile</p>
                    </div>
                    <Switch defaultChecked />
                </div>
            </CardContent>
        </Card>
    )
}

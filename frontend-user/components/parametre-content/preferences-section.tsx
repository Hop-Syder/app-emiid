/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description General preferences section for Settings
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function PreferencesSection() {
    return (
        <Card className="rounded-3xl">
            <CardHeader>
                <CardTitle>Préférences générales</CardTitle>
                <CardDescription>Personnalisez votre expérience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="langue">Langue</Label>
                    <Select defaultValue="fr">
                        <SelectTrigger className="rounded-2xl">
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
                    <Select defaultValue="eur">
                        <SelectTrigger className="rounded-2xl">
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
                    <Select defaultValue="gmt">
                        <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gmt">GMT (Accra, Dakar)</SelectItem>
                            <SelectItem value="wat">WAT (Lagos, Abidjan)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl">
                    <div>
                        <p className="font-medium">Mode sombre</p>
                        <p className="text-sm text-muted-foreground">Activer le thème sombre</p>
                    </div>
                    <Switch />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl">
                    <div>
                        <p className="font-medium">Profil public</p>
                        <p className="text-sm text-muted-foreground">Visible dans les recherches</p>
                    </div>
                    <Switch defaultChecked />
                </div>

                <Button className="rounded-2xl">Enregistrer les préférences</Button>
            </CardContent>
        </Card>
    )
}

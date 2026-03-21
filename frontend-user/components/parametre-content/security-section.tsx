/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Security section for Settings (Password, PIN, 2FA)
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/apiClient"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface SecuritySectionProps {
    profile: any
    setProfile: (profile: any) => void
}

export function SecuritySection({ profile, setProfile }: SecuritySectionProps) {
    // États pour la gestion du PIN
    const [pinDialogOpen, setPinDialogOpen] = useState(false)
    const [pinStep, setPinStep] = useState<"enter" | "confirm">("enter")
    const [tempPin, setTempPin] = useState("")
    const [confirmPin, setConfirmPin] = useState("")
    const [pinError, setPinError] = useState("")

    const handlePinToggle = (checked: boolean) => {
        if (checked) {
            setPinStep("enter")
            setTempPin("")
            setConfirmPin("")
            setPinError("")
            setPinDialogOpen(true)
        } else {
            const disablePin = async () => {
                try {
                    const res = await fetchWithAuth("/api/users/me", {
                        method: "PUT",
                        body: JSON.stringify({ ...profile, pin_enabled: false })
                    })
                    if (res.ok) {
                        setProfile({ ...profile, pin_enabled: false })
                        toast.success("Verrouillage PIN désactivé")
                    }
                } catch (e) {
                    toast.error("Erreur")
                }
            }
            disablePin()
        }
    }

    const handlePinSubmit = async () => {
        if (pinStep === "enter") {
            if (tempPin.length !== 6) {
                setPinError("Code incomplet")
                return
            }
            setPinStep("confirm")
        } else {
            if (confirmPin !== tempPin) {
                setPinError("Les codes ne correspondent pas")
                return
            }

            try {
                const res = await fetchWithAuth("/api/users/me", {
                    method: "PUT",
                    body: JSON.stringify({ ...profile, pin_enabled: true, pin_code: confirmPin })
                })
                if (res.ok) {
                    setProfile({ ...profile, pin_enabled: true })
                    setPinDialogOpen(false)
                    toast.success("Sécurité PIN activée !")
                    sessionStorage.setItem("nexus_pin_verified", "true")
                } else {
                    toast.error("Erreur serveur")
                }
            } catch (e) {
                toast.error("Erreur réseau")
            }
        }
    }

    return (
        <div className="space-y-6">
            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Mot de passe</CardTitle>
                    <CardDescription>Modifiez votre mot de passe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Mot de passe actuel</Label>
                        <Input id="current-password" type="password" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nouveau mot de passe</Label>
                        <Input id="new-password" type="password" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                        <Input id="confirm-password" type="password" className="rounded-xl" />
                    </div>
                    <Button className="rounded-xl">Mettre à jour le mot de passe</Button>
                </CardContent>
            </Card>

            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Authentification à deux facteurs</CardTitle>
                    <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                            <p className="font-medium text-[#022753]">Verrouillage par Code PIN</p>
                            <p className="text-sm text-muted-foreground">Sécurisez l'accès au tableau de bord</p>
                        </div>
                        <Switch
                            checked={profile.pin_enabled}
                            onCheckedChange={handlePinToggle}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                            <p className="font-medium">Application d'authentification</p>
                            <p className="text-sm text-muted-foreground">Utilisez une app comme Google Authenticator</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-xl border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-600">Zone de danger</CardTitle>
                    <CardDescription>Actions irréversibles sur votre compte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl">
                        <div>
                            <p className="font-medium">Désactiver le compte</p>
                            <p className="text-sm text-muted-foreground">Votre compte sera temporairement désactivé</p>
                        </div>
                        <Button variant="outline" className="rounded-xl border-red-200 text-red-600 bg-transparent">
                            Désactiver
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl">
                        <div>
                            <p className="font-medium">Supprimer le compte</p>
                            <p className="text-sm text-muted-foreground">Suppression définitive de toutes vos données</p>
                        </div>
                        <Button variant="destructive" className="rounded-xl">
                            Supprimer
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Créer votre Code PIN</DialogTitle>
                        <DialogDescription>
                            {pinStep === "enter" ? "Choisissez un code à 6 chiffres" : "Confirmez votre code"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-6 py-4">
                        <InputOTP
                            maxLength={6}
                            value={pinStep === "enter" ? tempPin : confirmPin}
                            onChange={(val) => {
                                if (pinStep === "enter") setTempPin(val)
                                else setConfirmPin(val)
                                setPinError("")
                            }}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>

                        {pinError && <p className="text-red-500 text-sm">{pinError}</p>}

                        <div className="flex gap-2 w-full justify-end">
                            <Button variant="ghost" onClick={() => setPinDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handlePinSubmit}>
                                {pinStep === "enter" ? "Suivant" : "Confirmer"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

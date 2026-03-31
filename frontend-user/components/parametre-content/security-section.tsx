/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Security section for Settings (Password, PIN, 2FA)
 * @created 2026-01-16
 * @updated 2026-01-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { fetchWithAuth, readApiError } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface SecuritySectionProps {
    profile: any
    setProfile: (profile: any) => void
    securitySettings: {
        two_factor_enabled: boolean
    }
    setSecuritySettings: (settings: { two_factor_enabled: boolean }) => void
    saveSettings: (payload: {
        notification_preferences?: {
            messages: boolean
            network_activity: boolean
            newsletter: boolean
            push: boolean
        }
        app_preferences?: {
            language: string
            currency: string
            timezone: string
            theme: string
            public_profile: boolean
        }
        security_preferences?: { two_factor_enabled: boolean }
    }, successMessage: string) => Promise<boolean>
}

export function SecuritySection({
    profile,
    setProfile,
    securitySettings,
    setSecuritySettings,
    saveSettings,
}: SecuritySectionProps) {
    const [pinDialogOpen, setPinDialogOpen] = useState(false)
    const [pinStep, setPinStep] = useState<"enter" | "confirm">("enter")
    const [tempPin, setTempPin] = useState("")
    const [confirmPin, setConfirmPin] = useState("")
    const [pinError, setPinError] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [accountLoading, setAccountLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handlePinToggle = (checked: boolean) => {
        if (checked) {
            setPinStep("enter")
            setTempPin("")
            setConfirmPin("")
            setPinError("")
            setPinDialogOpen(true)
            return
        }

        const disablePin = async () => {
            try {
                const res = await fetchWithAuth("/api/users/me", {
                    method: "PUT",
                    body: JSON.stringify({ ...profile, pin_enabled: false })
                })
                if (res.ok) {
                    setProfile({ ...profile, pin_enabled: false })
                    sessionStorage.removeItem("nexus_pin_verified")
                    toast.success("Verrouillage PIN désactivé")
                } else {
                    toast.error(await readApiError(res, "Impossible de désactiver le PIN"))
                }
            } catch {
                toast.error("Erreur réseau")
            }
        }

        void disablePin()
    }

    const handlePinSubmit = async () => {
        if (pinStep === "enter") {
            if (tempPin.length !== 6) {
                setPinError("Code incomplet")
                return
            }
            setPinStep("confirm")
            return
        }

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
                toast.error(await readApiError(res, "Erreur serveur"))
            }
        } catch {
            toast.error("Erreur réseau")
        }
    }

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Tous les champs mot de passe sont requis")
            return
        }

        if (newPassword.length < 8) {
            toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères")
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error("La confirmation du mot de passe ne correspond pas")
            return
        }

        setPasswordSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) {
                toast.error(error.message)
                return
            }

            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            toast.success("Mot de passe mis à jour avec succès")
        } finally {
            setPasswordSaving(false)
        }
    }

    const handleTwoFactorToggle = async (checked: boolean) => {
        const previous = securitySettings.two_factor_enabled
        setSecuritySettings({ two_factor_enabled: checked })
        const success = await saveSettings(
            { security_preferences: { two_factor_enabled: checked } },
            checked ? "Préférence 2FA enregistrée" : "Préférence 2FA désactivée",
        )

        if (!success) {
            setSecuritySettings({ two_factor_enabled: previous })
            return
        }

        toast.info("Assurez-vous d'activer la MFA côté Supabase pour une protection complète")
    }

    const handleDeactivateAccount = async () => {
        if (!window.confirm("Désactiver votre compte maintenant ? Vous serez immédiatement déconnecté.")) {
            return
        }

        setAccountLoading(true)
        try {
            const res = await fetchWithAuth("/api/users/account/deactivate", { method: "POST" })
            if (!res.ok) {
                toast.error(await readApiError(res, "Impossible de désactiver le compte"))
                return
            }

            await supabase.auth.signOut()
            sessionStorage.removeItem("nexus_pin_verified")
            toast.success("Compte désactivé")
            router.push("/")
            router.refresh()
        } finally {
            setAccountLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!window.confirm("Cette action supprime définitivement votre compte. Continuer ?")) {
            return
        }

        setAccountLoading(true)
        try {
            const res = await fetchWithAuth("/api/users/account", { method: "DELETE" })
            if (!res.ok) {
                toast.error(await readApiError(res, "Impossible de supprimer le compte"))
                return
            }

            await supabase.auth.signOut()
            sessionStorage.removeItem("nexus_pin_verified")
            toast.success("Compte supprimé")
            router.push("/")
            router.refresh()
        } finally {
            setAccountLoading(false)
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
                        <Input id="current-password" type="password" className="rounded-xl" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nouveau mot de passe</Label>
                        <Input id="new-password" type="password" className="rounded-xl" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                        <Input id="confirm-password" type="password" className="rounded-xl" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <Button className="rounded-xl" onClick={handlePasswordUpdate} disabled={passwordSaving}>
                        {passwordSaving ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </Button>
                </CardContent>
            </Card>

            <Card className="rounded-xl">
                <CardHeader>
                    <CardTitle>Authentification et accès</CardTitle>
                    <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                            <p className="font-medium text-[#022753]">Verrouillage par Code PIN</p>
                            <p className="text-sm text-muted-foreground">Sécurisez l&apos;accès au tableau de bord</p>
                        </div>
                        <Switch
                            checked={profile.pin_enabled}
                            onCheckedChange={handlePinToggle}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                            <p className="font-medium">Authentification à deux facteurs</p>
                            <p className="text-sm text-muted-foreground">Enregistre votre préférence MFA pour sécuriser le compte</p>
                        </div>
                        <Switch checked={securitySettings.two_factor_enabled} onCheckedChange={(checked) => void handleTwoFactorToggle(checked)} />
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
                            <p className="text-sm text-muted-foreground">Votre compte sera masqué et l&apos;accès sera bloqué</p>
                        </div>
                        <Button variant="outline" className="rounded-xl border-red-200 text-red-600 bg-transparent" onClick={() => void handleDeactivateAccount()} disabled={accountLoading}>
                            Désactiver
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl">
                        <div>
                            <p className="font-medium">Supprimer le compte</p>
                            <p className="text-sm text-muted-foreground">Suppression définitive de toutes vos données</p>
                        </div>
                        <Button variant="destructive" className="rounded-xl" onClick={() => void handleDeleteAccount()} disabled={accountLoading}>
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
                            <Button onClick={() => void handlePinSubmit()}>
                                {pinStep === "enter" ? "Suivant" : "Confirmer"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

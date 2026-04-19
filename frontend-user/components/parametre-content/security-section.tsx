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
import { MessageSquare, Phone, Smartphone, CheckCircle2 } from "lucide-react"
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

interface UserProfile {
    id: string
    email?: string
    phone?: string
    phone_verified?: boolean
}

interface SecuritySectionProps {
    profile: UserProfile
    setProfile: (profile: UserProfile) => void
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
    const [accountLoading, setAccountLoading] = useState(false)
    const [mfaDialogOpen, setMfaDialogOpen] = useState(false)
    const [mfaStep, setMfaStep] = useState<"phone" | "code">("phone")
    const [mfaPhoneNumber, setMfaPhoneNumber] = useState("")
    const [mfaChannel, setMfaChannel] = useState<"whatsapp" | "sms">("whatsapp")
    const [mfaCode, setMfaCode] = useState("")
    const [mfaLoading, setMfaLoading] = useState(false)
    const [mfaFactorId, setMfaFactorId] = useState("")
    const [mfaChallengeId, setMfaChallengeId] = useState("")

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
                    sessionStorage.removeItem("nukun_pin_verified")
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
                sessionStorage.setItem("nukun_pin_verified", "true")
            } else {
                toast.error(await readApiError(res, "Erreur serveur"))
            }
        } catch {
            toast.error("Erreur réseau")
        }
    }


    const handleTwoFactorToggle = (checked: boolean) => {
        if (checked) {
            setMfaStep("phone")
            setMfaPhoneNumber("")
            setMfaCode("")
            setMfaDialogOpen(true)
        } else {
            if (window.confirm("Désactiver l'authentification à deux facteurs ?")) {
                void saveSettings(
                    { security_preferences: { two_factor_enabled: false } },
                    "2FA désactivée"
                ).then((success) => {
                    if (success) setSecuritySettings({ two_factor_enabled: false })
                })
            }
        }
    }

    const handleMfaEnroll = async () => {
        if (!mfaPhoneNumber) {
            toast.error("Veuillez entrer un numéro de téléphone")
            return
        }
        setMfaLoading(true)
        try {
            // 1. Enrôlement du facteur téléphone
            const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
                phone: mfaPhoneNumber,
                factorType: 'phone'
            })
            if (enrollError) throw enrollError
            setMfaFactorId(enrollData.id)

            // 2. Création du challenge (Envoi du code)
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: enrollData.id
            })
            if (challengeError) throw challengeError
            
            setMfaChallengeId(challengeData.id)
            setMfaStep("code")
            toast.success(`Code envoyé par ${mfaChannel === "whatsapp" ? "WhatsApp" : "SMS"}`)
        } catch (error: any) {
            console.error("MFA Enrollment Error:", error)
            toast.error(error.message || "Erreur lors de l'envoi du code")
        } finally {
            setMfaLoading(false)
        }
    }

    const handleMfaVerify = async () => {
        if (mfaCode.length < 6) {
            toast.error("Veuillez entrer le code complet (6 chiffres)")
            return
        }
        setMfaLoading(true)
        try {
            // 3. Vérification du challenge
            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: mfaChallengeId,
                code: mfaCode
            })
            if (verifyError) throw verifyError

            // 4. Mise à jour des préférences utilisateur dans la DB custom
            const success = await saveSettings(
                { security_preferences: { two_factor_enabled: true } },
                "Authentification 2FA activée et vérifiée !"
            )
            
            if (success) {
                setSecuritySettings({ two_factor_enabled: true })
                setMfaDialogOpen(false)
                router.refresh() // Pour rafraîchir l'état de la session
            }
        } catch (error: any) {
            console.error("MFA Verification Error:", error)
            toast.error(error.message || "Code invalide ou expiré")
        } finally {
            setMfaLoading(false)
        }
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
            sessionStorage.removeItem("nukun_pin_verified")
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
                            <p className="font-medium">Authentification à deux facteurs (2FA)</p>
                            <p className="text-sm text-muted-foreground">Sécurisez votre compte via WhatsApp ou SMS (Code à 5 chiffres)</p>
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
            <Dialog open={mfaDialogOpen} onOpenChange={setMfaDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-[#022753]">
                            {mfaStep === "phone" ? "Activer la 2FA" : "Vérification"}
                        </DialogTitle>
                        <DialogDescription>
                            {mfaStep === "phone" 
                                ? "Sécurisez votre compte en recevant un code de validation." 
                                : `Entrez le code à 6 chiffres envoyé sur ${mfaPhoneNumber}`}
                        </DialogDescription>
                    </DialogHeader>

                    {mfaStep === "phone" ? (
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Numéro de téléphone (format international)</Label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        placeholder="+225 0700000000"
                                        value={mfaPhoneNumber}
                                        onChange={(e) => setMfaPhoneNumber(e.target.value)}
                                        className="pl-10 rounded-xl h-12"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setMfaChannel("whatsapp")}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                        mfaChannel === "whatsapp" 
                                        ? "border-green-500 bg-green-50 text-green-700" 
                                        : "border-slate-100 hover:border-slate-200"
                                    }`}
                                >
                                    <img src="/svg/whatsapp-logo.svg" className="h-6 w-6 mb-2" alt="WhatsApp" />
                                    <span className="font-bold text-sm">WhatsApp</span>
                                </button>
                                <button
                                    onClick={() => setMfaChannel("sms")}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                        mfaChannel === "sms" 
                                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                                        : "border-slate-100 hover:border-slate-200"
                                    }`}
                                >
                                    <Phone className="h-6 w-6 mb-2" />
                                    <span className="font-bold text-sm">SMS</span>
                                </button>
                            </div>

                            <Button 
                                onClick={() => void handleMfaEnroll()} 
                                disabled={mfaLoading || !mfaPhoneNumber}
                                className="w-full h-12 rounded-xl bg-[#022753] hover:bg-[#033a7a]"
                            >
                                {mfaLoading ? "Envoi en cours..." : "Recevoir le code"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-8 py-6">
                            <div className="bg-slate-50 p-6 rounded-2xl w-full flex flex-col items-center gap-6 border border-slate-100">
                                <InputOTP
                                    maxLength={6}
                                    value={mfaCode}
                                    onChange={(val) => setMfaCode(val)}
                                >
                                    <InputOTPGroup className="gap-2">
                                        <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold rounded-lg border-2" />
                                    </InputOTPGroup>
                                </InputOTP>

                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Vous n&apos;avez rien reçu ?</p>
                                    <button 
                                        onClick={() => void handleMfaEnroll()}
                                        className="text-sm font-bold text-primary hover:underline"
                                    >
                                        Renvoyer le code
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setMfaStep("phone")}
                                    className="flex-1 h-12 rounded-xl"
                                >
                                    Retour
                                </Button>
                                <Button 
                                    onClick={() => void handleMfaVerify()}
                                    disabled={mfaLoading || mfaCode.length !== 6}
                                    className="flex-[2] h-12 rounded-xl bg-green-600 hover:bg-green-700"
                                >
                                    {mfaLoading ? "Vérification..." : "Vérifier et activer"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

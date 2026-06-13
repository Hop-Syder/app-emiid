/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Security section for Settings (Password, PIN, 2FA)
 * @created 2026-01-16
 * @updated 2026-06-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phone, Smartphone, Lock, Eye, EyeOff, ShieldAlert, LogOut, Shield, KeyRound, Fingerprint, Trash2, UserX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { fetchWithAuth, readApiError } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"



interface SecuritySectionProps {
    profile: any
    setProfile: any
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

    // Reauthentication State
    const [reauthDialogOpen, setReauthDialogOpen] = useState(false)
    const [reauthPassword, setReauthPassword] = useState("")
    const [reauthPin, setReauthPin] = useState("")
    const [showReauthPassword, setShowReauthPassword] = useState(false)
    const [reauthLoading, setReauthLoading] = useState(false)
    const [reauthError, setReauthError] = useState("")
    const [pendingAction, setPendingAction] = useState<"enable" | "disable" | "change" | "disable2fa" | "deactivate" | "delete" | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)


    const supabase = createClient()
    const router = useRouter()

    const handlePinToggle = (checked: boolean) => {
        setPendingAction(checked ? "enable" : "disable")
        setReauthPassword("")
        setReauthPin("")
        setReauthError("")
        setReauthDialogOpen(true)
    }

    const processAfterReauth = () => {
        setReauthDialogOpen(false)

        if (pendingAction === "enable") {
            setPinStep("enter")
            setTempPin("")
            setConfirmPin("")
            setPinError("")
            setPinDialogOpen(true)
        } else if (pendingAction === "disable") {
            void disablePin()
        } else if (pendingAction === "change") {
            setPinStep("enter")
            setTempPin("")
            setConfirmPin("")
            setPinError("")
            setPinDialogOpen(true)
        }

        setPendingAction(null)
    }

    const disablePin = async () => {
        try {
            const res = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify({ ...profile, pin_enabled: false })
            })
            if (res.ok) {
                setProfile({ ...profile, pin_enabled: false })
                sessionStorage.removeItem("emiid_pin_verified")
                toast.success("Verrouillage PIN désactivé")
            } else {
                toast.error(await readApiError(res, "Impossible de désactiver le PIN"))
            }
        } catch {
            toast.error("Erreur réseau")
        }
    }

    const handleReauthSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()

        if (profile.pin_enabled) {
            if (!reauthPin || reauthPin.length !== 6) {
                setReauthError("Code PIN complet requis")
                return
            }
            setReauthLoading(true)
            setReauthError("")

            try {
                const res = await fetchWithAuth("/api/users/verify-pin", {
                    method: "POST",
                    body: JSON.stringify({ pin: reauthPin })
                })
                const data = await res.json()

                if (res.ok && data.success) {
                    processAfterReauth()
                } else {
                    setReauthError(data.error || "Code PIN incorrect")
                }
            } catch {
                setReauthError("Erreur de connexion")
            } finally {
                setReauthLoading(false)
            }
            return
        }

        const isOAuth = profile.email && !profile.has_password

        if (isOAuth) {
            toast.info("Re-vérification simplifiée pour compte social", {
                description: "En tant qu'utilisateur Google/Social, vos accès sensibles sont protégés par votre fournisseur d'identité."
            })
            processAfterReauth()
            return
        }

        if (!reauthPassword) {
            setReauthError("Mot de passe requis")
            return
        }

        setReauthLoading(true)
        setReauthError("")

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: profile.email || "",
                password: reauthPassword,
            })

            if (error) {
                setReauthError("Mot de passe incorrect")
                return
            }

            processAfterReauth()
        } catch (err) {
            console.error("Reauth error:", err)
            setReauthError("Erreur lors de la vérification")
        } finally {
            setReauthLoading(false)
        }
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
                sessionStorage.setItem("emiid_pin_verified", "true")
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
            setPendingAction("disable2fa")
            setIsConfirmOpen(true)
        }
    }

    const confirmDisable2fa = () => {
        setIsConfirmOpen(false)
        void saveSettings(
            { security_preferences: { two_factor_enabled: false } },
            "2FA désactivée"
        ).then((success) => {
            if (success) setSecuritySettings({ two_factor_enabled: false })
        })
    }

    const handleMfaEnroll = async () => {
        if (!mfaPhoneNumber) {
            toast.error("Veuillez entrer un numéro de téléphone")
            return
        }
        setMfaLoading(true)
        try {
            const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
                phone: mfaPhoneNumber,
                factorType: 'phone'
            })
            if (enrollError) throw enrollError
            setMfaFactorId(enrollData.id)

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
            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: mfaChallengeId,
                code: mfaCode
            })
            if (verifyError) throw verifyError

            const success = await saveSettings(
                { security_preferences: { two_factor_enabled: true } },
                "Authentification 2FA activée et vérifiée !"
            )

            if (success) {
                setSecuritySettings({ two_factor_enabled: true })
                setMfaDialogOpen(false)
                router.refresh()
            }
        } catch (error: any) {
            console.error("MFA Verification Error:", error)
            toast.error(error.message || "Code invalide ou expiré")
        } finally {
            setMfaLoading(false)
        }
    }

    const handleDeactivateAccount = () => {
        setPendingAction("deactivate")
        setIsConfirmOpen(true)
    }

    const confirmDeactivateAccount = async () => {
        setIsConfirmOpen(false)

        setAccountLoading(true)
        try {
            const res = await fetchWithAuth("/api/users/account/deactivate", { method: "POST" })
            if (!res.ok) {
                toast.error(await readApiError(res, "Impossible de désactiver le compte"))
                return
            }

            await supabase.auth.signOut()
            sessionStorage.removeItem("emiid_pin_verified")
            toast.success("Compte désactivé")
            router.push("/")
            router.refresh()
        } finally {
            setAccountLoading(false)
        }
    }

    const handleDeleteAccount = () => {
        setPendingAction("delete")
        setIsConfirmOpen(true)
    }

    const confirmDeleteAccount = async () => {
        setIsConfirmOpen(false)

        setAccountLoading(true)
        try {
            const res = await fetchWithAuth("/api/users/account", { method: "DELETE" })
            if (!res.ok) {
                toast.error(await readApiError(res, "Impossible de supprimer le compte"))
                return
            }

            await supabase.auth.signOut()
            sessionStorage.removeItem("emiid_pin_verified")
            toast.success("Compte supprimé")
            router.push("/")
            router.refresh()
        } finally {
            setAccountLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            sessionStorage.removeItem("emiid_pin_verified")
            toast.success("Vous êtes déconnecté")
            router.push("/login")
            router.refresh()
        } catch {
            toast.error("Impossible de se déconnecter")
        }
    }

    return (
        <div className="space-y-4">

            {/* ── Authentification & accès ────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-5">
                    Authentification et accès
                </h2>
                <div className="divide-y divide-slate-100">

                    {/* PIN toggle */}
                    <div className="flex items-start justify-between gap-4 py-4 first:pt-0">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <KeyRound className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">Verrouillage par Code PIN</p>
                                <p className="text-xs text-slate-500 mt-0.5">Sécurisez l&apos;accès au tableau de bord</p>
                                {profile.pin_enabled && (
                                    <button
                                        onClick={() => {
                                            setPendingAction("change")
                                            setReauthPassword("")
                                            setReauthError("")
                                            setReauthDialogOpen(true)
                                        }}
                                        className="mt-2 text-xs font-bold text-primary hover:underline underline-offset-2"
                                    >
                                        Modifier le code PIN
                                    </button>
                                )}
                            </div>
                        </div>
                        <Switch
                            className="shrink-0 mt-1"
                            checked={profile.pin_enabled}
                            onCheckedChange={handlePinToggle}
                        />
                    </div>

                    {/* 2FA toggle */}
                    <div className="flex items-start justify-between gap-4 py-4 last:pb-0">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Fingerprint className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">Authentification à deux facteurs (2FA)</p>
                                <p className="text-xs text-slate-500 mt-0.5">Code de validation via WhatsApp ou SMS</p>
                            </div>
                        </div>
                        <Switch
                            className="shrink-0 mt-1"
                            checked={securitySettings.two_factor_enabled}
                            onCheckedChange={(checked) => void handleTwoFactorToggle(checked)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Zone de danger ──────────────────────────────────────────────── */}
            <div className="bg-white border border-red-100 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Shield className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <h2 className="text-[11px] font-black text-red-400 uppercase tracking-wider">Zone de danger</h2>
                </div>
                <div className="divide-y divide-red-50">

                    {/* Désactiver */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                                <UserX className="h-4 w-4 text-red-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">Désactiver le compte</p>
                                <p className="text-xs text-slate-500 mt-0.5">Votre compte sera masqué et l&apos;accès bloqué</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => void handleDeactivateAccount()}
                            disabled={accountLoading}
                            className="w-full sm:w-auto shrink-0 h-9 rounded-xl border-red-200 text-red-600 bg-transparent hover:bg-red-50 hover:text-red-700 text-sm font-bold"
                        >
                            Désactiver
                        </Button>
                    </div>

                    {/* Supprimer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 last:pb-0">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">Supprimer le compte</p>
                                <p className="text-xs text-slate-500 mt-0.5">Suppression définitive de toutes vos données</p>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => void handleDeleteAccount()}
                            disabled={accountLoading}
                            className="w-full sm:w-auto shrink-0 h-9 rounded-xl text-sm font-bold"
                        >
                            Supprimer
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Session (mobile only — desktop has logout in sidebar) ────────── */}
            <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-4">Session</h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">Se déconnecter</p>
                        <p className="text-xs text-slate-500 mt-0.5">Fermer votre session sur cet appareil</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full sm:w-auto shrink-0 h-9 rounded-xl border-red-200 text-red-600 bg-transparent hover:bg-red-50 hover:text-red-700 text-sm font-bold gap-2"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Se déconnecter
                    </Button>
                </div>
            </div>

            {/* ── Dialogs (préservés intégralement) ──────────────────────────── */}

            <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{profile.pin_enabled ? "Nouveau Code PIN" : "Créer votre Code PIN"}</DialogTitle>
                        <DialogDescription>
                            {pinStep === "enter" ? "Saisissez un code à 6 chiffres" : "Confirmez votre code"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-6 py-4">
                        <InputOTP
                            id="create-pin-code"
                            name="create_pin_code"
                            autoComplete="one-time-code"
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
                                        name="tel"
                                        autoComplete="tel"
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
                            <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl w-full flex flex-col items-center gap-6 border border-slate-100">
                                <InputOTP
                                    id="mfa-verification-code"
                                    name="mfa_verification_code"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={mfaCode}
                                    onChange={(val) => setMfaCode(val)}
                                >
                                    <InputOTPGroup className="gap-1 sm:gap-2">
                                        <InputOTPSlot index={0} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={1} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={2} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={3} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={4} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-lg border-2" />
                                        <InputOTPSlot index={5} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-lg border-2" />
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

            <Dialog open={reauthDialogOpen} onOpenChange={setReauthDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Lock className="h-6 w-6 text-[#022753]" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-center text-[#022753]">
                            Vérification de sécurité
                        </DialogTitle>
                        <DialogDescription className="text-center px-4">
                            {profile.pin_enabled
                                ? "Pour modifier vos paramètres de sécurité sensibles, veuillez confirmer votre code PIN."
                                : "Pour modifier vos paramètres de sécurité sensibles, veuillez confirmer votre mot de passe EmiID."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(e) => void handleReauthSubmit(e)} className="space-y-6 py-4">
                        <div className="space-y-2">
                            {profile.pin_enabled ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Label htmlFor="reauth-pin">Votre code PIN</Label>
                                    <InputOTP
                                        id="reauth-pin-code"
                                        name="reauth_pin_code"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        value={reauthPin}
                                        onChange={setReauthPin}
                                    >
                                        <InputOTPGroup className="gap-1 sm:gap-2">
                                            <InputOTPSlot index={0} className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={1} className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={2} className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={3} className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={4} className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={5} className="w-8 h-10 sm:w-10 sm:h-12 rounded-lg border-gray-200" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            ) : (
                                <>
                                    <Label htmlFor="reauth-password">Mot de passe actuel</Label>
                                    <div className="relative">
                                        <Input
                                            id="reauth-password"
                                            name="current-password"
                                            autoComplete="current-password"
                                            type={showReauthPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={reauthPassword}
                                            onChange={(e) => setReauthPassword(e.target.value)}
                                            className="pr-10 rounded-xl h-12 border-slate-200 focus:border-[#022753] focus:ring-[#022753]/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowReauthPassword(!showReauthPassword)}
                                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showReauthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </>
                            )}
                            {reauthError && (
                                <p className="text-xs font-medium text-red-500 flex items-center justify-center gap-1 mt-2">
                                    <ShieldAlert size={12} /> {reauthError}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setReauthDialogOpen(false)}
                                className="flex-1 h-12 rounded-xl text-slate-500 hover:bg-slate-50"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={reauthLoading || (profile.pin_enabled ? reauthPin.length !== 6 : !reauthPassword)}
                                className="flex-[2] h-12 rounded-xl bg-[#022753] hover:bg-[#033a7a] text-white font-bold shadow-lg shadow-blue-900/10"
                            >
                                {reauthLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Vérification...
                                    </div>
                                ) : (
                                    "Confirmer"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmActionDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    if (pendingAction === "disable2fa") confirmDisable2fa()
                    else if (pendingAction === "deactivate") void confirmDeactivateAccount()
                    else if (pendingAction === "delete") void confirmDeleteAccount()
                }}
                variant={pendingAction === "delete" ? "destructive" : "warning"}
                title={
                    pendingAction === "disable2fa" ? "Désactiver la 2FA ?" :
                    pendingAction === "deactivate" ? "Désactiver le compte ?" :
                    "Supprimer le compte ?"
                }
                description={
                    pendingAction === "disable2fa" ? "Votre compte sera moins sécurisé. Voulez-vous continuer ?" :
                    pendingAction === "deactivate" ? "Votre profil ne sera plus visible. Vous pourrez le réactiver plus tard." :
                    "Cette action est irréversible. Toutes vos données seront définitivement supprimées."
                }
                confirmText={
                    pendingAction === "delete" ? "Supprimer définitivement" :
                    "Confirmer la désactivation"
                }
                isLoading={accountLoading}
            />

        </div>
    )
}

"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import { Eye, EyeOff, Lock, Phone, ShieldAlert, Smartphone } from "lucide-react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"

/**
 * Clé publique du widget Cloudflare Turnstile dédié à app.emiid.com, utilisé
 * pour la réauthentification par mot de passe. Distincte de la clé de
 * back-office (app-admin.emiid.com) — voir .env.example.
 */
const TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEtVxnGegPSU9qF-"

// ── PIN Creation / Change Dialog ─────────────────────────────────────────────

interface PinDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    pinEnabled: boolean
    pinStep: "enter" | "confirm"
    tempPin: string
    confirmPin: string
    pinError: string
    onTempPinChange: (val: string) => void
    onConfirmPinChange: (val: string) => void
    onPinErrorChange: (err: string) => void
    onSubmit: () => void
}

export function PinDialog({
    open, onOpenChange, pinEnabled, pinStep,
    tempPin, confirmPin, pinError,
    onTempPinChange, onConfirmPinChange, onPinErrorChange,
    onSubmit,
}: PinDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{pinEnabled ? "Nouveau Code PIN" : "Créer votre Code PIN"}</DialogTitle>
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
                            if (pinStep === "enter") onTempPinChange(val)
                            else onConfirmPinChange(val)
                            onPinErrorChange("")
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
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button onClick={onSubmit}>{pinStep === "enter" ? "Suivant" : "Confirmer"}</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── MFA Enrollment Dialog ────────────────────────────────────────────────────

interface MfaDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mfaStep: "phone" | "code"
    setMfaStep: (step: "phone" | "code") => void
    mfaPhoneNumber: string
    setMfaPhoneNumber: (val: string) => void
    mfaChannel: "whatsapp" | "sms"
    setMfaChannel: (ch: "whatsapp" | "sms") => void
    mfaCode: string
    setMfaCode: (val: string) => void
    mfaLoading: boolean
    onEnroll: () => void
    onVerify: () => void
}

export function MfaDialog({
    open, onOpenChange, mfaStep, setMfaStep,
    mfaPhoneNumber, setMfaPhoneNumber,
    mfaChannel, setMfaChannel,
    mfaCode, setMfaCode,
    mfaLoading, onEnroll, onVerify,
}: MfaDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl border border-border/80 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-[#013ff4]">
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
                            <Label htmlFor="mfa-phone">Numéro de téléphone (format international)</Label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="mfa-phone"
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
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                    mfaChannel === "whatsapp"
                                        ? "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 shadow-xs"
                                        : "border-border hover:border-border/80"
                                }`}
                            >
                                <Image src="/svg/whatsapp-logo.svg" width={24} height={24} className="mb-2" alt="WhatsApp" />
                                <span className="font-bold text-sm">WhatsApp</span>
                            </button>
                            <button
                                onClick={() => setMfaChannel("sms")}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                    mfaChannel === "sms"
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs"
                                        : "border-border hover:border-border/80"
                                }`}
                            >
                                <Phone className="h-6 w-6 mb-2" />
                                <span className="font-bold text-sm">SMS</span>
                            </button>
                        </div>

                        <Button
                            onClick={onEnroll}
                            disabled={mfaLoading || !mfaPhoneNumber}
                            className="w-full h-12 rounded-xl bg-[#013ff4] hover:bg-[#033a7a] font-bold shadow-md cursor-pointer"
                        >
                            {mfaLoading ? "Envoi en cours..." : "Recevoir le code"}
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8 py-6">
                        <div className="bg-muted/50 p-4 sm:p-6 rounded-2xl w-full flex flex-col items-center gap-6 border border-border/80">
                            <InputOTP
                                id="mfa-verification-code"
                                name="mfa_verification_code"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={mfaCode}
                                onChange={(val) => setMfaCode(val)}
                            >
                                <InputOTPGroup className="gap-1 sm:gap-2">
                                    <InputOTPSlot index={0} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-xl border-2" />
                                    <InputOTPSlot index={1} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-xl border-2" />
                                    <InputOTPSlot index={2} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-xl border-2" />
                                    <InputOTPSlot index={3} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-xl border-2" />
                                    <InputOTPSlot index={4} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-xl border-2" />
                                    <InputOTPSlot index={5} className="w-9 h-11 text-base sm:w-12 sm:h-14 sm:text-xl font-bold rounded-xl border-2" />
                                </InputOTPGroup>
                            </InputOTP>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Vous n&apos;avez rien reçu ?</p>
                                <button onClick={onEnroll} className="text-sm font-bold text-primary hover:underline cursor-pointer">
                                    Renvoyer le code
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full">
                            <Button variant="outline" onClick={() => setMfaStep("phone")} className="flex-1 h-12 rounded-xl">Retour</Button>
                            <Button
                                onClick={onVerify}
                                disabled={mfaLoading || mfaCode.length !== 6}
                                className="flex-[2] h-12 rounded-xl bg-green-600 hover:bg-green-700 font-bold shadow-md cursor-pointer"
                            >
                                {mfaLoading ? "Vérification..." : "Vérifier et activer"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

// ── Re-authentication Dialog ─────────────────────────────────────────────────

interface ReauthDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any
    reauthPin: string
    setReauthPin: (val: string) => void
    reauthPassword: string
    setReauthPassword: (val: string) => void
    showPassword: boolean
    setShowPassword: (val: boolean) => void
    reauthLoading: boolean
    reauthError: string
    captchaToken: string | null
    setCaptchaToken: (val: string | null) => void
    onSubmit: (e?: React.FormEvent) => void
}

export function ReauthDialog({
    open, onOpenChange, profile,
    reauthPin, setReauthPin,
    reauthPassword, setReauthPassword,
    showPassword, setShowPassword,
    reauthLoading, reauthError,
    captchaToken, setCaptchaToken,
    onSubmit,
}: ReauthDialogProps) {
    // Un jeton Turnstile est à usage unique : après tout échec (mot de passe
    // incorrect, captcha invalide), le widget doit en émettre un nouveau — sans
    // ce reset, il reste affiché en "Success" avec un jeton déjà rejeté et le
    // bouton reste bloqué jusqu'à rouvrir la boîte de dialogue.
    const turnstileRef = useRef<TurnstileInstance | undefined>(undefined)
    useEffect(() => {
        if (reauthError) turnstileRef.current?.reset()
    }, [reauthError])

    // Compte 100% social (pas de mot de passe) : la vérification anti-robot ne
    // s'applique qu'au vrai chemin mot de passe, cf. handleReauthSubmit.
    const isOAuthOnly = Boolean(profile.email) && !profile.has_password
    const isPasswordPath = !profile.pin_enabled && !isOAuthOnly

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl border border-border/80 shadow-2xl">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mb-4 shadow-2xs">
                        <Lock className="h-6 w-6 text-[#013ff4]" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center text-[#013ff4]">
                        Vérification de sécurité
                    </DialogTitle>
                    <DialogDescription className="text-center px-4">
                        {profile.pin_enabled
                            ? "Pour modifier vos paramètres de sécurité sensibles, veuillez confirmer votre code PIN."
                            : "Pour modifier vos paramètres de sécurité sensibles, veuillez confirmer votre mot de passe EmiID."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={(e) => void onSubmit(e)} className="space-y-6 py-4">
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
                                        <InputOTPSlot index={0} className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl border-border" />
                                        <InputOTPSlot index={1} className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl border-border" />
                                        <InputOTPSlot index={2} className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl border-border" />
                                        <InputOTPSlot index={3} className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl border-border" />
                                        <InputOTPSlot index={4} className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl border-border" />
                                        <InputOTPSlot index={5} className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl border-border" />
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
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={reauthPassword}
                                        onChange={(e) => setReauthPassword(e.target.value)}
                                        className="pr-10 rounded-xl h-12 border-border focus:border-[#013ff4] focus:ring-[#013ff4]/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {isPasswordPath && (
                                    <div className="flex justify-center pt-2">
                                        <Turnstile
                                            ref={turnstileRef}
                                            siteKey={TURNSTILE_SITE_KEY}
                                            onSuccess={(token) => setCaptchaToken(token)}
                                            onError={() => setCaptchaToken(null)}
                                            onExpire={() => setCaptchaToken(null)}
                                        />
                                    </div>
                                )}
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
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 rounded-xl text-muted-foreground hover:bg-muted font-bold"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                reauthLoading ||
                                (profile.pin_enabled
                                    ? reauthPin.length !== 6
                                    : isPasswordPath
                                        ? !reauthPassword || !captchaToken
                                        : !reauthPassword)
                            }
                            className="flex-[2] h-12 rounded-xl bg-[#013ff4] hover:bg-[#033a7a] text-white font-bold shadow-md cursor-pointer"
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
    )
}

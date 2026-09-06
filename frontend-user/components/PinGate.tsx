/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant PinGate pour la protection par code PIN avec récupération par OTP email (Reauthentication Supabase)
 * @created 2025-12-24
 * @updated 2026-05-27
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { fetchWithAuth } from "@/lib/apiClient"
import { createClient } from "@/lib/supabase/client"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Lock, Mail, KeyRound, Loader2, ShieldCheck } from "lucide-react"

export function PinGate({ children }: { children: React.ReactNode }) {
    const [locked, setLocked] = useState(false)
    const [checkError, setCheckError] = useState(false)
    const [isHardLocked, setIsHardLocked] = useState(false)
    const [pin, setPin] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    
    // Recovery states — flow en 4 étapes : none → request → otp → success
    const [recoveryStep, setRecoveryStep] = useState<"none" | "request" | "otp" | "success">("none")
    const [recoveryLoading, setRecoveryLoading] = useState(false)
    const [otpCode, setOtpCode] = useState("")

    const router = useRouter()
    const pathname = usePathname()

    const checkPinStatus = async () => {
        // 1. Vérification session (évite l'appel API si déjà vérifié)
        if (typeof window !== "undefined") {
            const verified = sessionStorage.getItem("emiid_pin_verified")
            if (verified === "true") {
                setLocked(false)
                setLoading(false)
                return
            }
        }

        // 2. Vérification DB
        try {
            setCheckError(false)
            const res = await fetchWithAuth("/api/users/me")
            if (res.ok) {
                const user = await res.json()
                if (user.is_locked) {
                    setIsHardLocked(true)
                    setLocked(true)
                } else if (user.pin_enabled) {
                    setLocked(true)
                } else {
                    setLocked(false)
                }
            } else {
                // Statut PIN indéterminé (backend indisponible, session expirée...) :
                // on refuse fermé plutôt que d'accorder l'accès par défaut.
                setCheckError(true)
            }
        } catch (error) {
            console.error("Erreur vérification PIN:", error)
            setCheckError(true)
        } finally {
            setLoading(false)
        }
    }

    // Vérifier à chaque changement de route ou montage
    useEffect(() => {
        checkPinStatus()
    }, [pathname])

    const handleVerify = async (value: string) => {
        setPin(value)
        setError("")
        if (value.length !== 6) return

        try {
            const res = await fetchWithAuth("/api/users/verify-pin", {
                method: "POST",
                body: JSON.stringify({ pin: value })
            })
            const data = await res.json()

            if (res.ok && data.success) {
                sessionStorage.setItem("emiid_pin_verified", "true")
                setLocked(false)
                setIsHardLocked(false)
            } else {
                if (data.is_locked) {
                    setIsHardLocked(true)
                }
                setError(data.error || "Code incorrect")
                setPin("")
            }
        } catch {
            setError("Erreur de connexion")
        }
    }

    // Étape 1 : Envoyer un OTP par email via supabase.auth.reauthenticate()
    const handleRequestRecovery = async () => {
        setRecoveryLoading(true)
        setError("")
        try {
            const supabase = createClient()

            // reauthenticate() envoie un code OTP 6 chiffres à l'email de l'utilisateur connecté
            const { error: reauthError } = await supabase.auth.reauthenticate()

            if (reauthError) {
                setError("Impossible d'envoyer le code de vérification. Réessayez.")
                console.error("Reauthenticate error:", reauthError)
                return
            }

            setRecoveryStep("otp")
            setOtpCode("")
        } catch {
            setError("Erreur inattendue. Veuillez réessayer.")
        } finally {
            setRecoveryLoading(false)
        }
    }

    // Étape 2 : Vérifier le nonce OTP et réinitialiser le PIN
    const handleVerifyOtpAndResetPin = async (code: string) => {
        setOtpCode(code)
        if (code.length !== 8) return

        setRecoveryLoading(true)
        setError("")
        try {
            const supabase = createClient()

            // Le nonce est passé via updateUser pour prouver l'identité
            // On utilise un champ quelconque qui ne change rien pour valider le nonce
            const { error: verifyError } = await supabase.auth.updateUser({
                nonce: code,
                data: { pin_reset_verified: true }
            })

            if (verifyError) {
                setError("Code incorrect ou expiré. Veuillez réessayer.")
                setOtpCode("")
                return
            }

            // Nonce vérifié → appeler l'API backend pour réinitialiser le PIN
            const res = await fetchWithAuth("/api/users/reset-pin", {
                method: "POST"
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.error || "Erreur lors de la réinitialisation du PIN")
                return
            }

            // Succès complet
            sessionStorage.setItem("emiid_pin_verified", "true")
            setRecoveryStep("success")
        } catch (err) {
            console.error("Erreur détaillée lors de la vérification:", err)
            setError(`Erreur inattendue: ${err instanceof Error ? err.message : "Veuillez réessayer."}`)
        } finally {
            setRecoveryLoading(false)
        }
    }

    if (loading) {
        // Écran de chargement minimaliste pour éviter le flash
        return (
            <div className="flex h-screen w-full items-center justify-center bg-card">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#013ff4] border-t-transparent" />
            </div>
        )
    }

    if (checkError) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-card/80 backdrop-blur-md">
                <div className="bg-card border border-red-100 shadow-2xl p-8 rounded-2xl flex flex-col items-center gap-6 max-w-sm w-full">
                    <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
                        <Lock className="h-7 w-7 text-red-600" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-red-600">Vérification impossible</h2>
                        <p className="text-sm text-gray-500">
                            Impossible de confirmer votre sécurité pour le moment. Par précaution, l&apos;accès reste bloqué. Vérifiez votre connexion et réessayez.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 w-full">
                        <Button
                            className="w-full h-11 rounded-xl bg-[#013ff4] hover:bg-[#033a7a]"
                            onClick={() => { setLoading(true); void checkPinStatus() }}
                        >
                            Réessayer
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-gray-400 hover:text-gray-600 font-normal text-xs mt-2"
                            onClick={async () => {
                                const supabase = createClient()
                                await supabase.auth.signOut()
                                sessionStorage.removeItem("emiid_pin_verified")
                                router.push('/')
                            }}
                        >
                            Retour à l&apos;accueil
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (locked) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-card/80 backdrop-blur-md">
                <div className="bg-card border border-gray-100 shadow-2xl p-8 rounded-2xl flex flex-col items-center gap-6 max-w-sm w-full animate-in zoom-in-95 duration-300">
                    
                    {recoveryStep === "none" ? (
                        <>
                            <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-2 ${isHardLocked ? 'bg-red-50' : 'bg-[#013ff4]/5'}`}>
                                <Lock className={`h-7 w-7 ${isHardLocked ? 'text-red-600' : 'text-[#013ff4]'}`} />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className={`text-xl font-bold ${isHardLocked ? 'text-red-600' : 'text-[#013ff4]'}`}>
                                    {isHardLocked ? "Compte Bloqué" : "Sécurité EmiID"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {isHardLocked 
                                        ? "Suite à 3 tentatives infructueuses, votre compte est temporairement verrouillé par sécurité." 
                                        : "Veuillez confirmer votre identité"}
                                </p>
                            </div>

                            {!isHardLocked && (
                                <div className="w-full flex flex-col items-center gap-4">
                                    <InputOTP
                                        id="pin-gate-code"
                                        name="pin_gate_code"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        value={pin}
                                        onChange={handleVerify}
                                    >
                                        <InputOTPGroup className="gap-2">
                                            <InputOTPSlot index={0} className="w-10 h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={1} className="w-10 h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={2} className="w-10 h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={3} className="w-10 h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={4} className="w-10 h-12 rounded-lg border-gray-200" />
                                            <InputOTPSlot index={5} className="w-10 h-12 rounded-lg border-gray-200" />
                                        </InputOTPGroup>
                                    </InputOTP>

                                    <div className="h-6">
                                        {error && (
                                            <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 text-center">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-3 w-full">
                                <button
                                    onClick={() => { setRecoveryStep("request"); setError(""); }}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                >
                                    Code PIN oublié ?
                                </button>
                                
                                <Button
                                    variant="ghost"
                                    className="text-gray-400 hover:text-gray-600 font-normal text-xs mt-2"
                                    onClick={async () => {
                                        const supabase = createClient()
                                        await supabase.auth.signOut()
                                        sessionStorage.removeItem("emiid_pin_verified")
                                        router.push('/')
                                    }}
                                >
                                    Retour à l&apos;accueil
                                </Button>
                            </div>
                        </>
                    ) : recoveryStep === "request" ? (
                        <>
                            <div className="h-16 w-16 rounded-full bg-[#013ff4]/5 flex items-center justify-center mb-2">
                                <KeyRound className="h-7 w-7 text-[#013ff4]" />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-[#013ff4]">
                                    Code PIN oublié ?
                                </h2>
                                <p className="text-sm text-gray-500 px-2 leading-relaxed">
                                    Nous allons envoyer un <span className="font-semibold text-[#013ff4]">code de vérification</span> sur votre adresse e-mail pour confirmer votre identité et réinitialiser votre code PIN.
                                </p>
                            </div>

                            <div className="w-full flex flex-col gap-3">
                                {error && (
                                    <p className="text-xs font-medium text-red-500 text-center">
                                        {error}
                                    </p>
                                )}
                                <Button 
                                    onClick={() => void handleRequestRecovery()}
                                    disabled={recoveryLoading}
                                    className="w-full h-11 rounded-xl bg-[#013ff4] hover:bg-[#033a7a]"
                                >
                                    {recoveryLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Envoi en cours...
                                        </div>
                                    ) : (
                                        "Recevoir le code par e-mail"
                                    )}
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setRecoveryStep("none")
                                        setError("")
                                    }}
                                    className="text-xs text-gray-500"
                                >
                                    Annuler
                                </Button>
                            </div>
                        </>
                    ) : recoveryStep === "otp" ? (
                        <>
                            <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                                <Mail className="h-7 w-7 text-indigo-600" />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-[#013ff4]">
                                    Vérification par e-mail
                                </h2>
                                <p className="text-sm text-gray-500 px-2 leading-relaxed">
                                    Un code de vérification a été envoyé sur votre adresse e-mail. Saisissez-le ci-dessous pour réinitialiser votre PIN.
                                </p>
                            </div>

                            <div className="w-full flex flex-col items-center gap-4">
                                <InputOTP
                                    id="recovery-otp-code"
                                    name="recovery_otp_code"
                                    autoComplete="one-time-code"
                                    maxLength={8}
                                    value={otpCode}
                                    onChange={handleVerifyOtpAndResetPin}
                                >
                                    <InputOTPGroup className="gap-1">
                                        <InputOTPSlot index={0} className="w-9 h-12 rounded-lg border-indigo-200 focus:border-indigo-500" />
                                        <InputOTPSlot index={1} className="w-9 h-12 rounded-lg border-indigo-200 focus:border-indigo-500" />
                                        <InputOTPSlot index={2} className="w-9 h-12 rounded-lg border-indigo-200 focus:border-indigo-500" />
                                        <InputOTPSlot index={3} className="w-9 h-12 rounded-lg border-indigo-200 focus:border-indigo-500" />
                                        <InputOTPSlot index={4} className="w-9 h-12 rounded-lg border-indigo-200 focus:border-indigo-500" />
                                        <InputOTPSlot index={5} className="w-9 h-12 rounded-lg border-indigo-200 focus:border-indigo-500" />
                                        <InputOTPSlot index={6} className="w-9 h-12 rounded-lg border-indigo-200 focus:border-indigo-500" />
                                        <InputOTPSlot index={7} className="w-9 h-12 rounded-lg border-indigo-200 focus:border-indigo-500" />
                                    </InputOTPGroup>
                                </InputOTP>

                                {recoveryLoading && (
                                    <div className="flex items-center gap-2 text-sm text-indigo-600">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Vérification en cours...
                                    </div>
                                )}

                                <div className="h-6">
                                    {error && (
                                        <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 text-center">
                                            {error}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-2">
                                <Button
                                    variant="ghost"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-semibold"
                                    onClick={() => void handleRequestRecovery()}
                                    disabled={recoveryLoading}
                                >
                                    {recoveryLoading ? "Envoi..." : "Renvoyer le code"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setRecoveryStep("none")
                                        setError("")
                                        setOtpCode("")
                                    }}
                                    className="text-xs text-gray-500"
                                >
                                    Annuler
                                </Button>
                            </div>
                        </>
                    ) : (
                        /* recoveryStep === "success" */
                        <>
                            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                                <ShieldCheck className="h-7 w-7 text-emerald-600" />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-emerald-600">
                                    PIN réinitialisé !
                                </h2>
                                <p className="text-sm text-gray-500 px-2 leading-relaxed">
                                    Votre code PIN a été désactivé avec succès. Vous pouvez en créer un nouveau depuis vos paramètres de sécurité.
                                </p>
                            </div>

                            <Button
                                onClick={() => {
                                    setLocked(false)
                                    setRecoveryStep("none")
                                    setError("")
                                }}
                                className="w-full h-11 rounded-xl bg-[#013ff4] hover:bg-[#033a7a]"
                            >
                                Continuer
                            </Button>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return <>{children}</>
}


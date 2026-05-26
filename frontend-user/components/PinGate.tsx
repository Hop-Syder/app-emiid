/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant PinGate pour la protection par code PIN avec récupération par e-mail
 * @created 2025-12-24
 * @updated 2026-05-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { fetchWithAuth } from "@/lib/apiClient"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Lock, Mail, KeyRound, Loader2 } from "lucide-react"

export function PinGate({ children }: { children: React.ReactNode }) {
    const [locked, setLocked] = useState(false)
    const [isHardLocked, setIsHardLocked] = useState(false)
    const [pin, setPin] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    
    // Recovery states
    const [recoveryStep, setRecoveryStep] = useState<"none" | "request" | "verify">("none")
    const [recoveryCode, setRecoveryCode] = useState("")
    const [recoveryLoading, setRecoveryLoading] = useState(false)

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
            }
        } catch (error) {
            console.error("Erreur vérification PIN:", error)
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

    const handleRequestRecovery = async () => {
        setRecoveryLoading(true)
        setError("")
        try {
            const res = await fetchWithAuth("/api/users/forgot-pin/request", {
                method: "POST"
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setRecoveryStep("verify")
                setRecoveryCode("")
            } else {
                setError(data.error || "Impossible d'envoyer le code de récupération")
            }
        } catch {
            setError("Erreur de connexion")
        } finally {
            setRecoveryLoading(false)
        }
    }

    const handleVerifyRecovery = async (codeValue: string) => {
        setRecoveryCode(codeValue)
        setError("")
        if (codeValue.length !== 6) return

        setRecoveryLoading(true)
        try {
            const res = await fetchWithAuth("/api/users/forgot-pin/verify", {
                method: "POST",
                body: JSON.stringify({ code: codeValue })
            })
            const data = await res.json()

            if (res.ok && data.success) {
                sessionStorage.setItem("emiid_pin_verified", "true")
                setLocked(false)
                setIsHardLocked(false)
                setRecoveryStep("none")
                router.refresh()
            } else {
                setError(data.error || "Code incorrect")
                setRecoveryCode("")
            }
        } catch {
            setError("Erreur de connexion")
        } finally {
            setRecoveryLoading(false)
        }
    }

    if (loading) {
        // Écran de chargement minimaliste pour éviter le flash
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#022753] border-t-transparent" />
            </div>
        )
    }

    if (locked) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md">
                <div className="bg-white border border-gray-100 shadow-2xl p-8 rounded-2xl flex flex-col items-center gap-6 max-w-sm w-full animate-in zoom-in-95 duration-300">
                    
                    {recoveryStep === "none" ? (
                        <>
                            <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-2 ${isHardLocked ? 'bg-red-50' : 'bg-[#022753]/5'}`}>
                                <Lock className={`h-7 w-7 ${isHardLocked ? 'text-red-600' : 'text-[#022753]'}`} />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className={`text-xl font-bold ${isHardLocked ? 'text-red-600' : 'text-[#022753]'}`}>
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
                                    onClick={() => setRecoveryStep("request")}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                >
                                    Code PIN oublié ?
                                </button>
                                
                                <Button
                                    variant="ghost"
                                    className="text-gray-400 hover:text-gray-600 font-normal text-xs mt-2"
                                    onClick={() => {
                                        router.push('/')
                                    }}
                                >
                                    Retour à l&apos;accueil
                                </Button>
                            </div>
                        </>
                    ) : recoveryStep === "request" ? (
                        <>
                            <div className="h-16 w-16 rounded-full bg-[#022753]/5 flex items-center justify-center mb-2">
                                <KeyRound className="h-7 w-7 text-[#022753]" />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-[#022753]">
                                    Code PIN oublié ?
                                </h2>
                                <p className="text-sm text-gray-500 px-2 leading-relaxed">
                                    Nous allons envoyer un code de validation à usage unique sur votre adresse e-mail pour désactiver votre code PIN.
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
                                    className="w-full h-11 rounded-xl bg-[#022753] hover:bg-[#033a7a]"
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
                    ) : (
                        <>
                            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                                <Mail className="h-7 w-7 text-[#022753]" />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-[#022753]">
                                    Vérification E-mail
                                </h2>
                                <p className="text-sm text-gray-500 px-2">
                                    Saisissez le code à 6 chiffres reçu par e-mail.
                                </p>
                            </div>

                            <div className="w-full flex flex-col items-center gap-4">
                                <InputOTP
                                    id="recovery-otp-code"
                                    name="recovery_otp_code"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={recoveryCode}
                                    onChange={handleVerifyRecovery}
                                    disabled={recoveryLoading}
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

                            <div className="w-full flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11 rounded-xl"
                                    onClick={() => {
                                        setRecoveryStep("request")
                                        setError("")
                                    }}
                                    disabled={recoveryLoading}
                                >
                                    Retour
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="flex-1 h-11 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-semibold"
                                    onClick={() => void handleRequestRecovery()}
                                    disabled={recoveryLoading}
                                >
                                    Renvoyer
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return <>{children}</>
}

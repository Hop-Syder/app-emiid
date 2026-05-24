/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant PinGate pour la protection par code PIN
 * @created 2025-12-24
 * @updated 2026-05-24
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/
"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { fetchWithAuth } from "@/lib/apiClient"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

export function PinGate({ children }: { children: React.ReactNode }) {
    const [locked, setLocked] = useState(false)
    const [isHardLocked, setIsHardLocked] = useState(false)
    const [pin, setPin] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
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
                <div className="bg-white border border-gray-100 shadow-2xl p-8 rounded-xl flex flex-col items-center gap-6 max-w-sm w-full animate-in zoom-in-95 duration-300">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-2 ${isHardLocked ? 'bg-red-50' : 'bg-[#022753]/5'}`}>
                        <Lock className={`h-7 w-7 ${isHardLocked ? 'text-red-600' : 'text-[#022753]'}`} />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className={`text-xl font-bold ${isHardLocked ? 'text-red-600' : 'text-[#022753]'}`}>
                            {isHardLocked ? "Compte Bloqué" : "Sécurité EmiID"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isHardLocked 
                                ? "Suite à 3 tentatives infructueuses, votre compte est verrouillé par sécurité. Veuillez contacter l'administrateur." 
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
                                    <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                                        {error}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        className="text-gray-400 hover:text-gray-600 font-normal text-xs"
                        onClick={() => {
                            // Logout si bloqué ou veut partir
                            router.push('/')
                        }}
                    >
                        Retour à l&apos;accueil
                    </Button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook de sécurité pour piloter la double authentification, le code PIN et la suppression/désactivation de compte.
 * @created 2026-07-13
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth, readApiError } from "@/lib/apiClient"
import { toast } from "sonner"
import type { UserProfileData } from "./use-settings"

export interface SecuritySectionHookProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
  securitySettings: { two_factor_enabled: boolean }
  setSecuritySettings: (settings: { two_factor_enabled: boolean }) => void
  saveSettings: (payload: {
    security_preferences?: { two_factor_enabled: boolean }
  }, successMessage: string) => Promise<boolean>
}

export type PendingActionType = "enable" | "disable" | "change" | "disable2fa" | "deactivate" | "delete" | null

export function useSecuritySection({
  profile,
  setProfile,
  setSecuritySettings,
  saveSettings,
}: SecuritySectionHookProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const isMountedRef = useRef(true)

  // PIN state
  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const [pinStep, setPinStep] = useState<"enter" | "confirm">("enter")
  const [tempPin, setTempPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinError, setPinError] = useState("")

  // MFA state
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false)
  const [mfaStep, setMfaStep] = useState<"phone" | "code">("phone")
  const [mfaPhoneNumber, setMfaPhoneNumber] = useState("")
  const [mfaChannel, setMfaChannel] = useState<"whatsapp" | "sms">("whatsapp")
  const [mfaCode, setMfaCode] = useState("")
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState("")
  const [mfaChallengeId, setMfaChallengeId] = useState("")

  // Reauth state
  const [reauthDialogOpen, setReauthDialogOpen] = useState(false)
  const [reauthPassword, setReauthPassword] = useState("")
  const [reauthPin, setReauthPin] = useState("")
  const [showReauthPassword, setShowReauthPassword] = useState(false)
  const [reauthLoading, setReauthLoading] = useState(false)
  const [reauthError, setReauthError] = useState("")
  const [pendingAction, setPendingAction] = useState<PendingActionType>(null)

  // Confirm dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [accountLoading, setAccountLoading] = useState(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const disablePin = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/users/me", { method: "PUT", body: JSON.stringify({ ...profile, pin_enabled: false }) })
      if (!isMountedRef.current) return
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
  }, [profile, setProfile])

  const confirmDisable2fa = useCallback(async () => {
    setIsConfirmOpen(false)
    const success = await saveSettings({ security_preferences: { two_factor_enabled: false } }, "Double authentification désactivée")
    if (success && isMountedRef.current) {
      setSecuritySettings({ two_factor_enabled: false })
    }
  }, [saveSettings, setSecuritySettings])

  const processAfterReauth = useCallback(async () => {
    if (!isMountedRef.current) return
    setReauthDialogOpen(false)
    if (pendingAction === "enable" || pendingAction === "change") {
      setPinStep("enter")
      setTempPin("")
      setConfirmPin("")
      setPinError("")
      setPinDialogOpen(true)
    } else if (pendingAction === "disable") {
      void disablePin()
    } else if (pendingAction === "disable2fa") {
      setIsConfirmOpen(true)
    } else if (pendingAction === "deactivate") {
      setIsConfirmOpen(true)
    } else if (pendingAction === "delete") {
      setIsConfirmOpen(true)
    }
    setPendingAction(null)
  }, [pendingAction, disablePin])

  const handlePinToggle = useCallback((checked: boolean) => {
    setReauthPassword("")
    setReauthPin("")
    setReauthError("")
    if (checked) {
      setPendingAction("enable")
      setPinStep("enter")
      setTempPin("")
      setConfirmPin("")
      setPinError("")
      setPinDialogOpen(true)
    } else {
      setPendingAction("disable")
      setReauthDialogOpen(true)
    }
  }, [])

  const handleReauthSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (profile.pin_enabled) {
      if (!reauthPin || reauthPin.length !== 6) {
        setReauthError("Code PIN complet requis")
        return
      }
      setReauthLoading(true)
      setReauthError("")
      try {
        const res = await fetchWithAuth("/api/users/verify-pin", { method: "POST", body: JSON.stringify({ pin: reauthPin }) })
        if (!isMountedRef.current) return
        const data = await res.json()
        if (res.ok && data.success) {
          void processAfterReauth()
        } else {
          setReauthError(data.error || "Code PIN incorrect")
        }
      } catch {
        setReauthError("Erreur de connexion")
      } finally {
        if (isMountedRef.current) {
          setReauthLoading(false)
        }
      }
      return
    }

    const isOAuth = profile.email && !profile.has_password
    if (isOAuth) {
      toast.info("Re-vérification simplifiée pour compte social", {
        description: "En tant qu'utilisateur Google/Social, vos accès sensibles sont protégés par votre fournisseur d'identité."
      })
      void processAfterReauth()
      return
    }

    if (!reauthPassword) {
      setReauthError("Mot de passe requis")
      return
    }
    setReauthLoading(true)
    setReauthError("")
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: profile.email || "", password: reauthPassword })
      if (error) {
        setReauthError("Mot de passe incorrect")
        return
      }
      void processAfterReauth()
    } catch (err) {
      console.error("Reauth error:", err)
      setReauthError("Erreur lors de la vérification")
    } finally {
      if (isMountedRef.current) {
        setReauthLoading(false)
      }
    }
  }, [profile, reauthPin, reauthPassword, processAfterReauth, supabase])

  const handlePinSubmit = useCallback(async () => {
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
      if (!isMountedRef.current) return
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
  }, [pinStep, tempPin, confirmPin, profile, setProfile])

  const handleTwoFactorToggle = useCallback((checked: boolean) => {
    if (checked) {
      setMfaStep("phone")
      setMfaPhoneNumber("")
      setMfaCode("")
      setMfaDialogOpen(true)
    } else {
      setPendingAction("disable2fa")
      setReauthPassword("")
      setReauthPin("")
      setReauthError("")
      setReauthDialogOpen(true)
    }
  }, [])

  const handleMfaEnroll = useCallback(async () => {
    if (!mfaPhoneNumber) {
      toast.error("Veuillez entrer un numéro de téléphone")
      return
    }
    setMfaLoading(true)
    try {
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        phone: mfaPhoneNumber,
        factorType: "phone",
      })
      if (enrollError) throw enrollError
      if (!isMountedRef.current) return

      setMfaFactorId(enrollData.id)

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.id,
      })
      if (challengeError) throw challengeError

      if (!isMountedRef.current) return
      setMfaChallengeId(challengeData.id)
      setMfaStep("code")
      toast.success(`Code envoyé par ${mfaChannel === "whatsapp" ? "WhatsApp" : "SMS"}`)
    } catch (error: any) {
      console.error("MFA Enrollment Error:", error)
      toast.error(error.message || "Erreur lors de l'envoi du code")
    } finally {
      if (isMountedRef.current) {
        setMfaLoading(false)
      }
    }
  }, [mfaPhoneNumber, mfaChannel, supabase])

  const handleMfaVerify = useCallback(async () => {
    if (mfaCode.length < 6) {
      toast.error("Veuillez entrer le code complet (6 chiffres)")
      return
    }
    setMfaLoading(true)
    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: mfaCode,
      })
      if (verifyError) throw verifyError

      if (!isMountedRef.current) return

      const success = await saveSettings({ security_preferences: { two_factor_enabled: true } }, "Authentification 2FA activée et vérifiée !")
      if (success && isMountedRef.current) {
        setSecuritySettings({ two_factor_enabled: true })
        setMfaDialogOpen(false)
        router.refresh()
      }
    } catch (error: any) {
      console.error("MFA Verification Error:", error)
      toast.error(error.message || "Code invalide ou expiré")
    } finally {
      if (isMountedRef.current) {
        setMfaLoading(false)
      }
    }
  }, [mfaCode, mfaFactorId, mfaChallengeId, saveSettings, setSecuritySettings, router])

  const handleDeactivateAccount = useCallback(() => {
    setPendingAction("deactivate")
    setReauthPassword("")
    setReauthPin("")
    setReauthError("")
    setReauthDialogOpen(true)
  }, [])

  const handleDeleteAccount = useCallback(() => {
    setPendingAction("delete")
    setReauthPassword("")
    setReauthPin("")
    setReauthError("")
    setReauthDialogOpen(true)
  }, [])

  const confirmDeactivateAccount = useCallback(async () => {
    setIsConfirmOpen(false)
    setAccountLoading(true)
    try {
      const res = await fetchWithAuth("/api/users/account/deactivate", { method: "POST" })
      if (!isMountedRef.current) return
      if (!res.ok) {
        toast.error(await readApiError(res, "Impossible de désactiver le compte"))
        return
      }
      await supabase.auth.signOut()
      sessionStorage.removeItem("emiid_pin_verified")
      toast.success("Compte désactivé")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Erreur réseau")
    } finally {
      if (isMountedRef.current) {
        setAccountLoading(false)
      }
    }
  }, [supabase, router])

  const confirmDeleteAccount = useCallback(async () => {
    setIsConfirmOpen(false)
    setAccountLoading(true)
    try {
      const res = await fetchWithAuth("/api/users/account", { method: "DELETE" })
      if (!isMountedRef.current) return
      if (!res.ok) {
        toast.error(await readApiError(res, "Impossible de supprimer le compte"))
        return
      }
      await supabase.auth.signOut()
      sessionStorage.removeItem("emiid_pin_verified")
      toast.success("Compte supprimé")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Erreur réseau")
    } finally {
      if (isMountedRef.current) {
        setAccountLoading(false)
      }
    }
  }, [supabase, router])

  return {
    pinDialogOpen,
    setPinDialogOpen,
    pinStep,
    setPinStep,
    tempPin,
    setTempPin,
    confirmPin,
    setConfirmPin,
    pinError,
    setPinError,
    mfaDialogOpen,
    setMfaDialogOpen,
    mfaStep,
    setMfaStep,
    mfaPhoneNumber,
    setMfaPhoneNumber,
    mfaChannel,
    setMfaChannel,
    mfaCode,
    setMfaCode,
    mfaLoading,
    reauthDialogOpen,
    setReauthDialogOpen,
    reauthPassword,
    setReauthPassword,
    reauthPin,
    setReauthPin,
    showReauthPassword,
    setShowReauthPassword,
    reauthLoading,
    reauthError,
    pendingAction,
    setPendingAction,
    isConfirmOpen,
    setIsConfirmOpen,
    accountLoading,
    handlePinToggle,
    handlePinSubmit,
    handleTwoFactorToggle,
    handleMfaEnroll,
    handleMfaVerify,
    handleReauthSubmit,
    handleDeactivateAccount,
    handleDeleteAccount,
    confirmDisable2fa,
    confirmDeactivateAccount,
    confirmDeleteAccount,
  }
}

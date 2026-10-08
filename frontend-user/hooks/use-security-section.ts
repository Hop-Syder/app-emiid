/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook de l'onglet Sécurité : double authentification TOTP
 *              (Google / Microsoft Authenticator), code PIN, désactivation et
 *              suppression du compte.
 *
 *              Toute action sensible passe d'abord par une vérification
 *              d'identité (IdentityCheckDialog). Pour le PIN, le backend exige
 *              la même preuve : ancien PIN, ou code TOTP saisi il y a moins de
 *              5 minutes (cf. POST /api/users/pin et /api/users/pin/disable).
 * @created 2026-07-13
 * @updated 2026-10-08
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
import type { IdentityMethod } from "@/components/parametre-content/security-dialogs"

export type SensitiveAction = "pin-change" | "pin-disable" | "totp-disable" | "deactivate" | "delete"

const ACTION_TITLE: Record<SensitiveAction, string> = {
  "pin-change": "Modifier le code PIN",
  "pin-disable": "Désactiver le code PIN",
  "totp-disable": "Désactiver la double authentification",
  deactivate: "Désactiver le compte",
  delete: "Supprimer le compte",
}

interface SecuritySectionHookProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
}

export function useSecuritySection({ profile, setProfile }: SecuritySectionHookProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // ── 2FA : état réel lu dans Supabase Auth (et non un simple drapeau) ──────
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null)
  const [totpLoading, setTotpLoading] = useState(true)

  const refreshFactors = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors()
    if (!isMountedRef.current) return
    setTotpFactorId(data?.totp?.find((f) => f.status === "verified")?.id ?? null)
    setTotpLoading(false)
  }, [supabase])

  useEffect(() => {
    void refreshFactors()
  }, [refreshFactors])

  // ── Enrôlement TOTP ────────────────────────────────────────────────────────
  const [enroll, setEnroll] = useState<{ open: boolean; factorId: string | null; qrCode: string | null; secret: string | null }>(
    { open: false, factorId: null, qrCode: null, secret: null },
  )
  const [enrollLoading, setEnrollLoading] = useState(false)

  const startTotpEnroll = useCallback(async () => {
    setEnroll({ open: true, factorId: null, qrCode: null, secret: null })
    // Un enrôlement abandonné laisse un facteur « unverified » qui bloquerait
    // le suivant (nom en double) : on fait le ménage avant d'en créer un.
    const { data: existing } = await supabase.auth.mfa.listFactors()
    await Promise.all(
      (existing?.all ?? [])
        .filter((f) => f.factor_type === "totp" && f.status !== "verified")
        .map((f) => supabase.auth.mfa.unenroll({ factorId: f.id })),
    )
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "EmiID" })
    if (!isMountedRef.current) return
    if (error || !data) {
      toast.error(error?.message || "Impossible de démarrer l'activation")
      setEnroll((e) => ({ ...e, open: false }))
      return
    }
    setEnroll({ open: true, factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret })
  }, [supabase])

  const verifyTotpEnroll = useCallback(async (code: string): Promise<boolean> => {
    if (!enroll.factorId) return false
    setEnrollLoading(true)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.factorId, code })
    if (!isMountedRef.current) return false
    setEnrollLoading(false)
    if (error) {
      toast.error("Code incorrect ou expiré")
      return false
    }
    setEnroll({ open: false, factorId: null, qrCode: null, secret: null })
    await refreshFactors()
    toast.success("Double authentification activée")
    router.refresh()
    return true
  }, [enroll.factorId, supabase, refreshFactors, router])

  const closeEnroll = useCallback((open: boolean) => {
    if (open) return
    // Fermer sans valider : on retire le facteur inachevé.
    if (enroll.factorId) void supabase.auth.mfa.unenroll({ factorId: enroll.factorId })
    setEnroll({ open: false, factorId: null, qrCode: null, secret: null })
  }, [enroll.factorId, supabase])

  // ── Vérification d'identité ────────────────────────────────────────────────
  const [pendingAction, setPendingAction] = useState<SensitiveAction | null>(null)
  const [identityLoading, setIdentityLoading] = useState(false)
  const [identityError, setIdentityError] = useState("")
  /** PIN actuel validé — transmis au backend comme preuve pour changer le PIN. */
  const provenPinRef = useRef<string | undefined>(undefined)

  /** Méthodes acceptées pour une action donnée, par ordre de préférence. */
  const methodsFor = useCallback((action: SensitiveAction): IdentityMethod[] => {
    const m: IdentityMethod[] = []
    if (totpFactorId) m.push("totp")
    if (action === "totp-disable") return m
    if (profile.pin_enabled) m.push("pin")
    // Le mot de passe ne prouve rien pour le PIN côté backend : réservé au compte.
    if ((action === "deactivate" || action === "delete") && profile.has_password) m.push("password")
    return m
  }, [totpFactorId, profile.pin_enabled, profile.has_password])

  const identityMethods = useMemo(
    () => (pendingAction ? methodsFor(pendingAction) : []),
    [pendingAction, methodsFor],
  )

  // ── PIN ────────────────────────────────────────────────────────────────────
  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const [pinSaving, setPinSaving] = useState(false)

  const submitNewPin = useCallback(async (pin: string): Promise<boolean> => {
    setPinSaving(true)
    try {
      const res = await fetchWithAuth("/api/users/pin", {
        method: "POST",
        body: JSON.stringify({ new_pin: pin, current_pin: provenPinRef.current }),
      })
      if (!isMountedRef.current) return false
      if (!res.ok) {
        toast.error(await readApiError(res, "Impossible d'enregistrer le code PIN"))
        return false
      }
      const wasEnabled = profile.pin_enabled
      setProfile({ ...profile, pin_enabled: true })
      sessionStorage.setItem("emiid_pin_verified", "true")
      setPinDialogOpen(false)
      toast.success(wasEnabled ? "Code PIN modifié" : "Code PIN activé")
      return true
    } catch {
      toast.error("Erreur réseau")
      return false
    } finally {
      provenPinRef.current = undefined
      if (isMountedRef.current) setPinSaving(false)
    }
  }, [profile, setProfile])

  const disablePin = useCallback(async () => {
    const res = await fetchWithAuth("/api/users/pin/disable", {
      method: "POST",
      body: JSON.stringify({ current_pin: provenPinRef.current }),
    })
    provenPinRef.current = undefined
    if (!isMountedRef.current) return
    if (!res.ok) {
      toast.error(await readApiError(res, "Impossible de désactiver le PIN"))
      return
    }
    setProfile({ ...profile, pin_enabled: false })
    sessionStorage.removeItem("emiid_pin_verified")
    toast.success("Code PIN désactivé")
  }, [profile, setProfile])

  // ── Compte ─────────────────────────────────────────────────────────────────
  /** Action de compte prouvée, en attente de la confirmation finale. */
  const [confirmAction, setConfirmAction] = useState<"deactivate" | "delete" | null>(null)
  const [accountLoading, setAccountLoading] = useState(false)

  const runAccountAction = useCallback(async () => {
    const action = confirmAction
    if (!action) return
    setAccountLoading(true)
    try {
      const res = action === "delete"
        ? await fetchWithAuth("/api/users/account", { method: "DELETE" })
        : await fetchWithAuth("/api/users/account/deactivate", { method: "POST" })
      if (!isMountedRef.current) return
      if (!res.ok) {
        toast.error(await readApiError(res, action === "delete" ? "Impossible de supprimer le compte" : "Impossible de désactiver le compte"))
        return
      }
      await supabase.auth.signOut()
      sessionStorage.removeItem("emiid_pin_verified")
      toast.success(action === "delete" ? "Compte supprimé" : "Compte désactivé")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Erreur réseau")
    } finally {
      if (isMountedRef.current) {
        setAccountLoading(false)
        setConfirmAction(null)
      }
    }
  }, [confirmAction, supabase, router])

  // ── Enchaînement : action → preuve → exécution ───────────────────────────
  const proceed = useCallback(async (action: SensitiveAction) => {
    setPendingAction(null)
    switch (action) {
      case "pin-change":
        setPinDialogOpen(true)
        break
      case "pin-disable":
        await disablePin()
        break
      case "totp-disable": {
        if (!totpFactorId) break
        const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId })
        if (error) toast.error(error.message)
        else {
          toast.success("Double authentification désactivée")
          await refreshFactors()
          // La session repasse en aal1 : on la rafraîchit pour l'aligner.
          await supabase.auth.refreshSession()
        }
        break
      }
      case "deactivate":
      case "delete":
        setConfirmAction(action)
        break
    }
  }, [disablePin, totpFactorId, supabase, refreshFactors])

  /** Point d'entrée : demande la preuve d'identité si une méthode existe. */
  const requestAction = useCallback((action: SensitiveAction) => {
    setIdentityError("")
    provenPinRef.current = undefined
    if (methodsFor(action).length === 0) {
      // Aucune preuve disponible (compte social sans PIN ni 2FA) : on passe
      // directement à la confirmation explicite, comme auparavant.
      void proceed(action)
      return
    }
    setPendingAction(action)
  }, [methodsFor, proceed])

  const submitIdentity = useCallback(async (method: IdentityMethod, secret: string, captchaToken: string | null) => {
    if (!pendingAction) return
    setIdentityLoading(true)
    setIdentityError("")
    try {
      if (method === "totp") {
        if (!totpFactorId) throw new Error("Aucune application liée")
        const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: totpFactorId, code: secret })
        if (error) return setIdentityError("Code incorrect ou expiré")
      } else if (method === "pin") {
        const res = await fetchWithAuth("/api/users/verify-pin", { method: "POST", body: JSON.stringify({ pin: secret }) })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.success) return setIdentityError(data.error || "Code PIN incorrect")
        provenPinRef.current = secret
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: secret,
          options: { captchaToken: captchaToken ?? undefined },
        })
        if (error) return setIdentityError("Mot de passe incorrect")
      }
      if (!isMountedRef.current) return
      await proceed(pendingAction)
    } catch {
      setIdentityError("Erreur lors de la vérification")
    } finally {
      if (isMountedRef.current) setIdentityLoading(false)
    }
  }, [pendingAction, totpFactorId, supabase, profile.email, proceed])

  // ── Interrupteurs de l'interface ─────────────────────────────────────────
  const handlePinToggle = useCallback((checked: boolean) => {
    if (checked && !profile.pin_enabled) setPinDialogOpen(true) // premier PIN : rien à prouver
    else if (!checked && profile.pin_enabled) requestAction("pin-disable")
  }, [profile.pin_enabled, requestAction])

  const handleTotpToggle = useCallback((checked: boolean) => {
    if (checked) void startTotpEnroll()
    else requestAction("totp-disable")
  }, [startTotpEnroll, requestAction])

  return {
    // 2FA
    totpEnabled: !!totpFactorId,
    totpLoading,
    enroll,
    enrollLoading,
    verifyTotpEnroll,
    closeEnroll,
    handleTotpToggle,
    // PIN
    pinDialogOpen,
    setPinDialogOpen,
    pinSaving,
    submitNewPin,
    handlePinToggle,
    // Vérification d'identité
    pendingAction,
    identityTitle: pendingAction ? ACTION_TITLE[pendingAction] : "",
    identityMethods,
    identityLoading,
    identityError,
    submitIdentity,
    cancelIdentity: () => setPendingAction(null),
    requestAction,
    // Compte
    confirmAction,
    setConfirmAction,
    accountLoading,
    runAccountAction,
  }
}

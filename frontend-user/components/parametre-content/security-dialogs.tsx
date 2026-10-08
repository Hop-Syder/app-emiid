/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Boîtes de dialogue de l'onglet Sécurité :
 *              - PinDialog            : saisir puis confirmer un nouveau PIN ;
 *              - TotpEnrollDialog     : lier Google / Microsoft Authenticator (QR code) ;
 *              - IdentityCheckDialog  : prouver son identité avant une action sensible
 *                                       (code Authenticator, PIN actuel ou mot de passe).
 * @created 2026-06-22
 * @updated 2026-10-08
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldAlert, Smartphone } from "lucide-react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

/**
 * Clé publique du widget Cloudflare Turnstile dédié à app.emiid.com, utilisé
 * pour la réauthentification par mot de passe. Distincte de la clé de
 * back-office (app-admin.emiid.com) — voir .env.example.
 */
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEtVxnGegPSU9qF-"

/** Champ 6 chiffres partagé par toutes les boîtes de dialogue. */
function SixDigits({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <InputOTP id={id} autoFocus autoComplete="one-time-code" maxLength={6} value={value} onChange={onChange}>
      <InputOTPGroup className="gap-1 sm:gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <InputOTPSlot key={i} index={i} className="w-9 h-11 sm:w-10 sm:h-12 rounded-xl border-border" />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}

// ── PIN : saisie + confirmation ──────────────────────────────────────────────

interface PinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isChange: boolean
  saving: boolean
  onSubmit: (pin: string) => Promise<boolean>
}

export function PinDialog({ open, onOpenChange, isChange, saving, onSubmit }: PinDialogProps) {
  const [step, setStep] = useState<"enter" | "confirm">("enter")
  const [first, setFirst] = useState("")
  const [second, setSecond] = useState("")
  const [error, setError] = useState("")

  // Chaque ouverture repart d'un formulaire vierge.
  useEffect(() => {
    if (open) {
      setStep("enter")
      setFirst("")
      setSecond("")
      setError("")
    }
  }, [open])

  const next = async () => {
    if (step === "enter") {
      if (first.length !== 6) return setError("Le code doit contenir 6 chiffres")
      setStep("confirm")
      return
    }
    if (second !== first) {
      setError("Les deux codes ne correspondent pas")
      setSecond("")
      return
    }
    await onSubmit(first)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isChange ? "Nouveau code PIN" : "Créer votre code PIN"}</DialogTitle>
          <DialogDescription>
            {step === "enter" ? "Choisissez un code à 6 chiffres." : "Saisissez-le une seconde fois pour confirmer."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-5 py-4">
          <SixDigits
            id={step === "enter" ? "new-pin" : "confirm-pin"}
            value={step === "enter" ? first : second}
            onChange={(v) => {
              if (step === "enter") setFirst(v)
              else setSecond(v)
              setError("")
            }}
          />
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <div className="flex gap-2 w-full justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={() => void next()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : step === "enter" ? "Suivant" : "Confirmer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── 2FA : liaison d'une application d'authentification ──────────────────────

interface TotpEnrollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** QR code (data URI SVG) et clé secrète renvoyés par Supabase. */
  qrCode: string | null
  secret: string | null
  loading: boolean
  onVerify: (code: string) => Promise<boolean>
}

export function TotpEnrollDialog({ open, onOpenChange, qrCode, secret, loading, onVerify }: TotpEnrollDialogProps) {
  const [code, setCode] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) setCode("")
  }, [open])

  const copySecret = async () => {
    if (!secret) return
    await navigator.clipboard.writeText(secret).catch(() => undefined)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Activer la double authentification</DialogTitle>
          <DialogDescription>
            1. Scannez ce QR code avec Google Authenticator ou Microsoft Authenticator.
            <br />
            2. Saisissez le code à 6 chiffres affiché par l&apos;application.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <div className="w-48 h-48 rounded-2xl bg-white border border-border flex items-center justify-center">
            {qrCode ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URI SVG généré par Supabase, rien à optimiser
              <img src={qrCode} alt="QR code à scanner avec votre application d'authentification" className="w-44 h-44" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>

          {secret && (
            <button
              type="button"
              onClick={() => void copySecret()}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Saisie manuelle si le scan est impossible"
            >
              <code className="font-mono tracking-wider bg-muted px-2 py-1 rounded-md break-all">{secret}</code>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}

          <SixDigits id="totp-enroll-code" value={code} onChange={setCode} />

          <div className="flex gap-2 w-full justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={() => void onVerify(code)} disabled={loading || code.length !== 6 || !qrCode}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Vérification d'identité avant une action sensible ───────────────────────

export type IdentityMethod = "totp" | "pin" | "password"

const METHOD_LABEL: Record<IdentityMethod, { label: string; icon: React.ElementType }> = {
  totp: { label: "Application", icon: Smartphone },
  pin: { label: "Code PIN", icon: KeyRound },
  password: { label: "Mot de passe", icon: Lock },
}

interface IdentityCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Méthodes acceptées pour l'action en cours, par ordre de préférence. */
  methods: IdentityMethod[]
  title: string
  loading: boolean
  error: string
  onSubmit: (method: IdentityMethod, secret: string, captchaToken: string | null) => void
}

export function IdentityCheckDialog({
  open, onOpenChange, methods, title, loading, error, onSubmit,
}: IdentityCheckDialogProps) {
  const [method, setMethod] = useState<IdentityMethod>(methods[0] ?? "totp")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  // Un jeton Turnstile est à usage unique : après un échec, le widget doit en
  // émettre un nouveau, sinon le bouton reste bloqué jusqu'à la réouverture.
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined)
  useEffect(() => {
    if (error) {
      turnstileRef.current?.reset()
      setCaptchaToken(null)
      setCode("")
    }
  }, [error])

  // Clé stable : le tableau `methods` peut être recréé à chaque rendu du parent.
  const methodsKey = methods.join(",")
  useEffect(() => {
    if (open) {
      setMethod((methodsKey.split(",")[0] as IdentityMethod) || "totp")
      setCode("")
      setPassword("")
      setCaptchaToken(null)
    }
  }, [open, methodsKey])

  const ready = method === "password" ? !!password && !!captchaToken : code.length === 6

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ready) onSubmit(method, method === "password" ? password : code, captchaToken)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mb-3">
            <Lock className="h-6 w-6 text-[#013ff4]" />
          </div>
          <DialogTitle className="text-xl font-black text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {method === "totp" && "Saisissez le code affiché par votre application d'authentification."}
            {method === "pin" && "Saisissez votre code PIN actuel."}
            {method === "password" && "Saisissez votre mot de passe EmiID."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 py-2">
          {methods.length > 1 && (
            <div className="p-1 bg-muted/60 rounded-xl flex gap-1 border border-border/60">
              {methods.map((m) => {
                const { label, icon: Icon } = METHOD_LABEL[m]
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMethod(m); setCode("") }}
                    className={cn(
                      "flex-1 h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer",
                      method === m ? "bg-card shadow-xs text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {method === "password" ? (
            <div className="space-y-3">
              <div className="relative">
                <Input
                  id="reauth-password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 rounded-xl h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setCaptchaToken}
                  onError={() => setCaptchaToken(null)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <SixDigits id={`reauth-${method}`} value={code} onChange={setCode} />
            </div>
          )}

          {error && (
            <p className="text-xs font-medium text-rose-600 flex items-center justify-center gap-1">
              <ShieldAlert size={12} /> {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-11 rounded-xl">
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !ready} className="flex-[2] h-11 rounded-xl bg-[#013ff4] hover:bg-[#033a7a] text-white font-bold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

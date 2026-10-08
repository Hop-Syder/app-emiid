/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Étape 2FA de la connexion : saisie du code à 6 chiffres de
 *              l'application d'authentification (Google / Microsoft Authenticator).
 *              proxy.ts y redirige toute session aal1 d'un compte qui a activé
 *              la 2FA ; une fois le code validé, la session passe en aal2.
 * @created 2026-10-08
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, LogOut, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

/** N'accepte qu'un chemin interne, pour éviter toute redirection ouverte. */
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard-user"
}

export default function MfaChallengePage() {
  const supabase = useMemo(() => createClient(), [])
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find((f) => f.status === "verified")
      if (totp) setFactorId(totp.id)
      else setError("Aucune application d'authentification n'est liée à ce compte.")
    })
  }, [supabase])

  const verify = async (value: string) => {
    if (!factorId || value.length !== 6) return
    setLoading(true)
    setError("")
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: value })
    if (verifyError) {
      setError("Code incorrect ou expiré. Réessayez avec le code affiché maintenant.")
      setCode("")
      setLoading(false)
      return
    }
    // Navigation complète : le proxy doit relire les cookies de la session aal2.
    window.location.replace(safeNext(new URLSearchParams(window.location.search).get("next")))
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.replace("/login")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm bg-card border border-border/70 rounded-2xl shadow-lg p-8 text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">Vérification en deux étapes</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Ouvrez Google Authenticator ou Microsoft Authenticator et saisissez le code EmiID.
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            autoFocus
            autoComplete="one-time-code"
            value={code}
            disabled={loading || !factorId}
            onChange={(v) => {
              setCode(v)
              setError("")
              if (v.length === 6) void verify(v)
            }}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Button
          className="w-full h-11 rounded-xl font-bold"
          disabled={loading || code.length !== 6 || !factorId}
          onClick={() => void verify(code)}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider"}
        </Button>

        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-rose-600 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Se déconnecter
        </button>
      </div>
    </main>
  )
}

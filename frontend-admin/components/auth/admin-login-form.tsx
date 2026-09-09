"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck, Loader2, LogOut } from "lucide-react"
import { toast } from "sonner"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

/**
 * Clé publique du widget Cloudflare Turnstile.
 *
 * La protection anti-robot est activée sur le projet Supabase : sans jeton,
 * `signInWithPassword` est refusé — « captcha protection: request disallowed ».
 * L'application utilisateur envoyait déjà ce jeton, pas le back-office.
 *
 * Les clés Turnstile sont liées à un domaine précis côté Cloudflare : ne
 * JAMAIS reprendre ici la clé de frontend-user (app.emiid.com), sous peine
 * d'erreurs postMessage/origin sur app-admin.emiid.com. En son absence, on
 * retombe sur la clé de test officielle de Cloudflare (toujours valide,
 * non liée à un domaine) plutôt que sur une clé de prod d'une autre app.
 * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"

export function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  // Un jeton Turnstile est à usage unique : après tout échec de connexion, le
  // widget doit être réinitialisé pour en émettre un nouveau. Sans ce ref, il
  // continue d'afficher son ancien "Success" (jeton déjà consommé/rejeté) et
  // le bouton reste bloqué sur "Vérification en cours…" jusqu'au rechargement
  // complet de la page — confirmé en testant le flux de bout en bout.
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined)

  const verifyAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setHasSession(false)
      setSessionError(null)
      return false
    }

    setHasSession(true)

    // is_admin est verrouillée (REVOKE) pour authenticated : on ne peut pas la
    // lire en direct sur user_profiles, même la sienne. Cette RPC ne révèle
    // que le statut admin de l'appelant (auth.uid()) — seule source de vérité
    // pour l'autorisation admin, cohérente avec le backend et le bouton
    // Accorder/Révoquer Admin (qui modifient tous deux is_admin).
    const { data: isAdmin, error } = await supabase.rpc("is_current_user_admin")

    if (error || !isAdmin) {
      setSessionError("Ce compte existe, mais il n'a pas les droits administrateur.")
      return false
    }

    setSessionError(null)
    router.replace("/")
    router.refresh()
    return true
  }

  useEffect(() => {
    const init = async () => {
      await verifyAdminRole()
      setCheckingSession(false)
    }

    void init()
  }, [])

  useEffect(() => {
    if (searchParams.get("error") === "forbidden") {
      setSessionError("Votre session est valide, mais ce compte n'a pas accès au cockpit admin.")
    }
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setSessionError(null)

    try {
      // Le jeton doit accompagner la requête : Supabase le vérifie côté serveur.
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken: captchaToken ?? undefined },
      })

      if (error) {
        toast.error(error.message)
        // Un jeton Turnstile ne vaut qu'une fois : après un échec, il faut en
        // obtenir un nouveau, sinon la tentative suivante serait refusée aussi.
        // reset() force le widget à en émettre un — sans ça, il reste affiché
        // en "Success" avec le jeton déjà rejeté, et le bouton (qui dépend de
        // captchaToken) reste bloqué jusqu'au rechargement de la page.
        setCaptchaToken(null)
        turnstileRef.current?.reset()
        return
      }

      const isAdmin = await verifyAdminRole()

      if (!isAdmin) {
        toast.error("Compte connecté, mais rôle admin manquant")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setHasSession(false)
    setSessionError(null)
    toast.success("Session administrateur fermée")
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-lg border border-slate-200">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-slate-600">Vérification de la session admin...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md rounded-3xl border-slate-200 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Connexion Admin</CardTitle>
            <CardDescription>
              Connectez-vous avec votre email et mot de passe pour accéder au cockpit d'administration.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sessionError ? (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {sessionError}
            </div>
          ) : null}

          {hasSession && sessionError ? (
            <div className="space-y-4">
              <Button className="w-full rounded-xl" onClick={() => router.replace("/")}>
                Réessayer l'accès admin
              </Button>
              <Button variant="outline" className="w-full rounded-xl" onClick={() => void handleLogout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@exemple.com"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl"
                  required
                />
              </div>

              {/* Vérification anti-robot exigée par Supabase avant toute
                  connexion par mot de passe. */}
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onError={() => setCaptchaToken(null)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl h-11"
                disabled={loading || !captchaToken}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : captchaToken ? (
                  "Se connecter"
                ) : (
                  "Vérification en cours…"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

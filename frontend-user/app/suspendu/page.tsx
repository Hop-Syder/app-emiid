/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page « Compte suspendu » — écran de verrouillage pour un compte suspendu.
 * @created 2026-07-08
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useEffect, useState } from "react"
import { Ban, LogOut, Mail, Loader2 } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function SuspendedPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState<string | null>(null)
  const [until, setUntil] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // eslint-disable-next-line no-restricted-syntax -- accès authentifié à SA PROPRE ligne (RLS OK) pour afficher le motif de suspension
        const { data } = await supabase
          .from("user_profiles")
          .select("suspended_reason, suspended_until")
          .eq("user_id", user.id)
          .maybeSingle()
        if (active && data) {
          setReason((data as { suspended_reason?: string | null }).suspended_reason ?? null)
          setUntil((data as { suspended_until?: string | null }).suspended_until ?? null)
        }
      }
      if (active) setLoading(false)
    })()
    return () => { active = false }
  }, [supabase])

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const untilLabel = until
    ? new Date(until).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000616] relative overflow-hidden px-4">
      {/* Fond décoratif */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#013ff4]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[2rem] px-8 py-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] text-center">
          <Image
            src="/logo/logo-emiid.png"
            alt="EmiID"
            width={160}
            height={40}
            className="h-10 w-auto object-contain mx-auto mb-8 brightness-0 invert opacity-90"
          />

          <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
            <Ban className="h-8 w-8 text-orange-400" />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Compte suspendu</h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            L&apos;accès à votre compte EmiID a été temporairement suspendu par notre équipe de modération.
            Vous ne pouvez pas effectuer d&apos;action tant que la suspension est active.
          </p>

          {!loading && (reason || untilLabel) && (
            <div className="mt-6 rounded-2xl bg-white/[0.03] border border-white/10 px-5 py-4 text-left space-y-2">
              {reason && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Motif</p>
                  <p className="text-sm text-slate-200 mt-0.5">{reason}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Durée</p>
                <p className="text-sm text-slate-200 mt-0.5">
                  {untilLabel ? `Jusqu'au ${untilLabel}` : "Suspension permanente"}
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          )}

          <div className="mt-8 space-y-3">
            <a
              href="mailto:support@emiid.com?subject=Contestation%20suspension%20de%20compte"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white text-sm font-semibold transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contester auprès du support
            </a>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-transparent border border-white/10 hover:bg-white/[0.04] text-slate-400 hover:text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Se déconnecter
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          EmiID · Votre empreinte numérique professionnelle
        </p>
      </div>
    </div>
  )
}

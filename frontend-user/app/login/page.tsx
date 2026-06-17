"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Provider = "google" | "linkedin_oidc" | "apple"

const providers = [
  { id: "google" as const,        name: "Google",   icon: "/login/google-icon.svg" },
  { id: "linkedin_oidc" as const, name: "LinkedIn", icon: "/login/linkedin.svg"    },
  { id: "apple" as const,         name: "Apple",    icon: "/login/apple.svg"       },
]

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  const handleLogin = async (provider: Provider) => {
    setError(null)
    setLoading(provider)
    try {
      const callbackUrl = `${location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl },
      })
      if (error) throw error
    } catch (e) {
      setError("Une erreur est survenue. Veuillez réessayer.")
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">

      {/* Fond décoratif minimal */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(30,58,138,0.25),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/8 blur-[100px] rounded-full" />
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/8 blur-[100px] rounded-full" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Glow border */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-[2rem] pointer-events-none" />

        <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/8 rounded-[2rem] px-8 py-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Logo + titre */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <Image
              src="/logo/logo-emiid.png"
              alt="EmiID"
              width={140}
              height={36}
              className="h-9 w-auto object-contain brightness-0 invert"
              priority
            />
            <div className="text-center">
              <h1 className="text-xl font-black tracking-tight text-white mt-1">
                Bienvenue au Sommet
              </h1>
              <p className="text-zinc-500 text-xs font-medium mt-1">
                Connect & Lead. L&apos;élite vous attend.
              </p>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center font-medium"
            >
              {error}
            </motion.p>
          )}

          {/* Case à cocher CGU — obligatoire */}
          <motion.button
            type="button"
            onClick={() => setAccepted(v => !v)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-start gap-3 w-full text-left mb-5 group"
          >
            <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
              accepted
                ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                : "bg-white/5 border-white/15 group-hover:border-white/30"
            }`}>
              {accepted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
              J&apos;accepte les{" "}
              <Link
                href="/conditions"
                onClick={e => e.stopPropagation()}
                className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors"
              >
                conditions d&apos;utilisation
              </Link>{" "}
              et la{" "}
              <Link
                href="/confidentialite"
                onClick={e => e.stopPropagation()}
                className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors"
              >
                politique de confidentialité
              </Link>{" "}
              d&apos;EmiID.
            </p>
          </motion.button>

          {/* Boutons providers */}
          <div className="flex flex-col gap-3">
            {providers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Button
                  variant="outline"
                  disabled={loading !== null || !accepted}
                  onClick={() => handleLogin(p.id)}
                  className="relative w-full h-12 rounded-2xl bg-white/[0.05] border-white/10 hover:bg-white/[0.1] hover:border-white/20 text-white transition-all duration-200 overflow-hidden group disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="flex items-center gap-3">
                    {loading === p.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Image
                        src={p.icon}
                        alt={p.name}
                        width={20}
                        height={20}
                        className="object-contain brightness-0 invert opacity-80"
                      />
                    )}
                    <span className="font-bold text-sm tracking-widest uppercase">
                      Continuer avec {p.name}
                    </span>
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Signature sécurité */}
          <div className="mt-7 flex justify-center">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Sécurité Chiffrée · Nexus Partners
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

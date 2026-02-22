/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de connexion social media avec authentification Supabase (WOW Edition)
 * @created 2025-12-24
 * @updated 2025-12-27
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Globe, Loader2, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

type Provider = "google" | "linkedin" | "apple"

export default function LoginPage() {
  const supabase = createClient()

  const [providerLoading, setProviderLoading] = useState<Provider | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleLogin = async (provider: Provider) => {
    if (!acceptedTerms) return
    try {
      setProviderLoading(provider)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (e) {
      console.error(e)
      setProviderLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 -z-10 bg-zinc-50 overflow-hidden">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Noise Texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-emerald-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* LEFT — Branding (TOUJOURS VISIBLE) */}
      <section className="relative w-full lg:w-1/2 h-[40vh] lg:h-auto flex flex-col justify-between px-6 py-8 lg:p-12 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.7] saturate-[0.8]"
          style={{ backgroundImage: "url('/connexion/background.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-primary/20" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/logo/logo-2.png"
              alt="Nexus Connect Logo"
              width={180}
              height={50}
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </motion.div>
        </div>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 max-w-md space-y-4"
        >
          <p className="text-2xl lg:text-4xl font-bold leading-tight tracking-tight">
            Découvrez le réseautage <span className="text-emerald-400">sans frontières</span> et recrutez les meilleurs talents en un clic.
          </p>

          <footer className="flex items-center gap-2 text-sm text-zinc-300">
            <div className="h-[1px] w-8 bg-emerald-400" />
            Nexus Partners
          </footer>
        </motion.blockquote>

        <p className="relative z-10 text-xs lg:text-sm text-zinc-300 font-medium opacity-80">
          © 2025 Nexus Partners • Excellence Digitale
        </p>
      </section>

      {/* RIGHT — Auth */}
      <section className="relative flex flex-1 items-center justify-center px-4 py-12">
        {/* Decorative background cards (floating behind for depth) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-primary/10 rounded-[3rem] -rotate-12 blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-emerald-500/10 rounded-[3rem] rotate-12 blur-3xl -z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm space-y-10 rounded-[2.5rem] 
                         bg-white/40 backdrop-blur-3xl p-10 
                         shadow-2xl border border-white/60 relative overflow-hidden"
        >
          {/* Subtle light effect inside the card */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-extrabold tracking-tighter text-zinc-900">
              Accès Membre
            </h2>
            <p className="text-zinc-500 font-medium">
              Rejoignez le réseau leader.
            </p>
          </div>

          {/* OAuth Containers with Stagger Effect */}
          <div className="grid grid-cols-3 gap-4">
            {(["google", "linkedin", "apple"] as Provider[]).map((provider, index) => (
              <motion.div
                key={provider}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex flex-col items-center gap-3"
              >
                <Button
                  size="icon"
                  variant="outline"
                  disabled={!acceptedTerms || providerLoading !== null}
                  onClick={() => handleLogin(provider)}
                  className="h-16 w-16 rounded-2xl 
                             transition-all duration-300 hover:scale-110 hover:shadow-2xl
                             active:scale-95 disabled:opacity-40
                             bg-white border-zinc-200 shadow-sm
                             hover:bg-primary hover:text-white hover:border-primary"
                >
                  {providerLoading === provider ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <OAuthIcon provider={provider} />
                  )}
                </Button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {provider}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            {/* Terms */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-start gap-3 text-sm text-zinc-600 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100"
            >
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(v) => setAcceptedTerms(!!v)}
                className="mt-1 rounded-md border-zinc-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="terms" className="cursor-pointer leading-relaxed text-xs">
                J’accepte les{" "}
                <Link href="#" className="font-semibold text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
                  conditions d’utilisation
                </Link>{" "}
                et la{" "}
                <Link href="#" className="font-semibold text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
                  politique de confidentialité
                </Link>
                .
              </label>
            </motion.div>

            {/* Trust */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400"
            >
              <ShieldCheck className="size-4 text-emerald-500" />
              Sécurité de niveau bancaire
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

/* ---------- ICONS ---------- */

function OAuthIcon({ provider }: { provider: Provider }) {
  const iconPath = provider === "google" ? "/login/google-icon.svg" : `/login/${provider}.svg`

  return (
    <div className="relative h-7 w-7 flex items-center justify-center">
      <Image
        src={iconPath}
        alt={`${provider} icon`}
        width={28}
        height={28}
        className="object-contain"
      />
    </div>
  )
}

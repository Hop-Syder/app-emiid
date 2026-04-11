/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de connexion d'élite avec design Centered Immersive & Glassmorphism
 * @created 2026-04-11
 * @updated 2026-04-11
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ShieldCheck, Sparkles, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Provider = "google" | "linkedin" | "apple"

export default function LoginPage() {
  const supabase = createClient()
  const [providerLoading, setProviderLoading] = useState<Provider | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617] p-4 font-sans">
      
      {/* --- BACKGROUND NEURAL SYSTEM (Coherent with Onboarding) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent_70%)]" />
        
        {isMounted && [...Array(20)].map((_, i) => (
            <motion.div
                key={i}
                animate={{
                    y: [0, -30, 0],
                    opacity: [0.1, 0.4, 0.1],
                    scale: [1, 1.3, 1]
                }}
                transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 10
                }}
                className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                }}
            />
        ))}

        {/* Grid and Prismatic Accents */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5" />
      </div>

      {/* --- FLOATING LOGIN CARD --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md group"
      >
        {/* Prismatic Glow Border Effect */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 rounded-[2.5rem] opacity-10 blur-sm group-hover:opacity-30 transition-opacity duration-1000" />
        
        <div className="relative bg-black/40 backdrop-blur-[40px] border border-white/[0.08] rounded-[2.5rem] p-8 lg:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Subtle Internal Reflection */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Header & Logo */}
          <div className="flex flex-col items-center gap-6 mb-12 text-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="cursor-pointer"
            >
              <Image
                src="/logo/logo-2.png"
                alt="Nexus Connect"
                width={160}
                height={40}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter text-white">
                Bienvenue au Sommet
              </h1>
              <p className="text-zinc-400 font-medium text-sm tracking-wide">
                Connect & Lead. L'élite vous attend.
              </p>
            </div>
          </div>

          {/* Social Auth Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {(["google", "linkedin", "apple"] as Provider[]).map((provider, index) => (
                <motion.div
                  key={provider}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    disabled={!acceptedTerms || providerLoading !== null}
                    onClick={() => handleLogin(provider)}
                    className="relative w-full h-14 rounded-2xl bg-white/[0.05] border-white/10 hover:bg-white/[0.1] hover:border-white/20 text-white transition-all duration-300 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="flex items-center justify-center gap-3 w-full">
                      {providerLoading === provider ? (
                        <Loader2 className="animate-spin size-5" />
                      ) : (
                        <div className="flex items-center gap-3">
                          <OAuthIcon provider={provider} />
                          <span className="font-bold text-sm tracking-widest uppercase">
                            Continuer avec {provider}
                          </span>
                        </div>
                      )}
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2 text-zinc-600">
              <div className="h-[1px] flex-1 bg-white/5" />
              <Sparkles className="size-4 opacity-30" />
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            {/* Terms & Security */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(v) => setAcceptedTerms(!!v)}
                  className="mt-1 border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label htmlFor="terms" className="text-[11px] leading-tight text-zinc-500 cursor-pointer">
                  J’accepte les{" "}
                  <Link href="#" className="font-bold text-zinc-300 hover:text-white transition-colors underline underline-offset-2">
                    conditions d’utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link href="#" className="font-bold text-zinc-300 hover:text-white transition-colors underline underline-offset-2">
                    politique de confidentialité
                  </Link> de Nexus Partners.
                </label>
              </motion.div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  Sécurité Chiffrée • Nexus Partners
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center text-zinc-500 text-xs font-medium"
        >
          Besoin d'aide ? <Link href="#" className="text-white hover:underline">Contactez le support</Link>
        </motion.p>
      </motion.div>

      {/* Background Decor Slant */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  )
}

function OAuthIcon({ provider }: { provider: Provider }) {
  const iconPath = provider === "google" ? "/login/google-icon.svg" : `/login/${provider}.svg`
  return (
    <div className="relative h-6 w-6 flex items-center justify-center brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity">
      <Image
        src={iconPath}
        alt={`${provider}`}
        width={24}
        height={24}
        className="object-contain"
      />
    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de connexion d'élite avec design Centered Immersive & Glassmorphism
 * @created 2026-04-11
 * @updated 2026-05-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/ // ──────────────────────────────────

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ShieldCheck, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Provider = "google" | "linkedin_oidc" | "apple"

import { StackingCards, CardData } from "@/components/ui/stacking-card"

const featureCards: CardData[] = [
  {
    title: 'Réseau d\'Élite',
    description:
      'Rejoignez une communauté d\'entrepreneurs, d\'investisseurs et de leaders triés sur le volet. Accédez directement aux décideurs qui comptent.',
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
    color: '#0f172a', // slate-900
  },
  {
    title: 'Opportunités Inédites',
    description:
      'Découvrez des offres exclusives, des partenariats stratégiques et des levées de fonds avant qu\'ils ne soient publics. Ne laissez plus passer votre chance.',
    url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80',
    color: '#1e1b4b', // indigo-950
  },
  {
    title: 'Visibilité Premium',
    description:
      'Mettez en avant votre expertise, vos projets et votre entreprise avec un profil haut de gamme. Attirez les bons regards, au bon moment.',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    color: '#064e3b', // emerald-950
  },
];

export default function LoginPage() {
  const supabase = createClient()
  const [providerLoading, setProviderLoading] = useState<Provider | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [shakeCheckbox, setShakeCheckbox] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogin = async (provider: Provider) => {
    setAuthError(null)
    if (!acceptedTerms) {
      setAuthError("Veuillez accepter les conditions d'utilisation pour continuer.")
      setShakeCheckbox(true)
      setTimeout(() => setShakeCheckbox(false), 500)
      return
    }
    
    try {
      setProviderLoading(provider)
      
      const callbackUrl = new URL(`${location.origin}/auth/callback`)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })
      if (error) throw error
    } catch (e: unknown) {
      console.error(e)
      const message = e instanceof Error ? e.message : "Une erreur est survenue lors de la connexion. Veuillez réessayer."
      setAuthError(message)
      setProviderLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-[#020617] font-sans">
      
      {/* --- BACKGROUND NEURAL SYSTEM (Coherent with Onboarding) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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
        
        {/* Background Decor Slant */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* --- LEFT COLUMN: STACKING CARDS (Hidden on mobile) --- */}
      <div className="hidden lg:block relative z-10 w-1/2 h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <StackingCards cards={featureCards} />
      </div>

      {/* --- RIGHT COLUMN: LOGIN FORM --- */}
      <div className="relative z-10 w-full lg:w-1/2 h-screen overflow-y-auto flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-md group"
        >
          {/* Prismatic Glow Border Effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 rounded-[2.5rem] opacity-10 blur-sm group-hover:opacity-30 transition-opacity duration-1000" />
          
          <div className="relative bg-black/40 backdrop-blur-[40px] border border-white/[0.08] rounded-[2.5rem] p-6 lg:p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Subtle Internal Reflection */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Header & Logo */}
            <div className="flex flex-col items-center gap-4 mb-8 text-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="cursor-pointer"
              >
                <Image
                  src="/logo/logo-2.png"
                  alt="EmiID"
                  width={160}
                  height={40}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              </motion.div>
              
              <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tighter text-white">
                  Bienvenue au Sommet
                </h1>
                <p className="text-zinc-400 font-medium text-sm tracking-wide">
                  Connect & Lead. L&apos;élite vous attend.
                </p>
              </div>
            </div>

            {/* Social Auth Grid */}
            <div className="space-y-4">
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  {authError}
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {([
                  { id: "google", name: "Google", icon: "/login/google-icon.svg" },
                  { id: "linkedin_oidc", name: "LinkedIn", icon: "/login/linkedin.svg" },
                  { id: "apple", name: "Apple", icon: "/login/apple.svg" }
                ] as const).map((providerData, index) => (
                  <motion.div
                    key={providerData.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      disabled={providerLoading !== null && providerLoading !== providerData.id}
                      onClick={() => handleLogin(providerData.id)}
                      className="relative w-full h-12 rounded-2xl bg-white/[0.05] border-white/10 hover:bg-white/[0.1] hover:border-white/20 text-white transition-all duration-300 group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      <div className="flex items-center justify-center gap-3 w-full">
                        {providerLoading === providerData.id ? (
                          <Loader2 className="animate-spin size-5" />
                        ) : (
                          <div className="flex items-center gap-3">
                            <OAuthIcon iconPath={providerData.icon} name={providerData.name} />
                            <span className="font-bold text-sm tracking-widest uppercase">
                              Continuer avec {providerData.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-1 text-zinc-600">
                <div className="h-[1px] flex-1 bg-white/5" />
                <Sparkles className="size-4 opacity-30" />
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>

              {/* Terms & Security */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={shakeCheckbox ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1 }}
                  transition={shakeCheckbox ? { duration: 0.4 } : { delay: 0.8 }}
                  className={`flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border transition-colors ${shakeCheckbox ? "border-red-500/50 bg-red-500/5" : "border-white/5"}`}
                >
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(v) => {
                      setAcceptedTerms(!!v)
                      if (v) setAuthError(null)
                    }}
                    className={`mt-0.5 transition-colors data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 ${shakeCheckbox ? "border-red-500" : "border-white/20"}`}
                  />
                  <label htmlFor="terms" className="text-[10px] leading-tight text-zinc-400 cursor-pointer">
                    J’accepte les{" "}
                    <Link href="/conditions" className="font-bold text-zinc-300 hover:text-white transition-colors underline underline-offset-2">
                      conditions d’utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/confidentialite" className="font-bold text-zinc-300 hover:text-white transition-colors underline underline-offset-2">
                      politique de confidentialité
                    </Link> de Nexus Partners.
                  </label>
                </motion.div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                    <ShieldCheck className="size-3 text-emerald-500" />
                    Sécurité Chiffrée • Nexus Partners
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function OAuthIcon({ iconPath, name }: { iconPath: string, name: string }) {
  return (
    <div className="relative h-6 w-6 flex items-center justify-center brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity">
      <Image
        src={iconPath}
        alt={name}
        width={24}
        height={24}
        className="object-contain"
      />
    </div>
  )
}

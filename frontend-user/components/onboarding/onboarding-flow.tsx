/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onboarding EmiID — carrousel de présentation du produit (3 slides immersifs)
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchWithAuth } from "@/lib/apiClient"

// ─── Contenu des slides de présentation ───────────────────────────────────────

interface Slide {
  image: string
  alt: string
  title: string
  highlight: string
  description: string
  cta: string
}

const SLIDES: Slide[] = [
  {
    image: "/onboarding/globe-terreste.png",
    alt: "Réseau mondial EmiID",
    title: "Bienvenue sur",
    highlight: "EmiID",
    description:
      "Le réseau qui connecte les professionnels d'Afrique au monde entier. Visibilité, opportunités et connexions de confiance.",
    cta: "Découvrir",
  },
  {
    image: "/onboarding/partage.png",
    alt: "Partage de profil EmiID",
    title: "Votre identité,",
    highlight: "partagée en un geste",
    description:
      "Une carte professionnelle digitale, un profil vérifié et un lien unique à partager partout — réunions, salons, réseaux sociaux.",
    cta: "Continuer",
  },
  {
    image: "/onboarding/bagbe.jpg",
    alt: "Réseau et opportunités EmiID",
    title: "Développez votre",
    highlight: "réseau & vos opportunités",
    description:
      "Annuaire intelligent, messagerie temps réel et visibilité locale. Trouvez les bons contacts et faites grandir votre activité.",
    cta: "Accéder à mon Hub",
  },
]

// ─── Transition slide ──────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

// ─── Dot progress ──────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 24 : 8, opacity: i <= current ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
          className={`h-2 rounded-full ${i <= current ? "bg-indigo-400" : "bg-white/20"}`}
        />
      ))}
    </div>
  )
}

// ─── Un slide de présentation ──────────────────────────────────────────────────

function PresentationSlide({ slide }: { slide: Slide }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 sm:gap-5 px-2">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-[30vh] h-[30vh] max-w-[14rem] max-h-[14rem] sm:max-w-[16rem] sm:max-h-[16rem]"
      >
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          sizes="(max-width: 640px) 30vh, 16rem"
          className="object-contain drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]"
          priority
        />
      </motion.div>

      <div className="space-y-1.5 sm:space-y-2 max-w-sm">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug"
        >
          {slide.title}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">
            {slide.highlight}
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-slate-400 text-[13px] sm:text-sm font-medium leading-relaxed px-1"
        >
          {slide.description}
        </motion.p>
      </div>
    </div>
  )
}

// ─── Orchestrateur principal ────────────────────────────────────────────────────

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [saving, setSaving] = useState(false)

  const total = SLIDES.length
  const isLast = step === total - 1

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const finish = async () => {
    setSaving(true)
    try {
      // Marquage non bloquant : l'utilisateur a vu l'onboarding.
      await fetchWithAuth("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ has_profile: true }),
      })
    } catch {
      // Non bloquant — on redirige quoi qu'il arrive.
    } finally {
      router.replace("/dashboard-user")
    }
  }

  const handleNext = () => (isLast ? finish() : goTo(step + 1))

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden px-4 py-4 sm:py-6">

      {/* Fond */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(79,70,229,0.18),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-64 bg-indigo-600/6 blur-[80px] rounded-full" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-4 sm:gap-6">

        {/* Logo + dots */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <Image
            src="/logo/logo-emiid.png"
            alt="EmiID"
            width={672}
            height={168}
            className="h-[144px] sm:h-[168px] w-auto object-contain brightness-0 invert drop-shadow-[0_4px_24px_rgba(255,255,255,0.12)]"
            priority
          />
          <StepDots current={step} total={total} />
        </div>

        {/* Slide courant */}
        <div className="w-full relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="w-full"
            >
              <PresentationSlide slide={SLIDES[step]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="w-full max-w-sm flex items-center gap-3">
          {step > 0 && (
            <Button
              variant="ghost"
              onClick={() => goTo(step - 1)}
              disabled={saving}
              className="flex-1 h-11 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={saving}
            className="flex-[2] h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide transition-all hover:scale-[1.01] shadow-lg shadow-indigo-500/20 disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Chargement...</>
            ) : (
              <>{SLIDES[step].cta} <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={() => router.replace("/dashboard-user")}
            className="text-[10px] text-slate-600 hover:text-slate-400 font-medium transition-colors tracking-wide uppercase"
          >
            Passer l&apos;introduction
          </button>
        )}
      </div>
    </div>
  )
}

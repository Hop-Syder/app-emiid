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
    <div className="flex flex-col items-center justify-center text-center gap-4 sm:gap-6 px-4 max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-52 md:h-52 mx-auto flex items-center justify-center"
      >
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          sizes="(max-width: 640px) 9rem, 13rem"
          className="object-contain drop-shadow-[0_0_40px_rgba(1,63,244,0.45)]"
          priority
        />
      </motion.div>

      <div className="space-y-2 sm:space-y-3 w-full text-center flex flex-col items-center justify-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl sm:text-3xl md:text-3xl font-black text-white tracking-tight leading-snug text-center"
        >
          {slide.title}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] via-[#03b3f8] to-sky-300">
            {slide.highlight}
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-slate-300/90 text-sm sm:text-base font-normal leading-relaxed text-center max-w-sm sm:max-w-md mx-auto"
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
      // Funnel R4 : après l'intro, on amène l'utilisateur à créer/publier son profil.
      router.replace("/creer-profil")
    }
  }

  const handleNext = () => (isLast ? finish() : goTo(step + 1))

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center justify-center bg-[#000616] overflow-hidden px-4 py-4 sm:py-6 selection:bg-[#013ff4] selection:text-white">

      {/* Fond avec image /onboarding/background.avif et teintes #000616 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image
          src="/onboarding/background.avif"
          alt="EmiID Onboarding Background"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-30 mix-blend-luminosity scale-105"
          priority
        />
        <div className="absolute inset-0 bg-[#000616]/85 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000616] via-transparent to-[#000616]/70" />
        <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] bg-[#013ff4]/20 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 -left-24 w-[28rem] h-[28rem] bg-[#03b3f8]/15 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center justify-center my-auto py-6 sm:py-8 gap-5 sm:gap-6">

        {/* Logo + dots */}
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-3.5">
          {step < 2 && (
            <Image
              src="/logo-emiid-bleu-blanc-2.png"
              alt="EmiID"
              width={260}
              height={120}
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_24px_rgba(1,63,244,0.4)]"
              priority
            />
          )}
          <StepDots current={step} total={total} />
        </div>

        {/* Slide courant */}
        <div className="w-full relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="w-full flex items-center justify-center"
            >
              <PresentationSlide slide={SLIDES[step]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation & Passer */}
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-3 mt-1">
          <div className="w-full flex items-center gap-3">
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={() => goTo(step - 1)}
                disabled={saving}
                className="flex-1 h-12 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 font-semibold text-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Retour
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={saving}
              className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-[#013ff4] to-[#03b3f8] hover:from-[#0135d0] hover:to-[#029ad7] text-white font-bold text-sm tracking-wide transition-all hover:scale-[1.01] shadow-lg shadow-blue-500/25 disabled:opacity-60"
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
              onClick={() => router.replace("/creer-profil")}
              className="text-xs text-slate-400 hover:text-white font-semibold transition-colors tracking-wider uppercase py-1"
            >
              Passer l&apos;introduction
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ArrowRight, ChevronLeft, Loader2, MapPin, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/apiClient"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Country { id: string; name: string; iso_code: string }

const CATEGORIES = [
  { id: "artisan",      label: "Artisan",      emoji: "🔨", desc: "Savoir-faire manuel" },
  { id: "freelance",    label: "Freelance",     emoji: "💻", desc: "Indépendant" },
  { id: "entreprise",   label: "Entreprise",    emoji: "🏢", desc: "PME / TPE" },
  { id: "startup",      label: "Startup",       emoji: "🚀", desc: "Tech & Innovation" },
  { id: "commerçante",  label: "Commerçant",    emoji: "🏪", desc: "Commerce & Vente" },
  { id: "agence",       label: "Agence",        emoji: "📢", desc: "Com / Marketing / Web" },
  { id: "investisseur", label: "Investisseur",  emoji: "📈", desc: "Business Angel" },
  { id: "etudiant",     label: "Étudiant",      emoji: "🎓", desc: "Jeune diplômé" },
]

// ─── Transition slide ─────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

// ─── Dot progress ─────────────────────────────────────────────────────────────

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

// ─── Étape 1 : Présentation EmiID ────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 px-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-64 h-64 sm:w-72 sm:h-72"
      >
        <Image
          src="/onboarding/globe-terreste.png"
          alt="Réseau mondial EmiID"
          fill
          className="object-contain drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]"
          priority
        />
      </motion.div>

      <div className="space-y-3 max-w-xs">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
        >
          Bienvenue sur{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">
            EmiID
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-slate-400 text-sm font-medium leading-relaxed"
        >
          Le réseau qui connecte les professionnels d'Afrique au monde entier. Visibilité, opportunités, connexions.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-xs"
      >
        <Button
          onClick={onNext}
          className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
        >
          Commencer <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}

// ─── Étape 2 : Catégorie ─────────────────────────────────────────────────────

function StepCategory({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-6 w-full px-1">
      <div className="text-center space-y-1">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-black text-white tracking-tight"
        >
          Qui êtes-vous ?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-xs font-medium"
        >
          Sélectionnez le profil qui vous correspond le mieux.
        </motion.p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CATEGORIES.map((cat, i) => {
          const isSelected = selected === cat.id
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(cat.id)}
              className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer group
                ${isSelected
                  ? "border-indigo-500/60 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                  : "border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15"
                }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <span className="text-2xl">{cat.emoji}</span>
              <div>
                <p className={`text-xs font-bold leading-tight ${isSelected ? "text-indigo-300" : "text-white/80"}`}>
                  {cat.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{cat.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex-1 h-11 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <Button
          onClick={onNext}
          disabled={!selected}
          className="flex-[2] h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] shadow-lg shadow-indigo-500/20"
        >
          Suivant <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ─── Étape 3 : Localisation ───────────────────────────────────────────────────

function StepLocation({
  countryId,
  city,
  onCountryChange,
  onCityChange,
  onSubmit,
  onBack,
  saving,
}: {
  countryId: string
  city: string
  onCountryChange: (id: string) => void
  onCityChange: (city: string) => void
  onSubmit: () => void
  onBack: () => void
  saving: boolean
}) {
  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("countries")
      .select("id, name, iso_code")
      .order("name")
      .then(({ data }) => { if (data) setCountries(data) })
  }, [])

  return (
    <div className="flex flex-col gap-6 w-full px-1">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-black text-white tracking-tight"
        >
          Où vous trouvez-vous ?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-xs font-medium max-w-xs mx-auto"
        >
          Pour apparaître dans les recherches locales et trouver des contacts près de chez vous.
        </motion.p>
      </div>

      <div className="space-y-3 w-full">
        {/* Country select */}
        <div className="relative">
          <select
            value={countryId}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full h-12 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium px-4 appearance-none focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.09] transition-all cursor-pointer"
          >
            <option value="" disabled className="bg-slate-900 text-slate-400">
              🌍 Choisir votre pays
            </option>
            {countries.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▾</div>
        </div>

        {/* City input */}
        <input
          type="text"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder="📍 Ville (optionnel)"
          className="w-full h-12 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-sm font-medium px-4 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.09] transition-all"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={saving}
          className="flex-1 h-11 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!countryId || saving}
          className="flex-[2] h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] shadow-lg shadow-indigo-500/20"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
          ) : (
            <>Aller au Hub <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  )
}

// ─── Orchestrateur principal ──────────────────────────────────────────────────

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [category, setCategory] = useState<string | null>(null)
  const [countryId, setCountryId] = useState("")
  const [city, setCity] = useState("")
  const [saving, setSaving] = useState(false)

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await fetchWithAuth("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          country_id: countryId,
          city: city.trim() || undefined,
          has_profile: true,
        }),
      })
    } catch {
      // Non bloquant — l'utilisateur arrive quand même au hub
    } finally {
      router.replace("/dashboard-user")
    }
  }

  const steps = [
    <StepWelcome key="welcome" onNext={() => goTo(1)} />,
    <StepCategory
      key="category"
      selected={category}
      onSelect={setCategory}
      onNext={() => goTo(2)}
      onBack={() => goTo(0)}
    />,
    <StepLocation
      key="location"
      countryId={countryId}
      city={city}
      onCountryChange={setCountryId}
      onCityChange={setCity}
      onSubmit={handleSubmit}
      onBack={() => goTo(1)}
      saving={saving}
    />,
  ]

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden px-4 py-12">

      {/* Fond */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(79,70,229,0.18),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-indigo-600/6 blur-[80px] rounded-full" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8">

        {/* Logo + dots */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo/logo-2.png"
            alt="EmiID"
            width={120}
            height={32}
            className="h-8 w-auto object-contain brightness-0 invert opacity-70"
          />
          <StepDots current={step} total={3} />
        </div>

        {/* Panneau de l'étape courante */}
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
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip — uniquement étape 2 et 3 */}
        {step > 0 && (
          <button
            onClick={() => router.replace("/dashboard-user")}
            className="text-[10px] text-slate-600 hover:text-slate-400 font-medium transition-colors tracking-wide uppercase"
          >
            Passer cette étape
          </button>
        )}
      </div>
    </div>
  )
}

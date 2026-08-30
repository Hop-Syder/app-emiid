/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Tunnel d'onboarding EmiID en 3 étapes (Qui / Que / Où) + écran d'activation.
 *              Réutilise le hook useCreerProfil (état, upload avatar, référentiels) et
 *              publie le profil via buildProfilePayload + fetchWithAuth, puis redirige.
 */

"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Loader2, Rocket, Link2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Preloader } from "@/components/Preloader"
import { fetchWithAuth } from "@/lib/apiClient"
import { useCreerProfil, buildProfilePayload, type CreateProfileFormData } from "@/hooks/use-creer-profil"
import { StepIndicator, WIZARD_STEPS } from "./wizard/step-indicator"
import { StepIdentity } from "./wizard/step-identity"
import { StepActivity } from "./wizard/step-activity"
import { StepLocation } from "./wizard/step-location"
import { CreerProfilPreview } from "./creer-profil-preview"

const TOTAL_STEPS = WIZARD_STEPS.length // 3

// Génère un slug URL-safe à partir d'un libellé + suffixe court anti-collision.
function generateSlug(base: string): string {
    const slugBase = base
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // retire les accents (diacritiques combinants)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40)
    const suffix = Math.random().toString(36).slice(2, 6)
    return slugBase ? `${slugBase}-${suffix}` : `emiid-${suffix}`
}

function countDigits(value: string): number {
    return (value.match(/[0-9]/g) || []).length
}

export function CreerProfilWizard() {
    const router = useRouter()
    const {
        formData,
        setFormData,
        handleInputChange,
        loadingStatus,
        loadInitialData,
    } = useCreerProfil()

    const [step, setStep] = useState(1) // 1..3, puis 4 = écran d'activation
    const [activating, setActivating] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // ── Validation par étape ────────────────────────────────────────────────
    const validateStep = useCallback(
        (current: number): boolean => {
            const e: Record<string, string> = {}
            if (current === 1) {
                const parts = formData.name.trim().split(/\s+/).filter(Boolean)
                if (parts.length < 2) e.name = "Renseigne ton nom et ton prénom."
            }
            if (current === 2) {
                if (formData.role.trim().length < 2) e.role = "Le métier est requis."
                if (!formData.category) e.category = "Choisis un type de profil."
                if (countDigits(formData.phone) < 8) e.phone = "Numéro WhatsApp invalide."
            }
            if (current === 3) {
                if (formData.city.trim().length < 2) e.city = "La ville est requise."
                if (formData.district.trim().length < 2) e.district = "L'arrondissement ou quartier est requis."
            }
            setErrors(e)
            return Object.keys(e).length === 0
        },
        [formData],
    )

    const goNext = useCallback(() => {
        if (!validateStep(step)) return
        if (step < TOTAL_STEPS) {
            setStep((s) => s + 1)
            return
        }
        // Passage à l'écran d'activation : on prépare les valeurs dérivées.
        setFormData((prev) => ({
            ...prev,
            specialty: prev.specialty.trim() || prev.role.trim(),
            slug: prev.slug || generateSlug(prev.business_name || prev.name),
            country_name: prev.country_name || "Bénin",
            country_code: prev.country_code || "BJ",
        }))
        setStep(4)
    }, [step, validateStep, setFormData])

    const goBack = useCallback(() => {
        setErrors({})
        setStep((s) => Math.max(1, s - 1))
    }, [])

    // ── Activation finale : publication + redirection ───────────────────────
    const handleActivate = useCallback(async () => {
        if (activating) return
        // Garantit les valeurs dérivées même si l'écran a été atteint sans effet.
        const finalData: CreateProfileFormData = {
            ...formData,
            specialty: formData.specialty.trim() || formData.role.trim(),
            slug: formData.slug || generateSlug(formData.business_name || formData.name),
            country_name: formData.country_name || "Bénin",
            country_code: formData.country_code || "BJ",
        }
        try {
            setActivating(true)
            const payload = buildProfilePayload(finalData, true)
            const response = await fetchWithAuth("/api/users/me", {
                method: "PUT",
                body: JSON.stringify(payload),
            })
            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.error || "Échec de l'activation du profil.")
            }
            localStorage.removeItem("emiid_profile_draft")
            toast.success("Profil EmiID activé ! 🎉")
            router.push("/dashboard-user")
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur inconnue"
            toast.error(message)
            setActivating(false)
        }
    }, [activating, formData, router])

    const profileUrl = useMemo(() => {
        const slug = formData.slug || "ton-lien"
        return `emiid.com/${slug}`
    }, [formData.slug])

    if (loadingStatus === "loading") {
        return <Preloader text="Initialisation du profil" />
    }

    if (loadingStatus === "error") {
        return (
            <div className="max-w-md mx-auto px-4 py-16 text-center">
                <p className="text-sm text-muted-foreground mb-6">Impossible de charger vos données de profil.</p>
                <Button onClick={loadInitialData} className="rounded-xl">Réessayer</Button>
            </div>
        )
    }

    return (
        <div className="max-w-xl lg:max-w-6xl mx-auto w-full px-4 sm:px-6 pb-24 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
            <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-card border border-border shadow-[0_4px_24px_rgb(15,23,42,0.05)] rounded-3xl p-6 sm:p-8">

                {step <= TOTAL_STEPS && (
                    <div className="mb-8">
                        <StepIndicator current={step} />
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                    >
                        {step === 1 && (
                            <StepIdentity formData={formData} handleInputChange={handleInputChange} error={errors.name} />
                        )}
                        {step === 2 && (
                            <StepActivity formData={formData} handleInputChange={handleInputChange} errors={errors} />
                        )}
                        {step === 3 && (
                            <StepLocation formData={formData} handleInputChange={handleInputChange} errors={errors} />
                        )}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="mx-auto w-14 h-14 rounded-2xl bg-[#013ff4]/10 flex items-center justify-center mb-3">
                                        <Rocket className="h-7 w-7 text-[#013ff4]" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Prêt à te lancer</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Vérifie ta carte puis active ton profil EmiID.</p>
                                </div>

                                <CreerProfilPreview formData={formData} />

                                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3.5 py-3">
                                    <Link2 className="h-4 w-4 text-[#013ff4] shrink-0" />
                                    <span className="text-sm font-medium text-foreground truncate">{profileUrl}</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* ── Navigation ─────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
                    {step > 1 && (
                        <Button
                            variant="outline"
                            onClick={goBack}
                            disabled={activating}
                            className="rounded-xl h-12 px-5 gap-2 border-border text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Précédent
                        </Button>
                    )}

                    {step <= TOTAL_STEPS ? (
                        <Button
                            onClick={goNext}
                            className="rounded-xl h-12 px-5 gap-2 flex-1 bg-[#013ff4] hover:bg-[#013ff4]/90 text-white shadow-lg shadow-[#013ff4]/25"
                        >
                            {step === TOTAL_STEPS ? "Vérifier mon profil" : "Suivant"}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleActivate}
                            disabled={activating}
                            className="rounded-xl h-12 px-5 gap-2 flex-1 bg-[#013ff4] hover:bg-[#013ff4]/90 text-white shadow-lg shadow-[#013ff4]/25"
                        >
                            {activating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                            Activer mon profil EmiID
                        </Button>
                    )}
                </div>
            </div>
            </div>

            {/* ── Panneau récap latéral — desktop uniquement ───────────────── */}
            <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-20">
                <WizardRecap formData={formData} profileUrl={profileUrl} />
            </aside>
        </div>
    )
}

/** Panneau latéral du wizard — suivi live des informations saisies. */
function WizardRecap({
    formData,
    profileUrl,
}: {
    formData: CreateProfileFormData
    profileUrl: string
}) {
    const rows = [
        { label: "Nom", value: formData.name },
        { label: "Métier", value: formData.role },
        { label: "Type de profil", value: formData.category },
        { label: "Entreprise", value: formData.business_name },
        { label: "Ville", value: formData.city },
        { label: "Quartier", value: formData.district },
    ].filter((row) => row.value && row.value.trim().length > 0)

    return (
        <div className="rounded-3xl bg-gradient-to-br from-[#013ff4]/[0.04] to-[#03b3f8]/[0.06] border border-[#013ff4]/10 p-7">
            <p className="text-xs font-black uppercase tracking-widest text-[#013ff4]">Ton profil en direct</p>
            <h3 className="text-lg font-bold text-foreground mt-1 tracking-tight">Récapitulatif</h3>

            <dl className="mt-6 space-y-4">
                {rows.length > 0 ? (
                    rows.map((row) => (
                        <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-3 last:border-0 last:pb-0">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">{row.label}</dt>
                            <dd className="text-sm font-semibold text-foreground text-right truncate">{row.value}</dd>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Les informations que tu saisis apparaîtront ici en temps réel.
                    </p>
                )}
            </dl>

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3">
                <Link2 className="h-4 w-4 text-[#013ff4] shrink-0" />
                <span className="text-xs font-medium text-muted-foreground truncate">{profileUrl}</span>
            </div>

            <p className="mt-5 text-[11px] text-slate-400 leading-relaxed">
                Ton profil reste invisible publiquement tant qu&apos;il n&apos;est pas activé.
            </p>
        </div>
    )
}

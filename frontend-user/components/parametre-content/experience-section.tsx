/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « Profil » — Parcours & Expériences professionnelles (historique chronologique, façon CV).
 * @created 2026-09-07
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { Briefcase, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { UserProfileData } from "@/hooks/use-settings"
import type { ExperienceItem } from "@/types"
import { SectionCard, Field, INPUT, TEXTAREA } from "./settings-primitives"

interface ExperienceSectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
}

export function ExperienceSection({ profile, setProfile }: ExperienceSectionProps) {
  const experiences = profile.experiences || []
  const setExperiences = (next: ExperienceItem[]) => setProfile({ ...profile, experiences: next })

  const addExperience = () =>
    setExperiences([
      ...experiences,
      {
        id: crypto.randomUUID(),
        title: "",
        company: "",
        startDate: "",
        endDate: null,
        current: false,
        description: "",
      },
    ])

  const updateExperience = (id: string, patch: Partial<ExperienceItem>) =>
    setExperiences(experiences.map((exp) => (exp.id === id ? { ...exp, ...patch } : exp)))

  const removeExperience = (id: string) => setExperiences(experiences.filter((exp) => exp.id !== id))

  return (
    <SectionCard
      title="Parcours & Expériences"
      icon={Briefcase}
      description="Ajoutez vos postes précédents pour construire un historique professionnel crédible, visible sur votre profil public."
    >
      <div className="space-y-3">
        {experiences.length === 0 && (
          <div className="p-6 text-center rounded-2xl bg-muted/60 border border-dashed border-border">
            <p className="text-xs text-muted-foreground font-medium">Aucune expérience renseignée pour le moment.</p>
            <p className="text-[11px] text-slate-400 mt-1">Ajoutez votre parcours pour qu&apos;il apparaisse dans l&apos;onglet « Parcours &amp; Expériences » de votre profil public.</p>
          </div>
        )}

        {experiences.map((exp) => (
          <div key={exp.id} className="rounded-2xl border border-border/80 bg-muted/50 p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                value={exp.title}
                onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                className={`${INPUT} bg-card font-bold text-sm`}
                placeholder="Poste (ex : Ébéniste d'art)"
              />
              <Input
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                className={`${INPUT} bg-card font-bold text-sm`}
                placeholder="Entreprise / Atelier"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Field label="Début" className="w-auto">
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                  className={`${INPUT} bg-card w-40 text-xs font-bold`}
                />
              </Field>

              <Field label="Fin" className="w-auto">
                <Input
                  type="month"
                  value={exp.endDate || ""}
                  min={exp.startDate || undefined}
                  onChange={(e) => updateExperience(exp.id, { endDate: e.target.value || null })}
                  disabled={exp.current}
                  className={`${INPUT} bg-card w-40 text-xs font-bold disabled:opacity-50`}
                />
              </Field>

              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none pb-0.5">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? null : exp.endDate })}
                  className="h-3.5 w-3.5 rounded accent-[#013ff4]"
                />
                Poste actuel
              </label>

              <Button
                type="button"
                variant="ghost"
                onClick={() => removeExperience(exp.id)}
                className="h-9 w-9 p-0 ml-auto shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <textarea
              value={exp.description || ""}
              onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
              rows={2}
              className={`${TEXTAREA} text-xs`}
              placeholder="Missions, réalisations marquantes (facultatif)"
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addExperience}
          className="rounded-xl h-11 gap-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground w-full font-bold hover:bg-muted/70 transition-all shadow-xs"
        >
          <Plus className="h-4 w-4 text-[#013ff4]" />
          Ajouter une expérience
        </Button>
      </div>
    </SectionCard>
  )
}

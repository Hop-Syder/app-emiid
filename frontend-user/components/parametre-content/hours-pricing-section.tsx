/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « Horaires & Services » — Adresse physique, planning d'ouverture et catalogue de prestations.
 * @created 2026-06-13
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { MapPin, Plus, Trash2, Clock, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { UserProfileData, OpeningHour, ServiceItem } from "@/hooks/use-settings"
import { SectionCard, Field, INPUT, TEXTAREA, SaveBar } from "./settings-primitives"

interface SectionProps {
  profile: UserProfileData
  setProfile: (profile: UserProfileData) => void
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
}

const DAYS: { day: number; label: string }[] = [
  { day: 1, label: "Lundi" },
  { day: 2, label: "Mardi" },
  { day: 3, label: "Mercredi" },
  { day: 4, label: "Jeudi" },
  { day: 5, label: "Vendredi" },
  { day: 6, label: "Samedi" },
  { day: 0, label: "Dimanche" },
]

export function HoursPricingSection({ profile, setProfile, saving, handleSave, handleCancel }: SectionProps) {
  const hoursByDay = new Map<number, OpeningHour>((profile.opening_hours || []).map((h) => [h.day, h]))

  const getDay = (day: number): OpeningHour =>
    hoursByDay.get(day) || { day, open: "08:00", close: "18:00", closed: false }

  const updateHour = (day: number, patch: Partial<OpeningHour>) => {
    const next: OpeningHour[] = DAYS.map(({ day: d }) => {
      const current = getDay(d)
      return d === day ? { ...current, ...patch } : current
    })
    setProfile({ ...profile, opening_hours: next })
  }

  const services = profile.services || []
  const setServices = (next: ServiceItem[]) => setProfile({ ...profile, services: next })
  const addService = () => setServices([...services, { title: "", price: null, description: "" }])
  const updateService = (index: number, patch: Partial<ServiceItem>) =>
    setServices(services.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index))

  return (
    <div className="space-y-4">
      {/* ── Adresse physique ──────────────────────────────────────────── */}
      <SectionCard
        title="Adresse physique & Repère"
        icon={MapPin}
        description="Indiquez l'emplacement de votre atelier, bureau ou point de vente pour guider vos clients."
      >
        <Field label="Adresse détaillée / Indication de repère">
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <textarea
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              rows={2}
              className={`${TEXTAREA} pl-10`}
              placeholder="Ex : Immeuble Nexus, 2ème étage, Face Pharmacie du Port, Cotonou"
            />
          </div>
        </Field>
      </SectionCard>

      {/* ── Horaires d'ouverture ──────────────────────────────────────── */}
      <SectionCard
        title="Horaires d'ouverture"
        icon={Clock}
        description="Définissez vos plages de disponibilité hebdomadaires affichées sur votre profil."
      >
        <div className="divide-y divide-border">
          {DAYS.map(({ day, label }) => {
            const h = getDay(day)
            return (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="w-24 shrink-0 text-sm font-bold text-foreground">{label}</span>
                
                {h.closed ? (
                  <span className="flex-1 text-xs text-slate-400 font-semibold py-1">Fermé au public</span>
                ) : (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="time"
                      value={h.open}
                      onChange={(e) => updateHour(day, { open: e.target.value })}
                      className={`${INPUT} h-10 w-28 text-center text-xs font-bold`}
                    />
                    <span className="text-slate-400 text-xs font-semibold">à</span>
                    <Input
                      type="time"
                      value={h.close}
                      onChange={(e) => updateHour(day, { close: e.target.value })}
                      className={`${INPUT} h-10 w-28 text-center text-xs font-bold`}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                  <span className="text-xs text-slate-400 font-semibold">{h.closed ? "Fermé" : "Ouvert"}</span>
                  <Switch
                    checked={!h.closed}
                    onCheckedChange={(checked: boolean) => updateHour(day, { closed: !checked })}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* ── Catalogue de services ─────────────────────────────────────── */}
      <SectionCard
        title="Catalogue de prestations & Tarifs"
        icon={Sparkles}
        description="Présentez vos services phares avec leurs tarifs indicatifs en FCFA (XOF)."
      >
        <div className="space-y-3">
          {services.length === 0 && (
            <div className="p-6 text-center rounded-2xl bg-muted/60 border border-dashed border-border">
              <p className="text-xs text-muted-foreground font-medium">Aucune prestation configurée pour le moment.</p>
              <p className="text-[11px] text-slate-400 mt-1">Ajoutez vos offres pour valoriser votre profil dans l&apos;annuaire.</p>
            </div>
          )}

          {services.map((service, index) => (
            <div key={index} className="rounded-2xl border border-border/80 bg-muted/50 p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Input
                  value={service.title}
                  onChange={(e) => updateService(index, { title: e.target.value })}
                  className={`${INPUT} bg-card flex-1 font-bold text-sm`}
                  placeholder="Intitulé de la prestation (ex : Création Logo & Charte)"
                />
                <div className="relative w-32 shrink-0">
                  <Input
                    type="number"
                    min={0}
                    value={service.price ?? ""}
                    onChange={(e) => updateService(index, { price: e.target.value === "" ? null : Number(e.target.value) })}
                    className={`${INPUT} bg-card pr-10 text-right font-bold text-sm`}
                    placeholder="Prix"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase pointer-events-none">
                    XOF
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeService(index)}
                  className="h-11 w-11 p-0 shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>

              <Input
                value={service.description}
                onChange={(e) => updateService(index, { description: e.target.value })}
                className={`${INPUT} bg-card text-xs`}
                placeholder="Description sommaire, délai indicatif ou conditions (facultatif)"
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addService}
            className="rounded-xl h-11 gap-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground w-full font-bold hover:bg-muted/70 transition-all shadow-xs"
          >
            <Plus className="h-4 w-4 text-[#013ff4]" />
            Ajouter une prestation
          </Button>
        </div>
      </SectionCard>

      <SaveBar saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
    </div>
  )
}


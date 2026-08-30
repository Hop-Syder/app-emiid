/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Onglet Paramètres « Horaires & Services » : adresse, horaires par jour, catalogue de prestations.
 */

"use client"

import { MapPin, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { UserProfileData, OpeningHour, ServiceItem } from "@/hooks/use-settings"
import { SectionCard, Field, INPUT, SaveBar } from "./settings-primitives"

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
            {/* Adresse */}
            <SectionCard title="Adresse" description="Localisation physique / repère (facultatif).">
                <Field label="Adresse précise / Repère">
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <textarea
                            value={profile.address || ""}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            rows={2}
                            className="w-full rounded-xl bg-muted border border-border pl-10 pr-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-y placeholder:text-slate-400"
                            placeholder="Ex : Rue 123, Akpakpa, non loin de la pharmacie..."
                        />
                    </div>
                </Field>
            </SectionCard>

            {/* Horaires */}
            <SectionCard title="Horaires d'ouverture" description="Définis tes horaires jour par jour.">
                <div className="space-y-2">
                    {DAYS.map(({ day, label }) => {
                        const h = getDay(day)
                        return (
                            <div key={day} className="flex items-center gap-3 py-1.5">
                                <span className="w-20 shrink-0 text-sm font-semibold text-foreground">{label}</span>
                                {h.closed ? (
                                    <span className="flex-1 text-sm text-slate-400 font-medium">Fermé</span>
                                ) : (
                                    <div className="flex-1 flex items-center gap-2">
                                        <Input
                                            type="time"
                                            value={h.open}
                                            onChange={(e) => updateHour(day, { open: e.target.value })}
                                            className={`${INPUT} h-10 w-32`}
                                        />
                                        <span className="text-slate-400 text-sm">→</span>
                                        <Input
                                            type="time"
                                            value={h.close}
                                            onChange={(e) => updateHour(day, { close: e.target.value })}
                                            className={`${INPUT} h-10 w-32`}
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-slate-400">Ouvert</span>
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

            {/* Services */}
            <SectionCard title="Catalogue de services" description="Prestations et tarifs indicatifs (FCFA).">
                <div className="space-y-3">
                    {services.length === 0 && (
                        <p className="text-sm text-slate-400">Aucune prestation. Ajoute ton premier service.</p>
                    )}
                    {services.map((service, index) => (
                        <div key={index} className="rounded-xl border border-border bg-muted/60 p-3.5 space-y-2.5">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={service.title}
                                    onChange={(e) => updateService(index, { title: e.target.value })}
                                    className={`${INPUT} bg-card flex-1`}
                                    placeholder="Intitulé (ex : Costume sur mesure)"
                                />
                                <Input
                                    type="number"
                                    min={0}
                                    value={service.price ?? ""}
                                    onChange={(e) => updateService(index, { price: e.target.value === "" ? null : Number(e.target.value) })}
                                    className={`${INPUT} bg-card w-32`}
                                    placeholder="FCFA"
                                />
                                <Button
                                    variant="ghost"
                                    onClick={() => removeService(index)}
                                    className="h-10 w-10 p-0 shrink-0 text-rose-500 hover:bg-rose-50"
                                    aria-label="Supprimer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Input
                                value={service.description}
                                onChange={(e) => updateService(index, { description: e.target.value })}
                                className={`${INPUT} bg-card`}
                                placeholder="Description courte (facultatif)"
                            />
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        onClick={addService}
                        className="rounded-xl h-11 gap-2 border-dashed border-slate-300 text-muted-foreground w-full"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter une prestation
                    </Button>
                </div>
            </SectionCard>

            <SaveBar saving={saving} handleSave={handleSave} handleCancel={handleCancel} />
        </div>
    )
}

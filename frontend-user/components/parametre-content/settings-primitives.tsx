/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Primitives UI partagées des sections Paramètres (cartes, champs, barre d'actions).
 */

"use client"

import { Button } from "@/components/ui/button"

export const INPUT =
    "h-11 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium text-slate-900 focus:ring-primary/20 transition-all placeholder:text-slate-400"
export const SELECT =
    "w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            {children}
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
    )
}

export function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">{title}</h2>
            {description && <p className="text-xs text-slate-500 mb-4">{description}</p>}
            <div className={description ? "" : "mt-4"}>{children}</div>
        </div>
    )
}

export function SaveBar({
    saving,
    handleSave,
    handleCancel,
}: {
    saving: boolean
    handleSave: () => void
    handleCancel: () => void
}) {
    return (
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
            <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto h-11 rounded-xl border-slate-200 font-bold">
                Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-11 rounded-xl font-bold shadow-sm">
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
        </div>
    )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de progression du tunnel d'onboarding EmiID (3 étapes : Qui / Que / Où).
 */

"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WizardStep {
    id: number
    label: string
    question: string
}

export const WIZARD_STEPS: WizardStep[] = [
    { id: 1, label: "Identité", question: "Qui es-tu ?" },
    { id: 2, label: "Activité", question: "Que fais-tu ?" },
    { id: 3, label: "Localisation", question: "Où es-tu ?" },
]

interface StepIndicatorProps {
    /** Étape courante, indexée à partir de 1 */
    current: number
}

export function StepIndicator({ current }: StepIndicatorProps) {
    const total = WIZARD_STEPS.length

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2.5">
                {WIZARD_STEPS.map((step, index) => {
                    const isDone = step.id < current
                    const isActive = step.id === current
                    return (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <div
                                    className={cn(
                                        "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                        isActive && "bg-[#013ff4] text-white shadow-lg shadow-[#013ff4]/25 scale-110",
                                        isDone && "bg-[#013ff4] text-white",
                                        !isActive && !isDone && "bg-muted text-slate-400",
                                    )}
                                >
                                    {isDone ? <Check className="h-4 w-4" /> : step.id}
                                </div>
                                <span
                                    className={cn(
                                        "text-[11px] font-semibold tracking-wide hidden sm:block",
                                        isActive || isDone ? "text-foreground" : "text-slate-400",
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < total - 1 && (
                                <div className="flex-1 h-0.5 mx-2 sm:mx-3 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full bg-[#013ff4] transition-all duration-500",
                                            step.id < current ? "w-full" : "w-0",
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            <p className="text-center text-xs font-medium text-slate-400 sm:hidden mt-1">
                Étape {current} sur {total}
            </p>
        </div>
    )
}

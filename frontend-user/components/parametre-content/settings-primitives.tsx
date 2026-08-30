/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Primitives UI partagées des sections Paramètres — Inspirées des patterns SwiftUI (Grouped Inset, SettingRow, SettingToggle).
 * @created 2026-06-13
 * @updated 2026-08-30
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export const INPUT =
  "h-11 rounded-2xl bg-slate-50/80 border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#013ff4]/15 focus:border-[#013ff4] transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"

export const SELECT =
  "w-full h-11 px-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#013ff4]/15 focus:border-[#013ff4] transition-all cursor-pointer"

export const TEXTAREA =
  "w-full rounded-2xl bg-slate-50/80 border border-slate-200 px-3.5 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#013ff4]/15 focus:border-[#013ff4] transition-all resize-y placeholder:text-slate-400"

/**
 * Conteneur de section façon SwiftUI Grouped Inset Card
 */
export function SectionCard({
  title,
  description,
  badge,
  icon: Icon,
  footerHint,
  children,
  className,
}: {
  title?: string
  description?: string
  badge?: React.ReactNode
  icon?: React.ElementType
  footerHint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="space-y-1.5">
      {title && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{title}</h2>
          </div>
          {badge}
        </div>
      )}
      <div className={cn("bg-white border border-slate-200/70 rounded-3xl p-4.5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4", className)}>
        {description && <p className="text-xs text-slate-500 -mt-1 mb-2">{description}</p>}
        {children}
      </div>
      {footerHint && <p className="text-[11px] text-slate-400 px-2 leading-relaxed">{footerHint}</p>}
    </div>
  )
}

/**
 * Champ de formulaire standardisé
 */
export function Field({
  label,
  hint,
  counter,
  children,
  className,
}: {
  label: string
  hint?: string
  counter?: string | number
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between px-0.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{label}</label>
        {counter && <span className="text-[10px] font-semibold text-slate-400">{counter}</span>}
      </div>
      {children}
      {hint && <p className="text-xs text-slate-400 px-0.5">{hint}</p>}
    </div>
  )
}

/**
 * Rangée de réglage façon iOS Inset Row (icône colorée + texte + contrôle/chevron)
 */
export function SettingRow({
  icon: Icon,
  iconBg = "bg-slate-100",
  iconColor = "text-slate-600",
  title,
  subtitle,
  rightElement,
  onClick,
  className,
}: {
  icon?: React.ElementType
  iconBg?: string
  iconColor?: string
  title: string
  subtitle?: string
  rightElement?: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  const isClickable = !!onClick
  const Component = isClickable ? "button" : "div"

  return (
    <Component
      type={isClickable ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-3.5 py-3 first:pt-0 last:pb-0 text-left transition-colors",
        isClickable && "hover:bg-slate-50/80 active:bg-slate-100 rounded-2xl px-2 -mx-2",
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {Icon && (
          <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("w-4.5 h-4.5", iconColor)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 leading-snug truncate">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">{subtitle}</p>}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {rightElement}
        {isClickable && !rightElement && <ChevronRight className="w-4 h-4 text-slate-400" />}
      </div>
    </Component>
  )
}

/**
 * Rangée Switch façon iOS Toggle (avec toucher large ≥ 44px)
 */
export function SettingToggle({
  id,
  icon: Icon,
  iconBg = "bg-[#013ff4]/10",
  iconColor = "text-[#013ff4]",
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  id: string
  icon?: React.ElementType
  iconBg?: string
  iconColor?: string
  title: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 cursor-pointer select-none",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {Icon && (
          <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5", iconBg)}>
            <Icon className={cn("w-4.5 h-4.5", iconColor)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 leading-snug">{title}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0"
      />
    </label>
  )
}

/**
 * Barre d'enregistrement responsive
 */
export function SaveBar({
  saving,
  handleSave,
  handleCancel,
  saveLabel = "Enregistrer les modifications",
}: {
  saving: boolean
  handleSave: () => void
  handleCancel: () => void
  saveLabel?: string
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
        className="w-full sm:w-auto h-11 px-5 rounded-2xl border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-all"
      >
        Annuler
      </Button>
      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-[#013ff4] hover:bg-[#033a7a] text-white font-bold shadow-md shadow-[#013ff4]/15 active:scale-[0.98] transition-all"
      >
        {saving ? "Enregistrement..." : saveLabel}
      </Button>
    </div>
  )
}


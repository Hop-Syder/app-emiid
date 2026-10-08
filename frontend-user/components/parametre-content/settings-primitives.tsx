/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Primitives UI partagées des sections Paramètres — Inspirées des standards SaaS premium (Plus Jakarta Sans, surfaces douces, rounded-2xl & rounded-xl).
 * @created 2026-06-13
 * @updated 2026-09-16
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ChevronRight, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchWithAuth } from "@/lib/apiClient"

export const INPUT =
  "h-11 px-3.5 rounded-xl bg-muted/40 border border-border/80 text-sm font-medium text-foreground focus:bg-card focus:ring-4 focus:ring-[#013ff4]/10 focus:border-[#013ff4] transition-all placeholder:text-muted-foreground/60 disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs"

export const SELECT =
  "w-full h-11 px-3.5 rounded-xl bg-muted/40 border border-border/80 text-sm font-medium text-foreground focus:bg-card focus:outline-none focus:ring-4 focus:ring-[#013ff4]/10 focus:border-[#013ff4] transition-all cursor-pointer shadow-2xs"

export const TEXTAREA =
  "w-full rounded-xl bg-muted/40 border border-border/80 px-3.5 py-3 text-sm font-medium text-foreground focus:bg-card focus:outline-none focus:ring-4 focus:ring-[#013ff4]/10 focus:border-[#013ff4] transition-all resize-y placeholder:text-muted-foreground/60 shadow-2xs"

/**
 * Conteneur de section moderne avec bordures douces et en-tête intégré
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
    <div className="space-y-2">
      <div className={cn("bg-card border border-border/70 rounded-2xl shadow-xs overflow-hidden", className)}>
        {title && (
          <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-5 sm:px-6 py-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {Icon && (
                <div className="w-7 h-7 rounded-lg bg-[#0150fd]/10 text-[#0150fd] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <h2 className="text-xs font-bold text-foreground tracking-wider uppercase truncate">
                {title}
              </h2>
            </div>
            {badge}
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {description && <p className="text-xs text-muted-foreground leading-relaxed -mt-1">{description}</p>}
          {children}
        </div>
      </div>
      {footerHint && <p className="text-xs text-muted-foreground px-1.5 leading-relaxed">{footerHint}</p>}
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
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">{label}</label>
        {counter && <span className="text-[10px] font-semibold text-slate-400">{counter}</span>}
      </div>
      {children}
      {hint && <p className="text-xs text-slate-400 px-0.5">{hint}</p>}
    </div>
  )
}

/**
 * Rangée de réglage fluide (icône colorée + texte + contrôle/chevron)
 */
export function SettingRow({
  icon: Icon,
  iconBg = "bg-muted",
  iconColor = "text-muted-foreground",
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
        isClickable && "hover:bg-muted/60 active:bg-muted/80 rounded-xl px-3 -mx-3",
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {Icon && (
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("w-4.5 h-4.5", iconColor)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground leading-snug truncate">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">{subtitle}</p>}
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
 * Rangée Switch avec toucher ergonomique
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
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", iconBg)}>
            <Icon className={cn("w-4.5 h-4.5", iconColor)} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground leading-snug">{title}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
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
 * Sélecteur segmenté avec capsule douce
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  disabled,
  className,
}: {
  value: T
  options: { label: string; value: T; icon?: React.ElementType }[]
  onChange: (val: T) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "w-full p-1 bg-muted/60 rounded-xl flex gap-1 border border-border/60",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value
        const Icon = opt.icon
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            disabled={disabled}
            className={cn(
              "flex-1 h-10 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none",
              isSelected
                ? "bg-card text-foreground shadow-xs border border-border/50 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
            )}
          >
            {Icon && <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-[#0150fd]" : "text-muted-foreground")} />}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Champ de saisie d'identifiant / pseudo avec préfixe emiid.com/ et vérification en temps réel
 */
export function SlugInput({
  value,
  onChange,
  disabled,
  placeholder = "votre-pseudo",
  className,
}: {
  value: string
  onChange: (slug: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}) {
  const sanitize = (raw: string) =>
    raw
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 30)

  // Filtre local instantané (évite un aller-retour réseau pour les cas triviaux)
  const reserved = ["admin", "root", "support", "emiid", "moderateur", "contact", "api"]
  const trimmed = (value || "").trim().toLowerCase()
  const isTooShort = trimmed.length < 3
  const isReserved = reserved.includes(trimmed)

  const [checking, setChecking] = useState(false)
  const [remoteAvailable, setRemoteAvailable] = useState<boolean | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isTooShort || isReserved) {
      setRemoteAvailable(null)
      setChecking(false)
      return
    }

    setChecking(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetchWithAuth(`/api/users/check-slug?slug=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        setRemoteAvailable(res.ok ? Boolean(data.available) : null)
      } catch {
        setRemoteAvailable(null)
      } finally {
        setChecking(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [trimmed, isTooShort, isReserved])

  const isTaken = isReserved || remoteAvailable === false
  const isAvailable = !isTooShort && !checking && !isTaken

  const suggestions = isTaken
    ? [`${trimmed}-pro`, `${trimmed}229`, `${trimmed}-bj`]
    : []

  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        className={cn(
          "w-full h-11 rounded-xl bg-muted/40 border border-border/80 flex items-center px-3.5 text-sm font-medium transition-all focus-within:bg-card focus-within:ring-4 focus-within:ring-[#0150fd]/10 focus-within:border-[#0150fd] shadow-2xs",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <span className="text-slate-400 font-semibold select-none shrink-0 pr-1 text-xs sm:text-sm">
          emiid.com/
        </span>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(sanitize(e.target.value))}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-foreground font-semibold placeholder:text-slate-400 text-xs sm:text-sm min-w-0"
        />

        {/* Indicateur de disponibilité */}
        {!isTooShort && (
          <div className="shrink-0 pl-2">
            {checking ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-muted border border-border px-2 py-0.5 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                Vérification...
              </span>
            ) : isAvailable ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                <Check className="w-3 h-3 text-emerald-600" />
                Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full">
                <X className="w-3 h-3 text-rose-600" />
                Déjà pris
              </span>
            )}
          </div>
        )}
      </div>

      {/* Suggestions cliquables si déjà pris */}
      {isTaken && suggestions.length > 0 && (
        <div className="flex items-center gap-1.5 px-1 pt-0.5 text-xs text-muted-foreground flex-wrap">
          <span className="text-slate-400">Suggestions :</span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onChange(sug)}
              className="text-[#0150fd] hover:underline font-semibold bg-blue-50/80 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg text-[11px] cursor-pointer"
            >
              @{sug}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Sélecteur et saisie de tags / mots-clés amovibles avec limite maximale
 */
export function TagsInput({
  tags,
  onChange,
  maxTags = 8,
  placeholder = "Ajouter un mot-clé…",
  disabled,
  className,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [inputValue, setInputValue] = React.useState("")

  const addTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#/, "")
    if (!clean) return
    if (tags.length >= maxTags) return
    if (tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setInputValue("")
      return
    }
    onChange([...tags, clean])
    setInputValue("")
  }

  const removeTag = (idxToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== idxToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div
      className={cn(
        "min-h-[44px] w-full rounded-xl bg-muted/40 border border-border/80 p-2 flex flex-wrap items-center gap-1.5 focus-within:bg-card focus-within:ring-4 focus-within:ring-[#0150fd]/10 focus-within:border-[#0150fd] transition-all shadow-2xs",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {tags.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0150fd]/10 border border-[#0150fd]/20 text-[#0150fd] text-xs font-bold shadow-2xs animate-in fade-in zoom-in-95 duration-150"
        >
          <span>#{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(idx)}
              aria-label={`Supprimer ${tag}`}
              className="hover:bg-[#0150fd]/20 rounded-md p-0.5 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3 text-[#0150fd]" />
            </button>
          )}
        </span>
      ))}

      {tags.length < maxTags && !disabled && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={tags.length === 0 ? placeholder : "Ajouter..."}
          className="flex-1 min-w-[120px] bg-transparent text-xs sm:text-sm font-medium outline-none text-foreground placeholder:text-slate-400 px-1"
        />
      )}
    </div>
  )
}

/**
 * Barre de sauvegarde sticky en bas de page (Desktop et Mobile)
 */
export function StickySaveBar({
  saving,
  modifiedCount,
  handleSave,
  handleCancel,
  saveLabel = "Enregistrer les modifications",
  className,
}: {
  saving: boolean
  modifiedCount: number
  handleSave: () => void
  handleCancel: () => void
  saveLabel?: string
  className?: string
}) {
  const isDirty = modifiedCount > 0

  return (
    <div
      className={cn(
        "sticky bottom-4 z-40 bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 transition-all duration-300",
        className
      )}
    >
      {/* État / Compteur de modifications */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0 animate-pulse",
            isDirty ? "bg-amber-500 ring-4 ring-amber-500/20" : "bg-emerald-500 ring-4 ring-emerald-500/20"
          )}
        />
        <p className="text-xs sm:text-sm font-bold text-foreground truncate">
          {isDirty
            ? `${modifiedCount} modification${modifiedCount > 1 ? "s" : ""} non enregistrée${modifiedCount > 1 ? "s" : ""}`
            : "Toutes les modifications sont enregistrées"}
        </p>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={!isDirty || saving}
          className="h-10 px-4 rounded-xl border-border text-foreground font-bold hover:bg-muted text-xs sm:text-sm transition-all disabled:opacity-40"
        >
          Annuler
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={cn(
            "h-10 px-5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all",
            isDirty
              ? "bg-[#0150fd] hover:bg-[#003ec7] shadow-[#0150fd]/25 cursor-pointer"
              : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-50 shadow-none"
          )}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
            </span>
          ) : (
            saveLabel
          )}
        </Button>
      </div>
    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Modèles d'annonces — enregistrer un message et le réutiliser.
 *
 *              Partagé par les deux onglets : notifications internes et
 *              campagnes e-mail. Le modèle conserve le texte ET le ciblage, de
 *              sorte que le réutiliser restitue l'envoi complet, pas seulement
 *              son contenu.
 * @created 2026-08-29
 */

"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { BookmarkPlus, FileText, Loader2, Trash2, RotateCcw } from "lucide-react"
import {
  listTemplates,
  saveTemplate,
  deleteTemplate,
  markTemplateUsed,
  type MessageTemplate,
} from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TemplatePanelProps {
  channel: "inapp" | "email"
  /** Contenu courant du formulaire, pour l'enregistrer tel quel. */
  current: {
    subject: string
    content: string
    segment?: string | null
    criteria?: Record<string, unknown> | null
    link?: string | null
  }
  /** Recharge un modèle dans le formulaire appelant. */
  onApply: (template: MessageTemplate) => void
}

export function TemplatePanel({ channel, current, onApply }: TemplatePanelProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [showSave, setShowSave] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setTemplates(await listTemplates(channel))
    } finally {
      setLoading(false)
    }
  }, [channel])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleSave = async () => {
    if (!current.subject?.trim() || !current.content?.trim()) {
      toast.error("Rédigez l'annonce avant de l'enregistrer")
      return
    }
    setSaving(true)
    try {
      const res = await saveTemplate({
        name: name.trim() || current.subject.trim().slice(0, 60),
        channel,
        subject: current.subject,
        content: current.content,
        segment: current.segment ?? null,
        criteria: current.criteria ?? null,
        link: current.link ?? null,
      })
      if (!res.success) {
        toast.error(res.error || "Enregistrement impossible")
        return
      }
      toast.success("Modèle enregistré")
      setName("")
      setShowSave(false)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleApply = async (tpl: MessageTemplate) => {
    onApply(tpl)
    toast.success(`« ${tpl.name} » chargé`)
    // Compteur d'usage : sans effet sur l'envoi, d'où l'absence d'attente.
    void markTemplateUsed(tpl.id).then(refresh)
  }

  const handleDelete = async (tpl: MessageTemplate) => {
    const res = await deleteTemplate(tpl.id)
    if (!res.success) {
      toast.error(res.error || "Suppression impossible")
      return
    }
    toast.success("Modèle supprimé")
    await refresh()
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-slate-100">
          <FileText className="h-4 w-4 text-[#013ff4]" />
          Mes modèles
          {templates.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
              {templates.length}
            </span>
          )}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSave((v) => !v)}
          className="h-8 rounded-xl text-xs font-bold"
        >
          <BookmarkPlus className="mr-1.5 h-3.5 w-3.5" />
          Enregistrer celui-ci
        </Button>
      </div>

      {showSave && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du modèle (facultatif — l'objet sera repris)"
            className="h-9 flex-1 rounded-xl text-xs"
          />
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-9 rounded-xl text-xs font-bold"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enregistrer"}
          </Button>
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        {loading ? (
          <div className="h-9 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        ) : templates.length === 0 ? (
          <p className="text-xs font-medium text-slate-400">
            Aucun modèle pour l&apos;instant. Rédigez une annonce, puis enregistrez-la
            pour la renvoyer plus tard sans tout retaper.
          </p>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{tpl.name}</p>
                <p className="truncate text-[11px] text-slate-400">
                  {tpl.subject}
                  {tpl.use_count > 0 && ` · utilisé ${tpl.use_count} fois`}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleApply(tpl)}
                className="h-7 shrink-0 rounded-lg text-[11px] font-bold text-[#013ff4]"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Réutiliser
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(tpl)}
                aria-label={`Supprimer ${tpl.name}`}
                className="h-7 w-7 shrink-0 rounded-lg p-0 text-slate-300 hover:text-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Diffusion d'annonces (notifications) à un segment d'utilisateurs.
 * @created 2026-07-08
 */

"use client"

import { useState } from "react"
import { Megaphone, Send, Loader2, Users, CheckCircle2, Globe, Crown, BadgeCheck, Ban, Mail } from "lucide-react"
import { toast } from "sonner"
import { broadcastAnnouncement, type BroadcastSegment } from "@/lib/actions/admin"
import { fetchWithAuth } from "@/lib/apiClient"

const SEGMENTS: { id: BroadcastSegment; label: string; desc: string; icon: typeof Users }[] = [
  { id: "all",       label: "Tous les utilisateurs", desc: "Chaque compte de la plateforme", icon: Users },
  { id: "published", label: "Profils publiés",       desc: "Comptes visibles dans l'annuaire", icon: Globe },
  { id: "verified",  label: "Comptes vérifiés",      desc: "Utilisateurs avec badge vérifié", icon: BadgeCheck },
  { id: "premium",   label: "Membres Premium",       desc: "Abonnés Premium uniquement", icon: Crown },
  { id: "suspended", label: "Comptes suspendus",     desc: "Utilisateurs actuellement suspendus", icon: Ban },
]

export function BroadcastClient() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [link, setLink] = useState("")
  const [segment, setSegment] = useState<BroadcastSegment>("all")
  const [alsoEmail, setAlsoEmail] = useState(false)
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<number | null>(null)

  const canSend = title.trim().length > 0 && content.trim().length > 0 && !sending

  const handleSend = async () => {
    if (!canSend) return
    const segLabel = SEGMENTS.find((s) => s.id === segment)?.label ?? segment
    if (!confirm(`Envoyer cette annonce à « ${segLabel} » ?\nCette action notifie tous les destinataires du segment.`)) return
    setSending(true)
    setLastResult(null)
    try {
      const res = await broadcastAnnouncement({ title, content, segment, link: link || undefined })
      if (!res.success) { toast.error(res.error || "Échec de l'envoi"); return }
      setLastResult(res.count)
      toast.success(`Annonce envoyée à ${res.count} destinataire(s)`)

      // Campagne email (opt-in newsletter) via le backend SMTP.
      if (alsoEmail) {
        try {
          const emailRes = await fetchWithAuth("/api/admin/broadcast-email", {
            method: "POST",
            body: JSON.stringify({ title, content, segment, link: link || undefined }),
          })
          const emailData = await emailRes.json()
          if (!emailRes.ok) {
            toast.error(emailData?.error || "Échec de la campagne email")
          } else if (emailData.sent === 0) {
            toast.info(emailData.message || "Aucun abonné newsletter dans ce segment")
          } else {
            toast.success(`Campagne email : ${emailData.sent} envoyé(s)${emailData.failed ? `, ${emailData.failed} échec(s)` : ""}`)
          }
        } catch {
          toast.error("Backend injoignable pour la campagne email")
        }
      }

      setTitle(""); setContent(""); setLink("")
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#013ff4]/10 flex items-center justify-center">
          <Megaphone className="h-5 w-5 text-[#013ff4]" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Annonces</h1>
          <p className="text-slate-500 text-sm mt-0.5">Diffusez une notification à un segment d&apos;utilisateurs</p>
        </div>
      </header>

      {lastResult !== null && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Dernière annonce envoyée à {lastResult} destinataire(s).
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {/* Segment */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Destinataires</label>
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            {SEGMENTS.map((s) => {
              const active = segment === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSegment(s.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                    active ? "border-[#013ff4] bg-[#013ff4]/5 ring-1 ring-[#013ff4]/20" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <s.icon className={`h-5 w-5 shrink-0 mt-0.5 ${active ? "text-[#013ff4]" : "text-slate-400"}`} />
                  <div>
                    <p className={`text-sm font-bold ${active ? "text-[#013ff4]" : "text-slate-800"}`}>{s.label}</p>
                    <p className="text-[11px] text-slate-400">{s.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Titre */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Ex. Nouvelle fonctionnalité disponible"
            className="mt-2 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
          />
          <p className="text-[10px] text-slate-400 mt-1 text-right">{title.length}/120</p>
        </div>

        {/* Message */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Contenu de l'annonce…"
            className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
          />
        </div>

        {/* Lien (optionnel) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Lien (optionnel)</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/creer-profil ou https://…"
            className="mt-2 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
          />
        </div>

        {/* Envoi email (opt-in newsletter) */}
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={alsoEmail}
            onChange={(e) => setAlsoEmail(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#013ff4]"
          />
          <span className="flex items-start gap-2">
            <Mail className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
            <span>
              <span className="block text-sm font-bold text-slate-800">Envoyer aussi par email</span>
              <span className="block text-[11px] text-slate-400">
                Uniquement aux membres du segment abonnés à la newsletter (opt-in). Limité à 5 campagnes par heure.
              </span>
            </span>
          </span>
        </label>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#013ff4] text-white rounded-xl text-sm font-semibold hover:bg-[#012fc0] transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Envoyer l&apos;annonce
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        L&apos;annonce apparaît dans les notifications in-app des destinataires. Chaque envoi est enregistré dans le journal d&apos;audit.
      </p>
    </div>
  )
}

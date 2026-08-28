/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Diffusion d'annonces (notifications) à un segment d'utilisateurs.
 * @created 2026-07-08
 * @updated 2026-07-11
 */

"use client"

import { useEffect, useMemo, useState } from "react"
import { Megaphone, Send, Loader2, Users, CheckCircle2, Globe, Crown, BadgeCheck, Ban, AlertTriangle, Link2, History, Sparkles, XCircle, CalendarClock, Clock, X } from "lucide-react"
import { toast } from "sonner"
import { TemplatePanel } from "@/components/annonces/template-panel"
import {
  broadcastAnnouncement, countSegment, getAuditLog, getBroadcastReadCounts,
  scheduleBroadcast, listScheduledBroadcasts, cancelScheduledBroadcast,
  type BroadcastSegment, type AuditLogEntry, type ScheduledBroadcast,
} from "@/lib/actions/admin"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"

const SEGMENTS: { id: BroadcastSegment; label: string; desc: string; icon: typeof Users }[] = [
  { id: "all",       label: "Tous les utilisateurs", desc: "Chaque compte de la plateforme", icon: Users },
  { id: "published", label: "Profils publiés",       desc: "Comptes visibles dans l'annuaire", icon: Globe },
  { id: "verified",  label: "Comptes vérifiés",      desc: "Utilisateurs avec badge vérifié", icon: BadgeCheck },
  { id: "premium",   label: "Membres Premium",       desc: "Abonnés Premium uniquement", icon: Crown },
  { id: "suspended", label: "Comptes suspendus",     desc: "Utilisateurs actuellement suspendus", icon: Ban },
]
const SEGMENT_LABEL: Record<string, string> = Object.fromEntries(SEGMENTS.map((s) => [s.id, s.label]))

// Templates pré-remplis (P2 #9) — cohérence de ton + adoption admin.
const TEMPLATES: { id: string; label: string; title: string; content: string; link?: string }[] = [
  { id: "feature", label: "Nouvelle fonctionnalité", title: "Nouvelle fonctionnalité disponible 🎉", content: "Nous venons de lancer une nouveauté sur EmiID. Découvrez-la dès maintenant depuis votre tableau de bord.", link: "/dashboard-user" },
  { id: "premium", label: "Offre Premium", title: "Passez à EmiID Premium", content: "Boostez votre visibilité : profil mis en avant, badge et statistiques avancées. Profitez de l'offre Premium.", link: "/premium" },
  { id: "maintenance", label: "Maintenance", title: "Maintenance planifiée", content: "Une maintenance est prévue prochainement. Le service pourra être momentanément indisponible. Merci de votre compréhension." },
]

// Routes internes suggérées pour le champ lien (P1 #3).
const INTERNAL_ROUTES = ["/dashboard-user", "/creer-profil", "/premium", "/annuaire", "/portefeuille", "/messages", "/parametres"]

const fmt = (n: number) => n.toLocaleString("fr-FR")

// Validation du lien : vide OK ; route interne (commence par "/") OK ; sinon https:// valide requis.
function linkError(raw: string): string | null {
  const v = raw.trim()
  if (!v) return null
  if (v.startsWith("/")) return null
  try {
    const u = new URL(v)
    if (u.protocol !== "https:") return "Le lien externe doit commencer par https://"
    return null
  } catch {
    return "Lien invalide : utilisez une route interne (/premium) ou une URL https://"
  }
}

function timeAgo(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

export function BroadcastClient() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [link, setLink] = useState("")
  const [segment, setSegment] = useState<BroadcastSegment>("all")
  const [sending, setSending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lastResult, setLastResult] = useState<number | null>(null)

  // Programmation (P2 #11)
  const [scheduleMode, setScheduleMode] = useState(false)
  const [scheduledFor, setScheduledFor] = useState("")
  const [scheduled, setScheduled] = useState<ScheduledBroadcast[]>([])

  // Portée par segment (nombre de destinataires) — chargée à l'ouverture.
  const [counts, setCounts] = useState<Partial<Record<BroadcastSegment, number>>>({})
  const [countsLoading, setCountsLoading] = useState(true)

  // Historique des annonces (P1 #2) — surfacé depuis le journal d'audit.
  const [history, setHistory] = useState<AuditLogEntry[]>([])
  // Taux de lecture par campagne (P2 #10) : broadcast_id → nb de notifs lues.
  const [readCounts, setReadCounts] = useState<Record<string, number>>({})

  const loadCounts = async () => {
    setCountsLoading(true)
    try {
      const entries = await Promise.all(
        SEGMENTS.map(async (s) => [s.id, (await countSegment(s.id)).count] as const),
      )
      setCounts(Object.fromEntries(entries) as Record<BroadcastSegment, number>)
    } catch {
      /* silencieux : les compteurs restent indisponibles */
    } finally {
      setCountsLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const entries = await getAuditLog({ action: "broadcast", limit: 8 })
      setHistory(entries)
      const ids = entries
        .map((e) => (e.details as { broadcast_id?: string }).broadcast_id)
        .filter((v): v is string => !!v)
      if (ids.length) setReadCounts(await getBroadcastReadCounts(ids))
    } catch {
      /* silencieux */
    }
  }

  const loadScheduled = async () => {
    try {
      setScheduled(await listScheduledBroadcasts())
    } catch {
      /* silencieux */
    }
  }

  useEffect(() => { loadCounts(); loadHistory(); loadScheduled() }, [])

  const reach = counts[segment]
  const linkErr = useMemo(() => linkError(link), [link])
  const scheduleErr = scheduleMode && (!scheduledFor || new Date(scheduledFor).getTime() < Date.now() + 60_000)
  const canSend = title.trim().length > 0 && content.trim().length > 0 && !linkErr && !scheduleErr && !sending
  const segLabel = SEGMENTS.find((s) => s.id === segment)?.label ?? segment

  const applyTemplate = (t: (typeof TEMPLATES)[number]) => {
    setTitle(t.title); setContent(t.content); setLink(t.link ?? "")
  }

  const doSend = async () => {
    setSending(true)
    setLastResult(null)
    try {
      if (scheduleMode) {
        const res = await scheduleBroadcast({ title, content, segment, link: link || undefined, scheduledFor })
        if (!res.success) { toast.error(res.error || "Échec de la programmation"); return }
        toast.success("Annonce programmée")
        setTitle(""); setContent(""); setLink(""); setScheduledFor(""); setScheduleMode(false)
        setConfirmOpen(false)
        loadScheduled()
        return
      }
      const res = await broadcastAnnouncement({ title, content, segment, link: link || undefined })
      if (!res.success) { toast.error(res.error || "Échec de l'envoi"); return }
      setLastResult(res.count)
      toast.success(`Annonce envoyée à ${fmt(res.count)} destinataire(s)`)
      setTitle(""); setContent(""); setLink("")
      setConfirmOpen(false)
      loadHistory()
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setSending(false)
    }
  }

  const doCancel = async (id: string) => {
    const res = await cancelScheduledBroadcast(id)
    if (!res.success) { toast.error(res.error || "Annulation impossible"); return }
    toast.success("Programmation annulée")
    loadScheduled()
  }

  return (
    <div className="space-y-6 max-w-5xl">
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
          <CheckCircle2 className="h-4 w-4" /> Dernière annonce envoyée à {fmt(lastResult)} destinataire(s).
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          {/* Templates */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-[#013ff4]" /> Modèles
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-[#013ff4] hover:text-[#013ff4] hover:bg-[#013ff4]/5 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Segment */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Destinataires</label>
            <div className="grid sm:grid-cols-2 gap-2 mt-2">
              {SEGMENTS.map((s) => {
                const active = segment === s.id
                const c = counts[s.id]
                return (
                  <button
                    key={s.id}
                    onClick={() => setSegment(s.id)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      active ? "border-[#013ff4] bg-[#013ff4]/5 ring-1 ring-[#013ff4]/20" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <s.icon className={`h-5 w-5 shrink-0 mt-0.5 ${active ? "text-[#013ff4]" : "text-slate-400"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-bold truncate ${active ? "text-[#013ff4]" : "text-slate-800"}`}>{s.label}</p>
                        <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          active ? "bg-[#013ff4]/10 text-[#013ff4]" : "bg-slate-100 text-slate-500"
                        }`}>
                          {countsLoading ? "…" : c !== undefined ? fmt(c) : "—"}
                        </span>
                      </div>
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
              maxLength={500}
              placeholder="Contenu de l'annonce…"
              className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">{content.length}/500</p>
          </div>

          {/* Lien (optionnel) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Lien (optionnel)</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              list="broadcast-internal-routes"
              placeholder="/premium ou https://…"
              className={`mt-2 w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                linkErr ? "border-red-300 focus:ring-red-300/40" : "border-slate-200 focus:ring-[#013ff4]/30"
              }`}
            />
            <datalist id="broadcast-internal-routes">
              {INTERNAL_ROUTES.map((r) => <option key={r} value={r} />)}
            </datalist>
            {linkErr && (
              <p className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1.5">
                <XCircle className="h-3 w-3" /> {linkErr}
              </p>
            )}
          </div>

          {/* Timing : envoi immédiat ou programmé */}
          <div>
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setScheduleMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  !scheduleMode ? "bg-white text-[#013ff4] shadow-sm" : "text-slate-500"
                }`}
              >
                <Send className="h-3.5 w-3.5" /> Immédiat
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  scheduleMode ? "bg-white text-[#013ff4] shadow-sm" : "text-slate-500"
                }`}
              >
                <CalendarClock className="h-3.5 w-3.5" /> Programmer
              </button>
            </div>
            {scheduleMode && (
              <input
                type="datetime-local"
                value={scheduledFor}
                min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="mt-2 w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
              />
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!canSend}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#013ff4] text-white rounded-xl text-sm font-semibold hover:bg-[#012fc0] transition-colors disabled:opacity-50"
            >
              {scheduleMode ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {scheduleMode ? "Programmer l'envoi" : "Vérifier et envoyer"}
            </button>
          </div>
        </div>

        {/* Aperçu live (glassmorphism) */}
        <aside className="lg:sticky lg:top-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Aperçu</p>
          <div className="rounded-2xl border border-slate-200/70 bg-white/60 backdrop-blur-md p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#013ff4]/10 flex items-center justify-center shrink-0">
                <Megaphone className="h-4 w-4 text-[#013ff4]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 break-words">
                  {title.trim() || <span className="text-slate-300">Titre de l&apos;annonce</span>}
                </p>
                <p className="text-xs text-slate-600 mt-1 whitespace-pre-line break-words">
                  {content.trim() || <span className="text-slate-300">Le message apparaîtra ici…</span>}
                </p>
                {link.trim() && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#013ff4]">
                    <Link2 className="h-3 w-3" /> {link.trim()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Tel qu&apos;affiché dans les notifications in-app. Chaque envoi est enregistré dans le journal d&apos;audit.
          </p>
        </aside>
      </div>

      {/* Annonces programmées (P2 #11) */}
      {scheduled.length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
            <CalendarClock className="h-4 w-4 text-slate-400" /> Programmées
          </h2>
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {scheduled.map((s) => {
              const when = new Date(s.scheduled_for).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
              const seg = SEGMENT_LABEL[s.segment] ?? s.segment
              const statusStyle =
                s.status === "pending" ? "text-[#013ff4] bg-[#013ff4]/10"
                : s.status === "sent" ? "text-emerald-600 bg-emerald-50"
                : s.status === "failed" ? "text-red-600 bg-red-50"
                : "text-slate-400 bg-slate-100"
              const statusLabel =
                s.status === "pending" ? "en attente" : s.status === "sent" ? "envoyée" : s.status === "failed" ? "échouée" : "annulée"
              return (
                <li key={s.id} className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{s.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{when} · {seg}{s.created_by_email ? ` · ${s.created_by_email}` : ""}</p>
                    {s.status === "failed" && s.error && (
                      <p className="text-[11px] text-red-500 mt-0.5 truncate">{s.error}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle}`}>{statusLabel}</span>
                  {s.status === "pending" && (
                    <button
                      onClick={() => doCancel(s.id)}
                      className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Annuler la programmation"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Modèles réutilisables : enregistrer l'annonce courante, ou en
          recharger une déjà envoyée avec son ciblage. */}
      <TemplatePanel
        channel="inapp"
        current={{ subject: title, content, segment, link: link || null }}
        onApply={(tpl) => {
          setTitle(tpl.subject)
          setContent(tpl.content)
          if (tpl.segment) setSegment(tpl.segment as BroadcastSegment)
          setLink(tpl.link || "")
        }}
      />

      {/* Historique des annonces (P1 #2) */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
          <History className="h-4 w-4 text-slate-400" /> Dernières annonces
        </h2>
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
            Aucune annonce envoyée pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {history.map((h) => {
              const d = h.details as { title?: string; segment?: string; count?: number; total?: number; partial?: boolean; broadcast_id?: string }
              const seg = d.segment ? (SEGMENT_LABEL[d.segment] ?? d.segment) : "—"
              const sent = d.count ?? 0
              const read = d.broadcast_id ? readCounts[d.broadcast_id] : undefined
              const rate = read !== undefined && sent > 0 ? Math.round((read / sent) * 100) : undefined
              return (
                <li key={h.id} className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#013ff4]/10 flex items-center justify-center shrink-0">
                    <Megaphone className="h-4 w-4 text-[#013ff4]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{d.title || "(sans titre)"}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {timeAgo(h.created_at)} · {seg}
                      {h.admin_email ? ` · ${h.admin_email}` : ""}
                    </p>
                    {rate !== undefined && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-[#013ff4]" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">
                          {fmt(read ?? 0)} lue{(read ?? 0) > 1 ? "s" : ""}
                          <span className="font-medium text-slate-400"> · {fmt(Math.max(0, sent - (read ?? 0)))} non lue{sent - (read ?? 0) > 1 ? "s" : ""} · {rate}%</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold ${d.partial ? "text-amber-600" : "text-emerald-600"}`}>
                      {fmt(sent)}{d.total !== undefined && d.total !== sent ? `/${fmt(d.total)}` : ""}
                    </span>
                    <p className="text-[10px] text-slate-400">{d.partial ? "partiel" : "envoyés"}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Modale de confirmation — portée + aperçu */}
      <Dialog open={confirmOpen} onOpenChange={(o) => { if (!sending) setConfirmOpen(o) }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {scheduleMode
                ? <><CalendarClock className="h-5 w-5 text-[#013ff4]" /> Confirmer la programmation</>
                : <><AlertTriangle className="h-5 w-5 text-amber-500" /> Confirmer la diffusion</>}
            </DialogTitle>
            <DialogDescription>
              {scheduleMode ? (
                <>
                  Programmée pour le{" "}
                  <strong className="text-slate-900">
                    {scheduledFor ? new Date(scheduledFor).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" }) : "—"}
                  </strong>
                  {reach !== undefined ? <> · ~{fmt(reach)} destinataire(s)</> : null} du segment «&nbsp;{segLabel}&nbsp;».
                </>
              ) : (
                <>
                  Vous allez notifier{" "}
                  <strong className="text-slate-900">
                    {reach !== undefined ? `${fmt(reach)} destinataire(s)` : "les utilisateurs"}
                  </strong>{" "}
                  du segment «&nbsp;{segLabel}&nbsp;». Cette action est irréversible.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-sm font-bold text-slate-900 break-words">{title.trim()}</p>
            <p className="text-xs text-slate-600 mt-1 whitespace-pre-line break-words">{content.trim()}</p>
            {link.trim() && (
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#013ff4]">
                <Link2 className="h-3 w-3" /> {link.trim()}
              </span>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              disabled={sending}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={doSend}
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#013ff4] text-white rounded-xl text-sm font-semibold hover:bg-[#012fc0] transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : (scheduleMode ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />)}
              {scheduleMode ? "Programmer" : "Envoyer maintenant"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

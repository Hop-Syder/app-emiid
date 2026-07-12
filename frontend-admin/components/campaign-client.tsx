/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Campagnes ciblées — Annonce In-App & Mailing. Éditeur double mode
 *              (visuel léger / HTML brut), ciblage multicritère + audience en direct.
 * @created 2026-07-12
 */

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Megaphone, Mail, Send, Loader2, Users, CheckCircle2, AlertTriangle, History,
  Bold, Italic, List, Code2, Eye, X, Search, BadgeCheck, Crown, UserPlus, UserX,
} from "lucide-react"
import { toast } from "sonner"
import {
  sendCampaign, countAudience, searchCampaignUsers, getAuditLog,
  type AudienceCriteria, type CampaignRecipient, type AuditLogEntry,
} from "@/lib/actions/admin"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"

type Channel = "inapp" | "email"
type EditorMode = "visual" | "html"

const CRITERIA: { id: keyof AudienceCriteria; label: string; desc: string; icon: typeof Users }[] = [
  { id: "verified", label: "Vérifiés", desc: "is_verified = true", icon: BadgeCheck },
  { id: "premium",  label: "Premium",  desc: "is_premium = true", icon: Crown },
  { id: "standard", label: "Standard", desc: "is_premium = false", icon: Users },
  { id: "newUsers", label: "Nouveaux inscrits", desc: "< 30 jours", icon: UserPlus },
  { id: "inactive", label: "Inactifs", desc: "> 60 jours sans maj", icon: UserX },
]

const fmt = (n: number) => n.toLocaleString("fr-FR")

function parseEmails(raw: string): string[] {
  return raw.split(/[\s,;]+/).map((e) => e.trim()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
}

// Conversion « visuel » (markdown léger) → HTML sûr (échappé).
function visualToHtml(text: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const lines = text.split("\n")
  const out: string[] = []
  let inList = false
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
  for (const line of lines) {
    if (/^\s*-\s+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true }
      out.push(`<li>${inline(line.replace(/^\s*-\s+/, ""))}</li>`)
    } else {
      if (inList) { out.push("</ul>"); inList = false }
      if (line.trim()) out.push(`<p>${inline(line)}</p>`)
    }
  }
  if (inList) out.push("</ul>")
  return `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;color:#0f172a;line-height:1.6">${out.join("")}</div>`
}

export function CampaignClient() {
  const [channel, setChannel] = useState<Channel>("inapp")
  const [subject, setSubject] = useState("")
  const [editorMode, setEditorMode] = useState<EditorMode>("visual")
  const [content, setContent] = useState("")
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const [criteria, setCriteria] = useState<Record<string, boolean>>({})
  const [manualEmails, setManualEmails] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<CampaignRecipient[]>([])

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CampaignRecipient[]>([])
  const [searching, setSearching] = useState(false)

  const [audience, setAudience] = useState<{ count: number; withAccount: number } | null>(null)
  const [audLoading, setAudLoading] = useState(false)

  const [sending, setSending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [preview, setPreview] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [history, setHistory] = useState<AuditLogEntry[]>([])

  const buildCriteria = useMemo((): AudienceCriteria => ({
    verified: !!criteria.verified,
    premium: !!criteria.premium,
    standard: !!criteria.standard,
    newUsers: !!criteria.newUsers,
    inactive: !!criteria.inactive,
    manualEmails: parseEmails(manualEmails),
    userIds: selectedUsers.map((u) => u.user_id).filter((v): v is string => !!v),
  }), [criteria, manualEmails, selectedUsers])

  const hasTarget = useMemo(() => {
    const c = buildCriteria
    return !!(c.verified || c.premium || c.standard || c.newUsers || c.inactive || c.manualEmails?.length || c.userIds?.length)
  }, [buildCriteria])

  const loadHistory = async () => {
    try { setHistory(await getAuditLog({ action: "campaign", limit: 8 })) } catch { /* silencieux */ }
  }
  useEffect(() => { loadHistory() }, [])

  // Compteur d'audience en direct (debounce).
  useEffect(() => {
    if (!hasTarget) { setAudience(null); return }
    let active = true
    setAudLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await countAudience(buildCriteria)
        if (active) setAudience({ count: res.count, withAccount: res.withAccount })
      } catch { if (active) setAudience(null) }
      finally { if (active) setAudLoading(false) }
    }, 400)
    return () => { active = false; clearTimeout(t) }
  }, [buildCriteria, hasTarget])

  // Autocomplete utilisateurs (debounce).
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults([]); return }
    let active = true
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const r = await searchCampaignUsers(q)
        if (active) setResults(r.filter((u) => !selectedUsers.some((s) => s.user_id === u.user_id)))
      } catch { if (active) setResults([]) }
      finally { if (active) setSearching(false) }
    }, 300)
    return () => { active = false; clearTimeout(t) }
  }, [query, selectedUsers])

  const wrap = (marker: string) => {
    const el = contentRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const sel = content.slice(s, e) || "texte"
    const next = content.slice(0, s) + marker + sel + marker + content.slice(e)
    setContent(next)
    requestAnimationFrame(() => { el.focus(); el.selectionStart = s + marker.length; el.selectionEnd = s + marker.length + sel.length })
  }

  const insertAtCursor = (text: string) => {
    const el = contentRef.current
    if (!el) { setContent((c) => c + text); return }
    const { selectionStart: s, selectionEnd: e } = el
    const next = content.slice(0, s) + text + content.slice(e)
    setContent(next)
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = s + text.length })
  }

  const finalHtml = () => (editorMode === "html" ? content : visualToHtml(content))
  const canSend = subject.trim().length > 0 && content.trim().length > 0 && hasTarget && !sending
  const reachLabel = audience
    ? (channel === "inapp" ? `${fmt(audience.withAccount)} destinataire(s)` : `${fmt(audience.count)} destinataire(s)`)
    : "—"

  const doSend = async () => {
    setSending(true)
    setLastResult(null)
    try {
      const res = await sendCampaign({ type: channel, subject, html: finalHtml(), criteria: buildCriteria })
      if (!res.success) { toast.error(res.error || "Échec de l'envoi"); return }
      setLastResult(
        channel === "email"
          ? `E-mail envoyé à ${fmt(res.sent)} destinataire(s)${res.failed ? ` (${res.failed} échec(s))` : ""}`
          : `Annonce in-app envoyée à ${fmt(res.sent)} destinataire(s)`
      )
      toast.success("Campagne envoyée")
      setSubject(""); setContent(""); setConfirmOpen(false)
      loadHistory()
    } catch {
      toast.error("Erreur de connexion")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#013ff4]/10 flex items-center justify-center">
          <Megaphone className="h-5 w-5 text-[#013ff4]" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Annonces & Mailings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Diffusez une annonce in-app ou une campagne e-mail ciblée</p>
        </div>
      </header>

      {/* Sélecteur de type de campagne */}
      <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
        {([["inapp", "Annonce In-App", Megaphone], ["email", "Campagne Mailing", Mail]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setChannel(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              channel === id ? "bg-white text-[#013ff4] shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {lastResult && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> {lastResult}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Composeur */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          {/* Objet / titre */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {channel === "email" ? "Objet de l'e-mail" : "Titre de l'annonce"}
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder={channel === "email" ? "Ex. Nouveautés EmiID de juillet" : "Ex. Nouvelle fonctionnalité"}
              className="mt-2 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
            />
          </div>

          {/* Éditeur double mode */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button onClick={() => setEditorMode("visual")} className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${editorMode === "visual" ? "bg-white text-[#013ff4] shadow-sm" : "text-slate-500"}`}>
                  <Eye className="h-3.5 w-3.5" /> Visuel
                </button>
                <button onClick={() => setEditorMode("html")} className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${editorMode === "html" ? "bg-white text-[#013ff4] shadow-sm" : "text-slate-500"}`}>
                  <Code2 className="h-3.5 w-3.5" /> HTML
                </button>
              </div>
            </div>

            {/* Barre d'outils (mode visuel) */}
            {editorMode === "visual" && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <button onClick={() => wrap("**")} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Gras"><Bold className="h-3.5 w-3.5" /></button>
                <button onClick={() => wrap("*")} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Italique"><Italic className="h-3.5 w-3.5" /></button>
                <button onClick={() => insertAtCursor("\n- ")} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Liste"><List className="h-3.5 w-3.5" /></button>
                <span className="w-px h-5 bg-slate-200 mx-1" />
                {["{first_name}", "{last_name}"].map((v) => (
                  <button key={v} onClick={() => insertAtCursor(v)} className="px-2 py-1 rounded-lg border border-[#013ff4]/20 bg-[#013ff4]/5 text-[11px] font-bold text-[#013ff4] hover:bg-[#013ff4]/10">{v}</button>
                ))}
              </div>
            )}

            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={editorMode === "html" ? 12 : 8}
              placeholder={editorMode === "html" ? "<table>… collez votre HTML e-mail ici …</table>" : "Rédigez votre message.\n**gras**, *italique*, et - pour une liste.\nUtilisez {first_name} pour personnaliser."}
              className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30 ${editorMode === "html" ? "font-mono text-xs" : ""}`}
            />
            <div className="flex items-center justify-between mt-1">
              <button onClick={() => setPreview(true)} className="text-[11px] font-semibold text-[#013ff4] hover:underline">Aperçu du rendu</button>
              <p className="text-[10px] text-slate-400">{channel === "inapp" ? "L'in-app affichera le texte (HTML retiré)." : "Le HTML est envoyé tel quel."}</p>
            </div>
          </div>
        </div>

        {/* Ciblage + audience */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          {/* Indicateur d'audience */}
          <div className="rounded-2xl border border-[#013ff4]/15 bg-[#013ff4]/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Audience estimée</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-[#013ff4]">{audLoading ? "…" : audience ? fmt(channel === "inapp" ? audience.withAccount : audience.count) : "0"}</span>
              <span className="text-xs font-semibold text-slate-500">destinataire(s)</span>
            </div>
            {audience && channel === "email" && audience.count !== audience.withAccount && (
              <p className="text-[11px] text-slate-400 mt-0.5">{fmt(audience.withAccount)} avec compte · {fmt(audience.count - audience.withAccount)} e-mail(s) externe(s)</p>
            )}
            {channel === "inapp" && audience && audience.count !== audience.withAccount && (
              <p className="text-[11px] text-amber-600 mt-0.5">{fmt(audience.count - audience.withAccount)} e-mail(s) sans compte seront ignorés en in-app.</p>
            )}
          </div>

          {/* Critères */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Critères (cumulatifs)</p>
            {CRITERIA.map((c) => {
              const active = !!criteria[c.id]
              return (
                <button
                  key={c.id}
                  onClick={() => setCriteria((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                  className={`w-full flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${active ? "border-[#013ff4] bg-[#013ff4]/5" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${active ? "bg-[#013ff4] border-[#013ff4]" : "border-slate-300"}`}>
                    {active && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </span>
                  <c.icon className={`h-4 w-4 shrink-0 ${active ? "text-[#013ff4]" : "text-slate-400"}`} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-bold ${active ? "text-[#013ff4]" : "text-slate-700"}`}>{c.label}</span>
                    <span className="block text-[10px] text-slate-400">{c.desc}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Sélection manuelle (autocomplete) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cibler des utilisateurs</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom ou e-mail…" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30" />
            </div>
            {searching && <p className="text-[11px] text-slate-400">Recherche…</p>}
            {results.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {results.map((u) => (
                  <button key={u.user_id} onClick={() => { setSelectedUsers((p) => [...p, u]); setResults((r) => r.filter((x) => x.user_id !== u.user_id)); setQuery("") }} className="w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 text-left">
                    <span className="min-w-0"><span className="block text-sm font-semibold text-slate-800 truncate">{`${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email}</span><span className="block text-[11px] text-slate-400 truncate">{u.email}</span></span>
                    <UserPlus className="h-4 w-4 text-[#013ff4] shrink-0" />
                  </button>
                ))}
              </div>
            )}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedUsers.map((u) => (
                  <span key={u.user_id} className="inline-flex items-center gap-1 bg-[#013ff4]/10 text-[#013ff4] text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {`${u.first_name || ""}`.trim() || u.email}
                    <button onClick={() => setSelectedUsers((p) => p.filter((x) => x.user_id !== u.user_id))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* E-mails manuels */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">E-mails manuels</p>
            <textarea value={manualEmails} onChange={(e) => setManualEmails(e.target.value)} rows={2} placeholder="a@ex.com, b@ex.com…" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30" />
            <p className="text-[10px] text-slate-400 mt-1">{channel === "inapp" ? "Ignorés en in-app (pas de compte)." : "Séparés par virgule, espace ou retour ligne."}</p>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!canSend}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#013ff4] text-white rounded-xl text-sm font-semibold hover:bg-[#012fc0] transition-colors disabled:opacity-50"
          >
            {channel === "email" ? <Mail className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            Vérifier et envoyer
          </button>
        </aside>
      </div>

      {/* Historique */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><History className="h-4 w-4 text-slate-400" /> Dernières campagnes</h2>
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">Aucune campagne envoyée.</div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {history.map((h) => {
              const d = h.details as { subject?: string; channel?: string; count?: number; total?: number }
              return (
                <li key={h.id} className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#013ff4]/10 flex items-center justify-center shrink-0">
                    {d.channel === "email" ? <Mail className="h-4 w-4 text-[#013ff4]" /> : <Megaphone className="h-4 w-4 text-[#013ff4]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{d.subject || "(sans objet)"}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{new Date(h.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} · {d.channel === "email" ? "E-mail" : "In-App"}{h.admin_email ? ` · ${h.admin_email}` : ""}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 shrink-0">{fmt(d.count ?? 0)}{d.total !== undefined && d.total !== d.count ? `/${fmt(d.total)}` : ""}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Aperçu */}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu du rendu</DialogTitle>
            <DialogDescription>{subject || "(sans objet)"}</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-slate-200 p-4 max-h-[50vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: finalHtml() }} />
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <Dialog open={confirmOpen} onOpenChange={(o) => { if (!sending) setConfirmOpen(o) }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Confirmer l'envoi</DialogTitle>
            <DialogDescription>
              {channel === "email" ? "Campagne e-mail" : "Annonce in-app"} à <strong className="text-slate-900">{reachLabel}</strong>. Action irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-sm font-bold text-slate-900 break-words">{subject}</p>
            <div className="text-xs text-slate-600 mt-1 line-clamp-4" dangerouslySetInnerHTML={{ __html: finalHtml() }} />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <button onClick={() => setConfirmOpen(false)} disabled={sending} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Annuler</button>
            <button onClick={doSend} disabled={sending} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#013ff4] text-white rounded-xl text-sm font-semibold hover:bg-[#012fc0] disabled:opacity-50">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Modale de création d'un groupe de discussion / communauté.
 * @created 2026-07-10
 */

"use client"

import { useState } from "react"
import { Users, Loader2, Globe, UserPlus, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { fetchWithAuth } from "@/lib/apiClient"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type JoinPolicy = "invite" | "request" | "open"

const POLICIES: { id: JoinPolicy; label: string; desc: string; icon: typeof Lock }[] = [
  { id: "invite", label: "Sur invitation", desc: "L'admin ajoute les membres", icon: Lock },
  { id: "request", label: "Sur demande", desc: "Les membres demandent, l'admin valide", icon: UserPlus },
  { id: "open", label: "Ouvert", desc: "Rejoint via le lien sans validation", icon: Globe },
]

interface NewGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (groupId: string) => void
}

export function NewGroupModal({ open, onOpenChange, onCreated }: NewGroupModalProps) {
  const [name, setName] = useState("")
  const [isCommunity, setIsCommunity] = useState(false)
  const [joinPolicy, setJoinPolicy] = useState<JoinPolicy>("invite")
  const [creating, setCreating] = useState(false)

  const reset = () => { setName(""); setIsCommunity(false); setJoinPolicy("invite") }

  const create = async () => {
    if (name.trim().length < 2 || creating) return
    setCreating(true)
    try {
      const res = await fetchWithAuth("/api/messages/groups", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), is_community: isCommunity, join_policy: joinPolicy }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        toast.error(e.error || "Échec de la création")
        return
      }
      const data = await res.json()
      toast.success("Groupe créé")
      onCreated(data.id)
      onOpenChange(false)
      reset()
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black text-foreground">
            <span className="w-9 h-9 rounded-xl bg-[#013ff4]/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#013ff4]" />
            </span>
            Nouveau groupe
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Créez un salon de discussion. Une communauté peut afficher un badge sur le profil de ses membres.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Nom */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom du groupe</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Ex. Développeurs Bénin"
              className="mt-2 w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#013ff4]/30"
            />
          </div>

          {/* Communauté (badge) */}
          <button
            type="button"
            onClick={() => setIsCommunity((v) => !v)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
              isCommunity ? "border-[#013ff4] bg-[#013ff4]/5 ring-1 ring-[#013ff4]/20" : "border-border hover:bg-muted",
            )}
          >
            <span className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0", isCommunity ? "bg-[#013ff4] border-[#013ff4]" : "border-slate-300")}>
              {isCommunity && <span className="w-2 h-2 bg-card rounded-sm" />}
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Communauté (badge de membre)</p>
              <p className="text-[11px] text-slate-400">Affiche un badge sur la carte des membres. Vérification EmiID requise pour un badge officiel.</p>
            </div>
          </button>

          {/* Politique d'adhésion */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adhésion</label>
            <div className="mt-2 grid gap-2">
              {POLICIES.map((p) => {
                const active = joinPolicy === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setJoinPolicy(p.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all",
                      active ? "border-[#013ff4] bg-[#013ff4]/5" : "border-border hover:bg-muted",
                    )}
                  >
                    <p.icon className={cn("h-4 w-4 shrink-0", active ? "text-[#013ff4]" : "text-slate-400")} />
                    <div>
                      <p className={cn("text-sm font-semibold", active ? "text-[#013ff4]" : "text-foreground")}>{p.label}</p>
                      <p className="text-[11px] text-slate-400">{p.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={create}
            disabled={name.trim().length < 2 || creating}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#013ff4] text-white rounded-xl text-sm font-bold hover:bg-[#012fc0] transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            Créer le groupe
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

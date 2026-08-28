/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description InstantClaimTerminal — Bloc de conversion final stylisé comme un terminal
 *              de passeport numérique imprimant la carte EmiID.
 * @created 2026-08-20
 * @updated 2026-08-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight, ShieldCheck, CreditCard } from "lucide-react"

export function InstantClaimTerminal() {
  const router = useRouter()
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      router.push(`/creer-profil?first_name=${encodeURIComponent(name.trim())}`)
    } else {
      router.push("/creer-profil")
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-[#000616] p-8 sm:p-12 md:p-16 text-white border border-white/10 shadow-2xl">
      {/* Décoration et lueurs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#013ff4]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#03b3f8]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#013ff4]/10 border border-[#03b3f8]/30 text-[#03b3f8] text-xs font-bold">
          <CreditCard className="h-4 w-4" />
          <span>Générateur de Carte EmiID</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight font-heading">
          Prêt à créer votre <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013ff4] via-[#03b3f8] to-white">
            empreinte numérique ?
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
          Rejoignez les milliers de professionnels qui développent leur réseau avec EmiID. C&apos;est rapide, gratuit et certifié.
        </p>

        <form onSubmit={handleSubmit} className="pt-4 max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-xl">
            <Input
              type="text"
              placeholder="Entrez votre prénom..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-0 text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold h-12 px-4 flex-1"
            />
            <Button
              type="submit"
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#013ff4] to-[#1e61ff] hover:from-[#0135d0] hover:to-[#1852df] text-white text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <span>Débloquer</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Aucune carte bancaire requise • Validation instantanée
          </p>
        </form>
      </div>
    </div>
  )
}

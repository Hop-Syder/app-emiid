/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page d'erreur d'authentification (Code expiré ou invalide)
 * @created 2026-03-23
*/

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldAlert, ArrowLeft, RefreshCw, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 space-y-8 relative overflow-hidden"
      >
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 shadow-inner group">
            <ShieldAlert className="h-10 w-10 group-hover:scale-110 transition-transform" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Erreur d&apos;Authentification
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Le lien de connexion a expiré ou a déjà été utilisé. Par sécurité, vous devez recommencer l&apos;opération.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100 mt-4">
          <Button 
            asChild
            className="w-full h-14 rounded-2xl bg-[#022753] hover:bg-[#022753]/90 text-white font-bold shadow-xl shadow-[#022753]/20 gap-3 transition-all hover:-translate-y-1"
          >
            <Link href="/login">
              <RefreshCw className="h-5 w-5" />
              Réessayer la connexion
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline"
            className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold gap-3 hover:bg-slate-50 transition-all"
          >
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>

        <div className="pt-6">
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
            <MessageSquare className="h-3 w-3" />
            Besoin d&apos;aide ? Contactez le support Nukun.
          </p>
        </div>
      </motion.div>
      
      {/* Nukun Branding Footer */}
      <footer className="mt-12 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-4 h-px bg-slate-300"></span>
        Nukun Security Phase
        <span className="w-4 h-px bg-slate-300"></span>
      </footer>
    </div>
  )
}

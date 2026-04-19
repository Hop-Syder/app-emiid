/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Bandeau de consentement aux cookies avec design Premium Nukun
 * @created 2026-04-19
 * @updated 2026-04-19
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie, X, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Vérifier si l'utilisateur a déjà accepté
        const consent = localStorage.getItem("nukun-cookie-consent")
        if (!consent) {
            // Affichage avec un léger délai pour ne pas brusquer l'utilisateur
            const timer = setTimeout(() => setIsVisible(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem("nukun-cookie-consent", "accepted")
        setIsVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem("nukun-cookie-consent", "declined")
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[100]"
                >
                    <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-[2rem] p-6 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                        {/* Décoration subtile */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="relative z-10">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Cookie className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        Politique des Cookies
                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        Nous utilisons des cookies pour optimiser votre expérience sur <strong>Nukun</strong> et analyser notre trafic.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsVisible(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button 
                                    onClick={handleAccept}
                                    className="flex-1 rounded-xl h-12 bg-[#022753] hover:bg-[#022753]/90 font-bold shadow-lg shadow-[#022753]/20"
                                >
                                    Accepter tout
                                </Button>
                                <Button 
                                    variant="ghost"
                                    onClick={handleDecline}
                                    className="rounded-xl h-12 px-6 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                >
                                    Refuser
                                </Button>
                            </div>
                            
                            <p className="text-[10px] text-slate-400 mt-4 text-center font-bold uppercase tracking-widest">
                                Nukun • Confidentialité Garantie
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

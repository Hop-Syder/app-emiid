/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Bandeau de consentement aux cookies avec design Ethereal Premium
 * @created 2026-04-19
 * @updated 2026-04-23
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie, X, ShieldCheck, ArrowRight, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem("emiid-cookie-consent")
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem("emiid-cookie-consent", "accepted")
        setIsVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem("emiid-cookie-consent", "declined")
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100]"
                >
                    <div className="relative overflow-hidden group">
                        {/* Background Layer - Increased opacity for readability */}
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)]" />
                        
                        {/* Animated Glows - Subtle and controlled */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400/20 rounded-full blur-[80px] animate-pulse delay-700" />

                        <div className="relative p-6 sm:p-8 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#022753] to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                            <Cookie className="h-7 w-7" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#022753] tracking-tight leading-none mb-1">
                                            Expérience EmiID
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#022753]/60">
                                            Sécurité & Cookies
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsVisible(false)}
                                    className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <p className="text-sm text-slate-700 font-bold leading-relaxed">
                                    Nous personnalisons votre voyage sur <span className="font-black text-[#022753]">EmiID</span> avec des cookies pour une navigation fluide et sécurisée.
                                </p>
                                
                                <button 
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-[11px] font-black text-[#022753]/70 hover:text-[#022753] flex items-center gap-1.5 transition-colors group/btn"
                                >
                                    <Settings2 className="h-3 w-3" />
                                    Personnaliser mes préférences
                                    <ArrowRight className="h-3 w-3 transform group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Button 
                                    onClick={handleAccept}
                                    className="w-full sm:flex-1 h-14 rounded-[1.2rem] bg-[#022753] hover:bg-[#033a7a] text-white font-black text-sm shadow-xl shadow-blue-900/10 active:scale-[0.98] transition-all"
                                >
                                    Tout accepter
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={handleDecline}
                                    className="w-full sm:w-auto px-6 h-14 rounded-[1.2rem] font-black text-slate-700 border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all"
                                >
                                    Refuser
                                </Button>
                            </div>

                            {/* Footer Note */}
                            <div className="pt-2 border-t border-slate-200/50">
                                <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-[0.2em]">
                                    Respect de la vie privée • RGPD Ready
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

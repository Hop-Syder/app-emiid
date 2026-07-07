import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function AnnuaireCTA() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full relative rounded-[3rem] overflow-hidden bg-slate-950 mt-20 shadow-2xl"
        >
            {/* Background effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/40 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/40 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10 pointer-events-none" />

            <div className="relative z-10 px-6 py-20 md:py-28 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold tracking-wide uppercase">Rejoignez l&apos;Élite</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight max-w-3xl leading-tight">
                    Vous avez du <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">talent</span> ?
                </h2>
                
                <p className="text-lg md:text-xl text-slate-300/80 mb-10 max-w-2xl font-medium leading-relaxed">
                    Rejoignez l&apos;annuaire EmiID et gagnez en visibilité auprès de milliers d&apos;entreprises et de clients potentiels. Mettez en valeur votre expertise.
                </p>
                
                <Link 
                    href="/creer-profil" 
                    className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 py-4 sm:px-10 sm:py-5 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)]"
                >
                    {/* Glowing Borders & Background Layers */}
                    <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-b from-blue-400 via-indigo-600 to-blue-900">
                        <div className="absolute inset-0 bg-slate-950 rounded-2xl opacity-90" />
                    </div>

                    <div className="absolute inset-[2px] bg-slate-950 rounded-2xl opacity-95" />
                    <div className="absolute inset-[2px] bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 rounded-2xl opacity-90" />
                    <div className="absolute inset-[2px] bg-gradient-to-b from-blue-500/30 via-indigo-950 to-blue-900/30 rounded-2xl opacity-80" />
                    <div className="absolute inset-[2px] bg-gradient-to-br from-indigo-400/20 via-slate-950 to-blue-900/40 rounded-2xl" />
                    
                    {/* Inner Shadow / Glow */}
                    <div className="absolute inset-[2px] shadow-[inset_0_0_20px_rgba(99,102,241,0.3)] rounded-2xl" />

                    {/* Hover State Glow */}
                    <div className="absolute inset-[2px] opacity-0 transition-opacity duration-500 bg-gradient-to-r from-blue-500/20 via-indigo-400/20 to-blue-500/20 group-hover:opacity-100 rounded-2xl" />

                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                        <span className="text-lg sm:text-xl font-bold bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(165,180,252,0.8)] tracking-wide">
                            Créer mon profil
                        </span>
                        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </div>
                </Link>
            </div>
        </motion.div>
    )
}

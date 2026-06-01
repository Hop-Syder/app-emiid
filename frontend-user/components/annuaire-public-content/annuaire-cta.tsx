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
                    <span className="text-sm font-bold tracking-wide uppercase">Rejoignez l'Élite</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight max-w-3xl leading-tight">
                    Vous avez du <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">talent</span> ?
                </h2>
                
                <p className="text-lg md:text-xl text-slate-300/80 mb-10 max-w-2xl font-medium leading-relaxed">
                    Rejoignez l'annuaire EmiID et gagnez en visibilité auprès de milliers d'entreprises et de clients potentiels. Mettez en valeur votre expertise.
                </p>
                
                <Link href="/auth/register" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-indigo-500 text-white font-bold text-lg overflow-hidden transition-all hover:bg-indigo-400 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(99,102,241,0.5)]">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10">Créer mon profil</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>
    )
}

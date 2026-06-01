import { motion } from "framer-motion"
import { Search, UserCheck, Handshake } from "lucide-react"

const steps = [
    {
        id: "01",
        title: "Trouvez votre talent",
        description: "Utilisez nos filtres avancés pour dénicher le profil parfait parmi notre sélection de professionnels qualifiés.",
        icon: Search,
        color: "text-blue-600",
        bgHover: "group-hover:bg-blue-50/50",
        borderHover: "group-hover:border-blue-200",
        shadowHover: "hover:shadow-blue-500/10"
    },
    {
        id: "02",
        title: "Consultez le portfolio",
        description: "Explorez leurs réalisations, compétences et expériences détaillées pour vous assurer qu'ils correspondent à vos besoins.",
        icon: UserCheck,
        color: "text-indigo-600",
        bgHover: "group-hover:bg-indigo-50/50",
        borderHover: "group-hover:border-indigo-200",
        shadowHover: "hover:shadow-indigo-500/10"
    },
    {
        id: "03",
        title: "Connectez-vous",
        description: "Entrez directement en contact avec eux et commencez votre prochaine collaboration à succès en toute simplicité.",
        icon: Handshake,
        color: "text-purple-600",
        bgHover: "group-hover:bg-purple-50/50",
        borderHover: "group-hover:border-purple-200",
        shadowHover: "hover:shadow-purple-500/10"
    }
]

export function AnnuaireProcess() {
    return (
        <section className="w-full bg-slate-50/30 py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-[80px]" />
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-[80px]" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <div className="text-center mb-20">
                    <span className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-4 block bg-indigo-50 w-max mx-auto px-3 py-1 rounded-full border border-indigo-100">Processus</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Comment ça <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">marche ?</span>
                    </h2>
                    <p className="text-slate-500 text-lg font-medium mt-6 max-w-2xl mx-auto leading-relaxed">
                        Un parcours simple, rapide et transparent pour vous connecter aux meilleurs talents de notre réseau.
                    </p>
                </div>

                {/* Step Indicators with Connecting Line */}
                <div className="relative mx-auto mb-12 w-full max-w-4xl hidden md:block">
                    <div className="absolute left-[16.66%] top-1/2 h-[2px] w-[66.66%] -translate-y-1/2 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200" />
                    <div className="relative grid grid-cols-3">
                        {steps.map((step, index) => (
                            <motion.div
                                key={`indicator-${step.id}`}
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2, type: "spring" }}
                                className="flex h-12 w-12 items-center justify-center justify-self-center rounded-full bg-white font-black text-slate-900 shadow-md ring-8 ring-slate-50/50 border border-slate-100 relative z-10"
                            >
                                {index + 1}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Steps Grid */}
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: index * 0.2, type: "spring", stiffness: 100 }}
                            className={`group relative rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10 text-center transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl ${step.shadowHover} ${step.borderHover} ${step.bgHover} flex flex-col items-center`}
                        >
                            {/* Icon Container */}
                            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50/80 text-slate-400 group-hover:bg-white group-hover:shadow-lg transition-all duration-500 border border-slate-100">
                                <step.icon className={`h-10 w-10 transition-transform duration-500 group-hover:scale-110 ${step.color}`} strokeWidth={1.5} />
                            </div>
                            
                            {/* Mobile Indicator */}
                            <div className="md:hidden text-xs font-black text-slate-300 tracking-widest mb-4 uppercase">
                                Étape {step.id}
                            </div>
                            
                            <h3 className="mb-4 text-xl font-bold text-slate-900">{step.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

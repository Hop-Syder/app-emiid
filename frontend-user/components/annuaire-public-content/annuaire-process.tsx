import { motion } from "framer-motion"
import { Search, UserCheck, Handshake } from "lucide-react"

const steps = [
    {
        id: "01",
        title: "Trouvez votre talent",
        description: "Utilisez nos filtres avancés pour dénicher le profil parfait parmi notre sélection de professionnels qualifiés.",
        icon: Search,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
    },
    {
        id: "02",
        title: "Consultez le portfolio",
        description: "Explorez leurs réalisations, compétences et expériences détaillées pour vous assurer qu'ils correspondent à vos besoins.",
        icon: UserCheck,
        color: "text-indigo-500",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200"
    },
    {
        id: "03",
        title: "Connectez-vous",
        description: "Entrez directement en contact avec eux et commencez votre prochaine collaboration à succès en toute simplicité.",
        icon: Handshake,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
    }
]

export function AnnuaireProcess() {
    return (
        <div className="py-20 mt-12">
            <div className="text-center mb-16 md:mb-24">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Comment ça <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">marche ?</span>
                </h2>
                <p className="text-slate-500 text-lg font-medium mt-6 max-w-2xl mx-auto leading-relaxed">
                    Un processus simple, rapide et transparent pour vous connecter aux meilleurs talents de notre réseau.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting line for desktop */}
                <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 z-0 border-t border-dashed border-slate-300" />

                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: index * 0.2, type: "spring", stiffness: 100 }}
                        className="relative z-10 flex flex-col items-center text-center group"
                    >
                        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center ${step.bgColor} ${step.borderColor} border shadow-lg shadow-slate-200/50 mb-8 transition-transform duration-500 group-hover:-translate-y-3 group-hover:scale-110`}>
                            <step.icon className={`w-10 h-10 ${step.color}`} strokeWidth={1.5} />
                        </div>
                        
                        <div className="text-xs font-black text-slate-300 tracking-widest mb-4 uppercase">Étape {step.id}</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                        <p className="text-slate-500 leading-relaxed max-w-[280px]">{step.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

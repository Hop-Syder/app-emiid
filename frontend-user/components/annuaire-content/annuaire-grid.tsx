"use client"

import { motion } from "framer-motion"
import { AnnuaireCard, Profile } from "./annuaire-card"

interface AnnuaireGridProps {
    profiles: Profile[]
}

export function AnnuaireGrid({ profiles }: AnnuaireGridProps) {
    return (
        <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                    },
                },
            }}
        >
            {profiles.map((profile) => (
                <AnnuaireCard key={profile.name} profile={profile} />
            ))}
        </motion.div>
    )
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant client pour la page 404 — contient framer-motion (requiert "use client")
 * @created 2026-05-26
 * @updated 2026-05-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 * ──────────────────────────────────
 */

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Compass, MoveLeft, SearchX } from "lucide-react"

export default function NotFoundClient() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/50 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-md relative z-10"
            >
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-white rounded-xl shadow-xl flex items-center justify-center relative transform rotate-12">
                        <Compass className="w-12 h-12 text-blue-600" />
                        <div className="absolute -bottom-2 -right-2 bg-red-100 p-2 rounded-xl">
                            <SearchX className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </div>

                <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Destination inconnue</h2>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    Il semble que vous ayez navigué hors de la carte de EmiID.
                    Cette page n&apos;existe pas ou a été déplacée.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard-user">
                        <Button className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 w-full sm:w-auto">
                            <MoveLeft className="mr-2 h-4 w-4" />
                            Retour au Hub
                        </Button>
                    </Link>
                    <Link href="/annuaire">
                        <Button variant="outline" className="rounded-xl h-12 px-8 bg-white border-gray-200 hover:bg-gray-50 w-full sm:w-auto">
                            Explorer l&apos;Annuaire
                        </Button>
                    </Link>
                </div>
            </motion.div>

            <footer className="absolute bottom-8 text-xs text-gray-400 font-medium">
                EmiID • 2026
            </footer>
        </div>
    )
}

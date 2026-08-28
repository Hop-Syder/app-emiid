/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page d'erreur globale (ErrorBoundary) pour capturer les crashs
 * @created 2026-01-25
*/

"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Erreur Application EmiID:", error)
    }, [error])

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center border border-gray-100"
            >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">Quelque chose s&apos;est mal passé</h2>
                <p className="text-gray-500 text-sm mb-6">
                    Une erreur inattendue a empêché le chargement de cette section. Nos ingénieurs ont été notifiés.
                </p>

                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={() => reset()}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Réessayer
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/dashboard-user'}
                        className="rounded-xl"
                    >
                        Retour Dashboard
                    </Button>
                </div>

                {error.digest && (
                    <p className="mt-6 text-[10px] text-gray-400 font-mono bg-gray-50 p-2 rounded">
                        Error ID: {error.digest}
                    </p>
                )}
            </motion.div>
        </div>
    )
}

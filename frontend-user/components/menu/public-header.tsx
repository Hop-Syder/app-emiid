/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Header pour les visiteurs non-connectés
 * @created 2026-01-24
 * 🌐 ceo.nexuspartners.xyz
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function PublicHeader() {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md"
        >
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo/logo-2.png"
                        alt="Nexus Connect"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                    />
                    <span className="font-bold text-xl text-[#022753] hidden sm:block">Nexus Connect</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/dashboard-public" className="text-sm font-medium hover:text-primary">Découvrir</Link>
                    <Link href="/annuaire/entreprises" className="text-sm font-medium hover:text-primary">Annuaire</Link>
                    <Link href="/market" className="text-sm font-medium hover:text-primary">Opportunités</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="rounded-xl">Connexion</Button>
                    </Link>
                    <Link href="/login?tab=register">
                        <Button className="rounded-xl bg-[#022753] hover:bg-[#022753]/90">S'inscrire</Button>
                    </Link>
                </div>
            </div>
        </motion.header>
    )
}

"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { EmiIDSidebar } from "./emiid-sidebar"
import { EmiIDHeader } from "./emiid-header"
import { cn } from "@/lib/utils"

interface EmiIDLayoutProps {
  children: React.ReactNode
}

export function EmiIDLayout({ children }: EmiIDLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-amber-50/30 font-sans">
      {/* Animated background - now fixed to preserve it during scroll */}
      <motion.div
        className="fixed inset-0 -z-10 opacity-40 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(255, 183, 3, 0.4) 0%, rgba(0, 114, 41, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(206, 17, 38, 0.4) 0%, rgba(0, 114, 41, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(0, 114, 41, 0.4) 0%, rgba(255, 183, 3, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 50% 50%, rgba(255, 183, 3, 0.4) 0%, rgba(0, 114, 41, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <EmiIDSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className={cn("transition-all duration-300", sidebarOpen ? "md:pl-[240px]" : "md:pl-[80px]")}>
        <EmiIDHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="p-4 md:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>

      {/* Contextual FAB Navigation (Mobile & Tablet) */}

    </div>
  )
}

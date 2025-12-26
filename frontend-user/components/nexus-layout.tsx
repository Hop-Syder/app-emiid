"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { NexusSidebar } from "@/components/nexus-sidebar"
import { NexusHeader } from "@/components/nexus-header"
import { cn } from "@/lib/utils"

interface NexusLayoutProps {
  children: React.ReactNode
}

export function NexusLayout({ children }: NexusLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden bg-amber-50">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-40"
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

      <NexusSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className={cn("transition-all duration-300", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
        <NexusHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

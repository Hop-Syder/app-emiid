"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { NexusSidebar } from "./nexus-sidebar"
import { NexusHeader } from "./nexus-header"
import { cn } from "@/lib/utils"
import { Plus, MessageSquare, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        <main className="p-6 relative">
          {children}
        </main>
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden flex flex-col gap-3">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col gap-3"
        >
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-2xl bg-primary text-white hover:scale-110 active:scale-95 transition-all"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

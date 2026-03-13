"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { NexusSidebar } from "./nexus-sidebar"
import { NexusHeader } from "./nexus-header"
import { cn } from "@/lib/utils"
import { Plus, MessageSquare, Camera, Home, Grid, Wallet, FileText, Settings, X, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"

interface NexusLayoutProps {
  children: React.ReactNode
}

export function NexusLayout({ children }: NexusLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const allMenus = [
    { title: "Dashboard", icon: "/svg/Home.svg", href: "/dashboard-user" },
    { title: "Annuaire", icon: "/svg/Grid.svg", href: "/annuaire" },
    { title: "Portefeuille", icon: "/svg/Wallet.svg", href: "/portefeuille" },
    { title: "Carte de profils", icon: "/svg/FileText.svg", href: "/creer-profil" },
    { title: "Messages", icon: "/svg/MessageSquare.svg", href: "/messages" },
    { title: "Paramètres", icon: "/svg/setting.svg", href: "/parametres" },
  ]

  // Filtrer le menu actuel pour ne pas l'afficher dans le FAB
  const filteredMenus = allMenus.filter(menu => pathname !== menu.href)

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

      {/* Contextual FAB Navigation (Mobile & Tablet) */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <div className="relative flex flex-col items-end">
          <AnimatePresence>
            {fabOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col gap-3 mb-4 items-end"
              >
                {filteredMenus.map((menu, idx) => (
                  <motion.div
                    key={menu.href}
                    initial={{ scale: 0, x: 20 }}
                    animate={{ scale: 1, x: 0 }}
                    exit={{ scale: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm border border-slate-100">
                      {menu.title}
                    </span>
                    <Button
                      size="icon"
                      onClick={() => {
                        router.push(menu.href)
                        setFabOpen(false)
                      }}
                      className="h-12 w-12 rounded-full shadow-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5"
                    >
                      <img src={menu.icon} alt={menu.title} className="h-full w-full object-contain" />
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            size="icon"
            onClick={() => setFabOpen(!fabOpen)}
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center p-4",
              fabOpen ? "bg-slate-900 text-white rotate-45" : "bg-primary text-white shadow-primary/20 hover:scale-105"
            )}
          >
            <img src="/svg/Add.svg" alt="Add" className="h-full w-full object-contain brightness-0 invert" />
          </Button>
        </div>
      </div>
    </div>
  )
}

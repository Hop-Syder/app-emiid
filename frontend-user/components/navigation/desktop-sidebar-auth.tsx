/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation latérale pour ordinateur (Auth / Connecté) avec icônes SVG Streamline
 * @created 2026-06-13
 * @updated 2026-06-22
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut, User } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const privateNavItems = [
  { name: "Hub", href: "/dashboard-user", svg: "/svg/Home.svg" },
  { name: "Annuaire", href: "/annuaire", svg: "/svg/Grid.svg" },
  { name: "Créer mon profil", href: "/creer-profil", svg: "/svg/FileText.svg" },
  { name: "Messages", href: "/messages", svg: "/svg/MessageSquare.svg" },
  { name: "Notifications", href: "/notifications", svg: "/svg/notification.svg" },
  { name: "Portefeuille", href: "/portefeuille", svg: "/svg/Wallet.svg" },
  { name: "Paramètres", href: "/parametres", svg: "/svg/setting.svg" },
]

export function DesktopSidebarAuth() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<{ avatar_url?: string | null; full_name?: string | null } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const metadata = session.user.user_metadata
        setProfile({
          avatar_url: metadata?.avatar_url || null,
          full_name: metadata?.full_name || session.user.email?.split('@')[0] || "User"
        })
      }
    }
    loadProfile()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("emiid_pin_verified")
    router.push("/login")
  }

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[88px] hover:w-[240px] transition-all duration-300 z-50 flex-col bg-white/80 dark:bg-white/10 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 group shadow-2xl">
      {/* Logo */}
      <div className="h-24 flex items-center px-4 pt-4">
        <div className="relative w-14 h-14 min-w-[56px] flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 group-hover:bg-transparent group-hover:border-transparent transition-all">
          <Image
            src="/logo/icon.svg"
            alt="EmiID"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <span className="font-wordmark ml-4 font-black text-xl text-blue-500 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-tight">
          EmiID
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 flex flex-col gap-2 px-4 py-8">
        {privateNavItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link key={item.name} href={item.href} className="relative outline-none">
              <div
                className={`flex items-center h-12 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-active-indicator"
                    className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="w-14 flex items-center justify-center shrink-0">
                  <Image
                    src={item.svg}
                    alt={item.name}
                    width={26}
                    height={26}
                    className={cn(
                      "size-[26px] transition-all duration-300",
                      isActive
                        ? "opacity-100 scale-110 saturate-100 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                        : "opacity-60 scale-100 saturate-75 dark:saturate-50 group-hover:opacity-95 group-hover:scale-105 group-hover:saturate-100"
                    )}
                  />
                </div>
                <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* User Profile / Logout Dropdown */}
      <div className="p-4 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full outline-none">
            <div className="flex items-center h-14 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10 px-2">
              <Avatar className="size-10 rounded-xl border border-slate-200 dark:border-white/20 shrink-0">
                <AvatarImage src={profile?.avatar_url || "/profil/avatar.jpg"} />
                <AvatarFallback className="bg-slate-800 text-white rounded-xl">
                  {profile?.full_name?.substring(0, 2).toUpperCase() || <User className="size-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 text-left overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {profile?.full_name || "Profil"}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Compte Élite
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" sideOffset={10} className="w-56 bg-slate-900 border-slate-800 text-slate-200 rounded-2xl p-2 shadow-2xl">
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
              <Link href="/profil" className="flex items-center">
                <User className="mr-2 size-4" /> Mon Profil Public
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800 my-2" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10">
              <LogOut className="mr-2 size-4" /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

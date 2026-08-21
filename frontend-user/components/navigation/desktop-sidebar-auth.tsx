/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Barre de navigation latérale pour ordinateur — Concept Floating Island Navbar.
 *              Capsule flottante supérieure centrée avec effet verre dépoli, onglets fluides et menu profil.
 * @created 2026-06-13
 * @updated 2026-08-20
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut, User, Sparkles, Plus, Wallet, Bell, Settings, LayoutGrid, Home, MessageSquare } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUnreadNotifications } from "@/hooks/use-unread-notifications"
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
  { name: "Hub", href: "/dashboard-user", icon: Home },
  { name: "Annuaire", href: "/annuaire", icon: LayoutGrid },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Portefeuille", href: "/portefeuille", icon: Wallet },
  { name: "Paramètres", href: "/parametres", icon: Settings },
]

export function DesktopSidebarAuth() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const unreadCount = useUnreadNotifications()

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
    void loadProfile()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("emiid_pin_verified")
    router.push("/login")
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className="hidden lg:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 items-center justify-between w-[calc(100%-2rem)] max-w-6xl px-3 py-2 rounded-full border border-slate-200/90 dark:border-white/15 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-[0_16px_40px_rgba(15,23,42,0.18)] pointer-events-auto">
      {/* ── GAUCHE : Logo & Identité Brand ────────────────────────────── */}
      <Link href="/dashboard-user" className="flex items-center gap-2.5 pl-2 pr-3 group outline-none shrink-0">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#013ff4] to-[#1e61ff] shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
          <Image
            src="/logo/icon.svg"
            alt="EmiID"
            width={24}
            height={24}
            className="object-contain brightness-0 invert"
          />
        </div>
        <span className="font-wordmark text-lg font-black tracking-tight text-slate-900 dark:text-white">
          Emi<span className="text-[#013ff4]">ID</span>
        </span>
      </Link>

      {/* ── CENTRE : Navigation principale par onglets fluides ─────────── */}
      <nav aria-label="Navigation Desktop" className="flex items-center gap-1">
        {privateNavItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          const hasBadge = item.href === "/notifications" && unreadCount > 0

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all outline-none group"
            >
              {active && (
                <motion.span
                  layoutId="desktop-island-active"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-[#013ff4]/10 dark:bg-[#013ff4]/20 border border-[#013ff4]/20"
                />
              )}
              <span className="relative flex items-center justify-center">
                <Icon className={cn("h-4 w-4 transition-colors", active ? "text-[#013ff4]" : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white")} />
                {hasBadge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </span>
              <span className={cn("relative transition-colors", active ? "text-[#013ff4] font-black" : "text-slate-600 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white")}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── DROITE : Call-to-Action & Profil Utilisateur ──────────────── */}
      <div className="flex items-center gap-2 pr-1 shrink-0">
        <Link
          href="/creer-profil"
          className="flex h-9 items-center gap-1.5 px-4 rounded-full bg-[#013ff4] hover:bg-[#0135d0] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Créer mon profil</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
              <Avatar className="h-9 w-9 rounded-full ring-2 ring-slate-200 dark:ring-white/20">
                <AvatarImage src={profile?.avatar_url || "/profil/avatar.jpg"} />
                <AvatarFallback className="bg-slate-900 text-white rounded-full text-xs font-bold">
                  {profile?.full_name?.substring(0, 2).toUpperCase() || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={12} className="w-60 bg-slate-950/95 border-slate-800 backdrop-blur-2xl text-slate-100 rounded-3xl p-2 shadow-2xl z-50">
            <div className="px-3 py-2 border-b border-slate-800 mb-1">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || "Mon compte"}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Membre Certifié EmiID</p>
            </div>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-slate-900 focus:bg-slate-900 text-xs font-semibold">
              <Link href="/profil" className="flex items-center gap-2 py-2">
                <User className="h-4 w-4 text-blue-400" /> Voir mon profil public
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer hover:bg-slate-900 focus:bg-slate-900 text-xs font-semibold">
              <Link href="/parametres" className="flex items-center gap-2 py-2">
                <Settings className="h-4 w-4 text-slate-400" /> Réglages du compte
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800/80 my-1" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 focus:bg-rose-500/10 text-xs font-bold py-2">
              <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}


"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Grid3X3, Home, MessageSquare, Plus, Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"

type NavItem = {
  key: string
  label: string
  href?: string
  requiresAuth?: boolean
  onClick?: () => void
  icon: (active: boolean) => React.ReactNode
}

interface EmiIDMobileNavProps {
  onOpenMenu: () => void
}

export function EmiIDMobileNav({ onOpenMenu }: EmiIDMobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { session } = useCurrentUserProfile()

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const handleNav = (item: NavItem) => {
    if (item.requiresAuth && !session) {
      router.push("/login")
      return
    }
    if (item.onClick) item.onClick()
  }

  const items: NavItem[] = [
    {
      key: "home",
      label: "Accueil",
      href: "/dashboard-user",
      icon: (active) => <Home className={cn("h-5 w-5", active ? "text-[#022753]" : "text-slate-500")} />,
    },
    {
      key: "annuaire",
      label: "Annuaire",
      href: "/annuaire",
      icon: (active) => <Grid3X3 className={cn("h-5 w-5", active ? "text-[#022753]" : "text-slate-500")} />,
    },
    {
      key: "carte",
      label: "Carte",
      href: "/creer-profil",
      requiresAuth: true,
      icon: () => (
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-b from-[#022753] to-[#011833] shadow-lg shadow-[#022753]/20 flex items-center justify-center border border-white/10">
          <Plus className="h-6 w-6 text-white" />
        </div>
      ),
    },
    {
      key: "messages",
      label: "Messages",
      href: "/messages",
      requiresAuth: true,
      icon: (active) => <MessageSquare className={cn("h-5 w-5", active ? "text-[#022753]" : "text-slate-500")} />,
    },
    {
      key: "menu",
      label: "Menu",
      onClick: onOpenMenu,
      icon: () => <Menu className="h-5 w-5 text-slate-600" />,
    },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50"
      aria-label="Navigation mobile"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-white via-white/70 to-transparent" />
      <div className="mx-auto max-w-xl px-4 pb-safe">
        <div className="pointer-events-auto mb-3 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-2xl shadow-xl shadow-slate-200/40">
          <div className="grid grid-cols-5 items-end px-3 py-2">
            {items.map((item) => {
              const active = isActive(item.href)

              const content = (
                <div className={cn("flex flex-col items-center justify-center gap-1", item.key === "carte" ? "translate-y-[-10px]" : "py-2")}>
                  {item.icon(active)}
                  <span
                    className={cn(
                      "text-[10px] font-extrabold tracking-tight",
                      item.key === "carte" ? "text-slate-700" : active ? "text-[#022753]" : "text-slate-500"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              )

              if (item.href) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={(e) => {
                      if (item.requiresAuth && !session) {
                        e.preventDefault()
                        router.push("/login")
                      }
                    }}
                    className={cn("rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#022753]/20")}
                    aria-current={active ? "page" : undefined}
                  >
                    {content}
                  </Link>
                )
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNav(item)}
                  className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#022753]/20"
                >
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

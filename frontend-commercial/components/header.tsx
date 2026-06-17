/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Composant de navigation (Header) avec design premium glassmorphic et nouveau logo
 * @created 2026-06-12
 * @updated 2026-06-17
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, User, ArrowRight, Home, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "À propos", href: "/about", icon: Info },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
];

const USER_APP_URL = process.env.NEXT_PUBLIC_USER_APP_URL || "https://app.emiid.com";

function DockItem({ href, icon, label, onClick, active }: { href: string; icon: React.ReactNode; label: string; onClick: () => void; active: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-[3.25rem] h-[3.25rem] rounded-2xl transition-all duration-300",
        active
          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
      )}
    >
      {icon}
      <span className="text-[9px] font-bold mt-1 tracking-wider">{label}</span>
    </Link>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Ferme le menu lors d'un changement de page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
          scrolled
            ? "bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 shadow-sm py-4"
            : "bg-transparent py-6"
        )}
      >
        <div className="mx-auto max-w-[1440px] px-8 md:px-12 lg:px-16">
          <nav className="flex items-center justify-between" aria-label="Global">
            {/* Logo */}
            <div className="flex lg:flex-1">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                  <Image
                    src="/logo/icon.svg"
                    alt="EmiID"
                    width={24}
                    height={24}
                    className="object-contain animate-pulse-slow"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground bg-clip-text">
                  emiid
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:gap-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-sm font-semibold leading-6 transition-all relative py-1 px-2 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right actions (CTAs) - Desktop only */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
              <ThemeToggle />
              <Link
                href={`${USER_APP_URL}/login`}
                className="text-sm font-semibold leading-6 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                Connexion
              </Link>
              <Link
                href={`${USER_APP_URL}/creer-profil`}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-500/20 gap-1 group"
              >
                Créer mon profil
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Theme Toggle is visible on Mobile on the top right instead of hamburger */}
            <div className="flex lg:hidden lg:flex-1 justify-end items-center">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Floating Dock (Bottom) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-[110] bg-black/5 dark:bg-black/20 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] lg:hidden flex flex-col items-center">
        <motion.div
          layout
          initial={{ borderRadius: 9999 }}
          animate={{
            borderRadius: mobileMenuOpen ? 32 : 9999,
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className={cn(
            "bg-white/90 dark:bg-[#111]/90 backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-[0_10px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.4)] flex items-center overflow-hidden",
            mobileMenuOpen ? "p-2" : "p-0"
          )}
        >
          <AnimatePresence mode="popLayout">
            {!mobileMenuOpen ? (
              <motion.button
                key="hamburger-btn"
                layoutId="dock-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(true)}
                className="w-14 h-14 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-100 group-hover:opacity-80 transition-opacity" />
                <Menu className="w-6 h-6 relative z-10" />
              </motion.button>
            ) : (
              <motion.div
                key="dock-menu"
                layoutId="dock-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5"
              >
                {navigation.map((item) => (
                  <DockItem
                    key={item.name}
                    href={item.href}
                    icon={<item.icon className="w-5 h-5" />}
                    label={item.name}
                    onClick={() => setMobileMenuOpen(false)}
                    active={pathname === item.href}
                  />
                ))}

                <div className="w-[1px] h-8 bg-gray-200 dark:bg-gray-800 mx-1" />

                <DockItem
                  href={`${USER_APP_URL}/login`}
                  icon={<User className="w-5 h-5" />}
                  label="Login"
                  onClick={() => setMobileMenuOpen(false)}
                  active={false}
                />

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="ml-1 w-[3.25rem] h-[3.25rem] flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Bandeau de consentement aux cookies avec design ultra-minimaliste
 * @created 2026-04-19
 * @updated 2026-06-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("emiid-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("emiid-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("emiid-cookie-consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-[100]"
        >
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl shadow-xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Cookie className="h-4.5 w-4.5 text-primary dark:text-secondary" />
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Cookies & Confidentialité
                </h3>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded-lg hover:bg-muted"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nous utilisons des cookies pour assurer le bon fonctionnement du site et améliorer votre expérience sur EmiID.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={handleDecline}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
              >
                Refuser
              </button>
              <Button
                onClick={handleAccept}
                size="sm"
                className="rounded-xl px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground dark:bg-secondary dark:text-secondary-foreground hover:opacity-90 transition-all"
              >
                Accepter
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

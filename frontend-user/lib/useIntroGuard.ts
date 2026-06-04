/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé pour l'affichage unique du splash screen avec localStorage et mode debug/force
 * @created 2026-05-20
 * @updated 2026-06-03
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */
// ──────────────────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const INTRO_KEY = "emiid_intro_seen";

export function useIntroGuard() {
  const router = useRouter();
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      // Permet de forcer l'affichage ou de réinitialiser l'état via l'URL (?force=true ou ?reset=true)
      const params = new URLSearchParams(window.location.search);
      const isForced = params.get("force") === "true" || params.get("reset") === "true";

      if (isForced) {
        localStorage.removeItem(INTRO_KEY);
        setShouldShow(true);
        return;
      }

      const seen = localStorage.getItem(INTRO_KEY);
      if (seen) {
        // Déjà vu → redirection immédiate vers le dashboard public
        router.replace("/");
      } else {
        setShouldShow(true);
      }
    } catch {
      // Si localStorage est bloqué (mode privé strict), on affiche quand même
      setShouldShow(true);
    }
  }, [router]);

  const markIntroSeen = () => {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      // Silencieux si localStorage indisponible
    }
  };

  return { shouldShow, markIntroSeen };
}

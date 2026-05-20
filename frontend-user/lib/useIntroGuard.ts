/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Hook personnalisé pour l'affichage unique du splash screen avec localStorage
 * @created 2026-05-20
 * @updated 2026-05-20
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
      const seen = localStorage.getItem(INTRO_KEY);
      if (seen) {
        // Déjà vu → redirection immédiate vers le dashboard
        router.replace("/dashboard-public");
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

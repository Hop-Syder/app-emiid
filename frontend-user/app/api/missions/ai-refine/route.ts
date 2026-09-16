/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Route API pour le cadrage et la structuration assistée par IA
 *              d'un brief de mission via Gemini.
 * @created 2026-09-15
 * @updated 2026-09-15
 * �� ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { draftMissionBrief } from "@/lib/mission-brief-assistant"

export async function POST(req: NextRequest) {
  try {
    // SÉCURITÉ (correctif 2026-09-15) : cette route appelle l'API Gemini
    // (coût par requête). Sans authentification, n'importe qui pouvait
    // l'appeler en boucle pour épuiser le quota/budget — même exigence que
    // /api/mission-brief, qui vérifie déjà l'authentification pour cette
    // raison ("coût + anti-abus").
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour utiliser le cadrage assisté par IA." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Description trop courte pour être analysée (minimum 5 caractères)." },
        { status: 400 }
      )
    }

    const result = await draftMissionBrief(prompt)

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Impossible de structurer automatiquement le besoin. Vous pouvez remplir le formulaire manuellement.",
        },
        { status: 422 }
      )
    }

    return NextResponse.json({ success: true, brief: result })
  } catch (error: any) {
    console.error("[API ai-refine] Erreur:", error)
    return NextResponse.json(
      { error: "Erreur interne lors de l'analyse du besoin." },
      { status: 500 }
    )
  }
}

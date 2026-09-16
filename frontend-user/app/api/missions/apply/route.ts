/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Route API pour postuler à une mission courte avec consommation atomique
 *              d'un crédit et contrôle strict du plafond de 2 candidats.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour postuler à une mission." },
        { status: 401 }
      )
    }

    const body = await req.json()
    // NOTE (correctif 2026-09-15) : estimatedDays retiré — mission_applications
    // n'a pas de colonne pour ça (sql/migrations/20260915_missions_engine_phase1.sql).
    // Si ce champ doit être conservé côté UI, il faut d'abord ajouter la colonne.
    const { missionId, proposal, priceQuote } = body

    if (!missionId) {
      return NextResponse.json(
        { error: "L'identifiant de la mission est obligatoire." },
        { status: 400 }
      )
    }

    if (!proposal || typeof proposal !== "string" || proposal.trim().length < 10) {
      return NextResponse.json(
        { error: "Veuillez détailler votre proposition (minimum 10 caractères)." },
        { status: 400 }
      )
    }

    const price = Number(priceQuote)
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "Le prix proposé est obligatoire et doit être un nombre positif." },
        { status: 400 }
      )
    }

    // Appel de la RPC atomique Supabase. Signature réelle de
    // consume_credit_for_application (sql/migrations/20260915_missions_engine_phase1.sql:386) :
    // (p_mission_id uuid, p_price integer, p_pitch text) — l'identité du
    // candidat vient de auth.uid() en interne, jamais d'un paramètre (corrige
    // une faille IDOR potentielle : voir commentaire de la fonction).
    const { data: applicationId, error: rpcError } = await (supabase as any).rpc(
      "consume_credit_for_application",
      {
        p_mission_id: missionId,
        p_price: price,
        p_pitch: proposal.trim(),
      }
    )

    if (rpcError) {
      console.error("[API apply] Erreur RPC:", rpcError)
      return NextResponse.json(
        { error: rpcError.message || "Impossible de soumettre votre candidature." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      applicationId,
      message: "Candidature enregistrée avec succès. 1 crédit a été débité.",
    })
  } catch (err: any) {
    console.error("[API apply] Exception:", err)
    return NextResponse.json(
      { error: err?.message || "Erreur interne lors de la candidature." },
      { status: 500 }
    )
  }
}

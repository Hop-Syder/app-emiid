/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Route API permettant au candidat de modifier son offre (prix/pitch)
 *              tant que sa candidature est PENDING.
 * @created 2026-09-16
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
        { error: "Vous devez être connecté pour modifier votre candidature." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { applicationId, proposal, priceQuote } = body

    if (!applicationId) {
      return NextResponse.json(
        { error: "Identifiant de candidature obligatoire." },
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

    // Signature réelle de update_mission_application
    // (sql/migrations/20260916c_mission_application_edit_withdraw.sql) :
    // (p_application_id uuid, p_price integer, p_pitch text) — l'identité du
    // candidat vient de auth.uid() en interne, jamais d'un paramètre.
    const { error: rpcError } = await (supabase as any).rpc(
      "update_mission_application",
      {
        p_application_id: applicationId,
        p_price: price,
        p_pitch: proposal.trim(),
      }
    )

    if (rpcError) {
      console.error("[API update-application] Erreur RPC:", rpcError)
      return NextResponse.json(
        { error: rpcError.message || "Impossible de modifier votre candidature." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Votre candidature a été mise à jour.",
    })
  } catch (err: any) {
    console.error("[API update-application] Exception:", err)
    return NextResponse.json(
      { error: err?.message || "Erreur interne lors de la mise à jour." },
      { status: 500 }
    )
  }
}

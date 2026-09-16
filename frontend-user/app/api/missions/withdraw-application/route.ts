/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Route API permettant au candidat de retirer sa candidature
 *              PENDING — le crédit consommé est automatiquement recrédité.
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
        { error: "Vous devez être connecté pour retirer votre candidature." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { applicationId } = body

    if (!applicationId) {
      return NextResponse.json(
        { error: "Identifiant de candidature obligatoire." },
        { status: 400 }
      )
    }

    // Signature réelle de withdraw_mission_application
    // (sql/migrations/20260916c_mission_application_edit_withdraw.sql) :
    // (p_application_id uuid) — l'identité du candidat vient de auth.uid().
    const { error: rpcError } = await (supabase as any).rpc(
      "withdraw_mission_application",
      { p_application_id: applicationId }
    )

    if (rpcError) {
      console.error("[API withdraw-application] Erreur RPC:", rpcError)
      return NextResponse.json(
        { error: rpcError.message || "Impossible de retirer votre candidature." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Candidature retirée. Votre crédit a été recrédité.",
    })
  } catch (err: any) {
    console.error("[API withdraw-application] Exception:", err)
    return NextResponse.json(
      { error: err?.message || "Erreur interne lors du retrait." },
      { status: 500 }
    )
  }
}

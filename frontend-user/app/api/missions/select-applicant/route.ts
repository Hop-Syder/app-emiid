/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Route API permettant au client de retenir l'un des 2 candidats postulants.
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
        { error: "Vous devez être connecté pour sélectionner un prestataire." },
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

    // Appel de la RPC atomique select_mission_applicant. Signature réelle
    // (sql/migrations/20260915d_missions_engine_phase3_escrow.sql:82, dernière
    // redéfinition) : (p_application_id uuid) uniquement — mission_id et
    // client_id sont dérivés en interne (via la candidature puis auth.uid()),
    // jamais passés en paramètre.
    const { error: rpcError } = await (supabase as any).rpc(
      "select_mission_applicant",
      { p_application_id: applicationId }
    )

    if (rpcError) {
      console.error("[API select-applicant] Erreur RPC:", rpcError)
      return NextResponse.json(
        { error: rpcError.message || "Impossible de sélectionner ce candidat." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Prestataire retenu avec succès ! La mission passe au statut ASSIGNED.",
    })
  } catch (err: any) {
    console.error("[API select-applicant] Exception:", err)
    return NextResponse.json(
      { error: err?.message || "Erreur interne lors de la sélection." },
      { status: 500 }
    )
  }
}

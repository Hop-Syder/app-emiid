/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Route API pour les transitions du cycle de vie de mission :
 *              démarrage, livraison, validation finale et litige.
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
        { error: "Authentification requise." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { action, missionId, reason } = body

    if (!action || !missionId) {
      return NextResponse.json(
        { error: "Action et identifiant de mission obligatoires." },
        { status: 400 }
      )
    }

    // Signatures réelles (sql/migrations/20260915d_missions_engine_phase3_escrow.sql
    // et 20260915c_missions_engine_phase3_lifecycle.sql) : aucune de ces 4 fonctions
    // n'accepte de p_user_id — l'acteur vient de auth.uid() en interne (le
    // prestataire pour START_WORK/DELIVER, le client pour COMPLETE/DISPUTE),
    // ce qui est déjà comment ces fonctions vérifient que l'appelant a le
    // droit d'agir sur la mission.
    let rpcName = ""
    let params: Record<string, any> = { p_mission_id: missionId }

    switch (action) {
      case "START_WORK":
        rpcName = "start_mission_work"
        break
      case "DELIVER":
        rpcName = "mark_mission_delivered"
        break
      case "COMPLETE":
        rpcName = "confirm_mission_completion"
        break
      case "DISPUTE":
        rpcName = "open_mission_dispute"
        if (!reason || typeof reason !== "string" || reason.trim().length < 10) {
          return NextResponse.json(
            { error: "Un motif de contestation détaillé (au moins 10 caractères) est requis." },
            { status: 400 }
          )
        }
        params.p_reason = reason.trim()
        break
      default:
        return NextResponse.json({ error: "Action inconnue." }, { status: 400 })
    }

    const { data, error: rpcError } = await (supabase as any).rpc(rpcName, params)

    if (rpcError) {
      console.error(`[Lifecycle ${action}] Erreur RPC:`, rpcError)
      return NextResponse.json(
        { error: rpcError.message || `Impossible d'exécuter l'action ${action}.` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Action ${action} effectuée avec succès.`,
    })
  } catch (err: any) {
    console.error("[Lifecycle API] Exception:", err)
    return NextResponse.json(
      { error: err?.message || "Erreur interne." },
      { status: 500 }
    )
  }
}

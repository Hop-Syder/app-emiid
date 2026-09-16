/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Route API Admin pour l'arbitrage des litiges, la gestion des séquestres
 *              et le traitement des commandes de Sourcing Express B2B.
 * @created 2026-09-15
 * @updated 2026-09-15
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 })
    }

    // 1. Litiges en attente d'arbitrage
    const { data: disputes, error: dError } = await (supabase as any)
      .from("missions")
      .select(`
        *,
        client:client_id(full_name, avatar_url),
        freelancer:assigned_to(full_name, avatar_url)
      `)
      .eq("status", "DISPUTED")
      .order("updated_at", { ascending: false })

    // 2. Séquestres sous mandat EmiID
    const { data: escrows, error: eError } = await (supabase as any)
      .from("missions")
      .select(`
        *,
        client:client_id(full_name, avatar_url),
        freelancer:assigned_to(full_name, avatar_url)
      `)
      .in("escrow_status", ["FUNDED", "PENDING"])
      .order("created_at", { ascending: false })

    // 3. Demandes Sourcing Express
    const { data: sourcing, error: sError } = await (supabase as any)
      .from("sourcing_express_requests")
      .select(`
        *,
        client:client_id(full_name, avatar_url),
        mission:mission_id(title)
      `)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      success: true,
      disputes: disputes || [],
      escrows: escrows || [],
      sourcing: sourcing || [],
    })
  } catch (err: any) {
    console.error("[API Admin Missions GET] Exception:", err)
    return NextResponse.json({ error: err?.message || "Erreur interne." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 })
    }

    const body = await req.json()
    const { action, missionId, resolution, notes, freelancerId } = body

    if (!action) {
      return NextResponse.json({ error: "Action requise." }, { status: 400 })
    }

    if (action === "RESOLVE_DISPUTE") {
      // Résolution du litige : resolution = 'REFUND_CLIENT' ou 'RELEASE_FREELANCER'
      const { data, error } = await (supabase as any).rpc("resolve_mission_dispute", {
        p_mission_id: missionId,
        p_resolution: resolution, // 'REFUND_CLIENT' ou 'RELEASE_FREELANCER'
        p_admin_notes: notes || "Arbitré par l'équipe support EmiID.",
      })

      if (error) {
        console.error("[Admin Arbitrage] Erreur RPC:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: "Litige arbitré avec succès." })
    }

    if (action === "RECORD_STRIKE") {
      const { data, error } = await (supabase as any).rpc("record_sponsorship_strike", {
        p_referee_id: freelancerId,
        p_reason: notes || "Manquement professionnel constaté lors d'un litige.",
      })

      if (error) {
        console.error("[Admin Strike] Erreur RPC:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: "Strike d'intégrité consigné avec succès." })
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 })
  } catch (err: any) {
    console.error("[API Admin Missions POST] Exception:", err)
    return NextResponse.json({ error: err?.message || "Erreur interne." }, { status: 500 })
  }
}
